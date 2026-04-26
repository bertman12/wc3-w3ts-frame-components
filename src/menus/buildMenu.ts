import { compiledEconomicData } from "src/compile-functions";
import { applicableBuildMenuUnits, buildingProductionData, itemShopBuildMenuData } from "src/customObjectData/data";
import { BuildingUnitData, emptyBuildingUnitData, EntityType } from "src/customObjectData/types";
import { PlayerState, playerStates } from "src/player/playerState";
import { ResourceRequirements, ResourceType, ResourceTypeName } from "src/resources/data";
import { getStructureBuildCost } from "src/structures/utils";
import { upgradeData } from "src/upgrades/data";
import { Frame, Item, Timer } from "w3ts";
import { Players } from "w3ts/globals";
import { createFloatingTextTagOnUnit, distanceBetweenPoints, isPlayingUser, tColor } from "warcraft-3-w3ts-utils";
import { Button } from "../components/button";
import { Tooltip } from "../components/Tooltip";
import { PlayerFrames } from "../data";
import { Components, IconButton } from "../frame-components";
import { FrameUtils } from "../frame-utils";
import { Grid, GridItemBaseDefinition } from "../grid/grid";

interface ItemFrames extends GridItemBaseDefinition {
    button?: Button;
    // button?: IconButton;
    tooltip?: Tooltip;
}

/**
 * We don't actually need a backdrop for the build menu, we can just overlay our buttons on top of the  existing frame.
 * We want to keep the cancel button position unblocked.
 * And if it's a building which can attack, then we'd want to leave the attack/stop button uncovered as well.
 *
 */
export class BuildMenu {
    context: number;
    name: string;
    owner: Frame;

    containerFrame?: Frame;
    titleText?: Frame;
    iconBtn?: IconButton;

    private commandCardGrid?: Grid<BuildingUnitData | undefined, ItemFrames>;
    private gridData?: (BuildingUnitData | undefined)[] = [];
    /**
     * This should look similar to the text frame that pops up when you don't have enough gold or wood to train a unit.
     * Or you are at the unit cap.
     */
    public playerWarningTextFrame?: Frame;

    private hideCommandButtonsTimer?: Timer;

    constructor(context: number, name: string, owner: Frame) {
        this.context = context;
        this.name = name;
        this.owner = owner;
        this.render();
    }

