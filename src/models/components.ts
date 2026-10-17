import type { CompositeFrame, MonoFrame } from "../components";
import type { Grid } from "../grid";

/** Anything a composite frame can hold as a child. */
export type ICompositeFrameChildType = CompositeFrame<any, any> | CompositeFrame<any, any>[] | Grid<any, any> | MonoFrame<any> | MonoFrame<any>[];

/**
 * A child of a composite frame: the created child frame and the function that renders it.
 * `render` returns the same type as `frame`.
 */
export interface ICompositeFrameChild<T extends ICompositeFrameChildType = ICompositeFrameChildType> {
    /** The child frame that `render` created. */
    frame: T;
    /** Creates the child frame. Supply your own through the configuration's `childFrames` to control how the child is constructed. */
    render: () => T;
}

export type ICompositeFrameChildFrames = { [key: string]: ICompositeFrameChild | undefined };

/**
 * The configuration shape for overriding how each child of a composite frame is rendered.
 * Set only the children you want rendered differently from the default.
 */
export type ICompositeFrameChildRenderers<ChildFrames extends ICompositeFrameChildFrames> = {
    [Key in keyof ChildFrames]?: { render?: NonNullable<ChildFrames[Key]>["render"] };
};
