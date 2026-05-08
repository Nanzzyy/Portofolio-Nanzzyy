// ═══════════════════════════════════════════
// Supabase Config (Client-Side)
// ═══════════════════════════════════════════
const SUPABASE_URL = 'https://yomlvkdrpzgliulerxxc.supabase.co';
const SUPABASE_KEY = 'sb_publishable_VTJlxgl9WEx0PxxFZXRekw_Fi7FZjg5';
const sbClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ═══════════════════════════════════════════
// Navbar scroll effect
// ═══════════════════════════════════════════
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Mobile menu toggle
const mobileBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
if (mobileBtn && mobileMenu) {
    mobileBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });
    // Close menu on link click
    mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => mobileMenu.classList.add('hidden'));
    });
}

// ═══════════════════════════════════════════
// Load Projects from Supabase
// ═══════════════════════════════════════════
let allProjects = [];

async function loadProjects() {
    const container = document.getElementById('projects-container');
    const loading = document.getElementById('projects-loading');
    const showMoreContainer = document.getElementById('show-more-container');
    const showMoreBtn = document.getElementById('show-more-btn');

    try {
        const { data: projects, error } = await sbClient
            .from('projects')
            .select('*')
            .eq('status', 'published')
            .order('created_at', { ascending: false });

        if (error) throw error;

        allProjects = projects || [];
        if (loading) loading.remove();

        if (allProjects.length === 0) {
            container.innerHTML = `
                <div class="col-span-full text-center py-20 border border-dashed border-border rounded-2xl bg-card">
                    <p class="text-text-muted font-semibold">No projects yet. Check back soon!</p>
                </div>
            `;
            return;
        }

        renderProjects(allProjects.slice(0, 3));

        if (allProjects.length > 3) {
            showMoreContainer.classList.remove('hidden');
            showMoreBtn.addEventListener('click', () => {
                renderProjects(allProjects);
                showMoreContainer.classList.add('hidden');
            });
        }

    } catch (err) {
        console.error('Failed to load projects:', err);
        if (loading) loading.remove();
        container.innerHTML = `
            <div class="col-span-full text-center py-16 border border-dashed border-border rounded-2xl bg-card">
                <p class="text-text-muted font-semibold">Could not load projects. Please try again later.</p>
            </div>
        `;
    }
}

function renderProjects(projectsToRender) {
    const container = document.getElementById('projects-container');
    container.innerHTML = projectsToRender.map((project) => {
        const techTags = (project.tech_stack || []).map(t => 
            `<span class="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md bg-[#F3F3F3] border border-border text-text-muted">${t}</span>`
        ).join('');

        return `
        <div class="card group flex flex-col h-full overflow-hidden hover:shadow-xl transition-all duration-500 animate-fade-in-up">
            <!-- Image Container -->
            <div class="aspect-video overflow-hidden bg-[#F3F3F3] border-b border-border relative">
                ${project.image_url 
                    ? `<img src="${project.image_url}" alt="${project.title}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700">` 
                    : `<div class="w-full h-full flex items-center justify-center text-border"><i data-lucide="image" class="w-12 h-12"></i></div>`
                }
                <div class="absolute inset-0 bg-text/0 group-hover:bg-text/5 transition-colors duration-300"></div>
            </div>
            
            <!-- Content -->
            <div class="p-6 flex flex-col flex-1">
                <h3 class="text-xl font-bold text-text mb-2 group-hover:text-text-muted transition-colors">${project.title}</h3>
                <p class="text-text-muted text-sm leading-relaxed mb-6 line-clamp-3">${project.description || ''}</p>
                
                <div class="flex flex-wrap gap-1.5 mb-8">${techTags}</div>
                
                <!-- Links -->
                <div class="flex gap-4 mt-auto pt-4 border-t border-border/50">
                    ${project.live_url ? `
                        <a href="${project.live_url}" target="_blank" rel="noopener noreferrer" class="text-xs font-bold uppercase tracking-widest text-text hover:text-text-muted transition-colors flex items-center gap-2">
                            View Project <i data-lucide="arrow-up-right" class="w-3.5 h-3.5"></i>
                        </a>` : ''}
                    ${project.github_url ? `
                        <a href="${project.github_url}" target="_blank" rel="noopener noreferrer" class="text-xs font-bold uppercase tracking-widest text-text-muted hover:text-text transition-colors flex items-center gap-2">
                            Code <i data-lucide="github" class="w-3.5 h-3.5"></i>
                        </a>` : ''}
                </div>
            </div>
        </div>`;
    }).join('');
    
    if (window.lucide) {
        window.lucide.createIcons();
    }
}

// ═══════════════════════════════════════════
// Contact Form
// ═══════════════════════════════════════════
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const statusEl = document.getElementById('contact-status');
        const submitBtn = document.getElementById('contact-submit');
        
        const form = e.target;
        const name = form.name.value;
        const email = form.email.value;
        const message = form.message.value;

        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';

        try {
            const { error } = await sbClient.from('messages').insert([
                { name, email, message }
            ]);

            if (error) throw error;

            statusEl.textContent = '✓ Message sent successfully!';
            statusEl.className = 'text-center text-sm font-medium text-green-600';
            statusEl.classList.remove('hidden');
            form.reset();
        } catch (err) {
            console.error('Contact form error:', err);
            statusEl.textContent = '✗ Failed to send message. Please try again.';
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
loadProjects();
