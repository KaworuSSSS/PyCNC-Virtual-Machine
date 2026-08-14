// ========================================
// PyCNC Virtual Machine
// Machine Configuration
// ========================================


window.WORK_AREA = {

    X: 110,
    Y: 70,
    Z: 5

};


window.LIMITS = {

    X_MIN: 0,
    X_MAX: WORK_AREA.X,

    Y_MIN: 0,
    Y_MAX: WORK_AREA.Y,

    Z_MIN: -5,
    Z_MAX: 0

};


window.MACHINE = {

    tableX:
        WORK_AREA.X,

    tableY:
        WORK_AREA.Y,

    tableThickness:
        40,

    frameHeight:
        850,

    columnSize:
        70,

    gantryThickness:
        70,

    gantryDepth:
        100,

    spindleWidth:
        90,

    spindleDepth:
        90,

    toolLength:
        120

};


window.TABLE_Y = 80;
