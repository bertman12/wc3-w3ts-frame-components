---
name: frame-fdf-and-toc
description: Writing and loading Warcraft III FDF/TOC files for frames that cannot be created from code alone (syntax, common actions, FrameType notes, hotkeys, TextArea). Use when a frame needs custom FDF or when tagging `@requiresFdf`.
---

# FDF and TOC

Source: Tasyen, [The Big UI-Frame Tutorial](https://www.hiveworkshop.com/threads/the-big-ui-frame-tutorial.335296/), sections "TOC", "Loading in Templates", "FDF", "The Fdf syntax", "FDF-Actions", "Frame Pos in FDF", "Access Frames by Child", "FrameTypes", "BACKDROP", "Button", "Hotkeys in fdf", "Checkbox", "SLIDER/Scrollbar", "SPRITE", "STATUSBAR", "TextArea", "TEXT", plus Tasyen's thread reply #22 (Mar 30, 2022) on the TOC empty-line bug. Version: patch 1.31 / 1.31.1 era with 1.32.x notes; verify on the current patch.

## TOC
- A TOC lists one FDF path per line; load it with `BlzLoadTOCFile("war3mapImported\\X.toc")`. A map can load any number of TOCs. The path in the TOC should match where the FDF is imported in the map, and paths are not case-sensitive.
- End the file with empty line(s): CRLF needs at least 1, LF needs at least 2. Tasyen's thread reply #22 (Mar 30, 2022) calls this a TOC-loading bug: without the empty ending line the last mentioned FDF is ignored. The guide adds that no FDF error is logged in that case.
- List FDFs that later ones include before the ones that include them (the guide recommends it and notes it still needs testing).
- Reforged only: when two TOCs load a frame with the same name, the newer one overwrites the older one. The guide says overwriting a default FDF this way has to be loaded in Config or in the root, and it suffers from the Save&Load bug.
- Templates (`EscMenu*`, `BattleNet*`, standard templates) are not loaded by default. Create `Templates.toc` containing `UI\FrameDef\Glue\standardtemplates.fdf`, `UI\FrameDef\UI\escmenutemplates.fdf` and `UI\FrameDef\Glue\battlenettemplates.fdf` (with the empty ending line), import it keeping its path, then call `BlzLoadTOCFile("war3mapImported\\Templates.toc")` before creating those frames.

## Syntax
- Actions end in `,`; only `Frame`, `String`, `Texture`, `Layer`, `StringList` open `{}` blocks. Paths use a single `\`.
- Only top-level ("main") frames can be created or inherited; children are created as a side effect of creating their main frame.
- Children you define explicitly are reachable with `BlzGetFrameByName(childName, ctx)` right after creation, or later if that context slot was not taken by other frames (guide "Button", HeroSelectorButton example). Children that arrived through `INHERITS WITHCHILDREN` lost their names and are not found that way; use `BlzFrameGetChild(frame, index)` (1.32.6+). It skips String/Texture children and orders children by level (lowest level = lowest index; equal levels: the last added is highest). A `ScriptDialogButton` has 6 children (4 backdrops, 1 text, 1 highlight).
- `INHERITS` copies actions; `INHERITS WITHCHILDREN` also copies child frames. Main frame names must be unique per file (the rest of the file is skipped on a repeat); child frames may share names with siblings or the parent, or be `""`.
- A syntax error skips the rest of the file; the frame containing the mistake is still created up to that point. Current Warcraft III logs FDF syntax errors to `Documents\Warcraft III\Logs\War3Log.txt` (for example `Error (war3mapImported\Test.fdf:4): Expected ",", but found "Height"`), but the guide says it "seems to only tell you about the first encountered error".
- `DecorateFileNames` makes file arguments resolve through `war3skins.txt`/StringList variables (needed for `"MasterFont"`).
- Common actions: `Width`, `Height`, `SetPoint`, `SetAllPoints`, `UseActiveContext`, `ControlBackdrop`, `ControlDisabledBackdrop`, `ControlPushedBackdrop`, `ControlMouseOverHighlight`, `ControlStyle`, `LayerStyle "IGNORETRACKEVENTS"` (the frame stops triggering mouse events and cannot be clicked; it cannot be reverted during the game, unlike `BlzFrameSetEnable`, which may recolor a TEXT that has disabled-state colors), `ToolTip`, `Alpha`, `DoNotRegisterName`.

## Type notes
- BUTTON: image/text/highlight are functional child frames; unneeded children can be omitted (guide "Unneeded ChildFrames").
- Hotkeys: parent frame with `TabFocusPush`, `ControlShortcutKey "StringName"` on children, StringList for the keys; hide then show the parent once to activate; buttons added later by code ignore it.
- CHECKBOX: `CheckBoxCheckHighlight` / `CheckBoxDisabledCheckHighlight` HIGHLIGHT children.
- SLIDER: `SliderMinValue/MaxValue/StepSize/InitialValue`, `SliderLayoutHorizontal|Vertical`, `SliderThumbButtonFrame`.
- SPRITE: `BackgroundArt`, `SpriteScale x 0 0`. STATUSBAR: `StatusBarSprite` (cooldown example scale = size / 0.039).
- TEXTAREA: `TextAreaLineHeight`, `TextAreaLineGap`, `TextAreaInset`, `TextAreaMaxLines`, `TextAreaScrollBar`; needs a size at least ~0.03 tall or the game crashes; set text with `BlzFrameAddText` / `BlzFrameSetText`.
- BACKDROP: `BackdropBackground`, `BackdropEdgeFile`, `BackdropCornerFlags` (selects which border parts are shown; using it without border files crashes the game when the BACKDROP is displayed), `BackdropTileBackground`. `BlzFrameSetTexture` drops the `BackdropEdgeFile` settings.
- Wrong BACKDROP, TEXTAREA, SIMPLEMESSAGEFRAME, DIALOG or CONTROL setups can crash the game.

## Repo mapping
- Frames needing custom or loaded FDF must carry the `@requiresFdf` JSDoc and appear with the ❗ marker in the README. Keep README, JSDoc and `.copilot/knowledge/frames-knowledge.md` in sync.
