import { Frame, MapPlayer } from "w3ts";
import { Players } from "w3ts/globals";
import { isPlayingUser, ptColor } from "warcraft-3-w3ts-utils";
import { PlayerFrames } from "../data";
import { Components } from "../frame-components";
import { Grid, GridItemBaseDefinition } from "../grid/grid";
import { GridSelectionMenuData } from "../sections/gridSelectionMenu";
import { Text } from "../text/text";
import { Panel } from "./panel";

/**
 * Renders for each player.
 * Each player gets their own frame. However the state must be synced for each frame for info reason, not desync.
 * We want them all to see the same thing, but to only change visibility locally.
 */
export function renderPlayerBonusPanels() {
    Players.forEach((p) => {
        //I wonder if having my npm package utils and local utils will create an issue?
        if (isPlayingUser(p)) {
            const component = new PlayersPanel(p.id);
            const pFrames = PlayerFrames.get(p.id);

            if (pFrames) {
                pFrames.playerChoicesPanel = component;
            }
        }
    });
}

interface ItemFrameDefinition extends GridItemBaseDefinition {
    buttonFrames?: ReturnType<typeof Components.IconButton>;
}

export class PlayersPanel {
    constructor(context: number) {
        this.context = context;
        this.render();
        //Save for each player
    }

    buttonGrids: Map<number, Grid<GridSelectionMenuData, ItemFrameDefinition>> = new Map();

    /**
     * Row and data
     *
     * If necessary, we can associate an id with the button rendered, but don't think it will be necessary, unless we are going to do some on click events and we want to show something specific for that button, like extra info.
     */
    public buttonsRendered: Map<number, ButtonData[]> = new Map([
        [0, []],
        [1, []],
        [2, []],
        [3, []],
        [4, []],
        [5, []],
    ]);
    public conatinerFrame?: Frame;
    context: number;

    /**
     * Render is private since it creates the frames and we only need to do that once.
     */
    private render() {
        const baseName = "playerBonusesPanel" + this.context;
        const panel = Panel.Render(this.context, baseName);

        if (!panel) {
            return;
        }

        this.conatinerFrame = panel;

        panel.clearPoints();
        //Default position
        panel.setAbsPoint(FRAMEPOINT_RIGHT, 0.8, 0.405);
        panel.setSize(0.16, 0.26);

        const title = Text.Render(this.context, baseName + "titleText", panel);
        title?.clearPoints();
        title?.setPoint(FRAMEPOINT_TOP, panel, FRAMEPOINT_TOP, 0.01, -0.01);
        title?.setSize(0.1, 0.004 * "Players".length);
        title?.setText("Players");
        title?.setEnabled(false);

        const grid = new Grid<MapPlayer, ItemFrameDefinition>({
            columns: 1,
            rows: 4,
            containerName: baseName + "playerNameAndChoice",
            containerOwner: panel,
            context: this.context,
            gapX: 0.01,
            gapY: 0.03,
            data: Players,
            renderItem: (parent, row, column, index) => {
                const player = Players[row];
                if (!player) {
                    return;
                }

                const playerName = Text.Render(this.context, baseName + "playerName" + row, parent);
                if (!playerName) {
                    return;
                }

                playerName.setText(ptColor(player, player.name));
                playerName.setSize(0.1, 0.005);

                /**
                 * Render grid for player buttons.
                 */
                const buttonGrid = new Grid<GridSelectionMenuData, ItemFrameDefinition>({
                    columns: 8,
                    rows: 3,
                    containerName: baseName + "buttonGrid",
                    containerOwner: playerName,
                    context: this.context,
                    gapX: 0.0005,
                    gapY: 0.0005,
                    data: [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}], //this is the tooltip, icon text, and extended tooltip about the modifiers chosen. initially it's null but updated later on
                    renderItem: (_parent, _row, _col, _index) => {
                        const buttonOption = Components.IconButton(this.context, baseName + "PlayerNameButton" + _index + this.context, "ReplaceableTextures\\WorldEditUI\\Editor-Random-Unit.blp", _parent);
                        if (!buttonOption.button) {
                            return;
                        }

                        buttonOption.button?.setSize(buttonOption.button.width / 2, buttonOption.button.height / 2);
                        const tt = Components.Tooltip(this.context, baseName + "selectionTooltip" + _index + this.context, "", "", buttonOption.button, true, { reverseOrientation: true });

                        //Need to get the frame specifically.
                        const playerButtons = this.buttonsRendered.get(player.id);

                        //Starts empty so check undefined
                        if (playerButtons !== undefined) {
                            //Default not used
                            playerButtons.push({ isUsed: false, button: buttonOption.button, buttonIcon: buttonOption.buttonIconFrame, buttonTooltip: tt?.tooltipFrameText });

                            this.buttonsRendered.set(player.id, playerButtons);
                        }

                        buttonOption.button.setVisible(false);

                        return { container: buttonOption.button, buttonFrames: buttonOption };
                    },
                    updateItem: (data, itemFrames) => {
                        //todo
                        if (!data || !itemFrames) {
                            return;
                        }

                        //update texture and tooltip
                    },
                });

                if (buttonGrid) {
                    this.buttonGrids.set(player.id, buttonGrid);
                }

                buttonGrid?.containerFrame?.clearPoints();
                buttonGrid?.containerFrame?.setPoint(FRAMEPOINT_TOPLEFT, playerName, FRAMEPOINT_BOTTOMLEFT, 0, -0.01);

                return { container: playerName };
            },
        });

