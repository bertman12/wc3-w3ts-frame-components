import { ICompositeFrameComponents } from "src/models/components";
import { ICompositeFrameConfigurationBase } from "src/models/FrameTypes";
import { Frame, Timer } from "w3ts";
import { delay } from "warcraft-3-w3ts-utils";
import { Backdrop } from "../backdrop";
import { Button } from "../button";
import { CompositeFrame } from "../Core/CompositeFrame";
import { MonoTest } from "../Core/MonoFrame";
import { Text } from "../text";
import { Tooltip } from "../tooltip";
import { TestCompositeFrame } from "./test";

export interface TimerCompositeFrameConfiguration extends ICompositeFrameConfigurationBase {
    useTitle?: boolean;
    useButton?: boolean;
    timerTitle?: string;
    buttonTexture?: string;
    buttonTooltipText?: string;
    backdropWidth?: number;
    xOffset?: number;
}

interface TimerCompositeFrameChildFrames extends ICompositeFrameComponents {
    testFrame: TestCompositeFrame;
    monoTestFrame: MonoTest;
}

export class TimerCompositeFrame extends CompositeFrame<TimerCompositeFrameConfiguration, TimerCompositeFrameChildFrames> {
    public backdrop?: Backdrop;
    public button?: Button;
    public buttonTooltip?: Tooltip;
    public titleText?: Text;
    public timer?: Timer;
    public timerText?: Text;

    private constructor(...args: ConstructorParameters<typeof CompositeFrame<TimerCompositeFrameConfiguration, TimerCompositeFrameChildFrames>>) {
        super(...args);
        this.timer = Timer.create();
        this.render();
    }

    public static get DefaultConfiguration(): TimerCompositeFrameConfiguration {
        return {
            // somethingRequired: false,
        };
    }

    public static Create(args: { context: number; name?: string; owner?: Frame; overrides?: TimerCompositeFrameConfiguration }): TimerCompositeFrame {
        return new TimerCompositeFrame(args.context, args.overrides ?? TimerCompositeFrame.DefaultConfiguration, args.name, args.owner);
    }

    protected render(): void {
        this.backdrop = Backdrop.CreateDefault(this.context, this.owner);

        if (!this.backdrop.frame) {
            return;
        }

        this.backdrop.frame.clearPoints();
        this.backdrop.frame.setAbsPoint(FRAMEPOINT_CENTER, 0.4, 0.3);
        this.backdrop.frame.setSize(this.configuration.backdropWidth ?? 0.08, 0.025);

        const frameName = this.name ?? "TimerCompositeFrame";

        if (this.configuration.buttonTexture) {
            this.button = new Button({ texture: this.configuration.buttonTexture, onClick: () => {} }, `${frameName}Button`, this.context, this.owner, "");
            this.button.buttonFrame?.setEnabled(true);
            this.button.buttonFrame?.clearPoints();
            this.button.buttonFrame?.setPoint(FRAMEPOINT_LEFT, this.backdrop.frame, FRAMEPOINT_LEFT, this.configuration.xOffset ?? 0.01, 0);
            this.button.buttonFrame?.setSize(this.button.buttonFrame.width * 0.4, this.button.buttonFrame.height * 0.4);

            if (this.configuration.buttonTooltipText) {
                this.buttonTooltip = Tooltip.CreateThemed(`${frameName}Tooltip`, this.context, this.button.buttonFrame, {
                    headerText: "Timer",
                    bodyText: this.configuration.buttonTooltipText,
                });
            }
        }

        if (this.configuration.timerTitle) {
            this.titleText = new Text({}, `${frameName}TitleText`, this.context, this.backdrop.frame, "");
            if (!this.titleText.frame) {
                return;
            }

            this.titleText.frame.clearPoints();
            this.titleText.frame.setSize(0.03, 0);
            this.titleText.frame.setPoint(FRAMEPOINT_LEFT, this.button?.buttonFrame ?? this.backdrop.frame, this.button?.buttonFrame ? FRAMEPOINT_RIGHT : FRAMEPOINT_LEFT, 0.01, 0);
            this.titleText.frame.setText(this.configuration.timerTitle);
        }

        this.timerText = new Text({}, `${frameName}TimerText`, this.context, this.backdrop.frame, "");
        if (!this.timerText.frame) {
            return;
        }

        this.timerText.frame.setText("0");
        this.timerText.frame.clearPoints();
        this.timerText.formatSize();
        this.timerText.frame.setPoint(FRAMEPOINT_RIGHT, this.backdrop.frame, FRAMEPOINT_RIGHT, 0, 0);
        this.autoSize();
    }

    public start(duration: number, isRepeating?: boolean, onCompletion?: () => void): void {
        this.timerText?.frame?.setText(`${duration}`);
        this.timerText?.formatSize();

        this.timer?.destroy();
        this.timer = Timer.create();
        this.timer.start(1, true, () => {
            this.timerText?.frame?.setText(`${--duration}`);
        });

        this.backdrop?.frame?.setVisible(true);
        this.button?.buttonFrame?.setVisible(true);

        delay(duration, () => {
            this.backdrop?.frame?.setVisible(false);
            this.button?.buttonFrame?.setVisible(false);

            if (onCompletion) {
                this.timer?.destroy();
                onCompletion();
            }
        });
    }

    public autoSize(buffer?: number): void {
        const maxWidth = 0.2;
        const minWidth = 0.03;
        const leftPadding = 0.005;
        const timerTextOffset = 0.005;
        const rightPadding = 0.005;
        const timerTextLength = this.timerText?.frame?.text.length ?? 0;
        const titleTextLength = this.titleText?.frame?.text.length ?? 0;
        const buttonWidth = this.button?.buttonFrame?.width ?? 0;

        let width = 0.08 + buttonWidth + leftPadding + (titleTextLength > 0 ? 0.004 * titleTextLength + timerTextOffset : timerTextOffset) + 0.004 * timerTextLength + rightPadding + (buffer ?? 0);

        width = Math.min(maxWidth, Math.max(minWidth, width));
        this.backdrop?.frame?.setSize(width, this.backdrop.frame.height);
    }

    public updateTitle(text: string): void {
        if (!this.configuration.useTitle) {
            return;
        }

        this.titleText?.frame?.setText(text);
        this.autoSize();
    }
}
