/**
 * 侧边栏加载器
 * 负责异步加载侧边栏并确保正确应用英文翻译
 */

// 加载侧边栏并强制应用英文翻译
function loadSidebarWithEnglish() {
    console.log('Loading sidebar with English translations...');
    
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
                    // 强制应用英文翻译
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
    console.log(`Applying ${forceLang || 'current'} language translations to sidebar...`);
    
    // 确保i18n系统已加载
    if (!window.i18n || !window.i18n.isLoaded) {
        console.log('i18n not ready yet, will retry in 100ms...');
        setTimeout(() => applySidebarTranslations(forceLang), 100);
        return;
    }
    
    // 获取所有带有data-i18n属性的侧边栏元素
    const sidebarElements = document.querySelectorAll('.sidebar [data-i18n]');
    
    if (sidebarElements.length === 0) {
        console.log('No sidebar elements found, will retry in 100ms...');
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
    console.log('Setting up language change listeners for sidebar...');
    
    // 监听语言变化事件
    window.addEventListener('languageChanged', function(e) {
        console.log('Language changed event detected');
        const lang = e.detail ? e.detail.language : null;
        applySidebarTranslations(lang);
    });
    
    // 监听全局语言变化事件
    window.addEventListener('globalLanguageChanged', function(e) {
        console.log('Global language changed event detected');
        const lang = e.detail ? e.detail.language : null;
        applySidebarTranslations(lang);
    });
    
    // 直接监听语言切换按钮点击
    document.addEventListener('click', function(e) {
        if (e.target && e.target.classList.contains('lang-btn')) {
            console.log('Language button clicked');
            // 从onclick属性中提取语言
            const onclickAttr = e.target.getAttribute('onclick');
            if (onclickAttr) {
                const langMatch = onclickAttr.match(/switchLanguage\(['"]([a-z]+)['"]\)/);
                if (langMatch && langMatch[1]) {
                    const lang = langMatch[1];
                    console.log(`Language button clicked for ${lang}`);
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
            console.log(`Language select changed to ${lang}`);
            setTimeout(() => applySidebarTranslations(lang), 100);
        });
    }
}

// 导出公共函数
window.loadSidebarWithEnglish = loadSidebarWithEnglish;
window.applySidebarTranslations = applySidebarTranslations;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing sidebar loader...');
    loadSidebarWithEnglish();
});