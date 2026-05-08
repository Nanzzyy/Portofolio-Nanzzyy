// ═══════════════════════════════════════════
// Admin Panel JS — Supabase CRUD
// ═══════════════════════════════════════════
const SUPABASE_URL = 'https://yomlvkdrpzgliulerxxc.supabase.co';
const SUPABASE_KEY = 'sb_publishable_VTJlxgl9WEx0PxxFZXRekw_Fi7FZjg5';
const sbClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Auth check
if (sessionStorage.getItem('admin_auth') !== 'true') {
    window.location.href = '/login.html';
}

function logout() {
    sessionStorage.removeItem('admin_auth');
    window.location.href = '/login.html';
}

// ═══════════════════════════════════════════
// Load Projects
// ═══════════════════════════════════════════
async function loadAdminProjects() {
    const container = document.getElementById('admin-projects');
    const loading = document.getElementById('admin-loading');
    const countEl = document.getElementById('project-count');

    try {
        const { data: projects, error } = await sbClient
            .from('projects')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (loading) loading.remove();

        countEl.textContent = `Total: ${(projects || []).length}`;

        if (!projects || projects.length === 0) {
            container.innerHTML = `
                <div class="py-20 text-center border border-dashed border-border rounded-2xl bg-card">
                    <div class="w-16 h-16 mx-auto rounded-full bg-[#F3F3F3] flex items-center justify-center mb-4 border border-border">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-text-muted/40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/></svg>
                    </div>
                    <h3 class="text-lg font-bold text-text mb-1">No Projects Yet</h3>
                    <p class="text-text-muted text-sm">Add your first project using the form.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = projects.map(project => {
            const techTags = (project.tech_stack || []).map(t =>
                `<span class="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-[#F3F3F3] border border-border text-text-muted">${t}</span>`
            ).join('');

            return `
            <div class="card p-5 flex flex-col sm:flex-row gap-5 hover:shadow-md transition-shadow items-start sm:items-center">
                ${project.image_url 
                    ? `<img src="${project.image_url}" class="w-full sm:w-36 aspect-video object-cover rounded-xl border border-border" alt="${project.title}">` 
                    : `<div class="w-full sm:w-36 aspect-video rounded-xl bg-[#F3F3F3] flex items-center justify-center border border-dashed border-border">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-border" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                    </div>`
                }
                <div class="flex-1 min-w-0">
                    <h3 class="text-base font-bold text-text mb-1 truncate">${project.title}</h3>
                    <p class="text-sm text-text-muted mb-3 line-clamp-1">${project.description || ''}</p>
                    <div class="flex flex-wrap gap-1.5">${techTags}</div>
                </div>
                <div class="flex sm:flex-col gap-2 w-full sm:w-auto shrink-0">
                    <button onclick="deleteProject('${project.id}')" class="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-card border border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300 transition-colors text-xs font-bold flex items-center justify-center gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        Delete
                    </button>
                </div>
            </div>`;
        }).join('');

    } catch (err) {
        console.error('Failed to load projects:', err);
        if (loading) loading.remove();
        container.innerHTML = `<p class="text-center text-text-muted py-8">Failed to load projects.</p>`;
    }
}

// ═══════════════════════════════════════════
// Add Project
// ═══════════════════════════════════════════
const addForm = document.getElementById('add-project-form');
if (addForm) {
    addForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const form = e.target;
        const saveBtn = document.getElementById('save-btn');
        const statusEl = document.getElementById('form-status');

        const title = form.title.value.trim();
        const description = form.description.value.trim();
        const language = form.language.value.trim();
        const preview_url = form.preview_url.value.trim();
        const website_url = form.website_url.value.trim();

        const tech_stack = language ? language.split(',').map(s => s.trim()).filter(Boolean) : [];

        saveBtn.disabled = true;
        saveBtn.innerHTML = '<svg class="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg> Saving...';

        try {
            const { error } = await sbClient.from('projects').insert([{
                title,
                description,
                tech_stack,
                image_url: preview_url || null,
                live_url: website_url || null,
                status: 'published'
            }]);

            if (error) throw error;

            statusEl.textContent = '✓ Project saved successfully!';
            statusEl.className = 'text-center text-sm font-medium text-green-600';
            statusEl.classList.remove('hidden');
            form.reset();
            loadAdminProjects();
            lucide.createIcons();

            setTimeout(() => statusEl.classList.add('hidden'), 3000);
        } catch (err) {
            console.error('Save error:', err);
            statusEl.textContent = '✗ Failed to save project. ' + (err.message || '');
            statusEl.className = 'text-center text-sm font-medium text-red-500';
            statusEl.classList.remove('hidden');
        } finally {
            saveBtn.disabled = false;
            saveBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/></svg> Save Project';
        }
    });
}

// ═══════════════════════════════════════════
// Delete Project
// ═══════════════════════════════════════════
async function deleteProject(id) {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
        const { error } = await sbClient.from('projects').delete().eq('id', id);
        if (error) throw error;
        loadAdminProjects();
        lucide.createIcons();
    } catch (err) {
        console.error('Delete error:', err);
        alert('Failed to delete project.');
    }
}

// ═══════════════════════════════════════════
// Init
// ═══════════════════════════════════════════
loadAdminProjects();
