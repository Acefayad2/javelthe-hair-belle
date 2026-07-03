// Footer year
document.getElementById('year').textContent = new Date().getFullYear();

// Sticky header scroll state
const header = document.getElementById('header');
const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 12);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

// Mobile menu toggle
const menuToggle = document.getElementById('menu-toggle');
const mobileNav = document.getElementById('mobile-nav');

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

// Scroll-reveal animations
const revealEls = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
  );
  revealEls.forEach((el) => revealObserver.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add('in-view'));
}

// FAQ accordion
document.querySelectorAll('.faq-item').forEach((item) => {
  const question = item.querySelector('.faq-question');
  question.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');

    document.querySelectorAll('.faq-item.open').forEach((openItem) => {
      if (openItem !== item) {
        openItem.classList.remove('open');
        openItem.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
      }
    });

    item.classList.toggle('open', !isOpen);
    question.setAttribute('aria-expanded', String(!isOpen));
  });
});

// Booking form validation (client-side demo; no backend wired up)
const form = document.getElementById('booking-form');
const successMsg = document.getElementById('form-success');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  let valid = true;

  form.querySelectorAll('[required]').forEach((field) => {
    const row = field.closest('.form-row');
    field.setAttribute('data-touched', 'true');
    if (!field.checkValidity()) {
      valid = false;
      row.classList.add('invalid');
    } else {
      row.classList.remove('invalid');
    }
  });

  if (!valid) {
    form.querySelector('.invalid input, .invalid select')?.focus();
    return;
  }

  const submitBtn = form.querySelector('.form-submit');
  submitBtn.setAttribute('disabled', 'true');
  submitBtn.querySelector('.btn-label').textContent = 'Sending...';

  setTimeout(() => {
    successMsg.classList.add('visible');
    form.reset();
    submitBtn.removeAttribute('disabled');
    submitBtn.querySelector('.btn-label').textContent = 'Request Appointment';
  }, 700);
});

form.querySelectorAll('input, select').forEach((field) => {
  field.addEventListener('blur', () => {
    const row = field.closest('.form-row');
    if (field.hasAttribute('required')) {
      field.setAttribute('data-touched', 'true');
      row.classList.toggle('invalid', !field.checkValidity());
    }
  });
});
