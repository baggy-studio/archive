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


// ─── NAV-OFFSET ANCHOR SCROLLING (flyout only) ───
document.querySelectorAll('.flyout-links a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    closeFlyout();
    const navHeight = document.querySelector('nav[aria-label="Main navigation"]').offsetHeight;
    const top = target.getBoundingClientRect().top + window.scrollY - navHeight;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});
