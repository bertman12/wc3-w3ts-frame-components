import { Trigger } from "w3ts";
import { IMonoFrameConfigurationBase } from "../../models";
import { FrameType } from "../../names";
import { MonoFrame, NamedNativeFrameArguments, TypedNativeFrameArguments } from "../Core/MonoFrame";

interface ClickableFrameConfigurationBase extends IMonoFrameConfigurationBase {
    onClick?: () => void;
}

abstract class ClickableFrame<Configuration extends ClickableFrameConfigurationBase> extends MonoFrame<Configuration> {
    public onClickTrigger?: Trigger;

    protected abstract readonly nativeFrameType: FrameType;
    protected defaultHeight = 0.04;
    protected defaultWidth = 0.1;

    protected render(): void {
        if (!this.createNativeFrame(this.nativeFrameType, this.defaultWidth, this.defaultHeight)) {
            return;
        }

        if (this.configuration.onClick) {
            this.setOnClick(this.configuration.onClick);
        }
    }

    public setOnClick(onClick: () => void): void {
        this.onClickTrigger = this.onFrameEvent(FRAMEEVENT_CONTROL_CLICK, onClick);
    }
}

export interface GlueButtonFrameConfiguration extends ClickableFrameConfigurationBase {}

/**
 * @see Tasyen's GLUEBUTTON reference: https://github.com/Tasyen/FDF/blob/master/FrameTypes/GLUEBUTTON.html
 */
export class GlueButtonFrame extends ClickableFrame<GlueButtonFrameConfiguration> {
    protected readonly nativeFrameType = FrameType.GlueButton;

    private constructor(...args: ConstructorParameters<typeof MonoFrame<GlueButtonFrameConfiguration>>) {
        super(...args);
        this.render();
    }

    public static get DefaultConfiguration(): GlueButtonFrameConfiguration {
        return {};
    }

    public static CreateNamed(args: NamedNativeFrameArguments<GlueButtonFrameConfiguration>): GlueButtonFrame {
        return new GlueButtonFrame(args.context, { ...GlueButtonFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner, undefined, args.priority);
    }

    public static CreateType(args: TypedNativeFrameArguments<GlueButtonFrameConfiguration>): GlueButtonFrame {
        return new GlueButtonFrame(args.context, { ...GlueButtonFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner, args.inherits);
    }
}

export interface TextButtonFrameConfiguration extends ClickableFrameConfigurationBase {
    initialText?: string;
}

/**
 * @see Tasyen's TEXTBUTTON reference: https://github.com/Tasyen/FDF/blob/master/FrameTypes/TEXTBUTTON.html
 * @requiresFdf Its linked text child (ButtonText) is FDF-defined; a bare typed frame has no text child.
 */
export class TextButtonFrame extends ClickableFrame<TextButtonFrameConfiguration> {
    protected readonly nativeFrameType = FrameType.TextButton;
    protected defaultHeight = 0.031;
    protected defaultWidth = 0.18;

    private constructor(...args: ConstructorParameters<typeof MonoFrame<TextButtonFrameConfiguration>>) {
        super(...args);
        this.render();
    }

    public static get DefaultConfiguration(): TextButtonFrameConfiguration {
        return { initialText: "Text Button" };
    }

    /** @requiresFdf Needs a loaded FDF template for its FDF-defined children or art to render. */
    public static CreateNamed(args: NamedNativeFrameArguments<TextButtonFrameConfiguration>): TextButtonFrame {
        return new TextButtonFrame(args.context, { ...TextButtonFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner, undefined, args.priority);
    }

    /** @requiresFdf Needs a loaded FDF template for its FDF-defined children or art to render. */
    public static CreateType(args: TypedNativeFrameArguments<TextButtonFrameConfiguration>): TextButtonFrame {
        return new TextButtonFrame(args.context, { ...TextButtonFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner, args.inherits);
    }

    public updateText(text: string): void {
        this.frame?.setText(text);
    }

    protected render(): void {
        const frame = this.createNativeFrame(this.nativeFrameType, this.defaultWidth, this.defaultHeight);
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
