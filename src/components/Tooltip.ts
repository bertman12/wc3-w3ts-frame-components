// import { ResourceRequirements, ResourceTypeIconTexture } from "src/resources/data";
import { Frame } from "w3ts";
import { Grid, IGridItemBaseDefinition } from "../grid/grid";
import { AbstractFrameBase } from "./AbstractFrameBase";
import { EmptyFrame } from "./empty-frame";
import { Icon } from "./icon";
import { Text } from "./text";

interface TooltipIconDataItem {
    texture: string;
    value?: string;
}

interface TooltipConfig {
    headerText: string;
    bodyText: string;
    /**
     * Default - The tooltip will be pinned to the left side of what it's attached to and expand right if necessary.
     * If reverse orientation is true, the tooltip will be pinned from the right side and expand leftwards.
     */
    reverseOrientation?: boolean;
    /**
     * Where to anchor the tooltip to on the parent.
     *
     * Currently does not work when an icon grid is used.
     */
    anchorPoint?: "bottom";
    /**
     * Determines whether or not to dislpay a backdrop for the tooltip.
     */
    includeBackground?: boolean;
    /**
     * Allows for adding icons underneath the header text of the tooltip.
     */
    tooltipIconGridData?: TooltipIconDataItem[];
    /**
     * The space the values appear next to their icons.
     *
     * Recommended default: 0.003
     */
    tooltipIconValueLeftPadding?: number;
    /**
     * Determines an additional gap between icons.
     */
    tooltipIconContainerGapX?: number;
    /**
     * The space between the tooltip body text and the backdrop
     */
    tooltipBodySpaceX?: number;
    /**
     * The space between the tooltip header text and the backdrop
     */
    tooltipHeaderSpaceX?: number;
}

interface TooltipGridFramesDefinition extends IGridItemBaseDefinition {
    icon?: Icon;
    valueText?: Text;
}

export class Tooltip extends AbstractFrameBase {
    private config?: TooltipConfig;

    public headerTextFrame?: Frame;
    public bodyTextFrame?: Frame;
    public iconGrid?: Grid<TooltipIconDataItem, TooltipGridFramesDefinition>;

    public tooltipBackdropFrame?: Frame;

    constructor(name: string, context: number, owner?: Frame, config?: TooltipConfig) {
        super(name, context, owner);
        this.config = config;

        this.render();
    }

