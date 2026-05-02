// import { ResourceRequirements, ResourceTypeIconTexture } from "src/resources/data";
import { W3TSFrameComponentsThemeUtils } from "src/theme";
import { Frame } from "w3ts";
import { FrameUtils } from "../frame-utils";
import { Grid, GridItemBaseDefinition } from "../grid/grid";
import { EmptyFrame } from "./empty-frame";
import { Icon } from "./icon";
import { Text } from "./text";

interface TooltipIconDataItem {
    texture: string;
    value?: string;
}

interface TooltipConfig {
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

interface TooltipGridFramesDefinition extends GridItemBaseDefinition {
    icon?: Icon;
    valueText?: Text;
}

export class Tooltip {
    name: string;
    context: number;
    parent: Frame;

    private config?: TooltipConfig;

    public headerTextFrame?: Frame;
    public bodyTextFrame?: Frame;
    public iconGrid?: Grid<TooltipIconDataItem, TooltipGridFramesDefinition>;

    public tooltipBackdropFrame?: Frame;

    constructor(header: string, body: string, name: string, context: number, parent?: Frame, config?: TooltipConfig) {
        this.name = name;
        this.context = context;
        this.parent = parent || FrameUtils.OriginFrameGameUI;
        this.config = config;
        this.render(header, body, context, name, this.parent, config?.includeBackground, config);
    }

