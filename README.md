# Tools Place — web corporativa

Rediseño de toolsplace.es, alineado con BlizzTherm y BlizzCool.

- `index.html` — portada (empresa, marcas, control térmico 360°, fabricación, sectores, contacto)
- `aplazamiento-de-pago.html` — solicitud de pago aplazado
- `aviso-legal.html`, `politica-de-privacidad.html`, `politica-de-cookies.html` — páginas legales (estilo en `assets/css/legal.css`)
- `assets/img/` — imágenes y logos (copias locales, no se enlazan desde toolsplace/blizztherm/blizzcool)
- `assets/js/cookies.js` — banner de cookies (Aceptar / Rechazar / Configurar)

## Cookies

`assets/js/cookies.js` se incluye en todas las páginas. Google Analytics (`GT-NGS96JB2`, el mismo ID de la web actual)
**solo se carga si el usuario acepta** las cookies de análisis. La elección se guarda en `localStorage` (`tp_cookies`).
Cualquier enlace con `data-cookie-settings` reabre el panel (hay uno en el pie de página).
Si se añaden otras cookies (p. ej. Meta Pixel), hay que cargarlas desde `apply()` en ese archivo, subir `VERSION`
para volver a pedir el consentimiento y añadirlas a la tabla de `politica-de-cookies.html`.

Sitio estático (HTML/CSS/JS, sin build). GitHub Pages: Settings → Pages → Deploy from branch → `main` / root.

## Formularios (FormSubmit.co)

| Formulario | Destinatarios |
|---|---|
| Contacto (portada) | info@toolsplace.es |
| Aplazamiento de pago | administracion@toolsplace.es + copia a info@toolsplace.es |

**Activación (solo la primera vez):** envía una prueba desde cada formulario publicado.
FormSubmit mandará un correo "Activate Form" a **info@toolsplace.es** y a **administracion@toolsplace.es**:
hay que pulsar el botón de activación en cada uno. A partir de ahí los avisos llegan solos.

Opcional: tras activar, FormSubmit ofrece un alias aleatorio para no mostrar el correo en el código;
se sustituye en el atributo `action` del `<form>`.
