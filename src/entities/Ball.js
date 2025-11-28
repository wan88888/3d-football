import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export class Ball {
    constructor(game, position = { x: 0, y: 5, z: 0 }) {
        this.game = game;

        // Visual Mesh
        this.createMesh();
        this.mesh.position.set(position.x, position.y, position.z);
        this.game.scene.add(this.mesh);

        // Physics Body - slightly larger for better visibility
        const shape = new CANNON.Sphere(1);

        // Create physics material for the ball
        const ballMaterial = new CANNON.Material('ball');

        this.body = new CANNON.Body({
            mass: 0.45, // Standard football mass approx 0.45kg
            shape: shape,
            position: new CANNON.Vec3(position.x, position.y, position.z),
            linearDamping: 0.3, // Simulate air resistance / rolling friction
            angularDamping: 0.3,
            material: ballMaterial
        });
        this.game.world.addBody(this.body);
    }

    createMesh() {
        const textureLoader = new THREE.TextureLoader();
        const texture = textureLoader.load('/assets/football.png');

        const geometry = new THREE.SphereGeometry(1, 32, 32); // Larger ball
        const material = new THREE.MeshStandardMaterial({
            map: texture,
            roughness: 0.7,
            metalness: 0.1
        });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
    }

    update(dt) {
        // Sync mesh with body
        this.mesh.position.copy(this.body.position);
        this.mesh.quaternion.copy(this.body.quaternion);

        // Reset if falls off world
        if (this.body.position.y < -10) {
            this.body.position.set(0, 5, 0);
            this.body.velocity.set(0, 0, 0);
            this.body.angularVelocity.set(0, 0, 0);
        }
    }
}
