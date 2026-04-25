import { Frame } from "w3ts";
import { FrameUtils } from "../frame-utils";
import { Inheritables } from "../names";

/**
 * Defines what frames exist in each item on the grid.
 * Then your update function will pass you back an object of this shape, allowing you use the correct frame functions on the appropraite frames.
 */
export interface GridItemBaseDefinition {
    container?: Frame;
}

/**
 * @type T - The data shape associated with each item. This same data shape will be passed to update functions
 * @type Z - An object which contains all the child frames in the item.
 */
export class Grid<T, Z extends GridItemBaseDefinition> {
    config: GridConfig<T, Z>;
    name: string;
    owner: Frame;
    /**
     * The container of the grid items
     */
    containerFrame?: Frame;

    //access by index
    private itemFrames?: (Z | undefined)[] = [];

    constructor(config: GridConfig<T, Z>) {
        this.config = config;
        this.name = config.containerName;
        this.owner = config.containerOwner;
        this.render();
    }

    /**
     * Grid container size is automatically handled so long as each elemnent is a consistent size.
     * @param config
     * @returns
     */
    private render() {
        const container = Frame.createType(this.config.containerName, this.config.containerOwner ?? FrameUtils.OriginFrameGameUI, this.config.context, "FRAME", Inheritables.EmptyFrame); //Inheritables.Frames.EmptyFrame.RefName, ...FrameType

        if (!container) {
            print("Grid container unable to be created! Context: " + this.config.context);
            return;
        }

        container.clearPoints();
        container.setPoint(FRAMEPOINT_TOPLEFT, this.config.containerOwner, FRAMEPOINT_TOPLEFT, this.config.gapX, -this.config.gapY);

        let firstItemData = undefined;

        //The data exists on the config and we can access that data at the index
        if (this.config?.data && this.config.data.length >= 0 + 1) {
            firstItemData = this.config.data[0];
        }

        const firstItemFrames = this.config.renderItem(container, 0, 0, 0, firstItemData); //just use container so most of hte logic is the same
        if (!firstItemData) {
            firstItemFrames?.container?.setVisible(false);
        }

        this.itemFrames?.push(firstItemFrames);

        let firstColumnFrame = firstItemFrames?.container; //just use container so most of hte logic is the same

        if (!firstColumnFrame) {
            print("Failed to create grid since first frame did not get created! " + this.name);
            return;
        }

        container.setSize((firstColumnFrame.width + this.config.gapX) * this.config.columns, (firstColumnFrame.height + this.config.gapY) * this.config.rows);

        let previousFrame: Frame = firstColumnFrame;
        firstColumnFrame.clearPoints();
        firstColumnFrame.setPoint(FRAMEPOINT_TOPLEFT, container, FRAMEPOINT_TOPLEFT, 0, 0);

        let index = 1;

        //Whenevr the col is 0, we need to attach to the bottom of the previous first column frame, otherwise pin to the rigth of the previous frame
        for (let row = 0; row < this.config.rows; row++) {
            //skip to the 2nd column if were on the first row since we already have created the first frame in the grid
            for (let col = row === 0 ? 1 : 0; col < this.config.columns; col++) {
                let itemData = undefined;

                //The data exists on the config and we can access that data at the index
                if (this.config?.data && this.config.data.length >= index + 1) {
                    itemData = this.config.data[index];
                }

                const itemFrames = this.config.renderItem(container, row, col, index, itemData);

                if (!itemData) {
                    itemFrames?.container?.setVisible(false);
                }

                this.itemFrames?.push(itemFrames);

                const frame = itemFrames?.container;

                index++;

                if (!frame) {
                    print(`Unable to render frame for grid (${this.name}),  item at ` + `row ${row}, col ${col}.`);
                    continue;
                }

                frame.clearPoints();

                if (previousFrame && col !== 0) {
                    frame.setPoint(FRAMEPOINT_LEFT, previousFrame, FRAMEPOINT_RIGHT, this.config.gapX, 0);
                } else if (col === 0) {
                    //negative y gap here so it moves further down from the previous row
                    frame.setPoint(FRAMEPOINT_TOP, firstColumnFrame, FRAMEPOINT_BOTTOM, 0, -this.config.gapY);
                    firstColumnFrame = frame;
                }

                previousFrame = frame;
            }
        }

        this.containerFrame = container;

        return container;
    }

