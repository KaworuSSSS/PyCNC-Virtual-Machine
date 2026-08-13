import * as THREE from "three";

// ========================================
// PyCNC Virtual Machine
// Machine Motion
// ========================================

export function createMotionController({

    carriage,
    gantry,
    zAxis,
    toolTip,
    toolWorld,
    TABLE_TOP,
    machineState,
    limits,
    workArea

}) {

    function applyMachinePosition() {

        carriage.position.x =
            machineState.x;

        gantry.position.z =
            machineState.y;

        const zTravel =
            workArea.Z -
            machineState.z;

        zAxis.position.y =
            zTravel;

        enforceToolLimit();

    }


    function enforceToolLimit() {

        toolTip.getWorldPosition(
            toolWorld
        );

        if (
            toolWorld.y <
            TABLE_TOP
        ) {

            const correction =
                TABLE_TOP -
                toolWorld.y;

            zAxis.position.y +=
                correction;

            machineState.z =
                THREE.MathUtils.clamp(

                    workArea.Z -
                    zAxis.position.y,

                    limits.Z_MIN,
                    limits.Z_MAX

                );

        }

    }


    function clampMachine() {

        machineState.x =
            THREE.MathUtils.clamp(

                machineState.x,

                limits.X_MIN,
                limits.X_MAX

            );

        machineState.y =
            THREE.MathUtils.clamp(

                machineState.y,

                limits.Y_MIN,
                limits.Y_MAX

            );

        machineState.z =
            THREE.MathUtils.clamp(

                machineState.z,

                limits.Z_MIN,
                limits.Z_MAX

            );

        applyMachinePosition();

    }


    return {

        applyMachinePosition,
        enforceToolLimit,
        clampMachine

    };

}
