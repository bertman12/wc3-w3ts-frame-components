import { Frame, Timer } from "w3ts";
import { delay } from "warcraft-3-w3ts-utils";
import { CompositeFrame } from "../Core/CompositeFrame";
import { BackdropFrame } from "../MonoFrames/BackdropFrame";
import { ButtonFrame } from "./button";
import { TextFrame } from "../MonoFrames/TextFrame";
import { TooltipFrame } from "./tooltip";
import { ICompositeFrameChildFrames, ICompositeFrameConfigurationBase } from "../../models";

export interface TimerFrameConfiguration extends ICompositeFrameConfigurationBase {
    backdropWidth?: number;
    iconTexture?: string;
    iconTooltipText?: string;
    timerTitle?: string;
    useTitle?: boolean;
    xOffset?: number;
}

interface TimerFrameChildFrames extends ICompositeFrameChildFrames {
    backdrop: BackdropFrame;
    icon?: ButtonFrame;
    iconTooltip?: TooltipFrame;
    timerText: TextFrame;
    titleText?: TextFrame;
}

export class TimerFrame extends CompositeFrame<TimerFrameConfiguration, TimerFrameChildFrames> {
    public timer: Timer;

    private constructor(...args: ConstructorParameters<typeof CompositeFrame<TimerFrameConfiguration, TimerFrameChildFrames>>) {
        super(...args);
        this.timer = Timer.create();
        this.render();
    }

    public static get DefaultConfiguration(): TimerFrameConfiguration {
        return {};
    }

    /**
     * @param args.context The context of the container frame and all child frames. Default value: 0
     */
    public static Create(args: { context?: number; name?: string; owner?: Frame; overrides?: TimerFrameConfiguration }): TimerFrame {
        return new TimerFrame(args.context, { ...TimerFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner);
    }

    /**
     * @param args.context The context of the container frame and all child frames. Default value: 0
     */
    public static CreateNamed(args: { context?: number; name: string; owner?: Frame; overrides?: TimerFrameConfiguration }): TimerFrame {
        return TimerFrame.Create(args);
    }

    /**
     * @param args.context The context of the container frame and all child frames. Default value: 0
     */
    public static CreateTyped(args: { context?: number; name?: string; owner?: Frame; overrides?: TimerFrameConfiguration }): TimerFrame {
        return TimerFrame.Create(args);
    }

    protected render(): void {
        const name = this.name ?? "TimerFrame";
        const backdrop = BackdropFrame.CreateType({ context: this.context, inherits: "QuestButtonBaseTemplate", name: `${name}Backdrop`, owner: this.owner });
        if (!backdrop.frame) {
            return;
        }

        backdrop.frame.clearPoints();
        backdrop.frame.setAbsPoint(FRAMEPOINT_CENTER, 0.4, 0.3);
        backdrop.frame.setSize(this.configuration.backdropWidth ?? 0.08, 0.025);
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
            icon.containerFrame?.setPoint(FRAMEPOINT_LEFT, backdrop.frame, FRAMEPOINT_LEFT, this.configuration.xOffset ?? 0.01, 0);
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

    public start(duration: number, isRepeating?: boolean, onCompletion?: () => void): void {
        this.updateTimerText(`${duration}`);
        this.timer.destroy();
        this.timer = Timer.create();
        this.timer.start(1, true, () => this.updateTimerText(`${--duration}`));
        this.containerFrame?.setVisible(true);
        this.childFrames?.icon?.containerFrame?.setVisible(true);

        delay(duration, () => {
            this.containerFrame?.setVisible(false);
            this.childFrames?.icon?.containerFrame?.setVisible(false);
            if (onCompletion) {
                this.timer.destroy();
                onCompletion();
            }
        });
    }

    public autoSize(buffer?: number): void {
        if (!this.containerFrame || !this.childFrames) {
            return;
        }

        const horizontalPadding = this.configuration.xOffset ?? 0.01;
        const iconWidth = this.childFrames.icon?.containerFrame?.width ?? 0;
        const titleWidth = this.childFrames.titleText?.frame?.width ?? 0;
        const timerWidth = this.childFrames.timerText.frame?.width ?? 0;
        const contentGap = 0.005;
        const titleAndTimerWidth = titleWidth > 0 ? titleWidth + contentGap + timerWidth : timerWidth;
        const iconAndTextWidth = iconWidth > 0 ? iconWidth + contentGap + titleAndTimerWidth : titleAndTimerWidth;
        const width = Math.max(this.configuration.backdropWidth ?? 0.08, horizontalPadding * 2 + iconAndTextWidth + (buffer ?? 0));
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
