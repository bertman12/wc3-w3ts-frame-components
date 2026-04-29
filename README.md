# Warcraft w3ts Frame Components

A library for reusable and composable frame components for modding the game of Warcraft 3.

Primarily uses frames of from the category of FRAME.

Simple components that help to eliminate some boiler plate when working with frames.

Nearly all frame components made using FRAME category of frames.

## Components

When a component is created, by default, it will be placed in center of the screen so that it is visible. This is just for quickly seeing the component rendered.

All components have a name, owner, inherits and container frame.

- ##### Container Frame
    - The container frame is typically an EMPTY or BACKDROP frame type and serves as your primary reference frame which is the parent of any children frames within the conmponent.

- ##### Name
    - A simple string whose name is typically composed of the name + player index (context) + the component name

- ##### Owner
    - Most frames here will have a default owner of `ORIGIN_FRAME_GAME_UI` if one is not provided.

- ##### Inherits
    - Defaults to empty string when not set.

### Grid

The grid component provides a versatile layout tool for organizing a collection of like frames.

Each grid item can contain any frame type or custom frame components.

The grid provides a render function which is used for the initial rendering of the grid.

### Button

When on click is set, it will automatically enable and disable the button so that it does not retain focus after being clicked.

When on click and a sound path is set, the sound will be played locally for the player.

### Glue Text Button

When on click is set, it will automatically enable and disable the button so that it does not retain focus after being clicked.

When on click and a sound path is set, the sound will be played locally for the player.

## Caveats

All frames that are created are permanent and will never be deleted. This is to prevent desyncs and game crashes.

There is only 1 case where a SIMPLE frame type is used, which is optional when creating a button.

## Frame definitions and TOC Files

This library comes with it's own frame definitions files and TOC.

These are optional to use and not required.

The files provide a sleeker look for backdrop borders and backgrounds, glue buttons, text areas and scrollbars.
