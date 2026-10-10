import { Trigger } from "w3ts";
import { IMonoFrameConfigurationBase } from "../../models";
import { FrameType } from "../../names";
import { MonoFrame, NamedNativeFrameArguments, TypedNativeFrameArguments } from "../Core/MonoFrame";

export interface EditBoxFrameConfiguration extends IMonoFrameConfigurationBase {
    /** Height of the edit box. Default value: 0.04 */
    height?: number;
    /** Text shown in the edit box when it is created. Default value: "" */
    initialText?: string;
    /** Handler called with the current text when Enter is pressed. Default value: undefined */
    onEnter?: (text: string) => void;
    /** Handler called with the current text whenever it changes. Default value: undefined */
    onTextChanged?: (text: string) => void;
    /** Width of the edit box. Default value: 0.2 */
    width?: number;
}

/**
 * @see Tasyen's EDITBOX reference: https://github.com/Tasyen/FDF/blob/master/FrameTypes/EDITBOX.html
 */
export class EditBoxFrame extends MonoFrame<EditBoxFrameConfiguration> {
    public onEnterTrigger?: Trigger;
    public onTextChangedTrigger?: Trigger;

    public readonly nativeFrameType = FrameType.EditBox;

    private constructor(...args: ConstructorParameters<typeof MonoFrame<EditBoxFrameConfiguration>>) {
        super(...args);
        this.render();
    }

    public static get DefaultConfiguration(): EditBoxFrameConfiguration {
        return { height: 0.04, initialText: "", onEnter: undefined, onTextChanged: undefined, width: 0.2 };
    }

    public static CreateNamed(args: NamedNativeFrameArguments<EditBoxFrameConfiguration>): EditBoxFrame {
        return new EditBoxFrame(args.context, { ...EditBoxFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner, undefined, args.priority);
    }

    public static CreateType(args: TypedNativeFrameArguments<EditBoxFrameConfiguration>): EditBoxFrame {
        return new EditBoxFrame(args.context, { ...EditBoxFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner, args.inherits);
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
