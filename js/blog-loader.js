// Blog and Projects page - Load and display content dynamically

async function loadBlogPosts() {
    const postsContainer = document.getElementById('blog-posts-grid');
    if (!postsContainer) return;

    try {
        const response = await fetch('data/posts.json');
        if (!response.ok) throw new Error('Failed to load posts');

        const data = await response.json();
        const posts = data.posts || [];

        if (posts.length === 0) {
            postsContainer.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 4rem 0;">
                    <h2 style="color: var(--text-secondary); margin-bottom: 1rem;">No posts yet</h2>
                    <p style="color: var(--text-muted);">Check back soon for new content!</p>
                    <a href="admin.html" class="card-link" style="margin-top: 1rem;">Create Your First Post →</a>
                </div>
            `;
            return;
        }

        // Array of gradient colors to cycle through
        const gradients = [
            'linear-gradient(135deg, #3b82f6, #1d4ed8)', // Blue
            'linear-gradient(135deg, #8b5cf6, #6d28d9)', // Purple
            'linear-gradient(135deg, #10b981, #059669)', // Green
            'linear-gradient(135deg, #f59e0b, #d97706)', // Orange
            'linear-gradient(135deg, #ef4444, #b91c1c)', // Red
            'linear-gradient(135deg, #06b6d4, #0891b2)', // Cyan
        ];

        postsContainer.innerHTML = posts.map((post, index) => `
            <article class="card reveal-squeeze">
                <div class="card-image" style="background: ${gradients[index % gradients.length]};"></div>
                <div class="card-content">
                    <div class="card-date">${post.date}</div>
                    <h3 class="card-title">${post.title}</h3>
                    <p class="card-excerpt">${post.excerpt}</p>
                    <a href="post.html?id=${post.id}" class="card-link">Read Article →</a>
                </div>
            </article>
        `).join('');

        // Re-initialize scroll animations for new elements
        if (typeof initScrollAnimations === 'function') {
            initScrollAnimations();
        }
    } catch (error) {
        console.error('Error loading posts:', error);
        postsContainer.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 4rem 0;">
                <p style="color: var(--text-muted);">Unable to load posts. Please try again later.</p>
            </div>
        `;
    }
}

async function loadProjects() {
    const projectsContainer = document.getElementById('projects-grid');
    if (!projectsContainer) return;

    try {
        const response = await fetch('data/posts.json');
        if (!response.ok) throw new Error('Failed to load projects');

        const data = await response.json();
        const projects = data.projects || [];

        if (projects.length === 0) {
            projectsContainer.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 4rem 0;">
                    <h2 style="color: var(--text-secondary); margin-bottom: 1rem;">No projects yet</h2>
                    <p style="color: var(--text-muted);">Check back soon for new projects!</p>
                    <a href="admin.html" class="card-link" style="margin-top: 1rem;">Add Your First Project →</a>
                </div>
            `;
            return;
        }

        // Array of gradient colors to cycle through for projects
        const gradients = [
            'linear-gradient(135deg, #ef4444, #b91c1c)', // Red
            'linear-gradient(135deg, #3b82f6, #2563eb)', // Blue
            'linear-gradient(135deg, #10b981, #059669)', // Green
            'linear-gradient(135deg, #8b5cf6, #7c3aed)', // Purple
            'linear-gradient(135deg, #f59e0b, #d97706)', // Orange
            'linear-gradient(135deg, #06b6d4, #0891b2)', // Cyan
        ];

        projectsContainer.innerHTML = projects.map((project, index) => `
            <article class="card reveal-squeeze">
                <div class="card-image" style="background: ${gradients[index % gradients.length]};"></div>
                <div class="card-content">
                    <div class="card-date">${project.date}</div>
                    <h3 class="card-title">${project.title}</h3>
                    <p class="card-excerpt">${project.excerpt}</p>
                    <div class="skills" style="margin-top: auto; margin-bottom: var(--spacing-sm);">
                        ${project.technologies ? project.technologies.split(',').map(tech =>
            `<span class="skill-tag skill-tag-small">${tech.trim()}</span>`
        ).join('') : ''}
                    </div>
                    <a href="project-detail.html?id=${project.id}" class="card-link">View Project →</a>
                </div>
            </article>
        `).join('');

        // Re-initialize scroll animations for new elements
        if (typeof initScrollAnimations === 'function') {
            initScrollAnimations();
        }
    } catch (error) {
        console.error('Error loading projects:', error);
        projectsContainer.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 4rem 0;">
                <p style="color: var(--text-muted);">Unable to load projects. Please try again later.</p>
            </div>
        `;
    }
}

// Convert Markdown to HTML with URL support
function markdownToHtml(markdown) {
    return markdown
        // Headers
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h2>$1</h2>')
        // Links [text](url)
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener" style="color: var(--accent-primary); text-decoration: underline;">$1</a>')
        // Bold and italic
        .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        // Code blocks
        .replace(/`([^`]+)`/g, '<code style="background: rgba(90, 79, 207, 0.1); padding: 0.2rem 0.4rem; border-radius: 4px; font-family: monospace;">$1</code>')
        // Lists
        .replace(/^\- (.+)$/gim, '<li>$1</li>')
        .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
        // Paragraphs
        .replace(/\n\n/g, '</p><p>');
}

// Load single post
async function loadSinglePost() {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');

    if (!postId) return;

    try {
        const response = await fetch('data/posts.json');
        if (!response.ok) throw new Error('Failed to load post');

        const data = await response.json();
        const posts = data.posts || [];
        const post = posts.find(p => p.id === postId);

        if (!post) {
            showPostNotFound();
            return;
        }

        // Update page title
        document.title = `${post.title} | DevLogs by Z`;

        // Update post header
        const postHeader = document.querySelector('.post-header');
        if (postHeader) {
            postHeader.innerHTML = `
                <span class="post-meta">${post.category}</span>
                <h1 class="post-title">${post.title}</h1>
                <p style="color: var(--text-secondary); max-width: 700px; margin: 0 auto;">${post.excerpt}</p>
                <p style="color: var(--text-muted); margin-top: 1rem; font-size: 0.875rem;">${post.date}</p>
            `;
        }

        // Update post content
        const postContent = document.querySelector('.post-content');
        if (postContent) {
            const htmlContent = markdownToHtml(post.content);
            postContent.innerHTML = `<p>${htmlContent}</p>`;
        }
    } catch (error) {
        console.error('Error loading post:', error);
        showPostNotFound();
    }
}

async function loadSingleProject() {
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('id');

    if (!projectId) return;

    try {
        const response = await fetch('data/posts.json');
        if (!response.ok) throw new Error('Failed to load project');

        const data = await response.json();
        const projects = data.projects || [];
        const project = projects.find(p => p.id === projectId);

        if (!project) {
            showProjectNotFound();
            return;
        }

        // Update page title
        document.title = `${project.title} | DevLogs by Z`;

        // Update project header
        const projectHeader = document.querySelector('.post-header');
        if (projectHeader) {
            projectHeader.innerHTML = `
                <span class="post-meta">Featured Project</span>
                <h1 class="post-title">${project.title}</h1>
                <p style="color: var(--text-secondary); max-width: 700px; margin: 0 auto;">${project.excerpt}</p>
            `;
        }

        // Update project content
        const projectContent = document.querySelector('.post-content');
        if (projectContent) {
            const htmlContent = markdownToHtml(project.content);
            projectContent.innerHTML = `
                <div class="post-image"></div>
                ${htmlContent}
                <div style="margin-top: var(--spacing-lg);">
                    <a href="projects.html" class="btn btn-primary">← Back to Projects</a>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading project:', error);
        showProjectNotFound();
    }
}

