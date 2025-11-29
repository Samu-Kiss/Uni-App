# 🎓 Uni-App

Sistema de gestión académica universitaria para visualización de pensum, seguimiento de GPA y generación de horarios.

🌐 **[Acceder a la aplicación](uni-app-eta.vercel.app)**

---

## ✨ ¿Qué puedes hacer?

### 📚 Gestionar tu Pensum
- Visualiza todas tus materias organizadas por semestre
- Dos vistas disponibles: **Árbol** (por semestre) y **Cuadrícula**
- Código de colores según estado:
  - 🔵 Pendiente
  - 🟡 Inscrita  
  - 🟢 Aprobada
  - 🔴 Reprobada
  - ⚫ Retirada
- Ve los prerrequisitos y correquisitos de cada materia
- Arrastra materias entre semestres (respetando prerrequisitos)

### 📝 Registrar Calificaciones
- Agrega componentes de evaluación (parciales, tareas, proyectos)
- Asigna porcentajes a cada componente
- Calcula automáticamente la nota final
- Simula qué nota necesitas en evaluaciones pendientes

### 📊 Calcular tu GPA
- GPA acumulado en tiempo real
- GPA por semestre
- Alertas cuando tu promedio baja del umbral

### 📅 Generar Horarios
- Registra las secciones disponibles de cada materia
- Marca franjas horarias bloqueadas o preferidas
- Genera automáticamente todas las combinaciones sin conflictos
- Ordena por puntuación según tus preferencias
- Exporta tu horario como **imagen PNG**

### ☁️ Sincronización (Opcional)
- Tus datos se guardan localmente (funciona sin internet)
- Crea una cuenta para sincronizar entre dispositivos
- Tus datos locales tienen prioridad en conflictos

---

## 🚀 Cómo Usar

### 1. Importar tu Pensum

La forma más fácil de empezar es importar un pensum existente:

1. Ve a la página de **Pensum**
2. Click en **Importar JSON**
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
      "prerequisitos": [],
      "correquisitos": []
    },
    {
      "codigo": "MAT201",
      "nombre": "Cálculo II", 
      "creditos": 4,
      "semestre": 2,
      "prerequisitos": ["MAT101"],
      "correquisitos": []
    }
  ]
}
```

### 2. Actualizar Estados

- Click en una materia para abrir el modal de detalles
- Cambia el estado (Pendiente → Inscrita → Aprobada/Reprobada)
- Si repruebas una materia, se crea automáticamente una copia en el siguiente semestre

### 3. Registrar Calificaciones

1. Click en una materia inscrita o aprobada
2. En la pestaña **Calificaciones**, agrega componentes:
   - Nombre (ej: "Parcial 1")
   - Porcentaje (ej: 25%)
   - Nota obtenida (0-100)
3. La nota final se calcula automáticamente

### 4. Generar Horarios

1. Ve a la página de **Horario**
2. **Registra las clases** disponibles para el semestre:
   - Materia
   - Sección
   - Profesor
   - Horario (días y horas)
3. Marca **franjas bloqueadas** (ej: trabajo, almuerzo)
4. Marca **franjas preferidas** (ej: mañanas)
5. Click en **Generar Horarios**
6. Revisa las combinaciones y selecciona la mejor
7. **Exporta como PNG** para guardar o compartir

### 5. Sincronizar (Opcional)

1. Click en **Iniciar sesión** (esquina superior derecha)
2. Crea una cuenta con tu email
3. Verifica tu email
4. Tus datos se sincronizarán automáticamente

---

## 💡 Tips

- **Arrastra materias** entre semestres para reorganizar tu plan
- **Simula pérdidas** para ver qué materias se afectarían
- Usa **franjas preferidas** para que el generador priorice esos horarios
- **Exporta tu pensum** como backup antes de hacer cambios grandes
- La app funciona **offline** - tus datos están en tu navegador

---

## 🛠️ Tecnologías

- **Backend**: Flask (Python)
- **Frontend**: Tailwind CSS, Vanilla JavaScript
- **Base de Datos**: Supabase (para sincronización)
- **Hosting**: Vercel

---

## 🤝 Contribuir

¿Encontraste un bug o tienes una idea? 

1. Abre un [Issue](https://github.com/Samu-Kiss/Uni-App/issues)
2. O haz un Pull Request

---

Hecho con ❤️ para estudiantes universitarios
