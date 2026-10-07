import type { CompositeFrame, MonoFrame } from "../components";
import type { Grid } from "../grid";

export type ICompositeFrameChildFrames = { [key: string]: CompositeFrame<any, any> | CompositeFrame<any, any>[] | Grid<any, any> | MonoFrame<any> | MonoFrame<any>[] | undefined };
