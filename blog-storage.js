/**
 * Blog Storage Service
 * Handles all article data operations using localStorage
 */

class BlogStorage {
    constructor() {
        this.storageKey = 'opai_blog_articles';
        this.init();
    }

    init() {
        // Check if localStorage is available
        if (!this.isStorageAvailable()) {
            console.warn('localStorage is not available. Blog functionality may be limited.');
            return false;
        }

        // Initialize storage if it doesn't exist
        if (!localStorage.getItem(this.storageKey)) {
            localStorage.setItem(this.storageKey, JSON.stringify({}));
        }

        return true;
    }

    isStorageAvailable() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }

    checkStorageQuota() {
        try {
            // Try to estimate storage usage
            const used = JSON.stringify(localStorage).length;
            const limit = 5 * 1024 * 1024; // 5MB typical limit
            
            if (used > limit * 0.9) {
                console.warn('localStorage is nearly full. Consider cleaning up old articles.');
                return false;
            }
            return true;
        } catch (e) {
            console.error('Error checking storage quota:', e);
            return false;
        }
    }

    saveArticle(article) {
        try {
            if (!this.isStorageAvailable()) {
                throw new Error('Storage is not available');
            }

            if (!this.checkStorageQuota()) {
                throw new Error('Storage quota exceeded');
            }

            // Validate article
            const validation = article.validate();
            if (!validation.isValid) {
                throw new Error('Article validation failed: ' + validation.errors.join(', '));
            }

            // Update last modified time
            article.lastModified = new Date().toISOString();

            // Get existing articles
            const articles = this.getAllArticlesData();
            
            // Save article
            articles[article.id] = article.toJSON();
            
            // Store back to localStorage
            localStorage.setItem(this.storageKey, JSON.stringify(articles));
            
            return { success: true, article: article };
        } catch (error) {
            console.error('Error saving article:', error);
            return { success: false, error: error.message };
        }
    }

    getArticle(id) {
        try {
            if (!this.isStorageAvailable()) {
                return null;
            }

            const articles = this.getAllArticlesData();
            const articleData = articles[id];
            
            if (!articleData) {
                return null;
            }

            return Article.fromJSON(articleData);
        } catch (error) {
            console.error('Error getting article:', error);
            return null;
        }
    }

    getArticles(options = {}) {
        try {
            if (!this.isStorageAvailable()) {
                return [];
            }

            const articles = this.getAllArticlesData();
            let articleList = Object.values(articles).map(data => Article.fromJSON(data));

            // Filter by status
            if (options.status) {
                articleList = articleList.filter(article => article.status === options.status);
            }

            // Filter by category
            if (options.category) {
                articleList = articleList.filter(article => article.category === options.category);
            }

            // Sort by publish date (newest first)
            articleList.sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate));

            // Limit results
            if (options.limit) {
                articleList = articleList.slice(0, options.limit);
            }

            return articleList;
        } catch (error) {
            console.error('Error getting articles:', error);
            return [];
        }
    }

    deleteArticle(id) {
        try {
            if (!this.isStorageAvailable()) {
                throw new Error('Storage is not available');
            }

            const articles = this.getAllArticlesData();
            
            if (!articles[id]) {
                throw new Error('Article not found');
            }

            delete articles[id];
            localStorage.setItem(this.storageKey, JSON.stringify(articles));
            
            return { success: true };
        } catch (error) {
            console.error('Error deleting article:', error);
            return { success: false, error: error.message };
        }
    }

    getAllArticlesData() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : {};
        } catch (error) {
            console.error('Error parsing articles data:', error);
            // Reset storage if corrupted
            localStorage.setItem(this.storageKey, JSON.stringify({}));
            return {};
        }
    }

    getArticleCount() {
        try {
            const articles = this.getAllArticlesData();
            return Object.keys(articles).length;
        } catch (error) {
            console.error('Error getting article count:', error);
            return 0;
        }
    }

    async clearAllArticles() {
        try {
            if (!this.isStorageAvailable()) {
                throw new Error('Storage is not available');
            }

            localStorage.setItem(this.storageKey, JSON.stringify({}));
            return { success: true };
        } catch (error) {
            console.error('Error clearing articles:', error);
            return { success: false, error: error.message };
        }
    }

    exportArticles() {
        try {
            const articles = this.getAllArticlesData();
            return {
                success: true,
                data: articles,
                exportDate: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error exporting articles:', error);
            return { success: false, error: error.message };
        }
    }

    importArticles(articlesData) {
        try {
            if (!this.isStorageAvailable()) {
                throw new Error('Storage is not available');
            }

            if (!articlesData || typeof articlesData !== 'object') {
                throw new Error('Invalid articles data');
            }

            // Validate each article before importing
            const validArticles = {};
            for (const [id, articleData] of Object.entries(articlesData)) {
                try {
                    const article = Article.fromJSON(articleData);
                    const validation = article.validate();
                    if (validation.isValid) {
                        validArticles[id] = article.toJSON();
                    }
                } catch (e) {
                    console.warn(`Skipping invalid article ${id}:`, e.message);
                }
            }

            localStorage.setItem(this.storageKey, JSON.stringify(validArticles));
            return { 
                success: true, 
                imported: Object.keys(validArticles).length,
                total: Object.keys(articlesData).length
            };
        } catch (error) {
            console.error('Error importing articles:', error);
            return { success: false, error: error.message };
        }
    }
}

// Create global instance
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BlogStorage };
} else {
    window.blogStorage = new BlogStorage();
}