/**
 * Supabase Storage Service
 * 处理文章数据的 Supabase 数据库操作
 */

class SupabaseStorage {
    constructor() {
        this.publicClient = null;
        this.adminClient = null;
        this.isInitialized = false;
        this.initializationPromise = null;
    }

    /**
     * 检查 Supabase 是否可用
     */
    static isSupabaseAvailable() {
        return typeof window !== 'undefined' && typeof window.supabase !== 'undefined' && 
               typeof window.createPublicSupabaseClient !== 'undefined';
    }

    /**
     * 初始化 Supabase 客户端
     */
    async initialize() {
        // 如果已经有初始化中的Promise，直接返回
        if (this.initializationPromise) {
            return this.initializationPromise;
        }

        // 创建新的初始化Promise
        this.initializationPromise = new Promise(async (resolve, reject) => {
            try {
                // 检查 Supabase 是否可用，如果不可用则等待
                if (!SupabaseStorage.isSupabaseAvailable()) {
                    // 等待最多5秒，每100ms检查一次
                    const maxWaitTime = 5000;
                    const checkInterval = 100;
                    let elapsedTime = 0;

                    while (!SupabaseStorage.isSupabaseAvailable() && elapsedTime < maxWaitTime) {
                        await new Promise(resolve => setTimeout(resolve, checkInterval));
                        elapsedTime += checkInterval;
                    }

                    if (!SupabaseStorage.isSupabaseAvailable()) {
                        throw new Error('等待 Supabase 加载超时');
                    }
                }

                // 创建公共客户端（用于读取操作）
                this.publicClient = window.createPublicSupabaseClient();

                // 创建管理员客户端（用于写入操作）
                try {
                    this.adminClient = window.createAdminSupabaseClient();
                } catch (error) {
                    console.warn('⚠️ 无法创建管理员客户端:', error.message);
                    // 对于只读操作，我们可以继续使用公共客户端
                }

                this.isInitialized = true;
                console.log('✅ SupabaseStorage 初始化成功');
                resolve(true);
            } catch (error) {
                console.error('❌ SupabaseStorage 初始化失败:', error);
                reject(error);
            }
        });

        return this.initializationPromise;
    }

    /**
     * 确保客户端已初始化
     */
    ensureInitialized() {
        if (!this.isInitialized) {
            throw new Error('SupabaseStorage 未初始化，请先调用 initialize()');
        }
    }

    /**
     * 保存文章到 Supabase
     * @param {Article} article - 文章对象
     * @returns {Promise<{success: boolean, article?: Article, error?: string}>}
     */
    async saveArticle(article) {
        try {
            this.ensureInitialized();

            // 验证文章
            const validation = article.validate();
            if (!validation.isValid) {
                return {
                    success: false,
                    error: validation.error
                };
            }

            // 转换为 Supabase 格式
            const articleData = article.toSupabaseFormat();

            // 使用重试机制执行保存操作
            const result = await RetryHandler.withRetry(async () => {
                const { data, error } = await RetryHandler.withTimeout(
                    this.adminClient
                        .from('articles')
                        .upsert([articleData])
                        .select()
                        .single(),
                    15000 // 15秒超时
                );

                if (error) {
                    throw error;
                }

                return data;
            }, {
                maxRetries: 3,
                baseDelay: 1000
            });

            // 转换回 Article 对象
            const savedArticle = Article.fromSupabaseFormat(result);
            
            console.log('✅ 文章保存成功:', savedArticle.id);
            return {
                success: true,
                article: savedArticle
            };

        } catch (error) {
            console.error('保存文章异常:', error);
            
            const processedError = error.code ? 
                ErrorHandler.handleSupabaseError(error) : 
                ErrorHandler.handleNetworkError(error);

            return {
                success: false,
                error: ErrorHandler.getUserFriendlyMessage(processedError)
            };
        }
    }
}

