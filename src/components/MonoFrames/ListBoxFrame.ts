import { IMonoFrameConfigurationBase } from "../../models";
import { FrameType } from "../../names";
import { MonoFrame, NamedNativeFrameArguments, TypedNativeFrameArguments } from "../Core/MonoFrame";

export interface ListBoxFrameConfiguration extends IMonoFrameConfigurationBase {}

/**
 * @see Tasyen's LISTBOX reference: https://github.com/Tasyen/FDF/blob/master/FrameTypes/LISTBOX.html
 * @requiresFdf Items and scrollbar are FDF-bound children; a bare typed frame cannot render a complete list box.
 */
export class ListBoxFrame extends MonoFrame<ListBoxFrameConfiguration> {
    protected readonly nativeFrameType = FrameType.ListBox;

    private constructor(...args: ConstructorParameters<typeof MonoFrame<ListBoxFrameConfiguration>>) {
        super(...args);
        this.render();
    }

    public static get DefaultConfiguration(): ListBoxFrameConfiguration {
        return { width: 0.15, height: 0.1 };
    }

    /** @requiresFdf Needs a loaded FDF template for its child frames to render completely. */
    public static CreateNamed(args: NamedNativeFrameArguments<ListBoxFrameConfiguration>): ListBoxFrame {
        return new ListBoxFrame(args.context, { ...ListBoxFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner, undefined, args.priority);
    }

    /** @requiresFdf Needs a loaded FDF template for its child frames to render completely. */
    public static CreateType(args: TypedNativeFrameArguments<ListBoxFrameConfiguration>): ListBoxFrame {
        return new ListBoxFrame(args.context, { ...ListBoxFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner, args.inherits);
    }

    protected render(): void {
        this.createNativeFrame();
    }
}
