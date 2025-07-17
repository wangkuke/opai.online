/**
 * 通用 i18n 加载器 - 简化版
 * 用于所有页面的多语言支持，从 locales 文件夹加载翻译
 */

class I18nLoader {
    constructor() {
        this.currentLanguage = localStorage.getItem('language') || 'zh';
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
        if (!this.isLoaded) {
            return defaultValue || key;
        }

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
            
            // 触发自定义事件，用于更新动态内容
            if (typeof renderRelated === 'function') {
                renderRelated();
            }
        }
    }

    // 更新页面文本
    updatePageText() {
        // 更新所有带有 data-i18n 属性的元素
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.t(key);
            element.textContent = translation;
        });
    }

    // 更新语言切换器的活跃状态
    updateLanguageSwitcher() {
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeBtn = document.querySelector(`.lang-btn[onclick*="${this.currentLanguage}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
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
        }
        return loaded;
    }
}

// 创建全局实例
window.i18n = new I18nLoader();

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', async () => {
    await window.i18n.init();
});

// 添加语言切换器样式
const style = document.createElement('style');
style.textContent = `
    .lang-btn.active {
        background: var(--secondary) !important;
        transform: translateY(-2px);
    }
`;
document.head.appendChild(style);