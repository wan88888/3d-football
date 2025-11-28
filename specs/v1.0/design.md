# 技术方案设计

## 1. 技术栈选型

- **核心框架**: Vanilla JavaScript (ES6+)
- **构建工具**: Vite (快速开发与构建)
- **3D 引擎**: Three.js (渲染场景、模型、粒子)
- **物理引擎**: Cannon-es (处理碰撞、重力、球体运动)
- **UI 界面**: HTML5 + CSS3 (绝对定位覆盖在 Canvas 之上)
- **开发语言**: JavaScript / TypeScript (建议使用 JS 以保持简单，或 TS 增强类型安全，本项目采用 **JavaScript** 以符合 CloudBase Web 开发习惯)

## 2. 架构设计

采用 **组件化 + 状态机** 的架构模式。

### 2.1 核心模块

1.  **Game**: 游戏入口，负责初始化 Scene, Camera, Renderer, Physics World，以及主循环 (Game Loop)。
2.  **AssetManager**: 负责加载和管理纹理、模型、音频资源。
3.  **InputManager**: 监听键盘 (WASD, Space, Shift) 事件，转换为游戏内的控制信号。
4.  **SceneManager**: 管理不同的游戏场景（主菜单、游戏关卡、结算界面）。
5.  **EntityManager**: 管理游戏中的所有实体（球员、足球、守门员、障碍物）。

### 2.2 实体设计 (Entities)

所有实体继承自基类 `Entity`，拥有 `mesh` (渲染) 和 `body` (物理) 属性。

-   **Player**: 玩家控制的角色。包含移动逻辑、射门蓄力逻辑。
-   **Ball**: 足球。受物理引擎控制，具有弹性和摩擦力。
-   **Goalkeeper (AI)**: 简单的 AI 实体。根据球的位置进行横向移动和扑救动画（通过 Tween 或物理冲量实现）。
-   **Obstacle**: 静态或动态障碍物（如圆锥筒、移动靶子）。
-   **Goal**: 球门。包含碰撞检测区域，用于判断进球。

### 2.3 游戏状态流转 (Game States)

-   `MENU`: 主菜单
-   `PLAYING`: 游戏中
    -   `MODE_PENALTY`: 点球模式逻辑
    -   `MODE_DRIBBLING`: 盘带模式逻辑
    -   `MODE_TARGET`: 靶心模式逻辑
-   `GAME_OVER`: 结算界面

## 3. 视觉风格实现 (Cartoon Style)

-   **材质**: 使用 `MeshToonMaterial` 或 `MeshLambertMaterial` 配合简单的色块纹理。
-   **光照**: 环境光 (AmbientLight) + 定向光 (DirectionalLight) 产生清晰阴影。
-   **后处理 (可选)**: 使用 `OutlinePass` 给物体添加黑色描边，增强卡通感。
-   **配色**: 高饱和度配色（草地鲜绿、球衣鲜红/蓝、天空明亮）。

## 4. 关键逻辑实现

### 4.1 射门机制
-   按下空格键开始蓄力，UI 显示蓄力条。
-   松开空格键时，根据蓄力值大小，给足球施加一个向前的物理冲量 (Impulse)。
-   冲量方向由摄像机朝向或玩家朝向决定，可叠加少许随机偏移模拟失误。

### 4.2 守门员 AI
-   **简单策略**: 守门员始终尝试保持在球和球门中心连线的一定比例位置。
-   **扑救**: 当球的速度超过阈值且距离球门一定范围内，守门员触发“扑救”动作（快速移动向球的预测落点）。

### 4.3 物理配置
-   使用 `cannon-es`。
-   地面材质 (Ground Material) 和球材质 (Ball Material) 之间的摩擦系数和恢复系数（弹性）需要精细调整，以模拟真实的草地滚球体验。

## 5. 目录结构

```
/
├── index.html
├── main.js             # 入口
├── style.css           # UI 样式
├── src/
│   ├── core/
│   │   ├── Game.js
│   │   ├── InputManager.js
│   │   └── ResourceManager.js
│   ├── entities/
│   │   ├── Player.js
│   │   ├── Ball.js
│   │   └── Goalkeeper.js
│   ├── scenes/
│   │   ├── MainMenuScene.js
│   │   └── GameScene.js
│   └── utils/
│       └── PhysicsUtils.js
└── public/
    └── assets/         # 图片、模型
```
