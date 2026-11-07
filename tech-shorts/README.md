# طيب شلون؟ — مصنع شورتس تقنية

Vertical shorts (1080×1920, 30fps) explaining tech in Syrian Arabic, built with **Remotion**.
Voiceover = Mahmoud's HeyGen voice clone.

## Daily workflow

```bash
npm i
python3 tools/gen_voice.py          # generates VO until the daily limit, resumes next run
node tools/cues.mjs                 # SFX / music marker sheets → public/cues/<ep>.csv
npx remotion studio                 # preview any episode (ep01 … ep30)
npx remotion render src/index.ts ep01 out/ep01.mp4 --concurrency=4 --crf=18
```

- `content/month-01.json` — 30 episode scripts (title, keyword, category, punchline, scenes).
  Each scene = one VO line + one visual (`hero`, `desk`, `compare`, `flow`, `bars`, `steps`, `bigtext`).
  Add an optional `"tts"` field to a scene to change what is *spoken* without changing the caption.
- `public/vo/<ep>/sNN.wav|json` — one VO file per scene; JSON holds timing + Whisper QA.
- `public/vo/_status.json` — progress, daily-limit state, scenes flagged by pronunciation QA.

## Pronunciation QA
Every take is transcribed back with Whisper (medium) and compared word-by-word to the script.
Below 0.82 match the scene is regenerated once with a calmer delivery; the better take is kept.
Low scores are often spelling differences (e.g. `SSD` vs `اس اس دي`) — listen to flagged scenes.

## Rules baked into the template
- All motion uses Bezier easing (no linear), comp-wide camera motion blur (`motionBlur` prop).
- 3-plane depth: grid paper (far, slow parallax) → scene (rack-focus in/out, slow push) → defocused near-plane shapes.
- Audio: VO only. SFX and music tracks are left empty on purpose, timed by the cue sheets.
