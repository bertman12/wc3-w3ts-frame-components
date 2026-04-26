import { PlaySoundLocal } from "src/sound/utils";
import { Frame, MapPlayer, Trigger } from "w3ts";
import { delayedTimer } from "warcraft-3-w3ts-utils";
import { FrameUtils } from "../frame-utils";
import { Inheritables } from "../names";
import { AbstractFrameBase } from "./AbstractFrameBase";

export interface ButtonRenderData {
    iconTexture?: string;
    tooltip?: string;
    tooltipTitle?: string;
}

interface ButtonConfiguration {
    texture?: string;
    onClick?: (btn: Frame, btnIcon?: Frame) => void;
    /**
     * Determines if the button will be made as SIMPLEBUTTON instead of BUTTON
     */
    isSimple?: boolean;
    /**
     * Default to Sound\\Interface\\BigButtonClick.flac
     */
    clickSoundPath?: string;
}

export class Button extends AbstractFrameBase {
    public buttonFrame?: Frame;
    /**
     * Used for the button texture
     */
    public iconFrame?: Frame;

    public config?: ButtonConfiguration;

    /**
     * Initialized when on click handler is set in the config.
     */
    public onClickTrigger?: Trigger;

    constructor(config?: ButtonConfiguration, ...baseArgs: ConstructorParameters<typeof AbstractFrameBase>) {
        super(...baseArgs);

        this.config = config;
        this.render();
    }

    protected render() {
        if (this.config?.isSimple) {
            this.buttonFrame = Frame.fromHandle(BlzCreateFrameByType("SIMPLEBUTTON", this.name, this.owner?.handle || FrameUtils.OriginFrameGameUIHandle, Inheritables.JMT_SimpleButtonBase, this.context));
        } else {
            this.buttonFrame = Frame.createType(this.name, this.owner || FrameUtils.OriginFrameGameUI, this.context, "BUTTON", "ScoreScreenTabButtonTemplate");
            // this.buttonFrame = Frame.fromHandle(BlzCreateFrameByType("BUTTON", this.name, this.owner?.handle || FrameUtils.OriginFrameGameUIHandle, "ScoreScreenTabButtonTemplate", this.context));
        }

        if (!this.buttonFrame) {
            return;
        }

        /**
         * Can't do this if it's a simlpe button ?
         */
        // --create a BACKDROP for Button which displays the Texture
        if (this.config?.isSimple) {
            this.buttonFrame.setTexture(this.config.texture || "", 0, false);
        } else {
            const buttonIconFrame = Frame.fromHandle(BlzCreateFrameByType("BACKDROP", this.name + "IconButtonIcon", this.buttonFrame.handle, "", this.context));
            if (!buttonIconFrame) {
                return;
            }
            this.iconFrame = buttonIconFrame;

            // -- buttonIcon will mimic buttonFrame in size and position
            buttonIconFrame.setAllPoints(this.buttonFrame);
            // -- set the texture
            buttonIconFrame.setTexture(this.config?.texture || "", 0, false);
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
                    PlaySoundLocal(this.config?.clickSoundPath || "", player?.isLocal());

                    this.iconFrame?.clearPoints();
                    this.iconFrame?.setPoint(FRAMEPOINT_BOTTOMLEFT, this.buttonFrame, FRAMEPOINT_BOTTOMLEFT, 0.001, 0.001);
                    this.iconFrame?.setPoint(FRAMEPOINT_TOPRIGHT, this.buttonFrame, FRAMEPOINT_TOPRIGHT, -0.001, -0.001);

                    delayedTimer(0.05, () => {
                        this.iconFrame?.clearPoints();
                        if (this.buttonFrame) {
                            this.iconFrame?.setAllPoints(this.buttonFrame);
                        }
                    });

                    this.config.onClick(this.buttonFrame, this.iconFrame);
                }

                //do this regardless if they registered a click event.
                this.buttonFrame?.setEnabled(false);
                this.buttonFrame?.setEnabled(true);
            });
        }
    }

    public updateTexture(texture: string) {
        if (this.config?.isSimple) {
            this.buttonFrame?.setTexture(texture, 0, false);
        } else {
            this.iconFrame?.setTexture(texture, 0, false);
        }
    }
}
