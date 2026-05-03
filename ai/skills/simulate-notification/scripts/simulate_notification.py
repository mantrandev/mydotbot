#!/usr/bin/env python3
import argparse
import json
import subprocess
import sys
from pathlib import Path


def build_payload(kind: str, bundle_id: str, title: str, body: str) -> dict:
    payload = {"Simulator Target Bundle": bundle_id}

    if kind == "silent":
        payload["aps"] = {"content-available": 1}
        return payload

    alert = {"title": title, "body": body}
    payload["aps"] = {
        "alert": alert,
        "badge": 1,
        "sound": "default",
    }

    if kind == "mixed":
        payload["aps"]["content-available"] = 1

    payload["sh"] = {
        "type": "checkout",
        "data": {
            "sellpage_id": f"simulator_{kind}_push_test",
            "image_url": "https://example.com/product.jpg",
        },
    }
    return payload


def write_payload(path: Path, payload: dict) -> None:
    path.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")


def run_push(device: str, bundle_id: str, output: Path) -> int:
    cmd = ["xcrun", "simctl", "push", device, bundle_id, str(output)]
    print("$ " + " ".join(cmd))
    completed = subprocess.run(cmd, check=False)
    return completed.returncode


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Generate and optionally send APNS simulator payloads."
    )
    parser.add_argument(
        "--kind",
        choices=["visible", "silent", "mixed"],
        required=True,
        help="Payload kind to generate.",
    )
    parser.add_argument("--bundle-id", required=True, help="Target app bundle identifier.")
    parser.add_argument("--device", default="booted", help="Simulator UDID or 'booted'.")
    parser.add_argument("--output", required=True, help="Output .apns file path.")
    parser.add_argument("--title", default="ShopHelp test push", help="Visible alert title.")
    parser.add_argument(
        "--body",
        default=None,
        help="Visible alert body. Defaults to a kind-specific diagnostic message.",
    )
    parser.add_argument("--send", action="store_true", help="Send with xcrun simctl push.")
    args = parser.parse_args()

    body = args.body or (
        "Alert plus content-available for callback diagnostics"
        if args.kind == "mixed"
        else "Visible APNS payload from simctl push"
    )
    output = Path(args.output)
    payload = build_payload(args.kind, args.bundle_id, args.title, body)
    write_payload(output, payload)

    print(f"Wrote {output}")
    print(json.dumps(payload, indent=2))

    command = f"xcrun simctl push {args.device} {args.bundle_id} {output}"
    print("\nPush command:")
    print(command)

    if args.send:
        return run_push(args.device, args.bundle_id, output)

    return 0


if __name__ == "__main__":
    sys.exit(main())
