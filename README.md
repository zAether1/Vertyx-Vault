# Vertyx Vault

Plataforma Next.js para descubrir, organizar y reproducir contenido audiovisual.

## APIs internas funcionales

La app ya incluye endpoints propios para funcionar sin servicios externos:

- `GET /api/catalog`: lista catálogo con filtros `q`, `kind`, `genre`, `year`, `limit`.
- `GET /api/catalog/search`: búsqueda rápida para la UI.
- `GET /api/catalog/facets`: géneros, años y tipos disponibles.
- `GET /api/catalog/featured`: destacados del hero.
- `GET /api/catalog/top`: top títulos, opcional `kind=movie|series`.
- `GET /api/catalog/:id`: detalle y recomendaciones.
- `GET /api/catalog/:id/source`: fuente normalizada; devuelve estado no disponible si no hay video autorizado.
- `GET /api/session`: sesión actual.
- `POST /api/session/login`: crea sesión local demo por cookie.
- `POST /api/session/logout`: cierra sesión local.
- `GET /api/library` / `PUT /api/library`: biblioteca, historial y progreso por cookie.

## Proveedores externos opcionales

La UI no depende de un proveedor concreto. Si luego conectas servicios reales, configura estas variables en Vercel:

- `VERTYX_CATALOG_API_URL`: backend autorizado que expone `/catalog/search`, `/catalog/titles/:id`, `/catalog/titles/:id/recommendations` y `/catalog/titles/:id/source`.
- `VERTYX_CATALOG_API_KEY`: token server-side opcional para el catálogo. No se expone al cliente.
- `VERTYX_LIBRARY_API_URL`: backend autenticado para sincronizar favoritos, historial y progreso.
- `VERTYX_LIBRARY_API_KEY`: token server-side opcional para la biblioteca.
- `VERTYX_AUTH_API_URL`: backend autorizado que expone `/session` para resolver el perfil activo.
- `VERTYX_AUTH_API_KEY`: token server-side opcional para el proveedor de sesión.
- `VERTYX_BLOB_UPLOAD_URL` o `BLOB_READ_WRITE_TOKEN`: almacenamiento para avatares, banners y portadas con Vercel Blob.
- `VERTYX_PAYMENTS_API_URL` o `STRIPE_SECRET_KEY`: pasarela para Vertyx Vault Pro USD $2/mes.
- `VERTYX_DISCORD_CLIENT_ID` o `DISCORD_CLIENT_ID`: vinculación y sincronización de rol Pro en Discord.
- `VERTYX_MODERATION_API_URL`: cola compartida para aprobar, rechazar, editar, ocultar y publicar solicitudes.
- `VERTYX_ACTIVITY_API_URL`: registro de actividad, auditoría y notificaciones.

Sin esas variables, la app usa APIs internas, cookies HTTP-only y estado local temporal para mantener la experiencia funcional durante el desarrollo.

## Contratos preparados

- `POST /api/profile/oauth/:provider`: devuelve intención de vinculación Google/Discord.
- `POST /api/profile/assets`: devuelve intención de subida para avatar, banner o portada en Blob.
- `POST /api/profile/pro/checkout`: devuelve intención de checkout Pro por USD $2/mes.
- `GET /api/admin/overview`: métricas, usuarios, actividad y cola editorial para roles autorizados.
- `PATCH /api/moderation/submissions/:id`: aprobar, rechazar, revisar, ocultar o publicar solicitudes.

## Validación

```bash
npm run verify:catalog
npm run verify:foundation
npm run typecheck
npm run build
```
