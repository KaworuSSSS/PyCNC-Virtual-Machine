// ========================================
// PyCNC Virtual Machine
// Geometry helpers
// ========================================

export function mat(color, roughness = 0.5, metalness = 0.0) {
    return new THREE.MeshStandardMaterial({
        color: color,
        roughness: roughness,
        metalness: metalness
    });
}


export function box(
    width,
    height,
    depth,
    material,
    x = 0,
    y = 0,
    z = 0
) {
    const geometry = new THREE.BoxGeometry(
        width,
        height,
        depth
    );

    const mesh = new THREE.Mesh(
        geometry,
        material
    );

    mesh.position.set(x, y, z);

    return mesh;
}


export function cylinder(
    radius,
    height,
    material,
    x = 0,
    y = 0,
    z = 0
) {
    const geometry = new THREE.CylinderGeometry(
        radius,
        radius,
        height,
        32
    );

    const mesh = new THREE.Mesh(
        geometry,
        material
    );

    mesh.position.set(x, y, z);

    return mesh;
}


export function addBox(
    scene,
    width,
    height,
    depth,
    material,
    x = 0,
    y = 0,
    z = 0
) {
    const mesh = box(
        width,
        height,
        depth,
        material,
        x,
        y,
        z
    );

    scene.add(mesh);

    return mesh;
}
