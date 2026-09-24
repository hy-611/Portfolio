document.addEventListener('DOMContentLoaded', () => {

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* =========================================================
     1-1. 상단 네비게이션 — 처음엔 숨김, 스크롤 시 표시
  ========================================================= */
  const topbar = document.querySelector('.topbar');
  if (topbar) {
    const updateTopbarVisibility = () => {
      topbar.classList.toggle('is-visible', window.scrollY > 10);
    };
    window.addEventListener('scroll', updateTopbarVisibility, { passive: true });
    updateTopbarVisibility();
  }

  /* =========================================================
     1-2. 표지(Hero) — 스크롤하면 위로 부드럽게 사라지도록
  ========================================================= */
  const heroEl = document.getElementById('home');
  if (heroEl && !prefersReducedMotion) {
    let heroTicking = false;
    const updateHeroParallax = () => {
      const heroHeight = heroEl.offsetHeight || window.innerHeight;
      const progress = Math.min(Math.max(window.scrollY / heroHeight, 0), 1);
      heroEl.style.transform = `translateY(${progress * -60}px)`;
      heroEl.style.opacity = String(1 - progress * 0.9);
      heroTicking = false;
    };
    window.addEventListener('scroll', () => {
      if (!heroTicking) {
        window.requestAnimationFrame(updateHeroParallax);
        heroTicking = true;
      }
    }, { passive: true });
    updateHeroParallax();
  }

  /* =========================================================
     1. 모바일 메뉴 토글
  ========================================================= */
  const navToggle = document.getElementById('navToggle');
  const topbarMenu = document.getElementById('topbarMenu');

  if (navToggle && topbarMenu) {
    navToggle.addEventListener('click', () => {
      const isOpen = topbarMenu.classList.toggle('is-open');
      navToggle.classList.toggle('is-open', isOpen);
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    document.querySelectorAll('.js-nav-link').forEach(link => {
      link.addEventListener('click', () => {
        topbarMenu.classList.remove('is-open');
        navToggle.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* =========================================================
     2. 사이드 도트 네비게이션 — 스크롤 스파이
  ========================================================= */
  const sideNav = document.getElementById('sideNav');
  const sideDots = sideNav ? Array.from(sideNav.querySelectorAll('.side-nav__dot')) : [];
  const navSections = Array.from(document.querySelectorAll('[data-nav-color]'));

  if (sideDots.length && navSections.length) {
    const setActiveDot = (id) => {
      sideDots.forEach(dot => {
        dot.classList.toggle('is-active', dot.getAttribute('href') === `#${id}`);
      });
    };

    const spyObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveDot(entry.target.id);
        }
      });
    }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });

    navSections.forEach(section => spyObserver.observe(section));
  }

  // 사이드 네비는 표지(Hero)에서는 숨기고, 스크롤로 프로젝트 구간에 들어서면 표시
  if (sideNav) {
    const heroSection = document.getElementById('home');
    const footerSection = document.querySelector('.footer');

    const updateSideNavVisibility = () => {
      const heroBottom = heroSection ? heroSection.getBoundingClientRect().bottom : 0;
      const footerTop = footerSection ? footerSection.getBoundingClientRect().top : Infinity;
      const pastHero = heroBottom <= window.innerHeight * 0.6;
      const reachedFooter = footerTop <= window.innerHeight * 0.85;
      const visible = pastHero && !reachedFooter;
      sideNav.style.opacity = visible ? '1' : '0';
      sideNav.style.pointerEvents = visible ? 'auto' : 'none';
    };

    window.addEventListener('scroll', updateSideNavVisibility, { passive: true });
    updateSideNavVisibility();
  }

  /* =========================================================
     3. 상단 메뉴 활성 링크 표시
  ========================================================= */
  const topLinks = Array.from(document.querySelectorAll('.js-nav-link'));
  const topLinkSections = topLinks
    .map(link => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  if (topLinks.length && topLinkSections.length) {
    const topSpyObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          topLinks.forEach(link => {
            link.classList.toggle('is-active', link.getAttribute('href') === `#${entry.target.id}`);
          });
        }
      });
    }, { rootMargin: '-40% 0px -50% 0px', threshold: 0 });

    topLinkSections.forEach(sec => topSpyObserver.observe(sec));
  }

  /* =========================================================
     4. 프로젝트 카드 내 캐러셀 도트 (플레이스홀더 슬라이드 표시용)
  ========================================================= */
  document.querySelectorAll('.project__carousel-dots:not(.project__carousel-dots--section)').forEach(dotsWrap => {
    const dots = Array.from(dotsWrap.querySelectorAll('.dot'));
    const figure = dotsWrap.previousElementSibling;
    const labelEl = figure ? figure.querySelector('strong') : null;
    const baseLabel = labelEl ? labelEl.textContent : '';

    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        dots.forEach(d => d.classList.remove('is-active'));
        dot.classList.add('is-active');
        if (labelEl) {
          labelEl.textContent = `${baseLabel} (${i + 1}/${dots.length})`;
        }
      });
    });
  });

  /* =========================================================
     4-1. 프로젝트 슬라이더 (가로 슬라이드 + 하단 중앙 도트 네비게이션)
  ========================================================= */
  document.querySelectorAll('.js-slider').forEach(slider => {
    const dotsWrap = document.querySelector(`[data-slider-target="${slider.id}"]`);
    if (!dotsWrap) return;

    const slides = Array.from(slider.querySelectorAll('.project__slide'));
    const dots = Array.from(dotsWrap.querySelectorAll('.dot'));

    const goTo = (index) => {
      slider.style.transform = `translateX(-${index * 100}%)`;
      slides.forEach((slide, i) => slide.classList.toggle('is-active', i === index));
      dots.forEach((dot, i) => dot.classList.toggle('is-active', i === index));
    };

    dots.forEach(dot => {
      dot.addEventListener('click', () => goTo(Number(dot.dataset.index)));
    });
  });

  /* =========================================================
     5. PLANNING / PROTOTYPING 모달
  ========================================================= */
  const modal = document.getElementById('modal');
  const modalClose = document.getElementById('modalClose');
  const openModalBtns = document.querySelectorAll('.js-open-modal');

  if (modal) {
    openModalBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        modal.classList.add('is-open');
        document.body.style.overflow = 'hidden';
      });
    });

    const closeModal = () => {
      modal.classList.remove('is-open');
      document.body.style.overflow = '';
    };

    if (modalClose) modalClose.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });
  }

  /* =========================================================
     6. 스크롤 인 애니메이션
  ========================================================= */
  const revealTargets = document.querySelectorAll(
    '.about__title, .about__tagline, .about__photo-cell, .about__info-col, .about__skills-col, ' +
    '.project:not(.project--slider) .project__inner, .project--slider .project__slide:first-child .project__inner, ' +
    '.gallery__grid, .footer__inner'
  );
  revealTargets.forEach(el => el.classList.add('reveal'));

  document.querySelectorAll('.skill-icon-ph').forEach((el, i) => {
    el.style.setProperty('--i', i);
  });

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealTargets.forEach(el => revealObserver.observe(el));

  /* =========================================================
     7. 연락처 클릭 시 클립보드 복사
  ========================================================= */
  document.querySelectorAll('.js-copy').forEach(link => {
    const textEl = link.querySelector('.contact-line__text');
    const originalText = textEl ? textEl.textContent : '';
    let resetTimer = null;

    link.addEventListener('click', (e) => {
      e.preventDefault();
      const value = link.dataset.copy || originalText;

      const showCopied = () => {
        link.classList.add('is-copied');
        if (textEl) textEl.textContent = '복사되었습니다';
        clearTimeout(resetTimer);
        resetTimer = setTimeout(() => {
          link.classList.remove('is-copied');
          if (textEl) textEl.textContent = originalText;
        }, 1200);
      };

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(value).then(showCopied).catch(showCopied);
      } else {
        showCopied();
      }
    });
  });

});
