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
