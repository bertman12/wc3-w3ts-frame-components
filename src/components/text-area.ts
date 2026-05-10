import { FrameUtils } from "src/frame-utils";
import { FrameType } from "src/names";
import { Frame, Trigger } from "w3ts";
import { IMouseEnterEvent } from "../models";
import { AbstractFrameBase } from "./AbstractFrameBase";

interface TextAreaConfiguration {
    initialText?: string;
    onMouseEnter?: () => void;
}

/**
 * Requires the following to be loaded in the TOC
 *
 * BattleNetTextAreaTemplate	Not Loaded	battlenettemplates.fdf
 * EscMenuTextAreaTemplate	Not Loaded	escmenutemplates.fdf
 */
export class TextArea extends AbstractFrameBase implements IMouseEnterEvent {
    public onMouseEnterTrigger?: Trigger | undefined;
    public frame: Frame | undefined;
    public config: TextAreaConfiguration;

    constructor(config: TextAreaConfiguration, ...baseArgs: ConstructorParameters<typeof AbstractFrameBase>) {
        super(...baseArgs);
        this.config = config;

        this.render();
    }

    public static Default(context: number = 0, owner: Frame = FrameUtils.OriginFrameGameUI) {
        return new TextArea({ onMouseEnter: () => {}, initialText: "Sample Text" }, "EscMenuTextAreaTemplate", context, owner);
    }

    // public static CreateThemed(overrides: any): void {
        
    // }

    protected render() {
        if (this.inherits !== undefined) {
            this.frame = Frame.createType(this.name, this.owner, this.context, FrameType.TextArea, this.inherits);
        } else {
            this.frame = Frame.create(this.name, this.owner, this.priority, this.context);
        }

        if (!this.frame) {
            return;
        }

        this.frame.setSize(0.1, 0.1);
        this.frame.clearPoints();
        this.frame.setAbsPoint(FRAMEPOINT_CENTER, 0.4, 0.3);

        BlzFrameSetPoint(this.frame.handle, FRAMEPOINT_BOTTOMLEFT, this.owner.handle, FRAMEPOINT_BOTTOMLEFT, 0.005, 0.005);

        if (this.config.initialText) {
            BlzFrameSetText(this.frame.handle, this.config.initialText);
        }

        if (this.config.onMouseEnter) {
            this.setOnMouseEnter(this.config.onMouseEnter);
        }
    }

    public setOnMouseEnter(fn: () => void) {
        if (!this.frame) {
            return;
        }

        this.onMouseEnterTrigger?.destroy();
        this.onMouseEnterTrigger = Trigger.create();
        this.onMouseEnterTrigger.triggerRegisterFrameEvent(this.frame, FRAMEEVENT_MOUSE_ENTER);

        this.onMouseEnterTrigger.addAction(() => {
            if (this.frame) {
                this.frame.setEnabled(false);
                this.frame.setEnabled(true);
            }

            fn();
        });
    }
}
