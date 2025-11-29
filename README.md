# 🎓 Uni-App

Sistema de gestión académica universitaria para visualización de pensum, seguimiento de GPA y generación de horarios.

![Uni-App Screenshot](https://via.placeholder.com/800x400?text=Uni-App+Screenshot)

## ✨ Características

### Visualización del Pensum
- 📊 Vista de cuadrícula por semestres
- 🎨 Código de colores por estado de materias (pendiente, inscrita, aprobada, reprobada, retirada)
- 🔗 Visualización de prerrequisitos
- 📥 Importación/exportación de datos en JSON

### Gestión de Materias
- ✏️ Agregar, editar y eliminar materias
- 📝 Registro de calificaciones
- 🔄 Cambio de estado de materias
- ⚠️ Simulación de pérdida de materia (muestra materias afectadas)

### Cálculo de GPA
- 📈 GPA acumulado en tiempo real
- 📊 GPA por semestre
- 🎯 Simulación de notas para alcanzar GPA objetivo
- 🔔 Alertas cuando el GPA cae bajo el umbral

### Generador de Horarios
- 📅 Múltiples secciones por materia
- ⏰ Preferencias de franjas horarias (bloqueadas/preferidas)
- 🔄 Generación automática de combinaciones sin conflictos
- 🏆 Puntuación de combinaciones según preferencias
- ⚠️ Advertencia para > 1000 combinaciones

### Exportación
- 🖼️ Exportar horario como imagen PNG
- 📅 Exportar a calendario (formato .ics)
- 💾 Backup completo de datos

### Sincronización
- 💾 Almacenamiento local (funciona sin internet)
- ☁️ Sincronización con Supabase al autenticarse
- 🔄 Local tiene prioridad en conflictos

## 🚀 Inicio Rápido

### Requisitos Previos
- Python 3.9+
- Node.js (opcional, para desarrollo)
- Cuenta de Supabase (opcional, para sincronización)

### Instalación Local

1. **Clonar el repositorio**
```bash
git clone https://github.com/tu-usuario/uni-app.git
cd uni-app
```

2. **Crear entorno virtual**
```bash
python -m venv venv
# Windows
.\venv\Scripts\activate
# Linux/Mac
source venv/bin/activate
```

3. **Instalar dependencias**
```bash
pip install -r requirements.txt
```

4. **Configurar variables de entorno**
```bash
cp .env.example .env
# Editar .env con tus credenciales de Supabase (opcional)
```

5. **Ejecutar la aplicación**
```bash
flask run
```

6. **Abrir en el navegador**
```
http://localhost:5000
```

## 🌐 Despliegue en Vercel

1. **Importar proyecto en Vercel**
   - Conectar repositorio de GitHub
   - Framework: Other
   - Root Directory: ./

2. **Configurar variables de entorno**
   ```
   FLASK_ENV=production
   SECRET_KEY=tu-clave-secreta-segura
   SUPABASE_URL=https://tu-proyecto.supabase.co
   SUPABASE_KEY=tu-anon-key
   ```

3. **Desplegar**
   - Vercel detectará `vercel.json` automáticamente

## 🗄️ Configuración de Supabase

### Crear tablas de datos

El archivo SQL completo está en `database/supabase_schema.sql`. Ejecútalo en el SQL Editor de Supabase:

```sql
-- Crear las tablas principales para almacenar datos de usuario
-- Ver database/supabase_schema.sql para el script completo

-- Tablas creadas:
-- - pensums: Almacena las materias del pensum del usuario
-- - clases: Almacena las clases registradas
-- - calificaciones: Almacena calificaciones
-- - configuraciones: Almacena configuración del usuario
-- - franjas: Almacena preferencias de franjas horarias

-- Cada tabla tiene:
-- - RLS (Row Level Security) habilitado
-- - Políticas para que usuarios solo vean sus propios datos
-- - Columna JSONB para datos flexibles
-- - Triggers para actualizar updated_at automáticamente
```

### Pasos para configurar Supabase

1. **Crear proyecto en [Supabase](https://supabase.com)**

2. **Ejecutar el schema SQL**
   - Ve a SQL Editor en tu proyecto de Supabase
   - Copia y ejecuta el contenido de `database/supabase_schema.sql`

3. **Configurar autenticación**
   - En Authentication > Providers, habilita Email
   - Opcional: Configura Google, GitHub, etc.

4. **Obtener credenciales**
   - Ve a Settings > API
   - Copia `Project URL` y `anon public` key

5. **Configurar la aplicación**
   ```bash
   # Crear archivo .env
   cp .env.example .env
   
   # Editar .env con tus credenciales:
   SUPABASE_URL=https://tu-proyecto.supabase.co
   SUPABASE_ANON_KEY=tu-anon-key
   ```

## 📁 Estructura del Proyecto

```
uni-app/
├── api/
│   └── index.py          # Entry point para Vercel
├── app/
│   ├── __init__.py       # Application factory
│   ├── config.py         # Configuraciones
│   ├── blueprints/       # Rutas Flask
│   │   ├── api.py        # API REST
│   │   ├── pensum.py     # Vistas de pensum
│   │   ├── semester.py   # Vistas de semestre
│   │   └── schedule.py   # Vistas de horario
│   ├── models/           # Modelos Pydantic
│   │   ├── materia.py
│   │   ├── clase.py
│   │   ├── horario.py
│   │   └── configuracion.py
│   ├── services/         # Lógica de negocio
│   │   ├── database.py
│   │   ├── pensum_service.py
│   │   ├── gpa_service.py
│   │   ├── schedule_service.py
│   │   └── export_service.py
│   ├── templates/        # Templates Jinja2
│   │   ├── base.html
│   │   ├── components/
│   │   ├── pensum/
│   │   ├── semester/
│   │   └── schedule/
│   └── static/
│       ├── css/
│       │   └── main.css
│       └── js/
│           ├── app.js
│           ├── storage.js
│           ├── auth.js
│           ├── pensum.js
│           ├── semester.js
│           ├── schedule.js
│           └── export.js
├── data/
│   └── schemas/
│       └── pensum.schema.json
├── vercel.json
├── requirements.txt
└── README.md
```

## 🎨 Personalización

### Color de Acento
Editar en `app/static/css/main.css`:
```css
:root {
    --color-accent: #5091AF;
    --color-accent-dark: #3d7a94;
    --color-accent-light: #6ba8c4;
}
```

### Configuración por Defecto
Editar en `app/static/js/storage.js`:
```javascript
getConfiguracion() {
    return this.getLocal('configuracion') || {
        max_creditos_semestre: 18,
        umbral_gpa: 2.0,
        mostrar_alertas: true,
        tema: 'light'
    };
}
```

## 📝 API Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/materias` | Obtener todas las materias |
| POST | `/api/materias` | Crear materia |
| PUT | `/api/materias/<codigo>` | Actualizar materia |
| DELETE | `/api/materias/<codigo>` | Eliminar materia |
| GET | `/api/clases` | Obtener todas las clases |
| POST | `/api/clases` | Crear clase |
| PUT | `/api/clases/<id>` | Actualizar clase |
| DELETE | `/api/clases/<id>` | Eliminar clase |
| POST | `/api/schedule/generate` | Generar combinaciones de horario |
| GET | `/api/gpa` | Obtener GPA actual |
| POST | `/api/gpa/simulate` | Simular GPA con notas hipotéticas |
| POST | `/api/export/ics` | Generar archivo .ics |

## 🛠️ Tecnologías

- **Backend**: Flask 3.0+, Pydantic 2.0+
- **Frontend**: Tailwind CSS (CDN), Vanilla JavaScript ES6
- **Base de Datos**: Supabase (PostgreSQL)
- **Almacenamiento Local**: localStorage
- **Exportación**: html2canvas, icalendar
- **Despliegue**: Vercel Serverless

## 📄 Licencia

MIT License - ver [LICENSE](LICENSE) para más detalles.

## 🤝 Contribuir

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

---

Hecho con ❤️ para estudiantes universitarios
