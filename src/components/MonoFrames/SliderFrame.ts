import { Frame, Trigger } from "w3ts";
import { IMonoFrameConfigurationBase } from "../../models";
import { FrameType } from "../../names";
import { MonoFrame, NamedNativeFrameArguments, TypedNativeFrameArguments } from "../Core/MonoFrame";

export interface SliderFrameConfiguration extends IMonoFrameConfigurationBase {
    initialValue?: number;
    maxValue?: number;
    minValue?: number;
    onValueChanged?: (value: number) => void;
    stepSize?: number;
}

/**
 * @see Tasyen's SLIDER reference: https://github.com/Tasyen/FDF/blob/master/FrameTypes/SLIDER.html
 * @requiresFdf Thumb and inc/dec buttons (SliderThumbButtonFrame, ScrollBarDecButtonFrame, ScrollBarIncButtonFrame) are FDF-bound; a bare typed slider has no art.
 */
export class SliderFrame extends MonoFrame<SliderFrameConfiguration> {
    public onValueChangedTrigger?: Trigger;

    protected readonly nativeFrameType = FrameType.Slider;

    private constructor(...args: ConstructorParameters<typeof MonoFrame<SliderFrameConfiguration>>) {
        super(...args);
        this.render();
    }

    public static get DefaultConfiguration(): SliderFrameConfiguration {
        return { initialValue: 50, maxValue: 100, minValue: 0, stepSize: 1, width: 0.18, height: 0.02 };
    }

    /** @requiresFdf Needs a loaded FDF template for its FDF-defined children or art to render. */
    public static CreateNamed(args: NamedNativeFrameArguments<SliderFrameConfiguration>): SliderFrame {
        return new SliderFrame(args.context, { ...SliderFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner, undefined, args.priority);
    }

    /** @requiresFdf Needs a loaded FDF template for its FDF-defined children or art to render. */
    public static CreateType(args: TypedNativeFrameArguments<SliderFrameConfiguration>): SliderFrame {
        return new SliderFrame(args.context, { ...SliderFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner, args.inherits);
    }

    public setOnValueChanged(onValueChanged: (value: number) => void): void {
        this.onValueChangedTrigger = this.onFrameEvent(FRAMEEVENT_SLIDER_VALUE_CHANGED, () => onValueChanged(Frame.getEventValue()));
    }

    public updateValue(value: number): void {
        this.frame?.setValue(value);
    }

    protected render(): void {
        const frame = this.createNativeFrame();
        if (!frame) {
            return;
        }

        frame.setMinMaxValue(this.configuration.minValue ?? 0, this.configuration.maxValue ?? 100);
        if (this.configuration.stepSize !== undefined) {
            frame.setStepSize(this.configuration.stepSize);
        }
        if (this.configuration.initialValue !== undefined) {
            frame.setValue(this.configuration.initialValue);
        }
        if (this.configuration.onValueChanged) {
            this.setOnValueChanged(this.configuration.onValueChanged);
        }
    }
}
