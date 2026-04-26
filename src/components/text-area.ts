import { Frame } from "w3ts";

export class TextArea {
    // public onMouseEnterTrigger?: Trigger | undefined;

    public name: string;
    public parent: Frame;
    public context: number;

    public frame: Frame | undefined;

    constructor(name: string, parent: Frame, context: number, text?: string) {
        this.name = name;
        this.parent = parent;
        this.context = context;
        this.render(text);
    }

    private render(text?: string) {
        const textArea = Frame.fromHandle(BlzCreateFrameByType("TEXTAREA", this.name, this.parent.handle, "JMT_TextAreaTemplate", this.context));
        if (!textArea) {
            return;
        }

        BlzFrameSetSize(textArea.handle, 0.1, 0.1);
        BlzFrameClearAllPoints(textArea.handle);
        BlzFrameSetPoint(textArea.handle, FRAMEPOINT_BOTTOMLEFT, this.parent.handle, FRAMEPOINT_BOTTOMLEFT, 0.005, 0.005);
        BlzFrameSetText(textArea.handle, text ?? `Sample text.`);

        this.frame = textArea;

        // const t = Trigger.create();
        // this.onMouseEnterTrigger = t;

        // t.triggerRegisterFrameEvent(textArea, FRAMEEVENT_MOUSE_ENTER);

        // t.addAction(() => {
        //     textArea.setEnabled(false);
        //     textArea.setEnabled(true);
        // });
    }
}
