import { Trigger } from "w3ts";
import { FrameTemplate, IMonoFrameConfigurationBase, InheritsOf } from "../../models";
import { FrameType } from "../../names";
import { MonoFrame, NamedNativeFrameArguments, TypedNativeFrameArguments } from "../Core/MonoFrame";

export interface GlueCheckBoxFrameConfiguration extends IMonoFrameConfigurationBase<FrameTemplate<"GLUECHECKBOX">> {
    /** The frame definition CreateType inherits from. Overridden by the CreateType inherits argument; ignored by CreateNamed. Default value: "QuestCheckBox" */
    inherits?: InheritsOf<FrameTemplate<"GLUECHECKBOX">>;
    /** Height of the check box. Default value: 0.03 */
    height?: number;
    /** Handler called when the check box is checked. Default value: undefined */
    onChecked?: () => void;
    /** Handler called when the check box is unchecked. Default value: undefined */
    onUnchecked?: () => void;
    /** Width of the check box. Default value: 0.03 */
    width?: number;
}

/**
 * Box and check art (ControlBackdrop, CheckBoxCheckHighlight) are FDF-defined. The default inherits, "QuestCheckBox", is a loaded template that supplies them, so no FDF is needed; created with inherits "" it only fires events.
 * @see Tasyen's GLUECHECKBOX reference: https://github.com/Tasyen/FDF/blob/master/FrameTypes/GLUECHECKBOX.html
 */
export class GlueCheckBoxFrame extends MonoFrame<GlueCheckBoxFrameConfiguration> {
    public onCheckedTrigger?: Trigger;
    public onUncheckedTrigger?: Trigger;

    public readonly nativeFrameType = FrameType.GlueCheckBox;

    private constructor(...args: ConstructorParameters<typeof MonoFrame<GlueCheckBoxFrameConfiguration>>) {
        super(...args);
        this.render();
    }

    public static get DefaultConfiguration(): GlueCheckBoxFrameConfiguration & Required<Pick<GlueCheckBoxFrameConfiguration, "inherits">> {
        return { inherits: "QuestCheckBox", height: 0.03, onChecked: undefined, onUnchecked: undefined, width: 0.03 };
    }

    public static CreateNamed(args: NamedNativeFrameArguments<GlueCheckBoxFrameConfiguration>): GlueCheckBoxFrame {
        return new GlueCheckBoxFrame(args.context, { ...GlueCheckBoxFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner, undefined, args.priority);
    }

    public static CreateType(args: TypedNativeFrameArguments<GlueCheckBoxFrameConfiguration, FrameTemplate<"GLUECHECKBOX">>): GlueCheckBoxFrame {
        return new GlueCheckBoxFrame(args.context, { ...GlueCheckBoxFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner, args.inherits ?? args.overrides?.inherits ?? GlueCheckBoxFrame.DefaultConfiguration.inherits);
    }

    public setOnChecked(onChecked: () => void): void {
        this.onCheckedTrigger = this.onFrameEvent(FRAMEEVENT_CHECKBOX_CHECKED, onChecked);
    }

    public setOnUnchecked(onUnchecked: () => void): void {
        this.onUncheckedTrigger = this.onFrameEvent(FRAMEEVENT_CHECKBOX_UNCHECKED, onUnchecked);
    }

    protected render(): void {
        if (!this.createNativeFrame()) {
            return;
        }

        if (this.configuration.onChecked) {
            this.setOnChecked(this.configuration.onChecked);
        }
        if (this.configuration.onUnchecked) {
            this.setOnUnchecked(this.configuration.onUnchecked);
        }
    }
}
