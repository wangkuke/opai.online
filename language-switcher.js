/**
 * 全局语言切换器组件
 * 可在所有页面中使用的统一语言切换功能
 * 支持自定义 i18n 系统和 i18next 系统
 */

class LanguageSwitcher {
    constructor() {
        this.currentLanguage = localStorage.getItem('language') || 'zh';
        this.i18nSystem = null; // 'custom' 或 'i18next'
        this.translations = {};
        this.isLoaded = false;
        this.init();
    }

    // 初始化语言切换器
    init() {
        // 先加载翻译文件
        this.loadTranslations().then(() => {
            // 检测使用的 i18n 系统
            this.detectI18nSystem(() => {
                this.createSwitcher();
                this.updateActiveState();
                this.updatePageContent();
            });
        });
    }

    // 加载翻译文件
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
            // 如果加载失败，使用默认翻译
            this.translations = {
                en: {
                    "nav.home": "Home",
                    "nav.tools": "AI Tools", 
                    "nav.tutorial": "Tutorial",
                    "nav.blog": "Blog",
                    "nav.community": "Community",
                    "nav.about": "About",
                    "btn.publish": "Publish",
                    "btn.visit": "Visit Now",
                    "btn.mobile": "Mobile Version"
                },
                zh: {
                    "nav.home": "首页",
                    "nav.tools": "AI工具",
                    "nav.tutorial": "教程", 
                    "nav.blog": "博客",
                    "nav.community": "社区",
                    "nav.about": "关于",
                    "btn.publish": "发布文章",
                    "btn.visit": "立即访问",
                    "btn.mobile": "手机版"
                }
            };
            this.isLoaded = true;
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

