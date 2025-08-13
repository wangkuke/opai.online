/**
 * 依赖管理器
 * 管理外部依赖的加载和初始化状态
 */

class DependencyManager {
    constructor() {
        this.dependencies = new Map();
        this.listeners = [];
        this.checkInterval = null;
        this.isMonitoring = false;
    }

    /**
     * 注册依赖项
     * @param {string} name - 依赖名称
     * @param {Function} checker - 检查函数，返回 boolean
     * @param {Object} options - 配置选项
     */
    registerDependency(name, checker, options = {}) {
        this.dependencies.set(name, {
            name,
            checker,
            isLoaded: false,
            loadTime: null,
            error: null,
            required: options.required !== false,
            timeout: options.timeout || 10000,
            retryCount: 0,
            maxRetries: options.maxRetries || 3
        });
    }

    /**
     * 检查所有依赖是否已加载
     * @returns {boolean} 所有必需依赖是否已加载
     */
    checkAllDependencies() {
        let allLoaded = true;
        const now = Date.now();

        for (const [name, dep] of this.dependencies) {
            try {
                const wasLoaded = dep.isLoaded;
                dep.isLoaded = dep.checker();
                
                // 记录首次加载时间
                if (!wasLoaded && dep.isLoaded) {
                    dep.loadTime = now;
                    dep.error = null;
                    console.log(`✅ 依赖 ${name} 加载完成`);
                    this.notifyListeners('dependency_loaded', { name, dependency: dep });
                }
                
                // 检查必需依赖
                if (dep.required && !dep.isLoaded) {
                    allLoaded = false;
                }
            } catch (error) {
                dep.error = error;
                dep.isLoaded = false;
                console.error(`❌ 检查依赖 ${name} 时出错:`, error);
                
                if (dep.required) {
                    allLoaded = false;
                }
            }
        }

        return allLoaded;
    }

    /**
     * 等待依赖加载完成
     * @param {Array<string>} dependencyNames - 要等待的依赖名称，为空则等待所有必需依赖
     * @param {number} timeout - 超时时间（毫秒）
     * @returns {Promise<boolean>} 是否成功加载
     */
    async waitForDependencies(dependencyNames = [], timeout = 15000) {
        const startTime = Date.now();
        const targetDeps = dependencyNames.length > 0 ? 
            dependencyNames : 
            Array.from(this.dependencies.keys()).filter(name => 
                this.dependencies.get(name).required
            );

        console.log(`⏳ 等待依赖加载: ${targetDeps.join(', ')}`);

        return new Promise((resolve, reject) => {
            const checkDependencies = () => {
                const elapsed = Date.now() - startTime;
                
                // 检查超时
                if (elapsed >= timeout) {
                    const status = this.getDependencyStatus();
                    const failed = targetDeps.filter(name => !status[name]?.isLoaded);
                    reject(new Error(`依赖加载超时: ${failed.join(', ')}`));
                    return;
                }

                // 检查目标依赖是否都已加载
                const allTargetLoaded = targetDeps.every(name => {
                    const dep = this.dependencies.get(name);
                    return dep && dep.isLoaded;
                });

                if (allTargetLoaded) {
                    console.log(`✅ 所有依赖加载完成，耗时: ${elapsed}ms`);
                    resolve(true);
                } else {
                    // 继续检查
                    this.checkAllDependencies();
                    setTimeout(checkDependencies, 100);
                }
            };

            checkDependencies();
        });
    }

    /**
     * 开始监控依赖状态
     * @param {number} interval - 检查间隔（毫秒）
     */
    startMonitoring(interval = 500) {
        if (this.isMonitoring) {
            return;
        }

        this.isMonitoring = true;
        this.checkInterval = setInterval(() => {
            this.checkAllDependencies();
        }, interval);

        console.log('🔍 开始监控依赖状态');
    }

