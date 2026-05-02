import { FrameUtils } from "src/frame-utils";
import { W3TSFrameComponentsThemeUtils } from "src/theme";
import { Frame } from "w3ts";
import { AbstractFrameBase, AbstractFrameConstructorArgs } from "./AbstractFrameBase";

/** @inheritdoc */
export class Backdrop extends AbstractFrameBase {
    public frame?: Frame;

    constructor(...baseArgs: AbstractFrameConstructorArgs) {
        super(...baseArgs);

        this.render();
    }

    protected render() {
        //Fallback inherit string not required if someone doesn't want it to have anything in the background.
        this.frame = Frame.createType(this.name, this.owner, this.context, "BACKDROP", this.inherits || W3TSFrameComponentsThemeUtils.Theme.backdropInherits || "");

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

/**
 * If you set a theme for a component, then it will use that.
 * 
 * Themes will support creating by type.
 * 
 * So if you wanted to use your theme, how would you?
 * 
 * The point of the theme is to avoid repeating the same settings over and over.
 * 
 * Maybe we do need a createByType and createByName. That way it's more explicit.
 * 
 * 
 * Also, there are probbably some common properties that can be shared across component configurations for customization, like padding, initial text, etc.
 */