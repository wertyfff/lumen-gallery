(() => {
  'use strict';

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  // Заглушки Lorem Picsum, отобранные по теме: природа, люди, города
  const POOL = [10, 11, 13, 15, 16, 17, 18, 19, 27, 29, 33, 37, 46, 49, 54, 57, 59, 62, 65, 66, 70, 71, 74, 75,
    77, 81, 83, 85, 89, 90, 93, 94, 95, 103, 109, 110, 112, 116, 118, 127, 128, 140, 142, 152, 155, 163, 165,
    168, 169, 170, 173, 174, 176, 177, 182, 186, 190, 191, 193, 195, 197, 199, 200, 203, 204, 206, 212, 216,
    217, 219, 227, 231, 235, 243, 244, 253, 259, 277, 287, 288, 289, 301, 305, 306, 316, 322, 324, 325, 330,
    335, 337, 348, 349, 361, 369, 374, 375, 381, 388, 390, 395, 397, 399, 412, 413, 416, 419];
  const pic = (id, w, h) => `https://picsum.photos/id/${typeof id === 'number' ? id : POOL[id % POOL.length]}/${w}/${h}`;
  const poolPick = (seed, i) => POOL[(seed * 7 + i * 13) % POOL.length];
  const SVGNS = 'http://www.w3.org/2000/svg';
  const SWATCH = ['#d69b3e', '#5f8763', '#5a7580', '#9b8b73', '#337c83', '#cb9a56'];

  const CHAPTERS = [
    'Where images find you',
    'What makes an image great',
    'Beauty is in the details',
    "Why we're better",
    'Quality',
    'Freedom',
    'Originality',
    'Gallery'
  ];

  gsap.registerPlugin(ScrollTrigger);
  // адресная строка мобильных браузеров не должна пересчитывать все анимации
  ScrollTrigger.config({ ignoreMobileResize: true });
  const IG = 'https://www.instagram.com/sqaurex/';

  // детерминированный генератор, чтобы раскладка не менялась между загрузками
  const rng = (seed) => {
    let s = (seed * 2654435761) >>> 0 || 1;
    return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  };

  const svg = (tag, attrs, parent) => {
    const el = document.createElementNS(SVGNS, tag);
    for (const k in attrs) el.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(el);
    return el;
  };

  /* ---------- Плавный скролл ---------- */
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  const scrollToEl = (el) => {
    if (lenis) lenis.scrollTo(el, { duration: 1.6 });
    else el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  };

  /* ---------- Разбиение текста ---------- */
  // Оборачивает слова в span.w; вложенные элементы, кроме <em>, остаются единым словом
  function splitWords(root, cls = 'w') {
    const out = [];
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            const s = document.createElement('span');
            s.className = cls; s.textContent = part;
            frag.appendChild(s); out.push(s);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) {
          if (n.tagName === 'EM' || n.tagName === 'BR') { if (n.tagName === 'EM') walk(n); }
          else { n.classList.add(cls); out.push(n); }
        }
      });
    };
    walk(root);
    return out;
  }

  // Слова в масках для появления снизу
  function splitMasked(root) {
    const words = splitWords(root, 'wm-in');
    words.forEach((w) => {
      const m = document.createElement('span');
      m.className = 'wm';
      m.style.cssText = 'display:inline-block;overflow:hidden;vertical-align:top;padding-bottom:.08em;margin-bottom:-.08em';
      w.style.display = 'inline-block';
      w.replaceWith(m); m.appendChild(w);
    });
    return words;
  }

  /* ---------- HERO ---------- */
  // [seed, left vw, top vh, width vw, height vw]
  const FRONT = [
    [129, 36.5, 27.8, 33, 21.8],
    [162, 12.6, 51.5, 13.3, 9.9],
    [24, 24, 58.7, 19.9, 12.4],
    [76, 66.2, 51.8, 16.4, 13],
    [107, 6.8, 78, 8.6, 6.5],
    [164, 74.9, 17, 8.6, 6.1],
    [292, 88.7, 12, 4.4, 3.2]
  ];
  const BACK = [
    [106, 13, 88, 7, 5],
    [124, 33, 86, 17.8, 12],
    [167, 67, 92, 7, 5],
    [64, 84, 86, 14.7, 17],
    [29, 56, 6, 6, 4.4],
    [18, 3, 30, 5, 3.6]
  ];
  const heroFront = $('.hero__front');
  const heroBack = $('.hero__back');
  const makeHeroImg = ([seed, l, t, w, h], parent, i) => {
    const d = document.createElement('div');
    d.className = 'hero__img';
    d.style.cssText = `left:${l}vw;top:${t}vh;width:${w}vw;height:${h}vw`;
    d.innerHTML = `<img src="${pic(seed, Math.round(w * 22), Math.round(h * 22))}" alt="" ${i < 2 ? '' : 'loading="lazy"'}>`;
    d.dataset.cx = l + w / 2;
    d.dataset.cy = t + (h * innerWidth / innerHeight) / 2;
    parent.appendChild(d);
    return d;
  };
  const frontImgs = FRONT.map((d, i) => makeHeroImg(d, heroFront, i));
  const backImgs = BACK.map((d, i) => makeHeroImg(d, heroBack, i + 5));

  const titleSpans = $$('.hero__title .line > span');
  const intro = gsap.timeline({ paused: true, defaults: { ease: 'expo.out' } });
  intro.fromTo(titleSpans, { yPercent: 110 }, { yPercent: 0, duration: 1.6, stagger: 0.09 }, 0.1)
    .fromTo(frontImgs, { clipPath: 'inset(50% 50% 50% 50%)', scale: 1.15 }, { clipPath: 'inset(0% 0% 0% 0%)', scale: 1, duration: 1.4, stagger: 0.07 }, 0.55)
    .fromTo(backImgs, { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 1.2, stagger: 0.05 }, 0.9)
    .fromTo(['.header', '.menu-btn', '.rail', '.report-pill'], { opacity: 0, y: -12 }, { opacity: 1, y: 0, duration: 1, stagger: 0.06, clearProps: 'opacity,transform' }, 1);
  intro.progress(0);

  /* ---------- Экран загрузки ---------- */
  (() => {
    const loader = $('.loader');
    const words = $$('.loader__words span');
    const rays = $$('.loader .mark__rays path');
    const shotsBox = $('.loader__shots');
    const SHOTS = [1015, 129, 28, 308, 64, 1039, 162, 1018, 400];
    const shots = SHOTS.map((id) => {
      const im = new Image();
      im.src = pic(id, 780, 520); im.alt = '';
      shotsBox.appendChild(im);
      return im;
    });
    if (lenis) lenis.stop();
    scrollTo(0, 0);

    // ждём шрифты и фото первого экрана
    const imgs = $$('.hero img, .cine__panel--1 img').concat(shots.slice(0, 3));
    let done = 0;
    const total = imgs.length + 1;
    const bump = () => { done++; };
    imgs.forEach((img) => {
      if (img.complete) bump();
      else { img.addEventListener('load', bump, { once: true }); img.addEventListener('error', bump, { once: true }); }
    });
    document.fonts.ready.then(bump);

    gsap.set(rays, { strokeDasharray: 1, strokeDashoffset: 1 });
    gsap.set(words, { yPercent: 110 });

    const tl = gsap.timeline();
    tl.from('.loader__frame', { y: 30, opacity: 0, duration: 1.1, ease: 'expo.out' }, 0)
      .from('.loader .mark__l', { y: 16, opacity: 0, duration: 0.9, ease: 'expo.out' }, 0.35)
      .to(rays, { strokeDashoffset: 0, duration: 0.7, stagger: 0.1, ease: 'power2.out' }, 0.75);
    words.forEach((w, i) => {
      tl.to(w, { yPercent: 0, duration: 0.5, ease: 'expo.out' }, 0.6 + i * 0.6);
      if (i < words.length - 1) tl.to(w, { yPercent: -110, duration: 0.5, ease: 'expo.in' }, 0.6 + i * 0.6 + 0.4);
    });

    // фото сменяют друг друга, пока грузится сайт
    let k = 0;
    const flick = setInterval(() => {
      shots.forEach((im, i) => im.classList.toggle('is-on', i === k % shots.length));
      k++;
    }, reduce ? 600 : 220);

    const minTime = new Promise((r) => setTimeout(r, reduce ? 300 : 2800));
    const loaded = new Promise((r) => {
      const check = () => (done >= total ? r() : setTimeout(check, 100));
      check();
      setTimeout(r, 7000);
    });

    Promise.all([minTime, loaded]).then(() => {
      // фото останавливаются, всё плавно гаснет до чистого экрана, затем проявляется сайт
      clearInterval(flick);
      const out = gsap.timeline({
        onComplete: () => {
          loader.remove();
          document.documentElement.classList.remove('is-loading');
          if (lenis) lenis.start();
          ScrollTrigger.refresh();
        }
      });
      out.to('.loader__frame', { opacity: 0, duration: 0.7, ease: 'power2.inOut' }, 0.25)
        .to('.loader__brand', { opacity: 0, y: -10, duration: 0.8, ease: 'power2.inOut' }, 0.35)
        .to(loader, { opacity: 0, duration: 0.9, ease: 'power2.inOut' }, 1.25)
        .add(() => intro.play(), 1.35);
    });
  })();

  const heroTl = gsap.timeline({
    scrollTrigger: { trigger: '.hero__pin', start: 'top top', end: '+=100%', pin: true, scrub: 0.6, invalidateOnRefresh: true }
  });
  frontImgs.forEach((el) => {
    heroTl.to(el, {
      x: () => (el.dataset.cx - 50) * 1.6 * innerWidth / 100,
      y: () => (el.dataset.cy - 50) * 1.6 * innerHeight / 100,
      scale: 1.7, opacity: 0, ease: 'power2.in', duration: 0.5
    }, 0);
  });
  heroTl.to(backImgs, { y: () => -innerHeight * 0.5, opacity: 0, ease: 'power1.in', duration: 0.6, stagger: 0.02 }, 0)
    .to('.hero__title', { y: () => -innerHeight * 0.36, color: '#bdb8af', ease: 'power1.inOut', duration: 0.65 }, 0.35);

  gsap.fromTo('.intro__line i', { scaleY: 0 }, {
    scaleY: 1, ease: 'none',
    scrollTrigger: { trigger: '.intro', start: 'top 92%', end: 'top 55%', scrub: true }
  });

  /* ---------- Разлетающиеся фото ---------- */
  $$('.scatter').forEach((box) => {
    const r = rng(+box.dataset.seed || 1);
    const n = +box.dataset.count || 10;
    for (let i = 0; i < n; i++) {
      const item = document.createElement('div');
      item.className = 'scatter__item';
      const isBlock = r() < 0.38;
      let w, h;
      if (isBlock) {
        w = 14 + r() * 26; h = w * (0.65 + r() * 0.3);
        item.innerHTML = `<span style="display:block;width:100%;height:100%;background:${SWATCH[Math.floor(r() * SWATCH.length)]}"></span>`;
      } else {
        w = 44 + r() * 120; h = w * (0.65 + r() * 0.55);
        item.innerHTML = `<span style="display:block;width:100%;height:100%;overflow:hidden"><img src="${pic(poolPick(+box.dataset.seed, i), Math.round(w * 2), Math.round(h * 2))}" alt="" loading="lazy"></span>`;
      }
      item.style.cssText = `left:${2 + r() * 88}%;top:${4 + r() * 86}%;width:${w}px;height:${h}px`;
      item.dataset.speed = (0.4 + r() * 1.4).toFixed(2);
      box.appendChild(item);
    }
    if (reduce) return;
    $$('.scatter__item', box).forEach((item) => {
      const sp = +item.dataset.speed;
      // на телефоне амплитуда меньше, чтобы фото не заезжали на текст
      const amp = () => sp * innerHeight * (innerWidth < 900 ? 0.12 : 0.35);
      gsap.fromTo(item, { y: () => amp() }, {
        y: () => -amp(), ease: 'none',
        scrollTrigger: { trigger: box, start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true }
      });
      gsap.from(item.firstElementChild, {
        scale: 0, duration: 0.9, ease: 'expo.out',
        scrollTrigger: { trigger: item, start: 'top 98%', toggleActions: 'play none none reverse' }
      });
    });
  });

  /* ---------- Кольцо из фото ---------- */
  (() => {
    const ring = $('.ring');
    const r = rng(+ring.dataset.seed);
    const N = 16;
    const items = [];
    const pos = [];
    for (let i = 0; i < N; i++) {
      const el = document.createElement('div');
      el.className = 'ring__item';
      const block = i % 4 === 3;
      const w = block ? 16 + r() * 16 : 38 + r() * 46;
      const h = w * (0.68 + r() * 0.3);
      el.style.width = w + 'px'; el.style.height = h + 'px';
      el.style.marginLeft = -w / 2 + 'px'; el.style.marginTop = -h / 2 + 'px';
      el.innerHTML = block
        ? `<span style="display:block;width:100%;height:100%;background:${SWATCH[i % SWATCH.length]}"></span>`
        : `<img src="${pic(poolPick(5, i), Math.round(w * 2), Math.round(h * 2))}" alt="" loading="lazy">`;
      ring.appendChild(el);
      items.push(el);
      const a = (i / N) * Math.PI * 2 - Math.PI / 2 + (r() - 0.5) * 0.3;
      pos.push({ a, k: 0.8 + r() * 0.45 });
    }
    const R = () => Math.min(innerWidth, innerHeight) * 0.34;
    const px = (i, m) => Math.cos(pos[i].a) * R() * pos[i].k * m * 1.3;
    const py = (i, m) => Math.sin(pos[i].a) * R() * pos[i].k * m;
    const text = $('.ring-sec__text');

    const tl = gsap.timeline({
      scrollTrigger: { trigger: '.ring-sec__pin', start: 'top top', end: '+=300%', pin: true, scrub: 0.8, invalidateOnRefresh: true }
    });
    tl.fromTo(items, { x: (i) => px(i, 0.4), y: (i) => py(i, 0.4), scale: 0, opacity: 0 },
      { x: (i) => px(i, 1), y: (i) => py(i, 1), scale: 1, opacity: 1, duration: 0.3, stagger: 0.025, ease: 'power3.out' }, 0)
      .to(ring, { rotation: 40, duration: 1, ease: 'none' }, 0)
      .to(items, { rotation: -40, duration: 1, ease: 'none' }, 0)
      .fromTo(text.children, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.15, stagger: 0.05 }, 0.08)
      .to(items, { x: (i) => px(i, 2.6), y: (i) => py(i, 2.6), opacity: 0, scale: 1.4, duration: 0.25, stagger: 0.008, ease: 'power2.in' }, 0.72)
      .to(text, { opacity: 0, y: -40, duration: 0.12 }, 0.84);
  })();

  /* ---------- Слова, проявляющиеся при скролле ---------- */
  $$('.words').forEach((p) => {
    const words = splitWords(p);
    gsap.fromTo(words, { opacity: 0.14 }, {
      opacity: 1, stagger: 0.1, ease: 'none',
      scrollTrigger: { trigger: p, start: 'top 82%', end: 'bottom 50%', scrub: true }
    });
  });

  $$('.reveal-lines').forEach((h) => {
    const words = splitMasked(h);
    gsap.from(words, {
      yPercent: 110, duration: 1.1, ease: 'expo.out', stagger: 0.035,
      scrollTrigger: { trigger: h, start: 'top 88%', toggleActions: 'play none none reverse' }
    });
  });

  $$('.fade-up').forEach((el) => {
    gsap.from(el, {
      y: 40, opacity: 0, duration: 1.2, ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none reverse' }
    });
  });

  // Gallup «+»
  const plus = $('.gallup__plus');
  plus.addEventListener('click', () => plus.setAttribute('aria-expanded', plus.getAttribute('aria-expanded') === 'true' ? 'false' : 'true'));

  /* ---------- Кинематографичный скролл ---------- */
  (() => {
    const p1 = $('.cine__panel--1'), p2 = $('.cine__panel--2'), p3 = $('.cine__panel--3');
    const [img1, img2, img3] = [p1, p2, p3].map((p) => $('.cine__img', p));

    // сетка-«созвездие» для 7 из 10
    const net = $('.viz-net');
    const lines = [], nodes = [];
    const NN = 10;
    for (let i = 0; i < NN; i++) {
      const a = (i / NN) * Math.PI * 2 - Math.PI / 2;
      const rr = 150 + ((i * 37) % 90);
      const x = 300 + Math.cos(a) * rr, y = 300 + Math.sin(a) * rr;
      const filled = i < 7;
      if (filled) lines.push(svg('line', { x1: 300, y1: 300, x2: x, y2: y, class: 'ln', pathLength: 1 }, net));
      nodes.push(svg('circle', { cx: x, cy: y, r: filled ? 9 : 11, class: filled ? 'node' : 'node node--hollow' }, net));
    }

    $$('.cine .pill--abs, .sbs .pill--abs, .dcard .pill--abs').forEach((p) => gsap.set(p, { xPercent: -50, yPercent: -50 }));
    gsap.set($$('.draw, .ln', $('.cine')), { strokeDasharray: 1, strokeDashoffset: 1 });
    // раскрытие начинается, пока секция въезжает в экран, и заканчивается, когда она прилипает
    gsap.fromTo(p1, { clipPath: 'inset(10% 6% 10% 6% round 14px)' }, {
      clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none',
      scrollTrigger: { trigger: '.cine', start: 'top 90%', end: 'top top', scrub: true }
    });
    gsap.fromTo(img1, { scale: 1.25 }, {
      scale: 1, ease: 'none',
      scrollTrigger: { trigger: '.cine', start: 'top bottom', end: 'top top', scrub: true }
    });
    gsap.set([p2, p3], { clipPath: 'inset(100% 0% 0% 0%)' });

    const words2 = splitWords($('.split-words', p2));
    const pill3 = $('.pill--abs', p3);
    const st1 = $('.cine__stat', p1).children, st3 = $('.cine__stat', p3).children;
    const bars = $$('.chart__bar', p2), barPills = $$('.chart .pill', p2);

    const tl = gsap.timeline({
      defaults: { ease: 'power2.out' },
      scrollTrigger: { trigger: '.cine', start: 'top top', end: 'bottom bottom', scrub: 0.7 }
    });
    tl.from(st1, { yPercent: 80, opacity: 0, duration: 0.8, stagger: 0.15 }, 0.4)
      .to(img1, { yPercent: -4, duration: 2.6, ease: 'none' }, 0)
      .to(p2, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.2, ease: 'power2.inOut' }, 3)
      .to(img1, { yPercent: -10, duration: 1.2, ease: 'power2.inOut' }, 3)
      .fromTo(img2, { yPercent: 12 }, { yPercent: 0, duration: 1.2, ease: 'power2.inOut' }, 3)
      .from($('.chart__head', p2), { opacity: 0, y: 10, duration: 0.4 }, 4.1)
      .from(bars, { scaleX: 0, duration: 0.6, stagger: 0.12 }, 4.2)
      .from(barPills, { scale: 0, duration: 0.3, stagger: 0.08, ease: 'back.out(2)' }, 4.8)
      .fromTo(words2, { opacity: 0.15 }, { opacity: 1, duration: 0.8, stagger: 0.04, ease: 'none' }, 4.3)
      .to(p3, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.2, ease: 'power2.inOut' }, 6.6)
      .to(img2, { yPercent: -10, duration: 1.2, ease: 'power2.inOut' }, 6.6)
      .fromTo(img3, { yPercent: 12 }, { yPercent: 0, duration: 1.2, ease: 'power2.inOut' }, 6.6)
      .to(lines, { strokeDashoffset: 0, duration: 0.5, stagger: 0.06 }, 7.8)
      .from(nodes, { scale: 0, transformOrigin: '50% 50%', duration: 0.3, stagger: 0.05, ease: 'back.out(2)' }, 8)
      .from(pill3, { scale: 0, duration: 0.35, ease: 'back.out(2)' }, 8.4)
      .from(st3, { yPercent: 80, opacity: 0, duration: 0.6, stagger: 0.15 }, 8.2)
      .to({}, { duration: 1 }, 9.4);
  })();

  /* ---------- Бок о бок ---------- */
  (() => {
    const sec = $('.sbs');
    const card = $('.sbs__card', sec);
    const half = $('.sbs__half', sec), full = $('.sbs__full', sec);
    gsap.set($$('.draw', sec), { strokeDasharray: 1, strokeDashoffset: 1 });
    const tl = gsap.timeline({
      defaults: { ease: 'power2.out' },
      scrollTrigger: { trigger: sec, start: 'top top', end: 'bottom bottom', scrub: 0.7 }
    });
    tl.from(card, { y: () => innerHeight * 0.3, scale: 0.82, duration: 1, ease: 'power2.inOut' }, 0)
      .from('.sbs__stat--left', { opacity: 0, x: -40, duration: 0.6 }, 0.8)
      .to($('.draw', half), { strokeDashoffset: 0, duration: 0.8, ease: 'power1.inOut' }, 1)
      .from($$('.node', half), { scale: 0, transformOrigin: '50% 50%', duration: 0.3, stagger: 0.5 }, 1)
      .from('.sbs__pill1', { scale: 0, duration: 0.3, ease: 'back.out(2)' }, 1.6)
      .to($('.sbs__img--2', sec), { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.2, ease: 'power2.inOut' }, 2.8)
      .to('.sbs__img--1 img', { yPercent: -12, duration: 1.2, ease: 'power2.inOut' }, 2.8)
      .to([half, '.sbs__pill1'], { opacity: 0, duration: 0.4 }, 2.8)
      .to('.sbs__stat--left', { opacity: 0, x: -40, duration: 0.5 }, 2.8)
      .from('.sbs__stat--right', { opacity: 0, x: 40, duration: 0.6 }, 3.6)
      .to($('.draw', full), { strokeDashoffset: 0.36, duration: 0.9, ease: 'power1.inOut' }, 3.8)
      .from($('.dash-ring', full), { opacity: 0, rotation: -90, transformOrigin: '50% 50%', duration: 0.9 }, 3.8)
      .from($('.node', full), { scale: 0, transformOrigin: '50% 50%', duration: 0.3 }, 3.8)
      .from('.sbs__pill2', { scale: 0, duration: 0.3, ease: 'back.out(2)' }, 4.4)
      .to({}, { duration: 1.2 }, 4.8);
  })();

  /* ---------- Список 04 ---------- */
  gsap.from('.limits__list li', {
    opacity: 0, x: -30, duration: 1, ease: 'expo.out', stagger: 0.15,
    scrollTrigger: { trigger: '.limits__list', start: 'top 80%', toggleActions: 'play none none reverse' }
  });

  /* ---------- Карточки с данными ---------- */
  const buildViz = (el) => {
    const type = el.dataset.viz;
    const parts = { draw: [], pop: [], dot: [] };
    if (type === 'arc') {
      parts.draw.push(svg('circle', { cx: 150, cy: 105, r: 68, class: 'draw', pathLength: 1, transform: 'rotate(-90 150 105)' }, el));
      parts.pop.push(svg('circle', { cx: 150, cy: 37, r: 5, class: 'node' }, el));
      parts.pop.push(svg('circle', { cx: 179, cy: 167, r: 6, class: 'node' }, el));
    } else if (type === 'ring') {
      parts.pop.push(svg('circle', { cx: 140, cy: 110, r: 82, class: 'dash-ring' }, el));
      parts.draw.push(svg('circle', { cx: 140, cy: 110, r: 70, class: 'draw', pathLength: 1 }, el));
      parts.pop.push(svg('circle', { cx: 210, cy: 110, r: 7, class: 'node' }, el));
      parts.pop.push(svg('circle', { cx: 70, cy: 110, r: 3, class: 'node' }, el));
    } else if (type === 'half') {
      parts.draw.push(svg('path', { d: 'M150 35 A70 70 0 1 1 100 154', class: 'draw', pathLength: 1 }, el));
      parts.draw.push(svg('path', { d: 'M150 35 L150 105 L100 154', class: 'draw', pathLength: 1 }, el));
      parts.pop.push(svg('circle', { cx: 100, cy: 154, r: 6, class: 'node' }, el));
    } else if (type === 'grid') {
      for (let i = 0; i < 10; i++) {
        const c = svg('circle', { cx: 78 + (i % 5) * 36, cy: 92 + Math.floor(i / 5) * 36, r: 18, class: 'draw', pathLength: 1 }, el);
        c.style.strokeWidth = 1.2; parts.draw.push(c);
      }
    } else if (type === 'venn') {
      [[100, 95], [150, 95], [200, 95]].forEach(([x, y]) => {
        const c = svg('circle', { cx: x, cy: y, r: 42, class: 'draw', pathLength: 1 }, el);
        c.style.strokeWidth = 1.2; parts.draw.push(c);
      });
    } else if (type === 'slider') {
      parts.draw.push(svg('path', { d: 'M40 150 H260', class: 'draw', pathLength: 1 }, el));
      parts.draw.push(svg('rect', { x: 40, y: 142, width: 220, height: 16, class: 'draw', pathLength: 1 }, el));
      parts.pop.push(svg('circle', { cx: 260, cy: 150, r: 7, class: 'node' }, el));
      const d = svg('circle', { cx: 40, cy: 150, r: 11, fill: '#e7e72b' }, el);
      parts.dot.push(d);
    } else if (type === 'bars') {
      [[50, 40], [105, 62], [160, 48], [215, 56]].forEach(([x, v]) => {
        const h = v * 2;
        const b = svg('rect', { x, y: 160 - h, width: 34, height: h, class: 'draw', pathLength: 1 }, el);
        b.style.strokeWidth = 1.2;
        parts.draw.push(b);
        parts.pop.push(svg('circle', { cx: x + 17, cy: 160 - h, r: 7, fill: '#e7e72b' }, el));
      });
    } else if (type === 'dots') {
      [[120, 120], [180, 120]].forEach(([x, y]) => {
        const c = svg('circle', { cx: x, cy: y, r: 40, class: 'dash-ring' }, el);
        parts.pop.push(c);
      });
      parts.pop.push(svg('circle', { cx: 175, cy: 62, r: 22, class: 'dash-ring' }, el));
      parts.dot.push(svg('circle', { cx: 175, cy: 62, r: 10, fill: '#e7e72b' }, el));
    }
    return parts;
  };

  $$('.cards').forEach((wrap) => {
    $$('.dcard', wrap).forEach((card) => {
      const sp = parseFloat(getComputedStyle(card).getPropertyValue('--sp')) || 1;
      const viz = $('.viz-card', card);
      const parts = buildViz(viz);
      const pill = $('.pill--abs', card);
      const txt = $('.dcard__txt', card);

      if (!reduce && innerWidth > 900) {
        gsap.fromTo(card, { y: () => sp * innerHeight * 0.18 }, {
          y: () => -sp * innerHeight * 0.18, ease: 'none',
          scrollTrigger: { trigger: wrap, start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true }
        });
      }
      gsap.fromTo($('img', card), { yPercent: -6 }, {
        yPercent: 6, ease: 'none',
        scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: true }
      });

      if (parts.draw.length) gsap.set(parts.draw, { strokeDasharray: 1, strokeDashoffset: 1 });
      const tl = gsap.timeline({
        paused: true, defaults: { ease: 'power2.out' }
      });
      tl.from(card, { clipPath: 'inset(20% 20% 20% 20%)', duration: 1.1, ease: 'expo.out' }, 0)
        .from(txt.children, { y: 30, opacity: 0, duration: 0.8, stagger: 0.1, ease: 'expo.out' }, 0.5);
      if (parts.draw.length) tl.to(parts.draw, { strokeDashoffset: viz.dataset.viz === 'arc' ? 0.43 : 0, duration: 1.2, stagger: 0.08 }, 0.35);
      if (parts.pop.length) tl.from(parts.pop, { scale: 0, opacity: 0, transformOrigin: '50% 50%', duration: 0.5, stagger: 0.1, ease: 'back.out(2)' }, 0.6);
      if (parts.dot.length) tl.from(parts.dot, { scale: 0, transformOrigin: '50% 50%', duration: 0.5, ease: 'back.out(2)' }, 0.9);
      if (viz.dataset.viz === 'slider') tl.to(parts.dot, { attr: { cx: 165 }, duration: 1.2, ease: 'power3.inOut' }, 1);
      if (pill) tl.from(pill, { scale: 0, duration: 0.5, ease: 'back.out(2)' }, 0.9);

      ScrollTrigger.create({
        trigger: card, start: 'top 85%',
        onEnter: () => tl.play(), onLeaveBack: () => tl.reverse()
      });
    });
  });

  /* ---------- Тёмные итоги ---------- */
  $$('.summary').forEach((sec) => {
    const r = rng(+sec.dataset.seed);
    const col = $('.summary__col', sec);
    const inner = document.createElement('div');
    inner.className = 'summary__col-inner';
    for (let i = 0; i < 9; i++) {
      const w = Math.round(58 + r() * 52), h = Math.round(w * (0.7 + r() * 0.6));
      inner.insertAdjacentHTML('beforeend',
        `<img src="${pic(poolPick(+sec.dataset.seed, i), w * 2, h * 2)}" alt="" loading="lazy" style="width:${w}px;height:${h}px;margin-left:${Math.round((r() - 0.5) * 30)}px">`);
    }
    col.appendChild(inner);

    const panel = $('.summary__panel', sec);
    const blocks = $$('.summary__block', sec);
    const double = blocks.length > 1;
    if (double) gsap.set(blocks[1], { autoAlpha: 0 });

    const total = double ? 6 : 4;
    const tl = gsap.timeline({
      defaults: { ease: 'power2.out' },
      scrollTrigger: { trigger: sec, start: 'top top', end: 'bottom bottom', scrub: 0.7, invalidateOnRefresh: true }
    });
    tl.fromTo(panel, { clipPath: 'inset(18% 8% 18% 8%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1, ease: 'power2.inOut' }, 0)
      .fromTo(inner, { y: () => innerHeight }, { y: () => -inner.offsetHeight, duration: total, ease: 'none' }, 0)
      .fromTo(blocks[0].children, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.12 }, 0.35);
    if (double) {
      tl.to(blocks[0], { autoAlpha: 0, y: -30, duration: 0.5 }, 2.8)
        .fromTo(blocks[1], { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.6 }, 3.2);
    }
    tl.to(panel, { clipPath: 'inset(0% 4% 0% 4%)', duration: 0.8, ease: 'power2.in' }, total - 0.8);
  });

  /* ---------- Цитата ---------- */
  gsap.from('.quote__text .line > span', {
    yPercent: 110, duration: 1.2, ease: 'expo.out', stagger: 0.07,
    scrollTrigger: { trigger: '.quote__text', start: 'top 75%', toggleActions: 'play none none reverse' }
  });
  gsap.from(['.quote__mark', '.quote__text cite'], {
    opacity: 0, y: 20, duration: 1, stagger: 0.4,
    scrollTrigger: { trigger: '.quote__text', start: 'top 75%', toggleActions: 'play none none reverse' }
  });
  gsap.fromTo('.quote__photo', { clipPath: 'inset(30% 20% 30% 20%)' }, {
    clipPath: 'inset(0% 0% 0% 0%)', ease: 'none',
    scrollTrigger: { trigger: '.quote__photo', start: 'top 95%', end: 'center 55%', scrub: true }
  });
  gsap.fromTo('.quote__photo img', { scale: 1.25 }, {
    scale: 1, ease: 'none',
    scrollTrigger: { trigger: '.quote__photo', start: 'top bottom', end: 'bottom top', scrub: true }
  });

  /* ---------- Фон страницы ---------- */
  $$('[data-bg]').forEach((el) => {
    ScrollTrigger.create({
      trigger: el, start: 'top 55%', end: 'bottom 55%',
      onToggle: (self) => self.isActive && gsap.to(document.body, { backgroundColor: el.dataset.bg, duration: 0.8, overwrite: 'auto' })
    });
  });

  /* ---------- Тёмный интерфейс над фото ---------- */
  $$('.cine, .summary').forEach((el) => {
    ScrollTrigger.create({
      trigger: el, start: 'top 40px', end: 'bottom 40px',
      onToggle: (self) => document.body.classList.toggle('is-dark-ui', self.isActive)
    });
  });

  ScrollTrigger.create({
    trigger: '.footer', start: 'top 85%', end: 'max',
    onToggle: (self) => document.body.classList.toggle('at-footer', self.isActive)
  });

  /* ---------- Шапка прячется при скролле вниз ---------- */
  const header = $('.header');
  let headerHidden = false;
  ScrollTrigger.create({
    start: 0, end: 'max',
    onUpdate: (self) => {
      // анимацию запускаем только при смене состояния, а не на каждом кадре
      const hide = self.direction === 1 && self.scroll() > 120;
      if (hide === headerHidden) return;
      headerHidden = hide;
      gsap.to(header, { yPercent: hide ? -160 : 0, duration: 0.5, ease: 'power3.out', overwrite: 'auto' });
    }
  });

  /* ---------- Главы: рейл и плашка ---------- */
  const dotsList = $('.rail__dots');
  const railList = $('.rail__list');
  const firstOf = (n) => $(`[data-chapter="${n}"]`);
  CHAPTERS.forEach((name, i) => {
    const n = i + 1;
    const li = document.createElement('li');
    li.innerHTML = `<button type="button" aria-label="Chapter ${n}: ${name}"></button>`;
    li.firstChild.addEventListener('click', () => scrollToEl(firstOf(n)));
    dotsList.appendChild(li);
    const a = document.createElement('a');
    a.href = '#'; a.innerHTML = `<span>${String(n).padStart(2, '0')}</span>${name}`;
    a.addEventListener('click', (e) => { e.preventDefault(); scrollToEl(firstOf(n)); });
    railList.appendChild(a);
  });
  const cur = $('.report-pill__cur');
  let current = 0;
  const setChapter = (n) => {
    if (n === current) return;
    const dir = n > current ? 1 : -1;
    current = n;
    $$('li', dotsList).forEach((li, i) => li.classList.toggle('is-active', i === n - 1));
    $$('a', railList).forEach((a, i) => a.classList.toggle('is-active', i === n - 1));
    $$('.menu__list a').forEach((a) => a.classList.toggle('is-current', +a.dataset.go === n));
    gsap.timeline()
      .to(cur, { yPercent: -60 * dir, opacity: 0, duration: 0.18, ease: 'power2.in' })
      .add(() => { cur.textContent = String(n).padStart(2, '0'); })
      .fromTo(cur, { yPercent: 60 * dir, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.3, ease: 'power2.out' });
  };
  $$('[data-chapter]').forEach((el) => {
    ScrollTrigger.create({
      trigger: el, start: 'top 50%', end: 'bottom 50%',
      onToggle: (self) => self.isActive && setChapter(+el.dataset.chapter)
    });
  });
  setChapter(1);

  /* ---------- Меню ---------- */
  const menuBtn = $('.menu-btn');
  const menu = $('#menu');
  const setMenu = (open) => {
    document.body.classList.toggle('menu-open', open);
    menuBtn.setAttribute('aria-expanded', open);
    menu.setAttribute('aria-hidden', !open);
    if (lenis) open ? lenis.stop() : lenis.start();
    if (open) {
      gsap.from($$('.menu__list li', menu), { y: 16, opacity: 0, duration: 0.6, stagger: 0.05, ease: 'expo.out', delay: 0.1 });
      $('.menu__close', menu).focus();
    } else menuBtn.focus();
  };
  menuBtn.addEventListener('click', () => setMenu(true));
  $('.menu__close').addEventListener('click', () => setMenu(false));
  $('.menu-mask').addEventListener('click', () => setMenu(false));
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && document.body.classList.contains('menu-open')) setMenu(false); });
  // любые ссылки с data-go ведут к главе
  $$('[data-go]').forEach((a) => a.addEventListener('click', (e) => {
    e.preventDefault();
    const n = +a.dataset.go;
    if (document.body.classList.contains('menu-open')) setMenu(false);
    scrollToEl(n === 8 ? $('#gallery') : n === 1 ? document.body : firstOf(n));
  }));
  $('.logo').addEventListener('click', (e) => { e.preventDefault(); scrollToEl(document.body); });

  const rail = $('.rail');
  $('.rail__icon').addEventListener('click', () => rail.classList.toggle('is-open'));
  document.addEventListener('click', (e) => { if (!rail.contains(e.target)) rail.classList.remove('is-open'); });

  /* ---------- Галерея ---------- */
  (() => {
    const CATS = {
      nature: { name: 'Nature', color: '#5f8763', words: 'nature forest grass field flowers tree trees leaves green plants',
        ids: [10, 11, 15, 17, 18, 19, 28, 54, 62, 70, 81, 83, 89, 94, 95, 106, 107, 110, 112, 118, 127, 140, 152, 167, 168, 170, 174, 190, 216, 217, 227, 229, 243, 253, 255, 277, 289, 306, 324, 335, 337, 388, 400, 412, 413] },
      mountains: { name: 'Mountains', color: '#9b8b73', words: 'mountains mountain rocks peak canyon desert hills landscape',
        ids: [29, 46, 66, 79, 121, 128, 166, 191, 231, 235, 251, 256, 260, 287, 293, 296, 327, 353, 377, 393, 406, 416] },
      sea: { name: 'Sea', color: '#005b94', words: 'sea ocean water coast beach pier waves lake river',
        ids: [12, 13, 14, 16, 37, 50, 74, 124, 147, 162, 176, 179, 199, 213, 215, 244, 266, 269, 270, 271, 273, 295, 323, 350, 374, 381, 384, 385] },
      city: { name: 'City', color: '#5a7580', words: 'city street buildings architecture bridge road night urban',
        ids: [43, 57, 61, 122, 155, 164, 188, 212, 214, 238, 242, 257, 259, 274, 283, 288, 299, 308, 320, 322, 351, 369, 371, 376, 382, 391, 392, 397, 398, 402, 405, 410, 411, 419, 420] },
      people: { name: 'People', color: '#d69b3e', words: 'people person portrait woman man life',
        ids: [22, 27, 64, 65, 91, 129, 177, 203, 319, 325, 334, 338, 342, 348, 349, 375, 389, 390, 395, 399] },
      minimal: { name: 'Minimal', color: '#cb9a56', words: 'minimal minimalism objects desk coffee book work still life',
        ids: [20, 24, 26, 30, 36, 48, 60, 63, 96, 119, 201, 252, 300, 302, 312, 326, 357, 366, 370] }
    };
    const FAV_KEY = 'luch-favs';
    let favs = new Set();
    try { favs = new Set(JSON.parse(localStorage.getItem(FAV_KEY) || '[]')); } catch (e) { /* хранилище недоступно */ }
    const saveFavs = () => { try { localStorage.setItem(FAV_KEY, JSON.stringify([...favs])); } catch (e) { /* ничего */ } };

    // перемешиваем темы, чтобы лента была разнообразной
    const all = [];
    const keys = Object.keys(CATS);
    const maxLen = Math.max(...keys.map((k) => CATS[k].ids.length));
    for (let i = 0; i < maxLen; i++) keys.forEach((k) => { const id = CATS[k].ids[i]; if (id != null) all.push({ id, cat: k }); });

    const meta = {};
    const grid = $('.masonry');
    const chipsBox = $('.chips');
    const moreBtn = $('.more-btn');
    const empty = $('.gallery__empty');
    const input = $('.search input');
    const PAGE = 24;
    let filter = 'all', query = '', shown = 0, list = all;

    const chipDefs = [['all', 'All', null], ...keys.map((k) => [k, CATS[k].name, CATS[k].color]), ['fav', '♥ Favorites', null]];
    chipDefs.forEach(([k, label, color]) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'chip'; b.setAttribute('role', 'tab');
      b.setAttribute('aria-selected', k === 'all');
      b.innerHTML = (color ? `<span class="chip__dot" style="background:${color}"></span>` : '') + label;
      b.addEventListener('click', () => {
        filter = k;
        $$('.chip', chipsBox).forEach((c) => c.setAttribute('aria-selected', c === b));
        render(true);
      });
      chipsBox.appendChild(b);
    });

    const ratio = (id) => (meta[id] ? meta[id].height / meta[id].width : [0.66, 1.25, 0.75, 1.4][id % 4]);
    const esc = (v) => String(v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const authorOf = (id) => esc(meta[id] ? meta[id].author : 'Unsplash photographer');

    const matches = (item) => {
      if (filter === 'fav' && !favs.has(item.id)) return false;
      if (filter !== 'all' && filter !== 'fav' && item.cat !== filter) return false;
      if (!query) return true;
      const c = CATS[item.cat];
      return (c.name + ' ' + c.words + ' ' + (meta[item.id] ? meta[item.id].author : '')).toLowerCase().includes(query);
    };

    const setFavBtn = (btn, id) => {
      btn.setAttribute('aria-pressed', favs.has(id));
      btn.setAttribute('aria-label', favs.has(id) ? 'Remove from favorites' : 'Add to favorites');
    };
    const toggleFav = (id) => {
      favs.has(id) ? favs.delete(id) : favs.add(id);
      saveFavs();
      $$(`.tile[data-id="${id}"] .fav-btn`).forEach((b) => setFavBtn(b, id));
      if (lb.id === id) setFavBtn($('.lightbox__fav'), id);
    };

    const tile = (item, index) => {
      const w = 600, h = Math.round(w * ratio(item.id));
      const f = document.createElement('figure');
      f.className = 'tile'; f.dataset.id = item.id;
      f.innerHTML = `
        <img src="https://picsum.photos/id/${item.id}/${w}/${h}" width="${w}" height="${h}" alt="${CATS[item.cat].name} photo by ${authorOf(item.id)}" loading="lazy">
        <button class="tile__open" type="button" aria-label="Open photo: ${CATS[item.cat].name}, by ${authorOf(item.id)}"></button>
        <figcaption class="tile__over">
          <span class="tile__top"><span class="tile__tag">${CATS[item.cat].name}</span><button type="button" class="fav-btn">♥</button></span>
          <span class="tile__author">${authorOf(item.id)}</span>
        </figcaption>
        <a class="tile__dl" href="${IG}" target="_blank" rel="noopener" aria-label="Download photo by ${authorOf(item.id)}"><svg viewBox="0 0 16 16"><path d="M8 2v9M4 7.5 8 11.5l4-4M3 14h10"/></svg></a>`;
      const img = $('img', f);
      const onLoad = () => img.classList.add('is-loaded');
      img.complete ? onLoad() : img.addEventListener('load', onLoad, { once: true });
      const fb = $('.fav-btn', f);
      setFavBtn(fb, item.id);
      fb.addEventListener('click', (e) => { e.stopPropagation(); toggleFav(item.id); });
      $('.tile__open', f).addEventListener('click', () => openLb(index));
      return f;
    };

    function render(reset) {
      if (reset) {
        grid.innerHTML = ''; shown = 0;
        list = all.filter(matches);
      }
      const next = list.slice(shown, shown + PAGE);
      const nodes = next.map((it, i) => tile(it, shown + i));
      nodes.forEach((n) => grid.appendChild(n));
      shown += next.length;
      moreBtn.hidden = shown >= list.length;
      empty.hidden = list.length > 0;
      if (!reduce) gsap.fromTo(nodes, { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 1, stagger: 0.04, ease: 'expo.out' });
      ScrollTrigger.refresh();
    }

    moreBtn.addEventListener('click', () => render(false));
    let t;
    input.addEventListener('input', () => {
      clearTimeout(t);
      t = setTimeout(() => {
        query = input.value.trim().toLowerCase();
        // поиск идёт по всей галерее, кроме избранного
        if (query && filter !== 'all' && filter !== 'fav') {
          filter = 'all';
          $$('.chip', chipsBox).forEach((c, i) => c.setAttribute('aria-selected', i === 0));
        }
        render(true);
      }, 200);
    });

    /* Просмотр */
    const lbEl = $('.lightbox');
    const lbImg = $('.lightbox__figure img');
    const lb = { index: -1, id: null, opener: null };
    function showLb(i) {
      lb.index = (i + list.length) % list.length;
      const item = list[lb.index];
      lb.id = item.id;
      const m = meta[item.id];
      const w = 1600, h = Math.round(w * ratio(item.id));
      lbImg.src = `https://picsum.photos/id/${item.id}/${w}/${h}`;
      lbImg.alt = `${CATS[item.cat].name} photo by ${authorOf(item.id)}`;
      $('.lightbox__author').innerHTML = m && m.url
        ? `Photo by <a href="${esc(m.url)}" target="_blank" rel="noopener">${authorOf(item.id)}</a>`
        : `Photo by ${authorOf(item.id)}`;
      setFavBtn($('.lightbox__fav'), item.id);
      gsap.fromTo(lbImg, { opacity: 0, scale: 0.97 }, { opacity: 1, scale: 1, duration: 0.6, ease: 'expo.out' });
    }
    function openLb(i) {
      lb.opener = document.activeElement;
      lbEl.hidden = false;
      if (lenis) lenis.stop();
      document.documentElement.style.overflow = 'hidden';
      gsap.fromTo(lbEl, { opacity: 0 }, { opacity: 1, duration: 0.4 });
      showLb(i);
      $('.lightbox__close').focus();
    }
    function closeLb() {
      gsap.to(lbEl, { opacity: 0, duration: 0.3, onComplete: () => { lbEl.hidden = true; } });
      if (lenis) lenis.start();
      document.documentElement.style.overflow = '';
      if (lb.opener) lb.opener.focus();
      lb.id = null;
    }
    $('.lightbox__close').addEventListener('click', closeLb);
    $('.lightbox__nav--prev').addEventListener('click', () => showLb(lb.index - 1));
    $('.lightbox__nav--next').addEventListener('click', () => showLb(lb.index + 1));
    $('.lightbox__fav').addEventListener('click', () => toggleFav(lb.id));
    lbEl.addEventListener('click', (e) => { if (e.target === lbEl) closeLb(); });
    // свайп на телефоне
    let sx = null;
    lbEl.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; }, { passive: true });
    lbEl.addEventListener('touchend', (e) => {
      if (sx === null) return;
      const d = e.changedTouches[0].clientX - sx;
      if (Math.abs(d) > 50) showLb(lb.index + (d < 0 ? 1 : -1));
      sx = null;
    });
    addEventListener('keydown', (e) => {
      if (lbEl.hidden) return;
      if (e.key === 'Escape') closeLb();
      if (e.key === 'ArrowLeft') showLb(lb.index - 1);
      if (e.key === 'ArrowRight') showLb(lb.index + 1);
    });

    // реальные данные о снимках (автор, размеры, ссылка на оригинал)
    const pages = [1, 2, 3, 4, 5].map((p) =>
      fetch(`https://picsum.photos/v2/list?page=${p}&limit=100`).then((r) => r.json()).catch(() => []));
    const timeout = new Promise((r) => setTimeout(() => r(null), 5000));
    Promise.race([Promise.all(pages), timeout]).then((res) => {
      if (res) res.flat().forEach((d) => { meta[+d.id] = d; });
      render(true);
    });
  })();

  addEventListener('load', () => ScrollTrigger.refresh());
  addEventListener('beforeunload', () => scrollTo(0, 0));
})();
