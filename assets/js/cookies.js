/* Consentimiento de cookies · Tools Place
   - Google Analytics solo se carga si el usuario acepta las cookies de análisis.
   - La elección se guarda en localStorage ("tp_cookies"), almacenamiento técnico exento de consentimiento.
   - Cualquier elemento con [data-cookie-settings] reabre el panel. */
(() => {
  const GA_ID = 'GT-NGS96JB2';     // mismo ID que usa toolsplace.es actualmente
  const KEY = 'tp_cookies';
  const VERSION = 1;               // subir si cambian las categorías: vuelve a pedir consentimiento
  const POLICY = 'politica-de-cookies.html';
  const MAX_AGE = 365 * 864e5;     // la elección caduca a los 12 meses y se vuelve a preguntar (AEPD: máx. 24)

  const read = () => { try { const c = JSON.parse(localStorage.getItem(KEY)); return c && c.v === VERSION && Date.now() - Date.parse(c.ts) < MAX_AGE ? c : null } catch { return null } };
  const save = analytics => {
    const c = { v: VERSION, analytics, ts: new Date().toISOString() };
    try { localStorage.setItem(KEY, JSON.stringify(c)) } catch {}
    apply(c);
  };

  let gaLoaded = false;
  function apply(c) {
    if (c.analytics && !gaLoaded) {
      gaLoaded = true;
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { dataLayer.push(arguments) };
      gtag('consent', 'default', { analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
      gtag('js', new Date());
      gtag('config', GA_ID, { anonymize_ip: true });
      const s = document.createElement('script');
      s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
      document.head.appendChild(s);
    } else if (!c.analytics && gaLoaded) {
      // retirada del consentimiento: bloquear y borrar cookies de GA
      window.gtag && gtag('consent', 'update', { analytics_storage: 'denied' });
      document.cookie.split(';').map(x => x.split('=')[0].trim()).filter(n => /^_ga/.test(n)).forEach(n => {
        const host = location.hostname.split('.').slice(-2).join('.');
        [location.hostname, '.' + host].forEach(d => document.cookie = `${n}=; Max-Age=0; path=/; domain=${d}`);
        document.cookie = `${n}=; Max-Age=0; path=/`;
      });
    }
  }

  const css = `
.ck{position:fixed;z-index:100;left:22px;bottom:22px;width:min(440px,calc(100% - 32px));padding:24px;border-radius:20px;background:#111827;color:#EEF2F8;border:1px solid rgba(255,255,255,.12);box-shadow:0 24px 70px rgba(0,0,0,.6);font-family:'Poppins',system-ui,sans-serif;font-size:.88rem;line-height:1.55;transform:translateY(20px);opacity:0;transition:transform .45s cubic-bezier(.22,1,.36,1),opacity .45s}
.ck.show{transform:none;opacity:1}
.ck h3{font-size:1.05rem;font-weight:700;margin:0 0 8px;display:flex;align-items:center;gap:10px}
.ck h3 i{width:10px;height:10px;border-radius:50%;background:#E8611A;box-shadow:14px 0 0 #7AB35B;margin-right:14px}
.ck p{color:#b6c0cf;margin:0}
.ck a{color:#fff;text-decoration:underline;text-underline-offset:3px}
.ck-btns{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:18px}
.ck button{font:inherit;font-weight:600;font-size:.85rem;padding:12px 14px;border-radius:999px;cursor:pointer;border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.06);color:#fff;transition:background .25s,transform .25s}
.ck button:hover{background:rgba(255,255,255,.14);transform:translateY(-1px)}
.ck button.ck-all{background:#E8611A;border-color:#E8611A}.ck button.ck-all:hover{background:#cf5314}
.ck .ck-conf{grid-column:1/-1;background:none;border:0;padding:4px;text-decoration:underline;text-underline-offset:3px;color:#b6c0cf}
.ck-panel{display:none;margin-top:16px;border-top:1px solid rgba(255,255,255,.1);padding-top:14px}
.ck.cfg .ck-panel{display:block}.ck.cfg .ck-conf{display:none}
.ck-row{display:flex;justify-content:space-between;gap:16px;align-items:flex-start;padding:10px 0}
.ck-row+.ck-row{border-top:1px solid rgba(255,255,255,.06)}
.ck-row b{display:block;font-size:.88rem}.ck-row small{color:#93A0B5;font-size:.78rem}
.ck-sw{position:relative;flex:none;width:44px;height:24px;margin-top:2px}
.ck-sw input{opacity:0;width:100%;height:100%;margin:0;cursor:pointer;position:relative;z-index:1}
.ck-sw span{position:absolute;inset:0;border-radius:24px;background:rgba(255,255,255,.18);transition:background .25s;pointer-events:none}
.ck-sw span::after{content:"";position:absolute;top:3px;left:3px;width:18px;height:18px;border-radius:50%;background:#fff;transition:transform .25s}
.ck-sw input:checked+span{background:#7AB35B}.ck-sw input:checked+span::after{transform:translateX(20px)}
.ck-sw input:disabled{cursor:not-allowed}.ck-sw input:disabled+span{opacity:.55}
.ck-sw input:focus-visible+span{outline:2px solid #fff;outline-offset:2px}
.ck .ck-save{grid-column:1/-1;display:none}.ck.cfg .ck-save{display:block}
@media (max-width:640px){.ck{left:16px;bottom:16px;padding:20px}}
@media (prefers-reduced-motion:reduce){.ck{transition:none}}`;

  let box;
  function open(cfg) {
    if (!box) build();
    const c = read();
    box.querySelector('#ck-an').checked = !!(c && c.analytics);
    box.classList.toggle('cfg', !!cfg);
    box.hidden = false;
    requestAnimationFrame(() => box.classList.add('show'));
  }
  function close() { box.classList.remove('show'); setTimeout(() => box.hidden = true, 450) }

  function build() {
    const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    box = document.createElement('div');
    box.className = 'ck'; box.hidden = true;
    box.setAttribute('role', 'dialog'); box.setAttribute('aria-label', 'Preferencias de cookies');
    box.innerHTML = `
      <h3><i aria-hidden="true"></i>Usamos cookies</h3>
      <p>Utilizamos cookies técnicas necesarias y, solo si lo aceptas, cookies de análisis (Google Analytics) para saber cómo se usa la web y mejorarla. Más información en la <a href="${POLICY}">Política de cookies</a>.</p>
      <div class="ck-panel">
        <div class="ck-row"><div><b>Técnicas (necesarias)</b><small>Guardan tu elección de cookies y permiten que la web funcione. Siempre activas.</small></div><label class="ck-sw"><input type="checkbox" checked disabled aria-label="Cookies técnicas"><span></span></label></div>
        <div class="ck-row"><div><b>Análisis</b><small>Google Analytics: estadísticas anónimas de visitas.</small></div><label class="ck-sw"><input type="checkbox" id="ck-an" aria-label="Cookies de análisis"><span></span></label></div>
      </div>
      <div class="ck-btns">
        <button type="button" class="ck-no">Rechazar</button>
        <button type="button" class="ck-all">Aceptar</button>
        <button type="button" class="ck-save">Guardar preferencias</button>
        <button type="button" class="ck-conf">Configurar</button>
      </div>`;
    document.body.appendChild(box);
    box.querySelector('.ck-all').onclick = () => { save(true); close() };
    box.querySelector('.ck-no').onclick = () => { save(false); close() };
    box.querySelector('.ck-save').onclick = () => { save(box.querySelector('#ck-an').checked); close() };
    box.querySelector('.ck-conf').onclick = () => box.classList.add('cfg');
  }

  document.addEventListener('click', e => {
    const t = e.target.closest('[data-cookie-settings]');
    if (t) { e.preventDefault(); open(true) }
  });

  const c = read();
  if (c) apply(c);
  else if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => open(false));
  else open(false);
})();
