import { ResourceRequirements, ResourceTypeIconTexture } from "src/resources/data";
import { Frame } from "w3ts";
import { Components, IconButton } from "../frame-components";
import { FrameUtils } from "../frame-utils";
import { Grid, GridItemBaseDefinition } from "../grid/grid";
import { Text } from "../text/text";

interface TooltipConfig {
    reverseOrientation?: boolean;
    /**
     * Where to anchor the tooltip to on the parent
     */
    anchorPoint?: "bottom";
    includeBackground?: boolean;
    resources?: ResourceRequirements[];
}

interface ResourceGridFrameDefinitions extends GridItemBaseDefinition {
    buttonFrames?: IconButton;
    valueText?: Frame;
}

export class Tooltip {
    name: string;
    context: number;
    parent: Frame;

    /**
     * Text frame and background frame, etc
     */
    textFrame?: Frame;
    backdropFrame?: Frame;
    private config?: TooltipConfig;

    private headerTextFrame?: Frame;
    private bodyTextFrame?: Frame;
    private resourceGrid?: Grid<ResourceRequirements, ResourceGridFrameDefinitions>;

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
            const tooltipFrameBackGround = Frame.fromHandle(BlzCreateFrameByType("BACKDROP", name, parent.handle, "JMT_BackdropTemplate_Tooltip", context)); //I'm not sure if we need the parent to be an origin frame, but we'll roll with this for now.
            if (!tooltipFrameBackGround) {
                return;
            }

