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
 * @tests Test that you can give a grid no data initially, then update it and have it be created like normal.
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

    /**
     * Reference to frames created in each item.
     */
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
        //shouldnt do if this is called from update grid
        this.containerFrame = Frame.createType(this.name, this.owner, this.context, "FRAME", "");
        this.containerFrame?.setEnabled(false);

        if (!this.containerFrame) {
            print("Grid container unable to be created! Context: " + this.context);
            return;
        }

        if (this.config.gapX === undefined) {
            this.config.gapX = DEFAULT_GAP_X;
        }

        if (this.config.gapY === undefined) {
            this.config.gapY = DEFAULT_GAP_Y;
        }

        this.containerFrame.clearPoints();
        this.containerFrame.setPoint(FRAMEPOINT_TOPLEFT, this.owner, FRAMEPOINT_TOPLEFT, this.config.gapX, -this.config.gapY);

        let firstItemData = undefined;

        //The data exists on the config and we can access that data at the index
        if (this.config?.data && this.config.data.length >= 1) {
            firstItemData = this.config.data[0];
        }

        const firstItemFrames = this.config.renderItem(this.containerFrame, 0, 0, 0, firstItemData);
        if (!firstItemData) {
            firstItemFrames?.container?.setVisible(false);
        }

        this.itemFrames?.push(firstItemFrames);

        if (!firstItemFrames?.container) {
            print("Failed to create grid since first frame did not get created! " + this.name);
            return;
        }

        let firstColumnFrame: Frame = firstItemFrames?.container;

        /**
         * If we never have the first frame, then we don't know what the size of the grid will be, even if we have rows and columns.
         *
         * Therefore, if we are updating the grid with some data and it's our first render, then we need to set container size.
         */
        this.containerFrame.setSize((firstItemFrames?.container.width + this.config.gapX) * this.config.columns, (firstItemFrames?.container.height + this.config.gapY) * this.config.rows);

        let previousFrame: Frame = firstItemFrames?.container;
        firstItemFrames?.container.clearPoints();
        firstItemFrames?.container.setPoint(FRAMEPOINT_TOPLEFT, this.containerFrame, FRAMEPOINT_TOPLEFT, 0, 0);

        let dataIndex = 1;

        //Whenever the col is 0, we need to attach to the bottom of the previous first column frame, otherwise pin to the rigth of the previous frame
        for (let row = 0; row < this.config.rows; row++) {
            //skip to the 2nd column if were on the first row since we already have created the first frame in the grid
            for (let col = row === 0 ? 1 : 0; col < this.config.columns; col++) {
                let itemData = undefined;

                //The data exists on the config and we can access that data at the index
                if (this.config?.data && this.config.data.length >= dataIndex + 1) {
                    itemData = this.config.data[dataIndex];
                }

                const itemFrames = this.config.renderItem(this.containerFrame, row, col, dataIndex, itemData);

                if (!itemData) {
                    itemFrames?.container?.setVisible(false);
                }

                this.itemFrames?.push(itemFrames);

                const frame = itemFrames?.container;

                dataIndex++;

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

        print("Total item frames created: " + this.itemFrames?.length);
    }

    /**
     * Calls the updateItems function defined in the GridConfig..
     *
     * Render item is called when you there is more data than when then grid was initially created.
     * Then update item will be called upon all items, including the newly created ones.
     *
     * This behavior can be disabled optionally in the configuration.
     *
     * @todo if we are updating the grid with more elements than we had when we initially created the grid, then we should call render item function and add the new item to our managed item frames.
     *
     * updates rows value in config if additional rows are needed to render additional items.
     */
    public updateGrid(data: T[]) {
        //update the grid data.
        this.config.data = data;

        if (!this.config.updateItem) {
            print(`Called update grid for ` + this.name + " but no updateItem function was found");
            return;
        }

        //Should never happen.
        if (!this.containerFrame) {
            print(`|cffff0000Critical Error updating grid ${this.name}. Grid container frame missing.`);
            return;
        }

        if ((this.itemFrames === undefined || this.itemFrames.length === 0) && data.length > 0) {
            // print(`Called update grid for ` + this.name + " but no item frames found for grid!");

            // Essentially just doing the first render since there was never any data to begin with.
            print("called render from updateGrid since no items existed!");
            this.render();
            return;
        }

        //Should never happen.
        if (this.itemFrames === undefined || this.itemFrames.length === 0) {
            print(`|cffff0000Critical Error updating grid ${this.name}. Items frames never created.`);
            return;
        }

        

        /**
         * We need to create some additional frames.
         *
         * @bug positioninig frames incorrectly
         */
        if (data.length > this.itemFrames.length) {
            print("Adding additional frames to the grid.");
            //The length would be the starting index, since that index doesn't exist yet.
            // (ex: length is 3, pre-update final item index was 2. therefore we add an item to index 3,4,5 ... etc)
            let startingIndex = this.itemFrames.length;
            print("Update Starting index: " + startingIndex);
            let currentIndex = 0;

            let firstColumnItemFrames = this.itemFrames[0];
            let previousItemFrame = this.itemFrames[0];

            const newRowsLimit = Math.ceil(data.length / this.config.columns);

            if (newRowsLimit !== this.config.rows) {
                print(`New rows added! New: ${newRowsLimit}, Old: ${this.config.rows}`);
            }

            this.config.rows = newRowsLimit;
            // this.resizeGridContainer();

            /***
             * Well, we are picking up from where there does not exist frames yet.
             */
            for (let row = 0; row < newRowsLimit; row++) {
                for (let col = 0; col < this.config.columns; col++) {
                    // previousItemFrame?.container?.setVisible(true);

                    if (currentIndex >= startingIndex) {
                        const item = this.config.renderItem(this.containerFrame, row, col, currentIndex, data[currentIndex]);

                        //Save new frame
                        this.itemFrames.push(item);

                        // Shouldnt happen
                        if (!previousItemFrame?.container || !firstColumnItemFrames?.container || !item?.container) {
                            continue;
                        }

                        //Position new frame
                        if (previousItemFrame && col !== 0) {
                            item?.container.setPoint(FRAMEPOINT_LEFT, previousItemFrame.container, FRAMEPOINT_RIGHT, this.config.gapX || DEFAULT_GAP_X, 0);
                        } else if (col === 0) {
                            //negative y gap here so it moves further down from the previous row
                            item?.container.setPoint(FRAMEPOINT_TOP, firstColumnItemFrames?.container, FRAMEPOINT_BOTTOM, 0, -(this.config.gapY || DEFAULT_GAP_Y));
                            firstColumnItemFrames = item;
                        }

                        previousItemFrame = item;
                    } else {
                        previousItemFrame = this.itemFrames[currentIndex];
                        if (col === 0) {
                            firstColumnItemFrames = this.itemFrames[currentIndex];
                        }
                    }

                    //End
                    currentIndex++;
                }
            }
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

                // print(`Called update for item ${index} with data ${data}`);

                /**
                 * The function is still called even though data is undefined in case the user needs to do something with it like conditionally displaying some icon there only when data is undefined.
                 * */
                this.config.updateItem(data, item, index);
            }
        });

        //Resizing here screws with the positioning of the grid, making it change position
        this.resizeGridContainer();
    }

    /**
     * Warning, this may change the position if the grid's container frame never used setPoint to attach it to another frame.
     */
    public resizeGridContainer() {
        if (!this.containerFrame) {
            return;
        }

        if (!this.itemFrames || this.itemFrames.length === 0) {
            return;
        }

        const firstItemFrames = this.itemFrames[0];

        if (!firstItemFrames || !firstItemFrames?.container) {
            return;
        }

        this.containerFrame.setSize((firstItemFrames.container.width + (this.config.gapX || DEFAULT_GAP_X)) * this.config.columns, (firstItemFrames.container.height + (this.config.gapY || DEFAULT_GAP_Y)) * this.config.rows);
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
     * @param parent This should be the owner of the item's container frame.
     * @param row
     * @param column
     * @param index
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
