import { IMonoFrameConfigurationBase } from "../../models";
import { MonoFrame } from "../Core/MonoFrame";

export interface MonoTestConfig extends IMonoFrameConfigurationBase {}

export class MonoTest extends MonoFrame<MonoTestConfig> {
    constructor() {
        super(0, {});
    }
}
