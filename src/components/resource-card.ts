import { playerStates } from "src/player/playerState";
import { ResourceType, ResourceTypeIconTexture, ResourceTypeName, ResourceTypeTag } from "src/resources/data";
import { Frame } from "w3ts";
import { Panel } from "../panels/panel";
import { Text } from "../text/text";
import { Button } from "./button";
import { Tooltip } from "./Tooltip";

/**
 * Needs to be configurable. 
 */
export class ResourceCard {
    context: number;
    name: string;
    owner: Frame;
    containerFrame?: Frame;
    resourceType: ResourceType;

    private button?: Button;
    private tooltip?: Tooltip;
    private valueText?: Frame;

    constructor(context: number, name: string, owner: Frame, resource: ResourceType) {
        this.context = context;
        this.name = name;
        this.owner = owner;
        this.resourceType = resource;

        this.render();
    }

    private render() {
        this.containerFrame = Panel.Render(this.context, this.name + "backdrop", this.owner);
        if (!this.containerFrame) {
            return;
        }
        this.containerFrame?.setSize(0.08, 0.025);

        this.button = new Button(this.context, this.name + "resourceButton", this.containerFrame, { texture: ResourceTypeIconTexture.get(this.resourceType) });
        if (!this.button.containerFrame) {
            return;
        }

        this.button.containerFrame?.clearPoints();
        this.button.containerFrame?.setPoint(FRAMEPOINT_LEFT, this.containerFrame, FRAMEPOINT_LEFT, 0.005, 0);
        this.button.containerFrame?.setSize(this.button.containerFrame.width * 0.5, this.button.containerFrame.height * 0.5);
        const header = ResourceTypeName.get(this.resourceType) || "";
        const rTag = ResourceTypeTag.get(this.resourceType) || "";

        this.tooltip = new Tooltip(rTag + " " + header, "", this.name + "resourceTooltip", this.context, this.button.containerFrame, { anchorPoint: "bottom" });

        this.valueText = Text.Render(this.context, this.name + "valueTextFrame" + this.context, this.owner);
        this.valueText?.clearPoints();
        this.valueText?.setPoint(FRAMEPOINT_LEFT, this.button.containerFrame, FRAMEPOINT_RIGHT, 0.005, 0);
        this.valueText?.setText("0");
        this.valueText?.setSize(this.valueText.width, 0);
        this.valueText?.setScale(0.8);
    }

    /**
     *
     * @param value
     * @param rate
     */
    updateValue(value: number, rate: number) {
        if (this.resourceType === ResourceType.BuildingLimit) {
            const state = playerStates.get(this.context);
            this.valueText?.setText(`${state?.getResource(ResourceType.BuildingCapacityUsed, true)}/${value}`);
        } else if (this.resourceType === ResourceType.PopulationLimit) {
            const state = playerStates.get(this.context);
            this.valueText?.setText(`${state?.player.getState(PLAYER_STATE_RESOURCE_FOOD_USED)}/${state?.player.getState(PLAYER_STATE_RESOURCE_FOOD_CAP)}`);
        } else {
            // const typesWithRates = [ResourceType.Food, ResourceType.Gold, ResourceType.Wood, ResourceType.MagicEssence, ResourceType.ResearchPoints, ResourceType.Souls];
            let rateString = "";
            if (!typesWithoutRates.includes(this.resourceType)) {
                //The negative symbol is already included automatically when it's interpolated
                rateString = ` (|cff${rate < 0 ? "ff8888" : "88ff88+"}${rate.toFixed(1)}|r)`;
            }

            if (this.resourceType === ResourceType.ResearchPoints) {
                this.valueText?.setText(`${value.toFixed(2)}${rateString}`);
            } else {
                this.valueText?.setText(`${Math.round(value)}${rateString}`);
            }
        }
    }
}

const typesWithoutRates = [ResourceType.BuildingLimit, ResourceType.BuildingCapacityUsed, ResourceType.PopulationLimit, ResourceType.Placeholder];
