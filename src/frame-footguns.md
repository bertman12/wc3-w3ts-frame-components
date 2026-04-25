/\*\*

-   @HelpfulLinks
-   https://www.hiveworkshop.com/threads/ui-simpleframes.320385/#post-3694269
-
-   https://www.hiveworkshop.com/threads/ui-toc-files.315854/
-
-   Layer are a fdf feature for Simpleframes that can be used to set the order of String/Texture inside a SimpleFrame. Inside a Layer only String and Texture can be defined.
-
-   The game does not like it, if you use this frame natives onto String/Texture, it will crash the game:
-   BlzFrameSetVisible
-   BlzFrameIsVisible
-   BlzFrameSetAlpha
-   BlzFrameSetLevel
-   BlzFrameSetEnable
-   BlzFrameSetScale
-   BlzFrameSetParent
-   BlzDestroyFrame​
-
-
-   :::For positioning:::
-   Min X Min Y
-   0.0 0.0
-   Max X Max Y
-   0.8 0.6
-
-
-   @factoids
-   Hiding origin frames will still show child frames if they are created after being hidden.
-
-
-
-
-
-   We are allowed to have multiple frames with the same name on screen.
-   const frame = BlzCreateFrame("QuestButtonBaseTemplate", FrameUtils.OriginFrameGameUI, 0, 0);
    const frame2 = BlzCreateFrame("QuestButtonBaseTemplate", FrameUtils.OriginFrameGameUI, 0, 1);

    @WARNING do not get frames or create frames inside a local player block to avoid desyncs
    \*/

Codewise one can not access inherited childFrames using BlzGetFrameByName. With the release of the native BlzFrameGetChild in V1.32.6 one is able to get the inherited childFrames during the runtime, in 1.32.6 this native ignores String&Texture childFrames.

### FRAME CREATION

We are allowed to create simple frames using the following

```ts
BlzCreateFrameByType("SIMPLEFRAME", "myTextureTest", FrameUtils.OriginFrameGameUI, "TestTexture", 0);
```
