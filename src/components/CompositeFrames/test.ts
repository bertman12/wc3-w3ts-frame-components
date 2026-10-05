import { ICompositeFrameComponents } from "src/models/components";
import { ICompositeFrameConfigurationBase } from "src/models/FrameTypes";
import { Frame } from "w3ts";
import { CompositeFrame } from "../Core/CompositeFrame";
import { AbstractFrameBase } from "../AbstractFrameBase";

export interface TestCompositeFrameConfiguration extends ICompositeFrameConfigurationBase {
    f: number;
}

interface TestCompositeFrameChildFrames extends ICompositeFrameComponents {}

export class TestCompositeFrame extends CompositeFrame<TestCompositeFrameConfiguration, TestCompositeFrameChildFrames> {
    context: number = 0;

    constructor() {
        super();
        // this.context = context;
    }

    static {
        const x = 5;
    }

    Create(args: { context: number; name?: string; owner?: Frame; configuration?: TestCompositeFrameConfiguration | undefined }): TestCompositeFrame {
        // throw new Error("Method not implemented.");
        // return new TestCompositeFrame(0);
    }

    private Render() {}

    // constructor(context) {
    //     // super(0);
    //     const theme: TestCompositeFrameConfiguration = {
    //         f: 0,
    //         somethingRequired: false,
    //     };
    //     FrameComponentThemes.TestTheme = theme;
    // }
}

const x = new TestCompositeFrame().Create({ context: 0 });
