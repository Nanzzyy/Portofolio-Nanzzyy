// ═══════════════════════════════════════════
// Admin Panel JS — Supabase CRUD (Secure)
// ═══════════════════════════════════════════
const SUPABASE_URL = 'https://yomlvkdrpzgliulerxxc.supabase.co';
const SUPABASE_KEY = 'sb_publishable_VTJlxgl9WEx0PxxFZXRekw_Fi7FZjg5';
const sbClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Auth check
async function checkAuth() {
    const { data: { session }, error } = await sbClient.auth.getSession();
    if (error || !session) {
        window.location.href = '/login.html';
        return;
    }
    // Authenticated, load initial data
    loadAdminProjects();
}

async function logout() {
    await sbClient.auth.signOut();
    window.location.href = '/login.html';
}

// ═══════════════════════════════════════════
// Navigation / Tabs
// ═══════════════════════════════════════════
function showTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.add('hidden'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(`tab-${tabName}`).classList.remove('hidden');
    document.getElementById(`tab-${tabName}-btn`).classList.add('active');

    // Load data based on tab
    if (tabName === 'projects') loadAdminProjects();
    if (tabName === 'skills') loadAdminSkills();
    if (tabName === 'profile') loadAdminProfile();
    if (tabName === 'messages') loadAdminMessages();
    
    lucide.createIcons();
}

