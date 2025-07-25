/**
 * Blog Article Cards Component
 * Handles dynamic generation and display of article cards
 */

class BlogCards {
    constructor(containerSelector = '.articles-grid', options = {}) {
        this.container = document.querySelector(containerSelector);
        this.articles = [];
        this.options = {
            maxArticles: options.maxArticles || null, // null means no limit
            showViewMore: options.showViewMore || false,
            viewMoreUrl: options.viewMoreUrl || 'articles.html',
            ...options
        };
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
            // 尝试直接创建SupabaseStorage实例
            if (window.SupabaseStorage) {
                window.blogStorage = new SupabaseStorage();
                await window.blogStorage.initialize();
                console.log('Created SupabaseStorage instance');
                this.loadArticles(); // 重新加载
            }
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

        // Determine how many articles to show
        const articlesToShow = this.options.maxArticles ? 
            this.articles.slice(0, this.options.maxArticles) : 
            this.articles;

        // Render article cards
        articlesToShow.forEach(article => {
            const cardElement = this.createCardElement(article);
            this.container.appendChild(cardElement);
        });

        // Add "more" link to section title if needed
        if (this.options.showViewMore && this.articles.length > articlesToShow.length) {
            this.addMoreLinkToTitle();
        }
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

        // Extract first image from article content
        const firstImage = this.extractFirstImage(article.content);

        card.innerHTML = `
            <div class="article-image">
                ${firstImage ? `<img src="${this.escapeHtml(firstImage)}" alt="${this.escapeHtml(article.title)}" style="width: 100%; height: 100%; object-fit: cover;">` : ''}
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

    // 新增方法：从文章内容中提取第一张图片
    extractFirstImage(content) {
        if (!content) return null;
        
        // 匹配img标签的src属性
        const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/i;
        const match = content.match(imgRegex);
        
        if (match && match[1]) {
            return match[1];
        }
        
        // 如果没有找到img标签，尝试匹配其他图片格式
        const urlRegex = /https?:\/\/[^\s<>"']+\.(jpg|jpeg|png|gif|webp|svg)(\?[^\s<>"']*)?/i;
        const urlMatch = content.match(urlRegex);
        
        if (urlMatch) {
            return urlMatch[0];
        }
        
        return null;
    }

    renderEmptyState() {
        // Leave the container completely empty when no articles exist
        // This ensures the articles-grid area remains blank
        console.log('No articles found - leaving articles grid empty');
    }

    navigateToArticle(articleId) {
        // Navigate to article detail page using URL parameter instead of hash
        window.location.href = `article.html?id=${articleId}`;
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

    addMoreLinkToTitle() {
        // Find the section title for Latest Articles
        const sectionTitle = document.querySelector('.section-title');
        if (!sectionTitle) return;

        // Check if more link already exists
        if (sectionTitle.querySelector('.more-link')) return;

        // Create more link
        const moreLink = document.createElement('a');
        moreLink.href = this.options.viewMoreUrl;
        moreLink.className = 'more-link';
        moreLink.textContent = 'more';
        moreLink.style.cssText = `
            margin-left: auto;
            color: var(--primary);
            text-decoration: none;
            font-size: 0.9rem;
            font-weight: 500;
            transition: var(--transition);
            padding: 5px 10px;
            border-radius: 15px;
            background: rgba(67, 97, 238, 0.1);
        `;

        // Add hover effect
        moreLink.addEventListener('mouseenter', () => {
            moreLink.style.background = 'var(--primary)';
            moreLink.style.color = 'white';
            moreLink.style.transform = 'translateY(-1px)';
        });

        moreLink.addEventListener('mouseleave', () => {
            moreLink.style.background = 'rgba(67, 97, 238, 0.1)';
            moreLink.style.color = 'var(--primary)';
            moreLink.style.transform = 'translateY(0)';
        });

        // Add to section title
        sectionTitle.appendChild(moreLink);
    }

    renderViewMoreButton() {
        const viewMoreContainer = document.createElement('div');
        viewMoreContainer.className = 'view-more-container';
        viewMoreContainer.style.cssText = `
            grid-column: 1 / -1;
            text-align: center;
            margin-top: 20px;
        `;
        
        const viewMoreBtn = document.createElement('a');
        viewMoreBtn.href = this.options.viewMoreUrl;
        viewMoreBtn.className = 'btn btn-primary view-more-btn';
        viewMoreBtn.style.cssText = `
            display: inline-flex;
            align-items: center;
            padding: 12px 24px;
            background: var(--primary);
            color: white;
            text-decoration: none;
            border-radius: 25px;
            font-weight: 600;
            transition: var(--transition);
            box-shadow: 0 4px 15px rgba(67, 97, 238, 0.25);
        `;
        
        viewMoreBtn.innerHTML = `
            <i class="fas fa-arrow-right" style="margin-right: 8px;"></i>
            <span data-i18n="blog.view_more">查看更多文章</span>
        `;
        
        // Add hover effect
        viewMoreBtn.addEventListener('mouseenter', () => {
            viewMoreBtn.style.transform = 'translateY(-2px)';
            viewMoreBtn.style.boxShadow = '0 6px 20px rgba(67, 97, 238, 0.4)';
            viewMoreBtn.style.background = 'var(--secondary)';
        });
        
        viewMoreBtn.addEventListener('mouseleave', () => {
            viewMoreBtn.style.transform = 'translateY(0)';
            viewMoreBtn.style.boxShadow = '0 4px 15px rgba(67, 97, 238, 0.25)';
            viewMoreBtn.style.background = 'var(--primary)';
        });
        
        viewMoreContainer.appendChild(viewMoreBtn);
        this.container.appendChild(viewMoreContainer);
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
    console.log('DOM loaded, initializing blog cards...');
    
    // Wait for storage to be ready
    const initializeBlogCards = () => {
        const articlesGrid = document.querySelector('.articles-grid');
        if (!articlesGrid) {
            console.log('Articles grid not found');
            return;
        }

        console.log('Articles grid found, creating BlogCards instance...');
        
        // Check if we're on the main page or articles page
        const isMainPage = window.location.pathname.endsWith('index.html') || 
                          window.location.pathname === '/' || 
                          window.location.pathname.endsWith('/');
        const isArticlesPage = window.location.pathname.endsWith('articles.html');
        
        console.log('Page detection:', { isMainPage, isArticlesPage, pathname: window.location.pathname });
        
        if (isMainPage) {
            // On main page: show only 4 articles with "View More" button
            window.blogCards = new BlogCards('.articles-grid', {
                maxArticles: 4,
                showViewMore: true,
                viewMoreUrl: 'articles.html'
            });
            console.log('Main page blog cards initialized');
        } else if (isArticlesPage) {
            // On articles page: show all articles
            window.blogCards = new BlogCards('.articles-grid', {
                maxArticles: null,
                showViewMore: false
            });
            console.log('Articles page blog cards initialized');
        } else {
            // Default behavior for other pages
            window.blogCards = new BlogCards();
            console.log('Default blog cards initialized');
        }
    };

    // Multiple initialization strategies to ensure it works
    
    // Strategy 1: Listen for storage ready event
    window.addEventListener('blogStorageReady', () => {
        console.log('Storage ready event received');
        setTimeout(initializeBlogCards, 100);
    });

    // Strategy 2: Check periodically if storage is ready
    let initAttempts = 0;
    const checkAndInit = () => {
        initAttempts++;
        console.log(`Init attempt ${initAttempts}`);
        
        if ((window.blogStorageManager && window.blogStorageManager.isReady()) || window.blogStorage) {
            console.log('Storage is ready, initializing...');
            initializeBlogCards();
        } else if (initAttempts < 10) {
            console.log('Storage not ready, retrying...');
            setTimeout(checkAndInit, 500);
        } else {
            console.log('Max init attempts reached, forcing initialization...');
            initializeBlogCards();
        }
    };
    
    // Start checking after a short delay
    setTimeout(checkAndInit, 500);
    
    // Strategy 3: Force refresh if no articles loaded after some time
    setTimeout(() => {
        if (window.blogCards) {
            console.log('Checking if articles loaded...', window.blogCards.articles.length);
            if (window.blogCards.articles.length === 0) {
                console.log('No articles loaded, attempting to refresh...');
                window.blogCards.refresh();
            }
        } else {
            console.log('BlogCards not initialized, trying again...');
            initializeBlogCards();
        }
    }, 3000);
    
    // Strategy 4: Additional check after longer delay
    setTimeout(() => {
        if (window.blogCards) {
            console.log('Final check - articles count:', window.blogCards.articles.length);
            window.blogCards.refresh();
        }
    }, 5000);
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BlogCards };
} else {
    window.BlogCards = BlogCards;
}