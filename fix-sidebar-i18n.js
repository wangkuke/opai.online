/**
 * 修复侧边栏加载和i18n问题
 * Fix sidebar loading and i18n issues
 */

(function() {
    'use strict';
    
    console.log('Loading sidebar fix script...');
    
    // 侧边栏HTML内容
    const sidebarHTML = `
        <div class="sidebar">
            <div class="logo">
                <i class="fas fa-robot"></i>
                <h1 data-i18n="sidebar.logo">OPAI</h1>
            </div>
            
            <div class="category-section">
                <div class="category-title">
                    <i class="fas fa-newspaper"></i>
                    <span data-i18n="sidebar.cate.news">AI资讯</span>
                </div>
                <ul class="category-list">
                    <li><i class="fas fa-star"></i><span data-i18n="sidebar.latest">最新文章</span></li>
                </ul>
            </div>
            
            <div class="category-section">
                <div class="category-title">
                    <i class="fas fa-brain"></i>
                    <span data-i18n="sidebar.models">AI大模型</span>
                </div>
                <ul class="category-list">
                    <li><i class="fas fa-comments"></i><a href="grok.html">Grok</a></li>
                    <li><i class="fas fa-robot"></i><a href="cici.html">Cici AI</a></li>
                </ul>
            </div>
            
            <div class="category-section">
                <div class="category-title">
                    <i class="fas fa-video"></i>
                    <span data-i18n="sidebar.cate.video">AI视频工具</span>
                </div>
                <ul class="category-list">
                    <li><i class="fas fa-download"></i><span data-i18n="sidebar.download">视频下载</span></li>
                    <li><i class="fas fa-film"></i><span data-i18n="sidebar.gen">视频生成</span></li>
                </ul>
            </div>
            
            <div class="category-section">
                <div class="category-title">
                    <i class="fab fa-youtube"></i>
                    <span data-i18n="sidebar.youtube">YouTube工具</span>
                </div>
                <ul class="category-list">
                    <li><i class="fas fa-chart-line"></i><a href="ytlarge.html">ytlarge</a></li>
                    <li><i class="fas fa-analytics"></i><a href="viewstats.html">ViewStats</a></li>
                    <li><i class="fas fa-trending-up"></i><a href="yewtu.html">yewtu</a></li>
                </ul>
            </div>
            
            <div class="category-section">
                <div class="category-title">
                    <i class="fas fa-code"></i>
                    <span data-i18n="sidebar.aicode">AI编程工具</span>
                </div>
                <ul class="category-list">
                    <li><i class="fas fa-terminal"></i><a href="kiro.html" data-i18n="aicode.kiro">Kiro</a></li>
                </ul>
            </div>
        </div>
    `;
    
    // 加载侧边栏
    function loadSidebar() {
        const sidebarContainer = document.getElementById('sidebar');
        if (sidebarContainer) {
            sidebarContainer.outerHTML = sidebarHTML;
            console.log('✓ Sidebar loaded successfully');
            
            // 应用翻译
            setTimeout(() => {
                if (window.i18n && window.i18n.isLoaded) {
                    window.i18n.updatePageText();
                    console.log('✓ Sidebar translations applied');
                }
            }, 100);
        }
    }
    
    // 初始化博客卡片系统
    function initializeBlogSystem() {
        console.log('Initializing blog system...');
        
        // 等待存储系统准备就绪
        const waitForStorage = () => {
            if (window.blogStorageManager && window.blogStorageManager.isReady()) {
                console.log('✓ Storage manager ready');
                initializeBlogCards();
            } else if (window.blogStorage) {
                console.log('✓ Basic storage ready');
                initializeBlogCards();
            } else {
                setTimeout(waitForStorage, 100);
            }
        };
        
        const initializeBlogCards = () => {
            const articlesGrid = document.querySelector('.articles-grid');
            if (articlesGrid && !window.blogCards) {
                try {
                    window.blogCards = new BlogCards();
                    console.log('✓ Blog cards system initialized');
                } catch (error) {
                    console.error('✗ Failed to initialize blog cards:', error);
                }
            }
        };
        
        waitForStorage();
    }
    
    // DOM 准备就绪时执行
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            loadSidebar();
            setTimeout(initializeBlogSystem, 1000);
        });
    } else {
        loadSidebar();
        setTimeout(initializeBlogSystem, 1000);
    }
    
    // 监听存储系统准备事件
    window.addEventListener('blogStorageReady', () => {
        console.log('Blog storage ready event received');
        setTimeout(initializeBlogSystem, 100);
    });
    
    // 全局修复函数
    window.fixSidebarI18n = function() {
        loadSidebar();
        initializeBlogSystem();
    };
    
    console.log('Sidebar fix script loaded');
})();