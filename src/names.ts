export enum FrameFDF {
    JMT_BackdropBaseTemplate = "JMT_BackdropBaseTemplate",
}

export enum Names {
    LeftPanel = "LeftPanel",
    LowerActionBar = "LowerActionBar",
}

export enum Inheritables {
    EmptyFrame = "JMT_EmptyFrame",
    GlueTextButton = "UI_TemplateButton",
    JMT_BackdropBaseTemplate = "JMT_BackdropBaseTemplate",
    JMT_SimpleButtonBase = "JMT_SimpleButtonBase",
}

export const FrameInheritable = {
    GlueTextButton: {
        name: "UI_TemplateButton",
        type: "GLUETEXTBUTTON",
    },
} as const;

export enum JMT_Inheritables {
    EmptyFrame = "JMT_EmptyFrame",
    GlueTextButton = "UI_TemplateButton",
    JMT_BackdropBaseTemplate = "JMT_BackdropBaseTemplate",
    JMT_SimpleButtonBase = "JMT_SimpleButtonBase",
}


export enum FrameType {
    Backdrop = "BACKDROP",
    Button = "BUTTON",
    ChatDisplay = "CHATDISPLAY",
    CheckBox = "CHECKBOX",
    Dialog = "DIALOG",
    EditBox = "EDITBOX",
    Frame = "FRAME",
    GlueButton = "GLUEBUTTON",
    GlueCheckBox = "GLUECHECKBOX",
    GlueEditBox = "GLUEEDITBOX",
    GluePopupMenu = "GLUEPOPUPMENU",
    GlueTextButton = "GLUETEXTBUTTON",
    Highlight = "HIGHLIGHT",
    ListBox = "LISTBOX",
    Menu = "MENU",
    Model = "MODEL",
    PopupMenu = "POPUPMENU",
    ScrollBar = "SCROLLBAR",
    SlashChatBox = "SLASHCHATBOX",
    Slider = "SLIDER",
    Sprite = "SPRITE",
    Text = "TEXT",
    TextArea = "TEXTAREA",
    TextButton = "TEXTBUTTON",
    TimerText = "TIMERTEXT",
    Tooltip = "TOOLTIP",
}
