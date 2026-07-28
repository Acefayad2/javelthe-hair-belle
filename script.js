// Footer year
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Sticky header scroll state
const header = document.getElementById('header');
if (header) {
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 12);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

// Mobile menu toggle
const menuToggle = document.getElementById('menu-toggle');
const mobileNav = document.getElementById('mobile-nav');

if (menuToggle && mobileNav) {
  menuToggle.addEventListener('click', () => {
    const isOpen = mobileNav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
  });

  mobileNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      mobileNav.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-label', 'Open menu');
    });
  });
}

// Service list "Book" buttons: pre-select the style in the booking form
document.querySelectorAll('.service-list .btn-book').forEach((btn) => {
  btn.addEventListener('click', () => {
    const service = document.getElementById('f-service');
    if (service) {
      service.value = btn.dataset.service;
      service.dispatchEvent(new Event('change', { bubbles: true }));
    }
    document.getElementById('book')?.scrollIntoView({ behavior: 'smooth' });
    document.getElementById('f-name')?.focus({ preventScroll: true });
  });
});

// Hero showcase carousel (style preview slides)
const showcase = document.getElementById('hero-showcase');
if (showcase) {
  const slides = [...showcase.querySelectorAll('.hero-slide')];
  const dotsWrap = showcase.querySelector('.hero-showcase-dots');
  const prevBtn = showcase.querySelector('.hero-showcase-arrow.prev');
  const nextBtn = showcase.querySelector('.hero-showcase-arrow.next');
  let active = 0;
  let timer = null;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  slides.forEach((slide, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `Show slide ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
  });
  const dots = [...dotsWrap.children];

  function goTo(index) {
    active = (index + slides.length) % slides.length;
    slides.forEach((s, i) => s.classList.toggle('is-active', i === active));
    dots.forEach((d, i) => d.classList.toggle('is-active', i === active));
  }

  function startAutoplay() {
    if (reducedMotion) return;
    stopAutoplay();
    timer = setInterval(() => goTo(active + 1), 4500);
  }
  function stopAutoplay() {
    if (timer) clearInterval(timer);
  }

  prevBtn.addEventListener('click', () => { goTo(active - 1); startAutoplay(); });
  nextBtn.addEventListener('click', () => { goTo(active + 1); startAutoplay(); });
  showcase.addEventListener('mouseenter', stopAutoplay);
  showcase.addEventListener('mouseleave', startAutoplay);
  showcase.addEventListener('focusin', stopAutoplay);
  showcase.addEventListener('focusout', startAutoplay);

  goTo(0);
  startAutoplay();
}

// Scroll-reveal animations
const revealEls = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && revealEls.length) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );
  revealEls.forEach((el) => observer.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add('visible'));
}

// Booking form: min date = today, policy agreement timestamp, submit state
const bookingForm = document.getElementById('booking-form');
if (bookingForm) {
  const dateInput = document.getElementById('f-date');
  if (dateInput) {
    const today = new Date();
    today.setDate(today.getDate() + 1); // earliest booking: tomorrow
    dateInput.min = today.toISOString().split('T')[0];
  }

  bookingForm.addEventListener('submit', () => {
    // Proof of policy agreement: record the exact moment of submission
    const agreedAt = document.getElementById('f-agreed-at');
    if (agreedAt) agreedAt.value = new Date().toISOString();

    const submitBtn = document.getElementById('submit-btn');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending your request…';
    }
  });
}
