import { Trigger } from "w3ts";
import { IEvent } from "./IEvents";

export interface IMouseEnterEvent extends IEvent {
    onMouseEnterTrigger?: Trigger;
    /**
     * Overrides previous on mouse eneter function and destroys the previous on click trigger and creates a new one.
     *
     * This function should handle boiler plate of setting up click event triggers, playing click sounds, resizing frames, etc.
     * @param this
     * @returns
     */
    setOnMouseEnter: (fn: (...args: any[]) => void) => void;
}
