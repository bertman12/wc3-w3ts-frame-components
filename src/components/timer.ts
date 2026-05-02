import { Timer } from "w3ts";
import { delay } from "warcraft-3-w3ts-utils";
import { AbstractFrameBase } from "./AbstractFrameBase";
import { Backdrop } from "./backdrop";
import { Button } from "./button";
import { Text } from "./text";
import { Tooltip } from "./tooltip";
interface TimerFrameConfig {
    useTitle?: boolean;
    useButton?: boolean;
    timerTitle?: string;
    buttonTexture?: string;
    /**
     * @todo
     */
    buttonTooltipText?: string;
    backdropWidth?: number;
    /**
     * The X offset of the contents relative to the backdrop
     */
    xOffset?: number;
}

export class TimerFrame extends AbstractFrameBase {
    /**
     * Serves as the container for the other frames in the timer.
     */
    public backdrop?: Backdrop;
    public button?: Button;
    public buttonTooltip?: Tooltip;
    public titleText?: Text;
    public timer?: Timer;
    public timerText?: Text;
    public config?: TimerFrameConfig;

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

        //Space between button, title , etc
        const DEFAULT_GAP_X = 0.01; //0.005
        this.backdrop.frame.clearPoints();
        this.backdrop.frame.setAbsPoint(FRAMEPOINT_CENTER, 0.4, 0.3);
        this.backdrop.frame.setSize(0.08, 0.025);

        //Should be allowed to use both.
        if (this.config?.buttonTexture) {
            this.button = new Button({ texture: this.config.buttonTexture, onClick: () => {} }, this.name + "timerButton", this.context, this.owner, this.inherits || "");
            this.button.buttonFrame?.setEnabled(true);
            this.button.buttonFrame?.clearPoints();
            this.button.buttonFrame?.setPoint(FRAMEPOINT_LEFT, this.backdrop.frame, FRAMEPOINT_LEFT, 0.01, 0);
            this.button.buttonFrame?.setSize(this.button.buttonFrame.width * 0.4, this.button.buttonFrame.height * 0.4); //half the normal size

            if (this.config.buttonTooltipText) {
                this.buttonTooltip = new Tooltip("Timer", "A hero respawn timer.", this.name + "button-tooltip", this.context, this.button.buttonFrame);
            }
        }

        if (this.config?.timerTitle) {
            this.titleText = new Text({}, this.name + "titleText", this.context, this.backdrop.frame, "");
            if (!this.titleText.frame) {
                return;
            }

            this.titleText.frame.clearPoints();
            this.titleText.frame.setSize(0.03, 0);
            //Tries to pin next to button if we use one, otherwise pin next to backdrop
            if (this.button?.buttonFrame) {
                this.titleText.frame.setPoint(FRAMEPOINT_LEFT, this.button?.buttonFrame, FRAMEPOINT_RIGHT, 0.01, 0);
            } else {
                this.titleText.frame.setPoint(FRAMEPOINT_LEFT, this.backdrop.frame, FRAMEPOINT_LEFT, 0.01, 0);
            }
            this.titleText.frame.setText(this.config.timerTitle || "Timer");
        }

        this.timerText = new Text({}, this.name + "timerText", this.context, this.backdrop.frame, "");

        if (!this.timerText?.frame) {
            return;
        }

        this.autoSize();

        this.timerText.frame.setText("0");
        this.timerText.frame.clearPoints();
        this.timerText.formatSize();
        // this.timerText.frame.setSize(0.05, 0);
        // pin to the right of the timer backdrop.
        this.timerText.frame.setPoint(FRAMEPOINT_RIGHT, this.backdrop.frame, FRAMEPOINT_RIGHT, 0, 0);
        // this.timerText.frame.setPoint(FRAMEPOINT_LEFT, this.titleText?.frame || this.button?.buttonFrame || this.backdrop.frame, FRAMEPOINT_RIGHT, 0.005, 0);
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
        // Setup initial text
        this.timerText?.frame?.setText(`${duration}`);
        this.timerText?.formatSize();

        // Cleanup previous timer
        this.timer?.destroy();
        this.timer = Timer.create();

        // Start
        this.timer.start(1, true, () => {
            this.timerText?.frame?.setText(`${--duration}`);
        });

        // Toggle on visibility of frames.
        this.backdrop?.frame?.setVisible(true);
        this.button?.buttonFrame?.setVisible(true);

        // Setup callback after timer duration elapses.
        delay(duration, () => {
            // Hide frames on completion
            this.backdrop?.frame?.setVisible(false);
            this.button?.buttonFrame?.setVisible(false);

            if (onCompletion) {
                this.timer?.destroy();
                onCompletion();
            }

            //call itself. seems broken
            // if (isRepeating) {
            //     this.start(duration, isRepeating, onCompletion);
            // }
        });
    }

    /**
     * Resizes the backdrop width to fit the timer and title text.
     * @param buffer Optional additional width added to the calculated size.
     */
    public autoSize(buffer?: number) {
        const maxWidth = 0.2;
        const minWidth = 0.03;

        const leftPadding = 0.005; // offset of the first element from the backdrop's left edge
        const timerTextOffset = 0.005; // the setPoint offset used when anchoring timerText to its left neighbour
        const rightPadding = 0.005; // breathing room after the timerText on the right

        const timerTextLength = this.timerText?.frame?.text.length || 0;
        const titleTextLength = this.titleText?.frame?.text.length || 0;

        //What's the min width for this?
        const BACKDROP_DEFAULT_WIDTH = 0.08;
        const buttonWidth = this.button?.buttonFrame?.width || 0;

        // const spaceBetween Text and timer duration

        let width = BACKDROP_DEFAULT_WIDTH + buttonWidth + leftPadding + (titleTextLength > 0 ? 0.004 * titleTextLength + timerTextOffset : timerTextOffset) + 0.004 * timerTextLength + rightPadding + (buffer || 0);

        if (width > maxWidth) {
            width = maxWidth;
        }

        if (width < minWidth) {
            width = minWidth;
        }

        this.backdrop?.frame?.setSize(width, this.backdrop.frame.height);
    }

    updateTitle(text: string) {
        if (!this.config?.useTitle) {
            return;
        }

        this.titleText?.frame?.setText(text);
        this.autoSize();
    }
}
