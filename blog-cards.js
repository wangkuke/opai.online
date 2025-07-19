/**
 * Blog Article Cards Component
 * Handles dynamic generation and display of article cards
 */

class BlogCards {
    constructor(containerSelector = '.articles-grid') {
        this.container = document.querySelector(containerSelector);
        this.articles = [];
        this.init();
    }

    init() {
        if (!this.container) {
            console.warn('Article cards container not found');
            return;
        }
        
        this.loadArticles();
        this.renderCards();
    }

    async loadArticles() {
        const storage = window.blogStorage;
        if (!storage) {
            console.warn('No storage service available');
            return;
        }

        try {
            // Load published articles only
            this.articles = await storage.getArticles({ 
                status: 'published',
                limit: 12 // Limit to 12 articles for performance
            });
        } catch (error) {
            console.error('Error loading articles:', error);
            this.articles = [];
        }
    }

    renderCards() {
        if (!this.container) return;

        // Clear existing content
        this.container.innerHTML = '';

        if (this.articles.length === 0) {
            this.renderEmptyState();
            return;
        }

        // Render article cards
        this.articles.forEach(article => {
            const cardElement = this.createCardElement(article);
            this.container.appendChild(cardElement);
        });
    }

    createCardElement(article) {
        const card = document.createElement('div');
        card.className = 'article-card';
        card.setAttribute('data-article-id', article.id);
        
        // Format date
        const publishDate = this.formatDate(article.publishDate);
        
        // Truncate excerpt if too long
        const excerpt = this.truncateText(article.excerpt, 100);
        
        // Get author initials
        const authorInitials = this.getAuthorInitials(article.author);

        card.innerHTML = `
            <div class="article-image">
                <div class="article-overlay">
                    <i class="fas fa-arrow-right"></i>
                </div>
                <div class="article-category">${this.escapeHtml(article.category)}</div>
            </div>
            <div class="article-content">
                <h3 class="article-title">${this.escapeHtml(article.title)}</h3>
                <p class="article-excerpt">${this.escapeHtml(excerpt)}</p>
                <div class="article-meta">
                    <div class="article-author">
                        <div class="author-avatar">${authorInitials}</div>
                        <span>${this.escapeHtml(article.author)}</span>
                    </div>
                    <div class="article-date">${publishDate}</div>
                </div>
            </div>
        `;

        // Add click handler
        card.addEventListener('click', () => {
            this.navigateToArticle(article.id);
        });

        // Add hover effects
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-8px)';
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
        });

        return card;
    }

    renderEmptyState() {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        emptyState.innerHTML = `
            <div style="
                grid-column: 1 / -1;
                text-align: center;
                padding: 60px 20px;
                color: var(--gray);
                background: var(--card-bg);
                border-radius: 15px;
                backdrop-filter: blur(5px);
                border: 1px solid var(--glass-border);
            ">
                <i class="fas fa-newspaper" style="font-size: 3rem; margin-bottom: 20px; opacity: 0.5;"></i>
                <h3 style="margin-bottom: 10px;" data-i18n="blog.no_articles">No articles available</h3>
                <p style="margin-bottom: 20px;">Be the first to share your knowledge with the community!</p>
                <a href="publish.html" class="btn btn-primary">
                    <i class="fas fa-plus"></i>
                    <span data-i18n="blog.create_article">Create New Article</span>
                </a>
            </div>
        `;
        this.container.appendChild(emptyState);
    }

    navigateToArticle(articleId) {
        // Navigate to article detail page using hash
        window.location.href = `article.html#${articleId}`;
    }

    formatDate(dateString) {
        try {
            const date = new Date(dateString);
            const now = new Date();
            const diffTime = Math.abs(now - date);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                return window.i18n ? window.i18n.t('blog.yesterday', 'Yesterday') : 'Yesterday';
            } else if (diffDays < 7) {
                return `${diffDays} days ago`;
            } else if (diffDays < 30) {
                const weeks = Math.floor(diffDays / 7);
                return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
            } else {
                // Format as readable date
                return date.toLocaleDateString(
                    window.i18n ? window.i18n.getCurrentLanguage() : 'en',
                    { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                    }
                );
            }
        } catch (error) {
            console.error('Error formatting date:', error);
            return 'Recently';
        }
    }

    truncateText(text, maxLength) {
        if (!text || text.length <= maxLength) {
            return text || '';
        }
        return text.substring(0, maxLength).trim() + '...';
    }

    getAuthorInitials(authorName) {
        if (!authorName) return 'A';
        
        const names = authorName.trim().split(' ');
        if (names.length === 1) {
            return names[0].charAt(0).toUpperCase();
        } else {
            return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
        }
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Public methods for external use
    async refresh() {
        await this.loadArticles();
        this.renderCards();
    }

    addArticle(article) {
        if (article.status === 'published') {
            this.articles.unshift(article); // Add to beginning
            this.renderCards();
        }
    }

    removeArticle(articleId) {
        this.articles = this.articles.filter(article => article.id !== articleId);
        this.renderCards();
    }

    updateArticle(updatedArticle) {
        const index = this.articles.findIndex(article => article.id === updatedArticle.id);
        if (index !== -1) {
            if (updatedArticle.status === 'published') {
                this.articles[index] = updatedArticle;
            } else {
                // Remove if no longer published
                this.articles.splice(index, 1);
            }
            this.renderCards();
        }
    }

    // Filter articles by category
    async filterByCategory(category) {
        const storage = window.blogStorage;
        if (!storage) return;
        
        try {
            if (category === 'all') {
                this.articles = await storage.getArticles({ 
                    status: 'published',
                    limit: 12 
                });
            } else {
                this.articles = await storage.getArticles({ 
                    status: 'published',
                    category: category,
                    limit: 12 
                });
            }
            
            this.renderCards();
        } catch (error) {
            console.error('Error filtering articles:', error);
        }
    }

    // Search articles
    async searchArticles(query) {
        const storage = window.blogStorage;
        if (!storage || !query.trim()) {
            await this.loadArticles();
            this.renderCards();
            return;
        }

        try {
            const allArticles = await storage.getArticles({ status: 'published' });
            const searchTerm = query.toLowerCase().trim();
            
            this.articles = allArticles.filter(article => {
                return article.title.toLowerCase().includes(searchTerm) ||
                       article.excerpt.toLowerCase().includes(searchTerm) ||
                       article.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
                       article.category.toLowerCase().includes(searchTerm);
            });

            this.renderCards();
        } catch (error) {
            console.error('Error searching articles:', error);
        }
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Wait for storage to be ready
    const initializeBlogCards = () => {
        if (document.querySelector('.articles-grid')) {
            window.blogCards = new BlogCards();
            console.log('Blog cards system initialized');
        }
    };

    // Listen for storage ready event
    window.addEventListener('blogStorageReady', () => {
        setTimeout(initializeBlogCards, 100);
    });

    // Fallback: initialize after delay if storage is already ready
    setTimeout(() => {
        if ((window.blogStorageManager && window.blogStorageManager.isReady()) || window.blogStorage) {
            initializeBlogCards();
        }
    }, 1500);
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BlogCards };
} else {
    window.BlogCards = BlogCards;
}