(() => {
  'use strict';

  const body = document.body;
  const intro = document.querySelector('.page-intro');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let introFinished = false;
  let motionStarted = false;

  const animateEntry = (element, options = {}) => {
    if (!element || element.dataset.motionPlayed === '1' || reduceMotion || !element.animate) {
      element?.classList.add('motion-played');
      if (element) element.dataset.motionPlayed = '1';
      return;
    }

    const {
      delay = 0,
      distance = 22,
      duration = 760,
      scale = 0.985,
      direction = 'up'
    } = options;

    const x = direction === 'left' ? distance : direction === 'right' ? -distance : 0;
    const y = direction === 'down' ? -distance : direction === 'up' ? distance : 0;

    element.dataset.motionPlayed = '1';
    const animation = element.animate([
      {
        opacity: 0.22,
        transform: `translate3d(${x}px, ${y}px, 0) scale(${scale})`,
        filter: 'blur(4px)'
      },
      {
        opacity: 1,
        transform: 'translate3d(0, 0, 0) scale(1)',
        filter: 'blur(0)'
      }
    ], {
      duration,
      delay,
      easing: 'cubic-bezier(.22,1,.36,1)',
      fill: 'none'
    });

    animation.addEventListener('finish', () => element.classList.add('motion-played'), { once: true });
    animation.addEventListener('cancel', () => element.classList.add('motion-played'), { once: true });
  };

  const startPremiumMotion = () => {
    if (motionStarted) return;
    motionStarted = true;
    body.classList.add('motion-live');

    if (reduceMotion) return;

    const header = document.querySelector('.site-header');
    animateEntry(header, { delay: 40, direction: 'down', distance: 24, duration: 820, scale: 0.98 });

    const hero = document.querySelector('.hero');
    if (hero) {
      hero.querySelectorAll('.hero-content > *').forEach((element, index) => {
        animateEntry(element, {
          delay: 150 + index * 105,
          direction: 'left',
          distance: 30,
          duration: 850
        });
      });
      animateEntry(hero.querySelector('.hero-visual'), {
        delay: 280,
        direction: 'right',
        distance: 34,
        duration: 980,
        scale: 0.965
      });
    } else {
      document.querySelectorAll('.page-hero > *').forEach((element, index) => {
        animateEntry(element, {
          delay: 130 + index * 110,
          direction: 'up',
          distance: 24,
          duration: 820
        });
      });
    }

    const selectors = [
      '.stat-card',
      '.recognition-strip article',
      '.editorial-card',
      '.category-card',
      '.section-kicker',
      '.split-heading',
      '.section-image-wide',
      '.pdf-card',
      '.detail-block',
      '.aside-card',
      '.founder-card',
      '.contact-card',
      '.list-panel',
      '.tedx-banner',
      '.final-cta-card',
      '.contact-row',
      '.contact-poster',
      '.media-logos',
      '.footer-grid > *',
      '.footer-bottom'
    ].join(',');

    const candidates = [...document.querySelectorAll(selectors)].filter((element) => !element.closest('.hero'));

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const element = entry.target;
          const siblings = element.parentElement ? [...element.parentElement.children] : [];
          const siblingIndex = Math.max(0, siblings.indexOf(element));
          animateEntry(element, {
            delay: Math.min(240, (siblingIndex % 4) * 75),
            direction: siblingIndex % 2 ? 'right' : 'left',
            distance: element.matches('.section-kicker,.split-heading') ? 18 : 24,
            duration: element.matches('.section-image-wide,.editorial-card,.tedx-banner') ? 980 : 780,
            scale: element.matches('.category-card,.pdf-card,.stat-card') ? 0.975 : 0.99
          });
          observer.unobserve(element);
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -5% 0px' });

      candidates.forEach((element) => observer.observe(element));
    } else {
      candidates.forEach((element, index) => animateEntry(element, { delay: (index % 4) * 55 }));
    }

    // Gentle pointer-responsive portrait depth on desktop only.
    const portrait = document.querySelector('.hero .portrait-frame.hero-photo-solid');
    const heroVisual = document.querySelector('.hero-visual');
    if (portrait && heroVisual && window.matchMedia('(hover:hover) and (pointer:fine)').matches) {
      let portraitFrame = 0;
      let targetX = 0;
      let targetY = 0;
      const renderPortrait = () => {
        portraitFrame = 0;
        portrait.style.setProperty('--portrait-x', `${targetX.toFixed(2)}px`);
        portrait.style.setProperty('--portrait-y', `${targetY.toFixed(2)}px`);
      };
      heroVisual.addEventListener('pointermove', (event) => {
        const rect = heroVisual.getBoundingClientRect();
        targetX = ((event.clientX - rect.left) / rect.width - 0.5) * 10;
        targetY = ((event.clientY - rect.top) / rect.height - 0.5) * 8;
        if (!portraitFrame) portraitFrame = window.requestAnimationFrame(renderPortrait);
      }, { passive: true });
      heroVisual.addEventListener('pointerleave', () => {
        targetX = 0;
        targetY = 0;
        if (!portraitFrame) portraitFrame = window.requestAnimationFrame(renderPortrait);
      }, { passive: true });
    }

    // Small magnetic response for premium buttons. Uses the independent
    // translate property so it does not overwrite existing transforms.
    if (window.matchMedia('(hover:hover) and (pointer:fine)').matches) {
      document.querySelectorAll('.button').forEach((button) => {
        button.addEventListener('pointermove', (event) => {
          const rect = button.getBoundingClientRect();
          const x = ((event.clientX - rect.left) / rect.width - 0.5) * 7;
          const y = ((event.clientY - rect.top) / rect.height - 0.5) * 5;
          button.style.translate = `${x.toFixed(2)}px ${y.toFixed(2)}px`;
        }, { passive: true });
        button.addEventListener('pointerleave', () => {
          button.style.translate = '0 0';
        }, { passive: true });
      });
    }
  };

  const finishIntro = (instant = false) => {
    if (introFinished) return;
    introFinished = true;

    body.classList.remove('intro-running');
    body.classList.add('intro-done');
    startPremiumMotion();

    if (!intro) return;
    if (instant) {
      intro.remove();
      return;
    }

    intro.classList.add('intro-leaving');
    window.setTimeout(() => intro.remove(), 850);
  };

  // Keep the premium intro visible on every normal page load.
  if (intro) {
    body.classList.add('intro-running');
    body.classList.remove('intro-done');
    window.setTimeout(() => finishIntro(false), 2250);
  } else {
    finishIntro(true);
  }

  // Absolute fail-safe: the site can never remain scroll-locked.
  window.setTimeout(() => finishIntro(true), 3400);
  // Do not dismiss the intro for unrelated resource errors (for example,
  // a blocked web font or favicon). The timed fail-safe above is sufficient.

  // Only skip an already-played intro when restored from back-forward cache.
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) finishIntro(true);
  });

  // Visual fail-safe for the legacy reveal system.
  const revealAll = () => {
    document.querySelectorAll('.reveal').forEach((element) => {
      element.classList.add('is-visible', 'in-view');
    });
  };
  window.setTimeout(revealAll, 1400);
  window.addEventListener('load', revealAll, { once: true });

  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#site-nav');
  if (menuButton && nav) {
    menuButton.addEventListener('click', () => {
      const open = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', String(!open));
      nav.classList.toggle('open', !open);
    });
    nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
      menuButton.setAttribute('aria-expanded', 'false');
      nav.classList.remove('open');
    }));
  }

  let progressFrame = 0;
  const updateProgress = () => {
    progressFrame = 0;
    const root = document.documentElement;
    const max = Math.max(1, root.scrollHeight - window.innerHeight);
    root.style.setProperty('--scroll-progress', String(Math.min(1, window.scrollY / max)));
    document.querySelector('.site-header')?.classList.toggle('scrolled', window.scrollY > 24);
  };
  const requestProgressUpdate = () => {
    if (!progressFrame) progressFrame = window.requestAnimationFrame(updateProgress);
  };
  updateProgress();
  window.addEventListener('scroll', requestProgressUpdate, { passive: true });
  window.addEventListener('resize', requestProgressUpdate, { passive: true });

  // Legacy reveal observer kept for compatibility with existing markup.
  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible', 'in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px 80px 0px' });
    revealItems.forEach((element) => observer.observe(element));
  } else {
    revealItems.forEach((element) => element.classList.add('is-visible', 'in-view'));
  }

  const overlay = document.querySelector('[data-lightbox-overlay]');
  const overlayImage = overlay?.querySelector('img');
  const overlayCaption = overlay?.querySelector('[data-lightbox-caption]');
  const closeLightbox = () => {
    if (!overlay) return;
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    body.classList.remove('lightbox-open');
    overlayImage?.removeAttribute('src');
  };
  document.querySelectorAll('[data-lightbox]').forEach((item) => {
    item.addEventListener('click', (event) => {
      event.preventDefault();
      if (!overlay || !overlayImage) return;
      overlayImage.src = item.getAttribute('href') || item.querySelector('img')?.src || '';
      overlayImage.alt = item.querySelector('img')?.alt || '';
      if (overlayCaption) overlayCaption.textContent = item.dataset.caption || '';
      overlay.classList.add('is-open');
      overlay.setAttribute('aria-hidden', 'false');
      body.classList.add('lightbox-open');
      if (!reduceMotion && overlayImage.animate) {
        overlayImage.animate([
          { opacity: 0, transform: 'scale(.94) translateY(12px)' },
          { opacity: 1, transform: 'scale(1) translateY(0)' }
        ], { duration: 520, easing: 'cubic-bezier(.22,1,.36,1)' });
      }
    });
  });
  overlay?.addEventListener('click', (event) => {
    if (event.target === overlay || event.target.closest('[data-lightbox-close]')) closeLightbox();
  });
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeLightbox();
  });

  document.querySelectorAll('[data-copy]').forEach((button) => {
    button.addEventListener('click', async () => {
      const value = button.dataset.copy || '';
      try {
        await navigator.clipboard.writeText(value);
        const old = button.textContent;
        button.textContent = 'Copied';
        window.setTimeout(() => { button.textContent = old; }, 1600);
      } catch (_) {
        window.prompt('Copy this:', value);
      }
    });
  });
})();
