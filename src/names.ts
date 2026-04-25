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
