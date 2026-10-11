---
name: frame-tooltips
description: How to build tooltips for Warcraft III frames (text, boxed text, dynamic height, SimpleFrame tooltips) and the pitfalls of BlzFrameSetTooltip. Use when adding or changing tooltip behavior.
---

# Tooltips

Source: Tasyen, [The Big UI-Frame Tutorial](https://www.hiveworkshop.com/threads/the-big-ui-frame-tutorial.335296/), sections "ToolTips", "Tooltip Examples", "BoxText tooltip", "BoxedText ToolTips Dynamic amount of Lines", "SimpleFrame ToolTip", "Errors". Version: patch 1.31 / 1.31.1 era; verify on the current patch.

## Rules
- A tooltip is just a frame, shown while the mouse is over its owner. Owner and tooltip must be the same group (frame<->frame, simpleframe<->simpleframe). Only `SIMPLEBUTTON` can own a simple tooltip.
- The owner must be able to take mouse control. Disabling the owner does not stop the tooltip; hiding it does.
- `BlzFrameSetTooltip(owner, tooltip)` also makes the tooltip a child of the owner (non-simple frames). It does **not** hide a SimpleFrame tooltip, so hide it manually.
- One tooltip frame can serve many owners, but text then renders bold/wrong.
- Calling `BlzFrameSetTooltip` twice with the same pair crashes on hover; it cannot be undone.
- Tooltips that leave 4:3 get malformed; wrap them in an empty `FRAME` parent and use that wrapper as the tooltip.
- In FDF: `ToolTip "FrameName",`.

## Recipes
1. **Text tooltip**: `TEXT` frame, `BlzFrameSetPoint(tip, BOTTOM, owner, TOP, 0, 0.01)`, `BlzFrameSetEnable(tip, false)`.
2. **Boxed tooltip**: `QuestButtonBaseTemplate` BACKDROP is the tooltip; the TEXT is its child (shares visibility), inset about 0.01 on each side.
3. **Dynamic height**: give the TEXT size `(width, 0)` so it wraps lines; anchor the box to the text (`box BOTTOMLEFT -> text BOTTOMLEFT -0.01`, `TOPRIGHT -> +0.01`), and anchor the text, not the box, to the owner.
4. **Hover without enter/leave events**: an empty `FRAME` tooltip plus `BlzFrameIsVisible` gives an async hover check (dangerous; the value is local).

## Repo mapping
See the TooltipFrame section of `.copilot/knowledge/frames-knowledge.md`.
