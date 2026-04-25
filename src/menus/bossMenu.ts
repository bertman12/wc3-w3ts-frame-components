import { BossAbilityData, BossData, bossData } from "src/bosses/data";
import { EnemyTypeClassification, enemySpawnConfigurations } from "src/enemies/configurations";
import { enemySpawnSet } from "src/enemies/utils";
import { RoundManager } from "src/shared/round-manager";
import { WTS_Units } from "src/WTS Generated Enums/WTS_Enums";
import { Frame, Trigger } from "w3ts";
import { Players } from "w3ts/globals";
import { isPlayingUser, tColor } from "warcraft-3-w3ts-utils";
import { Tooltip } from "../components/Tooltip";
import { PlayerFrames } from "../data";
import { Components, IconButton } from "../frame-components";
import { FrameUtils } from "../frame-utils";
import { Grid, GridItemBaseDefinition } from "../grid/grid";
import { Panel } from "../panels/panel";
import { Text } from "../text/text";
import { enemySpawnConfigurationTypeName } from "src/enemies/data";
import { unitTypeCalculatedValue, enemyUnitData } from "src/value/data";

/**
 * Icon button frame definition
 */
interface ItemFrameDefinition extends GridItemBaseDefinition {
    buttonFrames?: ReturnType<typeof Components.IconButton>;
    tooltipFrame?: Tooltip;
}

interface UnitGridData {
    enemyType: EnemyTypeClassification;
    unitTypeId: number;
}

/**
 * @todo Subscribe to the round end functions and check if you are viewing a page which is now unlocked. If so then call load page again for the current page so it shows the data.
 *
 *
 * @bug There is a small leak, about 5 handles, eveny time a page is loaded. Possibly just the button triggers?
 * Same leak with players menu.
 *
 */
export class BossMenu {
    context: number;
    owner: Frame;
    name: string;
    containerFrame?: Frame;

    private currentPage: number = 1;
    private currentNightText?: Frame;
    private nextPgBtn?: Frame;
    private prevPgBtn?: Frame;
    /**
     * The page data is considered unlocked if the viewed page is the ahead 2 nights of the current night or it's any night before the current night
     */
    private pageDataIsUnlocked: boolean = true;

    /**
     * Hero Frames
     */
    private bossIcon?: ReturnType<typeof Components.IconButton>;
    private bossName?: Frame;
    private bossAbilityGrid?: Grid<BossAbilityData, ItemFrameDefinition>;
    private buttonsRendered: Map<number, IconButton> = new Map();
    private abilitiesTextFrame?: Frame;

    /**
     * Primary Enemies
     */
    private primaryEnemiesTitle?: Frame;
    private primaryEnemiesGrid?: Grid<UnitGridData, ItemFrameDefinition>;
    private secondaryEnemiesTitle?: Frame;
    private secondaryEnemiesGrid?: Grid<UnitGridData, ItemFrameDefinition>;
    private eliteEnemiesTitle?: Frame;

    /**
     * Only buttons for now
     */
    private savedTriggers: Trigger[] = [];

    constructor(context: number, name: string, owner: Frame) {
        this.context = context;
        this.name = name;
        this.owner = owner;
        this.render();
    }

