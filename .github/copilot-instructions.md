# TypeScript-to-Lua safety

Never object-spread a value that might be `undefined` or `null`. Normalize
potentially absent object values before spreading them, for example:

```ts
const configuration = { ...defaults, ...(args.overrides ?? {}) };
```

This is required because TypeScript-to-Lua emits object spreads as Lua varargs;
an absent value can create an unsafe `nil` hole in the generated helper call.

# Test commands

Do not run `npm run test` unless the user explicitly requests it. Use
`npm run test:prepare` when validation needs to check the package build and
test-map compilation setup.

# Warcraft III frames knowledge

Read [`.copilot/frames-knowledge.md`](../.copilot/frames-knowledge.md) before
changing Warcraft III frame creation, FDF/TOC loading, layout, tooltips, text
areas, timers, or the component test harness.

Treat that file as the source of truth for verified frame behavior. Update it
in the same change whenever research, source inspection, map compilation, or
runtime observation establishes a durable frame fact that is not already
documented there. Record only verified behavior and retain relevant sources.
