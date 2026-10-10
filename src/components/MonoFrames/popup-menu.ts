import { Frame, Trigger } from "w3ts";
import { IMonoFrameConfigurationBase } from "../../models";
import { FrameType } from "../../names";
import { MonoFrame, NamedNativeFrameArguments, TypedNativeFrameArguments } from "../Core/MonoFrame";

export interface PopupMenuFrameConfiguration extends IMonoFrameConfigurationBase {
    onItemChanged?: (value: number) => void;
}

/**
 * @see Tasyen's POPUPMENU reference: https://github.com/Tasyen/FDF/blob/master/FrameTypes/POPUPMENU.html
 * @requiresFdf Title, arrow, menu, and items are FDF-bound children; a bare typed frame cannot render a complete popup menu.
 */
export class PopupMenuFrame extends MonoFrame<PopupMenuFrameConfiguration> {
    public onItemChangedTrigger?: Trigger;

    protected readonly nativeFrameType = FrameType.PopupMenu;

    private constructor(...args: ConstructorParameters<typeof MonoFrame<PopupMenuFrameConfiguration>>) {
        super(...args);
        this.render();
    }

    public static get DefaultConfiguration(): PopupMenuFrameConfiguration {
        return { width: 0.16, height: 0.03 };
    }

    /** @requiresFdf Needs a loaded FDF template for its child frames to render completely. */
    public static CreateNamed(args: NamedNativeFrameArguments<PopupMenuFrameConfiguration>): PopupMenuFrame {
        return new PopupMenuFrame(args.context, { ...PopupMenuFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner, undefined, args.priority);
    }

    /** @requiresFdf Needs a loaded FDF template for its child frames to render completely. */
    public static CreateType(args: TypedNativeFrameArguments<PopupMenuFrameConfiguration>): PopupMenuFrame {
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

export interface GluePopupMenuFrameConfiguration extends IMonoFrameConfigurationBase {
    onItemChanged?: (value: number) => void;
}

/**
 * @see Tasyen's GLUEPOPUPMENU reference: https://github.com/Tasyen/FDF/blob/master/FrameTypes/GLUEPOPUPMENU.html
 * @requiresFdf Title, arrow, menu, and items are FDF-bound children; a bare typed frame cannot render a complete popup menu.
 */
export class GluePopupMenuFrame extends MonoFrame<GluePopupMenuFrameConfiguration> {
    public onItemChangedTrigger?: Trigger;

    protected readonly nativeFrameType = FrameType.GluePopupMenu;

    private constructor(...args: ConstructorParameters<typeof MonoFrame<GluePopupMenuFrameConfiguration>>) {
        super(...args);
        this.render();
    }

    public static get DefaultConfiguration(): GluePopupMenuFrameConfiguration {
        return { width: 0.16, height: 0.03 };
    }

    /** @requiresFdf Needs a loaded FDF template for its child frames to render completely. */
    public static CreateNamed(args: NamedNativeFrameArguments<GluePopupMenuFrameConfiguration>): GluePopupMenuFrame {
        return new GluePopupMenuFrame(args.context, { ...GluePopupMenuFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner, undefined, args.priority);
    }

    /** @requiresFdf Needs a loaded FDF template for its child frames to render completely. */
    public static CreateType(args: TypedNativeFrameArguments<GluePopupMenuFrameConfiguration>): GluePopupMenuFrame {
        return new GluePopupMenuFrame(args.context, { ...GluePopupMenuFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner, args.inherits);
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
