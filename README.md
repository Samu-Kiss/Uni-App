# 🎓 Uni-App

Sistema de gestión académica universitaria para visualización de pensum, seguimiento de GPA y generación de horarios.

🌐 **[Acceder a la aplicación](https://uni-app-eta.vercel.app)**

---

## ✨ Funcionalidades

### 📚 Gestión de Pensum

#### Múltiples Vistas
- **Vista Árbol**: Materias organizadas por semestre con diseño de tarjetas
- **Vista Tabla**: Lista compacta para ver todas las materias de un vistazo
- **Vista Grafo**: Visualización interactiva de prerrequisitos y dependencias
- **Vista Estadísticas**: Dashboard con gráficas de progreso y rendimiento

#### Gestión de Materias
- Código de colores según estado:
  - 🔵 Pendiente | 🟡 Inscrita | 🟢 Aprobada | 🔴 Reprobada | ⚫ Retirada
- **Tipos de materia**: Núcleo Carrera, Ciencias Básicas, Socio Humano, Énfasis, Complementarias, Electivas
- Visualización de prerrequisitos y correquisitos
- Drag & drop entre semestres (respetando prerrequisitos)
- Colores personalizados por materia

#### Múltiples Planes de Estudio
- Crea y gestiona varios planes de estudio
- Copia datos entre planes
- Alterna fácilmente entre diferentes escenarios académicos

#### Simulación de Semestre
- Simula inscripciones antes de hacerlas oficiales
- Visualiza qué materias puedes inscribir según prerrequisitos
- Prueba diferentes combinaciones sin afectar tu plan real

### 📊 Estadísticas y Analytics

- **Promedio Acumulado (GPA)** en tiempo real
- **Gráficas interactivas**:
  - Promedio por semestre (línea temporal)
  - Distribución de estados (donut)
  - Tipos de materias (donut)
- **Tabla detallada** por semestre
- **Top 5 mejores y peores notas**
- Modo oscuro compatible

### 📝 Calificaciones

- Agrega componentes de evaluación (parciales, tareas, proyectos)
- Asigna porcentajes a cada componente
- Cálculo automático de nota final
- Simula qué nota necesitas en evaluaciones pendientes

### 📅 Generador de Horarios

- Registra secciones disponibles por materia
- Marca franjas horarias bloqueadas (trabajo, almuerzo)
- Marca franjas preferidas (mañanas, tardes)
- **Generación automática** de todas las combinaciones sin conflictos
- **Métricas por combinación**: días libres, huecos, hora inicio/fin
- **Ordenar por**: días libres, menos huecos, entrada tarde, salida temprana
- **Exportar**: PNG (imagen), ICS (calendario)

### 🔄 Undo/Redo

- Historial completo de acciones
- Deshaz y rehaz cambios con atajos de teclado
- Funciona en todas las vistas

### 🔗 URLs Navegables

- URLs con hash para vistas del pensum (`#tree`, `#table`, `#graph`, `#stats`)
- Query params para el horario (`?sem=1`)
- Soporte para navegación con botones atrás/adelante del navegador

### ☁️ Sincronización en la Nube

- **Funciona offline**: tus datos se guardan localmente
- Crea una cuenta para sincronizar entre dispositivos
- Refresh automático de tokens de sesión
- Indicador de estado de conexión en tiempo real

### ♿ Accesibilidad

- Aria-labels en elementos interactivos
- Tooltips explicativos en botones
- Indicador visual de conexión online/offline
- Confirmaciones en acciones destructivas
- Soporte completo para modo oscuro

---

## 🚀 Cómo Usar

### 1. Importar tu Pensum

1. Ve a la página de **Pensum**
2. Click en **Importar**
3. Descarga la **plantilla** y llénala con tus materias
4. Sube el archivo JSON

**Formato del JSON:**
```json
{
  "materias": [
    {
      "codigo": "MAT101",
      "nombre": "Cálculo I",
      "creditos": 4,
      "semestre": 1,
      "prerrequisitos": [],
      "correquisitos": [],
      "estado": "passed",
      "color": "#5091AF",
      "tipo": "basicas"
    }
  ],
  "calificaciones": [
    {
      "codigo_materia": "MAT101",
      "nota": 4.2,
      "componentes": [
        { "nombre": "Parcial 1", "porcentaje": 25, "nota": 4.0 },
        { "nombre": "Final", "porcentaje": 75, "nota": 4.3 }
      ]
    }
  ]
}
```

**Tipos de materia válidos:**
- `nucleo` - Núcleo Carrera
- `basicas` - Ciencias Básicas
- `sociohumano` - Socio Humano
- `enfasis` - Énfasis
- `complementarias` - Complementarias
- `electivas` - Electivas

### 2. Navegar entre Vistas

- **Árbol** (por defecto): Ver materias por semestre
- **Tabla**: Vista compacta tipo lista
- **Grafo**: Ver dependencias entre materias
- **Estadísticas**: Dashboard con métricas y gráficas

### 3. Gestionar Planes de Estudio

1. Click en el dropdown de planes (arriba a la izquierda)
2. **Nuevo Plan**: Crear un plan desde cero o copiando otro
3. **Editar**: Cambiar nombre/descripción
4. **Administrar**: Ver todos los planes, eliminar los que no uses

### 4. Registrar Calificaciones

1. Click en una materia inscrita o aprobada
2. Cambia el estado y agrega la nota final
3. O usa componentes para cálculo automático

### 5. Generar Horarios

1. Ve a **Horario**
2. Selecciona el semestre
3. Registra las clases disponibles
4. Marca franjas bloqueadas/preferidas
5. Click en **Generar**
6. Navega entre combinaciones
7. Exporta como PNG o ICS

### 6. Sincronizar

1. Click en tu usuario (esquina superior derecha)
2. Click en **Sincronizar**
3. Tus datos se suben a la nube

---

## 💡 Tips

- **Arrastra materias** entre semestres para reorganizar tu plan
- Usa **Ctrl+Z** / **Ctrl+Y** para deshacer/rehacer
- **Simula inscripciones** antes de hacer cambios reales
- **Exporta tu pensum** como backup antes de cambios grandes
- La app funciona **offline** - tus datos están seguros en tu navegador
- Usa **franjas preferidas** para priorizar ciertos horarios
- Cambia entre **planes** para explorar diferentes caminos académicos

---

## 🛠️ Tecnologías

| Categoría | Tecnología |
|-----------|------------|
| Backend | Flask (Python) |
| Frontend | Tailwind CSS, Vanilla JavaScript |
| Gráficas | Canvas API nativo |
| Base de Datos | Supabase (PostgreSQL) |
| Autenticación | Supabase Auth |
| Hosting | Vercel |

---

## 📁 Estructura del Proyecto

```
Uni-App/
├── app/
│   ├── blueprints/       # Rutas Flask (API, pensum, schedule, etc.)
│   ├── models/           # Modelos Pydantic
│   ├── services/         # Servicios (database, etc.)
│   ├── static/
│   │   ├── css/          # Estilos
│   │   ├── js/           # JavaScript (storage, theme, etc.)
│   │   └── templates/    # Plantillas JSON de ejemplo
│   └── templates/        # Templates Jinja2
├── config.py             # Configuración
├── requirements.txt      # Dependencias Python
└── vercel.json           # Configuración de deploy
```

---

## 🤝 Contribuir

¿Encontraste un bug o tienes una idea? 

1. Abre un [Issue](https://github.com/Samu-Kiss/Uni-App/issues)
2. O haz un Pull Request

---

## 📄 Licencia

Este proyecto está licenciado bajo la [GNU General Public License v3.0](LICENSE).

---

Hecho con ❤️ para estudiantes universitarios
