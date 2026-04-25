import { Frame, Timer, Trigger } from "w3ts";
// import { delayedTimer } from "warcraft-3-w3ts-utils";

export class FrameUtils {
    static OriginFrameGameUIHandle: framehandle;
    static OriginFrameGameUI: Frame;

    static Init() {
        // delayedTimer(0, () => {
        FrameUtils.LoadTOC();
        FrameUtils.InitializeMembers();
        // FrameUtils.CreateContainerWithContents();

        // FrameUtils.CreateIconButton();
        // FrameUtils.Test_JMT_GlueButton();
        print("Done");
        // });
    }

    private static testTextFrame() {
        const textFrameContainer = BlzCreateSimpleFrame("TestString", FrameUtils.OriginFrameGameUIHandle, 0);
        if (!textFrameContainer) {
            return;
        }

        const textFrame = BlzGetFrameByName("TestStringValue", 0);
        if (!textFrame) {
            return;
        }

        BlzFrameSetAbsPoint(textFrameContainer, FRAMEPOINT_CENTER, 0.4, 0.5);
        BlzFrameSetText(textFrame, "Test Text");
    }

    private static testTextureFrame() {
        // const textureFrameContainer = BlzCreateSimpleFrame("TestTexture", FrameUtils.OriginFrameGameUI, 0);
        const textureFrameContainer = BlzCreateFrameByType("SIMPLEFRAME", "myTextureTest", FrameUtils.OriginFrameGameUIHandle, "TestTexture", 0);
        if (!textureFrameContainer) {
            return;
        }

        const textureFrame = BlzGetFrameByName("TestTextureValue", 0);
        if (!textureFrame) {
            return;
        }

        BlzFrameSetAbsPoint(textureFrameContainer, FRAMEPOINT_CENTER, 0.4, 0.3);
        BlzFrameSetTexture(textureFrame, "ReplaceableTextures\\CommandButtons\\BTNHeroPaladin", 0, true);
    }

    private static testTextureLayerFrame() {
        const textureLayerFrameContainer = BlzCreateSimpleFrame("TestTextureLayer", FrameUtils.OriginFrameGameUIHandle, 0);
        if (!textureLayerFrameContainer) {
            return;
        }

        BlzFrameSetAbsPoint(textureLayerFrameContainer, FRAMEPOINT_CENTER, 0.4, 0.3);
    }

    private static testTextWithTexLayerFrame() {
        const textWTexLayerFrame = BlzCreateSimpleFrame("TextSpecialContainer", FrameUtils.OriginFrameGameUIHandle, 0);
        if (!textWTexLayerFrame) {
            return;
        }

        BlzFrameSetAbsPoint(textWTexLayerFrame, FRAMEPOINT_CENTER, 0.0, 0.3);

        const texFrame = BlzGetFrameByName("LayerBgTex", 0);
        if (!texFrame) {
            return;
        }
        print("Found tex frame!");
        BlzFrameSetTexture(texFrame, "UI\\FrameDef\\UI\\questdialog.fdf", 0, true);

        // Texture "LayerBgTex" {
        //             Width 0.1,
        //             Height 0.1,
        //             Anchor CENTER, 0, 0,
        //             File "UI\FrameDef\UI\questdialog.fdf",
        //         }
    }