    protected render() {
        if (!this.owner) {
            return;
        }

        if (!this.config?.includeBackground) {
            this.renderTextOnlyTooltip();
            return;
        }

        if (!this.config) {
            return;
        }

        //  -- Create the Background a Backdrop
        this.tooltipBackdropFrame = Frame.createType(this.name, this.owner, this.context, "BACKDROP", "QuestButtonBaseTemplate");
        if (!this.tooltipBackdropFrame) {
            return;
        }

        // -- Create the Text as child of the Background
        this.headerTextFrame = Frame.createType(this.name + "headerText", this.tooltipBackdropFrame, this.context, "TEXT", "");
        this.bodyTextFrame = Frame.createType(this.name + "bodyText", this.tooltipBackdropFrame, this.context, "TEXT", "");

        if (!this.bodyTextFrame || !this.headerTextFrame) {
            return;
        }

        /**
         * Wrapping the background around the text frames
         *
         * Shouldn't have to change this based on positioning when adding resource frame tooltip.
         */
        if (this.config.headerText !== "" && this.config.bodyText !== "") {
            // -- Copy Size and Position with a small offset.
            this.tooltipBackdropFrame.setPoint(FRAMEPOINT_TOPRIGHT, this.headerTextFrame, FRAMEPOINT_TOPRIGHT, this.config?.tooltipHeaderSpaceX || 0.01, 0.01);
            this.tooltipBackdropFrame.setPoint(FRAMEPOINT_BOTTOMLEFT, this.bodyTextFrame, FRAMEPOINT_BOTTOMLEFT, -(this.config?.tooltipBodySpaceX || 0.01), -0.01);
        } else if (this.config.bodyText === "") {
            // -- Copy Size and Position with a small offset.
            this.tooltipBackdropFrame.setPoint(FRAMEPOINT_BOTTOMLEFT, this.headerTextFrame, FRAMEPOINT_BOTTOMLEFT, -(this.config?.tooltipHeaderSpaceX || 0.01), -0.01);
            this.tooltipBackdropFrame.setPoint(FRAMEPOINT_TOPRIGHT, this.headerTextFrame, FRAMEPOINT_TOPRIGHT, this.config?.tooltipHeaderSpaceX || 0.01, 0.01);
        }

        // -- The background becomes the button's tooltip, the Text as child of the background will share the visibility
        BlzFrameSetTooltip(this.owner.handle, this.tooltipBackdropFrame.handle);

        /**
         * Positioning the tooltip on the corners of the parent (which is usually a button or a frame)
         */
        if (this.config?.reverseOrientation) {
            if (this.config.bodyText === "") {
                this.headerTextFrame.setPoint(FRAMEPOINT_BOTTOMRIGHT, this.owner, FRAMEPOINT_TOPRIGHT, 0, 0.01);
            } else {
                // -- Place the Tooltip above the Button
                this.headerTextFrame.setPoint(FRAMEPOINT_BOTTOMRIGHT, this.bodyTextFrame, FRAMEPOINT_TOPRIGHT, 0, 0.01);
                this.bodyTextFrame.setPoint(FRAMEPOINT_BOTTOMRIGHT, this.owner, FRAMEPOINT_TOPRIGHT, 0, 0.01);
            }
        } else {
            //no body for tooltip
            if (this.config.bodyText === "") {
                this.headerTextFrame.setPoint(FRAMEPOINT_BOTTOMLEFT, this.owner, FRAMEPOINT_TOPLEFT, 0, 0.01);
            } else {
                // -- Place the Tooltip above the Button
                this.headerTextFrame.setPoint(FRAMEPOINT_BOTTOMLEFT, this.bodyTextFrame, FRAMEPOINT_TOPLEFT, 0, 0.01);
                this.bodyTextFrame.setPoint(FRAMEPOINT_BOTTOMLEFT, this.owner, FRAMEPOINT_TOPLEFT, 0, 0.01);
            }
        }

        if (this.config?.anchorPoint === "bottom") {
            this.headerTextFrame.clearPoints();
            this.bodyTextFrame.clearPoints();
            this.headerTextFrame.setPoint(FRAMEPOINT_TOPRIGHT, this.owner, FRAMEPOINT_BOTTOMLEFT, 0, -0.01);
            this.bodyTextFrame.setPoint(FRAMEPOINT_TOPLEFT, this.headerTextFrame, FRAMEPOINT_BOTTOMLEFT, 0, -0.01);
        }

        if (this.config?.tooltipIconGridData) {
            this.iconGrid = new Grid<TooltipIconDataItem, TooltipGridFramesDefinition>(
                {
                    gapX: 0.005,
                    gapY: 0.005,
                    rows: 1,
                    columns: 4,
                    data: this.config.tooltipIconGridData,
                    renderItem: (parent, row, column, index, data) => {
                        let texture = data?.texture || "";
                        const emptyFrame = new EmptyFrame(this.name + "empty-frame", this.context, parent, "");
                        if (!emptyFrame.frame) {
                            return;
                        }

                        const icon = new Icon(texture, this.name + "icon-frame", this.context, emptyFrame.frame, "");
                        if (!icon.frame) {
                            return;
                        }

                        icon.frame?.setSize(icon.frame.width * 0.4, icon.frame.height * 0.4);
                        icon.frame?.clearPoints();
                        icon.frame?.setPoint(FRAMEPOINT_LEFT, emptyFrame.frame, FRAMEPOINT_LEFT, 0, 0);

                        const valueText = new Text({}, this.name + "resoureceTextValue" + index, this.context, emptyFrame.frame, "");
                        valueText.frame?.clearPoints();
                        valueText.frame?.setPoint(FRAMEPOINT_LEFT, icon.frame, FRAMEPOINT_RIGHT, this.config?.tooltipIconValueLeftPadding || 0.005, 0);
                        valueText.frame?.setScale(0.8);
                        valueText.frame?.setText(`${data?.value || ""}`);
                        valueText.formatSize();

                        //the width should be the icon width + text width + some buffer
                        emptyFrame.frame?.setSize((icon.frame?.width || 0.05) + (valueText.frame?.width || 0.05) + (this.config?.tooltipIconContainerGapX || 0), icon.frame?.height || 0.05);

                        return { container: emptyFrame.frame, icon, valueText };
                    },
                    updateItem: (data, itemFrames, index) => {
                        const texture = data.texture || "";

                        itemFrames?.icon?.frame?.setTexture(texture || "", 0, false);
                        itemFrames?.valueText?.frame?.setText(`${data.value}`);
                        itemFrames?.valueText?.formatSize();
                        itemFrames?.container?.setSize((itemFrames?.icon?.frame?.width || 0.05) + (itemFrames?.valueText?.frame?.width || 0.05), itemFrames?.icon?.frame?.height || 0.05);
                    },
                },
                "",
                this.context,
                this.tooltipBackdropFrame,
            );

            if (!this.iconGrid.containerFrame) {
                return;
            }

            // -- Place the Tooltip above the Button
            this.headerTextFrame.clearPoints();
            this.headerTextFrame.setPoint(FRAMEPOINT_BOTTOMLEFT, this.iconGrid.containerFrame, FRAMEPOINT_TOPLEFT, 0, 0.01);
            this.iconGrid.containerFrame?.clearPoints();
            this.iconGrid.containerFrame?.setPoint(FRAMEPOINT_BOTTOMLEFT, this.bodyTextFrame, FRAMEPOINT_TOPLEFT, 0, 0.01);
        }

        // -- Prevent the TEXT from taking mouse control
        this.headerTextFrame.setEnabled(false);
        this.bodyTextFrame.setEnabled(false);

        this.StyleTooltipText(this.config.headerText, this.config.bodyText);
    }

