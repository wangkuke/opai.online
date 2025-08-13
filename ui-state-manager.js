/**
 * UI状态管理器
 * 管理加载过程中的UI状态变化，包括加载指示器、错误显示和用户交互
 */

class UIStateManager {
    constructor() {
        this.currentState = 'idle';
        this.elements = {};
        this.progressValue = 0;
        this.statusMessage = '';
        this.retryCallback = null;
        this.cancelCallback = null;
    }

    /**
     * 初始化UI元素引用
     */
    initializeElements() {
        this.elements = {
            content: document.getElementById('article-content'),
            title: document.getElementById('article-title'),
            author: document.getElementById('article-author'),
            date: document.getElementById('article-date'),
            category: document.getElementById('article-category'),
            views: document.getElementById('article-views'),
            tags: document.getElementById('article-tags'),
            skeletonScreen: document.getElementById('skeleton-screen'),
            loadingIndicator: document.getElementById('loading-indicator')
        };
    }

    /**
     * 显示加载状态
     * @param {string} type - 加载类型 ('skeleton', 'spinner', 'progress')
     * @param {Object} options - 选项
     */
    showLoadingState(type = 'skeleton', options = {}) {
        this.currentState = 'loading';
        this.initializeElements();

        // 隐藏内容
        if (this.elements.content) {
            this.elements.content.style.opacity = '0.6';
        }

        switch (type) {
            case 'skeleton':
                this.showSkeletonScreen();
                break;
            case 'spinner':
                this.showSpinnerLoader(options.message);
                break;
            case 'progress':
                this.showProgressLoader(options.message, options.progress);
                break;
            default:
                this.showSkeletonScreen();
        }

        console.log(`🎨 显示加载状态: ${type}`);
    }

    /**
     * 显示骨架屏
     */
    showSkeletonScreen() {
        if (this.elements.skeletonScreen) {
            this.elements.skeletonScreen.style.display = 'block';
        }

        if (this.elements.loadingIndicator) {
            this.elements.loadingIndicator.style.display = 'none';
        }

        // 显示骨架屏内容
        this.setPlaceholderContent();
    }

    /**
     * 显示旋转加载器
     * @param {string} message - 加载消息
     */
    showSpinnerLoader(message = '加载文章内容中...') {
        if (this.elements.skeletonScreen) {
            this.elements.skeletonScreen.style.display = 'none';
        }

        if (this.elements.loadingIndicator) {
            this.elements.loadingIndicator.innerHTML = `
                <div style="text-align: center; padding: 40px 0;">
                    <i class="fas fa-spinner fa-spin fa-3x" style="color: var(--primary);"></i>
                    <p style="margin-top: 20px; font-size: 1.1rem;">${message}</p>
                </div>
            `;
            this.elements.loadingIndicator.style.display = 'block';
        }
    }

    /**
     * 显示进度加载器
     * @param {string} message - 加载消息
     * @param {number} progress - 进度百分比 (0-100)
     */
    showProgressLoader(message = '加载中...', progress = 0) {
        this.progressValue = Math.max(0, Math.min(100, progress));
        this.statusMessage = message;

        if (this.elements.skeletonScreen) {
            this.elements.skeletonScreen.style.display = 'none';
        }

        if (this.elements.loadingIndicator) {
            this.elements.loadingIndicator.innerHTML = `
                <div style="text-align: center; padding: 40px 0;">
                    <div style="margin-bottom: 20px;">
                        <i class="fas fa-download fa-2x" style="color: var(--primary);"></i>
                    </div>
                    <div style="width: 300px; margin: 0 auto 20px;">
                        <div style="background: #e0e0e0; border-radius: 10px; height: 8px; overflow: hidden;">
                            <div style="background: var(--primary); height: 100%; width: ${this.progressValue}%; transition: width 0.3s ease;"></div>
                        </div>
                        <div style="margin-top: 10px; font-size: 0.9rem; color: var(--gray);">
                            ${this.progressValue}% 完成
                        </div>
                    </div>
                    <p style="font-size: 1.1rem;">${message}</p>
                </div>
            `;
            this.elements.loadingIndicator.style.display = 'block';
        }
    }