    private render() {
        const container = Panel.Render(this.context, this.name + "containerFrame" + this.context, this.owner);
        this.containerFrame = container;

        if (!container) {
            return;
        }

        container.clearPoints();
        container.setSize(0.2, 0.425);
        container.setAbsPoint(FRAMEPOINT_TOPLEFT, 0, 0.579);

        const title = Text.Render(this.context, this.name + "bossMenuTitle", container);
        title?.clearPoints();
        title?.setSize(0.035, 0.005);
        title?.setPoint(FRAMEPOINT_TOP, container, FRAMEPOINT_TOP, 0, -0.005);
        title?.setText(tColor("Bosses", "goldenrod"));
        title?.setScale(2.5);

        if (!title) {
            return;
        }

        const currentNightText = Text.Render(this.context, this.name + "bossMenuDay", container);
        currentNightText?.clearPoints();
        currentNightText?.setSize(0.035, 0.005);
        currentNightText?.setPoint(FRAMEPOINT_TOP, title, FRAMEPOINT_BOTTOM, -0.005, -0.015);
        currentNightText?.setText(tColor("Night 1"));
        this.currentNightText = currentNightText;

        const nextPg = Components.GlueTextButton(this.context, this.name + "glueBtnNextPage", container, this.goToNextPage.bind(this));
        nextPg?.setText("Next");
        nextPg?.clearPoints();
        nextPg?.setSize(0.04, 0.04);
        nextPg?.setPoint(FRAMEPOINT_TOPRIGHT, container, FRAMEPOINT_TOPRIGHT, -0.01, -0.01);
        nextPg?.setScale(0.8);
        this.nextPgBtn = nextPg;
        this.nextPgBtn?.setVisible(this.canViewNext());

        const prevPg = Components.GlueTextButton(this.context, this.name + "glueBtnNextPage", container, this.goToPrevPage.bind(this));
        prevPg?.clearPoints();
        prevPg?.setSize(0.04, 0.04);
        prevPg?.setPoint(FRAMEPOINT_TOPLEFT, container, FRAMEPOINT_TOPLEFT, 0.01, -0.01);
        prevPg?.setText("Prev");
        prevPg?.setScale(0.8);
        this.prevPgBtn = prevPg;
        this.prevPgBtn?.setVisible(this.canViewPrev());

        /**
         * Now we create the page
         */
        const bossAtPage = bossOrder[this.currentPage - 1];
        const boss = bossData.get(bossAtPage); // - 1 since it's a 0 indexed and the page is not
        if (!boss) {
            print("boss not found at page " + this.currentPage);
            return;
        }

        const bossIcon = Components.IconButton(this.context, this.name + "bossIcon", boss.iconTexturePath, container);

        if (!bossIcon || !bossIcon.button) {
            return;
        }

        bossIcon.button?.clearPoints();
        bossIcon.button?.setPoint(FRAMEPOINT_TOPLEFT, container, FRAMEPOINT_TOPLEFT, 0.01, -0.08);
        this.bossIcon = bossIcon;

        const bossName = Text.Render(this.context, this.name + "bossNameText", container);
        bossName?.clearPoints();
        bossName?.setText(boss.name);
        bossName?.setScale(1.5);
        bossName?.setPoint(FRAMEPOINT_LEFT, bossIcon.button, FRAMEPOINT_RIGHT, 0.005, 0);
        this.bossName = bossName;

        /**
         * No need to save, it won't change
         */
        const abilitiesTextFrame = Text.Render(this.context, this.name + "abilitiesTextFrame", container);
        abilitiesTextFrame?.clearPoints();
        abilitiesTextFrame?.setPoint(FRAMEPOINT_TOPLEFT, bossIcon.button, FRAMEPOINT_BOTTOMLEFT, 0, -0.01);
        abilitiesTextFrame?.setText(tColor("Abilities", "goldenrod"));
        this.abilitiesTextFrame = abilitiesTextFrame;

        if (!abilitiesTextFrame) {
            return;
        }

        const bossGrid = new Grid<BossAbilityData, ItemFrameDefinition>({
            columns: 5,
            rows: Math.ceil(boss.abilities.length / 5),
            containerName: this.name + "bossAbilityGrid",
            containerOwner: container,
            context: this.context,
            gapX: 0.005,
            gapY: 0.005,
            data: boss.abilities,
            renderItem: (parent, row, column, index) => {
                const data = boss.abilities[index];

                if (!data) {
                    return { container: undefined };
                }

                const buttonOption = Components.IconButton(this.context, this.name + "button" + index, data?.iconTexture || "", parent);
                const tooltip = new Tooltip(data.name ?? "", data.tooltip || "", this.name + "abilityTooltip" + index, this.context, buttonOption.button, { includeBackground: true });

                if (buttonOption.trigger) {
                    this.savedTriggers.push(buttonOption.trigger);
                }

                buttonOption.button?.setSize(buttonOption.button.width * 0.75, buttonOption.button.height * 0.75);

                return { container: buttonOption.button, buttonFrames: buttonOption, tooltipFrame: tooltip };
            },
            updateItem: (data, itemFrames, index) => {
                if (!itemFrames || !data) {
                    return;
                }

                itemFrames.buttonFrames?.buttonIconFrame?.setTexture(data.iconTexture || "", 0, false);
                itemFrames.tooltipFrame?.update(data.name, data.tooltip || "None");
            },
        });

        bossGrid.containerFrame?.clearPoints();
        bossGrid.containerFrame?.setPoint(FRAMEPOINT_TOPLEFT, abilitiesTextFrame, FRAMEPOINT_BOTTOMLEFT, 0, -0.01);

        this.bossAbilityGrid = bossGrid;

        if (!bossGrid.containerFrame) {
            return;
        }

        this.loadPrimaryEnemiesSection();
        this.loadSecondaryEnemiesSection();
    }

