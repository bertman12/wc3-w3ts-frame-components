import { IMonoFrameConfigurationBase } from "../../models";
import { FrameType } from "../../names";
import { MonoFrame, NamedNativeFrameArguments, TypedNativeFrameArguments } from "../Core/MonoFrame";

export interface TimerTextFrameConfiguration extends IMonoFrameConfigurationBase {
    initialText?: string;
}

/**
 * @see Tasyen's TIMERTEXT reference: https://github.com/Tasyen/FDF/blob/master/FrameTypes/TIMERTEXT.html
 */
export class TimerTextFrame extends MonoFrame<TimerTextFrameConfiguration> {
    private constructor(...args: ConstructorParameters<typeof MonoFrame<TimerTextFrameConfiguration>>) {
        super(...args);
        this.render();
    }

    public static get DefaultConfiguration(): TimerTextFrameConfiguration {
        return { initialText: "00:00" };
    }

    public static CreateNamed(args: NamedNativeFrameArguments<TimerTextFrameConfiguration>): TimerTextFrame {
        return new TimerTextFrame(args.context, { ...TimerTextFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner, undefined, args.priority);
    }

    public static CreateType(args: TypedNativeFrameArguments<TimerTextFrameConfiguration>): TimerTextFrame {
        return new TimerTextFrame(args.context, { ...TimerTextFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner, args.inherits);
    }

    public updateText(text: string): void {
        this.frame?.setText(text);
    }

    protected render(): void {
        const frame = this.createNativeFrame(FrameType.TimerText, 0.12, 0.03);
        if (frame && this.configuration.initialText !== undefined) {
            frame.setText(this.configuration.initialText);
        }
    }
}
