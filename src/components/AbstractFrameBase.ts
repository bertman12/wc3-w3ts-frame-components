import { Frame } from "w3ts";
import { FrameUtils } from "../frame-utils";

export type AbstractFrameConstructorArgs = ConstructorParameters<typeof AbstractFrameBase>;

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
    protected inherits?: string;

    /**
     * Defaults to 0
     *
     * Only utilized when a component is created by name
     */
    protected priority: number;

    /**
     * A frame set by the component which is used for positioning.
     */
    protected positioningFrameReference?: Frame;


    
    /**
     * Serves as the primary frame for the component.
     */
    // protected primaryFrame?: Frame;

    /**
     * @param name When creating a component with a non empty string for the inherits property, then this will be used as a custom name for the frame. When creating a component without an empty string or undefined for inherits, this will be used to reference an existing blizzard frame name.
     * @param context
     * @param owner Defaults to ORIGIN_FRAME_GAME_UI
     * @param inherits No default.
     * @param priority Defaults to 0
     */
    constructor(name: string, context: number, owner?: Frame, inherits?: string, priority?: number) {
        this.name = name;
        this.context = context;
        this.owner = owner || FrameUtils.OriginFrameGameUI;
        this.inherits = inherits;
        this.priority = priority || 0;
    }

    protected render() {}

    /**
     * Creates the frame with developer chosen default arguments.
     *
     * Useful when you do not know any named frame strings for the frame type.
     *
     * Will also apply global theme properties appropriately.
     */
    public static CreateDefault(context: number, owner: Frame) {}

    /**
     * Created the component using any theme properties you have set.
     *
     * @param overrides Allows overriding saved theme properties.
     */
    public static CreateThemed(...args: any[]) {
        // Each component can define their own arguments for this.
    }

    /**
     * Creates a component by type using the inherits field.
     */
    public static CreateType(...args: any[]) {}

    /**
     * Creates a component from an existing blizzard frame using the name field.
     */
    public static CreateNamed(...args: any[]) {}

    /**
     * Saves a theme configuration which is used when using the CreateThemed function.
     * @param themeConfiguration
     */
    public static SaveTheme(themeConfiguration: any) {}
}
