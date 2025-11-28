# 实施计划

- [ ] 1. 暂停功能开发 <!-- id: 0 -->
    - [ ] 修改 `index.html`: 添加暂停按钮和菜单结构 <!-- id: 1 -->
    - [ ] 修改 `style.css`: 添加暂停UI样式 <!-- id: 2 -->
    - [ ] 修改 `src/core/Game.js`: 添加 `isPaused` 状态和 `togglePause` 方法 <!-- id: 3 -->
    - [ ] 修改 `src/core/Game.js`: 在 `animate` 循环中处理暂停逻辑 (跳过更新) <!-- id: 4 -->
    - [ ] 修改 `src/core/Game.js`: 绑定 UI 事件 (点击和 ESC) <!-- id: 5 -->

- [ ] 2. 角色动画开发 <!-- id: 6 -->
    - [ ] 修改 `src/entities/Player.js`: 引入 `AnimationMixer` <!-- id: 7 -->
    - [ ] 修改 `src/entities/Player.js`: 在 `loadModel` 中解析 `gltf.animations` <!-- id: 8 -->
    - [ ] 修改 `src/entities/Player.js`: 实现 `setupAnimations` 方法，识别 Idle, Run, Attack <!-- id: 9 -->
    - [ ] 修改 `src/entities/Player.js`: 实现 `updateAnimationState` 逻辑 (速度检测) <!-- id: 10 -->
    - [ ] 修改 `src/entities/Player.js`: 在 `update` 中调用 mixer 更新 <!-- id: 11 -->
    - [ ] 修改 `src/entities/Player.js`: 在 `shoot` 方法中触发射门动画 <!-- id: 12 -->

- [ ] 3. 验证与优化 <!-- id: 13 -->
    - [ ] 验证暂停功能的逻辑正确性 (时间步处理) <!-- id: 14 -->
    - [ ] 验证动画流畅度与状态切换准确性 <!-- id: 15 -->
