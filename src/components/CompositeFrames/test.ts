import { ICompositeFrameComponents } from "src/models/components";
import { FrameComponentThemes } from "src/theme";
import { CompositeFrame } from "../Core/CompositeFrame";
import { ICompositeFrameConfigurationBase } from "src/models/FrameTypes";

export interface TestCompositeFrameConfiguration extends ICompositeFrameConfigurationBase {
    f: number;
}

interface TestCompositeFrameChildFrames extends ICompositeFrameComponents {}

export class TestCompositeFrame extends CompositeFrame<TestCompositeFrameConfiguration, TestCompositeFrameChildFrames> {
    constructor() {
        super(0);
        const theme: TestCompositeFrameConfiguration = {
            f: 0,
            somethingRequired: false
        };

        FrameComponentThemes.TestTheme = theme;
    }
}
