import { Frame, Trigger } from "w3ts";
import { IMonoFrameConfigurationBase } from "../../models";
import { FrameType } from "../../names";
import { MonoFrame, NamedNativeFrameArguments, TypedNativeFrameArguments } from "../Core/MonoFrame";

interface ValueFrameConfigurationBase extends IMonoFrameConfigurationBase {
    initialValue?: number;
    maxValue?: number;
    minValue?: number;
    onValueChanged?: (value: number) => void;
    stepSize?: number;
}

abstract class ValueFrame<Configuration extends ValueFrameConfigurationBase> extends MonoFrame<Configuration> {
    public onValueChangedTrigger?: Trigger;

    protected defaultHeight = 0.02;
    protected defaultWidth = 0.18;
    protected abstract readonly nativeFrameType: FrameType;

    protected render(): void {
        const frame = this.createNativeFrame(this.nativeFrameType, this.defaultWidth, this.defaultHeight);
        if (!frame) {
            return;
        }

        this.configureValueFrame(frame);
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

    protected configureValueFrame(_frame: Frame): void {    }

    public setOnValueChanged(onValueChanged: (value: number) => void): void {
        this.onValueChangedTrigger = this.createFrameEvent(FRAMEEVENT_SLIDER_VALUE_CHANGED, () => onValueChanged(Frame.getEventValue()));
    }

    public updateValue(value: number): void {
        this.frame?.setValue(value);
    }
}

export interface SliderFrameConfiguration extends ValueFrameConfigurationBase {}

/**
 * @see Tasyen's SLIDER reference: https://github.com/Tasyen/FDF/blob/master/FrameTypes/SLIDER.html
 * @requiresFdf Thumb and inc/dec buttons (SliderThumbButtonFrame, ScrollBarDecButtonFrame, ScrollBarIncButtonFrame) are FDF-bound; a bare typed slider has no art.
 */
export class SliderFrame extends ValueFrame<SliderFrameConfiguration> {
    protected readonly nativeFrameType = FrameType.Slider;

    private constructor(...args: ConstructorParameters<typeof MonoFrame<SliderFrameConfiguration>>) {
        super(...args);
        this.render();
    }

    public static get DefaultConfiguration(): SliderFrameConfiguration {
        return { initialValue: 50, maxValue: 100, minValue: 0, stepSize: 1 };
    }

    /** @requiresFdf Needs a loaded FDF template for its FDF-defined children or art to render. */
    public static CreateNamed(args: NamedNativeFrameArguments<SliderFrameConfiguration>): SliderFrame {
        return new SliderFrame(args.context, { ...SliderFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner, undefined, args.priority);
    }

    /** @requiresFdf Needs a loaded FDF template for its FDF-defined children or art to render. */
    public static CreateType(args: TypedNativeFrameArguments<SliderFrameConfiguration>): SliderFrame {
        return new SliderFrame(args.context, { ...SliderFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner, args.inherits);
    }
}

export interface ScrollBarFrameConfiguration extends ValueFrameConfigurationBase {}

/**
 * @see Tasyen's SCROLLBAR reference: https://github.com/Tasyen/FDF/blob/master/FrameTypes/SCROLLBAR.html
 * @requiresFdf Thumb and inc/dec buttons are FDF-bound children; a bare typed scrollbar has no art.
 */
export class ScrollBarFrame extends ValueFrame<ScrollBarFrameConfiguration> {
    protected readonly nativeFrameType = FrameType.ScrollBar;
    protected defaultHeight = 0.12;
    protected defaultWidth = 0.02;

    private constructor(...args: ConstructorParameters<typeof MonoFrame<ScrollBarFrameConfiguration>>) {
        super(...args);
        this.render();
    }

    public static get DefaultConfiguration(): ScrollBarFrameConfiguration {
        return { initialValue: 50, maxValue: 100, minValue: 0, stepSize: 1 };
    }

    /** @requiresFdf Needs a loaded FDF template for its FDF-defined children or art to render. */
    public static CreateNamed(args: NamedNativeFrameArguments<ScrollBarFrameConfiguration>): ScrollBarFrame {
        return new ScrollBarFrame(args.context, { ...ScrollBarFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner, undefined, args.priority);
    }

    /** @requiresFdf Needs a loaded FDF template for its FDF-defined children or art to render. */
    public static CreateType(args: TypedNativeFrameArguments<ScrollBarFrameConfiguration>): ScrollBarFrame {
        return new ScrollBarFrame(args.context, { ...ScrollBarFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner, args.inherits);
    }
}