    /**
     * https://www.hiveworkshop.com/threads/the-big-ui-frame-tutorial.335296/#PosFrames:~:text=This%20Lua%20code%20creates%202%20Backdrop%20one%20that%20has%20a%20fixed%20position%20the%20other%20frequently%20changes%20the%20used%20FramePoint%20to%20pos%20to%20the%20same%20position.%20This%20works%20out%20of%20the%20Box.%20It%20should%20display%20the%20impact%20of%20usind%20different%20FramePoints.%20As%20bigger%20the%20Frame%20is%20as%20more%20the%20used%20FramePoint%20matters.
     */
    private static testMovingFrameExample() {
        const frame = BlzCreateFrame("QuestButtonBaseTemplate", FrameUtils.OriginFrameGameUIHandle, 0, 1561);
        const frame2 = BlzCreateFrame("QuestButtonBaseTemplate", FrameUtils.OriginFrameGameUIHandle, 0, 1561);

        if (!frame || !frame2) {
            return;
        }
        // EVENT_PLAYER_MOUSE_MOVE
        BlzFrameSetSize(frame, 0.1, 0.1);
        BlzFrameSetSize(frame2, 0.1, 0.1);

        //Zoomed out
        // BlzFrameSetScale(frame2, 0.2);
        //Very zoomed in
        // BlzFrameSetScale(frame2, 5);

        BlzFrameClearAllPoints(frame2);

        /**
         * When both used, they allow Frame 2 to be streched.
         */
        //Farme 2 by itself
        BlzFrameSetAbsPoint(frame2, FRAMEPOINT_BOTTOMLEFT, 0, 0.3);
        //Frame 2 attached to Frame 1
        // BlzFrameSetPoint(frame2, FRAMEPOINT_BOTTOMRIGHT, frame, FRAMEPOINT_LEFT, 0.05, 0);
        BlzFrameSetPoint(frame2, FRAMEPOINT_RIGHT, frame, FRAMEPOINT_LEFT, 0.05, 0);
        // This will still stretch, however half the bottom of the frame will be missing
        // BlzFrameSetPoint(frame2, FRAMEPOINT_TOPRIGHT, frame, FRAMEPOINT_LEFT, 0.05, 0);

        // -- the not movingframe to show the difference more clear.
        const screenCenter = BlzCreateFrameByType("BACKDROP", "", frame, "", 0);
        if (!screenCenter) {
            return;
        }

        BlzFrameSetSize(screenCenter, 0.02, 0.02);
        BlzFrameSetTexture(screenCenter, "replaceabletextures\\teamcolor\\teamcolor00", 0, false);
        BlzFrameSetAbsPoint(screenCenter, FRAMEPOINT_CENTER, 0.4, 0.3);

        // -- every 0.4 seconds change the current used Framepoint
        // TimerStart(CreateTimer(), 0.4, true,

        //seconds
        const duration = 1;
        const updateRate = 0.01;
        const totalUpdates = duration / updateRate;
        const distanceToComplete = 0.8;
        let distancePerUpdate = distanceToComplete / totalUpdates;
        let distanceCovered = 0;

        //Moving frame left and right
        Timer.create().start(updateRate, true, () => {
            BlzFrameClearAllPoints(frame);

            BlzFrameSetAbsPoint(frame, FRAMEPOINT_BOTTOMLEFT, distanceCovered, 0.3);
            distanceCovered += distancePerUpdate;

            if (distanceCovered >= 0.6 || distanceCovered < 0) {
                distancePerUpdate *= -1;
            }
        });

        //Setting position by each frame anchor point
        // let counter = 0;
        // Timer.create().start(0.4, true, () => {
        //     BlzFrameClearAllPoints(frame);
        //     const type = ConvertFramePointType(counter);
        //     if (!type) return;

        //     BlzFrameSetAbsPoint(frame, type, 0.4, 0.3);
        //     counter = counter + 1;

        //     if (counter > 8) {
        //         counter = 0;
        //     }
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

    static Test_JMT_GlueButton() {
        //Inherits the template in fdf
        const btn = BlzCreateFrame("UI_TemplateButton", FrameUtils.OriginFrameGameUIHandle, 0, 0);
        if (!btn) {
            return;
        }
        print("Button created!");

        BlzFrameClearAllPoints(btn);
        BlzFrameSetAbsPoint(btn, FRAMEPOINT_CENTER, 0.3, 0.3);
        BlzFrameSetSize(btn, 0.1, 0.1);
    }

    static Test_JMT_SimpleTexFrameHighlight() {
        const btn = BlzCreateFrameByType("SIMPLEBUTTON", "testBtn", FrameUtils.OriginFrameGameUIHandle, "JMT_SimpleTexButtonAndHighlight", 0);
        if (!btn) {
            return;
        }
        BlzFrameClearAllPoints(btn);
        BlzFrameSetAbsPoint(btn, FRAMEPOINT_CENTER, 0.4, 0.3);

        const childcount = BlzFrameGetChildrenCount(btn);
        print("frame children: ", childcount);
        // BlzFrameSetTexture(btn, "ReplaceableTextures\\CommandButtons\\BTNPriest.blp", 0, true);

        // const frame = BlzCreateFrameByType("TEXTURE")
        // const frame = BlzGetFrameByName("JMT_TestTextureValue", 0);
        // if (!frame) return;

        // BlzFrameSetTexture(frame, "ReplaceableTextures\\CommandButtons\\BTNPriest.blp", 0, true);

        print("button ready");
    }

    /**
     * @Works
     * The fdf used already includes the txt frame within it, therefore we can juse use BlzFrameSetText directly on the frame without needing to know the child.
     * @returns
     */
    static Text_UI_BtnWithText() {
        const btn = BlzCreateFrame("UI_TemplateButton", FrameUtils.OriginFrameGameUIHandle, 0, 0);

        if (!btn) {
            return;
        }

        const bg = BlzGetFrameByName("GlueButtonCustom_ButtonBackdropTemplate", 0);
        if (!bg) {
            return;
        }

        //Nope did not work!
        print("bg:", bg);
        BlzFrameSetTexture(bg, "ReplaceableTextures\\CommandButtons\\BTNPriest.blp", 0, true);

        // const btn2 = BlzCreateFrame("UI_TemplateButton", FrameUtils.OriginFrameGameUI, 0, 0);
        // if (!btn2) return;

        print("Button created!");

        BlzFrameClearAllPoints(btn);
        BlzFrameSetAbsPoint(btn, FRAMEPOINT_CENTER, 0.3, 0.3);
        BlzFrameSetSize(btn, 0.1, 0.1);
        BlzFrameSetText(btn, "Test");

        // BlzFrameClearAllPoints(btn2);
        // BlzFrameSetSize(btn2, 0.1, 0.1);
        // BlzFrameSetText(btn2, "Test 2");

        // BlzFrameSetPoint(btn2, FRAMEPOINT_BOTTOM, btn, FRAMEPOINT_TOP, 0, 0);
    }

    static Demo() {
        let firstColumnContainer = FrameUtils.CreateContainerWithContents();
        let previousContainer = firstColumnContainer;
        const columns = 3;
        const numElements = 3;

        // FrameUtils.AddSprite(firstColumnContainer);

        // //Button stuff
        // const button = BlzCreateFrame("UI_glue_button", FrameUtils.OriginFrameGameUI, 0, 0);
        // if (!button) return;

        // BlzFrameClearAllPoints(button);
        // BlzFrameSetAbsPoint(button, FRAMEPOINT_CENTER, 0.4, 0.3);
        // BlzFrameSetSize(button, 0.3, 0.1);
        // // const btnText = BlzCreateFrame("UI_buttonText", button, 0, 10);
        // // const btnText = BlzGetFrameByName("UI_glue_buttonText", 0);
        // // const btnText = BlzCreateFrameByType("TEXT", "buttonTextDemo", button, "UI_buttonText", 0);
        // // if (!btnText) return;
        // // BlzFrameSetAllPoints(btnText, button);
        // BlzFrameSetText(button, "Hello world");
        // // BlzFrameSetText(btnText, "HelloHe");
        // // BlzFrameSetAbsPoint(btnText, FRAMEPOINT_CENTER, 0.2, 0.3);
        // // BlzFrameClick;

        // //Probably need to access the texture by name so i will need to add that child directly to my button so I can change the texture
        // BlzFrameSetTexture(button, "units\\human\\Priest\\Priest", 0, true);

        for (let x = 1; x < numElements; x++) {
            const container = FrameUtils.CreateContainerWithContents();

            if (x % columns === 0) {
                FrameUtils.PinAdjacent("top", 0, container, firstColumnContainer);
                firstColumnContainer = container;
            } else {
                FrameUtils.PinAdjacent("right", 0, container, previousContainer);
            }

            previousContainer = container;
        }
    }

    static CreateContainerWithContents() {
        // const container = BlzCreateFrameByType("BACKDROP", "JMT_BackdropBaseTemplate_1", FrameUtils.OriginFrameGameUI, "JMT_BackdropBaseTemplate", 0);
        // const container = BlzCreateFrame("JMT_BackdropBaseTemplate", FrameUtils.OriginFrameGameUI, 0, 0);
        const container = BlzCreateFrame("JMT_PanelBase", FrameUtils.OriginFrameGameUIHandle, 0, 0);
        if (!container) {
            return;
        }

        print("container created!");

        BlzFrameClearAllPoints(container);
        BlzFrameSetAbsPoint(container, FRAMEPOINT_TOPLEFT, 0, 0.2);
        BlzFrameSetSize(container, 0.22, 0.15);

        const textArea = FrameUtils.createTextArea(container);
        const textArea2 = FrameUtils.createTextArea(container);
        if (!textArea) {
            return;
        }

        FrameUtils.PinAdjacent("right", 0.005, textArea2, textArea);

        const f = Frame.fromHandle(textArea);

        if (!f || !textArea) {
            return;
        }

        const t = Trigger.create();
        t.triggerRegisterFrameEvent(f, FRAMEEVENT_MOUSE_ENTER);

        /**
         * This is the lazy way to handle the text area keeping focus after a user clicks into it. The better way to go about it is to create an invisible button child Frame inside our fdf for this text area and then listen to the click on the button
         * to do this trick to give focus back to the user.
         */
        t.addAction(() => {
            print("Mouse entered the frame");

            BlzFrameSetEnable(textArea, false);
            BlzFrameSetEnable(textArea, true);
        });

        return container;
    }

    /**
     * Check the width of the passed in frame (presumed to be a parent to some number of children). Get the width of it's immediate children.
     * If the width of the children is greater than the parent, then update the width of the children.
     * For this, we'd want to know when children are added and removed. Which means we'd want to wrap our frame in a wrapper class which has a function to add or remove frames.
     */
    static flex() {}

    static fitContent() {}

    //basically just make the parent expand as the children are added until we reach max width. Then we start putting children ni the next row beneath.
    //If we do this though, we may want a grow function so the container can be allowed to grow in height too.
    //You also
    static maxContent() {}

    /**
     * We pin the ANCHOR of the FRAME inside the RELATIVE FRAME starting at FROM and expanding to TO.
     * @param pinPoint
     * @param pinFrom
     * @param to
     * @param frame
     * @param relativeFrame
     */
    static PinWithin(pinPoint: framepointtype, pinFrom: framepointtype, to: framepointtype, frame?: framehandle, relativeFrame?: framehandle, insetX: number = 0, insetY: number = 0) {
        if (!frame || !relativeFrame) {
            return;
        }

        //
        BlzFrameClearAllPoints(frame);
        const rightAnchors = [FRAMEPOINT_TOPRIGHT, FRAMEPOINT_RIGHT, FRAMEPOINT_BOTTOMRIGHT];
        const topAnchors = [FRAMEPOINT_TOPLEFT, FRAMEPOINT_TOP, FRAMEPOINT_TOPRIGHT];
        const cornerAnchors = [FRAMEPOINT_TOPLEFT, FRAMEPOINT_TOPRIGHT, FRAMEPOINT_BOTTOMRIGHT, FRAMEPOINT_BOTTOMLEFT];

        // const oppositesMap = new Map<framepointtype, framepointtype>([[FRAMEPOINT_TOPLEFT]]);
        //Since we are only allowing inset gaps and are only accepting one value for each axis to make things simple for usage, this means we do not want the frame to overflow out of the parent container.
        function getInsetGapX(_anchor: framepointtype, _insetX: number) {
            if (rightAnchors.includes(_anchor)) {
                return -_insetX;
            }

            return _insetX;
        }

        function getInsetGapY(_anchor: framepointtype, _insetY: number) {
            if (topAnchors.includes(_anchor)) {
                return -_insetY;
            }

            return _insetY;
        }

        //To start, this portion will be the same for all combinations
        BlzFrameSetPoint(frame, pinPoint, relativeFrame, to, insetX, insetY);

        //if you are gonig from corner to corner, then you need to do something different than this

        /**
         * When pinning frmo and to are on the same axis, it's always the furthest opposite anchor, regardless of where we are anchored from, we always move the furthest anchor to the final pin point "To"
         * When pinning diagonal to diagonal, you pin your matching corner to TO corner point
         * When pinning from X to Y or Y to X axis, it's always the
         *
         * If your anchor point is a center point, then you can't point
         *
         */

        //You know
        // if(){

        // }
        // BlzFrameSetPoint(frame, pinFrom, relativeFrame, to, getInsetGapX(), getInsetGapY());
    }

    /**
     * Used to pin sibling frames adjacent to one another.
     *
     * Pin frame to the 'X' of the relative frame
     *
     * @param frame
     * @param relativeFrame Should not be an origin frame. Only use sibling frames.
     * @param direction
     * @param useOriginalSize=true
     * @param pinToMidPoint Pins the frame to the midway points of the relative frame
     * @gap Small gap size : 0.005
     */
    static PinAdjacent(direction: "top" | "right" | "bottom" | "left", gap: number, frame?: framehandle, relativeFrame?: framehandle, pinToMidPoint?: boolean) {
        if (!frame || !relativeFrame) {
            print("PIN FRAME NOT FOUND");
            return;
        }

        BlzFrameClearAllPoints(frame);

        //pin bottom of frame to the top of relative frame
        if (direction === "top") {
            BlzFrameSetPoint(frame, FRAMEPOINT_BOTTOMLEFT, relativeFrame, FRAMEPOINT_TOPLEFT, 0, gap);
            BlzFrameSetPoint(frame, FRAMEPOINT_BOTTOMRIGHT, relativeFrame, FRAMEPOINT_TOPRIGHT, 0, gap);
        } else if (direction === "right") {
            BlzFrameSetPoint(frame, FRAMEPOINT_BOTTOMLEFT, relativeFrame, FRAMEPOINT_BOTTOMRIGHT, gap, 0);
            BlzFrameSetPoint(frame, FRAMEPOINT_TOPLEFT, relativeFrame, FRAMEPOINT_TOPRIGHT, gap, 0);
        } else if (direction === "bottom") {
            BlzFrameSetPoint(frame, FRAMEPOINT_TOPLEFT, relativeFrame, FRAMEPOINT_BOTTOMLEFT, 0, -gap);
            BlzFrameSetPoint(frame, FRAMEPOINT_TOPRIGHT, relativeFrame, FRAMEPOINT_BOTTOMRIGHT, 0, -gap);
        } else if (direction === "left") {
            BlzFrameSetPoint(frame, FRAMEPOINT_TOPRIGHT, relativeFrame, FRAMEPOINT_TOPLEFT, -gap, 0);
            BlzFrameSetPoint(frame, FRAMEPOINT_BOTTOMRIGHT, relativeFrame, FRAMEPOINT_BOTTOMRIGHT, -gap, 0);
        }
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

    private static testSimpleButtonTextureFrame() {
        const btnContainer = BlzCreateSimpleFrame("MySimpleButton", FrameUtils.OriginFrameGameUIHandle, 0);
        if (!btnContainer) {
            return;
        }

        const btnTextureFrame = BlzGetFrameByName("MySimpleButtonTexture", 0);
        if (!btnTextureFrame) {
            return;
        }

        BlzFrameSetAbsPoint(btnContainer, FRAMEPOINT_CENTER, 0.4, 0.3);
        BlzFrameSetTexture(btnTextureFrame, "ReplaceableTextures\\CommandButtons\\BTNHeroPaladin", 0, true);

        const trig = Trigger.create();
        BlzTriggerRegisterFrameEvent(trig.handle, btnContainer, FRAMEEVENT_CONTROL_CLICK);
        trig.addAction(() => {
            print("Button clicked!");
            const p = GetTriggerPlayer();
            if (!p) {
                return;
            }

            print(`Player: ${GetPlayerName(p)}`);

            // const localP = GetLocalPlayer();

            // if (p === localP) {
            //     print("Local player matches player");
            // }
        });
    }

    private static testButtonWithHighlightFrame() {
        //@ts-ignore
        const frame = BlzCreateSimpleFrame("TestA", BlzGetFrameByName("ConsoleUI", 0), 0);

        //@ts-ignore
        BlzFrameSetAbsPoint(frame, FRAMEPOINT_TOPLEFT, 0.4, 0.33);

        //@ts-ignore
        // BlzFrameSetTexture(BlzGetFrameByName("MyIconA2", 0), BlzGetAbilityIcon(FourCC("Hpal")), 0, true);

        //@ts-ignore
        BlzFrameSetTexture(BlzGetFrameByName("MyIconB2", 0), BlzGetAbilityIcon(FourCC("hfoo")), 0, true);

        //@ts-ignore
        BlzFrameSetTexture(BlzGetFrameByName("MyIconC2", 0), BlzGetAbilityIcon(FourCC("ogru")), 0, true);

        // BlzFrameSetTooltip(frame, )
        //@ts-ignore
        // BlzFrameSetEnable(frame, false);
    }

    private static testTextWithBackground() {
        const containerFrame = BlzCreateSimpleFrame("TextWithBlackBg", FrameUtils.OriginFrameGameUIHandle, 0);
        if (!containerFrame) {
            return;
        }
        BlzFrameSetAbsPoint(containerFrame, FRAMEPOINT_CENTER, 0, 0.25);
        BlzFrameSetSize(containerFrame, 0.1, 0.1);

        const textFrame = BlzGetFrameByName("TestStringValue", 0);
        if (!textFrame) {
            return;
        }

        BlzFrameSetText(textFrame, "Here is my text! Here is my text!");

        const textureFrame = BlzGetFrameByName("MyBarExBackground", 0);
        if (!textureFrame) {
            return;
        }

        BlzFrameSetTexture(textureFrame, "textures\\black32", 0, true);

        // BlzFrameSetTexture(textureFrame, "replaceabletextures\\teamcolor\\teamcolor00", 0, true);
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

    // static ForEachChild(fn: (child: Frame, depth: number, childNumber: number, iteration?: number) => void, frame?: Frame, childNumber: number = 0, depth: number = 0, data?: { iteration: number; depth?: number; myChildNumber?: number }) {
    //     if (!frame) {
    //         return "";
    //     }

    //     // Initialize data
    //     if (!data) {
    //         data = { iteration: 0, depth: depth, myChildNumber: childNumber };
    //     }

    //     const childCount = frame.childrenCount;
    //     depth++;

    //     fn(frame, depth, childNumber, data?.iteration);

    //     //All calls will update the same iteration variable
    //     if (data?.iteration) {
    //         data.iteration++;
    //     }

    //     // iteration++;
    //     const childrenStrings: string[] = [];

    //     for (let x = 0; x < childCount; x++) {
    //         const result = FrameUtils.ForEachChild(fn, frame.getChild(x), x, depth, data);
    //         childrenStrings.push(result);
    //         if (depth === 7) {
    //             print(result);
    //         }
    //     }

    //     //Return the parent
    //     //print information about me and my children, then reutrn that to my parent so they themselves and their children (including me)
    //     let finalStr = `Parent Depth: ${depth--}; MYchildNumber: ${childNumber}`;

    //     let depthArrows = "";
    //     for (let i = 0; i < depth; i++) {
    //         depthArrows += ">";
    //     }

    //     childrenStrings.forEach((c) => {
    //         finalStr += `\n${depthArrows} ${c}`;
    //     });

    //     return finalStr;
    // }
}

// enum FrameNames {
//     JMT_BackdropBaseTemplate = "JMT_BackdropBaseTemplate",
// }
