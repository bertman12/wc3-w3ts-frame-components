/**
 * Specify global theme properties to avoid unnecessary code duplication.
 */
interface W3TSFrameComponentsTheme {
    buttonClickSound?: string;
}

export let __theme: W3TSFrameComponentsTheme = {};

export function setTheme(theme: W3TSFrameComponentsTheme) {
    __theme = theme;
}
