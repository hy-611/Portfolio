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
     1-3. 표지 사원증 — 마우스 위치에 따라 살짝 3D로 기울어짐
  ========================================================= */
  const badgeCard = document.querySelector('.badge__card');
  const canHover = window.matchMedia('(hover: hover)').matches;
  if (heroEl && badgeCard && canHover && !prefersReducedMotion) {
    heroEl.addEventListener('mousemove', (e) => {
      const rect = heroEl.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;   // -0.5 ~ 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      badgeCard.style.setProperty('--tilt-y', `${x * 14}deg`);
      badgeCard.style.setProperty('--tilt-x', `${y * -10}deg`);
    });
    heroEl.addEventListener('mouseleave', () => {
      badgeCard.style.setProperty('--tilt-y', '0deg');
      badgeCard.style.setProperty('--tilt-x', '0deg');
    });
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
  const modalViewer = document.getElementById('modalViewer');
  const modalImg = document.getElementById('modalImg');
  const modalPlaceholder = document.getElementById('modalPlaceholder');
  const modalLink = document.getElementById('modalLink');

  if (modal) {
    openModalBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        // data-modal-src가 있으면 이미지 뷰어, 없으면 placeholder 표시
        const src = btn.dataset.modalSrc;
        const hasImage = Boolean(src && modalViewer && modalImg);
        if (hasImage) {
          modalImg.src = src;
          modalImg.alt = btn.dataset.modalAlt || '';
          modalViewer.scrollTop = 0;
        }
        if (modalViewer) modalViewer.hidden = !hasImage;
        if (modalPlaceholder) modalPlaceholder.hidden = hasImage;
        modal.classList.toggle('is-viewer', hasImage);
        // 버튼 색: 모달을 연 섹션의 색(data-nav-color)에 맞춤
        modal.dataset.accent = btn.closest('[data-nav-color]')?.dataset.navColor || 'pink';

        // data-modal-no-link: 링크 버튼 숨김 (그래픽 작업 등)
        const noLink = 'modalNoLink' in btn.dataset;
        if (modalLink) modalLink.hidden = noLink;

        // 사이트 링크: data-modal-link 우선, 없으면 같은 버튼 묶음의 새 창 링크(VISIT SITE 등) 사용
        if (modalLink && !noLink) {
          const siblingLink = btn.closest('.project__buttons')?.querySelector('a[target="_blank"]');
          const href = btn.dataset.modalLink || (siblingLink && siblingLink.getAttribute('href')) || '';
          const hasLink = Boolean(href && href !== '#');
          modalLink.href = hasLink ? href : '#';
          modalLink.setAttribute('aria-disabled', String(!hasLink));
          modalLink.tabIndex = hasLink ? 0 : -1;
        }
        modal.classList.add('is-open');
        document.body.style.overflow = 'hidden';
      });
    });

    const closeModal = () => {
      modal.classList.remove('is-open');
      document.body.style.overflow = '';
    };

    if (modalClose) modalClose.addEventListener('click', closeModal);
    // 링크 주소가 없을 때(#)는 클릭해도 이동하지 않음
    if (modalLink) modalLink.addEventListener('click', (e) => {
      if (modalLink.getAttribute('aria-disabled') === 'true') e.preventDefault();
    });
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
