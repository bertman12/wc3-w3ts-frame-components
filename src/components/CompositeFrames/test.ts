import { ICompositeFrameComponents } from "src/models/components";
import { ICompositeFrameConfigurationBase } from "src/models/FrameTypes";
import { Frame } from "w3ts";
import { CompositeFrame } from "../Core/CompositeFrame";

/**
 * The configuration for composite components should also list configurations for it's child components which can be passed into them to make them as configured.
 */
export interface TestCompositeFrameConfiguration extends ICompositeFrameConfigurationBase {
    propTest: number;
}

interface TestCompositeFrameChildFrames extends ICompositeFrameComponents {}

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
            somethingRequired: false,
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

const x = TestCompositeFrame.Create({ context: 0, configuration: { propTest: 1, somethingRequired: false } });
