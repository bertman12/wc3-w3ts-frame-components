/**
 * Default Warcraft III mainframe templates that are already loaded, per native frame type.
 * Only templates the guide lists as "Loaded" are included; templates that need their fdf/toc loaded first are omitted.
 *
 * Source: Tasyen, "UI: List - Default MainFrames" https://www.hiveworkshop.com/threads/ui-list-default-mainframes.317884/
 */

/**
 * Suggests the loaded templates for autocomplete while still accepting any string.
 * (string & {}) keeps the literal suggestions from collapsing into string.
 */
export type InheritsOf<Loaded extends string> = Loaded | (string & {});

/** Loaded BACKDROP templates. */
export const LoadedBackdropTemplates = [
    "BNetPopupMenuBackdropTemplate",
    "LadderButtonBackdropTemplate",
    "LadderButtonPushedBackdropTemplate",
    "LadderButtonDisabledBackdropTemplate",
    "LadderButtonDisabledPushedBackdropTemplate",
    "ClanButtonBackdropTemplate",
    "ClanButtonPushedBackdropTemplate",
    "ClanButtonDisabledBackdropTemplate",
    "ClanButtonDisabledPushedBackdropTemplate",
    "TeamPopupMenuBackdropTemplate",
    "OptionsPopupMenuBackdropTemplate",
    "ScoreScreenButtonBackdropTemplate",
    "SkirmishPopupMenuBackdropTemplate",
    "EscMenuBackdrop",
    "QuestButtonBaseTemplate",
    "QuestButtonBackdropTemplate",
    "QuestButtonPushedBackdropTemplate",
    "QuestButtonDisabledBackdropTemplate",
    "QuestButtonDisabledPushedBackdropTemplate",
] as const;

export type LoadedBackdropTemplate = (typeof LoadedBackdropTemplates)[number];

/** Loaded DIALOG templates. */
export const LoadedDialogTemplates = [
    "BattleNetHelpDialog",
    "BattleNetClanInviteDialog",
    "BattleNetCustomFilterDialog",
    "BattleNetMatchmakerTeamInviteDialog",
    "BattleNetMatchmakerPendingInviteDialog",
    "BattleNetIconSelectDialog",
    "BattleNetScheduledGame",
    "BattleNetTeamInviteDialog",
    "DialogWar3",
    "QuickReplayDialog",
    "QuickReplayConfirmDialog",
    "BattleNetPatchDialog",
    "BattleNetConnectDialog",
    "UserDataMigrationDialog",
    "OptionsConfirmDialog",
    "AllianceDialog",
    "EscMenuOptionsConfirmDialog",
    "GameResultDialog",
    "GameSaveSplashDialog",
    "ScriptDialog",
    "SuspendDialog",
    "UnresponsiveDialog",
] as const;

export type LoadedDialogTemplate = (typeof LoadedDialogTemplates)[number];

/** Loaded FRAME templates. */
export const LoadedEmptyTemplates = [
    "AdvancedOptionsDisplay",
    "AdvancedOptionsPane",
    "AdBanner",
    "BattleNetChatPanel",
    "BattleNetChatroom",
    "BattleNetClanInvitation",
    "BattleNetClanMateListBox",
    "BattleNetClanPane",
    "BattleNetCustomCreatePanel",
    "BattleNetCustomJoinPanel",
    "BattleNetCustomLoadPanel",
    "BattleNetFriendsListBox",
    "BattleNetFriendsPane",
    "BattleNetMainFrame",
    "BattleNetMatchmakerPanel",
    "BattleNetProfilePanel",
    "BattleNetProfileListBox",
    "BattleNetProfileListItem",
    "BattleNetStandardPanel",
    "BattleNetStatusBox",
    "BattleNetTeamInvitation",
    "BattleNetTeamPanel",
    "BattleNetUserListBox",
    "CampaignListBox",
    "CampaignMenu",
    "CustomCampaignMenu",
    "GameChatroom",
    "Loading",
    "LoadingPlayerSlot",
    "LoadSavedGameScreen",
    "LocalMultiplayerCreate",
    "LocalMultiplayerJoin",
    "LocalMultiplayerLoad",
    "MainMenuFrame",
    "MapInfoPane",
    "MovieScreen",
    "OptionsMenu",
    "ScoreScreenFrame",
    "SaveReplayPanel",
    "SinglePlayerMenu",
    "Skirmish",
    "ViewReplayScreen",
    "AllianceSlot",
    "BrowserFrame",
    "ChatDialog",
    "CinematicPanel",
    "EscMenuMainPanel",
    "EscMenuOptionsPanel",
    "EscMenuSaveGamePanel",
    "Leaderboard",
    "LogDialog",
    "Multiboard",
    "QuestDialog",
    "QuestListItem",
    "QuestItemListItem",
    "SuspendPlayerSlot",
    "TimerDialog",
] as const;

