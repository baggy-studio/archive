// ─── HERO → NAV SCROLL TRANSITION ───
if (window.innerWidth > 900 && document.querySelector('.hero-logo')) {
  gsap.registerPlugin(ScrollTrigger);

  window.addEventListener('load', () => {
    const heroSvg     = document.querySelector('.hero-logo svg');
    const navWordmark = document.querySelector('.nav-wordmark');
    const navSvg      = navWordmark.querySelector('svg');

    // ── Build a free-floating clone of the hero SVG ──
    const flyingEl = document.createElement('div');
    flyingEl.className = 'flying-wordmark';
    flyingEl.appendChild(heroSvg.cloneNode(true));
    document.body.appendChild(flyingEl);

    // Position it exactly over the hero SVG
    const heroRect = heroSvg.getBoundingClientRect();
    const navRect  = navSvg.getBoundingClientRect();

    flyingEl.style.left  = heroRect.left + 'px';
    flyingEl.style.top   = heroRect.top  + 'px';
    flyingEl.style.width = heroRect.width + 'px';

    // Hide the originals — flying element covers hero, nav-wordmark waits
    heroSvg.style.visibility = 'hidden';

    // ── Calculate center-to-center movement + scale ──
    const heroCX = heroRect.left + heroRect.width  / 2;
    const heroCY = heroRect.top  + heroRect.height / 2;
    const navCX  = navRect.left  + navRect.width   / 2;
    const navCY  = navRect.top   + navRect.height  / 2;

    const endScale = navRect.width / heroRect.width;
    const endX     = navCX - heroCX;
    const endY     = navCY - heroCY;

    // ── Animate ──
    const heroTl = gsap.timeline({
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: '+=800',
        pin: true,
        scrub: 1,
      }
    });

    heroTl
      // nav-middle and nav-right slide upward and disappear
      .to(['.nav-middle', '.nav-right'], { y: -24, autoAlpha: 0, duration: 0.35 }, 0)
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
  });
}

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
