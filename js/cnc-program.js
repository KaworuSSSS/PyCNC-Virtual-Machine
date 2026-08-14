/* ========================================
   CNC PROGRAM
======================================== */

let cncProgram = null;
let cncToolpath = [];


export async function loadCNCProgram() {

    try {

        const response =
            await fetch(
                "cnc_program.json"
            );


        if (!response.ok) {

            throw new Error(
                `No se pudo cargar cnc_program.json: ${response.status}`
            );

        }


        cncProgram =
            await response.json();


        if (
            !cncProgram.toolpath ||
            !Array.isArray(
                cncProgram.toolpath
            )
        ) {

            throw new Error(
                "El programa CNC no contiene un toolpath válido"
            );

        }


        cncToolpath =
            cncProgram.toolpath;


        console.log(
            "CNC PROGRAM CARGADO:",
            cncProgram
        );


        console.log(
            "TOOLPATH:",
            cncToolpath
        );


        console.log(
            "PUNTOS:",
            cncToolpath.length
        );


        return cncProgram;

    }
    catch (error) {

        console.error(
            "Error cargando programa CNC:",
            error
        );

        return null;

    }

}


export function getCNCProgram() {

    return cncProgram;

}


export function getCNCToolpath() {

    return cncToolpath;

}
