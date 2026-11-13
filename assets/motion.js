/* Cinematic motion: spotlight hero, word light-up, pinned horizontal track */
(function () {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const hero = document.querySelector('.hero');

  // 1. spotlight follows the cursor (touch / reduced motion: CSS drift or static)
  if (hero && fine && !reduce) {
    let tx = 50, ty = 45, x = 50, y = 45;
    hero.classList.add('follow');
    hero.addEventListener('pointermove', e => {
      const r = hero.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width * 100; ty = (e.clientY - r.top) / r.height * 100;
    });
    (function loop() {
      x += (tx - x) * 0.08; y += (ty - y) * 0.08;
      hero.style.setProperty('--x', x + '%'); hero.style.setProperty('--y', y + '%');
      requestAnimationFrame(loop);
    })();
  }

  // 2. words light up as the paragraph scrolls through the viewport
  document.querySelectorAll('[data-words]').forEach(el => {
    const words = el.textContent.trim().split(/\s+/);
    el.textContent = '';
    words.forEach(w => { const s = document.createElement('span'); s.className = 'w'; s.textContent = w + ' '; el.appendChild(s); });
    if (reduce) { el.classList.add('static'); return; }
    const spans = el.querySelectorAll('.w');
    const update = () => {
      const r = el.getBoundingClientRect(), vh = innerHeight;
      const p = Math.min(1, Math.max(0, (vh * 0.8 - r.top) / (r.height + vh * 0.35)));
      const lit = Math.round(p * spans.length);
      spans.forEach((s, i) => s.classList.toggle('lit', i < lit));
    };
    addEventListener('scroll', update, { passive: true }); update();
  });

  // 3. pinned horizontal track (desktop only; mobile uses native swipe)
  const pin = document.querySelector('.pin'), track = document.querySelector('.track');
  const mq = matchMedia('(min-width: 900px)');
  function sizePin() {
    if (!pin || !track) return;
    if (!mq.matches || reduce) { pin.style.height = ''; track.style.transform = ''; return; }
    const dist = track.scrollWidth - innerWidth + 80;
    pin.style.height = (innerHeight + Math.max(0, dist)) + 'px';
    pin.dataset.dist = dist;
  }
  function movePin() {
    if (!pin || !mq.matches || reduce) return;
    const r = pin.getBoundingClientRect(), dist = +pin.dataset.dist || 0;
    const p = Math.min(1, Math.max(0, -r.top / (pin.offsetHeight - innerHeight)));
    track.style.transform = `translate3d(${-p * dist}px,0,0)`;
  }
  sizePin(); movePin();
  addEventListener('resize', () => { sizePin(); movePin(); });
  addEventListener('scroll', movePin, { passive: true });

  // header turns solid after hero
  const top = document.querySelector('.top');
  addEventListener('scroll', () => top.classList.toggle('solid', scrollY > innerHeight * 0.6), { passive: true });
})();
