import { CompositeFrame } from "src/components";
import { MonoFrame } from "src/components/Core/MonoFrame";

export type ICompositeFrameComponents = { [key: string]: CompositeFrame<any, any> | MonoFrame };
