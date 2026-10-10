# Frame Creation

When creating a Frame, ensure that it's default render position is 0.4, 0.3

When adding fallback values, those properties should be included in the conifugration properties for the frame and then the fallback literal values should be used in the DefaultConfiguration for the frame component.

Never store default values (sizes, text, scale, and so on) as direct properties on the class itself (for example `protected defaultWidth = 0.1`). Defaults are properties on the frame's configuration interface, and their literal values live in the frame class's `DefaultConfiguration`.

Keep exactly one class per file in `src/components/MonoFrames`, named `<ClassName>.ts` (for example `ButtonFrame.ts`), and re-export it from `index.ts`. A configuration interface may sit beside its class.

The native frame type is the `nativeFrameType` property on the `MonoFrame` base class. Concrete frame classes set it directly; do not add intermediate abstract wrapper classes (such as a shared Basic/Clickable/Toggle/Value base) just to hold it or shared render code.
