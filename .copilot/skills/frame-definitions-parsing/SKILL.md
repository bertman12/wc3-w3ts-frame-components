---
name: frame-definitions-parsing
description: Parsing the game's default Warcraft III FDF files (_BlzFrameDefs, framedef.toc) into the loaded and unloaded inherits templates per native frame type, and regenerating src/models/frame-templates.json and FrameTemplates.ts. Use after a game patch, when a template is missing or misclassified, or when changing how templates are derived.
---

# Parsing the default frame definitions

Sources:
- The game's FDF files under `war3.w3mod\ui\framedef` (`.fdf` files plus `framedef.toc`), kept locally in `_BlzFrameDefs\` (gitignored).
- Tasyen, [UI: List - Default MainFrames](https://www.hiveworkshop.com/threads/ui-list-default-mainframes.317884/) for the "Loaded" and "Not Loaded" meaning. Version unspecified; check against the current patch.
- Tasyen, [The Big UI-Frame Tutorial](https://www.hiveworkshop.com/threads/the-big-ui-frame-tutorial.335296/): only top-level ("main") frames can be created or inherited.

## Regenerate
1. Extract `war3.w3mod\ui\framedef` from the game's CASC storage into `_BlzFrameDefs\war3.w3mod\ui\framedef`. Keep the `glue` and `ui` subfolders and `framedef.toc`. Any CASC extractor works, for example CascView.
2. Run `npm run generate:frame-templates` to rewrite `src\models\frame-templates.json` and only the `FrameTemplates` const in `src\models\FrameTemplates.ts`. The header and the types after the const are kept.
   - `npm run generate:frame-templates -- --check` exits 1 if either file is out of date and writes nothing.
   - `npm run generate:frame-templates -- --defs <dir>` points at another folder that contains `framedef.toc`.
3. Review the diff. A removed name breaks any default `inherits`, README example or harness that uses it. Check the defaults in `DefaultConfiguration` of the `MonoFrames` classes.
4. Run `npm run build`.

The script is `scripts\generate-frame-templates.mjs`. It is plain Node with no dependencies.

## Rules the script applies
- **Template:** a top-level `Frame "TYPE" "Name"` declaration, outside every `{}` block. Child frames are skipped because they cannot be created or inherited by name. Comments and string literals are skipped when counting braces.
- **Loaded:** declared in a file listed by `framedef.toc`. Toc paths are matched case-insensitively, because the extracted files are lowercase.
- **IncludeFile does not load a file's main frames.** For example `ScriptDialog.fdf` includes `EscMenuTemplates.fdf`, but `EscMenuButtonTemplate` stays unloaded. This matches Tasyen's guide.
- **Unloaded:** declared only in files not listed by the toc. A name that is loaded in any file of that type is not also listed as unloaded. `dialog.fdf` and `dialogwar3.fdf` both declare `DialogWar3`, and `listbox.fdf` and `listboxwar3.fdf` both declare `ListBoxWar3`.
- **Guide-only loaded names:** `GUIDE_ONLY_LOADED` in the script adds names that Tasyen lists as Loaded but no default FDF declares. Currently that is only `GLUETEXTBUTTON: BrowserButton`. Add to it only with a source.
- **Order:** loaded files in toc order, then the other files alphabetically, then declaration order within each file. The output is deterministic.
- **JSON contents:** `frame-templates.json` has every type found. Each type also has `sources`, which maps every template name to the files that declare it, for example `"ScriptDialogButton": ["ui/framedef/ui/scriptdialog.fdf"]`.
  - The paths are relative to `war3.w3mod`. Swap `/` for `\` to use one in a toc, for example to load an unloaded template's file.
  - Loaded (toc) files come first, so `DialogWar3` lists `ui/framedef/glue/dialogwar3.fdf` before `ui/framedef/glue/dialog.fdf`.
  - Names from `GUIDE_ONLY_LOADED` have Tasyen's guide URL as their source.
  - `sources` is in the JSON only. `FrameTemplates.ts` is compiled into the Lua output, so it stays names-only.
- **TS contents:** `FrameTemplates.ts` leaves out the types in `TS_EXCLUDED_TYPES` (`BUTTON`, `CONTROL`, and the `SIMPLE*` types), because no MonoFrame wraps them. Update that set when a component for one of those types is added.
- **Formatting:** the output follows the repo's Prettier settings (`printWidth` 250, 4 spaces). An array stays on one line if it fits. The file's existing line endings are kept.

## Repo mapping
- `FrameTemplate<"TYPE">` and `InheritsOf<...>` in `FrameTemplates.ts` type `inherits` on `CreateType` and in each configuration. See `.copilot\knowledge\frame-creation-and-modification-guidlines.md`, "Template autocomplete for `inherits`".
- Default `inherits` must be a **loaded** template. After regenerating, make sure each default is still in its type's `loaded` list.
