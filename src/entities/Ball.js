import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { BALL, FIELD } from '../config/constants.js';

export class Ball {
    constructor(game, position = { x: 0, y: 5, z: 0 }) {
        this.game = game;

        // Visual Mesh
        this.createMesh();
        this.mesh.position.set(position.x, position.y, position.z);
        this.game.scene.add(this.mesh);

        // Physics Body - slightly larger for better visibility
        const shape = new CANNON.Sphere(BALL.RADIUS);

        // Create physics material for the ball
        const ballMaterial = new CANNON.Material('ball');

        this.body = new CANNON.Body({
            mass: BALL.MASS, // Standard football mass approx 0.45kg
            shape: shape,
            position: new CANNON.Vec3(position.x, position.y, position.z),
            linearDamping: BALL.LINEAR_DAMPING, // Simulate air resistance / rolling friction
            angularDamping: BALL.ANGULAR_DAMPING,
            material: ballMaterial
        });
        this.game.world.addBody(this.body);
    }

    createMesh() {
        const textureLoader = new THREE.TextureLoader();
        const texture = textureLoader.load('/assets/football.png');

        const geometry = new THREE.SphereGeometry(BALL.RADIUS, 32, 32); // Larger ball
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
        if (this.body.position.y < FIELD.GROUND_FALL_Y) {
            this.body.position.set(0, 5, 0);
            this.body.velocity.set(0, 0, 0);
            this.body.angularVelocity.set(0, 0, 0);
        }
    }
}
