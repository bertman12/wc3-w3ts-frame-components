import { Frame } from "w3ts";
import { FrameUtils } from "../frame-utils";

/**
 * Defines what frames exist in each item on the grid.
 * Then your update function will pass you back an object of this shape, allowing you use the correct frame functions on the appropraite frames.
 *
 * @todo need to make it so we can have no data initially and then have the update function have more data items.
 *
 * If it's the case that there are more data items after an update, then new frames should be created.
 *
 *
 * @rename StaticGrid - since it does not dynamically resize if you change grid or columns value.
 *
 * We need a re-ordering of itemsif the rows or columns need to be changed.
 * of course, you could always not include data items, which results in less rows, but not columns.
 *
 *
 */
export interface GridItemBaseDefinition {
    /**
     * In most cases, this should be one of the frames you created inside the renderItem function.
     *
     * The container may have siblings frames.
     *
     * It's primary purpose is to serve as the frame to use for positioning the grid item contents next to other grid items.
     *
     * If there are multiple frames within a grid item, then it's best to use an empty frame with a size that contains the frames.
     */
    container?: Frame;
}
const DEFAULT_GAP_X = 0.005;
const DEFAULT_GAP_Y = 0.005;

/**
 *
 *
 *
 *
 * @aboutGridData When there is not data for an item or it is undefined, that item's frame is hidden.
 *
 *
 *
 * @type T - The data shape associated with each item. This same data shape will be passed to update functions
 * @type Z - An object which contains all the child frames in the item.
 */
export class Grid<T, Z extends GridItemBaseDefinition> {
    public config: GridConfig<T, Z>;
    public name: string;
    public owner: Frame;
    public context: number;
    /**
     * The container of the grid items
     */
    public containerFrame?: Frame;

    private itemFrames?: (Z | undefined)[] = [];

    constructor(config: GridConfig<T, Z>, name: string, context: number, owner?: Frame) {
        this.config = config;
        this.name = name;
        this.owner = owner || FrameUtils.OriginFrameGameUI;
        this.context = context;

        this.render();
    }

    /**
     * Grid container size is automatically handled so long as each elemnent is a consistent size.
     * @param config
     * @returns
     */
    private render() {
        const container = Frame.createType(this.name, this.owner, this.context, "FRAME", "");
        container?.setEnabled(false);
        this.containerFrame = container;

        if (!container) {
            print("Grid container unable to be created! Context: " + this.context);
            return;
        }

        if (this.config.gapX === undefined) {
            this.config.gapX = DEFAULT_GAP_X;
        }

        if (this.config.gapY === undefined) {
            this.config.gapY = DEFAULT_GAP_Y;
        }

        container.clearPoints();
        container.setPoint(FRAMEPOINT_TOPLEFT, this.owner, FRAMEPOINT_TOPLEFT, this.config.gapX, -this.config.gapY);

        let firstItemData = undefined;

        //The data exists on the config and we can access that data at the index
        if (this.config?.data && this.config.data.length >= 1) {
            firstItemData = this.config.data[0];
        }

        const firstItemFrames = this.config.renderItem(container, 0, 0, 0, firstItemData);
        if (!firstItemData) {
            firstItemFrames?.container?.setVisible(false);
        }

        this.itemFrames?.push(firstItemFrames);

        let firstColumnFrame = firstItemFrames?.container;

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

        // return container;
    }

    /**
     * Calls the updateItems function defined in the GridConfig
     *
     * @todo if we are updating the grid with more elements than we had when we initially created the grid, then we should call render item function and add the new item to our managed item frames.
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

            /**
             * dont return here actually.
             *
             * we need to create the frames from scratch
             */

            data.forEach((dItem, index) => {
                if (this.containerFrame) {
                    //use column and row logic from above.
                    this.config.renderItem(this.containerFrame, index, 0, 0, dItem);
                }
            });

            return;
        }

        /**
         * We need to create frames.
         */
        if (data.length > this.itemFrames.length) {
            data.forEach((dItem, index) => {
                //pickup where there are new frames.
                if (this.containerFrame && index > data.length - 1) {
                    //use column and row logic from above.
                    this.config.renderItem(this.containerFrame, index, 0, 0, dItem);
                }
            });
        }

        //Whenevr the col is 0, we need to attach to the bottom of the previous first column frame, otherwise pin to the rigth of the previous frame
        // for (let row = 0; row < this.config.rows; row++) {
        //     //skip to the 2nd column if were on the first row since we already have created the first frame in the grid
        //     for (let col = row === 0 ? 1 : 0; col < this.config.columns; col++) {
        //         let itemData = undefined;

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

                /**
                 * The function is still called even though data is undefined in case the user needs to do something with it like conditionally displaying some icon there only when data is undefined.
                 * */
                this.config.updateItem(data, item, index);
            }
        });

        /**
         * Might need to re-run the update function?
         *
         * Or ,we should actually just add the new frames  before iteration
         */
    }
}

export interface GridConfig<T, Z extends GridItemBaseDefinition> {
    rows: number;
    columns: number;
    /**
     * Determines the horizontal spacing between items in the grid
     *
     * Recommended default: 0.005
     */
    gapX?: number;
    /**
     * Determines the vertical spacing between items in the grid
     *
     * Recommended default: 0.005
     */
    gapY?: number;
    /**
     * The direction which items are rendered from.
     * Default "forward"
     */
    rowDirection?: "forward" | "reverse";
    /**
     * Put your function in here to render whatever elements you want. The grid will handle the placing them into rows, etc. The container should be the parent of the rendered frame
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
     * Frames rendered without data are hidden by default.
     */
    data?: T[];
}
