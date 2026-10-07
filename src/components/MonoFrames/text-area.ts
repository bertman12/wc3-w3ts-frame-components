import { Frame, Trigger } from "w3ts";
import { MonoFrame } from "../Core/MonoFrame";
import { IMonoFrameConfigurationBase } from "../../models";
import { FrameType } from "../../names";

export interface TextAreaFrameConfiguration extends IMonoFrameConfigurationBase {
    initialText?: string;
    onMouseEnter?: () => void;
}

export class TextAreaFrame extends MonoFrame<TextAreaFrameConfiguration> {
    public frame?: Frame;
    public onMouseEnterTrigger?: Trigger;

    private constructor(...args: ConstructorParameters<typeof MonoFrame<TextAreaFrameConfiguration>>) {
        super(...args);
        this.render();
    }

    public static get DefaultConfiguration(): TextAreaFrameConfiguration {
        return { initialText: "Sample Text", onMouseEnter: () => {} };
    }

    public static CreateNamed(args: { context: number; name: string; priority?: number; owner?: Frame; overrides?: TextAreaFrameConfiguration }): TextAreaFrame {
        return new TextAreaFrame(args.context, { ...TextAreaFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner, undefined, args.priority);
    }

    public static CreateType(args: { context: number; inherits: string; name?: string; owner?: Frame; overrides?: TextAreaFrameConfiguration }): TextAreaFrame {
        return new TextAreaFrame(args.context, { ...TextAreaFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner, args.inherits);
    }

    protected render(): void {
        this.frame = this.inherits !== undefined ? Frame.createType(this.name, this.owner, this.context, FrameType.TextArea, this.inherits) : Frame.create(this.name, this.owner, this.priority ?? 0, this.context);
        if (!this.frame) {
            return;
        }

        this.frame.setSize(0.1, 0.1);
        this.frame.clearPoints();
        this.frame.setAbsPoint(FRAMEPOINT_CENTER, 0.4, 0.3);

        if (this.configuration.initialText) {
            this.frame.setText(this.configuration.initialText);
        }
        if (this.configuration.onMouseEnter) {
            this.setOnMouseEnter(this.configuration.onMouseEnter);
        }
    }

    public setOnMouseEnter(onMouseEnter: () => void): void {
        if (!this.frame) {
            return;
        }
        this.onMouseEnterTrigger?.destroy();
        this.onMouseEnterTrigger = Trigger.create();
        this.onMouseEnterTrigger.triggerRegisterFrameEvent(this.frame, FRAMEEVENT_MOUSE_ENTER);
        this.onMouseEnterTrigger.addAction(() => {
            this.frame?.setEnabled(false);
            this.frame?.setEnabled(true);
            onMouseEnter();
        });
    }
}
