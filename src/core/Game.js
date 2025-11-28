import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { InputManager } from './InputManager.js';
import { Player } from '../entities/Player.js';
import { Ball } from '../entities/Ball.js';
import { Obstacle } from '../entities/Obstacle.js';
import { ParticleSystem } from '../effects/ParticleSystem.js';
import { AudioManager } from '../audio/AudioManager.js';

export class Game {
    constructor() {
        this.container = document.getElementById('game-container');

        // Three.js setup
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB); // Sky blue

        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 10, 15);
        this.camera.lookAt(0, 0, 0);

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.container.appendChild(this.renderer.domElement);

        // Physics setup
        this.world = new CANNON.World({
            gravity: new CANNON.Vec3(0, -9.82, 0), // m/s²
        });

        // Managers
        this.inputManager = new InputManager();
        this.particleSystem = new ParticleSystem(this.scene);
        this.audioManager = new AudioManager();

        // Lighting
        this.setupLights();

        // Basic Ground
        this.createGround();

        // Game State
        this.score = 0;
        this.entities = [];
        this.isGoalResetting = false;
        this.isGameOver = false;
        this.isPlaying = false;
        this.isPaused = false;

        // Level Config
        this.levels = [
            { time: 30, target: 3 },  // Level 1
            { time: 45, target: 6 },  // Level 2
            { time: 60, target: 10 }, // Level 3
            { time: 60, target: 12 }, // Level 4
            { time: 50, target: 15 }  // Level 5
        ];
        this.currentLevelIndex = 0;
        this.timeRemaining = 0;

        // UI Elements
        this.uiLevel = document.getElementById('level');
        this.uiTime = document.getElementById('time');
        this.uiScore = document.getElementById('score');
        this.uiTarget = document.getElementById('target');
        this.uiGameOver = document.getElementById('game-over-container');
        this.uiTitle = document.getElementById('game-over-title');
        this.uiMsg = document.getElementById('game-over-msg');
        this.btnRestart = document.getElementById('btn-restart');
        this.btnPause = document.getElementById('btn-pause');
        this.uiPauseMenu = document.getElementById('pause-container');
        this.btnResume = document.getElementById('btn-resume');
        this.btnRestartPause = document.getElementById('btn-restart-pause');

        // UI Listeners
        this.btnRestart.addEventListener('click', () => this.handleRestart());
        this.btnPause.addEventListener('click', () => this.togglePause());
        this.btnResume.addEventListener('click', () => this.togglePause());
        this.btnRestartPause.addEventListener('click', () => {
            this.togglePause();
            this.handleRestart();
        });

        // Keyboard shortcut for restart (Enter or R key) and Pause (Esc)
        window.addEventListener('keydown', (e) => {
            if (this.isGameOver && (e.key === 'Enter' || e.key === 'r' || e.key === 'R')) {
                this.handleRestart();
            }
            if (e.key === 'Escape') {
                this.togglePause();
            }
        });

        // Start Game
        this.startLevel(0);

        // Start background music on first user interaction
        window.addEventListener('click', () => {
            if (this.audioManager) {
                this.audioManager.playBGM();
            }
        }, { once: true });

        // Handle resize
        window.addEventListener('resize', () => this.onWindowResize(), false);

        // Start loop
        this.lastTime = performance.now();
        this.animate();
    }

    clearEntities() {
        // Remove visuals and bodies
        this.entities.forEach(entity => {
            if (entity.mesh) this.scene.remove(entity.mesh);
            if (entity.body) this.world.removeBody(entity.body);
        });
        this.entities = [];

        // Clear specific references
        this.player = null;
        this.ball = null;
    }

    startLevel(index) {
        if (index >= this.levels.length) {
            this.gameComplete();
            return;
        }

        this.currentLevelIndex = index;
        const config = this.levels[index];

        this.timeRemaining = config.time;
        this.targetScore = config.target;
        this.score = 0;
        this.isGameOver = false;
        this.isPlaying = true;
        this.isGoalResetting = false;

        // Update UI
        this.uiLevel.innerText = index + 1;
        this.uiTime.innerText = Math.ceil(this.timeRemaining);
        this.uiScore.innerText = this.score;
        this.uiTarget.innerText = this.targetScore;
        this.uiGameOver.style.display = 'none';

        this.clearEntities();

        console.log(`Starting Level ${index + 1}`);

        // Spawn Entities
        this.player = new Player(this, { x: 0, y: 2, z: 5 });
        this.ball = new Ball(this, { x: 0, y: 5, z: 0 });

        this.entities.push(this.player, this.ball);

        // Setup contact material between ball and player for better physics
        const ballMaterial = this.ball.body.material;
        const playerMaterial = this.player.body.material;
        const ballPlayerContact = new CANNON.ContactMaterial(ballMaterial, playerMaterial, {
            friction: 0.1,        // Low friction so ball slides off
            restitution: 0.7     // High bounce so ball bounces off player
        });
        this.world.addContactMaterial(ballPlayerContact);

        // Add some obstacles for difficulty increase in later levels?
        // For now, keep it simple as requested: just time and score.
        // Maybe add obstacles from Level 3 onwards?
        if (index >= 2) {
            for (let i = 0; i < (index - 1) * 2; i++) {
                const z = (Math.random() - 0.5) * 10;
                const x = (Math.random() - 0.5) * 8;
                const obstacle = new Obstacle(this, { x: x, y: 0.5, z: z });
                this.entities.push(obstacle);
            }
        }
    }

    handleRestart() {
        if (this.uiTitle.innerText === "GAME COMPLETE") {
            this.startLevel(0); // Restart whole game
        } else {
            this.startLevel(this.currentLevelIndex); // Retry current level
        }
    }

    levelComplete() {
        this.isPlaying = false;
        // Play victory animation
        if (this.player && this.player.playVictory) {
            this.player.playVictory();
        }
        // Trigger victory particles
        if (this.particleSystem) {
            this.particleSystem.createVictoryParticles({ x: 0, y: 5, z: -10 });
        }
        // Play victory sound
        if (this.audioManager) {
            this.audioManager.playSFX('victory');
        }
        // Update button text
        this.btnRestart.innerText = "Next Level";
        // Auto advance after short delay or show success screen?
        // Let's just go to next level immediately for flow, or show a quick message.
        // For now, immediate transition after 1s.
        console.log("Level Complete!");
        setTimeout(() => {
            this.startLevel(this.currentLevelIndex + 1);
        }, 1000);
    }

    levelFailed() {
        this.isPlaying = false;
        this.isGameOver = true;
        // Play defeat animation
        if (this.player && this.player.playDefeat) {
            this.player.playDefeat();
        }
        // Trigger defeat particles
        if (this.particleSystem) {
            this.particleSystem.createDefeatParticles({ x: 0, y: 10, z: 0 });
        }
        // Play defeat sound
        if (this.audioManager) {
            this.audioManager.playSFX('defeat');
        }
        this.uiTitle.innerText = "LEVEL FAILED";
        this.uiMsg.innerText = "Time's Up!";
        this.btnRestart.innerText = "Retry Level";
        this.uiGameOver.style.display = 'block';
    }

    gameComplete() {
        this.isPlaying = false;
        this.isGameOver = true;
        this.uiTitle.innerText = "GAME COMPLETE";
        this.uiMsg.innerText = "You beat all levels!";
        this.btnRestart.innerText = "Play Again";
        this.uiGameOver.style.display = 'block';
    }

    setupLights() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4); // Reduced ambient for better contrast
        this.scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 1.2); // Brighter sun
        dirLight.position.set(20, 30, 10);
        dirLight.castShadow = true;
        dirLight.shadow.mapSize.width = 2048; // Higher res shadows
        dirLight.shadow.mapSize.height = 2048;
        dirLight.shadow.camera.top = 30;
        dirLight.shadow.camera.bottom = -30;
        dirLight.shadow.camera.left = -30;
        dirLight.shadow.camera.right = 30;
        this.scene.add(dirLight);
    }

    createGround() {
        // Texture Loader
        const textureLoader = new THREE.TextureLoader();
        const grassTexture = textureLoader.load('/assets/grass.png');
        grassTexture.wrapS = THREE.RepeatWrapping;
        grassTexture.wrapT = THREE.RepeatWrapping;
        grassTexture.repeat.set(10, 10); // Repeat texture

        // Visual Ground
        const groundGeometry = new THREE.PlaneGeometry(50, 50);
        const groundMaterial = new THREE.MeshStandardMaterial({
            map: grassTexture,
            roughness: 0.8,
            metalness: 0.1
        });
        const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
        groundMesh.rotation.x = -Math.PI / 2;
        groundMesh.receiveShadow = true;
        this.scene.add(groundMesh);

        // Physics Ground
        const groundBody = new CANNON.Body({
            type: CANNON.Body.STATIC,
            shape: new CANNON.Plane(),
        });
        groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0); // Rotate to match visual
        this.world.addBody(groundBody);

        // Realistic Goal Structure
        const goalDepth = 3; // Depth of the goal

        // White metal material for goal posts
        const postMaterial = new THREE.MeshStandardMaterial({
            color: 0xFFFFFF,
            roughness: 0.4,
            metalness: 0.6
        });

        const postRadius = 0.12;
        const postHeight = 3;
        const goalWidth = 10;

        // Front posts
        const leftFrontPost = new THREE.Mesh(
            new THREE.CylinderGeometry(postRadius, postRadius, postHeight),
            postMaterial
        );
        leftFrontPost.position.set(-goalWidth / 2, postHeight / 2, -15);
        leftFrontPost.castShadow = true;
        this.scene.add(leftFrontPost);

        const rightFrontPost = new THREE.Mesh(
            new THREE.CylinderGeometry(postRadius, postRadius, postHeight),
            postMaterial
        );
        rightFrontPost.position.set(goalWidth / 2, postHeight / 2, -15);
        rightFrontPost.castShadow = true;
        this.scene.add(rightFrontPost);

        // Top crossbar
        const frontCrossbar = new THREE.Mesh(
            new THREE.CylinderGeometry(postRadius, postRadius, goalWidth + postRadius * 2),
            postMaterial
        );
        frontCrossbar.rotation.z = Math.PI / 2;
        frontCrossbar.position.set(0, postHeight, -15);
        frontCrossbar.castShadow = true;
        this.scene.add(frontCrossbar);

        // Back posts
        const leftBackPost = new THREE.Mesh(
            new THREE.CylinderGeometry(postRadius, postRadius, postHeight),
            postMaterial
        );
        leftBackPost.position.set(-goalWidth / 2, postHeight / 2, -15 - goalDepth);
        leftBackPost.castShadow = true;
        this.scene.add(leftBackPost);

        const rightBackPost = new THREE.Mesh(
            new THREE.CylinderGeometry(postRadius, postRadius, postHeight),
            postMaterial
        );
        rightBackPost.position.set(goalWidth / 2, postHeight / 2, -15 - goalDepth);
        rightBackPost.castShadow = true;
        this.scene.add(rightBackPost);

        // Back top crossbar
        const backCrossbar = new THREE.Mesh(
            new THREE.CylinderGeometry(postRadius, postRadius, goalWidth + postRadius * 2),
            postMaterial
        );
        backCrossbar.rotation.z = Math.PI / 2;
        backCrossbar.position.set(0, postHeight, -15 - goalDepth);
        backCrossbar.castShadow = true;
        this.scene.add(backCrossbar);

        // Side crossbars (connecting front to back)
        const leftSideCrossbar = new THREE.Mesh(
            new THREE.CylinderGeometry(postRadius, postRadius, goalDepth),
            postMaterial
        );
        leftSideCrossbar.rotation.x = Math.PI / 2;
        leftSideCrossbar.position.set(-goalWidth / 2, postHeight, -15 - goalDepth / 2);
        leftSideCrossbar.castShadow = true;
        this.scene.add(leftSideCrossbar);

        const rightSideCrossbar = new THREE.Mesh(
            new THREE.CylinderGeometry(postRadius, postRadius, goalDepth),
            postMaterial
        );
        rightSideCrossbar.rotation.x = Math.PI / 2;
        rightSideCrossbar.position.set(goalWidth / 2, postHeight, -15 - goalDepth / 2);
        rightSideCrossbar.castShadow = true;
        this.scene.add(rightSideCrossbar);

        // Goal Net - create a semi-transparent mesh net
        const netMaterial = new THREE.MeshStandardMaterial({
            color: 0xFFFFFF,
            transparent: true,
            opacity: 0.4,
            side: THREE.DoubleSide,
            wireframe: false
        });

        // Back net
        const backNet = new THREE.Mesh(
            new THREE.PlaneGeometry(goalWidth, postHeight, 20, 10),
            netMaterial
        );
        backNet.position.set(0, postHeight / 2, -15 - goalDepth);
        this.scene.add(backNet);

        // Left side net
        const leftNet = new THREE.Mesh(
            new THREE.PlaneGeometry(goalDepth, postHeight, 10, 10),
            netMaterial
        );
        leftNet.rotation.y = Math.PI / 2;
        leftNet.position.set(-goalWidth / 2, postHeight / 2, -15 - goalDepth / 2);
        this.scene.add(leftNet);

        // Right side net
        const rightNet = new THREE.Mesh(
            new THREE.PlaneGeometry(goalDepth, postHeight, 10, 10),
            netMaterial
        );
        rightNet.rotation.y = Math.PI / 2;
        rightNet.position.set(goalWidth / 2, postHeight / 2, -15 - goalDepth / 2);
        this.scene.add(rightNet);

        // Top net
        const topNet = new THREE.Mesh(
            new THREE.PlaneGeometry(goalWidth, goalDepth, 20, 10),
            netMaterial
        );
        topNet.rotation.x = Math.PI / 2;
        topNet.position.set(0, postHeight, -15 - goalDepth / 2);
        this.scene.add(topNet);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const time = performance.now();
        const dt = (time - this.lastTime) / 1000;
        this.lastTime = time;

        // Only update game logic if playing
        if (this.isPlaying && !this.isGameOver && !this.isPaused) {
            // Update Timer
            this.timeRemaining -= dt;
            if (this.timeRemaining <= 0) {
                this.timeRemaining = 0;
                this.levelFailed();
            }
            this.uiTime.innerText = Math.ceil(this.timeRemaining);

            // Step physics
            this.world.fixedStep();

            // Update entities
            this.entities.forEach(entity => {
                if (entity.update) entity.update(dt);
            });

            // Update particle system
            if (this.particleSystem) {
                this.particleSystem.update(dt);
            }

            // Check Goal
            this.checkGoal();

            // Camera follow player (simple)
            if (this.player) {
                this.camera.position.x = this.player.mesh.position.x;
                this.camera.position.z = this.player.mesh.position.z + 10;
                this.camera.lookAt(this.player.mesh.position);
            }
        }

        // Always render the scene
        this.renderer.render(this.scene, this.camera);
    }

    checkGoal() {
        if (this.isGoalResetting || !this.ball) return;

        const pos = this.ball.body.position;
        // Goal is at Z = -15, Width 10 (-5 to 5), Height 3, Depth 3
        if (pos.z < -15 && pos.z > -18 && pos.x > -5 && pos.x < 5 && pos.y < 3) {
            console.log("GOAL!");
            this.score++;
            this.uiScore.innerText = this.score;
            this.isGoalResetting = true;

            // Play goal sound
            if (this.audioManager) {
                this.audioManager.playSFX('goal');
            }

            if (this.score >= this.targetScore) {
                this.levelComplete();
            } else {
                setTimeout(() => this.resetBall(), 1000);
            }
        }

        // Check if ball went out of bounds (missed shot or backward kick)
        if (pos.z < -20 || pos.z > 15 || pos.x < -25 || pos.x > 25) {
            this.isGoalResetting = true;
            setTimeout(() => this.resetBall(), 1000);
        }
    }

    resetBall() {
        if (!this.ball) return;

        this.ball.body.position.set(0, 5, 0);
        this.ball.body.velocity.set(0, 0, 0);
        this.ball.body.angularVelocity.set(0, 0, 0);
        this.isGoalResetting = false;
    }

    togglePause() {
        if (!this.isPlaying || this.isGameOver) return;

        this.isPaused = !this.isPaused;

        if (this.isPaused) {
            this.uiPauseMenu.style.display = 'flex';
            this.btnPause.style.display = 'none';
        } else {
            this.uiPauseMenu.style.display = 'none';
            this.btnPause.style.display = 'flex';
            // Reset lastTime to prevent huge dt jump
            this.lastTime = performance.now();
        }
    }
}
