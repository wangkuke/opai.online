/**
 * 直接侧边栏国际化脚本
 * 不依赖于外部i18n系统，直接处理侧边栏的语言切换
 */

(function() {
    // 简单的翻译映射表
    const translations = {
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
            'sidebar.home': '首页',
            'sidebar.tools': 'AI工具',
            'sidebar.tutorials': '教程',
            'sidebar.blog': '博客',
            'sidebar.community': '社区',
            'sidebar.about': '关于',
            'sidebar.aiTools': 'AI工具',
            'sidebar.videoTools': '视频工具',
            'sidebar.imageTools': '图像工具',
            'sidebar.textTools': '文本工具',
            'sidebar.audioTools': '音频工具',
            'sidebar.otherTools': '其他工具',
            'sidebar.popular': '热门',
            'sidebar.new': '最新',
            'sidebar.recommended': '推荐',
            'sidebar.all': '所有工具'
        }
    };

    // 获取当前语言
    function getCurrentLanguage() {
        return localStorage.getItem('language') || 'en';
    }

    // 获取翻译
    function getTranslation(key, lang) {
        const langTranslations = translations[lang] || translations['en'];
        return langTranslations[key] || key;
    }

    // 加载侧边栏
    function loadSidebar() {
        console.log('[Direct i18n] Loading sidebar...');
        
        fetch('sidebar.html')
            .then(res => res.text())
            .then(html => {
                const sidebarContainer = document.getElementById('sidebar');
                if (sidebarContainer) {
                    sidebarContainer.outerHTML = html;
                    console.log('[Direct i18n] Sidebar loaded successfully');
                    
                    // 应用当前语言
                    setTimeout(() => {
                        applySidebarTranslations(getCurrentLanguage());
                        setupLanguageChangeListeners();
                    }, 300);
                }
            })
            .catch(err => {
                console.error('[Direct i18n] Error loading sidebar:', err);
            });
    }

    // 应用翻译到侧边栏
    function applySidebarTranslations(lang) {
        console.log(`[Direct i18n] Applying ${lang} translations to sidebar...`);
        
        // 获取所有带有data-i18n属性的侧边栏元素
        const sidebarElements = document.querySelectorAll('.sidebar [data-i18n]');
        
        if (sidebarElements.length === 0) {
            console.log('[Direct i18n] No sidebar elements found, will retry...');
            setTimeout(() => applySidebarTranslations(lang), 500);
            return;
        }
        
        console.log(`[Direct i18n] Found ${sidebarElements.length} sidebar elements to translate`);
        
        // 应用翻译
        sidebarElements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (!key) return;
            
            const translation = getTranslation(key, lang);
            if (translation) {
                element.textContent = translation;
                console.log(`[Direct i18n] Translated "${key}" to "${translation}"`);
            }
        });
    }

    // 设置语言变化事件监听器
    function setupLanguageChangeListeners() {
        console.log('[Direct i18n] Setting up language change listeners...');
        
        // 监听语言变化事件
        window.addEventListener('languageChanged', function(e) {
            console.log('[Direct i18n] Language changed event detected');
            const lang = e.detail ? e.detail.language : getCurrentLanguage();
            applySidebarTranslations(lang);
        });
        
        // 监听全局语言变化事件
        window.addEventListener('globalLanguageChanged', function(e) {
            console.log('[Direct i18n] Global language changed event detected');
            const lang = e.detail ? e.detail.language : getCurrentLanguage();
            applySidebarTranslations(lang);
        });
        
        // 监听下拉选择器变化
        const langSelect = document.getElementById('lang-select');
        if (langSelect) {
            langSelect.addEventListener('change', function(e) {
                const lang = e.target.value;
                console.log(`[Direct i18n] Language select changed to ${lang}`);
                localStorage.setItem('language', lang);
                applySidebarTranslations(lang);
                
                // 触发全局语言变化事件
                window.dispatchEvent(new CustomEvent('globalLanguageChanged', { 
                    detail: { language: lang } 
                }));
            });
        }
    }

    // 导出公共函数
    window.directSidebarI18n = {
        applyTranslations: function(lang) {
            applySidebarTranslations(lang || getCurrentLanguage());
        },
        getCurrentLanguage: getCurrentLanguage,
        reloadSidebar: loadSidebar
    };

    // 初始化
    function init() {
        console.log('[Direct i18n] Initializing...');
        loadSidebar();
        
        // 设置定期检查
        setInterval(function() {
            const sidebarElements = document.querySelectorAll('.sidebar [data-i18n]');
            if (sidebarElements.length > 0) {
                applySidebarTranslations(getCurrentLanguage());
            }
        }, 5000); // 每5秒检查一次
    }

    // 页面加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();