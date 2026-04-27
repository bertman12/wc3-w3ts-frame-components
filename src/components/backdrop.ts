import { Frame } from "w3ts";
import { AbstractFrameBase } from "./AbstractFrameBase";

export class Backdrop extends AbstractFrameBase {
    public frame?: Frame;

    constructor(...baseArgs: ConstructorParameters<typeof AbstractFrameBase>) {
        super(...baseArgs);

        this.render();
    }

    protected render() {
        this.frame = Frame.createType(this.name, this.owner, this.context, "BACKDROP", this.inherits);

        if (!this.frame) {
            return;
        }

        BlzFrameClearAllPoints(this.frame.handle);
        BlzFrameSetAbsPoint(this.frame.handle, FRAMEPOINT_BOTTOMLEFT, 0.4, 0.3);
        BlzFrameSetSize(this.frame.handle, 0.3, 0.2);

        return this.frame;
    }
}
