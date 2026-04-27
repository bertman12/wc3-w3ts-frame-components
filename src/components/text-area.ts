import { Frame } from "w3ts";
import { AbstractFrameBase } from "./AbstractFrameBase";

interface TextAreaConfiguration {
    initialText?: string;
}

export class TextArea extends AbstractFrameBase {
    // public onMouseEnterTrigger?: Trigger | undefined;
    public frame: Frame | undefined;
    public config: TextAreaConfiguration;

    constructor(config: TextAreaConfiguration, ...baseArgs: ConstructorParameters<typeof AbstractFrameBase>) {
        super(...baseArgs);
        this.config = config;

        this.render();
    }

    protected render() {
        this.frame = Frame.fromHandle(BlzCreateFrameByType("TEXTAREA", this.name, this.owner.handle, this.inherits || "QuestDisplay", this.context));

        if (!this.frame) {
            return;
        }

        BlzFrameSetSize(this.frame.handle, 0.1, 0.1);
        BlzFrameClearAllPoints(this.frame.handle);
        BlzFrameSetPoint(this.frame.handle, FRAMEPOINT_BOTTOMLEFT, this.owner.handle, FRAMEPOINT_BOTTOMLEFT, 0.005, 0.005);

        if (this.config.initialText) {
            BlzFrameSetText(this.frame.handle, this.config.initialText);
        }

        // const t = Trigger.create();
        // this.onMouseEnterTrigger = t;

        // t.triggerRegisterFrameEvent(textArea, FRAMEEVENT_MOUSE_ENTER);

        // t.addAction(() => {
        //     textArea.setEnabled(false);
        //     textArea.setEnabled(true);
        // });
    }
}
