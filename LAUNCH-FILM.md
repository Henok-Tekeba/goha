# goha launch film

A 24-second, autoplaying, screen-recordable launch animation for
[goha](https://goha.enoch.et), served at **`/launch-film`**. One 1920×1080
stage, one master clock, six scenes — problem, reveal, stats, capabilities,
open data, finale. All figures come from the live index snapshot; nothing is
invented.

## Record it

```bash
pnpm dev                 # http://localhost:3000
# or a production build:
pnpm build && npx serve out
```

1. Open `/launch-film`.
2. Click **Present** in the bottom control bar (hides the controls and
   enters fullscreen), or just open `/launch-film/?present=1`.
3. Press **R** (or the restart button) to start cleanly — the film waits
   ~500 ms (configurable pre-roll), then plays 24 s exactly.
4. Screen-record it. The last frame holds; the URL is visible for the final
   ~2.4 s.

The stage is a fixed 16:9 canvas that scales uniformly to any window —
letterboxed on the same background, so captures are seamless at any size.

## Controls & shortcuts

The control bar (restart, play/pause, scrubber, scene label, sound, present)
is development-only and hidden in presentation mode.

| Key | Action |
|---|---|
| `R` | Restart from 0 |
| `Space` | Play / pause |
| `P` | Toggle presentation mode (fullscreen) |
| `S` | Toggle synthesized sound |
| `←` / `→` | Seek ±0.5 s |

Query parameters:

| Param | Effect |
|---|---|
| `?present=1` | Presentation mode — no controls, ideal for recording |
| `?t=8.5` | Freeze on an exact frame (paused) — deterministic QA stills |
| `?preroll=0` | Pre-roll in ms before the timeline starts (default 500) |

## Sound

Optional, fully synthesized with the Web Audio API (clicks on entrances, a
soft impact on assembly, ticks on the statistics, a warm chord on the final
wordmark). Nothing copyrighted, no files. Click **S** once (a user gesture)
before restarting so cues are audible; the visuals are complete without it.

## Implementation notes

- One `requestAnimationFrame` clock (`use-film-clock`) drives every scene;
  scenes are pure functions of `t`, so pause/seek/restart are exact and the
  sequence is deterministic per load.
- The four source fragments in scenes 1–2 are the same components, so the
  scattered→assembled transition is one continuous interpolation.
- Fonts are self-hosted (Geist + system Ethiopic fallback — Kefa/Nyala/Noto),
  no network fetches delay the timeline; playback starts after
  `document.fonts.ready`.
- The route is `noindex` and header/footer are suppressed for that path
  only; no production page is affected.

## Known limitations

- Ask Goha, real-time filtering, and hover states are intentionally absent —
  the film is a linear composition, not an interactive demo.
- The lineage graph and coverage matrix are curated subsets of the real
  data (readable at 15-second speed), not the full graphs from `/lineage`
  and `/gaps`.
- Virtual-time headless screenshots (`?t=`) occasionally miss the first
  hydration in production exports — in a real browser, playback always
  starts reliably.
