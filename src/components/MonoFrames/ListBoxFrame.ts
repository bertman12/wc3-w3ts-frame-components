import { IMonoFrameConfigurationBase, FrameTemplate } from "../../models";
import { FrameType } from "../../names";
import { MonoFrame, NamedNativeFrameArguments, TypedNativeFrameArguments } from "../Core/MonoFrame";

export interface ListBoxFrameConfiguration extends IMonoFrameConfigurationBase<FrameTemplate<"LISTBOX">> {
    /** Height of the list box. Default value: 0.1 */
    height?: number;
    /** Width of the list box. Default value: 0.15 */
    width?: number;
}

/**
 * @see Tasyen's LISTBOX reference: https://github.com/Tasyen/FDF/blob/master/FrameTypes/LISTBOX.html
 * @requiresFdf Items and scrollbar are FDF-bound children; a bare typed frame cannot render a complete list box.
 */
export class ListBoxFrame extends MonoFrame<ListBoxFrameConfiguration> {
    public readonly nativeFrameType = FrameType.ListBox;

    private constructor(...args: ConstructorParameters<typeof MonoFrame<ListBoxFrameConfiguration>>) {
        super(...args);
        this.render();
    }

    public static get DefaultConfiguration(): ListBoxFrameConfiguration {
        return { height: 0.1, width: 0.15 };
    }

    /** @requiresFdf Needs a loaded FDF template for its child frames to render completely. */
    public static CreateNamed(args: NamedNativeFrameArguments<ListBoxFrameConfiguration>): ListBoxFrame {
        return new ListBoxFrame(args.context, { ...ListBoxFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner, undefined, args.priority);
    }

    /** @requiresFdf Needs a loaded FDF template for its child frames to render completely. */
    public static CreateType(args: TypedNativeFrameArguments<ListBoxFrameConfiguration, FrameTemplate<"LISTBOX">>): ListBoxFrame {
        return new ListBoxFrame(args.context, { ...ListBoxFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner, args.inherits ?? args.overrides?.inherits ?? "");
    }

    protected render(): void {
        this.createNativeFrame();
    }
}