    private renderTextOnlyTooltip() {
        const tooltipFrameText = Frame.createType("", this.owner, this.context, "TEXT", "");
        if (!tooltipFrameText) {
            return;
        }

        // -- tooltipFrame becomes button's tooltip
        BlzFrameSetTooltip(this.owner.handle, tooltipFrameText.handle);
        // -- Place the Tooltip above the Button
        BlzFrameSetPoint(tooltipFrameText.handle, FRAMEPOINT_BOTTOM, this.owner.handle, FRAMEPOINT_TOP, 0, 0.01);
        // -- Prevent the TEXT from taking mouse control
        BlzFrameSetEnable(tooltipFrameText.handle, false);
        BlzFrameSetText(tooltipFrameText.handle, this.config?.bodyText || "");

        this.bodyTextFrame = tooltipFrameText;
    }

    /**
     * Updates only text for now.
     * @param header
     * @param body
     * @returns
     */
    public update(header: string, body: string, tooltipIconData?: TooltipIconDataItem[]) {
        this.StyleTooltipText(header, body);

        if (tooltipIconData) {
            //update with new data
            this.iconGrid?.updateGrid(tooltipIconData);
        }
    }

    private GetFormattedWidth(tooltipHeader: string, tooltipText: string) {
        const maxWidth = 0.2;
        const minWidth = 0.05;

        let width = 0.02 + 0.004 * tooltipHeader.length + 0.004 * tooltipText.length;

        if (tooltipText === "") {
            width = 0.04 + 0.004 * tooltipHeader.length;
        }

        if (width > maxWidth) {
            width = maxWidth;
        }

        if (width < minWidth) {
            width = minWidth;
        }

        return width;
    }

    private StyleTooltipText(header?: string, text?: string) {
        let _header = header;

        if (text !== undefined && text !== "") {
            //split
            this.headerTextFrame?.setText(_header || "");
            this.bodyTextFrame?.setText(text);
        } else {
            //headeronly
            this.headerTextFrame?.setText(_header || "");
        }

        const width = this.GetFormattedWidth(header || "", text || "");
        this.headerTextFrame?.setSize(width, 0);
        this.bodyTextFrame?.setSize(width, 0);
    }
}
