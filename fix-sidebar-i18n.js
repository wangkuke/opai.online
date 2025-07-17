/**
 * 修复侧边栏国际化问题的专用脚本
 * 这个脚本解决了语言切换按钮对侧边栏不起作用的问题
 */

(function() {
    // 等待页面和i18n系统加载完成
    function waitForI18nAndFixSidebar() {
        if (window.i18n && window.i18n.isLoaded) {
            // 应用翻译到侧边栏
            applyTranslationsToSidebar();
            
            // 监听语言变化事件
            setupLanguageChangeListeners();
        } else {
            // 如果i18n系统尚未加载，等待它
            setTimeout(waitForI18nAndFixSidebar, 100);
        }
    }
    
    // 应用翻译到侧边栏
    function applyTranslationsToSidebar() {
        console.log('Applying translations to sidebar elements...');
        
        // 获取所有带有data-i18n属性的侧边栏元素
        const sidebarElements = document.querySelectorAll('.sidebar [data-i18n]');
        
        // 应用翻译
        sidebarElements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = window.i18n.t(key);
            
            // 如果找到翻译，应用它
            if (translation && translation !== key) {
                element.textContent = translation;
            }
        });
    }
    
    // 设置语言变化事件监听器
    function setupLanguageChangeListeners() {
        // 监听语言变化事件
        window.addEventListener('languageChanged', function(e) {
            console.log('Language changed event detected, updating sidebar...');
            setTimeout(applyTranslationsToSidebar, 50);
        });
        
        // 监听全局语言变化事件
        window.addEventListener('globalLanguageChanged', function(e) {
            console.log('Global language changed event detected, updating sidebar...');
            setTimeout(applyTranslationsToSidebar, 50);
        });
    }
    
    // 监听DOM变化，特别是侧边栏的加载
    function observeSidebarChanges() {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(function(node) {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // 检查是否是侧边栏或包含侧边栏的元素
                            if (node.classList && (node.classList.contains('sidebar') || node.querySelector('.sidebar'))) {
                                console.log('Sidebar loaded, applying translations...');
                                setTimeout(applyTranslationsToSidebar, 50);
                            }
                        }
                    });
                }
            });
        });
        
        // 开始观察文档变化
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    // 修补i18n系统，确保它能正确处理侧边栏
    function patchI18nSystem() {
        if (window.i18n) {
            // 保存原始的switchLanguage方法
            const originalSwitchLanguage = window.i18n.switchLanguage;
            
            // 替换为我们的增强版本
            window.i18n.switchLanguage = function(lang) {
                // 调用原始方法
                originalSwitchLanguage.call(window.i18n, lang);
                
                // 额外处理侧边栏
                console.log('Language switched to ' + lang + ', updating sidebar...');
                setTimeout(applyTranslationsToSidebar, 100);
            };
            
            console.log('i18n system patched for sidebar support');
        }
    }
    
    // 导出公共函数
    window.fixSidebarI18n = applyTranslationsToSidebar;
    
    // 初始化
    function init() {
        // 观察侧边栏变化
        observeSidebarChanges();
        
        // 等待i18n系统加载完成
        waitForI18nAndFixSidebar();
        
        // 修补i18n系统
        setTimeout(patchI18nSystem, 500);
        
        // 定期检查并修复侧边栏翻译
        setInterval(applyTranslationsToSidebar, 2000);
    }
    
    // 页面加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();