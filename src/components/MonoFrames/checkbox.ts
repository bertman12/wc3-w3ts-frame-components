import { Trigger } from "w3ts";
import { IMonoFrameConfigurationBase } from "../../models";
import { FrameType } from "../../names";
import { MonoFrame, NamedNativeFrameArguments, TypedNativeFrameArguments } from "../Core/MonoFrame";

interface CheckBoxFrameConfigurationBase extends IMonoFrameConfigurationBase {
    onChecked?: () => void;
    onUnchecked?: () => void;
}

abstract class ToggleFrame<Configuration extends CheckBoxFrameConfigurationBase> extends MonoFrame<Configuration> {
    public onCheckedTrigger?: Trigger;
    public onUncheckedTrigger?: Trigger;

    protected abstract readonly nativeFrameType: FrameType;

    protected render(): void {
        if (!this.createNativeFrame(this.nativeFrameType, 0.03, 0.03)) {
            return;
        }

        if (this.configuration.onChecked) {
            this.setOnChecked(this.configuration.onChecked);
        }
        if (this.configuration.onUnchecked) {
            this.setOnUnchecked(this.configuration.onUnchecked);
        }
    }

    public setOnChecked(onChecked: () => void): void {
        this.onCheckedTrigger = this.createFrameEvent(FRAMEEVENT_CHECKBOX_CHECKED, onChecked);
    }

    public setOnUnchecked(onUnchecked: () => void): void {
        this.onUncheckedTrigger = this.createFrameEvent(FRAMEEVENT_CHECKBOX_UNCHECKED, onUnchecked);
    }
}

export interface CheckBoxFrameConfiguration extends CheckBoxFrameConfigurationBase {}

/**
 * @see Tasyen's CHECKBOX reference: https://github.com/Tasyen/FDF/blob/master/FrameTypes/CHECKBOX.html
 */
export class CheckBoxFrame extends ToggleFrame<CheckBoxFrameConfiguration> {
    protected readonly nativeFrameType = FrameType.CheckBox;

    private constructor(...args: ConstructorParameters<typeof MonoFrame<CheckBoxFrameConfiguration>>) {
        super(...args);
        this.render();
    }

    public static get DefaultConfiguration(): CheckBoxFrameConfiguration {
        return {};
    }

    public static CreateNamed(args: NamedNativeFrameArguments<CheckBoxFrameConfiguration>): CheckBoxFrame {
        return new CheckBoxFrame(args.context, { ...CheckBoxFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner, undefined, args.priority);
    }

    public static CreateType(args: TypedNativeFrameArguments<CheckBoxFrameConfiguration>): CheckBoxFrame {
        return new CheckBoxFrame(args.context, { ...CheckBoxFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner, args.inherits);
    }
}

export interface GlueCheckBoxFrameConfiguration extends CheckBoxFrameConfigurationBase {}

/**
 * @see Tasyen's GLUECHECKBOX reference: https://github.com/Tasyen/FDF/blob/master/FrameTypes/GLUECHECKBOX.html
 */
export class GlueCheckBoxFrame extends ToggleFrame<GlueCheckBoxFrameConfiguration> {
    protected readonly nativeFrameType = FrameType.GlueCheckBox;

    private constructor(...args: ConstructorParameters<typeof MonoFrame<GlueCheckBoxFrameConfiguration>>) {
        super(...args);
        this.render();
    }

    public static get DefaultConfiguration(): GlueCheckBoxFrameConfiguration {
        return {};
    }

    public static CreateNamed(args: NamedNativeFrameArguments<GlueCheckBoxFrameConfiguration>): GlueCheckBoxFrame {
        return new GlueCheckBoxFrame(args.context, { ...GlueCheckBoxFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner, undefined, args.priority);
    }

    public static CreateType(args: TypedNativeFrameArguments<GlueCheckBoxFrameConfiguration>): GlueCheckBoxFrame {
        return new GlueCheckBoxFrame(args.context, { ...GlueCheckBoxFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner, args.inherits);
    }
}
