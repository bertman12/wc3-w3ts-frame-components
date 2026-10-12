import { Frame, Trigger } from "w3ts";
import { IMonoFrameConfigurationBase, FrameTemplate } from "../../models";
import { FrameType } from "../../names";
import { MonoFrame, NamedNativeFrameArguments, TypedNativeFrameArguments } from "../Core/MonoFrame";

export interface PopupMenuFrameConfiguration extends IMonoFrameConfigurationBase {
    /** Height of the popup menu. Default value: 0.03 */
    height?: number;
    /** Handler called with the selected item value when the selection changes. Default value: undefined */
    onItemChanged?: (value: number) => void;
    /** Width of the popup menu. Default value: 0.16 */
    width?: number;
}

/**
 * @see Tasyen's POPUPMENU reference: https://github.com/Tasyen/FDF/blob/master/FrameTypes/POPUPMENU.html
 * @requiresFdf Title, arrow, menu, and items are FDF-bound children; a bare typed frame cannot render a complete popup menu.
 */
export class PopupMenuFrame extends MonoFrame<PopupMenuFrameConfiguration> {
    public onItemChangedTrigger?: Trigger;

    public readonly nativeFrameType = FrameType.PopupMenu;

    private constructor(...args: ConstructorParameters<typeof MonoFrame<PopupMenuFrameConfiguration>>) {
        super(...args);
        this.render();
    }

    public static get DefaultConfiguration(): PopupMenuFrameConfiguration {
        return { height: 0.03, onItemChanged: undefined, width: 0.16 };
    }

    /** @requiresFdf Needs a loaded FDF template for its child frames to render completely. */
    public static CreateNamed(args: NamedNativeFrameArguments<PopupMenuFrameConfiguration>): PopupMenuFrame {
        return new PopupMenuFrame(args.context, { ...PopupMenuFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner, undefined, args.priority);
    }

    /** @requiresFdf Needs a loaded FDF template for its child frames to render completely. */
    public static CreateType(args: TypedNativeFrameArguments<PopupMenuFrameConfiguration, FrameTemplate<"POPUPMENU">>): PopupMenuFrame {
        return new PopupMenuFrame(args.context, { ...PopupMenuFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner, args.inherits);
    }

    public setOnItemChanged(onItemChanged: (value: number) => void): void {
        this.onItemChangedTrigger = this.onFrameEvent(FRAMEEVENT_POPUPMENU_ITEM_CHANGED, () => onItemChanged(Frame.getEventValue()));
    }

    protected render(): void {
        if (!this.createNativeFrame()) {
            return;
        }

        if (this.configuration.onItemChanged) {
            this.setOnItemChanged(this.configuration.onItemChanged);
        }
    }
}
