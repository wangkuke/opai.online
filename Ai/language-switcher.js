// 语言切换组件
import i18next from './i18n.js';

class LanguageSwitcher {
    constructor() {
        this.currentLang = 'en';
        this.languages = {
            en: { name: 'English', flag: '🇺🇸' },
            zh: { name: '简体中文', flag: '🇨🇳' },
            ar: { name: 'العربية', flag: '🇸🇦' },
            id: { name: 'Bahasa Indonesia', flag: '🇮🇩' },
            fr: { name: 'Français', flag: '🇫🇷' },
            ru: { name: 'Русский', flag: '🇷🇺' }
        };
        this.init();
    }

    init() {
        // 从localStorage获取保存的语言设置
        const savedLang = localStorage.getItem('preferred-language');
        if (savedLang && this.languages[savedLang]) {
            this.currentLang = savedLang;
            i18next.changeLanguage(savedLang);
        }

        this.createLanguageSwitcher();
        this.updatePageContent();
    }

    createLanguageSwitcher() {
        // 创建语言切换器容器
        const switcherContainer = document.createElement('div');
        switcherContainer.className = 'language-switcher';
        switcherContainer.innerHTML = `
            <div class="language-switcher-toggle">
                <span class="current-lang-flag">${this.languages[this.currentLang].flag}</span>
                <span class="current-lang-name">${this.languages[this.currentLang].name}</span>
                <svg class="dropdown-arrow" width="12" height="8" viewBox="0 0 12 8" fill="none">
                    <path d="M1 1L6 6L11 1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </div>
            <div class="language-dropdown">
                ${Object.entries(this.languages).map(([code, lang]) => `
                    <div class="language-option ${code === this.currentLang ? 'active' : ''}" data-lang="${code}">
                        <span class="lang-flag">${lang.flag}</span>
                        <span class="lang-name">${lang.name}</span>
                    </div>
                `).join('')}
            </div>
        `;

        // 添加样式
        this.addStyles();

        // 添加到页面
        const header = document.querySelector('header') || document.body;
        const navContainer = header.querySelector('.container') || header.querySelector('nav') || header;
        navContainer.appendChild(switcherContainer);

        // 绑定事件
        this.bindEvents(switcherContainer);
    }

    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .language-switcher {
                position: relative;
                display: inline-block;
                margin-left: 20px;
            }

            .language-switcher-toggle {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 8px 12px;
                background: rgba(22, 93, 255, 0.1);
                border: 1px solid rgba(22, 93, 255, 0.2);
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.3s ease;
                backdrop-filter: blur(10px);
            }

            .language-switcher-toggle:hover {
                background: rgba(22, 93, 255, 0.2);
                border-color: rgba(22, 93, 255, 0.3);
            }

            .current-lang-flag {
                font-size: 16px;
            }

            .current-lang-name {
                font-size: 14px;
                color: #165DFF;
                font-weight: 500;
            }

            .dropdown-arrow {
                transition: transform 0.3s ease;
            }

            .language-switcher.active .dropdown-arrow {
                transform: rotate(180deg);
            }

            .language-dropdown {
                position: absolute;
                top: 100%;
                right: 0;
                margin-top: 8px;
                background: white;
                border-radius: 12px;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
                opacity: 0;
                visibility: hidden;
                transform: translateY(-10px);
                transition: all 0.3s ease;
                z-index: 1000;
                min-width: 180px;
                overflow: hidden;
            }

            .language-switcher.active .language-dropdown {
                opacity: 1;
                visibility: visible;
                transform: translateY(0);
            }

            .language-option {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px 16px;
                cursor: pointer;
                transition: background-color 0.2s ease;
                border-bottom: 1px solid #f0f0f0;
            }

            .language-option:last-child {
                border-bottom: none;
            }

            .language-option:hover {
                background-color: #f8f9fa;
            }

            .language-option.active {
                background-color: #e3f2fd;
                color: #1976d2;
            }

            .lang-flag {
                font-size: 18px;
            }

            .lang-name {
                font-size: 14px;
                font-weight: 500;
            }

            /* RTL支持 */
            [dir="rtl"] .language-switcher {
                margin-left: 0;
                margin-right: 20px;
            }

            [dir="rtl"] .language-dropdown {
                right: auto;
                left: 0;
            }

            [dir="rtl"] .language-option {
                flex-direction: row-reverse;
            }

            /* 响应式设计 */
            @media (max-width: 768px) {
                .language-switcher {
                    margin-left: 10px;
                }

                .current-lang-name {
                    display: none;
                }

                .language-dropdown {
                    min-width: 150px;
                }
            }
        `;
        document.head.appendChild(style);
    }

    bindEvents(container) {
        const toggle = container.querySelector('.language-switcher-toggle');
        const dropdown = container.querySelector('.language-dropdown');
        const options = container.querySelectorAll('.language-option');

        // 切换下拉菜单
        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            container.classList.toggle('active');
        });

        // 点击外部关闭下拉菜单
        document.addEventListener('click', () => {
            container.classList.remove('active');
        });

        // 语言选择
        options.forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                const langCode = option.dataset.lang;
                this.changeLanguage(langCode);
                container.classList.remove('active');
            });
        });
    }

    changeLanguage(langCode) {
        if (langCode === this.currentLang) return;

        this.currentLang = langCode;
        i18next.changeLanguage(langCode);
        
        // 保存到localStorage
        localStorage.setItem('preferred-language', langCode);
        
        // 更新切换器显示
        this.updateSwitcherDisplay();
        
        // 更新页面内容
        this.updatePageContent();
        
        // 设置页面方向（阿拉伯语为RTL）
        document.documentElement.dir = langCode === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = langCode;
    }

    updateSwitcherDisplay() {
        const flag = document.querySelector('.current-lang-flag');
        const name = document.querySelector('.current-lang-name');
        
        if (flag && name) {
            flag.textContent = this.languages[this.currentLang].flag;
            name.textContent = this.languages[this.currentLang].name;
        }

        // 更新选项的active状态
        document.querySelectorAll('.language-option').forEach(option => {
            option.classList.toggle('active', option.dataset.lang === this.currentLang);
        });
    }

    updatePageContent() {
        // 更新所有带有data-i18n属性的元素
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = i18next.t(key);
            
            if (translation && translation !== key) {
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    element.placeholder = translation;
                } else {
                    element.textContent = translation;
                }
            }
        });

        // 更新页面标题
        const title = i18next.t('hero.title');
        if (title && title !== 'hero.title') {
            document.title = title;
        }

        // 触发自定义事件，通知其他组件语言已更改
        window.dispatchEvent(new CustomEvent('languageChanged', {
            detail: { language: this.currentLang }
        }));
    }

    // 获取当前语言
    getCurrentLanguage() {
        return this.currentLang;
    }

    // 翻译文本
    translate(key) {
        return i18next.t(key);
    }
}

// 创建全局实例
window.languageSwitcher = new LanguageSwitcher();

export default window.languageSwitcher; 