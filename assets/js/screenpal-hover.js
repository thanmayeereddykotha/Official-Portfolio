/**
 * ScreenPal Hover Playback Controller
 * - Mutes video so autoplay policies permit instant silent preview on hover
 * - Keeps a clean, pixel-perfect video poster visible at rest and on mouseleave
 * - Only reveals the video once videoPlayerPlaying confirms playback has begun
 * - On mouseleave: immediately restores poster, pauses, and rewinds to 0s
 * - Loops seamlessly while hovered
 */
(function initScreenPalHover() {
  function setup() {
    const spPlayers = document.querySelectorAll('.sp-embed-player');
    if (!spPlayers.length) return;

    spPlayers.forEach((playerWrap) => {
      const iframe = playerWrap.querySelector('iframe');
      if (!iframe) return;

      const wrapper = playerWrap.closest('.project-image_wrapper') || playerWrap.parentElement;
      const poster = wrapper ? wrapper.querySelector('.sp-video-poster') : null;

      const card = playerWrap.closest('.project-card') || 
                   playerWrap.closest('.splide__slide') || 
                   playerWrap.closest('a') || 
                   playerWrap.parentElement;
      if (!card) return;

      const order = card.querySelector('.work-order');
      let isHovered = false;
      let isReady = false;

      function sendCmd(type, extraData) {
        try {
          if (iframe.contentWindow) {
            const payload = Object.assign({ type: type }, extraData || {});
            iframe.contentWindow.postMessage(payload, '*');
          }
        } catch (e) {
          // Ignore cross-origin issues
        }
      }

      function showPoster() {
        if (poster) {
          poster.style.opacity = '1';
        }
      }

      function hidePoster() {
        if (poster && isHovered) {
          poster.style.opacity = '0';
        }
      }

      // Ensure player is muted from the start so hover playback is completely uninhibited
      sendCmd('muteVideo');

      function playVideo() {
        sendCmd('muteVideo');
        sendCmd('playVideo');
        if (order) order.classList.add('is-active');
      }

      function pauseAndRewind() {
        // Immediately cover the video with the clean poster
        showPoster();

        // Pause and rewind to the very first frame (0s)
        sendCmd('pauseVideo');
        sendCmd('setVideoTimestamp', { timestamp: 0 });

        // Backup seek command to guarantee reset after pause
        setTimeout(() => {
          sendCmd('setVideoTimestamp', { timestamp: 0 });
        }, 50);

        if (order) order.classList.remove('is-active');
      }

      // Listen for ScreenPal player state messages
      window.addEventListener('message', (event) => {
        if (!event.data || typeof event.data !== 'object') return;
        const type = event.data.type;
        
        if (type === 'videoPlayerReady' || type === 'showTabs') {
          isReady = true;
          sendCmd('muteVideo');
          if (isHovered) {
            playVideo();
          }
        } else if (type === 'videoPlayerPlaying') {
          // ScreenPal is actively rendering frames and has dismissed its play button/overlays
          if (isHovered) {
            hidePoster();
          } else {
            pauseAndRewind();
          }
        } else if (type === 'videoPlayerPause') {
          showPoster();
        } else if (type === 'videoPlayerEnded') {
          // Seamless loop while hovered
          if (isHovered) {
            sendCmd('setVideoTimestamp', { timestamp: 0 });
            playVideo();
          } else {
            pauseAndRewind();
          }
        }
      });

      // Desktop Hover Events
      card.addEventListener('mouseenter', () => {
        isHovered = true;
        playVideo();
      });

      card.addEventListener('mouseleave', () => {
        isHovered = false;
        pauseAndRewind();
      });

      // Work Slider Splide slide change support
      const slideObserver = new MutationObserver(() => {
        const isSlideActive = card.classList.contains('is-active');
        if (card.classList.contains('splide__slide')) {
          if (!isSlideActive) {
            pauseAndRewind();
          }
        }
      });
      slideObserver.observe(card, { attributes: true, attributeFilter: ['class'] });

      // Touch / mobile support
      if (window.matchMedia('(max-width: 991px)').matches) {
        card.addEventListener('touchstart', () => {
          isHovered = !isHovered;
          if (isHovered) {
            playVideo();
          } else {
            pauseAndRewind();
          }
        }, { passive: true });
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setup();
      initProject5Controller();
    });
  } else {
    setup();
    initProject5Controller();
  }

  /**
   * Project 5 (MeritPath) Initial Position & Hover Controller
   * - Initial/rest position: second 6 (where the website shows up, avoiding empty start)
   * - On hover: plays from second 1 (1.0s) to the end, looping back to second 1
   * - On leave: pauses and resets back to second 6, showing the preview poster
   */
  function initProject5Controller() {
    function bindVideo(video) {
      if (!video || video.__p5Bound) return;
      video.__p5Bound = true;

      const card = video.closest('.project-card, .splide__slide') || video.parentElement;
      const poster = card.querySelector('.project-video_poster, .work-card_video-poster');
      video.muted = true;
      video.preload = 'auto';
      video.loop = false; // Custom loop starting at 1.0s

      let isHovered = false;

      function setPreviewTime() {
        try {
          if (!isHovered && video.paused && (video.currentTime < 5.0 || isNaN(video.currentTime))) {
            video.currentTime = 6.0;
          }
        } catch (e) {}
      }

      if (video.readyState >= 1) {
        setPreviewTime();
      }
      video.addEventListener('loadedmetadata', setPreviewTime);
      video.addEventListener('loadeddata', setPreviewTime);
      video.addEventListener('canplay', setPreviewTime);

      // Mouseenter (capture phase): start playing from second 1 (1.0s) to the end
      card.addEventListener('mouseenter', (e) => {
        isHovered = true;
        try {
          video.currentTime = 1.0;
        } catch (e) {}
        const p = video.play();
        if (p !== undefined) {
          p.then(() => {
            if (poster) poster.style.opacity = '0';
          }).catch(() => {});
        }
        const order = card.querySelector('.work-order');
        if (order) order.classList.add('is-active');
      }, true);

      // Mouseleave (capture phase): pause, rewind to 6.0s (website view), and restore poster
      card.addEventListener('mouseleave', (e) => {
        isHovered = false;
        if (e && e.stopImmediatePropagation) {
          e.stopImmediatePropagation();
        }
        video.pause();
        try {
          video.currentTime = 6.0;
        } catch (e) {}
        if (poster) poster.style.opacity = '1';
        const order = card.querySelector('.work-order');
        if (order) order.classList.remove('is-active');

        setTimeout(() => {
          try {
            if (video.paused && (video.currentTime < 5.0 || isNaN(video.currentTime))) {
              video.currentTime = 6.0;
            }
          } catch (err) {}
        }, 50);
      }, true);

      // When the video reaches the end while active/hovered, loop seamlessly back to 1.0s
      video.addEventListener('ended', () => {
        if (isHovered || card.classList.contains('is-active')) {
          video.currentTime = 1.0;
          const p = video.play();
          if (p !== undefined) {
            p.catch(() => {});
          }
        }
      });

      // Splide carousel on /work
      if (card.classList.contains('splide__slide')) {
        const slideObserver = new MutationObserver(() => {
          const isActive = card.classList.contains('is-active');
          if (isActive) {
            try {
              video.currentTime = 1.0;
            } catch (e) {}
            const p = video.play();
            if (p !== undefined) {
              p.then(() => {
                if (poster) poster.style.opacity = '0';
              }).catch(() => {});
            }
          } else {
            video.pause();
            try {
              video.currentTime = 6.0;
            } catch (e) {}
            if (poster) poster.style.opacity = '1';
          }
        });
        slideObserver.observe(card, { attributes: true, attributeFilter: ['class'] });
      }
    }

    function scan() {
      document.querySelectorAll('video[src*="meritpath"]').forEach(bindVideo);
    }

    scan();
    // Splide generates clones asynchronously after mount
    setTimeout(scan, 300);
    setTimeout(scan, 1000);
  }
})();