    /**
     * 更新加载进度
     * @param {number} percentage - 进度百分比
     * @param {string} message - 状态消息
     */
    updateProgress(percentage, message = '') {
        this.progressValue = Math.max(0, Math.min(100, percentage));
        if (message) {
            this.statusMessage = message;
        }

        // 更新进度条
        const progressBar = document.querySelector('#loading-indicator div[style*="background: var(--primary)"]');
        if (progressBar) {
            progressBar.style.width = `${this.progressValue}%`;
        }

        // 更新百分比文本
        const percentageText = document.querySelector('#loading-indicator div[style*="font-size: 0.9rem"]');
        if (percentageText) {
            percentageText.textContent = `${this.progressValue}% 完成`;
        }

        // 更新状态消息
        const messageElement = document.querySelector('#loading-indicator p');
        if (messageElement && message) {
            messageElement.textContent = message;
        }
    }

    /**
     * 显示错误状态
     * @param {Error} error - 错误对象
     * @param {Object} options - 选项
     */
    showErrorState(error, options = {}) {
        this.currentState = 'error';
        this.initializeElements();

        const errorType = options.type || 'GENERAL';
        const showRetry = options.showRetry !== false;
        const showCancel = options.showCancel === true;
        
        // 隐藏加载指示器
        this.hideLoadingState();

        // 获取错误信息
        const errorInfo = this.getErrorInfo(error, errorType);

        if (this.elements.content) {
            this.elements.content.innerHTML = `
                <div style="text-align: center; padding: 40px 0;">
                    <i class="${errorInfo.icon} fa-3x" style="color: var(--error);"></i>
                    <h3 style="margin: 20px 0; color: var(--error);">${errorInfo.title}</h3>
                    <p style="margin-bottom: 30px; color: var(--gray); font-size: 1.1rem; line-height: 1.6;">
                        ${errorInfo.message}
                    </p>
                    
                    ${errorInfo.suggestion ? `
                        <div style="background: rgba(255, 193, 7, 0.1); border: 1px solid rgba(255, 193, 7, 0.3); border-radius: 8px; padding: 15px; margin: 20px auto; max-width: 500px; text-align: left;">
                            <strong style="color: var(--warning);">💡 建议:</strong>
                            <p style="margin: 10px 0 0; color: var(--dark);">${errorInfo.suggestion}</p>
                        </div>
                    ` : ''}
                    
                    <div style="margin-top: 30px;">
                        ${showRetry ? `
                            <button onclick="retryLoad()" class="btn btn-primary" style="margin-right: 15px;">
                                <i class="fas fa-redo"></i>
                                重试加载
                            </button>
                        ` : ''}
                        
                        <button onclick="goBack()" class="btn btn-secondary" style="margin-right: 15px;">
                            <i class="fas fa-arrow-left"></i>
                            返回列表
                        </button>
                        
                        ${showCancel ? `
                            <button onclick="cancelLoad()" class="btn btn-warning">
                                <i class="fas fa-times"></i>
                                取消
                            </button>
                        ` : ''}
                        
                        <button onclick="showDiagnostics()" class="btn btn-info" style="margin-left: 15px;">
                            <i class="fas fa-stethoscope"></i>
                            诊断
                        </button>
                    </div>
                    
                    ${options.showDetails ? `
                        <details style="margin-top: 30px; text-align: left; max-width: 600px; margin-left: auto; margin-right: auto;">
                            <summary style="cursor: pointer; color: var(--primary); font-weight: 600;">
                                <i class="fas fa-info-circle"></i> 错误详情
                            </summary>
                            <pre style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 10px; font-size: 0.9rem; overflow-x: auto;">
${error.stack || error.message || '未知错误'}
                            </pre>
                        </details>
                    ` : ''}
                </div>
            `;
        }

        console.log(`🎨 显示错误状态: ${errorType}`, error);
    }

    /**
     * 显示内容
     * @param {Object} article - 文章对象
     */
    showContent(article) {
        this.currentState = 'content';
        this.initializeElements();

        // 隐藏加载状态
        this.hideLoadingState();

        // 恢复内容透明度
        if (this.elements.content) {
            this.elements.content.style.opacity = '1';
        }

        // 填充文章内容
        this.populateArticleContent(article);

        console.log('🎨 显示文章内容');
    }