    private render(header: string, text: string, context: number, name: string, parent?: Frame, includeBackground: boolean = true, config?: TooltipConfig) {
        if (!parent) {
            return;
        }

        if (includeBackground) {
            //  -- Create the Background a Backdrop
            this.tooltipBackdropFrame = Frame.fromHandle(BlzCreateFrameByType("BACKDROP", name, parent.handle, W3TSFrameComponentsThemeUtils.Theme.tooltipBackdropInherits || "QuestButtonBaseTemplate", context)); //I'm not sure if we need the parent to be an origin frame, but we'll roll with this for now.
            if (!this.tooltipBackdropFrame) {
                return;
            }

            // -- Create the Text as child of the Background
            this.headerTextFrame = Frame.fromHandle(BlzCreateFrameByType("TEXT", this.name + "headerText", this.tooltipBackdropFrame.handle, "", context));
            this.bodyTextFrame = Frame.fromHandle(BlzCreateFrameByType("TEXT", this.name + "bodyText", this.tooltipBackdropFrame.handle, "", context));

            if (!this.bodyTextFrame || !this.headerTextFrame) {
                return;
            }

            /**
             * Wrapping the background around the text frames
             *
             * Shouldn't have to change this based on positioning when adding resource frame tooltip.
             */
            if (header !== "" && text !== "") {
                // -- Copy Size and Position with a small offset.
                BlzFrameSetPoint(this.tooltipBackdropFrame.handle, FRAMEPOINT_TOPRIGHT, this.headerTextFrame.handle, FRAMEPOINT_TOPRIGHT, this.config?.tooltipHeaderSpaceX || 0.01, 0.01);
                BlzFrameSetPoint(this.tooltipBackdropFrame.handle, FRAMEPOINT_BOTTOMLEFT, this.bodyTextFrame.handle, FRAMEPOINT_BOTTOMLEFT, -(this.config?.tooltipBodySpaceX || 0) || -0.01, -0.01);
            } else if (text === "") {
                // -- Copy Size and Position with a small offset.
                BlzFrameSetPoint(this.tooltipBackdropFrame.handle, FRAMEPOINT_BOTTOMLEFT, this.headerTextFrame.handle, FRAMEPOINT_BOTTOMLEFT, -(this.config?.tooltipHeaderSpaceX || 0) || -0.01, -0.01);
                BlzFrameSetPoint(this.tooltipBackdropFrame.handle, FRAMEPOINT_TOPRIGHT, this.headerTextFrame.handle, FRAMEPOINT_TOPRIGHT, this.config?.tooltipHeaderSpaceX || 0.01, 0.01);
            }

            // -- The background becomes the button's tooltip, the Text as child of the background will share the visibility
            BlzFrameSetTooltip(parent.handle, this.tooltipBackdropFrame.handle);

            /**
             * Positioning the tooltip on the corners of the parent (which is usually a button or a frame)
             */
            if (config?.reverseOrientation) {
                if (text === "") {
                    this.headerTextFrame.setPoint(FRAMEPOINT_BOTTOMRIGHT, this.parent, FRAMEPOINT_TOPRIGHT, 0, 0.01);
                } else {
                    // -- Place the Tooltip above the Button
                    this.headerTextFrame.setPoint(FRAMEPOINT_BOTTOMRIGHT, this.bodyTextFrame, FRAMEPOINT_TOPRIGHT, 0, 0.01);
                    this.bodyTextFrame.setPoint(FRAMEPOINT_BOTTOMRIGHT, this.parent, FRAMEPOINT_TOPRIGHT, 0, 0.01);
                }
            } else {
                //no body for tooltip
                if (text === "") {
                    this.headerTextFrame.setPoint(FRAMEPOINT_BOTTOMLEFT, this.parent, FRAMEPOINT_TOPLEFT, 0, 0.01);
                } else {
                    // -- Place the Tooltip above the Button
                    this.headerTextFrame.setPoint(FRAMEPOINT_BOTTOMLEFT, this.bodyTextFrame, FRAMEPOINT_TOPLEFT, 0, 0.01);
                    //the resource grid would be here and the header would be placed on it
                    //the groupd would be place it's bottom left to the top right of the body instead of the header
                    this.bodyTextFrame.setPoint(FRAMEPOINT_BOTTOMLEFT, this.parent, FRAMEPOINT_TOPLEFT, 0, 0.01);
                }
            }

            if (this.config?.anchorPoint === "bottom") {
                this.headerTextFrame.clearPoints();
                this.bodyTextFrame.clearPoints();
                // this.tooltipBackdropFrame.
                this.headerTextFrame.setPoint(FRAMEPOINT_TOPRIGHT, this.parent, FRAMEPOINT_BOTTOMLEFT, 0, -0.01);
                //the resource grid would be here and the header would be placed on it
                //the groupd would be place it's bottom left to the top right of the body instead of the header
                this.bodyTextFrame.setPoint(FRAMEPOINT_TOPLEFT, this.headerTextFrame, FRAMEPOINT_BOTTOMLEFT, 0, -0.01);
            }

            if (config?.tooltipIconGridData) {
                this.iconGrid = new Grid<TooltipIconDataItem, TooltipGridFramesDefinition>(
                    {
                        gapX: 0.005,
                        gapY: 0.005,
                        rows: 1,
                        columns: 4,
                        data: config.tooltipIconGridData,
                        renderItem: (parent, row, column, index, data) => {
                            if (!data) {
                                return;
                            }

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

                            if (emptyFrame) {
                                icon.frame?.setPoint(FRAMEPOINT_LEFT, emptyFrame.frame, FRAMEPOINT_LEFT, this.config?.tooltipIconValueLeftPadding || 0.005, 0);
                            }

                            const valueText = new Text({}, this.name + "resoureceTextValue" + index, this.context, emptyFrame.frame, "");
                            valueText.frame?.clearPoints();

                            if (icon.frame) {
                                valueText.frame?.setPoint(FRAMEPOINT_LEFT, icon.frame, FRAMEPOINT_RIGHT, this.config?.tooltipIconValueLeftPadding || 0.005, 0);
                            }

                            valueText.frame?.setScale(0.8);
                            valueText.frame?.setText(`${data?.value || ""}`);
                            valueText.formatSize();

                            // emptyFrame.frame?.setSize(this.config?.tooltipIconContainerWidth || (icon.frame?.width || 0.05) + (valueText.frame?.width || 0.05), icon.frame?.height || 0.05);
                            
                            //the width should be the icon width + text width + some buffer
                            emptyFrame.frame?.setSize((icon.frame?.width || 0.05) + (valueText.frame?.width || 0.05) + (this.config?.tooltipIconContainerGapX || 0), icon.frame?.height || 0.05);

                            return { container: emptyFrame.frame, icon, valueText };
                        },
                        updateItem: (data, itemFrames, index) => {
                            if (!data) {
                                return;
                            }

                            const texture = data.texture || "";

                            itemFrames?.icon?.frame?.setTexture(texture || "", 0, false);
                            itemFrames?.valueText?.frame?.setText(`${data.value}`);
                            itemFrames?.valueText?.formatSize();
                            // itemFrames?.valueText?.setSize(Text.FormatSize(itemFrames.valueText.text), 0);
                            itemFrames?.container?.setSize((itemFrames?.icon?.frame?.width || 0.05) + (itemFrames?.valueText?.frame?.width || 0.05), itemFrames?.icon?.frame?.height || 0.05);

                            return;
                        },
                    },
                    "someName",
                    this.context,
                    this.tooltipBackdropFrame,
                );

                if (!this.iconGrid.containerFrame) {
                    return;
                }

                // -- Place the Tooltip above the Button
                this.headerTextFrame.clearPoints();
                this.headerTextFrame.setPoint(FRAMEPOINT_BOTTOMLEFT, this.iconGrid.containerFrame, FRAMEPOINT_TOPLEFT, 0, 0.01);
                //the resource grid would be here and the header would be placed on it
                //the groupd would be place it's bottom left to the top right of the body instead of the header
                this.iconGrid.containerFrame?.clearPoints();
                this.iconGrid.containerFrame?.setPoint(FRAMEPOINT_BOTTOMLEFT, this.bodyTextFrame, FRAMEPOINT_TOPLEFT, 0, 0.01);

                // this.bodyTextFrame.clearPoints();
                // this.bodyTextFrame.setPoint(FRAMEPOINT_BOTTOMLEFT, this.parent, FRAMEPOINT_TOPLEFT, 0, 0.01);
                //adjust positioning again
            }

            // -- Prevent the TEXT from taking mouse control
            this.headerTextFrame.setEnabled(false);
            this.bodyTextFrame.setEnabled(false);

            this.StyleTooltipText(header, text);
        } else {
            const tooltipFrameText = Frame.fromHandle(BlzCreateFrameByType("TEXT", "MyScriptDialogButtonTooltip", FrameUtils.OriginFrameGameUIHandle, "", context));
            if (!tooltipFrameText) {
                return;
            }

            // -- tooltipFrame becomes button's tooltip
            BlzFrameSetTooltip(parent.handle, tooltipFrameText.handle);
            // -- Place the Tooltip above the Button
            BlzFrameSetPoint(tooltipFrameText.handle, FRAMEPOINT_BOTTOM, parent.handle, FRAMEPOINT_TOP, 0, 0.01);
            // -- Prevent the TEXT from taking mouse control
            BlzFrameSetEnable(tooltipFrameText.handle, false);
            BlzFrameSetText(tooltipFrameText.handle, text);

            this.bodyTextFrame = tooltipFrameText;
        }
    }

    /**
     * Updates only text for now.
     * @param header
     * @param body
     * @returns
     */
    public update(header: string, body: string, tooltipIconData?: TooltipIconDataItem[]) {
        // if (!this.bodyTextFrame) {
        //     return;
        // }

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
