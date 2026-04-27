# Trapping Rain Water Remotion POC

This is the minimal renderer POC for `video-spec-trapping-rain-water-poc-v1.json`.

## What it proves

- JSON video spec can drive a visual scene.
- Bar graph can be rendered from the height array.
- Water overlay can be animated from trapped water values.
- Helper arrays can be displayed in the footer.
- Final answer and counter can be animated.

## Prerequisites

- Node.js
- npm

## Run

```bash
npm install
npm run start
```

This opens Remotion Studio.

## Render MP4

```bash
npm run render
```

Output:

```text
out/trapping-rain-water-poc-v1.mp4
```

## Generate a preview still

```bash
npm run still
```

Output:

```text
out/preview.png
```

## Main files

```text
public/video-spec-trapping-rain-water-poc-v1.json
src/Root.tsx
src/TrappingRainWaterPoc.tsx
src/primitives.tsx
src/utils.ts
```

## Current limitations

- No generated audio yet.
- No subtitles yet.
- Only one scene is implemented.
- Only the primitives needed for Scene 5 are implemented.
