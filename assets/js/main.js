/**
 * main.js — Portal Digital Desa Gunungsari
 * FASE 1 — Design System v2.0
 * Fitur: scroll animations (multi-direction), counter, parallax, navbar,
 *        back-to-top, filter pills, mobile nav, lightbox, tab anchor support
 */

document.addEventListener('DOMContentLoaded', function () {

  /* -----------------------------------------------------------------------
     1. NAVBAR — Scrolled state (glass effect)
  ----------------------------------------------------------------------- */
  const navbar = document.getElementById('mainNavbar');
  if (navbar) {
    const onScroll = () => {
      navbar.classList.toggle('scrolled', window.scrollY > 60);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* -----------------------------------------------------------------------
     2. BACK TO TOP BUTTON
  ----------------------------------------------------------------------- */
  const btnTop = document.getElementById('btnBackTop');
  if (btnTop) {
    window.addEventListener('scroll', () => {
      btnTop.classList.toggle('show', window.scrollY > 320);
    }, { passive: true });
    btnTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* -----------------------------------------------------------------------
     3. SCROLL ANIMATIONS — IntersectionObserver
     Supports: .fade-in-up, .fade-in-left, .fade-in-right, .zoom-in
  ----------------------------------------------------------------------- */
  const animSelectors = '.fade-in-up, .fade-in-left, .fade-in-right, .zoom-in';
  const animEls = document.querySelectorAll(animSelectors);

  if (animEls.length) {
    const animObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          animObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.10, rootMargin: '0px 0px -40px 0px' });

    animEls.forEach(el => {
      // Skip elements already marked as pre-visible (hero elements)
      if (!el.classList.contains('visible')) {
        animObserver.observe(el);
      }
    });
  }

  /* -----------------------------------------------------------------------
     4. ANIMATED COUNTER — Count-up for stat numbers
     Usage: <span data-counter="1845">1,845</span>
  ----------------------------------------------------------------------- */
  const counterEls = document.querySelectorAll('[data-counter]');
  if (counterEls.length) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.dataset.counter, 10) || 0;
          if (target === 0) { el.textContent = '0'; return; }
          const duration = 1600;
          const startTime = performance.now();
          const easeOut = (t) => 1 - Math.pow(1 - t, 3);

          const tick = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const current = Math.round(easeOut(progress) * target);
            el.textContent = current.toLocaleString('id-ID');
            if (progress < 1) requestAnimationFrame(tick);
          };

          requestAnimationFrame(tick);
          counterObserver.unobserve(el);
        }
      });
    }, { threshold: 0.3 });
    counterEls.forEach(el => counterObserver.observe(el));
  }

  /* -----------------------------------------------------------------------
     5. FILTER PILLS — Category filter (gallery, UMKM, dokumentasi)
     Usage: data-filter="kategori" data-target=".items-selector"
  ----------------------------------------------------------------------- */
  const filterPills = document.querySelectorAll('.filter-pill, .filter-btn');
  filterPills.forEach(pill => {
    pill.addEventListener('click', function () {
      // Remove active from siblings in same group
      const group = this.closest('.filter-pills, [data-filter-group]');
      if (group) {
        group.querySelectorAll('.filter-pill, .filter-btn').forEach(p => p.classList.remove('active'));
      }
      this.classList.add('active');

      // Filter target items
      const filterVal = this.dataset.filter;
      const targetSelector = this.dataset.target;
      if (targetSelector) {
        const items = document.querySelectorAll(targetSelector);
        items.forEach(item => {
          const match = filterVal === 'all' || item.dataset.category === filterVal;
          item.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
          if (match) {
            item.style.display = '';
            requestAnimationFrame(() => {
              item.style.opacity = '1';
              item.style.transform = 'translateY(0)';
            });
          } else {
            item.style.opacity = '0';
            item.style.transform = 'translateY(8px)';
            setTimeout(() => { if (item.style.opacity === '0') item.style.display = 'none'; }, 300);
          }
        });
      }
    });
  });

  /* -----------------------------------------------------------------------
     6. NAVBAR — Close mobile menu on nav-link click
  ----------------------------------------------------------------------- */
  document.querySelectorAll('#mainNav .nav-link:not(.dropdown-toggle)').forEach(link => {
    link.addEventListener('click', () => {
      const collapse = document.getElementById('mainNav');
      if (collapse && collapse.classList.contains('show')) {
        const bsCollapse = bootstrap.Collapse.getInstance(collapse);
        if (bsCollapse) bsCollapse.hide();
      }
    });
  });

  /* -----------------------------------------------------------------------
     7. GLIGHTBOX Init (if library loaded)
  ----------------------------------------------------------------------- */
  if (typeof GLightbox !== 'undefined') {
    GLightbox({
      selector: '.glightbox',
      touchNavigation: true,
      loop: true,
      autoplayVideos: true,
      zoomable: true,
    });
  }

  /* -----------------------------------------------------------------------
     8. BOOTSTRAP TABS — anchor link support (#pane)
  ----------------------------------------------------------------------- */
  const hash = window.location.hash;
  if (hash) {
    const tabLink = document.querySelector(
      `[data-bs-toggle="tab"][href="${hash}"], [data-bs-toggle="pill"][href="${hash}"]`
    );
    if (tabLink) {
      const tab = new bootstrap.Tab(tabLink);
      tab.show();
      setTimeout(() => {
        tabLink.closest('.section-padding, section')?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    }
  }

  /* -----------------------------------------------------------------------
     9. PARALLAX — Lightweight, performance-safe
     Usage: <div data-parallax="0.3"> (speed: 0 = no parallax, 1 = full)
  ----------------------------------------------------------------------- */
  const parallaxEls = document.querySelectorAll('[data-parallax]');
  if (parallaxEls.length && window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
    let rafPending = false;
    const updateParallax = () => {
      const scrollY = window.scrollY;
      parallaxEls.forEach(el => {
        const speed  = parseFloat(el.dataset.parallax) || 0.2;
        const rect   = el.getBoundingClientRect();
        const viewH  = window.innerHeight;
        // Only update if element is near viewport
        if (rect.bottom > -viewH && rect.top < viewH * 2) {
          const offset = (scrollY + rect.top - scrollY) * speed * -0.5;
          el.style.transform = `translateY(${offset}px)`;
        }
      });
      rafPending = false;
    };
    window.addEventListener('scroll', () => {
      if (!rafPending) {
        rafPending = true;
        requestAnimationFrame(updateParallax);
      }
    }, { passive: true });
    updateParallax();
  }

  /* -----------------------------------------------------------------------
     10. TOOLTIP INIT — Bootstrap tooltips (for action buttons with titles)
  ----------------------------------------------------------------------- */
  const tooltipEls = document.querySelectorAll('[data-bs-toggle="tooltip"]');
  if (tooltipEls.length && typeof bootstrap !== 'undefined') {
    tooltipEls.forEach(el => new bootstrap.Tooltip(el, { trigger: 'hover' }));
  }

  /* -----------------------------------------------------------------------
     11. SMOOTH ANCHOR SCROLL — for in-page hash links
  ----------------------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]:not([data-bs-toggle])').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const navHeight = document.querySelector('.sticky-top-wrapper')?.offsetHeight || 80;
        const targetTop = target.getBoundingClientRect().top + window.scrollY - navHeight - 16;
        window.scrollTo({ top: targetTop, behavior: 'smooth' });
      }
    });
  });

  /* -----------------------------------------------------------------------
     12. SEARCH BAR — Clear button toggle
  ----------------------------------------------------------------------- */
  document.querySelectorAll('.search-bar-wrapper').forEach(wrapper => {
    const input = wrapper.querySelector('input');
    const clearBtn = wrapper.querySelector('.btn-search-clear');
    if (input && clearBtn) {
      clearBtn.addEventListener('click', () => {
        input.value = '';
        input.focus();
        clearBtn.style.display = 'none';
      });
      input.addEventListener('input', () => {
        clearBtn.style.display = input.value ? 'block' : 'none';
      });
    }
  });

});
