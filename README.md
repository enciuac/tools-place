# Tools Place — web corporativa

Rediseño de toolsplace.es, alineado con BlizzTherm y BlizzCool.

- `index.html` — portada (empresa, marcas, control térmico 360°, fabricación, sectores, contacto)
- `aplazamiento-de-pago.html` — solicitud de pago aplazado

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
