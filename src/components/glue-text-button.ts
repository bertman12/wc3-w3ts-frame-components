import { PlaySoundLocal } from "src/sound/utils";
import { Frame, MapPlayer, Trigger } from "w3ts";
import { FrameUtils } from "../frame-utils";
import { FrameInheritable } from "../names";

interface GlueTextButtonConfiguration {
    clickSoundPath?: string;
}

export class GlueTextButton {
    public context: number;
    public name: string;
    public owner: Frame;
    public frame: Frame | undefined;

    public onClickTrigger: Trigger | undefined;
    public config?: GlueTextButtonConfiguration;

    constructor(context: number, name: string, owner: Frame, config?: GlueTextButtonConfiguration) {
        this.context = context;
        this.name = name;
        this.owner = owner;
        this.config = config;
        this.render();
    }

    private render() {
        this.frame = Frame.createType(this.name, this.owner || FrameUtils.OriginFrameGameUI, this.context, FrameInheritable.GlueTextButton.type, FrameInheritable.GlueTextButton.name);

        if (!this.frame) {
            return;
        }

        BlzFrameClearAllPoints(this.frame.handle);
        BlzFrameSetAbsPoint(this.frame.handle, FRAMEPOINT_CENTER, 0.3, 0.3);
        BlzFrameSetSize(this.frame.handle, 0.1, 0.1);

        this.frame = this.frame;
        const t = Trigger.create();
        this.onClickTrigger = t;
        t.triggerRegisterFrameEvent(this.frame, FRAMEEVENT_CONTROL_CLICK);
        t.addAction(() => {
            const player = MapPlayer.fromEvent();

            if (player && this.config?.clickSoundPath) {
                PlaySoundLocal(this.config.clickSoundPath, player.isLocal());
            }

            if (this.frame) {
                this.frame.setEnabled(false);
                this.frame.setEnabled(true);
            }
        });
    }
}
