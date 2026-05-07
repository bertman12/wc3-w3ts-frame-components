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

        let dataIndex = 0;
        let previousFrame: Frame | undefined = undefined;
        let firstColumnFrame: Frame | undefined = undefined;

        for (let row = 0; row < this.config.rows; row++) {
            for (let col = 0; col < this.config.columns; col++) {
                let itemData = undefined;

                //The data exists on the config and we can access that data at the index
                if (this.config?.data && this.config.data.length >= dataIndex + 1) {
                    itemData = this.config.data[dataIndex];
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
                    newItemFrames.container.setPoint(FRAMEPOINT_LEFT, previousFrame, FRAMEPOINT_RIGHT, this.config.gapX, 0);
                } else if (col === 0) {
                    if (firstColumnFrame === undefined) {
                        print("Error, unable to attach next row's first column to previous row's first column. First column frame not found for grid.");
                        return;
                    }

                    //negative y gap here so it moves further down from the previous row
                    newItemFrames.container.setPoint(FRAMEPOINT_TOP, firstColumnFrame, FRAMEPOINT_BOTTOM, 0, -this.config.gapY);
                    firstColumnFrame = newItemFrames.container;
                }

                previousFrame = newItemFrames.container;
            }
        }

        //Proper sizeing
        this.resizeGridContainer();

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
     *
     * @todo grid should retain initial size preset by the rows and columns. new data should not add on to the rows of the grid.
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
         * When creating the items initially, we should stop rendering items if one of them returns undefined or the container frame is undefined.
         *
         * When updating, i think it matters less since we are guaranteed to have the container frame.
         *
         * If you continued rendering items after coming across an udnefined return object, then the item you see on the grid does not match up with the data index it's associated with.
         * It would be off by the number of times undefined was returned before that item had been rendered.
         *
         * Aside from that, we would also need to update our logic to skip setting the the previous frame, since there actually is none now.
         * Or, you extend attempt to create an empty frame in place of the undefeined response we got,
         * however, that is not guaranteed to match the shape of the item frames the player has and also the empty frame may not be the same typ eof frame that would normally be rendered as the item the user has chosen
         *
         * Therefore, we should prevent further rendering if we initially come across undefined before reaching the end of the data array.
         *
         * We should follow the same rule for updating items when we need to add new items if we haven't reached the max number of items determined by the row and column values.
         */

        /**
         * We need to create some additional frames.
         *
         * If an item frame returned undefined, it could mean that something went wrong during intial calls for renderItem, or the user intentionally returned undefined.
         * In either case, we would want to attempt to re-render those frames again.
         *
         * @bug positioninig frames incorrectly
         */
        // could be the same length actually
        if (data.length > this.itemFrames.length || this.itemFrames.includes(undefined) || this.itemFrames.find((f) => f?.container === undefined) !== undefined) {
            print("Replacing undefined items and add new frames.");

            /**
             * Conditions to check for
             *
             * itemFrames: [value, value, value, undefined, undefined, value, value, undefined]
             *
             * action:     [skip, skip, skip, replace, replace, skip, skip, replace, add ...]
             *
             */
            //the starting index should actually be where we encounter the first undefined value in item frames.
            const firstUnrenderedItemIndex = this.itemFrames.findIndex((value) => value === undefined || value.container === undefined);

            // it is not finding any undefined items which is weird. nevermind, it is fidning them
            print("/**** ITEMS *****/");
            this.itemFrames.forEach((item, index) => {
                print(`index: ${index}; item value:${item}; container value: ${item?.container}`);
            });
            print("/**** ***** *****/");

            //since its also possible that these undefined values could be between defined values, we'll want to make sure that we check that if the item frames at this index are not undefined, then we continue;

            //The length would be the starting index, since that index doesn't exist yet.
            // (ex: length is 3, pre-update final item index was 2. therefore we add an item to index 3,4,5 ... etc)
            // let startingIndex = this.itemFrames.length;
            let startingIndex = firstUnrenderedItemIndex === -1 ? this.itemFrames.length : firstUnrenderedItemIndex;

            print("Starting index: " + startingIndex);
            let currentIndex = 0;

            let firstColumnItemFrames = this.itemFrames[0];
            let previousItemFrame = this.itemFrames[0];

            const newRowsLimit = Math.ceil(data.length / this.config.columns);

            if (newRowsLimit !== this.config.rows) {
                print(`New rows added! New: ${newRowsLimit}, Old: ${this.config.rows}`);
            }

            this.config.rows = newRowsLimit;
            // this.resizeGridContainer();

            /**
             * You should be able to determine what row and column an index would go onto right?
             */
            // what would the row be?
            {
                const dIndex = 0;
                // rows start at 0
                const row = Math.floor(data.length / this.config.rows);

                //if cols is 4
                //0, 1, 2, 3
                //0, 1, 2, 3
                const col = dIndex % this.config.columns;

                //4, 5, 6, 7
                //0, 1, 2, 3

                //etc.
            }

            /***
             * Well, we are picking up from where there does not exist frames yet.
             */
            for (let row = 0; row < this.config.rows; row++) {
                for (let col = 0; col < this.config.columns; col++) {
                    // previousItemFrame?.container?.setVisible(true);

                    //current index before starting index guarantees those are existing item frames and dont need to be replaced and shouldnt trigger adding more frames at their index.
                    if (currentIndex >= startingIndex) {
                        // do we really need to know the starting index was before the item farmes lenght? if there exists an item frame at the current index, then we only care if it needs to be replaced.
                        // if (startingIndex < this.itemFrames.length && (this.itemFrames[currentIndex] !== undefined || this.itemFrames[currentIndex]?.container !== undefined)) {
                        if (currentIndex < this.itemFrames.length && (this.itemFrames[currentIndex] !== undefined || this.itemFrames[currentIndex]?.container !== undefined)) {
                            // We started at an earlier index which had undefined for the item frames at that position and now we have come across a defined item frames object.
                            // if the required container frame is also not undefined, then we may continue
                            // therefore, that means we do not need to call renderItem again.
                            // print("item frames confirmed to be spare array, separated by undefined values within it.");
                            previousItemFrame = this.itemFrames[currentIndex];

                            if (col === 0) {
                                firstColumnItemFrames = this.itemFrames[currentIndex];
                            }
                            print("skipping already defined item at index: " + currentIndex);
                            continue;
                        }

                        const item = this.config.renderItem(this.containerFrame, row, col, currentIndex, data[currentIndex]);
                        //allow chaning of points.
                        item?.container?.clearPoints();

                        //Save new frame
                        // replace the undefined value from before
                        // prevent out of bounds access
                        if (currentIndex < this.itemFrames.length && (this.itemFrames[currentIndex] === undefined || this.itemFrames[currentIndex]?.container === undefined)) {
                            this.itemFrames[currentIndex] = item;
                            print("replaced undefined item frame at index: " + currentIndex);
                        } else {
                            // Add to the end if no frames needs to be replaced.
                            this.itemFrames.push(item);
                            print(`Added new item ${currentIndex}`);
                        }

                        // Shouldnt happen
                        if (!previousItemFrame?.container || !firstColumnItemFrames?.container || !item?.container) {
                            print("======");
                            print("missing container while adding item frames at index: " + currentIndex);
                            print("previousFrame.container: " + previousItemFrame?.container);
                            print("firstColumnFrame.container: " + firstColumnItemFrames?.container);
                            print("item.container: " + item?.container);
                            print("======");
                            continue;
                        }

                        //Position new frame
                        if (previousItemFrame && col !== 0) {
                            item?.container.setPoint(FRAMEPOINT_LEFT, previousItemFrame.container, FRAMEPOINT_RIGHT, this.config.gapX || DEFAULT_GAP_X, 0);
                            // print(`previous container width: ${previousItemFrame.container.width}`);
                            // print(`positioned ${previousItemFrame.container}`);
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
