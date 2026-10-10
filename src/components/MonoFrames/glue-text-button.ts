import { Frame, MapPlayer, Trigger } from "w3ts";
import { PlaySoundLocal } from "warcraft-3-w3ts-utils";
import { IMonoFrameConfigurationBase } from "../../models";
import { MonoFrame } from "../Core/MonoFrame";

export interface GlueTextButtonFrameConfiguration extends IMonoFrameConfigurationBase {
    clickSoundPath?: string;
    initialText?: string;
    onClick?: (button: GlueTextButtonFrame) => void;
}

/**
 * @see Tasyen's GLUETEXTBUTTON reference: https://github.com/Tasyen/FDF/blob/master/FrameTypes/GLUETEXTBUTTON.html
 * @requiresFdf Its linked text child (ButtonText) and button art are FDF-defined; use a template such as ScriptDialogButton.
 */
export class GlueTextButtonFrame extends MonoFrame<GlueTextButtonFrameConfiguration> {
    public onClickTrigger?: Trigger;
    private createdByName = false;

    private constructor(...args: ConstructorParameters<typeof MonoFrame<GlueTextButtonFrameConfiguration>>) {
        super(...args);
        this.render();
    }

    public static get DefaultConfiguration(): GlueTextButtonFrameConfiguration {
        return { clickSoundPath: "Sound\\Interface\\BigButtonClick.flac", initialText: "Default", onClick: () => {} };
    }

    /** @requiresFdf Needs a loaded FDF template for its text child and art to render. */
    public static CreateNamed(args: { context: number; name: string; priority?: number; owner?: Frame; overrides?: GlueTextButtonFrameConfiguration }): GlueTextButtonFrame {
        return new GlueTextButtonFrame(args.context, { ...GlueTextButtonFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner, undefined, args.priority);
    }

    /** @requiresFdf Needs a loaded FDF template for its text child and art to render. */
    public static CreateType(args: { context: number; inherits: string; name?: string; owner?: Frame; overrides?: GlueTextButtonFrameConfiguration }): GlueTextButtonFrame {
        return new GlueTextButtonFrame(args.context, { ...GlueTextButtonFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner, args.inherits);
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
        this.frame.setSize(0.1, 0.1);
        if (this.configuration.initialText) {
            this.frame.setText(this.configuration.initialText);
        }
        this.setOnClick(this.configuration.onClick ?? (() => {}));
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
