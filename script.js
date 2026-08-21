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

// Style links: pre-select the service and move into the inquiry form
document.querySelectorAll('.btn-book[data-service]').forEach((btn) => {
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
  const inquiryId = document.getElementById('f-inquiry-id');
  if (inquiryId) {
    const suffix = Math.random().toString(36).slice(2, 7).toUpperCase();
    inquiryId.value = `JHB-${Date.now().toString(36).toUpperCase()}-${suffix}`;
  }

  const dateInput = document.getElementById('f-date');
  if (dateInput) {
    const today = new Date();
    today.setDate(today.getDate() + 1); // earliest booking: tomorrow
    dateInput.min = today.toISOString().split('T')[0];
  }

  bookingForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    // Proof of policy agreement: record the exact moment of submission
    const agreedAt = document.getElementById('f-agreed-at');
    if (agreedAt) agreedAt.value = new Date().toISOString();

    const submitBtn = document.getElementById('submit-btn');
    const formStatus = document.getElementById('form-status');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending your inquiry…';
    }

    if (formStatus) {
      formStatus.textContent = '';
      formStatus.classList.remove('is-error');
    }

    const formData = new FormData(bookingForm);
    const photo = formData.get('inspiration-photo');
    const payload = {
      inquiryId: formData.get('inquiry-id'),
      name: formData.get('name'),
      phone: formData.get('phone'),
      email: formData.get('email'),
      service: formData.get('service'),
      addons: formData.getAll('addons'),
      preferredDate: formData.get('preferred-date'),
      preferredTime: formData.get('preferred-time'),
      notes: formData.get('notes'),
      referralSource: formData.get('referral-source'),
      inspirationPhotoName: photo instanceof File ? photo.name : '',
      policiesAgreed: formData.get('policies-agreed'),
      policiesAgreedAt: formData.get('policies-agreed-at'),
      source: formData.get('source'),
      botField: formData.get('bot-field')
    };

    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Your inquiry could not be saved.');

      // Preserve Netlify Forms as a second copy (and keep the optional photo upload).
      bookingForm.submit();
    } catch (error) {
      if (formStatus) {
        formStatus.textContent = error instanceof Error ? error.message : 'Your inquiry could not be saved. Please try again.';
        formStatus.classList.add('is-error');
      }
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send appointment inquiry';
      }
    }
  });
}
