/**
 * Global Theme.
 *
 * Should include global properties only.
 *
 */
export interface W3TSFrameComponentsTheme {
    /**
     * Applies to all backdrops.
     */
    globalBackdrop?: string;
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

/**
 * Theme hierarchy:
 *
 * There can be global themes for backdrops used for all components.
 *
 * Then there can be component saved themes, which override global themes.
 *
 */

/**
 * If we want to be able to use themes.
 *
 * Sometimes we want to have a theme for a component but override it and use an empty string inherits.
 * This means we cannot interpret an empty inherit string as an indicator to use the theme settings.
 *
 * Should we have a CreateThemed function?
 *
 * Maybe this should be part of the config as a boolean?
 */

interface IFrameGenericConfiguration {
    /**
     * When enabled, all theme settinsg will be used.
     *
     * But what if you want to use the theme as a base but then override some theme properties?
     *
     * Properties set directly on the configuration will be used first before a theme is used, excluding inherits.
     */
    useTheme?: boolean;
}
