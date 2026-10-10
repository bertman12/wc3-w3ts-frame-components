import { Frame } from "w3ts";
import { FrameType } from "../../names";
import { MonoFrame, NamedNativeFrameArguments, TypedNativeFrameArguments } from "../Core/MonoFrame";
import { ModelDisplayFrame, ModelFrameConfigurationBase } from "./ModelDisplayFrame";

export interface SpriteFrameConfiguration extends ModelFrameConfigurationBase {
    animationFlags?: number;
    animationPrimaryProp?: number;
}

/**
 * @see Tasyen's SPRITE reference: https://github.com/Tasyen/FDF/blob/master/FrameTypes/SPRITE.html
 */
export class SpriteFrame extends ModelDisplayFrame<SpriteFrameConfiguration> {
    public readonly nativeFrameType = FrameType.Sprite;

    private constructor(...args: ConstructorParameters<typeof MonoFrame<SpriteFrameConfiguration>>) {
        super(...args);
        this.render();
    }

    public static get DefaultConfiguration(): SpriteFrameConfiguration {
        return { animationFlags: 0, animationPrimaryProp: 2, cameraIndex: 0, scale: 0.002, width: 0.001, height: 0.001 };
    }

    public static CreateNamed(args: NamedNativeFrameArguments<SpriteFrameConfiguration>): SpriteFrame {
        return new SpriteFrame(args.context, { ...SpriteFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner, undefined, args.priority);
    }

    public static CreateType(args: TypedNativeFrameArguments<SpriteFrameConfiguration>): SpriteFrame {
        return new SpriteFrame(args.context, { ...SpriteFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner, args.inherits);
    }

    public setAnimation(primaryProp: number, flags = this.configuration.animationFlags ?? 0): void {
        this.frame?.setSpriteAnimate(primaryProp, flags);
    }

    protected configureModelFrame(frame: Frame): void {
        super.configureModelFrame(frame);
        frame.setSpriteAnimate(this.configuration.animationPrimaryProp ?? 2, this.configuration.animationFlags ?? 0);
    }
}