export type LoadedEmptyTemplate = (typeof LoadedEmptyTemplates)[number];

/** Loaded GLUEBUTTON templates. */
export const LoadedGlueButtonTemplates = ["IconicButtonTemplate", "IconButtonTemplate", "ClanButtonTemplate", "QuestButtonTemplate"] as const;

export type LoadedGlueButtonTemplate = (typeof LoadedGlueButtonTemplates)[number];

/** Loaded GLUECHECKBOX templates. */
export const LoadedGlueCheckBoxTemplates = ["ScoreScreen5ColumnButtonTemplate", "ScoreScreen4ColumnButtonTemplate", "ScoreScreenBottomCheckButtonTemplate", "QuestCheckBox", "QuestCheckBox2", "QuestCheckBox3"] as const;

export type LoadedGlueCheckBoxTemplate = (typeof LoadedGlueCheckBoxTemplates)[number];

/** Loaded GLUETEXTBUTTON templates. */
export const LoadedGlueTextButtonTemplates = ["DebugButton", "ReplayButton", "BrowserButton", "ScoreScreenBottomButtonTemplate", "ScriptDialogButton"] as const;

export type LoadedGlueTextButtonTemplate = (typeof LoadedGlueTextButtonTemplates)[number];

/** Loaded HIGHLIGHT templates. */
export const LoadedHighlightTemplates = [
    "LadderButtonFocusHighlightBackdropTemplate",
    "LadderButtonMouseOverHighlightBackdropTemplate",
    "ClanButtonFocusHighlightBackdropTemplate",
    "ClanButtonMouseOverHighlightBackdropTemplate",
    "QuestButtonMouseOverHighlightTemplate",
] as const;

export type LoadedHighlightTemplate = (typeof LoadedHighlightTemplates)[number];

/** Loaded POPUPMENU templates. */
export const LoadedPopupMenuTemplates = [
    "AdvancedPopupMenuTemplate",
    "ClanPopupMenuTemplate",
    "FilterPopupMenuTemplate",
    "BNetPopupMenuTemplate",
    "PlayerSlotPopupMenu",
    "TeamPopupMenuTemplate",
    "TeamMemberPopupMenu",
    "OptionsPopupMenuTemplate",
    "SkirmishPopupMenuTemplate",
] as const;

export type LoadedPopupMenuTemplate = (typeof LoadedPopupMenuTemplates)[number];

/** Loaded SCROLLBAR templates. */
export const LoadedScrollBarTemplates = ["QuestMainListScrollBar", "QuestOptionalListScrollBar", "QuestItemListScrollBar", "QuestConditionListScrollBar"] as const;

export type LoadedScrollBarTemplate = (typeof LoadedScrollBarTemplates)[number];

/** Loaded TEXT templates. */
export const LoadedTextTemplates = [
    "TeamLabelTextTemplate",
    "LadderNameTextTemplate",
    "TeamValueTextTemplate",
    "TeamLadderRankValueTextTemplate",
    "ScoreScreenTabTextTemplate",
    "ScoreScreenTabTextSelectedTemplate",
    "ScoreScreenColumnHeaderTemplate",
    "EscMenuMainPanelDialogTextTemplate",
    "EscMenuSaveDialogTextTemplate",
] as const;

export type LoadedTextTemplate = (typeof LoadedTextTemplates)[number];

/** Loaded TEXTBUTTON templates. */
export const LoadedTextButtonTemplates = ["LadderButtonTemplate"] as const;

export type LoadedTextButtonTemplate = (typeof LoadedTextButtonTemplates)[number];
