import { Frame, MapPlayer, Trigger } from "w3ts";
import { PlaySoundLocal } from "warcraft-3-w3ts-utils";
import { FrameTemplate, IMonoFrameConfigurationBase, InheritsOf } from "../../models";
import { MonoFrame, NamedNativeFrameArguments, TypedNativeFrameArguments } from "../Core/MonoFrame";

export interface GlueTextButtonFrameConfiguration extends IMonoFrameConfigurationBase<FrameTemplate<"GLUETEXTBUTTON">> {
    /** The frame definition CreateType inherits from. Overridden by the CreateType inherits argument; ignored by CreateNamed. Default value: "ScriptDialogButton" */
    inherits?: InheritsOf<FrameTemplate<"GLUETEXTBUTTON">>;
    /** Sound played locally for the clicking player. An empty string plays no sound. Default value: "Sound\\Interface\\BigButtonClick.flac" */
    clickSoundPath?: string;
    /** Height of the button. Default value: 0.1 */
    height?: number;
    /** Text shown on the button when it is created. Default value: "Default" */
    initialText?: string;
    /** Handler called when the button is clicked. Default value: a no-op function */
    onClick?: (button: GlueTextButtonFrame) => void;
    /** Width of the button. Default value: 0.1 */
    width?: number;
}

type GlueTextButtonFrameDefaultConfiguration = Required<Pick<GlueTextButtonFrameConfiguration, "inherits" | "clickSoundPath" | "height" | "initialText" | "onClick" | "width">>;

/**
 * Its linked text child (ButtonText) and button art are FDF-defined. The default inherits, "ScriptDialogButton", is a loaded template that supplies them, so no FDF is needed; created with inherits "" it has no text child or art.
 * @see Tasyen's GLUETEXTBUTTON reference: https://github.com/Tasyen/FDF/blob/master/FrameTypes/GLUETEXTBUTTON.html
 */
export class GlueTextButtonFrame extends MonoFrame<GlueTextButtonFrameConfiguration> {
    public onClickTrigger?: Trigger;
    private createdByName = false;

    private constructor(...args: ConstructorParameters<typeof MonoFrame<GlueTextButtonFrameConfiguration>>) {
        super(...args);
        this.render();
    }

    public static get DefaultConfiguration(): GlueTextButtonFrameDefaultConfiguration {
        return { inherits: "ScriptDialogButton", clickSoundPath: "Sound\\Interface\\BigButtonClick.flac", height: 0.1, initialText: "Default", onClick: () => {}, width: 0.1 };
    }

    public static CreateNamed(args: NamedNativeFrameArguments<GlueTextButtonFrameConfiguration>): GlueTextButtonFrame {
        return new GlueTextButtonFrame(args.context, { ...GlueTextButtonFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner, undefined, args.priority);
    }

    public static CreateType(args: TypedNativeFrameArguments<GlueTextButtonFrameConfiguration, FrameTemplate<"GLUETEXTBUTTON">>): GlueTextButtonFrame {
        return new GlueTextButtonFrame(args.context, { ...GlueTextButtonFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner, args.inherits ?? args.overrides?.inherits ?? GlueTextButtonFrame.DefaultConfiguration.inherits);
    }

    protected render(): void {
        if (this.inherits !== undefined) {
            this.frame = Frame.createType(this.name, this.owner, this.context, "GLUETEXTBUTTON", this.inherits);
        } else {
            this.createdByName = true;
            this.frame = Frame.create(this.name, this.owner, this.priority ?? 0, this.context);
        }

        if (!this.frame) {
            print("no glue text frame found!");
            return;
        }

        this.frame.clearPoints();
        this.frame.setAbsPoint(FRAMEPOINT_CENTER, 0.3, 0.3);
        this.frame.setSize(this.configuration.width ?? GlueTextButtonFrame.DefaultConfiguration.width, this.configuration.height ?? GlueTextButtonFrame.DefaultConfiguration.height);
        if (this.configuration.initialText) {
            this.frame.setText(this.configuration.initialText);
        }
        this.setOnClick(this.configuration.onClick ?? GlueTextButtonFrame.DefaultConfiguration.onClick);
    }

    public setOnClick(onClick: (button: GlueTextButtonFrame) => void): void {
        if (!this.frame) {
            return;
        }
        this.onClickTrigger = this.onFrameEvent(FRAMEEVENT_CONTROL_CLICK, () => {
            const player = MapPlayer.fromEvent();
            if (!this.createdByName && player && this.configuration.clickSoundPath) {
                PlaySoundLocal(this.configuration.clickSoundPath, player.isLocal());
            }
            this.frame?.setEnabled(false);
            this.frame?.setEnabled(true);
            onClick(this);
        });
    }
}
