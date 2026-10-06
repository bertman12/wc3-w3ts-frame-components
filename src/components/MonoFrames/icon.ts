import { Frame } from "w3ts";
import { MonoFrame } from "../Core/MonoFrame";
import { IMonoFrameConfigurationBase } from "../../models";

export interface IconFrameConfiguration extends IMonoFrameConfigurationBase {
    texture?: string;
}

export class IconFrame extends MonoFrame<IconFrameConfiguration> {
    public frame?: Frame;

    private constructor(...args: ConstructorParameters<typeof MonoFrame<IconFrameConfiguration>>) {
        super(...args);
        this.render();
    }

    public static get DefaultConfiguration(): IconFrameConfiguration {
        return { texture: "ReplaceableTextures\\CommandButtons\\BTNSelectHeroOn" };
    }

    public static CreateNamed(args: { context: number; name: string; priority?: number; owner?: Frame; overrides?: IconFrameConfiguration }): IconFrame {
        return new IconFrame(args.context, { ...IconFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner, undefined, args.priority);
    }

    public static CreateType(args: { context: number; inherits: string; name?: string; owner?: Frame; overrides?: IconFrameConfiguration }): IconFrame {
        return new IconFrame(args.context, { ...IconFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner, args.inherits);
    }

    protected render(): void {
        this.frame = Frame.createType(this.name, this.owner, this.context, "BACKDROP", this.inherits ?? "");
        if (!this.frame) {
            return;
        }

        this.frame.clearPoints();
        this.frame.setAbsPoint(FRAMEPOINT_CENTER, 0.4, 0.3);
        this.frame.setSize(0.03, 0.03);
        this.frame.setTexture(this.configuration.texture ?? "", 0, false);
    }

    public updateTexture(texture: string): void {
        this.frame?.setTexture(texture, 0, false);
    }
}
