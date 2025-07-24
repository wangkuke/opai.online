/**
 * 错误处理工具类
 * 统一处理各种错误类型和网络重试逻辑
 */

class ErrorHandler {
    /**
     * 处理 Supabase 特定错误
     * @param {Object} error - Supabase 错误对象
     * @returns {Object} 标准化的错误信息
     */
    static handleSupabaseError(error) {
        const errorMap = {
            'PGRST116': { type: 'NOT_FOUND', message: '文章不存在' },
            '23505': { type: 'DUPLICATE', message: '文章ID已存在' },
            '23502': { type: 'MISSING_FIELD', message: '缺少必填字段' },
            '23514': { type: 'INVALID_DATA', message: '数据格式不正确' },
            'PGRST301': { type: 'PERMISSION_DENIED', message: '权限不足' },
            'PGRST204': { type: 'PERMISSION_DENIED', message: '访问被拒绝' },
            '42501': { type: 'PERMISSION_DENIED', message: '数据库权限不足' },
            'PGRST103': { type: 'INVALID_REQUEST', message: '请求格式错误' },
            'PGRST106': { type: 'INVALID_REQUEST', message: '查询参数错误' }
        };

        const errorInfo = errorMap[error.code] || {
            type: 'UNKNOWN',
            message: error.message || '数据库操作失败'
        };

        return {
            ...errorInfo,
            originalError: error,
            code: error.code,
            details: error.details || error.hint
        };
    }

    /**
     * 处理网络错误
     * @param {Error} error - 网络错误对象
     * @returns {Object} 标准化的错误信息
     */
    static handleNetworkError(error) {
        if (!navigator.onLine) {
            return {
                type: 'OFFLINE',
                message: '网络连接不可用，请检查网络设置',
                isRetryable: true
            };
        }

        if (error.name === 'AbortError') {
            return {
                type: 'TIMEOUT',
                message: '请求超时，请稍后重试',
                isRetryable: true
            };
        }

        if (error.message.includes('fetch')) {
            return {
                type: 'NETWORK',
                message: '网络请求失败，请检查网络连接',
                isRetryable: true
            };
        }

        return {
            type: 'UNKNOWN_NETWORK',
            message: error.message || '网络错误',
            isRetryable: false
        };
    }

    /**
     * 判断错误是否可以重试
     * @param {Object} error - 错误对象
     * @returns {boolean} 是否可以重试
     */
    static isRetryableError(error) {
        const retryableCodes = ['PGRST301', 'PGRST204', '42501']; // 权限错误可能是临时的
        const retryableTypes = ['NETWORK', 'TIMEOUT', 'OFFLINE'];

        return retryableCodes.includes(error.code) || 
               retryableTypes.includes(error.type) ||
               error.isRetryable === true;
    }

    /**
     * 获取用户友好的错误消息
     * @param {Object} error - 错误对象
     * @returns {string} 用户友好的错误消息
     */
    static getUserFriendlyMessage(error) {
        const friendlyMessages = {
            'NOT_FOUND': '抱歉，找不到您要查看的文章',
            'DUPLICATE': '文章已存在，请检查文章ID',
            'MISSING_FIELD': '请填写所有必填字段',
            'INVALID_DATA': '数据格式不正确，请检查输入',
            'PERMISSION_DENIED': '您没有权限执行此操作',
            'OFFLINE': '网络连接不可用，请检查网络设置后重试',
            'TIMEOUT': '请求超时，请稍后重试',
            'NETWORK': '网络连接出现问题，请稍后重试'
        };

        return friendlyMessages[error.type] || error.message || '操作失败，请稍后重试';
    }
}

/**
 * 网络重试工具类
 */
class RetryHandler {
    /**
     * 执行带重试的异步操作
     * @param {Function} operation - 要执行的异步操作
     * @param {Object} options - 重试选项
     * @returns {Promise} 操作结果
     */
    static async withRetry(operation, options = {}) {
        const {
            maxRetries = 3,
            baseDelay = 1000,
            maxDelay = 10000,
            backoffFactor = 2,
            retryCondition = ErrorHandler.isRetryableError
        } = options;

        let lastError;
        let delay = baseDelay;

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                return await operation();
            } catch (error) {
                lastError = error;

                // 如果是最后一次尝试，直接抛出错误
                if (attempt === maxRetries) {
                    break;
                }

                // 检查是否应该重试
                const processedError = error.code ? 
                    ErrorHandler.handleSupabaseError(error) : 
                    ErrorHandler.handleNetworkError(error);

                if (!retryCondition(processedError)) {
                    break;
                }

                // 等待后重试
                console.log(`操作失败，${delay}ms 后进行第 ${attempt + 2} 次尝试...`);
                await this.sleep(delay);

                // 指数退避
                delay = Math.min(delay * backoffFactor, maxDelay);
            }
        }

        throw lastError;
    }

    /**
     * 睡眠函数
     * @param {number} ms - 睡眠时间（毫秒）
     * @returns {Promise} Promise 对象
     */
    static sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * 创建带超时的 Promise
     * @param {Promise} promise - 原始 Promise
     * @param {number} timeout - 超时时间（毫秒）
     * @returns {Promise} 带超时的 Promise
     */
    static withTimeout(promise, timeout = 30000) {
        return Promise.race([
            promise,
            new Promise((_, reject) => {
                setTimeout(() => {
                    reject(new Error('操作超时'));
                }, timeout);
            })
        ]);
    }
}

/**
 * 连接状态监控器
 */
class ConnectionMonitor {
    constructor() {
        this.isOnline = navigator.onLine;
        this.listeners = [];
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.notifyListeners('online');
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.notifyListeners('offline');
        });
    }

    /**
     * 添加连接状态变化监听器
     * @param {Function} callback - 回调函数
     */
    addListener(callback) {
        this.listeners.push(callback);
    }

    /**
     * 移除连接状态变化监听器
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
     * @param {string} status - 连接状态
     */
    notifyListeners(status) {
        this.listeners.forEach(callback => {
            try {
                callback(status, this.isOnline);
            } catch (error) {
                console.error('连接状态监听器错误:', error);
            }
        });
    }

    /**
     * 检查网络连接状态
     * @returns {boolean} 是否在线
     */
    checkConnection() {
        return this.isOnline;
    }
}

// 创建全局连接监控器实例
const connectionMonitor = new ConnectionMonitor();

// 导出类和实例
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        ErrorHandler, 
        RetryHandler, 
        ConnectionMonitor,
        connectionMonitor 
    };
} else {
    window.ErrorHandler = ErrorHandler;
    window.RetryHandler = RetryHandler;
    window.ConnectionMonitor = ConnectionMonitor;
    window.connectionMonitor = connectionMonitor;
}