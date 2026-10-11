import { Frame } from "w3ts";
import { IMonoFrameConfigurationBase, LoadedBackdropTemplate } from "../../models";
import { MonoFrame, NamedNativeFrameArguments, TypedNativeFrameArguments } from "../Core/MonoFrame";

export interface BackdropFrameConfiguration extends IMonoFrameConfigurationBase {
    /** Height of the backdrop. Default value: 0.1 */
    height?: number;
    /** Width of the backdrop. Default value: 0.1 */
    width?: number;
}

type BackdropFrameDefaultConfiguration = Required<Pick<BackdropFrameConfiguration, "height" | "width">>;

export class BackdropFrame extends MonoFrame<BackdropFrameConfiguration> {
    private constructor(...args: ConstructorParameters<typeof MonoFrame<BackdropFrameConfiguration>>) {
        super(...args);
        this.render();
    }

    public static get DefaultConfiguration(): BackdropFrameDefaultConfiguration {
        return { height: 0.1, width: 0.1 };
    }

    public static CreateNamed(args: NamedNativeFrameArguments<BackdropFrameConfiguration>): BackdropFrame {
        return new BackdropFrame(args.context, { ...BackdropFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner, undefined, args.priority);
    }

    public static CreateType(args: TypedNativeFrameArguments<BackdropFrameConfiguration, LoadedBackdropTemplate>): BackdropFrame {
        return new BackdropFrame(args.context, { ...BackdropFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner, args.inherits);
    }

    protected render(): void {
        this.frame = this.inherits !== undefined ? Frame.createType(this.name, this.owner, this.context, "BACKDROP", this.inherits) : Frame.create(this.name, this.owner, this.priority ?? 0, this.context);
        if (!this.frame) {
            return;
        }

        this.frame.clearPoints();
        this.frame.setAbsPoint(FRAMEPOINT_CENTER, 0.4, 0.3);
        this.frame.setSize(this.configuration.width ?? BackdropFrame.DefaultConfiguration.width, this.configuration.height ?? BackdropFrame.DefaultConfiguration.height);
    }
}
