// import { UIConfig } from "src/shared/UIConfig";
// import { PlaySoundLocal } from "src/sound/utils";
// import { Frame, Timer } from "w3ts";
// import { Players } from "w3ts/globals";
// import { isPlayingUser } from "warcraft-3-w3ts-utils";
// import { PlayerFrames } from "../data";
// import { FrameUtils } from "../frame-utils";
// import { Text } from "./text";

// /**
//  * Responsible for displaying text to the user for various things like missing resources to build something or another thing.
//  */
// export class PlayerAlertText {
//     context: number;
//     name: string;
//     owner: Frame;

//     private alertTextFrame?: Frame;
//     /**
//      * Whenever this reaches 0 we can hide the text frame
//      * We will have a timer that decrements the number by 1 every second and checks if it's 0. This way, we can effectively debounce the display of message by resetting the value to 5 or however long the default display duration will be.
//      */
//     private remainingDisplayDuration: number = 0;
//     private textDisplayTimer: Timer = Timer.create();

//     constructor(context: number, name: string, owner: Frame) {
//         this.context = context;
//         this.name = name;
//         this.owner = owner;
//         this.render();
//     }

//     private render() {
//         this.alertTextFrame = Text.Render(this.context, this.name + "textFrame", this.owner);
//         this.alertTextFrame?.clearPoints();
//         this.alertTextFrame?.setAbsPoint(FRAMEPOINT_LEFT, 0.12, 0.23);
//         this.alertTextFrame?.setVisible(false);
//         this.alertTextFrame?.setScale(1.5);
//         this.alertTextFrame?.setSize(0.2, 0);
//         this.alertTextFrame?.setEnabled(false);
//     }

//     public displayText(text: string) {
//         this.alertTextFrame?.setText(text);
//         /**
//          * @bug maybe? need to test this. might need local player check here.
//          */
//         this.alertTextFrame?.setVisible(true);

//         // PlaySoundLocal("Sound\\Interface\\Error", Players[this.context].isLocal());
//         this.resetDisplayTimeRemaining();
//     }

//     private resetDisplayTimeRemaining() {
//         if (this.remainingDisplayDuration <= 0) {
//             this.remainingDisplayDuration = UIConfig.PlayerAlertTextFrameDisplayDuration;
//             this.textDisplayTimer?.destroy();
//             this.textDisplayTimer = Timer.create();

//             this.textDisplayTimer.start(1, true, () => {
//                 this.remainingDisplayDuration--;

//                 if (this.remainingDisplayDuration <= 0) {
//                     // this.missingResourcesTextTimer?.pause();
//                     this.textDisplayTimer?.destroy();
//                     this.alertTextFrame?.setVisible(false);
//                 }
//             });
//         } else {
//             this.remainingDisplayDuration = UIConfig.PlayerAlertTextFrameDisplayDuration;
//         }
//     }
// }

// export function initPlayerAlertTextFrames() {
//     Players.forEach((p) => {
//         if (isPlayingUser(p)) {
//             const frame = new PlayerAlertText(p.id, "playerAlertText" + p.id, FrameUtils.OriginFrameGameUI);
//             const pFrame = PlayerFrames.get(p.id);

//             if (pFrame) {
//                 pFrame.alertText = frame;
//             }
//         }
//     });
// }
