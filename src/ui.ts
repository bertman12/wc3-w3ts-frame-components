import { Frame } from "w3ts";
import { renderMenuBars } from "./bars/menuBar";
import { createDayNightCountdownTimer } from "./information/dayNightCountDownTimer";
import { setupNightKPI } from "./information/night";
import { createPlayerResourceFrames } from "./information/player-resources";
import { createPlayerBonusMenus } from "./menus/bonusSelection";
import { createPlayerBossMenus } from "./menus/bossMenu";
import { initPlayerBuildMenus } from "./menus/buildMenu";
import { renderHeadquarterSelectionMenu } from "./menus/headquarterSelectionMenu";
import { renderPlayerBonusPanels } from "./panels/playersPanel";
import { initPlayerAlertTextFrames } from "./text/playerAlertText";

/**
 * Each player gets their own UI separated by context.
 */

export class UI {
    /**
     * Creates all the static frames for all players at game start. Each player will have their own context
     */
    static Init() {
        /**
         * Render player panel first
         */
        renderPlayerBonusPanels();
        renderHeadquarterSelectionMenu();
        renderMenuBars();
        createPlayerBonusMenus();
        createPlayerBossMenus();
        setupNightKPI();
        createDayNightCountdownTimer();
        createPlayerResourceFrames();
        initPlayerBuildMenus();
        initPlayerAlertTextFrames();

        /**
         * For debugging
         */
        // initFrameViewer();

        // Hides the Day/Night Clock
        BlzFrameSetVisible(BlzFrameGetChild(BlzFrameGetChild(BlzGetOriginFrame(ORIGIN_FRAME_GAME_UI, 0) as framehandle, 5) as framehandle, 0) as framehandle, false);
        // Hide upkeep text
        BlzFrameSetAbsPoint(BlzGetFrameByName("ResourceBarUpkeepText", 0) as framehandle, FRAMEPOINT_TOPRIGHT, 0.0, 0.0);

        const console = Frame.fromHandle(BlzGetFrameByName("ConsoleUI", 0));

        if (console) {
            // hide the upper console backdrop
            console.getChild(0)?.setVisible(false);
            console.getChild(2)?.setVisible(false);

            /**
             * Hides the mouse deadzone where the command card is.
             */
            BlzFrameSetVisible(BlzFrameGetChild(BlzGetFrameByName("ConsoleUI", 0) as framehandle, 5) as framehandle, false);
        }

        // const btn = Frame.fromHandle(BlzCreateFrameByType("SIMPLEBUTTON", "testButtonSimple", FrameUtils.OriginFrameGameUIHandle, Inheritables.JMT_SimpleButtonBase, 0));

        // btn?.clearPoints();
        // btn?.setAbsPoint(FRAMEPOINT_CENTER, 0.4, 0.3);
        // btn?.setSize(0.1, 0.1);
        // btn?.setTexture("ReplaceableTextures\\CommandButtons\\BTNPriest.blp", 0, false);
    }
}
