# Tasyen's Big UI-Frame Tutorial: Knowledge Digest

Source: Tasyen, [The Big UI-Frame Tutorial](https://www.hiveworkshop.com/threads/the-big-ui-frame-tutorial.335296/) (Hive Workshop). Read in full for this digest.

Version: the guide is written for Warcraft III patch 1.31 / 1.31.1 (the author notes examples were made in 1.31.1) with later notes for 1.32.x (DDS textures, `BlzFrameGetChild` in 1.32.6, `SkinManagerGetLocalPath` in 1.32+) and some 2025 errata. Anything below without a version label is from that 1.31.x-era text. Re-verify on the current patch before treating it as current behavior.

This file complements [frames-knowledge.md](./frames-knowledge.md) (repo construction model, harness, measured behavior). Task-specific recipes live in the skills listed at the end.

## Coordinates and layout (guide: "Position on Screen", "Relative Position", "4:3", "Fullscreen")
- Screen space is 0,0 (bottom-left) to 0.8,0.6 (top-right), resolution independent; used for sizes too.
- Clear points before repositioning; multiple points stretch the frame; one point limits expansion direction.
- Offsets are affected by the moved frame's scale.
- Non-simple frames leaving 4:3 become malformed; SimpleFrames do not. Create the frame under a non-GAME_UI parent to escape it: `ConsoleUIBackdrop` (the guide says "in Reforged"; it is absent in 1.31.1 and pushes frames below SimpleFrames) or `Leaderboard` / `Multiboard` (above SimpleFrames, but the board must first be created with the non-frame API).
- `BlzGetLocalClientHeight()` is 0 when minimized; never divide by it.

## Hierarchy and levels (guide: "Parent-Child", "Frame Order by Level", "Errors")
- Child visible only when parent is; scale/alpha/level are copied from the parent at creation, and changing parent copies the new parent's alpha.
- Frames and SimpleFrames cannot parent each other (a substitute parent with a different handle id is used, so visibility and alpha are not inherited).
- Frame level: orders siblings within a parent for Frames; for SimpleFrames the highest level wins regardless of parent.
- Normal frames under GAME_UI draw above SimpleFrames ("For the displaying SimpleFrames are below Frames"); all SimpleFrames share one layer. A SIMPLEFRAME with level 2+ under GAME_UI covers unit life bars.
- 1.31.1 only: `BlzFrameSetLevel` crashes on BACKDROP, FRAME, HIGHLIGHT, MODEL, SPRITE, TEXT and TIMERTEXT (no crash in 1.32.2).
- `BlzFrameSetParent` quirks: bugs SPRITE/HIGHLIGHT in 1.31; non-simple frames stay in the old parent's child list; a SimpleFrame moved from a hidden parent stays hidden until the new parent is hidden and shown (both errata 2025-11-26).

## Creation (guide: "Create-Frames", "...Without FDF" sections)
- `BlzCreateFrameByType(type, name, owner, inherits, ctx)` needs no FDF. GLUE click sounds need `BlzCreateFrame`.
- `ScriptDialogButton` has hard-coded dialog behavior when created by name; inherit it under a new name.
- Templates the guide's examples create without loading a TOC: `ScriptDialogButton`, `QuestCheckBox`/`2`/`3` (the only ones the guide explicitly calls "default loaded"), `QuestMainListScrollBar`, `QuestButtonBaseTemplate`, `ScoreScreenTabButtonTemplate`, `IconButtonTemplate`, and the SimpleFrame blueprints `UpperButtonBarButtonTemplate` and `SimpleInfoPanelDestructableDetail`.
- Templates that require loading `Templates.toc`: `EscMenu*` (slider, textarea, radio button, backdrops), `BattleNet*`. Templates are not loaded by default.

## Models and sprites (guide: "Sprite RockBoltMissile Without FDF", "ModelBar without FDF", "SPRITE", "STATUSBAR")
- Model frames ignore size; `BlzFrameSetScale` controls apparent size. World-object models are huge, so scale is model specific (0.00006 for RockBoltMissile; Tasyen's separate 3D-model thread used 0.002).
- Autocast-style overlay scale is `buttonWidth / 0.039`.
- SPRITE loops automatically; STATUSBAR maps `BlzFrameSetValue` percent to animation time and, per the guide ("It is said"), only supports 1 s animations.
- A Jun 5, 2025 comment by wiselen (not Tasyen) says `BlzFrameSetSpriteAnimate` supports more tokens than the five listed (birth, death, stand, morph, alternate); unverified here.
- Repo status: `src/components/MonoFrames/model.ts` applies `BlzFrameSetScale` plus explicit size and position, following Tasyen's 3D-model thread and the guide, and the test harness creates its model/sprite tests the way those examples do (directly under `ORIGIN_FRAME_GAME_UI`, inherits `""`, point set last). The guide and that thread only show a SPRITE rendering a unit model; no source shows a MODEL frame doing it, and Tasyen's MODEL advice ("special 2d models") is tagged 1.31.1. The in-game result is still unconfirmed. Other Hive threads checked for this problem (not part of the guide) are summarized in [frame-model-sprite-scaling](../skills/frame-model-sprite-scaling/SKILL.md) and the "MODEL and SPRITE frames" section of [frames-knowledge.md](./frames-knowledge.md).

## Events and input (guide: "FrameEvents", "FrameTypes", "Keyboard Focus")
- See [frame-multiplayer-and-events](../skills/frame-multiplayer-and-events/SKILL.md) for the per-type event table.
- Buttons keep keyboard focus after a click; `BlzFrameSetEnable(false)` then `true` clears it (can leave camera panning; `StopCamera()` fixes it).
- Per the guide, `MOUSE_DOWN` and `MOUSE_DOUBLECLICK` "does nothing or no Frame accept it"; wheel value is +120/-120.

## Multiplayer (guide: "Frames & Multiplayer", "Frames and HandleId", "Input & Current State", "SLIDER/Scrollbar", "Frame Save & Load")
- Create/get frames outside `GetLocalPlayer`; handle ids must match across players.
- Frame getters such as `BlzFrameGetText`, `BlzFrameGetValue`, `BlzFrameIsVisible` return local, possibly different values.
- Read user input inside the synced frame event, not from the frame afterwards.
- `BlzFrameSetValue` triggers one `FRAMEEVENT_SLIDER_VALUE_CHANGED` per player that runs the call, even inside a `GetLocalPlayer` block; outside one, an 8-player map gets 8 events.
- Some default frames do not exist until the local game needs them (can lead to desync), and some are not created until the local player tabs back into a minimized fullscreen game.
- Custom frames break after Save&Load (hidden, unusable, can crash); the guide's workaround is disabling save/load or re-running all frame creation on load.

## Tooltips (guide: "ToolTips" and examples)
- Tooltips are frames of the same group as the owner; calling `BlzFrameSetTooltip` twice with one pair crashes; it cannot be undone. See [frame-tooltips](../skills/frame-tooltips/SKILL.md).

## TOC and FDF (guide: "TOC", "FDF", "The Fdf syntax", FDF FrameTypes)
- TOC must end with blank line(s) (CRLF: 1, LF: 2); per Tasyen's thread reply #22 the last FDF is ignored otherwise, and no FDF error is logged.
- FDF syntax errors skip the rest of the file (the frame holding the mistake is still created up to that point); the log in `Documents\Warcraft III\Logs\War3Log.txt` "seems to only tell you about the first encountered error".
- Only main frames are creatable; children come along. `INHERITS WITHCHILDREN` clones children, but the inherited children lost their names, so reach them with `BlzFrameGetChild` (1.32.6+); explicitly defined children are reachable with `BlzGetFrameByName`.
- TEXTAREA needs a size large enough for its scrollbar (about 0.03 tall minimum) or it crashes.
- `BackdropCornerFlags` without border files crashes the game when the BACKDROP is displayed.

## Known crash list (guide: "Errors", "Frame Order by Level")
- Showing/hiding a null frame; null parent at creation; `BlzFrameGetChild` out of range; double `BlzFrameSetTooltip`; `BlzFrameSetFont` on SimpleFrames (it only works on a String); natives on String/Texture frames; reparenting a frame under its own descendant (endless loop); bad setups of BACKDROP/TEXTAREA/SIMPLEMESSAGEFRAME/DIALOG/CONTROL; bad values when moving/resizing the chat, unit and top message origin frames; unclosed StringList.
- Save&Load does not include TOC UI-frame/API usage, and using stale frame variables in a frame native crashes.
- 1.31.1: `BlzFrameSetLevel` crashes on BACKDROP, FRAME, HIGHLIGHT, MODEL, SPRITE, TEXT and TIMERTEXT (fixed by 1.32.2). 1.31.x: the MENU of a POPUPMENU breaks outside 4:3.
- Frames that do not exist yet (needed by the local game) can cause problems up to desync; Alliance dialog frames desync replays.
- `BlzFrameSetScale` can break custom fonts; scale after creation.
- 1.32.6: `BlzGetOriginFrame` can return an invalid frame if the origin frame was first reached through `BlzFrameGetChild`.

## Skills derived from this guide
- [frame-creation-by-type](../skills/frame-creation-by-type/SKILL.md)
- [frame-model-sprite-scaling](../skills/frame-model-sprite-scaling/SKILL.md)
- [frame-layout-and-hierarchy](../skills/frame-layout-and-hierarchy/SKILL.md)
- [frame-tooltips](../skills/frame-tooltips/SKILL.md)
- [frame-multiplayer-and-events](../skills/frame-multiplayer-and-events/SKILL.md)
- [frame-fdf-and-toc](../skills/frame-fdf-and-toc/SKILL.md)
- [frame-text-and-fonts](../skills/frame-text-and-fonts/SKILL.md)

Related catalog of other Tasyen threads: `C:\Users\Eddy\.copilot\research-data\tasyen-hive-frame-posts.md`.
