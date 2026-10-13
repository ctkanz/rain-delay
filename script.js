document.addEventListener('DOMContentLoaded', () => {
  const video = document.querySelector('.video-bg');
  const bookCover = document.getElementById('bookCover');
  const sidebarBuy = document.querySelector('.sidebar-buy-container');

  if (video) {
    // Forcer le muted programmatiquement (requis par les navigateurs pour l'autoplay)
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;

    // Tentative de lecture immédiate
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // En cas de blocage strict par le navigateur, relancer au premier clic
        window.addEventListener('click', () => {
          video.play();
        }, { once: true });
      });
    }

    // Déclenchement à la fin du 1er passage tout en continuant la boucle
    let triggered = false;

    video.addEventListener('timeupdate', () => {
      // Dès qu'on approche de la fin du premier cycle (0.3s avant la fin)
      if (!triggered && video.duration && (video.currentTime >= video.duration - 0.35)) {
        triggered = true;

        // 1. Apparition de la couverture du livre
        if (bookCover) {
          bookCover.classList.add('show');
        }

        // 2. Apparition du bouton d'achat Amazon après la couverture
        if (sidebarBuy) {
          setTimeout(() => {
            sidebarBuy.classList.add('show');
          }, 600);
        }

        // 3. Apparition de l'indicateur de défilement vers le synopsis
        const scrollHint = document.querySelector('.scroll-hint-container');
        if (scrollHint) {
          setTimeout(() => {
            scrollHint.classList.add('show');
          }, 1200);
        }
      }
    });
  }

  // Clic sur l'indicateur de défilement pour descendre vers le synopsis
  const scrollHint = document.querySelector('.scroll-hint-container');
  if (scrollHint) {
    scrollHint.addEventListener('click', () => {
      const synopsisEl = document.getElementById('synopsis');
      if (synopsisEl) {
        synopsisEl.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // Gestion du widget Spotify (Ouverture / Fermeture & Clic Extérieur)
  const spotifyWidget = document.getElementById('spotifyWidget');
  const spotifyToggle = document.getElementById('spotifyToggle');
  const spotifyClose = document.getElementById('spotifyClose');

  if (spotifyToggle && spotifyWidget) {
    spotifyToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      spotifyWidget.classList.toggle('open');
    });
  }

  if (spotifyClose && spotifyWidget) {
    spotifyClose.addEventListener('click', (e) => {
      e.stopPropagation();
      spotifyWidget.classList.remove('open');
    });
  }

  // Fermeture automatique lors d'un clic en dehors du widget
  document.addEventListener('click', (e) => {
    if (spotifyWidget && spotifyWidget.classList.contains('open')) {
      if (!spotifyWidget.contains(e.target)) {
        spotifyWidget.classList.remove('open');
      }
    }
  });

  // =========================================
  // Gestion du Formulaire de Contact
  // =========================================
  const contactForm = document.getElementById('contactForm');
  const contactStatus = document.getElementById('contactFormStatus');
  const btnSubmitText = document.getElementById('btnSubmitText');
  const submitBtn = document.getElementById('contactSubmitBtn');

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('contact-name')?.value || '';
      const email = document.getElementById('contact-email')?.value || '';
      const subject = document.getElementById('contact-subject')?.value || 'Message from Rain Delay Reader';
      const message = document.getElementById('contact-message')?.value || '';

      if (submitBtn) submitBtn.disabled = true;
      if (btnSubmitText) btnSubmitText.textContent = 'Sending...';

      if (contactStatus) {
        contactStatus.style.display = 'block';
        contactStatus.style.background = 'rgba(168, 85, 247, 0.15)';
        contactStatus.style.border = '1px solid rgba(192, 132, 252, 0.35)';
        contactStatus.style.color = '#e9d5ff';
        contactStatus.textContent = 'Sending your message...';
      }

      // Si déployé sur Netlify, envoi direct via Netlify Forms
      const formData = new FormData(contactForm);
      try {
        const response = await fetch('/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams(formData).toString()
        });

        if (response.ok) {
          contactStatus.style.background = 'rgba(74, 222, 128, 0.15)';
          contactStatus.style.border = '1px solid rgba(74, 222, 128, 0.4)';
          contactStatus.style.color = '#86efac';
          contactStatus.textContent = 'Thank you! Your message has been sent successfully.';
          contactForm.reset();
        } else {
          throw new Error('Netlify Form fallback');
        }
      } catch (err) {
        // En local ou si Netlify n'est pas actif : repli sur mailto propre
        const mailtoUrl = `mailto:sarahwitherspoonauthor@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`Hi Sarah,\n\nFrom: ${name} (${email})\n\nMessage:\n${message}`)}`;
        contactStatus.textContent = 'Opening your email client to send your message...';
        window.location.href = mailtoUrl;
        contactForm.reset();
      } finally {
        if (submitBtn) submitBtn.disabled = false;
        if (btnSubmitText) btnSubmitText.textContent = 'Submit Message';
      }
    });
  }

  // =========================================
  // Carrousel des Personnages (Auto-play)
  // =========================================
  initCharactersCarousel();

  // =========================================
  // Effet Pluie Réaliste (Cinematic Rain Overlay)
  // =========================================
  initRainEffect();
});