    // 检测 i18n 系统类型
    detectI18nSystem(callback) {
        const checkSystems = () => {
            if (window.i18next) {
                this.i18nSystem = 'i18next';
                callback();
            } else if (window.i18n) {
                this.i18nSystem = 'custom';
                callback();
            } else {
                // 如果没有检测到任何系统，使用内置系统
                this.i18nSystem = 'builtin';
                callback();
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

        // 检查是否是主页（有下拉选择器）
        const isIndexPage = document.querySelector('#lang-select');
        
        let switcherHtml;
        if (isIndexPage) {
            // 主页使用下拉选择器
            switcherHtml = `
                <div class="lang-switch" style="margin-right:20px; display: flex; align-items: center; gap: 8px;">
                    <select id="lang-select" class="lang-select">
                        <option value="en">English</option>
                        <option value="zh">中文</option>
                    </select>
                </div>
            `;
        } else {
            // 其他页面使用按钮
            switcherHtml = `
                <div class="language-switcher" style="margin-right: 15px;">
                    <button class="btn lang-btn" onclick="languageSwitcher.switchLanguage('zh')" 
                            style="padding: 8px 16px; margin-right: 5px; font-size: 0.9rem;">中文</button>
                    <button class="btn lang-btn" onclick="languageSwitcher.switchLanguage('en')" 
                            style="padding: 8px 16px; font-size: 0.9rem;">EN</button>
                </div>
            `;
        }

        // 查找用户操作区域
        const userActions = document.querySelector('.user-actions');
        if (userActions) {
            // 在用户操作区域开头插入
            userActions.insertAdjacentHTML('afterbegin', switcherHtml);
            
            // 如果是主页，绑定下拉选择器事件
            if (isIndexPage) {
                const langSelect = document.getElementById('lang-select');
                if (langSelect) {
                    langSelect.addEventListener('change', (e) => {
                        this.switchLanguage(e.target.value);
                    });
                }
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
            window.i18next.changeLanguage(lang, () => {
                // i18next 切换完成后更新页面
                this.updatePageContent();
            });
        } else {
            // 使用内置系统
            this.updatePageContent();
        }

        this.updateActiveState();
        
        // 触发自定义事件，通知其他组件语言已切换
        window.dispatchEvent(new CustomEvent('globalLanguageChanged', { 
            detail: { language: lang } 
        }));
    }

    // 更新页面内容
    updatePageContent() {
        // 更新导航链接
        this.updateNavigation();
        
        // 更新按钮文本
        this.updateButtons();
        
        // 更新所有带有 data-i18n 属性的元素
        this.updateDataI18nElements();
        
        // 更新页面标题
        this.updatePageTitle();
    }

    // 更新导航链接
    updateNavigation() {
        const navLinks = document.querySelectorAll('.nav-links a');
        navLinks.forEach(link => {
            const text = link.textContent.trim();
            if (text.includes('Home') || text.includes('首页')) {
                link.textContent = this.t('nav.home');
            } else if (text.includes('AI Tools') || text.includes('AI工具')) {
                link.textContent = this.t('nav.tools');
            } else if (text.includes('Tutorial') || text.includes('教程')) {
                link.textContent = this.t('nav.tutorial');
            } else if (text.includes('Blog') || text.includes('博客')) {
                link.textContent = this.t('nav.blog');
            } else if (text.includes('Community') || text.includes('社区')) {
                link.textContent = this.t('nav.community');
            } else if (text.includes('About') || text.includes('关于')) {
                link.textContent = this.t('nav.about');
            }
        });
    }

    // 更新按钮文本
    updateButtons() {
        // 更新发布按钮
        const publishBtns = document.querySelectorAll('#createPostBtn');
        publishBtns.forEach(btn => {
            const icon = btn.querySelector('i');
            const iconHtml = icon ? icon.outerHTML + ' ' : '';
            btn.innerHTML = iconHtml + this.t('btn.publish');
        });

        // 更新访问按钮
        const visitBtns = document.querySelectorAll('.btn');
        visitBtns.forEach(btn => {
            const text = btn.textContent.trim();
            if (text.includes('Visit') || text.includes('访问')) {
                const icon = btn.querySelector('i');
                const iconHtml = icon ? icon.outerHTML + ' ' : '';
                btn.innerHTML = iconHtml + this.t('btn.visit');
            } else if (text.includes('Mobile') || text.includes('手机')) {
                const icon = btn.querySelector('i');
                const iconHtml = icon ? icon.outerHTML + ' ' : '';
                btn.innerHTML = iconHtml + this.t('btn.mobile');
            }
        });
    }

    // 更新带有 data-i18n 属性的元素
    updateDataI18nElements() {
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.t(key);
            if (translation !== key) {
                element.textContent = translation;
            }
        });
    }

    // 更新页面标题
    updatePageTitle() {
        const title = document.title;
        if (this.currentLanguage === 'zh') {
            // 如果当前是英文标题，转换为中文
            if (title.includes('Gemini AI Pro') && !title.includes('免费')) {
                document.title = 'Gemini AI Pro - 免费获取15个月套餐 | OPAI';
            } else if (title.includes('OPAI') && title.includes('Professional') && !title.includes('专业')) {
                document.title = 'OPAI - 专业AI工具分享平台 | 发现最好用的AI工具和教程';
            }
        } else {
            // 如果当前是中文标题，转换为英文
            if (title.includes('免费获取')) {
                document.title = 'Gemini AI Pro - Get 15 Months Free | OPAI';
            } else if (title.includes('专业AI工具')) {
                document.title = 'OPAI - Professional AI Tool Sharing Platform | Discover the Best AI Tools and Tutorials';
            }
        }
    }

    // 更新按钮的活跃状态
    updateActiveState() {
        // 更新按钮状态
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.remove('active');
            
            // 检查按钮的onclick属性是否包含当前语言
            if (btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(`'${this.currentLanguage}'`)) {
                btn.classList.add('active');
            }
        });

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

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 确保语言切换器已创建
    setTimeout(() => {
        if (!document.querySelector('.language-switcher') && !document.querySelector('.lang-switch')) {
            window.languageSwitcher.createSwitcher();
        }
        
        // 设置下拉选择器的值
        const langSelect = document.getElementById('lang-select');
        if (langSelect) {
            langSelect.value = window.languageSwitcher.getCurrentLanguage();
        }
        
        // 更新页面内容
        window.languageSwitcher.updatePageContent();
    }, 300);
});