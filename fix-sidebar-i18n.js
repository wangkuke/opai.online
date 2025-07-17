/**
 * 修复侧边栏 i18n 显示问题的脚本
 */

// 等待页面和 i18n 系统都加载完成
function waitForI18nAndApply() {
    const checkAndApply = () => {
        if (window.i18n && window.i18n.isLoaded) {
            // 应用翻译到所有元素
            window.i18n.updatePageText();
            
            // 特别处理侧边栏
            const sidebarElements = document.querySelectorAll('.sidebar [data-i18n]');
            sidebarElements.forEach(element => {
                const key = element.getAttribute('data-i18n');
                const translation = window.i18n.t(key);
                if (translation && translation !== key) {
                    element.textContent = translation;
                }
            });
            
            console.log('i18n translations applied successfully');
        } else {
            // 如果还没准备好，继续等待
            setTimeout(checkAndApply, 100);
        }
    };
    
    checkAndApply();
}

// 监听 DOM 变化，特别是侧边栏的加载
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    // 检查是否是侧边栏相关的元素
                    if (node.classList && (node.classList.contains('sidebar') || node.querySelector('.sidebar'))) {
                        console.log('Sidebar loaded, applying i18n...');
                        setTimeout(waitForI18nAndApply, 50);
                    }
                }
            });
        }
    });
});

// 开始观察
observer.observe(document.body, {
    childList: true,
    subtree: true
});

// 页面加载完成后也执行一次
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(waitForI18nAndApply, 200);
});

// 提供手动触发的函数
window.fixSidebarI18n = waitForI18nAndApply;