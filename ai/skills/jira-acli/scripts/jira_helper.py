#!/usr/bin/env python3
import argparse
import json
import os
import re
import subprocess
import sys
from pathlib import Path
from typing import Any

ISSUE_RE = re.compile(r"[A-Z][A-Z0-9_]*-\d+")
BROWSE_RE = re.compile(r"/browse/([A-Z][A-Z0-9_]*-\d+)")
STATUS_LINE_RE = re.compile(r"^[\s]*[Ss]tatus\s*[:|]\s*(.+?)\s*$", re.MULTILINE)


def env(name: str, default: str = "") -> str:
    return os.environ.get(name, default).strip()


def jira_site() -> str:
    return env("JIRA_SITE")


def jira_project() -> str:
    return env("JIRA_PROJECT")


def workflow_statuses() -> list[str]:
    raw = env("JIRA_WORKFLOW_STATUSES")
    if not raw:
        return []

    try:
        parsed = json.loads(raw)
        if isinstance(parsed, list):
            values = [str(item).strip() for item in parsed if str(item).strip()]
            if values:
                return values
    except json.JSONDecodeError:
        pass

    return [part.strip() for part in raw.split(",") if part.strip()]


def fail(message: str, exit_code: int = 1) -> None:
    print(message, file=sys.stderr)
    raise SystemExit(exit_code)


def run(cmd: list[str], *, capture_output: bool = True) -> subprocess.CompletedProcess[str]:
    try:
        return subprocess.run(
            cmd,
            check=True,
            text=True,
            capture_output=capture_output,
        )
    except FileNotFoundError:
        fail("Missing command: {}".format(cmd[0]))
    except subprocess.CalledProcessError as exc:
        stderr = (exc.stderr or "").strip()
        stdout = (exc.stdout or "").strip()
        message = stderr or stdout or f"Command failed: {' '.join(cmd)}"
        fail(message, exc.returncode)


def recursive_find_status(node: Any) -> str | None:
    if isinstance(node, dict):
        status = node.get("status")
        if isinstance(status, str) and status.strip():
            return status.strip()
        if isinstance(status, dict):
            name = status.get("name")
            if isinstance(name, str) and name.strip():
                return name.strip()
        fields = node.get("fields")
        if isinstance(fields, dict):
            nested = recursive_find_status(fields)
            if nested:
                return nested
        for value in node.values():
            nested = recursive_find_status(value)
            if nested:
                return nested
    elif isinstance(node, list):
        for value in node:
            nested = recursive_find_status(value)
            if nested:
                return nested
    return None


def normalize_issue_key(value: str) -> str:
    raw = value.strip()
    if not raw:
        fail("Missing issue input")

    browse_match = BROWSE_RE.search(raw)
    if browse_match:
        return browse_match.group(1)

    exact_match = ISSUE_RE.fullmatch(raw)
    if exact_match:
        return exact_match.group(0)

    if raw.isdigit():
        project = jira_project()
        if not project:
            fail("Bare issue number used without JIRA_PROJECT; provide a full issue key like ABC-123")
        return f"{project}-{raw}"

    fail(f"Invalid issue input: {value}")


def current_branch() -> str:
    result = run(["git", "branch", "--show-current"])
    branch = result.stdout.strip()
    if not branch:
        fail("Unable to determine current git branch")
    return branch


def branch_issue_key() -> str:
    branch = current_branch()
    matches = ISSUE_RE.findall(branch)
    if not matches:
        fail(f"No Jira issue key found in current branch: {branch}")

    project = jira_project()
    if project:
        preferred = [match for match in matches if match.startswith(f"{project}-")]
        if preferred:
            return preferred[0]

    return matches[0]


def acli_base() -> list[str]:
    return ["acli", "jira"]


def issue_view_json(key: str) -> Any:
    result = run(acli_base() + ["workitem", "view", key, "--fields", "status", "--json"])
    try:
        return json.loads(result.stdout)
    except json.JSONDecodeError:
        return None


def current_status(key: str) -> str:
    parsed = issue_view_json(key)
    if parsed is not None:
        status = recursive_find_status(parsed)
        if status:
            return status

    result = run(acli_base() + ["workitem", "view", key, "--fields", "status"])
    match = STATUS_LINE_RE.search(result.stdout)
    if match:
        return match.group(1).strip()

    fail(f"Unable to determine current status for {key}")


