/**
 * Theme Manager - Dark/Light Mode Toggle
 * Handles theme switching and persistence
 */

const ThemeManager = {
    STORAGE_KEY: 'uniapp_theme',
    
    /**
     * Initialize theme on page load
     */
    init() {
        // Get saved theme or detect system preference
        const savedTheme = localStorage.getItem(this.STORAGE_KEY);
        
        if (savedTheme) {
            this.setTheme(savedTheme, false);
        } else {
            // Check system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            this.setTheme(prefersDark ? 'dark' : 'light', false);
        }
        
        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem(this.STORAGE_KEY)) {
                this.setTheme(e.matches ? 'dark' : 'light', false);
            }
        });
    },
    
    /**
     * Set theme
     * @param {string} theme - 'light' or 'dark'
     * @param {boolean} save - Whether to save to localStorage
     */
    setTheme(theme, save = true) {
        document.documentElement.setAttribute('data-theme', theme);
        
        if (save) {
            localStorage.setItem(this.STORAGE_KEY, theme);
        }
        
        // Update meta theme-color for mobile browsers
        const metaTheme = document.querySelector('meta[name="theme-color"]');
        if (metaTheme) {
            metaTheme.setAttribute('content', theme === 'dark' ? '#1f2937' : '#ffffff');
        }
        
        // Dispatch custom event for other components
        window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
    },
    
    /**
     * Toggle between light and dark themes
     */
    toggle() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    },
    
    /**
     * Get current theme
     * @returns {string} 'light' or 'dark'
     */
    getTheme() {
        return document.documentElement.getAttribute('data-theme') || 'light';
    },
    
    /**
     * Check if dark mode is active
     * @returns {boolean}
     */
    isDark() {
        return this.getTheme() === 'dark';
    }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    ThemeManager.init();
});

// Also init immediately for faster theme application (prevent flash)
if (document.readyState !== 'loading') {
    ThemeManager.init();
}

// Global function for toggle button
function toggleTheme() {
    ThemeManager.toggle();
}
