import { Frame } from "w3ts";
import { FrameUtils } from "../../frame-utils";
import { Grid, IGridItemBaseDefinition } from "../../grid";
import { ICompositeFrameChild, ICompositeFrameChildFrames, ICompositeFrameChildRenderers, ICompositeFrameConfigurationBase } from "../../models";
import { CompositeFrame } from "../Core/CompositeFrame";
import { BackdropFrame } from "../MonoFrames/BackdropFrame";
import { EmptyFrame } from "../MonoFrames/EmptyFrame";
import { TextFrame } from "../MonoFrames/TextFrame";
import { ButtonFrame } from "./ButtonFrame";

export interface TooltipIconDataItem {
    texture: string;
    value?: string;
}

export interface TooltipFrameConfiguration extends ICompositeFrameConfigurationBase {
    /** Set to "bottom" to open the tooltip beneath its owner instead of above. Default value: undefined */
    anchorPoint?: "bottom";
    /** FDF template the backdrop inherits from when `includeBackground` is true. Default value: "QuestButtonBaseTemplate" */
    backdropInherits?: string;
    /** Body text of the tooltip. Default value: "" */
    bodyText?: string;
    /** Header text of the tooltip. Default value: "" */
    headerText?: string;
    /** Whether the tooltip is rendered inside a backdrop. Default value: false */
    includeBackground?: boolean;
    /** Anchors the tooltip to the top right of its owner instead of the top left. Default value: false */
    reverseOrientation?: boolean;
    /** Horizontal space between the backdrop edge and the text on the left. Default value: 0.01 */
    tooltipBodySpaceX?: number;
    /** Horizontal gap added after each icon and value pair in the icon grid. Default value: 0 */
    tooltipIconContainerGapX?: number;
    /** Icon and value data rendered beneath the header. No grid is created when unset. Default value: undefined */
    tooltipIconGridData?: TooltipIconDataItem[];
    /** Space between an icon and its value text in the icon grid. Default value: 0.005 */
    tooltipIconValueLeftPadding?: number;
    /** Horizontal space between the backdrop edge and the header on the right. Default value: 0.01 */
    tooltipHeaderSpaceX?: number;
    /** Overrides how each child frame is rendered. Each `render` returns the same type as its child frame. Default value: undefined */
    childFrames?: ICompositeFrameChildRenderers<TooltipFrameChildFrames>;
}

type TooltipFrameDefaultConfiguration = Required<
    Pick<TooltipFrameConfiguration, "backdropInherits" | "bodyText" | "headerText" | "includeBackground" | "reverseOrientation" | "tooltipBodySpaceX" | "tooltipHeaderSpaceX" | "tooltipIconContainerGapX" | "tooltipIconValueLeftPadding">
> &
    Pick<TooltipFrameConfiguration, "anchorPoint" | "tooltipIconGridData">;

interface TooltipGridItemFrames extends IGridItemBaseDefinition {
    icon: ButtonFrame;
    valueText: TextFrame;
}

export interface TooltipFrameChildFrames extends ICompositeFrameChildFrames {
    backdrop?: ICompositeFrameChild<BackdropFrame>;
    bodyText: ICompositeFrameChild<TextFrame>;
    headerText: ICompositeFrameChild<TextFrame>;
    iconGrid?: ICompositeFrameChild<Grid<TooltipIconDataItem, TooltipGridItemFrames>>;
}

export class TooltipFrame extends CompositeFrame<TooltipFrameConfiguration, TooltipFrameChildFrames> {
    private constructor(...args: ConstructorParameters<typeof CompositeFrame<TooltipFrameConfiguration, TooltipFrameChildFrames>>) {
        super(...args);
        this.render();
    }

    public static get DefaultConfiguration(): TooltipFrameDefaultConfiguration {
        return {
            anchorPoint: undefined,
            backdropInherits: "QuestButtonBaseTemplate",
            bodyText: "",
            headerText: "",
            includeBackground: false,
            reverseOrientation: false,
            tooltipBodySpaceX: 0.01,
            tooltipHeaderSpaceX: 0.01,
            tooltipIconContainerGapX: 0,
            tooltipIconGridData: undefined,
            tooltipIconValueLeftPadding: 0.005,
        };
    }

