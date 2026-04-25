import { GameModifier, SelectModifiersConfiguration } from "src/modifiers/types";
import { applyModifier, selectModifiers } from "src/modifiers/utils";
import { GameConfig } from "src/shared/GameConfig";
import { UIConfig } from "src/shared/UIConfig";
import { stateController } from "src/state/state-controller";
import { Frame } from "w3ts";
import { Players } from "w3ts/globals";
import { isPlayingUser } from "warcraft-3-w3ts-utils";
import { PlayerFrames } from "../data";
import { FrameUtils } from "../frame-utils";
import { PlayersPanel } from "../panels/playersPanel";
import { GridSelectionMenu, GridSelectionMenuData } from "../sections/gridSelectionMenu";

/**
 * This will be a menu which the player can.
 *
 * We may also want to think about having multiple for a player?
 *
 * And also the possibility for the player to minimize the bonuses menu.
 *
 * It might make sense to let the player choose whenever they want too.
 *
 * Place a button somewhere on the screen where they can choose the modifiers whenever they want.
 *
 * We'll do the simple stuff first
 *
 */
export class BonusSelectionMenu {
    context: number;
    owner: Frame;
    name: string;

    gridMenu?: GridSelectionMenu<BonusSelectionData>;

    constructor(context: number, owner: Frame, name: string) {
        this.context = context;
        this.owner = owner;
        this.name = name;
        this.Render();
    }

    /**
     * This should update the grid information with incoming data
     * @param menuData
     */
    Update(menuData: GameModifier[]) {
        //We need to translate this into data which the grid will consume.
        // just pass in the necessary GridRenderData , no need to pass in additional information.
        // call gridSelectionMenu.update
    }

    Render() {
        const gridMenu = new GridSelectionMenu<BonusSelectionData>(this.name, this.context, {
            maxChoices: UIConfig.StartingBonusNumberOfPicks,
            sharedFrame: false,
            timedLife: UIConfig.StartingBonusSelectionTime,
            titleText: "Choose a Bonus",
            itemData: [], //initially this can be empty
            onClose: () => {
                //Now we need to grant the player random bonuses which they dont have.
                if (!this.gridMenu) {
                    print("no grid menu found!");
                    return;
                }

                const playerItems = this.gridMenu?.playerItemIndexesChosen.get(this.context) || [];
                const itemsChosenCount = playerItems.length;

                if (itemsChosenCount < this.gridMenu?.config.maxChoices) {
                    //This is not a shared pool of bonuses. Worry about that later if the time comes
                    //The items chosen is a list of indexes
                    const unpickedItems = this.gridMenu.config.itemData.filter((data, index) => !playerItems.includes(index));
                    let itemsNeeded = this.gridMenu.config.maxChoices - itemsChosenCount;

                    //Nothing left to pick
                    if (unpickedItems.length === 0) {
                        return;
                    }

                    //Prevent needing more items than possible
                    if (itemsNeeded > unpickedItems.length) {
                        itemsNeeded = unpickedItems.length;
                    }

                    //Choose a random index of the item data. [0, length)
                    //Call add bonus for the player, using the item data chosen from the random index.
                    const randomItemSet = new Set<BonusSelectionData>();

                    while (itemsNeeded !== 0) {
                        const randomIndex = Math.floor(Math.random() * unpickedItems.length);
                        const data = unpickedItems[randomIndex];

                        if (!randomItemSet.has(data)) {
                            randomItemSet.add(data);
                            itemsNeeded--;
                        }
                    }

                    const localP = GetPlayerId(GetLocalPlayer());

                    randomItemSet.forEach((value) => {
                        if (localP === this.context) {
                            print(`Added random item for ${Players[this.context].name}: ${value.tooltipTitle}`);
                        }

                        if (value.gameModifier) {
                            applyModifier(value.gameModifier);
                        }

                        PlayersPanel.updatePlayerBonuses(this.context, value.iconTexture || "", value.tooltipTitle || "", value.tooltip || "");
                    });
                }

                if (!GameConfig.startingBonusesPicked) {
                    GameConfig.startingBonusesPicked = true;
                    stateController.next();
                }
            },
            gridConfig: {
                rows: 1,
                columns: 1,
            },
        });

        this.gridMenu = gridMenu;
        //start hidden
        gridMenu.containerFrame?.setVisible(false);
    }

