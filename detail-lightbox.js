(() => {
  const main = document.querySelector('main');
  if (!main) return;

  const isWorksPage = document.body.classList.contains('works-detail-page') ||
    !!document.querySelector('.works-page-jump:not(.other-page-jump)');

  const dialog = document.createElement('div');
  dialog.className = 'image-lightbox';
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  dialog.setAttribute('aria-label', '拡大画像');
  dialog.setAttribute('aria-hidden', 'true');
  dialog.innerHTML = '<button class="image-lightbox-close" type="button" aria-label="拡大画像を閉じる"><span></span><span></span></button><div class="image-lightbox-media"></div>';
  document.body.appendChild(dialog);

  const media = dialog.querySelector('.image-lightbox-media');
  const closeButton = dialog.querySelector('.image-lightbox-close');
  let previousFocus = null;

  const zoomTargets = [];

  const addTarget = (element) => {
    element.classList.add('is-zoomable');
    element.setAttribute('tabindex', '0');
    element.setAttribute('role', 'button');
    const alt = element.matches('img') ? element.alt : element.querySelector('img')?.alt;
    element.setAttribute('aria-label', alt ? `${alt}を拡大表示` : '画像を拡大表示');
    zoomTargets.push(element);
  };

  if (isWorksPage) {
    main.querySelectorAll('[data-lightbox]').forEach(addTarget);
  } else {
    main.querySelectorAll('img, .variation-board, .mono-board, .logo-board').forEach((element) => {
      if (element.matches('img') && element.closest('.variation-board, .mono-board, .logo-board')) return;
      if (element.closest('.hero-logo, .process-chapter, .logo-variations')) return;
      if (element.closest('#atsureki') && element.closest('figure')?.querySelector('img[src*="atsureki-process"]')) return;
      addTarget(element);
    });
  }

  const open = (target) => {
    previousFocus = target;
    const kind = target.dataset.lightbox || '';
    dialog.dataset.kind = kind;

    let clone;
    const replacementSrc = target.dataset.lightboxSrc;
    if (replacementSrc && target.matches('img')) {
      clone = target.cloneNode(false);
      clone.src = replacementSrc;
    } else {
      clone = target.cloneNode(true);
    }

    clone.classList.remove('is-zoomable');
    clone.removeAttribute('tabindex');
    clone.removeAttribute('role');
    clone.removeAttribute('aria-label');
    clone.removeAttribute('data-lightbox');
    clone.removeAttribute('data-lightbox-src');
    clone.querySelectorAll?.('.is-zoomable, [tabindex], [role="button"]').forEach((child) => {
      child.classList.remove('is-zoomable');
      child.removeAttribute('tabindex');
      child.removeAttribute('role');
      child.removeAttribute('aria-label');
    });

    media.replaceChildren(clone);
    media.scrollTop = 0;
    document.body.classList.add('lightbox-open');
    dialog.classList.add('is-open');
    dialog.setAttribute('aria-hidden', 'false');
    closeButton.focus();
  };

  const close = () => {
    if (!dialog.classList.contains('is-open')) return;
    dialog.classList.remove('is-open');
    dialog.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lightbox-open');
    delete dialog.dataset.kind;
    media.replaceChildren();
    previousFocus?.focus();
  };

  zoomTargets.forEach((target) => {
    target.addEventListener('click', () => open(target));
    target.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        open(target);
      }
    });
  });

  closeButton.addEventListener('click', close);
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog || event.target === media) close();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') close();
  });
})();
