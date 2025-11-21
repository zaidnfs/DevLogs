// Admin Panel JavaScript for Managing Blog Posts and Projects

let posts = [];
let projects = [];
let editingPostId = null;
let currentMode = 'posts'; // 'posts' or 'projects'

// Load data from JSON file or localStorage
async function loadData() {
    try {
        // Try to fetch from file first (source of truth)
        const response = await fetch('data/posts.json');
        if (response.ok) {
            const data = await response.json();
            posts = data.posts || [];
            projects = data.projects || [];
            console.log('Loaded data from file');
        } else {
            throw new Error('File not found');
        }
    } catch (error) {
        console.log('Could not load from file, checking localStorage...', error);
        // Fallback to localStorage if file load fails (e.g. first run or local dev without server)
        const savedPosts = localStorage.getItem('blogPosts');
        const savedProjects = localStorage.getItem('blogProjects');

        if (savedPosts) posts = JSON.parse(savedPosts);
        if (savedProjects) projects = JSON.parse(savedProjects);
    }

    displayItems();
}

// Save data to localStorage (Working Copy)
function saveData() {
    localStorage.setItem('blogPosts', JSON.stringify(posts));
    localStorage.setItem('blogProjects', JSON.stringify(projects));
}

// Download data as JSON file
function downloadData() {
    const data = {
        posts: posts,
        projects: projects
    };

    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = "posts.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showAlert('File downloaded! Save it to your "data" folder to publish.', 'success');
}

// Copy data to clipboard
async function copyData() {
    const data = {
        posts: posts,
        projects: projects
    };

    const dataStr = JSON.stringify(data, null, 2);

    try {
        await navigator.clipboard.writeText(dataStr);
        showAlert('Data copied to clipboard! Open data/posts.json and paste it.', 'success');
    } catch (err) {
        console.error('Failed to copy:', err);
        // Fallback for older browsers or non-secure contexts
        const textArea = document.createElement("textarea");
        textArea.value = dataStr;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        showAlert('Data copied to clipboard! Open data/posts.json and paste it.', 'success');
    }
}

// View raw data manually
function viewRawData() {
    const data = {
        posts: posts,
        projects: projects
    };
    const dataStr = JSON.stringify(data, null, 2);

    const container = document.getElementById('raw-data-container');
    const textarea = document.getElementById('raw-data-textarea');

    if (!container || !textarea) {
        console.error('Raw data container not found');
        return;
    }

    textarea.value = dataStr;
    container.classList.remove('hidden');
    textarea.select();

    // Scroll to it
    container.scrollIntoView({ behavior: 'smooth' });

    showAlert('Raw data generated below. Copy it manually.', 'success');
}

