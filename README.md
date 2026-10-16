# FF Sens Pro

Aplicación web para generar configuraciones estimadas de sensibilidad a partir de una referencia de densidad de pantalla y un perfil de juego. Los cálculos se ejecutan en el navegador; el dispositivo actual, el perfil y hasta cuatro dispositivos recientes se guardan localmente.

El DPI/densidad de Android escala unidades de interfaz; no equivale a la sensibilidad física del panel táctil ni a los controles del juego. El navegador no puede leer ni modificar el ajuste de Android. Los resultados de esta app son estimaciones.

## Desarrollo

Requisitos: Node.js y npm.

```bash
npm ci
npm run dev
```

Para probar desde un teléfono en la misma red Wi-Fi, inicia Vite con `npm run dev -- --host 0.0.0.0` y abre la dirección de red que muestre la terminal. No publiques el servidor de desarrollo.

## Comprobaciones

```bash
npm test
npm run lint
npm run build
```

El sitio de producción se genera en `dist/`. En un servicio de hosting estático, configura `npm run build` como comando de build y `dist` como directorio de publicación.

## SEO y Google Search Console

La app incluye una URL canónica para `https://ff-sensi-pro-v2.vercel.app/`,
`public/robots.txt` y `public/sitemap.xml`. Si cambias a un dominio propio,
actualiza esas URLs en `index.html`, `public/robots.txt` y `public/sitemap.xml`
antes de publicar.

Para añadir la propiedad en Google Search Console, verifica el dominio mediante
DNS (recomendado si controlas el dominio) o elige el método de etiqueta HTML y
añade a `index.html` la metaetiqueta de verificación que Google te proporcione.
Después de desplegarla, completa la verificación y envía
`https://ff-sensi-pro-v2.vercel.app/sitemap.xml` desde Search Console. La
verificación y la indexación dependen de Google; no garantizan posiciones ni
aparición inmediata en resultados.

## Seguridad

`vercel.json` aplica una Content Security Policy y cabeceras HTTP de seguridad
adecuadas para esta app estática, que no carga servicios de terceros. La política
autoriza el bloque JSON-LD mediante su hash CSP, no con permiso general para
scripts en línea.
Si agregas analítica, anuncios, fuentes, un acortador u otro proveedor externo,
revisa la CSP y el aviso de privacidad antes de publicarlo; permite solo los
dominios estrictamente necesarios.

## Antes de publicar

- Contrasta la fórmula y los DPI con dispositivos reales. Los resultados son estimaciones, no configuraciones oficiales.
- Añade un dominio propio y verifica la web publicada mediante HTTPS en móvil y escritorio.
- Configura metadatos sociales con URLs e imágenes reales cuando tengas el dominio.
- El contacto público configurado es `danpon421@gmail.com`.
- Antes de publicar una política formal en Colombia, completa la identificación del responsable (nombre o razón social, dirección física o electrónica y teléfono) y revisa los derechos, finalidades y canales de atención requeridos por la Ley 1581 de 2012.
- Los ajustes se guardan en el navegador. No hay solicitudes a Google Fonts ni servicios de analítica en esta versión; el proveedor de alojamiento puede procesar datos técnicos de conexión según sus condiciones.
- No se han integrado anuncios ni acortadores monetizados. Antes de añadirlos, comprueba sus condiciones de uso, el impacto en la experiencia y la privacidad, y marca claramente los enlaces patrocinados o promocionales.
- Actualiza la privacidad y el aviso legal si añades analítica, anuncios, cuentas, pagos o recopilación de datos.
- Este proyecto es independiente y no está afiliado ni avalado por Garena.

Fuentes de referencia: [Ley 1581 de 2012](https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=49981) y [documentación Android sobre densidad de pantalla](https://developer.android.com/training/multiscreen/screendensities).