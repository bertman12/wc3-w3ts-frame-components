import { Frame } from "w3ts";
import { IMonoFrameConfigurationBase } from "../../models";
import { FrameType } from "../../names";
import { MonoFrame, NamedNativeFrameArguments, TypedNativeFrameArguments } from "../Core/MonoFrame";

interface ModelFrameConfigurationBase extends IMonoFrameConfigurationBase {
    cameraIndex?: number;
    modelPath?: string;
    /**
     * Native unit/doodad models are world-scale and vastly larger than the frame's
     * 0-1 UI bounding box. Without shrinking the model via BlzFrameSetScale, its
     * geometry overflows the frame and renders as a solid black/garbled fill
     * covering the screen instead of a small preview.
     * @see Tasyen's working example (BlzFrameSetScale(frame, 0.002) for a Footman
     * sized to a 0.001 x 0.001 frame): https://www.hiveworkshop.com/threads/3d-model-on-ui.320434/post-3387861
     */
    scale?: number;
    width?: number;
    height?: number;
}

abstract class ModelDisplayFrame<Configuration extends ModelFrameConfigurationBase> extends MonoFrame<Configuration> {
    protected abstract readonly nativeFrameType: FrameType;

    protected render(): void {
        const frame = this.createNativeFrame(this.nativeFrameType, this.configuration.width ?? 0.001, this.configuration.height ?? 0.001, 0.4, 0.3);
        if (!frame) {
            return;
        }

        this.configureModelFrame(frame);
    }

    protected configureModelFrame(frame: Frame): void {
        if (this.configuration.modelPath) {
            frame.setModel(this.configuration.modelPath, this.configuration.cameraIndex ?? 0);
        }

        // Without an explicit scale, unit/doodad models overflow the frame's bounding
        // box and render as a black/garbled fill across the screen instead of a preview.
        // Working Hive examples use different call orders (Tasyen's "3D Model on UI":
        // model, size, scale, point; "UI: Adding Sprite": point, size, scale, model),
        // so the order is not what makes a model render.
        frame.setSize(this.configuration.width || 0.001, this.configuration.height || 0.001);
        frame.setScale(this.configuration.scale ?? 0.002);
    }

    public updateModel(modelPath: string, cameraIndex = this.configuration.cameraIndex ?? 0): void {
        this.frame?.setModel(modelPath, cameraIndex);
    }

    public updateScale(scale: number): void {
        this.configuration.scale = scale;
        this.frame?.setScale(scale);
    }
}

export interface ModelFrameConfiguration extends ModelFrameConfigurationBase {}

/**
 * Every Hive/GitHub example that renders a unit or doodad model uses a SPRITE frame (see
 * {@link SpriteFrame}); none shows one in a MODEL frame. Tasyen says MODEL needs "special 2d
 * models", for example `ui\\feedback\\xpbar\\xpbarconsole.mdx` (Warcraft III 1.31.1); whether that
 * still applies on the current patch is unverified.
 * @see Tasyen's MODEL reference: https://github.com/Tasyen/FDF/blob/master/FrameTypes/MODEL.html
 * @see Tasyen's MODEL vs SPRITE reply: https://www.hiveworkshop.com/threads/3d-model-on-game-ui-interface.315940/
 */
export class ModelFrame extends ModelDisplayFrame<ModelFrameConfiguration> {
    protected readonly nativeFrameType = FrameType.Model;

    private constructor(...args: ConstructorParameters<typeof MonoFrame<ModelFrameConfiguration>>) {
        super(...args);
        this.render();
    }

    public static get DefaultConfiguration(): ModelFrameConfiguration {
        return { cameraIndex: 0, scale: 0.002, width: 0.001, height: 0.001 };
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
