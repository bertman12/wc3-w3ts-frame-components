---
name: frame-text-and-fonts
description: Text frame behavior in Warcraft III UI frames (color codes, alignment, wrapping, fonts, font flags, shadows). Use when changing text, TextFrame, GlueTextButton labels or text alignment.
---

# Text, alignment and fonts

Source: Tasyen, [The Big UI-Frame Tutorial](https://www.hiveworkshop.com/threads/the-big-ui-frame-tutorial.335296/), sections "Text without FDF", "TEXT", "String", "SimpleFrame - Text without custom FDF", "TextMarkUP String & TEXT", "Fonts", "Text Shadow/Color", "FontFlags", "Text-Alignment", "TextArea", "Errors". Version: patch 1.31 / 1.31.1 era; font notes cite 1.32.2/1.32.x; verify on the current patch.

## Code-side
- Color codes: prefix `|cffRRGGBB`, reset with `|r`. `|n` is a newline.
- Alignment: `BlzFrameSetTextAlignment(frame, vert, horz)` with `TEXT_JUSTIFY_TOP/MIDDLE/BOTTOM` and `TEXT_JUSTIFY_LEFT/CENTER/RIGHT`. It only matters when the frame has a rect (two points or a size).
- Single-point text is one line. TOP/CENTER/BOTTOM points grow both ways, LEFT points grow right, RIGHT points grow left; mind the 4:3 border.
- Dynamic height: set one point and `BlzFrameSetSize(frame, width, 0)` to wrap automatically. If relative positions do not update, set the size again.
- The font native cannot be used on TEXT frames (guide: "neither in V1.31 nor V1.32"), so enlarge a TEXT with `BlzFrameSetScale`. Scale also scales the relative x/y offset (use offset/scale), and the guide's Errors list says `BlzFrameSetScale` "can break a custom Font", so scale later rather than right at creation.
- `BlzFrameSetFont(stringFrame, font, size, flags)` works only onto a String (the text child of a SimpleFrame). The guide's Errors list says calling it onto a SimpleFrame crashes the game, another passage says it does not work for the TEXT frame type (1.31.1), and a size far from the initial one can break the displayed text.
- A TEXT takes control of the screen space of its size or displayed text and can fire frame events. Disable it with `BlzFrameSetEnable(f, false)` for labels, or add FDF `LayerStyle "IGNORETRACKEVENTS"`. LayerStyle cannot be reverted during the game, while `BlzFrameSetEnable` might change the color when the TEXT has colors set for a disabled state.
- TEXTAREA accepts color codes but "rejects most TEXT font settings", so its text appearance cannot be changed much.

## FDF-side
- Fonts: `FrameFont "MasterFont", 0.011, "",` (needs `DecorateFileNames`) or a real path such as `Fonts\frizqt__.ttf`. In 1.32+ `SkinManagerGetLocalPath("MasterFont")` returns the file path in code.
- SimpleFrame text: a `String` child needs a font to show any text. Use `Font "InfoPanelTextFont", 0.009,` (valid only when the parent has `DecorateFileNames,`) or a direct file such as `Font "fonts\nim_____.ttf", 0.009,`. The guide recommends creating and placing Strings at the earliest on the "0s expired" event, since earlier they can be displaced or show no text until the resolution changes.
- Colors: `FontColor`, `FontDisabledColor`, `FontHighlightColor` (r g b [a], 0-1).
- Shadow (FDF only): `FontShadowColor`, `FontShadowOffset`.
- Alignment in FDF: `FontJustificationH JUSTIFYLEFT|CENTER|RIGHT`, `FontJustificationV JUSTIFYTOP|MIDDLE|BOTTOM`, `FontJustificationOffset`.
- `FontFlags` (combine with `|`; persists through `BlzFrameSetText`): `PASSWORDFIELD`, `IGNORECOLORCODES`, `IGNORENEWLINES`, `NONPROPORTIONAL`, `NOWRAP`; `FIXEDSIZE`, `FIXEDCOLOR` and `HIGHLIGHTONMOUSEOVER` are undocumented in the guide.

## Repo mapping
Text-related fixed-width behavior is covered under "Fixed-width text" in `.copilot/knowledge/frames-knowledge.md`.
