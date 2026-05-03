---
name: simulate-notification
description: Create, send, and debug iOS simulator APNS push notifications for visible alerts, silent/background pushes, and mixed content-available diagnostics. Use when Codex needs to simulate notification delivery with xcrun simctl push, generate .apns payload files, verify bundle id/device state, attach debugger breakpoints, or explain why visible push works but silent push callbacks do not fire.
---

# Simulate Notification

## Overview

Use this skill to run repeatable iOS simulator notification diagnostics. Prefer the bundled script for payload creation and `simctl push`; use the manual workflow when the user needs debugger attach, Console.app filtering, or exact command explanation.

## Quick Workflow

1. Resolve the simulator target: prefer a booted simulator UDID over the `booted` alias when delivery is flaky.
2. Resolve the installed app bundle id with `xcrun simctl get_app_container <device> <bundle-id> app`.
3. Generate or reuse an `.apns` file:
   - `visible`: alert, badge, sound, and optional app routing payload.
   - `silent`: `aps.content-available = 1` only.
   - `mixed`: visible alert plus `content-available = 1` for diagnostics.
4. Send with `xcrun simctl push <device> <bundle-id> <payload.apns>`.
5. For visible push, validate `UNUserNotificationCenterDelegate` callbacks or notification UI.
6. For silent push, validate `application(_:didReceiveRemoteNotification:fetchCompletionHandler:)`; do not expect a banner.

## Script

Use `scripts/simulate_notification.py` for deterministic payload generation and push commands.

Examples:

```bash
python3 /path/to/simulate-notification/scripts/simulate_notification.py \
  --kind visible \
  --bundle-id com.crossian.ShopHelpApp.dev \
  --device booted \
  --output visible-push.apns \
  --send
```

```bash
python3 /path/to/simulate-notification/scripts/simulate_notification.py \
  --kind silent \
  --bundle-id com.crossian.ShopHelpApp.dev \
  --device A1FED667-160A-40F3-A6D0-50FF54C6DA9F \
  --output silent-push.apns \
  --send
```

```bash
python3 /path/to/simulate-notification/scripts/simulate_notification.py \
  --kind mixed \
  --bundle-id com.crossian.ShopHelpApp.dev \
  --output mixed-content-available-push.apns
```

The script prints the generated payload path and exact `xcrun simctl push` command.

## Payloads

Visible payload:

```json
{
  "Simulator Target Bundle": "<bundle-id>",
  "aps": {
    "alert": {
      "title": "ShopHelp test push",
      "body": "Visible APNS payload from simctl push"
    },
    "badge": 1,
    "sound": "default"
  }
}
```

Silent payload:

```json
{
  "Simulator Target Bundle": "<bundle-id>",
  "aps": {
    "content-available": 1
  }
}
```

Mixed diagnostic payload:

```json
{
  "Simulator Target Bundle": "<bundle-id>",
  "aps": {
    "alert": {
      "title": "ShopHelp mixed push",
      "body": "Alert plus content-available for callback diagnostics"
    },
    "badge": 1,
    "sound": "default",
    "content-available": 1
  }
}
```

## Debugging Rules

- Visible push can work while silent push does not hit the background callback. Treat those as separate pipelines.
- Silent push does not display notification UI. The callback to validate is `application(_:didReceiveRemoteNotification:fetchCompletionHandler:)`.
- If `simctl push` returns `Notification sent` for visible push but silent callback never fires, verify with a mixed payload before changing app code.
- On real APNS, silent/background pushes require provider headers outside the `.apns` JSON: `apns-push-type: background`, `apns-priority: 5`, and correct `apns-topic`.
- On simulator, pure silent/background delivery can be unreliable. Use unit tests or direct service invocation for app-side logic, and real-device APNS for end-to-end validation.
- Avoid using `plutil -lint` for `.apns` JSON validation; use `python3 -m json.tool <file>`.

## Useful Commands

Resolve booted devices:

```bash
xcrun simctl list devices booted
```

Verify installed app:

```bash
xcrun simctl get_app_container booted <bundle-id> app
```

Attach debugger:

```bash
xcrun simctl launch booted <bundle-id>
lldb -p <pid>
```

LLDB breakpoints:

```lldb
breakpoint set --file AppDelegate.swift --line 113
breakpoint set --file PushNotificationService.swift --line 282
continue
```

Detach without killing the app:

```lldb
process detach
quit
```
