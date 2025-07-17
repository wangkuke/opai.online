/**
 * 侧边栏加载器
 * 负责异步加载侧边栏并确保正确应用国际化翻译
 */

// 加载侧边栏并应用翻译
function loadSidebarWithTranslation() {
    fetch('sidebar.html')
        .then(res => res.text())
        .then(html => {
            // 替换侧边栏内容
            document.getElementById('sidebar').outerHTML = html;
            
            console.log('Sidebar loaded, applying translations...');
            
            // 确保i18n系统已加载
            if (window.i18n && window.i18n.isLoaded) {
                // 直接应用翻译
                applySidebarTranslations();
            } else {
                // 如果i18n系统尚未加载，等待它加载完成
                console.log('Waiting for i18n to load before applying sidebar translations...');
                waitForI18n();
            }
        })
        .catch(err => {
            console.error('Error loading sidebar:', err);
        });
}

// 等待i18n系统加载完成
function waitForI18n() {
    if (window.i18n && window.i18n.isLoaded) {
        applySidebarTranslations();
    } else {
        setTimeout(waitForI18n, 100);
    }
}

// 应用翻译到侧边栏
function applySidebarTranslations() {
    console.log('Applying translations to sidebar...');
    
    // 获取所有带有data-i18n属性的侧边栏元素
    const sidebarElements = document.querySelectorAll('.sidebar [data-i18n]');
    
    // 应用翻译
    sidebarElements.forEach(element => {
        const key = element.getAttribute('data-i18n');
        let translation;
        
        // 根据可用的i18n系统获取翻译
        if (window.i18n && typeof window.i18n.t === 'function') {
            translation = window.i18n.t(key);
        } else if (window.languageSwitcher && typeof window.languageSwitcher.t === 'function') {
            translation = window.languageSwitcher.t(key);
        } else if (window.i18next && typeof window.i18next.t === 'function') {
            translation = window.i18next.t(key);
        }
        
        // 如果找到翻译，应用它
        if (translation && translation !== key) {
            element.textContent = translation;
        }
    });
    
    console.log('Sidebar translations applied successfully');
}

// 监听语言变化事件
function listenForLanguageChanges() {
    // 监听全局语言变化事件
    window.addEventListener('languageChanged', function() {
        console.log('Language changed, updating sidebar translations...');
        applySidebarTranslations();
    });
    
    // 监听另一个可能的语言变化事件
    window.addEventListener('globalLanguageChanged', function() {
        console.log('Global language changed, updating sidebar translations...');
        applySidebarTranslations();
    });
}

// 导出公共函数，可以从外部调用
window.loadSidebar = loadSidebarWithTranslation;
window.updateSidebarTranslations = applySidebarTranslations;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 加载侧边栏
    loadSidebarWithTranslation();
    
    // 监听语言变化
    listenForLanguageChanges();
});