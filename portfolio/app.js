(() => {
  const P = window.PORTFOLIO;
  const app = document.getElementById('app');
  const $ = (s, r = document) => r.querySelector(s);
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

  /* ---------- generated plan drawing used when a project has no images ---------- */
  function rng(seed) {
    let h = 1779033703 ^ seed.length;
    for (let i = 0; i < seed.length; i++) { h = Math.imul(h ^ seed.charCodeAt(i), 3432918353); h = h << 13 | h >>> 19; }
    return () => { h = Math.imul(h ^ h >>> 16, 2246822507); h = Math.imul(h ^ h >>> 13, 3266489909); return ((h ^= h >>> 16) >>> 0) / 4294967296; };
  }
  function planSVG(seed) {
    const r = rng(seed), W = 400, H = 300;
    let s = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Placeholder plan drawing" preserveAspectRatio="xMidYMid slice"><rect width="${W}" height="${H}" fill="#f3f1ea"/><g stroke="#cfccc1" stroke-width=".5">`;
    for (let x = 0; x <= W; x += 20) s += `<path d="M${x} 0V${H}"/>`;
    for (let y = 0; y <= H; y += 20) s += `<path d="M0 ${y}H${W}"/>`;
    s += `</g><g fill="none" stroke="#16171a" stroke-width="2">`;
    const n = 4 + Math.floor(r() * 3);
    for (let i = 0; i < n; i++) {
      const w = 60 + Math.floor(r() * 5) * 20, h = 40 + Math.floor(r() * 4) * 20;
      const x = 20 + Math.floor(r() * ((W - w - 40) / 20)) * 20, y = 20 + Math.floor(r() * ((H - h - 40) / 20)) * 20;
      s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="rgba(243,241,234,.85)"/>`;
      // door swing
      s += `<path stroke-width="1" stroke="#d9412b" d="M${x + 10} ${y + h}v-18a18 18 0 0 1 18 18z"/>`;
    }
    s += `</g><path d="M20 280h90" stroke="#d9412b" stroke-width="1.5"/><text x="20" y="274" font-family="monospace" font-size="9" fill="#6b6a65">PLAN · ${esc(seed.toUpperCase().slice(0, 22))}</text></svg>`;
    return s;
  }
  const mediaFor = (p, i = 0) => p.images && p.images[i]
    ? `<img src="${esc(p.images[i])}" alt="${esc(p.title)}" loading="lazy">` : planSVG(p.title);

  /* ---------- views ---------- */
  function landing() {
    const L = P.links;
    const chars = w => [...w].map(c => `<span class="ch">${esc(c)}</span>`).join('');
    const door = (n, t, d, href, opts = {}) =>
      `<a class="door ${opts.wide ? 'wide' : ''}" href="${esc(href)}" ${opts.ext ? 'target="_blank" rel="noopener"' : ''}>
        <span class="num">${n}</span>${opts.ext ? '<span class="ext">↗</span>' : ''}
        <div><h2>${t}</h2><p>${d}</p></div><span class="go">${opts.go || 'Enter'} <i>→</i></span></a>`;
    app.innerHTML = `<section class="view">
      <div class="hero">
        <div class="eyebrow">Portfolio</div>
        <h1 class="name" aria-label="${esc(P.name.join(' '))}">${P.name.map(w => `<span class="row" aria-hidden="true">${chars(w)}</span>`).join('')}</h1>
        <div class="tag">${esc(P.tagline)}</div>
      </div>
      <nav class="doors" aria-label="Portfolio sections">
        ${door('01', 'Résumé', 'Experience, education and skills.', L.resume, { ext: true, go: 'Open PDF', wide: true })}
        ${door('02', 'Rosie’s Home', 'My Rural Studio project, on the Rural Studio website.', L.rosie, { ext: true, go: 'Visit', wide: true })}
        ${door('03', 'School Work', 'Studio, research and competitions.', '#/school')}
        ${door('04', 'Professional Work', 'Projects from practice.', '#/work')}
        ${door('05', 'Personal Work', 'Full 9 Yards and my Etsy shop.', '#/personal')}
      </nav>
      <div class="foot"><span>© ${new Date().getFullYear()} ${esc(P.name.join(' '))}</span><span>Move your cursor · hover the letters</span></div>
    </section>`;
    tilt();
  }

  let current = [];
  function projects(key) {
    const sec = P.sections[key];
    current = sec.projects;
    const kinds = [...new Set(sec.projects.map(p => p.kind).filter(Boolean))];
    app.innerHTML = `<section class="view">
      <a class="back" href="#/">← Back</a>
      <h1 class="title">${esc(sec.title)}</h1><p class="blurb">${esc(sec.blurb)}</p>
      <div class="filters">${['All', ...kinds].map((k, i) => `<button class="chip ${i ? '' : 'on'}" data-k="${esc(k)}">${esc(k)}</button>`).join('')}</div>
      <div class="grid" id="grid"></div></section>`;
    const draw = k => {
      const list = sec.projects.map((p, i) => [p, i]).filter(([p]) => k === 'All' || p.kind === k);
      $('#grid').innerHTML = list.length ? list.map(([p, i]) => `
        <button class="card" data-i="${i}"><div class="thumb">${mediaFor(p)}</div>
          <div class="meta"><div class="k"><span>${esc(p.kind)}</span><span>${esc(p.year)}</span></div>
          <h3>${esc(p.title)}</h3><p>${esc(p.place)}</p></div></button>`).join('') : '<div class="empty">Nothing here yet.</div>';
    };
    draw('All');
    $('.filters').onclick = e => {
      const b = e.target.closest('.chip'); if (!b) return;
      document.querySelectorAll('.chip').forEach(c => c.classList.toggle('on', c === b));
      draw(b.dataset.k);
    };
    $('#grid').onclick = e => { const c = e.target.closest('.card'); if (c) openLB(+c.dataset.i, 0); };
  }

  function personal() {
    const sec = P.sections.personal;
    app.innerHTML = `<section class="view">
      <a class="back" href="#/">← Back</a>
      <h1 class="title">${esc(sec.title)}</h1><p class="blurb">${esc(sec.blurb)}</p>
      <div class="doors" style="margin-top:40px">${sec.cards.map((c, i) => `
        <a class="door wide" href="${esc(P.links[c.link])}" target="_blank" rel="noopener">
          <span class="num">0${i + 1}</span><span class="ext">↗</span>
          <div><h2>${esc(c.title)}</h2><p>${esc(c.sub)}</p></div><span class="go">Visit <i>→</i></span></a>`).join('')}</div></section>`;
    tilt();
  }

  /* ---------- lightbox ---------- */
  const lb = $('#lightbox'); let li = 0, lj = 0;
  function showLB() {
    const p = current[li], n = (p.images && p.images.length) || 1;
    $('#lb-media').innerHTML = mediaFor(p, lj);
    $('#lb-cap').innerHTML = `<b>${esc(p.title)}</b>${esc([p.kind, p.place, p.year].filter(Boolean).join(' · '))}<br>${esc(p.desc)}${n > 1 ? `<br>${lj + 1} / ${n}` : ''}`;
    document.querySelectorAll('.lb-nav').forEach(b => b.hidden = n < 2);
  }
  function openLB(i, j) { li = i; lj = j; showLB(); lb.hidden = false; document.body.style.overflow = 'hidden'; }
  function closeLB() { lb.hidden = true; document.body.style.overflow = ''; }
  function step(d) { const n = (current[li].images || []).length; if (n < 2) return; lj = (lj + d + n) % n; showLB(); }
  lb.addEventListener('click', e => {
    if (e.target.closest('.prev')) step(-1);
    else if (e.target.closest('.next')) step(1);
    else if (e.target === lb || e.target.closest('.lb-close')) closeLB();
  });
  addEventListener('keydown', e => {
    if (lb.hidden) return;
    if (e.key === 'Escape') closeLB(); else if (e.key === 'ArrowLeft') step(-1); else if (e.key === 'ArrowRight') step(1);
  });

  /* ---------- 3D tilt on doors/cards ---------- */
  function tilt() {
    if (matchMedia('(hover:none)').matches) return;
    document.querySelectorAll('.door').forEach(d => {
      d.addEventListener('mousemove', e => {
        const r = d.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        d.style.transform = `perspective(700px) rotateX(${-y * 5}deg) rotateY(${x * 6}deg) translate(-3px,-3px)`;
      });
      d.addEventListener('mouseleave', () => d.style.transform = '');
    });
  }

  /* ---------- router ---------- */
  function route() {
    closeLB();
    const h = location.hash.replace(/^#\/?/, '');
    if (h === 'school' || h === 'work') projects(h);
    else if (h === 'personal') personal();
    else landing();
    scrollTo(0, 0);
  }
  addEventListener('hashchange', route);

  /* ---------- interactive drafting background ---------- */
  const cv = $('#bg'), cx = cv.getContext('2d'); let W, H, mx = -1, my = -1, tx = -1, ty = -1;
  const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
  function size() { const d = devicePixelRatio || 1; W = innerWidth; H = innerHeight; cv.width = W * d; cv.height = H * d; cx.setTransform(d, 0, 0, d, 0, 0); }
  addEventListener('resize', size); size();
  addEventListener('pointermove', e => { tx = e.clientX; ty = e.clientY; $('#coords').textContent = `X ${String(Math.round(tx)).padStart(4, '0')} · Y ${String(Math.round(ty)).padStart(4, '0')}`; });
  function frame() {
    if (mx < 0) { mx = tx; my = ty; } else { mx += (tx - mx) * .12; my += (ty - my) * .12; }
    cx.clearRect(0, 0, W, H);
    const g = 48, R = 220;
    // grid lines that brighten/bow near the cursor
    for (let x = 0; x <= W + g; x += g) for (let y = 0; y <= H + g; y += g) {
      const d = mx < 0 ? 1e9 : Math.hypot(x - mx, y - my), k = Math.max(0, 1 - d / R);
      const len = 5 + k * 12;
      cx.strokeStyle = k > 0 ? `rgba(217,65,43,${.25 + k * .7})` : 'rgba(22,23,26,.16)';
      cx.lineWidth = 1;
      cx.beginPath(); cx.moveTo(x - len, y); cx.lineTo(x + len, y); cx.moveTo(x, y - len); cx.lineTo(x, y + len); cx.stroke();
    }
    if (mx >= 0) {
      cx.strokeStyle = 'rgba(217,65,43,.45)'; cx.lineWidth = 1; cx.setLineDash([4, 5]);
      cx.beginPath(); cx.moveTo(mx, 0); cx.lineTo(mx, H); cx.moveTo(0, my); cx.lineTo(W, my); cx.stroke(); cx.setLineDash([]);
      cx.beginPath(); cx.arc(mx, my, 16, 0, 7); cx.stroke();
    }
    if (!reduce) requestAnimationFrame(frame);
  }
  frame();
  if (reduce) addEventListener('pointermove', frame);

  route();
})();