    private render() {
        this.containerFrame = Components.EmptyFrame(this.context, this.name + "frame-container", this.owner);

        if (!this.containerFrame) {
            return;
        }

        /**
         * Initially no data
         */
        this.commandCardGrid = new Grid<BuildingUnitData | undefined, ItemFrames>({
            gapX: 0.0042,
            gapY: 0.004,
            containerOwner: this.containerFrame,
            containerName: this.name + "custom-build-command-card" + this.context,
            columns: 4,
            rows: 3,
            data: [],
            context: this.context,
            renderItem: (parent, row, column, index, data) => {
                const btnFrames = new Button(this.context, this.name + "commandCardBtn" + index, parent, {
                    clickSoundPath: "Sound\\Interface\\MouseClick1.flac",
                    onClick: () => {
                        this.handleButtonClick(index);
                    },
                });

                //This is the normal width and height for the command buttons
                btnFrames.buttonFrame?.setSize(0.039, 0.039);

                //Do this so that when the tooltip is created, the backdrop frame wraps both the header and the body
                const tooltip = new Tooltip("empty", "empty", this.name + "tooltip" + index, this.context, btnFrames.buttonFrame, { reverseOrientation: true, resources: [{ type: ResourceType.Placeholder, value: 0 }] });

                return { container: btnFrames.buttonFrame, button: btnFrames, tooltip };
            },
            updateItem: (data, itemFrames, index) => {
                if (!data) {
                    return;
                }

                /**
                 * @Todo dont refresh build menu when unit finished upgrading or dies or finishes constructing unless that unit is the GetMainSelectedUnit. this is to avoid the menu from refreshing and hiding the tooltip while you hover a button
                 */

                //Hide empty data slots.
                if (data.entityTypeId === emptyBuildingUnitData.entityTypeId) {
                    itemFrames?.container?.setVisible(false);
                    return;
                }

                const state = playerStates.get(this.context);
                const missingRequirements = state?.hasTechRequirementsSatisfied(data);
                /**
                 * This will be for accessing the appropriate tooltip for upgrades or abilities with different levels
                 */
                let tooltipLevel = 0;

                /**
                 * Custom one is used for items.
                 */
                let extendedTooltip = BlzGetAbilityExtendedTooltip(data.entityTypeId, tooltipLevel) || "";

                if (data.entityType === EntityType.Research) {
                    const p = Players[this.context].handle;
                    const techCount = GetPlayerTechCount(p, data.entityTypeId, true);

                    /**
                     * @desyncs
                     */
                    // const max = GetPlayerTechMaxAllowed(p, data.entityTypeId);
                    const max = upgradeData.find((u) => u.upgradeId === data.entityTypeId)?.maxLevels || 1;

                    tooltipLevel = techCount;

                    /**
                     * @todo Keep track of player technology researched.
                     * Manually store the max tech value for all tech, or only tech which i know has more than 1 level (easier)
                     *
                     * Then get that value and check if it's equal to the max tech level before hiding it.
                     *
                     * @or
                     *
                     * we just save the values at compile time and export it?
                     *
                     *
                     *
                     */

                    //Hide max researched technology.
                    if (techCount === max) {
                        itemFrames?.button?.buttonFrame?.setVisible(false);
                    }

                    // if (techCount > 0) {
                    //     itemFrames?.button?.containerFrame?.setVisible(false);
                    // }
                    // } else if (data.entityType === EntityType.Item) {
                } else if (data.entityType === EntityType.Item && data.customTooltipExtended !== undefined && data.customTooltipExtended !== "") {
                    extendedTooltip = data.customTooltipExtended + (extendedTooltip !== "" ? "\n\n" + extendedTooltip : "");
                }

                const resourceCosts: ResourceRequirements[] = [];

                if (data.resources && data.resources?.length > 0) {
                    resourceCosts.push(...data.resources);
                } else {
                    let gold = GetUnitGoldCost(data.entityTypeId);
                    let wood = GetUnitWoodCost(data.entityTypeId);
                    const buildingData = compiledEconomicData.buildingEconomicData.find((d) => d[0] === data.entityTypeId);

                    if (buildingData && buildingData[1].upgradedFrom !== undefined) {
                        gold -= GetUnitGoldCost(buildingData[1].upgradedFrom as number);
                        wood -= GetUnitWoodCost(buildingData[1].upgradedFrom as number);
                    }

                    resourceCosts.push({
                        type: ResourceType.Gold,
                        value: gold,
                    });
                    resourceCosts.push({
                        type: ResourceType.Wood,
                        value: wood,
                    });
                }

                if (missingRequirements?.length === 0) {
                    //Enabled Icon
                    itemFrames?.button?.updateTexture(BlzGetAbilityIcon(data.entityTypeId) || "");
                    itemFrames?.tooltip?.update(BlzGetAbilityTooltip(data.entityTypeId, tooltipLevel) || "", extendedTooltip, resourceCosts);
                } else {
                    //Disable Icon
                    const iconTexture = BlzGetAbilityIcon(data.entityTypeId) || "";
                    const iconEndPath = iconTexture.split("\\").pop();

                    let pathPrefix = `ReplaceableTextures\\CommandButtonsDisabled`;
                    if (data.usesWar3ImportedIconPath) {
                        pathPrefix = `war3mapImported`;
                    }

                    // itemFrames?.button?.updateTexture(`ReplaceableTextures\\CommandButtonsDisabled\\DIS${iconEndPath}`);
                    itemFrames?.button?.updateTexture(`${pathPrefix}\\DIS${iconEndPath}`);
                    //   "ReplaceableTextures\\CommandButtonsDisabled\\DISBTNCastleFarm.blp"

                    //We minus one since the requirement on the building unit data starts at 1 while level one data is accessed starting from 0 so we rectify the offset.
                    tooltipLevel = (data.techRequirements?.find((r) => missingRequirements?.find((mr) => mr.id === r.id))?.level || 1) - 1 || tooltipLevel;
                    const requirements = `\n\n${tColor("Requires:", "yellow")} ` + tColor(missingRequirements?.map((r) => `\n- ${BlzGetAbilityTooltip(r.id, tooltipLevel)}`).join("") || "", "yellow");
                    itemFrames?.tooltip?.update((GetObjectName(data.entityTypeId) || "") + requirements, extendedTooltip, resourceCosts);
                }

                return;
            },
        });

        this.containerFrame.clearPoints();
        this.containerFrame.setSize(this.commandCardGrid.containerFrame?.width || 0, this.commandCardGrid.containerFrame?.height || 0);
        this.containerFrame.setAbsPoint(FRAMEPOINT_TOPLEFT, 0.6132, 0.136);
    }

