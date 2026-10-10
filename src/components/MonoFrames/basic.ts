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

export interface HighlightFrameConfiguration extends IMonoFrameConfigurationBase {}

/**
 * @see Tasyen's HIGHLIGHT reference: https://github.com/Tasyen/FDF/blob/master/FrameTypes/HIGHLIGHT.html
 * @requiresFdf Its texture and mode (HighlightAlphaFile, HighlightType) are FDF-defined and cannot be changed at runtime.
 */
export class HighlightFrame extends MonoFrame<HighlightFrameConfiguration> {
    protected readonly nativeFrameType = FrameType.Highlight;

    private constructor(...args: ConstructorParameters<typeof MonoFrame<HighlightFrameConfiguration>>) {
        super(...args);
        this.render();
    }

    public static get DefaultConfiguration(): HighlightFrameConfiguration {
        return { width: 0.12, height: 0.08 };
    }

    /** @requiresFdf Needs a loaded FDF template for its FDF-defined children or art to render. */
    public static CreateNamed(args: NamedNativeFrameArguments<HighlightFrameConfiguration>): HighlightFrame {
        return new HighlightFrame(args.context, { ...HighlightFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner, undefined, args.priority);
    }

    /** @requiresFdf Needs a loaded FDF template for its FDF-defined children or art to render. */
    public static CreateType(args: TypedNativeFrameArguments<HighlightFrameConfiguration>): HighlightFrame {
        return new HighlightFrame(args.context, { ...HighlightFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner, args.inherits);
    }

    protected render(): void {
        this.createNativeFrame();
    }
}

export interface ListBoxFrameConfiguration extends IMonoFrameConfigurationBase {}

/**
 * @see Tasyen's LISTBOX reference: https://github.com/Tasyen/FDF/blob/master/FrameTypes/LISTBOX.html
 * @requiresFdf Items and scrollbar are FDF-bound children; a bare typed frame cannot render a complete list box.
 */
export class ListBoxFrame extends MonoFrame<ListBoxFrameConfiguration> {
    protected readonly nativeFrameType = FrameType.ListBox;

    private constructor(...args: ConstructorParameters<typeof MonoFrame<ListBoxFrameConfiguration>>) {
        super(...args);
        this.render();
    }

    public static get DefaultConfiguration(): ListBoxFrameConfiguration {
        return { width: 0.15, height: 0.1 };
    }

    /** @requiresFdf Needs a loaded FDF template for its child frames to render completely. */
    public static CreateNamed(args: NamedNativeFrameArguments<ListBoxFrameConfiguration>): ListBoxFrame {
        return new ListBoxFrame(args.context, { ...ListBoxFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner, undefined, args.priority);
    }

    /** @requiresFdf Needs a loaded FDF template for its child frames to render completely. */
    public static CreateType(args: TypedNativeFrameArguments<ListBoxFrameConfiguration>): ListBoxFrame {
        return new ListBoxFrame(args.context, { ...ListBoxFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner, args.inherits);
    }

    protected render(): void {
        this.createNativeFrame();
    }
}

export interface MenuFrameConfiguration extends IMonoFrameConfigurationBase {}

/**
 * @see Tasyen's MENU reference: https://github.com/Tasyen/FDF/blob/master/FrameTypes/MENU.html
 * @requiresFdf Menu choices are FDF-bound children; a bare typed frame cannot render a complete menu.
 */
export class MenuFrame extends MonoFrame<MenuFrameConfiguration> {
    protected readonly nativeFrameType = FrameType.Menu;

    private constructor(...args: ConstructorParameters<typeof MonoFrame<MenuFrameConfiguration>>) {
        super(...args);
        this.render();
    }

    public static get DefaultConfiguration(): MenuFrameConfiguration {
        return { width: 0.15, height: 0.1 };
    }

    /** @requiresFdf Needs a loaded FDF template for its child frames to render completely. */
    public static CreateNamed(args: NamedNativeFrameArguments<MenuFrameConfiguration>): MenuFrame {
        return new MenuFrame(args.context, { ...MenuFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner, undefined, args.priority);
    }

    /** @requiresFdf Needs a loaded FDF template for its child frames to render completely. */
    public static CreateType(args: TypedNativeFrameArguments<MenuFrameConfiguration>): MenuFrame {
        return new MenuFrame(args.context, { ...MenuFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner, args.inherits);
    }

    protected render(): void {
        this.createNativeFrame();
    }
}
