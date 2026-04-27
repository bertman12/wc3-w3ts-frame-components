import { Frame, MapPlayer, Trigger } from "w3ts";
import { delay, PlaySoundLocal } from "warcraft-3-w3ts-utils";
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
    /**
     * Determines if the button will be made as SIMPLEBUTTON instead of BUTTON
     */
    isSimple?: boolean;
    clickSoundPath?: string;
}

export class Button extends AbstractFrameBase {
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

    protected render() {
        if (this.config?.isSimple) {
            this.buttonFrame = Frame.createType(this.name, this.owner, this.context, "SIMPLEBUTTON", this.inherits);
        } else {
            this.buttonFrame = Frame.createType(this.name, this.owner, this.context, "BUTTON", this.inherits || "ScoreScreenTabButtonTemplate");
        }

        if (!this.buttonFrame) {
            return;
        }

        // --create a BACKDROP for Button which displays the Texture
        if (this.config?.isSimple) {
            this.buttonFrame.setTexture(this.config.texture, 0, false);
        } else {
            this.iconBackdropFrame = Frame.createType(this.name + "iconBackdropFrame", this.owner, this.context, "BACKDROP", "");
            if (!this.iconBackdropFrame) {
                return;
            }

            // -- buttonIcon will mimic buttonFrame in size and position
            this.iconBackdropFrame.setAllPoints(this.buttonFrame);
            // -- set the texture
            this.iconBackdropFrame.setTexture(this.config.texture, 0, false);
        }

        // -- place the Button to the left center of the Screen
        this.buttonFrame.setAbsPoint(FRAMEPOINT_CENTER, 0.1, 0.3);

        // -- set the Button's Size
        this.buttonFrame.setSize(0.03, 0.03);

        /**
         * Only necessary when the button is meant to be interactive.
         */
        if (this.config?.onClick) {
            const t = Trigger.create();
            this.onClickTrigger = t;

            t.triggerRegisterFrameEvent(this.buttonFrame, FRAMEEVENT_CONTROL_CLICK);

            t.addAction(() => {
                if (this.config?.onClick && this.buttonFrame && this.config.clickSoundPath) {
                    const player = MapPlayer.fromEvent();
                    PlaySoundLocal(this.config.clickSoundPath || "", player?.isLocal());

                    this.iconBackdropFrame?.clearPoints();
                    this.iconBackdropFrame?.setPoint(FRAMEPOINT_BOTTOMLEFT, this.buttonFrame, FRAMEPOINT_BOTTOMLEFT, 0.001, 0.001);
                    this.iconBackdropFrame?.setPoint(FRAMEPOINT_TOPRIGHT, this.buttonFrame, FRAMEPOINT_TOPRIGHT, -0.001, -0.001);

                    delay(0.05, () => {
                        this.iconBackdropFrame?.clearPoints();
                        if (this.buttonFrame) {
                            this.iconBackdropFrame?.setAllPoints(this.buttonFrame);
                        }
                    });

                    this.config.onClick(this.buttonFrame, this.iconBackdropFrame);
                }

                this.buttonFrame?.setEnabled(false);
                this.buttonFrame?.setEnabled(true);
            });
        }
    }

    public updateTexture(texture: string) {
        if (this.config?.isSimple) {
            this.buttonFrame?.setTexture(texture, 0, false);
        } else {
            this.iconBackdropFrame?.setTexture(texture, 0, false);
        }
    }
}
