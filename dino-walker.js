(function () {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Pixel-art T-rex facing right; '#' = filled pixel
    const BODY = [
        '............########',
        '...........##.#######',
        '...........##########',
        '...........##########',
        '...........##########',
        '...........#####',
        '...........########',
        '#.........#####',
        '#........#######',
        '##.....##########',
        '###...#############',
        '##############...#',
        '##############',
        '.############',
        '..###########',
        '...#########',
        '....#######'
    ];
    const LEGS = [
        ['.....##..##', '.....#...##', '.....#', '.....##'],
        ['.....##..##', '.....##...#', '..........#', '..........##']
    ];
    const PX = 3;
    const COLS = 22;
    const ROWS = BODY.length + 4;

    function rects(rows, offsetY) {
        let out = '';
        rows.forEach((row, y) => {
            [...row].forEach((c, x) => {
                if (c === '#') out += `<rect x="${x}" y="${y + offsetY}" width="1" height="1"/>`;
            });
        });
        return out;
    }

    const dino = document.createElement('div');
    dino.className = 'dino-walker';
    dino.title = '¡Rawr!';
    dino.style.width = COLS * PX + 'px';
    dino.style.height = ROWS * PX + 'px';
    dino.innerHTML =
        `<svg viewBox="0 0 ${COLS} ${ROWS}" shape-rendering="crispEdges">` +
        rects(BODY, 0) +
        LEGS.map((legs, i) => `<g class="dino-legs dino-legs-${i}">${rects(legs, BODY.length)}</g>`).join('') +
        '</svg>';
    document.body.appendChild(dino);

    const SPEED = 70; // px per second
    let x = Math.random() * (document.documentElement.clientWidth - COLS * PX);
    let dir = Math.random() < 0.5 ? 1 : -1;
    let pausedUntil = 0;
    let last = performance.now();
    let stepTime = 0;
    let frame = 0;

    function maybePause(now) {
        if (Math.random() < 0.003) pausedUntil = now + 1500 + Math.random() * 2500;
    }

    function tick(now) {
        const dt = Math.min((now - last) / 1000, 0.1);
        last = now;
        const maxX = document.documentElement.clientWidth - COLS * PX;

        if (now >= pausedUntil) {
            x += dir * SPEED * dt;
            if (x <= 0) { x = 0; dir = 1; }
            if (x >= maxX) { x = maxX; dir = -1; }

            stepTime += dt;
            if (stepTime > 0.15) {
                stepTime = 0;
                frame = 1 - frame;
                dino.dataset.frame = frame;
            }
            maybePause(now);
        } else {
            dino.dataset.frame = 0;
        }

        dino.style.transform = `translateX(${x}px) scaleX(${dir})`;
        requestAnimationFrame(tick);
    }

    dino.addEventListener('click', () => {
        if (dino.classList.contains('jumping')) return;
        dino.classList.add('jumping');
        setTimeout(() => dino.classList.remove('jumping'), 600);
    });

    requestAnimationFrame(tick);
})();
