import { Frame } from "w3ts";
import { AbstractFrameBase } from "./AbstractFrameBase";

export class EmptyFrame extends AbstractFrameBase {
    public frame?: Frame;

    constructor(...baseArgs: ConstructorParameters<typeof AbstractFrameBase>) {
        super(...baseArgs);

        this.render();
    }

    protected render() {
        this.frame = Frame.createType(this.name, this.owner, this.context, "FRAME", this.inherits);
        this.frame?.setEnabled(false);

        return this.frame;
    }
}
