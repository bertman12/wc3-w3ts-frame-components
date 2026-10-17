import { Trigger } from "w3ts";
import { FrameTemplate, IMonoFrameConfigurationBase, InheritsOf } from "../../models";
import { FrameType } from "../../names";
import { MonoFrame, NamedNativeFrameArguments, TypedNativeFrameArguments } from "../Core/MonoFrame";

export interface TextButtonFrameConfiguration extends IMonoFrameConfigurationBase<FrameTemplate<"TEXTBUTTON">> {
    /** The frame definition CreateType inherits from. Overridden by the CreateType inherits argument; ignored by CreateNamed. Default value: "LadderButtonTemplate" */
    inherits?: InheritsOf<FrameTemplate<"TEXTBUTTON">>;
    /** Height of the button. Default value: 0.031 */
    height?: number;
    /** Text shown on the button when it is created. Default value: "Text Button" */
    initialText?: string;
    /** Handler called when the button is clicked. Default value: undefined */
    onClick?: () => void;
    /** Width of the button. Default value: 0.18 */
    width?: number;
}

/**
 * Its linked text child (ButtonText) is FDF-defined. The default inherits, "LadderButtonTemplate", is a loaded template that supplies it, so no FDF is needed; created with inherits "" it has no text child.
 * @see Tasyen's TEXTBUTTON reference: https://github.com/Tasyen/FDF/blob/master/FrameTypes/TEXTBUTTON.html
 */
export class TextButtonFrame extends MonoFrame<TextButtonFrameConfiguration> {
    public onClickTrigger?: Trigger;

    public readonly nativeFrameType = FrameType.TextButton;

    private constructor(...args: ConstructorParameters<typeof MonoFrame<TextButtonFrameConfiguration>>) {
        super(...args);
        this.render();
    }

    public static get DefaultConfiguration(): TextButtonFrameConfiguration & Required<Pick<TextButtonFrameConfiguration, "inherits">> {
        return { inherits: "LadderButtonTemplate", height: 0.031, initialText: "Text Button", onClick: undefined, width: 0.18 };
    }

    public static CreateNamed(args: NamedNativeFrameArguments<TextButtonFrameConfiguration>): TextButtonFrame {
        return new TextButtonFrame(args.context, { ...TextButtonFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner, undefined, args.priority);
    }

    public static CreateType(args: TypedNativeFrameArguments<TextButtonFrameConfiguration, FrameTemplate<"TEXTBUTTON">>): TextButtonFrame {
        return new TextButtonFrame(args.context, { ...TextButtonFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner, args.inherits ?? args.overrides?.inherits ?? TextButtonFrame.DefaultConfiguration.inherits);
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
