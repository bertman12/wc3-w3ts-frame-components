import { Frame } from "w3ts";
import { MonoFrame, NamedNativeFrameArguments, TypedNativeFrameArguments } from "../Core/MonoFrame";
import { IMonoFrameConfigurationBase, LoadedTextTemplate } from "../../models";

export interface TextFrameConfiguration extends IMonoFrameConfigurationBase {
    /** Whether update() resizes the frame width to fit the new text. Default value: true */
    autoSizeWidth?: boolean;
    /** Extra width added when auto-sizing the frame to its text. Default value: 0 */
    defaultAutoSizeBuffer?: number;
    /** Height of the text frame. Default value: 0.005 */
    height?: number;
    /** Text shown when the frame is created. Default value: "Sample Text" */
    initialText?: string;
    /** Width of the text frame. Default value: 0.1 */
    width?: number;
}

type TextFrameDefaultConfiguration = Required<Pick<TextFrameConfiguration, "autoSizeWidth" | "defaultAutoSizeBuffer" | "height" | "initialText" | "width">>;

export class TextFrame extends MonoFrame<TextFrameConfiguration> {
    private constructor(...args: ConstructorParameters<typeof MonoFrame<TextFrameConfiguration>>) {
        super(...args);
        this.render();
    }

    public static get DefaultConfiguration(): TextFrameDefaultConfiguration {
        return {
            autoSizeWidth: true,
            defaultAutoSizeBuffer: 0,
            height: 0.005,
            initialText: "Sample Text",
            width: 0.1,
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
    public static CreateNamed(args: NamedNativeFrameArguments<TextFrameConfiguration>): TextFrame {
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
    public static CreateType(args: TypedNativeFrameArguments<TextFrameConfiguration, LoadedTextTemplate>): TextFrame {
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
        this.frame.setSize(this.configuration.width ?? TextFrame.DefaultConfiguration.width, this.configuration.height ?? TextFrame.DefaultConfiguration.height);

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
            const width = 0.02 + 0.004 * this.frame.text.length + (buffer ?? TextFrame.DefaultConfiguration.defaultAutoSizeBuffer);
            this.frame.setSize(width, 0);
        }
    }
}