    /**
     * this will re-enable all buttons on the grid.
     * Should be called instead of setting the container frame to be not visible.
     *
     * Hide build menu, then show the command buttons again
     */
    public hide(isLocal: boolean) {
        if (isLocal) {
            this.containerFrame?.setVisible(false);
        }

        this.hideCommandButtonsTimer?.pause();
        this.hideCommandButtonsTimer?.destroy();

        for (let x = 0; x < 12; x++) {
            const btn = Frame.fromHandle(BlzGetFrameByName(`CommandButton_${x}`, 0));
            if (isLocal) {
                btn?.setVisible(true);
            }
        }
    }

    /**
     * Show the build menu
     * then hide the command buttons
     */
    public show(isLocal: boolean) {
        if (isLocal) {
            this.containerFrame?.setVisible(true);
        }

        this.hideCommandButtonsTimer?.pause();
        this.hideCommandButtonsTimer?.destroy();
        this.hideCommandButtonsTimer = Timer.create();
        this.hideCommandButtonsTimer.start(0.1, true, () => {
            /**
             * Really, should only hide buttons we occupy
             */
            for (let x = 0; x < 12; x++) {
                //rally flag button
                // if (x !== CommandButtonIndex.Rally && x !== CommandButtonIndex.Cancel) {
                if (x !== CommandButtonIndex.Cancel) {
                    const btn = Frame.fromHandle(BlzGetFrameByName(`CommandButton_${x}`, 0));

                    if (isLocal) {
                        btn?.setVisible(false);
                    }
                }
            }
        });
    }