    /**
     * Calls the updateItems function defined in the GridConfig
     */
    public updateGrid(data: T[]) {
        //update the grid data.
        this.config.data = data;

        if (!this.config.updateItem) {
            print(`Called update grid for ` + this.name + " but no updateItem function was found");
            return;
        }

        if (this.itemFrames === undefined || this.itemFrames.length === 0) {
            print(`Called update grid for ` + this.name + " but no item frames found for grid!");
            return;
        }

        //Using data that matches the item frame index
        this.itemFrames?.forEach((itemDef, index) => {
            let data = undefined;
            let item = undefined;

            //The data exists on the config and we can access that data at the index
            if (this.config?.data && this.config.data.length >= index + 1) {
                data = this.config.data[index];
            }

            if (this.itemFrames && this.itemFrames.length >= index + 1) {
                item = this.itemFrames[index];
            }

            if (this.config.updateItem) {
                /**
                 * Set visibility back to true for the item that now has data if we update with more data than we had when the grid was first created.
                 */
                if (data !== undefined) {
                    item?.container?.setVisible(true);
                } else {
                    item?.container?.setVisible(false);
                }

                this.config.updateItem(data, item, index);
            }
        });
    }

    /**
     * We are not certain all frames will be destroyed as well as all their children.
     * There we must be safe and say we can only destroy the container frame.
     * Grid children should be destroyed outside
     *
     *
     * Another thing is , I could be destroying the frames, but what about the Class instances I created?
     * I need to make sure those are destroyed as well.
     *
     * @desyncs Will desync the game.
     *
     */
    // public destroy() {
    //     this.destroyChildren(this.containerFrame);
    //     // print(this.name + " BEFORE children: " + container.childrenCount);

    //     // //every renderItem could
    //     // try {
    //     //     this.destroy();
    //     // } catch (e) {
    //     //     print("Error destroying frames: " + e);
    //     // }
    //     // print(this.name + " AFTER children: " + container?.childrenCount);
    // }

    // private destroyChildren(frame?: Frame) {
    //     if (frame === undefined) {
    //         return;
    //     }

    //     const count = frame.childrenCount;

    //     for (let x = 0; x < count; x++) {
    //         const child = frame.children[x];
    //         if (child !== undefined) {
    //             this.destroyChildren(child);
    //         }
    //     }

    //     frame.destroy();
    // }
}

export interface GridConfig<T, Z extends GridItemBaseDefinition> {
    context: number;
    containerOwner: Frame;
    containerName: string;
    rows: number;
    columns: number;
    /**
     * Recommended default: 0.005
     */
    gapX: number;
    /**
     * Recommended default: 0.005
     */
    gapY: number;
    /**
     * The direction which items are rendered from.
     * Default "forward"
     */
    rowDirection?: "forward" | "reverse";
    //put your function in here to render whatever elements you want. The grid will handle the placing them into rows, etc. The container should be the parent of the rendered frame
    /**
     *
     * @param parent
     * @param row
     * @param column
     * @param index Optional if you want to access an outside data source by the item index instead of row or column
     */
    renderItem: (parent: Frame, row: number, column: number, index: number, data?: T) => Z | undefined;
    /**
     * A function that will determine how to update the existing frames.
     * @param data
     * @param itemFrames
     * @param index
     * @returns
     */
    updateItem?: (data?: T, itemFrames?: Z, index?: number) => void;
    itemCount?: number;
    /**
     * Frames rendered without data will be hidden.
     */
    data?: T[];
}

// export type GridRenderItemFn = (parent: Frame, row: number, column: number, index: number) => Z | undefined;
