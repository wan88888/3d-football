import * as THREE from 'three';
import { PARTICLES } from '../config/constants.js';

export class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.particles = [];
    }

    createVictoryParticles(position = { x: 0, y: 5, z: 0 }) {
        // Create golden/colorful firework particles
        const particleCount = PARTICLES.VICTORY_COUNT;
        const geometry = new THREE.BufferGeometry();
        const positions = [];
        const colors = [];
        const velocities = [];

        for (let i = 0; i < particleCount; i++) {
            // Start position (center)
            positions.push(position.x, position.y, position.z);

            // Random colorful colors (gold, yellow, orange, red)
            const colorChoice = Math.random();
            let color;
            if (colorChoice < 0.25) {
                color = new THREE.Color(0xFFD700); // Gold
            } else if (colorChoice < 0.5) {
                color = new THREE.Color(0xFFA500); // Orange
            } else if (colorChoice < 0.75) {
                color = new THREE.Color(0xFF4500); // Red-Orange
            } else {
                color = new THREE.Color(0xFFFF00); // Yellow
            }
            colors.push(color.r, color.g, color.b);

            // Random velocity (burst upward and outward)
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI * 0.5; // Upper hemisphere
            const speed = 5 + Math.random() * 10;
            velocities.push(
                Math.sin(phi) * Math.cos(theta) * speed,
                Math.cos(phi) * speed + 5, // Bias upward
                Math.sin(phi) * Math.sin(theta) * speed
            );
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: PARTICLES.VICTORY_SIZE,
            vertexColors: true,
            transparent: true,
            opacity: 1.0,
            blending: THREE.AdditiveBlending
        });

        const particleSystem = new THREE.Points(geometry, material);
        this.scene.add(particleSystem);

        this.particles.push({
            system: particleSystem,
            velocities: velocities,
            lifetime: PARTICLES.VICTORY_LIFETIME,
            age: 0
        });

        console.log('Victory particles created');
    }

    createDefeatParticles(position = { x: 0, y: 10, z: 0 }) {
        // Create gray/blue rain particles falling down
        const particleCount = PARTICLES.DEFEAT_COUNT;
        const geometry = new THREE.BufferGeometry();
        const positions = [];
        const colors = [];
        const velocities = [];

        for (let i = 0; i < particleCount; i++) {
            // Random starting position in a wide area above
            positions.push(
                position.x + (Math.random() - 0.5) * 20,
                position.y + Math.random() * 5,
                position.z + (Math.random() - 0.5) * 20
            );

            // Gray/blue colors
            const colorChoice = Math.random();
            let color;
            if (colorChoice < 0.5) {
                color = new THREE.Color(0x808080); // Gray
            } else {
                color = new THREE.Color(0x4682B4); // Steel Blue
            }
            colors.push(color.r, color.g, color.b);

            // Velocity (falling down slowly)
            velocities.push(
                (Math.random() - 0.5) * 0.5, // Slight horizontal drift
                -2 - Math.random() * 3, // Fall down
                (Math.random() - 0.5) * 0.5
            );
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: PARTICLES.DEFEAT_SIZE,
            vertexColors: true,
            transparent: true,
            opacity: 0.8
        });

        const particleSystem = new THREE.Points(geometry, material);
        this.scene.add(particleSystem);

        this.particles.push({
            system: particleSystem,
            velocities: velocities,
            lifetime: PARTICLES.DEFEAT_LIFETIME,
            age: 0
        });

        console.log('Defeat particles created');
    }

    update(dt) {
        // Update all active particle systems
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.age += dt;

            // Update positions
            const positions = particle.system.geometry.attributes.position.array;
            for (let j = 0; j < positions.length; j += 3) {
                positions[j] += particle.velocities[j] * dt;
                positions[j + 1] += particle.velocities[j + 1] * dt;
                positions[j + 2] += particle.velocities[j + 2] * dt;

                // Apply gravity
                particle.velocities[j + 1] -= 9.8 * dt;
            }
            particle.system.geometry.attributes.position.needsUpdate = true;

            // Fade out over time
            const fadeStart = particle.lifetime * 0.6;
            if (particle.age > fadeStart) {
                const fadeProgress = (particle.age - fadeStart) / (particle.lifetime - fadeStart);
                particle.system.material.opacity = 1.0 - fadeProgress;
            }

            // Remove if expired
            if (particle.age >= particle.lifetime) {
                this.scene.remove(particle.system);
                particle.system.geometry.dispose();
                particle.system.material.dispose();
                this.particles.splice(i, 1);
            }
        }
    }

    clear() {
        // Remove all particles
        for (const particle of this.particles) {
            this.scene.remove(particle.system);
            particle.system.geometry.dispose();
            particle.system.material.dispose();
        }
        this.particles = [];
    }
}
