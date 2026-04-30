import { FrameUtils } from "src/frame-utils";

import { Frame, MapPlayer, Trigger } from "w3ts";
import { delay, PlaySoundLocal } from "warcraft-3-w3ts-utils";
import { IClickEvent } from "../models";
import { W3TSFrameComponentsTheme } from "../theme/theme";
import { AbstractFrameBase } from "./AbstractFrameBase";

export interface ButtonConfiguration {
    texture: string;
    /**
     * When onClick is defined, the button will resize automatically on it's own when clicked.
     * A sound will also be played if the clickSoundPath is defined.
     * @param btn
     * @param btnIcon
     * @returns
     */
    onClick?: (btn: Frame, btnIcon?: Frame) => void;
    clickSoundPath?: string;
}

/**
 * Only creates by type
 *
 *
 * Inherit Strings: "ScoreScreenTabButtonTemplate"
 */
export class Button extends AbstractFrameBase implements IClickEvent {
    public config: ButtonConfiguration;

    public buttonFrame?: Frame;
    /**
     * Used for the button texture
     */
    public iconBackdropFrame?: Frame;

    /**
     * Initialized when on click handler is set in the config.
     */
    public onClickTrigger?: Trigger;

    constructor(config: ButtonConfiguration, ...baseArgs: ConstructorParameters<typeof AbstractFrameBase>) {
        super(...baseArgs);

        this.config = config;
        this.render();
    }

    public static Default(context: number = 0, owner: Frame = FrameUtils.OriginFrameGameUI) {
        /**
         * @todo look for different inherit button since the highlight is behind the actual icon for some reason.
         *
         * It might be because we've added the icon frame to it, which is sitting on top of the actual button
         */
        // ReplaceableTextures\\CommandButtons\\BTNSelectHeroOn
        return new Button({ texture: "", onClick: () => {}, clickSoundPath: "Sound\\Interface\\MouseClick1.flac" }, "", context, owner, "ScoreScreenTabButtonTemplate");
    }

    protected render() {
        if (this.inherits !== undefined) {
            this.buttonFrame = Frame.createType(this.name, this.owner, this.context, "BUTTON", this.inherits);
        } else {
            this.buttonFrame = Frame.create(this.name, this.owner, this.priority, this.context);
        }

        if (!this.buttonFrame) {
            return;
        }

        this.iconBackdropFrame = Frame.createType(this.name + "iconBackdropFrame", this.owner, this.context, "BACKDROP", "");

        if (!this.iconBackdropFrame) {
            return;
        }

        // -- buttonIcon will mimic buttonFrame in size and position
        this.iconBackdropFrame.setAllPoints(this.buttonFrame);
        // -- set the texture
        this.iconBackdropFrame.setTexture(this.config.texture, 0, false);
        // }

        // -- place the Button to the left center of the Screen
        this.buttonFrame.setAbsPoint(FRAMEPOINT_CENTER, 0.1, 0.3);

        // -- set the Button's Size
        this.buttonFrame.setSize(0.03, 0.03);

        /**
         * Only necessary when the button is meant to be interactive.
         */
        if (this.config?.onClick) {
            this.setOnClick(this.config.onClick);
        }
    }

    public updateTexture(texture: string) {
        this.iconBackdropFrame?.setTexture(texture, 0, false);
    }

    /**
     * Automatically handles shrinking and expanding the button icon when clicked and playing a click sound if one is set in the config.
     *
     * Overrides previous on click function and destroys the previous on click trigger and creates a new one.
     * @param fn
     */
    public setOnClick(fn: (btn: Frame, btnIcon?: Frame) => void) {
        if (!this.buttonFrame) {
            return;
        }

        // Remove old trigger.
        this.onClickTrigger?.destroy();

        // Create new one
        const t = Trigger.create();
        this.onClickTrigger = t;

        t.triggerRegisterFrameEvent(this.buttonFrame, FRAMEEVENT_CONTROL_CLICK);

        t.addAction(() => {
            if (this.buttonFrame) {
                if (this.config.clickSoundPath) {
                    const player = MapPlayer.fromEvent();
                    PlaySoundLocal(this.config.clickSoundPath || W3TSFrameComponentsTheme.buttonClickSound || "", player?.isLocal());
                }

                this.iconBackdropFrame?.clearPoints();
                this.iconBackdropFrame?.setPoint(FRAMEPOINT_BOTTOMLEFT, this.buttonFrame, FRAMEPOINT_BOTTOMLEFT, 0.001, 0.001);
                this.iconBackdropFrame?.setPoint(FRAMEPOINT_TOPRIGHT, this.buttonFrame, FRAMEPOINT_TOPRIGHT, -0.001, -0.001);

                delay(0.05, () => {
                    this.iconBackdropFrame?.clearPoints();
                    if (this.buttonFrame) {
                        this.iconBackdropFrame?.setAllPoints(this.buttonFrame);
                    }
                });

                fn(this.buttonFrame, this.iconBackdropFrame);
            }

            this.buttonFrame?.setEnabled(false);
            this.buttonFrame?.setEnabled(true);
        });
    }
}

// Button.Default();
