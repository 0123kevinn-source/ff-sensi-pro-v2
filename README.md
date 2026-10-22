# FF Sens Pro

Aplicación web para generar configuraciones estimadas de sensibilidad a partir de una referencia de densidad de pantalla y un perfil de juego. La página principal incluye una guía explicativa accesible sin JavaScript; las páginas de información son documentos estáticos independientes.

La página principal ofrece un botón opcional para consultar el modelo mediante
User-Agent Client Hints cuando el navegador lo permite, sin enviar esa consulta a
un servicio externo. Si la coincidencia con el catálogo es exacta, se usa el DPI
de referencia del catálogo; si el navegador no revela el modelo o no hay una
coincidencia, la interfaz lo indica y permite buscar o ingresar el DPI manualmente.
El navegador no expone el DPI real del dispositivo.

Los valores de sensibilidad se pueden ajustar individualmente entre 0 y 200 y restablecer a la estimación. También se pueden guardar hasta ocho configuraciones con nombre en el navegador y cargarlas o eliminarlas después. No se sincronizan entre dispositivos ni se envían a un servidor.
Se pueden seleccionar hasta tres configuraciones guardadas para comparar sus valores lado a lado; las diferencias se muestran respecto a la primera seleccionada. Las páginas públicas incluyen `/guia-sensibilidad/`, cinco artículos en `/blog/`, `/sobre-nosotros/`, `/privacidad/`, `/aviso-legal/`, `/terminos/` y `/contacto/`.

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

La app incluye URLs canónicas para `https://ff-sensi-pro-v2.vercel.app/` y
las páginas editoriales, además de `public/robots.txt`, `public/sitemap.xml`,
`public/404.html` y `public/ads.txt`.
Si cambias a un dominio propio, actualiza las URLs en `index.html`, las páginas
estáticas, `public/robots.txt` y `public/sitemap.xml` antes de publicar.

Para añadir la propiedad en Google Search Console, verifica el dominio mediante
DNS (recomendado si controlas el dominio) o elige el método de etiqueta HTML y
añade a `index.html` la metaetiqueta de verificación que Google te proporcione.
Después de desplegarla, completa la verificación y envía
`https://ff-sensi-pro-v2.vercel.app/sitemap.xml` desde Search Console. La
verificación y la indexación dependen de Google; no garantizan posiciones ni
aparición inmediata en resultados.

## Seguridad

`vercel.json` aplica una Content Security Policy y cabeceras HTTP de seguridad.
`AdSlot` solo puede insertar un bloque explícito en la página principal cuando el
contenido editorial supera 300 palabras, el estado de pantalla es `ready`, hay
una señal TCF que permite cargar anuncios y `VITE_ADSENSE_SLOT` contiene un ID válido. Las páginas
estáticas, búsqueda vacía, rutas desconocidas y estados no listos no muestran ese
bloque. El script de AdSense no se carga desde el HTML base. Para habilitarlo,
configura `VITE_ADSENSE_SLOT` en Vercel con un bloque creado en AdSense y conserva
desactivados los anuncios automáticos, que no se pueden restringir por este
componente. `ads.txt` refleja el identificador de editor que ya aparece en la
etiqueta existente; confírmalo en AdSense antes del despliegue.

El proyecto no incluye un aviso de consentimiento propio ni una CMP casera: tal
solución no sustituye una CMP certificada. Antes de publicar anuncios para usuarios
del EEE, Reino Unido o Suiza, configura la CMP certificada desde AdSense/Privacy &
messaging y comprueba que exponga TCF API; `AdSlot` permanece oculto hasta recibir
un estado permitido. No se puede verificar la configuración de la cuenta desde
este repositorio.

## Antes de publicar

- Contrasta la fórmula y los DPI con dispositivos reales. Los resultados son estimaciones, no configuraciones oficiales.
- Añade un dominio propio y verifica la web publicada mediante HTTPS en móvil y escritorio.
- Configura metadatos sociales con URLs e imágenes reales cuando tengas el dominio.
- El contacto público que consta en el proyecto es `danpon421@gmail.com`; las páginas no inventan nombre legal, domicilio ni teléfono.
- Antes de publicar, el responsable debe completar los datos de identificación exigidos por la jurisdicción aplicable y revisar la política de privacidad y cookies. Este repositorio no puede confirmar quién es el titular legal.
- Los ajustes y configuraciones se guardan en el navegador. El proveedor de alojamiento puede procesar datos técnicos de conexión según sus condiciones.
- Configura un ID de bloque real (`VITE_ADSENSE_SLOT`) en Vercel y verifica el `ads.txt` con la cuenta del editor antes de habilitar la inserción de anuncios.
- Desactiva Auto ads en AdSense para conservar las exclusiones por página y estado implementadas por `AdSlot`.
- Configura y prueba la CMP certificada de Google en la cuenta de AdSense; no hay CMP ni banner de consentimiento propio.
- Confirma todas las páginas y `ads.txt` después del despliegue; el contenido local por sí solo no constituye una revisión del sitio en producción.
- El proyecto es independiente y no está afiliado ni avalado por Garena.

Fuentes de referencia: [Ley 1581 de 2012](https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=49981) y [documentación Android sobre densidad de pantalla](https://developer.android.com/training/multiscreen/screendensities).