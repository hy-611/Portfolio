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
    const baseColor = dotsWrap.dataset.color;

    const goTo = (index) => {
      slider.style.transform = `translateX(-${index * 100}%)`;
      slides.forEach((slide, i) => slide.classList.toggle('is-active', i === index));
      dots.forEach((dot, i) => dot.classList.toggle('is-active', i === index));
      // 슬라이드에 고유 색(data-nav-color)이 있으면 도트 색도 따라감
      dotsWrap.dataset.color = slides[index]?.dataset.navColor || baseColor;
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

  /* =========================================================
     8. 탑 버튼 — 표지를 지나면 표시, 링으로 스크롤 진행률 표시
  ========================================================= */
  const toTopBtn = document.getElementById('toTop');
  if (toTopBtn) {
    let toTopTicking = false;
    const updateToTop = () => {
      const scrollY = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? Math.min(scrollY / maxScroll, 1) : 0;
      toTopBtn.style.setProperty('--progress', progress.toFixed(4));
      toTopBtn.classList.toggle('is-visible', scrollY > window.innerHeight * 0.6);
      toTopTicking = false;
    };
    window.addEventListener('scroll', () => {
      if (!toTopTicking) {
        requestAnimationFrame(updateToTop);
        toTopTicking = true;
      }
    }, { passive: true });
    window.addEventListener('resize', updateToTop);
    updateToTop();

    toTopBtn.addEventListener('click', () => {
      isPaging = true;
      smoothScrollTo(0, 1200).then(() => { isPaging = false; });
    });
  }

  /* =========================================================
     9. 부드러운 스크롤 — 섹션 단위 이동 (데스크톱)
     - 휠/키보드 한 번에 다음·이전 영역으로, 천천히 출발해 부드럽게 멈추는 곡선으로 이동
     - 화면보다 긴 영역은 한 화면(80%)씩 나눠서 이동
     - 상단 메뉴 링크·탑 버튼도 같은 움직임 사용
  ========================================================= */
  const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  let scrollAnim = null;

  function smoothScrollTo(targetY, duration = 1000) {
    const root = document.documentElement;
    const maxY = root.scrollHeight - window.innerHeight;
    const endY = Math.max(0, Math.min(Math.round(targetY), maxY));
    if (scrollAnim) cancelAnimationFrame(scrollAnim.id);
    if (prefersReducedMotion) {
      window.scrollTo(0, endY);
      return Promise.resolve();
    }
    const startY = window.scrollY;
    const dist = endY - startY;
    if (Math.abs(dist) < 1) {
      scrollAnim = null;
      root.style.scrollBehavior = '';
      return Promise.resolve();
    }

    // CSS의 scroll-behavior: smooth 가 프레임마다 다시 부드럽게 처리하지 않도록 잠시 해제
    root.style.scrollBehavior = 'auto';
    return new Promise(resolve => {
      const startTime = performance.now();
      const step = (now) => {
        const p = Math.min((now - startTime) / duration, 1);
        window.scrollTo(0, startY + dist * easeInOutCubic(p));
        if (p < 1) {
          scrollAnim.id = requestAnimationFrame(step);
        } else {
          scrollAnim = null;
          root.style.scrollBehavior = '';
          resolve();
        }
      };
      scrollAnim = { id: requestAnimationFrame(step) };
    });
  }

  // 페이지 내 링크(#about 등)도 같은 움직임으로 이동
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    const id = link.getAttribute('href');
    if (id.length < 2) return;
    const target = document.querySelector(id);
    if (!target) return;
    link.addEventListener('click', (e) => {
      e.preventDefault();
      isPaging = true;
      smoothScrollTo(target.offsetTop, 1100).then(() => { isPaging = false; });
    });
  });

  const pageSections = Array.from(document.querySelectorAll('.hero, .about, .project, .gallery, .footer'));
  const desktopMQ = window.matchMedia('(min-width: 961px)');
  let isPaging = false;
  let wheelLocked = false;
  let lastWheelTime = 0;

  // 멈출 위치: 각 영역의 맨 위 (마지막 푸터는 페이지 맨 아래에 맞춤)
  const getSnapPoints = () => {
    const maxY = document.documentElement.scrollHeight - window.innerHeight;
    const points = pageSections.map(sec => Math.min(sec.offsetTop, maxY));
    points[points.length - 1] = maxY;
    return [...new Set(points)].sort((a, b) => a - b);
  };

  const pagingEnabled = () =>
    desktopMQ.matches && !prefersReducedMotion && document.body.style.overflow !== 'hidden';

  const page = (dir) => {
    const y = window.scrollY;
    const vh = window.innerHeight;
    const points = getSnapPoints();
    let target;
    if (dir > 0) {
      target = points.find(p => p > y + 2);
      if (target === undefined) return false;
      if (target - y > vh + 2) target = y + vh * 0.8;
    } else {
      target = [...points].reverse().find(p => p < y - 2);
      if (target === undefined) return false;
      if (y - target > vh + 2) target = y - vh * 0.8;
    }
    isPaging = true;
    smoothScrollTo(target, 1000).then(() => { isPaging = false; });
    return true;
  };

  window.addEventListener('wheel', (e) => {
    if (!pagingEnabled() || e.ctrlKey) return;
    if (Math.abs(e.deltaY) < Math.abs(e.deltaX)) return; // 가로 스크롤은 그대로
    e.preventDefault();

    // 트랙패드 관성처럼 이어지는 휠 입력은 한 번으로 처리: 입력이 잠시(200ms) 멈춰야 다음 이동 가능
    const now = performance.now();
    if (now - lastWheelTime > 200) wheelLocked = false;
    lastWheelTime = now;
    if (isPaging || wheelLocked || Math.abs(e.deltaY) < 2) return;

    if (page(Math.sign(e.deltaY))) wheelLocked = true;
  }, { passive: false });

  window.addEventListener('keydown', (e) => {
    if (!pagingEnabled() || e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.target.closest('input, textarea, select, [contenteditable]')) return;
    const isSpace = e.key === ' ';
    if (isSpace && e.target.closest('button, a')) return;
    const down = e.key === 'ArrowDown' || e.key === 'PageDown' || (isSpace && !e.shiftKey);
    const up = e.key === 'ArrowUp' || e.key === 'PageUp' || (isSpace && e.shiftKey);
    if (!down && !up) return;
    e.preventDefault();
    if (!isPaging) page(down ? 1 : -1);
  });

});
