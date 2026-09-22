# Tools Place — web corporativa

Rediseño de toolsplace.es, alineado con BlizzTherm y BlizzCool.

- `index.html` — portada (empresa, marcas, control térmico 360°, fabricación, sectores, contacto)
- `aplazamiento-de-pago.html` — solicitud de pago aplazado
- `aviso-legal.html`, `politica-de-privacidad.html`, `politica-de-cookies.html` — páginas legales (estilo en `assets/css/legal.css`)
- `assets/img/` — imágenes y logos (copias locales, no se enlazan desde toolsplace/blizztherm/blizzcool)
- `assets/js/cookies.js` — banner de cookies (Aceptar / Rechazar / Configurar)
- `assets/fonts/` + `assets/css/fonts.css` — tipografía Poppins alojada en la propia web (no se carga de Google Fonts)

## SEO y compartir

- `favicon.ico`, `assets/icons/` y `site.webmanifest`: icono de pestaña, de iPhone (pantalla de inicio) y de Android.
- Open Graph / Twitter en la portada y en pago aplazado: imagen al compartir en `assets/og/` (1200×630).
- `robots.txt` y `sitemap.xml` (solo páginas indexables; las legales llevan `noindex`). Al cambiar una página,
  actualizar su `<lastmod>`.
- Datos estructurados `Organization` (JSON-LD) en la portada: empresa, dirección, contacto, horario y marcas.
- `.htaccess`: redirecciones 301 de las URLs antiguas de WordPress (`/aviso-legal/`…) y de `/index.html` a `/`.
  Funciona si el dominio usa Apache en Plesk (lo habitual); si solo usa nginx, pasar esas reglas a
  "Directivas adicionales de nginx".

## Cookies

`assets/js/cookies.js` se incluye en todas las páginas. Google Analytics (`GT-NGS96JB2`, el mismo ID de la web actual)
**solo se carga si el usuario acepta** las cookies de análisis. La elección se guarda en `localStorage` (`tp_cookies`).
Cualquier enlace con `data-cookie-settings` reabre el panel (hay uno en el pie de página).
Si se añaden otras cookies (p. ej. Meta Pixel), hay que cargarlas desde `apply()` en ese archivo, subir `VERSION`
para volver a pedir el consentimiento y añadirlas a la tabla de `politica-de-cookies.html`.

Sitio estático (HTML/CSS/JS, sin build) + `enviar.php` para los formularios. Se aloja en el Plesk
(mismo servidor que catalogo.blizzcool.es). GitHub Pages sirve como vista previa: Settings → Pages → `main` / root.

## Formularios (`enviar.php`)

Los dos formularios se envían a `enviar.php`, en nuestro propio servidor, igual que catalogo.blizzcool.es
(POST con FormData, respuesta `{"ok":true}`). No depende de servicios externos ni necesita activación.

| Formulario (`_form`) | Destinatarios |
|---|---|
| `contacto` (portada) | info@toolsplace.es |
| `aplazamiento` | administracion@toolsplace.es + copia a info@toolsplace.es |

- Los destinatarios están fijados en `enviar.php` (constante `FORMULARIOS`), no en el HTML.
- Remitente: `no-reply@toolsplace.es` (el SPF de toolsplace.es autoriza este servidor). "Responder" contesta al cliente.
- Protección: campo trampa `_honey`, solo peticiones desde la propia web, máximo 5 envíos por IP cada 10 minutos.
- Donde no hay PHP (vista previa en GitHub Pages o en local) los formularios usan FormSubmit como respaldo;
  esa vía sí necesita la activación por email de FormSubmit.
