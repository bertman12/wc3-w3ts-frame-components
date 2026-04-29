import { Trigger } from "w3ts";
import { IEvent } from "./IEvents";

export interface IClickEvent extends IEvent {
    onClickTrigger?: Trigger;
    /**
     * Overrides previous on click function and destroys the previous on click trigger and creates a new one.
     *
     * This function should handle boiler plate of setting up click event triggers, playing click sounds, resizing frames, etc.
     * @param this
     * @returns
     */
    setOnClick: (fn: (...args: any[]) => void) => void;
}
