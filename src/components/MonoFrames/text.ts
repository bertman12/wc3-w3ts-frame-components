import { Frame } from "w3ts";
import { MonoFrame } from "../Core/MonoFrame";
import { IMonoFrameConfigurationBase } from "../../models";

export interface TextFrameConfiguration extends IMonoFrameConfigurationBase {
    initialText?: string;
    autoSizeWidth?: boolean;
    defaultAutoSizeBuffer?: number;
}

export class TextFrame extends MonoFrame<TextFrameConfiguration> {
    private constructor(...args: ConstructorParameters<typeof MonoFrame<TextFrameConfiguration>>) {
        super(...args);
        this.render();
    }

    public static get DefaultConfiguration(): TextFrameConfiguration {
        return {
            autoSizeWidth: true,
            initialText: "Sample Text",
        };
    }

    /**
     * Creates a text frame from an existing Blizzard frame name.
     *
     * @param args Frame creation options.
     * @param args.context The frame creation context.
     * @param args.name Existing Blizzard frame name.
     * @param args.priority Frame priority.
     * @param args.owner Parent frame; defaults to the game UI frame.
     * @param args.overrides Configuration values that replace the defaults.
     */
    public static CreateNamed(args: { context: number; name: string; priority?: number; owner?: Frame; overrides?: TextFrameConfiguration }): TextFrame {
        return new TextFrame(args.context, { ...TextFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner, undefined, args.priority);
    }

    /**
     * Creates a text frame by type, inheriting properties from an FDF frame.
     *
     * @param args Frame creation options.
     * @param args.context The frame creation context.
     * @param args.inherits FDF frame definition from which to inherit.
     * @param args.name Optional name for the created frame.
     * @param args.owner Parent frame; defaults to the game UI frame.
     * @param args.overrides Configuration values that replace the defaults.
     */
    public static CreateType(args: { context: number; inherits: string; name?: string; owner?: Frame; overrides?: TextFrameConfiguration }): TextFrame {
        return new TextFrame(args.context, { ...TextFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner, args.inherits);
    }

    protected render(): void {
        if (this.inherits !== undefined) {
            this.frame = Frame.createType(this.name, this.owner, this.context, "TEXT", this.inherits);
        } else {
            this.frame = Frame.create(this.name, this.owner, this.priority ?? 0, this.context);
        }

        if (!this.frame) {
            return;
        }

        this.frame.clearPoints();
        this.frame.setAbsPoint(FRAMEPOINT_CENTER, 0.4, 0.3);
        this.frame.setSize(0.1, 0.005);

        if (this.configuration.initialText) {
            this.frame.setText(this.configuration.initialText);
        }
    }

    public update(text: string): void {
        this.frame?.setText(text);

        if (this.configuration.autoSizeWidth) {
            this.formatSize(this.configuration.defaultAutoSizeBuffer);
        }
    }

    public formatSize(buffer?: number): void {
        if (this.frame) {
            const width = 0.02 + 0.004 * this.frame.text.length + (buffer ?? 0);
            this.frame.setSize(width, 0);
        }
    }
}
