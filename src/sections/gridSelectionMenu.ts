import { addLog, LogLevel } from "src/shared/logging";
import { Frame, MapPlayer, Timer, Trigger } from "w3ts";
import { Players } from "w3ts/globals";
import { isPlayingUser } from "warcraft-3-w3ts-utils";
import { Components } from "../frame-components";
import { FrameUtils } from "../frame-utils";
import { Grid, GridConfig, GridItemBaseDefinition } from "../grid/grid";
import { Panel } from "../panels/panel";
import { Text } from "../text/text";

interface GridSelectionMenuConfig<T extends GridSelectionMenuData> {
    /**
     * Determines how many choices the player can make from the menu.
     * Default: 1
     */
    maxChoices: number;
    /**
     * For turning on features based no if the frame is shared.
     *
     * For headquarter selectionm menu, we don't need to add any conditions since its shared.
     * For private frames, like the Starting Bonus Selection Menu, we also don't need to add any additional conditions because each player will get their own frame and other players can't select it since it won't be visible to them.
     */
    sharedFrame: boolean;
    titleText?: string;
    itemData: T[];

    /**
     * When the option is clicked
     * @param row
     * @param column
     * @returns
     */
    onItemClicked?: (itemIndex: number, player: MapPlayer) => void;

    /**
     * An option that was confirmed on choice.
     * @param row
     * @param column
     * @returns
     */
    onItemConfirmed?: (itemIndex: number, player: MapPlayer) => void;
    buttonGapX?: number;
    buttonGapY?: number;
    buttonText?: string;
    /**
     * Optional to override rendered element in title space.
     * @returns
     */
    renderTitle?: () => Frame | undefined;
    /**
     * Optional override for button group renderd on bottom
     */
    renderButton?: () => Frame | undefined;
    /**
     * Optional override for inner grid render item function
     */
    // renderItem?: GridRenderItemFn;
    /**
     * This is called when the timer elapses or Terminate is called manually.
     * This should be used to handle any after effects of a player selection
     * @returns
     */
    onClose?: () => void;
    // onTimeElapsed?: () => void;

    /**
     * Sets up a timer that will auto close the frame when elapsed. Will also display a countdown for the timer.
     */
    timedLife?: number;
    /**
     * This will determine if a random choice is picked when the grid is closed either by trigger or by timer
     */
    randomSelectionOnClose?: boolean;
    /**
     * The grid config is partial as we do not require to override all values. This GridSelectionMenu component also provides the necessary required values already like context , name, etc.
     */
    gridConfig?: Partial<GridConfig<T, GridItemBaseDefinition>>;
}

/**
 * Displays a menu for each player to choose from.
 * Each player is allowed 15 seconds to choose a headquarters before the next player is allowed to start picking.
 * A player cannot select something that is already being chosen.
 * Anything a player has selected but has not picked yet will be tinted their player color.
 * Anything chosen will be displayed as gray.\
 */
export class GridSelectionMenu<T extends GridSelectionMenuData> {
    config: GridSelectionMenuConfig<T>;
    context: number = 0;
    name: string;
    /**
     * The backdrop Panel
     */
    containerFrame?: Frame;

    buttonGrid?: Grid<T, GridItemBaseDefinition>;
    titleContaineFrame?: Frame;

    /**
     * Default: GlueTextButton
     */
    confirmationButton?: Frame;

    constructor(name: string, context: number, config: GridSelectionMenuConfig<T>) {
        this.config = config;
        this.context = context;
        this.name = name;
        this.Render();
    }

    /**
     * The players who are allowed to pick a base
     */
    private pickingPlayers: Set<number> = new Set();

    /**
     * Player number and selected item index
     */
    private playerItemIndexSelected: Map<number, number | undefined> = new Map();

    /**
     * Item index and data
     */
    private itemData: Map<number, T> = new Map();

    /**
     * Player number and item index
     * Headquarters which the players have either chosen or were given at random.
     */
    public playerItemIndexesChosen: Map<number, number[]> = new Map();

    /**
     * The item index and frames
     */
    private buttonRendered: Map<number, ButtonFrames> = new Map();

    /**
     * Player Number and Frame
     */
    private playerColorSprites: Map<number, Frame | undefined> = new Map();
    /**
     * Player Number and Frame
     */
    private playerWhiteSprites: Map<number, Frame | undefined> = new Map();
    private timeElapsedTimer: Timer | undefined;

    /**
     * Remove on update or destroy
     */
    private savedTriggers: Trigger[] = [];

