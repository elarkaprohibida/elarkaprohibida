(function () {
    const grid = document.getElementById('galeriaGrid');
    if (!grid) return;

    const visor = document.getElementById('visor');
    const visorImg = document.getElementById('visorImg');
    const visorTitulo = document.getElementById('visorTitulo');
    const CARPETA = 'images/galeria/';

    let fotos = [];
    let actual = 0;

    const escapar = texto => String(texto || '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

    fetch('data/galeria.json')
        .then(res => res.json())
        .then(cfg => {
            const intro = document.getElementById('galeriaIntro');
            if (intro) intro.textContent = cfg.intro;

            fotos = cfg.fotos || [];

            if (!fotos.length) {
                grid.innerHTML = '<p class="shop-empty">Aún no hay capturas.</p>';
                return;
            }

            grid.innerHTML = fotos.map((f, i) => `
                <button class="galeria-item" data-i="${i}">
                    <img src="${CARPETA}thumbs/${escapar(f.archivo)}" alt="${escapar(f.titulo)}" loading="lazy">
                    ${f.titulo ? `<span class="galeria-titulo">${escapar(f.titulo)}</span>` : ''}
                </button>
            `).join('');
        });

    function mostrar(i) {
        actual = (i + fotos.length) % fotos.length;
        const f = fotos[actual];
        visorImg.src = CARPETA + f.archivo;
        visorImg.alt = f.titulo || '';
        visorTitulo.textContent = f.titulo || '';
        // Load the neighbours ahead so the arrows feel instant.
        [actual + 1, actual - 1].forEach(j => {
            new Image().src = CARPETA + fotos[(j + fotos.length) % fotos.length].archivo;
        });
    }

    function abrir(i) {
        mostrar(i);
        visor.hidden = false;
        document.body.style.overflow = 'hidden';
    }

    function cerrar() {
        visor.hidden = true;
        visorImg.removeAttribute('src');
        document.body.style.overflow = '';
    }

    grid.addEventListener('click', e => {
        const item = e.target.closest('.galeria-item');
        if (item) abrir(Number(item.dataset.i));
    });

    document.getElementById('visorCerrar').addEventListener('click', cerrar);
    document.getElementById('visorAnterior').addEventListener('click', () => mostrar(actual - 1));
    document.getElementById('visorSiguiente').addEventListener('click', () => mostrar(actual + 1));

    // A click on the dark background (not the photo or buttons) closes it.
    visor.addEventListener('click', e => {
        if (e.target === visor) cerrar();
    });

    document.addEventListener('keydown', e => {
        if (visor.hidden) return;
        if (e.key === 'Escape') cerrar();
        if (e.key === 'ArrowLeft') mostrar(actual - 1);
        if (e.key === 'ArrowRight') mostrar(actual + 1);
    });

    // Swipe on phones.
    let inicioX = null;
    visor.addEventListener('touchstart', e => { inicioX = e.touches[0].clientX; }, { passive: true });
    visor.addEventListener('touchend', e => {
        if (inicioX === null) return;
        const dx = e.changedTouches[0].clientX - inicioX;
        inicioX = null;
        if (Math.abs(dx) > 50) mostrar(actual + (dx < 0 ? 1 : -1));
    });
})();
