(function () {
    const mapsGrid = document.getElementById('bossMaps');
    if (!mapsGrid) return;

    const browse = document.getElementById('bossBrowse');
    const panel = document.getElementById('bossPanel');
    const back = document.getElementById('bossBack');
    const mapImage = document.getElementById('bossMapImage');
    const mapName = document.getElementById('bossMapName');
    const bossList = document.getElementById('bossList');

    function listHtml(label, items) {
        if (!items || !items.length) return '';
        return `
            <span class="price-label">${label}</span>
            <ul>${items.map(i => `<li>${i}</li>`).join('')}</ul>
        `;
    }

    function difficultyHtml(d) {
        return `
            <div class="boss-difficulty">
                <h4>${d.label}${d.level ? ` <span>· Nivel mín. ${d.level}</span>` : ''}</h4>
                ${listHtml('🎁 TRIBUTOS', d.tributes)}
                ${listHtml('🔓 ENGRAMAS TEK', d.tek)}
            </div>
        `;
    }

    function bossHtml(b) {
        const diffs = b.difficulties || [];
        return `
            <div class="box boss-card">
                <div class="boss-head">
                    <h3>${b.name}</h3>
                    ${b.type ? `<span class="shop-tag">${b.type}</span>` : ''}
                </div>
                ${b.summon ? `<p class="boss-summon">📍 ${b.summon}</p>` : ''}
                ${diffs.length ? `<div class="boss-difficulties">${diffs.map(difficultyHtml).join('')}</div>` : ''}
                ${b.tips ? `<p class="boss-tips">💡 ${b.tips}</p>` : ''}
            </div>
        `;
    }

    function openMap(m) {
        mapImage.src = m.image;
        mapImage.alt = m.name;
        mapName.textContent = m.name;
        const bosses = m.bosses || [];
        bossList.innerHTML = bosses.length
            ? bosses.map(bossHtml).join('')
            : '<div class="box"><p>Este mapa no tiene jefes.</p></div>';

        browse.hidden = true;
        panel.hidden = false;
        window.scrollTo({ top: panel.offsetTop - 100, behavior: 'smooth' });
    }

    function closeMap() {
        panel.hidden = true;
        browse.hidden = false;
    }

    back.addEventListener('click', closeMap);

    fetch('data/jefes.json')
        .then(res => res.json())
        .then(cfg => {
            (cfg.maps || []).forEach(m => {
                const count = (m.bosses || []).length;
                const card = document.createElement('button');
                card.type = 'button';
                card.className = 'boss-map-card';
                card.innerHTML = `
                    <div class="map-card"><img src="${m.image}" alt="${m.name}"></div>
                    <span class="boss-map-label">${m.name} · ${count} ${count === 1 ? 'jefe' : 'jefes'}</span>
                `;
                card.addEventListener('click', () => openMap(m));
                mapsGrid.appendChild(card);
            });
        });
})();
