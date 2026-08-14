/* =========================================================
   PyCNC Virtual Machine
   CNC CORE
   =========================================================

   Incluye:

   - G-Code Parser
   - Motion Planner
   - Machine Controller
   - Job Manager
   - Toolpath
   - G90 / G91
   - G20 / G21
   - G92
   - G0 / G1
   - M0 / M2 / M3 / M5
   - Feed Rate
   - START / PAUSE / STOP / HOME

   ========================================================= */


/* =========================================================
   CNC CORE
   ========================================================= */

class CNCCore {


    constructor() {

        /* =================================================
           MACHINE
        ================================================= */

        this.position = {

            X: 0.0,
            Y: 0.0,
            Z: 0.0

        };


        /* =================================================
           MACHINE LIMITS
        ================================================= */

        this.limits = {

            X_MIN: 0,
            X_MAX: 110,

            Y_MIN: 0,
            Y_MAX: 70,

            Z_MIN: -70,
            Z_MAX: 70

        };


        /* =================================================
           MACHINE STATE
        ================================================= */

        this.state = "DISCONNECTED";


        /* =================================================
           CNC MODES
        ================================================= */

        this.coordinateMode =
            "absolute";


        this.units =
            "mm";


        this.feedRate =
            null;


        /* =================================================
           SPINDLE
        ================================================= */

        this.spindle = {

            running: false,
            speed: null

        };


        /* =================================================
           PROGRAM
        ================================================= */

        this.commands = [];

        this.movements = [];

        this.toolpath = [];


        /* =================================================
           JOB
        ================================================= */

        this.currentLine =
            0;


        this.progress =
            0;


        this.running =
            false;


        this.paused =
            false;


        this.stopped =
            false;


        /* =================================================
           HISTORY
        ================================================= */

        this.history = [];

    }


    /* =====================================================
       CONNECT
       ===================================================== */

    connect() {

        this.state =
            "IDLE";

        this.history.push(
            "CONNECT"
        );

        return "Simulator connected";

    }


    /* =====================================================
       DISCONNECT
       ===================================================== */

    disconnect() {

        this.state =
            "DISCONNECTED";

        this.running =
            false;

        this.history.push(
            "DISCONNECT"
        );

        return "Simulator disconnected";

    }


    /* =====================================================
       HOME
       ===================================================== */

    home() {

        this.position = {

            X: 0.0,
            Y: 0.0,
            Z: 0.0

        };


        this.history.push(
            "HOME"
        );


        return "Homing completed";

    }


    /* =====================================================
       CLAMP
       ===================================================== */

    clampPosition() {

        this.position.X =
            Math.max(

                this.limits.X_MIN,

                Math.min(

                    this.position.X,

                    this.limits.X_MAX

                )

            );


        this.position.Y =
            Math.max(

                this.limits.Y_MIN,

                Math.min(

                    this.position.Y,

                    this.limits.Y_MAX

                )

            );


        this.position.Z =
            Math.max(

                this.limits.Z_MIN,

                Math.min(

                    this.position.Z,

                    this.limits.Z_MAX

                )

            );

    }


    /* =====================================================
       MOVE ABSOLUTE
       ===================================================== */

    moveAbsolute(
        x,
        y,
        z
    ) {

        this.position = {

            X: Number(x),
            Y: Number(y),
            Z: Number(z)

        };


        this.clampPosition();


        this.toolpath.push(

            this.position.copy
                ? this.position.copy()
                : {
                    X: this.position.X,
                    Y: this.position.Y,
                    Z: this.position.Z
                }

        );


        this.history.push(

            `ABS X${x} Y${y} Z${z}`

        );


        return {

            position: {

                X: this.position.X,
                Y: this.position.Y,
                Z: this.position.Z

            }

        };

    }


    /* =====================================================
       MOVE RELATIVE
       ===================================================== */

    moveRelative(
        axis,
        distance
    ) {

        axis =
            axis.toUpperCase();


        if (
            !["X", "Y", "Z"]
                .includes(axis)
        ) {

            throw new Error(
                `Unsupported axis '${axis}'`
            );

        }


        this.position[axis] +=
            Number(distance);


        this.clampPosition();


        this.toolpath.push({

            X: this.position.X,
            Y: this.position.Y,
            Z: this.position.Z

        });


        this.history.push(

            `${axis} ${Number(distance) >= 0 ? "+" : ""}${distance}`

        );


        return {

            axis: axis,

            position:
                this.position[axis]

        };

    }