    /**
     * Rendered for all players so no context required.
     */
    Render() {
        const baseName = this.name;

        const panel = Panel.Render(this.context, baseName); //leave as 0 for all players to see.
        panel?.clearPoints();
        panel?.setSize(0.25, 0.22);
        panel?.setAbsPoint(FRAMEPOINT_CENTER, 0.4, 0.4);

        this.containerFrame = panel;

        if (!panel) {
            return;
        }

        let selectBtn: Frame | undefined = undefined;

        if (this.config?.renderButton) {
            selectBtn = this.config.renderButton();
        } else {
            selectBtn = Components.GlueTextButton(this.context, baseName + "selectButton", panel, (btn) => {
                this.HandleItemConfirmed();
            });

            selectBtn?.clearPoints();
            selectBtn?.setPoint(FRAMEPOINT_BOTTOM, panel, FRAMEPOINT_BOTTOM, 0, 0.01);
            selectBtn?.setText(this.config?.buttonText || "Confirm");
            selectBtn?.setSize(0.12, 0.04);
        }

        this.confirmationButton = selectBtn;

        let title: Frame | undefined = undefined;

        if (this.config?.renderTitle) {
            title = this.config.renderTitle();
        } else {
            title = Text.Render(this.context, baseName + "titleText", panel);
            title?.clearPoints();
            title?.setPoint(FRAMEPOINT_TOP, panel, FRAMEPOINT_TOP, 0, -0.01);
            // title?.setTextSizeLimit(50); //doesnt seem to do anything
            title?.setSize(0.12, 0.1);
            title?.setText(this.config?.titleText || "No Title");
        }

        title?.setEnabled(false);
        this.titleContaineFrame = title;
        this.setupGrid();

        /**
         * Create sprites for each player
         */
        Players.forEach((p) => {
            if (isPlayingUser(p)) {
                /**
                 * Also create a white sprite for each player.
                 */
                const playerSpriteTexture = playerToSpriteTexture.get(p.id);

                const coloredSprite = FrameUtils.AddSprite(playerSpriteTexture || "", 0, "coloredSelectionSprite" + p.id, FrameUtils.OriginFrameGameUI);
                coloredSprite?.setLevel(10);
                coloredSprite?.setVisible(false);
                const whiteSprite = FrameUtils.AddSprite("war3mapImported\\ui-modalbuttonon-customwhite.mdx", 0, "whiteSelectionSprite" + p.id, FrameUtils.OriginFrameGameUI);
                whiteSprite?.setVisible(false);
                whiteSprite?.setLevel(10);
                this.playerWhiteSprites.set(p.id, whiteSprite);
                this.playerColorSprites.set(p.id, coloredSprite);
            }
        });
    }

    /**
     * Starts the timer on the config object
     */
    startTimer() {
        //destroy the timer if there was one already
        this.timeElapsedTimer?.destroy();

        if (this.config?.timedLife === undefined || this.config?.timedLife <= 0) {
            print("tried to start a timer when no timed life was set; " + this.name);
            return;
        }

        if (this.titleContaineFrame && this.config?.timedLife && this.config?.timedLife != 0) {
            const timerText = Text.Render(this.context, this.name + "titleTimerText", this.containerFrame);

            timerText?.clearPoints();
            timerText?.setPoint(FRAMEPOINT_LEFT, this.titleContaineFrame, FRAMEPOINT_RIGHT, 0, 0);
            // timerText?.setTextSizeLimit(50);
            timerText?.setSize(0.02, 0.1);
            timerText?.setEnabled(false);

            let durationRemaining = this.config.timedLife;
            this.timeElapsedTimer = Timer.create();

            timerText?.setText(durationRemaining.toString());

            this.timeElapsedTimer.start(1, true, () => {
                timerText?.setText(durationRemaining.toString());
                durationRemaining--;

                if (durationRemaining < 0) {
                    this.containerFrame?.setVisible(false);

                    try {
                        this.Terminate();
                    } catch (e) {
                        print("|cffFF0000Error|r: " + e);
                        this.close();
                    }
                    this.timeElapsedTimer?.destroy();
                }
            });
        }
    }

