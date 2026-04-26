import { Frame } from "w3ts";
// import { delayedTimer } from "warcraft-3-w3ts-utils";

export class FrameUtils {
    private static _originFrameGameUI: Frame | undefined;

    static get OriginFrameGameUI() {
        if (this._originFrameGameUI) {
            return this._originFrameGameUI;
        }

        this._originFrameGameUI = Frame.fromOrigin(ORIGIN_FRAME_GAME_UI, 0) as Frame;

        return this._originFrameGameUI;
    }

    private static _originFrameGameUIHandle: framehandle | undefined;

    static get OriginFrameGameUIHandle() {
        if (this._originFrameGameUIHandle) {
            return this._originFrameGameUIHandle;
        }

        this._originFrameGameUIHandle = BlzGetOriginFrame(ORIGIN_FRAME_GAME_UI, 0) as framehandle;

        return this._originFrameGameUIHandle;
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

        // -- Models don't care about Frame Size, to resize them one needs to scale them. The default CommandButton has a Size of 0.039.
        model.setScale(BlzFrameGetWidth(owner.handle) / 0.039);

        return model;
    }

    /**
     * Only to be used when you do not use your own TOC file.
     */
    static LoadTOC() {
        const success = BlzLoadTOCFile("war3mapImported\\JMT_FramesTOC.toc");
        print("JMT_FramesTOC loaded successfully? " + success);
    }
}
