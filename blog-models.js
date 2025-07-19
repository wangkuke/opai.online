/**
 * Blog System Data Models
 * Core models for the OPAI blog system
 */

class Article {
    constructor(data = {}) {
        this.id = data.id || this.generateId();
        this.title = data.title || '';
        this.content = data.content || '';
        this.excerpt = data.excerpt || this.generateExcerpt(data.content || '');
        this.category = data.category || 'General';
        this.tags = Array.isArray(data.tags) ? data.tags : [];
        this.author = data.author || 'Admin';
        this.publishDate = data.publishDate || new Date().toISOString();
        this.lastModified = new Date().toISOString();
        this.status = data.status || 'draft';
    }

    generateId() {
        return 'article-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    generateExcerpt(content = '') {
        if (!content) return '';
        // Remove HTML tags and get first 150 characters
        const plainText = content.replace(/<[^>]*>/g, '').trim();
        return plainText.length > 150 ? plainText.substring(0, 150) + '...' : plainText;
    }

    validate() {
        const errors = [];
        
        if (!this.title || this.title.trim().length === 0) {
            errors.push('Title is required');
        }
        
        if (!this.content || this.content.trim().length === 0) {
            errors.push('Content is required');
        }
        
        if (this.title && this.title.length > 200) {
            errors.push('Title must be less than 200 characters');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    toJSON() {
        return {
            id: this.id,
            title: this.title,
            content: this.content,
            excerpt: this.excerpt,
            category: this.category,
            tags: this.tags,
            author: this.author,
            publishDate: this.publishDate,
            lastModified: this.lastModified,
            status: this.status
        };
    }

    static fromJSON(data) {
        return new Article(data);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Article };
} else {
    window.Article = Article;
}