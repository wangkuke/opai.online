/**
 * 修复侧边栏国际化问题的专用脚本（只做侧边栏刷新）
 * 依赖 window.i18n 作为唯一i18n入口
 */

(function() {
    // 监听语言变化事件，刷新侧边栏
    window.addEventListener('languageChanged', function() {
        if (window.i18n) {
            window.i18n.updateSidebarTranslations();
        }
    });

    // 页面加载完成后，首次刷新侧边栏
    document.addEventListener('DOMContentLoaded', function() {
        if (window.i18n) {
            setTimeout(() => {
                window.i18n.updateSidebarTranslations();
            }, 300);
        }
    });

    // 提供手动修复接口
    window.fixSidebarI18n = function() {
        if (window.i18n) {
            window.i18n.updateSidebarTranslations();
        }
    };
})();