    /**
     * I want to provide the grid with new items to render. Perhaps most of the config will remain the same?
     * I could require a new config, but I can also just pass the same config back to itself if need be.
     *
     * Override the inner grid configuration object that was used to initialize this GridSelectionMenu.
     * This allows us to change the number of rows, columns, gaps, etc.
     */
    public updateGrid(config: GridSelectionMenuConfig<T>) {
        // this.buttonGrid?.destroy();

        //Destroy any button triggers.
        this.savedTriggers.forEach((t) => t.destroy());
        //Lose reference of trigger objects
        this.savedTriggers = [];

        if (this.config) {
            this.config = config;
        } else {
            print("Could not call updateGrid for " + this.name + ". Missing GridSelectionMenuConfig.");
            return;
        }

        //Wipe out the choices
        //This updates for everyone if its a shared grid
        this.playerItemIndexesChosen.clear();
        this.playerItemIndexSelected.clear();

        this.setupGrid();
        this.titleContaineFrame?.setText(this.config?.titleText || "No Title");
    }

    private setupGrid() {
        if (!this.containerFrame) {
            print("setupGrid called when no container frame existed. " + this.name);
            return;
        }

        const grid = new Grid({
            columns: this.config?.gridConfig?.columns || 5,
            rows: this.config?.gridConfig?.rows || 2,
            containerName: this.name + "SelectionGrid",
            containerOwner: this.containerFrame,
            context: this.context,
            gapX: this.config?.buttonGapX || 0.01,
            gapY: this.config?.buttonGapY || 0.01,
            data: this.config.itemData,
            renderItem: (parent, row, column, index) => {
                /**
                 * Data should include the button data as well any other relevant data. We need the icon texture, and the tooltip.
                 */
                const data = this.config?.itemData[index];

                if (!data) {
                    addLog(LogLevel.Error, "No data for grid item: " + this.name + "button" + index + `; |cffffcc00The data for this button|r: ${this.config?.itemData.length}`);
                    //   print("No data for grid item: " + this.name + "button" + index + `; |cffffcc00The data for this button|r: ${this.config?.itemData.length}`);
                    return;
                }

                const buttonOption = Components.IconButton(this.context, this.name + "button" + index, data?.iconTexture || "", parent, () => {
                    this.HandleItemSelection(index);
                });
                const ttHeader = data?.tooltipTitle ?? "";
                const tt = Components.Tooltip(this.context, this.name + "selectionTooltip" + index, ttHeader, data?.tooltip || "", buttonOption.button, true);

                this.buttonRendered.set(index, { button: buttonOption.button, buttonIcon: buttonOption.buttonIconFrame, buttonTooltip: tt?.tooltipFrameText });

                if (buttonOption.trigger) {
                    this.savedTriggers.push(buttonOption.trigger);
                }

                return { container: buttonOption.button };
            },
            ...this.config?.gridConfig,
        });

        this.buttonGrid = grid;
        this.buttonGrid?.containerFrame?.clearPoints();
        this.buttonGrid?.containerFrame?.setPoint(FRAMEPOINT_TOP, this.containerFrame, FRAMEPOINT_TOP, 0, -0.04);
    }

    /**
     * Prevent it from being chosen
     */
    HandleItemConfirmed() {
        const player = MapPlayer.fromHandle(GetTriggerPlayer());

        if (!player) {
            return false;
        }

        //we should get the item selected from the data.
        //This means the ItemSelected map should be <playerNumber, itemData>
        //instead of just playerNumber, objectId
        // However that also means that we sometimes are comparing references or values when checking equality. so perhaps we could have a comparator function for equality which takes the data we retrieved.
        const itemIndex = this.playerItemIndexSelected.get(player.id);

        if (!itemIndex) {
            // print("No item selected to confirm choice.");
            return false;
        }

        /**
         * Multiple players could possibly be choosing from the same pool of items.
         * This occurs when the farme is shared, so we must keep the condition where no other player has made teh selection
         */
        // if(this.config?.maxChoices && this.playerItemChosen.)

        let canChoose = false;

        //When this frame is not a shared frame, then this still works since only our local player will be in the map with items.
        //We need to clear out this list whenever the grid is updated
        this.playerItemIndexesChosen.forEach((value, key) => {
            //does this player in our players array contain the item chosen? If so, we return
            if (value.includes(itemIndex)) {
                canChoose = true;
                print("The item was already chosen. Cannnot choose again.");
            }

            //If the triggering player chose and they have already reached their max choices, then we cannot choose
            if (this.config?.maxChoices && player.id === key && value.length >= this.config.maxChoices) {
                canChoose = true;
                print(this.config.maxChoices + " Maximum choices were already made by this player : " + player.name);
            }
        });

        if (canChoose) {
            return;
        }

        let updatedItems = this.playerItemIndexesChosen.get(player.id);

        if (updatedItems) {
            updatedItems.push(itemIndex);
        } else {
            updatedItems = [itemIndex];
        }

        this.playerItemIndexesChosen.set(player.id, updatedItems);

        // print(`Confirmed Choice: ${GetObjectName(playerSelection)}`);

        const buttonFrames = this.buttonRendered.get(itemIndex);

        if (!buttonFrames) {
            print("Button frames did not exist for player's headquarters selection.");
            return;
        }

        buttonFrames.button?.setVisible(false);

        /**
         * Hide sprites for all the players.
         * @WARNING - Maybe this causes desync?
         */
        const coloredSprite = this.playerColorSprites.get(player.id);
        coloredSprite?.setVisible(false);
        const whiteSprite = this.playerWhiteSprites.get(player.id);
        whiteSprite?.setVisible(false);

        /*
            Handle outside this function
            Show player choice next to their name.
        */
        if (this.config?.onItemConfirmed) {
            this.config.onItemConfirmed(itemIndex, player);
        }

        // this.playerItemSelected.set(player.id, undefined);

        // this.config?.onConfirmChoice(itemIndex, player);

        // const pState = playerStates.get(player.id);

        // if (pState) {
        //     pState.selectedHeadquartersUnitId = itemIndex;
        // }

        // const nameButton = this.playerNameListButtonsRendered.get(player.id);
        // nameButton?.button?.setVisible(true);
        // nameButton?.buttonIcon?.setTexture(BlzGetAbilityIcon(itemIndex) || "", 0, false);
        // nameButton?.buttonTooltip?.setText(GetObjectName(itemIndex) ?? "No Name");

        this.playerItemIndexSelected.set(player.id, undefined);
    }

