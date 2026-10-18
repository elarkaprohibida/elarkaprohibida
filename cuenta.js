(function () {
    const root = document.getElementById('cuenta');
    if (!root) return;

    const API = 'https://arka-bot.taila5bb06.ts.net';
    const TOKEN_KEY = 'arkaCuentaToken';

    const ERRORES = {
        cancelado: 'Has cancelado el inicio de sesión.',
        state: 'Algo falló, inténtalo de nuevo.',
        discord: 'Algo falló, inténtalo de nuevo.'
    };

    function getToken() {
        try { return localStorage.getItem(TOKEN_KEY); } catch (e) { return null; }
    }

    function setToken(token) {
        try { localStorage.setItem(TOKEN_KEY, token); } catch (e) { /* sin almacenamiento */ }
    }

    function clearToken() {
        try { localStorage.removeItem(TOKEN_KEY); } catch (e) { /* sin almacenamiento */ }
    }

    function esc(value) {
        return String(value ?? '').replace(/[&<>"']/g, c => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        })[c]);
    }

    function formatDate(iso) {
        const d = new Date(iso);
        return isNaN(d) ? esc(iso) : d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
    }

    // Token o error que devuelve el bot tras el login con Discord
    let mensaje = '';
    const hash = new URLSearchParams(location.hash.slice(1));
    if (hash.has('token')) {
        setToken(hash.get('token'));
    } else if (hash.has('error')) {
        mensaje = ERRORES[hash.get('error')] || ERRORES.discord;
    }
    if (location.hash) history.replaceState(null, '', location.pathname + location.search);

    function renderLogin(msg) {
        root.innerHTML = `
            <div class="box cuenta-login">
                <h2>🔐 Entra con tu cuenta de Discord</h2>
                <p>Consulta tu cuenta de ARK vinculada, tu VIP, tu tribu y tu nevera.</p>
                ${msg ? `<p class="cuenta-aviso">${esc(msg)}</p>` : ''}
                <a class="btn discord-btn" href="${API}/cuenta/login">Entrar con Discord</a>
            </div>
        `;
    }

    function renderLoading() {
        root.innerHTML = `
            <div class="box cuenta-login">
                <div class="cuenta-spinner"></div>
                <p>Cargando tu cuenta...</p>
            </div>
        `;
    }

    function discordHeader(discord) {
        return `
            <img class="cuenta-avatar" src="${esc(discord.avatar)}" alt="">
            <div class="cuenta-discord-name">${esc(discord.name)}</div>
        `;
    }

    function logoutButton() {
        return '<button class="cuenta-link-btn" data-action="logout">Cerrar sesión</button>';
    }

    function renderNoVinculado(data) {
        root.innerHTML = `
            <div class="box cuenta-header">
                ${discordHeader(data.discord)}
                <p class="cuenta-aviso">Tu Discord todavía no está vinculado a ninguna cuenta de ARK.</p>
                <p>Ve al canal de vincular en Discord, pulsa <strong>🎯 Vincular</strong> y escribe en el chat
                del juego el comando que te dé el bot (<code>!link CÓDIGO</code>).</p>
                <button class="btn" data-action="reload">Volver a comprobar</button>
                <div>${logoutButton()}</div>
            </div>
        `;
    }

    function noDisponible() {
        return '<p class="cuenta-muted">No disponible ahora mismo</p>';
    }

    function vipCard(vip, sinDatos) {
        let body;
        if (sinDatos.includes('vip')) {
            body = noDisponible();
        } else if (!vip) {
            body = '<p class="cuenta-muted">Sin VIP</p>';
        } else {
            const estados = {
                activo: '',
                pronto: '<span class="cuenta-badge cuenta-badge-warn">Vence pronto</span>',
                expirado: '<span class="cuenta-badge cuenta-badge-bad">Caducado</span>'
            };
            body = `
                <p class="cuenta-big">${esc(vip.plan)}</p>
                ${estados[vip.estado] || ''}
                <p>Desde ${esc(vip.inicio)} · expira ${esc(vip.expira)}</p>
                ${vip.estado !== 'expirado' ? `<p>${esc(vip.diasRestantes)} días restantes</p>` : ''}
            `;
        }
        const cls = vip && !sinDatos.includes('vip') ? ` cuenta-vip-${esc(vip.estado)}` : '';
        return `<div class="box cuenta-card${cls}"><h2>👑 VIP</h2>${body}</div>`;
    }

    function tribuCard(tribu, sinDatos) {
        const body = sinDatos.includes('tribu') ? noDisponible()
            : tribu ? `<p class="cuenta-big">${esc(tribu)}</p>`
            : '<p class="cuenta-muted">No tienes tribu registrada</p>';
        return `<div class="box cuenta-card"><h2>🏰 Tribu</h2>${body}</div>`;
    }

    function neveraCard(nevera, sinDatos) {
        const body = sinDatos.includes('nevera') ? noDisponible()
            : nevera ? `
                <p class="cuenta-big">Nº ${esc(nevera.numero)}</p>
                <p>PIN: <button class="cuenta-pin" data-action="pin" data-pin="${esc(nevera.pin)}"
                    title="Pulsa para mostrar">••••</button></p>
            `
            : '<p class="cuenta-muted">No tienes nevera asignada</p>';
        return `<div class="box cuenta-card"><h2>🧊 Nevera</h2>${body}</div>`;
    }

    function renderVinculado(data) {
        const ark = data.ark;
        const sinDatos = data.sinDatos || [];
        const personaje = ark.personaje && ark.personaje !== ark.nombre
            ? `<div class="cuenta-muted">Personaje: ${esc(ark.personaje)}</div>` : '';
        const estado = data.online
            ? `<span class="cuenta-online">🟢 Conectado en ${esc(data.online)}</span>`
            : '<span class="cuenta-offline">⚪ Desconectado</span>';

        root.innerHTML = `
            <div class="box cuenta-header">
                ${discordHeader(data.discord)}
                <div class="cuenta-ark-name">🦖 ${esc(ark.nombre)}</div>
                ${personaje}
                <p>${estado}</p>
                <p class="cuenta-muted">Vinculado el ${formatDate(ark.vinculadoEn)}${ark.mapaVinculo ? ` en ${esc(ark.mapaVinculo)}` : ''}</p>
                ${logoutButton()}
            </div>

            <div class="cuenta-grid">
                ${vipCard(data.vip, sinDatos)}
                ${tribuCard(data.tribu, sinDatos)}
                ${neveraCard(data.nevera, sinDatos)}
            </div>

            <div class="box cuenta-eos">
                <h2>🆔 EOS ID</h2>
                <code class="cuenta-eos-id">${esc(ark.eos)}</code>
                <button class="btn" data-action="copy" data-eos="${esc(ark.eos)}">Copiar</button>
            </div>
        `;
    }

    async function load() {
        const token = getToken();
        if (!token) {
            renderLogin(mensaje);
            return;
        }

        renderLoading();
        try {
            const res = await fetch(`${API}/public/cuenta`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.status === 401) {
                clearToken();
                renderLogin('Tu sesión ha caducado. Vuelve a entrar con Discord.');
                return;
            }
            if (!res.ok) throw new Error(res.status);

            const data = await res.json();
            if (data.vinculado) renderVinculado(data);
            else renderNoVinculado(data);
        } catch (e) {
            root.innerHTML = `
                <div class="box cuenta-login">
                    <p class="cuenta-aviso">No se ha podido cargar tu cuenta. Inténtalo de nuevo en unos minutos.</p>
                    <button class="btn" data-action="reload">Reintentar</button>
                    <div>${logoutButton()}</div>
                </div>
            `;
        }
    }

    root.addEventListener('click', e => {
        const el = e.target.closest('[data-action]');
        if (!el) return;

        switch (el.dataset.action) {
            case 'reload':
                load();
                break;
            case 'logout':
                clearToken();
                renderLogin('Has cerrado sesión.');
                break;
            case 'pin':
                el.textContent = el.textContent === '••••' ? el.dataset.pin : '••••';
                break;
            case 'copy':
                navigator.clipboard.writeText(el.dataset.eos).then(() => {
                    el.textContent = '¡Copiado!';
                    setTimeout(() => { el.textContent = 'Copiar'; }, 1500);
                });
                break;
        }
    });

    load();
})();
