import { FrameUtils } from "src/frame-utils";
import { Frame } from "w3ts";
import { AbstractFrameBase } from "../components/AbstractFrameBase";

interface TextConfig {
    initialText?: string;
    autoSizeWidth?: boolean;
    defaultAutoSizeBuffer?: number;
}

export class Text extends AbstractFrameBase {
    public frame?: Frame;
    public config: TextConfig;

    constructor(config: TextConfig, ...baseArgs: ConstructorParameters<typeof AbstractFrameBase>) {
        super(...baseArgs);
        this.config = config;
        this.render();
    }

    public static Default(context: number = 0, owner: Frame = FrameUtils.OriginFrameGameUI) {
        return new Text({ initialText: "Sampe Text", autoSizeWidth: true }, "", context, owner, "");
    }

    protected render() {
        if (this.inherits !== undefined) {
            this.frame = Frame.createType(this.name, this.owner, this.context, "TEXT", this.inherits);
        } else {
            this.frame = Frame.create(this.name, this.owner, this.priority, this.context);
        }

        if (!this.frame) {
            return;
        }

        this.frame.clearPoints();
        this.frame.setAbsPoint(FRAMEPOINT_CENTER, 0.4, 0.3);
        this.frame.setSize(0.1, 0.005);

        if (this.config.initialText) {
            this.frame.setText(this.config.initialText);
        }
    }

    public update(text: string) {
        this.frame?.setText(text);

        if (this.config.autoSizeWidth) {
            this.formatSize(this.config.defaultAutoSizeBuffer);
        }
    }

    /**
     * Automatically resizes the width of the text frame.
     *
     * @param text
     * @param buffer Optional value to add to the calculated width.
     * @returns number
     */
    public formatSize(buffer?: number) {
        if (this.frame) {
            const width = 0.02 + 0.004 * this.frame.text.length + (buffer || 0);
            this.frame.setSize(width, 0);
        }
    }
}
