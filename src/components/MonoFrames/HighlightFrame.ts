import { FrameTemplate, IMonoFrameConfigurationBase, InheritsOf } from "../../models";
import { FrameType } from "../../names";
import { MonoFrame, NamedNativeFrameArguments, TypedNativeFrameArguments } from "../Core/MonoFrame";

export interface HighlightFrameConfiguration extends IMonoFrameConfigurationBase<FrameTemplate<"HIGHLIGHT">> {
    /** The frame definition CreateType inherits from. Overridden by the CreateType inherits argument; ignored by CreateNamed. Default value: "QuestButtonMouseOverHighlightTemplate" */
    inherits?: InheritsOf<FrameTemplate<"HIGHLIGHT">>;
    /** Height of the highlight. Default value: 0.08 */
    height?: number;
    /** Width of the highlight. Default value: 0.12 */
    width?: number;
}

/**
 * Its texture and mode (HighlightAlphaFile, HighlightType) are FDF-defined and cannot be changed at runtime. The default inherits, "QuestButtonMouseOverHighlightTemplate", is a loaded template that supplies them, so no FDF is needed.
 * @see Tasyen's HIGHLIGHT reference: https://github.com/Tasyen/FDF/blob/master/FrameTypes/HIGHLIGHT.html
 */
export class HighlightFrame extends MonoFrame<HighlightFrameConfiguration> {
    public readonly nativeFrameType = FrameType.Highlight;

    private constructor(...args: ConstructorParameters<typeof MonoFrame<HighlightFrameConfiguration>>) {
        super(...args);
        this.render();
    }

    public static get DefaultConfiguration(): HighlightFrameConfiguration & Required<Pick<HighlightFrameConfiguration, "inherits">> {
        return { inherits: "QuestButtonMouseOverHighlightTemplate", height: 0.08, width: 0.12 };
    }

    public static CreateNamed(args: NamedNativeFrameArguments<HighlightFrameConfiguration>): HighlightFrame {
        return new HighlightFrame(args.context, { ...HighlightFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner, undefined, args.priority);
    }

    public static CreateType(args: TypedNativeFrameArguments<HighlightFrameConfiguration, FrameTemplate<"HIGHLIGHT">>): HighlightFrame {
        return new HighlightFrame(args.context, { ...HighlightFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner, args.inherits ?? args.overrides?.inherits ?? HighlightFrame.DefaultConfiguration.inherits);
    }

    protected render(): void {
        this.createNativeFrame();
    }
}
