import { ICompositeFrameComponents } from "src/models/components";
import { ICompositeFrameConfigurationBase, ICompositeFrameCreationMethodsBase, ICompositeFrameProperties, IFrameBaseMethods } from "src/models/FrameTypes";
import { Frame } from "w3ts";

/**
 * A Composite Frame is composed of other Composite Frames or Mono Frames
 */
export abstract class CompositeFrame<Configuration extends ICompositeFrameConfigurationBase, ComponentTypes extends ICompositeFrameComponents>
    implements ICompositeFrameCreationMethodsBase<Configuration>, IFrameBaseMethods<Configuration>, ICompositeFrameProperties<Configuration, ComponentTypes>
{
    constructor(context: number) {
        this.context = context;
    }
    
    containerFrame?: Frame | undefined;
    context: number;
    name?: string | undefined;
    owner?: Frame | undefined;
    configuration?: Configuration | undefined;
    childFrames?: ComponentTypes | undefined;
    
    Create (args: { context: number; name?: string; owner?: Frame; configuration?: Configuration | undefined; }){ };
    CreateThemed(args: { context: number; name?: string; owner?: Frame; overrides?: Configuration | undefined }) {}
    SaveTheme(themeConfiguration: Configuration) {}
}

// const test = new CompositeFrame(0, "", FrameUtils.OriginFrameGameUI);