    /**
     * Operates under the assumption that the boss grid already exists
     *
     * @todo When you click on the button icon for a unit, add a unit itype inspector frame to see extra info, like all of their abilities in a grid and their stats.
     */
    private loadPrimaryEnemiesSection() {
        if (!this.bossAbilityGrid?.containerFrame || !this.containerFrame) {
            return;
        }

        let primaryEnemiesTitle = this.primaryEnemiesTitle;

        if (!primaryEnemiesTitle) {
            primaryEnemiesTitle = Text.Render(this.context, this.name + "primaryEnemiesTitle", this.containerFrame);
        }

        primaryEnemiesTitle?.clearPoints();
        primaryEnemiesTitle?.setText(tColor("Main Forces", "goldenrod"));
        primaryEnemiesTitle?.setPoint(FRAMEPOINT_TOPLEFT, this.bossAbilityGrid.containerFrame, FRAMEPOINT_BOTTOMLEFT, 0, 0);
        primaryEnemiesTitle?.setScale(1);
        this.primaryEnemiesTitle = primaryEnemiesTitle;

        if (!primaryEnemiesTitle) {
            return;
        }

        const spawnData = enemySpawnSet.get(this.currentPage);
        if (!spawnData) {
            return;
        }

        const config = enemySpawnConfigurations.find((c) => c.enemyType === spawnData.primaryEnemyType);
        if (!config) {
            return;
        }

        const enemies = [config.melee.primary, config.ranged.primary, config.siege.primary];
        const enemyTypeMap = enemies.map((e) => {
            return { unitTypeId: e, enemyType: spawnData.primaryEnemyType };
        });

        if (this.primaryEnemiesGrid) {
            this.primaryEnemiesGrid.updateGrid(enemyTypeMap);
        } else {
            const grid = new Grid<UnitGridData, ItemFrameDefinition>({
                columns: 6,
                rows: 1,
                containerName: this.name + "primaryEnemiesGrid",
                containerOwner: this.containerFrame,
                context: this.context,
                gapX: 0.005,
                gapY: 0.005,
                data: enemyTypeMap,
                renderItem: (parent, row, column, index, data) => {
                    const iconTex = data ? BlzGetAbilityIcon(data.unitTypeId) || "" : "";
                    const buttonOption = Components.IconButton(this.context, this.name + "button" + index, iconTex, parent);
                    const ttHeader = data ? GetObjectName(data.unitTypeId) ?? "" : "";
                    const extendedTooltip = data ? this.formatEnemyUnitExtendedTooltip(data.unitTypeId, spawnData.primaryEnemyType) : "";
                    const tooltip = new Tooltip(ttHeader, extendedTooltip, this.name + "unitTooltip" + index, this.context, buttonOption.button);
                    buttonOption.button?.setSize(buttonOption.button.width * 0.75, buttonOption.button.height * 0.75);

                    return { container: buttonOption.button, buttonFrames: buttonOption, tooltipFrame: tooltip };
                },
                updateItem: (data, itemFrames) => {
                    if (!itemFrames || !data) {
                        return;
                    }

                    itemFrames.buttonFrames?.buttonIconFrame?.setTexture(BlzGetAbilityIcon(data.unitTypeId) || "", 0, true);
                    itemFrames.tooltipFrame?.update(GetObjectName(data.unitTypeId) || "", this.formatEnemyUnitExtendedTooltip(data.unitTypeId, data.enemyType));
                },
            });

            grid.containerFrame?.clearPoints();
            grid.containerFrame?.setPoint(FRAMEPOINT_TOPLEFT, primaryEnemiesTitle, FRAMEPOINT_BOTTOMLEFT, 0, -0.01);

            this.primaryEnemiesGrid = grid;
        }
    }

