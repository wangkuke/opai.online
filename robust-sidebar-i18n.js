/**
 * 更健壮的侧边栏国际化修复脚本
 * 专为解决 Cloudflare 环境下的问题设计
 */

(function() {
    // 配置
    const MAX_RETRIES = 20;
    const RETRY_INTERVAL = 200; // 毫秒
    let retryCount = 0;
    
    // 强制设置默认语言为英语
    function forceEnglishDefault() {
        if (!localStorage.getItem('language') || localStorage.getItem('language') !== 'en') {
            localStorage.setItem('language', 'en');
            console.log('[Robust i18n] Default language set to English');
        }
    }
    
    // 加载侧边栏
    function loadSidebar() {
        console.log('[Robust i18n] Loading sidebar...');
        
        fetch('sidebar.html')
            .then(res => res.text())
            .then(html => {
                const sidebarContainer = document.getElementById('sidebar');
                if (sidebarContainer) {
                    sidebarContainer.outerHTML = html;
                    console.log('[Robust i18n] Sidebar loaded successfully');
                    
                    // 等待一小段时间确保DOM更新完成
                    setTimeout(() => {
                        // 尝试应用翻译
                        tryApplyTranslations();
                        
                        // 设置语言切换事件监听器
                        setupLanguageChangeListeners();
                    }, 300);
                }
            })
            .catch(err => {
                console.error('[Robust i18n] Error loading sidebar:', err);
            });
    }
    
    // 尝试应用翻译，带有重试机制
    function tryApplyTranslations() {
        if (retryCount >= MAX_RETRIES) {
            console.warn('[Robust i18n] Max retries reached, giving up on sidebar translations');
            return;
        }
        
        retryCount++;
        console.log(`[Robust i18n] Attempt ${retryCount}/${MAX_RETRIES} to apply translations`);
        
        // 检查 i18n 是否已加载
        if (!window.i18n) {
            console.log('[Robust i18n] i18n not available yet, retrying...');
            setTimeout(tryApplyTranslations, RETRY_INTERVAL);
            return;
        }
        
        // 检查 i18n.t 方法是否可用
        if (typeof window.i18n.t !== 'function') {
            console.log('[Robust i18n] i18n.t is not a function, retrying...');
            setTimeout(tryApplyTranslations, RETRY_INTERVAL);
            return;
        }
        
        // 获取当前语言
        const currentLang = window.i18n.getCurrentLanguage ? 
                           window.i18n.getCurrentLanguage() : 
                           (localStorage.getItem('language') || 'en');
        
        // 应用翻译
        applyTranslationsToSidebar(currentLang);
    }
    
    // 应用翻译到侧边栏
    function applyTranslationsToSidebar(lang) {
        console.log(`[Robust i18n] Applying ${lang} translations to sidebar...`);
        
        // 获取所有带有data-i18n属性的侧边栏元素
        const sidebarElements = document.querySelectorAll('.sidebar [data-i18n]');
        
        if (sidebarElements.length === 0) {
            console.log('[Robust i18n] No sidebar elements found with data-i18n attribute');
            return;
        }
        
        console.log(`[Robust i18n] Found ${sidebarElements.length} sidebar elements to translate`);
        
        try {
            // 保存原始语言
            const originalLang = window.i18n.currentLanguage;
            
            // 临时切换语言
            if (lang) {
                window.i18n.currentLanguage = lang;
            }
            
            // 应用翻译
            sidebarElements.forEach(element => {
                try {
                    const key = element.getAttribute('data-i18n');
                    if (!key) return;
                    
                    let translation;
                    try {
                        translation = window.i18n.t(key);
                    } catch (err) {
                        console.error(`[Robust i18n] Error getting translation for "${key}":`, err);
                        return;
                    }
                    
                    // 如果找到翻译，应用它
                    if (translation && translation !== key) {
                        element.textContent = translation;
                        console.log(`[Robust i18n] Translated "${key}" to "${translation}"`);
                    }
                } catch (elemErr) {
                    console.error('[Robust i18n] Error processing element:', elemErr);
                }
            });
            
            // 恢复原始语言
            if (lang && originalLang) {
                window.i18n.currentLanguage = originalLang;
            }
            
            console.log('[Robust i18n] Sidebar translations applied successfully');
        } catch (err) {
            console.error('[Robust i18n] Error applying translations:', err);
        }
    }
    
    // 设置语言变化事件监听器
    function setupLanguageChangeListeners() {
        console.log('[Robust i18n] Setting up language change listeners...');
        
        // 监听语言变化事件
        window.addEventListener('languageChanged', function(e) {
            console.log('[Robust i18n] Language changed event detected');
            const lang = e.detail ? e.detail.language : null;
            setTimeout(() => applyTranslationsToSidebar(lang), 100);
        });
        
        // 监听全局语言变化事件
        window.addEventListener('globalLanguageChanged', function(e) {
            console.log('[Robust i18n] Global language changed event detected');
            const lang = e.detail ? e.detail.language : null;
            setTimeout(() => applyTranslationsToSidebar(lang), 100);
        });
        
        // 监听下拉选择器变化
        const langSelect = document.getElementById('lang-select');
        if (langSelect) {
            langSelect.addEventListener('change', function(e) {
                const lang = e.target.value;
                console.log(`[Robust i18n] Language select changed to ${lang}`);
                setTimeout(() => applyTranslationsToSidebar(lang), 100);
            });
        }
    }
    
    // 修补i18n系统
    function patchI18nSystem() {
        if (!window.i18n) {
            console.log('[Robust i18n] i18n not available yet, will retry patching...');
            setTimeout(patchI18nSystem, 500);
            return;
        }
        
        try {
            // 保存原始的switchLanguage方法
            const originalSwitchLanguage = window.i18n.switchLanguage;
            
            if (typeof originalSwitchLanguage !== 'function') {
                console.log('[Robust i18n] i18n.switchLanguage is not a function, skipping patch');
                return;
            }
            
            // 替换为增强版本
            window.i18n.switchLanguage = function(lang) {
                console.log(`[Robust i18n] Language switching to ${lang}`);
                
                // 调用原始方法
                originalSwitchLanguage.call(window.i18n, lang);
                
                // 额外处理侧边栏
                setTimeout(() => applyTranslationsToSidebar(lang), 100);
            };
            
            console.log('[Robust i18n] i18n system patched successfully');
        } catch (err) {
            console.error('[Robust i18n] Error patching i18n system:', err);
        }
    }
    
    // 导出公共函数
    window.robustSidebarI18n = {
        applyTranslations: function(lang) {
            applyTranslationsToSidebar(lang || (window.i18n && window.i18n.currentLanguage) || 'en');
        },
        forceEnglish: forceEnglishDefault,
        reloadSidebar: loadSidebar
    };
    
    // 初始化
    function init() {
        console.log('[Robust i18n] Initializing...');
        
        // 强制设置默认语言
        forceEnglishDefault();
        
        // 加载侧边栏
        loadSidebar();
        
        // 修补i18n系统
        setTimeout(patchI18nSystem, 1000);
        
        // 设置定期检查
        setInterval(function() {
            const sidebarElements = document.querySelectorAll('.sidebar [data-i18n]');
            if (sidebarElements.length > 0 && window.i18n && typeof window.i18n.t === 'function') {
                const currentLang = window.i18n.getCurrentLanguage ? 
                                   window.i18n.getCurrentLanguage() : 
                                   (localStorage.getItem('language') || 'en');
                applyTranslationsToSidebar(currentLang);
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