import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export class Obstacle {
    constructor(game, position = { x: 0, y: 0.5, z: 0 }) {
        this.game = game;

        // Visual Mesh - enlarged cone
        const geometry = new THREE.ConeGeometry(0.7, 1.5, 8);
        const material = new THREE.MeshStandardMaterial({ color: 0xFF6600, roughness: 0.5 });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(position.x, position.y, position.z);
        this.mesh.castShadow = true;
        this.game.scene.add(this.mesh);

        // Physics Body - enlarged
        const shape = new CANNON.Cylinder(0.01, 0.7, 1.5, 8);
        // Cannon cylinder is Z-aligned, rotate to Y
        const quat = new CANNON.Quaternion();
        quat.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);

        this.body = new CANNON.Body({
            mass: 5,
            shape: shape,
            position: new CANNON.Vec3(position.x, position.y, position.z),
        });
        this.body.addShape(shape, new CANNON.Vec3(0, 0, 0), quat);

        this.game.world.addBody(this.body);
    }

    update(dt) {
        // Sync mesh
        this.mesh.position.copy(this.body.position);
        this.mesh.quaternion.copy(this.body.quaternion);
    }
}
