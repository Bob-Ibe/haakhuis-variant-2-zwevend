/* ===================================================================
   Variant 2 · zwevend
   Technische hero met zwevend carnavalsitem, draden en naalden eromheen,
   flikkerende koppen, item-wissel en uit elkaar schuivende stoflagen.
   =================================================================== */
window.addEventListener('hh:ready', () => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));

  /* ---------- flikkerende koppen (tekst die zich "ontcijfert") ---------- */
  const GLYPHS = 'ABCDEFGHIJKLMNOPRSTUVWXYZ0123456789#*+<>/';
  function scramble(el) {
    if (reduced) return;
    const nodes = [];
    (function walk(n) { n.childNodes.forEach((c) => { if (c.nodeType === 3 && c.textContent.trim()) nodes.push({ n: c, txt: c.textContent }); else if (c.nodeType === 1) walk(c); }); })(el);
    const start = performance.now(), dur = 900;
    (function tick(now) {
      const p = clamp((now - start) / dur);
      nodes.forEach(({ n, txt }) => {
        const keep = Math.floor(txt.length * p);
        n.textContent = txt.split('').map((ch, i) => (i < keep || ch === ' ' || ch === '.' ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0])).join('');
      });
      if (p < 1) requestAnimationFrame(tick); else nodes.forEach(({ n, txt }) => { n.textContent = txt; });
    })(start);
  }
  const io = new IntersectionObserver((en) => en.forEach((e) => { if (e.isIntersecting) { scramble(e.target); io.unobserve(e.target); } }), { threshold: .4 });
  document.querySelectorAll('[data-scramble]').forEach((el) => io.observe(el));

  /* ---------- draden en naalden rond het item ---------- */
  const threads = document.querySelector('.tech-threads');
  if (threads) {
    let out = '';
    for (let i = 0; i < 26; i++) {
      const a = (i / 26) * Math.PI * 2 + (i % 2) * .09, r0 = 150 + (i % 3) * 14, r1 = 250 + ((i * 37) % 90);
      const x0 = 400 + Math.cos(a) * r0, y0 = 400 + Math.sin(a) * r0, x1 = 400 + Math.cos(a) * r1, y1 = 400 + Math.sin(a) * r1;
      const cx = 400 + Math.cos(a + .25) * (r0 + r1) / 2, cy = 400 + Math.sin(a + .25) * (r0 + r1) / 2;
      out += `<path class="th" style="--d:${(i % 7) * .35}s" d="M${x0.toFixed(1)} ${y0.toFixed(1)} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${x1.toFixed(1)} ${y1.toFixed(1)}"/>`;
      if (i % 3 === 0) out += `<g class="ndl" transform="translate(${x1.toFixed(1)} ${y1.toFixed(1)}) rotate(${(a * 180 / Math.PI).toFixed(1)})"><path d="M0 0 L26 0"/><ellipse cx="3" cy="0" rx="2.6" ry="1.2"/></g>`;
    }
    threads.innerHTML = out;
  }

  /* ---------- zwevend item: kantelen met de muis + wisselen ---------- */
  const stage = document.querySelector('.tech-stage'), item = document.querySelector('.tech-item');
  if (stage && item && !reduced) {
    let tx = 0, ty = 0, rx = 0, ry = 0;
    addEventListener('pointermove', (e) => { tx = e.clientX / innerWidth - .5; ty = e.clientY / innerHeight - .5; });
    (function loop() {
      rx += (tx - rx) * .06; ry += (ty - ry) * .06;
      stage.style.setProperty('--rx', `${(-ry * 10).toFixed(2)}deg`);
      stage.style.setProperty('--ry', `${(rx * 16).toFixed(2)}deg`);
      requestAnimationFrame(loop);
    })();
  }
  const label = document.querySelector('.tech-name');
  document.querySelectorAll('.tech-thumbs button').forEach((b) => b.addEventListener('click', () => {
    document.querySelectorAll('.tech-thumbs button').forEach((x) => x.setAttribute('aria-pressed', x === b));
    item.classList.add('is-swap');
    setTimeout(() => {
      item.src = b.dataset.src; item.alt = b.dataset.name;
      item.onload = () => item.classList.remove('is-swap');
      if (label) { label.textContent = b.dataset.name; scramble(label); }
    }, 260);
  }));

  /* ---------- stoflagen die uit elkaar schuiven ---------- */
  const sec = document.querySelector('.layers-sec');
  if (sec) {
    const layers = [...sec.querySelectorAll('.layer')], tags = [...sec.querySelectorAll('.layer-tag')];
    const update = () => {
      const r = sec.getBoundingClientRect();
      const p = reduced ? 1 : clamp(-r.top / Math.max(1, r.height - innerHeight));
      const e = p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      const spread = innerWidth < 1000 ? 52 : 110;
      layers.forEach((l, i) => l.style.setProperty("--z", `${((layers.length - 1) / 2 - i) * (14 + e * spread)}px`));
      tags.forEach((t, i) => t.classList.toggle('is-on', p > .18 + i * .14));
      sec.style.setProperty('--lp', p.toFixed(3));
    };
    addEventListener('scroll', update, { passive: true }); addEventListener('resize', update); update();
  }
});
