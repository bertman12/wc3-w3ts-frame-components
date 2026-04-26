import { PlaySoundLocal } from "src/sound/utils";
import { Frame, Trigger } from "w3ts";
import { delayedTimer } from "warcraft-3-w3ts-utils";
import { FrameUtils } from "./frame-utils";
import { FrameInheritable, Inheritables } from "./names";

export interface IconButton {
    button?: Frame;
    buttonIconFrame?: Frame;
    trigger?: Trigger;
}

export class Components {
    /**
     * @todo Do we need to disable the empty frame? So that way it doesn't block clicks?
     */
    static EmptyFrame(context: number, name: string, owner?: Frame) {
        // Frame.createType(name, owner || FrameUtils.OriginFrameGameUI, context, "FRAME", )
        // const container = Frame.createType(this.config.containerName, this.config.containerOwner ?? FrameUtils.OriginFrameGameUI, this.config.context, "FRAME", Inheritables.EmptyFrame); //Inheritables.Frames.EmptyFrame.RefName, ...FrameType
        const container = Frame.createType(name, owner ?? FrameUtils.OriginFrameGameUI, context, "FRAME", Inheritables.EmptyFrame); //Inheritables.Frames.EmptyFrame.RefName, ...FrameType
        container?.setEnabled(false);

        return container;
    }

    /**
     * Meh solution not that great. cant use glue buttons
     *
     * We could also add a config option in case the arguments become to many optional ones
     * @returns
     */
    static IconButton(context: number, name: string, texture: string, owner?: Frame, onClick?: (btn: Frame, btnIcon?: Frame) => void): IconButton {
        const button = Frame.fromHandle(BlzCreateFrameByType("BUTTON", name, owner?.handle || FrameUtils.OriginFrameGameUIHandle, "ScoreScreenTabButtonTemplate", context));
        if (!button) {
            return { button: undefined, buttonIconFrame: undefined };
        }

        // --create a BACKDROP for Button which displays the Texture
        const buttonIconFrame = Frame.fromHandle(BlzCreateFrameByType("BACKDROP", name + "IconButtonIcon", button.handle, "", context));
        if (!buttonIconFrame) {
            return { button: undefined, buttonIconFrame: undefined };
        }

        // -- buttonIcon will mimic buttonFrame in size and position
        BlzFrameSetAllPoints(buttonIconFrame.handle, button.handle);
        // -- place the Button to the left center of the Screen
        BlzFrameSetAbsPoint(button.handle, FRAMEPOINT_CENTER, 0.1, 0.3);
        // -- set the Button's Size
        BlzFrameSetSize(button.handle, 0.03, 0.03);
        // -- set the texture
        BlzFrameSetTexture(buttonIconFrame.handle, texture, 0, false);

        // if (onClick) {
        /**
         * Leaks if never destroyed
         */
        const t = Trigger.create();
        t.triggerRegisterFrameEvent(button, FRAMEEVENT_CONTROL_CLICK);
        t.addAction(() => {
            if (onClick) {
                const localP = GetLocalPlayer();
                const p = GetTriggerPlayer();

                PlaySoundLocal("Sound\\Interface\\BigButtonClick.flac", localP === p);

                buttonIconFrame.clearPoints();
                buttonIconFrame.setPoint(FRAMEPOINT_BOTTOMLEFT, button, FRAMEPOINT_BOTTOMLEFT, 0.001, 0.001);
                buttonIconFrame.setPoint(FRAMEPOINT_TOPRIGHT, button, FRAMEPOINT_TOPRIGHT, -0.001, -0.001);

                delayedTimer(0.05, () => {
                    buttonIconFrame.clearPoints();
                    buttonIconFrame.setAllPoints(button);
                });

                if (onClick) {
                    onClick(button, buttonIconFrame);
                }
            }

            //do this regardless if they registered a click event.
            button.setEnabled(false);
            button.setEnabled(true);
        });

        // } else {
        //leave enabled so tooltips still work
        // button.setEnabled(false);
        // }

        return { button, buttonIconFrame, trigger: t };
    }

    static TextArea(name: string, text?: string, parent?: framehandle, context: number = 0) {
        if (!parent) {
            return;
        }

        const textArea = Frame.fromHandle(BlzCreateFrameByType("TEXTAREA", name, parent, "JMT_TextAreaTemplate", context));
        if (!textArea) {
            return;
        }

        //The size no longer matters when we are pinning left and right corners of the frame
        BlzFrameSetSize(textArea.handle, 0.1, 0.1);
        BlzFrameClearAllPoints(textArea.handle);
        BlzFrameSetPoint(textArea.handle, FRAMEPOINT_BOTTOMLEFT, parent, FRAMEPOINT_BOTTOMLEFT, 0.005, 0.005);
        BlzFrameSetText(textArea.handle, text ?? `All work and no play makes Jack a dull boy. `);

        const f = Frame.fromHandle(textArea.handle);

        if (!f || !textArea) {
            return;
        }

        const t = Trigger.create();
        t.triggerRegisterFrameEvent(textArea, FRAMEEVENT_MOUSE_ENTER);

        t.addAction(() => {
            textArea.setEnabled(false);
            textArea.setEnabled(true);
        });

        return textArea;
    }

