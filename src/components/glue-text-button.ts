import { Frame, MapPlayer, Trigger } from "w3ts";
import { PlaySoundLocal } from "warcraft-3-w3ts-utils";
import { IClickEvent } from "../models";
import { AbstractFrameBase } from "./AbstractFrameBase";

interface GlueTextButtonConfiguration {
    clickSoundPath?: string;
    /**
     * Executes in the context of a trigger action.
     */
    onClick?: (glueButton: GlueTextButton) => void;
    initialText?: string;
    inherits?: string;
}

type FunctionThemed = (fart: number) => void;

//DebugButton/ReplayButton (same) BrowserButton (Doesn't work) ScoreScreenBottomButtonTemplate
export class GlueTextButton extends AbstractFrameBase implements IClickEvent {
    public frame?: Frame;
    /**
     * A trigger is created when onClick is set inside the config.
     */
    public onClickTrigger?: Trigger;
    public config: GlueTextButtonConfiguration;
    private static Theme: GlueTextButtonConfiguration;

    /**
     * Required indicator since when this frame is created by name, it already produces a sound when clicked so this will be used to avoid playing a 2nd sound.
     */
    private createdByName = false;

    constructor(config?: GlueTextButtonConfiguration, ...baseArgs: ConstructorParameters<typeof AbstractFrameBase>) {
        super(...baseArgs);
        this.config = config || {};
        this.render();
        // new GlueTextButton()
    }

    public static CreateDefault(context: number, owner?: Frame) {
        return new GlueTextButton({ initialText: "Default", clickSoundPath: "Sound\\Interface\\BigButtonClick.flac" }, "", context, owner, "ScriptDialogButton");
    }

    public static CreateType(name: string, context: number, inherits: string, owner?: Frame, config?: Omit<GlueTextButtonConfiguration, "inherits">) {
        return new GlueTextButton(config, name, context, owner, inherits);
    }

    public static CreateNamed(name: string, context: number, owner?: Frame, priority?: number, config?: Omit<GlueTextButtonConfiguration, "inherits" | "clickSoundPath">) {
        return new GlueTextButton(config || {}, name, context, owner, undefined, priority);
    }

    public static CreateThemed(name: string, context: number, owner?: Frame, overrides?: Partial<GlueTextButtonConfiguration>) {
        const mergedConfiguration = { ...GlueTextButton.Theme, ...overrides };

        return new GlueTextButton(mergedConfiguration, name, context, owner, mergedConfiguration?.inherits || "");
    }

    public static SaveTheme(themeConfiguration: GlueTextButtonConfiguration) {
        GlueTextButton.Theme = themeConfiguration;
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

        /**
         * trigger is creatd by default so there exists a click sound.
         */
        this.setOnClick(this.config.onClick || (() => {}));
    }

    public setOnClick(fn: (glueButton: GlueTextButton) => void) {
        if (!this.frame) {
            return;
        }
        this.onClickTrigger?.destroy();

        const t = Trigger.create();
        this.onClickTrigger = t;

        t.triggerRegisterFrameEvent(this.frame, FRAMEEVENT_CONTROL_CLICK);
        t.addAction(() => {
            const player = MapPlayer.fromEvent();
            const soundPath = this.config.clickSoundPath || "";
            //created by name already has a sound played when clicked
            if (player && soundPath && !this.createdByName) {
                PlaySoundLocal(soundPath, player.isLocal());
            }

            if (this.frame) {
                this.frame.setEnabled(false);
                this.frame.setEnabled(true);
            }

            fn.bind(this);
            fn(this);
        });
    }
}

/**
 * @pagination idea
 * use blue button for current page and normal button for others
 *
 * show page numbers on bottom.
 */
