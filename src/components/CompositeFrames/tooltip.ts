import { Frame } from "w3ts";
import { CompositeFrame } from "../Core/CompositeFrame";
import { BackdropFrame } from "../MonoFrames/backdrop";
import { EmptyFrame } from "../MonoFrames/empty-frame";
import { IconFrame } from "../MonoFrames/icon";
import { TextFrame } from "../MonoFrames/text";
import { Grid, IGridItemBaseDefinition } from "../../grid";
import { ICompositeFrameChildFrames, ICompositeFrameConfigurationBase } from "../../models";

export interface TooltipIconDataItem {
    texture: string;
    value?: string;
}

export interface TooltipFrameConfiguration extends ICompositeFrameConfigurationBase {
    anchorPoint?: "bottom";
    backdropInherits?: string;
    bodyText?: string;
    headerText?: string;
    includeBackground?: boolean;
    reverseOrientation?: boolean;
    tooltipBodySpaceX?: number;
    tooltipIconContainerGapX?: number;
    tooltipIconGridData?: TooltipIconDataItem[];
    tooltipIconValueLeftPadding?: number;
    tooltipHeaderSpaceX?: number;
}

interface TooltipGridItemFrames extends IGridItemBaseDefinition {
    icon: IconFrame;
    valueText: TextFrame;
}

interface TooltipFrameChildFrames extends ICompositeFrameChildFrames {
    backdrop?: BackdropFrame;
    bodyText: TextFrame;
    headerText: TextFrame;
    iconGrid?: Grid<TooltipIconDataItem, TooltipGridItemFrames>;
}

export class TooltipFrame extends CompositeFrame<TooltipFrameConfiguration, TooltipFrameChildFrames> {
    private constructor(...args: ConstructorParameters<typeof CompositeFrame<TooltipFrameConfiguration, TooltipFrameChildFrames>>) {
        super(...args);
        this.render();
    }

    public static get DefaultConfiguration(): TooltipFrameConfiguration {
        return { backdropInherits: "QuestButtonBaseTemplate", bodyText: "", headerText: "", includeBackground: false, tooltipHeaderSpaceX: 0.01 };
    }

    public static Create(args: { context: number; name?: string; owner?: Frame; overrides?: TooltipFrameConfiguration }): TooltipFrame {
        return new TooltipFrame(args.context, { ...TooltipFrame.DefaultConfiguration, ...(args.overrides ?? {}) }, args.name, args.owner);
    }

    public static CreateNamed(args: { context: number; name: string; owner?: Frame; overrides?: TooltipFrameConfiguration }): TooltipFrame {
        return TooltipFrame.Create(args);
    }

    public static CreateTyped(args: { context: number; name?: string; owner?: Frame; overrides?: TooltipFrameConfiguration }): TooltipFrame {
        return TooltipFrame.Create(args);
    }

    protected render(): void {
        const name = this.name ?? "TooltipFrame";
        const parent = this.owner!;
        const backdrop = this.configuration.includeBackground
            ? BackdropFrame.CreateType({ context: this.context, inherits: this.configuration.backdropInherits ?? "QuestButtonBaseTemplate", name: `${name}Backdrop`, owner: parent })
            : undefined;
        const contentOwner = backdrop?.frame ?? parent;
        const headerText = TextFrame.CreateType({ context: this.context, inherits: "", name: `${name}Header`, owner: contentOwner });
        const bodyText = TextFrame.CreateType({ context: this.context, inherits: "", name: `${name}Body`, owner: contentOwner });
        this.containerFrame = backdrop?.frame;

        if (!headerText.frame || !bodyText.frame) {
            return;
        }

        backdrop?.frame?.clearPoints();
        headerText.frame.clearPoints();
        bodyText.frame.clearPoints();
        headerText.frame.setText(this.configuration.headerText ?? "");
        bodyText.frame.setText(this.configuration.bodyText ?? "");
        const width = this.getFormattedWidth(this.configuration.headerText ?? "", this.configuration.bodyText ?? "");
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
            headerText.frame.setPoint(FRAMEPOINT_TOPRIGHT, parent, FRAMEPOINT_BOTTOMLEFT, 0, -0.01);
            bodyText.frame.setPoint(FRAMEPOINT_TOPLEFT, headerText.frame, FRAMEPOINT_BOTTOMLEFT, 0, -0.01);
        }

