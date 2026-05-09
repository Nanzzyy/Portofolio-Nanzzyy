// ═══════════════════════════════════════════
// Supabase Config (Client-Side)
// ═══════════════════════════════════════════
const SUPABASE_URL = 'https://yomlvkdrpzgliulerxxc.supabase.co';
const SUPABASE_KEY = 'sb_publishable_VTJlxgl9WEx0PxxFZXRekw_Fi7FZjg5';
const sbClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ═══════════════════════════════════════════
// Navbar & UI Helpers
// ═══════════════════════════════════════════
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
});

const mobileBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
if (mobileBtn && mobileMenu) {
    mobileBtn.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));
    mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => mobileMenu.classList.add('hidden'));
    });
}

// ═══════════════════════════════════════════
// Load Profile Data
// ═══════════════════════════════════════════
async function loadProfile() {
    try {
        const { data: profile } = await sbClient.from('profiles').select('*').limit(1).single();
        if (profile) {
            // Update Navbar
            if (profile.name) {
                document.getElementById('navbar-name').textContent = profile.name.split(' ')[0];
                document.getElementById('navbar-initial').textContent = profile.name[0];
            }
            if (profile.avatar_url) {
                const pfp = document.getElementById('navbar-pfp');
                pfp.src = profile.avatar_url;
                pfp.classList.remove('hidden');
                document.getElementById('navbar-initial').classList.add('hidden');
            }

            // Update Hero
            if (profile.name) {
                document.getElementById('hero-title').textContent = `Hey, I'm ${profile.name.split(' ')[0]}`;
                document.getElementById('footer-name').textContent = profile.name.split(' ')[0];
            }
            if (profile.bio) {
                document.getElementById('hero-bio').innerHTML = profile.bio;
                document.getElementById('footer-bio').innerHTML = profile.bio;
            }
            if (profile.about_text) {
                document.getElementById('about-bio').innerHTML = profile.about_text;
            }
        }
    } catch (err) { console.error('Profile load error:', err); }
}

// ═══════════════════════════════════════════
// Load Skills
// ═══════════════════════════════════════════
async function loadSkills() {
    const grid = document.getElementById('skills-grid');
    try {
        const { data: skills } = await sbClient.from('skills').select('*').order('created_at', { ascending: true });
        if (skills && skills.length > 0) {
            grid.innerHTML = skills.map(skill => `
                <div class="skill-item">
                    <img src="${skill.icon_url}" class="w-10 h-10 object-contain" alt="${skill.name}">
                    <span class="text-[11px] font-bold uppercase tracking-wider text-text-muted">${skill.name}</span>
                </div>
            `).join('');
        }
    } catch (err) { console.error('Skills load error:', err); }
}

// ═══════════════════════════════════════════
// Load Projects
// ═══════════════════════════════════════════
let allProjects = [];
async function loadProjects() {
    const container = document.getElementById('projects-container');
    const loading = document.getElementById('projects-loading');
    const showMoreBtn = document.getElementById('show-more-btn');

    try {
        const { data: projects } = await sbClient.from('projects').select('*').eq('status', 'published').order('created_at', { ascending: false });
        allProjects = projects || [];
        if (loading) loading.remove();

        if (allProjects.length === 0) {
            container.innerHTML = `<div class="col-span-full text-center py-20 bg-card rounded-2xl border border-dashed border-border"><p class="text-text-muted">No projects yet.</p></div>`;
            return;
        }

        renderProjects(allProjects.slice(0, 3));
        if (allProjects.length > 3) {
            document.getElementById('show-more-container').classList.remove('hidden');
            showMoreBtn.addEventListener('click', () => {
                renderProjects(allProjects);
                document.getElementById('show-more-container').classList.add('hidden');
            });
        }
    } catch (err) { console.error(err); }
}

function renderProjects(projects) {
    const container = document.getElementById('projects-container');
    container.innerHTML = projects.map(p => `
        <div class="card group flex flex-col h-full overflow-hidden hover:shadow-xl transition-all duration-500 animate-fade-in-up">
            <div class="aspect-video overflow-hidden bg-[#F3F3F3] border-b border-border relative">
                ${p.image_url ? `<img src="${p.image_url}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700">` : `<div class="w-full h-full flex items-center justify-center text-border"><i data-lucide="image" class="w-12 h-12"></i></div>`}
            </div>
            <div class="p-6 flex flex-col flex-1">
                <h3 class="text-xl font-bold text-text mb-2">${p.title}</h3>
                <p class="text-text-muted text-sm leading-relaxed mb-6 line-clamp-3">${p.description || ''}</p>
                <div class="flex flex-wrap gap-1.5 mb-8">
                    ${(p.tech_stack || []).map(t => `<span class="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md bg-[#F3F3F3] border border-border text-text-muted">${t}</span>`).join('')}
                </div>
                <div class="flex gap-4 mt-auto pt-4 border-t border-border/50">
                    ${p.live_url ? `<a href="${p.live_url}" target="_blank" class="text-xs font-bold uppercase tracking-widest text-text hover:text-text-muted flex items-center gap-2">View Project <i data-lucide="arrow-up-right" class="w-3.5 h-3.5"></i></a>` : ''}
                </div>
            </div>
        </div>
    `).join('');
    lucide.createIcons();
}

// ═══════════════════════════════════════════
// Contact Form (Supabase + Web3Forms Email)
// ═══════════════════════════════════════════
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const statusEl = document.getElementById('contact-status');
        const submitBtn = document.getElementById('contact-submit');
        const form = e.target;
        
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';

        const formData = new FormData(form);
        const data = Object.fromEntries(formData);

        try {
            // 1. Save to Supabase
            await sbClient.from('messages').insert([{
                name: data.name,
                email: data.email,
                message: data.message
            }]);

            // 2. Send Email Notification via Web3Forms (Optional but highly recommended for "receiving" emails)
            // Note: User should replace ACCESS_KEY with their own from web3forms.com
            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({
                    access_key: "fa0b99f6-26bc-49dc-9f4f-a9b5925254be",
                    name: data.name,
                    email: data.email,
                    message: data.message,
                    subject: `New Portfolio Message from ${data.name}`
                })
            });

            statusEl.textContent = '✓ Message sent! I will get back to you soon.';
            statusEl.className = 'text-center text-sm font-medium text-green-600';
            statusEl.classList.remove('hidden');
            form.reset();
        } catch (err) {
            statusEl.textContent = '✗ Failed to send. Please try again.';
            statusEl.className = 'text-center text-sm font-medium text-red-500';
            statusEl.classList.remove('hidden');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit';
        }
    });
}

// ═══════════════════════════════════════════
// Init
// ═══════════════════════════════════════════
loadProfile();
loadSkills();
loadProjects();
