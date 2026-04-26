import { Frame } from "w3ts";
import { FrameUtils } from "../frame-utils";

export type FrameBaseArgs = [name: string, context: number, owner?: Frame, inherits?: string];

export abstract class AbstractFrameBase {
    public name: string;
    public context: number;
    /**
     * Defaults to ORIGIN_FRAME_GAME_UI when none passed in.
     */
    public owner: Frame;
    /**
     * Could be a single frame with no children or a frame with many children
     */
    public rootFrame?: Frame;
    protected inherits?: string;

    constructor(name: string, context: number, owner?: Frame, inherits?: string) {
        this.name = name;
        this.context = context;
        this.owner = owner || FrameUtils.OriginFrameGameUI;
        this.inherits = inherits;
    }

    protected render() {}
}
