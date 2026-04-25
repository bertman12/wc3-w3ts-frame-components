import { playerStates } from "src/player/playerState";
import { ResourceType } from "src/resources/data";
import { Frame } from "w3ts";
import { Players } from "w3ts/globals";
import { isPlayingUser } from "warcraft-3-w3ts-utils";
import { Button } from "../components/button";
import { ResourceCard } from "../components/resource-card";
import { Tooltip } from "../components/Tooltip";
import { PlayerFrames } from "../data";
import { FrameUtils } from "../frame-utils";
import { Grid, GridItemBaseDefinition } from "../grid/grid";

interface GridData {
    type: ResourceType;
    value: number;
    rate: number;
}

interface ItemFrames extends GridItemBaseDefinition {
    resourceCard?: ResourceCard;
}

export class PlayerResourceDisplay {
    context: number;
    name: string;
    owner: Frame;
    containerFrame?: Frame;

    private button?: Button;
    private tooltip?: Tooltip;
    private resourceGrid?: Grid<GridData, ItemFrames>;

    constructor(context: number, name: string, owner: Frame) {
        this.context = context;
        this.name = name;
        this.owner = owner;

        this.render();
    }

    private render() {
        // const typesToCreate = [ResourceType.BuildingCap, ResourceType.ResearchPoints, ResourceType.MagicEssence, ResourceType.Souls, ResourceType.Food];
        const dataMap = typesToCreate.sort().map((t) => {
            return {
                type: t,
                value: 100,
                rate: 1,
            };
        });

        const grid = new Grid<GridData, ItemFrames>({
            data: dataMap,
            context: this.context,
            containerOwner: this.owner,
            containerName: this.context + "resourceGrid",
            rows: 2,
            columns: 4,
            gapX: 0.005,
            gapY: 0,
            renderItem: (parent, row, column, index, data) => {
                if (!data) {
                    return;
                }

                const card = new ResourceCard(this.context, this.name + "resource-card" + index, parent, data.type);

                return { container: card.containerFrame, resourceCard: card };
            },
            updateItem: (data, itemFrames, index) => {
                // update value for the correct types.
                if (!data) {
                    return;
                }

                //Presuming that when we update the data, the resource types are in the same order
                itemFrames?.resourceCard?.updateValue(data.value, data.rate);
            },
        });

        this.resourceGrid = grid;
        this.containerFrame = grid.containerFrame;
    }

    /**
     * Should handle getting the data and updating itself.
     * This way, whenever we change a player's resource state, we just call this and it handles the logic.
     *
     * @todo If this is to costly with performance because of the resource rate getting updated a lot, we could just create a seperate update function for rate only.
     */
    public update() {
        //grab all the data from the player state and update the frames appropriately.
        const state = playerStates.get(this.context);
        if (!state) {
            return;
        }

        //We're sorting this, so it should be in the same order as we created the grid.
        // const typesToCreate = [ResourceType.BuildingCap, ResourceType.ResearchPoints, ResourceType.MagicEssence, ResourceType.Souls, ResourceType.Food, ResourceType.Gold, ResourceType.Wood].sort();
        const newData = typesToCreate.map((type) => {
            const value = state.getResource(type, true);
            const rate = state.resourceRates.get(type) || 0;

            return {
                type,
                value,
                rate,
            };
        });

        this.resourceGrid?.updateGrid(newData);
    }
}

export function createPlayerResourceFrames() {
    Players.forEach((p) => {
        if (isPlayingUser(p)) {
            const resourceGrid = new PlayerResourceDisplay(p.id, "playerResourceFrames" + p.id, FrameUtils.OriginFrameGameUI);
            resourceGrid.containerFrame?.clearPoints();
            resourceGrid.containerFrame?.setAbsPoint(FRAMEPOINT_TOPLEFT, 0.46, 0.6);
            // resourceGrid.containerFrame?.setAbsPoint(FRAMEPOINT_TOPLEFT, 0.46, 0.575);

            if (GetLocalPlayer() !== p.handle) {
                resourceGrid.containerFrame?.setVisible(false);
            }

            const currentFrames = PlayerFrames.get(p.id);
            PlayerFrames.set(p.id, { ...currentFrames, resourceFrames: resourceGrid });
        }
    });
}

const typesToCreate = [ResourceType.BuildingLimit, ResourceType.ResearchPoints, ResourceType.MagicEssence, ResourceType.Souls, ResourceType.Food, ResourceType.Gold, ResourceType.Wood, ResourceType.PopulationLimit].sort();
