# Desarrollo del MVP LMS Formarka (Angular)

¡Bienvenido al desarrollo del MVP de Formarka! Este proyecto ha sido estructurado para ser fácil de entender y personalizar.

## Arquitectura del Proyecto

- **`src/app/core`**: Contiene el "corazón" de la aplicación.
  - `models/`: Definiciones de datos (ej. qué es un curso, una lección).
  - `services/`: Lógica para obtener datos (actualmente usa datos de prueba o "mocks").
- **`src/app/features`**: Funcionalidades principales.
  - `learning/`: Todo lo relacionado con la visualización de cursos.
- **`src/app/shared`**: Elementos que se usan en varias partes.
  - `pipes/`: Herramientas para transformar datos (ej. `SafePipe` para videos de YouTube).

## Cómo Personalizar el Estilo

La identidad de Formarka se controla principalmente desde `src/styles.css`. Hemos definido variables CSS al principio del archivo:

```css
:root {
  --formarka-primary: #1a1a1a;    /* Color principal (sobriedad) */
  --formarka-secondary: #f4f4f4;  /* Color de fondo */
  --formarka-accent: #d4af37;     /* Color de acento (premium) */
  /* ... */
}
```

Simplemente cambia estos valores para actualizar toda la plataforma.

## Flujo de Visualización de Cursos

El componente principal es `CoursePlayerComponent`. 
1. **Sidebar**: Muestra los módulos y lecciones.
2. **Video Player**: Carga videos de YouTube de forma segura usando el `SafePipe`.
3. **Acciones**: Permite marcar lecciones como completadas (actualiza el estado local).

## Próximos Pasos sugeridos

1. **Conexión con Backend**: Reemplazar los datos de `course.service.ts` con llamadas a la API usando `HttpClient`.
2. **Autenticación**: Implementar la pantalla de Login y proteger las rutas.
3. **Dashboard**: Crear una vista para que el estudiante vea su progreso general.
