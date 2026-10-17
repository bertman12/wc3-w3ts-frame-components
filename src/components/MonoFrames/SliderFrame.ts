import { Frame, Trigger } from "w3ts";
import { IMonoFrameConfigurationBase, FrameTemplate } from "../../models";
import { FrameType } from "../../names";
import { MonoFrame, NamedNativeFrameArguments, TypedNativeFrameArguments } from "../Core/MonoFrame";

export interface SliderFrameConfiguration extends IMonoFrameConfigurationBase<FrameTemplate<"SLIDER">> {
    /** Height of the slider. Default value: 0.02 */
    height?: number;
    /** Value the slider is set to when it is created. Default value: 50 */
    initialValue?: number;
    /** Maximum value of the slider. Default value: 100 */
    maxValue?: number;
    /** Minimum value of the slider. Default value: 0 */
    minValue?: number;
    /** Handler called with the new value when the slider value changes. Default value: undefined */
    onValueChanged?: (value: number) => void;
    /** Amount the value changes per step. Default value: 1 */
    stepSize?: number;
    /** Width of the slider. Default value: 0.18 */
    width?: number;
}

type SliderFrameDefaultConfiguration = Required<Pick<SliderFrameConfiguration, "height" | "initialValue" | "maxValue" | "minValue" | "stepSize" | "width">> & Pick<SliderFrameConfiguration, "onValueChanged">;

/**
 * @see Tasyen's SLIDER reference: https://github.com/Tasyen/FDF/blob/master/FrameTypes/SLIDER.html
 * @requiresFdf Thumb and inc/dec buttons (SliderThumbButtonFrame, ScrollBarDecButtonFrame, ScrollBarIncButtonFrame) are FDF-bound; a bare typed slider has no art.
 */
export class SliderFrame extends MonoFrame<SliderFrameConfiguration> {
    public onValueChangedTrigger?: Trigger;

    public readonly nativeFrameType = FrameType.Slider;

    private constructor(...args: ConstructorParameters<typeof MonoFrame<SliderFrameConfiguration>>) {
        super(...args);
        this.render();
    }

    public static get DefaultConfiguration(): SliderFrameDefaultConfiguration {
        return { height: 0.02, initialValue: 50, maxValue: 100, minValue: 0, onValueChanged: undefined, stepSize: 1, width: 0.18 };
    }

    /** @requiresFdf Needs a loaded FDF template for its FDF-defined children or art to render. */
    public static CreateNamed(args: NamedNativeFrameArguments<SliderFrameConfiguration>): SliderFrame {
        return new SliderFrame(args.context, { ...SliderFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner, undefined, args.priority);
    }

    /** @requiresFdf Needs a loaded FDF template for its FDF-defined children or art to render. */
    public static CreateType(args: TypedNativeFrameArguments<SliderFrameConfiguration, FrameTemplate<"SLIDER">>): SliderFrame {
        return new SliderFrame(args.context, { ...SliderFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner, args.inherits ?? args.overrides?.inherits ?? "");
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

        frame.setMinMaxValue(this.configuration.minValue ?? SliderFrame.DefaultConfiguration.minValue, this.configuration.maxValue ?? SliderFrame.DefaultConfiguration.maxValue);
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
