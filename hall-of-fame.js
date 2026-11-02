(function () {
    const list = document.getElementById('eventsList');
    if (!list) return;

    const BADGES = {
        gold: 'images/badge-gold.svg',
        silver: 'images/badge-silver.svg',
        bronze: 'images/badge-bronze.svg'
    };
    const ORDER = ['gold', 'silver', 'bronze'];
    // Text comes from data/hall-of-fame.json (edited from the bot's panel).
    const esc = t => String(t ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

    fetch('data/hall-of-fame.json')
        .then(res => res.json())
        .then(cfg => {
            const intro = document.getElementById('hofIntro');
            if (intro) intro.textContent = cfg.intro;

            const events = cfg.events || [];

            if (!events.length) {
                list.innerHTML = '<p class="shop-empty">Aún no hay eventos registrados.</p>';
                return;
            }

            list.innerHTML = events.map(e => {
                const winners = [...(e.winners || [])].sort((a, b) => ORDER.indexOf(a.position) - ORDER.indexOf(b.position));
                const dateLabel = e.date
                    ? new Date(e.date + 'T00:00:00').toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })
                    : '';

                return `
                    <div class="box event-card">
                        ${e.image ? `<img class="event-image" src="${esc(e.image)}" alt="${esc(e.title)}">` : ''}
                        <div class="event-header">
                            <h2>${esc(e.title)}</h2>
                            ${dateLabel ? `<span class="event-date">${dateLabel}</span>` : ''}
                        </div>
                        ${e.description ? `<p class="event-desc">${esc(e.description)}</p>` : ''}
                        <div class="podium">
                            ${winners.map(w => `
                                <div class="podium-item podium-${esc(w.position)}">
                                    <img class="badge" src="${BADGES[w.position] || BADGES.bronze}" alt="Medalla ${esc(w.position)}">
                                    <p class="podium-player">${esc(w.player)}</p>
                                    <p class="podium-prize">${esc(w.prize)}</p>
                                </div>
                            `).join('')}
                        </div>
                        ${(e.participants || []).length ? `
                            <div class="participants">
                                <h3>Participantes</h3>
                                <div class="participants-list">
                                    ${e.participants.map(p => `<span class="participant-chip">${esc(p)}</span>`).join('')}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                `;
            }).join('');
        });
})();