    /**
     * 显示重试选项
     * @param {Error} error - 错误对象
     * @param {Object} options - 选项
     */
    showRetryOptions(error, options = {}) {
        const maxRetries = options.maxRetries || 3;
        const currentAttempt = options.currentAttempt || 1;
        const remainingRetries = maxRetries - currentAttempt;

        if (this.elements.content) {
            const retrySection = document.createElement('div');
            retrySection.id = 'retry-section';
            retrySection.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: white;
                border: 1px solid var(--border);
                border-radius: 12px;
                padding: 20px;
                box-shadow: 0 8px 32px rgba(0,0,0,0.15);
                max-width: 300px;
                z-index: 1000;
            `;

            retrySection.innerHTML = `
                <div style="margin-bottom: 15px;">
                    <i class="fas fa-exclamation-triangle" style="color: var(--warning); margin-right: 8px;"></i>
                    <strong>加载失败</strong>
                </div>
                <p style="margin-bottom: 15px; font-size: 0.9rem; color: var(--gray);">
                    ${error.message}
                </p>
                <div style="margin-bottom: 15px; font-size: 0.85rem; color: var(--gray);">
                    剩余重试次数: ${remainingRetries}
                </div>
                <div>
                    <button onclick="retryLoad()" class="btn btn-primary btn-sm" style="margin-right: 10px;">
                        <i class="fas fa-redo"></i>
                        重试
                    </button>
                    <button onclick="closeRetryOptions()" class="btn btn-secondary btn-sm">
                        <i class="fas fa-times"></i>
                        关闭
                    </button>
                </div>
            `;

            // 移除现有的重试选项
            const existing = document.getElementById('retry-section');
            if (existing) {
                existing.remove();
            }

            document.body.appendChild(retrySection);

            // 5秒后自动隐藏
            setTimeout(() => {
                const section = document.getElementById('retry-section');
                if (section) {
                    section.style.opacity = '0';
                    section.style.transform = 'translateY(20px)';
                    setTimeout(() => section.remove(), 300);
                }
            }, 5000);
        }
    }

    /**
     * 隐藏加载状态
     */
    hideLoadingState() {
        if (this.elements.skeletonScreen) {
            this.elements.skeletonScreen.style.display = 'none';
        }

        if (this.elements.loadingIndicator) {
            this.elements.loadingIndicator.style.display = 'none';
        }
    }

    /**
     * 设置占位符内容
     */
    setPlaceholderContent() {
        if (this.elements.title) {
            this.elements.title.textContent = '加载中...';
        }
        if (this.elements.author) {
            this.elements.author.textContent = '加载中...';
        }
        if (this.elements.date) {
            this.elements.date.textContent = '加载中...';
        }
        if (this.elements.category) {
            this.elements.category.textContent = '加载中...';
        }
        if (this.elements.views) {
            this.elements.views.textContent = '加载中...';
        }
        if (this.elements.tags) {
            this.elements.tags.innerHTML = '';
        }
    }

    /**
     * 填充文章内容
     * @param {Object} article - 文章对象
     */
    populateArticleContent(article) {
        // 填充基本信息
        if (this.elements.title) {
            this.elements.title.textContent = article.title;
        }
        if (this.elements.author) {
            this.elements.author.textContent = article.author;
        }
        if (this.elements.date) {
            this.elements.date.textContent = this.formatDate(article.publishDate);
        }
        if (this.elements.category) {
            this.elements.category.textContent = article.category;
        }
        if (this.elements.views) {
            this.elements.views.textContent = '1,245 阅读'; // 临时数据
        }

        // 填充标签
        if (this.elements.tags && article.tags) {
            this.elements.tags.innerHTML = '';
            article.tags.forEach(tag => {
                const tagElement = document.createElement('span');
                tagElement.className = 'tag';
                tagElement.textContent = tag;
                this.elements.tags.appendChild(tagElement);
            });
        }

        // 填充内容
        if (this.elements.content && article.content) {
            // 优化内容渲染：批量处理图片懒加载
            const optimizedContent = article.content.replace(
                /<img([^>]+)>/g, 
                '<img$1 loading="lazy" onerror="this.style.display=\'none\'" onload="this.classList.add(\'loaded\')">'
            );
            
            this.elements.content.innerHTML = optimizedContent;
        }

        // 更新页面标题
        document.title = `${article.title} - OPAI`;
    }

    /**
     * 获取错误信息
     * @param {Error} error - 错误对象
     * @param {string} errorType - 错误类型
     * @returns {Object} 错误信息对象
     */
    getErrorInfo(error, errorType) {
        const errorMap = {
            'ARTICLE_NOT_FOUND': {
                icon: 'fas fa-file-times',
                title: '文章不存在',
                message: '抱歉，您要查看的文章不存在或已被删除。',
                suggestion: '请检查URL是否正确，或浏览其他文章。'
            },
            'NETWORK_ERROR': {
                icon: 'fas fa-wifi',
                title: '网络连接错误',
                message: '无法连接到服务器，请检查您的网络连接。',
                suggestion: '请检查网络连接，或稍后重试。'
            },
            'TIMEOUT_ERROR': {
                icon: 'fas fa-clock',
                title: '加载超时',
                message: '文章加载时间过长，可能是网络较慢或服务器繁忙。',
                suggestion: '请稍后重试，或检查网络连接状态。'
            },
            'STORAGE_ERROR': {
                icon: 'fas fa-database',
                title: '存储服务错误',
                message: '数据存储服务暂时不可用。',
                suggestion: '请刷新页面重试，或联系技术支持。'
            },
            'DEPENDENCY_ERROR': {
                icon: 'fas fa-puzzle-piece',
                title: '系统组件错误',
                message: '系统组件加载失败，可能影响正常功能。',
                suggestion: '请刷新页面重新加载系统组件。'
            }
        };

        return errorMap[errorType] || {
            icon: 'fas fa-exclamation-circle',
            title: '未知错误',
            message: error.message || '发生了未知错误，请稍后重试。',
            suggestion: '如果问题持续存在，请联系技术支持。'
        };
    }

    /**
     * 格式化日期
     * @param {string} dateString - 日期字符串
     * @returns {string} 格式化后的日期
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    /**
     * 获取当前状态
     * @returns {string} 当前状态
     */
    getCurrentState() {
        return this.currentState;
    }

    /**
     * 设置重试回调
     * @param {Function} callback - 重试回调函数
     */
    setRetryCallback(callback) {
        this.retryCallback = callback;
    }

    /**
     * 设置取消回调
     * @param {Function} callback - 取消回调函数
     */
    setCancelCallback(callback) {
        this.cancelCallback = callback;
    }

    /**
     * 清理UI状态
     */
    cleanup() {
        this.hideLoadingState();
        
        // 移除重试选项
        const retrySection = document.getElementById('retry-section');
        if (retrySection) {
            retrySection.remove();
        }

        // 移除过期通知
        const staleNotice = document.getElementById('stale-notice');
        if (staleNotice) {
            staleNotice.remove();
        }

        this.currentState = 'idle';
        console.log('🧹 UI状态已清理');
    }
}

// 全局函数，供HTML中的按钮调用
window.retryLoad = function() {
    if (window.uiStateManager && window.uiStateManager.retryCallback) {
        window.uiStateManager.retryCallback();
    } else if (window.articleLoadController) {
        const articleId = URLParser.getArticleId();
        if (articleId) {
            window.articleLoadController.retryLoad(articleId);
        }
    }
};

window.cancelLoad = function() {
    if (window.uiStateManager && window.uiStateManager.cancelCallback) {
        window.uiStateManager.cancelCallback();
    } else if (window.articleLoadController) {
        const articleId = URLParser.getArticleId();
        if (articleId) {
            window.articleLoadController.cancelLoad(articleId);
        }
    }
};

window.goBack = function() {
    if (document.referrer && document.referrer.includes(window.location.origin)) {
        history.back();
    } else {
        window.location.href = 'articles.html';
    }
};

window.closeRetryOptions = function() {
    const retrySection = document.getElementById('retry-section');
    if (retrySection) {
        retrySection.style.opacity = '0';
        retrySection.style.transform = 'translateY(20px)';
        setTimeout(() => retrySection.remove(), 300);
    }
};

window.showDiagnostics = function() {
    const diagnostics = {
        userAgent: navigator.userAgent,
        online: navigator.onLine,
        cookieEnabled: navigator.cookieEnabled,
        language: navigator.language,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        referrer: document.referrer
    };

    if (window.dependencyManager) {
        diagnostics.dependencies = window.dependencyManager.getDependencyStatus();
        diagnostics.dependencyStats = window.dependencyManager.getStats();
    }

    if (window.articleLoadController) {
        diagnostics.loadController = window.articleLoadController.getStats();
    }

    const diagnosticWindow = window.open('', '_blank', 'width=800,height=600');
    diagnosticWindow.document.write(`
        <html>
        <head>
            <title>系统诊断信息</title>
            <style>
                body { font-family: monospace; padding: 20px; background: #f5f5f5; }
                pre { background: white; padding: 15px; border-radius: 8px; overflow: auto; }
                h1 { color: #333; }
            </style>
        </head>
        <body>
            <h1>系统诊断信息</h1>
            <pre>${JSON.stringify(diagnostics, null, 2)}</pre>
        </body>
        </html>
    `);
};

// 创建全局实例
const uiStateManager = new UIStateManager();

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { UIStateManager, uiStateManager };
} else {
    window.UIStateManager = UIStateManager;
    window.uiStateManager = uiStateManager;
}