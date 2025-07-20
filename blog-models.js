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
        
        // 新增属性用于 Supabase 支持
        this.visibility = data.visibility || 'public'; // 'public', 'private', 'link_only'
        this.createdAt = data.createdAt || new Date().toISOString();
        this.updatedAt = data.updatedAt || new Date().toISOString();
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
        
        // 基本字段验证
        if (!this.title || this.title.trim().length === 0) {
            errors.push('Title is required');
        }
        
        if (!this.content || this.content.trim().length === 0) {
            errors.push('Content is required');
        }
        
        if (this.title && this.title.length > 200) {
            errors.push('Title must be less than 200 characters');
        }
        
        // 新属性验证
        const validStatuses = ['draft', 'published', 'archived'];
        if (!validStatuses.includes(this.status)) {
            errors.push('Status must be one of: ' + validStatuses.join(', '));
        }
        
        const validVisibilities = ['public', 'private', 'link_only'];
        if (!validVisibilities.includes(this.visibility)) {
            errors.push('Visibility must be one of: ' + validVisibilities.join(', '));
        }
        
        if (this.category && this.category.length > 50) {
            errors.push('Category must be less than 50 characters');
        }
        
        if (this.author && this.author.length > 100) {
            errors.push('Author must be less than 100 characters');
        }
        
        // 标签验证
        if (this.tags && Array.isArray(this.tags)) {
            if (this.tags.length > 10) {
                errors.push('Maximum 10 tags allowed');
            }
            
            for (const tag of this.tags) {
                if (typeof tag !== 'string' || tag.length > 30) {
                    errors.push('Each tag must be a string with less than 30 characters');
                    break;
                }
            }
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
            status: this.status,
            visibility: this.visibility,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }

    /**
     * 转换为 Supabase 数据库格式
     * @returns {Object} Supabase 格式的数据对象
     */
    toSupabaseFormat() {
        return {
            id: this.id,
            title: this.title,
            content: this.content,
            excerpt: this.excerpt,
            category: this.category,
            tags: this.tags,
            author: this.author,
            publish_date: this.publishDate,
            last_modified: this.lastModified,
            status: this.status,
            visibility: this.visibility,
            created_at: this.createdAt,
            updated_at: new Date().toISOString() // 总是使用当前时间作为更新时间
        };
    }

    /**
     * 从 Supabase 数据库格式创建 Article 对象
     * @param {Object} data - Supabase 格式的数据
     * @returns {Article} Article 实例
     */
    static fromSupabaseFormat(data) {
        return new Article({
            id: data.id,
            title: data.title,
            content: data.content,
            excerpt: data.excerpt,
            category: data.category,
            tags: data.tags || [],
            author: data.author,
            publishDate: data.publish_date,
            lastModified: data.last_modified,
            status: data.status,
            visibility: data.visibility,
            createdAt: data.created_at,
            updatedAt: data.updated_at
        });
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