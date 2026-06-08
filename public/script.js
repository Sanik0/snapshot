(function() {
  'use strict';

  // Guard: only run in browser
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  // ── Theme toggle ──────────────────────────────
  const html = document.documentElement;
  const stored = localStorage.getItem('polaroma-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  function setTheme(dark) {
    if (dark) {
      html.classList.add('dark');
      localStorage.setItem('polaroma-theme', 'dark');
    } else {
      html.classList.remove('dark');
      localStorage.setItem('polaroma-theme', 'light');
    }
    updateThemeIcons(dark);
  }

  function updateThemeIcons(dark) {
    const sunIcon = document.getElementById('sun-icon');
    const moonIcon = document.getElementById('moon-icon');
    const mobSun = document.getElementById('mob-sun');
    const mobMoon = document.getElementById('mob-moon');
    if (sunIcon) sunIcon.classList.toggle('hidden', !dark);
    if (moonIcon) moonIcon.classList.toggle('hidden', dark);
    if (mobSun) mobSun.classList.toggle('hidden', !dark);
    if (mobMoon) mobMoon.classList.toggle('hidden', dark);
  }

  setTheme(stored === 'dark' || (!stored && prefersDark));

  document.getElementById('theme-toggle')?.addEventListener('click', () => {
    setTheme(!html.classList.contains('dark'));
  });
  document.getElementById('mobile-theme-toggle')?.addEventListener('click', () => {
    setTheme(!html.classList.contains('dark'));
  });

  // ── Hamburger mobile menu ─────────────────────
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  const hamOpen = document.getElementById('ham-open');
  const hamClose = document.getElementById('ham-close');

  hamburger?.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.contains('open');
    mobileMenu.classList.toggle('open', !isOpen);
    hamOpen.classList.toggle('hidden', !isOpen);
    hamClose.classList.toggle('hidden', isOpen);
  });

  document.querySelectorAll('.mobile-nav').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      hamOpen.classList.remove('hidden');
      hamClose.classList.add('hidden');
    });
  });

  // ── Smooth scroll ─────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const offset = 70;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // ── Scroll reveal ─────────────────────────────
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach(el => {
    revealObserver.observe(el);
  });

  // ── Sticky CTA ───────────────────────────────
  const stickyCta = document.getElementById('sticky-cta');
  let ctaVisible = false;
  window.addEventListener('scroll', () => {
    const shouldShow = window.scrollY > 600;
    if (shouldShow !== ctaVisible) {
      ctaVisible = shouldShow;
      stickyCta?.classList.toggle('hidden-cta', !shouldShow);
    }
  }, { passive: true });

  // ── Nav scroll behaviour ──────────────────────
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar?.classList.toggle('shadow-md', window.scrollY > 10);
  }, { passive: true });

  // ── FAQ accordion ────────────────────────────
  document.querySelectorAll('.faq-trigger').forEach(trigger => {
    trigger.addEventListener('click', function() {
      const item = this.closest('.faq-item');
      const content = item.querySelector('.faq-content');
      const icon = item.querySelector('.faq-icon');
      const isOpen = content.classList.contains('open');

      document.querySelectorAll('.faq-content.open').forEach(c => {
        c.classList.remove('open');
        c.closest('.faq-item').querySelector('.faq-icon').style.transform = 'rotate(0deg)';
      });

      if (!isOpen) {
        content.classList.add('open');
        icon.style.transform = 'rotate(180deg)';
      }
    });
  });

  // ── Counter animation ─────────────────────────
  function animateCounter(el) {
    const target = parseInt(el.dataset.target);
    const suffix = el.dataset.suffix || '';
    const duration = 2000;
    const start = performance.now();

    let displaySuffix = suffix;
    let divisor = 1;

    if (target >= 1000000) {
      divisor = 1000000;
      displaySuffix = 'M+';
    } else if (target >= 1000) {
      divisor = 1000;
      displaySuffix = 'K+';
    }

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = (target / divisor) * eased;
      el.textContent = Math.floor(value) + displaySuffix;
      if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
  }

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.counter').forEach(el => counterObserver.observe(el));

  // ── Testimonial Carousel ──────────────────────
  const track = document.getElementById('carousel-track');
  const dotsContainer = document.getElementById('carousel-dots');
  const slides = track ? Array.from(track.children) : [];
  let currentSlide = 0;
  let autoPlay;

  function getSlidesVisible() {
    if (window.innerWidth >= 1024) return 3;
    if (window.innerWidth >= 768) return 2;
    return 1;
  }

  function getTotalPages() {
    return Math.max(1, slides.length - getSlidesVisible() + 1);
  }

  function buildDots() {
    if (!dotsContainer) return;
    dotsContainer.innerHTML = '';
    const total = getTotalPages();
    for (let i = 0; i < total; i++) {
      const dot = document.createElement('button');
      dot.className = `w-2 h-2 rounded-full transition-all duration-300 ${i === currentSlide ? 'bg-primary w-6' : 'bg-slate-300 dark:bg-slate-700'}`;
      dot.setAttribute('aria-label', `Slide ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsContainer.appendChild(dot);
    }
  }

  function updateDots() {
    if (!dotsContainer) return;
    Array.from(dotsContainer.children).forEach((dot, i) => {
      dot.className = `h-2 rounded-full transition-all duration-300 ${i === currentSlide ? 'bg-primary w-6' : 'bg-slate-300 dark:bg-slate-700 w-2'}`;
    });
  }

  function goTo(index) {
    if (!track) return;
    const total = getTotalPages();
    currentSlide = Math.max(0, Math.min(index, total - 1));
    const slideWidth = track.parentElement.offsetWidth / getSlidesVisible();
    track.style.transform = `translateX(-${currentSlide * slideWidth}px)`;
    updateDots();
  }

  document.getElementById('prev-btn')?.addEventListener('click', () => {
    clearInterval(autoPlay);
    goTo(currentSlide - 1 < 0 ? getTotalPages() - 1 : currentSlide - 1);
    startAuto();
  });

  document.getElementById('next-btn')?.addEventListener('click', () => {
    clearInterval(autoPlay);
    goTo(currentSlide + 1 >= getTotalPages() ? 0 : currentSlide + 1);
    startAuto();
  });

  function startAuto() {
    autoPlay = setInterval(() => {
      goTo(currentSlide + 1 >= getTotalPages() ? 0 : currentSlide + 1);
    }, 4500);
  }

  window.addEventListener('resize', () => {
    buildDots();
    goTo(0);
  });

  buildDots();
  startAuto();

  // ── Newsletter form ───────────────────────────
  const subscribeBtn = document.getElementById('subscribe-btn');
  const emailInput = document.getElementById('email-input');
  const newsletterForm = document.getElementById('newsletter-form');
  const newsletterSuccess = document.getElementById('newsletter-success');

  subscribeBtn?.addEventListener('click', () => {
    const email = emailInput?.value.trim();
    if (!email || !email.includes('@')) {
      emailInput?.classList.add('ring-2', 'ring-red-500');
      setTimeout(() => emailInput?.classList.remove('ring-2', 'ring-red-500'), 2000);
      return;
    }
    newsletterForm?.classList.add('hidden');
    newsletterSuccess?.classList.remove('hidden');
    newsletterSuccess?.classList.add('flex');
  });

  emailInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') subscribeBtn?.click();
  });

})();