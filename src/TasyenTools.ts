// -- returns the local current main selected unit, using it in a sync gamestate relevant manner breaks the game.

import { Frame } from "w3ts";

/**
 * @todo Leaking about 7 handles
 *
 *
 * Since this needs to be ran multiple times per second, we should make sure we only run this when we absolutely have to.
 * In our case, this would be when a unit is selecting a building which can actually train units with custom resource values.
 * Or, we could make it do that for all.
 *
 * @returns
 */
export function GetMainSelectedUnitEx() {
    const unitIndex = GetSelectedUnitIndex();
    if (!unitIndex) {
        return;
    }

    const mainSelect = GetMainSelectedUnit(unitIndex);

    return mainSelect;
}

/**
 * Container Frame
 */
let unitButtonFramesContainer: framehandle | undefined = undefined;
const unitButtonFrames: framehandle[] = [];
/**
 * @todo
 * I think we need a map or array for each player's own selection data since we will be running timer to check if they changed their focused unit type in their unit selection
 */
let group: group | undefined;
let units: unit[] = [];

const filter = Filter(function () {
    let unit = GetFilterUnit();
    if (!unit) {
        return false;
    }

    const prio = BlzGetUnitRealField(unit, UNIT_RF_PRIORITY);
    let found = false;

    // -- compare the current unit with allready found, to place it in the right slot
    for (let x = 0; x < units.length; x++) {
        const value = units[x];

        // -- higher prio than this take it's slot
        if (BlzGetUnitRealField(value, UNIT_RF_PRIORITY) < prio) {
            units.splice(x, 1, unit, value);
            found = true;
            // print("Found! higher prio ");

            break;
        }
        // -- equal prio and better colisions Value
        else if (BlzGetUnitRealField(value, UNIT_RF_PRIORITY) == prio && GetUnitOrderValue(value) > GetUnitOrderValue(unit)) {
            // print("Found! equal prio and better colisions Value ");
            //we delete value at index x, then reinsert value after the new unit which takes its place
            units.splice(x, 1, unit, value);

            found = true;
            break;
        }
    }

    // -- not found add it at the end
    if (!found) {
        units.push(unit);
    }

    unit = undefined;
    return false;
});

/**
 * This works, since it's based on the highlight frame being visible.
 */
function GetSelectedUnitIndex() {
    // -- local player is in group selection?
    if (unitButtonFramesContainer && BlzFrameIsVisible(unitButtonFramesContainer)) {
        // -- find the first visible yellow Background Frame
        for (let int = 0; int < unitButtonFrames.length; int++) {
            //may need to add a local player check here.
            if (BlzFrameIsVisible(unitButtonFrames[int])) {
                return int;
            }
        }
    }

    return undefined;
}

function GetUnitOrderValue(unit: unit) {
    // --heroes use the handleId
    if (IsUnitType(unit, UNIT_TYPE_HERO)) {
        return GetHandleId(unit);
    } else {
        // --units use unitCode
        return GetUnitTypeId(unit);
    }
}

function GetMainSelectedUnit(index: number): unit | undefined {
    if (group === undefined) {
        return;
    }

    //jassbot recommends calling this before enuming selections in multiplayer
    // SyncSelections();

    if (index !== undefined) {
        //possibly need for player who triggered selection event.
        GroupEnumUnitsSelected(group, GetLocalPlayer(), filter);
        const unit = units[index];

        // const names: string[] = [];
        // units.forEach((u) => {
        //     names.push(tColor(GetObjectName(Unit.fromHandle(u)?.typeId || 0) || "", "goldenrod"));
        // });

        // print(names.join(", "));

        units = [];

        return unit;
    } else {
        GroupEnumUnitsSelected(group, GetLocalPlayer(), undefined);
        return FirstOfGroup(group);
    }
}

export function InitTasyenGetMainSelectedUnit() {
    const console = Frame.fromHandle(BlzGetFrameByName("ConsoleUI", 0));
    if (!console) {
        return;
    }

    const bottomUI = console.getChild(1);
    if (!bottomUI) {
        return;
    }

    const unitInfoDisplayArea = bottomUI.getChild(2);
    if (!unitInfoDisplayArea) {
        return;
    }

    const groupframe = unitInfoDisplayArea.getChild(5);
    if (!groupframe) {
        return;
    }

    unitButtonFramesContainer = BlzFrameGetChild(groupframe.handle, 0);
    if (!unitButtonFramesContainer) {
        return;
    }

    // group = GetUnitsSelectedAll(Players[0].handle);
    group = CreateGroup();

    // -- give this frames a handleId
    for (let int = 0; int < BlzFrameGetChildrenCount(unitButtonFramesContainer); int++) {
        const buttonContainer = BlzFrameGetChild(unitButtonFramesContainer, int);
        if (!buttonContainer) {
            return;
        }

        unitButtonFrames[int] = BlzFrameGetChild(buttonContainer, 0) as framehandle;

        //Didn't work!
        // const f = Frame.fromHandle(unitButtonFrames[int]);
        // if (f) {
        //     const og = f.setWidth;
        //     f.setWidth = (width: number) => {
        //         print("WIDTH SET!");
        //         return og(width);
        //     };
        // }
    }
}
