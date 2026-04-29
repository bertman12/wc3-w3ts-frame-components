import { Frame } from "w3ts";
import { AbstractFrameBase } from "./AbstractFrameBase";

class TestComponent extends AbstractFrameBase {
    private constructor(...baseArgs: ConstructorParameters<typeof AbstractFrameBase>) {
        super(...baseArgs);
    }

    public static createByType(...baseArgs: ConstructorParameters<typeof AbstractFrameBase>) {
        return new TestComponent(...baseArgs);
    }

    public static createByName(name: string, context: number, owner?: Frame, priority?: number) {
        return new TestComponent(name, context, owner, undefined, priority);
    }
}

// TestComponent.createType
