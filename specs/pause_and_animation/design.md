# 技术方案设计

## 架构设计

### 1. 暂停系统 (Pause System)

暂停功能将主要在 `Game` 类中实现，通过控制游戏循环（Game Loop）的更新逻辑来实现。

*   **状态管理**: 在 `Game` 类中添加 `isPaused` 标志位。
*   **游戏循环**: 修改 `animate()` 方法。
    *   如果 `isPaused` 为 `true`，则跳过 `world.fixedStep()` (物理) 和 `entities.update()` (逻辑)。
    *   渲染 `renderer.render()` 始终执行，以保持画面显示（或者可以停止渲染，但在 WebGL 中通常保持渲染以免画面闪烁或丢失）。
*   **UI 交互**:
    *   HTML: 添加 `#btn-pause` (右上角) 和 `#pause-menu` (居中遮罩)。
    *   CSS: 样式化按钮和菜单。
    *   Events: 监听按钮点击和 `keydown` (Esc)。

### 2. 动画系统 (Animation System)

动画功能将在 `Player` 类中实现，利用 Three.js 的 `AnimationMixer`。

*   **组件**: `Player` 类持有 `mixer` (THREE.AnimationMixer) 和 `actions` (Map<String, AnimationAction>)。
*   **加载**: 在 `GLTFLoader` 的回调中，获取 `gltf.animations` 数组。
*   **状态机**:
    *   **Idle**: 默认状态。
    *   **Run**: 当 `velocity` 模长 > 0.1 时切换。
    *   **Attack/Kick**: 监听射门事件，触发一次性动画。
*   **混合**: 使用 `action.crossFadeTo()` 实现平滑过渡。

## 接口设计

### Game.js

```javascript
class Game {
    constructor() {
        this.isPaused = false;
        // ...
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        // Update UI visibility
        // Manage time scaling if needed
    }

    animate() {
        // ...
        if (this.isPlaying && !this.isGameOver && !this.isPaused) {
            // Physics & Logic
        }
        // Render
    }
}
```

### Player.js

```javascript
class Player {
    loadModel() {
        // ...
        this.mixer = new THREE.AnimationMixer(model);
        this.animations = gltf.animations;
        // Initialize actions
    }

    update(dt) {
        if (this.mixer) this.mixer.update(dt);
        // ...
        this.updateAnimationState();
    }

    updateAnimationState() {
        // Check velocity -> switch between Idle and Run
    }

    playAction(name) {
        // Crossfade logic
    }
}
```

## 风险与对策

1.  **模型动画缺失**: 当前使用的 Naruto 模型可能没有标准的 "Run" 或 "Kick" 动画。
    *   *对策*: 在加载时打印 `gltf.animations`。如果没有合适动画，回退到仅播放第一个可用动画，或者不播放。代码中将包含根据名称模糊匹配的逻辑 (e.g., includes "run", "walk")。

2.  **暂停时的 Delta Time**: 简单的 `performance.now()` 差值在暂停恢复后可能会导致巨大的 `dt`。
    *   *对策*: 在 `animate` 中，如果暂停，重置 `lastTime` 为当前时间，或者在恢复暂停的一瞬间重置 `lastTime`。

## 测试策略

1.  **暂停测试**:
    *   游戏中点击暂停 -> 确认球和人停止移动。
    *   点击继续 -> 确认运动恢复，无跳变。
2.  **动画测试**:
    *   移动 -> 看到跑动动作。
    *   停止 -> 恢复站立动作。
    *   射门 -> 看到攻击/踢球动作。