        grid?.containerFrame?.clearPoints();
        grid?.containerFrame?.setSize(panel.width, panel.height);
        grid?.containerFrame?.setPoint(FRAMEPOINT_TOPLEFT, panel, FRAMEPOINT_TOPLEFT, 0.01, -0.04);
    }

    addPlayerBonus(playerNumber: number, texture: string, tooltipHeader: string, tooltip: string) {
        const playerButtons = this.buttonsRendered.get(playerNumber);

        if (!playerButtons) {
            return;
        }

        let firstBtnFound = undefined;

        //Find the first button that is not used
        for (let x = 0; x < playerButtons.length; x++) {
            const savedBtn = playerButtons[x];
            if (!savedBtn.isUsed) {
                firstBtnFound = savedBtn;
                break;
            }
        }

        if (!firstBtnFound) {
            return;
        }

        firstBtnFound.buttonIcon?.setTexture(texture, 0, false);
        Components.StyleTooltipText(firstBtnFound.buttonTooltip, tooltipHeader, tooltip);

        firstBtnFound.isUsed = true;

        this.buttonsRendered.set(playerNumber, playerButtons);

        // const localP = GetLocalPlayer();

        //maybe update?
        //This is getting called for each player outside this function, presumably.
        // if (GetPlayerId(localP) === playerId) {
        // firstBtnFound.button?.setVisible(true);
        // }

        // We can actually just set visible for each player's frame, they won't be visibile when a different player has their menu no visible, since the parent is not visible, then the child is not visible.
        firstBtnFound.button?.setVisible(true);
    }

    update() {
        //
    }

    /**
     * This will update each individual player's frames with the bonus chosen by a specific player
     */
    static updatePlayerBonuses(playerNumber: number, texture: string, tooltipHeader: string, tooltip: string) {
        PlayerFrames.forEach((frames) => {
            const playerChoiceFrame = frames.playerChoicesPanel;

            if (!playerChoiceFrame) {
                return;
            }

            //We want to update the button section for the player which confirmed the choice, not the currently iterated player. So this player should be the same player updated for each player's frames
            playerChoiceFrame.addPlayerBonus(playerNumber, texture, tooltipHeader, tooltip);
        });
    }
}

interface ButtonData {
    button?: Frame;
    buttonIcon?: Frame;
    buttonTooltip?: Frame;
    isUsed: boolean;
}
