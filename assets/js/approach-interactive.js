/**
 * Approach Showcase Interactive Controller
 * 
 * Provides smooth open/close interactions and animations for the 8 analytical
 * showcases in the "My Approach" overlay:
 * - Smooth stagger reveal with GSAP timeline
 * - Smooth Lenis scroll alignment
 * - Accessible close triggers (Close button, background click, Esc key)
 * - Permanently locked curated positions specified by user
 */

(function initApproachInteractive() {
  'use strict';

  function setup() {
    const homeOverlay = document.querySelector('.approach-overlay');
    const homeOverlayImages = Array.from(document.querySelectorAll('.approach-overlay_grid-item'));
    const homeOverlayTrigger = document.querySelector('.btn-approach');
    const homeSection = document.querySelector('.section_home-approach');
    const closeBtn = document.getElementById('btnCloseApproachOverlay');

    if (!homeOverlay || !homeOverlayTrigger) return;

    let overlayOpen = false;

    // Initial state: hidden
    if (window.gsap) {
      gsap.set(homeOverlay, { autoAlpha: 0, display: 'none' });
      gsap.set(homeOverlayImages, { opacity: 0 });
    } else {
      homeOverlay.style.display = 'none';
      homeOverlay.style.opacity = '0';
    }

    // Set default locked layout
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
          duration: 0.35,
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

    // Clicking the backdrop closes overlay (ignoring clicks on cards)
    homeOverlay.addEventListener('click', (e) => {
      const isCard = e.target.closest('.approach-overlay_grid-item');
      if (!isCard) {
        closeOverlay();
      }
    });

    // Esc key closes overlay
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlayOpen) {
        closeOverlay();
      }
    });

    window.ApproachShowcase = {
      open: openOverlay,
      close: closeOverlay,
      isOpen: () => overlayOpen
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup);
  } else {
    setup();
  }
})();
