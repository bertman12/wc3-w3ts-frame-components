import { Frame, MapPlayer, Trigger } from "w3ts";
import { delay, PlaySoundLocal } from "warcraft-3-w3ts-utils";
import { IMonoFrameConfigurationBase } from "../../models";
import { MonoFrame, NamedNativeFrameArguments, TypedNativeFrameArguments } from "../Core/MonoFrame";

export interface ButtonFrameConfiguration extends IMonoFrameConfigurationBase {
    clickSoundPath?: string;
    height?: number;
    onClick?: (button: ButtonFrame) => void;
    texture?: string;
    width?: number;
}

export class ButtonFrame extends MonoFrame<ButtonFrameConfiguration> {
    public iconFrame?: Frame;
    public onClickTrigger?: Trigger;

    private constructor(...args: ConstructorParameters<typeof MonoFrame<ButtonFrameConfiguration>>) {
        super(...args);
        this.render();
    }

    public static get DefaultConfiguration(): ButtonFrameConfiguration {
        return {
            clickSoundPath: "Sound\\Interface\\MouseClick1.flac",
            height: 0.03,
            onClick: () => {},
            texture: "ReplaceableTextures\\CommandButtons\\BTNSelectHeroOn",
            width: 0.03,
        };
    }

    public static CreateNamed(args: NamedNativeFrameArguments<ButtonFrameConfiguration>): ButtonFrame {
        return new ButtonFrame(args.context, { ...ButtonFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner, undefined, args.priority);
    }

    public static CreateType(args: TypedNativeFrameArguments<ButtonFrameConfiguration>): ButtonFrame {
        return new ButtonFrame(args.context, { ...ButtonFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner, args.inherits);
    }

    protected render(): void {
        this.frame = this.inherits !== undefined ? Frame.createType(this.name, this.owner, this.context, "BUTTON", this.inherits) : Frame.create(this.name, this.owner, this.priority ?? 0, this.context);
        if (!this.frame) {
            return;
        }

        this.frame.setAbsPoint(FRAMEPOINT_CENTER, 0.4, 0.3);
        this.frame.setSize(this.configuration.width ?? ButtonFrame.DefaultConfiguration.width!, this.configuration.height ?? ButtonFrame.DefaultConfiguration.height!);
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
        this.onClickTrigger = this.onFrameEvent(FRAMEEVENT_CONTROL_CLICK, () => {
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

// const b = ButtonFrame.CreateType({context: 0, inherits:""}).