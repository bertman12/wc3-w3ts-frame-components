import { Frame, Trigger } from "w3ts";
import { FrameTemplate, IMonoFrameConfigurationBase, InheritsOf } from "../../models";
import { FrameType } from "../../names";
import { MonoFrame, NamedNativeFrameArguments, TypedNativeFrameArguments } from "../Core/MonoFrame";

export interface ScrollBarFrameConfiguration extends IMonoFrameConfigurationBase<FrameTemplate<"SCROLLBAR">> {
    /** The frame definition CreateType inherits from. Overridden by the CreateType inherits argument; ignored by CreateNamed. Default value: "QuestMainListScrollBar" */
    inherits?: InheritsOf<FrameTemplate<"SCROLLBAR">>;
    /** Height of the scroll bar. Default value: 0.12 */
    height?: number;
    /** Value the scroll bar is set to when it is created. Default value: 50 */
    initialValue?: number;
    /** Maximum value of the scroll bar. Default value: 100 */
    maxValue?: number;
    /** Minimum value of the scroll bar. Default value: 0 */
    minValue?: number;
    /** Handler called with the new value when the scroll bar value changes. Default value: undefined */
    onValueChanged?: (value: number) => void;
    /** Amount the value changes per step. Default value: 1 */
    stepSize?: number;
    /** Width of the scroll bar. Default value: 0.02 */
    width?: number;
}

type ScrollBarFrameDefaultConfiguration = Required<Pick<ScrollBarFrameConfiguration, "inherits" | "height" | "initialValue" | "maxValue" | "minValue" | "stepSize" | "width">> & Pick<ScrollBarFrameConfiguration, "onValueChanged">;

/**
 * Thumb and inc/dec buttons are FDF-bound children. The default inherits, "QuestMainListScrollBar", is a loaded template that supplies them, so no FDF is needed; created with inherits "" it has no art.
 * @see Tasyen's SCROLLBAR reference: https://github.com/Tasyen/FDF/blob/master/FrameTypes/SCROLLBAR.html
 */
export class ScrollBarFrame extends MonoFrame<ScrollBarFrameConfiguration> {
    public onValueChangedTrigger?: Trigger;

    public readonly nativeFrameType = FrameType.ScrollBar;

    private constructor(...args: ConstructorParameters<typeof MonoFrame<ScrollBarFrameConfiguration>>) {
        super(...args);
        this.render();
    }

    public static get DefaultConfiguration(): ScrollBarFrameDefaultConfiguration {
        return { inherits: "QuestMainListScrollBar", height: 0.12, initialValue: 50, maxValue: 100, minValue: 0, onValueChanged: undefined, stepSize: 1, width: 0.02 };
    }

    public static CreateNamed(args: NamedNativeFrameArguments<ScrollBarFrameConfiguration>): ScrollBarFrame {
        return new ScrollBarFrame(args.context, { ...ScrollBarFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner, undefined, args.priority);
    }

    public static CreateType(args: TypedNativeFrameArguments<ScrollBarFrameConfiguration, FrameTemplate<"SCROLLBAR">>): ScrollBarFrame {
        return new ScrollBarFrame(args.context, { ...ScrollBarFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner, args.inherits ?? args.overrides?.inherits ?? ScrollBarFrame.DefaultConfiguration.inherits);
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

        frame.setMinMaxValue(this.configuration.minValue ?? ScrollBarFrame.DefaultConfiguration.minValue, this.configuration.maxValue ?? ScrollBarFrame.DefaultConfiguration.maxValue);
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
