---
name: frame-multiplayer-and-events
description: Desync-safe frame code and the frame event reference (which frame types fire which events, event getters, GetLocalPlayer rules). Use when registering frame events, handling input state, or using GetLocalPlayer with frames.
---

# Multiplayer safety and frame events

Source: Tasyen, [The Big UI-Frame Tutorial](https://www.hiveworkshop.com/threads/the-big-ui-frame-tutorial.335296/), sections "Frames & Multiplayer", "Frames and HandleId", "Input & Current State", "FrameEvents", "FrameEvent Getters", "FrameTypes" (events per type), "SLIDER/Scrollbar", "Dialog - Yes/No", "SimpleButton", "Frame Save & Load", "Errors". Event tests were done in 1.31.1; verify on the current patch.

## Multiplayer
- Warcraft III is lockstep: local-only visuals are fine, but frame existence and frame events must match for all players.
- Local-only operations (position, size, visibility, texture, color, text) are possible inside `GetLocalPlayer()`, but are risky.
- Values that can differ per player and must not drive game state: `BlzFrameGetText`, `GetTextSizeLimit`, `GetEnable`, `GetAlpha`, `GetValue`, `GetHeight`, `GetWidth`, `GetParent`, `IsVisible`.
- Creating/getting a frame (`BlzCreateFrame*`, `BlzGetOriginFrame`, `BlzGetFrameByName`, `BlzFrameGetParent/Child`) allocates a handle id. Never do it inside `GetLocalPlayer`. Reserve the id by calling the getter for all players first.
- User input only changes the clicking player's frame. Read input state (slider value, editbox text, checked) **inside the frame event**, where it is synced, and store it in a variable.
- Slider/scrollbar (guide "SLIDER/Scrollbar"): `BlzFrameSetValue` sets the value for any player running the code and "will trigger one FRAMEEVENT_SLIDER_VALUE_CHANGED for every player running it. The event is triggered by other players even when the call happens inside a GetLocalPlayer block", so on an 8-player map a call outside `GetLocalPlayer` triggers it 8 times. The event is synced and reports the value chosen by `GetTriggerPlayer()`; it happens even when the value did not change (dragging to the max can fire it several times in a row). `BlzFrameGetValue` is the local player's value, so treat it as async.
- Sliders do not scroll with the mouse wheel by default. The guide's workaround handles `FRAMEEVENT_MOUSE_WHEEL` and steps the value by 1 only for the triggering player (`GetLocalPlayer() == GetTriggerPlayer()`); it does not work while the cursor is on the slider's thumb button.
- Some default frames do not exist until the local player needs them (for example `QuestDialog`, or `ORIGIN_FRAME_PORTRAIT_HP_TEXT` in 1.32+, which needs a selection and a short wait), which "can lead to various problems up to desync". The guide forces `QuestDialog` into existence with `BlzFrameClick` on `UpperButtonBarQuestsButton`, then on `QuestAcceptButton`. The Errors list also says some frames are not created until the local player tabs back into the game after it was minimized (fullscreen mode).
- Alliance dialog frames can desync replays: they exist only in multiplayer, so the handle-id block no longer matches the replay.
- Save & Load (guide "Frame Save & Load", "Errors"): custom UI frames become broken, hidden and unusable after a load, and using one can crash the game. The guide states this for 1.31 through 1.32.9 PTR. Workaround: disable saving/loading, or re-run all frame-creation functions when the game loads. The Errors list adds that Save&Load does not include TOC UI-frame/API usage, and using stale frame variables in a frame native crashes.

## Events
- Register with `BlzTriggerRegisterFrameEvent(trigger, frame, event)`. Getters: `BlzGetTriggerFrame`, `BlzGetTriggerFrameEvent`, `BlzGetTriggerFrameValue`, `BlzGetTriggerFrameText`, `GetTriggerPlayer`.
- `CONTROL_CLICK` fires on mouse release (the original press must also be inside the button) or on space/enter while the frame has focus, before `MOUSE_UP`. FDF `ControlStyle "CLICKONMOUSEDOWN"` clicks on press.
- `MOUSE_UP` fires when the left, right or wheel button is released while the cursor is inside the frame.
- `MOUSE_WHEEL`: `BlzGetTriggerFrameValue()` is +120 forward / -120 backward; the guide recommends checking only `> 0` or `< 0`.
- Per the guide, `MOUSE_DOWN` and `MOUSE_DOUBLECLICK` "does nothing or no Frame accept it"; `SPRITE_ANIM_UPDATE` is marked "?" (undocumented).
- `EDITBOX_TEXT_CHANGED` fires for user or code changes (setting the text synced fires one event per player) and fires often. `BlzFrameGetText` is the local, unsynced text; the event carries it in `BlzGetTriggerFrameText`.
- A SIMPLEBUTTON keeps only one `CONTROL_CLICK` registration: registering another for the same SIMPLEBUTTON stops the previous one from firing.
- Frame types by event (tested in 1.31.1):
  - BUTTON, GLUEBUTTON, GLUETEXTBUTTON, TEXT, TEXTBUTTON, TIMERTEXT: CONTROL_CLICK, MOUSE_ENTER/LEAVE/UP/WHEEL.
  - CHECKBOX, GLUECHECKBOX: MOUSE_ENTER/LEAVE/UP/WHEEL plus CHECKBOX_CHECKED/UNCHECKED.
  - EDITBOX, GLUEEDITBOX, SLASHCHATBOX: MOUSE_ENTER/LEAVE/UP/WHEEL plus EDITBOX_TEXT_CHANGED and EDITBOX_ENTER.
  - SLIDER: MOUSE_ENTER/LEAVE/UP/WHEEL plus SLIDER_VALUE_CHANGED. SCROLLBAR: the same events.
  - CHATDISPLAY, LISTBOX, MENU, TEXTAREA: MOUSE_ENTER/LEAVE/UP/WHEEL. CONTROL: MOUSE_ENTER/LEAVE/UP.
  - POPUPMENU, GLUEPOPUPMENU: MOUSE_ENTER/LEAVE/WHEEL, CONTROL_CLICK, POPUPMENU_ITEM_CHANGED (index in `BlzGetTriggerFrameValue`).
  - DIALOG: DIALOG_CANCEL/ACCEPT. Usable only when the dialog's `DialogOkButton`/`DialogCancelButton` GLUETEXTBUTTONs are defined in FDF as direct children.
  - SIMPLEBUTTON: CONTROL_CLICK only.
  - MODEL: MOUSE_ENTER/LEAVE/UP/WHEEL, only on the screen space it takes, not on the visuals.
  - BACKDROP, HIGHLIGHT, SPRITE, SIMPLEFRAME, SIMPLECHECKBOX, SIMPLESTATUSBAR: none. FRAME: none, but it blocks earlier-created level-0 frames.
- CHATDISPLAY, CHECKBOX/GLUECHECKBOX, EDITBOX/GLUEEDITBOX/SLASHCHATBOX, MODEL and SLIDER also fire CONTROL_CLICK when `BlzFrameClick` is used on them.

## Repo mapping
Frame events are created with `createFrameEvent` in `src/components/Core/MonoFrame.ts`; frame callbacks should read the event value inside the callback.
