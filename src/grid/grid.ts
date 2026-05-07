import { Frame } from "w3ts";
import { FrameUtils } from "../frame-utils";

/**
 * Defines what frames exist in each item on the grid.
 * Then your update function will pass you back an object of this shape, allowing you use the correct frame functions on the appropraite frames.
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
    private itemFrames: (Z | undefined)[] = [];

    constructor(config: GridConfig<T, Z>, name: string, context: number, owner?: Frame) {
        this.config = config;
        this.name = name;
        this.owner = owner || FrameUtils.OriginFrameGameUI;
        this.context = context;

        this.render();
    }

    /**
     * Grid container size is automatically handled so long as each item container is a consistent size.
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

        if (this.config?.data?.length === 0) {
            print("No data during grid render, unable to create grid items. Container created only.");
            return;
        }

        //Arbitrary initial size.
        this.containerFrame.setSize(0.01, 0.01);

        this.renderItems(0, 0);

        //Proper sizeing
        this.resizeGridContainer();

        print("Total item frames created: " + this.itemFrames?.length);
    }

    /**
     * Should just render based on the data available?
     * @returns
     */
    private renderItems(startingRow: number, startingColumn: number) {
        if (!this.containerFrame) {
            print("Cannot render items, no container frame.");
            return;
        }

        let dataIndex = 0;

        print(`Starting row: ${startingRow}; Starting Col: ${startingColumn}`);

        const startingItemIndex = this.config.columns * startingRow + startingColumn;
        const previousItemIndex = startingItemIndex - 1;
        let previousFrame: Frame | undefined = undefined;
        let firstColumnFrame: Frame | undefined = undefined;
        let firstColumnFIndex = 0;

        // Determine first column frame now.
        if (startingColumn !== 0) {
            firstColumnFIndex = startingItemIndex - startingColumn;
        } else {
            firstColumnFIndex = startingItemIndex - this.config.columns;
        }

        // Leave undefined if this will be our first frame
        if (this.itemFrames.length !== 0) {
            previousFrame = this.itemFrames[previousItemIndex]?.container;
            firstColumnFrame = this.itemFrames[firstColumnFIndex]?.container;
        }

        if (this.itemFrames.length !== 0 && startingRow === 0 && startingColumn === 0) {
            print("Grid already has item frames but startingRow and startingColumn were not both 0. This should not happen.");
            return;
        }

        // Could optionally update rows if there is more data than the current rows accomodates. This allows rendering more items dynamically but also makes the grid container have a greater height, so the new size would need to be handled.
        for (let row = startingRow; row < this.config.rows; row++) {
            for (let col = startingColumn; col < this.config.columns; col++) {
                let itemData = undefined;

                //The data exists on the config and we can access that data at the index
                if (this.config?.data && this.config.data.length >= dataIndex + 1) {
                    itemData = this.config.data[dataIndex];
                }

                if (!itemData) {
                    print("Stopped rendering items: No data for item to be rendered.");
                    return;
                }

                let newItemFrames = this.config.renderItem(this.containerFrame, row, col, dataIndex, itemData);

                if (!itemData) {
                    newItemFrames?.container?.setVisible(false);
                }

                if (newItemFrames === undefined) {
                    print("Stopped rendering items for grid due to failed item frame render.");
                    break; // break instead of return so the grid still get's resized
                }

                this.itemFrames?.push(newItemFrames);

                dataIndex++;

                if (!newItemFrames || !newItemFrames.container) {
                    print(`Unable to render frame for grid (${this.name}),  item at ` + `row ${row}, col ${col}.`);
                    continue;
                }

                newItemFrames.container.clearPoints();

                //First item created get's attached to grid container. The rest are attached to eachother.
                if (!previousFrame && row === 0 && col === 0) {
                    newItemFrames?.container.clearPoints();
                    newItemFrames?.container.setPoint(FRAMEPOINT_TOPLEFT, this.containerFrame, FRAMEPOINT_TOPLEFT, 0, 0);
                    firstColumnFrame = newItemFrames.container;
                } else if (previousFrame && col !== 0) {
                    newItemFrames.container.setPoint(FRAMEPOINT_LEFT, previousFrame, FRAMEPOINT_RIGHT, this.config.gapX || DEFAULT_GAP_X, 0);
                } else if (col === 0) {
                    if (firstColumnFrame === undefined) {
                        print("Error, unable to attach next row's first column to previous row's first column. First column frame not found for grid.");
                        return;
                    }

                    //negative y gap here so it moves further down from the previous row
                    newItemFrames.container.setPoint(FRAMEPOINT_TOP, firstColumnFrame, FRAMEPOINT_BOTTOM, 0, -(this.config.gapY || DEFAULT_GAP_Y));
                    firstColumnFrame = newItemFrames.container;
                }

                previousFrame = newItemFrames.container;
            }
        }
    }

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
            print(`Called update grid for ` + this.name + " but no item frames found for grid!");

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
         * Add new item frames if necessary.
         *
         * This could actually be the first frame we are rendering for the grid.
         */
        if (data.length > this.itemFrames.length) {
            let startingIndex = this.itemFrames.length;

            // Pick up from the last item
            const row = Math.floor(startingIndex / this.config.columns);
            const col = startingIndex % this.config.columns;

            this.renderItems(row, col);
        }

        //Using data that matches the item frame index
        this.itemFrames?.forEach((itemDef, index) => {
            if (!itemDef || !itemDef.container) {
                return;
            }

            let data = undefined;

            //The data exists on the config and we can access that data at the index
            if (this.config?.data && this.config.data.length >= index + 1) {
                data = this.config.data[index];
            }

            if (!data) {
                itemDef.container.setVisible(false);
                return;
            } else {
                itemDef.container.setVisible(true);
            }

            if (this.config.updateItem) {
                this.config.updateItem(data, itemDef, index);
            }
        });

        //Resizing here screws with the positioning of the grid, making it change position
        this.resizeGridContainer();
    }

    /**
     * Warning, this may change the position if the grid's container frame never used setPoint to attach it to another frame.
     *
     * @todo, the grid should resize to the number of visible rows? so it would be based on the rows which can be rendered with teh current data in this.config.data
     * and perhaps we could make it optional to auto size after updates.
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
    renderItem: (parent: Frame, row: number, column: number, index: number, data: T) => Z | undefined;
    /**
     * A function that will determine how to update the existing frames.
     * @param data
     * @param itemFrames
     * @param index
     * @returns
     */
    updateItem?: (data: T, itemFrames: Z, index: number) => void;
    itemCount?: number;
    /**
     * Frames rendered without data are hidden by default.
     *
     * No point allowing undefined here...
     */
    data: T[];
}
