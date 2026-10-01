(function () {
    const grid = document.getElementById('guideGrid');
    if (!grid) return;

    const PLACEHOLDER = 'images/dino-placeholder.svg';
    const METHOD_ICONS = { 'Noqueo': '💤', 'Pasivo': '🤝', 'Especial': '✨' };

    const tipsGrid = document.getElementById('guideTips');
    const searchInput = document.getElementById('guideSearch');
    const filterSelect = document.getElementById('guideFilter');
    const browse = document.getElementById('shopBrowse');
    const detailPanel = document.getElementById('detailPanel');
    const detailBack = document.getElementById('detailBack');
    const detailImage = document.getElementById('detailImage');
    const detailName = document.getElementById('detailName');
    const detailTag = document.getElementById('detailTag');
    const guideInfo = document.getElementById('guideInfo');

    let dinos = [];

    function methodLabel(m) {
        return (METHOD_ICONS[m] ? METHOD_ICONS[m] + ' ' : '') + m;
    }

    function renderTips(sections) {
        tipsGrid.innerHTML = (sections || []).map(s => `
            <div class="box">
                <h2>${s.title}</h2>
                ${(s.items || []).map(i => `<p>${i}</p>`).join('')}
            </div>
        `).join('');
    }

    function buildFilterOptions() {
        const methods = [...new Set(dinos.map(d => d.method).filter(Boolean))].sort();
        methods.forEach(m => {
            const opt = document.createElement('option');
            opt.value = m;
            opt.textContent = methodLabel(m);
            filterSelect.appendChild(opt);
        });
    }

    function renderGrid() {
        const term = (searchInput.value || '').toLowerCase().trim();
        const filter = filterSelect.value;
        grid.innerHTML = '';

        const results = dinos.filter(d =>
            d.name.toLowerCase().includes(term) && (!filter || d.method === filter)
        );

        if (!results.length) {
            const empty = document.createElement('p');
            empty.className = 'shop-empty';
            empty.textContent = 'No se encontraron dinos con esos filtros.';
            grid.appendChild(empty);
            return;
        }

        results.forEach(d => {
            const card = document.createElement('div');
            card.className = 'box dino-card';
            card.innerHTML = `
                <span class="shop-tag">${methodLabel(d.method)}</span>
                <img src="${d.image || PLACEHOLDER}" alt="${d.name}" loading="lazy">
                <h3>${d.name}</h3>
                <button type="button" class="btn">Cómo tamear</button>
            `;
            const img = card.querySelector('img');
            img.addEventListener('error', () => { img.src = PLACEHOLDER; }, { once: true });
            card.addEventListener('click', () => openDetail(d));
            grid.appendChild(card);
        });
    }

    function infoRow(icon, label, value) {
        if (!value) return '';
        return `
            <div class="box guide-row">
                <span class="price-label">${icon} ${label}</span>
                <p>${value}</p>
            </div>
        `;
    }

    function openDetail(d) {
        detailImage.src = d.image || PLACEHOLDER;
        detailImage.alt = d.name;
        detailImage.addEventListener('error', () => { detailImage.src = PLACEHOLDER; }, { once: true });
        detailName.textContent = d.name;
        detailTag.textContent = methodLabel(d.method);

        guideInfo.innerHTML =
            infoRow('🍖', 'COMIDA FAVORITA', d.food) +
            infoRow('🎯', 'CÓMO NOQUEARLO / TAMEARLO', d.knockout) +
            infoRow('📍', 'DÓNDE ENCONTRARLO', d.location) +
            infoRow('💡', 'CONSEJOS', d.tips) +
            (d.dododex ? `<a class="btn" href="${d.dododex}" target="_blank" rel="noopener">🧮 Calcular en Dododex</a>` : '');

        browse.hidden = true;
        tipsGrid.hidden = true;
        detailPanel.hidden = false;
        window.scrollTo({ top: detailPanel.offsetTop - 100, behavior: 'smooth' });
    }

    function closeDetail() {
        detailPanel.hidden = true;
        browse.hidden = false;
        tipsGrid.hidden = false;
    }

    searchInput.addEventListener('input', renderGrid);
    filterSelect.addEventListener('change', renderGrid);
    detailBack.addEventListener('click', closeDetail);

    fetch('data/guia.json')
        .then(res => res.json())
        .then(cfg => {
            dinos = cfg.dinos || [];
            renderTips(cfg.sections);
            buildFilterOptions();
            renderGrid();
        });
})();
