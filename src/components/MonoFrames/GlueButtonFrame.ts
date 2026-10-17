import { Trigger } from "w3ts";
import { FrameTemplate, IMonoFrameConfigurationBase, InheritsOf } from "../../models";
import { FrameType } from "../../names";
import { MonoFrame, NamedNativeFrameArguments, TypedNativeFrameArguments } from "../Core/MonoFrame";

export interface GlueButtonFrameConfiguration extends IMonoFrameConfigurationBase<FrameTemplate<"GLUEBUTTON">> {
    /** The frame definition CreateType inherits from. Overridden by the CreateType inherits argument; ignored by CreateNamed. Default value: "IconButtonTemplate" */
    inherits?: InheritsOf<FrameTemplate<"GLUEBUTTON">>;
    /** Height of the button. Default value: 0.04 */
    height?: number;
    /** Handler called when the button is clicked. Default value: undefined */
    onClick?: () => void;
    /** Width of the button. Default value: 0.1 */
    width?: number;
}

/**
 * @see Tasyen's GLUEBUTTON reference: https://github.com/Tasyen/FDF/blob/master/FrameTypes/GLUEBUTTON.html
 */
export class GlueButtonFrame extends MonoFrame<GlueButtonFrameConfiguration> {
    public onClickTrigger?: Trigger;

    public readonly nativeFrameType = FrameType.GlueButton;

    private constructor(...args: ConstructorParameters<typeof MonoFrame<GlueButtonFrameConfiguration>>) {
        super(...args);
        this.render();
    }

    public static get DefaultConfiguration(): GlueButtonFrameConfiguration & Required<Pick<GlueButtonFrameConfiguration, "inherits">> {
        return { inherits: "IconButtonTemplate", height: 0.04, onClick: undefined, width: 0.1 };
    }

    public static CreateNamed(args: NamedNativeFrameArguments<GlueButtonFrameConfiguration>): GlueButtonFrame {
        return new GlueButtonFrame(args.context, { ...GlueButtonFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner, undefined, args.priority);
    }

    public static CreateType(args: TypedNativeFrameArguments<GlueButtonFrameConfiguration, FrameTemplate<"GLUEBUTTON">>): GlueButtonFrame {
        return new GlueButtonFrame(args.context, { ...GlueButtonFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner, args.inherits ?? args.overrides?.inherits ?? GlueButtonFrame.DefaultConfiguration.inherits);
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
