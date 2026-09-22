(function () {
    const welcomeTitle = document.getElementById('welcomeTitle');
    if (!welcomeTitle) return;

    fetch('data/homepage.json')
        .then(res => res.json())
        .then(home => {
            welcomeTitle.textContent = home.welcomeTitle;

            const welcomeText = document.getElementById('welcomeText');
            welcomeText.innerHTML = home.welcomeText.map(p => `<p>${p}</p>`).join('');

            const mapsGrid = document.getElementById('mapsGrid');
            mapsGrid.innerHTML = (home.mapasFijos || []).map(m => `
                <div class="map-card">
                    <img src="${m.image}" alt="${m.name}">
                </div>
            `).join('');

            const rotativos = document.getElementById('mapsRotativos');
            if (rotativos) {
                rotativos.innerHTML = (home.mapasRotativos || []).map(g => `
                    <div class="rotativos-group">
                        <h4 class="rotativos-label">${g.label}</h4>
                        <div class="maps-grid rotativos-grid">
                            ${(g.maps || []).map(m => `
                                <div class="map-card">
                                    <img src="${m.image}" alt="${m.name}">
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `).join('');
            }

            const featuresList = document.getElementById('featuresList');
            featuresList.innerHTML = home.features.map(f => `<p>${f}</p>`).join('');

            const modList = document.getElementById('modList');
            modList.innerHTML = home.mods.map(m => `
                <div class="mod-item">
                    <img src="${m.icon}" alt="${m.name}">
                    <span>${m.name}</span>
                </div>
            `).join('');
        });
})();
