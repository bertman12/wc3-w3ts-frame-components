import { MenuBar } from "./bars/menuBar";
import { TimerFrame } from "./components/timer";
import { CurrentNightFrame } from "./information/night";
import { PlayerResourceDisplay } from "./information/player-resources";
import { BonusSelectionMenu } from "./menus/bonusSelection";
import { BossMenu } from "./menus/bossMenu";
import { BuildMenu } from "./menus/buildMenu";
import { HeadquarterSelectionMenuData } from "./menus/headquarterSelectionMenu";
import { PlayersPanel } from "./panels/playersPanel";
import { GridSelectionMenu } from "./sections/gridSelectionMenu";
import { PlayerAlertText } from "./text/playerAlertText";

export const GlobalFrames: GlobalFrameSet = {
    HeadquartersSelectionMenu: undefined,
    NightTextDisplay: undefined,
    DayNightCountdownTimer: undefined,
};

interface GlobalFrameSet {
    HeadquartersSelectionMenu?: GridSelectionMenu<HeadquarterSelectionMenuData>;
    NightTextDisplay?: CurrentNightFrame;
    DayNightCountdownTimer?: TimerFrame;
}

export interface PlayerFrameSet {
    playerChoicesPanel?: PlayersPanel;
    menuBar?: MenuBar;
    bonusSelection?: BonusSelectionMenu;
    bossMenu?: BossMenu;
    resourceFrames?: PlayerResourceDisplay;
    buildMenu?: BuildMenu;
    alertText?: PlayerAlertText;
}

export const PlayerFrames = new Map<number, PlayerFrameSet>([
    [0, { playerChoicesPanel: undefined }],
    [1, { playerChoicesPanel: undefined }],
    [2, { playerChoicesPanel: undefined }],
    [3, { playerChoicesPanel: undefined }],
    [4, { playerChoicesPanel: undefined }],
    [5, { playerChoicesPanel: undefined }],
    [6, { playerChoicesPanel: undefined }],
    [7, { playerChoicesPanel: undefined }],
    [8, { playerChoicesPanel: undefined }],
    [9, { playerChoicesPanel: undefined }],
    [10, { playerChoicesPanel: undefined }],
    [11, { playerChoicesPanel: undefined }],
    [12, { playerChoicesPanel: undefined }],
]);
