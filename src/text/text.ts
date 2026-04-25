import { Frame } from "w3ts";
import { FrameUtils } from "../frame-utils";

export class Text {
    static Render(context: number, name: string, owner?: Frame) {
        //Doesn't need to inherit from anyone.
        const text = Frame.fromHandle(BlzCreateFrameByType("TEXT", name, owner?.handle || FrameUtils.OriginFrameGameUIHandle, "", context));

        if (!text) {
            return;
        }

        text.clearPoints();
        text.setAbsPoint(FRAMEPOINT_CENTER, 0.4, 0.3);
        text.setSize(0.1, 0.005);
        text.setText("Sample Text");

        return text;
    }

    /**
     * Same formula we use for tooltip text frame width.
     * Nevermind, I think it needs something different than the tooltip frame. It's still pretty small width...
     * @param text
     * @returns
     */
    static FormatSize(text: string, buffer?: number) {
        return 0.02 + 0.004 * text.length + (buffer || 0);
    }
}
