/**
 * Environment Configuration
 * Reads from environment variables with fallback defaults
 */

// Helper to parse boolean from env
const parseBool = (value, defaultValue) => {
    if (value === undefined || value === null || value === '') return defaultValue;
    return value === 'true' || value === '1';
};

// Helper to parse number from env
const parseNum = (value, defaultValue) => {
    const num = parseFloat(value);
    return isNaN(num) ? defaultValue : num;
};

export const env = {
    // Audio Settings
    AUDIO_ENABLED: parseBool(import.meta.env.VITE_AUDIO_ENABLED, true),
    BGM_VOLUME: parseNum(import.meta.env.VITE_BGM_VOLUME, 0.3),
    SFX_VOLUME: parseNum(import.meta.env.VITE_SFX_VOLUME, 0.5),

    // Particle Settings
    PARTICLE_VICTORY_COUNT: parseNum(import.meta.env.VITE_PARTICLE_VICTORY_COUNT, 200),
    PARTICLE_DEFEAT_COUNT: parseNum(import.meta.env.VITE_PARTICLE_DEFEAT_COUNT, 150),

    // Debug Mode
    DEBUG_MODE: parseBool(import.meta.env.VITE_DEBUG_MODE, false),
    SHOW_FPS: parseBool(import.meta.env.VITE_SHOW_FPS, false),

    // Performance
    MAX_FPS: parseNum(import.meta.env.VITE_MAX_FPS, 60),
    ENABLE_SHADOWS: parseBool(import.meta.env.VITE_ENABLE_SHADOWS, true),

    // Development
    isDev: import.meta.env.DEV,
    isProd: import.meta.env.PROD
};

// Log config in development
if (env.DEBUG_MODE || env.isDev) {
    console.log('Environment Config:', env);
}
