/**
 * Supabase Configuration
 * 配置 Supabase 项目连接信息
 */

// Supabase 项目配置
// 请将以下占位符替换为你的实际 Supabase 项目信息
const SUPABASE_CONFIG = {
    // 你的 Supabase 项目 URL
    // 格式: https://your-project-id.supabase.co
    url: 'https://escbxrxzybfkiqhuffbd.supabase.co',
    
    // 你的 Supabase 匿名密钥 (anon key)
    // 这是公开密钥，可以在前端安全使用
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVzY2J4cnh6eWJma2lxaHVmZmJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5ODg5ODcsImV4cCI6MjA2ODU2NDk4N30.5kht2WVZUN0u7K93o8ZWAWU7MvXQh_PUMqBz_wuyDRw',
    
    // 你的 Supabase 服务角色密钥 (service_role key)
    // 注意：这个密钥有完全访问权限，只能在服务器端或受信任的环境中使用
    // 在生产环境中，应该通过环境变量或安全的配置管理系统来管理
    serviceRoleKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVzY2J4cnh6eWJma2lxaHVmZmJkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mjk4ODk4NywiZXhwIjoyMDY4NTY0OTg3fQ.R62IkZ3M-m6XBXGYBnENabvAh5F8AUPV31dYDuzyJtc',
    
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
                'X-Client-Info': 'opai-blog-system'
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

// 创建管理员客户端（使用 service_role 密钥）
function createAdminSupabaseClient() {
    const config = getSupabaseConfig();
    
    if (!config.serviceRoleKey || config.serviceRoleKey === 'YOUR_SUPABASE_SERVICE_ROLE_KEY') {
        throw new Error('Service role 密钥未配置，无法创建管理员客户端');
    }
    
    return supabase.createClient(config.url, config.serviceRoleKey, {
        ...config.options,
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });
}

// 创建普通客户端（使用 anon 密钥）
function createPublicSupabaseClient() {
    const config = getSupabaseConfig();
    return supabase.createClient(config.url, config.anonKey, config.options);
}

// 导出配置
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        SUPABASE_CONFIG, 
        getSupabaseConfig, 
        validateSupabaseConfig,
        createAdminSupabaseClient,
        createPublicSupabaseClient
    };
} else {
    window.SUPABASE_CONFIG = SUPABASE_CONFIG;
    window.getSupabaseConfig = getSupabaseConfig;
    window.validateSupabaseConfig = validateSupabaseConfig;
    window.createAdminSupabaseClient = createAdminSupabaseClient;
    window.createPublicSupabaseClient = createPublicSupabaseClient;
}

// 开发环境下的配置提示
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    console.log('🔧 Supabase 配置提示:');
    console.log('1. 访问 https://supabase.com 创建新项目');
    console.log('2. 在项目设置中找到 API 密钥');
    console.log('3. 将 URL 和 anon key 替换到此配置文件中');
    console.log('4. 当前配置状态:', validateSupabaseConfig());
}