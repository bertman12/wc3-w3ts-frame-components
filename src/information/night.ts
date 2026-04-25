import { Frame } from "w3ts";
import { GlobalFrames } from "../data";
import { FrameUtils } from "../frame-utils";
import { Inheritables } from "../names";

export interface CurrentNightFrame {
    Backdrop?: Frame;
    TextFrame?: Frame;
}

/**
 * Should just be a class or object
 *
 */
export function setupNightKPI() {
    const backdrop = BlzCreateFrameByType("BACKDROP", "nightDisplayBackdrop", FrameUtils.OriginFrameGameUI.handle, Inheritables.JMT_BackdropBaseTemplate, 0);
    if (!backdrop) {
        return;
    }

    BlzFrameSetAbsPoint(backdrop, FRAMEPOINT_TOP, 0.4, 0.6);
    BlzFrameSetSize(backdrop, 0.08, 0.025);

    const textFrame = Frame.fromHandle(BlzCreateFrameByType("TEXT", "nightTextDisplay", backdrop, "", 0));
    if (!textFrame) {
        return;
    }

    BlzFrameSetPoint(textFrame.handle, FRAMEPOINT_TOP, backdrop, FRAMEPOINT_TOP, 0, -0.008);
    BlzFrameSetEnable(textFrame.handle, true);
    BlzFrameSetText(textFrame.handle, "Night: 0/9");

    GlobalFrames.NightTextDisplay = { Backdrop: Frame.fromHandle(backdrop), TextFrame: textFrame };
}
