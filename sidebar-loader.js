/**
 * 动态侧边栏加载器
 * Dynamic Sidebar Loader
 */

(function() {
    'use strict';
    
    console.log('Loading dynamic sidebar loader...');
    
    // 侧边栏加载器类
    class SidebarLoader {
        constructor() {
            this.isLoaded = false;
            this.retryCount = 0;
            this.maxRetries = 3;
        }
        
        // 加载侧边栏HTML文件
        async loadSidebarHTML() {
            try {
                console.log('Fetching sidebar.html...');
                const response = await fetch('sidebar.html');
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const html = await response.text();
                console.log('✓ Sidebar HTML loaded successfully');
                return html;
                
            } catch (error) {
                console.error('✗ Failed to load sidebar.html:', error);
                
                if (this.retryCount < this.maxRetries) {
                    this.retryCount++;
                    console.log(`Retrying... (${this.retryCount}/${this.maxRetries})`);
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    return this.loadSidebarHTML();
                }
                
                throw error;
            }
        }
        
        // 插入侧边栏到页面
        insertSidebar(html) {
            const sidebarContainer = document.getElementById('sidebar');
            if (!sidebarContainer) {
                console.error('✗ Sidebar container not found');
                return false;
            }
            
            // 替换容器内容
            sidebarContainer.outerHTML = html;
            console.log('✓ Sidebar inserted into page');
            return true;
        }
        
        // 应用国际化翻译
        applyTranslations() {
            // 等待i18next准备就绪
            const waitForI18n = () => {
                if (window.i18next && window.i18next.isInitialized) {
                    try {
                        // 使用jQuery i18next更新翻译
                        if (window.$ && window.jqueryI18next) {
                            window.$('[data-i18n]').localize();
                            console.log('✓ Sidebar translations applied via jQuery i18next');
                        } else {
                            // 手动更新翻译
                            this.manualTranslationUpdate();
                        }
                    } catch (error) {
                        console.error('✗ Translation error:', error);
                        this.manualTranslationUpdate();
                    }
                } else {
                    setTimeout(waitForI18n, 100);
                }
            };
            
            waitForI18n();
        }
        
        // 手动更新翻译（备用方案）
        manualTranslationUpdate() {
            const elements = document.querySelectorAll('[data-i18n]');
            elements.forEach(element => {
                const key = element.getAttribute('data-i18n');
                if (window.i18next && key) {
                    const translation = window.i18next.t(key);
                    if (translation && translation !== key) {
                        element.textContent = translation;
                    }
                }
            });
            console.log('✓ Manual translation update completed');
        }
        
        // 添加事件监听器
        addEventListeners() {
            // 监听语言切换事件
            if (window.i18next) {
                window.i18next.on('languageChanged', () => {
                    console.log('Language changed, updating sidebar translations...');
                    this.applyTranslations();
                });
            }
            
            // 监听侧边栏链接点击事件
            document.addEventListener('click', (e) => {
                const link = e.target.closest('.sidebar a');
                if (link && link.getAttribute('href')) {
                    const href = link.getAttribute('href');
                    // 处理锚点链接的平滑滚动
                    if (href.startsWith('#')) {
                        e.preventDefault();
                        const target = document.querySelector(href);
                        if (target) {
                            target.scrollIntoView({ behavior: 'smooth' });
                        }
                    }
                }
            });
        }
        
        // 初始化侧边栏
        async init() {
            if (this.isLoaded) {
                console.log('Sidebar already loaded');
                return;
            }
            
            try {
                // 加载HTML
                const html = await this.loadSidebarHTML();
                
                // 插入到页面
                if (this.insertSidebar(html)) {
                    // 应用翻译
                    setTimeout(() => this.applyTranslations(), 100);
                    
                    // 添加事件监听器
                    this.addEventListeners();
                    
                    this.isLoaded = true;
                    console.log('✓ Sidebar initialization completed');
                    
                    // 触发自定义事件
                    window.dispatchEvent(new CustomEvent('sidebarLoaded'));
                }
                
            } catch (error) {
                console.error('✗ Sidebar initialization failed:', error);
                this.showFallbackSidebar();
            }
        }
        
        // 显示备用侧边栏（简化版本）
        showFallbackSidebar() {
            const sidebarContainer = document.getElementById('sidebar');
            if (sidebarContainer) {
                sidebarContainer.innerHTML = `
                    <aside class="sidebar">
                        <div class="logo">
                            <i class="fas fa-robot"></i>
                            <h1>OPAI</h1>
                        </div>
                        <div class="category-section">
                            <div class="category-title">
                                <i class="fas fa-exclamation-triangle"></i>
                                <span>加载失败</span>
                            </div>
                            <ul class="category-list">
                                <li><a href="index.html">返回首页</a></li>
                            </ul>
                        </div>
                    </aside>
                `;
                console.log('✓ Fallback sidebar displayed');
            }
        }
    }
    
    // 创建全局实例
    window.sidebarLoader = new SidebarLoader();
    
    // DOM准备就绪时初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.sidebarLoader.init();
        });
    } else {
        window.sidebarLoader.init();
    }
    
    console.log('Dynamic sidebar loader ready');
})();