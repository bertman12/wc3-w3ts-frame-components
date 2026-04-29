import { Timer } from "w3ts";
import { delay } from "warcraft-3-w3ts-utils";
import { AbstractFrameBase } from "./AbstractFrameBase";
import { Backdrop } from "./backdrop";
import { Button } from "./button";
import { Text } from "./text";
interface TimerFrameConfig {
    useTitle?: boolean;
    useButton?: boolean;
}

export class TimerFrame extends AbstractFrameBase {
    /**
     * Serves as the container for the other frames in the timer.
     */
    public backdrop?: Backdrop;
    public button?: Button;
    private titleText?: Text;
    private timer?: Timer;
    private timerText?: Text;
    // private buttonTooltip?: Tooltip;
    private config?: TimerFrameConfig;

    constructor(config?: TimerFrameConfig, ...baseArgs: ConstructorParameters<typeof AbstractFrameBase>) {
        super(...baseArgs);

        this.timer = Timer.create();
        this.config = config;

        this.render();
    }

    protected render() {
        this.backdrop = new Backdrop(this.name + "timer", this.context, this.owner, this.inherits);

        if (!this.backdrop.frame) {
            return;
        }

        this.backdrop.frame.clearPoints();
        this.backdrop.frame.setAbsPoint(FRAMEPOINT_CENTER, 0.4, 0.3);
        this.backdrop.frame.setSize(0.08, 0.025);

        if (this.config?.useTitle) {
            this.titleText = new Text({}, this.name + "titleText", this.context, this.backdrop.frame, "");
            if (!this.titleText.frame) {
                return;
            }

            this.titleText.frame.clearPoints();
            this.titleText.frame.setSize(0.03, 0);
            this.titleText.frame.setPoint(FRAMEPOINT_LEFT, this.backdrop.frame, FRAMEPOINT_LEFT, 0.005, 0);
            this.titleText.frame.setText("Timer");
        } else if (this.config?.useButton) {
            this.button = new Button({ texture: "" }, this.name + "timerButton", this.context, this.owner, this.inherits || "");

            this.button.buttonFrame?.clearPoints();
            this.button.buttonFrame?.setPoint(FRAMEPOINT_LEFT, this.backdrop.frame, FRAMEPOINT_LEFT, 0.005, 0);
            this.button.buttonFrame?.setSize(this.button.buttonFrame.width * 0.5, this.button.buttonFrame.height * 0.5);
        }

        this.timerText = new Text({}, this.name + "timerText", this.context, this.backdrop.frame, "");

        if (!this.timerText?.frame) {
            return;
        }

        this.timerText.frame.setText("0");
        this.timerText.frame.clearPoints();
        this.timerText.frame.setSize(0.05, 0);
        this.timerText.frame.setPoint(FRAMEPOINT_LEFT, this.titleText?.frame || this.button?.buttonFrame || this.backdrop.frame, FRAMEPOINT_RIGHT, 0.005, 0);
    }

    /**
     * Not sure what would happen if you call start before it elapsed...
     * @param duration
     *
     * If we add a stop timer function then we need to choose whether or not to call the on completion function from the previous start call. and we'd also need to destroy the delayed timer.
     * which means we'd need to save the on complete function and the delayed timer.
     * we don't need this atm.
     */
    start(duration: number, isRepeating?: boolean, onCompletion?: () => void) {
        this.timerText?.frame?.setText(`${duration}`);
        this.timer?.destroy();
        this.timer = Timer.create();
        this.timer.start(1, true, () => {
            //update timer text
            this.timerText?.frame?.setText(`${--duration}`);
        });

        //gets called after you call start when it just elapsed
        delay(duration, () => {
            this.backdrop?.frame?.setVisible(false);

            if (onCompletion) {
                onCompletion();
            }

            //call itself.
            if (isRepeating) {
                this.start(duration, isRepeating, onCompletion);
            }
        });
    }

    updateTitle(text: string) {
        if (!this.config?.useTitle) {
            return;
        }

        this.titleText?.frame?.setText(text);
    }

    /**
     * @param texture
     * @param tooltip Using simple tooltip with header only. This doens't really need a body and a header
     */
    updateIconButton(texture: string, tooltip: string) {
        this.button?.iconBackdropFrame?.setTexture(texture, 0, false);
        // this.buttonTooltip?.update(tooltip, "");
    }
}
