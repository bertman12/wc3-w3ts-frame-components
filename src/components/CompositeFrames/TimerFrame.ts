import { Frame, Timer } from "w3ts";
import { ICompositeFrameChildFrames, ICompositeFrameConfigurationBase } from "../../models";
import { CompositeFrame } from "../Core/CompositeFrame";
import { BackdropFrame } from "../MonoFrames/BackdropFrame";
import { TextFrame } from "../MonoFrames/TextFrame";
import { ButtonFrame } from "./ButtonFrame";
import { TooltipFrame } from "./TooltipFrame";

export interface TimerFrameConfiguration extends ICompositeFrameConfigurationBase {
    /** Minimum width of the backdrop; it grows to fit its content. Default value: 0.08 */
    backdropWidth?: number;
    /** Texture of the optional icon. The icon is not created when unset. Default value: undefined */
    iconTexture?: string;
    /** Tooltip text for the icon. No tooltip is created when unset. Default value: undefined */
    iconTooltipText?: string;
    /** Title text shown before the counter. No title is created when unset. Default value: undefined */
    timerTitle?: string;
    /** Currently unused. Default value: false */
    useTitle?: boolean;
    /** Horizontal padding between the backdrop edge and its content. Default value: 0.01 */
    xOffset?: number;
}

type TimerFrameDefaultConfiguration = Required<Pick<TimerFrameConfiguration, "backdropWidth" | "useTitle" | "xOffset">> & Pick<TimerFrameConfiguration, "iconTexture" | "iconTooltipText" | "timerTitle">;

interface TimerFrameChildFrames extends ICompositeFrameChildFrames {
    backdrop: BackdropFrame;
    icon?: ButtonFrame;
    iconTooltip?: TooltipFrame;
    timerText: TextFrame;
    titleText?: TextFrame;
}

export class TimerFrame extends CompositeFrame<TimerFrameConfiguration, TimerFrameChildFrames> {
    public textUpdateTimer: Timer;
    public timeElapsedTimer: Timer;

    private constructor(...args: ConstructorParameters<typeof CompositeFrame<TimerFrameConfiguration, TimerFrameChildFrames>>) {
        super(...args);
        this.textUpdateTimer = Timer.create();
        this.timeElapsedTimer = Timer.create();
        this.render();
    }

    public static get DefaultConfiguration(): TimerFrameDefaultConfiguration {
        return {
            backdropWidth: 0.08,
            iconTexture: undefined,
            iconTooltipText: undefined,
            timerTitle: undefined,
            useTitle: false,
            xOffset: 0.01,
        };
    }

