import { Frame } from "w3ts";
import { IMonoFrameConfigurationBase } from "../../models";
import { FrameType } from "../../names";
import { MonoFrame, NamedNativeFrameArguments, TypedNativeFrameArguments } from "../Core/MonoFrame";

interface BasicFrameConfiguration extends IMonoFrameConfigurationBase {}

abstract class BasicFrame<Configuration extends BasicFrameConfiguration> extends MonoFrame<Configuration> {
    protected abstract readonly nativeFrameType: FrameType;
    protected defaultHeight = 0.04;
    protected defaultWidth = 0.1;

    protected render(): void {
        this.createNativeFrame(this.nativeFrameType, this.defaultWidth, this.defaultHeight);
    }
}

export interface ChatDisplayFrameConfiguration extends BasicFrameConfiguration {
    initialMessages?: string[];
}

/**
 * @see Tasyen's CHATDISPLAY reference: https://github.com/Tasyen/FDF/blob/master/FrameTypes/CHATDISPLAY.html
 */
export class ChatDisplayFrame extends BasicFrame<ChatDisplayFrameConfiguration> {
    protected readonly nativeFrameType = FrameType.ChatDisplay;
    protected defaultHeight = 0.1;
    protected defaultWidth = 0.2;

    private constructor(...args: ConstructorParameters<typeof MonoFrame<ChatDisplayFrameConfiguration>>) {
        super(...args);
        this.render();
    }

    public static get DefaultConfiguration(): ChatDisplayFrameConfiguration {
        return { initialMessages: [] };
    }

    public static CreateNamed(args: NamedNativeFrameArguments<ChatDisplayFrameConfiguration>): ChatDisplayFrame {
        return new ChatDisplayFrame(args.context, { ...ChatDisplayFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner, undefined, args.priority);
    }

    public static CreateType(args: TypedNativeFrameArguments<ChatDisplayFrameConfiguration>): ChatDisplayFrame {
        return new ChatDisplayFrame(args.context, { ...ChatDisplayFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner, args.inherits);
    }

    public addMessage(message: string): void {
        this.frame?.addText(message);
    }

    protected render(): void {
        const frame = this.createNativeFrame(this.nativeFrameType, this.defaultWidth, this.defaultHeight);
        if (!frame) {
            return;
        }

        this.configuration.initialMessages?.forEach((message) => frame.addText(message));
    }
}

export interface HighlightFrameConfiguration extends BasicFrameConfiguration {}

/**
 * @see Tasyen's HIGHLIGHT reference: https://github.com/Tasyen/FDF/blob/master/FrameTypes/HIGHLIGHT.html
 */
export class HighlightFrame extends BasicFrame<HighlightFrameConfiguration> {
    protected readonly nativeFrameType = FrameType.Highlight;
    protected defaultHeight = 0.08;
    protected defaultWidth = 0.12;

    private constructor(...args: ConstructorParameters<typeof MonoFrame<HighlightFrameConfiguration>>) {
        super(...args);
        this.render();
    }

    public static get DefaultConfiguration(): HighlightFrameConfiguration {
        return {};
    }

    public static CreateNamed(args: NamedNativeFrameArguments<HighlightFrameConfiguration>): HighlightFrame {
        return new HighlightFrame(args.context, { ...HighlightFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner, undefined, args.priority);
    }

    public static CreateType(args: TypedNativeFrameArguments<HighlightFrameConfiguration>): HighlightFrame {
        return new HighlightFrame(args.context, { ...HighlightFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner, args.inherits);
    }
}

export interface ListBoxFrameConfiguration extends BasicFrameConfiguration {}

/**
 * @see Tasyen's LISTBOX reference: https://github.com/Tasyen/FDF/blob/master/FrameTypes/LISTBOX.html
 */
export class ListBoxFrame extends BasicFrame<ListBoxFrameConfiguration> {
    protected readonly nativeFrameType = FrameType.ListBox;
    protected defaultHeight = 0.1;
    protected defaultWidth = 0.15;

    private constructor(...args: ConstructorParameters<typeof MonoFrame<ListBoxFrameConfiguration>>) {
        super(...args);
        this.render();
    }

    public static get DefaultConfiguration(): ListBoxFrameConfiguration {
        return {};
    }

    public static CreateNamed(args: NamedNativeFrameArguments<ListBoxFrameConfiguration>): ListBoxFrame {
        return new ListBoxFrame(args.context, { ...ListBoxFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner, undefined, args.priority);
    }

    public static CreateType(args: TypedNativeFrameArguments<ListBoxFrameConfiguration>): ListBoxFrame {
        return new ListBoxFrame(args.context, { ...ListBoxFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner, args.inherits);
    }
}

export interface MenuFrameConfiguration extends BasicFrameConfiguration {}

/**
 * @see Tasyen's MENU reference: https://github.com/Tasyen/FDF/blob/master/FrameTypes/MENU.html
 */
export class MenuFrame extends BasicFrame<MenuFrameConfiguration> {
    protected readonly nativeFrameType = FrameType.Menu;
    protected defaultHeight = 0.1;
    protected defaultWidth = 0.15;

    private constructor(...args: ConstructorParameters<typeof MonoFrame<MenuFrameConfiguration>>) {
        super(...args);
        this.render();
    }

    public static get DefaultConfiguration(): MenuFrameConfiguration {
        return {};
    }

    public static CreateNamed(args: NamedNativeFrameArguments<MenuFrameConfiguration>): MenuFrame {
        return new MenuFrame(args.context, { ...MenuFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner, undefined, args.priority);
    }

    public static CreateType(args: TypedNativeFrameArguments<MenuFrameConfiguration>): MenuFrame {
        return new MenuFrame(args.context, { ...MenuFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner, args.inherits);
    }
}