function initCharactersCarousel() {
  const container = document.querySelector('.characters-carousel-container');
  const slides = document.querySelectorAll('.carousel-slide');
  const dots = document.querySelectorAll('.carousel-dot');
  const prevBtn = document.getElementById('carouselPrevBtn');
  const nextBtn = document.getElementById('carouselNextBtn');

  if (!slides.length) return;

  let currentIndex = 0;
  let autoPlayTimer = null;
  const autoPlayInterval = 3800; // Défilement toutes les 3.8s

  function showSlide(index) {
    if (index >= slides.length) {
      currentIndex = 0;
    } else if (index < 0) {
      currentIndex = slides.length - 1;
    } else {
      currentIndex = index;
    }

    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === currentIndex);
    });

    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentIndex);
    });
  }

  function nextSlide() {
    showSlide(currentIndex + 1);
  }

  function prevSlide() {
    showSlide(currentIndex - 1);
  }

  function startAutoPlay() {
    stopAutoPlay();
    autoPlayTimer = setInterval(nextSlide, autoPlayInterval);
  }

  function stopAutoPlay() {
    if (autoPlayTimer) {
      clearInterval(autoPlayTimer);
      autoPlayTimer = null;
    }
  }

  // Contrôles boutons
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      nextSlide();
      startAutoPlay();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      prevSlide();
      startAutoPlay();
    });
  }

  // Indicateurs points
  dots.forEach((dot) => {
    dot.addEventListener('click', (e) => {
      const targetIndex = parseInt(e.currentTarget.getAttribute('data-index'), 10);
      if (!isNaN(targetIndex)) {
        showSlide(targetIndex);
        startAutoPlay();
      }
    });
  });

  // Pause au survol (souris / tactile)
  if (container) {
    container.addEventListener('mouseenter', stopAutoPlay);
    container.addEventListener('mouseleave', startAutoPlay);
    container.addEventListener('touchstart', stopAutoPlay, { passive: true });
    container.addEventListener('touchend', startAutoPlay, { passive: true });
  }

  // Démarrer
  startAutoPlay();
}

