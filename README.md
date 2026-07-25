# Vertyx Vault

Plataforma Next.js para descubrir, organizar y reproducir contenido audiovisual desde proveedores autorizados.

## Proveedores autorizados

La UI no depende de un proveedor concreto. Para conectar datos reales, configura estas variables en Vercel:

- `VERTYX_CATALOG_API_URL`: backend autorizado que expone `/catalog/search`, `/catalog/titles/:id`, `/catalog/titles/:id/recommendations` y `/catalog/titles/:id/source`.
- `VERTYX_CATALOG_API_KEY`: token server-side opcional para el catálogo. No se expone al cliente.
- `VERTYX_LIBRARY_API_URL`: backend autenticado para sincronizar favoritos, historial y progreso.
- `VERTYX_LIBRARY_API_KEY`: token server-side opcional para la biblioteca.

Sin esas variables, la app usa el catálogo local y mantiene la biblioteca en el dispositivo con `zustand`.

## Validación

```bash
npm run verify:catalog
npm run typecheck
npm run build
```
