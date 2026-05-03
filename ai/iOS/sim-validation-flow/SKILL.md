---
name: sim-validation-flow
description: Simulator validation flow using tmux + lldb + xcrun simctl + axe for iOS apps. Use when you need repeatable validation, log capture, debugger attach, or gesture automation (swipe/tap) without browser/UI tooling.
---

# Simulator Validation Flow (tmux + lldb + xcrun + axe)

## Quick Start (fill placeholders)

```bash
# 1) Pick simulator
xcrun simctl list devices | rg -n "iPhone"

# 2) Start logs (tmux)
tmux new -d -s logs "xcrun simctl spawn booted log stream --level debug --predicate 'process == \"<APP_PROCESS_NAME>\"' --style compact | tee /tmp/<app>-sim.log"

# 3) Build (tmux)
tmux new -d -s build-app "cd <REPO> && xcodebuild -scheme <SCHEME> -destination 'platform=iOS Simulator,name=<DEVICE>,OS=<OS>' -configuration Debug build"

# 4) Install
xcrun simctl install booted <REPO>/.build/DerivedData/Build/Products/Debug-iphonesimulator/<APP>.app

# 5) Bundle id
plutil -p <REPO>/.build/DerivedData/Build/Products/Debug-iphonesimulator/<APP>.app/Info.plist | rg -n "CFBundleIdentifier"

# 6) Launch (returns pid)
xcrun simctl launch booted <BUNDLE_ID>

# 7) lldb (tmux)
tmux new -d -s lldb "lldb"
tmux send-keys -t lldb "process attach --pid <PID>" C-m
# resume process
tmux send-keys -t lldb "continue" C-m

# 8) axe gestures
axe describe-ui --udid <UDID> | head -n 40
axe swipe --udid <UDID> --start-x 320 --start-y 300 --end-x 80 --end-y 300 --duration 0.3

# 9) Read logs
tail -n 80 /tmp/<app>-sim.log
```

## Step-by-step

1) **Pick simulator + OS**
- Use `xcrun simctl list devices` and pick a booted device or boot one.
- If the requested OS is missing, use the installed version and note it.

2) **Start log stream in tmux**
- Keep logs alive while you test.
- Use a narrow predicate first (process name), widen later if needed.

3) **Build + install**
- Use `xcodebuild` or project `make build` if available.
- Install from `.build/DerivedData/Build/Products/Debug-iphonesimulator/<APP>.app`.

4) **Resolve bundle id**
- Always read `CFBundleIdentifier` from the built app’s Info.plist.
- Common fail: using `-dev` vs `.dev` suffix.

5) **Launch + attach lldb**
- `xcrun simctl launch` returns PID.
- Attach with `process attach --pid <PID>` then `continue`.

6) **Drive UI with axe**
- Use `axe describe-ui` to confirm app is visible.
- Use `axe swipe` with screen coordinates to reproduce gesture flows.

7) **Capture evidence**
- Tail `/tmp/<app>-sim.log` for validation signal.
- Optional: `axe record-video` if you need visual proof.

## Troubleshooting

- **Launch failed**: verify bundle id from Info.plist; re-install app.
- **No target OS**: use installed OS; note the mismatch.
- **lldb pause**: always `continue` after attach.
- **No logs**: broaden predicate or remove filter temporarily.

## Cleanup

```bash
tmux kill-session -t logs
# tmux kill-session -t build-app
# tmux kill-session -t lldb
```
