# README upkeep

When you change components, or anything covered by an existing section of
`README.md`, update the README in the same change so it stays accurate.

## README guidelines and expectations

- Every exported component (mono frame, composite frame, or other public
  class like `Grid`) must have its own `####` section with an `<a id="...">`
  anchor, linked from the Components index.
- Each component section must include a code example wrapped in
  `<details><summary>Code Example</summary> ... </details>` so it is
  collapsed by default. Examples must use only real, confirmed API shapes
  (`CreateType`/`CreateNamed` argument shapes and actual config fields) —
  verify against the source before writing one.
- Component sections are grouped into categories (for example "Mono frames",
  "Composite frames"). Within each category, both the index entries and the
  body sections must be kept in alphabetical order by component name.
- Each category heading (for example "Mono frames") gets its own
  `<a id="...">` anchor. Every component section's `- [🔝](#...)` backlink
  must point to its own category's anchor, not the top-level
  `#components-toc`, so readers return to the relevant group listing.
- Components that are not grouped under a category heading (for example
  `Grid`) link back to `#components-toc` instead.
- Frames tagged `@requiresFdf` in source must be marked in their README
  section (for example a **Requires FDF** note) so the two stay consistent.
- The top-level Contents list should only link to top-level sections
  (Architecture, Components, Debugging tools, Caveats, etc.), not to
  individual components or categories that are already reachable from the
  Components index.
- After editing, verify every `(#anchor)` link resolves to an existing
  `id="anchor"` and that `<details>`/`</details>` counts stay balanced.
