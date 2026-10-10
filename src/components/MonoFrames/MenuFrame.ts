import { IMonoFrameConfigurationBase } from "../../models";
import { FrameType } from "../../names";
import { MonoFrame, NamedNativeFrameArguments, TypedNativeFrameArguments } from "../Core/MonoFrame";

export interface MenuFrameConfiguration extends IMonoFrameConfigurationBase {
    /** Height of the menu. Default value: 0.1 */
    height?: number;
    /** Width of the menu. Default value: 0.15 */
    width?: number;
}

/**
 * @see Tasyen's MENU reference: https://github.com/Tasyen/FDF/blob/master/FrameTypes/MENU.html
 * @requiresFdf Menu choices are FDF-bound children; a bare typed frame cannot render a complete menu.
 */
export class MenuFrame extends MonoFrame<MenuFrameConfiguration> {
    public readonly nativeFrameType = FrameType.Menu;

    private constructor(...args: ConstructorParameters<typeof MonoFrame<MenuFrameConfiguration>>) {
        super(...args);
        this.render();
    }

    public static get DefaultConfiguration(): MenuFrameConfiguration {
        return { height: 0.1, width: 0.15 };
    }

    /** @requiresFdf Needs a loaded FDF template for its child frames to render completely. */
    public static CreateNamed(args: NamedNativeFrameArguments<MenuFrameConfiguration>): MenuFrame {
        return new MenuFrame(args.context, { ...MenuFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner, undefined, args.priority);
    }

    /** @requiresFdf Needs a loaded FDF template for its child frames to render completely. */
    public static CreateType(args: TypedNativeFrameArguments<MenuFrameConfiguration>): MenuFrame {
        return new MenuFrame(args.context, { ...MenuFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner, args.inherits);
    }

    protected render(): void {
        this.createNativeFrame();
    }
}
