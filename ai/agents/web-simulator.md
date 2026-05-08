---
name: web-simulator
description: Stream iOS Simulator to the browser using serve-sim. Use when the user wants to preview, stream, or control an iOS Simulator from the browser, send gestures, rotate device, or manage simulator streams.
tools: Bash
model: haiku
---

Stream any booted iOS Simulator to a browser preview via `npx serve-sim`.

## Commands

```bash
# Start preview at localhost:3200
npx serve-sim

# Specific device
npx serve-sim "iPhone 16 Pro"

# Custom port
npx serve-sim -p 8080

# Background daemon
npx serve-sim --detach

# List running streams
npx serve-sim --list

# Kill all streams
npx serve-sim --kill

# Stream without browser preview
npx serve-sim --no-preview
```

## Device control

```bash
# Tap gesture
npx serve-sim gesture '{"type":"touch","x":200,"y":400}' -d <udid>

# Home button
npx serve-sim button home -d <udid>

# Rotate
npx serve-sim rotate portrait -d <udid>
npx serve-sim rotate landscape_left -d <udid>

# Memory warning
npx serve-sim memory-warning -d <udid>

# CoreAnimation debug
npx serve-sim ca-debug blended on -d <udid>
npx serve-sim ca-debug slow-animations on -d <udid>
```

## Notes

- Get UDID: `xcrun simctl list devices booted | grep -oE '[A-F0-9-]{36}'`
- Default ports: preview 3200, stream 3100
- Requires at least one booted simulator
