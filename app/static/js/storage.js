/**
 * Storage Manager - Handles localStorage and Supabase sync
 * Priority: localStorage (works offline) -> Supabase sync on auth
 */

class StorageManager {
    constructor() {
        this.prefix = 'uniapp_';
        this.supabase = null;
        this.userId = null;
        this.syncInProgress = false;
    }

    // ==================== LOCAL STORAGE ====================
    
    /**
     * Get data from localStorage
     */
    getLocal(key) {
        try {
            const data = localStorage.getItem(this.prefix + key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error(`Error reading ${key} from localStorage:`, error);
            return null;
        }
    }

    /**
     * Set data in localStorage
     */
    setLocal(key, value) {
        try {
            localStorage.setItem(this.prefix + key, JSON.stringify(value));
            this.markForSync(key);
            return true;
        } catch (error) {
            console.error(`Error writing ${key} to localStorage:`, error);
            return false;
        }
    }

    /**
     * Remove data from localStorage
     */
    removeLocal(key) {
        try {
            localStorage.removeItem(this.prefix + key);
            this.markForSync(key);
            return true;
        } catch (error) {
            console.error(`Error removing ${key} from localStorage:`, error);
            return false;
        }
    }

    /**
     * Mark a key as needing sync to server
     */
    markForSync(key) {
        const pendingSync = this.getLocal('_pendingSync') || [];
        if (!pendingSync.includes(key)) {
            pendingSync.push(key);
            localStorage.setItem(this.prefix + '_pendingSync', JSON.stringify(pendingSync));
        }
    }

    /**
     * Clear pending sync markers
     */
    clearSyncMarkers() {
        localStorage.removeItem(this.prefix + '_pendingSync');
    }

    // ==================== MATERIAS (COURSES) ====================

    /**
     * Get all materias
     */
    getMaterias() {
        return this.getLocal('materias') || [];
    }

    /**
     * Save all materias
     */
    saveMaterias(materias) {
        return this.setLocal('materias', materias);
    }

    /**
     * Get a single materia by code
     */
    getMateria(codigo) {
        const materias = this.getMaterias();
        return materias.find(m => m.codigo === codigo);
    }

    /**
     * Add or update a materia
     */
    saveMateria(materia) {
        const materias = this.getMaterias();
        const index = materias.findIndex(m => m.codigo === materia.codigo);
        
        if (index >= 0) {
            materias[index] = { ...materias[index], ...materia };
        } else {
            materias.push(materia);
        }
        
        return this.saveMaterias(materias);
    }

    /**
     * Delete a materia
     */
    deleteMateria(codigo) {
        const materias = this.getMaterias().filter(m => m.codigo !== codigo);
        return this.saveMaterias(materias);
    }

    // ==================== CLASES (CLASS SECTIONS) ====================

    /**
     * Get all clases
     */
    getClases() {
        return this.getLocal('clases') || [];
    }

    /**
     * Save all clases
     */
    saveClases(clases) {
        return this.setLocal('clases', clases);
    }

    /**
     * Get clases for a specific materia
     */
    getClasesByMateria(codigoMateria) {
        return this.getClases().filter(c => c.codigo_materia === codigoMateria);
    }

    /**
     * Add or update a clase
     */
    saveClase(clase) {
        const clases = this.getClases();
        const id = clase.id || `clase_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const index = clases.findIndex(c => c.id === id);
        
        const claseWithId = { ...clase, id };
        
        if (index >= 0) {
            clases[index] = claseWithId;
        } else {
            clases.push(claseWithId);
        }
        
        this.saveClases(clases);
        return claseWithId;
    }

    /**
     * Delete a clase
     */
    deleteClase(id) {
        const clases = this.getClases().filter(c => c.id !== id);
        return this.saveClases(clases);
    }

    // ==================== FRANJAS (TIME PREFERENCES) ====================

    /**
     * Get all franjas
     */
    getFranjas() {
        return this.getLocal('franjas') || [];
    }

    /**
     * Save all franjas
     */
    saveFranjas(franjas) {
        return this.setLocal('franjas', franjas);
    }

    /**
     * Add a franja
     */
    addFranja(franja) {
        const franjas = this.getFranjas();
        const id = franja.id || `franja_${Date.now()}`;
        franjas.push({ ...franja, id });
        return this.saveFranjas(franjas);
    }

    /**
     * Remove a franja
     */
    removeFranja(id) {
        const franjas = this.getFranjas().filter(f => f.id !== id);
        return this.saveFranjas(franjas);
    }

    // ==================== CALIFICACIONES (GRADES) ====================

    /**
     * Get all calificaciones
     */
    getCalificaciones() {
        return this.getLocal('calificaciones') || [];
    }

    /**
     * Save all calificaciones
     */
    saveCalificaciones(calificaciones) {
        return this.setLocal('calificaciones', calificaciones);
    }

    /**
     * Get calificacion for a specific materia
     */
    getCalificacion(codigoMateria) {
        return this.getCalificaciones().find(c => c.codigo_materia === codigoMateria);
    }

    /**
     * Save or update calificacion
     */
    saveCalificacion(calificacion) {
        const calificaciones = this.getCalificaciones();
        const index = calificaciones.findIndex(c => c.codigo_materia === calificacion.codigo_materia);
        
        const calWithTimestamp = {
            ...calificacion,
            fecha: calificacion.fecha || new Date().toISOString()
        };
        
        if (index >= 0) {
            calificaciones[index] = calWithTimestamp;
        } else {
            calificaciones.push(calWithTimestamp);
        }
        
        return this.saveCalificaciones(calificaciones);
    }

    // ==================== CONFIGURACION ====================

    /**
     * Get configuration
     */
    getConfiguracion() {
        return this.getLocal('configuracion') || {
            max_creditos_semestre: 18,
            umbral_gpa: 2.0,
            mostrar_alertas: true,
            tema: 'light'
        };
    }

    /**
     * Save configuration
     */
    saveConfiguracion(config) {
        return this.setLocal('configuracion', config);
    }

    // ==================== SELECTED SCHEDULE ====================

    /**
     * Get the currently selected schedule combination
     */
    getSelectedSchedule() {
        return this.getLocal('selectedSchedule');
    }

    /**
     * Save the selected schedule combination
     */
    saveSelectedSchedule(schedule) {
        return this.setLocal('selectedSchedule', schedule);
    }

    // ==================== SUPABASE SYNC ====================

    /**
     * Initialize Supabase client
     */
    initSupabase(supabaseClient, userId) {
        this.supabase = supabaseClient;
        this.userId = userId;
    }

    /**
     * Check if user is authenticated and sync is available
     */
    canSync() {
        return this.supabase !== null && this.userId !== null;
    }

    /**
     * Sync local data to Supabase (local wins on conflict)
     */
    async syncToServer() {
        if (!this.canSync() || this.syncInProgress) {
            return { success: false, reason: 'Cannot sync or sync in progress' };
        }

        this.syncInProgress = true;
        const results = { success: true, synced: [], errors: [] };

        try {
            // Sync each data type
            const dataTypes = ['materias', 'clases', 'franjas', 'calificaciones', 'configuracion', 'selectedSchedule'];
            
            for (const dataType of dataTypes) {
                try {
                    const localData = this.getLocal(dataType);
                    if (localData !== null) {
                        const { error } = await this.supabase
                            .from('user_data')
                            .upsert({
                                user_id: this.userId,
                                data_type: dataType,
                                data: localData,
                                updated_at: new Date().toISOString()
                            }, {
                                onConflict: 'user_id,data_type'
                            });
                        
                        if (error) throw error;
                        results.synced.push(dataType);
                    }
                } catch (error) {
                    results.errors.push({ dataType, error: error.message });
                    results.success = false;
                }
            }

            if (results.success) {
                this.clearSyncMarkers();
            }
        } catch (error) {
            results.success = false;
            results.errors.push({ error: error.message });
        } finally {
            this.syncInProgress = false;
        }

        return results;
    }

    /**
     * Load data from Supabase (only if local is empty)
     */
    async loadFromServer() {
        if (!this.canSync()) {
            return { success: false, reason: 'Cannot sync' };
        }

        const results = { success: true, loaded: [], errors: [] };

        try {
            const { data, error } = await this.supabase
                .from('user_data')
                .select('data_type, data')
                .eq('user_id', this.userId);

            if (error) throw error;

            for (const row of data || []) {
                // Only load from server if local is empty (local priority)
                const localData = this.getLocal(row.data_type);
                if (localData === null || (Array.isArray(localData) && localData.length === 0)) {
                    localStorage.setItem(this.prefix + row.data_type, JSON.stringify(row.data));
                    results.loaded.push(row.data_type);
                }
            }
        } catch (error) {
            results.success = false;
            results.errors.push({ error: error.message });
        }

        return results;
    }

    /**
     * Full sync - load from server (if local empty), then push local to server
     */
    async fullSync() {
        const loadResult = await this.loadFromServer();
        const syncResult = await this.syncToServer();
        
        return {
            load: loadResult,
            sync: syncResult,
            success: loadResult.success && syncResult.success
        };
    }

    // ==================== EXPORT / IMPORT ====================

    /**
     * Export all data as JSON
     */
    exportAll() {
        return {
            version: '1.0',
            exportDate: new Date().toISOString(),
            data: {
                materias: this.getMaterias(),
                clases: this.getClases(),
                franjas: this.getFranjas(),
                calificaciones: this.getCalificaciones(),
                configuracion: this.getConfiguracion(),
                selectedSchedule: this.getSelectedSchedule()
            }
        };
    }

    /**
     * Import data from JSON (merges with existing)
     */
    importAll(exportData, options = { overwrite: false }) {
        const results = { success: true, imported: [], errors: [] };

        try {
            if (!exportData.data) {
                throw new Error('Invalid export format');
            }

            const { data } = exportData;

            // Import materias
            if (data.materias) {
                if (options.overwrite) {
                    this.saveMaterias(data.materias);
                } else {
                    // Merge: add new ones, don't overwrite existing
                    const existing = this.getMaterias();
                    const existingCodes = new Set(existing.map(m => m.codigo));
                    const newMaterias = data.materias.filter(m => !existingCodes.has(m.codigo));
                    this.saveMaterias([...existing, ...newMaterias]);
                }
                results.imported.push('materias');
            }

            // Import clases
            if (data.clases) {
                if (options.overwrite) {
                    this.saveClases(data.clases);
                } else {
                    const existing = this.getClases();
                    const existingIds = new Set(existing.map(c => c.id));
                    const newClases = data.clases.filter(c => !existingIds.has(c.id));
                    this.saveClases([...existing, ...newClases]);
                }
                results.imported.push('clases');
            }

            // Import franjas
            if (data.franjas) {
                if (options.overwrite) {
                    this.saveFranjas(data.franjas);
                } else {
                    const existing = this.getFranjas();
                    this.saveFranjas([...existing, ...data.franjas]);
                }
                results.imported.push('franjas');
            }

            // Import calificaciones
            if (data.calificaciones) {
                if (options.overwrite) {
                    this.saveCalificaciones(data.calificaciones);
                } else {
                    const existing = this.getCalificaciones();
                    const existingCodes = new Set(existing.map(c => c.codigo_materia));
                    const newCals = data.calificaciones.filter(c => !existingCodes.has(c.codigo_materia));
                    this.saveCalificaciones([...existing, ...newCals]);
                }
                results.imported.push('calificaciones');
            }

            // Import configuracion (always overwrite if provided)
            if (data.configuracion) {
                this.saveConfiguracion(data.configuracion);
                results.imported.push('configuracion');
            }

        } catch (error) {
            results.success = false;
            results.errors.push(error.message);
        }

        return results;
    }

    /**
     * Clear all local data
     */
    clearAll() {
        const keys = ['materias', 'clases', 'franjas', 'calificaciones', 'configuracion', 'selectedSchedule', '_pendingSync'];
        keys.forEach(key => localStorage.removeItem(this.prefix + key));
    }

    // ==================== ALIASES ====================
    
    // Shorthand aliases for common methods
    getConfig() { return this.getConfiguracion(); }
    saveConfig(config) { return this.saveConfiguracion(config); }
}

// Global instance
const storage = new StorageManager();

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { StorageManager, storage };
}
