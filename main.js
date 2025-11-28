import './style.css';
import { Game } from './src/core/Game.js';

window.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    window.game = game; // For debugging
});