// Switch between posts and projects
function switchMode(mode) {
    currentMode = mode;
    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-mode="${mode}"]`).classList.add('active');
    displayItems();
}

// Display all items based on current mode
function displayItems() {
    const container = document.getElementById('posts-container');
    const items = currentMode === 'posts' ? posts : projects;
    const itemType = currentMode === 'posts' ? 'Post' : 'Project';

    if (items.length === 0) {
        container.innerHTML = `<p style="color: var(--text-muted); text-align: center;">No ${currentMode} yet. Create your first ${itemType.toLowerCase()}!</p>`;
        return;
    }

    container.innerHTML = items.map(item => `
        <div class="post-item">
            <div class="post-info">
                <h3>${item.title}</h3>
                <p>${item.category || item.technologies || ''} • ${item.date}</p>
            </div>
            <div class="post-actions">
                <button class="btn-edit" onclick="editItem('${item.id}')">Edit</button>
                <button class="btn-delete" onclick="deleteItem('${item.id}')">Delete</button>
            </div>
        </div>
    `).join('');
}

// Show editor
function showEditor(shouldReset = true) {
    const editorTitle = document.getElementById('editor-title');
    const categoryLabel = document.getElementById('category-label');
    const liveUrlGroup = document.getElementById('live-url-group');

    editorTitle.textContent = currentMode === 'posts' ? 'Post Editor' : 'Project Editor';
    categoryLabel.textContent = currentMode === 'posts' ? 'Category' : 'Technologies';

    // Show/hide Live URL field based on mode
    if (currentMode === 'projects') {
        liveUrlGroup.style.display = 'block';
    } else {
        liveUrlGroup.style.display = 'none';
    }

    document.getElementById('editor-section').classList.remove('hidden');

    // Only reset form when creating new items, not when editing
    if (shouldReset) {
        document.getElementById('post-form').reset();
        document.getElementById('post-id').value = '';
        editingPostId = null;
    }

    window.scrollTo({ top: document.getElementById('editor-section').offsetTop - 100, behavior: 'smooth' });
}

// Hide editor
function hideEditor() {
    document.getElementById('editor-section').classList.add('hidden');
    document.getElementById('post-form').reset();
    editingPostId = null;
}

// Edit item
function editItem(id) {
    const items = currentMode === 'posts' ? posts : projects;
    const item = items.find(p => p.id === id);
    if (!item) return;

    document.getElementById('post-id').value = item.id;
    document.getElementById('post-title').value = item.title;
    document.getElementById('post-excerpt').value = item.excerpt;
    document.getElementById('post-banner').value = item.bannerUrl || '';
    document.getElementById('post-category').value = item.category || item.technologies || '';
    document.getElementById('post-content').value = item.content;

    // Handle Live URL for projects
    const liveUrlInput = document.getElementById('post-live-url');
    if (liveUrlInput && currentMode === 'projects') {
        liveUrlInput.value = item.liveUrl || '';
    }

    editingPostId = id;
    showEditor(false); // Don't reset the form when editing
}

// Delete item - NO CONFIRMATION NEEDED (Simplified for now)
function deleteItem(id) {
    console.log('Delete button clicked! ID:', id);
    console.log('Current mode:', currentMode);

    if (currentMode === 'posts') {
        console.log('Deleting from posts array');
        posts = posts.filter(p => p.id !== id);
    } else {
        console.log('Deleting from projects array');
        projects = projects.filter(p => p.id !== id);
    }

    console.log('After delete - posts:', posts);
    console.log('After delete - projects:', projects);

    saveData();
    displayItems();
    showAlert(`${currentMode === 'posts' ? 'Post' : 'Project'} deleted successfully!`, 'success');
}

// Show alert
function showAlert(message, type = 'success') {
    const container = document.getElementById('alert-container');
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    container.appendChild(alert);

    setTimeout(() => {
        alert.remove();
    }, 3000);
}

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Format date
function formatDate(date) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString('en-US', options);
}

// Handle form submission
document.getElementById('post-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const postId = document.getElementById('post-id').value;
    const title = document.getElementById('post-title').value;
    const excerpt = document.getElementById('post-excerpt').value;
    const bannerUrl = document.getElementById('post-banner').value;
    const categoryOrTech = document.getElementById('post-category').value;
    const content = document.getElementById('post-content').value;
    const liveUrl = document.getElementById('post-live-url').value;

    const itemData = {
        title,
        excerpt,
        bannerUrl,
        content,
        date: formatDate(new Date()),
        createdAt: new Date().toISOString()
    };

    if (currentMode === 'posts') {
        itemData.category = categoryOrTech;
    } else {
        itemData.technologies = categoryOrTech;
        if (liveUrl) itemData.liveUrl = liveUrl;
    }

    if (editingPostId) {
        // Update existing item
        const items = currentMode === 'posts' ? posts : projects;
        const itemIndex = items.findIndex(p => p.id === editingPostId);
        if (itemIndex !== -1) {
            items[itemIndex] = {
                ...items[itemIndex],
                ...itemData,
                updatedAt: new Date().toISOString()
            };
            showAlert(`${currentMode === 'posts' ? 'Post' : 'Project'} updated successfully!`, 'success');
        }
    } else {
        // Create new item
        const newItem = {
            id: generateId(),
            ...itemData
        };

        if (currentMode === 'posts') {
            posts.unshift(newItem);
        } else {
            projects.unshift(newItem);
        }

        showAlert(`${currentMode === 'posts' ? 'Post' : 'Project'} created successfully!`, 'success');
    }

    saveData();
    displayItems();
    hideEditor();
});

// Initialize
loadData();

// Expose functions to global scope
window.switchMode = switchMode;
window.showEditor = showEditor;
window.hideEditor = hideEditor;
window.editItem = editItem;
window.deleteItem = deleteItem;
window.downloadData = downloadData;
window.copyData = copyData;
window.viewRawData = viewRawData;
