/**
 * 修复侧边栏国际化问题的专用脚本
 * 这个脚本解决了语言切换按钮对侧边栏不起作用的问题
 * 并确保侧边栏默认显示英语
 */

(function() {
    // 强制设置默认语言为英语
    function forceEnglishDefault() {
        // 如果localStorage中没有设置语言，或者不是英语，则设置为英语
        if (!localStorage.getItem('language') || localStorage.getItem('language') !== 'en') {
            localStorage.setItem('language', 'en');
            console.log('Default language set to English');
        }
    }
    
    // 直接加载侧边栏并应用英文翻译
    function loadSidebarWithEnglish() {
        fetch('sidebar.html')
            .then(res => res.text())
            .then(html => {
                // 替换侧边栏内容
                const sidebarContainer = document.getElementById('sidebar');
                if (sidebarContainer) {
                    sidebarContainer.outerHTML = html;
                    console.log('Sidebar loaded, applying English translations...');
                    
                    // 应用英文翻译到侧边栏
                    setTimeout(() => {
                        applySidebarTranslations('en');
                        
                        // 设置语言切换事件监听器
                        setupLanguageChangeListeners();
                    }, 100);
                }
            })
            .catch(err => {
                console.error('Error loading sidebar:', err);
            });
    }
    
    // 应用特定语言的翻译到侧边栏
    function applySidebarTranslations(forceLang) {
        console.log('Applying translations to sidebar elements...');
        
        // 确保i18n系统已加载
        if (!window.i18n || !window.i18n.isLoaded) {
            console.log('i18n not ready yet, will retry...');
            setTimeout(() => applySidebarTranslations(forceLang), 100);
            return;
        }
        
        // 获取所有带有data-i18n属性的侧边栏元素
        const sidebarElements = document.querySelectorAll('.sidebar [data-i18n]');
        if (sidebarElements.length === 0) {
            console.log('No sidebar elements found, will retry...');
            setTimeout(() => applySidebarTranslations(forceLang), 100);
            return;
        }
        
        console.log(`Found ${sidebarElements.length} sidebar elements to translate`);
        
        // 临时保存当前语言
        const originalLang = window.i18n.currentLanguage;
        
        // 如果指定了强制语言，临时切换到该语言
        if (forceLang) {
            window.i18n.currentLanguage = forceLang;
        }
        
        // 应用翻译
        sidebarElements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = window.i18n.t(key);
            
            // 如果找到翻译，应用它
            if (translation && translation !== key) {
                element.textContent = translation;
                console.log(`Translated "${key}" to "${translation}"`);
            } else {
                console.log(`No translation found for "${key}"`);
            }
        });
        
        // 恢复原始语言
        if (forceLang) {
            window.i18n.currentLanguage = originalLang;
        }
    }
    
    // 设置语言变化事件监听器
    function setupLanguageChangeListeners() {
        // 监听语言变化事件
        window.addEventListener('languageChanged', function(e) {
            console.log('Language changed event detected, updating sidebar...');
            const lang = e.detail ? e.detail.language : null;
            setTimeout(() => applySidebarTranslations(lang), 50);
        });
        
        // 监听全局语言变化事件
        window.addEventListener('globalLanguageChanged', function(e) {
            console.log('Global language changed event detected, updating sidebar...');
            const lang = e.detail ? e.detail.language : null;
            setTimeout(() => applySidebarTranslations(lang), 50);
        });
        
        // 直接监听语言切换按钮点击
        document.addEventListener('click', function(e) {
            if (e.target && e.target.classList.contains('lang-btn')) {
                console.log('Language button clicked, will update sidebar...');
                // 从onclick属性中提取语言
                const onclickAttr = e.target.getAttribute('onclick');
                if (onclickAttr) {
                    const langMatch = onclickAttr.match(/switchLanguage\(['"]([a-z]+)['"]\)/);
                    if (langMatch && langMatch[1]) {
                        const lang = langMatch[1];
                        console.log(`Language button clicked for ${lang}, updating sidebar...`);
                        setTimeout(() => applySidebarTranslations(lang), 100);
                    }
                }
            }
        });
        
        // 监听下拉选择器变化
        const langSelect = document.getElementById('lang-select');
        if (langSelect) {
            langSelect.addEventListener('change', function(e) {
                const lang = e.target.value;
                console.log(`Language select changed to ${lang}, updating sidebar...`);
                setTimeout(() => applySidebarTranslations(lang), 100);
            });
        }
    }
    
    // 修补i18n系统，确保它能正确处理侧边栏
    function patchI18nSystem() {
        if (window.i18n) {
            // 保存原始的switchLanguage方法
            const originalSwitchLanguage = window.i18n.switchLanguage;
            
            // 替换为我们的增强版本
            window.i18n.switchLanguage = function(lang) {
                console.log(`Language switching to ${lang}, will update sidebar...`);
                
                // 调用原始方法
                originalSwitchLanguage.call(window.i18n, lang);
                
                // 额外处理侧边栏
                console.log(`Language switched to ${lang}, updating sidebar...`);
                setTimeout(() => applySidebarTranslations(lang), 100);
            };
            
            console.log('i18n system patched for sidebar support');
        }
    }
    
    // 导出公共函数
    window.fixSidebarI18n = function(lang) {
        applySidebarTranslations(lang || 'en');
    };
    
    // 初始化
    function init() {
        console.log('Initializing sidebar i18n fix...');
        
        // 强制设置默认语言为英语
        forceEnglishDefault();
        
        // 直接加载侧边栏并应用英文翻译
        loadSidebarWithEnglish();
        
        // 修补i18n系统
        setTimeout(patchI18nSystem, 500);
    }
    
    // 页面加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();