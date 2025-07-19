/**
 * Blog Storage Manager
 * Simplified localStorage-only version
 */

class BlogStorageManager {
    constructor() {
        this.storage = null;
        this.isInitialized = false;
        this.initPromise = null;
    }

    async initialize() {
        if (this.initPromise) {
            return this.initPromise;
        }

        this.initPromise = this._doInitialize();
        return this.initPromise;
    }

    async _doInitialize() {
        try {
            console.log('Initializing blog storage...');
            
            // Use localStorage only
            this.storage = new BlogStorage();
            this.isInitialized = true;
            
            // Make storage globally available
            window.blogStorage = this.storage;
            
            // Dispatch initialization event
            window.dispatchEvent(new CustomEvent('blogStorageReady', {
                detail: { 
                    storage: this.storage,
                    type: 'localStorage'
                }
            }));
            
            console.log('✓ localStorage storage initialized successfully');
            return this.storage;
            
        } catch (error) {
            console.error('Failed to initialize blog storage:', error);
            
            // Ultimate fallback
            this.storage = new BlogStorage();
            window.blogStorage = this.storage;
            this.isInitialized = true;
            
            return this.storage;
        }
    }



    getStorage() {
        return this.storage;
    }

    isReady() {
        return this.isInitialized && this.storage !== null;
    }

    async waitForReady() {
        if (this.isReady()) {
            return this.storage;
        }
        
        return new Promise((resolve) => {
            const checkReady = () => {
                if (this.isReady()) {
                    resolve(this.storage);
                } else {
                    setTimeout(checkReady, 100);
                }
            };
            checkReady();
        });
    }

    // Utility methods that delegate to the active storage
    async saveArticle(article) {
        await this.waitForReady();
        return this.storage.saveArticle(article);
    }

    async getArticle(id) {
        await this.waitForReady();
        return this.storage.getArticle(id);
    }

    async getArticles(options = {}) {
        await this.waitForReady();
        return this.storage.getArticles(options);
    }

    async deleteArticle(id) {
        await this.waitForReady();
        return this.storage.deleteArticle(id);
    }

    // Storage type detection
    isUsingLocalStorage() {
        return true; // Always using localStorage now
    }
}

// Create global storage manager instance
window.blogStorageManager = new BlogStorageManager();

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for all scripts to load
    setTimeout(async () => {
        try {
            await window.blogStorageManager.initialize();
            console.log('Blog storage manager ready');
        } catch (error) {
            console.error('Failed to initialize blog storage manager:', error);
        }
    }, 500);
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BlogStorageManager };
} else {
    window.BlogStorageManager = BlogStorageManager;
}