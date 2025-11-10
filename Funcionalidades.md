# NexTalent: División de Funcionalidades 

**Contexto del Backend:**
* La autenticación con JWT (Cookies) ya está implementada.
* Existen middlewares `authenticate`, `isPasante`, y `isEmpresa` para proteger rutas.
* Ya existen los modelos, rutas y controladores para `User`, `Pasante`, y `Empresa`.

**Workflow por Tarea:**
Cada integrante será "dueño" de una entidad o flujo principal. Deberán crear:

1.  **Modelo(s) de Mongoose** (si es una nueva entidad) en `src/model/`.
2.  **Controlador(es)** con la lógica de negocio en `src/controllers/`.
3.  **Rutas** (ej: `src/routes/miNuevasRutas.js`) y añadirlo a `server.js`.
4.  **Validaciones de Zod** (añadiéndolas a `src/schemas/validation.js`).
5.  **Componentes y Vistas de React** en el frontend para consumir esos endpoints.

---

## 📋 División de Tareas 

### 1. Integrante A: Gestión de Postulaciones (El Core)

Esta persona se encarga de todo lo relacionado con las ofertas de pasantías.

* **Backend:**
    * **Modelo:** Crear `Postulacion.js` en `src/model/`. Debe incluir:
        * `empresaId` (referencia a `Empresa`).
        * `titulo`, `descripcion`, `requisitos` (Array de strings).
        * `lugar` (provincia, localidad).
        * `modalidad` (enum: 'Hibrido', 'Remoto', 'Presencial').
        * `estado` (enum: 'Activa', 'Pausada', 'Cerrada', default: 'Activa').
    * **Controlador:** Crear `PostulacionController.js`.
        * `createPostulacion` (Protegida, solo `isEmpresa`).
        * `updatePostulacion` (Protegida, `isEmpresa`, solo la empresa dueña).
        * `deletePostulacion` (Protegida, `isEmpresa`, solo la empresa dueña).
        * `getMyPostulaciones` (Protegida, `isEmpresa`, para su dashboard).
        * `getAllPostulaciones` (Pública, para el listado principal, con filtros).
        * `getPostulacionById` (Pública, para ver el detalle).
    * **Rutas:** Crear `postulacionRoutes.js` y registrarlo en `server.js`.
    * **Validación:** Crear schemas de Zod para crear y actualizar postulaciones.

* **Frontend:**
    * Crear la vista pública `/postulaciones` (para ver y filtrar todas).
    * Crear la vista pública `/postulaciones/:id` (detalle de la oferta).
    * Crear la sección en el Dashboard de Empresa para "Mis Postulaciones" (CRUD).

---

### 2. Integrante B: Sistema de Aplicaciones (La Interacción)

Esta persona conecta a los Pasantes con las Postulaciones.

* **Backend:**
    * **Modelo:** Crear `Aplicacion.js` en `src/model/`. Debe incluir:
        * `postulacionId` (referencia a `Postulacion`).
        * `pasanteId` (referencia a `Pasante`).
        * `empresaId` (referencia a `Empresa`).
        * `estado` (enum: 'Enviada', 'En revision', 'Rechazada', 'Aceptada', default: 'Enviada').
        * `cvUrl` (String, se captura al momento de aplicar).
        * `mensaje` (String, opcional).
    * **Controlador:** Crear `AplicacionController.js`.
        * `createAplicacion` (Protegida, `isPasante`).
        * `getMyAplicaciones` (Protegida, `isPasante`, para su historial).
        * `getAplicacionesByPostulacion` (Protegida, `isEmpresa`, para ver aplicantes de una postulación).
        * `updateAplicacionStatus` (Protegida, `isEmpresa`, para aceptar/rechazar).
    * **Rutas:** Crear `aplicacionRoutes.js` y registrarlo en `server.js`.
    * **Validación:** Crear schema de Zod para `createAplicacion`.

