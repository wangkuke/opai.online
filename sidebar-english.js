/**
 * 侧边栏加载器
 * 负责异步加载侧边栏并确保默认显示英文
 * 允许用户通过语言切换按钮切换侧边栏语言
 */

(function() {
    // 加载侧边栏并应用当前语言翻译
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
    
    // 应用当前语言翻译到侧边栏
    function applySidebarTranslations() {
        console.log('Applying translations to sidebar...');
        
        // 确保i18n系统已加载
        if (!window.i18n || !window.i18n.isLoaded) {
            console.log('i18n not ready yet, will retry...');
            setTimeout(applySidebarTranslations, 100);
            return;
        }
        
        // 获取所有带有data-i18n属性的侧边栏元素
        const sidebarElements = document.querySelectorAll('.sidebar [data-i18n]');
        if (sidebarElements.length === 0) {
            console.log('No sidebar elements found, will retry...');
            setTimeout(applySidebarTranslations, 100);
            return;
        }
        
        console.log(`Found ${sidebarElements.length} sidebar elements to translate`);
        
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
    }
    
    // 设置语言变化事件监听器
    function setupLanguageChangeListeners() {
        console.log('Setting up language change listeners for sidebar...');
        
        // 监听语言变化事件
        window.addEventListener('languageChanged', function(e) {
            console.log('Language changed event detected, updating sidebar');
            setTimeout(applySidebarTranslations, 50);
        });
        
        // 监听全局语言变化事件
        window.addEventListener('globalLanguageChanged', function(e) {
            console.log('Global language changed event detected, updating sidebar');
            setTimeout(applySidebarTranslations, 50);
        });
        
        // 直接监听语言切换按钮点击
        document.addEventListener('click', function(e) {
            if (e.target && e.target.classList.contains('lang-btn')) {
                console.log('Language button clicked, will update sidebar');
                setTimeout(applySidebarTranslations, 100);
            }
        });
        
        // 监听下拉选择器变化
        const langSelect = document.getElementById('lang-select');
        if (langSelect) {
            langSelect.addEventListener('change', function(e) {
                console.log('Language select changed, updating sidebar');
                setTimeout(applySidebarTranslations, 100);
            });
        }
    }
    
    // 导出公共函数
    window.loadSidebarWithEnglish = loadSidebar;
    window.applySidebarTranslations = applySidebarTranslations;
    
    // 初始化
    function init() {
        console.log('Initializing sidebar loader...');
        
        // 加载侧边栏并应用翻译
        loadSidebar();
    }
    
    // 页面加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();