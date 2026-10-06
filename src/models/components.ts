import { CompositeFrame, MonoFrame } from "../components";

export type ICompositeFrameChildFrames = { [key: string]: CompositeFrame<any, any> | CompositeFrame<any, any>[] | MonoFrame<any> | MonoFrame<any>[] };
