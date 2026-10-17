import { Frame } from "w3ts";
import { InheritsOf } from "./FrameTemplates";

interface IFrameConfigurationBase {
    // stuff ?
}

/**
 * Configurable properties all MonoFrames share.
 *
 * @typeParam Template Known default templates for the frame type (see FrameTemplate), used for `inherits` autocomplete.
 */
export interface IMonoFrameConfigurationBase<Template extends string = string> extends IFrameConfigurationBase {
    /**
     * The frame definition to inherit from when created with `CreateType`; lets a saved configuration carry the frame's primary look.
     * Overridden by the `inherits` creation argument of `CreateType`. Ignored by `CreateNamed`. Only applied when the frame is created.
     * Default value: undefined (CreateType then uses "", a bare frame)
     */
    inherits?: InheritsOf<Template>;
    /** Initial width used when the frame is created. */
    width?: number;
    /** Initial height used when the frame is created. */
    height?: number;
}

export interface ICompositeFrameConfigurationBase extends IFrameConfigurationBase {
    /**
     * Overrides how individual child frames are rendered, keyed by child name. Each `render` returns the same
     * type as the child's `frame`. Children without an entry use the composite frame's default rendering.
     */
    childFrames?: { [key: string]: { render?: () => unknown } | undefined };
}

/**
 * Requires the configuration object type of the component this is used on
 */
interface IFrameBaseMethods {
    // render(): void;
    //
}

export interface IMonoFrameMethods extends IFrameBaseMethods {
    //
}

export interface ICompositeFrameMethods extends IFrameBaseMethods {
    //
}

/**
 * Shared properties amongst mono and composite frame classes.
 */
interface IFrameBaseProperties<T extends IFrameConfigurationBase> {
    context: number;
    configuration: T;
    name?: string;
    owner?: Frame;
}

export interface IMonoFrameProperties<T extends IFrameConfigurationBase> extends IFrameBaseProperties<T> {
    inherits?: string;
    priority?: number;
}

/**
 * Contains a list of child frames in the composite component.
 */
export interface ICompositeFrameProperties<T extends ICompositeFrameConfigurationBase, ComponentTypes> extends IFrameBaseProperties<T> {
    childFrames?: ComponentTypes;
    containerFrame?: Frame;
}

interface IFrameCreationMethodsBase<T extends IFrameConfigurationBase> {
    // /**
    //  * When no configuration exists, the library's default configuration is used.
    //  * @param args
    //  * @returns
    //  */
    // Create: (args: { context: number; name?: string; owner?: Frame; configuration?: T }) => void;
    // CreateThemed: (args: { context: number; name?: string; owner?: Frame; inherits: string; overrides?: T }) => void;
}

/**
 * Classes which simlpy serve as a wrapper to standard blizzard frame types
 */
export interface IMonoFrameCreationMethodsBase<T extends IMonoFrameConfigurationBase> extends IFrameCreationMethodsBase<T> {
    CreateType: (args: { context?: number; name?: string; owner?: Frame; inherits?: string }) => void;
    CreateNamed: (args: { context?: number; name: string; owner?: Frame }) => void;
}

/**
 * Inherits does not belong on composite frames.
 */
export interface ICompositeFrameCreationMethodsBase<T extends ICompositeFrameConfigurationBase> extends IFrameCreationMethodsBase<T> {
    // CreateThemed: (args: { context: number; name?: string; owner?: Frame; overrides?: T }) => void;
}

/**
 * Depending on if you are a non composite frame, you can pass in the inherit argument to the
 * CreateThemed, CreateType or CreateNamed functions
 */

/**
 * Frames which are basically just wrappers of the normal blizzard frames should have an expected set of arguments
 *
 * Composite frames should have their own arguments which make sense
 * - doesn't make sense to have the inherits property since that is for a single blizz frame type
 * - keeps context and name, if you want to name your frame
 *
 *
 * Both component and non composite frames can use some of the same interfaces
 */
