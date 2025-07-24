/**
 * 通用 i18n 加载器 - 简化版
 * 用于所有页面的多语言支持，从 locales 文件夹加载翻译
 */

// 保证全局唯一i18n加载器，负责加载@locales下所有翻译文件
class I18nLoader {
    constructor() {
        if (!localStorage.getItem('language')) {
            localStorage.setItem('language', 'en');
        }
        this.currentLanguage = localStorage.getItem('language') || 'en';
        this.translations = {};
        this.isLoaded = false;
    }

    // 加载语言文件
    async loadTranslations() {
        try {
            const [enResponse, zhResponse] = await Promise.all([
                fetch('locales/en/translation.json'),
                fetch('locales/zh/translation.json')
            ]);
            this.translations.en = await enResponse.json();
            this.translations.zh = await zhResponse.json();
            this.isLoaded = true;
            return true;
        } catch (error) {
            console.error('Failed to load translations:', error);
            return false;
        }
    }

    // 翻译函数
    t(key, defaultValue = '') {
        if (!this.isLoaded) return defaultValue || key;
        const translation = this.translations[this.currentLanguage];
        return translation && translation[key] ? translation[key] : (defaultValue || key);
    }

    // 切换语言
    switchLanguage(lang) {
        if (this.translations[lang]) {
            this.currentLanguage = lang;
            localStorage.setItem('language', lang);
            this.updatePageText();
            this.updateLanguageSwitcher();
            window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
            this.updateSidebarTranslations();
        }
    }

    // 更新页面所有带有data-i18n的元素
    updatePageText() {
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.t(key);
            element.textContent = translation;
        });
    }

    // 更新语言切换器按钮状态
    updateLanguageSwitcher() {
        // 移除旧代码
        // document.querySelectorAll('.lang-btn').forEach(btn => {
        //     btn.classList.remove('active');
        // });
        const activeBtn = document.querySelector(`.lang-btn[onclick*="${this.currentLanguage}"]`);
        if (activeBtn) activeBtn.classList.add('active');
        const langSelect = document.getElementById('lang-select');
        if (langSelect) langSelect.value = this.currentLanguage;
    }

    // 更新侧边栏翻译
    updateSidebarTranslations() {
        const sidebarElements = document.querySelectorAll('.sidebar [data-i18n]');
        sidebarElements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.t(key);
            if (translation && translation !== key) {
                element.textContent = translation;
            }
        });
    }

    // 获取当前语言
    getCurrentLanguage() {
        return this.currentLanguage;
    }

    // 初始化
    async init() {
        const loaded = await this.loadTranslations();
        if (loaded) {
            this.updatePageText();
            this.updateLanguageSwitcher();
            this.updateSidebarTranslations();
        }
        return loaded;
    }
}

// 创建全局实例
window.i18n = new I18nLoader();

document.addEventListener('DOMContentLoaded', async () => {
    await window.i18n.init();
});

// 提供一个全局函数供其他脚本调用
window.updateI18nText = function () {
    if (window.i18n && window.i18n.isLoaded) {
        console.log('Manual i18n update triggered');
        window.i18n.updatePageText();
    } else {
        console.log('i18n not ready for manual update');
    }
};

// 提供一个强制修复函数
window.fixI18n = function () {
    console.log('Force fixing i18n...');
    if (window.i18n) {
        if (!window.i18n.isLoaded) {
            console.log('i18n not loaded, trying to load...');
            window.i18n.init().then(() => {
                window.i18n.updatePageText();
            });
        } else {
            window.i18n.updatePageText();
        }
    }
};

// 添加语言切换器样式
const style = document.createElement('style');
style.textContent = `
    .lang-btn.active {
        background: var(--secondary) !important;
        transform: translateY(-2px);
    }
`;
document.head.appendChild(style);