    HandleItemSelection(itemIndex: number) {
        const player = MapPlayer.fromHandle(GetTriggerPlayer());

        if (!player) {
            print("Player not found: HandlePlayerSelection");
            return false;
        }

        //You cannot select another item once one has already been chosen.
        const itemChosen = this.playerItemIndexesChosen.get(player.id);

        //if i select a different item, I should hide the current one I'm selecing

        if (this.config?.maxChoices && itemChosen && itemChosen?.length >= this.config?.maxChoices) {
            return;
        }

        this.playerItemIndexSelected.set(player.id, itemIndex);

        const btn = this.buttonRendered.get(itemIndex);

        if (btn && btn.button && btn.buttonIcon) {
            const coloredSprite = this.playerColorSprites.get(player.id);
            const whiteSprite = this.playerWhiteSprites.get(player.id);
            const localP = GetLocalPlayer();

            /**
             * Show the white sprite visible only to local player and set their player color sprite visible to everyone else. Of course set position to the same for both sprites
             */
            whiteSprite?.setVisible(localP === player.handle);
            whiteSprite?.setScale(btn.button.width / 0.039);
            whiteSprite?.clearPoints();
            whiteSprite?.setAllPoints(btn.button);

            /**
             * Show colored sprite to other players
             * We only want to see other player's frames if it's a shared frame
             */
            if (this.config?.sharedFrame) {
                coloredSprite?.setVisible(localP !== player.handle);
                coloredSprite?.setScale(btn.button.width / 0.039);
                coloredSprite?.clearPoints();
                coloredSprite?.setAllPoints(btn.button);
            }
        }

        if (this.config?.onItemClicked) {
            this.config?.onItemClicked(itemIndex, player);
        }
    }

    /**
     * Ends everything
     */
    Terminate() {
        if (this.config?.onClose) {
            this.config.onClose();
        }

        this.timeElapsedTimer?.destroy();

        this.close();
    }

    private close() {
        this.playerColorSprites.forEach((frame, player) => {
            frame?.setVisible(false);
        });
        this.playerWhiteSprites.forEach((frame, player) => {
            frame?.setVisible(false);
        });
    }
}

interface ButtonFrames {
    button?: Frame;
    buttonIcon?: Frame;
    buttonTooltip?: Frame;
}

export interface GridSelectionMenuData {
    iconTexture?: string;
    tooltip?: string;
    tooltipTitle?: string;
}

const playerToSpriteTexture = new Map([
    [0, "war3mapImported\\ui-modalbuttonon-customred.mdx"],
    [1, "war3mapImported\\ui-modalbuttonon-customblue.mdx"],
    [2, "war3mapImported\\ui-modalbuttonon-customteal.mdx"],
    [3, "war3mapImported\\ui-modalbuttonon-custompurple.mdx"],
    [4, "war3mapImported\\ui-modalbuttonon-customyellow.mdx"],
    [5, "war3mapImported\\ui-modalbuttonon-customorange.mdx"],
]);
