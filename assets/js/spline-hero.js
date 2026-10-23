/**
 * Spline 3D Hero Desk Engine
 * 
 * Features:
 * - Real-time stream download with Luxury Loader progress sync (000% -> 100%)
 * - Native Canvas rendering with zero Spline watermark
 * - Clean White Theme background (#ffffff) matching the website's work page
 * - Drop-in entrance choreography
 * - Interactive Monitor Gateway: Clicking the monitor zooms in, smoothly collapses
 *   the 3D container so it no longer takes space in the home page, and reveals the
 *   portfolio directly.
 * - Floating "3D Desk" button in bottom nav to toggle the 3D desk view back anytime.
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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSplineHero);
  } else {
    initSplineHero();
  }

  async function initSplineHero() {
    canvas = document.getElementById('hero3dCanvas');
    container = document.getElementById('hero3dContainer');
    if (!canvas || !container) return;

    // Apply clean white theme styling to 3D container
    container.style.background = '#ffffff';
    container.style.transition = 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
    const wrapper = container.closest('.hero-video_wrapper');
    if (wrapper) wrapper.style.background = '#ffffff';

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

      // Remove / hide any embedded iframe from the 3D scene (removes template overlays/hints)
      hideSceneIframes();

      // Disable any watermark in pipeline
      if (app._renderer?.pipeline?.setWatermark) {
        app._renderer.pipeline.setWatermark(null);
      }

      // 3. Complete Luxury Loader
      if (window.completeLoader) {
        window.completeLoader('kotha thanmayee reddy — ready.');
      }

      // 4. Setup 3D Interactions
      setupMonitorInteractions();
      setupFloatingControls();

    } catch (err) {
      console.warn('Spline 3D load error, gracefully revealing page:', err);
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
    let successfulUrl = null;

    for (const url of paths) {
      try {
        const res = await fetch(url);
        if (res.ok) {
          response = res;
          successfulUrl = url;
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
   * Detects if a Spline object or any of its ancestors is the Monitor or Screen
   */
  function isMonitorObject(target) {
    let cur = target;
    let depth = 0;
    while (cur && depth < 8) {
      const name = (cur.name || '').toLowerCase();
      const id = cur.id || cur.uuid || '';
      if (
        name.includes('monitor') ||
        name.includes('screen') ||
        name.includes('sketchfab_model') ||
        name.includes('monitorfbx') ||
        name.includes('rootnode') ||
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
   * Sets up mouse events for the monitor and cursor
   */
  function setupMonitorInteractions() {
    if (!app || !canvas) return;

    // Hover detection
    app.addEventListener('mouseHover', (e) => {
      if (isEnteringPortfolio) return;
      const isMonitor = isMonitorObject(e.target);
      canvas.style.cursor = isMonitor ? 'pointer' : 'grab';
      
      const prompt = document.getElementById('monitorClickPrompt');
      if (prompt) {
        if (isMonitor) {
          prompt.classList.add('is-hovered');
        } else {
          prompt.classList.remove('is-hovered');
        }
      }
    });

    // Spline-level click
    app.addEventListener('mouseDown', (e) => {
      if (isEnteringPortfolio) return;
      if (isMonitorObject(e.target)) {
        enterPortfolio();
      }
    });

    // Native canvas click fallback
    canvas.addEventListener('click', (e) => {
      if (isEnteringPortfolio) return;
      // If cursor is pointer, user definitely clicked the interactive monitor
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
   * Smoothly transitions from the 3D Desk into the Portfolio
   * Removes the 3D model container from taking up space in the home page
   */
  function enterPortfolio() {
    if (isEnteringPortfolio) return;
    isEnteringPortfolio = true;

    const heroSection = document.querySelector('.section_home-hero');

    // 1. Play dramatic zoom effect on canvas & fade out container
    if (window.gsap) {
      gsap.to(canvas, {
        scale: 1.35,
        opacity: 0,
        duration: 0.6,
        ease: 'power3.in'
      });

      gsap.to(container, {
        opacity: 0,
        duration: 0.6,
        ease: 'power3.inOut',
        onComplete: () => {
          if (heroSection) {
            heroSection.style.position = 'absolute';
            heroSection.style.visibility = 'hidden';
            heroSection.style.pointerEvents = 'none';
            heroSection.style.height = '0px';
            heroSection.style.overflow = 'hidden';
          }
          
          // Smooth scroll to top of homepage content
          window.scrollTo({ top: 0, behavior: 'smooth' });

          // Show floating 3D Desk toggle in fixed navbar
          updateNavDeskToggle(true);
        }
      });
    } else {
      if (heroSection) {
        heroSection.style.position = 'absolute';
        heroSection.style.visibility = 'hidden';
        heroSection.style.pointerEvents = 'none';
        heroSection.style.height = '0px';
        heroSection.style.overflow = 'hidden';
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
      updateNavDeskToggle(true);
    }
  }

  /**
   * Restores the 3D Desk when the user clicks "3D Desk" in the nav
   */
  function reopenDesk() {
    if (!container) return;
    isEnteringPortfolio = false;
    
    const heroSection = document.querySelector('.section_home-hero');
    if (heroSection) {
      heroSection.style.position = 'relative';
      heroSection.style.visibility = 'visible';
      heroSection.style.pointerEvents = 'auto';
      heroSection.style.height = 'auto';
      heroSection.style.overflow = 'visible';
    }

    container.style.opacity = '1';

    if (window.gsap) {
      gsap.set(canvas, { scale: 1, opacity: 1 });
      gsap.fromTo(container, 
        { opacity: 0, scale: 0.96 },
        { opacity: 1, scale: 1, duration: 0.75, ease: 'power3.out' }
      );
    } else {
      canvas.style.opacity = '1';
      canvas.style.transform = 'none';
      container.style.opacity = '1';
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
    updateNavDeskToggle(false);
  }

  /**
   * Adds the floating prompt over the 3D viewport and adds the nav desk toggle
   */
  function setupFloatingControls() {
    const directBtn = document.getElementById('heroEnterDirectBtn');
    if (directBtn) {
      directBtn.addEventListener('click', enterPortfolio);
    }

    // 2. Add "3D Desk" toggle to the fixed bottom navigation
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
      deskLink.style.display = 'none'; // hidden initially while desk is open
      deskLink.innerHTML = `
        <div class="nav-dot w-embed">
          <svg fill="none" height="6" viewBox="0 0 6 6" width="6" xmlns="http://www.w3.org/2000/svg">
            <circle cx="3" cy="3" fill="#ffffff" r="3"></circle>
          </svg>
        </div>
        <div>3D Desk</div>
      `;
      deskLink.addEventListener('click', (e) => {
        e.preventDefault();
        reopenDesk();
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

  // Expose global controller
  window.SplineHero = {
    enterPortfolio,
    reopenDesk
  };

})();
