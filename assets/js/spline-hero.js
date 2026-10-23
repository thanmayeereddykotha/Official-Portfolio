/**
 * Spline 3D Hero Desk Engine
 * 
 * Features:
 * - Real-time stream download with Luxury Loader progress sync (000% -> 100%)
 * - Native Canvas rendering with zero Spline watermark
 * - Clean White Theme background (#ffffff) for the 3D desk interior
 * - Fixed Hero Viewport with Scroll Lock: Page scroll is strictly locked while 3D hero
 *   is active. User must click the monitor to enter the portfolio website.
 * - Framed Outer Black Border preserved as requested
 * - Interactive MacBook Gateway: Clicking the MacBook in the 3D scene navigates to /work (projects)
 * - Cinematic Monitor Zoom Portal: Clicking the monitor zooms deeply and smoothly into the screen (scale 5.5x),
 *   creating a complete and seamless flight into the portfolio, then unlocks smooth scrolling.
 * - Floating "3D Desk" button in bottom nav to restore the 3D desk anytime.
 */

import { Application } from 'https://unpkg.com/@splinetool/runtime@2.0.107/build/runtime.js';

(function () {
  'use strict';

  const MODEL_PATHS = [
    '/assets/models/scene.splinecode',
    '/assets/models/spline/scene.splinecode'
  ];

  let app = null;
  let canvas = null;
  let container = null;
  let isEnteringPortfolio = false;
  let isDeskActive = true;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSplineHero);
  } else {
    initSplineHero();
  }

  // Lock scroll immediately while page is loading / desk is active
  lockPageScroll();

  // Initialize browser history for 3D model section
  try {
    if (!history.state || !history.state.section) {
      history.replaceState({ section: '3d-desk' }, '', window.location.pathname);
    }
  } catch (e) {}

  // Handle browser back/forward buttons
  window.addEventListener('popstate', (e) => {
    const isDeskState = e.state?.section === '3d-desk' || (!window.location.hash.includes('portfolio') && !isDeskActive);
    if (isDeskState && !isDeskActive) {
      reopenDesk(false);
    } else if (window.location.hash.includes('portfolio') && isDeskActive) {
      enterPortfolio(false);
    }
  });

  window.addEventListener('hashchange', () => {
    if (!window.location.hash.includes('portfolio') && !isDeskActive) {
      reopenDesk(false);
    }
  });

  function lockPageScroll() {
    isDeskActive = true;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.documentElement.style.height = '100%';
    document.body.style.height = '100%';
    document.body.classList.add('has-3d-desk');
    const nav = document.querySelector('.nav_fixed');
    if (nav) nav.classList.add('nav-at-top');
    if (window.lenis && typeof window.lenis.stop === 'function') {
      window.lenis.stop();
    }
  }

  function unlockPageScroll() {
    isDeskActive = false;
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
    document.documentElement.style.height = '';
    document.body.style.height = '';
    document.body.classList.remove('has-3d-desk');
    const nav = document.querySelector('.nav_fixed');
    if (nav) nav.classList.remove('nav-at-top');
    if (window.lenis && typeof window.lenis.start === 'function') {
      window.lenis.start();
    }
  }

  // Prevent scroll events from scrolling the page behind the fixed 3D hero
  window.addEventListener('wheel', (e) => {
    if (isDeskActive && !isEnteringPortfolio) {
      if (!canvas || !canvas.contains(e.target)) {
        e.preventDefault();
      }
    }
  }, { passive: false });

  window.addEventListener('touchmove', (e) => {
    if (isDeskActive && !isEnteringPortfolio) {
      if (!canvas || !canvas.contains(e.target)) {
        e.preventDefault();
      }
    }
  }, { passive: false });

  async function initSplineHero() {
    canvas = document.getElementById('hero3dCanvas');
    container = document.getElementById('hero3dContainer');
    if (!canvas || !container) return;

    // Interior white theme for 3D desk (outer black frame is preserved on .hero-video_wrapper)
    container.style.background = '#ffffff';
    container.style.transition = 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';

    // 1. Fetch 3D Model with Real-Time Progress Streaming
    try {
      const buffer = await fetchModelWithProgress(MODEL_PATHS);
      
      if (window.setLoaderProgress) {
        window.setLoaderProgress(0.94, 'initializing 3d rendering engine...');
      }

      // 2. Initialize Spline Application
      app = new Application(canvas);

      // Disable any watermark in pipeline
      if (app._renderer?.pipeline?.setWatermark) {
        app._renderer.pipeline.setWatermark(null);
      }

      // Load buffer into application
      await app.start(buffer);

      // Remove / hide any embedded iframe from the 3D scene
      hideSceneIframes();

      // Disable watermark again after start
      if (app._renderer?.pipeline?.setWatermark) {
        app._renderer.pipeline.setWatermark(null);
      }

      // 3. Complete Luxury Loader
      if (window.completeLoader) {
        window.completeLoader('kotha thanmayee reddy — ready.');
      }

      // 4. Setup 3D Interactions
      setupSceneInteractions();
      setupFloatingControls();

    } catch (err) {
      console.warn('Spline 3D load error, gracefully revealing page:', err);
      unlockPageScroll();
      if (window.completeLoader) {
        window.completeLoader('kotha thanmayee reddy — ready.');
      }
    }
  }

  /**
   * Fetches the model with streaming progress updates
   */
  async function fetchModelWithProgress(paths) {
    let response = null;

    for (const url of paths) {
      try {
        const res = await fetch(url);
        if (res.ok) {
          response = res;
          break;
        }
      } catch (e) {
        // try next path
      }
    }

    if (!response) {
      throw new Error('Could not fetch scene.splinecode from any known path.');
    }

    const contentLength = response.headers.get('content-length');
    const totalBytes = contentLength ? parseInt(contentLength, 10) : 68609614;

    const reader = response.body.getReader();
    let receivedBytes = 0;
    const chunks = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      receivedBytes += value.length;

      const ratio = Math.min(0.92, receivedBytes / totalBytes);
      if (window.setLoaderProgress) {
        const pct = Math.round(ratio * 100);
        window.setLoaderProgress(0.10 + ratio * 0.82, `fetching 3d spatial workspace... ${pct}%`);
      }
    }

    // Assemble all chunks into a single ArrayBuffer
    const combined = new Uint8Array(receivedBytes);
    let offset = 0;
    for (const chunk of chunks) {
      combined.set(chunk, offset);
      offset += chunk.length;
    }

    return combined.buffer;
  }

  /**
   * Detects if a Spline object or any ancestor is the Monitor
   */
  function isMonitorObject(target) {
    let cur = target;
    let depth = 0;
    while (cur && depth < 8) {
      const name = (cur.name || '').toLowerCase();
      const id = (cur.id || cur.uuid || '').toLowerCase();
      if (
        name.includes('monitor') ||
        name.includes('screen') ||
        name.includes('sketchfab_model') ||
        name.includes('monitorfbx') ||
        name.includes('glass_screen') ||
        id === '1b3d1d3c-823c-4903-ac23-c4119719994f' ||
        id === '28156096-1376-427d-8b5f-cb52931f829b'
      ) {
        return true;
      }
      cur = cur.parent;
      depth++;
    }
    return false;
  }

  /**
   * Detects if a Spline object or any ancestor is the MacBook
   */
  function isMacBookObject(target) {
    let cur = target;
    let depth = 0;
    while (cur && depth < 8) {
      const name = (cur.name || '').toLowerCase();
      const id = (cur.id || cur.uuid || '').toLowerCase();
      if (
        name.includes('macbook') ||
        name.includes('laptop') ||
        name.includes('macbook_neo')
      ) {
        return true;
      }
      cur = cur.parent;
      depth++;
    }
    return false;
  }

  /**
   * Sets up 3D interactions:
   * - Monitor click -> cinematic zoom into monitor screen -> enter portfolio
   * - MacBook click -> navigate to /work
   * - Hover state updates cursor & status badge
   */
  function setupSceneInteractions() {
    if (!app || !canvas) return;

    // Hover detection - update cursor only, keep status text clean as 'Interactive 3D Model'
    app.addEventListener('mouseHover', (e) => {
      if (isEnteringPortfolio) return;

      const isMonitor = isMonitorObject(e.target);
      const isMacBook = isMacBookObject(e.target);

      if (isMonitor || isMacBook) {
        canvas.style.cursor = 'pointer';
      } else {
        canvas.style.cursor = 'grab';
      }
    });

    // Spline-level click
    app.addEventListener('mouseDown', (e) => {
      if (isEnteringPortfolio) return;
      if (isMonitorObject(e.target)) {
        enterPortfolio();
      } else if (isMacBookObject(e.target)) {
        navigateToProjects();
      }
    });

    // Native canvas click fallback
    canvas.addEventListener('click', (e) => {
      if (isEnteringPortfolio) return;
      if (canvas.style.cursor === 'pointer') {
        enterPortfolio();
      }
    });
  }

  function hideSceneIframes() {
    if (!container) return;
    const iframes = container.querySelectorAll('iframe');
    iframes.forEach(iframe => {
      iframe.style.display = 'none';
      iframe.style.opacity = '0';
      iframe.style.pointerEvents = 'none';
    });
  }

  /**
   * MacBook navigation to /work
   */
  function navigateToProjects() {
    if (isEnteringPortfolio) return;
    isEnteringPortfolio = true;

    if (window.gsap) {
      gsap.to(container, {
        opacity: 0,
        scale: 1.06,
        duration: 0.45,
        ease: 'power2.in',
        onComplete: () => {
          window.location.href = '/work';
        }
      });
    } else {
      window.location.href = '/work';
    }
  }

  /**
   * Cinematic Zoom-in Animation into Monitor Screen
   * - Keeps zoom animation completely smooth, unbroken, and dramatic
   * - Deep zoom directly into the monitor screen (scale: 5.5, origin: 51% 41%)
   * - Seamlessly transitions into the portfolio website
   * - Unlocks scroll only after entrance is complete
   */
  function enterPortfolio(pushHistory = true) {
    if (isEnteringPortfolio) return;
    isEnteringPortfolio = true;

    if (pushHistory) {
      try {
        history.pushState({ section: 'portfolio' }, '', window.location.pathname + '#portfolio');
      } catch (e) {}
    }

    const heroSection = document.querySelector('.section_home-hero');
    const overlay = container ? container.querySelector('.hero-3d_overlay') : null;

    // Set transform origin centered directly on the monitor screen
    canvas.style.transformOrigin = '51% 41%';

    if (window.gsap) {
      // 1. Immediately fade out overlay pills so flight is clean
      if (overlay) {
        gsap.to(overlay, { opacity: 0, duration: 0.25, ease: 'power2.out' });
      }

      // 2. Cinematic camera flight directly into the monitor screen
      gsap.to(canvas, {
        scale: 5.5,
        duration: 1.25,
        ease: 'power2.inOut'
      });

      // 3. As monitor screen fills the entire viewport, smoothly fade to the portfolio
      gsap.to(container, {
        opacity: 0,
        delay: 0.88,
        duration: 0.38,
        ease: 'power2.inOut',
        onComplete: () => {
          completePortfolioEntrance(heroSection);
        }
      });

    } else {
      completePortfolioEntrance(heroSection);
    }
  }

  function completePortfolioEntrance(heroSection) {
    if (heroSection) {
      heroSection.style.display = 'none';
      heroSection.style.visibility = 'hidden';
      heroSection.style.height = '0px';
    }

    // Unlock page scrolling for the portfolio
    unlockPageScroll();

    // Ensure we start at top of portfolio
    window.scrollTo({ top: 0, behavior: 'instant' });

    // Smooth subtle fade-in of portfolio content
    if (window.gsap) {
      gsap.fromTo('.main-wrapper > section:not(.section_home-hero)', 
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }
      );
    }

    // Show floating "Back to 3D" button in fixed bottom nav & floating back pill
    updateNavDeskToggle(true);

    const backBtn = document.getElementById('portfolioBackToHeroBtn');
    if (backBtn) {
      backBtn.style.display = 'flex';
      if (window.gsap) {
        gsap.fromTo(backBtn, { opacity: 0, x: -16 }, { opacity: 1, x: 0, duration: 0.45, ease: 'power2.out' });
      }
    }
  }

  /**
   * Restores the 3D Desk when the user clicks "Back to 3D" or browser Back
   */
  function reopenDesk(pushHistory = true) {
    if (!container) return;
    isEnteringPortfolio = false;

    if (pushHistory) {
      try {
        history.pushState({ section: '3d-desk' }, '', window.location.pathname);
      } catch (e) {}
    }
    
    const heroSection = document.querySelector('.section_home-hero');
    if (heroSection) {
      heroSection.style.display = '';
      heroSection.style.visibility = 'visible';
      heroSection.style.height = 'auto';
    }

    // Re-lock scroll while inside 3D desk
    lockPageScroll();
    window.scrollTo({ top: 0, behavior: 'instant' });

    const overlay = container.querySelector('.hero-3d_overlay');
    if (overlay) overlay.style.opacity = '1';

    const backBtn = document.getElementById('portfolioBackToHeroBtn');
    if (backBtn) backBtn.style.display = 'none';

    if (window.gsap) {
      gsap.set(canvas, { scale: 1, opacity: 1 });
      gsap.fromTo(container, 
        { opacity: 0, scale: 0.97 },
        { opacity: 1, scale: 1, duration: 0.75, ease: 'power3.out' }
      );
    } else {
      canvas.style.transform = 'none';
      canvas.style.opacity = '1';
      container.style.opacity = '1';
    }

    updateNavDeskToggle(false);
  }

  /**
   * Sets up direct click button, back navigation, and global tools
   */
  function setupFloatingControls() {
    const directBtn = document.getElementById('heroEnterDirectBtn');
    if (directBtn) {
      directBtn.addEventListener('click', (e) => {
        e.preventDefault();
        enterPortfolio(true);
      });
    }

    // Floating Back to 3D button on portfolio
    const backBtn = document.getElementById('portfolioBackToHeroBtn');
    if (backBtn) {
      backBtn.addEventListener('click', (e) => {
        e.preventDefault();
        reopenDesk(true);
      });
    }

    // Add "Back to 3D" toggle to the fixed bottom navigation
    setupNavDeskToggle();
  }

  function setupNavDeskToggle() {
    const navMenu = document.querySelector('.nav_menu');
    if (!navMenu) return;

    if (!document.getElementById('navDeskToggle')) {
      const deskLink = document.createElement('a');
      deskLink.id = 'navDeskToggle';
      deskLink.className = 'nav-link_wrapper';
      deskLink.href = '#';
      deskLink.style.display = 'none'; // hidden while desk is active
      deskLink.innerHTML = `
        <div class="nav-dot w-embed">
          <svg fill="none" height="6" viewBox="0 0 6 6" width="6" xmlns="http://www.w3.org/2000/svg">
            <circle cx="3" cy="3" fill="#ffffff" r="3"></circle>
          </svg>
        </div>
        <div>Back to 3D</div>
      `;
      deskLink.addEventListener('click', (e) => {
        e.preventDefault();
        reopenDesk(true);
      });
      navMenu.prepend(deskLink);
    }
  }

  function updateNavDeskToggle(deskClosed) {
    const deskLink = document.getElementById('navDeskToggle');
    if (deskLink) {
      deskLink.style.display = deskClosed ? 'flex' : 'none';
    }
  }

  /**
   * Universal Toast & Clipboard Helpers
   */
  function showToast(message) {
    let toast = document.getElementById('globalAppToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'globalAppToast';
      toast.style.cssText = `
        position: fixed;
        bottom: 5rem;
        left: 50%;
        transform: translateX(-50%) translateY(20px);
        background: rgba(14, 18, 22, 0.94);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        color: #ffffff;
        padding: 9px 20px;
        border-radius: 999px;
        font-family: var(--font--sans-serif);
        font-size: 0.78rem;
        font-weight: 500;
        letter-spacing: 0.02em;
        box-shadow: 0 16px 48px rgba(0,0,0,0.7);
        z-index: 99999;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        display: flex;
        align-items: center;
        gap: 8px;
        white-space: nowrap;
      `;
      document.body.appendChild(toast);
    }
    toast.innerHTML = `<span style="color: #4ade80;">✓</span> <span>${message}</span>`;
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';

    clearTimeout(toast.__timer);
    toast.__timer = setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(20px)';
    }, 3200);
  }
  window.showToast = showToast;

  function copyTextToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
    } catch (err) {}
    document.body.removeChild(textArea);
    return Promise.resolve();
  }
  window.copyTextToClipboard = copyTextToClipboard;

  // Expose global controller
  window.SplineHero = {
    enterPortfolio,
    reopenDesk,
    navigateToProjects,
    isDeskActive: () => isDeskActive
  };

})();
