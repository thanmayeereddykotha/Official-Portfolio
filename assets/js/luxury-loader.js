/**
 * Luxury Architectural Start Loader & Transition Engine
 * Minimalist Monochromatic Dark Architecture
 * 
 * Choreography:
 * 1. At start, ONLY the loading bar track and percentage counter show.
 * 2. After a brief start (250ms), the status title and bio typography smoothly slide into view (.is-revealed).
 * 3. Text stays visible throughout loading without flickering or disappearing.
 * 4. At 100%, track collapses, text slides down into mask (.is-exiting), and page reveals.
 */

(function () {
  'use strict';

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLoader);
  } else {
    initLoader();
  }

  function initLoader() {
    const loader = document.getElementById('luxuryLoader');
    if (!loader) return;

    const trackFill = loader.querySelector('.js-loader-track');
    const cursor = loader.querySelector('.js-loader-cursor');
    const cursorText = loader.querySelector('.js-loader-cursor-text');
    const cursorBadge = loader.querySelector('.loader__cursor-badge');
    const trackBg = loader.querySelector('.js-loader-bar');
    const itemTicker = loader.querySelector('.js-loader-item');
    const pageVeil = document.querySelector('.js-page-veil');

    // Telemetry milestones
    const milestones = [
      { progress: 0.15, text: 'loading core subsystems...' },
      { progress: 0.38, text: 'calibrating 3d neural viewport...' },
      { progress: 0.65, text: 'connecting github contribution matrix...' },
      { progress: 0.88, text: 'compiling analytics & mba case studies...' },
      { progress: 1.00, text: 'kotha thanmayee reddy — ready.' }
    ];

    const state = {
      progress: 0,
      targetProgress: 0,
      textRevealed: false,
      isExiting: false,
      isDrivenBy3D: false
    };

    // 1. Initial State: ONLY loading bar and percentage counter show
    loader.classList.remove('is-revealed', 'is-exiting');

    if (window.gsap) {
      gsap.set(loader, { opacity: 1, visibility: 'visible', pointerEvents: 'auto' });
      gsap.set(trackFill, { scaleX: 0, transformOrigin: 'left' });
      gsap.set(cursor, { left: '0%', xPercent: 0, yPercent: -50 });
      gsap.set(cursorBadge, { scaleY: 1, opacity: 1 });

      // Animate Hairline Track in
      gsap.from(trackBg, {
        scaleX: 0,
        transformOrigin: 'left',
        duration: 0.7,
        ease: 'power3.out'
      });
    }

    // Function to smoothly reveal text after loading has begun
    function revealText() {
      if (state.textRevealed) return;
      state.textRevealed = true;
      loader.classList.add('is-revealed');
    }

    // Trigger typography reveal after a short initial pause (280ms)
    setTimeout(revealText, 280);

    // 2. Continuous Progress Updater
    function setProgress(val, label) {
      val = Math.max(0, Math.min(1, val));
      state.targetProgress = val;

      if (window.gsap) {
        gsap.to(state, {
          progress: val,
          duration: Math.max(0.35, Math.abs(val - state.progress) * 2.0),
          ease: 'power3.out',
          overwrite: 'auto',
          onUpdate: () => {
            const p = state.progress;
            
            // Trigger text reveal if not yet revealed
            if (p >= 0.12 && !state.textRevealed) {
              revealText();
            }

            // 1px Active Track scaling
            if (trackFill) {
              trackFill.style.transform = `translateY(-50%) scaleX(${p})`;
            }

            // Self-compensating cursor positioning
            if (cursor) {
              cursor.style.left = `${p * 100}%`;
              cursor.style.transform = `translate(${-100 * p}%, -50%)`;
            }

            // 3-digit padded counter (000% - 100%)
            if (cursorText) {
              cursorText.textContent = `${Math.round(p * 100)}`.padStart(3, '0') + '%';
            }

            // Dynamic Milestone Ticker Label
            if (itemTicker) {
              let currentLabel = label;
              if (!currentLabel) {
                for (let i = 0; i < milestones.length; i++) {
                  if (p <= milestones[i].progress) {
                    currentLabel = milestones[i].text;
                    break;
                  }
                }
                if (!currentLabel) currentLabel = milestones[milestones.length - 1].text;
              }
              itemTicker.textContent = currentLabel;
            }
          },
          onComplete: () => {
            if (val >= 1 && !state.isExiting) {
              state.isExiting = true;
              executeExitTransition();
            }
          }
        });
      } else {
        // Fallback without GSAP
        if (trackFill) trackFill.style.transform = `translateY(-50%) scaleX(${val})`;
        if (cursor) cursor.style.left = `${val * 100}%`;
        if (cursorText) cursorText.textContent = `${Math.round(val * 100)}`.padStart(3, '0') + '%';
        if (val >= 0.15 && !state.textRevealed) revealText();
        if (val >= 1 && !state.isExiting) {
          state.isExiting = true;
          executeExitTransition();
        }
      }
    }

    // Expose dynamic progress updater for 3D model synchronization
    window.setLoaderProgress = function(val, label) {
      state.isDrivenBy3D = true;
      setProgress(val, label);
    };

    window.completeLoader = function(label) {
      setProgress(1.0, label || 'kotha thanmayee reddy — ready.');
    };

    // 3. Page Lifecycle Initialization
    setProgress(0.08, 'initializing 3d neural viewport...');

    // Fonts ready milestone
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        if (!state.isDrivenBy3D) {
          setProgress(0.24, 'calibrating typography...');
        }
      });
    }

    // Window load milestone (only advances if 3D loader hasn't taken over)
    window.addEventListener('load', () => {
      if (!state.isDrivenBy3D) {
        setProgress(0.65, 'connecting telemetry & projects...');
        setTimeout(() => {
          if (!state.isDrivenBy3D) {
            setProgress(1.0, 'kotha thanmayee reddy — ready.');
          }
        }, 400);
      }
    });

    // Safety timeout: Maximum wait time fallback if 3D is taking abnormally long or fails
    setTimeout(() => {
      if (state.progress < 1) {
        setProgress(1.0, 'kotha thanmayee reddy — ready.');
      }
    }, 18000);

    // 4. Orchestrated Exit Transition to Front Page
    function executeExitTransition() {
      setTimeout(() => {
        // Step 1: Trigger typography exit in reverse (slides down into mask)
        loader.classList.remove('is-revealed');
        loader.classList.add('is-exiting');

        if (!window.gsap) {
          loader.style.opacity = '0';
          if (pageVeil) pageVeil.style.opacity = '0';
          setTimeout(() => {
            if (loader && loader.parentNode) loader.parentNode.removeChild(loader);
            if (pageVeil && pageVeil.parentNode) pageVeil.parentNode.removeChild(pageVeil);
          }, 600);
          return;
        }

        const exitTl = gsap.timeline({
          defaults: { ease: 'power4.inOut' },
          onComplete: () => {
            if (pageVeil && pageVeil.parentNode) pageVeil.parentNode.removeChild(pageVeil);
            if (loader && loader.parentNode) loader.parentNode.removeChild(loader);

            // Trigger 3D model waterfall drop animation strictly once after loader is completely removed
            window.dispatchEvent(new CustomEvent('hero:revealed'));
            window.dispatchEvent(new CustomEvent('loader:complete'));
          }
        });

        // Step 2: Active track line collapses to left
        exitTl.to(trackFill, {
          scaleX: 0,
          transformOrigin: 'left',
          duration: 0.48
        }, 0);

        // Step 3: Fade out entire loader backdrop and veil
        exitTl.to(loader, {
          opacity: 0,
          duration: 0.75,
          ease: 'power4.inOut'
        }, 0.25);

        if (pageVeil) {
          exitTl.to(pageVeil, {
            opacity: 0,
            duration: 0.75,
            ease: 'power4.inOut'
          }, 0.25);
        }

        // Step 4: Front Page Entrance Choreography
        const navContainer = document.querySelector('.nav_fixed .nav_container');
        const heroSection = document.querySelector('.section_home-hero');
        const heroHeader = document.querySelector('.hero_header-wrap');
        const hero3D = document.getElementById('hero3dContainer');

        // Ensure user starts cleanly at the top of the hero
        if (typeof lenis !== 'undefined' && lenis) {
          lenis.scrollTo(0, { immediate: true });
        } else {
          window.scrollTo(0, 0);
        }

        if (navContainer) {
          exitTl.fromTo(navContainer, 
            { y: 24, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.85, ease: 'power3.out' },
            0.35
          );
        }

        if (heroHeader || heroSection) {
          const targetHero = heroHeader || heroSection;
          exitTl.fromTo(targetHero,
            { y: 24, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.95, ease: 'power3.out' },
            0.4
          );
        }

        if (hero3D) {
          exitTl.fromTo(hero3D,
            { scale: 0.92, opacity: 0 },
            { scale: 1, opacity: 1, duration: 1.1, ease: 'power2.out' },
            0.45
          );
        }

      }, 180);
    }

    // 5. Film Grain Noise Overlay (Cinematographer Aesthetic)
    initNoiseOverlay();
  }

  function initNoiseOverlay() {
    const canvas = document.createElement('canvas');
    canvas.className = 'loader-noise-canvas';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;

    function resize() {
      width = canvas.width = Math.min(window.innerWidth, 640);
      height = canvas.height = Math.min(window.innerHeight, 480);
      generateNoise();
    }

    function generateNoise() {
      const imgData = ctx.createImageData(width, height);
      const buffer = new Uint32Array(imgData.data.buffer);
      const len = buffer.length;

      for (let i = 0; i < len; i++) {
        if (Math.random() < 0.06) {
          buffer[i] = 0xffffffff;
        }
      }
      ctx.putImageData(imgData, 0, 0);
    }

    window.addEventListener('resize', resize, { passive: true });
    resize();
  }

})();