    /**
     * Operates under the assumption that the boss grid already exists
     */
    private loadSecondaryEnemiesSection() {
        if (!this.primaryEnemiesGrid?.containerFrame || !this.containerFrame) {
            return;
        }

        let secondaryEnemiesTitle = this.secondaryEnemiesTitle;

        if (!secondaryEnemiesTitle) {
            secondaryEnemiesTitle = Text.Render(this.context, this.name + "secondaryEnemiesTitle", this.containerFrame);
        }

        secondaryEnemiesTitle?.clearPoints();
        secondaryEnemiesTitle?.setText(tColor("Supporting Forces", "goldenrod"));
        secondaryEnemiesTitle?.setPoint(FRAMEPOINT_TOPLEFT, this.primaryEnemiesGrid.containerFrame, FRAMEPOINT_BOTTOMLEFT, 0, 0);
        secondaryEnemiesTitle?.setScale(1);
        this.secondaryEnemiesTitle = secondaryEnemiesTitle;

        if (!secondaryEnemiesTitle) {
            return;
        }

        const spawnData = enemySpawnSet.get(this.currentPage);
        if (!spawnData) {
            return;
        }

        const enemies = [spawnData.auxilary.meleeUnitId, spawnData.auxilary.rangedUnitId];
        const enemyTypeMap = enemies.map((e) => {
            return { unitTypeId: e, enemyType: spawnData.auxilary.enemyType };
        });

        if (spawnData.auxilary.siegeUnitId !== 0) {
            enemies.push(spawnData.auxilary.siegeUnitId);
        }

        if (this.secondaryEnemiesGrid) {
            this.secondaryEnemiesGrid.updateGrid(enemyTypeMap);
        } else {
            const grid = new Grid<UnitGridData, ItemFrameDefinition>({
                columns: 6,
                rows: 1,
                containerName: this.name + "secondaryEnemiesGrid",
                containerOwner: this.containerFrame,
                context: this.context,
                gapX: 0.005,
                gapY: 0.005,
                data: enemyTypeMap,
                renderItem: (parent, row, column, index, data) => {
                    const iconTex = data ? BlzGetAbilityIcon(data.unitTypeId) || "" : "";
                    const buttonOption = Components.IconButton(this.context, this.name + "button" + index, iconTex, parent);
                    const ttHeader = data ? GetObjectName(data.unitTypeId) ?? "" : "";
                    const extendedTooltip = data ? this.formatEnemyUnitExtendedTooltip(data.unitTypeId, spawnData.auxilary.enemyType) : "";
                    const tooltip = new Tooltip(ttHeader, extendedTooltip, this.name + "unitTooltip" + index, this.context, buttonOption.button);
                    buttonOption.button?.setSize(buttonOption.button.width * 0.75, buttonOption.button.height * 0.75);

                    return { container: buttonOption.button, buttonFrames: buttonOption, tooltipFrame: tooltip };
                },
                updateItem: (data, itemFrames) => {
                    if (!itemFrames || !data) {
                        return;
                    }

                    itemFrames.buttonFrames?.buttonIconFrame?.setTexture(BlzGetAbilityIcon(data.unitTypeId) || "", 0, true);
                    itemFrames.tooltipFrame?.update(GetObjectName(data.unitTypeId) || "", this.formatEnemyUnitExtendedTooltip(data.unitTypeId, data.enemyType));
                },
            });

            grid.containerFrame?.clearPoints();
            grid.containerFrame?.setPoint(FRAMEPOINT_TOPLEFT, secondaryEnemiesTitle, FRAMEPOINT_BOTTOMLEFT, 0, -0.01);

            this.secondaryEnemiesGrid = grid;
        }
    }

