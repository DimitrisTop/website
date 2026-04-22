/**
 * Portfolio · app.js
 * Covers ALL pages: scroll reveals, hamburger, nav active link,
 * bento spotlight, figure scale-in animations.
 *
 * Index-page-specific interactions (custom cursor, typing effect,
 * magnetic buttons) are guarded by feature-detection so they
 * degrade cleanly on project/about pages.
 */
(function () {
  'use strict';

  /* ─── UTILITY: runs after DOM is parsed ──────────────── */
  function ready(fn) {
    if (document.readyState !== 'loading') { fn(); }
    else { document.addEventListener('DOMContentLoaded', fn); }
  }

  /* ─── 1. CUSTOM CURSOR (index.html only) ─────────────── */
  const cDot = document.getElementById('c-dot');
  const cRing = document.getElementById('c-ring');
  const isPointerFine = window.matchMedia('(pointer: fine)').matches;

  if (isPointerFine && cDot && cRing) {
    let mouseX = -200, mouseY = -200;
    let ringX = -200, ringY = -200;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    document.addEventListener('mouseleave', () => {
      cDot.style.opacity = '0';
      cRing.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
      cDot.style.opacity = '1';
      cRing.style.opacity = '1';
    });

    function cursorRAF() {
      cDot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;

      const LERP = 0.12;
      ringX += (mouseX - ringX) * LERP;
      ringY += (mouseY - ringY) * LERP;
      cRing.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;

      requestAnimationFrame(cursorRAF);
    }
    requestAnimationFrame(cursorRAF);

    const interactiveSelector = 'a, button, [role="button"], label, .chip, .bento-card:not(.coming-soon)';

    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(interactiveSelector)) {
        cDot.classList.add('is-hovering');
        cRing.classList.add('is-hovering');
      }
    });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(interactiveSelector)) {
        cDot.classList.remove('is-hovering');
        cRing.classList.remove('is-hovering');
      }
    });

    document.addEventListener('mousedown', () => cRing.classList.add('is-clicking'));
    document.addEventListener('mouseup', () => cRing.classList.remove('is-clicking'));
  }


  /* ─── 2. TERMINAL TYPING EFFECT (index.html only) ────── */
  ready(() => {
    const typedEl = document.getElementById('typed-text');
    const cursorEl = document.querySelector('.typing-cursor');
    const heroH1 = document.querySelector('.hero h1');

    if (!typedEl || !cursorEl || !heroH1) return;

    const LINE_1 = 'In data I trust. ';
    const EM_TEXT = "";
    const LINE_2 = " And coffee. ";

    const segments = [
      { text: LINE_1, em: false, br: true },
      { text: EM_TEXT, em: true, br: false },
      { text: LINE_2, em: true, br: false },
    ];

    const tokens = [];
    segments.forEach((seg) => {
      if (seg.br) {
        const parts = seg.text.split('\n');
        parts[0].split('').forEach((c) => tokens.push({ char: c, em: seg.em, isBr: false }));
        tokens.push({ char: null, em: false, isBr: true });
        if (parts[1]) {
          parts[1].split('').forEach((c) => tokens.push({ char: c, em: seg.em, isBr: false }));
        }
      } else {
        seg.text.split('').forEach((c) => tokens.push({ char: c, em: seg.em, isBr: false }));
      }
    });

    let normalSpan = null;
    let emSpan = null;
    let tokenIndex = 0;
    const BASE_SPEED = 110;
    const VARIATION = 45;

    heroH1.classList.add('in');

    function typeNextToken() {
      if (tokenIndex >= tokens.length) {
        cursorEl.classList.remove('typing');
        return;
      }

      const token = tokens[tokenIndex++];

      if (token.isBr) {
        typedEl.appendChild(document.createElement('br'));
        normalSpan = null; emSpan = null;
        setTimeout(typeNextToken, BASE_SPEED * 3);
        return;
      }

      if (token.em) {
        if (!emSpan) {
          emSpan = document.createElement('em');
          typedEl.appendChild(emSpan);
          normalSpan = null;
        }
        emSpan.textContent += token.char;
      } else {
        if (!normalSpan) {
          normalSpan = document.createElement('span');
          typedEl.appendChild(normalSpan);
          emSpan = null;
        }
        normalSpan.textContent += token.char;
      }

      const delay = BASE_SPEED + (Math.random() * VARIATION * 2 - VARIATION);
      setTimeout(typeNextToken, delay);
    }

    setTimeout(typeNextToken, 600);
  });


  /* ─── 3. MAGNETIC BUTTONS (index.html only) ──────────── */
  ready(() => {
    const magneticBtns = document.querySelectorAll('.btn-magnetic');
    if (!magneticBtns.length) return;

    const MAGNETIC_STRENGTH = 0.35;
    const MAGNETIC_RADIUS = 90;

    magneticBtns.forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < MAGNETIC_RADIUS) {
          const pull = (1 - dist / MAGNETIC_RADIUS) * MAGNETIC_STRENGTH;
          btn.style.transform = `translate(${dx * pull}px, ${dy * pull}px)`;
        } else {
          btn.style.transform = 'translate(0, 0)';
        }
      });

      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate(0, 0)';
      });
    });
  });


  /* ─── 4. BENTO CARD SPOTLIGHT (all pages) ────────────── */
  const glowCards = document.querySelectorAll('.bento-card:not(.coming-soon)');
  if (!window.matchMedia('(pointer: coarse)').matches) {
    glowCards.forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
        card.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
      });
      card.addEventListener('mouseleave', () => {
        card.style.setProperty('--mx', '50%');
        card.style.setProperty('--my', '50%');
      });
    });
  }


  /* ─── 5. SCROLL REVEAL — .reveal (all pages) ─────────── */
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );
    revealEls.forEach((el) => io.observe(el));
  }


  /* ─── 6. FIGURE SCALE-IN — .reveal-fig (project pages) ─ */
  const figEls = document.querySelectorAll('.reveal-fig');
  if (figEls.length) {
    const ioFig = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            e.target.addEventListener('transitionend', () => {
              e.target.style.willChange = 'auto';
            }, { once: true });
            ioFig.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -20px 0px' }
    );
    figEls.forEach((el) => ioFig.observe(el));
  }


  /* ─── 7. HAMBURGER MENU (all pages) ──────────────────── */
  const ham = document.getElementById('ham');
  const mMenu = document.getElementById('mobile-menu');
  if (ham && mMenu) {
    ham.addEventListener('click', () => {
      const open = ham.classList.toggle('open');
      mMenu.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
      ham.setAttribute('aria-expanded', String(open));
    });
    mMenu.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => {
        ham.classList.remove('open');
        mMenu.classList.remove('open');
        document.body.style.overflow = '';
        ham.setAttribute('aria-expanded', 'false');
      });
    });
  }


  /* ─── 8. ACTIVE NAV LINK (all pages) ─────────────────── */
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-menu a').forEach((a) => {
    if ((a.getAttribute('href') || '') === page) a.classList.add('active');
  });

})();


