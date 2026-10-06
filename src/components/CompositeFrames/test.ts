import { Frame } from "w3ts";
import { CompositeFrame } from "../Core/CompositeFrame";
import { ICompositeFrameConfigurationBase, ICompositeFrameChildFrames } from "../../models";

/**
 * The configuration for composite components should also list configurations for it's child components which can be passed into them to make them as configured.
 */
export interface TestCompositeFrameConfiguration extends ICompositeFrameConfigurationBase {
    propTest: number;
}

interface TestCompositeFrameChildFrames extends ICompositeFrameChildFrames {}

export class TestCompositeFrame extends CompositeFrame<TestCompositeFrameConfiguration, TestCompositeFrameChildFrames> {
    private constructor(...args: ConstructorParameters<typeof CompositeFrame<TestCompositeFrameConfiguration, TestCompositeFrameChildFrames>>) {
        super(...args);
        this.render();
    }

    /**
     * Consumer friendly defaults
     */
    static get DefaultConfiguration(): TestCompositeFrameConfiguration {
        return {
            propTest: 1,
            // somethingRequired: false,
        };
    }

    static Create(args: { context: number; name?: string; owner?: Frame; configuration?: TestCompositeFrameConfiguration }): TestCompositeFrame {
        return new TestCompositeFrame(args.context, args.configuration || TestCompositeFrame.DefaultConfiguration, args.name, args.owner);
    }

    protected render(): void {
        this.configuration;

        /**
         * Build the component using the configuration.
         */
    }
}
