import { Trigger } from "w3ts";
import { IMonoFrameConfigurationBase } from "../../models";
import { FrameType } from "../../names";
import { MonoFrame, NamedNativeFrameArguments, TypedNativeFrameArguments } from "../Core/MonoFrame";

export interface TextButtonFrameConfiguration extends IMonoFrameConfigurationBase {
    initialText?: string;
    onClick?: () => void;
}

/**
 * @see Tasyen's TEXTBUTTON reference: https://github.com/Tasyen/FDF/blob/master/FrameTypes/TEXTBUTTON.html
 * @requiresFdf Its linked text child (ButtonText) is FDF-defined; a bare typed frame has no text child.
 */
export class TextButtonFrame extends MonoFrame<TextButtonFrameConfiguration> {
    public onClickTrigger?: Trigger;

    protected readonly nativeFrameType = FrameType.TextButton;

    private constructor(...args: ConstructorParameters<typeof MonoFrame<TextButtonFrameConfiguration>>) {
        super(...args);
        this.render();
    }

    public static get DefaultConfiguration(): TextButtonFrameConfiguration {
        return { initialText: "Text Button", width: 0.18, height: 0.031 };
    }

    /** @requiresFdf Needs a loaded FDF template for its FDF-defined children or art to render. */
    public static CreateNamed(args: NamedNativeFrameArguments<TextButtonFrameConfiguration>): TextButtonFrame {
        return new TextButtonFrame(args.context, { ...TextButtonFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner, undefined, args.priority);
    }

    /** @requiresFdf Needs a loaded FDF template for its FDF-defined children or art to render. */
    public static CreateType(args: TypedNativeFrameArguments<TextButtonFrameConfiguration>): TextButtonFrame {
        return new TextButtonFrame(args.context, { ...TextButtonFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner, args.inherits);
    }

    public setOnClick(onClick: () => void): void {
        this.onClickTrigger = this.onFrameEvent(FRAMEEVENT_CONTROL_CLICK, onClick);
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
        if (this.configuration.onClick) {
            this.setOnClick(this.configuration.onClick);
        }
    }
}
