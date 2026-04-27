import { Frame } from "w3ts";
import { FrameUtils } from "../frame-utils";

export abstract class AbstractFrameBase {
    public name: string;
    public context: number;
    /**
     * Defaults to ORIGIN_FRAME_GAME_UI when none passed in.
     */
    public owner: Frame;

    /**
     * We'll just let each component define their own appropriate handle name.
     *
     * Could be a single frame with no children or a frame with many children.
     */
    // public rootFrame?: Frame;

    /**
     * Defaults to empty string ""
     */
    protected inherits: string;

    constructor(name: string, context: number, owner?: Frame, inherits?: string) {
        this.name = name;
        this.context = context;
        this.owner = owner || FrameUtils.OriginFrameGameUI;
        this.inherits = inherits || "";
    }

    protected render() {}
}
