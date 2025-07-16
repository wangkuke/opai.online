// 收款系统配置文件
const CONFIG = {
    // API配置
    API: {
        // NOWPayments API配置
        BASE_URL: 'https://api.nowpayments.io',
        
        // NOWPayments API密钥
        API_KEY: 'R0S2ZTC-G4R4VMT-HQYKQEA-CDKJPNF',
        
        // API版本
        VERSION: 'v1',
        
        // 请求超时时间（毫秒）
        TIMEOUT: 30000,
        
        // 重试次数
        RETRY_COUNT: 3,
        
        // 测试模式 - 设置为true时使用模拟数据
        TEST_MODE: false
    },
    
    // 支付配置
    PAYMENT: {
        // 支持的支付方式
        METHODS: {
            NOWPAYMENTS: {
                id: 'nowpayments',
                name: '加密货币支付',
                icon: 'fa-bitcoin',
                color: 'orange',
                enabled: true,
                description: '支持BTC、ETH、USDT等多种加密货币'
            },
            ALIPAY: {
                id: 'alipay',
                name: '支付宝',
                icon: 'fa-credit-card',
                color: 'blue',
                enabled: false
            },
            WECHAT: {
                id: 'wechat',
                name: '微信支付',
                icon: 'fa-wechat',
                color: 'green',
                enabled: false
            },
            BANK_CARD: {
                id: 'bank_card',
                name: '银行卡',
                icon: 'fa-credit-card',
                color: 'purple',
                enabled: false
            },
            CASH: {
                id: 'cash',
                name: '现金支付',
                icon: 'fa-money',
                color: 'orange',
                enabled: false
            }
        },
        
        // 货币配置
        CURRENCY: {
            DEFAULT: 'USD',
            SYMBOL: '$',
            DECIMAL_PLACES: 2
        },
        
        // 订单配置
        ORDER: {
            // 订单号前缀
            PREFIX: 'YTCOURSE',
            
            // 订单有效期（分钟）
            EXPIRE_MINUTES: 30,
            
            // 最小支付金额
            MIN_AMOUNT: 1,
            
            // 最大支付金额
            MAX_AMOUNT: 10000
        },
        
        // NOWPayments特定配置
        NOWPAYMENTS: {
            // 支持的加密货币
            SUPPORTED_CRYPTOCURRENCIES: [
                'btc', 'eth', 'usdt', 'usdc', 'bnb', 'ada', 'sol', 'dot', 'doge', 'matic'
            ],
            
            // 默认加密货币
            DEFAULT_CRYPTO: 'usdt',
            
            // 支付状态轮询间隔（毫秒）
            POLL_INTERVAL: 5000,
            
            // 最大轮询次数
            MAX_POLL_COUNT: 60
        }
    },
    
    // 课程配置
    COURSES: {
        BASIC: {
            id: 'basic',
            name: 'YouTube Shorts基础课程',
            price: 39.9,
            originalPrice: 79.9,
            description: '适合零基础学员，包含完整的课程内容和学习资源',
            features: [
                '完整的课程视频内容',
                '基础AI工具使用教程',
                '账号注册与设置指导',
                '基础内容创作技巧',
                '学习资料包下载'
            ],
            duration: '16天',
            level: 'beginner',
            popular: false
        },
        VIP: {
            id: 'vip',
            name: 'YouTube Shorts VIP课程',
            price: 399,
            originalPrice: 599,
            description: '适合想要快速变现的学员，提供定制化服务和终身支持',
            features: [
                '包含基础课程全部内容',
                '高级AI工具深度应用',
                '定制化内容策略',
                'YPP开通全程指导',
                '变现策略深度解析',
                '终身学习支持',
                '优先客服支持'
            ],
            duration: '终身',
            level: 'advanced',
            popular: true
        }
    },
    
    // UI配置
    UI: {
        // 主题颜色
        COLORS: {
            PRIMARY: '#165DFF',
            SECONDARY: '#722ED1',
            ACCENT: '#FF7D00',
            SUCCESS: '#00B42A',
            WARNING: '#FF7D00',
            DANGER: '#F53F3F'
        },
        
        // 动画配置
        ANIMATION: {
            DURATION: 300,
            EASING: 'ease-in-out'
        },
        
        // 消息配置
        MESSAGE: {
            DISPLAY_TIME: 3000,
            POSITION: 'top-right'
        }
    },
    
    // 本地存储配置
    STORAGE: {
        // 支付历史记录键名
        PAYMENT_HISTORY_KEY: 'paymentHistory',
        
        // 用户偏好设置键名
        USER_PREFERENCES_KEY: 'userPreferences',
        
        // 购物车键名
        CART_KEY: 'shoppingCart'
    },
    
    // 错误消息配置
    MESSAGES: {
        SUCCESS: {
            PAYMENT_COMPLETED: '支付成功！我们会尽快联系您安排课程学习。',
            ORDER_CREATED: '订单创建成功',
            PAYMENT_METHOD_SELECTED: '支付方式已选择',
            CRYPTO_PAYMENT_INITIATED: '加密货币支付已启动，请完成支付'
        },
        ERROR: {
            NETWORK_ERROR: '网络错误，请检查网络连接',
            API_ERROR: 'API调用失败，请重试',
            INVALID_AMOUNT: '支付金额无效',
            PAYMENT_FAILED: '支付失败，请重试',
            ORDER_CREATE_FAILED: '订单创建失败',
            INVALID_PAYMENT_METHOD: '无效的支付方式',
            CONTACT_INFO_REQUIRED: '请输入联系方式',
            PAYMENT_METHOD_REQUIRED: '请选择支付方式',
            CRYPTO_PAYMENT_FAILED: '加密货币支付失败',
            PAYMENT_TIMEOUT: '支付超时，请重试'
        },
        WARNING: {
            SELECT_PAYMENT_METHOD: '请选择支付方式',
            ENTER_CONTACT_INFO: '请输入联系方式',
            CONFIRM_PAYMENT: '请确认支付信息',
            PAYMENT_PENDING: '支付处理中，请稍候'
        },
        INFO: {
            PROCESSING: '正在处理支付...',
            LOADING: '加载中...',
            SAVING: '保存中...',
            PAYMENT_CONFIRMING: '正在确认支付状态...'
        }
    }
};

// 导出配置
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
} else {
    window.CONFIG = CONFIG;
} 