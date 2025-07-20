/**
 * 混合存储管理器
 * 整合本地存储和 Supabase 云端存储，实现在线/离线无缝切换
 */

class HybridStorageManager {
    constructor() {
        this.supabaseStorage = null;
        this.localStorageBackup = null;
        this.isOnline = navigator.onLine;
        this.isInitialized = false;
        this.syncQueue = [];
        this.lastSyncTime = null;
        
        // 存储策略配置
        this.config = {
            preferCloud: true,           // 优先使用云端存储
            autoSync: true,              // 自动同步
            syncInterval: 5 * 60 * 1000, // 5分钟同步间隔
            maxRetries: 3,               // 最大重试次数
            offlineMode: false           // 强制离线模式（用于测试）
        };
        
        this.setupNetworkListeners();
    }

    /**
     * 初始化混合存储管理器
     */
    async initialize() {
        try {
            console.log('🔄 初始化混合存储管理器...');
            
            // 初始化 Supabase 存储
            this.supabaseStorage = new SupabaseStorage();
            await this.supabaseStorage.initialize();
            
            // 初始化本地存储备份
            this.localStorageBackup = new BlogStorage();
            
            this.isInitialized = true;
            
            // 检查网络状态并执行初始同步
            await this.checkConnectionAndSync();
            
            // 启动定期同步
            if (this.config.autoSync) {
                this.startPeriodicSync();
            }
            
            console.log('✅ 混合存储管理器初始化成功');
            
            // 触发初始化完成事件
            window.dispatchEvent(new CustomEvent('hybridStorageReady', {
                detail: { 
                    manager: this,
                    isOnline: this.isOnline
                }
            }));
            
            return true;
            
        } catch (error) {
            console.error('❌ 混合存储管理器初始化失败:', error);
            
            // 即使 Supabase 初始化失败，也要确保本地存储可用
            this.localStorageBackup = new BlogStorage();
            this.isInitialized = true;
            
            return false;
        }
    }

    /**
     * 设置网络状态监听器
     */
    setupNetworkListeners() {
        // 监听网络状态变化
        connectionMonitor.addListener((status, isOnline) => {
            console.log(`🌐 网络状态变化: ${status}`);
            this.isOnline = isOnline;
            
            if (isOnline) {
                this.handleOnlineEvent();
            } else {
                this.handleOfflineEvent();
            }
        });
    }

    /**
     * 处理网络恢复事件
     */
    async handleOnlineEvent() {
        console.log('🌐 网络已恢复，开始同步数据...');
        
        try {
            // 执行待同步的操作
            await this.processSyncQueue();
            
            // 执行双向同步
            if (this.config.autoSync) {
                await this.syncData();
            }
            
        } catch (error) {
            console.error('网络恢复后同步失败:', error);
        }
    }

    /**
     * 处理网络断开事件
     */
    handleOfflineEvent() {
        console.log('📱 网络已断开，切换到离线模式');
        // 可以在这里添加离线模式的特殊处理逻辑
    }

    /**
     * 检查是否应该使用云端存储
     */
    shouldUseCloudStorage() {
        return this.isOnline && 
               !this.config.offlineMode && 
               this.supabaseStorage && 
               this.supabaseStorage.isInitialized;
    }

    /**
     * 获取当前活动的存储实例
     */
    getActiveStorage() {
        if (this.shouldUseCloudStorage()) {
            return this.supabaseStorage;
        }
        return this.localStorageBackup;
    }

