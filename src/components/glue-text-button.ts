import { __theme } from "src/theme";
import { Frame, MapPlayer, Trigger } from "w3ts";
import { PlaySoundLocal } from "warcraft-3-w3ts-utils";
import { IClickEvent } from "../models";
import { AbstractFrameBase } from "./AbstractFrameBase";

interface GlueTextButtonConfiguration {
    clickSoundPath?: string;
    /**
     * When set, will
     * @returns
     */
    onClick?: () => void;
    initialText?: string;
}

export class GlueTextButton extends AbstractFrameBase implements IClickEvent {
    public frame?: Frame;
    /**
     * A trigger is created when onClick is set inside the config.
     */
    public onClickTrigger?: Trigger;
    public config: GlueTextButtonConfiguration;

    /**
     * Required indicator since this frame created by name already produces a sound when clicked so this will be used to avoid playing a 2nd sound.
     */
    private createdByName = false;

    constructor(config: GlueTextButtonConfiguration, ...baseArgs: ConstructorParameters<typeof AbstractFrameBase>) {
        super(...baseArgs);
        this.config = config;
        this.render();
    }

    public static Default(context: number, owner?: Frame) {
        return new GlueTextButton({ initialText: "Default" }, "", context, owner, "ScriptDialogButton");
    }

    protected render() {
        if (this.inherits !== undefined) {
            this.frame = Frame.createType(this.name, this.owner, this.context, "GLUETEXTBUTTON", this.inherits);
        } else {
            this.createdByName = true;
            this.frame = Frame.create(this.name, this.owner, this.priority, this.context);
        }

        if (!this.frame) {
            return;
        }

        this.frame.clearPoints();
        this.frame.setAbsPoint(FRAMEPOINT_CENTER, 0.3, 0.3);
        this.frame.setSize(0.1, 0.1);

        if (this.config.initialText) {
            this.frame.setText(this.config.initialText);
        }

        if (this.config.onClick) {
            this.setOnClick(this.config.onClick);
        }
    }

    public setOnClick(fn: () => void) {
        if (!this.frame) {
            return;
        }

        const t = Trigger.create();
        this.onClickTrigger = t;

        t.triggerRegisterFrameEvent(this.frame, FRAMEEVENT_CONTROL_CLICK);
        t.addAction(() => {
            const player = MapPlayer.fromEvent();

            //created by name already has a sound played when clicked
            if (player && this.config?.clickSoundPath && !this.createdByName) {
                PlaySoundLocal(this.config.clickSoundPath || __theme.buttonClickSound || "", player.isLocal());
            }

            if (this.frame) {
                this.frame.setEnabled(false);
                this.frame.setEnabled(true);
            }

            fn();
        });
    }
}
