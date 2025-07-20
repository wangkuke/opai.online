/**
 * Supabase Production Configuration
 * 生产环境配置 - 只包含公开安全的密钥
 */

// Supabase 生产环境配置
const SUPABASE_CONFIG = {
    // 你的 Supabase 项目 URL
    url: 'https://escbxrxzybfkiqhuffbd.supabase.co',
    
    // 你的 Supabase 匿名密钥 (anon key)
    // 这是公开密钥，可以在前端安全使用
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVzY2J4cnh6eWJma2lxaHVmZmJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5ODg5ODcsImV4cCI6MjA2ODU2NDk4N30.5kht2WVZUN0u7K93o8ZWAWU7MvXQh_PUMqBz_wuyDRw',
    
    // Supabase 客户端选项
    options: {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: false
        },
        realtime: {
            enabled: true
        },
        global: {
            headers: {
                'X-Client-Info': 'opai-blog-system-production'
            }
        }
    }
};

// 验证配置是否完整
function validateSupabaseConfig() {
    const errors = [];
    
    if (!SUPABASE_CONFIG.url || SUPABASE_CONFIG.url === 'YOUR_SUPABASE_URL') {
        errors.push('Supabase URL 未配置');
    }
    
    if (!SUPABASE_CONFIG.anonKey || SUPABASE_CONFIG.anonKey === 'YOUR_SUPABASE_ANON_KEY') {
        errors.push('Supabase 匿名密钥未配置');
    }
    
    if (!SUPABASE_CONFIG.url.includes('supabase.co')) {
        errors.push('Supabase URL 格式不正确');
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

// 获取配置信息
function getSupabaseConfig() {
    const validation = validateSupabaseConfig();
    
    if (!validation.isValid) {
        console.error('Supabase 配置错误:', validation.errors);
        throw new Error('Supabase 配置不完整: ' + validation.errors.join(', '));
    }
    
    return SUPABASE_CONFIG;
}

// 创建公共客户端（使用 anon 密钥）
function createPublicSupabaseClient() {
    const config = getSupabaseConfig();
    return supabase.createClient(config.url, config.anonKey, config.options);
}

// 创建管理员客户端的占位符函数
// 注意：生产环境中不提供 service_role 密钥
function createAdminSupabaseClient() {
    console.warn('⚠️ 生产环境不支持管理员客户端');
    console.warn('⚠️ 管理员操作需要通过后端 API 或 Supabase Dashboard 进行');
    throw new Error('生产环境不支持管理员客户端操作');
}

// 导出配置
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        SUPABASE_CONFIG, 
        getSupabaseConfig, 
        validateSupabaseConfig,
        createPublicSupabaseClient,
        createAdminSupabaseClient
    };
} else {
    window.SUPABASE_CONFIG = SUPABASE_CONFIG;
    window.getSupabaseConfig = getSupabaseConfig;
    window.validateSupabaseConfig = validateSupabaseConfig;
    window.createPublicSupabaseClient = createPublicSupabaseClient;
    window.createAdminSupabaseClient = createAdminSupabaseClient;
}

// 生产环境提示
console.log('🚀 Supabase 生产环境配置已加载');
console.log('🔒 使用安全的匿名密钥连接');
console.log('⚠️ 管理员操作需要通过后端进行');

// 配置验证
const configStatus = validateSupabaseConfig();
if (configStatus.isValid) {
    console.log('✅ Supabase 配置验证通过');
} else {
    console.error('❌ Supabase 配置验证失败:', configStatus.errors);
}