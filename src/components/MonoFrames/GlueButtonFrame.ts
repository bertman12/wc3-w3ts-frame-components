import { Trigger } from "w3ts";
import { IMonoFrameConfigurationBase } from "../../models";
import { FrameType } from "../../names";
import { MonoFrame, NamedNativeFrameArguments, TypedNativeFrameArguments } from "../Core/MonoFrame";

export interface GlueButtonFrameConfiguration extends IMonoFrameConfigurationBase {
    onClick?: () => void;
}

/**
 * @see Tasyen's GLUEBUTTON reference: https://github.com/Tasyen/FDF/blob/master/FrameTypes/GLUEBUTTON.html
 * @deprecated Development deferred. Do not use; this class is still under development.
 */
export class GlueButtonFrame extends MonoFrame<GlueButtonFrameConfiguration> {
    public onClickTrigger?: Trigger;

    protected readonly nativeFrameType = FrameType.GlueButton;

    private constructor(...args: ConstructorParameters<typeof MonoFrame<GlueButtonFrameConfiguration>>) {
        super(...args);
        this.render();
    }

    public static get DefaultConfiguration(): GlueButtonFrameConfiguration {
        return { width: 0.1, height: 0.04 };
    }

    public static CreateNamed(args: NamedNativeFrameArguments<GlueButtonFrameConfiguration>): GlueButtonFrame {
        return new GlueButtonFrame(args.context, { ...GlueButtonFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner, undefined, args.priority);
    }

    public static CreateType(args: TypedNativeFrameArguments<GlueButtonFrameConfiguration>): GlueButtonFrame {
        return new GlueButtonFrame(args.context, { ...GlueButtonFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner, args.inherits);
    }

    public setOnClick(onClick: () => void): void {
        this.onClickTrigger = this.onFrameEvent(FRAMEEVENT_CONTROL_CLICK, onClick);
    }

    protected render(): void {
        if (!this.createNativeFrame()) {
            return;
        }

        if (this.configuration.onClick) {
            this.setOnClick(this.configuration.onClick);
        }
    }
}
