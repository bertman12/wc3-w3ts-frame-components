import { FrameUtils } from "src/frame-utils";
import { Frame } from "w3ts";
import { AbstractFrameBase } from "./AbstractFrameBase";

export class EmptyFrame extends AbstractFrameBase {
    public frame?: Frame;

    constructor(...baseArgs: ConstructorParameters<typeof AbstractFrameBase>) {
        super(...baseArgs);

        this.render();
    }

    public static Default(context: number = 0, owner: Frame = FrameUtils.OriginFrameGameUI) {
        return new EmptyFrame("", context, owner);
    }

    

    /**
     * Add create by named since it works!
     */
    protected render() {
        this.frame = Frame.createType(this.name, this.owner, this.context, "FRAME", this.inherits || "");
// add named



        this.frame?.setEnabled(false);

        return this.frame;
    }
}
