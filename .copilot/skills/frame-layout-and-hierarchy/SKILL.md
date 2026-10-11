---
name: frame-layout-and-hierarchy
description: Positioning, relative anchoring, parent/child, frame level and the 4:3 screen limit for Warcraft III frames. Use when placing frames, building rows/columns, choosing a parent, or fixing frames that distort or disappear.
---

# Layout, parents and frame levels

Source: Tasyen, [The Big UI-Frame Tutorial](https://www.hiveworkshop.com/threads/the-big-ui-frame-tutorial.335296/). Version: patch 1.31 / 1.31.1 era with 1.32.x notes; verify on the current patch.

## Coordinates (guide: "Position on Screen", "Relative Position")
- 4:3 space: `0,0` bottom-left to `0.8,0.6` top-right, independent of resolution. The same units are used for sizes.
- Position natives: `BlzFrameSetPoint`, `BlzFrameSetAbsPoint`, `BlzFrameClearAllPoints`, `BlzFrameSetAllPoints`.
- `ClearAllPoints` before repositioning. Several points make the frame stretch to fit all of them; one point limits how it expands (a LEFT point grows rightward).
- `BlzFrameSetPoint` offsets are affected by the moved frame's scale (use offset/scale).
- To place A left of B: A's RIGHT point to B's LEFT. Right-to-left rows need negative x offsets.

## 4:3 limit (guide: "4:3 Limitation", "Fullscreen Frame")
- Most normal (non-simple) frames that leave the 4:3 area become malformed (a TEXT can cut off characters, a BACKDROP shrinks, and buttons with it). SimpleFrames are free of the limit.
- Workaround: create the frame under a parent other than GAME_UI (children of those parents are also free of the limit).
  - `ConsoleUIBackdrop`: the guide says "in Reforged", and it does not exist in 1.31.1. It pushes the frame to a lower layer, below SimpleFrames.
  - `BlzGetFrameByName("Leaderboard", 0)` or `("Multiboard", 0)`: above SimpleFrames, but the leaderboard/multiboard must first be created with the non-frame API. The guide's example sets the parent's size to 0, hides `LeaderboardBackdrop` and `LeaderboardTitle`, then parents the new frame to it; keep the parent in a global and show it again after the other leaderboard is shown.
- Fullscreen helper (guide "Fullscreen Frame", "Create A Frame that is always Left of Screen"): position frames relative to a custom fullscreen frame instead of 4:3 coordinates. Create a pure `FRAME` under a 4:3-free parent (the guide's example tries `ConsoleUIBackdrop`, then `Multiboard`, then a created `Leaderboard`), plus a hidden child `FRAME` placed with `BlzFrameSetAbsPoint(frame, FRAMEPOINT_BOTTOM, 0.4, 0)` and sized `BlzGetLocalClientWidth() / BlzGetLocalClientHeight() * 0.6` by `0.6`. Re-apply the size on a timer (the example uses 0.5 s) so resolution changes are followed, and anchor visible frames (children of the 4:3-free parent) to that hidden frame. `BlzGetLocalClientHeight()` is 0 when the game is minimized, and dividing by 0 crashes the thread, so guard the division.
- Alternative for "always at the left edge": anchor to `BlzGetOriginFrame(ORIGIN_FRAME_HERO_BUTTON, 0)` TOPLEFT. It needs no timer and works while the game is paused, but only if `BlzHideOriginFrames(true)` / `BlzEnableUIAutoPosition(false)` were not used.
- Text near the border: with a single LEFT/TOPLEFT point text expands right; RIGHT points expand left (guide: "Text-Alignment").

## Parent/child (guide: "Parent-Child", "Errors")
- A child is visible only if its parent is (`BlzFrameIsVisible` also checks the parent). New frames copy the parent's scale, alpha and level; changing parent copies the new parent's alpha.
- A child tends to be drawn above its parent and is preferred over it for mouse events. A loose child's position is independent of its parent unless you anchor it.
- Use `FRAME` / `SIMPLEFRAME` as pure containers: toggle one parent to show or hide a group. To get a higher level than a type supports, create a BUTTON, set its level and parent the wanted frames (for example TEXT) to it.
- Frames and SimpleFrames cannot parent each other. Creating one "for" the other silently gets another frame as the parent (the handle ids differ), so visibility and alpha are not inherited.
- Parenting under `EscMenuMainPanel` ties visibility to the F10 menu. The guide's example targets 1.31.1 and notes the frame is also visible on the end-game screen and not visible in Options.
- `BlzFrameSetParent` (guide "Errors", 2025-11-26 notes): a non-simple frame stays in the old parent's child list too (child of both). SimpleFrames keep a single parent, but one moved from a hidden parent stays hidden until the new parent is hidden and shown. In 1.31 it can also bug SPRITE and HIGHLIGHT. Making a parent the child of its offspring crashes the game (endless loop).

## Frame level (guide: "Frame Order by Level", "SimpleFrames", "Bar without FDF")
- Level only matters when visible frames overlap on screen.
- Frames: a level orders a frame among its siblings under one parent (highest on top); a frame's children stay below a sibling with a higher level. Level only applies to the current children, so a high-level child is not above siblings created afterwards.
- SimpleFrames: the highest level wins regardless of parent. New SimpleFrames copy the parent's level; later parent changes are not taken over, except by Texture/String children. A SIMPLEFRAME with level 2 or higher under GAME_UI draws over unit life bars.
- Normal frames created under GAME_UI draw above SimpleFrames (guide, SimpleFrames section: "For the displaying SimpleFrames are below Frames"). All SimpleFrames share one layer, so to put a BACKDROP behind a SIMPLESTATUSBAR, parent the BACKDROP to a GAME_UI child that comes before the SimpleFrame layer: `ConsoleUIBackdrop` (best, because the others are below the HP/MP bars, but absent in 1.31.1), the world frame (`ORIGIN_FRAME_WORLD_FRAME`), or `BlzFrameGetParent` of the portrait origin frame.
- A SIMPLEBUTTON click is prioritized over non-simple frames with a higher level.
- 1.31.1: `BlzFrameSetLevel` crashes on BACKDROP, FRAME, HIGHLIGHT, MODEL, SPRITE, TEXT and TIMERTEXT (no crash in 1.32.2).

## Repo mapping
- `createNativeFrame(type, width, height, x = 0.4, y = 0.3)` in `src/components/Core/MonoFrame.ts` sets size and the default absolute point.
- Anchor rules are summarised in `.copilot/knowledge/frames-knowledge.md` ("Positioning and sizing").
