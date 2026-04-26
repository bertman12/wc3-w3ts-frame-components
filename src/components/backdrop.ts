import { Frame } from "w3ts";
import { FrameUtils } from "../frame-utils";
import { AbstractFrameBase } from "./AbstractFrameBase";

export class Backdrop extends AbstractFrameBase {
    constructor(...baseArgs: ConstructorParameters<typeof AbstractFrameBase>) {
        super(...baseArgs);

        this.render();
    }

    protected render() {
        const container = Frame.createType(this.name + "backdrop" + this.context, this.owner || FrameUtils.OriginFrameGameUI, this.context, "BACKDROP", this.inherits || "");

        if (!container) {
            return;
        }

        BlzFrameClearAllPoints(container.handle);
        BlzFrameSetAbsPoint(container.handle, FRAMEPOINT_BOTTOMLEFT, 0.4, 0.3);
        BlzFrameSetSize(container.handle, 0.3, 0.2);

        return container;
    }
}