// ═══════════════════════════════════════════
// Projects Management
// ═══════════════════════════════════════════
async function loadAdminProjects() {
    const container = document.getElementById('admin-projects');
    const countEl = document.getElementById('project-count');

    try {
        const { data: projects, error } = await sbClient
            .from('projects')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        countEl.textContent = `Total: ${(projects || []).length}`;

        if (!projects || projects.length === 0) {
            container.innerHTML = `<p class="py-10 text-center text-text-muted">No projects found.</p>`;
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
                    : `<div class="w-full sm:w-36 aspect-video rounded-xl bg-[#F3F3F3] flex items-center justify-center border border-dashed border-border"><i data-lucide="image" class="text-border"></i></div>`
                }
                <div class="flex-1 min-w-0">
                    <h3 class="text-base font-bold text-text mb-1 truncate">${project.title}</h3>
                    <p class="text-sm text-text-muted mb-3 line-clamp-1">${project.description || ''}</p>
                    <div class="flex flex-wrap gap-1.5">${techTags}</div>
                </div>
                <div class="flex sm:flex-col gap-2 w-full sm:w-auto shrink-0">
                    <button onclick="editProject('${project.id}')" class="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-card border border-border text-text hover:bg-gray-50 transition-colors text-xs font-bold flex items-center justify-center gap-1.5">
                        <i data-lucide="edit-3" class="w-3.5 h-3.5"></i> Edit
                    </button>
                    <button onclick="deleteProject('${project.id}')" class="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-card border border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300 transition-colors text-xs font-bold flex items-center justify-center gap-1.5">
                        <i data-lucide="trash-2" class="w-3.5 h-3.5"></i> Delete
                    </button>
                </div>
            </div>`;
        }).join('');
        lucide.createIcons();
    } catch (err) { console.error(err); }
}

async function editProject(id) {
    try {
        const { data, error } = await sbClient.from('projects').select('*').eq('id', id).single();
        if (error) throw error;

        const form = document.getElementById('add-project-form');
        form.id.value = data.id;
        form.title.value = data.title;
        form.description.value = data.description;
        form.language.value = (data.tech_stack || []).join(', ');
        form.preview_url.value = data.image_url || '';
        form.website_url.value = data.live_url || '';

        document.getElementById('form-title').textContent = 'Edit Project';
        document.getElementById('form-icon').innerHTML = '<i data-lucide="edit-3" class="w-4 h-4"></i>';
        document.getElementById('cancel-edit-btn').classList.remove('hidden');
        document.getElementById('save-btn').innerHTML = '<i data-lucide="save" class="w-4 h-4"></i> Update Project';
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
        lucide.createIcons();
    } catch (err) { alert('Failed to load project data'); }
}

function resetProjectForm() {
    const form = document.getElementById('add-project-form');
    form.reset();
    form.id.value = '';
    document.getElementById('form-title').textContent = 'Add New Project';
    document.getElementById('form-icon').innerHTML = '<i data-lucide="plus" class="w-4 h-4"></i>';
    document.getElementById('cancel-edit-btn').classList.add('hidden');
    document.getElementById('save-btn').innerHTML = '<i data-lucide="save" class="w-4 h-4"></i> Save Project';
    lucide.createIcons();
}

document.getElementById('add-project-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const saveBtn = document.getElementById('save-btn');
    const statusEl = document.getElementById('form-status');

    const id = form.id.value;
    const projectData = {
        title: form.title.value.trim(),
        description: form.description.value.trim(),
        tech_stack: form.language.value.split(',').map(s => s.trim()).filter(Boolean),
        image_url: form.preview_url.value.trim() || null,
        live_url: form.website_url.value.trim() || null,
        status: 'published'
    };

    saveBtn.disabled = true;
    try {
        let error;
        if (id) {
            ({ error } = await sbClient.from('projects').update(projectData).eq('id', id));
        } else {
            ({ error } = await sbClient.from('projects').insert([projectData]));
        }

        if (error) throw error;
        statusEl.textContent = '✓ Saved successfully!';
        statusEl.className = 'text-center text-sm font-medium text-green-600';
        statusEl.classList.remove('hidden');
        resetProjectForm();
        loadAdminProjects();
        setTimeout(() => statusEl.classList.add('hidden'), 3000);
    } catch (err) {
        statusEl.textContent = '✗ Error: ' + err.message;
        statusEl.className = 'text-center text-sm font-medium text-red-500';
        statusEl.classList.remove('hidden');
    } finally { saveBtn.disabled = false; }
});

async function deleteProject(id) {
    if (!confirm('Delete this project?')) return;
    await sbClient.from('projects').delete().eq('id', id);
    loadAdminProjects();
}

// ═══════════════════════════════════════════
// Skills Management
// ═══════════════════════════════════════════
async function loadAdminSkills() {
    const container = document.getElementById('admin-skills');
    const { data: skills } = await sbClient.from('skills').select('*').order('created_at', { ascending: true });
    
    container.innerHTML = (skills || []).map(skill => `
        <div class="card p-4 flex flex-col items-center gap-3 relative group">
            <div class="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onclick="editSkill('${skill.id}')" class="text-text-muted hover:text-text"><i data-lucide="edit-2" class="w-4 h-4"></i></button>
                <button onclick="deleteSkill('${skill.id}')" class="text-red-400 hover:text-red-600"><i data-lucide="x-circle" class="w-4 h-4"></i></button>
            </div>
            <img src="${skill.icon_url}" class="w-10 h-10 object-contain">
            <span class="text-xs font-bold text-text">${skill.name}</span>
        </div>
    `).join('');
    lucide.createIcons();
}

async function editSkill(id) {
    const { data: skill } = await sbClient.from('skills').select('*').eq('id', id).single();
    if (skill) {
        const form = document.getElementById('skill-form');
        form.id.value = skill.id;
        form.name.value = skill.name;
        form.icon_url.value = skill.icon_url;
        document.getElementById('skill-form-title').textContent = 'Edit Skill';
        document.getElementById('skill-cancel-btn').classList.remove('hidden');
        document.getElementById('skill-save-btn').textContent = 'Update Skill';
    }
}

function resetSkillForm() {
    const form = document.getElementById('skill-form');
    form.reset();
    form.id.value = '';
    document.getElementById('skill-form-title').textContent = 'Add New Skill';
    document.getElementById('skill-cancel-btn').classList.add('hidden');
    document.getElementById('skill-save-btn').textContent = 'Save Skill';
}

document.getElementById('skill-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const id = form.id.value;
    const skillData = {
        name: form.name.value.trim(),
        icon_url: form.icon_url.value.trim()
    };

    let error;
    if (id) {
        ({ error } = await sbClient.from('skills').update(skillData).eq('id', id));
    } else {
        ({ error } = await sbClient.from('skills').insert([skillData]));
    }

    if (!error) { 
        resetSkillForm(); 
        loadAdminSkills(); 
    }
});

async function deleteSkill(id) {
    if (confirm('Delete skill?')) {
        await sbClient.from('skills').delete().eq('id', id);
        loadAdminSkills();
    }
}

// ═══════════════════════════════════════════
// Profile & PFP Management
// ═══════════════════════════════════════════
async function loadAdminProfile() {
    const { data: profile } = await sbClient.from('profiles').select('*').limit(1).single();
    if (profile) {
        const form = document.getElementById('profile-form');
        form.name.value = profile.name || '';
        form.title.value = profile.title || '';
        form.bio.value = profile.bio || '';
        form.about_text.value = profile.about_text || '';
        form.avatar_url.value = profile.avatar_url || '';
        document.getElementById('profile-preview').src = profile.avatar_url || '/images/placeholder.jpg';
    }
}

document.getElementById('avatar_url_input').addEventListener('input', (e) => {
    document.getElementById('profile-preview').src = e.target.value || '/images/placeholder.jpg';
});

document.getElementById('profile-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const statusEl = document.getElementById('profile-status');
    const profileData = {
        name: form.name.value.trim(),
        title: form.title.value.trim(),
        bio: form.bio.value.trim(),
        about_text: form.about_text.value.trim(),
        avatar_url: form.avatar_url.value.trim()
    };

    const { data: existing } = await sbClient.from('profiles').select('id').limit(1).single();
    let error;
    if (existing) {
        ({ error } = await sbClient.from('profiles').update(profileData).eq('id', existing.id));
    } else {
        ({ error } = await sbClient.from('profiles').insert([profileData]));
    }

    if (!error) {
        statusEl.textContent = '✓ Profile updated!';
        statusEl.className = 'text-center text-sm font-medium text-green-600';
        statusEl.classList.remove('hidden');
        setTimeout(() => statusEl.classList.add('hidden'), 3000);
    } else {
        console.error('Profile update error:', error);
        alert('Failed to update profile. Make sure the database columns exist.');
    }
});

// ═══════════════════════════════════════════
// Messages Management
// ═══════════════════════════════════════════
async function loadAdminMessages() {
    const container = document.getElementById('admin-messages');
    const { data: messages } = await sbClient.from('messages').select('*').order('created_at', { ascending: false });
    
    if (!messages || messages.length === 0) {
        container.innerHTML = `<p class="py-10 text-center text-text-muted">No messages yet.</p>`;
        return;
    }

    container.innerHTML = messages.map(msg => `
        <div class="card p-6 flex flex-col gap-4">
            <div class="flex justify-between items-start">
                <div>
                    <h3 class="font-bold text-text">${msg.name}</h3>
                    <p class="text-xs text-text-muted">${msg.email} • ${new Date(msg.created_at).toLocaleString()}</p>
                </div>
                <button onclick="deleteMessage('${msg.id}')" class="text-red-500 hover:bg-red-50 p-2 rounded-lg">
                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
            </div>
            <p class="text-sm text-text bg-[#F9F9F9] p-4 rounded-xl border border-border">${msg.message}</p>
        </div>
    `).join('');
    lucide.createIcons();
}

async function deleteMessage(id) {
    if (confirm('Delete message?')) {
        await sbClient.from('messages').delete().eq('id', id);
        loadAdminMessages();
    }
}

// ═══════════════════════════════════════════
// Init
// ═══════════════════════════════════════════
checkAuth();
