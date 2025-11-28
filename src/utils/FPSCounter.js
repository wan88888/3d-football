/**
 * FPS Counter
 * Displays frame rate in development mode
 */

export class FPSCounter {
    constructor() {
        this.fps = 0;
        this.frames = 0;
        this.lastTime = performance.now();
        this.fpsElement = null;

        this.createDisplay();
    }

    createDisplay() {
        this.fpsElement = document.createElement('div');
        this.fpsElement.id = 'fps-counter';
        this.fpsElement.style.cssText = `
            position: fixed;
            top: 10px;
            left: 10px;
            background: rgba(0, 0, 0, 0.7);
            color: #0f0;
            padding: 5px 10px;
            font-family: monospace;
            font-size: 14px;
            border-radius: 3px;
            z-index: 10000;
        `;
        document.body.appendChild(this.fpsElement);
    }

    update() {
        this.frames++;
        const currentTime = performance.now();
        const elapsed = currentTime - this.lastTime;

        if (elapsed >= 1000) {
            this.fps = Math.round((this.frames * 1000) / elapsed);
            this.fpsElement.textContent = `FPS: ${this.fps}`;
            this.frames = 0;
            this.lastTime = currentTime;
        }
    }

    destroy() {
        if (this.fpsElement && this.fpsElement.parentNode) {
            this.fpsElement.parentNode.removeChild(this.fpsElement);
        }
    }
}