function initRainEffect() {
  const canvas = document.getElementById('rainCanvas');
  if (!canvas) return;

  const heroVideo = document.querySelector('.video-bg');
  let rainTriggered = false;

  function triggerRain() {
    if (rainTriggered) return;
    rainTriggered = true;
    canvas.classList.add('show');
  }

  if (heroVideo) {
    // La pluie commence son apparition STRICTEMENT à 0.5 seconde de lecture de la vidéo
    heroVideo.addEventListener('timeupdate', () => {
      if (heroVideo.currentTime >= 0.5) {
        triggerRain();
      }
    });
  } else {
    setTimeout(triggerRain, 500);
  }

  const ctx = canvas.getContext('2d');
  let width = 0;
  let height = 0;
  let dpr = 1;
  let animationFrameId = null;
  let drops = [];
  let splashes = [];

  const slant = 2.2; // Inclinaison naturelle du vent

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.scale(dpr, dpr);

    const dropCount = Math.floor(Math.min(width * 0.16, 220));
    createDrops(dropCount);
  }

  function createDrops(count) {
    drops = [];
    for (let i = 0; i < count; i++) {
      drops.push(createDrop(true));
    }
  }

  function createDrop(randomY = false) {
    const layerRand = Math.random();
    let layer = 0;
    if (layerRand > 0.65) layer = 1;
    if (layerRand > 0.90) layer = 2;

    let speed, length, thickness, alpha;
    if (layer === 0) {
      speed = 14 + Math.random() * 6;
      length = 14 + Math.random() * 10;
      thickness = 0.8;
      alpha = 0.18 + Math.random() * 0.12;
    } else if (layer === 1) {
      speed = 22 + Math.random() * 8;
      length = 24 + Math.random() * 14;
      thickness = 1.2;
      alpha = 0.32 + Math.random() * 0.14;
    } else {
      speed = 32 + Math.random() * 10;
      length = 38 + Math.random() * 18;
      thickness = 1.6;
      alpha = 0.45 + Math.random() * 0.2;
    }

    return {
      x: Math.random() * (width + 200) - 100,
      y: randomY ? Math.random() * height : -length - Math.random() * 40,
      speed,
      length,
      thickness,
      alpha,
      layer
    };
  }

  function createSplash(x, y) {
    const count = 2 + Math.floor(Math.random() * 2);
    for (let i = 0; i < count; i++) {
      splashes.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 3,
        vy: -Math.random() * 3.5 - 1.5,
        radius: 0.7 + Math.random() * 0.8,
        alpha: 0.45,
        decay: 0.035 + Math.random() * 0.02
      });
    }
  }

  function render() {
    ctx.clearRect(0, 0, width, height);

    // 1. Tracé et mouvement des gouttes
    ctx.lineCap = 'round';
    for (let i = 0; i < drops.length; i++) {
      const d = drops[i];

      ctx.beginPath();
      ctx.moveTo(d.x, d.y);
      ctx.lineTo(d.x + slant, d.y + d.length);
      ctx.strokeStyle = `rgba(220, 232, 255, ${d.alpha})`;
      ctx.lineWidth = d.thickness;
      ctx.stroke();

      d.x += slant;
      d.y += d.speed;

      if (d.y >= height) {
        if (d.layer > 0 && Math.random() < 0.25) {
          createSplash(d.x, height - 2);
        }
        drops[i] = createDrop(false);
      }
    }

    // 2. Éclaboussures au sol
    for (let i = splashes.length - 1; i >= 0; i--) {
      const s = splashes[i];
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(225, 235, 255, ${s.alpha})`;
      ctx.fill();

      s.x += s.vx;
      s.y += s.vy;
      s.vy += 0.25;
      s.alpha -= s.decay;

      if (s.alpha <= 0) {
        splashes.splice(i, 1);
      }
    }

    animationFrameId = requestAnimationFrame(render);
  }

  // Fondu et arrêt de la pluie à l'approche de la section About (seulement si la pluie a déjà démarré)
  const authorSection = document.getElementById('author');
  function checkRainVisibility() {
    if (!rainTriggered) return;
    if (!authorSection) return;
    const rect = authorSection.getBoundingClientRect();
    // Dès que le haut de la section About approche le bas de l'écran
    if (rect.top <= window.innerHeight) {
      const progress = Math.max(0, Math.min(1, rect.top / window.innerHeight));
      canvas.style.opacity = (0.9 * progress).toString();
      if (progress <= 0.05) {
        canvas.style.display = 'none';
      } else {
        canvas.style.display = 'block';
      }
    } else {
      canvas.style.display = 'block';
      canvas.style.opacity = '0.9';
    }
  }

  window.addEventListener('scroll', checkRainVisibility, { passive: true });

  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      resize();
      checkRainVisibility();
    }, 100);
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
    } else {
      if (!animationFrameId) {
        animationFrameId = requestAnimationFrame(render);
      }
    }
  });

  resize();
  animationFrameId = requestAnimationFrame(render);
}

// =========================================
// Moteur Hybride Intelligent :
// - Android / Chrome / Edge : Vidéo native WebM transparente (accélération GPU pure)
// - Safari / iOS (iPhone, Mac) : Canvas Chroma Key temps réel (transparence sans bug Apple)
// =========================================
document.addEventListener('DOMContentLoaded', () => {
  // Détection Safari / iOS
  const isSafariOrIOS = /^((?!chrome|android).)*safari/i.test(navigator.userAgent) || 
                        /iPad|iPhone|iPod/.test(navigator.userAgent) ||
                        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  if (!isSafariOrIOS) {
    // ==========================================
    // 1. MODE ANDROID / CHROME : VIDÉO NATIVE WEBM
    // ==========================================
    // On cache les canvas Safari et on affiche les vidéos natives WebM
    document.querySelectorAll('.floral-safari-canvas').forEach(c => c.style.display = 'none');
    
    function setupNativeVideo(videoEl) {
      if (!videoEl) return;
      videoEl.style.display = 'block';

      let hasPlayed = false;
      function playOnce() {
        if (hasPlayed) return;
        hasPlayed = true;
        videoEl.currentTime = 0;
        const playPromise = videoEl.play();
        if (playPromise !== undefined) {
          playPromise.catch(err => console.warn('Native video play error:', err));
        }
      }

      // Si l'écran est déjà dessus au rechargement
      function checkVisible() {
        const rect = videoEl.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          playOnce();
        }
      }

      if (videoEl.readyState >= 2) {
        checkVisible();
      } else {
        videoEl.addEventListener('loadeddata', checkVisible, { once: true });
        videoEl.addEventListener('canplay', checkVisible, { once: true });
      }

      // Déclencheur au défilement
      if ('IntersectionObserver' in window) {
        const obs = new IntersectionObserver((entries) => {
          entries.forEach(e => {
            if (e.isIntersecting) {
              playOnce();
              obs.disconnect();
            }
          });
        }, { threshold: 0.05 });
        obs.observe(videoEl);
      }
    }

    setupNativeVideo(document.getElementById('floralBridgeVideoNative'));
    setupNativeVideo(document.getElementById('floralBottomVideoNative'));

  } else {
    // ==========================================
    // 2. MODE APPLE / SAFARI : CANVAS CHROMA KEY
    // ==========================================
    document.body.classList.add('is-safari');
    document.querySelectorAll('.floral-native-video').forEach(v => v.style.display = 'none');

    function setupChromaPlayer(videoEl, canvasEl) {
      if (!videoEl || !canvasEl) return;
      const ctx = canvasEl.getContext('2d', { willReadFrequently: true });
      const offCanvas = document.createElement('canvas');
      const offCtx = offCanvas.getContext('2d', { willReadFrequently: true });
      offCanvas.width = 960;
      offCanvas.height = 310;

      let hasStarted = false;
      let animId = null;

      function processFrame() {
        if (videoEl.paused || videoEl.ended) {
          if (videoEl.ended && animId) {
            cancelAnimationFrame(animId);
          }
          return;
        }

        const vw = videoEl.videoWidth || 1920;
        const vh = videoEl.videoHeight || 1080;
        // Découpe élargie vers le haut (18% au lieu de 24%) pour ne couper aucun pétale
        const cropY = Math.floor(vh * 0.18);
        const cropH = Math.floor(vh * 0.62);

        offCtx.drawImage(videoEl, 0, cropY, vw, cropH, 0, 0, 960, 310);
        const imgData = offCtx.getImageData(0, 0, 960, 310);
        const data = imgData.data;
        const len = data.length;

        for (let i = 0; i < len; i += 4) {
          const r = data[i], g = data[i + 1], b = data[i + 2];
          if (g > 85 && g > r * 1.35 && g > b * 1.35) {
            data[i + 3] = 0;
          } else if (g > 65 && g > r * 1.15 && g > b * 1.15) {
            const factor = Math.max(0, Math.min(1, (g - Math.max(r, b)) / 50));
            data[i + 3] = Math.floor(data[i + 3] * (1 - factor));
          }
        }

        ctx.putImageData(imgData, 0, 0);
        animId = requestAnimationFrame(processFrame);
      }

      function renderFirstFrame() {
        videoEl.currentTime = 0.01;
        videoEl.addEventListener('seeked', () => {
          const vw = videoEl.videoWidth || 1920;
          const vh = videoEl.videoHeight || 1080;
          const cropY = Math.floor(vh * 0.18);
          const cropH = Math.floor(vh * 0.62);
          offCtx.drawImage(videoEl, 0, cropY, vw, cropH, 0, 0, 960, 310);
          const imgData = offCtx.getImageData(0, 0, 960, 310);
          const data = imgData.data;
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i], g = data[i + 1], b = data[i + 2];
            if (g > 85 && g > r * 1.35 && g > b * 1.35) {
              data[i + 3] = 0;
            } else if (g > 65 && g > r * 1.15 && g > b * 1.15) {
              const factor = Math.max(0, Math.min(1, (g - Math.max(r, b)) / 50));
              data[i + 3] = Math.floor(data[i + 3] * (1 - factor));
            }
          }
          ctx.putImageData(imgData, 0, 0);
        }, { once: true });
      }

      if (videoEl.readyState >= 2) {
        renderFirstFrame();
      } else {
        videoEl.addEventListener('loadeddata', renderFirstFrame, { once: true });
      }

      function startPlayback() {
        if (hasStarted) return;
        hasStarted = true;
        videoEl.currentTime = 0;
        const playPromise = videoEl.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {
            if (!animId) animId = requestAnimationFrame(processFrame);
          }).catch(err => {
            console.warn('Playback error:', err);
          });
        }
      }

      function checkVisibilityOnLoad() {
        const rect = canvasEl.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          startPlayback();
        }
      }

      if (videoEl.readyState >= 2) {
        checkVisibilityOnLoad();
      } else {
        videoEl.addEventListener('loadeddata', checkVisibilityOnLoad, { once: true });
        videoEl.addEventListener('canplay', checkVisibilityOnLoad, { once: true });
      }

      if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              startPlayback();
              observer.disconnect();
            }
          });
        }, { root: null, rootMargin: '0px', threshold: 0.05 });
        observer.observe(canvasEl);
      }
    }

    setupChromaPlayer(
      document.getElementById('floralMasterVideo'),
      document.querySelector('.floral-bridge-canvas')
    );

    setupChromaPlayer(
      document.getElementById('floralBottomMasterVideo'),
      document.querySelector('.floral-bottom-canvas')
    );
  }
});
