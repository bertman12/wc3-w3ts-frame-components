import { CompositeFrame, MonoFrame } from "src/components";

export type ICompositeFrameComponents = { [key: string]: CompositeFrame<any, any> | CompositeFrame<any, any>[] | MonoFrame<any> | MonoFrame<any>[] };
