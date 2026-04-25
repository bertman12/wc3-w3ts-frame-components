import { PlaySoundLocal } from "src/sound/utils";
import { Frame, Trigger } from "w3ts";
import { delayedTimer } from "warcraft-3-w3ts-utils";
import { FrameUtils } from "../frame-utils";
import { Inheritables } from "../names";

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
    clickSound?: string;
}

export class Button {
    context: number;
    name: string;
    owner: Frame;
    containerFrame?: Frame;
    iconFrame?: Frame;

    config?: ButtonConfiguration;

    private onClickTrigger?: Trigger;

    constructor(context: number, name: string, owner: Frame, config?: ButtonConfiguration) {
        this.context = context;
        this.name = name;
        this.owner = owner;
        this.config = config;

        this.render();
    }

    private render() {
        let button: Frame | undefined = undefined;

        if (this.config?.isSimple) {
            button = Frame.fromHandle(BlzCreateFrameByType("SIMPLEBUTTON", this.name, this.owner?.handle || FrameUtils.OriginFrameGameUIHandle, Inheritables.JMT_SimpleButtonBase, this.context));
        } else {
            button = Frame.fromHandle(BlzCreateFrameByType("BUTTON", this.name, this.owner?.handle || FrameUtils.OriginFrameGameUIHandle, "ScoreScreenTabButtonTemplate", this.context));
        }

        if (!button) {
            return;
        }
        
        this.containerFrame = button;

        /**
         * Can't do this if it's a simlpe button ?
         */
        // --create a BACKDROP for Button which displays the Texture
        if (this.config?.isSimple) {
            button.setTexture(this.config.texture || "", 0, false);
        } else {
            const buttonIconFrame = Frame.fromHandle(BlzCreateFrameByType("BACKDROP", this.name + "IconButtonIcon", button.handle, "", this.context));
            if (!buttonIconFrame) {
                return;
            }
            this.iconFrame = buttonIconFrame;
            // -- buttonIcon will mimic buttonFrame in size and position
            BlzFrameSetAllPoints(buttonIconFrame.handle, button.handle);
            // -- set the texture
            BlzFrameSetTexture(buttonIconFrame.handle, this.config?.texture || "", 0, false);
        }

        // -- place the Button to the left center of the Screen
        BlzFrameSetAbsPoint(button.handle, FRAMEPOINT_CENTER, 0.1, 0.3);
        // -- set the Button's Size
        BlzFrameSetSize(button.handle, 0.03, 0.03);

        /**
         * Leaks if never destroyed
         */
        const t = Trigger.create();
        this.onClickTrigger = t;
        t.triggerRegisterFrameEvent(button, FRAMEEVENT_CONTROL_CLICK);
        t.addAction(() => {
            if (this.config?.onClick && button) {
                const localP = GetLocalPlayer();
                const p = GetTriggerPlayer();

                PlaySoundLocal(this.config?.clickSound || "Sound\\Interface\\BigButtonClick.flac", localP === p);

                this.iconFrame?.clearPoints();
                this.iconFrame?.setPoint(FRAMEPOINT_BOTTOMLEFT, button, FRAMEPOINT_BOTTOMLEFT, 0.001, 0.001);
                this.iconFrame?.setPoint(FRAMEPOINT_TOPRIGHT, button, FRAMEPOINT_TOPRIGHT, -0.001, -0.001);

                delayedTimer(0.05, () => {
                    this.iconFrame?.clearPoints();
                    if (button) {
                        this.iconFrame?.setAllPoints(button);
                    }
                });

                this.config.onClick(button, this.iconFrame);
            }

            //do this regardless if they registered a click event.
            button?.setEnabled(false);
            button?.setEnabled(true);
        });
    }

    public updateTexture(texture: string) {
        if (this.config?.isSimple) {
            this.containerFrame?.setTexture(texture, 0, false);
        } else {
            this.iconFrame?.setTexture(texture, 0, false);
        }
    }
}
