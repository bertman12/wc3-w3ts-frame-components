import { FrameType } from "../../names";
import { MonoFrame, NamedNativeFrameArguments, TypedNativeFrameArguments } from "../Core/MonoFrame";
import { ModelDisplayFrame, ModelFrameConfigurationBase, ModelFrameDefaultConfigurationBase } from "./ModelDisplayFrame";

export interface ModelFrameConfiguration extends ModelFrameConfigurationBase {}

type ModelFrameDefaultConfiguration = ModelFrameDefaultConfigurationBase;

/**
 * Every Hive/GitHub example that renders a unit or doodad model uses a SPRITE frame (see
 * {@link SpriteFrame}); none shows one in a MODEL frame. Tasyen says MODEL needs "special 2d
 * models", for example `ui\\feedback\\xpbar\\xpbarconsole.mdx` (Warcraft III 1.31.1); whether that
 * still applies on the current patch is unverified.
 * @see Tasyen's MODEL reference: https://github.com/Tasyen/FDF/blob/master/FrameTypes/MODEL.html
 * @see Tasyen's MODEL vs SPRITE reply: https://www.hiveworkshop.com/threads/3d-model-on-game-ui-interface.315940/
 * @deprecated Development deferred. Do not use; this class is still under development.
 */
export class ModelFrame extends ModelDisplayFrame<ModelFrameConfiguration> {
    public readonly nativeFrameType = FrameType.Model;

    private constructor(...args: ConstructorParameters<typeof MonoFrame<ModelFrameConfiguration>>) {
        super(...args);
        this.render();
    }

    protected get defaultModelConfiguration(): ModelFrameDefaultConfigurationBase {
        return ModelFrame.DefaultConfiguration;
    }

    public static get DefaultConfiguration(): ModelFrameDefaultConfiguration {
        return { cameraIndex: 0, height: 0.001, modelPath: undefined, scale: 0.002, width: 0.001 };
    }

    public static CreateNamed(args: NamedNativeFrameArguments<ModelFrameConfiguration>): ModelFrame {
        return new ModelFrame(args.context, { ...ModelFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner, undefined, args.priority);
    }

    public static CreateType(args: TypedNativeFrameArguments<ModelFrameConfiguration>): ModelFrame {
        return new ModelFrame(args.context, { ...ModelFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner, args.inherits ?? args.overrides?.inherits ?? "");
    }
}
