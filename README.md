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

## Antes de publicar

- Contrasta la fórmula y los DPI con dispositivos reales. Los resultados son estimaciones, no configuraciones oficiales.
- Añade un dominio propio y verifica la web publicada mediante HTTPS en móvil y escritorio.
- Configura metadatos sociales con URLs e imágenes reales cuando tengas el dominio.
- El contacto público configurado es `danpon421@gmail.com`.
- Antes de publicar una política formal en Colombia, completa la identificación del responsable (nombre o razón social, dirección física o electrónica y teléfono) y revisa los derechos, finalidades y canales de atención requeridos por la Ley 1581 de 2012.
- Los ajustes se guardan en el navegador. No hay solicitudes a Google Fonts ni servicios de analítica en esta versión; el proveedor de alojamiento puede procesar datos técnicos de conexión según sus condiciones.
- Actualiza la privacidad y el aviso legal si añades analítica, anuncios, cuentas, pagos o recopilación de datos.
- Este proyecto es independiente y no está afiliado ni avalado por Garena.

Fuentes de referencia: [Ley 1581 de 2012](https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=49981) y [documentación Android sobre densidad de pantalla](https://developer.android.com/training/multiscreen/screendensities).