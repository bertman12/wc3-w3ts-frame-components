import { IMonoFrameConfigurationBase, FrameTemplate } from "../../models";
import { FrameType } from "../../names";
import { MonoFrame, NamedNativeFrameArguments, TypedNativeFrameArguments } from "../Core/MonoFrame";

export interface HighlightFrameConfiguration extends IMonoFrameConfigurationBase<FrameTemplate<"HIGHLIGHT">> {
    /** Height of the highlight. Default value: 0.08 */
    height?: number;
    /** Width of the highlight. Default value: 0.12 */
    width?: number;
}

/**
 * @see Tasyen's HIGHLIGHT reference: https://github.com/Tasyen/FDF/blob/master/FrameTypes/HIGHLIGHT.html
 * @requiresFdf Its texture and mode (HighlightAlphaFile, HighlightType) are FDF-defined and cannot be changed at runtime.
 * @deprecated Development deferred. Do not use; this class is still under development.
 */
export class HighlightFrame extends MonoFrame<HighlightFrameConfiguration> {
    public readonly nativeFrameType = FrameType.Highlight;

    private constructor(...args: ConstructorParameters<typeof MonoFrame<HighlightFrameConfiguration>>) {
        super(...args);
        this.render();
    }

    public static get DefaultConfiguration(): HighlightFrameConfiguration {
        return { height: 0.08, width: 0.12 };
    }

    /** @requiresFdf Needs a loaded FDF template for its FDF-defined children or art to render. */
    public static CreateNamed(args: NamedNativeFrameArguments<HighlightFrameConfiguration>): HighlightFrame {
        return new HighlightFrame(args.context, { ...HighlightFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner, undefined, args.priority);
    }

    /** @requiresFdf Needs a loaded FDF template for its FDF-defined children or art to render. */
    public static CreateType(args: TypedNativeFrameArguments<HighlightFrameConfiguration, FrameTemplate<"HIGHLIGHT">>): HighlightFrame {
        return new HighlightFrame(args.context, { ...HighlightFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner, args.inherits ?? args.overrides?.inherits ?? "");
    }

    protected render(): void {
        this.createNativeFrame();
    }
}
