/**
 * Approach Interactive Layout & Drag Controller
 * 
 * Provides interactive control over the 8 analytical showcases in the "My Approach" overlay:
 * - 4 Curated Layout Presets: Mosaic, Diagonal, Bento, Orbit
 * - Dynamic Shuffle: Fluidly reassigns image positions with GSAP Flip
 * - Freeform Drag & Reposition: Grab and drag ANY card to place it anywhere on screen
 * - Reset & Close Controls: Quick restore to organized grid
 */

(function initApproachInteractive() {
  'use strict';

  function setup() {
    const homeOverlay = document.querySelector('.approach-overlay');
    const homeOverlayImages = Array.from(document.querySelectorAll('.approach-overlay_grid-item'));
    const homeOverlayTrigger = document.querySelector('.btn-approach');
    const homeSection = document.querySelector('.section_home-approach');
    const closeBtn = document.getElementById('btnCloseApproachDock');
    const layoutBtns = Array.from(document.querySelectorAll('.approach-layout-btn'));
    const shuffleBtn = document.getElementById('btnShuffleApproach');
    const resetBtn = document.getElementById('btnResetApproach');

    if (!homeOverlay || !homeOverlayTrigger) return;

    let overlayOpen = false;
    let currentLayout = '1';

    // Store custom drag offsets per item
    const customPositions = new Map();
    homeOverlayImages.forEach((item, index) => {
      customPositions.set(item, { x: 0, y: 0 });
    });

    // Initial state: hidden
    if (window.gsap) {
      gsap.set(homeOverlay, { autoAlpha: 0, display: 'none' });
      gsap.set(homeOverlayImages, { opacity: 0 });
    } else {
      homeOverlay.style.display = 'none';
      homeOverlay.style.opacity = '0';
    }

    // Set default layout
    homeOverlay.setAttribute('data-overlay-layout', '1');

    /**
     * Open Overlay with Smooth Stagger
     */
    function openOverlay() {
      if (overlayOpen) return;
      overlayOpen = true;

      // Scroll smoothly to center of approach section
      if (homeSection && window.gsap) {
        const rect = homeSection.getBoundingClientRect();
        const elCenterY = window.scrollY + rect.top + rect.height / 2;
        const scrollToY = elCenterY - (window.innerHeight / 2);
        gsap.to(window, {
          scrollTo: scrollToY,
          duration: 0.8,
          ease: 'power2.out'
        });
      }

      if (window.lenis && typeof window.lenis.stop === 'function') {
        window.lenis.stop();
      }

      homeOverlayTrigger.innerText = 'Close';
      homeOverlayTrigger.classList.add('active');

      if (window.gsap) {
        const tl = gsap.timeline();
        tl.set(homeOverlay, { display: 'flex' })
          .to(homeOverlay, {
            duration: 0.45,
            autoAlpha: 1,
            ease: 'power2.out'
          })
          .to(homeOverlayImages, {
            opacity: 1,
            duration: 0.4,
            stagger: 0.05,
            ease: 'power2.out'
          });
      } else {
        homeOverlay.style.display = 'flex';
        homeOverlay.style.opacity = '1';
        homeOverlayImages.forEach(img => img.style.opacity = '1');
      }
    }

    /**
     * Close Overlay
     */
    function closeOverlay() {
      if (!overlayOpen) return;
      overlayOpen = false;

      if (window.gsap) {
        gsap.to(homeOverlay, {
          autoAlpha: 0,
          duration: 0.4,
          ease: 'power2.out',
          onComplete: () => {
            gsap.set(homeOverlay, { display: 'none' });
            gsap.set(homeOverlayImages, { opacity: 0 });
          }
        });
      } else {
        homeOverlay.style.display = 'none';
        homeOverlay.style.opacity = '0';
      }

      homeOverlayTrigger.innerText = 'Show me';
      homeOverlayTrigger.classList.remove('active');

      if (window.lenis && typeof window.lenis.start === 'function') {
        window.lenis.start();
      }
    }

    homeOverlayTrigger.addEventListener('click', (e) => {
      e.preventDefault();
      overlayOpen ? closeOverlay() : openOverlay();
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeOverlay();
      });
    }

    // Clicking the background closes overlay (ignoring clicks on cards or controls)
    homeOverlay.addEventListener('click', (e) => {
      const isCard = e.target.closest('.approach-overlay_grid-item');
      const isControls = e.target.closest('.approach-controls_dock');
      if (!isCard && !isControls) {
        closeOverlay();
      }
    });

    /**
     * Switch Layout with GSAP Flip
     */
    function switchLayout(layoutNum) {
      currentLayout = String(layoutNum);

      // Reset manual drag transforms so grid positions align cleanly
      homeOverlayImages.forEach(item => {
        const pos = customPositions.get(item);
        if (pos) { pos.x = 0; pos.y = 0; }
        if (window.gsap) {
          gsap.to(item, { x: 0, y: 0, duration: 0.35, ease: 'power2.out' });
        } else {
          item.style.transform = '';
        }
      });

      // Update button active state
      layoutBtns.forEach(btn => {
        if (btn.getAttribute('data-layout') === currentLayout) {
          btn.classList.add('is-active');
        } else {
          btn.classList.remove('is-active');
        }
      });

      if (window.gsap && window.Flip) {
        const state = Flip.getState(homeOverlayImages);
        homeOverlay.setAttribute('data-overlay-layout', currentLayout);
        Flip.from(state, {
          duration: 0.65,
          ease: 'power3.inOut',
          stagger: 0.03
        });
      } else {
        homeOverlay.setAttribute('data-overlay-layout', currentLayout);
      }
    }

    layoutBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const layoutNum = btn.getAttribute('data-layout');
        if (layoutNum) switchLayout(layoutNum);
      });
    });

    /**
     * Shuffle / Randomize Positions
     * Shuffles the assignment of media slots among the cards with fluid motion
     */
    if (shuffleBtn) {
      shuffleBtn.addEventListener('click', (e) => {
        e.stopPropagation();

        // Reset manual drag transforms
        homeOverlayImages.forEach(item => {
          const pos = customPositions.get(item);
          if (pos) { pos.x = 0; pos.y = 0; }
          item.style.transform = '';
        });

        // Toggle or randomize layout and shuffle slot media indexes
        const nextLayout = currentLayout === '1' ? '2' : (currentLayout === '2' ? '3' : (currentLayout === '3' ? '4' : '1'));
        
        if (window.gsap && window.Flip) {
          const state = Flip.getState(homeOverlayImages);

          // Randomize slots: shuffle numbers 1..8 among the 8 elements
          const slots = [1, 2, 3, 4, 5, 6, 7, 8].sort(() => Math.random() - 0.5);
          homeOverlayImages.forEach((img, i) => {
            img.setAttribute('data-overlay-media', slots[i]);
          });

          homeOverlay.setAttribute('data-overlay-layout', nextLayout);
          currentLayout = nextLayout;

          layoutBtns.forEach(btn => {
            if (btn.getAttribute('data-layout') === currentLayout) {
              btn.classList.add('is-active');
            } else {
              btn.classList.remove('is-active');
            }
          });

          Flip.from(state, {
            duration: 0.7,
            ease: 'power3.inOut',
            stagger: 0.04
          });
        }
      });
    }

    /**
     * Reset Positions to Default Grid
     */
    if (resetBtn) {
      resetBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        // Restore default 1..8 slot mapping
        homeOverlayImages.forEach((img, i) => {
          img.setAttribute('data-overlay-media', i + 1);
          const pos = customPositions.get(img);
          if (pos) { pos.x = 0; pos.y = 0; }
        });

        if (window.gsap) {
          gsap.to(homeOverlayImages, {
            x: 0,
            y: 0,
            scale: 1,
            duration: 0.5,
            ease: 'back.out(1.5)',
            stagger: 0.03
          });
        } else {
          homeOverlayImages.forEach(img => img.style.transform = '');
        }

        switchLayout('1');
      });
    }

    /**
     * Interactive Drag-to-Position for Each Showcase Card
     * Users can click & drag (or touch & drag) ANY card to freely reposition it
     */
    homeOverlayImages.forEach(card => {
      let isDragging = false;
      let startX = 0;
      let startY = 0;
      let initialCardX = 0;
      let initialCardY = 0;

      card.addEventListener('pointerdown', (e) => {
        // Only primary mouse button or touch
        if (e.button !== undefined && e.button !== 0) return;
        
        isDragging = true;
        card.setPointerCapture(e.pointerId);

        startX = e.clientX;
        startY = e.clientY;

        const currentPos = customPositions.get(card) || { x: 0, y: 0 };
        initialCardX = currentPos.x;
        initialCardY = currentPos.y;

        card.classList.add('is-dragging');
        card.style.zIndex = '100';

        if (window.gsap) {
          gsap.to(card, { scale: 1.04, duration: 0.2, ease: 'power2.out' });
        }
      });

      card.addEventListener('pointermove', (e) => {
        if (!isDragging) return;

        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;

        const newX = initialCardX + deltaX;
        const newY = initialCardY + deltaY;

        const pos = customPositions.get(card);
        if (pos) {
          pos.x = newX;
          pos.y = newY;
        }

        card.style.transform = `translate3d(${newX}px, ${newY}px, 0) scale(1.04)`;
      });

      function endDrag(e) {
        if (!isDragging) return;
        isDragging = false;
        try {
          card.releasePointerCapture(e.pointerId);
        } catch (err) {}

        card.classList.remove('is-dragging');
        card.style.zIndex = '';

        const pos = customPositions.get(card) || { x: 0, y: 0 };
        if (window.gsap) {
          gsap.to(card, {
            x: pos.x,
            y: pos.y,
            scale: 1,
            duration: 0.35,
            ease: 'power2.out'
          });
        } else {
          card.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
        }
      }

      card.addEventListener('pointerup', endDrag);
      card.addEventListener('pointercancel', endDrag);
    });

  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup);
  } else {
    setup();
  }
})();
