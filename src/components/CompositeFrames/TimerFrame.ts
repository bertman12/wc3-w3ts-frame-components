import { Frame, Timer } from "w3ts";
import { ICompositeFrameChild, ICompositeFrameChildFrames, ICompositeFrameChildRenderers, ICompositeFrameConfigurationBase } from "../../models";
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
    /** Overrides how each child frame is rendered. Each `render` returns the same type as its child frame. Default value: undefined */
    childFrames?: ICompositeFrameChildRenderers<TimerFrameChildFrames>;
}

type TimerFrameDefaultConfiguration = Required<Pick<TimerFrameConfiguration, "backdropWidth" | "useTitle" | "xOffset">> & Pick<TimerFrameConfiguration, "childFrames" | "iconTexture" | "iconTooltipText" | "timerTitle">;

export interface TimerFrameChildFrames extends ICompositeFrameChildFrames {
    backdrop: ICompositeFrameChild<BackdropFrame>;
    icon?: ICompositeFrameChild<ButtonFrame>;
    iconTooltip?: ICompositeFrameChild<TooltipFrame>;
    timerText: ICompositeFrameChild<TextFrame>;
    titleText?: ICompositeFrameChild<TextFrame>;
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
            childFrames: undefined,
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
        const renderers = this.configuration.childFrames;
        const backdrop = this.renderChild(renderers?.backdrop?.render, () => BackdropFrame.CreateType({ context: this.context, inherits: "QuestButtonBaseTemplate", name: `${name}Backdrop`, owner: this.owner }));
        const backdropFrame = backdrop.frame.frame;
        if (!backdropFrame) {
            return;
        }

        backdropFrame.clearPoints();
        backdropFrame.setAbsPoint(FRAMEPOINT_CENTER, 0.4, 0.3);
        backdropFrame.setSize(this.configuration.backdropWidth ?? TimerFrame.DefaultConfiguration.backdropWidth, 0.025);
        this.containerFrame = backdropFrame;

        const timerText = this.renderChild(renderers?.timerText?.render, () => TextFrame.CreateType({ context: this.context, inherits: "", name: `${name}TimerText`, owner: backdropFrame }));
        const timerTextFrame = timerText.frame.frame;
        if (!timerTextFrame) {
            return;
        }
        timerTextFrame.clearPoints();
        timerText.frame.update("0");
        timerTextFrame.setPoint(FRAMEPOINT_RIGHT, backdropFrame, FRAMEPOINT_RIGHT, 0, 0);

        const childFrames: TimerFrameChildFrames = { backdrop, timerText };

        if (this.configuration.iconTexture) {
            const iconTexture = this.configuration.iconTexture;
            const icon = this.renderChild(renderers?.icon?.render, () =>
                ButtonFrame.Create({
                    context: this.context,
                    name: `${name}Icon`,
                    owner: backdropFrame,
                    overrides: { clickSoundPath: "", texture: iconTexture },
                }),
            );
            const iconContainer = icon.frame.containerFrame;
            iconContainer?.clearPoints();
            iconContainer?.setPoint(FRAMEPOINT_LEFT, backdropFrame, FRAMEPOINT_LEFT, this.configuration.xOffset ?? TimerFrame.DefaultConfiguration.xOffset, 0);
            iconContainer?.setSize((iconContainer?.width ?? 0) * 0.4, (iconContainer?.height ?? 0) * 0.4);
            childFrames.icon = icon;

            const iconTooltipText = this.configuration.iconTooltipText;
            if (iconTooltipText && iconContainer) {
                childFrames.iconTooltip = this.renderChild(renderers?.iconTooltip?.render, () =>
                    TooltipFrame.Create({
                        context: this.context,
                        name: `${name}Tooltip`,
                        owner: iconContainer,
                        overrides: { bodyText: iconTooltipText, headerText: "Timer", includeBackground: true },
                    }),
                );
            }
        }

        const timerTitle = this.configuration.timerTitle;
        if (timerTitle) {
            const titleText = this.renderChild(renderers?.titleText?.render, () => TextFrame.CreateType({ context: this.context, inherits: "", name: `${name}TitleText`, owner: backdropFrame }));
            const titleTextFrame = titleText.frame.frame;
            if (titleTextFrame) {
                const iconContainer = childFrames.icon?.frame.containerFrame;
                titleTextFrame.clearPoints();
                titleTextFrame.setPoint(FRAMEPOINT_LEFT, iconContainer ?? backdropFrame, iconContainer ? FRAMEPOINT_RIGHT : FRAMEPOINT_LEFT, 0.01, 0);
                titleText.frame.update(timerTitle);
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
        this.childFrames?.icon?.frame.containerFrame?.setVisible(true);

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
                this.childFrames?.icon?.frame.containerFrame?.setVisible(false);
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
        const iconWidth = this.childFrames.icon?.frame.containerFrame?.width ?? 0;
        const titleWidth = this.childFrames.titleText?.frame.frame?.width ?? 0;
        const timerWidth = this.childFrames.timerText.frame.frame?.width ?? 0;
        const contentGap = 0.005;
        const titleAndTimerWidth = titleWidth > 0 ? titleWidth + contentGap + timerWidth : timerWidth;
        const iconAndTextWidth = iconWidth > 0 ? iconWidth + contentGap + titleAndTimerWidth : titleAndTimerWidth;
        const width = Math.max(this.configuration.backdropWidth ?? TimerFrame.DefaultConfiguration.backdropWidth, horizontalPadding * 2 + iconAndTextWidth + (buffer ?? 0));
        this.containerFrame.setSize(width, this.containerFrame.height);
    }

    public updateTitle(text: string): void {
        const titleText = this.childFrames?.titleText?.frame;
        if (!titleText) {
            return;
        }

        titleText.update(text);
        this.autoSize();
    }

    /**
     * Autosizes the frame after updating text.
     * @param text
     */
    private updateTimerText(text: string): void {
        this.childFrames?.timerText.frame.update(text);
        this.autoSize();
    }
}
