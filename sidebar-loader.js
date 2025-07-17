/**
 * 侧边栏加载器
 * 负责异步加载侧边栏并确保正确应用翻译
 */

// 加载侧边栏并应用翻译
function loadSidebar() {
    console.log('Loading sidebar...');
    
    fetch('sidebar.html')
        .then(res => res.text())
        .then(html => {
            // 替换侧边栏内容
            const sidebarContainer = document.getElementById('sidebar');
            if (sidebarContainer) {
                sidebarContainer.outerHTML = html;
                console.log('Sidebar loaded successfully');
                
                // 等待一小段时间确保DOM更新完成
                setTimeout(() => {
                    // 应用当前语言翻译
                    applySidebarTranslations();
                    
                    // 设置语言切换事件监听器
                    setupLanguageChangeListeners();
                }, 100);
            }
        })
        .catch(err => {
            console.error('Error loading sidebar:', err);
        });
}

// 简单的翻译映射表
const sidebarTranslations = {
    'en': {
        'sidebar.home': 'Home',
        'sidebar.tools': 'AI Tools',
        'sidebar.tutorials': 'Tutorials',
        'sidebar.blog': 'Blog',
        'sidebar.community': 'Community',
        'sidebar.about': 'About',
        'sidebar.aiTools': 'AI Tools',
        'sidebar.videoTools': 'Video Tools',
        'sidebar.imageTools': 'Image Tools',
        'sidebar.textTools': 'Text Tools',
        'sidebar.audioTools': 'Audio Tools',
        'sidebar.otherTools': 'Other Tools',
        'sidebar.popular': 'Popular',
        'sidebar.new': 'New',
        'sidebar.recommended': 'Recommended',
        'sidebar.all': 'All Tools'
    },
    'zh': {
        'sidebar.home': '\u9996\u9875', // 首页
        'sidebar.tools': 'AI\u5DE5\u5177', // AI工具
        'sidebar.tutorials': '\u6559\u7A0B', // 教程
        'sidebar.blog': '\u535A\u5BA2', // 博客
        'sidebar.community': '\u793E\u533A', // 社区
        'sidebar.about': '\u5173\u4E8E', // 关于
        'sidebar.aiTools': 'AI\u5DE5\u5177', // AI工具
        'sidebar.videoTools': '\u89C6\u9891\u5DE5\u5177', // 视频工具
        'sidebar.imageTools': '\u56FE\u50CF\u5DE5\u5177', // 图像工具
        'sidebar.textTools': '\u6587\u672C\u5DE5\u5177', // 文本工具
        'sidebar.audioTools': '\u97F3\u9891\u5DE5\u5177', // 音频工具
        'sidebar.otherTools': '\u5176\u4ED6\u5DE5\u5177', // 其他工具
        'sidebar.popular': '\u70ED\u95E8', // 热门
        'sidebar.new': '\u6700\u65B0', // 最新
        'sidebar.recommended': '\u63A8\u8350', // 推荐
        'sidebar.all': '\u6240\u6709\u5DE5\u5177' // 所有工具
    }
};

// 获取当前语言
function getCurrentLanguage() {
    return localStorage.getItem('language') || 'en';
}

// 获取翻译
function getSidebarTranslation(key, lang) {
    const langTranslations = sidebarTranslations[lang] || sidebarTranslations['en'];
    return langTranslations[key] || key;
}

// 应用翻译到侧边栏
function applySidebarTranslations() {
    const currentLang = getCurrentLanguage();
    console.log(`Applying ${currentLang} translations to sidebar...`);
    
    // 获取所有带有data-i18n属性的侧边栏元素
    const sidebarElements = document.querySelectorAll('.sidebar [data-i18n]');
    
    if (sidebarElements.length === 0) {
        console.log('No sidebar elements found, will retry...');
        setTimeout(applySidebarTranslations, 500);
        return;
    }
    
    console.log(`Found ${sidebarElements.length} sidebar elements to translate`);
    
    // 应用翻译
    sidebarElements.forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (!key) return;
        
        const translation = getSidebarTranslation(key, currentLang);
        if (translation) {
            element.textContent = translation;
        }
    });
}

// 设置语言变化事件监听器
function setupLanguageChangeListeners() {
    console.log('Setting up language change listeners...');
    
    // 监听语言变化事件
    window.addEventListener('languageChanged', function(e) {
        console.log('Language changed event detected');
        setTimeout(applySidebarTranslations, 50);
    });
    
    // 监听全局语言变化事件
    window.addEventListener('globalLanguageChanged', function(e) {
        console.log('Global language changed event detected');
        setTimeout(applySidebarTranslations, 50);
    });
    
    // 监听下拉选择器变化
    const langSelect = document.getElementById('lang-select');
    if (langSelect) {
        langSelect.addEventListener('change', function(e) {
            console.log('Language select changed');
            setTimeout(applySidebarTranslations, 100);
        });
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    loadSidebar();
});