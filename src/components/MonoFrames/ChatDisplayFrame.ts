import { IMonoFrameConfigurationBase } from "../../models";
import { FrameType } from "../../names";
import { MonoFrame, NamedNativeFrameArguments, TypedNativeFrameArguments } from "../Core/MonoFrame";

export interface ChatDisplayFrameConfiguration extends IMonoFrameConfigurationBase {
    initialMessages?: string[];
}

/**
 * @see Tasyen's CHATDISPLAY reference: https://github.com/Tasyen/FDF/blob/master/FrameTypes/CHATDISPLAY.html
 * @requiresFdf Its edit box and scrollbar (ChatDisplayEditBox, ChatDisplayScrollBar) are FDF-bound; a bare typed frame is not a composed chat UI.
 */
export class ChatDisplayFrame extends MonoFrame<ChatDisplayFrameConfiguration> {
    protected readonly nativeFrameType = FrameType.ChatDisplay;

    private constructor(...args: ConstructorParameters<typeof MonoFrame<ChatDisplayFrameConfiguration>>) {
        super(...args);
        this.render();
    }

    public static get DefaultConfiguration(): ChatDisplayFrameConfiguration {
        return { initialMessages: [], width: 0.2, height: 0.1 };
    }

    /** @requiresFdf Needs a loaded FDF template for its FDF-defined children or art to render. */
    public static CreateNamed(args: NamedNativeFrameArguments<ChatDisplayFrameConfiguration>): ChatDisplayFrame {
        return new ChatDisplayFrame(args.context, { ...ChatDisplayFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner, undefined, args.priority);
    }

    /** @requiresFdf Needs a loaded FDF template for its FDF-defined children or art to render. */
    public static CreateType(args: TypedNativeFrameArguments<ChatDisplayFrameConfiguration>): ChatDisplayFrame {
        return new ChatDisplayFrame(args.context, { ...ChatDisplayFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner, args.inherits);
    }

    public addMessage(message: string): void {
        this.frame?.addText(message);
    }

    protected render(): void {
        const frame = this.createNativeFrame();
        if (!frame) {
            return;
        }

        this.configuration.initialMessages?.forEach((message) => frame.addText(message));
    }
}
