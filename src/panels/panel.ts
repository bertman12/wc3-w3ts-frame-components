import { Frame } from "w3ts";
import { Components } from "../frame-components";

export class Panel {
    static Render(context: number, name: string, owner?: Frame) {
        const panel = Components.Backdrop(name, context, owner);
        // addPlayerFrame(context, "leftPanelBackdrop", panel); //Not guaranteed to be player specific so dont need to do this here.

        panel?.setSize(0.22, 0.35);
        panel?.clearPoints();
        panel?.setAbsPoint(FRAMEPOINT_TOPLEFT, 0, 0.55);

        return panel;
    }
}
