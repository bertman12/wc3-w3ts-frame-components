import { Frame } from "w3ts";

/**
 * Requires the configuration object type of the component this is used on
 */
export interface IFrameBaseMethods<ConfigurationType> {
    /**
     * Saves a theme configuration which is used when using the CreateThemed function.
     * @param themeConfiguration
     */
    SaveTheme: (themeConfiguration: any) => void;
}

interface BaseObjArgs {
    context: number;
    name?: string;
    owner?: Frame;
}

export interface IFrameCreationMethodsBase {
    CreateDefault: (context: number, name?: string, owner?: Frame) => void;
    CreateThemed: (context: number, name?: string, owner?: Frame, overrides?: { [key: string]: any }) => void;
}

export interface IFrameCreationMethodsBaseMonoFrames extends IFrameCreationMethodsBase {
    CreateType: (context: number, name: string, owner?: Frame) => void;
    CreateNamed: (...args: any[]) => void;
    /**
     * Test
     * @param {{BaseObjArgs}} args
     * @returns
     */
    Func: (args: BaseObjArgs) => void;
}

const o1: IFrameCreationMethodsBaseMonoFrames = {
    CreateType: function (context: number, name: string, owner?: Frame): void {
        throw new Error("Function not implemented.");
    },
    CreateNamed: function (...args: any[]): void {
        throw new Error("Function not implemented.");
    },
    Func: function (args: BaseObjArgs): void {
        throw new Error("Function not implemented.");
    },
    CreateDefault: function (context: number, name?: string, owner?: Frame): void {
        throw new Error("Function not implemented.");
    },
    CreateThemed: function (context: number, name?: string, owner?: Frame, overrides?: { [key: string]: any }): void {
        throw new Error("Function not implemented.");
    },
};

o1.Func


export interface IFrameCreationMethodsBaseCompositeFrames extends IFrameCreationMethodsBase {
    // CreateType: (context: number, name: string, owner?: Frame) => void;
    // CreateNamed: (...args: any[]) => void;
}

// const obj: IFrameCreationMethodsBaseMonoFrames = {
//     CreateDefault: function (context: number, owner: Frame): void {
//         throw new Error("Function not implemented.");
//     },
//     CreateType: function (...args: any[]): void {
//         throw new Error("Function not implemented.");
//     }
// }

/**
 * Depending on if you are a non composite frame, you can pass in the inherit argument to the
 * CreateThemed, CreateType or CreateNamed functions
 */

/**
 * Frames which are basically just wrappers of the normal blizzard frames should have an expected set of arguments
 *
 * Composite frames should have their own arguments which make sense
 * - doesn't make sense to have the inherits property since that is for a single blizz frame type
 * - keeps context and name, if you want to name your frame
 *
 *
 * Both component and non composite frames can use some of the same interfaces
 */