    /**
     * 停止监控依赖状态
     */
    stopMonitoring() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
        this.isMonitoring = false;
        console.log('⏹️ 停止监控依赖状态');
    }

    /**
     * 获取依赖状态
     * @returns {Object} 依赖状态对象
     */
    getDependencyStatus() {
        const status = {};
        
        for (const [name, dep] of this.dependencies) {
            status[name] = {
                isLoaded: dep.isLoaded,
                loadTime: dep.loadTime,
                error: dep.error?.message,
                required: dep.required,
                retryCount: dep.retryCount
            };
        }

        return status;
    }

    /**
     * 重试加载失败的依赖
     * @param {string} dependencyName - 依赖名称，为空则重试所有失败的依赖
     * @returns {Promise<boolean>} 是否成功
     */
    async retryDependency(dependencyName = null) {
        const depsToRetry = dependencyName ? 
            [dependencyName] : 
            Array.from(this.dependencies.keys()).filter(name => {
                const dep = this.dependencies.get(name);
                return !dep.isLoaded && dep.retryCount < dep.maxRetries;
            });

        console.log(`🔄 重试加载依赖: ${depsToRetry.join(', ')}`);

        for (const name of depsToRetry) {
            const dep = this.dependencies.get(name);
            if (dep) {
                dep.retryCount++;
                dep.error = null;
            }
        }

        // 等待重试结果
        try {
            await this.waitForDependencies(depsToRetry, 5000);
            return true;
        } catch (error) {
            console.error('重试失败:', error);
            return false;
        }
    }

    /**
     * 添加依赖状态变化监听器
     * @param {Function} callback - 回调函数
     */
    addListener(callback) {
        this.listeners.push(callback);
    }

    /**
     * 移除依赖状态变化监听器
     * @param {Function} callback - 回调函数
     */
    removeListener(callback) {
        const index = this.listeners.indexOf(callback);
        if (index > -1) {
            this.listeners.splice(index, 1);
        }
    }

    /**
     * 通知所有监听器
     * @param {string} event - 事件类型
     * @param {Object} data - 事件数据
     */
    notifyListeners(event, data) {
        this.listeners.forEach(callback => {
            try {
                callback(event, data);
            } catch (error) {
                console.error('依赖监听器错误:', error);
            }
        });
    }

    /**
     * 获取加载统计信息
     * @returns {Object} 统计信息
     */
    getStats() {
        const stats = {
            total: this.dependencies.size,
            loaded: 0,
            failed: 0,
            required: 0,
            optional: 0,
            averageLoadTime: 0
        };

        let totalLoadTime = 0;
        let loadedCount = 0;

        for (const [name, dep] of this.dependencies) {
            if (dep.required) {
                stats.required++;
            } else {
                stats.optional++;
            }

            if (dep.isLoaded) {
                stats.loaded++;
                if (dep.loadTime) {
                    totalLoadTime += dep.loadTime;
                    loadedCount++;
                }
            } else if (dep.error) {
                stats.failed++;
            }
        }

        if (loadedCount > 0) {
            stats.averageLoadTime = Math.round(totalLoadTime / loadedCount);
        }

        return stats;
    }

    /**
     * 清理资源
     */
    destroy() {
        this.stopMonitoring();
        this.dependencies.clear();
        this.listeners = [];
    }
}

// 创建全局实例并注册常用依赖
const dependencyManager = new DependencyManager();

// 注册 Supabase 相关依赖
dependencyManager.registerDependency('supabase', () => {
    return typeof window.supabase !== 'undefined';
}, { required: true, timeout: 10000 });

dependencyManager.registerDependency('supabase-config', () => {
    return typeof window.createPublicSupabaseClient !== 'undefined' &&
           typeof window.createAdminSupabaseClient !== 'undefined';
}, { required: true, timeout: 5000 });

dependencyManager.registerDependency('supabase-storage', () => {
    const exists = typeof window.SupabaseStorage !== 'undefined';
    const notNull = window.SupabaseStorage !== null;
    const hasInitialize = exists && typeof window.SupabaseStorage.initialize === 'function';
    
    if (!exists) {
        console.log('🔍 SupabaseStorage 不存在');
    } else if (!notNull) {
        console.log('🔍 SupabaseStorage 为 null');
    } else if (!hasInitialize) {
        console.log('🔍 SupabaseStorage 没有 initialize 方法');
    }
    
    return exists && notNull && hasInitialize;
}, { required: true, timeout: 5000 });

dependencyManager.registerDependency('error-handler', () => {
    return typeof window.ErrorHandler !== 'undefined' &&
           typeof window.RetryHandler !== 'undefined';
}, { required: true, timeout: 5000 });

dependencyManager.registerDependency('blog-models', () => {
    return typeof window.Article !== 'undefined';
}, { required: true, timeout: 5000 });

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DependencyManager, dependencyManager };
} else {
    window.DependencyManager = DependencyManager;
    window.dependencyManager = dependencyManager;
}

// 开发环境下的调试信息
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    console.log('🔧 依赖管理器已加载');
    
    // 添加调试监听器
    dependencyManager.addListener((event, data) => {
        console.log(`📡 依赖事件: ${event}`, data);
    });
}