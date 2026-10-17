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

## Template autocomplete for `inherits`

A MonoFrame's `CreateType` must type its arguments as
`TypedNativeFrameArguments<Configuration, FrameTemplate<"NATIVETYPE">>`, e.g.
`FrameTemplate<"BACKDROP">`, and its configuration must extend
`IMonoFrameConfigurationBase<FrameTemplate<"NATIVETYPE">>` so the configuration's
`inherits` gets the same autocomplete (types with no known templates extend the plain base).
`CreateType` passes `args.inherits ?? args.overrides?.inherits ?? <Class>.DefaultConfiguration.inherits` to the constructor.
Give `inherits` a default only when the type has a `loaded` template (usable without an FDF); document it on the class's
configuration (`Default value: "..."`) and include `"inherits"` in the required `DefaultConfiguration` type. Types without a
loaded template leave `inherits` optional with no default, and `CreateType` falls back to `""`.
The data lives in `src/models/frame-templates.json`
(`loaded` and `unloaded` names per native frame type, plus `sources`, which gives the FDF file or files that declare each name) and is mirrored by the `FrameTemplates`
const in `src/models/FrameTemplates.ts`; keep them in sync. Both are generated from the game's FDF files
(`_BlzFrameDefs`) by `npm run generate:frame-templates` (`scripts/generate-frame-templates.mjs`; see the
`frame-definitions-parsing` skill), never edited by hand, using Tasyen's guide
(https://www.hiveworkshop.com/threads/ui-list-default-mainframes.317884/) for the loaded rules. Any other string is still accepted.

- loaded: usable immediately (listed "Loaded" in the guide, or defined in a file listed by `framedef.toc`).
- unloaded: defined in the default FDF files but their file must be loaded from a toc first.
- Types with no known templates resolve to `never`, so only arbitrary strings are suggested.
