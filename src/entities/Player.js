import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class Player {
    constructor(game, position = { x: 0, y: 2, z: 5 }) {
        this.game = game;
        this.speed = 50; // 增加基础移动速度
        this.runSpeed = 100; // 增加冲刺速度（按住Shift）

        // Visual Mesh - will be loaded from GLTF
        this.mesh = new THREE.Group();
        this.mesh.position.set(position.x, position.y, position.z);
        this.mesh.castShadow = true;
        this.game.scene.add(this.mesh);

        // Load GLTF model
        this.loadModel();

        // Physics Body - Larger size for better visibility
        const shape = new CANNON.Cylinder(0.8, 0.8, 3.5, 8);

        // Create physics material for the player
        const playerMaterial = new CANNON.Material('player');

        this.body = new CANNON.Body({
            mass: 70, // kg
            shape: shape,
            position: new CANNON.Vec3(position.x, position.y, position.z),
            fixedRotation: true, // Prevent tipping over
            material: playerMaterial
        });
        // Rotate cylinder to align with Y axis if needed. 
        // In Cannon-es, Cylinder is Z-aligned. We need to rotate it.
        const quat = new CANNON.Quaternion();
        quat.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
        this.body.addShape(shape, new CANNON.Vec3(0, 0, 0), quat);

        this.game.world.addBody(this.body);

        // Shooting
        this.charge = 0;
        this.maxCharge = 100;
        this.isCharging = false;
        this.chargeBar = document.getElementById('charge-bar');
        // Animation
        this.mixer = null;
        this.actions = {};
        this.activeAction = null;
        this.lastAction = null;
    }

    loadModel() {
        const loader = new GLTFLoader();
        loader.load(
            '/assets/naruto_model/f631a1cffe4642b981a31a3b12946ec3.gltf',
            (gltf) => {
                // Model loaded successfully
                const model = gltf.scene;

                // Adjust scale and position if needed
                model.scale.set(5, 5, 5); // Make model even larger for better visibility
                model.position.y = -1.75; // Lower model to align with physics body
                model.rotation.y = Math.PI / 2; // Rotate -90 degrees to face the ball

                // Enable shadows
                model.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });

                this.mesh.add(model);
                console.log('Naruto model loaded successfully');

                // Setup Animations
                this.mixer = new THREE.AnimationMixer(model);
                this.setupAnimations(gltf.animations);
            },
            (progress) => {
                // Loading progress
                console.log('Loading model...', (progress.loaded / progress.total * 100).toFixed(2) + '%');
            },
            (error) => {
                console.error('Error loading Naruto model:', error);
                // Fallback: create simple humanoid if model fails to load
                this.createFallbackMesh();
            }
        );
    }

    createFallbackMesh() {
        // This is the original humanoid mesh as fallback - scaled up
        const skinMat = new THREE.MeshStandardMaterial({ color: 0xFFCCAA }); // Skin
        const kitMat = new THREE.MeshStandardMaterial({ color: 0xFF0000 }); // Red Kit
        const shortsMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF }); // White Shorts

        // Head - larger
        const headGeo = new THREE.SphereGeometry(0.45, 16, 16);
        const head = new THREE.Mesh(headGeo, skinMat);
        head.position.y = 1.2; // Adjusted for centered group
        head.castShadow = true;
        this.mesh.add(head);

        // Body - larger
        const bodyGeo = new THREE.BoxGeometry(0.9, 1.1, 0.5);
        const body = new THREE.Mesh(bodyGeo, kitMat);
        body.position.y = 0.2;
        body.castShadow = true;
        this.mesh.add(body);

        // Arms (Simple) - larger
        const armGeo = new THREE.CylinderGeometry(0.14, 0.14, 1.0);
        const leftArm = new THREE.Mesh(armGeo, skinMat);
        leftArm.position.set(-0.6, 0.2, 0);
        leftArm.rotation.z = 0.2;
        this.mesh.add(leftArm);

        const rightArm = new THREE.Mesh(armGeo, skinMat);
        rightArm.position.set(0.6, 0.2, 0);
        rightArm.rotation.z = -0.2;
        this.mesh.add(rightArm);

        // Legs - larger
        const legGeo = new THREE.CylinderGeometry(0.18, 0.18, 1.4);
        const leftLeg = new THREE.Mesh(legGeo, shortsMat);
        leftLeg.position.set(-0.25, -1.0, 0);
        this.mesh.add(leftLeg);

        const rightLeg = new THREE.Mesh(legGeo, shortsMat);
        rightLeg.position.set(0.25, -1.0, 0);
        this.mesh.add(rightLeg);
    }

    setupAnimations(animations) {
        if (!animations || animations.length === 0) return;

        // Log available animations to help debugging
        console.log("Available animations:", animations.map(a => a.name));

        // Helper to find animation by name (fuzzy match)
        const findAnim = (name) => {
            return animations.find(a => a.name.toLowerCase().includes(name.toLowerCase()));
        };

        // Map animations to actions
        // Adjust these names based on actual model content
        const idleAnim = findAnim('idle') || animations[0]; // Fallback to first anim
        const runAnim = findAnim('run') || findAnim('walk') || animations[1] || animations[0];
        const kickAnim = findAnim('attack') || findAnim('kick') || findAnim('punch') || animations[2] || animations[0];
        const victoryAnim = findAnim('victory') || findAnim('celebrate') || findAnim('cheer') || findAnim('win') || animations[3] || animations[0];
        const defeatAnim = findAnim('sad') || findAnim('defeat') || findAnim('lose') || findAnim('disappointed') || animations[4] || animations[0];

        if (idleAnim) this.actions['Idle'] = this.mixer.clipAction(idleAnim);
        if (runAnim) this.actions['Run'] = this.mixer.clipAction(runAnim);
        if (kickAnim) {
            this.actions['Kick'] = this.mixer.clipAction(kickAnim);
            this.actions['Kick'].setLoop(THREE.LoopOnce);
            this.actions['Kick'].clampWhenFinished = true;
        }
        if (victoryAnim) {
            this.actions['Victory'] = this.mixer.clipAction(victoryAnim);
            this.actions['Victory'].setLoop(THREE.LoopRepeat);
        }
        if (defeatAnim) {
            this.actions['Defeat'] = this.mixer.clipAction(defeatAnim);
            this.actions['Defeat'].setLoop(THREE.LoopRepeat);
        }

        console.log('Actions created:', Object.keys(this.actions));

        // Start with Idle
        if (this.actions['Idle']) {
            this.activeAction = this.actions['Idle'];
            this.activeAction.play();
        }
    }

    fadeToAction(name, duration = 0.2) {
        const nextAction = this.actions[name];
        if (!nextAction || nextAction === this.activeAction) return;

        // If kicking, don't interrupt unless it's finished or force? 
        // For now simple crossfade

        this.lastAction = this.activeAction;
        this.activeAction = nextAction;

        this.lastAction.fadeOut(duration);
        this.activeAction.reset().fadeIn(duration).play();
    }

    update(dt) {
        const input = this.game.inputManager.keys;

        // Movement
        const currentSpeed = input.shift ? this.runSpeed : this.speed;
        const velocity = new CANNON.Vec3(0, this.body.velocity.y, 0);

        if (input.forward) velocity.z -= currentSpeed;
        if (input.backward) velocity.z += currentSpeed;
        if (input.left) velocity.x -= currentSpeed;
        if (input.right) velocity.x += currentSpeed;

        this.body.velocity.x = velocity.x;
        this.body.velocity.z = velocity.z;

        // Sync mesh
        this.mesh.position.copy(this.body.position);
        this.mesh.quaternion.copy(this.body.quaternion);

        // Shooting Logic
        if (input.space) {
            this.isCharging = true;
            this.charge += dt * 100; // Charge up speed
            if (this.charge > this.maxCharge) this.charge = this.maxCharge;
        } else {
            if (this.isCharging) {
                // Release space -> Shoot
                this.shoot();
                this.isCharging = false;
                this.charge = 0;
            }
        }

        // Update UI
        if (this.chargeBar) {
            this.chargeBar.style.width = `${this.charge}%`;
            this.chargeBar.style.backgroundColor = `rgb(${255}, ${255 - this.charge * 2.55}, 0)`; // Yellow to Red
        }

        // Update Animation Mixer
        if (this.mixer) {
            this.mixer.update(dt);
            this.updateAnimationState();
        }
    }

    updateAnimationState() {
        // Simple state machine: Kick > Run > Idle

        // If kicking (playing Kick action and running), wait?
        // Actually, let's just check if we are currently playing Kick and it's running
        if (this.activeAction === this.actions['Kick'] && this.activeAction.isRunning()) {
            return; // Don't interrupt kick
        }

        // Check movement
        const speed = this.body.velocity.length();
        if (speed > 1.0) {
            this.fadeToAction('Run');
        } else {
            this.fadeToAction('Idle');
        }
    }

    shoot() {
        if (!this.game.ball) return;

        // Find direction: Player to Ball? Or Camera direction?
        // For now, shoot towards the direction the player is moving, or if stationary, towards +Z (or -Z depending on goal).
        // Better: Shoot from Player position towards Ball position?
        // No, Player kicks the ball. Player must be close to ball.

        const ballBody = this.game.ball.body;
        const dist = this.body.position.distanceTo(ballBody.position);

        if (dist < 5.0) { // Kick distance
            // Calculate direction
            const direction = new CANNON.Vec3();

            // If player is moving significantly, use movement direction
            const playerVel = this.body.velocity;
            const speed = Math.sqrt(playerVel.x * playerVel.x + playerVel.z * playerVel.z);

            if (speed > 1.0) {
                // Use movement direction
                direction.set(playerVel.x, 0, playerVel.z);
            } else {
                // Stationary: Use direction from Player to Ball
                ballBody.position.vsub(this.body.position, direction);
                direction.y = 0; // Flatten
            }

            direction.normalize();

            // Add some lift
            direction.y = 0.2;
            direction.normalize();

            // Force magnitude based on charge
            const force = 5 + (this.charge / 100) * 20; // Min 5, Max 25 impulse

            // Apply impulse
            const impulse = direction.scale(force);
            ballBody.applyImpulse(impulse, ballBody.position); // Apply at center

            console.log("Shot fired!", force);

            // Play kick sound
            if (this.game.audioManager) {
                this.game.audioManager.playSFX('kick');
            }

            // Play Kick Animation
            if (this.actions['Kick']) {
                // Force play kick
                const kick = this.actions['Kick'];
                if (this.activeAction !== kick) {
                    this.lastAction = this.activeAction;
                    this.activeAction = kick;
                    this.lastAction.fadeOut(0.1);
                    this.activeAction.reset().fadeIn(0.1).play();
                } else {
                    // Replay if already kicking
                    kick.reset().play();
                }
            }
        }
    }

    playVictory() {
        console.log('playVictory called, available actions:', Object.keys(this.actions));
        if (this.actions['Victory']) {
            if (this.activeAction) this.activeAction.stop();
            this.activeAction = this.actions['Victory'];
            this.activeAction.reset().play();
            console.log('Playing victory animation');
        } else {
            console.log('No victory animation available, trying Kick as fallback');
            // Fallback: Try to use Kick animation or any other animation
            if (this.actions['Kick']) {
                if (this.activeAction) this.activeAction.stop();
                this.activeAction = this.actions['Kick'];
                this.activeAction.reset().play();
            } else if (this.actions['Run']) {
                if (this.activeAction) this.activeAction.stop();
                this.activeAction = this.actions['Run'];
                this.activeAction.reset().play();
            }
        }
    }

    playDefeat() {
        console.log('playDefeat called, available actions:', Object.keys(this.actions));
        if (this.actions['Defeat']) {
            if (this.activeAction) this.activeAction.stop();
            this.activeAction = this.actions['Defeat'];
            this.activeAction.reset().play();
            console.log('Playing defeat animation');
        } else {
            console.log('No defeat animation available, using Idle as fallback');
            // Fallback: Use Idle animation
            if (this.actions['Idle']) {
                if (this.activeAction) this.activeAction.stop();
                this.activeAction = this.actions['Idle'];
                this.activeAction.reset().play();
            }
        }
    }
}
