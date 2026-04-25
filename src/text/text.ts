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
     * Returns a computed width for the tooltip 
     * 
     * @param text The text that goes inside the tooltip.
     * @param buffer Optional addition to the calculated width. 
     * @returns number
     */
    static FormatSize(text: string, buffer?: number) {
        return 0.02 + 0.004 * text.length + (buffer || 0);
    }
}
