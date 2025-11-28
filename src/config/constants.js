/**
 * Game Constants
 * 集中管理游戏中的魔法数字和配置
 */

import { env } from './env.js';

// 玩家配置
export const PLAYER = {
    SPEED: 50,                  // 基础移动速度
    RUN_SPEED: 100,            // 冲刺速度
    MASS: 70,                  // 质量 (kg)
    RADIUS: 0.8,               // 半径
    HEIGHT: 3.5,               // 高度
    KICK_DISTANCE: 5.0,        // 踢球距离
    MIN_MOVEMENT_SPEED: 1.0    // 最小移动速度判定
};

// 球配置
export const BALL = {
    RADIUS: 1,                 // 半径
    MASS: 0.45,               // 质量 (kg)
    LINEAR_DAMPING: 0.3,      // 线性阻尼
    ANGULAR_DAMPING: 0.3,     // 角阻尼
    MIN_SHOT_FORCE: 5,        // 最小射门力度
    MAX_SHOT_FORCE: 25        // 最大射门力度
};

// 球门配置
export const GOAL = {
    WIDTH: 10,                 // 宽度
    HEIGHT: 3,                 // 高度
    DEPTH: 3,                  // 深度
    POSITION_Z: -15,           // Z 轴位置
    POST_RADIUS: 0.12          // 门柱半径
};

// 场地边界
export const FIELD = {
    FORWARD_BOUNDARY: -20,     // 前方边界（球门后方）
    BACKWARD_BOUNDARY: 15,     // 后方边界（玩家后方）
    LEFT_BOUNDARY: -25,        // 左侧边界
    RIGHT_BOUNDARY: 25,        // 右侧边界
    GROUND_FALL_Y: -10         // 球掉落重置高度
};

// 物理材质参数
export const PHYSICS = {
    GRAVITY: -9.82,            // 重力加速度
    BALL_PLAYER_FRICTION: 0.1, // 球与玩家摩擦力
    BALL_PLAYER_RESTITUTION: 0.7, // 球与玩家弹性系数
    BALL_LIFT_FACTOR: 0.2      // 射门抬升系数
};

// 粒子效果配置
export const PARTICLES = {
    VICTORY_COUNT: env.PARTICLE_VICTORY_COUNT,    // 胜利粒子数量
    VICTORY_LIFETIME: 3.0,                         // 胜利粒子生命周期(秒)
    DEFEAT_COUNT: env.PARTICLE_DEFEAT_COUNT,      // 失败粒子数量
    DEFEAT_LIFETIME: 4.0,                          // 失败粒子生命周期(秒)
    VICTORY_SIZE: 0.3,                            // 胜利粒子大小
    DEFEAT_SIZE: 0.2                              // 失败粒子大小
};

// 音频配置
export const AUDIO = {
    BGM_VOLUME: env.BGM_VOLUME,                   // 背景音乐音量
    SFX_VOLUME: env.SFX_VOLUME,                   // 音效音量
    PATHS: {
        BGM: '/assets/audio/bgm/background.mp3',
        KICK: '/assets/audio/sfx/kick.mp3',
        GOAL: '/assets/audio/sfx/goal.mp3',
        VICTORY: '/assets/audio/sfx/victory.mp3',
        DEFEAT: '/assets/audio/sfx/defeat.mp3'
    }
};

// 游戏逻辑配置
export const GAME = {
    CHARGE_SPEED: 100,         // 蓄力速度
    MAX_CHARGE: 100,           // 最大蓄力值
    GOAL_RESET_DELAY: 1000,    // 进球后重置延迟(毫秒)
    LEVEL_COMPLETE_DELAY: 1000 // 关卡完成延迟(毫秒)
};

// 关卡配置
export const LEVELS = [
    { time: 30, target: 3 },   // Level 1
    { time: 45, target: 6 },   // Level 2
    { time: 60, target: 10 },  // Level 3
    { time: 60, target: 12 },  // Level 4
    { time: 50, target: 15 }   // Level 5
];

// UI配置
export const UI = {
    CHARGE_BAR_WIDTH: 200,     // 蓄力条宽度
    CHARGE_BAR_HEIGHT: 20,     // 蓄力条高度
    HUD_FONT_SIZE: 24          // HUD字体大小
};
