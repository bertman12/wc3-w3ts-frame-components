# Architecture guidelines

How the frame component library is organised. For rules on writing or changing
a frame class, see
[`frame-creation-and-modification-guidlines.md`](frame-creation-and-modification-guidlines.md).
For verified Warcraft III frame behavior, see
[`frames-knowledge.md`](frames-knowledge.md).

## Layout

```
src/
  components/
    Core/              MonoFrame and CompositeFrame base classes
    MonoFrames/        one class per native Blizzard frame type
    CompositeFrames/   components built from other frames
  grid/                Grid layout helper
  models/              shared interfaces and type definitions
  debugging/           test harness and frame navigator
  theme/, text/        supporting utilities
  frame-utils.ts       frame helper functions
  names.ts             FrameType and other name constants
```

Each folder exposes its classes through an `index.ts` barrel. Add a new class
to its folder's barrel in the same change.

## Two kinds of component

### MonoFrame

- Wraps exactly one native frame type and extends `MonoFrame<Configuration>`.
- Exposes the native frame as `frame` and sets `nativeFrameType` publicly.
- Created with `CreateType` (a new frame of the native type, optionally
  inheriting an FDF template) or `CreateNamed` (wraps an existing Blizzard
  frame by name).
- Use a MonoFrame when the component is a thin wrapper over a Blizzard frame
  type, with no composition of other components.

### CompositeFrame

- Is built from other frames and extends
  `CompositeFrame<Configuration, ChildFrames>`.
- Exposes its root as `containerFrame` and its parts as typed `childFrames`.
  Child frames must be MonoFrames, CompositeFrames or a `Grid`. A raw native
  frame that is not a component can be kept as a public property instead.
- Has a single `Create` function. It has no `inherits` argument because it is
  not one Blizzard frame type, so it cannot wrap a named Blizzard frame.
- Use a CompositeFrame whenever a component creates more than one frame, as
  `ButtonFrame` does with its container and icon.

Composites build their children from MonoFrames and other composites, not
from raw `Frame.createType` calls, unless no suitable component exists.
Dependencies flow downward only: composites may import MonoFrames and `Core`,
MonoFrames import only `Core`, `models` and shared utilities (`names`, `frame-utils`), and `Core` imports no components.

## Shared conventions

- **One class per file**, named `<ClassName>.ts` (for example
  `ButtonFrame.ts`), in both `MonoFrames` and `CompositeFrames`.
- **Configuration**: each class declares `<Class>Configuration` and a static
  `DefaultConfiguration` getter. Creation merges the defaults with the
  caller's `overrides`. Keep both in sync and document defaults as described in
  the frame creation guidelines.
- **Context**: `context` is optional everywhere and defaults to 0.
- **Rendering**: the constructor calls `render()`. Constructors are private;
  callers use the static creation functions.
- **Events**: MonoFrames register frame events with `onFrameEvent`, which
  replaces and destroys any earlier trigger for the same event type.
  `CompositeFrame` has no equivalent, so a composite manages its own
  `Trigger`.
- **Layout**: components set a default anchor and size in `render()`. Callers
  call `clearPoints()` before applying their own layout.

## Choosing where new code goes

| Need | Put it in |
| --- | --- |
| Wrap a native frame type | `MonoFrames` |
| Combine several frames into one control | `CompositeFrames` |
| Arrange repeated items | `grid` (or use `Grid` inside a composite) |
| Shared interface, config base or argument type | `models` or `Core` |
| Test page for a component | `debugging/frame-component-test-harness.ts` |

When two components differ only by a missing behavior, fold them into one
configurable class rather than keeping both. `IconFrame` was merged into
`ButtonFrame` this way (an icon is a button with `clickSoundPath: ""`).

## Documentation

- Add or update the README entry in the matching category (MonoFrames,
  CompositeFrames or Layout) whenever a component is added, moved or removed.
- Mark components that are still under development with the
  `@deprecated Development deferred. ...` JSDoc and the README note.
- Mark components that need an FDF file with `@requiresFdf`.
- Record verified frame behavior in `frames-knowledge.md`.
