import { PageFlip } from 'page-flip';

export const createCustomFlipbook = (element, options = {}) => {
  const settings = {
    pageGap: options.pageGap || 40,
    coverTransparent: options.coverTransparent !== false,
    touchSensitivity: options.touchSensitivity || 5,
    flipTime: options.flipTime || 700,
    shadows: options.shadows !== false,
    shadowOpacity: options.shadowOpacity || 0.3,
    rtl: options.rtl || false
  };

  const flip = new PageFlip(element, {
    width: options.width || element.clientWidth * 0.5,
    height: options.height || element.clientHeight,
    size: 'stretch',
    showCover: true,
    drawShadow: settings.shadows,
    maxShadowOpacity: settings.shadowOpacity,
    flippingTime: settings.flipTime,
    usePortrait: false,
    startPage: options.startPage || 0,
    minWidth: 10,
    minHeight: 10,
    maxWidth: 2000,
    maxHeight: 2000,
    mobileScrollSupport: true,
    useMouseEvents: true,
    useSwipe: true,
    swipeDistance: settings.touchSensitivity,
    touchEventForce: settings.touchSensitivity,
    disableFlipByClick: false,
    direction: settings.rtl ? 2 : 1,
    pageMargin: settings.pageGap
  });

  setTimeout(() => {
    document.querySelectorAll('.stf__item').forEach(item => {
      item.style.marginRight = `${settings.pageGap}px`;
    });

    const pages = element.querySelectorAll('.stf__block');
    if (pages.length > 0 && settings.coverTransparent) {
      if (pages[0] && pages[0].querySelector('.stpage')) {
        const firstPage = pages[0].querySelector('.stpage');
        firstPage.style.background = 'transparent';
        firstPage.style.boxShadow = 'none';
        firstPage.style.border = 'none';
      }
      if (pages[pages.length - 1] && pages[pages.length - 1].querySelector('.stpage')) {
        const lastPage = pages[pages.length - 1].querySelector('.stpage');
        lastPage.style.background = 'transparent';
        lastPage.style.boxShadow = 'none';
        lastPage.style.border = 'none';
      }
    }

    element.querySelectorAll('.stpage img').forEach(img => {
      img.style.objectFit = 'contain';
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.background = 'transparent';
      img.style.boxShadow = 'none';
      img.style.border = 'none';
    });
  }, 100);

  flip.setPageGap = (gapInPx) => {
    settings.pageGap = gapInPx;
    document.querySelectorAll('.stf__item').forEach(item => {
      item.style.marginRight = `${gapInPx}px`;
    });
  };

  return flip;
};