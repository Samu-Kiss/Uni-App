/**
 * Export Module - Handles PNG and ICS exports
 */

const Export = {
    /**
     * Export schedule grid as PNG image
     */
    async exportToPNG() {
        const scheduleGrid = document.getElementById('scheduleGrid');
        if (!scheduleGrid) {
            App.showAlert('No hay horario para exportar', 'warning');
            return;
        }

        // Check if html2canvas is loaded
        if (typeof html2canvas === 'undefined') {
            // Load html2canvas dynamically
            await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
        }

        try {
            App.showAlert('Generando imagen...', 'info');

            // Create a wrapper with padding and background
            const wrapper = document.createElement('div');
            wrapper.style.padding = '20px';
            wrapper.style.backgroundColor = 'white';
            wrapper.style.width = 'fit-content';
            
            // Clone the schedule grid
            const clone = scheduleGrid.cloneNode(true);
            wrapper.appendChild(clone);
            document.body.appendChild(wrapper);

            const canvas = await html2canvas(wrapper, {
                backgroundColor: '#ffffff',
                scale: 2, // Higher resolution
                logging: false,
                useCORS: true
            });

            document.body.removeChild(wrapper);

            // Convert to blob and download
            canvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `horario-${new Date().toISOString().split('T')[0]}.png`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                App.showAlert('Imagen exportada correctamente', 'success');
            }, 'image/png');

        } catch (error) {
            console.error('Error exporting PNG:', error);
            App.showAlert('Error al exportar imagen', 'error');
        }
    },

    /**
     * Export schedule as ICS calendar file
     */
    async exportToICS() {
        const selectedSchedule = storage.getSelectedSchedule();
        
        if (!selectedSchedule || selectedSchedule.length === 0) {
            App.showAlert('No hay horario seleccionado', 'warning');
            return;
        }

        try {
            // Try server-side generation first
            const response = await fetch('/api/export/ics', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    clases: selectedSchedule,
                    semester_start: this.getSemesterStart(),
                    semester_end: this.getSemesterEnd()
                })
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `horario-${new Date().toISOString().split('T')[0]}.ics`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                App.showAlert('Calendario exportado correctamente', 'success');
            } else {
                // Fallback to client-side generation
                this.generateICSClientSide(selectedSchedule);
            }
        } catch (error) {
            console.error('Error exporting ICS:', error);
            // Fallback to client-side generation
            this.generateICSClientSide(selectedSchedule);
        }
    },

    /**
     * Generate ICS file client-side (fallback)
     */
    generateICSClientSide(schedule) {
        const materias = storage.getMaterias();
        const lines = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//Uni-App//Schedule Export//ES',
            'CALSCALE:GREGORIAN',
            'METHOD:PUBLISH'
        ];

        const dayMap = {
            'monday': 'MO',
            'tuesday': 'TU',
            'wednesday': 'WE',
            'thursday': 'TH',
            'friday': 'FR',
            'saturday': 'SA',
            'sunday': 'SU'
        };

        const semesterStart = this.getSemesterStart();
        const semesterEnd = this.getSemesterEnd();

        schedule.forEach(clase => {
            const materia = materias.find(m => m.codigo === clase.codigo_materia);
            const summary = materia ? materia.nombre : clase.codigo_materia;

            (clase.bloques_horario || []).forEach(block => {
                const uid = `${clase.id}-${block.dia}-${Date.now()}@uniapp`;
                const dayCode = dayMap[block.dia] || 'MO';
                
                // Find first occurrence of this day after semester start
                const firstDate = this.getNextDayOfWeek(semesterStart, block.dia);
                const dtstart = this.formatDateTime(firstDate, block.hora_inicio);
                const dtend = this.formatDateTime(firstDate, block.hora_fin);
                const until = this.formatDate(semesterEnd);

                lines.push('BEGIN:VEVENT');
                lines.push(`UID:${uid}`);
                lines.push(`DTSTAMP:${this.formatDateTime(new Date(), '00:00')}`);
                lines.push(`DTSTART:${dtstart}`);
                lines.push(`DTEND:${dtend}`);
                lines.push(`RRULE:FREQ=WEEKLY;BYDAY=${dayCode};UNTIL=${until}`);
                lines.push(`SUMMARY:${this.escapeICS(summary)}`);
                if (clase.profesor) {
                    lines.push(`DESCRIPTION:Profesor: ${this.escapeICS(clase.profesor)}\\nNRC: ${clase.nrc || 'N/A'}`);
                }
                if (clase.aula) {
                    lines.push(`LOCATION:${this.escapeICS(clase.aula)}`);
                }
                lines.push('END:VEVENT');
            });
        });

        lines.push('END:VCALENDAR');

        const content = lines.join('\r\n');
        const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `horario-${new Date().toISOString().split('T')[0]}.ics`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        App.showAlert('Calendario exportado correctamente', 'success');
    },

    /**
     * Get semester start date
     */
    getSemesterStart() {
        // Try to get from config or use a default
        const config = storage.getConfiguracion();
        if (config.semester_start) {
            return new Date(config.semester_start);
        }
        
        // Default: Start of current month or January/August based on current month
        const now = new Date();
        const month = now.getMonth();
        
        if (month >= 7) {
            // Fall semester: August
            return new Date(now.getFullYear(), 7, 1);
        } else {
            // Spring semester: January
            return new Date(now.getFullYear(), 0, 15);
        }
    },

    /**
     * Get semester end date
     */
    getSemesterEnd() {
        const config = storage.getConfiguracion();
        if (config.semester_end) {
            return new Date(config.semester_end);
        }
        
        // Default: 4 months after start
        const start = this.getSemesterStart();
        const end = new Date(start);
        end.setMonth(end.getMonth() + 4);
        return end;
    },

    /**
     * Get next occurrence of a specific day of week
     */
    getNextDayOfWeek(date, dayName) {
        const dayMap = {
            'sunday': 0,
            'monday': 1,
            'tuesday': 2,
            'wednesday': 3,
            'thursday': 4,
            'friday': 5,
            'saturday': 6
        };
        
        const targetDay = dayMap[dayName];
        const result = new Date(date);
        const currentDay = result.getDay();
        const daysUntilTarget = (targetDay - currentDay + 7) % 7;
        
        result.setDate(result.getDate() + daysUntilTarget);
        return result;
    },

    /**
     * Format date and time for ICS
     */
    formatDateTime(date, time) {
        const d = new Date(date);
        const [hours, minutes] = time.split(':').map(Number);
        d.setHours(hours, minutes, 0, 0);
        
        return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    },

    /**
     * Format date for ICS UNTIL
     */
    formatDate(date) {
        return date.toISOString().split('T')[0].replace(/-/g, '') + 'T235959Z';
    },

    /**
     * Escape text for ICS format
     */
    escapeICS(text) {
        return text
            .replace(/\\/g, '\\\\')
            .replace(/;/g, '\\;')
            .replace(/,/g, '\\,')
            .replace(/\n/g, '\\n');
    },

    /**
     * Export all data as JSON backup
     */
    exportBackup() {
        const data = storage.exportAll();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `uniapp-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        App.showAlert('Backup exportado correctamente', 'success');
    },

    /**
     * Import backup from JSON file
     */
    importBackup(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                if (confirm('¿Deseas sobrescribir los datos existentes o combinarlos?\n\nOK = Sobrescribir\nCancelar = Combinar')) {
                    const result = storage.importAll(data, { overwrite: true });
                    App.showAlert(`Datos restaurados: ${result.imported.join(', ')}`, 'success');
                } else {
                    const result = storage.importAll(data, { overwrite: false });
                    App.showAlert(`Datos combinados: ${result.imported.join(', ')}`, 'success');
                }
                
                // Refresh the page
                window.location.reload();
            } catch (error) {
                App.showAlert('Error al importar: formato inválido', 'error');
            }
        };
        reader.readAsText(file);
    },

    /**
     * Load external script dynamically
     */
    loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
};

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Export };
}
