# Warcraft w3ts Frame Components

A library for reusable and composable frame components for modding the game of Warcraft 3.

Primarily uses frames of from the category of FRAME.

Simple components that help to eliminate some boiler plate when working with frames.

Nearly all frame components made using FRAME category of frames.

## Components

All components have a name, owner and container frame.

- ##### Container Frame
    - The container frame is typically an EMPTY or BACKDROP frame type and seerves as your primary reference frame which is the parent of any children frames within the conmponent.

- ##### Name
    - A simple string whose name is typically composed of the name + player index (context) + the component name

- ##### Owner
    - Most frames here will have a default owner of `ORIGIN_FRAME_GAME_UI` if one is not provided.

#### Grid

The grid component provides a versatile layout tool for organizing a collection of like frames.

Each grid item can contain any frame type or custom frame components.

The grid provides a render function which is used for the initial rendering of the grid.

## Caveats

There is only 1 case where a SIMPLE frame type is used, which is optional when creating a button.
