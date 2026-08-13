import * as THREE from "three";

import {
    box,
    cylinder,
    addBox
} from "./geometry.js";

import {
    aluminum,
    aluminumDark,
    aluminumLight,
    black,
    steel,
    yellow,
    workMaterial
} from "./materials.js";


// ========================================
// PyCNC Virtual Machine
// Machine 3D Model
// ========================================

export function createMachine(scene) {

    /* MACHINE */

    const cnc =
        new THREE.Group();

    scene.add(
        cnc
    );


    /* BASE */

    addBox(

        cnc,

        WORK_AREA.X + 180,
        60,
        WORK_AREA.Y + 180,

        aluminumDark,

        WORK_AREA.X / 2,
        30,
        WORK_AREA.Y / 2

    );


    /* TABLE */

    addBox(

        cnc,

        WORK_AREA.X,
        MACHINE.tableThickness,
        WORK_AREA.Y,

        aluminumLight,

        WORK_AREA.X / 2,
        TABLE_Y,
        WORK_AREA.Y / 2

    );

    const TABLE_TOP =
        TABLE_Y +
        MACHINE.tableThickness / 2;


    /* WORK SURFACE */

    addBox(

        cnc,

        WORK_AREA.X - 40,
        8,
        WORK_AREA.Y - 40,

        black,

        WORK_AREA.X / 2,
        TABLE_TOP + 4,
        WORK_AREA.Y / 2

    );


    /* T SLOTS */

    for (
        let x = 50;
        x < WORK_AREA.X;
        x += 50
    ) {

        addBox(

            cnc,

            4,
            2,
            WORK_AREA.Y - 60,

            aluminumLight,

            x,
            TABLE_TOP + 9,
            WORK_AREA.Y / 2

        );

    }


    /* WORKPIECE */

    const workpiece =
        addBox(

            cnc,

            420,
            35,
            260,

            workMaterial,

            WORK_AREA.X / 2,
            TABLE_TOP + 26,
            WORK_AREA.Y / 2

        );


    /* VISE */

    addBox(
        cnc,
        500,
        20,
        330,
        aluminumDark,
        WORK_AREA.X / 2,
        TABLE_TOP + 14,
        WORK_AREA.Y / 2
    );

    addBox(
        cnc,
        25,
        90,
        330,
        steel,
        WORK_AREA.X / 2 - 230,
        TABLE_TOP + 65,
        WORK_AREA.Y / 2
    );

    addBox(
        cnc,
        25,
        90,
        330,
        steel,
        WORK_AREA.X / 2 + 230,
        TABLE_TOP + 65,
        WORK_AREA.Y / 2
    );


    /* COLUMNS */

    const columnHeight =
        MACHINE.frameHeight;

    const columnY =
        TABLE_TOP +
        columnHeight / 2;

    for (
        const x of [
            35,
            WORK_AREA.X - 35
        ]
    ) {

        for (
            const z of [
                35,
                WORK_AREA.Y - 35
            ]
        ) {

            addBox(

                cnc,

                MACHINE.columnSize,
                columnHeight,
                MACHINE.columnSize,

                aluminum,

                x,
                columnY,
                z

            );

            addBox(

                cnc,

                MACHINE.columnSize + 25,
                35,
                MACHINE.columnSize + 25,

                aluminumDark,

                x,
                TABLE_TOP + 20,
                z

            );

        }

    }


    /* UPPER FRAME */

    const FRAME_TOP =
        TABLE_TOP +
        columnHeight;

    addBox(

        cnc,

        WORK_AREA.X + 70,
        80,
        100,

        aluminumDark,

        WORK_AREA.X / 2,
        FRAME_TOP,
        40

    );

    addBox(

        cnc,

        WORK_AREA.X + 70,
        80,
        100,

        aluminumDark,

        WORK_AREA.X / 2,
        FRAME_TOP,
        WORK_AREA.Y - 40

    );


    /* GANTRY */

    const gantry =
        new THREE.Group();

    cnc.add(
        gantry
    );

    gantry.position.set(
        0,
        0,
        0
    );


    /* GANTRY BEAM */

    addBox(

        gantry,

        WORK_AREA.X + 30,
        90,
        100,

        aluminum,

        WORK_AREA.X / 2,
        FRAME_TOP - 120,
        0

    );


    /* GANTRY SIDE PLATES */

    addBox(
        gantry,
        60,
        180,
        110,
        aluminumDark,
        45,
        FRAME_TOP - 190,
        0
    );

    addBox(
        gantry,
        60,
        180,
        110,
        aluminumDark,
        WORK_AREA.X - 45,
        FRAME_TOP - 190,
        0
    );


    /* Y RAILS */

    for (
        const x of [
            180,
            WORK_AREA.X - 180
        ]
    ) {

        const rail =
            cylinder(
                16,
                WORK_AREA.Y,
                steel
            );

        rail.rotation.x =
            Math.PI / 2;

        rail.position.set(
            x,
            FRAME_TOP - 100,
            WORK_AREA.Y / 2
        );

        cnc.add(
            rail
        );

    }


    /* CARRIAGE */

    const carriage =
        new THREE.Group();

    gantry.add(
        carriage
    );

    carriage.position.x =
        WORK_AREA.X / 2;


    /* CARRIAGE BODY */

    addBox(

        carriage,

        180,
        180,
        130,

        aluminumDark,

        0,
        FRAME_TOP - 220,
        0

    );

    addBox(

        carriage,

        150,
        100,
        150,

        aluminum,

        0,
        FRAME_TOP - 340,
        0

    );


    /* X RAILS */

    for (
        const y of [
            FRAME_TOP - 270,
            FRAME_TOP - 340
        ]
    ) {

        const rail =
            cylinder(
                14,
                WORK_AREA.X,
                steel
            );

        rail.rotation.z =
            Math.PI / 2;

        rail.position.set(
            WORK_AREA.X / 2,
            y,
            -70
        );

        gantry.add(
            rail
        );

    }


    /* Z AXIS */

    const zAxis =
        new THREE.Group();

    carriage.add(
        zAxis
    );


    /* Z BODY */

    addBox(

        zAxis,

        MACHINE.spindleWidth,
        360,
        MACHINE.spindleDepth,

        black,

        0,
        0,
        0

    );


    /* Z GUIDE RODS */

    for (
        const x of [-30, 30]
    ) {

        const rod =
            cylinder(
                12,
                360,
                steel
            );

        rod.position.set(
            x,
            0,
            -65
        );

        zAxis.add(
            rod
        );

    }


    /* SPINDLE */

    const spindle =
        new THREE.Group();

    zAxis.add(
        spindle
    );


    /* SPINDLE BODY */

    const spindleBody =
        cylinder(
            42,
            180,
            black
        );

    spindleBody.position.y =
        -40;

    spindle.add(
        spindleBody
    );


    /* SPINDLE TOP */

    const spindleTop =
        cylinder(
            48,
            45,
            aluminum
        );

    spindleTop.position.y =
        70;

    spindle.add(
        spindleTop
    );


    /* MOTOR */

    const motor =
        cylinder(
            55,
            90,
            aluminumDark
        );

    motor.position.y =
        135;

    spindle.add(
        motor
    );


    /* MOTOR RINGS */

    for (
        let y = 95;
        y <= 165;
        y += 15
    ) {

        const ring =
            cylinder(
                58,
                5,
                aluminum
            );

        ring.position.y =
            y;

        spindle.add(
            ring
        );

    }


    /* TOOL ROTATION */

    const toolRotation =
        new THREE.Group();

    spindle.add(
        toolRotation
    );


    /* SHAFT */

    const shaft =
        cylinder(
            16,
            80,
            steel
        );

    shaft.position.y =
        -155;

    toolRotation.add(
        shaft
    );


    /* COLLET */

    const collet =
        cylinder(
            20,
            35,
            steel
        );

    collet.position.y =
        -210;

    toolRotation.add(
        collet
    );


    /* CUTTER */

    const cutter =
        cylinder(
            8,
            MACHINE.toolLength,
            steel
        );

    cutter.position.y =
        -285;

    toolRotation.add(
        cutter
    );


    /* TOOL TIP */

    const toolTip =
        cylinder(
            9,
            20,
            yellow
        );

    toolTip.position.y =
        -355;

    toolRotation.add(
        toolTip
    );


    /* RETURN MACHINE OBJECTS */

    return {

        cnc,

        gantry,

        carriage,

        zAxis,

        spindle,

        toolRotation,

        toolTip,

        workpiece,

        TABLE_TOP,

        FRAME_TOP

    };

}
