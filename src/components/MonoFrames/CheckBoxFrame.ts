import { Trigger } from "w3ts";
import { IMonoFrameConfigurationBase } from "../../models";
import { FrameType } from "../../names";
import { MonoFrame, NamedNativeFrameArguments, TypedNativeFrameArguments } from "../Core/MonoFrame";

export interface CheckBoxFrameConfiguration extends IMonoFrameConfigurationBase {
    onChecked?: () => void;
    onUnchecked?: () => void;
}

/**
 * @see Tasyen's CHECKBOX reference: https://github.com/Tasyen/FDF/blob/master/FrameTypes/CHECKBOX.html
 * @requiresFdf Box and check art (ControlBackdrop, CheckBoxCheckHighlight) are FDF-defined; a bare typed check box only fires events.
 */
export class CheckBoxFrame extends MonoFrame<CheckBoxFrameConfiguration> {
    public onCheckedTrigger?: Trigger;
    public onUncheckedTrigger?: Trigger;

    public readonly nativeFrameType = FrameType.CheckBox;

    private constructor(...args: ConstructorParameters<typeof MonoFrame<CheckBoxFrameConfiguration>>) {
        super(...args);
        this.render();
    }

    public static get DefaultConfiguration(): CheckBoxFrameConfiguration {
        return { width: 0.03, height: 0.03 };
    }

    /** @requiresFdf Needs a loaded FDF template for its FDF-defined children or art to render. */
    public static CreateNamed(args: NamedNativeFrameArguments<CheckBoxFrameConfiguration>): CheckBoxFrame {
        return new CheckBoxFrame(args.context, { ...CheckBoxFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner, undefined, args.priority);
    }

    /** @requiresFdf Needs a loaded FDF template for its FDF-defined children or art to render. */
    public static CreateType(args: TypedNativeFrameArguments<CheckBoxFrameConfiguration>): CheckBoxFrame {
        return new CheckBoxFrame(args.context, { ...CheckBoxFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner, args.inherits);
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
