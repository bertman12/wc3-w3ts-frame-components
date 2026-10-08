import { Frame, Trigger } from "w3ts";
import { FrameUtils } from "../../frame-utils";
import { IMonoFrameConfigurationBase, IMonoFrameMethods, IMonoFrameProperties } from "../../models";
import { FrameType } from "../../names";

export interface NamedNativeFrameArguments<Configuration extends IMonoFrameConfigurationBase> {
    context: number;
    name: string;
    priority?: number;
    owner?: Frame;
    overrides?: Configuration;
}

export interface TypedNativeFrameArguments<Configuration extends IMonoFrameConfigurationBase> {
    context: number;
    inherits: string;
    name?: string;
    owner?: Frame;
    overrides?: Configuration;
}

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
    public frame?: Frame;
    protected readonly frameEventTriggers = new Map<frameeventtype, Trigger>();

    constructor(context: number, configuration: Configuration, name?: string, owner?: Frame, inherits?: string, priority?: number) {
        this.context = context;
        this.configuration = configuration || {};
        this.name = name || "";
        this.owner = owner || FrameUtils.OriginFrameGameUI;
        this.inherits = inherits;
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

    protected createNativeFrame(frameType: FrameType, width = 0.1, height = 0.04, x = 0.4, y = 0.3): Frame | undefined {
        this.frame =
            this.inherits !== undefined
                ? Frame.createType(this.name, this.owner, this.context, frameType, this.inherits)
                : Frame.create(this.name, this.owner, this.priority ?? 0, this.context);
        if (!this.frame) {
            return undefined;
        }

        this.frame.clearPoints();
        this.frame.setAbsPoint(FRAMEPOINT_CENTER, x, y);
        this.frame.setSize(width, height);
        return this.frame;
    }

    protected createFrameEvent(eventType: frameeventtype, action: () => void): Trigger | undefined {
        if (!this.frame) {
            return undefined;
        }

        this.frameEventTriggers.get(eventType)?.destroy();
        const trigger = Trigger.create();
        this.frameEventTriggers.set(eventType, trigger);
        trigger.triggerRegisterFrameEvent(this.frame, eventType);
        trigger.addAction(action);
        return trigger;
    }

    /**
     * Contains the render logic for the MonoFrame
     */
    protected render() {
        //
    }
}
