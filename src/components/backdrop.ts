import { Frame } from "w3ts";
import { AbstractFrameBase, AbstractFrameConstructorArgs } from "./AbstractFrameBase";
import { FrameUtils } from "src/frame-utils";

/** @inheritdoc */
export class Backdrop extends AbstractFrameBase {
    public frame?: Frame;

    constructor(...baseArgs: AbstractFrameConstructorArgs) {
        super(...baseArgs);

        this.render();
    }

    protected render() {
        //Fallback inherit string not required if someone doesn't want it to have anything in the background.
        this.frame = Frame.createType(this.name, this.owner, this.context, "BACKDROP", this.inherits || "");

        if (!this.frame) {
            return;
        }

        this.frame.clearPoints();
        this.frame.setAbsPoint(FRAMEPOINT_CENTER, 0.4, 0.3);
        this.frame.setSize(0.1, 0.1);

        return this.frame;
    }

    public static Default(context: number = 0, owner: Frame = FrameUtils.OriginFrameGameUI) {
        return new Backdrop("", context, owner);
    }
}
