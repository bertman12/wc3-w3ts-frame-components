import { Frame } from "w3ts";
import { FrameUtils } from "../frame-utils";

export abstract class AbstractFrameBase {
    /**
     * When creating a component with a non empty string for the inherits property, then this will be used as a custom name for the frame.
     *
     * When creating a component without an empty string or undefined for inherits, this will be used to reference an existing blizzard frame name.
     * 
     * This allows for flexibility of choosing to create by name or from an inherited type with it's own custom name.
     */
    public name: string;

    /**
     * The create context for the frame.
     */
    public context: number;

    /**
     * Defaults to ORIGIN_FRAME_GAME_UI when none passed in.
     */
    public owner: Frame;

    /**
     * Defaults to empty string ""
     */
    protected inherits: string;

    /**
     * Defaults to 0
     * 
     * Only utilized when a component is created by name
     */
    protected priority: number;

    /**
     * Serves as the primary frame for the component.
    */
    // protected primaryFrame?: Frame;

    /**
     * @param name When creating a component with a non empty string for the inherits property, then this will be used as a custom name for the frame. When creating a component without an empty string or undefined for inherits, this will be used to reference an existing blizzard frame name.
     * @param context
     * @param owner Defaults to ORIGIN_FRAME_GAME_UI
     * @param inherits Defaults to empty string ""
     * @param priority Defaults to 0
     */
    constructor(name: string, context: number, owner?: Frame, inherits?: string, priority?: number) {
        this.name = name;
        this.context = context;
        this.owner = owner || FrameUtils.OriginFrameGameUI;
        this.inherits = inherits || "";
        this.priority = priority || 0;
    }

    protected render() {}
}
