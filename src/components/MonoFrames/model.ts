import { Frame } from "w3ts";
import { IMonoFrameConfigurationBase } from "../../models";
import { FrameType } from "../../names";
import { MonoFrame, NamedNativeFrameArguments, TypedNativeFrameArguments } from "../Core/MonoFrame";

interface ModelFrameConfigurationBase extends IMonoFrameConfigurationBase {
    cameraIndex?: number;
    modelPath?: string;
}

abstract class ModelDisplayFrame<Configuration extends ModelFrameConfigurationBase> extends MonoFrame<Configuration> {
    protected abstract readonly nativeFrameType: FrameType;

    protected render(): void {
        const frame = this.createNativeFrame(this.nativeFrameType, 0.12, 0.12);
        if (!frame) {
            return;
        }

        this.configureModelFrame(frame);
    }

    protected configureModelFrame(frame: Frame): void {
        if (this.configuration.modelPath) {
            frame.setModel(this.configuration.modelPath, this.configuration.cameraIndex ?? 0);
        }
    }

    public updateModel(modelPath: string, cameraIndex = this.configuration.cameraIndex ?? 0): void {
        this.frame?.setModel(modelPath, cameraIndex);
    }
}

export interface ModelFrameConfiguration extends ModelFrameConfigurationBase {}

/**
 * @see Tasyen's MODEL reference: https://github.com/Tasyen/FDF/blob/master/FrameTypes/MODEL.html
 */
export class ModelFrame extends ModelDisplayFrame<ModelFrameConfiguration> {
    protected readonly nativeFrameType = FrameType.Model;

    private constructor(...args: ConstructorParameters<typeof MonoFrame<ModelFrameConfiguration>>) {
        super(...args);
        this.render();
    }

    public static get DefaultConfiguration(): ModelFrameConfiguration {
        return { cameraIndex: 0 };
    }

    public static CreateNamed(args: NamedNativeFrameArguments<ModelFrameConfiguration>): ModelFrame {
        return new ModelFrame(args.context, { ...ModelFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner, undefined, args.priority);
    }

    public static CreateType(args: TypedNativeFrameArguments<ModelFrameConfiguration>): ModelFrame {
        return new ModelFrame(args.context, { ...ModelFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner, args.inherits);
    }
}

export interface SpriteFrameConfiguration extends ModelFrameConfigurationBase {
    animationFlags?: number;
    animationPrimaryProp?: number;
}

/**
 * @see Tasyen's SPRITE reference: https://github.com/Tasyen/FDF/blob/master/FrameTypes/SPRITE.html
 */
export class SpriteFrame extends ModelDisplayFrame<SpriteFrameConfiguration> {
    protected readonly nativeFrameType = FrameType.Sprite;

    private constructor(...args: ConstructorParameters<typeof MonoFrame<SpriteFrameConfiguration>>) {
        super(...args);
        this.render();
    }

    public static get DefaultConfiguration(): SpriteFrameConfiguration {
        return { animationFlags: 0, animationPrimaryProp: 2, cameraIndex: 0 };
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
