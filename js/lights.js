import * as THREE from "three";

// ========================================
// PyCNC Virtual Machine
// Scene lighting
// ========================================

export function setupLights(scene) {

    scene.add(
        new THREE.HemisphereLight(
            0xe8eef2,
            0x161b20,
            2.0
        )
    );


    const keyLight =
        new THREE.DirectionalLight(
            0xffffff,
            3.5
        );

    keyLight.position.set(
        900,
        1800,
        1000
    );

    keyLight.castShadow =
        true;

    keyLight.shadow.mapSize.set(
        2048,
        2048
    );

    scene.add(
        keyLight
    );


    const fillLight =
        new THREE.DirectionalLight(
            0x8ca9c7,
            1.1
        );

    fillLight.position.set(
        -900,
        900,
        -900
    );

    scene.add(
        fillLight
    );

}
