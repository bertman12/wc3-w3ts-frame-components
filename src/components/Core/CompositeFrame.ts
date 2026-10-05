import { FrameUtils } from "src/frame-utils";
import { ICompositeFrameComponents } from "src/models/components";
import { ICompositeFrameConfigurationBase, ICompositeFrameMethods, ICompositeFrameProperties } from "src/models/FrameTypes";
import { Frame } from "w3ts";

/**
 * A Composite Frame is composed of other Composite Frames or Mono Frames
 */
export abstract class CompositeFrame<Configuration extends ICompositeFrameConfigurationBase, ComponentTypes extends ICompositeFrameComponents> implements ICompositeFrameMethods, ICompositeFrameProperties<Configuration, ComponentTypes> {
    containerFrame?: Frame | undefined;
    context: number;
    name?: string | undefined;
    owner?: Frame | undefined;
    configuration?: Configuration | undefined;
    childFrames?: ComponentTypes | undefined;

    /**
     * @param name When creating a component with a non empty string for the inherits property, then this will be used as a custom name for the frame. When creating a component without an empty string or undefined for inherits, this will be used to reference an existing blizzard frame name.
     * @param context
     * @param owner Defaults to ORIGIN_FRAME_GAME_UI
     * @param inherits No default.
     * @param priority Defaults to 0
     */
    constructor(context: number, name?: string, owner?: Frame) {
        this.name = name;
        this.context = context;
        this.owner = owner || FrameUtils.OriginFrameGameUI;
    }

    static Create<Configuration extends ICompositeFrameConfigurationBase, ComponentTypes extends ICompositeFrameComponents>(args: { context: number; name?: string; owner?: Frame; configuration?: any }) {
        // replace with component relevant logic
    }
}