    /* =====================================================
       PARSE G-CODE
       ===================================================== */

    parseGCode(
        gcode
    ) {

        const commands = [];


        const lines =
            gcode.split(/\r?\n/);


        for (
            let line of lines
        ) {


            /* ---------------------------------------------
               REMOVE COMMENTS
               --------------------------------------------- */

            line =
                line.replace(
                    /\([^)]*\)/g,
                    ""
                );


            line =
                line.replace(
                    /;.*/g,
                    ""
                );


            line =
                line.trim();


            if (
                !line
            ) {

                continue;

            }


            /* ---------------------------------------------
               TOKENIZE
               --------------------------------------------- */

            const tokens =
                line.split(
                    /\s+/
                );


            const command =
                tokens[0]
                    .toUpperCase();


            const parameters = {};


            for (
                let i = 1;
                i < tokens.length;
                i++
            ) {

                const token =
                    tokens[i]
                        .toUpperCase();


                const letter =
                    token.charAt(0);


                const value =
                    parseFloat(
                        token.substring(1)
                    );


                if (
                    [
                        "X",
                        "Y",
                        "Z",
                        "F",
                        "S"
                    ].includes(letter)
                    &&
                    !Number.isNaN(value)
                ) {

                    parameters[letter] =
                        value;

                }

            }


            commands.push({

                command:
                    command,

                parameters:
                    parameters

            });

        }


