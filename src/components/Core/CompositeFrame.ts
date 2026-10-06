import { Frame } from "w3ts";
import { FrameUtils } from "../../frame-utils";
import { ICompositeFrameConfigurationBase, ICompositeFrameChildFrames, ICompositeFrameMethods, ICompositeFrameProperties } from "../../models";

/**
 * A Composite Frame is composed of other Composite Frames or Mono Frames
 */
export abstract class CompositeFrame<Configuration extends ICompositeFrameConfigurationBase, ChildFrames extends ICompositeFrameChildFrames> implements ICompositeFrameMethods, ICompositeFrameProperties<Configuration, ChildFrames> {
    public containerFrame?: Frame | undefined;
    public context: number;
    public configuration: Configuration;
    public name?: string | undefined;
    public owner?: Frame | undefined;
    public childFrames?: ChildFrames | undefined;

    /**
     * @param name When creating a component with a non empty string for the inherits property, then this will be used as a custom name for the frame. When creating a component without an empty string or undefined for inherits, this will be used to reference an existing blizzard frame name.
     * @param context
     * @param owner Defaults to ORIGIN_FRAME_GAME_UI
     */
    constructor(context: number, configuration: Configuration, name?: string, owner?: Frame) {
        this.name = name;
        this.context = context;
        this.owner = owner || FrameUtils.OriginFrameGameUI;
        this.configuration = configuration;
    }

    /**
     *
     * @param args Frame creation options
     * @param args.context The context of the container frame and all child frames.
     * @param args.name An arbitrary name for the container frame, which is used as a prefix for generic child frame names in the composite frame.
     * @param args.owner The parent frame for the container frame. Default value: ORIGIN_FRAME_GAME_UI
     * @param args.overrides Allows overriding the CompositeFrame's default configuration with your own.
     */
    static Create(args: { context: number; name?: string; owner?: Frame; overrides?: any }): any {
        // replace with component relevant logic
    }

    /**
     * Contains the render logic for the CompositeFrame
     */
    protected render() {}
}