    /**
     * Based on the clicked index, we'll look at the grid data we have and go from there.
     *
     */
    private handleButtonClick(index: number) {
        //there may be less grid data than what we retrive. therefore we must fill the array so the data matches the index of the rendered button we are clicking.
        if (!this.gridData) {
            return;
        }

        const data = this.gridData[index];
        const state = playerStates.get(this.context);
        if (!state) {
            return;
        }

        const missingResources: Set<ResourceType> = new Set();

        /**
         * Check tech requirements
         */
        if (data && state.hasTechRequirementsSatisfied(data).length > 0) {
            return;
        }

        /**
         * @bug the barracks queue doesn't match sometimes. maybe due to not bneing able to build when mujltiple are selected and you try to train units.?
         */
        if (data?.entityType === EntityType.Unit) {
            state.selectedUnits?.forEach((u) => {
                const thisBuildingQueueData = state.buildingQueues.get(u);
                const buildingHasNoQueue = thisBuildingQueueData === 0;

                /**
                 * The building is already at max capacity therefore we cannot order it to train or do anything so exit early
                 */
                if (thisBuildingQueueData === 7) {
                    return;
                }

                /**
                 * Check if the player is at max training capacity
                 */
                if (state.atMaxArmyLimit()) {
                    missingResources.add(ResourceType.PopulationLimit);
                    return;
                }

                //for local tracking
                const localMissingResources: Set<ResourceType> = new Set();

                /**
                 * Check if we have the resources to order this building to train something
                 */
                data?.resources?.forEach((r) => {
                    /**
                     * @todo
                     */
                    //ignore army limit, let the game handle that for us. nevermind, we actually need to check this one. lol this one is more complicated since it doesn't consume your army limit until it starts training.
                    //and you want to allow them to train even if they dont it'll go over the food limit later.....
                    //therefore, if the buildings that we have selected have a queue size that is 0, we need to check, otherwise we skip checking the army limit
                    //still consume resources though
                    if (r.type && !state.hasResource(r.value, r.type)) {
                        if (!buildingHasNoQueue && r.type === ResourceType.PopulationLimit) {
                            return;
                        }

                        localMissingResources.add(r.type || ResourceType.Placeholder);
                        missingResources.add(r.type || ResourceType.Placeholder);
                    }
                });

                /**
                 * Cant build anything
                 */
                if (localMissingResources.size > 0) {
                    return;
                }

                /**
                 * Okay to build
                 */
                if (u.typeId === data.buildingTypeId) {
                    const success = IssueTrainOrderByIdBJ(u.handle, data.entityTypeId);
                    //Frost Wyrm building stun.
                    if (!success) {
                        return;
                    }
                    //increase queue count
                    state.buildingQueues.set(u, (thisBuildingQueueData || 0) + 1);

                    createFloatingTextTagOnUnit(u, `${(thisBuildingQueueData || 0) + 1}`);

                    data.resources?.forEach((r) => {
                        //don't adjust army limit since its referring to the cap and not what is currently used. We are also relying on the unit already costing 1 food in the object editor so the work is already handled.
                        if (r.type && r.type !== ResourceType.PopulationLimit) {
                            state.adjustResource(r.type, -r.value);
                        }
                    });
                }
            });
        } //

        /**
         * @todo
         * For tech/units we cant research due to not having a requirement, we could make the same display in red, then add a tag on the bottom that says REquires: ...
         *
         * Also we can store teh current building we are viewing in the build menu on the player state.
         * Then, whenever someone researches a team upgrade, we can re-update each player's build menu with the same unit data, that way any tooltips/icons can be upgraded
         */
        else if (data?.entityType === EntityType.Research) {
            const player = Players[this.context].handle;
            //building queue doesn't matter since it will be instant
            const r = this.checkResources(data, state, true);

            /**
             * For each structure selected check that the player does not already have the research unlocked before charign them.
             * Otherwise skip. This should only be purchased once anyways, regardless of number of units selected. Perhaps in this case, we don't event need to loop the selected units
             *
             * Nevermind, we aren't lol.
             * Still, check that it's not already researched for validation.
             */
            // const techResearched = GetPlayerTechResearched(player, data.entityTypeId, true);
            if (r.size === 0) {
                const techCount = GetPlayerTechCount(player, data.entityTypeId, true);

                //Works
                SetPlayerTechResearched(player, data.entityTypeId, techCount + 1);
                //Reload menu.
                this.loadUnitType(data.buildingTypeId);

                data.resources?.forEach((r) => {
                    state.adjustResource(r.type || ResourceType.Placeholder, -r.value);
                });
            } else {
                this.displayInsufficientResourcesText(r);
            }
        } else if (data?.entityType === EntityType.Upgrade) {
            // const player = Players[this.context].handle;
            //building queue doesn't matter since it will be instant
            state.selectedUnits?.forEach((u) => {
                const r = this.checkResources(data, state, true);

                if (r.size === 0) {
                    // print("Upgraded!");
                    //Reload menu.
                    // this.loadUnitType(data.buildingTypeId);

                    //
                    IssueUpgradeOrderByIdBJ(u.handle, data.entityTypeId);

                    data.resources?.forEach((r) => {
                        state.adjustResource(r.type || ResourceType.Placeholder, -r.value);
                    });
                } else {
                    r.forEach((r) => {
                        missingResources.add(r);
                    });
                }
            });

            // else {
            //     this.displayInsufficientResourcesText(r);
            // }
        } else if (data?.entityType === EntityType.Item) {
            const r = this.checkResources(data, state, true);

            let isHeroCloseEnough = false;
            let heroHasItemSpace = false;
            if (state.playerHero && state.mainSelectedUnit) {
                const dist = distanceBetweenPoints(state.playerHero?.x, state.playerHero?.y, state.mainSelectedUnit?.x, state.mainSelectedUnit?.y);
                // print("distance: ", dist);
                if (dist < 450) {
                    isHeroCloseEnough = true;
                }

                for (let x = 0; x < 6; x++) {
                    const item = state.playerHero.getItemInSlot(x);
                    if (item === undefined) {
                        heroHasItemSpace = true;
                    }
                }
            }

            const frames = PlayerFrames.get(this.context);
            if (frames) {
                if (!isHeroCloseEnough) {
                    frames.alertText?.displayText("Hero too far away.");
                } else if (!heroHasItemSpace) {
                    frames.alertText?.displayText("Not enough inventory space.");
                }
            }

            if (r.size === 0 && isHeroCloseEnough && heroHasItemSpace) {
                data.resources?.forEach((resource) => {
                    state.adjustResource(resource.type || ResourceType.Placeholder, -resource.value);
                });
                const item = Item.create(data.entityTypeId, 0, 0);
                if (item) {
                    const shopData = itemShopBuildMenuData.get(state.mainSelectedUnit?.typeId || 0);
                    if (shopData) {
                        const itemData = shopData.find((d) => d.entityTypeId === item.typeId);
                        BlzSetItemExtendedTooltip(item.handle, itemData?.customTooltipExtended || "Missing Tooltip.");
                    }
                    state.playerHero?.addItem(item);
                }
            } else {
                r.forEach((r) => {
                    missingResources.add(r);
                });
            }
        }

        if (missingResources.size > 0) {
            this.displayInsufficientResourcesText(missingResources);
        }
    }