    static GlueTextButton(context: number, name: string, owner?: Frame, onClick?: (button: Frame) => void) {
        const btn = Frame.createType(name, owner || FrameUtils.OriginFrameGameUI, context, FrameInheritable.GlueTextButton.type, FrameInheritable.GlueTextButton.name);

        if (!btn) {
            return;
        }

        BlzFrameClearAllPoints(btn.handle);
        BlzFrameSetAbsPoint(btn.handle, FRAMEPOINT_CENTER, 0.3, 0.3);
        BlzFrameSetSize(btn.handle, 0.1, 0.1);

        const t = Trigger.create();
        t.triggerRegisterFrameEvent(btn, FRAMEEVENT_CONTROL_CLICK);
        t.addAction(() => {
            const localP = GetLocalPlayer();
            const p = GetTriggerPlayer();

            PlaySoundLocal("Sound\\Interface\\BigButtonClick.flac", localP === p);

            btn.setEnabled(false);
            btn.setEnabled(true);

            if (onClick) {
                onClick(btn);
            }
        });

        return btn;
    }

    /**
     * Owner defaults to origin frame.
     * @param name
     * @param context
     * @param owner
     * @returns
     */
    static Backdrop(name: string, context: number = 0, owner?: Frame) {
        const container = Frame.fromHandle(BlzCreateFrameByType("BACKDROP", name, owner?.handle || FrameUtils.OriginFrameGameUIHandle, "JMT_BackdropBaseTemplate", context));
        if (!container) {
            return;
        }

        BlzFrameClearAllPoints(container.handle);
        BlzFrameSetAbsPoint(container.handle, FRAMEPOINT_BOTTOMLEFT, 0.4, 0.3);
        BlzFrameSetSize(container.handle, 0.3, 0.2);

        return container;
    }

    // static Tooltip(context: number, name: string, header: string, text: string, frame?: Frame, includeBackground: boolean = true, config?: TooltipConfig) {
    //     if (!frame) {
    //         return;
    //     }

    //     if (includeBackground) {
    //         //  -- Create the Background a Backdrop
    //         const tooltipFrameBackGround = Frame.fromHandle(BlzCreateFrameByType("BACKDROP", name, frame.handle, "JMT_BackdropTemplate_Tooltip", context)); //I'm not sure if we need the parent to be an origin frame, but we'll roll with this for now.
    //         if (!tooltipFrameBackGround) {
    //             return;
    //         }

    //         // -- Create the Text as child of the Background
    //         const tooltipFrameText = Frame.fromHandle(BlzCreateFrameByType("TEXT", "MyScriptDialogButtonTooltip", tooltipFrameBackGround.handle, "", context));
    //         if (!tooltipFrameText) {
    //             return;
    //         }

    //         // -- Copy Size and Position with a small offset.
    //         BlzFrameSetPoint(tooltipFrameBackGround.handle, FRAMEPOINT_BOTTOMLEFT, tooltipFrameText.handle, FRAMEPOINT_BOTTOMLEFT, -0.005, -0.01);
    //         BlzFrameSetPoint(tooltipFrameBackGround.handle, FRAMEPOINT_TOPRIGHT, tooltipFrameText.handle, FRAMEPOINT_TOPRIGHT, 0.005, 0.01);
    //         // BlzFrameSetPoint(tooltipFrameBackGround.handle, FRAMEPOINT_TOPRIGHT, tooltipFrameText.handle, FRAMEPOINT_TOPRIGHT, -0.005, 0.01);

    //         // -- The background becomes the button's tooltip, the Text as child of the background will share the visibility
    //         BlzFrameSetTooltip(frame.handle, tooltipFrameBackGround.handle);

    //         if (config?.reverseOrientation) {
    //             BlzFrameSetPoint(tooltipFrameText.handle, FRAMEPOINT_BOTTOMRIGHT, frame.handle, FRAMEPOINT_TOPRIGHT, 0.005, 0.01);
    //         } else {
    //             // -- Place the Tooltip above the Button
    //             BlzFrameSetPoint(tooltipFrameText.handle, FRAMEPOINT_BOTTOMLEFT, frame.handle, FRAMEPOINT_TOPLEFT, 0, 0.01);
    //         }

    //         // -- Prevent the TEXT from taking mouse control
    //         BlzFrameSetEnable(tooltipFrameText.handle, false);
    //         Components.StyleTooltipText(tooltipFrameText, header, text);

    //         return { tooltipFrameBackGround, tooltipFrameText };
    //     } else {
    //         const tooltipFrameText = Frame.fromHandle(BlzCreateFrameByType("TEXT", "MyScriptDialogButtonTooltip", FrameUtils.OriginFrameGameUIHandle, "", context));
    //         if (!tooltipFrameText) {
    //             return;
    //         }

    //         // -- tooltipFrame becomes button's tooltip
    //         BlzFrameSetTooltip(frame.handle, tooltipFrameText.handle);
    //         // -- Place the Tooltip above the Button
    //         BlzFrameSetPoint(tooltipFrameText.handle, FRAMEPOINT_BOTTOM, frame.handle, FRAMEPOINT_TOP, 0, 0.01);
    //         // -- Prevent the TEXT from taking mouse control
    //         BlzFrameSetEnable(tooltipFrameText.handle, false);
    //         BlzFrameSetText(tooltipFrameText.handle, text);

    //         return { tooltipFrameText, tooltipFrameBackGround: undefined };
    //     }
    // }
}
