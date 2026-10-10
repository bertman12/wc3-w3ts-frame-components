import { Frame, MapPlayer, Trigger } from "w3ts";
import { delay, PlaySoundLocal } from "warcraft-3-w3ts-utils";
import { FrameUtils } from "../../frame-utils";
import { ICompositeFrameChildFrames, ICompositeFrameConfigurationBase } from "../../models";
import { CompositeFrame } from "../Core/CompositeFrame";

export interface ButtonFrameConfiguration extends ICompositeFrameConfigurationBase {
    /** Distance the icon shrinks inward on each side while pressed. 0 disables the press effect. Default value: 0.001 */
    clickInset?: number;
    /** Sound played locally for the clicking player. An empty string plays no sound. Default value: "Sound\\Interface\\MouseClick1.flac" */
    clickSoundPath?: string;
    /** Height of the button. Default value: 0.03 */
    height?: number;
    /** Handler called when the button is clicked. Default value: a no-op function */
    onClick?: (button: ButtonFrame) => void;
    /** Texture shown on the button. Default value: "ReplaceableTextures\\CommandButtons\\BTNSelectHeroOn" */
    texture?: string;
    /** Width of the button. Default value: 0.03 */
    width?: number;
}

type ButtonFrameDefaultConfiguration = Required<Pick<ButtonFrameConfiguration, "clickInset" | "clickSoundPath" | "height" | "onClick" | "texture" | "width">>;

/**
 * A button composed of a native BUTTON container frame (`containerFrame`) and a child BACKDROP
 * (`iconFrame`) that displays the texture. Use it both for clickable buttons and for plain icons
 * (pass `clickSoundPath: ""` and omit `onClick` side effects).
 */
export class ButtonFrame extends CompositeFrame<ButtonFrameConfiguration, ICompositeFrameChildFrames> {
    public iconFrame?: Frame;
    public onClickTrigger?: Trigger;

    private constructor(...args: ConstructorParameters<typeof CompositeFrame<ButtonFrameConfiguration, ICompositeFrameChildFrames>>) {
        super(...args);
        this.render();
    }

    public static get DefaultConfiguration(): ButtonFrameDefaultConfiguration {
        return {
            clickInset: 0.001,
            clickSoundPath: "Sound\\Interface\\MouseClick1.flac",
            height: 0.03,
            onClick: () => {},
            texture: "ReplaceableTextures\\CommandButtons\\BTNSelectHeroOn",
            width: 0.03,
        };
    }

    /**
     * @param args.context The context of the container frame and its child frames. Default value: 0
     * @param args.name An arbitrary name for the container frame. The icon child frame is named `<name>Icon`.
     * @param args.owner The parent frame for the container frame. Default value: ORIGIN_FRAME_GAME_UI
     * @param args.overrides Allows overriding the ButtonFrame's default configuration with your own.
     */
    public static Create(args: { context?: number; name?: string; owner?: Frame; overrides?: ButtonFrameConfiguration }): ButtonFrame {
        return new ButtonFrame(args.context, { ...ButtonFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner);
    }

    protected render(): void {
        const name = this.name ?? "ButtonFrame";
        this.containerFrame = Frame.createType(name, this.owner ?? FrameUtils.OriginFrameGameUI, this.context, "BUTTON", "");
        if (!this.containerFrame) {
            return;
        }

        this.containerFrame.clearPoints();
        this.containerFrame.setAbsPoint(FRAMEPOINT_CENTER, 0.4, 0.3);
        this.containerFrame.setSize(this.configuration.width ?? ButtonFrame.DefaultConfiguration.width, this.configuration.height ?? ButtonFrame.DefaultConfiguration.height);
        this.iconFrame = Frame.createType(`${name}Icon`, this.containerFrame, this.context, "BACKDROP", "");
        if (!this.iconFrame) {
            return;
        }

        this.iconFrame.setAllPoints(this.containerFrame);
        this.iconFrame.setTexture(this.configuration.texture ?? "", 0, false);
        if (this.configuration.onClick) {
            this.setOnClick(this.configuration.onClick);
        }
    }

    public updateTexture(texture: string): void {
        this.iconFrame?.setTexture(texture, 0, false);
    }

    /**
     * Replaces any previously registered click handler.
     */
    public setOnClick(onClick: (button: ButtonFrame) => void): void {
        const container = this.containerFrame;
        if (!container) {
            return;
        }

        this.onClickTrigger?.destroy();
        this.onClickTrigger = Trigger.create();
        this.onClickTrigger.triggerRegisterFrameEvent(container, FRAMEEVENT_CONTROL_CLICK);
        this.onClickTrigger.addAction(() => {
            const player = MapPlayer.fromEvent();
            if (this.configuration.clickSoundPath) {
                PlaySoundLocal(this.configuration.clickSoundPath, player?.isLocal());
            }

            const inset = this.configuration.clickInset ?? ButtonFrame.DefaultConfiguration.clickInset;
            if (inset !== 0) {
                this.iconFrame?.clearPoints();
                this.iconFrame?.setPoint(FRAMEPOINT_BOTTOMLEFT, container, FRAMEPOINT_BOTTOMLEFT, inset, inset);
                this.iconFrame?.setPoint(FRAMEPOINT_TOPRIGHT, container, FRAMEPOINT_TOPRIGHT, -inset, -inset);
                delay(0.05, () => this.iconFrame?.setAllPoints(container));
            }
            onClick(this);
            container.setEnabled(false);
            container.setEnabled(true);
        });
    }
}