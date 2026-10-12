import { Frame } from "w3ts";
import { MonoFrame, NamedNativeFrameArguments, TypedNativeFrameArguments } from "../Core/MonoFrame";
import { IMonoFrameConfigurationBase, FrameTemplate } from "../../models";

export interface EmptyFrameConfiguration extends IMonoFrameConfigurationBase {}

export class EmptyFrame extends MonoFrame<EmptyFrameConfiguration> {
    private constructor(...args: ConstructorParameters<typeof MonoFrame<EmptyFrameConfiguration>>) {
        super(...args);
        this.render();
    }

    public static get DefaultConfiguration(): EmptyFrameConfiguration {
        return {};
    }

    public static CreateNamed(args: NamedNativeFrameArguments<EmptyFrameConfiguration>): EmptyFrame {
        return new EmptyFrame(args.context, { ...EmptyFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner, undefined, args.priority);
    }

    public static CreateType(args: TypedNativeFrameArguments<EmptyFrameConfiguration, FrameTemplate<"FRAME">>): EmptyFrame {
        return new EmptyFrame(args.context, { ...EmptyFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner, args.inherits);
    }

    protected render(): void {
        this.frame = this.inherits !== undefined ? Frame.createType(this.name, this.owner, this.context, "FRAME", this.inherits) : Frame.create(this.name, this.owner, this.priority ?? 0, this.context);
        this.frame?.setEnabled(false);
    }
}
