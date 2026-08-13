import * as THREE from "three";

// ========================================
// PyCNC Virtual Machine
// Materials
// ========================================

export const aluminum =
    new THREE.MeshStandardMaterial({
        color: 0x626b70,
        metalness: 0.85,
        roughness: 0.28
    });

export const aluminumDark =
    new THREE.MeshStandardMaterial({
        color: 0x272d31,
        metalness: 0.90,
        roughness: 0.22
    });

export const aluminumLight =
    new THREE.MeshStandardMaterial({
        color: 0x929b9f,
        metalness: 0.90,
        roughness: 0.20
    });

export const black =
    new THREE.MeshStandardMaterial({
        color: 0x101315,
        metalness: 0.88,
        roughness: 0.20
    });

export const steel =
    new THREE.MeshStandardMaterial({
        color: 0xb8c0c4,
        metalness: 0.94,
        roughness: 0.15
    });

export const yellow =
    new THREE.MeshStandardMaterial({
        color: 0xd5a72a,
        metalness: 0.55,
        roughness: 0.30
    });

export const workMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x8a5530,
        metalness: 0.10,
        roughness: 0.65
    });