function showPostNotFound() {
    const postHeader = document.querySelector('.post-header');
    const postContent = document.querySelector('.post-content');

    if (postHeader) {
        postHeader.innerHTML = '<h1 class="post-title">Post Not Found</h1>';
    }

    if (postContent) {
        postContent.innerHTML = `
            <p>Sorry, this post doesn't exist or has been removed.</p>
            <p><a href="blog.html" class="card-link">← Back to Blog</a></p>
        `;
    }
}

function showProjectNotFound() {
    const projectHeader = document.querySelector('.post-header');
    const projectContent = document.querySelector('.post-content');

    if (projectHeader) {
        projectHeader.innerHTML = '<h1 class="post-title">Project Not Found</h1>';
    }

    if (projectContent) {
        projectContent.innerHTML = `
            <p>Sorry, this project doesn't exist or has been removed.</p>
            <p><a href="projects.html" class="card-link">← Back to Projects</a></p>
        `;
    }
}

// Initialize based on page
if (document.getElementById('blog-posts-grid')) {
    loadBlogPosts();
}

if (document.getElementById('projects-grid')) {
    loadProjects();
}

if (window.location.pathname.includes('post.html')) {
    loadSinglePost();
}

if (window.location.pathname.includes('project-detail.html')) {
    loadSingleProject();
}