* **Frontend:**
    * En la vista de detalle de postulación, añadir el botón "Postularme" (abrirá un modal/form).
    * Crear la sección en el Dashboard de Pasante para "Mis Aplicaciones".
    * Crear la sección en el Dashboard de Empresa para "Ver Aplicantes" (por postulación).

---

### 3. Integrante C: Gestión de Perfiles y CVs (Visibilidad)

Esta persona se enfoca en completar los perfiles y gestionar la subida de archivos (CV).

* **Backend:**
    * **File Upload:** Implementar `multer` (o similar) para la subida de archivos (CVs en PDF, fotos de perfil).
    * **Modelo:** Añadir `cvUrl` al modelo `Pasante.js`.
    * **Controlador:** Modificar `PasanteController.js`.
        * Crear `uploadCV` (ruta protegida `isPasante`).
        * Crear `uploadFotoPerfil` (ruta protegida `isPasante`).
        * Asegurar que `updateMyProfile` pueda actualizar estos campos.
    * **Rutas:** Añadir las nuevas rutas a `pasanteRoutes.js`.
    * **Validación:** Actualizar `updatePasanteSchema` para permitir `cvUrl` y `fotoPerfil`.

* **Frontend:**
    * Mejorar la vista "Editar Perfil" del Pasante (`profile/me`) para incluir los *file inputs* de CV y foto.
    * Crear la vista pública `/pasantes/:id` (que usa `getPasanteById`) para mostrar el perfil público de un pasante (su "CV online").
    * Crear la vista pública `/empresas/:id` (que usa `getEmpresaById`) para mostrar el perfil público de una empresa.

---

### 4. Integrante D: Sistema de Favoritos (Engagement)

Esta persona se encarga de la funcionalidad "guardar para después" del pasante.

* **Backend:**
    * **Modelo:** Modificar `Pasante.js`. Añadir un campo:
        * `favoritos` (Array de `ObjectId` con referencia a `Postulacion`).
    * **Controlador:** Modificar `PasanteController.js`.
        * `addFavorito` (recibe `postulacionId` por params, `isPasante`).
        * `removeFavorito` (recibe `postulacionId` por params, `isPasante`).
        * `getMyFavoritos` (devuelve las postulaciones favoritas *populadas*).
    * **Rutas:** Añadir estas rutas a `pasanteRoutes.js`.

* **Frontend:**
    * Añadir un botón/icono (corazón, bookmark) en las *cards* de postulación y en la vista de detalle para "Guardar".
    * Crear la sección en el Dashboard de Pasante para "Mis Favoritos".

---

### 5. Integrante E: Reseñas y Comentarios (Feedback)

Esta persona se encarga del sistema de feedback de pasantes hacia empresas.

* **Backend:**
    * **Modelo:** Crear `Resena.js` en `src/model/`. Debe incluir:
        * `empresaId` (referencia a `Empresa`).
        * `pasanteId` (referencia a `Pasante`).
        * `rating` (Number, 1-5).
        * `comentario` (String).
        * `titulo` (String).
    * **Controlador:** Crear `ResenaController.js`.
        * `createResena` (Protegida, `isPasante`. **Lógica extra:** Idealmente, solo permitir si el pasante tiene una `Aplicacion` 'Aceptada' con esa empresa).
        * `getResenasByEmpresa` (Pública, para mostrar en el perfil de la empresa).
        * `deleteResena` (Protegida, solo el pasante que la creó).
        * `updateResena` (Protegida, solo el pasante que la creó).
    * **Rutas:** Crear `resenaRoutes.js` y registrarlo en `server.js`.
    * **Validación:** Crear schemas de Zod para crear y actualizar reseñas.

* **Frontend:**
    * En la vista pública de perfil de empresa (`/empresas/:id`), añadir una pestaña/sección para mostrar las reseñas.
    * En el Dashboard de Pasante, en "Mis Aplicaciones", si una está "Aceptada" (o "Finalizada"), mostrar un botón para "Dejar Reseña".