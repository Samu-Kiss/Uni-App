/**
 * Main App Module - Entry point and global utilities
 */

const App = {
    /**
     * Initialize the application
     */
    async init() {
        console.log('Uni-App initializing...');
        
        // Initialize auth (will work in offline mode if no credentials)
        await this.initAuth();
        
        // Setup global event listeners
        this.setupEventListeners();
        
        // Initialize page-specific modules
        this.initPage();
        
        // Setup service worker for PWA (optional)
        this.registerServiceWorker();
        
        console.log('Uni-App ready!');
    },

    /**
     * Initialize authentication
     */
    async initAuth() {
        // Get Supabase credentials from meta tags or config
        const supabaseUrl = document.querySelector('meta[name="supabase-url"]')?.content;
        const supabaseKey = document.querySelector('meta[name="supabase-key"]')?.content;
        
        if (supabaseUrl && supabaseKey) {
            await auth.init(supabaseUrl, supabaseKey);
        }
        
        // Update UI based on auth state
        auth.onAuthChange((user) => this.updateAuthUI(user));
    },

    /**
     * Update UI based on authentication state
     */
    updateAuthUI(user) {
        const authButton = document.getElementById('authButton');
        const userInfo = document.getElementById('userInfo');
        const syncStatus = document.getElementById('syncStatus');
        
        if (user) {
            // User is logged in
            if (authButton) {
                authButton.textContent = 'Cerrar Sesión';
                authButton.onclick = () => this.logout();
            }
            if (userInfo) {
                userInfo.textContent = user.email;
                userInfo.classList.remove('hidden');
            }
            if (syncStatus) {
                syncStatus.classList.remove('hidden');
                syncStatus.innerHTML = '<span class="text-green-500">●</span> Sincronizado';
            }
        } else {
            // User is logged out
            if (authButton) {
                authButton.textContent = 'Iniciar Sesión';
                authButton.onclick = () => this.showAuthModal();
            }
            if (userInfo) {
                userInfo.classList.add('hidden');
            }
            if (syncStatus) {
                syncStatus.innerHTML = '<span class="text-gray-400">●</span> Local';
            }
        }
    },

    /**
     * Show authentication modal
     */
    showAuthModal() {
        const modal = document.getElementById('authModal');
        if (modal) {
            modal.classList.remove('hidden');
            this.switchAuthTab('login');
        }
    },

    /**
     * Hide authentication modal
     */
    hideAuthModal() {
        const modal = document.getElementById('authModal');
        if (modal) modal.classList.add('hidden');
    },

    /**
     * Switch between login and register tabs
     */
    switchAuthTab(tab) {
        const loginTab = document.getElementById('loginTab');
        const registerTab = document.getElementById('registerTab');
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        
        if (tab === 'login') {
            loginTab?.classList.add('border-accent', 'text-accent');
            loginTab?.classList.remove('border-transparent');
            registerTab?.classList.remove('border-accent', 'text-accent');
            registerTab?.classList.add('border-transparent');
            loginForm?.classList.remove('hidden');
            registerForm?.classList.add('hidden');
        } else {
            registerTab?.classList.add('border-accent', 'text-accent');
            registerTab?.classList.remove('border-transparent');
            loginTab?.classList.remove('border-accent', 'text-accent');
            loginTab?.classList.add('border-transparent');
            registerForm?.classList.remove('hidden');
            loginForm?.classList.add('hidden');
        }
    },

    /**
     * Handle login form submission
     */
    async login(event) {
        event.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const errorEl = document.getElementById('loginError');
        
        if (!email || !password) {
            if (errorEl) errorEl.textContent = 'Por favor completa todos los campos';
            return;
        }
        
        const result = await auth.signIn(email, password);
        
        if (result.success) {
            this.hideAuthModal();
            this.showAlert('¡Bienvenido!', 'success');
        } else {
            if (errorEl) errorEl.textContent = result.error;
        }
    },

    /**
     * Handle register form submission
     */
    async register(event) {
        event.preventDefault();
        
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const errorEl = document.getElementById('registerError');
        
        if (!email || !password || !confirmPassword) {
            if (errorEl) errorEl.textContent = 'Por favor completa todos los campos';
            return;
        }
        
        if (password !== confirmPassword) {
            if (errorEl) errorEl.textContent = 'Las contraseñas no coinciden';
            return;
        }
        
        if (password.length < 6) {
            if (errorEl) errorEl.textContent = 'La contraseña debe tener al menos 6 caracteres';
            return;
        }
        
        const result = await auth.signUp(email, password);
        
        if (result.success) {
            this.hideAuthModal();
            this.showAlert(result.message || 'Cuenta creada correctamente', 'success');
        } else {
            if (errorEl) errorEl.textContent = result.error;
        }
    },

    /**
     * Handle logout
     */
    async logout() {
        if (confirm('¿Cerrar sesión? Tus datos locales se mantendrán.')) {
            await auth.signOut();
            this.showAlert('Sesión cerrada', 'info');
        }
    },

    /**
     * Handle Google login
     */
    async loginWithGoogle() {
        const result = await auth.signInWithProvider('google');
        if (!result.success) {
            this.showAlert(result.error, 'error');
        }
    },

    /**
     * Setup global event listeners
     */
    setupEventListeners() {
        // Close modals on backdrop click
        document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
            backdrop.addEventListener('click', (e) => {
                if (e.target === backdrop) {
                    backdrop.classList.add('hidden');
                }
            });
        });
        
        // Close modals on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal-backdrop:not(.hidden)').forEach(modal => {
                    modal.classList.add('hidden');
                });
            }
        });
        
        // Mobile nav toggle
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const mobileMenu = document.getElementById('mobileMenu');
        if (mobileMenuBtn && mobileMenu) {
            mobileMenuBtn.addEventListener('click', () => {
                mobileMenu.classList.toggle('hidden');
            });
        }

        // Handle file imports
        document.querySelectorAll('input[type="file"][data-import]').forEach(input => {
            input.addEventListener('change', (e) => {
                const importType = e.target.dataset.import;
                if (importType === 'backup') {
                    Export.importBackup(e.target.files[0]);
                } else if (importType === 'pensum') {
                    Pensum.handleImport(e);
                }
            });
        });
    },

    /**
     * Initialize page-specific modules based on current route
     */
    initPage() {
        const path = window.location.pathname;
        
        if (path === '/' || path === '/pensum' || path === '/pensum/') {
            if (typeof Pensum !== 'undefined') {
                Pensum.init();
            }
        } else if (path.startsWith('/semester/')) {
            const semesterMatch = path.match(/\/semester\/(\d+)/);
            if (semesterMatch && typeof Semester !== 'undefined') {
                Semester.init(parseInt(semesterMatch[1]));
            }
        } else if (path === '/schedule' || path === '/schedule/') {
            if (typeof Schedule !== 'undefined') {
                Schedule.init();
            }
        }
    },

    /**
     * Show an alert message
     */
    showAlert(message, type = 'info') {
        // Remove existing alerts
        document.querySelectorAll('.app-alert').forEach(el => el.remove());
        
        const colors = {
            success: 'bg-green-100 border-green-400 text-green-800',
            error: 'bg-red-100 border-red-400 text-red-800',
            warning: 'bg-yellow-100 border-yellow-400 text-yellow-800',
            info: 'bg-blue-100 border-blue-400 text-blue-800'
        };
        
        const icons = {
            success: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>',
            error: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>',
            warning: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>',
            info: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>'
        };
        
        const alert = document.createElement('div');
        alert.className = `app-alert fixed top-4 right-4 z-50 max-w-md p-4 rounded-lg border ${colors[type]} shadow-lg transform transition-all duration-300 translate-x-full`;
        alert.innerHTML = `
            <div class="flex items-start gap-3">
                <svg class="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    ${icons[type]}
                </svg>
                <div class="flex-1 whitespace-pre-wrap">${message}</div>
                <button onclick="this.parentElement.parentElement.remove()" class="flex-shrink-0 p-1 hover:bg-white/50 rounded">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
        `;
        
        document.body.appendChild(alert);
        
        // Animate in
        requestAnimationFrame(() => {
            alert.classList.remove('translate-x-full');
        });
        
        // Auto remove after 5 seconds (longer for warnings)
        const duration = type === 'warning' ? 8000 : 5000;
        setTimeout(() => {
            alert.classList.add('translate-x-full');
            setTimeout(() => alert.remove(), 300);
        }, duration);
    },

    /**
     * Manual sync trigger
     */
    async syncNow() {
        if (!auth.isAuthenticated()) {
            this.showAlert('Inicia sesión para sincronizar', 'info');
            return;
        }
        
        this.showAlert('Sincronizando...', 'info');
        const result = await auth.manualSync();
        
        if (result.success) {
            this.showAlert('Datos sincronizados correctamente', 'success');
        } else {
            this.showAlert('Error al sincronizar: ' + (result.error || 'Error desconocido'), 'error');
        }
    },

    /**
     * Register service worker for PWA
     */
    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').catch(() => {
                // Service worker not available, that's fine
            });
        }
    },

    /**
     * Utility: Debounce function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Utility: Format date for display
     */
    formatDate(date) {
        return new Date(date).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => App.init());

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { App };
}
