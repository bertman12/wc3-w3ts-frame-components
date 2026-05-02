interface W3TSFrameComponentsTheme {
    /**
     * The click sound for clicking on Button class
     */
    buttonClickSound?: string;
    /**
     * The click sound for clicking on GlueTextButton class
     */
    glueButtonClickSound?: string;
    /**
     * 
     */
    glueTextButtonInherits?: string;
    /**
     * Background for tooltips.
     */
    tooltipBackdropInherits?: string;
    /**
     * How to chooose ths?
     * Inherits would have to be set to empty string?
     * Does button ever get created by name?
     *
     * Can set to ScoreScreenTabButtonTemplate
     */
    buttonBackdropInherits?: string;
    /**
     * For the Backdrop class
     */
    backdropInherits?: string;
    /**
     * For the timer background
     */
    timerBackdropInherits?: string;
    /**
     * Timer icon texture.
     */
    timerButtonIconTexture?: string;
}

export class W3TSFrameComponentsThemeUtils {
    public static createTheme(theme: W3TSFrameComponentsTheme) {
        this.__theme = theme;
    }

    private static __theme: W3TSFrameComponentsTheme = {};

    public static get Theme(): W3TSFrameComponentsTheme {
        return this.__theme;
    }
}

export const W3TSFrameComponentsDefaultTheme: W3TSFrameComponentsTheme = {
    buttonClickSound: "Sound\\Interface\\MouseClick1.flac",
    glueButtonClickSound: "Sound\\Interface\\BigButtonClick.flac",
    tooltipBackdropInherits: "QuestButtonBaseTemplate",
    backdropInherits: "QuestButtonBaseTemplate",
    buttonBackdropInherits: "ScoreScreenTabButtonTemplate",
};

/**
 * Maybe also add sub theme for certain component contexts to use?
 * Something that could be added to abstract frame base.
 *
 * AbstractFrameBase.Theme(...) //calling this would override specific properties, or we could add an argument to override all
 *
 * Components would reach for this first, then the global theme second.
 *
 */