    private formatEnemyUnitExtendedTooltip(unitTypeId: number, enemyType: EnemyTypeClassification) {
        const typeName = enemySpawnConfigurationTypeName.get(enemyType);
        const value = unitTypeCalculatedValue.get(unitTypeId);
        const unitData = enemyUnitData.get(unitTypeId);

        let prefix = "";
        let suffix = "";

        if (typeName && value && unitData) {
            prefix = `[${tColor(typeName, "player3-teal")}]`;
            prefix += `\n\n${tColor("Health", "green")}: ${unitData.maxHealth}`;
            prefix += `\n${tColor("Health Regeneration", "green")}: ${unitData.healthRegeneration}`;
            prefix += `\n${tColor("Attack Type", "red")}: ${unitData.attackType}`;
            prefix += `\n${tColor("DPS", "red")}: ${unitData.dps}`;
            prefix += `\n${tColor("Armor Type", undefined, "808080")}: ${unitData.armorType}`;
            prefix += `\n${tColor("Armor", undefined, "808080")}: ${unitData.armor}\n\n`;
            suffix += `\n\n${tColor("Value", "goldenrod")}: ${value.toFixed(0)}`;
        }

        return prefix + BlzGetAbilityExtendedTooltip(unitTypeId, 0) + suffix || "";
    }

    private loadPageData() {
        let isPageDataUnlocked = true;
        this.pageDataIsUnlocked = true;

        //Cannot view page data beyond 2 days after the current night
        if (this.currentPage > RoundManager.currentRound + 2) {
            this.pageDataIsUnlocked = false;
            isPageDataUnlocked = false;
        }

        //Now we want to override the data we rendered
        const bossAtPage = bossOrder[this.currentPage - 1];
        const boss = bossData.get(bossAtPage); // - 1 since it's a 0 indexed and the page is not
        if (!boss) {
            print("boss not found at page " + this.currentPage);
            return;
        }

        // print("Boss at page " + this.currentPage + " is " + boss.name);

        //Update the textures
        this.bossIcon?.buttonIconFrame?.setTexture(isPageDataUnlocked ? boss.iconTexturePath : "ReplaceableTextures\\CommandButtons\\BTNSelectHeroOn", 0, true);
        this.bossName?.setText(isPageDataUnlocked ? boss.name : "?????");
        this.currentNightText?.setText(`Night ${this.currentPage}`);

        this.loadBossAbilityGrid(boss);
        this.loadPrimaryEnemiesSection();
        this.loadSecondaryEnemiesSection();
    }

    private loadBossAbilityGrid(boss?: BossData) {
        if (!boss || !this.containerFrame || !this.abilitiesTextFrame) {
            return;
        }

        this.bossAbilityGrid?.updateGrid(boss.abilities);
    }

    private setPageButtonVisibility() {
        this.nextPgBtn?.setVisible(this.canViewNext());
        this.prevPgBtn?.setVisible(this.canViewPrev());
    }

    /**
     * This will destroy the previous frames and just re-render everything?
     * Only certain sections need to be destroyed, aka the grid
     */
    private goToNextPage() {
        this.currentPage++;

        if (this.currentPage >= 10) {
            this.currentPage = 9;
        }

        this.loadPageData();
        this.setPageButtonVisibility();
    }

    private goToPrevPage() {
        this.currentPage--;
        if (this.currentPage <= 0) {
            this.currentPage = 1;
        }

        this.loadPageData();
        this.setPageButtonVisibility();
    }

    private canViewNext() {
        //can only view next when the day viewed is before the current day the players are on
        //We must also not be on the last page
        return this.currentPage < bossOrder.length;
    }

    private canViewPrev() {
        //can only view prev when the currently viewed day is not 0
        return this.currentPage > 1;
    }

    public openAtPage(pageNumber: number) {
        //gets the necessary data
        //hide the prev or next button based on whether the days that have already passed
        //when the game starts, we'll already know what bosses will spawn and in what order,
        //the data will be in a map
    }
}

const bossOrder = [WTS_Units._Boss_Dreadlord, WTS_Units._Boss_Lich, WTS_Units._Boss_Dreadlord, WTS_Units._Boss_Lich, WTS_Units._Boss_Dreadlord, WTS_Units._Boss_Lich, WTS_Units._Boss_Dreadlord, WTS_Units._Boss_Lich, WTS_Units._Boss_Dreadlord];

export function createPlayerBossMenus() {
    Players.forEach((p) => {
        if (isPlayingUser(p)) {
            const pFrame = PlayerFrames.get(p.id);
            const menu = new BossMenu(p.id, "playerBossMenu" + p.id, FrameUtils.OriginFrameGameUI);
            menu.containerFrame?.setVisible(false); //hidden at start
            if (pFrame) {
                pFrame.bossMenu = menu;
            }
        }
    });
}
