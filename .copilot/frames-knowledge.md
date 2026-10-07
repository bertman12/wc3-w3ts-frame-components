# Warcraft III Frames Knowledge

This is the repository's durable reference for verified Warcraft III frame
behavior, component conventions, FDF requirements, and test-harness layout.
Read it before changing frame creation, positioning, tooltips, text areas, or
the map harness.

## Maintaining this file

- Update this file in the same change whenever implementation, testing,
  screenshots, source inspection, or research establishes a durable frame
  behavior not already documented here.
- Record verified facts, not guesses. Identify a version when a source states
  one; otherwise label version-specific evidence as unspecified.
- Keep test-harness measurements separate from reusable engine behavior.
- Preserve source links for researched engine and FDF behavior.

## Construction model

### Mono frames

- Mono frames expose `CreateNamed` and `CreateType`.
- `CreateNamed` calls `Frame.create`, which emits `BlzCreateFrame`. It creates
  from a loaded named FDF definition. Its `inherits` value must remain
  `undefined`.
- `CreateType` calls `Frame.createType`, which emits `BlzCreateFrameByType`.
  It requires an explicit `inherits` string.
- `inherits: ""` is meaningful: it requests creation by frame type without an
  inheritance template. Do not collapse it into `undefined`, which changes
  creation from typed to named.
- A named definition must actually exist **and be loaded**. A top-level
  `Frame "TEXT"` definition is valid for `BlzCreateFrame` /
  `TextFrame.CreateNamed`; a child `Frame` definition is not.
- `EscMenuTitleTextTemplate` is a valid top-level Blizzard TEXT definition,
  but `EscMenuTemplates.fdf` is not guaranteed to be loaded by a running
  match. Do not use it for a named test unless an FDF loaded through the map
  TOC includes it.
- The harness TOC loads `FrameComponentTestText.fdf`, which includes
  `UI\FrameDef\UI\EscMenuTemplates.fdf` and declares the top-level
  `FrameComponentTestTextTemplate` inheriting `EscMenuTitleTextTemplate`.
  This is the runtime-verified loaded name used to test native TEXT creation
  by name.
- `EscMenuTitleTextTemplate` specifies a fixed-size `0.015` font but no
  dimensions. Give instances an explicit visible viewport; the harness uses
  `0.2 x 0.03` rather than relying on `TextFrame`'s generic
  `0.1 x 0.005` initial geometry.

