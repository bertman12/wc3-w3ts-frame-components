import { FrameUtils } from "src/frame-utils";
import { Frame } from "w3ts";
import { AbstractFrameBase } from "./AbstractFrameBase";

export class Icon extends AbstractFrameBase {
    public texture: string;
    public frame?: Frame;

    constructor(texture: string, ...baseArgs: ConstructorParameters<typeof AbstractFrameBase>) {
        super(...baseArgs);

        this.texture = texture;
        this.render();
    }

    public static Default(context: number = 0, owner: Frame = FrameUtils.OriginFrameGameUI): AbstractFrameBase {
        return new Icon("ReplaceableTextures\\CommandButtons\\BTNSelectHeroOn", "", context, owner);
    }

    protected render() {
        this.frame = Frame.createType(this.name, this.owner, this.context, "BACKDROP", this.inherits || "");

        if (!this.frame) {
            return;
        }

        this.frame.clearPoints();
        this.frame.setAbsPoint(FRAMEPOINT_CENTER, 0.4, 0.3);
        this.frame.setSize(0.05, 0.05);
        this.frame.setTexture(this.texture, 0, false);

        return this.frame;
    }

}
