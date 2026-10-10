---
name: frame-creation-by-type
description: Recipes for creating each Warcraft III frame type from code without custom FDF (backdrop, text, text button, icon button, simple button icon, SimpleFrame text, slider, checkbox, bar, two-face, textarea). Use when adding or fixing a MonoFrame/CompositeFrame wrapper.
---

# Creating frame types without custom FDF

Source: Tasyen, [The Big UI-Frame Tutorial](https://www.hiveworkshop.com/threads/the-big-ui-frame-tutorial.335296/) (Hive Workshop).
Version: written for patch 1.31 / 1.31.1; individual recipes note 1.32.x requirements. Verify against the current patch before relying on version-sensitive details.

Combine with the [frame-creation](../frame-creation/SKILL.md) rules (default render at 0.4, 0.3; fallbacks live in configuration + `DefaultConfiguration`). In this repo, `inherits: ""` must stay a string and must never become `undefined`.

## Native creators (guide section: "Create-Frames")
- `BlzCreateFrame(name, owner, priority, ctx)`: creates a main frame from a loaded FDF/TOC name. GLUE frames only play the click sound when created this way.
- `BlzCreateSimpleFrame(name, owner, ctx)`: creates SimpleFrame main frames.
- `BlzCreateFrameByType(type, name, owner, inherits, ctx)`: no FDF required; `inherits` names an already loaded frame to copy (like `INHERITS WITHCHILDREN`).
- `owner` becomes the parent: a SimpleFrame wants a SimpleFrame and a frame wants a frame, and mixing "tends to fail". `priority` should be >= 0. `ctx` is the slot in the frame storage, read back with `BlzGetFrameByName(name, ctx)`.

## Per-type recipes

| Type | Recipe | Guide section |
|---|---|---|
| BACKDROP | `BlzCreateFrameByType("BACKDROP", ...)` then `BlzFrameSetTexture`. Box templates that need no FDF: `EscMenuBackdrop`, `QuestButtonBaseTemplate`, `ScoreScreenButtonBackdropTemplate`, `QuestButtonDisabledBackdropTemplate`, `QuestButtonPushedBackdropTemplate`. Border size is FDF-only. | "BACKDROP Without FDF" |
| TEXT | `BlzCreateFrameByType("TEXT", ...)`; color codes work in the text. The guide says the font native cannot be used on TEXT frames (neither 1.31 nor 1.32), so enlarge it with `BlzFrameSetScale`; scale also scales the relative x/y offset, so use offset/scale. Call `BlzFrameSetEnable(frame, false)` so it does not capture the mouse (the guide warns of possible side effects if the TEXT frame has colors set for a disabled state). | "Text without FDF", "TEXT" |
| GLUETEXTBUTTON | `BlzCreateFrameByType("GLUETEXTBUTTON", name, parent, "ScriptDialogButton", 0)`. With plain `BlzCreateFrame("ScriptDialogButton")` the dialog has hard-coded behavior, so use a different name. `DebugButton` gives a blue variant. | "TextButton Without FDF" |
| Icon button | BUTTON inheriting `ScoreScreenTabButtonTemplate` (yellow hover glow, blocks right clicks from reaching the ground) with a child BACKDROP using `BlzFrameSetAllPoints`; `IconButtonTemplate` is another loaded inherit option (blue light). A GLUETEXTBUTTON inheriting `ScriptDialogButton` has 4 state backdrops (default, pushed, disabled, pushed-disabled); on 1.32.6+ reach the first three with `BlzFrameGetChild(button, 0/1/2)` and clear the pushed backdrop's points before shrinking it. | "IconButton without custom FDF", "ScriptDialogButton 2 Icon Button" |
| SIMPLEBUTTON icon | `BlzCreateSimpleFrame("UpperButtonBarButtonTemplate", BlzGetFrameByName("ConsoleUI", 0), 0)` (some overhead since it spawns that template's visuals, but it works out of the box), then a `SIMPLESTATUSBAR` child created by type as the icon: `BlzFrameSetValue(icon, 100)`, `BlzFrameSetAllPoints(icon, frame)`, `BlzFrameSetTexture(icon, path, 0, true)`, `BlzFrameSetEnable(icon, false)`. Register `FRAMEEVENT_CONTROL_CLICK` on the SIMPLEBUTTON. | "SimpleButton Icon without custom FDF" |
| SimpleFrame text | Create the blueprint `BlzCreateSimpleFrame("SimpleInfoPanelDestructableDetail", BlzGetFrameByName("ConsoleUI", 0), 0)` (a SimpleFrame plus a String; the guide knows no way to create a String directly), take its String `BlzGetFrameByName("SimpleDestructableNameValue", 0)`, `BlzFrameClearAllPoints` it, place it, then `BlzFrameSetFont` and `BlzFrameSetText`. Visibility must be toggled on the SimpleFrame parent. | "SimpleFrame - Text without custom FDF" |
| SLIDER | `BlzCreateFrameByType("SLIDER", name, parent, "QuestMainListScrollBar", 0)` (vertical, works out of the box), then `BlzFrameClearAllPoints`, set point and size, `BlzFrameSetMinMaxValue`, `BlzFrameSetStepSize`. Event: `FRAMEEVENT_SLIDER_VALUE_CHANGED`. The guide's horizontal example uses `EscMenuSliderTemplate` with `Templates.toc` loaded. | "Slider without custom FDF" |
| CHECKBOX | `BlzCreateFrame("QuestCheckBox" / "QuestCheckBox2" / "QuestCheckBox3", parent, 0, 0)` (loaded by default, differ only in size). Events: `FRAMEEVENT_CHECKBOX_CHECKED` / `_UNCHECKED`. | "Checkbox without FDF" |
| STATUSBAR (model bar) | `BlzCreateFrameByType("STATUSBAR", ...)`, `BlzFrameSetModel`, `BlzFrameSetValue` drives the animation. Frame size does not matter but must be set (the guide uses 0.00001), and `BlzFrameSetScale` sizes the visuals. The guide notes "It is said" STATUSBAR only supports 1 s animations (later sequences are dropped), and TriggerHappy saw units using the same model affected by the bar's animation. | "ModelBar without FDF" |
| SIMPLESTATUSBAR | Texture bar (`BlzFrameSetTexture`, `BlzFrameSetValue`; default range 0-100 = percent). No SIMPLESTATUSBAR main frame is loaded by default, but `BlzCreateFrameByType("SIMPLESTATUSBAR", ...)` works; clear the default points it sets. A bar's background is a separate frame; hide/scale/alpha each one. Gray textures can be tinted with `BlzFrameSetVertexColor(frame, BlzConvertColor(a, r, g, b))` (the author reports that line crashed in 1.31.1 and works fine in 1.32.1); `replaceabletextures\\teamcolor\\teamcolorNN` textures give simple one-color bars. | "Bar without FDF", "SIMPLESTATUSBAR" |
| Two-face | SIMPLEFRAME container with two SIMPLESTATUSBARs (foreground nested in background), clear the default points on all three, and share `BlzFrameSetAllPoints`; set the background value to 100; the foreground value shows value% from the left and the rest of the background from the right. | "2-Face without FDF" |
| TEXTAREA | Needs TOC-loaded `EscMenuTextAreaTemplate` / `BattleNetTextAreaTemplate` (load `Templates.toc` first). Give it a size with a height of at least ~0.03 or the game crashes when it is displayed (no default size means 0). Use `BlzFrameAddText` for lines. | "Textarea in QuestDialog", "TextArea" (FDF FrameTypes) |
| EDITBOX | Needs TOC-loaded templates; text size cannot be changed. | "EDITBOX without custom FDF" |

## Rules of thumb
- Clear inherited points (`BlzFrameClearAllPoints`) before repositioning a frame created from a template. Creating SIMPLEFRAME / SIMPLESTATUSBAR by type also sets default points, so clear those first too.
- Keyboard focus (guide "Keyboard Focus"): (Text)Buttons and editboxes keep the keyboard focus after a mouse click, which blocks hotkeys and makes space/enter click again. CanFight's trick clears it: in the click callback call `BlzFrameSetEnable(f, false)` then `BlzFrameSetEnable(f, true)`. To do it only for the clicking player, guard with `GetTriggerPlayer() == GetLocalPlayer()`.
- Side effect of that trick: if an arrow key is released at almost the same moment as the click, the camera keeps panning; `StopCamera()` / `StopCameraForPlayerBJ()` stops it.
- A SIMPLEBUTTON does not keep focus (and keeps only one `CONTROL_CLICK` registration). The guide's cooldown example uses a TEXT as the button "to not keep focus when clicked". Clicks fired by FDF hotkeys also do not keep focus.
- Timing (guide GUI notes): do frame manipulation in a game-time-elapsed trigger (0 s is enough); "map init might give wrong/wonky results". The guide's Lua examples hook `MarkGameStarted` for this. Exceptions that must happen at map init: moving the bottom of `ConsoleUI`, and `BlzFrameClearAllPoints` on the minimap in 1.31.1 (see the guide's UI-hiding and minimap sections).
- Model/sprite scale: see [frame-model-sprite-scaling](../frame-model-sprite-scaling/SKILL.md).
