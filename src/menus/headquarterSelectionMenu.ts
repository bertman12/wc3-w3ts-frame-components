import { playerStates } from "src/player/playerState";
import { UIConfig } from "src/shared/UIConfig";
import { stateController } from "src/state/state-controller";
import { WTS_Units } from "src/WTS Generated Enums/WTS_Enums";
import { GlobalFrames } from "../data";
import { PlayersPanel } from "../panels/playersPanel";
import { GridSelectionMenu, GridSelectionMenuData } from "../sections/gridSelectionMenu";

/**
 * render both here since they are it's dependent
 *
 * @Todo add player pick order later lol
 */
export function renderHeadquarterSelectionMenu() {
    /**
     * Add texture and tooltip data for buttons at runtime.
     */
    itemData.forEach((item) => {
        item.iconTexture = BlzGetAbilityIcon(item.objectId) || "";
        item.tooltipTitle = item.tooltipTitle;
    });

    const gridMenu = new GridSelectionMenu<HeadquarterSelectionMenuData>("HeadquarterSelectionMenu", 0, {
        onItemConfirmed: (itemIndex, player) => {
            const data = itemData[itemIndex];
            const pState = playerStates.get(player.id);

            if (pState) {
                pState.selectedHeadquartersUnitId = data.objectId;
            }

            PlayersPanel.updatePlayerBonuses(player.id, data.iconTexture || "", data.tooltipTitle || "No header", data.tooltip || "No tooltip");
        },
        onClose: () => {
            playerStates.forEach((p) => {
                if (p.selectedHeadquartersUnitId === 0) {
                    //choose random one
                }
            });

            stateController.next();
        },
        sharedFrame: true,
        itemData: itemData,
        timedLife: UIConfig.HeadquarterSelectionTime,
        gridConfig: {
            rows: 3,
            columns: 5,
        },
        maxChoices: 1,
        titleText: "Select a Headquarters",
    });

    //Start hidden
    gridMenu.containerFrame?.setVisible(false);

    GlobalFrames.HeadquartersSelectionMenu = gridMenu;
}

/**
 * We should use the item's index to access the data we need for rendering icons etc
 */
const itemData: HeadquarterSelectionMenuData[] = [
    {
        objectId: WTS_Units._Headquarters__TownHall,
        tooltipTitle: "Town Hall",
        tooltip: "Grants 10 free militia at the start of every day. \n\n|cffffcc00Upgradeable|r",
    },
    {
        objectId: WTS_Units._Headquarters__AncientOfEternity,
        tooltipTitle: "Ancient of Eternity",
        tooltip: "Grants friendly units 1 bonus health regeneration. \n\n|cffffcc00Upgradeable|r",
    },
    {
        objectId: WTS_Units._Headquarters__GoblinTradeCenter,
        tooltipTitle: "Goblin Trade Center",
        tooltip: "Grants +1000 Gold every day. \n\n|cffff0000Not Upgradeable|r",
    },
    {
        objectId: WTS_Units._Headquarters__ArcaneCitadel,
        tooltipTitle: "Arcane Citadel",
        tooltip: "Grants 0.5 bonus mana regeneration to all units. \n\n|cffffcc00Upgradeable|r",
    },
    {
        objectId: WTS_Units._Headquarters__Assassin_sGuild,
        tooltipTitle: "Assassin's Guild",
        tooltip: "Grants only your non hero units a 10% chance to crit.  \n\n|cffffcc00Upgradeable|r",
    },
    {
        objectId: WTS_Units._Headquarters__Crypt,
        tooltipTitle: "Crypt",
        tooltip: "Every 3 seconds, animates a friendly dead units for 10 seconds. Or you spawn your own zombies at base.\n\n|cffff5500Enemies are empowered by 5%|r  \n\n|cffffcc00Upgradeable|r",
    },
    {
        objectId: WTS_Units._Headquarters__SanctuaryOfTheLight,
        tooltipTitle: "Sanctuary of The Light",
        tooltip: "Allows the training of Paladins. An elite unit which has the ability to resurrect allied units. \n\n|cffffcc00Upgradeable|r",
    },
    {
        objectId: WTS_Units._Headquarters__GreatHall,
        tooltipTitle: "Great Hall",
        tooltip: "Grants your units 10% bonus damage. Also allows training of Elite Shaman which can be upgraded to do chain lightning on attack.  \n\n|cffffcc00Upgradeable|r",
    },
    {
        objectId: WTS_Units._Headquarters__Engineer_sGuild,
        tooltipTitle: "Engineer's Guild",
        tooltip: "Increase the damage of your towers by 15% and grants them +200 attack range. WAlls and towers also have +5 armor. \n\n|cffffcc00Upgradeable|r",
    },
    {
        objectId: WTS_Units._Headquarters__ElementalRune,
        tooltipTitle: "Elemental Rune",
        tooltip: "Enables the training of elemental units. All friendly units gain 5% spell resistance. \n\n|cffffcc00Upgradeable|r",
    },
    {
        objectId: WTS_Units._Headquarters__Hero_sTavern,
        tooltipTitle: "Hero's Tavern",
        tooltip: "Grants your hero +50% experience gain. \n\n|cffff0000Not Upgradeable|r",
    },
    //seers hut - monsoon seers
];

//For this grid, we don't need to save teh texture or tooltip. We can use functions to get that information

export interface HeadquarterSelectionMenuData extends GridSelectionMenuData {
    objectId: number;
}
