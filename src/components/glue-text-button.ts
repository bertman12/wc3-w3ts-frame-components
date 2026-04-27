import { Frame, MapPlayer, Trigger } from "w3ts";
import { PlaySoundLocal } from "warcraft-3-w3ts-utils";
import { FrameUtils } from "../frame-utils";
import { FrameInheritable } from "../names";
import { AbstractFrameBase } from "./AbstractFrameBase";

interface GlueTextButtonConfiguration {
    clickSoundPath?: string;
    /**
     * When set, will
     * @returns 
     */
    onClick?: () => void;
    initialText?: string;
}

export class GlueTextButton extends AbstractFrameBase {
    public frame?: Frame;
    /**
     * A trigger is created when onClick is set inside the config.
     */
    public onClickTrigger?: Trigger;
    public config: GlueTextButtonConfiguration;

    constructor(config: GlueTextButtonConfiguration, ...baseArgs: ConstructorParameters<typeof AbstractFrameBase>) {
        super(...baseArgs);
        this.config = config;
        this.render();
    }

    protected render() {
        this.frame = Frame.createType(this.name, this.owner, this.context, "GLUETEXTBUTTON", this.inherits);

        if (!this.frame) {
            return;
        }

        BlzFrameClearAllPoints(this.frame.handle);
        BlzFrameSetAbsPoint(this.frame.handle, FRAMEPOINT_CENTER, 0.3, 0.3);
        BlzFrameSetSize(this.frame.handle, 0.1, 0.1);

        this.frame = this.frame;

        if(this.config.initialText){
            this.frame.setText(this.config.initialText);
        }
        
        if(this.config.onClick){
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
}