    /**
     * Opens a single player's bonus menu
     * @param playerNumber
     */
    static Open(numChoices: number, playerNumber: number, params: SelectModifiersConfiguration) {
        this._open(playerNumber, numChoices, params);
    }

    /**
     * We should be able to open all with a set of predetermined bonuses or random bonuses of our choosing.
     *
     * Otherwise, why call update lol.
     * @param numberChoices This is how choices the player can make from the list of modifiers rendered.
     */
    static OpenAll(numberChoices: number, params: SelectModifiersConfiguration) {
        Players.forEach((p, index) => {
            if (isPlayingUser(p)) {
                this._open(p.id, numberChoices, params);
            }
        });
    }

    /**
     *
     * @param playerNumber
     * @param numChoices For ui display purpose only.
     * @param params
     * @returns
     */
    private static _open(playerNumber: number, numChoices: number, params: SelectModifiersConfiguration) {
        const pFrames = PlayerFrames.get(playerNumber);

        if (pFrames) {
            const grid = pFrames.bonusSelection?.gridMenu;

            if (!grid || !grid.config) {
                return;
            }

            //Prep data object
            let newData: BonusSelectionData[] = [];
            //Get the modifiers we want
            const modifiers = selectModifiers(params);

            if (modifiers) {
                newData = modifiers.map((m) => {
                    return {
                        gameModifier: { ...m, playerNumber },
                        tooltip: m.tooltip,
                        tooltipTitle: m.tooltipHeader,
                        iconTexture: m.iconTexture,
                    };
                });
            }

            //copy the current configs, change what we want to change.
            grid.updateGrid({
                ...grid.config,
                gridConfig: {
                    ...grid.config.gridConfig,
                    rows: 3,
                    columns: 5,
                },
                titleText: numChoices === 1 ? "Select a Choice: 0/1" : `Select ${numChoices} Choices : 0/${numChoices}`,
                maxChoices: numChoices,
                itemData: newData,
                onItemConfirmed: (itemIndex, player) => {
                    if (!grid.config?.itemData) {
                        print("no data found for bonus selection when choice was confirmed");
                        return;
                    }

                    const data = grid.config.itemData[itemIndex];

                    if (data.gameModifier) {
                        applyModifier(data.gameModifier);
                    }

                    PlayersPanel.updatePlayerBonuses(player.id, data.iconTexture || "", data.tooltipTitle || "", data.tooltip || "");

                    const itemChose = grid.playerItemIndexesChosen.get(player.id);
                    if (itemChose) {
                        grid.titleContaineFrame?.setText(numChoices === 1 ? `Select a Choice: ${itemChose.length}/1` : `Select ${numChoices} Choices : ${itemChose.length}/${numChoices}`);
                    }
                },
            });

            //Show the new grid afterwards
            const localP = GetPlayerId(GetLocalPlayer());
            //only open for the player who owns that frame
            grid.containerFrame?.setVisible(localP === playerNumber);

            grid.startTimer();
        }
    }
}

/**
 * Menu data should include the data to render the buttons, however, we also need to update the player state with the bonuses they have.
 */
interface BonusSelectionData extends GridSelectionMenuData {
    gameModifier?: GameModifier;
}

export function createPlayerBonusMenus() {
    Players.forEach((p) => {
        //I wonder if ehaving my npm package utils and local utils will create an issue?
        if (isPlayingUser(p)) {
            const component = new BonusSelectionMenu(p.id, FrameUtils.OriginFrameGameUI, "playerBonusSelectionMenu" + p.id);
            const pFrames = PlayerFrames.get(p.id);

            if (pFrames) {
                pFrames.bonusSelection = component;
            }
        }
    });
}
