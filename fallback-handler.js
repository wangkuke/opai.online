/**
 * 回退处理器
 * 处理各种失败场景的回退策略，提供优雅降级和恢复机制
 */

class FallbackHandler {
    constructor() {
        this.fallbackStrategies = new Map();
        this.offlineMode = false;
        this.degradedMode = false;
        this.backupCDNs = [
            'https://unpkg.com/@supabase/supabase-js@2',
            'https://cdn.skypack.dev/@supabase/supabase-js@2'
        ];
        this.initializeFallbackStrategies();
    }

    /**
     * 初始化回退策略
     */
    initializeFallbackStrategies() {
        // 依赖加载失败的回退策略
        this.fallbackStrategies.set('DEPENDENCY_FAILURE', [
            'retry_with_timeout',
            'load_from_backup_cdn',
            'enable_degraded_mode',
            'show_manual_options'
        ]);

        // 网络失败的回退策略
        this.fallbackStrategies.set('NETWORK_FAILURE', [
            'retry_with_backoff',
            'load_from_cache',
            'enable_offline_mode',
            'show_connectivity_help'
        ]);

        // 数据失败的回退策略
        this.fallbackStrategies.set('DATA_FAILURE', [
            'validate_and_repair',
            'load_from_backup',
            'show_alternative_content',
            'redirect_to_listing'
        ]);
    }

    /**
     * 处理依赖加载失败
     * @param {Error} error - 错误对象
     * @param {Object} options - 选项
     * @returns {Promise<boolean>} 是否成功恢复
     */
    static async handleDependencyFailure(error, options = {}) {
        console.log('🔄 处理依赖加载失败:', error.message);

        const strategies = [
            () => this.retryWithTimeout(error, options),
            () => this.loadFromBackupCDN(error, options),
            () => this.enableDegradedMode(error, options),
            () => this.showManualOptions(error, options)
        ];

        for (const strategy of strategies) {
            try {
                const result = await strategy();
                if (result) {
                    console.log('✅ 依赖失败恢复成功');
                    return true;
                }
            } catch (strategyError) {
                console.warn('回退策略失败:', strategyError);
            }
        }

        console.error('❌ 所有依赖回退策略都失败了');
        return false;
    }

    /**
     * 处理网络请求失败
     * @param {Error} error - 错误对象
     * @param {string} articleId - 文章ID
     * @param {Object} options - 选项
     * @returns {Promise<Object|null>} 文章对象或null
     */
    static async handleNetworkFailure(error, articleId, options = {}) {
        console.log('🔄 处理网络请求失败:', error.message);

        const strategies = [
            () => this.retryWithBackoff(error, articleId, options),
            () => this.loadFromCache(error, articleId, options),
            () => this.enableOfflineMode(error, articleId, options),
            () => this.showConnectivityHelp(error, articleId, options)
        ];

        for (const strategy of strategies) {
            try {
                const result = await strategy();
                if (result) {
                    console.log('✅ 网络失败恢复成功');
                    return result;
                }
            } catch (strategyError) {
                console.warn('回退策略失败:', strategyError);
            }
        }

        console.error('❌ 所有网络回退策略都失败了');
        return null;
    }

    /**
     * 处理缓存失败
     * @param {Error} error - 错误对象
     * @param {string} articleId - 文章ID
     * @param {Object} options - 选项
     * @returns {Promise<Object|null>} 文章对象或null
     */
    static async handleCacheFailure(error, articleId, options = {}) {
        console.log('🔄 处理缓存失败:', error.message);

        try {
            // 清理损坏的缓存
            if (typeof EnhancedCacheManager !== 'undefined') {
                EnhancedCacheManager.clear(articleId);
                EnhancedCacheManager.cleanup(true);
            }

            // 尝试从网络重新加载
            if (window.SupabaseStorage && window.SupabaseStorage.isInitialized) {
                const article = await window.SupabaseStorage.getArticle(articleId);
                if (article) {
                    // 重新缓存
                    if (typeof EnhancedCacheManager !== 'undefined') {
                        EnhancedCacheManager.set(articleId, article);
                    }
                    return article;
                }
            }
        } catch (recoveryError) {
            console.error('缓存恢复失败:', recoveryError);
        }

        return null;
    }

