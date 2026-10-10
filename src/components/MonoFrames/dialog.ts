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
 * @requiresFdf Accept/cancel buttons (DialogOkButton/DialogCancelButton) are FDF-bound children; a bare typed frame cannot render a complete dialog.
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

    /** @requiresFdf Needs a loaded FDF template for its child frames to render completely. */
    public static CreateNamed(args: NamedNativeFrameArguments<DialogFrameConfiguration>): DialogFrame {
        return new DialogFrame(args.context, { ...DialogFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner, undefined, args.priority);
    }

    /** @requiresFdf Needs a loaded FDF template for its child frames to render completely. */
    public static CreateType(args: TypedNativeFrameArguments<DialogFrameConfiguration>): DialogFrame {
        return new DialogFrame(args.context, { ...DialogFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner, args.inherits);
    }

    public setOnAccept(onAccept: () => void): void {
        this.onAcceptTrigger = this.onFrameEvent(FRAMEEVENT_DIALOG_ACCEPT, onAccept);
    }

    public setOnCancel(onCancel: () => void): void {
        this.onCancelTrigger = this.onFrameEvent(FRAMEEVENT_DIALOG_CANCEL, onCancel);
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