        return commands;

    }


    /* =====================================================
       PLAN
       ===================================================== */

    plan(
        commands
    ) {

        const movements = [];


        for (
            const command
            of commands
        ) {


            const gcode =
                command.command;


            const parameters =
                command.parameters || {};


            /* ---------------------------------------------
               M0
               --------------------------------------------- */

            if (
                gcode === "M0"
            ) {

                movements.push({

                    command: "M0",

                    action: "pause"

                });


                continue;

            }


            /* ---------------------------------------------
               M2
               --------------------------------------------- */

            if (
                gcode === "M2"
            ) {

                movements.push({

                    command: "M2",

                    action:
                        "program_end"

                });


                continue;

            }


            /* ---------------------------------------------
               M3
               --------------------------------------------- */

            if (
                gcode === "M3"
            ) {

                movements.push({

                    command: "M3",

                    spindle_speed:
                        parameters.S ?? null

                });


                continue;

            }


            /* ---------------------------------------------
               M5
               --------------------------------------------- */

            if (
                gcode === "M5"
            ) {

                movements.push({

                    command: "M5",

                    action:
                        "spindle_stop"

                });


                continue;

            }


            /* ---------------------------------------------
               G90
               --------------------------------------------- */

            if (
                gcode === "G90"
            ) {

                this.coordinateMode =
                    "absolute";


                continue;

            }


            /* ---------------------------------------------
               G91
               --------------------------------------------- */

            if (
                gcode === "G91"
            ) {

                this.coordinateMode =
                    "relative";


                continue;

            }


            /* ---------------------------------------------
               G20
               --------------------------------------------- */

            if (
                gcode === "G20"
            ) {

                this.units =
                    "inch";


                continue;

            }


            /* ---------------------------------------------
               G21
               --------------------------------------------- */

            if (
                gcode === "G21"
            ) {

                this.units =
                    "mm";


                continue;

            }


            /* ---------------------------------------------
               G92
               --------------------------------------------- */

            if (
                gcode === "G92"
            ) {

                for (
                    const axis
                    of ["X", "Y", "Z"]
                ) {

                    if (
                        parameters[axis]
                        !== undefined
                    ) {

                        this.position[axis] =
                            parameters[axis];

                    }

                }


                continue;

            }


            /* ---------------------------------------------
               FEED RATE
               --------------------------------------------- */

            if (
                parameters.F
                !== undefined
            ) {

                this.feedRate =
                    parameters.F;

            }


            /* ---------------------------------------------
               MOVEMENT
               --------------------------------------------- */

            const hasMovement =

                parameters.X !== undefined ||

                parameters.Y !== undefined ||

                parameters.Z !== undefined;


            if (
                !hasMovement
            ) {

                continue;

            }


            const target = {

                X: this.position.X,

                Y: this.position.Y,

                Z: this.position.Z

            };


            for (
                const axis
                of ["X", "Y", "Z"]
            ) {

                if (
                    parameters[axis]
                    === undefined
                ) {

                    continue;

                }


                let value =
                    parameters[axis];


                /* -----------------------------------------
                   INCH → MM
                   ----------------------------------------- */

                if (
                    this.units === "inch"
                ) {

                    value *=
                        25.4;

                }


                /* -----------------------------------------
                   ABSOLUTE
                   ----------------------------------------- */

                if (
                    this.coordinateMode
                    === "absolute"
                ) {

                    target[axis] =
                        value;

                }


                /* -----------------------------------------
                   RELATIVE
                   ----------------------------------------- */

                else {

                    target[axis] +=
                        value;

                }

            }


            this.position = {

                X: target.X,

                Y: target.Y,

                Z: target.Z

            };


            movements.push({

                command:
                    gcode,

                target: {

                    X: target.X,

                    Y: target.Y,

                    Z: target.Z

                },

                ...(this.feedRate !== null
                    ? {
                        feed_rate:
                            this.feedRate
                    }
                    : {})

            });

        }


        return movements;

    }


    /* =====================================================
       LOAD G-CODE
       ===================================================== */

    loadGCode(
        gcode
    ) {

        this.commands =
            this.parseGCode(
                gcode
            );


        /* Reset planner */

        this.position = {

            X: 0,
            Y: 0,
            Z: 0

        };


        this.coordinateMode =
            "absolute";


        this.units =
            "mm";


        this.feedRate =
            null;


        this.movements =
            this.plan(
                this.commands
            );


        /* Reset job */

        this.currentLine =
            0;


        this.progress =
            0;


        this.running =
            false;


        this.paused =
            false;


        this.stopped =
            false;


        /* Reset execution position */

        this.position = {

            X: 0,
            Y: 0,
            Z: 0

        };


        this.toolpath = [];


        this.history.push(

            `LOAD GCODE: ${this.commands.length} commands`

        );


        return this.movements;

    }


    /* =====================================================
       EXECUTE COMMAND
       ===================================================== */

    executeCommand(
        command
    ) {


        /* ---------------------------------------------
           M0
           --------------------------------------------- */

        if (
            command.command === "M0"
        ) {

            this.paused =
                true;

            this.running =
                false;

            this.state =
                "PAUSED";


            return "Job paused";

        }


        /* ---------------------------------------------
           M2
           --------------------------------------------- */

        if (
            command.command === "M2"
        ) {

            this.running =
                false;

            this.state =
                "COMPLETED";


            this.progress =
                100;


            return "Program ended";

        }


        /* ---------------------------------------------
           M3
           --------------------------------------------- */

        if (
            command.command === "M3"
        ) {

            this.spindle.running =
                true;


            this.spindle.speed =
                command.spindle_speed;


            return "Spindle started";

        }


        /* ---------------------------------------------
           M5
           --------------------------------------------- */

        if (
            command.command === "M5"
        ) {

            this.spindle.running =
                false;


            this.spindle.speed =
                null;


            return "Spindle stopped";

        }


        /* ---------------------------------------------
           MOVEMENT
           --------------------------------------------- */

        if (
            command.target
        ) {

            const target =
                command.target;


            this.moveAbsolute(

                target.X,

                target.Y,

                target.Z

            );


            return "Movement executed";

        }


        return null;

    }


    /* =====================================================
       START
       ===================================================== */

    start() {

        if (
            this.movements.length === 0
        ) {

            return "No job loaded";

        }


        if (
            this.state ===
            "COMPLETED"
        ) {

            return "Job is already completed";

        }


        if (
            this.state ===
            "STOPPED"
        ) {

            return "Job is stopped";

        }


        if (
            this.paused
        ) {

            return "Job is paused";

        }


        this.running =
            true;


        this.state =
            "RUNNING";


        const results = [];


        while (
            this.currentLine
            <
            this.movements.length
        ) {

            const command =
                this.movements[
                    this.currentLine
                ];


            const result =
                this.executeCommand(
                    command
                );


            if (
                result !== null
            ) {

                results.push(
                    result
                );

            }


            this.currentLine++;


            this.updateProgress();


            if (
                this.paused
            ) {

                return results;

            }


            if (
                this.state ===
                "COMPLETED"
            ) {

                return results;

            }


            if (
                this.stopped
            ) {

                return results;

            }

        }


        this.running =
            false;


        this.state =
            "COMPLETED";


        this.progress =
            100;


        return results;

    }


    /* =====================================================
       RESUME
       ===================================================== */

    resume() {

        if (
            !this.paused
        ) {

            return "Job is not paused";

        }


        this.paused =
            false;


        this.running =
            true;


        this.state =
            "RUNNING";


        const results = [];


        while (
            this.currentLine
            <
            this.movements.length
        ) {

            const command =
                this.movements[
                    this.currentLine
                ];


            const result =
                this.executeCommand(
                    command
                );


            if (
                result !== null
            ) {

                results.push(
                    result
                );

            }


            this.currentLine++;


            this.updateProgress();


            if (
                this.paused
            ) {

                return results;

            }


            if (
                this.state ===
                "COMPLETED"
            ) {

                return results;

            }

        }


        this.running =
            false;


        this.state =
            "COMPLETED";


        this.progress =
            100;


        return results;

    }


    /* =====================================================
       PAUSE
       ===================================================== */

    pause() {

        if (
            !this.running
        ) {

            return "Job is not running";

        }


        this.paused =
            true;


        this.running =
            false;


        this.state =
            "PAUSED";


        return "Job paused";

    }


    /* =====================================================
       STOP
       ===================================================== */

    stop() {

        this.running =
            false;


        this.paused =
            false;


        this.stopped =
            true;


        this.state =
            "STOPPED";


        return "Job stopped";

    }


    /* =====================================================
       UPDATE PROGRESS
       ===================================================== */

    updateProgress() {

        if (
            this.movements.length === 0
        ) {

            this.progress =
                0;

            return;

        }


        this.progress =

            (
                this.currentLine /

                this.movements.length

            ) *

            100;

    }


    /* =====================================================
       STATUS
       ===================================================== */

    getStatus() {

        return {

            state:
                this.state,

            position: {

                X: this.position.X,

                Y: this.position.Y,

                Z: this.position.Z

            },

            currentLine:
                this.currentLine,

            totalCommands:
                this.movements.length,

            progress:
                this.progress,

            spindle: {

                running:
                    this.spindle.running,

                speed:
                    this.spindle.speed

            },

            history:
                [...this.history]

        };

    }


    /* =====================================================
       TOOLPATH
       ===================================================== */

    getToolpath() {

        return this.toolpath.map(
            point => ({

                X: point.X,

                Y: point.Y,

                Z: point.Z

            })
        );

    }

}


/* =========================================================
   GLOBAL
   ========================================================= */

window.CNCCore =
    CNCCore;


/* =========================================================
   TEST PROGRAM
   ========================================================= */

window.testCNC =
    function () {


        const cnc =
            new CNCCore();


        console.log(
            "========================================"
        );


        console.log(
            "PyCNC Virtual Machine"
        );


        console.log(
            "CNC CORE TEST"
        );


        console.log(
            "========================================"
        );


        console.log(
            cnc.connect()
        );


        const gcode = `

G90
G21

G0 X50
G0 Y25
G1 Z-5

M2

`;


        console.log(
            "G-CODE:"
        );


        console.log(
            gcode
        );


        const movements =
            cnc.loadGCode(
                gcode
            );


        console.log(
            "MOVEMENTS:"
        );


        console.log(
            movements
        );


        const results =
            cnc.start();


        console.log(
            "RESULTS:"
        );


        console.log(
            results
        );


        console.log(
            "STATUS:"
        );


        console.log(
            cnc.getStatus()
        );


        console.log(
            "TOOLPATH:"
        );


        console.log(
            cnc.getToolpath()
        );


        return cnc;

    };
