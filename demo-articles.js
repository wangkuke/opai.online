/**
 * Demo Articles Creator
 * Creates sample articles for testing and demonstration
 */

function createDemoArticles() {
    if (!window.blogStorage) {
        console.error('BlogStorage not available');
        return;
    }

    const demoArticles = [
        {
            title: 'Welcome to OPAI Blog System',
            content: `
                <h2>Introduction</h2>
                <p>Welcome to the new OPAI blog system! This platform allows you to share your knowledge and insights about AI tools and technologies.</p>
                
                <h3>Features</h3>
                <ul>
                    <li><strong>Rich Text Editor</strong> - Create beautifully formatted articles</li>
                    <li><strong>Categories & Tags</strong> - Organize your content effectively</li>
                    <li><strong>Responsive Design</strong> - Looks great on all devices</li>
                    <li><strong>Multi-language Support</strong> - Available in English and Chinese</li>
                </ul>
                
                <h3>Getting Started</h3>
                <p>To create your first article, simply click the <em>"Publish"</em> button in the header and start writing!</p>
                
                <blockquote>
                    <p>"The best way to learn is to teach others." - Share your AI knowledge with the community!</p>
                </blockquote>
            `,
            category: 'Tutorial',
            tags: ['welcome', 'tutorial', 'getting-started'],
            author: 'OPAI Team',
            status: 'published'
        },
        {
            title: 'Top 5 AI Tools for Content Creation in 2025',
            content: `
                <h2>The Future of AI-Powered Content Creation</h2>
                <p>As we move into 2025, AI tools are revolutionizing how we create content. Here are the top 5 tools you should know about:</p>
                
                <h3>1. GPT-4 and Beyond</h3>
                <p>The latest language models continue to push the boundaries of what's possible in text generation and editing.</p>
                
                <h3>2. DALL-E 3 & Midjourney</h3>
                <p>Image generation has reached new heights with these powerful AI art tools.</p>
                
                <h3>3. Runway ML</h3>
                <p>Video generation and editing powered by AI is becoming more accessible than ever.</p>
                
                <h3>4. Eleven Labs</h3>
                <p>Voice synthesis and audio generation for podcasts and multimedia content.</p>
                
                <h3>5. Claude 3</h3>
                <p>Advanced reasoning and analysis capabilities for research and writing assistance.</p>
                
                <p><strong>Conclusion:</strong> These tools are not just changing how we work—they're expanding what's possible in creative expression.</p>
            `,
            category: 'Review',
            tags: ['AI tools', 'content creation', '2025', 'review'],
            author: 'AI Explorer',
            status: 'published'
        },
        {
            title: 'How to Use ChatGPT for Programming: A Complete Guide',
            content: `
                <h2>Leveraging AI for Better Code</h2>
                <p>ChatGPT has become an invaluable tool for developers. Here's how to use it effectively:</p>
                
                <h3>Code Generation</h3>
                <p>Ask ChatGPT to generate boilerplate code, functions, or even entire classes:</p>
                <pre><code>// Example: Generate a React component
"Create a React component for a user profile card with props for name, email, and avatar"</code></pre>
                
                <h3>Debugging Help</h3>
                <p>Paste your error messages and code snippets to get debugging assistance.</p>
                
                <h3>Code Review</h3>
                <p>Ask for feedback on your code structure, performance, and best practices.</p>
                
                <h3>Learning New Technologies</h3>
                <p>Use ChatGPT to explain complex concepts and provide learning roadmaps.</p>
                
                <h3>Best Practices</h3>
                <ol>
                    <li>Be specific in your requests</li>
                    <li>Provide context about your project</li>
                    <li>Always review and test generated code</li>
                    <li>Ask for explanations to learn, not just solutions</li>
                </ol>
            `,
            category: 'Tutorial',
            tags: ['ChatGPT', 'programming', 'AI coding', 'tutorial'],
            author: 'Code Master',
            status: 'published'
        }
    ];

    let successCount = 0;
    
    demoArticles.forEach((articleData, index) => {
        try {
            const article = new Article(articleData);
            const result = window.blogStorage.saveArticle(article);
            
            if (result.success) {
                successCount++;
                console.log(`✓ Created demo article: ${article.title}`);
            } else {
                console.error(`✗ Failed to create article: ${result.error}`);
            }
        } catch (error) {
            console.error(`✗ Error creating demo article ${index + 1}:`, error);
        }
    });

    console.log(`Demo articles created: ${successCount}/${demoArticles.length}`);
    
    // Refresh the page to show new articles
    if (window.blogCards) {
        window.blogCards.refresh();
    }
    
    return successCount;
}

// Auto-create demo articles if none exist
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (window.blogStorage) {
            const existingArticles = window.blogStorage.getArticles();
            if (existingArticles.length === 0) {
                console.log('No articles found, creating demo articles...');
                createDemoArticles();
            }
        }
    }, 2000);
});

// Export for manual use
window.createDemoArticles = createDemoArticles;