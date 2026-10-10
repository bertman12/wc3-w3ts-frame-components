import { Trigger } from "w3ts";
import { IMonoFrameConfigurationBase } from "../../models";
import { FrameType } from "../../names";
import { MonoFrame, NamedNativeFrameArguments, TypedNativeFrameArguments } from "../Core/MonoFrame";

interface EditBoxFrameConfigurationBase extends IMonoFrameConfigurationBase {
    initialText?: string;
    onEnter?: (text: string) => void;
    onTextChanged?: (text: string) => void;
}

abstract class TextInputFrame<Configuration extends EditBoxFrameConfigurationBase> extends MonoFrame<Configuration> {
    public onEnterTrigger?: Trigger;
    public onTextChangedTrigger?: Trigger;

    protected abstract readonly nativeFrameType: FrameType;

    protected render(): void {
        const frame = this.createNativeFrame(this.nativeFrameType, 0.2, 0.04);
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

    public setOnEnter(onEnter: (text: string) => void): void {
        this.onEnterTrigger = this.onFrameEvent(FRAMEEVENT_EDITBOX_ENTER, () => onEnter(this.frame?.text ?? ""));
    }

    public setOnTextChanged(onTextChanged: (text: string) => void): void {
        this.onTextChangedTrigger = this.onFrameEvent(FRAMEEVENT_EDITBOX_TEXT_CHANGED, () => onTextChanged(this.frame?.text ?? ""));
    }

    public updateText(text: string): void {
        this.frame?.setText(text);
    }
}

export interface EditBoxFrameConfiguration extends EditBoxFrameConfigurationBase {}

/**
 * @see Tasyen's EDITBOX reference: https://github.com/Tasyen/FDF/blob/master/FrameTypes/EDITBOX.html
 */
export class EditBoxFrame extends TextInputFrame<EditBoxFrameConfiguration> {
    protected readonly nativeFrameType = FrameType.EditBox;

    private constructor(...args: ConstructorParameters<typeof MonoFrame<EditBoxFrameConfiguration>>) {
        super(...args);
        this.render();
    }

    public static get DefaultConfiguration(): EditBoxFrameConfiguration {
        return { initialText: "" };
    }

    public static CreateNamed(args: NamedNativeFrameArguments<EditBoxFrameConfiguration>): EditBoxFrame {
        return new EditBoxFrame(args.context, { ...EditBoxFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner, undefined, args.priority);
    }

    public static CreateType(args: TypedNativeFrameArguments<EditBoxFrameConfiguration>): EditBoxFrame {
        return new EditBoxFrame(args.context, { ...EditBoxFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner, args.inherits);
    }
}

export interface GlueEditBoxFrameConfiguration extends EditBoxFrameConfigurationBase {}

/**
 * @see Tasyen's GLUEEDITBOX reference: https://github.com/Tasyen/FDF/blob/master/FrameTypes/GLUEEDITBOX.html
 */
export class GlueEditBoxFrame extends TextInputFrame<GlueEditBoxFrameConfiguration> {
    protected readonly nativeFrameType = FrameType.GlueEditBox;

    private constructor(...args: ConstructorParameters<typeof MonoFrame<GlueEditBoxFrameConfiguration>>) {
        super(...args);
        this.render();
    }

    public static get DefaultConfiguration(): GlueEditBoxFrameConfiguration {
        return { initialText: "" };
    }

    public static CreateNamed(args: NamedNativeFrameArguments<GlueEditBoxFrameConfiguration>): GlueEditBoxFrame {
        return new GlueEditBoxFrame(args.context, { ...GlueEditBoxFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner, undefined, args.priority);
    }

    public static CreateType(args: TypedNativeFrameArguments<GlueEditBoxFrameConfiguration>): GlueEditBoxFrame {
        return new GlueEditBoxFrame(args.context, { ...GlueEditBoxFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner, args.inherits);
    }
}

export interface SlashChatBoxFrameConfiguration extends EditBoxFrameConfigurationBase {}

/**
 * @see Tasyen's SLASHCHATBOX reference: https://github.com/Tasyen/FDF/blob/master/FrameTypes/SLASHCHATBOX.html
 */
export class SlashChatBoxFrame extends TextInputFrame<SlashChatBoxFrameConfiguration> {
    protected readonly nativeFrameType = FrameType.SlashChatBox;

    private constructor(...args: ConstructorParameters<typeof MonoFrame<SlashChatBoxFrameConfiguration>>) {
        super(...args);
        this.render();
    }

    public static get DefaultConfiguration(): SlashChatBoxFrameConfiguration {
        return { initialText: "" };
    }

    public static CreateNamed(args: NamedNativeFrameArguments<SlashChatBoxFrameConfiguration>): SlashChatBoxFrame {
        return new SlashChatBoxFrame(args.context, { ...SlashChatBoxFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner, undefined, args.priority);
    }

    public static CreateType(args: TypedNativeFrameArguments<SlashChatBoxFrameConfiguration>): SlashChatBoxFrame {
        return new SlashChatBoxFrame(args.context, { ...SlashChatBoxFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner, args.inherits);
    }
}
