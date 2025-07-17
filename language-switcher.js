/**
 * 全局语言切换器组件
 * 可在所有页面中使用的统一语言切换功能
 * 支持自定义 i18n 系统和 i18next 系统
 */

class LanguageSwitcher {
    constructor() {
        this.currentLanguage = localStorage.getItem('language') || 'en';
        this.i18nSystem = null; // 'custom' 或 'i18next'
        this.init();
    }

    // 初始化语言切换器
    init() {
        // 检测使用的 i18n 系统
        this.detectI18nSystem(() => {
            this.createSwitcher();
            this.updateActiveState();
        });
    }

    // 检测 i18n 系统类型
    detectI18nSystem(callback) {
        const checkSystems = () => {
            if (window.i18n && window.i18n.isLoaded) {
                this.i18nSystem = 'custom';
                callback();
            } else if (window.i18next) {
                this.i18nSystem = 'i18next';
                callback();
            } else {
                setTimeout(checkSystems, 100);
            }
        };
        checkSystems();
    }

    // 创建语言切换器 HTML
    createSwitcher() {
        // 检查是否已存在语言切换器
        if (document.querySelector('.language-switcher') || document.querySelector('.lang-switch')) {
            return; // 如果已存在，不重复创建
        }

        const switcherHtml = `
            <div class="language-switcher" style="margin-right: 15px;">
                <button class="btn lang-btn" onclick="languageSwitcher.switchLanguage('zh')" 
                        style="padding: 8px 16px; margin-right: 5px; font-size: 0.9rem;">中文</button>
                <button class="btn lang-btn" onclick="languageSwitcher.switchLanguage('en')" 
                        style="padding: 8px 16px; font-size: 0.9rem;">EN</button>
            </div>
        `;

        // 查找用户操作区域
        const userActions = document.querySelector('.user-actions');
        if (userActions) {
            // 检查是否已有语言切换相关元素
            const existingLangSwitch = userActions.querySelector('.lang-switch');
            if (existingLangSwitch) {
                // 替换现有的语言切换器
                existingLangSwitch.outerHTML = switcherHtml;
            } else {
                // 在用户操作区域开头插入
                userActions.insertAdjacentHTML('afterbegin', switcherHtml);
            }
        }

        this.updateActiveState();
    }

    // 切换语言
    switchLanguage(lang) {
        this.currentLanguage = lang;
        localStorage.setItem('language', lang);

        // 根据不同的 i18n 系统调用相应的切换方法
        if (this.i18nSystem === 'custom' && window.i18n) {
            window.i18n.switchLanguage(lang);
        } else if (this.i18nSystem === 'i18next' && window.i18next) {
            window.i18next.changeLanguage(lang);
        }

        this.updateActiveState();
        
        // 触发自定义事件，通知其他组件语言已切换
        window.dispatchEvent(new CustomEvent('globalLanguageChanged', { 
            detail: { language: lang } 
        }));
    }

    // 更新按钮的活跃状态
    updateActiveState() {
        // 更新按钮状态
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        const activeBtn = document.querySelector(`.lang-btn[onclick*="${this.currentLanguage}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }

        // 更新下拉选择器状态（如果存在）
        const langSelect = document.querySelector('#lang-select');
        if (langSelect) {
            langSelect.value = this.currentLanguage;
        }
    }

    // 获取当前语言
    getCurrentLanguage() {
        return this.currentLanguage;
    }
}

// 创建全局实例
window.languageSwitcher = new LanguageSwitcher();

// 监听 DOM 变化，自动重新初始化语言切换器
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
            // 检查是否有新的用户操作区域被添加
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    const userActions = node.querySelector && node.querySelector('.user-actions');
                    if (userActions && !userActions.querySelector('.language-switcher')) {
                        setTimeout(() => {
                            window.languageSwitcher.createSwitcher();
                        }, 100);
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

// 添加样式
const style = document.createElement('style');
style.textContent = `
    .lang-btn.active {
        background: var(--secondary) !important;
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(63, 55, 201, 0.4) !important;
    }
    
    .language-switcher {
        display: flex;
        gap: 5px;
    }
`;
document.head.appendChild(style);