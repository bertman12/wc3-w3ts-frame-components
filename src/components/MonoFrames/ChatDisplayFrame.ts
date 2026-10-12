import { IMonoFrameConfigurationBase, FrameTemplate } from "../../models";
import { FrameType } from "../../names";
import { MonoFrame, NamedNativeFrameArguments, TypedNativeFrameArguments } from "../Core/MonoFrame";

export interface ChatDisplayFrameConfiguration extends IMonoFrameConfigurationBase {
    /** Height of the chat display. Default value: 0.1 */
    height?: number;
    /** Messages added to the chat display when it is created. Default value: [] */
    initialMessages?: string[];
    /** Width of the chat display. Default value: 0.2 */
    width?: number;
}

/**
 * @see Tasyen's CHATDISPLAY reference: https://github.com/Tasyen/FDF/blob/master/FrameTypes/CHATDISPLAY.html
 * @requiresFdf Its edit box and scrollbar (ChatDisplayEditBox, ChatDisplayScrollBar) are FDF-bound; a bare typed frame is not a composed chat UI.
 * @deprecated Development deferred. Do not use; this class is still under development.
 */
export class ChatDisplayFrame extends MonoFrame<ChatDisplayFrameConfiguration> {
    public readonly nativeFrameType = FrameType.ChatDisplay;

    private constructor(...args: ConstructorParameters<typeof MonoFrame<ChatDisplayFrameConfiguration>>) {
        super(...args);
        this.render();
    }

    public static get DefaultConfiguration(): ChatDisplayFrameConfiguration {
        return { height: 0.1, initialMessages: [], width: 0.2 };
    }

    /** @requiresFdf Needs a loaded FDF template for its FDF-defined children or art to render. */
    public static CreateNamed(args: NamedNativeFrameArguments<ChatDisplayFrameConfiguration>): ChatDisplayFrame {
        return new ChatDisplayFrame(args.context, { ...ChatDisplayFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner, undefined, args.priority);
    }

    /** @requiresFdf Needs a loaded FDF template for its FDF-defined children or art to render. */
    public static CreateType(args: TypedNativeFrameArguments<ChatDisplayFrameConfiguration, FrameTemplate<"CHATDISPLAY">>): ChatDisplayFrame {
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
