import { Frame } from "w3ts";
import { AbstractFrameBase } from "./AbstractFrameBase";
import { FrameUtils } from "src/frame-utils";

/**
 * Utilize this for custom components
 */
export class CompositeComponent  {
    constructor(context: number, name: string, owner: Frame) {
        // super(name, context, owner);
    }
}

const test = new CompositeComponent(0,'', FrameUtils.OriginFrameGameUI);

