# AmCare — Telemedicina Digital

Prototipo funcional SPA (vanilla JS) inspirado en Amwell y adaptado al contexto colombiano/LATAM.

## Archivos

- `index.html`: entrada principal de la SPA con CDNs
- `styles.css`: estilos globales responsive mobile-first
- `app.js`: router hash (`#/`), vistas, eventos y lógica principal
- `i18n.js`: internacionalización ES/EN con i18next + persistencia
- `historia.js`: CRUD de historia clínica en `localStorage`
- `agenda.js`: agenda médica con FullCalendar y slots
- `roles.js`: autenticación simulada, sesión y guards por rol
- `admin.js`: panel admin, usuarios/roles y estadísticas

## Funcionalidades visibles

- Branding AmCare + URL simulada `www.amcare.co`
- Selector idioma ES/EN con banderas (Flag CDN)
- Badge permanente `HIPAA Compliant`
- Home con ventajas (6 tarjetas), badges de dispositivos y CTA de urgencias
- Login con accesos rápidos para paciente/médico/admin
- Guardas por rol + pantalla de acceso denegado
- Videoconsulta con sala de espera + embebido Jitsi
- Chat médico-paciente con historial, online/offline y adjuntos simulados
- Documentos y recetas electrónicas con almacenamiento local
- Historia clínica electrónica con permisos por rol
- Agenda médica con FullCalendar (slots disponibles/bloqueados/vacaciones)
- Panel paciente, panel médico y panel admin con gráficas Chart.js
- Casos de uso, planes, seguridad y ayuda con requisitos/limitaciones

## Usuarios demo

- Médico: `sarah@amcare.co` / `medico123`
- Médico: `michael@amcare.co` / `medico123`
- Paciente: `juan@amcare.co` / `paciente123`
- Paciente: `maria@amcare.co` / `paciente123`
- Admin: `admin@amcare.co` / `admin123`

## Cómo ejecutar

1. Abrir `index.html` directamente en navegador, **o**
2. Abrir la carpeta con VS Code y usar Live Server.

> No requiere backend ni instalación de dependencias. Todo se guarda en `localStorage`.

## Nota de demo

Si quieres reiniciar datos, limpia el `localStorage` del navegador y recarga la página.