        let iconGrid: Grid<TooltipIconDataItem, TooltipGridItemFrames> | undefined;
        if (this.configuration.tooltipIconGridData && backdrop?.frame) {
            iconGrid = new Grid<TooltipIconDataItem, TooltipGridItemFrames>(
                {
                    columns: 4,
                    data: this.configuration.tooltipIconGridData,
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

                        const icon = IconFrame.CreateType({
                            context: this.context,
                            inherits: "",
                            name: `${name}Icon${index}`,
                            owner: containerFrame,
                            overrides: { texture: data.texture },
                        });
                        const iconFrame = icon.frame;
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
                        valueTextFrame.setPoint(FRAMEPOINT_LEFT, iconFrame, FRAMEPOINT_RIGHT, this.configuration.tooltipIconValueLeftPadding ?? 0.005, 0);
                        valueTextFrame.setScale(0.8);
                        valueText.formatSize();

                        containerFrame.setSize(iconFrame.width + valueTextFrame.width + (this.configuration.tooltipIconContainerGapX ?? 0), iconFrame.height);
                        return { container: containerFrame, icon, valueText };
                    },
                    updateItem: (data, itemFrames) => {
                        itemFrames.icon.updateTexture(data.texture);
                        itemFrames.valueText.update(data.value ?? "");
                        itemFrames.container?.setSize(
                            (itemFrames.icon.frame?.width ?? 0) + (itemFrames.valueText.frame?.width ?? 0) + (this.configuration.tooltipIconContainerGapX ?? 0),
                            itemFrames.icon.frame?.height ?? 0,
                        );
                    },
                },
                `${name}IconGrid`,
                this.context,
                backdrop.frame,
            );

            if (iconGrid.containerFrame) {
                headerText.frame.clearPoints();
                headerText.frame.setPoint(FRAMEPOINT_BOTTOMLEFT, iconGrid.containerFrame, FRAMEPOINT_TOPLEFT, 0, 0.01);
                iconGrid.containerFrame.clearPoints();
                iconGrid.containerFrame.setPoint(FRAMEPOINT_BOTTOMLEFT, bodyText.frame, FRAMEPOINT_TOPLEFT, 0, 0.01);
            }
        }

        if (backdrop?.frame) {
            backdrop.frame.setPoint(FRAMEPOINT_TOPRIGHT, headerText.frame, FRAMEPOINT_TOPRIGHT, this.configuration.tooltipHeaderSpaceX ?? 0.01, 0.01);
            backdrop.frame.setPoint(FRAMEPOINT_BOTTOMLEFT, bodyText.frame, FRAMEPOINT_BOTTOMLEFT, -(this.configuration.tooltipBodySpaceX ?? 0.01), -0.01);
            BlzFrameSetTooltip(parent.handle, backdrop.frame.handle);
        } else {
            BlzFrameSetTooltip(parent.handle, bodyText.frame.handle);
        }

        this.childFrames = { backdrop, bodyText, headerText, iconGrid };
    }

    public update(header: string, body: string, tooltipIconData?: TooltipIconDataItem[]): void {
        const headerText = this.childFrames?.headerText;
        const bodyText = this.childFrames?.bodyText;
        headerText?.frame?.setText(header);
        bodyText?.frame?.setText(body);
        const width = this.getFormattedWidth(header, body);
        headerText?.frame?.setSize(width, 0);
        bodyText?.frame?.setSize(width, 0);
        if (tooltipIconData) {
            this.childFrames?.iconGrid?.updateGrid(tooltipIconData);
        }
    }

    private getFormattedWidth(header: string, body: string): number {
        const width = body === "" ? 0.04 + 0.004 * header.length : 0.02 + 0.004 * header.length + 0.004 * body.length;
        return Math.min(0.2, Math.max(0.05, width));
    }
}
