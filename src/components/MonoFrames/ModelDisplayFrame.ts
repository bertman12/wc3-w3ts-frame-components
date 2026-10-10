import { Frame } from "w3ts";
import { IMonoFrameConfigurationBase } from "../../models";
import { MonoFrame } from "../Core/MonoFrame";

export interface ModelFrameConfigurationBase extends IMonoFrameConfigurationBase {
    /** Camera index passed to the model. Default value: 0 */
    cameraIndex?: number;
    /** Height of the frame. Default value: 0.001 */
    height?: number;
    /** Path of the model to display. Default value: undefined */
    modelPath?: string;
    /**
     * Scale applied to the model. Default value: 0.002
     *
     * Native unit/doodad models are world-scale and vastly larger than the frame's
     * 0-1 UI bounding box. Without shrinking the model via BlzFrameSetScale, its
     * geometry overflows the frame and renders as a solid black/garbled fill
     * covering the screen instead of a small preview.
     * @see Tasyen's working example (BlzFrameSetScale(frame, 0.002) for a Footman
     * sized to a 0.001 x 0.001 frame): https://www.hiveworkshop.com/threads/3d-model-on-ui.320434/post-3387861
     */
    scale?: number;
    /** Width of the frame. Default value: 0.001 */
    width?: number;
}

export type ModelFrameDefaultConfigurationBase = Required<Pick<ModelFrameConfigurationBase, "cameraIndex" | "height" | "scale" | "width">> & Pick<ModelFrameConfigurationBase, "modelPath">;

export abstract class ModelDisplayFrame<Configuration extends ModelFrameConfigurationBase> extends MonoFrame<Configuration> {
    protected abstract get defaultModelConfiguration(): ModelFrameDefaultConfigurationBase;

    protected render(): void {
        const frame = this.createNativeFrame();
        if (!frame) {
            return;
        }

        this.configureModelFrame(frame);
    }

    protected configureModelFrame(frame: Frame): void {
        if (this.configuration.modelPath) {
            frame.setModel(this.configuration.modelPath, this.configuration.cameraIndex ?? this.defaultModelConfiguration.cameraIndex);
        }

        // Without an explicit scale, unit/doodad models overflow the frame's bounding
        // box and render as a black/garbled fill across the screen instead of a preview.
        // Working Hive examples use different call orders (Tasyen's "3D Model on UI":
        // model, size, scale, point; "UI: Adding Sprite": point, size, scale, model),
        // so the order is not what makes a model render.
        frame.setSize(this.configuration.width || this.defaultModelConfiguration.width, this.configuration.height || this.defaultModelConfiguration.height);
        frame.setScale(this.configuration.scale ?? this.defaultModelConfiguration.scale);
    }

    public updateModel(modelPath: string, cameraIndex = this.configuration.cameraIndex ?? this.defaultModelConfiguration.cameraIndex): void {
        this.frame?.setModel(modelPath, cameraIndex);
    }

    public updateScale(scale: number): void {
        this.configuration.scale = scale;
        this.frame?.setScale(scale);
    }
}