def transition(key: str, status: str) -> None:
    run(acli_base() + ["workitem", "transition", "--key", key, "--status", status, "--yes"], capture_output=False)


def move_relative(key: str, direction: int) -> str:
    statuses = workflow_statuses()
    if not statuses:
        fail("JIRA_WORKFLOW_STATUSES is not configured; use an explicit status instead")

    current = current_status(key)
    try:
        index = statuses.index(current)
    except ValueError:
        fail(f"Status '{current}' is not in configured workflow: {statuses}")

    target_index = index + direction
    if target_index < 0:
        fail(f"{key} is already at the first workflow status: {current}")
    if target_index >= len(statuses):
        fail(f"{key} is already at the last workflow status: {current}")

    target = statuses[target_index]
    transition(key, target)
    return target


def require_file(path_value: str) -> str:
    path = Path(path_value).expanduser()
    if not path.is_file():
        fail(f"File not found: {path}")
    return str(path)


def cmd_normalize_key(args: argparse.Namespace) -> None:
    print(normalize_issue_key(args.issue))


def cmd_branch_key(_: argparse.Namespace) -> None:
    print(branch_issue_key())


def cmd_current_status(args: argparse.Namespace) -> None:
    print(current_status(resolve_issue_arg(args.issue, args.current_branch)))


def cmd_move(args: argparse.Namespace) -> None:
    transition(resolve_issue_arg(args.issue, args.current_branch), args.status)


def cmd_forward(args: argparse.Namespace) -> None:
    key = resolve_issue_arg(args.issue, args.current_branch)
    print(move_relative(key, 1))


def cmd_backward(args: argparse.Namespace) -> None:
    key = resolve_issue_arg(args.issue, args.current_branch)
    print(move_relative(key, -1))


def cmd_view(args: argparse.Namespace) -> None:
    key = resolve_issue_arg(args.issue, args.current_branch)
    run(acli_base() + ["workitem", "view", key], capture_output=False)


def cmd_assign_me(args: argparse.Namespace) -> None:
    key = resolve_issue_arg(args.issue, args.current_branch)
    run(acli_base() + ["workitem", "edit", "--key", key, "--assignee", "@me", "--yes"], capture_output=False)


def cmd_comment(args: argparse.Namespace) -> None:
    key = resolve_issue_arg(args.issue, args.current_branch)
    run(acli_base() + ["workitem", "comment", "create", "--key", key, "--body", args.text], capture_output=False)


def cmd_comment_file(args: argparse.Namespace) -> None:
    key = resolve_issue_arg(args.issue, args.current_branch)
    file_path = require_file(args.file)
    run(acli_base() + ["workitem", "comment", "create", "--key", key, "--body-file", file_path], capture_output=False)


def cmd_desc_text(args: argparse.Namespace) -> None:
    key = resolve_issue_arg(args.issue, args.current_branch)
    run(acli_base() + ["workitem", "edit", "--key", key, "--description", args.text, "--yes"], capture_output=False)


def cmd_desc_file(args: argparse.Namespace) -> None:
    key = resolve_issue_arg(args.issue, args.current_branch)
    file_path = require_file(args.file)
    run(acli_base() + ["workitem", "edit", "--key", key, "--description-file", file_path, "--yes"], capture_output=False)


def cmd_subtask(args: argparse.Namespace) -> None:
    parent = normalize_issue_key(args.parent)
    cmd = acli_base() + [
        "workitem",
        "create",
        "--type",
        "Sub-task",
        "--parent",
        parent,
        "--summary",
        args.summary,
        "--yes",
    ]
    if args.description_file:
        cmd.extend(["--description-file", require_file(args.description_file)])
    run(cmd, capture_output=False)


def cmd_search(args: argparse.Namespace) -> None:
    cmd = acli_base() + ["workitem", "search", "--jql", args.jql]
    if args.paginate:
        cmd.append("--paginate")
    run(cmd, capture_output=False)


def cmd_mine(args: argparse.Namespace) -> None:
    project = args.project or jira_project()
    clauses = []
    if project:
        clauses.append(f"project = {project}")
    clauses.append("assignee = currentUser()")
    if args.open_sprint:
        clauses.append("sprint in openSprints()")
    if not args.include_done:
        clauses.append("statusCategory != Done")
    jql = " AND ".join(clauses)
    cmd = acli_base() + ["workitem", "search", "--jql", jql]
    if args.paginate:
        cmd.append("--paginate")
    run(cmd, capture_output=False)


