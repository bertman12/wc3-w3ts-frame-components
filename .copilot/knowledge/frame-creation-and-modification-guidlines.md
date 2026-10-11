# Frame creation and modification guidelines

Rules for creating or changing frame classes in this repo. See also the
`frame-creation` skill in `.copilot/skills/frame-creation/SKILL.md`.

## Configuration and DefaultConfiguration must match

Every property on a frame class's configuration interface must also appear in
that class's `DefaultConfiguration` literal, and every property in the
`DefaultConfiguration` literal must exist on the configuration interface.
The two must stay in sync in both directions.

- When adding a property to a configuration interface, add its default literal
  to `DefaultConfiguration` in the same change.
- When adding a literal to `DefaultConfiguration`, declare the matching
  property on the configuration interface.
- When removing or renaming a property, update both places.
- This includes properties inherited from `IMonoFrameConfigurationBase` that
  the frame actually uses (for example `width` and `height` when the frame
  sizes itself from them).
- Fallbacks in `render()` or other methods should reference
  `<Class>.DefaultConfiguration` rather than repeating the literal.

## Document defaults on the configuration interface

Every property on a frame class's configuration interface must have a JSDoc
comment stating its default value, matching the value in that class's
`DefaultConfiguration` literal (for example `Default value: 0.03`).

- Update the JSDoc whenever the default in `DefaultConfiguration` changes.
- Describe what the property does in the same comment.

## Loaded template autocomplete for `inherits`

A MonoFrame's `CreateType` must type its arguments as
`TypedNativeFrameArguments<Configuration, LoadedXTemplate>`. The
`LoadedXTemplate` union lives in `src/models/LoadedFrameTemplates.ts` and holds
only the default mainframes that Tasyen's guide
(https://www.hiveworkshop.com/threads/ui-list-default-mainframes.317884/) lists
as "Loaded" for that native frame type. Any other string is still accepted.

- Never add "Not Loaded" templates; they need their fdf/toc loaded first.
- When a frame type has no loaded templates in the guide, leave the second type argument off.
