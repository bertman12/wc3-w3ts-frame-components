import { Frame, MapPlayer, Trigger } from "w3ts";
import { delay, PlaySoundLocal } from "warcraft-3-w3ts-utils";
import { MonoFrame } from "../Core/MonoFrame";
import { IMonoFrameConfigurationBase } from "../../models";

export interface ButtonFrameConfiguration extends IMonoFrameConfigurationBase {
    texture?: string;
    onClick?: (button: ButtonFrame) => void;
    clickSoundPath?: string;
}

export class ButtonFrame extends MonoFrame<ButtonFrameConfiguration> {
    public frame?: Frame;
    public iconFrame?: Frame;
    public onClickTrigger?: Trigger;

    private constructor(...args: ConstructorParameters<typeof MonoFrame<ButtonFrameConfiguration>>) {
        super(...args);
        this.render();
    }

    public static get DefaultConfiguration(): ButtonFrameConfiguration {
        return {
            clickSoundPath: "Sound\\Interface\\MouseClick1.flac",
            onClick: () => {},
            texture: "ReplaceableTextures\\CommandButtons\\BTNSelectHeroOn",
        };
    }

    public static CreateNamed(args: { context: number; name: string; priority?: number; owner?: Frame; overrides?: ButtonFrameConfiguration }): ButtonFrame {
        return new ButtonFrame(args.context, { ...ButtonFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner, undefined, args.priority);
    }

    public static CreateType(args: { context: number; inherits: string; name?: string; owner?: Frame; overrides?: ButtonFrameConfiguration }): ButtonFrame {
        return new ButtonFrame(args.context, { ...ButtonFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner, args.inherits);
    }

    protected render(): void {
        this.frame = this.inherits !== undefined ? Frame.createType(this.name, this.owner, this.context, "BUTTON", this.inherits) : Frame.create(this.name, this.owner, this.priority ?? 0, this.context);
        if (!this.frame) {
            return;
        }

        this.frame.setAbsPoint(FRAMEPOINT_CENTER, 0.1, 0.3);
        this.frame.setSize(0.03, 0.03);
        this.iconFrame = Frame.createType(`${this.name}Icon`, this.frame, this.context, "BACKDROP", "");
        if (!this.iconFrame) {
            return;
        }

        this.iconFrame.setAllPoints(this.frame);
        this.iconFrame.setTexture(this.configuration.texture ?? "", 0, false);
        if (this.configuration.onClick) {
            this.setOnClick(this.configuration.onClick);
        }
    }

    public updateTexture(texture: string): void {
        this.iconFrame?.setTexture(texture, 0, false);
    }

    public setOnClick(onClick: (button: ButtonFrame) => void): void {
        if (!this.frame) {
            return;
        }
        this.onClickTrigger?.destroy();
        this.onClickTrigger = Trigger.create();
        this.onClickTrigger.triggerRegisterFrameEvent(this.frame, FRAMEEVENT_CONTROL_CLICK);
        this.onClickTrigger.addAction(() => {
            const player = MapPlayer.fromEvent();
            if (this.configuration.clickSoundPath) {
                PlaySoundLocal(this.configuration.clickSoundPath, player?.isLocal());
            }

            this.iconFrame?.clearPoints();
            this.iconFrame?.setPoint(FRAMEPOINT_BOTTOMLEFT, this.frame!, FRAMEPOINT_BOTTOMLEFT, 0.001, 0.001);
            this.iconFrame?.setPoint(FRAMEPOINT_TOPRIGHT, this.frame!, FRAMEPOINT_TOPRIGHT, -0.001, -0.001);
            delay(0.05, () => this.iconFrame?.setAllPoints(this.frame!));
            onClick(this);
            this.frame?.setEnabled(false);
            this.frame?.setEnabled(true);
        });
    }
}
