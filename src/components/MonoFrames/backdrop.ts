import { Frame } from "w3ts";
import { MonoFrame } from "../Core/MonoFrame";
import { IMonoFrameConfigurationBase } from "../../models";

export interface BackdropFrameConfiguration extends IMonoFrameConfigurationBase {}

export class BackdropFrame extends MonoFrame<BackdropFrameConfiguration> {
    private constructor(...args: ConstructorParameters<typeof MonoFrame<BackdropFrameConfiguration>>) {
        super(...args);
        this.render();
    }

    public static get DefaultConfiguration(): BackdropFrameConfiguration {
        return {};
    }

    public static CreateNamed(args: { context: number; name: string; priority?: number; owner?: Frame; overrides?: BackdropFrameConfiguration }): BackdropFrame {
        return new BackdropFrame(args.context, { ...BackdropFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner, undefined, args.priority);
    }

    public static CreateType(args: { context: number; inherits: string; name?: string; owner?: Frame; overrides?: BackdropFrameConfiguration }): BackdropFrame {
        return new BackdropFrame(args.context, { ...BackdropFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner, args.inherits);
    }

    protected render(): void {
        this.frame = this.inherits !== undefined ? Frame.createType(this.name, this.owner, this.context, "BACKDROP", this.inherits) : Frame.create(this.name, this.owner, this.priority ?? 0, this.context);
        if (!this.frame) {
            return;
        }

        this.frame.clearPoints();
        this.frame.setAbsPoint(FRAMEPOINT_CENTER, 0.4, 0.3);
        this.frame.setSize(0.1, 0.1);
    }
}