    /**
     * @param args.context The context of the container frame and all child frames. Default value: 0
     */
    public static Create(args: { context?: number; name?: string; owner?: Frame; overrides?: TooltipFrameConfiguration }): TooltipFrame {
        return new TooltipFrame(args.context, { ...TooltipFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner);
    }

    protected render(): void {
        const name = this.name ?? "TooltipFrame";
        const defaults = TooltipFrame.DefaultConfiguration;
        const parent = this.owner ?? FrameUtils.OriginFrameGameUI;
        const renderers = this.configuration.childFrames;
        const backdropChild = this.configuration.includeBackground
            ? this.renderChild(renderers?.backdrop?.render, () => BackdropFrame.CreateType({ context: this.context, inherits: this.configuration.backdropInherits ?? defaults.backdropInherits, name: `${name}Backdrop`, owner: parent }))
            : undefined;
        const backdrop = backdropChild?.frame;
        const contentOwner = backdrop?.frame ?? parent;
        const headerChild = this.renderChild(renderers?.headerText?.render, () => TextFrame.CreateType({ context: this.context, inherits: "", name: `${name}Header`, owner: contentOwner }));
        const bodyChild = this.renderChild(renderers?.bodyText?.render, () => TextFrame.CreateType({ context: this.context, inherits: "", name: `${name}Body`, owner: contentOwner }));
        const headerText = headerChild.frame;
        const bodyText = bodyChild.frame;
        this.containerFrame = backdrop?.frame;

        if (!headerText.frame || !bodyText.frame) {
            return;
        }

        backdrop?.frame?.clearPoints();
        headerText.frame.clearPoints();
        bodyText.frame.clearPoints();
        headerText.frame.setText(this.configuration.headerText ?? defaults.headerText);
        bodyText.frame.setText(this.configuration.bodyText ?? defaults.bodyText);
        const width = this.getFormattedWidth(this.configuration.headerText ?? defaults.headerText, this.configuration.bodyText ?? defaults.bodyText);
        const bodySpaceX = this.configuration.tooltipBodySpaceX ?? defaults.tooltipBodySpaceX;
        headerText.frame.setSize(width, 0);
        bodyText.frame.setSize(width, 0);
        headerText.frame.setEnabled(false);
        bodyText.frame.setEnabled(false);

        if (this.configuration.reverseOrientation) {
            bodyText.frame.setPoint(FRAMEPOINT_BOTTOMRIGHT, parent, FRAMEPOINT_TOPRIGHT, 0, 0.01);
            headerText.frame.setPoint(FRAMEPOINT_BOTTOMRIGHT, bodyText.frame, FRAMEPOINT_TOPRIGHT, 0, 0.01);
        } else {
            bodyText.frame.setPoint(FRAMEPOINT_BOTTOMLEFT, parent, FRAMEPOINT_TOPLEFT, 0, 0.01);
            headerText.frame.setPoint(FRAMEPOINT_BOTTOMLEFT, bodyText.frame, FRAMEPOINT_TOPLEFT, 0, 0.01);
        }

        if (this.configuration.anchorPoint === "bottom") {
            headerText.frame.clearPoints();
            bodyText.frame.clearPoints();
            headerText.frame.setPoint(FRAMEPOINT_TOPLEFT, parent, FRAMEPOINT_BOTTOMLEFT, bodySpaceX, -0.01);
            bodyText.frame.setPoint(FRAMEPOINT_TOPLEFT, headerText.frame, FRAMEPOINT_BOTTOMLEFT, 0, -0.01);
        }

        let iconGridChild: ICompositeFrameChild<Grid<TooltipIconDataItem, TooltipGridItemFrames>> | undefined;
        const gridData = this.configuration.tooltipIconGridData;
        const gridOwner = backdrop?.frame;
        if (gridData && gridOwner) {
            iconGridChild = this.renderChild(
                renderers?.iconGrid?.render,
                () =>
                    new Grid<TooltipIconDataItem, TooltipGridItemFrames>(
                        {
                            columns: 4,
                            data: gridData,
                            gapX: 0.005,
                            gapY: 0.005,
                            rows: 1,
                            renderItem: (gridParent, _row, _column, index, data) => {
                                const container = EmptyFrame.CreateType({
                                    context: this.context,
                                    inherits: "",
                                    name: `${name}IconContainer${index}`,
                                    owner: gridParent,
                                });
                                const containerFrame = container.frame;
                                if (!containerFrame) {
                                    return undefined;
                                }

                                const icon = ButtonFrame.Create({
                                    context: this.context,
                                    name: `${name}Icon${index}`,
                                    owner: containerFrame,
                                    overrides: { clickSoundPath: "", texture: data.texture },
                                });
                                const iconFrame = icon.containerFrame;
                                if (!iconFrame) {
                                    return undefined;
                                }
                                iconFrame.setSize(iconFrame.width * 0.4, iconFrame.height * 0.4);
                                iconFrame.clearPoints();
                                iconFrame.setPoint(FRAMEPOINT_LEFT, containerFrame, FRAMEPOINT_LEFT, 0, 0);

                                const valueText = TextFrame.CreateType({
                                    context: this.context,
                                    inherits: "",
                                    name: `${name}IconValue${index}`,
                                    owner: containerFrame,
                                    overrides: { initialText: data.value ?? "" },
                                });
                                const valueTextFrame = valueText.frame;
                                if (!valueTextFrame) {
                                    return undefined;
                                }
                                valueTextFrame.clearPoints();
                                valueTextFrame.setPoint(FRAMEPOINT_LEFT, iconFrame, FRAMEPOINT_RIGHT, this.configuration.tooltipIconValueLeftPadding ?? defaults.tooltipIconValueLeftPadding, 0);
                                valueTextFrame.setScale(0.8);
                                valueText.formatSize();

                                containerFrame.setSize(iconFrame.width + valueTextFrame.width + (this.configuration.tooltipIconContainerGapX ?? defaults.tooltipIconContainerGapX), iconFrame.height);
                                return { container: containerFrame, icon, valueText };
                            },
                            updateItem: (data, itemFrames) => {
                                itemFrames.icon.updateTexture(data.texture);
                                itemFrames.valueText.update(data.value ?? "");
                                itemFrames.container?.setSize(
                                    (itemFrames.icon.containerFrame?.width ?? 0) + (itemFrames.valueText.frame?.width ?? 0) + (this.configuration.tooltipIconContainerGapX ?? defaults.tooltipIconContainerGapX),
                                    itemFrames.icon.containerFrame?.height ?? 0,
                                );
                            },
                        },
                        `${name}IconGrid`,
                        this.context,
                        gridOwner,
                    ),
            );

            const iconGrid = iconGridChild.frame;
            if (iconGrid.containerFrame) {
                headerText.frame.clearPoints();
                headerText.frame.setPoint(FRAMEPOINT_BOTTOMLEFT, iconGrid.containerFrame, FRAMEPOINT_TOPLEFT, 0, 0.01);
                iconGrid.containerFrame.clearPoints();
                iconGrid.containerFrame.setPoint(FRAMEPOINT_BOTTOMLEFT, bodyText.frame, FRAMEPOINT_TOPLEFT, 0, 0.01);
            }
        }

        if (backdrop?.frame) {
            backdrop.frame.setPoint(FRAMEPOINT_TOPRIGHT, headerText.frame, FRAMEPOINT_TOPRIGHT, this.configuration.tooltipHeaderSpaceX ?? defaults.tooltipHeaderSpaceX, 0.01);
            backdrop.frame.setPoint(FRAMEPOINT_BOTTOMLEFT, bodyText.frame, FRAMEPOINT_BOTTOMLEFT, -bodySpaceX, -0.01);
            BlzFrameSetTooltip(parent.handle, backdrop.frame.handle);
        } else {
            BlzFrameSetTooltip(parent.handle, bodyText.frame.handle);
        }

        this.childFrames = { backdrop: backdropChild, bodyText: bodyChild, headerText: headerChild, iconGrid: iconGridChild };
    }

    public update(header: string, body: string, tooltipIconData?: TooltipIconDataItem[]): void {
        const headerText = this.childFrames?.headerText.frame;
        const bodyText = this.childFrames?.bodyText.frame;
        headerText?.frame?.setText(header);
        bodyText?.frame?.setText(body);
        const width = this.getFormattedWidth(header, body);
        headerText?.frame?.setSize(width, 0);
        bodyText?.frame?.setSize(width, 0);
        if (tooltipIconData) {
            this.childFrames?.iconGrid?.frame.updateGrid(tooltipIconData);
        }
    }

    private getFormattedWidth(header: string, body: string): number {
        const width = body === "" ? 0.04 + 0.004 * header.length : 0.02 + 0.004 * header.length + 0.004 * body.length;
        return Math.min(0.2, Math.max(0.05, width));
    }
}
