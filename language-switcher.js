/**
 * 全局语言切换器组件（仅UI和切换）
 * 依赖 window.i18n 作为唯一i18n入口
 */

class LanguageSwitcher {
    constructor() {
        this.init();
    }

    // 初始化语言切换器
    init() {
        // 检查是否已存在语言切换器
        if (document.querySelector('.lang-switch')) {
            return;
        }
        this.createSwitcher();
        this.updateActiveState();
        this.bindEvents();
        this.injectStyle();
    }

    // 创建下拉形式语言切换器（与grok.html一致）
    createSwitcher() {
        // 检查是否已存在
        if (document.querySelector('.lang-switch')) return;
        const switcherHtml = `
            <div class="lang-switch" style="margin-right:20px; display: flex; align-items: center; gap: 8px;">
                <select id="lang-select" class="lang-select">
                    <option value="en">English</option>
                    <option value="zh">中文</option>
                </select>
            </div>
        `;
        const userActions = document.querySelector('.user-actions');
        if (userActions) {
            userActions.insertAdjacentHTML('afterbegin', switcherHtml);
        }
        this.updateActiveState();
    }

    // 切换语言
    switchLanguage(lang) {
        if (window.i18n) {
            window.i18n.switchLanguage(lang);
        }
        this.updateActiveState();
    }

    // 更新下拉状态
    updateActiveState() {
        const currentLang = window.i18n ? window.i18n.getCurrentLanguage() : 'zh';
        const langSelect = document.getElementById('lang-select');
        if (langSelect) {
            langSelect.value = currentLang;
        }
    }

    // 绑定下拉选择器事件
    bindEvents() {
        document.addEventListener('change', (e) => {
            if (e.target && e.target.id === 'lang-select') {
                this.switchLanguage(e.target.value);
            }
        });
        window.addEventListener('languageChanged', () => {
            this.updateActiveState();
        });
    }

    // 注入grok.html的.lang-select样式
    injectStyle() {
        if (document.getElementById('lang-select-style')) return;
        const style = document.createElement('style');
        style.id = 'lang-select-style';
        style.textContent = `
            .lang-select {
                border: 1.5px solid var(--primary);
                background: #fff;
                color: var(--primary);
                border-radius: 22px;
                padding: 7px 36px 7px 16px;
                font-size: 1.08rem;
                font-weight: 600;
                cursor: pointer;
                outline: none;
                transition: border 0.2s, color 0.2s, box-shadow 0.2s;
                box-shadow: 0 2px 8px rgba(67,97,238,0.10);
                appearance: none;
                -webkit-appearance: none;
                -moz-appearance: none;
                position: relative;
                background-image: url('data:image/svg+xml;utf8,<svg fill="%234361ee" height="18" viewBox="0 0 24 24" width="18" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/></svg>');
                background-repeat: no-repeat;
                background-position: right 12px center;
                background-size: 18px 18px;
            }
            .lang-select:focus, .lang-select:hover {
                border: 1.5px solid var(--secondary);
                color: var(--secondary);
                box-shadow: 0 4px 16px rgba(67,97,238,0.18);
                background-color: #f3f6fd;
            }
            .lang-select option {
                font-size: 1.05rem;
                padding: 8px 0;
                color: var(--primary);
                background: #fff;
            }
            @media (prefers-color-scheme: dark) {
                .lang-select {
                    background: #232946;
                    color: #4cc9f0;
                    border: 1.5px solid #4cc9f0;
                    background-image: url('data:image/svg+xml;utf8,<svg fill="%234cc9f0" height="18" viewBox="0 0 24 24" width="18" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/></svg>');
                }
                .lang-select:focus, .lang-select:hover {
                    border: 1.5px solid #4895ef;
                    color: #4895ef;
                    background-color: #232946;
                }
                .lang-select option {
                    background: #232946;
                    color: #4cc9f0;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// 创建全局实例
window.languageSwitcher = new LanguageSwitcher();

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (!document.querySelector('.lang-switch')) {
            window.languageSwitcher.createSwitcher();
        }
        window.languageSwitcher.updateActiveState();
    }, 300);
});