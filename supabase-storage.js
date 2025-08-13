/**
 * Supabase Storage Service
 */

class SupabaseStorage {
    constructor() {
        this.publicClient = null;
        this.adminClient = null;
        this.isInitialized = false;
        this.initializationPromise = null;
    }

    static isSupabaseAvailable() {
        return typeof window !== 'undefined' && 
               typeof window.supabase !== 'undefined' && 
               typeof window.createPublicSupabaseClient !== 'undefined';
    }

    async initialize() {
        if (this.initializationPromise) {
            return this.initializationPromise;
        }

        this.initializationPromise = new Promise(async (resolve, reject) => {
            try {
                if (!SupabaseStorage.isSupabaseAvailable()) {
                    const maxWaitTime = 5000;
                    const checkInterval = 100;
                    let elapsedTime = 0;

                    while (!SupabaseStorage.isSupabaseAvailable() && elapsedTime < maxWaitTime) {
                        await new Promise(resolve => setTimeout(resolve, checkInterval));
                        elapsedTime += checkInterval;
                    }

                    if (!SupabaseStorage.isSupabaseAvailable()) {
                        throw new Error('Supabase loading timeout');
                    }
                }

                this.publicClient = window.createPublicSupabaseClient();

                try {
                    this.adminClient = window.createAdminSupabaseClient();
                } catch (error) {
                    console.warn('Cannot create admin client:', error.message);
                }

                this.isInitialized = true;
                console.log('SupabaseStorage initialized successfully');
                resolve(true);
            } catch (error) {
                console.error('SupabaseStorage initialization failed:', error);
                reject(error);
            }
        });

        return this.initializationPromise;
    }

    ensureInitialized() {
        if (!this.isInitialized) {
            throw new Error('SupabaseStorage not initialized');
        }
    }

    async getArticle(id) {
        try {
            this.ensureInitialized();

            if (!id) {
                console.warn('Article ID is empty');
                return null;
            }

            const result = await (window.RetryHandler ? window.RetryHandler.withRetry(async () => {
                const { data, error } = await (window.RetryHandler ? window.RetryHandler.withTimeout(
                    this.publicClient
                        .from('articles')
                        .select('*')
                        .eq('id', id)
                        .single(),
                    10000
                ) : this.publicClient
                    .from('articles')
                    .select('*')
                    .eq('id', id)
                    .single());

                if (error) {
                    if (error.code === 'PGRST116') {
                        return null;
                    }
                    throw error;
                }

                return data;
            }, {
                maxRetries: 2,
                baseDelay: 500
            }) : await this.publicClient
                .from('articles')
                .select('*')
                .eq('id', id)
                .single());

            if (!result) {
                console.log('Article not found:', id);
                return null;
            }

            const article = window.Article ? window.Article.fromSupabaseFormat(result) : result;
            console.log('Article loaded successfully:', article.id || 'unknown');
            
            return article;

        } catch (error) {
            console.error('Error loading article:', error);
            
            const processedError = error.code && window.ErrorHandler ? 
                window.ErrorHandler.handleSupabaseError(error) : 
                (window.ErrorHandler ? window.ErrorHandler.handleNetworkError(error) : error);

            if (processedError.type === 'NETWORK' || processedError.type === 'TIMEOUT') {
                console.warn('Network issue loading article:', processedError.message || error.message);
                return null;
            }

            return null;
        }
    }

    async getArticles(options = {}) {
        try {
            this.ensureInitialized();

            const result = await (window.RetryHandler ? window.RetryHandler.withRetry(async () => {
                let query = this.publicClient
                    .from('articles')
                    .select('*');

                if (options.status) {
                    query = query.eq('status', options.status);
                }

                if (options.category) {
                    query = query.eq('category', options.category);
                }

                if (options.visibility) {
                    query = query.eq('visibility', options.visibility);
                }

                if (options.search) {
                    query = query.or(`title.ilike.%${options.search}%,content.ilike.%${options.search}%,excerpt.ilike.%${options.search}%`);
                }

                query = query.order('publish_date', { ascending: false });

                if (options.limit) {
                    query = query.limit(options.limit);
                }

                if (options.offset) {
                    query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
                }

                const { data, error } = await (window.RetryHandler ? window.RetryHandler.withTimeout(query, 12000) : query);

                if (error) {
                    throw error;
                }

                return data;
            }, {
                maxRetries: 2,
                baseDelay: 800
            }) : await (async () => {
                let query = this.publicClient
                    .from('articles')
                    .select('*');

                if (options.status) {
                    query = query.eq('status', options.status);
                }

                if (options.category) {
                    query = query.eq('category', options.category);
                }

                if (options.visibility) {
                    query = query.eq('visibility', options.visibility);
                }

                if (options.search) {
                    query = query.or(`title.ilike.%${options.search}%,content.ilike.%${options.search}%,excerpt.ilike.%${options.search}%`);
                }

                query = query.order('publish_date', { ascending: false });

                if (options.limit) {
                    query = query.limit(options.limit);
                }

                if (options.offset) {
                    query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
                }

                const { data, error } = await query;

                if (error) {
                    throw error;
                }

                return data;
            })());

            const articles = window.Article ? result.map(item => window.Article.fromSupabaseFormat(item)) : result;
            
            console.log(`Articles loaded successfully: ${articles.length} articles`);
            return articles;

        } catch (error) {
            console.error('Error loading articles:', error);
            return [];
        }
    }

    async checkConnection() {
        try {
            this.ensureInitialized();

            const { error } = await this.publicClient
                .from('articles')
                .select('count', { count: 'exact', head: true });

            return !error;
        } catch (error) {
            console.error('Connection check failed:', error);
            return false;
        }
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SupabaseStorage };
} else {
    window.SupabaseStorage = new SupabaseStorage();
}