import { Frame, MapPlayer } from "w3ts";
import { Players } from "w3ts/globals";
import { isPlayingUser } from "warcraft-3-w3ts-utils";
import { PlayerFrames } from "../data";
import { Components } from "../frame-components";
import { FrameUtils } from "../frame-utils";
import { Grid, GridItemBaseDefinition } from "../grid/grid";
import { Panel } from "../panels/panel";
import { GridSelectionMenuData } from "../sections/gridSelectionMenu";

export function renderMenuBars() {
    //
    Players.forEach((p) => {
        if (isPlayingUser(p)) {
            const menuBar = new MenuBar(p.id, "playerMenuBar" + p.id, FrameUtils.OriginFrameGameUI);
            const frames = PlayerFrames.get(p.id);

            if (frames) {
                frames.menuBar = menuBar;
                //Default visible is off until the headquarter selection menu is done
                menuBar.containerFrame?.setVisible(false);
            }
        }
    });
}

export class MenuBar {
    context: number;
    name: string;
    owner?: Frame;
    containerFrame?: Frame;

    constructor(context: number, name: string, owner?: Frame) {
        this.context = context;
        this.name = name;
        this.owner = owner;
        this.render();
    }

    private render() {
        const panel = Panel.Render(this.context, this.name, this.owner);

        if (!panel) {
            print("Frame failed to render: " + this.name);
            return;
        }

        this.containerFrame = panel;

        panel.clearPoints();
        panel.setAbsPoint(FRAMEPOINT_BOTTOM, 0.4, 0.14);
        panel.setSize(0.2, 0.03);

        //We can add a more refined grid item definition later if need be
        const grid = new Grid<LocalButtonRenderData, GridItemBaseDefinition>({
            context: this.context,
            containerName: "",
            containerOwner: panel,
            gapX: 0.005,
            gapY: 0.005,
            rows: 1,
            columns: 4,
            data: buttonData,
            renderItem: (parent, row, col, index) => {
                const data = buttonData[index];
                if (!data) {
                    return;
                }

                const btnData = Components.IconButton(this.context, this.name + "button" + index, data.iconTexture || "", this.containerFrame, () => {
                    data.onClick();
                });
                const ttHeader = data?.tooltipTitle ?? "";
                const tt = Components.Tooltip(this.context, this.name + "btnTooltip" + index, ttHeader, data?.tooltip || "", btnData.button);
                btnData.button?.setSize(btnData.button.width * 0.6, btnData.button.height * 0.6);
                //Set the width relative to the amount of characters
                tt?.tooltipFrameText.setSize(0.03 + 0.004 * ttHeader.length, tt.tooltipFrameText.height);

                return { container: btnData.button };
            },
        });

        grid?.containerFrame?.clearPoints();
        grid?.containerFrame?.setPoint(FRAMEPOINT_LEFT, panel, FRAMEPOINT_LEFT, 0.0075, -0.0025);
    }

    /**
     * Makes the menu bar visible for all players
     */
    static DisplayAll() {
        PlayerFrames.forEach((frames, playerNumber) => {
            const playerChoiceFrame = frames.playerChoicesPanel;

            if (!playerChoiceFrame) {
                return;
            }

            //Let's hide the player choice frames and also make their size more reasonable
            playerChoiceFrame.conatinerFrame?.setVisible(false);
            //show the player their own menu bar
            const localP = GetLocalPlayer();
            frames.menuBar?.containerFrame?.setVisible(GetPlayerId(localP) === playerNumber);
        });
    }
}

interface LocalButtonRenderData extends GridSelectionMenuData {
    onClick: () => void;
}

const buttonData: LocalButtonRenderData[] = [
    {
        iconTexture: "ReplaceableTextures\\CommandButtons\\BTNInvisibility.blp",
        tooltipTitle: "Players",
        tooltip: "",
        onClick: () => {
            const p = MapPlayer.fromEvent();
            if (!p) {
                return;
            }

            const frames = PlayerFrames.get(p.id);
            if (!frames) {
                return;
            }

            const localP = GetLocalPlayer();
            const playerChoices = frames.playerChoicesPanel?.conatinerFrame;

            //Hide the player's  frame only for the local player
            if (GetPlayerId(localP) === p.id) {
                playerChoices?.setVisible(!playerChoices.visible);
            }
        },
    },
    {
        iconTexture: "ReplaceableTextures\\CommandButtons\\BTNRevenant.blp",
        tooltipTitle: "Bosses",
        tooltip: "",
        onClick: () => {
            const p = MapPlayer.fromEvent();
            if (!p) {
                return;
            }

            const frames = PlayerFrames.get(p.id);
            if (!frames) {
                return;
            }

            const localP = GetLocalPlayer();
            const bossMenuContainer = frames.bossMenu?.containerFrame;

            //Hide the player's  frame only for the local player
            // print(`before setting boss frame visible for ${ptColor(p, p.name)}`);

            if (GetPlayerId(localP) === p.id) {
                bossMenuContainer?.setVisible(!bossMenuContainer.visible);
            }
        },
    },
    {
        iconTexture: "ReplaceableTextures\\CommandButtons\\BTNSelectHeroOn",
        tooltipTitle: "Guide (Coming Soon)",
        tooltip: "",
        onClick: () => {
            const p = MapPlayer.fromEvent();
            if (!p) {
                return;
            }

            const frames = PlayerFrames.get(p.id);
            if (!frames) {
                return;
            }

            const bossMenuContainer = frames.bossMenu?.containerFrame;

            //Hide the player's  frame only for the local player

            if (p.isLocal()) {
                // bossMenuContainer?.setVisible(!bossMenuContainer.visible);
            }
        },
    },
];
