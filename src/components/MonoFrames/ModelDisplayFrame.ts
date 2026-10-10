import { Frame } from "w3ts";
import { IMonoFrameConfigurationBase } from "../../models";
import { MonoFrame } from "../Core/MonoFrame";

export interface ModelFrameConfigurationBase extends IMonoFrameConfigurationBase {
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
}

export abstract class ModelDisplayFrame<Configuration extends ModelFrameConfigurationBase> extends MonoFrame<Configuration> {
    protected render(): void {
        const frame = this.createNativeFrame();
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
