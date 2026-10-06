import { FrameUtils } from "src/frame-utils";
import { IMonoFrameConfigurationBase, IMonoFrameMethods, IMonoFrameProperties } from "src/models/FrameTypes";
import { Frame } from "w3ts";

/**
 * Mono frames are those which act as wrappers a single frame type.
 */
export abstract class MonoFrame<Configuration extends IMonoFrameConfigurationBase> implements IMonoFrameMethods, IMonoFrameProperties<Configuration> {
    public context: number;
    public owner: Frame;
    public name: string;
    public inherits?: string;
    public priority?: number | undefined;
    public configuration: Configuration;

    constructor(context: number, configuration: Configuration, name?: string, owner?: Frame, inherits?: string, priority?: number) {
        this.context = context;
        this.configuration = configuration;
        this.name = name || "";
        this.owner = owner || FrameUtils.OriginFrameGameUI;
        this.inherits = inherits || "";
        this.priority = priority || 0;
    }

    /**
     * Creates a component from an existing blizzard frame using the name field.
     * @param args Frame creation options
     * @param args.context The render context of frame.
     * @param args.name A specific blizzard frame name.
     * @param args.priority The priority value of the frame.
     * @param args.owner Default value: ORIGIN_FRAME_GAME_UI
     * @param args.overrides Allows overriding the MonoFrame's default configuration with your own.
     */
    public static CreateNamed(args: { context: number; priority: number; name: string; owner?: Frame; overrides?: any }) {
        //
    }

    /**
     * Creates a component by type using the inherits field.
     * 
     * @param args Frame creation options
     * @param args.context The render context of frame.
     * @param args.inherits The frame which this frame will inherit properties from.
     * @param args.name An arbitrary name for the frame.
     * @param args.owner Default value: ORIGIN_FRAME_GAME_UI
     * @param args.overrides Allows overriding the MonoFrame's default configuration with your own.
     */
    public static CreateType(args: { context: number; inherits: string; name?: string; owner?: Frame; overrides?: any }) {
        //
    }

    /**
     * Contains the render logic for the MonoFrame
     */
    protected render() {
        //
    }
}

interface MonoConfig extends IMonoFrameConfigurationBase {}

export class MonoTest extends MonoFrame<MonoConfig> {
    constructor() {
        super(0, {});
    }
}
