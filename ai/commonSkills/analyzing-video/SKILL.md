---
name: analyzing-video
description: "Analyzes video files by splitting into frames using FFmpeg and reading frames to understand UI/feature requirements. Use when given a video to implement, replicate a UI from a video, or understand a feature shown in a video."
---

# Analyzing Video for Feature Implementation

Splits a video into frames using FFmpeg CLI, then reads the frames to understand what feature or UI needs to be implemented.

## Prerequisites

FFmpeg must be installed on the machine:

```bash
brew install ffmpeg
```

## Workflow

### Step 1: Create temp output directory

```bash
mkdir -p /tmp/video-frames
```

### Step 2: Extract frames from video

Extract 1 frame per second (good balance of coverage vs. file count):

```bash
ffmpeg -i "<video_path>" -vf "fps=1" -q:v 2 /tmp/video-frames/frame_%04d.jpg
```

For short videos (under 10s), extract more frames:

```bash
ffmpeg -i "<video_path>" -vf "fps=3" -q:v 2 /tmp/video-frames/frame_%04d.jpg
```

For long videos (over 60s), extract fewer frames:

```bash
ffmpeg -i "<video_path>" -vf "fps=0.5" -q:v 2 /tmp/video-frames/frame_%04d.jpg
```

### Step 3: Check video duration and frame count

```bash
ffprobe -v quiet -print_format json -show_format "<video_path>"
```

```bash
ls /tmp/video-frames/ | wc -l
```

### Step 4: Read frames to understand the feature

Use the `look_at` tool to read each extracted frame image. Analyze them in order to understand the full user flow shown in the video.

Read frames sequentially — group by UI state changes:

1. Read the first frame to understand the starting state
2. Read subsequent frames to identify transitions, interactions, animations
3. Read the final frames to understand the end state

When reading frames, focus on:
- **UI components**: buttons, lists, modals, navigation bars, tabs
- **Layout**: spacing, alignment, colors, typography
- **User flow**: what the user taps, swipes, or interacts with
- **State changes**: loading states, empty states, error states, success states
- **Animations & Transitions**: pay close attention to sequences of frames that show movement, fading, scaling, sliding, bouncing, or morphing effects

### Animation Analysis

When consecutive frames show gradual changes, this indicates an animation. Analyze by:

1. **Compare adjacent frames**: Look at frame N and frame N+1 side by side using `look_at` with `referenceFiles` to spot differences
2. **Identify animation type**:
   - Elements changing position across frames → **slide/move** animation
   - Elements changing size across frames → **scale** animation
   - Elements appearing/disappearing gradually → **fade** animation
   - Elements rotating across frames → **rotation** animation
   - Spring/overshoot movement → **spring** animation
   - Multiple properties changing → **combined** animation
3. **Estimate timing**: Count how many frames the animation spans, multiply by frame interval (e.g., 5 frames at fps=3 ≈ 1.7s duration)
4. **Note easing**: If movement is faster at start/end vs. middle, note the curve (ease-in, ease-out, spring)
5. **Identify triggers**: What user action or event starts the animation (tap, appear, scroll, swipe)

### Step 5: Summarize findings

After reading all frames, produce a summary:

1. **Feature description**: One sentence describing what the video shows
2. **Screens identified**: List each distinct screen/state seen
3. **User flow**: Step-by-step flow from start to end
4. **UI components needed**: List of components to build
5. **Interactions**: Taps, swipes, gestures observed
6. **Animations**: For each animation found, document:
   - Type (slide, fade, scale, spring, rotation, combined)
   - Direction (left→right, top→bottom, etc.)
   - Estimated duration
   - Easing curve (linear, ease-in, ease-out, spring)
   - Trigger (on appear, on tap, on scroll, on swipe)
   - Which elements are animated
7. **Key details**: Colors, icons, text content, spacing patterns

### Step 6: Cleanup

```bash
rm -rf /tmp/video-frames
```

## Tips

- If video has rapid UI changes or animations, increase fps to 5-10 to catch every animation step
- For animation analysis, use `fps=5` minimum — low fps will miss intermediate animation states
- If frames are blurry (during fast transitions), those frames can be skipped
- Focus on distinct UI states, not every single frame
- For screen recordings, frames at rest (not mid-scroll) are most useful for layout analysis
- Read at most 20-30 frames to avoid context overload — pick key frames if there are more
- When analyzing animations, prioritize reading consecutive frames in the animation sequence rather than skipping
