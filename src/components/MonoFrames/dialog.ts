import { Trigger } from "w3ts";
import { IMonoFrameConfigurationBase } from "../../models";
import { FrameType } from "../../names";
import { MonoFrame, NamedNativeFrameArguments, TypedNativeFrameArguments } from "../Core/MonoFrame";

export interface DialogFrameConfiguration extends IMonoFrameConfigurationBase {
    onAccept?: () => void;
    onCancel?: () => void;
}

/**
 * @see Tasyen's DIALOG reference: https://github.com/Tasyen/FDF/blob/master/FrameTypes/DIALOG.html
 */
export class DialogFrame extends MonoFrame<DialogFrameConfiguration> {
    public onAcceptTrigger?: Trigger;
    public onCancelTrigger?: Trigger;

    private constructor(...args: ConstructorParameters<typeof MonoFrame<DialogFrameConfiguration>>) {
        super(...args);
        this.render();
    }

    public static get DefaultConfiguration(): DialogFrameConfiguration {
        return {};
    }

    public static CreateNamed(args: NamedNativeFrameArguments<DialogFrameConfiguration>): DialogFrame {
        return new DialogFrame(args.context, { ...DialogFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner, undefined, args.priority);
    }

    public static CreateType(args: TypedNativeFrameArguments<DialogFrameConfiguration>): DialogFrame {
        return new DialogFrame(args.context, { ...DialogFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner, args.inherits);
    }

    public setOnAccept(onAccept: () => void): void {
        this.onAcceptTrigger = this.createFrameEvent(FRAMEEVENT_DIALOG_ACCEPT, onAccept);
    }

    public setOnCancel(onCancel: () => void): void {
        this.onCancelTrigger = this.createFrameEvent(FRAMEEVENT_DIALOG_CANCEL, onCancel);
    }

    protected render(): void {
        if (!this.createNativeFrame(FrameType.Dialog, 0.2, 0.12)) {
            return;
        }

        if (this.configuration.onAccept) {
            this.setOnAccept(this.configuration.onAccept);
        }
        if (this.configuration.onCancel) {
            this.setOnCancel(this.configuration.onCancel);
        }
    }
}
