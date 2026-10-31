/* Shah Reuse & Trading Enterprise - site behaviour (no libraries) */
(function () {
  var doc = document.documentElement, body = document.body;
  doc.classList.add('js');

  // mobile menu
  var btn = document.querySelector('.menu-btn'), nav = document.getElementById('site-nav');
  function setMenu(open) {
    var h = document.querySelector('.site-header');
    if (open && h) doc.style.setProperty('--navtop', Math.max(0, h.getBoundingClientRect().bottom) + 'px');
    body.classList.toggle('menu-open', open);
    if (btn) btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  if (btn && nav) {
    btn.addEventListener('click', function () { setMenu(!body.classList.contains('menu-open')); });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
    window.addEventListener('resize', function () { if (window.innerWidth > 1400) setMenu(false); });
  }

  // glass header + reading progress bar + back-to-top
  var hdr = document.querySelector('.site-header'), top = document.querySelector('.totop'),
      bar = document.querySelector('.progress span'), ticking = false;
  function onScroll() {
    ticking = false;
    var y = window.scrollY || 0, max = doc.scrollHeight - window.innerHeight;
    if (hdr) hdr.classList.toggle('scrolled', y > 10);
    if (top) top.classList.toggle('show', y > 700);
    if (bar) bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(y / max, 1) : 0) + ')';
  }
  function requestTick() { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }
  window.addEventListener('scroll', requestTick, { passive: true });
  window.addEventListener('resize', requestTick);
  onScroll();
  if (top) top.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });

  // reveal on scroll + number count-up
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function countUp(el) {
    var to = parseFloat(el.getAttribute('data-count')), from = parseFloat(el.getAttribute('data-from') || 0);
    if (reduce || isNaN(to)) return;
    var start = null, dur = 1400;
    function tick(t) {
      if (!start) start = t;
      var p = Math.min((t - start) / dur, 1), v = from + (to - from) * (1 - Math.pow(1 - p, 3));
      el.textContent = Math.round(v);
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  var items = document.querySelectorAll('.reveal, [data-count]');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('in');
        if (en.target.hasAttribute('data-count')) countUp(en.target);
        io.unobserve(en.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('in'); });
  }

  // when opened from disk (file://) folder links need an explicit index.html
  if (location.protocol === 'file:') {
    document.querySelectorAll('a[href]').forEach(function (a) {
      var h = a.getAttribute('href');
      if (/^(https?:|mailto:|tel:|#)/.test(h)) return;
      var parts = h.split('#');
      if (/\/$/.test(parts[0])) parts[0] += 'index.html';
      a.setAttribute('href', parts.join('#'));
    });
  }

  // gallery lightbox
  var lb = document.getElementById('lightbox');
  if (lb && typeof lb.showModal === 'function') {
    var links = Array.prototype.slice.call(document.querySelectorAll('.gal-item > a')), cur = 0,
        img = lb.querySelector('img'), cap = lb.querySelector('.lb-cap'), cred = lb.querySelector('.lb-credit');
    function show(i) {
      cur = (i + links.length) % links.length;
      var a = links[cur];
      img.src = a.getAttribute('href'); img.alt = a.querySelector('img').alt;
      cap.textContent = a.getAttribute('data-cap'); cred.textContent = a.getAttribute('data-credit');
    }
    links.forEach(function (a, i) { a.addEventListener('click', function (e) { e.preventDefault(); show(i); lb.showModal(); }); });
    lb.querySelector('.lb-close').addEventListener('click', function () { lb.close(); });
    lb.querySelector('.lb-prev').addEventListener('click', function () { show(cur - 1); });
    lb.querySelector('.lb-next').addEventListener('click', function () { show(cur + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) lb.close(); });
    lb.addEventListener('keydown', function (e) { if (e.key === 'ArrowLeft') show(cur - 1); if (e.key === 'ArrowRight') show(cur + 1); });
  }

  // footer year
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  // enquiry form -> opens the visitor's email app with the message filled in (static site, no server)
  var form = document.getElementById('enquiry');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var f = form.elements, type = f.type.value;
      var lines = [
        'Name: ' + f.name.value,
        'Company: ' + (f.company.value || '-'),
        'Country: ' + f.country.value,
        'Email: ' + f.email.value,
        'Phone / WhatsApp: ' + (f.phone.value || '-'),
        'Enquiry type: ' + type,
        '',
        f.message.value
      ];
      var subject = 'SRTE website enquiry - ' + type + ' - ' + (f.company.value || f.name.value);
      window.location.href = 'mailto:shah.reuse.te@gmail.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(lines.join('\n'));
      var ok = document.getElementById('form-ok');
      if (ok) ok.hidden = false;
    });
  }
})();