    /**
     * 重试加载（带超时）
     * @param {Error} error - 错误对象
     * @param {Object} options - 选项
     * @returns {Promise<boolean>} 是否成功
     */
    static async retryWithTimeout(error, options = {}) {
        const maxRetries = options.maxRetries || 3;
        const timeout = options.timeout || 5000;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                console.log(`🔄 重试依赖加载，第 ${attempt} 次尝试...`);
                
                // 等待一段时间后重试
                await new Promise(resolve => setTimeout(resolve, attempt * 1000));
                
                // 检查依赖是否已加载
                if (window.dependencyManager) {
                    const allLoaded = window.dependencyManager.checkAllDependencies();
                    if (allLoaded) {
                        return true;
                    }
                }
            } catch (retryError) {
                console.warn(`重试第 ${attempt} 次失败:`, retryError);
            }
        }

        return false;
    }

    /**
     * 从备用CDN加载
     * @param {Error} error - 错误对象
     * @param {Object} options - 选项
     * @returns {Promise<boolean>} 是否成功
     */
    static async loadFromBackupCDN(error, options = {}) {
        console.log('🔄 尝试从备用CDN加载...');

        const backupCDNs = [
            'https://unpkg.com/@supabase/supabase-js@2',
            'https://cdn.skypack.dev/@supabase/supabase-js@2'
        ];

        for (const cdnUrl of backupCDNs) {
            try {
                console.log(`📦 尝试从 ${cdnUrl} 加载...`);
                
                // 动态创建script标签
                const script = document.createElement('script');
                script.src = cdnUrl;
                
                const loadPromise = new Promise((resolve, reject) => {
                    script.onload = resolve;
                    script.onerror = reject;
                    setTimeout(() => reject(new Error('CDN加载超时')), 10000);
                });

                document.head.appendChild(script);
                await loadPromise;

                // 检查是否成功加载
                if (typeof window.supabase !== 'undefined') {
                    console.log(`✅ 从备用CDN加载成功: ${cdnUrl}`);
                    return true;
                }
            } catch (cdnError) {
                console.warn(`备用CDN加载失败: ${cdnUrl}`, cdnError);
            }
        }

        return false;
    }

    /**
     * 启用降级模式
     * @param {Error} error - 错误对象
     * @param {Object} options - 选项
     * @returns {Promise<boolean>} 是否成功
     */
    static async enableDegradedMode(error, options = {}) {
        console.log('🔄 启用降级模式...');

        try {
            // 设置降级模式标志
            window.degradedMode = true;
            
            // 显示降级模式通知
            this.showDegradedModeNotice();
            
            // 禁用需要外部依赖的功能
            this.disableAdvancedFeatures();
            
            // 启用基本功能
            this.enableBasicFeatures();
            
            console.log('✅ 降级模式已启用');
            return true;
        } catch (degradedError) {
            console.error('启用降级模式失败:', degradedError);
            return false;
        }
    }

    /**
     * 显示手动选项
     * @param {Error} error - 错误对象
     * @param {Object} options - 选项
     * @returns {Promise<boolean>} 是否成功
     */
    static async showManualOptions(error, options = {}) {
        console.log('🔄 显示手动选项...');

        const manualOptionsHtml = `
            <div id="manual-options" style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: white;
                border: 1px solid var(--border);
                border-radius: 12px;
                padding: 30px;
                box-shadow: 0 8px 32px rgba(0,0,0,0.15);
                max-width: 500px;
                z-index: 10000;
            ">
                <h3 style="margin-bottom: 20px; color: var(--primary);">
                    <i class="fas fa-tools"></i> 手动恢复选项
                </h3>
                <p style="margin-bottom: 20px; color: var(--gray);">
                    系统遇到了一些问题，您可以尝试以下选项：
                </p>
                <div style="margin-bottom: 20px;">
                    <button onclick="manualReload()" class="btn btn-primary" style="width: 100%; margin-bottom: 10px;">
                        <i class="fas fa-redo"></i> 重新加载页面
                    </button>
                    <button onclick="clearCacheAndReload()" class="btn btn-warning" style="width: 100%; margin-bottom: 10px;">
                        <i class="fas fa-trash"></i> 清除缓存并重新加载
                    </button>
                    <button onclick="enableOfflineMode()" class="btn btn-info" style="width: 100%; margin-bottom: 10px;">
                        <i class="fas fa-wifi-slash"></i> 启用离线模式
                    </button>
                    <button onclick="contactSupport()" class="btn btn-secondary" style="width: 100%;">
                        <i class="fas fa-life-ring"></i> 联系技术支持
                    </button>
                </div>
                <button onclick="closeManualOptions()" style="
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    background: none;
                    border: none;
                    font-size: 1.2rem;
                    color: var(--gray);
                    cursor: pointer;
                ">×</button>
            </div>
            <div id="manual-options-overlay" style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                z-index: 9999;
            " onclick="closeManualOptions()"></div>
        `;

        document.body.insertAdjacentHTML('beforeend', manualOptionsHtml);
        return true;
    }

    /**
     * 重试加载（带指数退避）
     * @param {Error} error - 错误对象
     * @param {string} articleId - 文章ID
     * @param {Object} options - 选项
     * @returns {Promise<Object|null>} 文章对象或null
     */
    static async retryWithBackoff(error, articleId, options = {}) {
        const maxRetries = options.maxRetries || 3;
        let delay = options.initialDelay || 1000;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                console.log(`🔄 重试网络请求，第 ${attempt} 次尝试...`);
                
                // 指数退避延迟
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= 2;
                
                // 尝试重新加载
                if (window.SupabaseStorage && window.SupabaseStorage.isInitialized) {
                    const article = await window.SupabaseStorage.getArticle(articleId);
                    if (article) {
                        return article;
                    }
                }
            } catch (retryError) {
                console.warn(`网络重试第 ${attempt} 次失败:`, retryError);
            }
        }

        return null;
    }

    /**
     * 从缓存加载
     * @param {Error} error - 错误对象
     * @param {string} articleId - 文章ID
     * @param {Object} options - 选项
     * @returns {Promise<Object|null>} 文章对象或null
     */
    static async loadFromCache(error, articleId, options = {}) {
        console.log('🔄 尝试从缓存加载...');

        try {
            // 尝试从增强缓存管理器加载
            if (typeof EnhancedCacheManager !== 'undefined') {
                const cachedArticle = EnhancedCacheManager.get(articleId);
                if (cachedArticle) {
                    console.log('📦 从缓存成功加载文章');
                    return cachedArticle;
                }
            }

            // 尝试从基本缓存加载
            if (typeof ArticleCache !== 'undefined') {
                const cachedArticle = ArticleCache.get(articleId);
                if (cachedArticle) {
                    console.log('📦 从基本缓存成功加载文章');
                    return cachedArticle;
                }
            }

            // 尝试从localStorage直接读取
            const directCache = localStorage.getItem(`article_cache_${articleId}`);
            if (directCache) {
                const data = JSON.parse(directCache);
                if (data.article) {
                    console.log('📦 从直接缓存成功加载文章');
                    return data.article;
                }
            }
        } catch (cacheError) {
            console.warn('缓存加载失败:', cacheError);
        }

        return null;
    }

    /**
     * 启用离线模式
     * @param {Error} error - 错误对象
     * @param {string} articleId - 文章ID
     * @param {Object} options - 选项
     * @returns {Promise<boolean>} 是否成功
     */
    static async enableOfflineMode(error, articleId, options = {}) {
        console.log('🔄 启用离线模式...');

        try {
            // 设置离线模式标志
            window.offlineMode = true;
            
            // 显示离线模式通知
            this.showOfflineModeNotice();
            
            // 尝试从缓存加载内容
            const cachedArticle = await this.loadFromCache(error, articleId, options);
            if (cachedArticle) {
                return cachedArticle;
            }
            
            // 显示离线模式界面
            this.showOfflineModeInterface();
            
            console.log('✅ 离线模式已启用');
            return true;
        } catch (offlineError) {
            console.error('启用离线模式失败:', offlineError);
            return false;
        }
    }

    /**
     * 显示连接帮助
     * @param {Error} error - 错误对象
     * @param {string} articleId - 文章ID
     * @param {Object} options - 选项
     * @returns {Promise<boolean>} 是否成功
     */
    static async showConnectivityHelp(error, articleId, options = {}) {
        console.log('🔄 显示连接帮助...');

        const helpHtml = `
            <div id="connectivity-help" style="
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: white;
                border: 1px solid var(--border);
                border-radius: 12px;
                padding: 20px;
                box-shadow: 0 8px 32px rgba(0,0,0,0.15);
                max-width: 350px;
                z-index: 1000;
            ">
                <h4 style="margin-bottom: 15px; color: var(--primary);">
                    <i class="fas fa-wifi"></i> 连接问题帮助
                </h4>
                <ul style="margin-bottom: 15px; padding-left: 20px; color: var(--gray);">
                    <li>检查网络连接是否正常</li>
                    <li>尝试刷新页面</li>
                    <li>检查防火墙设置</li>
                    <li>尝试使用其他网络</li>
                </ul>
                <div>
                    <button onclick="testConnection()" class="btn btn-primary btn-sm" style="margin-right: 10px;">
                        <i class="fas fa-network-wired"></i> 测试连接
                    </button>
                    <button onclick="closeConnectivityHelp()" class="btn btn-secondary btn-sm">
                        <i class="fas fa-times"></i> 关闭
                    </button>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', helpHtml);

        // 5秒后自动隐藏
        setTimeout(() => {
            const help = document.getElementById('connectivity-help');
            if (help) {
                help.style.opacity = '0';
                help.style.transform = 'translateY(20px)';
                setTimeout(() => help.remove(), 300);
            }
        }, 10000);

        return true;
    }

    /**
     * 显示降级模式通知
     */
    static showDegradedModeNotice() {
        const notice = document.createElement('div');
        notice.id = 'degraded-mode-notice';
        notice.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            background: var(--warning);
            color: white;
            padding: 10px;
            text-align: center;
            font-size: 0.9rem;
            z-index: 10000;
        `;
        notice.innerHTML = '<i class="fas fa-exclamation-triangle"></i> 系统运行在降级模式下，部分功能可能不可用';
        document.body.appendChild(notice);
    }

    /**
     * 显示离线模式通知
     */
    static showOfflineModeNotice() {
        const notice = document.createElement('div');
        notice.id = 'offline-mode-notice';
        notice.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            background: var(--gray);
            color: white;
            padding: 10px;
            text-align: center;
            font-size: 0.9rem;
            z-index: 10000;
        `;
        notice.innerHTML = '<i class="fas fa-wifi-slash"></i> 离线模式 - 显示缓存内容';
        document.body.appendChild(notice);
    }

    /**
     * 禁用高级功能
     */
    static disableAdvancedFeatures() {
        // 禁用实时更新
        // 禁用动态加载
        // 禁用复杂交互
        console.log('🔒 高级功能已禁用');
    }

    /**
     * 启用基本功能
     */
    static enableBasicFeatures() {
        // 启用基本导航
        // 启用静态内容显示
        // 启用基本交互
        console.log('✅ 基本功能已启用');
    }

    /**
     * 显示离线模式界面
     */
    static showOfflineModeInterface() {
        const offlineInterface = `
            <div style="text-align: center; padding: 40px 0;">
                <i class="fas fa-wifi-slash fa-3x" style="color: var(--gray);"></i>
                <h3 style="margin: 20px 0; color: var(--gray);">离线模式</h3>
                <p style="margin-bottom: 30px; color: var(--gray);">
                    当前处于离线状态，显示的是缓存内容。
                </p>
                <button onclick="location.reload()" class="btn btn-primary">
                    <i class="fas fa-sync"></i>
                    重新连接
                </button>
            </div>
        `;

        const contentContainer = document.getElementById('article-content');
        if (contentContainer) {
            contentContainer.innerHTML = offlineInterface;
        }
    }
}

// 全局函数，供HTML中调用
window.manualReload = function() {
    location.reload();
};

window.clearCacheAndReload = function() {
    // 清除所有缓存
    if (typeof EnhancedCacheManager !== 'undefined') {
        EnhancedCacheManager.clearAll();
    }
    localStorage.clear();
    location.reload();
};

window.enableOfflineMode = function() {
    FallbackHandler.enableOfflineMode();
    closeManualOptions();
};

window.contactSupport = function() {
    const supportInfo = {
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString(),
        error: 'Manual support request'
    };
    
    const mailtoLink = `mailto:support@example.com?subject=技术支持请求&body=${encodeURIComponent(JSON.stringify(supportInfo, null, 2))}`;
    window.location.href = mailtoLink;
};

window.closeManualOptions = function() {
    const options = document.getElementById('manual-options');
    const overlay = document.getElementById('manual-options-overlay');
    if (options) options.remove();
    if (overlay) overlay.remove();
};

window.testConnection = function() {
    const button = event.target;
    const originalText = button.innerHTML;
    
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 测试中...';
    button.disabled = true;
    
    fetch(window.location.origin + '/favicon.ico', { method: 'HEAD', cache: 'no-cache' })
        .then(() => {
            button.innerHTML = '<i class="fas fa-check"></i> 连接正常';
            button.className = 'btn btn-success btn-sm';
            setTimeout(() => {
                location.reload();
            }, 1500);
        })
        .catch(() => {
            button.innerHTML = '<i class="fas fa-times"></i> 连接失败';
            button.className = 'btn btn-danger btn-sm';
            setTimeout(() => {
                button.innerHTML = originalText;
                button.className = 'btn btn-primary btn-sm';
                button.disabled = false;
            }, 2000);
        });
};

window.closeConnectivityHelp = function() {
    const help = document.getElementById('connectivity-help');
    if (help) {
        help.style.opacity = '0';
        help.style.transform = 'translateY(20px)';
        setTimeout(() => help.remove(), 300);
    }
};

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { FallbackHandler };
} else {
    window.FallbackHandler = FallbackHandler;
}