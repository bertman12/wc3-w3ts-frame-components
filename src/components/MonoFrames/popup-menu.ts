import { Frame, Trigger } from "w3ts";
import { IMonoFrameConfigurationBase } from "../../models";
import { FrameType } from "../../names";
import { MonoFrame, NamedNativeFrameArguments, TypedNativeFrameArguments } from "../Core/MonoFrame";

interface PopupMenuFrameConfigurationBase extends IMonoFrameConfigurationBase {
    onItemChanged?: (value: number) => void;
}

abstract class PopupMenuFrameBase<Configuration extends PopupMenuFrameConfigurationBase> extends MonoFrame<Configuration> {
    public onItemChangedTrigger?: Trigger;

    protected abstract readonly nativeFrameType: FrameType;

    protected render(): void {
        if (!this.createNativeFrame(this.nativeFrameType, 0.16, 0.03)) {
            return;
        }

        if (this.configuration.onItemChanged) {
            this.setOnItemChanged(this.configuration.onItemChanged);
        }
    }

    public setOnItemChanged(onItemChanged: (value: number) => void): void {
        this.onItemChangedTrigger = this.createFrameEvent(FRAMEEVENT_POPUPMENU_ITEM_CHANGED, () => onItemChanged(Frame.getEventValue()));
    }
}

export interface PopupMenuFrameConfiguration extends PopupMenuFrameConfigurationBase {}

/**
 * @see Tasyen's POPUPMENU reference: https://github.com/Tasyen/FDF/blob/master/FrameTypes/POPUPMENU.html
 */
export class PopupMenuFrame extends PopupMenuFrameBase<PopupMenuFrameConfiguration> {
    protected readonly nativeFrameType = FrameType.PopupMenu;

    private constructor(...args: ConstructorParameters<typeof MonoFrame<PopupMenuFrameConfiguration>>) {
        super(...args);
        this.render();
    }

    public static get DefaultConfiguration(): PopupMenuFrameConfiguration {
        return {};
    }

    public static CreateNamed(args: NamedNativeFrameArguments<PopupMenuFrameConfiguration>): PopupMenuFrame {
        return new PopupMenuFrame(args.context, { ...PopupMenuFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner, undefined, args.priority);
    }

    public static CreateType(args: TypedNativeFrameArguments<PopupMenuFrameConfiguration>): PopupMenuFrame {
        return new PopupMenuFrame(args.context, { ...PopupMenuFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner, args.inherits);
    }
}

export interface GluePopupMenuFrameConfiguration extends PopupMenuFrameConfigurationBase {}

/**
 * @see Tasyen's GLUEPOPUPMENU reference: https://github.com/Tasyen/FDF/blob/master/FrameTypes/GLUEPOPUPMENU.html
 */
export class GluePopupMenuFrame extends PopupMenuFrameBase<GluePopupMenuFrameConfiguration> {
    protected readonly nativeFrameType = FrameType.GluePopupMenu;

    private constructor(...args: ConstructorParameters<typeof MonoFrame<GluePopupMenuFrameConfiguration>>) {
        super(...args);
        this.render();
    }

    public static get DefaultConfiguration(): GluePopupMenuFrameConfiguration {
        return {};
    }

    public static CreateNamed(args: NamedNativeFrameArguments<GluePopupMenuFrameConfiguration>): GluePopupMenuFrame {
        return new GluePopupMenuFrame(args.context, { ...GluePopupMenuFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner, undefined, args.priority);
    }

    public static CreateType(args: TypedNativeFrameArguments<GluePopupMenuFrameConfiguration>): GluePopupMenuFrame {
        return new GluePopupMenuFrame(args.context, { ...GluePopupMenuFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner, args.inherits);
    }
}
