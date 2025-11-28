import { AUDIO } from '../config/constants.js';

export class AudioManager {
    constructor(loadingManager = null) {
        this.bgm = null;
        this.sfx = {};
        this.isMuted = false;
        this.bgmVolume = AUDIO.BGM_VOLUME;
        this.sfxVolume = AUDIO.SFX_VOLUME;
        this.loadingManager = loadingManager;
        this.errors = [];

        this.init();
    }

    init() {
        // Load background music with error handling
        try {
            if (this.loadingManager) this.loadingManager.registerAsset();

            this.bgm = new Audio(AUDIO.PATHS.BGM);
            this.bgm.loop = true;
            this.bgm.volume = this.bgmVolume;

            this.bgm.addEventListener('canplaythrough', () => {
                if (this.loadingManager) this.loadingManager.assetLoaded('Background Music');
            }, { once: true });

            this.bgm.addEventListener('error', (e) => {
                console.error('Failed to load background music:', e);
                this.errors.push({ type: 'bgm', path: AUDIO.PATHS.BGM, error: e });
                if (this.loadingManager) this.loadingManager.assetError('Background Music', e);
                this.bgm = null;
            });
        } catch (error) {
            console.error('Error initializing background music:', error);
            this.errors.push({ type: 'bgm', error });
            if (this.loadingManager) this.loadingManager.assetError('Background Music', error);
        }

        // Load sound effects with error handling
        const sfxList = [
            { key: 'kick', path: AUDIO.PATHS.KICK, name: 'Kick SFX' },
            { key: 'goal', path: AUDIO.PATHS.GOAL, name: 'Goal SFX' },
            { key: 'victory', path: AUDIO.PATHS.VICTORY, name: 'Victory SFX' },
            { key: 'defeat', path: AUDIO.PATHS.DEFEAT, name: 'Defeat SFX' }
        ];

        sfxList.forEach(({ key, path, name }) => {
            try {
                if (this.loadingManager) this.loadingManager.registerAsset();

                const audio = new Audio(path);
                audio.volume = this.sfxVolume;

                audio.addEventListener('canplaythrough', () => {
                    if (this.loadingManager) this.loadingManager.assetLoaded(name);
                }, { once: true });

                audio.addEventListener('error', (e) => {
                    console.error(`Failed to load ${name}:`, e);
                    this.errors.push({ type: 'sfx', key, path, error: e });
                    if (this.loadingManager) this.loadingManager.assetError(name, e);
                });

                this.sfx[key] = audio;
            } catch (error) {
                console.error(`Error initializing ${name}:`, error);
                this.errors.push({ type: 'sfx', key, error });
                if (this.loadingManager) this.loadingManager.assetError(name, error);
            }
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
            try {
                // Clone the audio to allow overlapping sounds
                const sound = this.sfx[name].cloneNode();
                sound.volume = this.sfxVolume;
                sound.play().catch(err => {
                    console.log(`Failed to play ${name}:`, err);
                });
            } catch (error) {
                console.error(`Error playing SFX ${name}:`, error);
            }
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

    hasErrors() {
        return this.errors.length > 0;
    }

    getErrors() {
        return this.errors;
    }
}