            // -- Create the Text as child of the Background
            this.headerTextFrame = Frame.fromHandle(BlzCreateFrameByType("TEXT", this.name + "headerText", tooltipFrameBackGround.handle, "", context));
            this.bodyTextFrame = Frame.fromHandle(BlzCreateFrameByType("TEXT", this.name + "bodyText", tooltipFrameBackGround.handle, "", context));

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
                BlzFrameSetPoint(tooltipFrameBackGround.handle, FRAMEPOINT_TOPRIGHT, this.headerTextFrame.handle, FRAMEPOINT_TOPRIGHT, 0.005, 0.01);
                BlzFrameSetPoint(tooltipFrameBackGround.handle, FRAMEPOINT_BOTTOMLEFT, this.bodyTextFrame.handle, FRAMEPOINT_BOTTOMLEFT, -0.005, -0.01);
            } else if (text === "") {
                // -- Copy Size and Position with a small offset.
                BlzFrameSetPoint(tooltipFrameBackGround.handle, FRAMEPOINT_BOTTOMLEFT, this.headerTextFrame.handle, FRAMEPOINT_BOTTOMLEFT, -0.005, -0.01);
                BlzFrameSetPoint(tooltipFrameBackGround.handle, FRAMEPOINT_TOPRIGHT, this.headerTextFrame.handle, FRAMEPOINT_TOPRIGHT, 0.005, 0.01);
            }

            // -- The background becomes the button's tooltip, the Text as child of the background will share the visibility
            BlzFrameSetTooltip(parent.handle, tooltipFrameBackGround.handle);

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
                this.headerTextFrame.setPoint(FRAMEPOINT_TOPRIGHT, this.parent, FRAMEPOINT_BOTTOMLEFT, 0, -0.01);
                //the resource grid would be here and the header would be placed on it
                //the groupd would be place it's bottom left to the top right of the body instead of the header
                this.bodyTextFrame.setPoint(FRAMEPOINT_TOPLEFT, this.headerTextFrame, FRAMEPOINT_BOTTOMLEFT, 0, -0.01);
            }

            if (config?.resources) {
                this.resourceGrid = new Grid<ResourceRequirements, ResourceGridFrameDefinitions>({
                    context: this.context,
                    containerName: this.name + "resource-grid",
                    gapX: 0.005,
                    gapY: 0.005,
                    containerOwner: tooltipFrameBackGround,
                    rows: 1,
                    columns: 8,
                    data: config.resources,
                    renderItem: (parent, row, column, index, data) => {
                        let texture = "";

                        if (data && data.type) {
                            texture = ResourceTypeIconTexture.get(data.type) || "";
                        }

                        const emptyFrame = Components.EmptyFrame(this.context, this.name + "resourceBackdrop" + index, parent);
                        const btnFrames = Components.IconButton(this.context, this.name + "resourceIcon" + index, texture || "", emptyFrame);
                        btnFrames.button?.setSize(btnFrames.button.width * 0.4, btnFrames.button.height * 0.4);
                        btnFrames.button?.clearPoints();

                        if (emptyFrame) {
                            btnFrames.button?.setPoint(FRAMEPOINT_LEFT, emptyFrame, FRAMEPOINT_LEFT, 0.005, 0);
                        }

                        const valueText = Text.Render(this.context, this.name + "resoureceTextValue" + index, emptyFrame);
                        valueText?.clearPoints();

                        if (btnFrames.button) {
                            valueText?.setPoint(FRAMEPOINT_LEFT, btnFrames.button, FRAMEPOINT_RIGHT, 0.005, 0);
                        }

                        valueText?.setScale(0.8);
                        valueText?.setText(`${data?.value || ""}`);
                        valueText?.setSize(Text.FormatSize(valueText.text), 0);

                        emptyFrame?.setSize((btnFrames.button?.width || 0.05) + (valueText?.width || 0.05), btnFrames.button?.height || 0.05);

                        return { container: emptyFrame, buttonFrames: btnFrames, valueText };
                    },
                    updateItem: (data, itemFrames, index) => {
                        if (!data || !data.type) {
                            return;
                        }

                        const texture = ResourceTypeIconTexture.get(data.type);
                        itemFrames?.buttonFrames?.buttonIconFrame?.setTexture(texture || "", 0, false);
                        itemFrames?.valueText?.setText(`${data.value}`);
                        itemFrames?.valueText?.setSize(Text.FormatSize(itemFrames.valueText.text), 0);
                        itemFrames?.container?.setSize((itemFrames?.buttonFrames?.button?.width || 0.05) + (itemFrames?.valueText?.width || 0.05), itemFrames.buttonFrames?.button?.height || 0.05);

                        return;
                    },
                });

                if (!this.resourceGrid.containerFrame) {
                    return;
                }

                // -- Place the Tooltip above the Button
                this.headerTextFrame.clearPoints();
                this.headerTextFrame.setPoint(FRAMEPOINT_BOTTOMLEFT, this.resourceGrid.containerFrame, FRAMEPOINT_TOPLEFT, 0, 0.01);
                //the resource grid would be here and the header would be placed on it
                //the groupd would be place it's bottom left to the top right of the body instead of the header
                this.resourceGrid.containerFrame?.clearPoints();
                this.resourceGrid.containerFrame?.setPoint(FRAMEPOINT_BOTTOMLEFT, this.bodyTextFrame, FRAMEPOINT_TOPLEFT, 0, 0.01);

                // this.bodyTextFrame.clearPoints();
                // this.bodyTextFrame.setPoint(FRAMEPOINT_BOTTOMLEFT, this.parent, FRAMEPOINT_TOPLEFT, 0, 0.01);
                //adjust positioning again
            }

            // -- Prevent the TEXT from taking mouse control
            this.headerTextFrame.setEnabled(false);
            this.bodyTextFrame.setEnabled(false);

            this.StyleTooltipText(header, text);

            this.textFrame = this.bodyTextFrame;
            this.backdropFrame = tooltipFrameBackGround;
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

            this.textFrame = tooltipFrameText;
        }
    }

    /**
     * Updates only text for now.
     * @param header
     * @param body
     * @returns
     */
    public update(header: string, body: string, resources?: ResourceRequirements[]) {
        if (!this.textFrame) {
            return;
        }

        this.StyleTooltipText(header, body);

        if (resources) {
            //update with new data
            this.resourceGrid?.updateGrid(resources);
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
