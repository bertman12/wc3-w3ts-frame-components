import { TimerFrame } from "../components/timer";
import { GlobalFrames } from "../data";
import { FrameUtils } from "../frame-utils";

/**
 * Should be called after the night display frame is created.
 */
export function createDayNightCountdownTimer() {
    const timerFrame = new TimerFrame(0, "dayNightCountdownTimer", FrameUtils.OriginFrameGameUI, { useButton: true });
    timerFrame.containerFrame?.setVisible(false);

    if (GlobalFrames.NightTextDisplay?.Backdrop) {
        timerFrame.containerFrame?.clearPoints();
        timerFrame.containerFrame?.setPoint(FRAMEPOINT_TOP, GlobalFrames.NightTextDisplay.Backdrop, FRAMEPOINT_BOTTOM, 0, -0.0005);
    } else {
        print("didnt find night display text!");
    }

    GlobalFrames.DayNightCountdownTimer = timerFrame;
}
