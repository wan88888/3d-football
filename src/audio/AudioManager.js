export class AudioManager {
    constructor() {
        this.bgm = null;
        this.sfx = {};
        this.isMuted = false;
        this.bgmVolume = 0.3;
        this.sfxVolume = 0.5;

        this.init();
    }

    init() {
        // Load background music
        this.bgm = new Audio('/assets/audio/bgm/background.mp3');
        this.bgm.loop = true;
        this.bgm.volume = this.bgmVolume;

        // Load sound effects
        this.sfx.kick = new Audio('/assets/audio/sfx/kick.mp3');
        this.sfx.goal = new Audio('/assets/audio/sfx/goal.mp3');
        this.sfx.victory = new Audio('/assets/audio/sfx/victory.mp3');
        this.sfx.defeat = new Audio('/assets/audio/sfx/defeat.mp3');

        // Set volume for all sound effects
        Object.values(this.sfx).forEach(sound => {
            sound.volume = this.sfxVolume;
        });

        console.log('AudioManager initialized');
    }

    playBGM() {
        if (!this.isMuted && this.bgm) {
            this.bgm.play().catch(err => {
                console.log('BGM autoplay blocked:', err);
                // Note: Modern browsers block autoplay until user interaction
            });
        }
    }

    stopBGM() {
        if (this.bgm) {
            this.bgm.pause();
            this.bgm.currentTime = 0;
        }
    }

    playSFX(name) {
        if (!this.isMuted && this.sfx[name]) {
            // Clone the audio to allow overlapping sounds
            const sound = this.sfx[name].cloneNode();
            sound.volume = this.sfxVolume;
            sound.play().catch(err => {
                console.log(`Failed to play ${name}:`, err);
            });
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.isMuted) {
            this.stopBGM();
        } else {
            this.playBGM();
        }
        return this.isMuted;
    }

    setBGMVolume(volume) {
        this.bgmVolume = Math.max(0, Math.min(1, volume));
        if (this.bgm) {
            this.bgm.volume = this.bgmVolume;
        }
    }

    setSFXVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
        Object.values(this.sfx).forEach(sound => {
            sound.volume = this.sfxVolume;
        });
    }
}
