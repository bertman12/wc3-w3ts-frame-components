import { Frame } from "w3ts";
import { FrameType } from "../../names";
import { MonoFrame, NamedNativeFrameArguments, TypedNativeFrameArguments } from "../Core/MonoFrame";
import { ModelDisplayFrame, ModelFrameConfigurationBase, ModelFrameDefaultConfigurationBase } from "./ModelDisplayFrame";

export interface SpriteFrameConfiguration extends ModelFrameConfigurationBase {
    /** Animation flags passed to the sprite animation. Default value: 0 */
    animationFlags?: number;
    /** Primary animation property passed to the sprite animation. Default value: 2 */
    animationPrimaryProp?: number;
}

type SpriteFrameDefaultConfiguration = ModelFrameDefaultConfigurationBase & Required<Pick<SpriteFrameConfiguration, "animationFlags" | "animationPrimaryProp">>;

/**
 * @see Tasyen's SPRITE reference: https://github.com/Tasyen/FDF/blob/master/FrameTypes/SPRITE.html
 */
export class SpriteFrame extends ModelDisplayFrame<SpriteFrameConfiguration> {
    public readonly nativeFrameType = FrameType.Sprite;

    private constructor(...args: ConstructorParameters<typeof MonoFrame<SpriteFrameConfiguration>>) {
        super(...args);
        this.render();
    }

    protected get defaultModelConfiguration(): ModelFrameDefaultConfigurationBase {
        return SpriteFrame.DefaultConfiguration;
    }

    public static get DefaultConfiguration(): SpriteFrameDefaultConfiguration {
        return { animationFlags: 0, animationPrimaryProp: 2, cameraIndex: 0, height: 0.001, modelPath: undefined, scale: 0.002, width: 0.001 };
    }

    public static CreateNamed(args: NamedNativeFrameArguments<SpriteFrameConfiguration>): SpriteFrame {
        return new SpriteFrame(args.context, { ...SpriteFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner, undefined, args.priority);
    }

    public static CreateType(args: TypedNativeFrameArguments<SpriteFrameConfiguration>): SpriteFrame {
        return new SpriteFrame(args.context, { ...SpriteFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner, args.inherits ?? args.overrides?.inherits ?? "");
    }

    public setAnimation(primaryProp: number, flags = this.configuration.animationFlags ?? SpriteFrame.DefaultConfiguration.animationFlags): void {
        this.frame?.setSpriteAnimate(primaryProp, flags);
    }

    protected configureModelFrame(frame: Frame): void {
        super.configureModelFrame(frame);
        frame.setSpriteAnimate(this.configuration.animationPrimaryProp ?? SpriteFrame.DefaultConfiguration.animationPrimaryProp, this.configuration.animationFlags ?? SpriteFrame.DefaultConfiguration.animationFlags);
    }
}
