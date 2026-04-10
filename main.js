// ─── HERO → NAV SCROLL TRANSITION ───
(function () {
  if (!document.querySelector('.hero-logo')) return;

  gsap.registerPlugin(ScrollTrigger);

  let flyingEl = null;
  let mobileScrollHandler = null;
  let mobileTicker = null;

  function initHeroAnimation() {
    // Clean up any previous instances
    ScrollTrigger.getAll().forEach(st => st.kill());
    if (flyingEl) {
      flyingEl.remove();
      flyingEl = null;
    }
    if (mobileScrollHandler) {
      window.removeEventListener('scroll', mobileScrollHandler);
      mobileScrollHandler = null;
    }
    if (mobileTicker) {
      gsap.ticker.remove(mobileTicker);
      mobileTicker = null;
    }

    const heroSvg     = document.querySelector('.hero-logo svg');
    const navWordmark = document.querySelector('.nav-wordmark');
    const navSvg      = navWordmark.querySelector('svg');
    const isMobile    = window.innerWidth <= 900;

    // Reset all GSAP-managed inline styles back to CSS defaults
    heroSvg.style.visibility = '';
    gsap.set(navWordmark, { clearProps: 'all' });
    gsap.set('.nav-middle', { clearProps: 'all' });
    gsap.set('.nav-right',  { clearProps: 'all' });

    // Set animation starting state
    gsap.set(navWordmark, { autoAlpha: 0, pointerEvents: 'none' });

    // ── Build a free-floating clone of the hero SVG ──
    flyingEl = document.createElement('div');
    flyingEl.className = 'flying-wordmark';
    flyingEl.appendChild(heroSvg.cloneNode(true));
    document.body.appendChild(flyingEl);

    // Position it exactly over the hero SVG (fixed positioning uses viewport coords)
    const heroRect = heroSvg.getBoundingClientRect();
    const navRect  = navSvg.getBoundingClientRect();

    flyingEl.style.left  = heroRect.left + 'px';
    flyingEl.style.top   = heroRect.top  + 'px';
    flyingEl.style.width = heroRect.width + 'px';

    // Hide the original SVG — flying element covers it
    heroSvg.style.visibility = 'hidden';

    // ── Calculate center-to-center movement + scale ──
    const heroCX = heroRect.left + heroRect.width  / 2;
    const heroCY = heroRect.top  + heroRect.height / 2;
    const navCX  = navRect.left  + navRect.width   / 2;
    const navCY  = navRect.top   + navRect.height  / 2;

    const endScale = navRect.width / heroRect.width;
    const endX     = navCX - heroCX;
    const endY     = navCY - heroCY;

    // On mobile, nav-right is already hidden by CSS — only fade nav-middle
    const fadeTargets = isMobile
      ? ['.nav-middle']
      : ['.nav-middle', '.nav-right'];

    // ── Build timeline (paused — driven differently per platform below) ──
    const heroTl = gsap.timeline({ paused: true });
    heroTl
      // nav-middle (and nav-right on desktop) slide upward and disappear
      .to(fadeTargets, { y: -24, autoAlpha: 0, duration: 0.35 }, 0)
      // flying wordmark physically moves + shrinks to nav position
      .to(flyingEl, {
        x: endX,
        y: endY,
        scale: endScale,
        transformOrigin: 'center center',
        ease: 'none',
        duration: 0.88,
      }, 0)
      // quick hand-off: flying element out, nav-wordmark in
      .to(flyingEl,    { autoAlpha: 0, duration: 0.12 }, 0.88)
      .to(navWordmark, { autoAlpha: 1, pointerEvents: 'auto', duration: 0.12 }, 0.88);

    if (isMobile) {
      // Track target progress from scroll, then lerp toward it each frame
      // so the animation feels as smooth as scrub does on desktop
      let targetProg = Math.min(1, window.scrollY / 400);

      mobileScrollHandler = () => {
        targetProg = Math.min(1, window.scrollY / 400);
      };
      window.addEventListener('scroll', mobileScrollHandler, { passive: true });

      mobileTicker = () => {
        const current = heroTl.progress();
        const diff = targetProg - current;
        if (Math.abs(diff) < 0.001) return;
        heroTl.progress(current + diff * 0.15);
      };
      gsap.ticker.add(mobileTicker);

      heroTl.progress(targetProg); // snap to current position immediately on init
    } else {
      // Desktop: pin the hero and scrub with ScrollTrigger
      ScrollTrigger.create({
        animation: heroTl,
        trigger: '#hero',
        start: 'top top',
        end: '+=400',
        pin: true,
        scrub: 1,
      });
    }
  }

  window.addEventListener('load', initHeroAnimation);

  // On resize, rebuild with fresh measurements so positions stay accurate
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      initHeroAnimation();
      ScrollTrigger.refresh();
    }, 250);
  });
}());

function openFlyout() {
  document.getElementById('flyout').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeFlyout() {
  document.getElementById('flyout').classList.remove('open');
  document.body.style.overflow = '';
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeFlyout();
});

// ─── NAV HEIGHT → #speaker-main PADDING ───
function setNavOffsetPadding() {
  const speakerMain = document.getElementById('speaker-main');
  if (!speakerMain) return;
  const navHeight = document.querySelector('nav[aria-label="Main navigation"]').offsetHeight;
  speakerMain.style.paddingTop = navHeight + 'px';
}

if (document.getElementById('speaker-main')) {
  window.addEventListener('load', setNavOffsetPadding);
  window.addEventListener('resize', setNavOffsetPadding);
}

// ─── NAV-OFFSET ANCHOR SCROLLING ───
document.querySelectorAll('.nav-links a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const navHeight = document.querySelector('nav[aria-label="Main navigation"]').offsetHeight;
    const top = target.getBoundingClientRect().top + window.scrollY - navHeight;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});