// 确保window上有SupabaseStorage实例
window.SupabaseStorage = new SupabaseStorage();

    /**
     * 保存文章到 Supabase
     * @param {Article} article - 文章对象
     * @returns {Promise<{success: boolean, article?: Article, error?: string}>}
     */
    async saveArticle(article) {
        try {
            this.ensureInitialized();

            // 验证文章
            const validation = article.validate();
            if (!validation.isValid) {
                return {
                    success: false,
                    error: '文章验证失败: ' + validation.errors.join(', ')
                };
            }

            // 转换为 Supabase 格式
            const articleData = article.toSupabaseFormat();

            // 使用重试机制执行保存操作
            const result = await RetryHandler.withRetry(async () => {
                const { data, error } = await RetryHandler.withTimeout(
                    this.adminClient
                        .from('articles')
                        .upsert([articleData])
                        .select()
                        .single(),
                    15000 // 15秒超时
                );

                if (error) {
                    throw error;
                }

                return data;
            }, {
                maxRetries: 3,
                baseDelay: 1000
            });

            // 转换回 Article 对象
            const savedArticle = Article.fromSupabaseFormat(result);
            
            console.log('✅ 文章保存成功:', savedArticle.id);
            return {
                success: true,
                article: savedArticle
            };

        } catch (error) {
            console.error('保存文章异常:', error);
            
            const processedError = error.code ? 
                ErrorHandler.handleSupabaseError(error) : 
                ErrorHandler.handleNetworkError(error);

            return {
                success: false,
                error: ErrorHandler.getUserFriendlyMessage(processedError)
            };
        }
    }

    /**
     * 从 Supabase 获取单篇文章
     * @param {string} id - 文章 ID
     * @returns {Promise<Article|null>}
     */
    async getArticle(id) {
        try {
            this.ensureInitialized();

            if (!id) {
                console.warn('文章 ID 为空');
                return null;
            }

            // 使用重试机制执行获取操作
            const result = await RetryHandler.withRetry(async () => {
                const { data, error } = await RetryHandler.withTimeout(
                    this.publicClient
                        .from('articles')
                        .select('*')
                        .eq('id', id)
                        .single(),
                    10000 // 10秒超时
                );

                if (error) {
                    if (error.code === 'PGRST116') {
                        // 文章不存在，不需要重试
                        return null;
                    }
                    throw error;
                }

                return data;
            }, {
                maxRetries: 2,
                baseDelay: 500
            });

            if (!result) {
                console.log('文章不存在:', id);
                return null;
            }

            // 转换为 Article 对象
            const article = Article.fromSupabaseFormat(result);
            console.log('✅ 文章获取成功:', article.id);
            
            return article;

        } catch (error) {
            console.error('获取文章异常:', error);
            
            const processedError = error.code ? 
                ErrorHandler.handleSupabaseError(error) : 
                ErrorHandler.handleNetworkError(error);

            // 对于读取操作，网络错误时返回 null 而不是抛出异常
            if (processedError.type === 'NETWORK' || processedError.type === 'TIMEOUT') {
                console.warn('网络问题导致文章获取失败:', processedError.message);
                return null;
            }

            return null;
        }
    }

    /**
     * 获取文章列表
     * @param {Object} options - 查询选项
     * @param {string} options.status - 文章状态筛选
     * @param {string} options.category - 分类筛选
     * @param {string} options.visibility - 可见性筛选
     * @param {number} options.limit - 限制数量
     * @param {number} options.offset - 偏移量
     * @param {string} options.search - 搜索关键词
     * @returns {Promise<Article[]>}
     */
    async getArticles(options = {}) {
        try {
            this.ensureInitialized();

            // 使用重试机制执行查询操作
            const result = await RetryHandler.withRetry(async () => {
                let query = this.publicClient
                    .from('articles')
                    .select('*');

                // 应用筛选条件
                if (options.status) {
                    query = query.eq('status', options.status);
                }

                if (options.category) {
                    query = query.eq('category', options.category);
                }

                if (options.visibility) {
                    query = query.eq('visibility', options.visibility);
                }

                // 搜索功能
                if (options.search) {
                    query = query.or(`title.ilike.%${options.search}%,content.ilike.%${options.search}%,excerpt.ilike.%${options.search}%`);
                }

                // 排序（按发布日期降序）
                query = query.order('publish_date', { ascending: false });

                // 分页
                if (options.limit) {
                    query = query.limit(options.limit);
                }

                if (options.offset) {
                    query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
                }

                const { data, error } = await RetryHandler.withTimeout(query, 12000);

                if (error) {
                    throw error;
                }

                return data;
            }, {
                maxRetries: 2,
                baseDelay: 800
            });

            // 转换为 Article 对象数组
            const articles = result.map(item => Article.fromSupabaseFormat(item));
            
            console.log(`✅ 获取文章列表成功: ${articles.length} 篇文章`);
            return articles;

        } catch (error) {
            console.error('获取文章列表异常:', error);
            
            const processedError = error.code ? 
                ErrorHandler.handleSupabaseError(error) : 
                ErrorHandler.handleNetworkError(error);

            // 对于列表查询，网络错误时返回空数组
            if (processedError.type === 'NETWORK' || processedError.type === 'TIMEOUT') {
                console.warn('网络问题导致文章列表获取失败:', processedError.message);
            }

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
            this.ensureInitialized();

            if (!id) {
                return {
                    success: false,
                    error: '文章 ID 不能为空'
                };
            }

            // 使用重试机制执行删除操作
            await RetryHandler.withRetry(async () => {
                const { error } = await RetryHandler.withTimeout(
                    this.adminClient
                        .from('articles')
                        .delete()
                        .eq('id', id),
                    10000 // 10秒超时
                );

                if (error) {
                    throw error;
                }
            }, {
                maxRetries: 2,
                baseDelay: 1000
            });

            console.log('✅ 文章删除成功:', id);
            return { success: true };

        } catch (error) {
            console.error('删除文章异常:', error);
            
            const processedError = error.code ? 
                ErrorHandler.handleSupabaseError(error) : 
                ErrorHandler.handleNetworkError(error);

            return {
                success: false,
                error: ErrorHandler.getUserFriendlyMessage(processedError)
            };
        }
    }

    /**
     * 获取文章数量
     * @param {Object} options - 查询选项
     * @returns {Promise<number>}
     */
    async getArticleCount(options = {}) {
        try {
            this.ensureInitialized();

            let query = this.publicClient
                .from('articles')
                .select('*', { count: 'exact', head: true });

            // 应用筛选条件
            if (options.status) {
                query = query.eq('status', options.status);
            }

            if (options.category) {
                query = query.eq('category', options.category);
            }

            if (options.visibility) {
                query = query.eq('visibility', options.visibility);
            }

            const { count, error } = await query;

            if (error) {
                console.error('Supabase 获取文章数量错误:', error);
                return 0;
            }

            return count || 0;

        } catch (error) {
            console.error('获取文章数量异常:', error);
            return 0;
        }
    }

    /**
     * 处理 Supabase 错误
     * @param {Object} error - Supabase 错误对象
     * @returns {string} 用户友好的错误消息
     */
    handleSupabaseError(error) {
        switch (error.code) {
            case 'PGRST116':
                return '文章不存在';
            case '23505':
                return '文章ID已存在';
            case '23502':
                return '缺少必填字段';
            case '23514':
                return '数据格式不正确';
            case 'PGRST301':
                return '权限不足';
            default:
                return error.message || '数据库操作失败';
        }
    }

    /**
     * 检查连接状态
     * @returns {Promise<boolean>}
     */
    async checkConnection() {
        try {
            this.ensureInitialized();

            const { error } = await this.publicClient
                .from('articles')
                .select('count', { count: 'exact', head: true });

            return !error;
        } catch (error) {
            console.error('连接检查失败:', error);
            return false;
        }
    }
}

// 导出类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SupabaseStorage };
} else {
    window.SupabaseStorage = new SupabaseStorage();
}