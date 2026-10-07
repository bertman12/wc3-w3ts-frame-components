import { Frame, Timer } from "w3ts";
import { delay } from "warcraft-3-w3ts-utils";
import { CompositeFrame } from "../Core/CompositeFrame";
import { BackdropFrame } from "../MonoFrames/backdrop";
import { IconFrame } from "../MonoFrames/icon";
import { TextFrame } from "../MonoFrames/text";
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
    icon?: IconFrame;
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

    public static Create(args: { context: number; name?: string; owner?: Frame; overrides?: TimerFrameConfiguration }): TimerFrame {
        return new TimerFrame(args.context, { ...TimerFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner);
    }

    public static CreateNamed(args: { context: number; name: string; owner?: Frame; overrides?: TimerFrameConfiguration }): TimerFrame {
        return TimerFrame.Create(args);
    }

    public static CreateTyped(args: { context: number; name?: string; owner?: Frame; overrides?: TimerFrameConfiguration }): TimerFrame {
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
        timerText.frame.setText("0");
        timerText.frame.clearPoints();
        timerText.formatSize();
        timerText.frame.setPoint(FRAMEPOINT_RIGHT, backdrop.frame, FRAMEPOINT_RIGHT, 0, 0);

        const childFrames: TimerFrameChildFrames = { backdrop, timerText };

        if (this.configuration.iconTexture) {
            const icon = IconFrame.CreateType({
                context: this.context,
                inherits: "",
                name: `${name}Icon`,
                owner: backdrop.frame,
                overrides: { texture: this.configuration.iconTexture },
            });
            icon.frame?.clearPoints();
            icon.frame?.setPoint(FRAMEPOINT_LEFT, backdrop.frame, FRAMEPOINT_LEFT, this.configuration.xOffset ?? 0.01, 0);
            icon.frame?.setSize((icon.frame?.width ?? 0) * 0.4, (icon.frame?.height ?? 0) * 0.4);
            childFrames.icon = icon;

            if (this.configuration.iconTooltipText && icon.frame) {
                childFrames.iconTooltip = TooltipFrame.Create({
                    context: this.context,
                    name: `${name}Tooltip`,
                    owner: icon.frame,
                    overrides: { bodyText: this.configuration.iconTooltipText, headerText: "Timer", includeBackground: true },
                });
            }
        }

        if (this.configuration.timerTitle) {
            const titleText = TextFrame.CreateType({ context: this.context, inherits: "", name: `${name}TitleText`, owner: backdrop.frame });
            if (titleText.frame) {
                titleText.frame.clearPoints();
                titleText.frame.setSize(0.03, 0);
                titleText.frame.setPoint(FRAMEPOINT_LEFT, childFrames.icon?.frame ?? backdrop.frame, childFrames.icon?.frame ? FRAMEPOINT_RIGHT : FRAMEPOINT_LEFT, 0.01, 0);
                titleText.frame.setText(this.configuration.timerTitle);
            }
            childFrames.titleText = titleText;
        }

        this.childFrames = childFrames;
        this.autoSize();
    }

    public start(duration: number, isRepeating?: boolean, onCompletion?: () => void): void {
        this.childFrames?.timerText.update(`${duration}`);
        this.timer.destroy();
        this.timer = Timer.create();
        this.timer.start(1, true, () => this.childFrames?.timerText.frame?.setText(`${--duration}`));
        this.containerFrame?.setVisible(true);
        this.childFrames?.icon?.frame?.setVisible(true);

        delay(duration, () => {
            this.containerFrame?.setVisible(false);
            this.childFrames?.icon?.frame?.setVisible(false);
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
        const timerLength = this.childFrames.timerText.frame?.text.length ?? 0;
        const titleLength = this.childFrames.titleText?.frame?.text.length ?? 0;
        const iconWidth = this.childFrames.icon?.frame?.width ?? 0;
        const width = Math.min(0.2, Math.max(0.03, 0.08 + iconWidth + 0.005 + (titleLength > 0 ? 0.004 * titleLength + 0.005 : 0.005) + 0.004 * timerLength + 0.005 + (buffer ?? 0)));
        this.containerFrame.setSize(width, this.containerFrame.height);
    }

    public updateTitle(text: string): void {
        if (!this.configuration.useTitle) {
            return;
        }
        this.childFrames?.titleText?.update(text);
        this.autoSize();
    }
}