    /**
     * @param args.context The context of the container frame and all child frames. Default value: 0
     */
    public static Create(args: { context?: number; name?: string; owner?: Frame; overrides?: TimerFrameConfiguration }): TimerFrame {
        return new TimerFrame(args.context, { ...TimerFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner);
    }

    protected render(): void {
        const name = this.name ?? "TimerFrame";
        const backdrop = BackdropFrame.CreateType({ context: this.context, inherits: "QuestButtonBaseTemplate", name: `${name}Backdrop`, owner: this.owner });
        if (!backdrop.frame) {
            return;
        }

        backdrop.frame.clearPoints();
        backdrop.frame.setAbsPoint(FRAMEPOINT_CENTER, 0.4, 0.3);
        backdrop.frame.setSize(this.configuration.backdropWidth ?? TimerFrame.DefaultConfiguration.backdropWidth, 0.025);
        this.containerFrame = backdrop.frame;

        const timerText = TextFrame.CreateType({ context: this.context, inherits: "", name: `${name}TimerText`, owner: backdrop.frame });
        if (!timerText.frame) {
            return;
        }
        timerText.frame.clearPoints();
        timerText.update("0");
        timerText.frame.setPoint(FRAMEPOINT_RIGHT, backdrop.frame, FRAMEPOINT_RIGHT, 0, 0);

        const childFrames: TimerFrameChildFrames = { backdrop, timerText };

        if (this.configuration.iconTexture) {
            const icon = ButtonFrame.Create({
                context: this.context,
                name: `${name}Icon`,
                owner: backdrop.frame,
                overrides: { clickSoundPath: "", texture: this.configuration.iconTexture },
            });
            icon.containerFrame?.clearPoints();
            icon.containerFrame?.setPoint(FRAMEPOINT_LEFT, backdrop.frame, FRAMEPOINT_LEFT, this.configuration.xOffset ?? TimerFrame.DefaultConfiguration.xOffset, 0);
            icon.containerFrame?.setSize((icon.containerFrame?.width ?? 0) * 0.4, (icon.containerFrame?.height ?? 0) * 0.4);
            childFrames.icon = icon;

            if (this.configuration.iconTooltipText && icon.containerFrame) {
                childFrames.iconTooltip = TooltipFrame.Create({
                    context: this.context,
                    name: `${name}Tooltip`,
                    owner: icon.containerFrame,
                    overrides: { bodyText: this.configuration.iconTooltipText, headerText: "Timer", includeBackground: true },
                });
            }
        }

        if (this.configuration.timerTitle) {
            const titleText = TextFrame.CreateType({ context: this.context, inherits: "", name: `${name}TitleText`, owner: backdrop.frame });
            if (titleText.frame) {
                titleText.frame.clearPoints();
                titleText.frame.setPoint(FRAMEPOINT_LEFT, childFrames.icon?.containerFrame ?? backdrop.frame, childFrames.icon?.containerFrame ? FRAMEPOINT_RIGHT : FRAMEPOINT_LEFT, 0.01, 0);
                titleText.update(this.configuration.timerTitle);
            }
            childFrames.titleText = titleText;
        }

        this.childFrames = childFrames;
        this.autoSize();
    }

    /**
     * Starts your timer, calling onCompletion once the duration reaches 0.
     *
     * It also destroys the public Timer resources for you, esnuring no leakage.
     *
     * @param duration
     * @param isRepeating
     * @param onCompletion
     */
    public start(duration: number, isRepeating?: boolean, onCompletion?: () => void): void {
        let remainingDuration = duration;
        this.updateTimerText(`${duration}`);
        this.textUpdateTimer.destroy();
        this.textUpdateTimer = Timer.create();
        this.textUpdateTimer.start(1, true, () => this.updateTimerText(`${--remainingDuration}`));
        this.containerFrame?.setVisible(true);
        this.childFrames?.icon?.containerFrame?.setVisible(true);

        this.timeElapsedTimer.destroy();
        this.timeElapsedTimer = Timer.create();
        this.timeElapsedTimer.start(duration, isRepeating || false, () => {
            if (onCompletion) {
                onCompletion();
            }

            if (isRepeating) {
                this.updateTimerText(`${duration}`);
                remainingDuration = duration; // reset to original again.
            } else {
                this.containerFrame?.setVisible(false);
                this.childFrames?.icon?.containerFrame?.setVisible(false);
                this.textUpdateTimer.destroy();
                this.timeElapsedTimer.destroy();
            }
        });
    }

    public autoSize(buffer?: number): void {
        if (!this.containerFrame || !this.childFrames) {
            return;
        }

        const horizontalPadding = this.configuration.xOffset ?? TimerFrame.DefaultConfiguration.xOffset;
        const iconWidth = this.childFrames.icon?.containerFrame?.width ?? 0;
        const titleWidth = this.childFrames.titleText?.frame?.width ?? 0;
        const timerWidth = this.childFrames.timerText.frame?.width ?? 0;
        const contentGap = 0.005;
        const titleAndTimerWidth = titleWidth > 0 ? titleWidth + contentGap + timerWidth : timerWidth;
        const iconAndTextWidth = iconWidth > 0 ? iconWidth + contentGap + titleAndTimerWidth : titleAndTimerWidth;
        const width = Math.max(this.configuration.backdropWidth ?? TimerFrame.DefaultConfiguration.backdropWidth, horizontalPadding * 2 + iconAndTextWidth + (buffer ?? 0));
        this.containerFrame.setSize(width, this.containerFrame.height);
    }

    public updateTitle(text: string): void {
        const titleText = this.childFrames?.titleText;
        if (!titleText) {
            return;
        }

        titleText.update(text);
        this.autoSize();
    }

    private updateTimerText(text: string): void {
        this.childFrames?.timerText.update(text);
        this.autoSize();
    }
}
