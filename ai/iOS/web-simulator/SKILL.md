---
name: web-simulator
description: Stream iOS Simulator to the browser using serve-sim. Use when the user wants to preview, stream, or control an iOS Simulator from the browser, send gestures, rotate device, or manage simulator streams.
---

# Web Simulator (serve-sim)

Stream any booted iOS Simulator to a browser preview via `npx serve-sim`.

## Quick Start

```bash
# Start browser preview at localhost:3200 (auto-detects booted sim)
npx serve-sim

# Custom port
npx serve-sim -p 8080

# Specific device
npx serve-sim "iPhone 16 Pro"

# Background daemon mode
npx serve-sim --detach
```

## Stream Management

```bash
# List running streams
npx serve-sim --list

# Kill all streams
npx serve-sim --kill

# Stream in foreground without browser preview
npx serve-sim --no-preview
```

## Device Control

```bash
# Send gesture (tap at x=200 y=400)
npx serve-sim gesture '{"type":"touch","x":200,"y":400}' -d <udid>

# Home button
npx serve-sim button home -d <udid>

# Rotate device
npx serve-sim rotate portrait -d <udid>
npx serve-sim rotate landscape_left -d <udid>

# Simulate memory warning
npx serve-sim memory-warning -d <udid>
```

## CoreAnimation Debug Flags

```bash
# Toggle blended layers visualization
npx serve-sim ca-debug blended on -d <udid>

# Toggle slow animations
npx serve-sim ca-debug slow-animations on -d <udid>

# Available flags: blended, copies, misaligned, offscreen, slow-animations
```

## Workflow

1. Check booted simulators: `xcrun simctl list devices booted`
2. Start stream: `npx serve-sim` (opens localhost:3200)
3. For specific device: `npx serve-sim "iPhone 16 Pro"`
4. For background: `npx serve-sim --detach`
5. To stop: `npx serve-sim --kill`

## Notes

- Default preview port: 3200, stream port: 3100
- Requires at least one booted simulator
- Get UDID: `xcrun simctl list devices booted | grep -oE '[A-F0-9-]{36}'`
- Gesture JSON uses screen coordinates of the simulator display
