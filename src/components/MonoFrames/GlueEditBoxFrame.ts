import { Trigger } from "w3ts";
import { IMonoFrameConfigurationBase } from "../../models";
import { FrameType } from "../../names";
import { MonoFrame, NamedNativeFrameArguments, TypedNativeFrameArguments } from "../Core/MonoFrame";

export interface GlueEditBoxFrameConfiguration extends IMonoFrameConfigurationBase {
    initialText?: string;
    onEnter?: (text: string) => void;
    onTextChanged?: (text: string) => void;
}

/**
 * @see Tasyen's GLUEEDITBOX reference: https://github.com/Tasyen/FDF/blob/master/FrameTypes/GLUEEDITBOX.html
 */
export class GlueEditBoxFrame extends MonoFrame<GlueEditBoxFrameConfiguration> {
    public onEnterTrigger?: Trigger;
    public onTextChangedTrigger?: Trigger;

    public readonly nativeFrameType = FrameType.GlueEditBox;

    private constructor(...args: ConstructorParameters<typeof MonoFrame<GlueEditBoxFrameConfiguration>>) {
        super(...args);
        this.render();
    }

    public static get DefaultConfiguration(): GlueEditBoxFrameConfiguration {
        return { initialText: "", width: 0.2, height: 0.04 };
    }

    public static CreateNamed(args: NamedNativeFrameArguments<GlueEditBoxFrameConfiguration>): GlueEditBoxFrame {
        return new GlueEditBoxFrame(args.context, { ...GlueEditBoxFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner, undefined, args.priority);
    }

    public static CreateType(args: TypedNativeFrameArguments<GlueEditBoxFrameConfiguration>): GlueEditBoxFrame {
        return new GlueEditBoxFrame(args.context, { ...GlueEditBoxFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner, args.inherits);
    }

    public setOnEnter(onEnter: (text: string) => void): void {
        this.onEnterTrigger = this.onFrameEvent(FRAMEEVENT_EDITBOX_ENTER, () => onEnter(this.frame?.text ?? ""));
    }

    public setOnTextChanged(onTextChanged: (text: string) => void): void {
        this.onTextChangedTrigger = this.onFrameEvent(FRAMEEVENT_EDITBOX_TEXT_CHANGED, () => onTextChanged(this.frame?.text ?? ""));
    }

    public updateText(text: string): void {
        this.frame?.setText(text);
    }

    protected render(): void {
        const frame = this.createNativeFrame();
        if (!frame) {
            return;
        }

        if (this.configuration.initialText !== undefined) {
            frame.setText(this.configuration.initialText);
        }
        if (this.configuration.onTextChanged) {
            this.setOnTextChanged(this.configuration.onTextChanged);
        }
        if (this.configuration.onEnter) {
            this.setOnEnter(this.configuration.onEnter);
        }
    }
}
