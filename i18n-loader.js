/**
 * 通用 i18n 加载器 - 简化版
 * 用于所有页面的多语言支持，从 locales 文件夹加载翻译
 */

class I18nLoader {
    constructor() {
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
        if (!this.isLoaded) {
            console.log(`Translation not loaded yet for key: ${key}`);
            return defaultValue || key;
        }

        const translation = this.translations[this.currentLanguage];
        const result = translation && translation[key] ? translation[key] : (defaultValue || key);

        // 调试信息
        if (result === key && !defaultValue) {
            console.log(`Translation missing for key: ${key} in language: ${this.currentLanguage}`);
        }

        return result;
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

            // 触发全局语言切换事件
            window.dispatchEvent(new CustomEvent('languageChanged', { 
                detail: { language: lang } 
            }));

            // 更新页面特定内容
            this.updatePageSpecificContent();
            
            // 更新侧边栏翻译
            this.updateSidebarTranslations();
        }
    }

    // 更新侧边栏翻译
    updateSidebarTranslations() {
        console.log('Updating sidebar translations from i18n-loader...');
        
        // 如果存在侧边栏更新函数，调用它
        if (window.updateSidebarTranslations && typeof window.updateSidebarTranslations === 'function') {
            window.updateSidebarTranslations();
        } else {
            // 否则手动更新侧边栏
            const sidebarElements = document.querySelectorAll('.sidebar [data-i18n]');
            sidebarElements.forEach(element => {
                const key = element.getAttribute('data-i18n');
                const translation = this.t(key);
                if (translation && translation !== key) {
                    element.textContent = translation;
                }
            });
        }
    }

    // 更新页面特定内容
    updatePageSpecificContent() {
        // 更新课程页面的特定内容
        const courseTitle = document.querySelector('.grok-info h1');
        if (courseTitle) courseTitle.textContent = this.t('course.title');
        
        const courseDesc = document.querySelector('.grok-info p');
        if (courseDesc) courseDesc.textContent = this.t('course.description');
        
        const visitBtn = document.querySelector('.grok-btn');
        if (visitBtn && visitBtn.textContent.includes('Visit') || visitBtn.textContent.includes('访问')) {
            visitBtn.textContent = this.t('course.visit');
        }
        
        const mobileBtn = document.querySelector('.grok-btn-outline');
        if (mobileBtn && (mobileBtn.textContent.includes('Mobile') || mobileBtn.textContent.includes('手机'))) {
            mobileBtn.textContent = this.t('course.mobile');
        }
        
        const qrTip = document.querySelector('.qr-tip');
        if (qrTip) qrTip.textContent = this.t('course.qr.tip');

        // 更新主要内容区域的标题
        const mainSectionH2s = document.querySelectorAll('.main-section h2');
        mainSectionH2s.forEach(h2 => {
            const text = h2.textContent.trim();
            if (text.includes('Course Overview') || text.includes('课程概览')) {
                h2.innerHTML = `<i class="fas fa-graduation-cap"></i> ${this.t('course.overview.title')}`;
            } else if (text.includes('Phase 1') || text.includes('第一阶段')) {
                h2.innerHTML = `<i class="fas fa-flag-checkered"></i> ${this.t('course.phase1.title')}`;
            } else if (text.includes('Phase 2') || text.includes('第二阶段')) {
                h2.innerHTML = `<i class="fas fa-robot"></i> ${this.t('course.phase2.title')}`;
            } else if (text.includes('Phase 3') || text.includes('第三阶段')) {
                h2.innerHTML = `<i class="fas fa-rocket"></i> ${this.t('course.phase3.title')}`;
            } else if (text.includes('Trending Niches') || text.includes('热门赛道')) {
                h2.innerHTML = `<i class="fas fa-fire"></i> ${this.t('course.tracks.title')}`;
            }
        });
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

            // 监听侧边栏加载完成事件
            this.observeSidebarChanges();
        }
        return loaded;
    }

    // 监听侧边栏变化
    observeSidebarChanges() {
        // 使用 MutationObserver 监听 DOM 变化
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    // 检查是否有新添加的带有 data-i18n 属性的元素
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // 更新新添加的元素
                            this.updateElementText(node);
                            // 更新新添加元素的子元素
                            const i18nElements = node.querySelectorAll('[data-i18n]');
                            i18nElements.forEach(element => {
                                const key = element.getAttribute('data-i18n');
                                const translation = this.t(key);
                                element.textContent = translation;
                            });
                        }
                    });
                }
            });
        });

        // 开始观察整个文档的变化
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // 更新单个元素的文本
    updateElementText(element) {
        if (element.hasAttribute && element.hasAttribute('data-i18n')) {
            const key = element.getAttribute('data-i18n');
            const translation = this.t(key);
            element.textContent = translation;
        }
    }
}

// 创建全局实例
window.i18n = new I18nLoader();

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Initializing i18n...');
    await window.i18n.init();
    console.log('i18n initialized, current language:', window.i18n.getCurrentLanguage());

    // 为了确保侧边栏翻译正确，添加多次延迟检查
    setTimeout(() => {
        console.log('First i18n update...');
        window.i18n.updatePageText();
    }, 200);

    setTimeout(() => {
        console.log('Second i18n update...');
        window.i18n.updatePageText();
    }, 500);

    setTimeout(() => {
        console.log('Third i18n update...');
        window.i18n.updatePageText();
    }, 1000);
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