    /**
     * 保存文章
     * @param {Article} article - 文章对象
     * @returns {Promise<{success: boolean, article?: Article, error?: string}>}
     */
    async saveArticle(article) {
        try {
            if (!this.isInitialized) {
                await this.initialize();
            }

            let result;
            
            if (this.shouldUseCloudStorage()) {
                // 在线模式：优先保存到云端
                try {
                    result = await this.supabaseStorage.saveArticle(article);
                    
                    if (result.success) {
                        // 云端保存成功，同时保存到本地作为缓存
                        await this.localStorageBackup.saveArticle(result.article);
                        console.log('✅ 文章已保存到云端并缓存到本地');
                    }
                    
                } catch (error) {
                    console.warn('云端保存失败，回退到本地存储:', error);
                    result = await this.localStorageBackup.saveArticle(article);
                    
                    if (result.success) {
                        // 添加到同步队列
                        this.addToSyncQueue('save', result.article);
                    }
                }
                
            } else {
                // 离线模式：保存到本地
                result = await this.localStorageBackup.saveArticle(article);
                
                if (result.success) {
                    // 添加到同步队列
                    this.addToSyncQueue('save', result.article);
                    console.log('📱 文章已保存到本地，将在网络恢复时同步');
                }
            }
            
            return result;
            
        } catch (error) {
            console.error('保存文章失败:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 获取单篇文章
     * @param {string} id - 文章 ID
     * @returns {Promise<Article|null>}
     */
    async getArticle(id) {
        try {
            if (!this.isInitialized) {
                await this.initialize();
            }

            let article = null;
            
            if (this.shouldUseCloudStorage()) {
                // 在线模式：优先从云端获取
                try {
                    article = await this.supabaseStorage.getArticle(id);
                    
                    if (article) {
                        // 更新本地缓存
                        await this.localStorageBackup.saveArticle(article);
                    }
                    
                } catch (error) {
                    console.warn('云端获取失败，尝试本地缓存:', error);
                    article = await this.localStorageBackup.getArticle(id);
                }
                
            } else {
                // 离线模式：从本地获取
                article = await this.localStorageBackup.getArticle(id);
            }
            
            return article;
            
        } catch (error) {
            console.error('获取文章失败:', error);
            return null;
        }
    }

    /**
     * 获取文章列表
     * @param {Object} options - 查询选项
     * @returns {Promise<Article[]>}
     */
    async getArticles(options = {}) {
        try {
            if (!this.isInitialized) {
                await this.initialize();
            }

            let articles = [];
            
            if (this.shouldUseCloudStorage()) {
                // 在线模式：优先从云端获取
                try {
                    articles = await this.supabaseStorage.getArticles(options);
                    
                    // 更新本地缓存
                    if (articles.length > 0) {
                        for (const article of articles) {
                            await this.localStorageBackup.saveArticle(article);
                        }
                    }
                    
                } catch (error) {
                    console.warn('云端获取列表失败，使用本地缓存:', error);
                    articles = await this.localStorageBackup.getArticles(options);
                }
                
            } else {
                // 离线模式：从本地获取
                articles = await this.localStorageBackup.getArticles(options);
            }
            
            return articles;
            
        } catch (error) {
            console.error('获取文章列表失败:', error);
            return [];
        }
    }

    /**
     * 删除文章
     * @param {string} id - 文章 ID
     * @returns {Promise<{success: boolean, error?: string}>}
     */
    async deleteArticle(id) {
        try {
            if (!this.isInitialized) {
                await this.initialize();
            }

            let result;
            
            if (this.shouldUseCloudStorage()) {
                // 在线模式：从云端删除
                try {
                    result = await this.supabaseStorage.deleteArticle(id);
                    
                    if (result.success) {
                        // 同时从本地删除
                        await this.localStorageBackup.deleteArticle(id);
                    }
                    
                } catch (error) {
                    console.warn('云端删除失败，添加到同步队列:', error);
                    result = await this.localStorageBackup.deleteArticle(id);
                    
                    if (result.success) {
                        // 添加到同步队列
                        this.addToSyncQueue('delete', { id });
                    }
                }
                
            } else {
                // 离线模式：从本地删除
                result = await this.localStorageBackup.deleteArticle(id);
                
                if (result.success) {
                    // 添加到同步队列
                    this.addToSyncQueue('delete', { id });
                }
            }
            
            return result;
            
        } catch (error) {
            console.error('删除文章失败:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 添加操作到同步队列
     * @param {string} operation - 操作类型 ('save', 'delete')
     * @param {Object} data - 操作数据
     */
    addToSyncQueue(operation, data) {
        const syncItem = {
            id: Date.now() + Math.random(),
            operation,
            data,
            timestamp: new Date().toISOString(),
            retries: 0
        };
        
        this.syncQueue.push(syncItem);
        console.log(`📝 已添加到同步队列: ${operation}`, data.id || data.title);
    }

    /**
     * 处理同步队列
     */
    async processSyncQueue() {
        if (this.syncQueue.length === 0) {
            return;
        }
        
        console.log(`🔄 处理同步队列，共 ${this.syncQueue.length} 个待同步项目`);
        
        const failedItems = [];
        
        for (const item of this.syncQueue) {
            try {
                let success = false;
                
                switch (item.operation) {
                    case 'save':
                        const saveResult = await this.supabaseStorage.saveArticle(item.data);
                        success = saveResult.success;
                        break;
                        
                    case 'delete':
                        const deleteResult = await this.supabaseStorage.deleteArticle(item.data.id);
                        success = deleteResult.success;
                        break;
                }
                
                if (!success) {
                    item.retries++;
                    if (item.retries < this.config.maxRetries) {
                        failedItems.push(item);
                    }
                }
                
            } catch (error) {
                console.error('同步队列项目失败:', error);
                item.retries++;
                if (item.retries < this.config.maxRetries) {
                    failedItems.push(item);
                }
            }
        }
        
        // 更新同步队列，只保留失败的项目
        this.syncQueue = failedItems;
        
        console.log(`✅ 同步队列处理完成，剩余 ${this.syncQueue.length} 个待重试项目`);
    }

    /**
     * 检查连接状态并同步
     */
    async checkConnectionAndSync() {
        if (this.shouldUseCloudStorage()) {
            try {
                const isConnected = await this.supabaseStorage.checkConnection();
                if (isConnected && this.config.autoSync) {
                    await this.syncData();
                }
            } catch (error) {
                console.warn('连接检查失败:', error);
            }
        }
    }

    /**
     * 启动定期同步
     */
    startPeriodicSync() {
        setInterval(async () => {
            if (this.shouldUseCloudStorage() && this.config.autoSync) {
                try {
                    await this.processSyncQueue();
                } catch (error) {
                    console.error('定期同步失败:', error);
                }
            }
        }, this.config.syncInterval);
    }

    /**
     * 手动同步数据
     */
    async syncData() {
        console.log('🔄 开始手动同步数据...');
        
        try {
            // 1. 处理同步队列（上传本地更改）
            await this.processSyncQueue();
            
            // 2. 执行双向同步
            await this.performBidirectionalSync();
            
            this.lastSyncTime = new Date().toISOString();
            console.log('✅ 数据同步完成');
            
            // 触发同步完成事件
            window.dispatchEvent(new CustomEvent('syncCompleted', {
                detail: { 
                    timestamp: this.lastSyncTime,
                    queueLength: this.syncQueue.length
                }
            }));
            
        } catch (error) {
            console.error('数据同步失败:', error);
            throw error;
        }
    }

    /**
     * 执行双向同步
     */
    async performBidirectionalSync() {
        if (!this.shouldUseCloudStorage()) {
            return;
        }

        console.log('🔄 执行双向同步...');
        
        try {
            // 获取云端所有文章
            const cloudArticles = await this.supabaseStorage.getArticles({ limit: 1000 });
            
            // 获取本地所有文章
            const localArticles = await this.localStorageBackup.getArticles({ limit: 1000 });
            
            // 创建文章映射
            const cloudMap = new Map(cloudArticles.map(article => [article.id, article]));
            const localMap = new Map(localArticles.map(article => [article.id, article]));
            
            let syncStats = {
                downloaded: 0,
                uploaded: 0,
                conflicts: 0,
                errors: 0
            };
            
            // 下载云端新文章或更新的文章
            for (const [id, cloudArticle] of cloudMap) {
                const localArticle = localMap.get(id);
                
                if (!localArticle) {
                    // 本地没有，下载
                    await this.localStorageBackup.saveArticle(cloudArticle);
                    syncStats.downloaded++;
                    console.log(`⬇️ 下载新文章: ${cloudArticle.title}`);
                    
                } else if (this.shouldUpdateLocal(localArticle, cloudArticle)) {
                    // 云端更新，下载更新
                    await this.localStorageBackup.saveArticle(cloudArticle);
                    syncStats.downloaded++;
                    console.log(`⬇️ 更新本地文章: ${cloudArticle.title}`);
                    
                } else if (this.shouldUpdateCloud(localArticle, cloudArticle)) {
                    // 本地更新，上传更新
                    const result = await this.supabaseStorage.saveArticle(localArticle);
                    if (result.success) {
                        syncStats.uploaded++;
                        console.log(`⬆️ 上传本地更新: ${localArticle.title}`);
                    } else {
                        syncStats.errors++;
                    }
                    
                } else if (this.hasConflict(localArticle, cloudArticle)) {
                    // 冲突处理
                    const resolved = await this.resolveConflict(localArticle, cloudArticle);
                    if (resolved) {
                        syncStats.conflicts++;
                        console.log(`⚠️ 解决冲突: ${localArticle.title}`);
                    }
                }
            }
            
            // 上传本地独有的文章
            for (const [id, localArticle] of localMap) {
                if (!cloudMap.has(id)) {
                    const result = await this.supabaseStorage.saveArticle(localArticle);
                    if (result.success) {
                        syncStats.uploaded++;
                        console.log(`⬆️ 上传新文章: ${localArticle.title}`);
                    } else {
                        syncStats.errors++;
                    }
                }
            }
            
            console.log('📊 同步统计:', syncStats);
            
            // 触发同步统计事件
            window.dispatchEvent(new CustomEvent('syncStats', {
                detail: syncStats
            }));
            
        } catch (error) {
            console.error('双向同步失败:', error);
            throw error;
        }
    }

    /**
     * 判断是否应该更新本地文章
     */
    shouldUpdateLocal(localArticle, cloudArticle) {
        const localTime = new Date(localArticle.updatedAt || localArticle.lastModified);
        const cloudTime = new Date(cloudArticle.updatedAt || cloudArticle.lastModified);
        
        return cloudTime > localTime;
    }

    /**
     * 判断是否应该更新云端文章
     */
    shouldUpdateCloud(localArticle, cloudArticle) {
        const localTime = new Date(localArticle.updatedAt || localArticle.lastModified);
        const cloudTime = new Date(cloudArticle.updatedAt || cloudArticle.lastModified);
        
        return localTime > cloudTime;
    }

    /**
     * 检查是否存在冲突
     */
    hasConflict(localArticle, cloudArticle) {
        const localTime = new Date(localArticle.updatedAt || localArticle.lastModified);
        const cloudTime = new Date(cloudArticle.updatedAt || cloudArticle.lastModified);
        
        // 如果两个版本的更新时间相近（5分钟内），但内容不同，则认为有冲突
        const timeDiff = Math.abs(localTime - cloudTime);
        const hasTimeDiff = timeDiff < 5 * 60 * 1000; // 5分钟
        
        const contentDiff = localArticle.content !== cloudArticle.content ||
                           localArticle.title !== cloudArticle.title;
        
        return hasTimeDiff && contentDiff;
    }

    /**
     * 解决冲突
     * @param {Article} localArticle - 本地文章
     * @param {Article} cloudArticle - 云端文章
     * @param {string} strategy - 冲突解决策略
     */
    async resolveConflict(localArticle, cloudArticle, strategy = 'auto') {
        console.log(`⚠️ 检测到冲突: ${localArticle.title}`);
        
        try {
            let winnerArticle;
            let targetStorage;
            let winner;
            
            switch (strategy) {
                case 'local_wins':
                    // 本地版本获胜
                    winnerArticle = localArticle;
                    targetStorage = this.supabaseStorage;
                    winner = 'local';
                    console.log('📝 强制本地版本获胜');
                    break;
                    
                case 'cloud_wins':
                    // 云端版本获胜
                    winnerArticle = cloudArticle;
                    targetStorage = this.localStorageBackup;
                    winner = 'cloud';
                    console.log('☁️ 强制云端版本获胜');
                    break;
                    
                case 'merge':
                    // 尝试合并（简单的内容合并）
                    winnerArticle = this.mergeArticles(localArticle, cloudArticle);
                    targetStorage = this.supabaseStorage;
                    winner = 'merged';
                    console.log('🔀 尝试合并版本');
                    
                    // 同时更新本地
                    await this.localStorageBackup.saveArticle(winnerArticle);
                    break;
                    
                case 'auto':
                default:
                    // 自动解决：使用最后写入获胜策略
                    const localTime = new Date(localArticle.updatedAt || localArticle.lastModified);
                    const cloudTime = new Date(cloudArticle.updatedAt || cloudArticle.lastModified);
                    
                    if (localTime >= cloudTime) {
                        winnerArticle = localArticle;
                        targetStorage = this.supabaseStorage;
                        winner = 'local';
                        console.log('📝 自动解决：本地版本获胜');
                    } else {
                        winnerArticle = cloudArticle;
                        targetStorage = this.localStorageBackup;
                        winner = 'cloud';
                        console.log('☁️ 自动解决：云端版本获胜');
                    }
                    break;
            }
            
            // 保存获胜的版本
            const result = await targetStorage.saveArticle(winnerArticle);
            
            if (result.success) {
                // 触发冲突解决事件
                window.dispatchEvent(new CustomEvent('conflictResolved', {
                    detail: {
                        articleId: winnerArticle.id,
                        winner: winner,
                        strategy: strategy,
                        localArticle: localArticle,
                        cloudArticle: cloudArticle,
                        resolvedArticle: winnerArticle
                    }
                }));
                
                console.log(`✅ 冲突解决成功: ${winner} 版本获胜`);
            }
            
            return result.success;
            
        } catch (error) {
            console.error('冲突解决失败:', error);
            return false;
        }
    }

    /**
     * 合并两个文章版本（简单合并策略）
     */
    mergeArticles(localArticle, cloudArticle) {
        // 创建合并后的文章
        const mergedArticle = new Article({
            ...localArticle.toJSON(),
            // 使用较新的时间戳
            updatedAt: new Date().toISOString(),
            lastModified: new Date().toISOString()
        });
        
        // 合并标签（去重）
        const allTags = [...new Set([...localArticle.tags, ...cloudArticle.tags])];
        mergedArticle.tags = allTags;
        
        // 如果标题不同，使用本地版本但添加标记
        if (localArticle.title !== cloudArticle.title) {
            mergedArticle.title = localArticle.title + ' (已合并)';
        }
        
        // 简单的内容合并：如果内容不同，添加云端版本作为附录
        if (localArticle.content !== cloudArticle.content) {
            mergedArticle.content = localArticle.content + 
                '\n\n<hr>\n<h3>云端版本内容：</h3>\n' + 
                cloudArticle.content;
        }
        
        return mergedArticle;
    }

    /**
     * 获取冲突详情
     */
    getConflictDetails(localArticle, cloudArticle) {
        const details = {
            articleId: localArticle.id,
            title: localArticle.title,
            hasConflict: this.hasConflict(localArticle, cloudArticle),
            differences: {
                title: localArticle.title !== cloudArticle.title,
                content: localArticle.content !== cloudArticle.content,
                category: localArticle.category !== cloudArticle.category,
                tags: JSON.stringify(localArticle.tags) !== JSON.stringify(cloudArticle.tags),
                status: localArticle.status !== cloudArticle.status,
                visibility: localArticle.visibility !== cloudArticle.visibility
            },
            timestamps: {
                local: localArticle.updatedAt || localArticle.lastModified,
                cloud: cloudArticle.updatedAt || cloudArticle.lastModified
            },
            versions: {
                local: localArticle,
                cloud: cloudArticle
            }
        };
        
        return details;
    }

    /**
     * 设置冲突解决策略
     */
    setConflictResolutionStrategy(strategy) {
        const validStrategies = ['auto', 'local_wins', 'cloud_wins', 'merge', 'manual'];
        
        if (validStrategies.includes(strategy)) {
            this.config.conflictResolution = strategy;
            console.log(`⚙️ 冲突解决策略设置为: ${strategy}`);
        } else {
            console.error('无效的冲突解决策略:', strategy);
        }
    }

    /**
     * 获取所有待解决的冲突
     */
    async getPendingConflicts() {
        if (!this.shouldUseCloudStorage()) {
            return [];
        }
        
        try {
            const cloudArticles = await this.supabaseStorage.getArticles({ limit: 1000 });
            const localArticles = await this.localStorageBackup.getArticles({ limit: 1000 });
            
            const conflicts = [];
            const cloudMap = new Map(cloudArticles.map(article => [article.id, article]));
            
            for (const localArticle of localArticles) {
                const cloudArticle = cloudMap.get(localArticle.id);
                if (cloudArticle && this.hasConflict(localArticle, cloudArticle)) {
                    conflicts.push(this.getConflictDetails(localArticle, cloudArticle));
                }
            }
            
            return conflicts;
            
        } catch (error) {
            console.error('获取冲突列表失败:', error);
            return [];
        }
    }

    /**
     * 获取同步状态指示器
     */
    getSyncStatus() {
        const status = {
            isOnline: this.isOnline,
            activeStorage: this.shouldUseCloudStorage() ? 'cloud' : 'local',
            pendingSync: this.syncQueue.length,
            lastSync: this.lastSyncTime,
            autoSync: this.config.autoSync
        };
        
        // 确定同步状态
        if (!this.isOnline) {
            status.status = 'offline';
            status.message = '离线模式';
            status.icon = '📱';
        } else if (this.syncQueue.length > 0) {
            status.status = 'pending';
            status.message = `${this.syncQueue.length} 项待同步`;
            status.icon = '🔄';
        } else {
            status.status = 'synced';
            status.message = '已同步';
            status.icon = '✅';
        }
        
        return status;
    }

    /**
     * 获取存储状态信息
     */
    getStorageStatus() {
        return {
            isInitialized: this.isInitialized,
            isOnline: this.isOnline,
            activeStorage: this.shouldUseCloudStorage() ? 'cloud' : 'local',
            syncQueueLength: this.syncQueue.length,
            lastSyncTime: this.lastSyncTime,
            config: this.config
        };
    }

    /**
     * 设置配置选项
     * @param {Object} newConfig - 新的配置选项
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        console.log('⚙️ 存储配置已更新:', this.config);
    }
}

// 导出类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { HybridStorageManager };
} else {
    window.HybridStorageManager = HybridStorageManager;
}