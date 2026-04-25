import { Frame, Timer } from "w3ts";
import { delayedTimer } from "warcraft-3-w3ts-utils";
import { Components } from "../frame-components";
import { FrameUtils } from "../frame-utils";
import { Panel } from "../panels/panel";
import { Text } from "../text/text";
import { Tooltip } from "./Tooltip";

interface TimerFrameConfig {
    useTitle?: boolean;
    useButton?: boolean;
}

export class TimerFrame {
    context: number;
    name: string;
    owner: Frame;

    containerFrame?: Frame;
    buttonFrames?: ReturnType<typeof Components.IconButton>;
    private titleText?: Frame;
    private timer?: Timer;
    private timerText?: Frame;
    private buttonTooltip?: Tooltip;
    private config?: TimerFrameConfig;

    constructor(context: number, name: string, owner: Frame, config?: TimerFrameConfig) {
        this.context = context;
        this.name = name;
        this.owner = owner;
        this.timer = Timer.create();
        this.config = config;

        this.render();
    }

    private render() {
        this.containerFrame = Panel.Render(0, this.name + "timerPanel", FrameUtils.OriginFrameGameUI);
        if (!this.containerFrame) {
            return;
        }

        this.containerFrame.clearPoints();
        this.containerFrame.setAbsPoint(FRAMEPOINT_CENTER, 0.4, 0.3);
        this.containerFrame?.setSize(0.08, 0.025);

        if (this.config?.useTitle) {
            this.titleText = Text.Render(this.context, this.name + "titleText", this.containerFrame);
            if (!this.titleText) {
                return;
            }

            this.titleText.clearPoints();
            this.titleText.setSize(0.03, 0);
            this.titleText.setPoint(FRAMEPOINT_LEFT, this.containerFrame, FRAMEPOINT_LEFT, 0.005, 0);
            this.titleText.setText("Timer");
        } else if (this.config?.useButton) {
            this.buttonFrames = Components.IconButton(this.context, this.name + "button", "", this.containerFrame);
            this.buttonTooltip = new Tooltip("", "", this.name, this.context, this.buttonFrames.button, { includeBackground: true });

            // if (this.buttonFrames.button) {
            //     this.buttonTooltip.textFrame?.clearPoints();
            //     this.buttonTooltip.textFrame?.setPoint(FRAMEPOINT_TOPLEFT, this.buttonFrames.button, FRAMEPOINT_BOTTOMLEFT, 0, 0);
            // }

            this.buttonFrames.button?.clearPoints();
            this.buttonFrames.button?.setPoint(FRAMEPOINT_LEFT, this.containerFrame, FRAMEPOINT_LEFT, 0.005, 0);
            this.buttonFrames.button?.setSize(this.buttonFrames.button.width * 0.5, this.buttonFrames.button.height * 0.5);
        }

        this.timerText = Text.Render(this.context, this.name + "timerText", this.containerFrame);
        if (!this.timerText) {
            return;
        }

        this.timerText.setText("0");
        this.timerText.clearPoints();
        this.timerText.setSize(0.05, 0);
        this.timerText.setPoint(FRAMEPOINT_LEFT, this.titleText || this.buttonFrames?.button || this.containerFrame, FRAMEPOINT_RIGHT, 0.005, 0);
    }

    /**
     * Not sure what would happen if you call start before it elapsed...
     * @param duration
     *
     * If we add a stop timer function then we need to choose whether or not to call the on completion function from the previous start call. and we'd also need to destroy the delayed timer.
     * which means we'd need to save the on complete function and the delayed timer.
     * we don't need this atm.
     */
    start(duration: number, onCompletion?: () => void) {
        this.timerText?.setText(`${duration}`);
        this.timer?.destroy();
        this.timer = Timer.create();
        this.timer.start(1, true, () => {
            //update timer text
            this.timerText?.setText(`${--duration}`);
        });

        //gets called after you call start when it just elapsed
        delayedTimer(duration, () => {
            if (onCompletion) {
                onCompletion();
            }
        });
    }

    updateTitle(text: string) {
        if (!this.config?.useTitle) {
            return;
        }

        this.titleText?.setText(text);
    }

    /**
     *
     * @param texture
     * @param tooltip Using simple tooltip with header only. This doens't really need a body and a header
     */
    updateButton(texture: string, tooltip: string) {
        this.buttonFrames?.buttonIconFrame?.setTexture(texture, 0, false);
        this.buttonTooltip?.update(tooltip, "");
    }
}