def cmd_open_url(args: argparse.Namespace) -> None:
    key = resolve_issue_arg(args.issue, args.current_branch)
    site = jira_site()
    if not site:
        fail("JIRA_SITE is not configured")
    print(f"https://{site}/browse/{key}")


def resolve_issue_arg(issue: str | None, use_current_branch: bool) -> str:
    if use_current_branch:
        return branch_issue_key()
    if not issue:
        fail("Missing issue input")
    return normalize_issue_key(issue)


def add_issue_argument(parser: argparse.ArgumentParser, *, allow_current_branch: bool = True) -> None:
    parser.add_argument("issue", nargs="?", help="Issue key, bare number, or Jira URL")
    if allow_current_branch:
        parser.add_argument("--current-branch", action="store_true", help="Resolve issue key from current git branch")


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Jira helper for Codex skills using acli jira")
    subparsers = parser.add_subparsers(dest="command", required=True)

    normalize_key = subparsers.add_parser("normalize-key", help="Normalize issue input to a Jira key")
    normalize_key.add_argument("issue")
    normalize_key.set_defaults(func=cmd_normalize_key)

    branch_key = subparsers.add_parser("branch-key", help="Extract Jira key from current git branch")
    branch_key.set_defaults(func=cmd_branch_key)

    current_status_parser = subparsers.add_parser("current-status", help="Print current issue status")
    add_issue_argument(current_status_parser)
    current_status_parser.set_defaults(func=cmd_current_status)

    view = subparsers.add_parser("view", help="View an issue")
    add_issue_argument(view)
    view.set_defaults(func=cmd_view)

    move = subparsers.add_parser("move", help="Move issue to an explicit status")
    add_issue_argument(move)
    move.add_argument("--status", required=True)
    move.set_defaults(func=cmd_move)

    forward = subparsers.add_parser("forward", help="Move issue to next configured workflow status")
    add_issue_argument(forward)
    forward.set_defaults(func=cmd_forward)

    backward = subparsers.add_parser("backward", help="Move issue to previous configured workflow status")
    add_issue_argument(backward)
    backward.set_defaults(func=cmd_backward)

    assign_me = subparsers.add_parser("assign-me", help="Assign issue to current user")
    add_issue_argument(assign_me)
    assign_me.set_defaults(func=cmd_assign_me)

    comment = subparsers.add_parser("comment", help="Add inline comment to issue")
    add_issue_argument(comment)
    comment.add_argument("--text", required=True)
    comment.set_defaults(func=cmd_comment)

    comment_file = subparsers.add_parser("comment-file", help="Add comment to issue from file")
    add_issue_argument(comment_file)
    comment_file.add_argument("--file", required=True)
    comment_file.set_defaults(func=cmd_comment_file)

    desc_text = subparsers.add_parser("desc-text", help="Replace issue description with inline text")
    add_issue_argument(desc_text)
    desc_text.add_argument("--text", required=True)
    desc_text.set_defaults(func=cmd_desc_text)

    desc_file = subparsers.add_parser("desc-file", help="Replace issue description from file")
    add_issue_argument(desc_file)
    desc_file.add_argument("--file", required=True)
    desc_file.set_defaults(func=cmd_desc_file)

    subtask = subparsers.add_parser("subtask", help="Create a sub-task")
    subtask.add_argument("parent", help="Parent issue key, bare number, or Jira URL")
    subtask.add_argument("--summary", required=True)
    subtask.add_argument("--description-file")
    subtask.set_defaults(func=cmd_subtask)

    search = subparsers.add_parser("search", help="Search Jira with JQL")
    search.add_argument("--jql", required=True)
    search.add_argument("--paginate", action="store_true")
    search.set_defaults(func=cmd_search)

    mine = subparsers.add_parser("mine", help="Search my assigned issues")
    mine.add_argument("--project", help="Project key override")
    mine.add_argument("--open-sprint", action="store_true", help="Restrict to issues in open sprints")
    mine.add_argument("--include-done", action="store_true", help="Include done issues")
    mine.add_argument("--paginate", action="store_true")
    mine.set_defaults(func=cmd_mine)

    open_url = subparsers.add_parser("open-url", help="Print Jira browse URL for issue")
    add_issue_argument(open_url)
    open_url.set_defaults(func=cmd_open_url)

    return parser


def main() -> None:
    parser = build_parser()
    args = parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
