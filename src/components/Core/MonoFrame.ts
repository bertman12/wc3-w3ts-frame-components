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
    /** The native frame type created by type (see CreateType). Derived classes that wrap a native type set it. */
    public readonly nativeFrameType?: FrameType;
    public readonly frameEventTriggers = new Map<frameeventtype, Trigger>();

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

    protected createNativeFrame(x = 0.4, y = 0.3): Frame | undefined {
        if (this.inherits !== undefined && this.nativeFrameType === undefined) {
            return undefined;
        }

        this.frame = this.inherits !== undefined ? Frame.createType(this.name, this.owner, this.context, this.nativeFrameType as FrameType, this.inherits) : Frame.create(this.name, this.owner, this.priority ?? 0, this.context);
        if (!this.frame) {
            return undefined;
        }

        this.frame.clearPoints();
        this.frame.setAbsPoint(FRAMEPOINT_CENTER, x, y);
        this.frame.setSize(this.configuration.width ?? 0.1, this.configuration.height ?? 0.04);
        return this.frame;
    }

    /**
     * Allows for quick setup of frame event triggers. Also manages storing and cleaning up triggers per event type for the frame.
     * @param eventType Event type to listen to
     * @param action callback function executed in a Trigger action context.
     * @returns
     */
    public onFrameEvent(eventType: frameeventtype, action: () => void): Trigger | undefined {
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
