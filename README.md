# Warcraft w3ts Frame Components

A library for reusable and composable frame components for modding the game of Warcraft 3.

Primarily uses frames of from the category of FRAME.

The components help to reduce the boiler plate code needed when working with frames.

## Components

When a component is created, by default, it will be placed in center of the screen so that it is visible. This is just for quickly seeing the component rendered.

All components have a name, owner, inherits and container frame.

- ##### Container Frame
    - The container frame is typically an EMPTY or BACKDROP frame type and serves as your primary reference frame which is the parent of any children frames within the conmponent.

- ##### Name
    - A simple string whose name is typically composed of the name + player index (context) + the component name.
    - The name must not be the name of a simple frame type name.

- ##### Owner
    - Most frames here will have a default owner of `ORIGIN_FRAME_GAME_UI` if one is not provided.

- ##### Inherits
    - Defaults to empty string when not set.

- ##### Priority
    - Defaults to 0. Only used when creating a frame by name.

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

### Icon

A simle component which displays a texture icon.

### Backdrop

A simple wrapper for a backdrop frame.

### Empty Frame

A simple wrapper for a backdrop frame.

### Text Area

When on mouse enter is set, it will automatically enable and disable the textarea so that it does not retain focus after being clicked.

### Text

A basic component for text frames with additional built in functionality for automatic sizing.

### Tooltip

Simplifies tooltip creation.

It also provides a way for users to add their own icons and text to the tooltip which is displayed under the tooltip header.

Handles automatic resizing of tooltip background when changing header and body text.

## Caveats

All frames that are created are permanent and will never be deleted. This is to prevent desyncs and game crashes.

There is only 1 case where a SIMPLE frame type is used, which is optional when creating a button.

## Frame definitions and TOC Files

This library comes with it's own frame definitions files and TOC.

These are optional to use and not required.

The files provide a sleeker look for backdrop borders and backgrounds, glue buttons, text areas and scrollbars.