Source (version unspecified): local Blizzard extraction,
`blizzard frame defs\war3.w3mod\ui\framedef\ui\escmenutemplates.fdf`; see also
[Tasyen: UI - Reading a FDF](https://www.hiveworkshop.com/threads/ui-reading-a-fdf.315850/).

### Composite frames

- Composite frames own and lay out several child Mono frames.
- `TimerFrame` and `TooltipFrame` retain `Create`, `CreateNamed`, and
  `CreateTyped` API entry points. Their current named/typed paths normalize to
  the component renderer; they are useful test API paths, not separate native
  frame construction mechanisms.
- Composite renderers must clear default child points before assigning their
  final layout.

### Lifecycle

- Created Warcraft III frames are permanent. Do not destroy UI frames.
- Test frames are created once, cached, then hidden and shown. Navigation,
  Home, and minimize actions hide cached test roots instead of recreating
  them.
- The test map's `TimerFrame` countdown destroys only its timer object when
  appropriate; it never destroys UI frames.

## TypeScript-to-Lua safety

- Never object-spread a value that may be `undefined` or `null`. Normalize
  optional spreads first:

  ```ts
  const configuration = { ...defaults, ...(args.overrides ?? {}) };
  ```

- TypeScript-to-Lua 1.31.0 can emit an unsafe `__TS__ObjectAssign` helper call
  for an absent spread source. This repository-level normalization is the
  compatibility-safe workaround.

## Positioning and sizing

### Anchor invariants

- Many Mono frames establish default anchors and sizes in `render()`. Always
  call `clearPoints()` before applying external layout, then apply the final
  point or points and size.
- `GlueTextButtonFrame` defaults to a centered anchor and size. Adding a menu
  point without clearing that default creates conflicting constraints and can
  stretch or overlap controls.
- `TextAreaFrame` must likewise have one final anchor; do not leave a default
  absolute point plus an owner-relative point.
- A `TEXTAREA` needs a nonzero size before it can display safely. The researched
  minimum height is `0.03`; the harness uses `0.1 x 0.1`.

### Fixed-width text

- `TextFrame` defaults to `autoSizeWidth: true`.
- In a fixed-width panel, set `autoSizeWidth: false` and explicitly call
  `setSize(width, height)`. Otherwise `update()` recalculates a narrow width
  and can cause wrapping.
- Use `TextFrame.update()` when text should auto-size. It updates text and
  formats the frame width from the rendered string.
- Use full component class names on detail pages and compact labels in narrow
  grids. `GlueTextButtonFrame` and `TextAreaFrame` overflow a `0.09`-wide
  harness button.

### Test-harness layout reference

These values are specific to `FrameComponentTestHarness`:

| Element | Validated layout |
|---|---|
| Main panel | `0.32 x 0.28`, centered at `(0.2, 0.4)` |
| Component grid | Three columns; each button `0.09 x 0.028`; horizontal pitch `0.102`; vertical pitch `0.04` |
| Title | `0.28 x 0.025`, fixed width |
| Description | `0.28 x 0.02`, fixed width |
| Bottom arrows | `0.03 x 0.024`, `0.012` above the panel bottom |
| Home button | `0.09 x 0.024`, `0.012` above the panel bottom |

## Native top-bar controls

- Warcraft III's Quests control is
  `Frame.fromName("UpperButtonBarQuestsButton", 0)`.
- The harness's `-` minimize button and its restore launcher occupy the same
  location directly below that control:
  `FRAMEPOINT_TOPLEFT` to its `FRAMEPOINT_BOTTOMLEFT`, with a vertical gap of
  `-0.004`.
- The minimize and restore controls swap visibility. Keep a Game UI
  coordinate fallback if the native Quests frame is unavailable.

Source: [Tasyen's Console UI hierarchy](https://github.com/Tasyen/FDF/blob/master/Common/HirachyConsoleUIReforgedV2.html)
and Blizzard FDF extractions that name `UpperButtonBarQuestsButton`.

## TooltipFrame

- A tooltip needs a valid owner frame.
- Default tooltip positioning places content above its owner. Set
  `anchorPoint: "bottom"` for a control near the top of the screen.
- For bottom anchoring:
  1. Anchor the header `TOPLEFT` to the owner's `BOTTOMLEFT`.
  2. Apply `tooltipBodySpaceX` as the header's horizontal offset.
  3. Anchor the body beneath the header.
  4. Offset the backdrop's left point by the negated same value.

  This keeps the backdrop aligned to its owner while placing the title and body
  inside it with a real left inset. Anchoring the header's right edge to the
  owner's left edge shifts the tooltip off-screen.
- `includeBackground: true` creates a backdrop and binds it as the native
  tooltip. `tooltipHeaderSpaceX` and `tooltipBodySpaceX` control its padding.
- Tooltip grid data uses `tooltipIconGridData`; each grid item owns an icon
  and a value text frame. Composite layouts must clear the children before
  applying grid-specific points.
- The minimized harness launcher uses a bottom-anchored `TooltipFrame` with
  header `Test Menu`.

## TextAreaFrame and FDF assets

- `EscMenuTextAreaTemplate` can render only the text portion. Use
  `JMT_TextAreaTemplate` when a visible bordered text-area container is
  required.
- `JMT_TextAreaTemplate` defines `TextAreaLineHeight`, `TextAreaLineGap`,
  `TextAreaInset`, `TextAreaMaxLines`, `TextAreaScrollBar`, and
  `ControlBackdrop`. It depends on `JMT_backdrop.fdf` and
  `JMT_scrollbar.fdf`.
- The test map packages these assets under
  `maps\map.w3x\war3mapImported` and loads
  `FrameComponentTestHarness.toc` before creating the harness.
- Terminate a TOC after its final entry. Tasyen notes that a missing empty
  ending line can prevent FDF load errors from being reported in
  `War3Log.txt`.
- `FrameUtils.LoadTOC(path)` is exported from the package root. It returns a
  boolean; report a load failure explicitly before frames inherit from that
  TOC's templates.
- A configured TEXTAREA scrollbar appears only when its content overflows the
  visible text area. It is intentionally hidden when all text fits.
- `TextAreaMaxLines` caps retained lines; it does not make a scrollbar
  permanently visible.
- The harness supplies 16 newline-separated lines for every TextArea test so
  the `0.1 x 0.1` test frame visibly exercises scrolling and mouse-wheel
  behavior.
- A TEXTAREA captures mouse wheel input while enabled. Disabling it releases
  the playable-world input but also disables normal wheel scrolling; direct
  scrollbar interaction remains possible.

Sources (version unspecified):

- [Tasyen: TEXTAREA, the scrolling Text Frame](https://www.hiveworkshop.com/threads/ui-textarea-the-scrolling-text-frame.318877/)
- [Tasyen FDF: TEXTAREA](https://github.com/Tasyen/FDF/blob/master/FrameTypes/TEXTAREA.html)
- [Tasyen FDF: TextAreaScrollBar](https://github.com/Tasyen/FDF/blob/master/Keywords/TextAreaScrollBar.html)
- [Tasyen FDF: TextAreaMaxLines](https://github.com/Tasyen/FDF/blob/master/Keywords/TextAreaMaxLines.html)

## TimerFrame

- `TimerFrame` uses an `IconFrame`, not a clickable `ButtonFrame`, for its
  optional icon. Supply `iconTexture` and `iconTooltipText`.
- `IconFrame` is button-backed for visual and hover behavior, with a child
  backdrop texture, but intentionally registers no click trigger or click
  handler API.
- Create the timer title with `TextFrame.update()` so it sizes itself before
  layout.
- Update the countdown through `TextFrame.update()` on start and each tick.
- Auto-size the backdrop from actual child frame widths after text updates:
  horizontal padding, optional icon width, inter-item gaps, title width, and
  timer width. Treat `backdropWidth` as a minimum, not an upper bound.
- Recalculate when the title or countdown changes so neither text field wraps
  or overflows.

## Frame component test harness

- Location: `src\debugging\frame-component-test-harness.ts`.
- It covers `BackdropFrame`, `ButtonFrame`, `EmptyFrame`,
  `GlueTextButtonFrame`, `IconFrame`, `TextAreaFrame`, `TextFrame`,
  `TooltipFrame`, and `TimerFrame`.
- Every component page includes creation-by-type, creation-by-name, and a
  component-specific test.
- Test roots are cached. Clicking an existing test toggles visibility rather
  than creating a second frame.
- The Tooltip test uses a button anchor because tooltip visuals need an owner
  frame. The Timer test caches its `containerFrame`.
- Home, previous, next, minimize, and restore hide active test frames before
  changing UI state.
- The `-` control minimizes the panel. Its launcher uses `ButtonFrame` because
  it needs a click trigger; the launcher tooltip identifies it as `Test Menu`.

## Test-map workflow

- The test map in `test\wc3-ts-template` is a separate Git repository, not a
  configured submodule. Do not revert or commit its unrelated pre-existing
  changes.
- Do not run `npm run test` unless the user explicitly requests it. It launches
  Warcraft III.
- Use `npm run test:prepare` to build the package and copy its `dist` output
  into the nested test map.
- Use `npm --prefix test\wc3-ts-template run build` to transpile, assemble,
  and archive the map without launching the game.
- The resulting archive is `test\wc3-ts-template\dist\bin\map.w3x`.
