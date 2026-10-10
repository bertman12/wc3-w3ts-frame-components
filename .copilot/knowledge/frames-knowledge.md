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

## Related references

- [Tasyen's Big UI-Frame Tutorial digest](./tasyen-big-ui-frame-guide.md): sectioned notes from the guide, each tied to a guide section, with links to the task-specific skills in `.copilot/skills/`. This file stays the reference for this repository's construction model and measured behavior.

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
- For a non-simple native type, prefer `CreateType` with `inherits: ""`. This
  emits `BlzCreateFrameByType` and requires no loaded FDF. Do not add an FDF
  merely to make a native base type constructible.
- Use `CreateNamed` only when a caller intentionally needs a loaded,
  top-level FDF template, including its configured child tree or appearance.
  A named test is appropriate only when it is specifically verifying this
  separate construction path.
- `MonoFrame` owns the public `frame` handle and the protected
  `createNativeFrame` / `createFrameEvent` helpers. Native MonoFrame wrappers
  extend `MonoFrame` directly; do not add an intermediate native-frame base
  class.
- `createFrameEvent` owns triggers in `frameEventTriggers`, keyed by
  `frameeventtype`. Re-registering an event destroys its previous trigger
  before creating, storing, and registering the replacement.
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

### Native frame type coverage

- The default Blizzard FDF catalog contains these non-simple native types:
  `BACKDROP`, `BUTTON`, `CHATDISPLAY`, `CHECKBOX`, `CONTROL`, `DIALOG`,
  `EDITBOX`, `FRAME`, `GLUEBUTTON`, `GLUECHECKBOX`, `GLUEEDITBOX`,
  `GLUEPOPUPMENU`, `GLUETEXTBUTTON`, `HIGHLIGHT`, `LISTBOX`, `MENU`,
  `MODEL`, `POPUPMENU`, `SCROLLBAR`, `SLASHCHATBOX`, `SLIDER`, `SPRITE`,
  `TEXT`, `TEXTAREA`, `TEXTBUTTON`, and `TIMERTEXT`.
- `EmptyFrame` is the `FRAME` wrapper. The remaining native types have
  dedicated MonoFrame wrappers, except where an existing component already
  covers the type (`BackdropFrame`, `ButtonFrame`, `GlueTextButtonFrame`,
  `TextFrame`, and `TextAreaFrame`).
- `CONTROL` and `STATUSBAR` are intentionally excluded; see
  `tasyen-guide-unlisted-frame-types.md`. Tasyen's CONTROL entry has no
  construction guidance, and his FrameEvents and FrameTypes guide has no
  non-simple STATUSBAR entry.
- Do not add `SIMPLE*` types to MonoFrame coverage. They require
  `BlzCreateSimpleFrame` and the simple-frame layer rather than
  `BlzCreateFrameByType`.
- Do not add `BASE`: Tasyen documents that `BlzCreateFrameByType` fails for
  it.
- Every added native page has a bare `CreateType` test with `inherits: ""`.
  This verifies that the native base type can be constructed without an FDF.
- The harness also loads Blizzard's `UI\FrameDef\Glue\StandardTemplates.fdf`
  through its TOC and adds a separate built-in-template test for controls
  whose expected artwork or behavior needs FDF-defined child frames. It does
  not define custom FDF templates merely to create a native base type.
- `FrameComponentTestAdvancedFrames.fdf` is the narrow exception for complete
  test fixtures that public frame natives cannot assemble: a `DIALOG` with
  accept/cancel buttons, a populated `LISTBOX`, a `MENU` with choices, and a
  `POPUPMENU` with its title, arrow, menu, and choices. Those fixture pages
  use `CreateNamed` because their complete top-level FDF templates are loaded;
  every one retains a preceding FDF-free `CreateType` bare-type test.
- The local Warcraft III runtime reported that `StandardTitleTextTemplate` was
  unavailable while loading the dialog fixture. Use the already verified
  `EscMenuTitleTextTemplate` for that title instead; do not assume every
  template name in older FDF examples exists in the installed game build.
- FDF child hierarchies are necessary when no runtime API can bind the
  required children: dialog accept/cancel events need `DialogOkButton` and
  `DialogCancelButton`; popup selection needs a title, arrow, `MENU`, and
  items; list boxes need their item and scrollbar bindings; and
  `ControlBackdrop`-style visuals are assigned through FDF.
- Classes marked `@requiresFdf` depend on FDF-defined children or art, per
  Tasyen's per-type "FDF-Actions" lists
  (`https://github.com/Tasyen/FDF/tree/master/FrameTypes/<TYPE>.html`):
  `DialogFrame`, `ListBoxFrame`, `MenuFrame`, `PopupMenuFrame`,
  `GluePopupMenuFrame`, `SliderFrame`, `ScrollBarFrame`, `CheckBoxFrame`,
  `GlueCheckBoxFrame`, `ChatDisplayFrame`, `HighlightFrame`, `TextButtonFrame`,
  and `TextAreaFrame` (its need for `JMT_TextAreaTemplate` is documented from
  runtime testing; the others are source-based, not runtime-verified), plus
  `GlueTextButtonFrame` (text child and art). Types not
  marked (`ButtonFrame`, `IconFrame`, `BackdropFrame`, `EmptyFrame`, `TextFrame`,
  `GlueButtonFrame`, edit boxes, `ModelFrame`,
  `SpriteFrame`, `TimerTextFrame`) can be created bare; Tasyen documents
  `BACKDROP` textures as settable from script.
- `MODEL` and `SPRITE` are code-only visual types. `CHATDISPLAY` exposes
  `BlzFrameAddText` through `ChatDisplayFrame.addMessage`, but it
  still does not automatically compose a text input and text area. `GLUEEDITBOX`
  is an `EDITBOX` with a heavier click sound; Tasyen documents the practical
  difference of `SLASHCHATBOX` as unknown, so their harness pages only assert
  native text/event behavior rather than a specific visual treatment.
- Source references: [Tasyen's DIALOG definition](https://github.com/Tasyen/FDF/blob/master/FrameTypes/DIALOG.html),
  [LISTBOX definition](https://github.com/Tasyen/FDF/blob/master/FrameTypes/LISTBOX.html),
  [MENU definition](https://github.com/Tasyen/FDF/blob/master/FrameTypes/MENU.html),
  [POPUPMENU definition](https://github.com/Tasyen/FDF/blob/master/FrameTypes/POPUPMENU.html),
  [CHATDISPLAY definition](https://github.com/Tasyen/FDF/blob/master/FrameTypes/CHATDISPLAY.html),
  and [FrameEvents and FrameTypes](https://www.hiveworkshop.com/threads/ui-frameevents-and-frametypes.318309/).

Sources (version unspecified):

- [Tasyen: UI - Reading a FDF](https://www.hiveworkshop.com/threads/ui-reading-a-fdf.315850/)
- [Tasyen: UI - FrameEvents and FrameTypes](https://www.hiveworkshop.com/threads/ui-frameevents-and-frametypes.318309/)
- [Tasyen FDF FrameTypes](https://github.com/Tasyen/FDF/tree/master/FrameTypes)
- [Tasyen FDF: BASE](https://github.com/Tasyen/FDF/blob/master/FrameTypes/BASE.html)
- [Tasyen FDF: DIALOG](https://github.com/Tasyen/FDF/blob/master/FrameTypes/DIALOG.html)
- [Tasyen FDF: POPUPMENU](https://github.com/Tasyen/FDF/blob/master/FrameTypes/POPUPMENU.html)
- [Promises: Custom UI frame types and templates](https://github.com/Promises/Warcraft-Maul-Reimagined/blob/main/docs/ui-frames.md)

### MODEL and SPRITE frames

Research-backed (Hive Workshop; versions as each source states). The harness has
not yet confirmed in-game which of these combinations render, so the rendering
claims below are unverified in this repository.

- World-object models (units, doodads) are huge in UI space. Every working
  example of one shrinks it with `BlzFrameSetScale`; an unscaled one covers the
  screen in black (reported by rolandc85 and by the 3D Model thread's original
  poster, Rigborn warns of "weird screen blackouts", and Tasyen attributes it to
  unit models being huge, so size as the cause is an inference). Footman:
  `0.002` with a `0.001 x 0.001` frame (Tasyen, [3D Model on
  UI](https://www.hiveworkshop.com/threads/3d-model-on-ui.320434/), Dec 4, 2019,
  "Reforge Beta"). Hero model: `0.001` ([UI: Adding
  Sprite](https://www.hiveworkshop.com/threads/ui-adding-sprite.321423/), Jan 13,
  2020, version unspecified). `RockBoltMissile`: `0.00006` (Big UI-Frame
  Tutorial). The one example with no scale, the [Animated Model
  Frames](https://www.hiveworkshop.com/threads/animated-model-frames.332330/)
  resource (recommended version 1.32), ships a custom model its author says
  took about 8 hours to fit on the screen.
- Every example found that renders a unit or doodad model creates a `SPRITE`
  under `ORIGIN_FRAME_GAME_UI` (or the world frame) with inherits `""`. No source
  found renders one in a `MODEL` frame. Tasyen's only MODEL-specific guidance is
  a Jun 2019 reply ("MODEL" or "SPRITE"; SPRITE if the frame should animate) and
  the reply "That needs special 2d models. (Edit: In Warcraft 3 Version
  1.31.1)" with `ui\\feedback\\xpbar\\xpbarconsole.mdx` as the example (edited
  Nov 27, 2019, in [3d model on game UI
  interface](https://www.hiveworkshop.com/threads/3d-model-on-game-ui-interface.315940/)).
  In that thread an unscaled `MODEL` frame showing a Footman at `0.2 x 0.2`
  turned the screen black (Jun 17, 2019). Version caveat: the restriction is
  tagged 1.31.1 while Tasyen's working Footman recipe is from the Reforge Beta,
  and no source says whether the restriction still applies. The 3D Model thread's
  original poster also reported a black screen from a `SPRITE` at `0.2 x 0.2`
  with the default scale whose active model line was `xpbarconsole.mdx`, so even
  that model is not known to render unscaled. `ModelFrame` stays a plain `MODEL`
  wrapper; use `SpriteFrame` for unit and doodad models.
- Call order is not what makes a model render. Working examples use model,
  size, scale, point (Tasyen); point, size, scale, model ("UI: Adding Sprite");
  and point, size, model, scale (wiselen, [How to rotate a sprite
  frame](https://www.hiveworkshop.com/threads/how-to-rotate-a-sprite-frame-without-editing-the-model.369193/),
  Dec 6, 2025, version unspecified).
- `inherits` is the FDF template name, not the frame type; the type is
  `FrameType.Model` or `FrameType.Sprite`.
- `BlzFrameSetSpriteAnimate` is reported to work only on SPRITE and STATUSBAR
  (wiselen's reverse-engineered
  [crib](https://www.hiveworkshop.com/pastebin/b13e7da43793ff34065ff0cc91836f51.36568),
  Jun 2025, version unspecified), so `ModelFrame` does not call it.
- UI model support is limited (TriggerHappy, Apr 2020, [custom cooldown
  model](https://www.hiveworkshop.com/threads/custom-cooldown-model-as-ui-sprite.324298/)):
  only some animations work, with no timescale control, rotation, or
  attachments. Unit models appear top-down, a model with its own camera may need
  another `cameraIndex`, and particle emitters or glow can cover the whole
  screen. Details and sources: the
  [frame-model-sprite-scaling](../skills/frame-model-sprite-scaling/SKILL.md)
  skill.

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
| Component grid | Three columns, nine components per home page; each button `0.09 x 0.028`; horizontal pitch `0.102`; vertical pitch `0.04` |
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
- Existing named-template pages retain creation-by-name tests. Added native
  non-simple pages use FDF-free creation-by-type plus a component-specific
  test where the type exposes useful configured behavior.
- The home grid uses the existing previous/next controls to paginate after
  every nine component entries. Detail pages retain previous/next traversal
  through individual component types.
- New native-frame tests place the created frame inside a visible test
  backdrop. This makes construction observable for types such as `CONTROL`,
  `HIGHLIGHT`, and `MENU`, which do not draw useful standalone artwork. The
  exception is a feature test marked `standalone`, used for the Model and Sprite
  model tests: it is created directly under the harness owner with inherits `""`
  and is never re-anchored or resized afterward, matching Tasyen's examples (see
  [MODEL and SPRITE frames](#model-and-sprite-frames)). The harness only moves
  it to the shared test position. The Model page also has a "Set XP bar model"
  test (`ui\\feedback\\xpbar\\xpbarconsole.mdx`, scale `1`) so a failing Footman
  test can be told apart from MODEL being unable to show world models; that
  model is not known to render unscaled either (see the previous section).
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
- In the nested project, `npm run dev` and `npm run test` build first, then
  launch the archive at `config.outputFolder` + `config.mapFolder`. Do not
  recompile in the launcher or load the unpacked `dist\map.w3x` directory.
  Build failures must return a nonzero exit code to prevent launch.
- `npm run watch:defs` retains the old nested `dev` behavior: watching World
  Editor map scripts and regenerating `src\war3map.d.ts`.
