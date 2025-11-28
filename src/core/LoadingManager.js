/**
 * Loading Manager
 * 管理资源加载进度并显示加载界面
 */

export class LoadingManager {
    constructor() {
        this.totalAssets = 0;
        this.loadedAssets = 0;
        this.errors = [];
        this.createLoadingUI();
    }

    createLoadingUI() {
        // 创建加载遮罩层
        this.overlay = document.createElement('div');
        this.overlay.id = 'loading-overlay';
        this.overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            color: white;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        `;

        // 加载标题
        const title = document.createElement('h1');
        title.textContent = '3D Football Game';
        title.style.cssText = 'margin-bottom: 30px; font-size: 48px; color: #ffcc00;';
        this.overlay.appendChild(title);

        // 加载进度容器
        const progressContainer = document.createElement('div');
        progressContainer.style.cssText = `
            width: 400px;
            height: 30px;
            background: rgba(255, 255, 255, 0.1);
            border: 2px solid white;
            border-radius: 15px;
            overflow: hidden;
            margin-bottom: 20px;
        `;

        // 进度条
        this.progressBar = document.createElement('div');
        this.progressBar.id = 'loading-bar';
        this.progressBar.style.cssText = `
            width: 0%;
            height: 100%;
            background: linear-gradient(90deg, #ffcc00, #ff6600);
            transition: width 0.3s;
        `;
        progressContainer.appendChild(this.progressBar);
        this.overlay.appendChild(progressContainer);

        // 加载文本
        this.loadingText = document.createElement('p');
        this.loadingText.style.cssText = 'font-size: 18px; margin-top: 10px;';
        this.loadingText.textContent = 'Loading assets... 0%';
        this.overlay.appendChild(this.loadingText);

        // 错误提示
        this.errorText = document.createElement('p');
        this.errorText.style.cssText = 'font-size: 14px; color: #ff4444; margin-top: 10px; max-width: 400px; text-align: center;';
        this.overlay.appendChild(this.errorText);

        document.body.appendChild(this.overlay);
    }

    registerAsset() {
        this.totalAssets++;
    }

    assetLoaded(name) {
        this.loadedAssets++;
        this.updateProgress();
        console.log(`Asset loaded: ${name} (${this.loadedAssets}/${this.totalAssets})`);
    }

    assetError(name, error) {
        this.loadedAssets++;
        this.errors.push({ name, error });
        this.updateProgress();
        console.error(`Asset failed to load: ${name}`, error);

        // 显示错误信息
        if (this.errors.length === 1) {
            this.errorText.textContent = `Warning: Some assets failed to load (${this.errors.length})`;
        } else {
            this.errorText.textContent = `Warning: ${this.errors.length} assets failed to load`;
        }
    }

    updateProgress() {
        if (this.totalAssets === 0) return;

        const progress = (this.loadedAssets / this.totalAssets) * 100;
        this.progressBar.style.width = `${progress}%`;
        this.loadingText.textContent = `Loading assets... ${Math.round(progress)}%`;

        if (this.loadedAssets >= this.totalAssets) {
            setTimeout(() => this.complete(), 500);
        }
    }

    complete() {
        this.loadingText.textContent = 'Ready!';

        if (this.errors.length > 0) {
            console.warn('Loading completed with errors:', this.errors);
        }

        setTimeout(() => {
            this.overlay.style.opacity = '0';
            this.overlay.style.transition = 'opacity 0.5s';
            setTimeout(() => {
                if (this.overlay.parentNode) {
                    this.overlay.parentNode.removeChild(this.overlay);
                }
            }, 500);
        }, 1000);
    }

    getErrors() {
        return this.errors;
    }
}
