import { Frame } from "w3ts";
// import { delayedTimer } from "warcraft-3-w3ts-utils";

export class FrameUtils {
    static OriginFrameGameUIHandle: framehandle;
    static OriginFrameGameUI: Frame;

    static Init() {
        // delayedTimer(0, () => {
        FrameUtils.LoadTOC();
        FrameUtils.InitializeMembers();
        // });
    }

    static AddSprite(path: string, context: number, name: string, owner?: Frame) {
        if (!owner) {
            return;
        }

        const model = Frame.fromHandle(BlzCreateFrameByType("SPRITE", name, owner.handle, "", context));
        if (!model) {
            return;
        }

        model.setAllPoints(owner);
        model.setModel(path, 0);
        // model.setModel("UI\\Feedback\\Autocast\\UI-ModalButtonOn.mdl", 0);

        // -- Models don't care about Frame Size, to resize them one needs to scale them. The default CommandButton has a Size of 0.039.
        model.setScale(BlzFrameGetWidth(owner.handle) / 0.039);

        return model;
    }

    private static createTextArea(origin?: framehandle) {
        const parent = origin ?? FrameUtils.OriginFrameGameUIHandle;
        const textArea = BlzCreateFrame("JMT_TextAreaTemplate", parent, 0, 0);
        if (!textArea) {
            return;
        }

        print("Text area created!");

        //Fills to fit container
        // BlzFrameSetAllPoints(textArea, parent);

        //The size no longer matters when we are pinning left and right corners of the frame
        BlzFrameSetSize(textArea, 0.1, 0.1);
        BlzFrameClearAllPoints(textArea);

        //These 2 lines are enough to bind the text areas top left and right to the container top left and right
        // BlzFrameSetPoint(textArea, FRAMEPOINT_TOPLEFT, parent, FRAMEPOINT_TOPLEFT, 0.005, -0.005);
        // BlzFrameSetPoint(textArea, FRAMEPOINT_TOPRIGHT, parent, FRAMEPOINT_TOPRIGHT, -0.005, -0.005);

        BlzFrameSetPoint(textArea, FRAMEPOINT_BOTTOMLEFT, parent, FRAMEPOINT_BOTTOMLEFT, 0.005, 0.005);
        // BlzFrameSetPoint(textArea, FRAMEPOINT_BOTTOMRIGHT, parent, FRAMEPOINT_BOTTOMRIGHT, -0.005, 0.005);

        BlzFrameSetText(
            textArea,
            `All work and no play makes Jack a dull boy. All work and no play makes Jack a dull boy. All work and no play makes Jack a dull boy. All work and no play makes Jack a dull boy. All work and no play makes Jack a dull boy. All work and no play makes Jack a dull boy. All work and no play makes Jack a dull boy. All work and no play makes Jack a dull boy. All work and no play makes Jack a dull boy. All work and no play makes Jack a dull boy. All work and no play makes Jack a dull boy. All work and no play makes Jack a dull boy. All work and no play makes Jack a dull boy.`,
        );

        // const scale = 1;
        // BlzFrameSetScale(textArea, scale);

        // const backdrop = BlzGetFrameByName("JMT_TextAreaTemplateBackdrop", 0);
        // if (!backdrop) return;

        // BlzFrameSetScale(backdrop, scale * 0.5);

        //No children on this frame
        // const max = BlzFrameGetChildrenCount(backdrop);
        // print("Child count: " + max);
        // for (let x = 0; x < max; x++) {
        //     const childFrame = BlzFrameGetChild(backdrop, x);
        //     if (!childFrame) {
        //         continue;
        //     }

        //     BlzFrameSetScale(childFrame, scale);
        // }
        return textArea;
    }

    static LoadTOC() {
        const success = BlzLoadTOCFile("war3mapImported\\myTOC.toc");
        print("TOC loaded successfully? " + success);
    }

    /**
     * Sets OriginFrameGameUI
     */
    static InitializeMembers() {
        const parent = BlzGetOriginFrame(ORIGIN_FRAME_GAME_UI, 0);
        const frame = Frame.fromHandle(parent);
        if (!parent || !frame) {
            print("|cffff0000Unable to get ORIGIN_FRAME_GAME_UI!|r");
            return;
        }

        FrameUtils.OriginFrameGameUIHandle = parent;
        FrameUtils.OriginFrameGameUI = frame;
    }
}
