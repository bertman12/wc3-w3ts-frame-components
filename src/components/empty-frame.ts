import { Frame } from "w3ts";
import { FrameUtils } from "../frame-utils";

export class EmptyFrame {
    public context: number;
    public name: string;
    public owner?: Frame;
    public frame?: Frame;

    constructor(context: number, name: string, owner?: Frame) {
        this.context = context;
        this.name = name;
        this.owner = owner;
        this.Render();
    }

    private Render() {
        this.frame = Frame.createType(this.name, this.owner ?? FrameUtils.OriginFrameGameUI, this.context, "FRAME", "");
        this.frame?.setEnabled(false);

        return this.frame;
    }
}