    private checkResources(data: BuildingUnitData, state: PlayerState, buildingHasNoQueue: boolean) {
        const localMissingResources: Set<ResourceType> = new Set();

        const resourceCosts: ResourceRequirements[] = [];
        if (data.resources && data.resources?.length > 0) {
            resourceCosts.push(...data.resources);
        } else {
            const buildingData = compiledEconomicData.buildingEconomicData.find((d) => d[0] === data.entityTypeId);
            const costs = getStructureBuildCost(data.entityTypeId, buildingData?.[1].upgradedFrom || 0);

            resourceCosts.push(...costs);
        }

        /**
         * Check if we have the resources to order this building to train something
         */
        resourceCosts?.forEach((r) => {
            /**
             * @todo
             */
            //ignore army limit, let the game handle that for us. nevermind, we actually need to check this one. lol this one is more complicated since it doesn't consume your army limit until it starts training.
            //and you want to allow them to train even if they dont it'll go over the food limit later.....
            //therefore, if the buildings that we have selected have a queue size that is 0, we need to check, otherwise we skip checking the army limit
            //still consume resources though
            if (r.type && !state.hasResource(r.value, r.type)) {
                if (!buildingHasNoQueue && r.type === ResourceType.PopulationLimit) {
                    return;
                }

                localMissingResources.add(r.type || ResourceType.Placeholder);
            }
        });

        return localMissingResources;
    }

    public displayInsufficientResourcesText(resources: Set<ResourceType>) {
        const msg =
            "|cffff0000Missing resources|r! " +
            Array.from(resources.values())
                .map((r) => ResourceTypeName.get(r) || "")
                // .map((r) => tColor(ResourceTypeName.get(r) || "", undefined, ResourceTypeHexColor.get(r)))
                .join(", ");

        const frames = PlayerFrames.get(this.context);

        if (frames) {
            frames.alertText?.displayText(msg);
        }
    }

    /**
     * This will update the UI to show the build options for the specific unit type.
     * The data will be retrieved from a preset collection of building types mapped to their associated units they can build.
     *
     * @param unitTypeId
     */
    public loadUnitType(unitTypeId: number, isLocal?: boolean) {
        if (!applicableBuildMenuUnits.includes(unitTypeId)) {
            if (isLocal !== undefined) {
                this.hide(isLocal);
            }

            return;
        }

        if (isLocal !== undefined) {
            this.show(isLocal);
        }

        let data = buildingProductionData.get(unitTypeId);

        if (!data) {
            data = itemShopBuildMenuData.get(unitTypeId);
        }

        if (data) {
            this.commandCardGrid?.updateGrid(data);
            this.gridData = data;
        }
    }

    /**
     * Will get the main selected unit of the player and reload the build menu appropriately.
     * Should be called on construction complete or building upgrade complete.
     *
     * Hides the build menu before showing it again if the load was successful
     */
    public refreshBuildMenu(isLocal?: boolean) {
        const state = playerStates.get(this.context);
        // this.hide(isLocal || false);

        if (!state?.mainSelectedUnit) {
            this.hide(isLocal || false);
            return;
        }

        this.loadUnitType(state.mainSelectedUnit?.typeId, isLocal);
    }
}

export function initPlayerBuildMenus() {
    Players.forEach((p) => {
        if (isPlayingUser(p)) {
            //Setting point makes it uninteractable, so we'll avoid that
            const buildMenu = new BuildMenu(p.id, "buildMenu" + p.id, FrameUtils.OriginFrameGameUI);
            buildMenu.containerFrame?.setVisible(false);

            const frames = PlayerFrames.get(p.id);
            if (frames) {
                frames.buildMenu = buildMenu;
            }
        }
    });
}

enum CommandButtonIndex {
    Rally = 7,
    Cancel = 11,
}
