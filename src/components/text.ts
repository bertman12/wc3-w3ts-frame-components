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
     * @param text The text that goes inside the tooltip.
     * @param buffer Optional addition to the calculated width.
     * @returns number
     */
    public formatSize(buffer?: number) {
        if (this.frame) {
            const width = 0.02 + 0.004 * this.frame.text.length + (buffer || 0);
            this.frame.setSize(width, 0);
        }
    }
}