// Progress Scroll Logic - Updated with "Smart Lift"
document.addEventListener('DOMContentLoaded', function () {
  const progressPath = document.querySelector('.progress-circle path');
  const pathLength = progressPath.getTotalLength();

  progressPath.style.transition = progressPath.style.WebkitTransition = 'none';
  progressPath.style.strokeDasharray = pathLength + ' ' + pathLength;
  progressPath.style.strokeDashoffset = pathLength;
  progressPath.getBoundingClientRect();
  progressPath.style.transition = progressPath.style.WebkitTransition = 'stroke-dashoffset 10ms linear';

  const updateProgress = function () {
    const scroll = window.scrollY;
    const height = document.documentElement.scrollHeight - window.innerHeight;
    const progress = pathLength - (scroll * pathLength / height);
    progressPath.style.strokeDashoffset = progress;

    // --- SMART LIFT LOGIC START ---
    const wrap = document.querySelector('.progress-wrap');
    const distFromBottom = height - scroll;
    const liftThreshold = 25; // Πόσο "χώρο" θέλουμε να αφήσει από το κείμενο του footer

    if (distFromBottom < liftThreshold) {
      const liftAmount = liftThreshold - distFromBottom;
      wrap.style.transform = `translateY(-${liftAmount}px)`;
    } else if (scroll > 100) {
      wrap.style.transform = `translateY(0)`; // Επαναφορά στην κανονική θέση
    }
    // --- SMART LIFT LOGIC END ---

    if (scroll > 200) {
      wrap.classList.add('active-progress');
    } else {
      wrap.classList.remove('active-progress');
    }
  }

  document.querySelector('.progress-wrap').addEventListener('click', function (event) {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return false;
  });

  window.addEventListener('scroll', updateProgress);
});


/* ── 10. LIGHTBOX (project_1.html only) ──────────────────────
   Opens chart images in a full-screen overlay when clicked.
   Guarded so it silently skips on all other pages.            */
document.addEventListener('DOMContentLoaded', function () {
  var overlay = document.getElementById('lightbox-overlay');
  if (!overlay) return;

  var lb = document.getElementById('lightbox-img');
  var closeBtn = document.getElementById('lightbox-close');

  function openLightbox(src, alt) {
    lb.src = src;
    lb.alt = alt;
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }

  function closeLightbox() {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
    lb.src = '';
  }

  document.querySelectorAll('.lightbox-trigger').forEach(function (fig) {
    var img = fig.querySelector('img');
    if (!img) return;
    fig.style.cursor = 'zoom-in';
    fig.addEventListener('click', function () { openLightbox(img.src, img.alt); });
  });

  closeBtn.addEventListener('click', closeLightbox);
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) closeLightbox();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeLightbox();
  });
});

/* ── 11. OBFUSCATED DOWNLOAD LINK (index.html only) ────────
   Decodes Base64 string in data attribute to prevent bot scraping */
document.addEventListener('DOMContentLoaded', function () {
  var cvBtn = document.getElementById('btn-cv');
  if (cvBtn) {
    cvBtn.addEventListener('click', function (e) {
      e.preventDefault();
      var secureUrl = cvBtn.getAttribute('data-secure-url');
      if (secureUrl) {
        // Decode the URL
        var decodedUrl = atob(secureUrl);
        // Open the URL or trigger download
        window.open(decodedUrl, '_blank');
      }
    });
  }
});