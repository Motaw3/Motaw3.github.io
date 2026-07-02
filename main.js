/**
 * SOC Analyst / Blue Team Defender Portfolio
 * Complete JavaScript - All interactions, animations, and effects
 */

(function() {
  'use strict';

  // ============================================================
  // PART 0: INITIALIZATION & UTILITIES
  // ============================================================

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => document.querySelectorAll(selector);

  let W = window.innerWidth;
  let H = window.innerHeight;
  let animationFrameId = null;
  let isPageVisible = true;

  // ============================================================
  // PART 1: LOADER — Terminal Boot Sequence
  // ============================================================

  function initLoader() {
    const loaderLines = $$('.loader-line');
    const loaderOverlay = $('.loader-overlay');

    if (!loaderOverlay || loaderLines.length === 0) return;

    const bootMessages = [
      '[BOOT] Initializing secure connection...',
      '[CRYPT] Establishing encrypted tunnel...',
      '[DECRYPT] Decrypting portfolio data...',
      '[READY] Welcome, Defender.'
    ];

    let lineIndex = 0;

    function typeLine(lineIndex) {
      if (lineIndex >= bootMessages.length) {
        // All lines typed, wait then fade out
        setTimeout(() => {
          loaderOverlay.classList.add('loaded');
          setTimeout(() => {
            loaderOverlay.style.display = 'none';
            startHeroAnimations();
          }, 500);
        }, 400);
        return;
      }

      const line = loaderLines[lineIndex];
      const message = bootMessages[lineIndex];
      let charIndex = 0;

      line.style.opacity = '1';

      function typeChar() {
        if (charIndex < message.length) {
          line.textContent = message.substring(0, charIndex + 1);
          charIndex++;
          setTimeout(typeChar, 30);
        } else {
          // Move to next line
          setTimeout(() => typeLine(lineIndex + 1), 700);
        }
      }

      typeChar();
    }

    // Start typing after a brief delay
    setTimeout(() => typeLine(0), 300);
  }

  // ============================================================
  // PART 2: THREE.JS PARTICLE BACKGROUND
  // ============================================================

  function initThreeJS() {
    const canvas = $('#bg-canvas');
    if (!canvas) return;

    // WebGL fallback check
    try {
      const testCanvas = document.createElement('canvas');
      const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
      if (!gl) {
        canvas.style.display = 'none';
        return;
      }
    } catch (e) {
      canvas.style.display = 'none';
      return;
    }

    try {
      // Scene setup
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, W / H, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true
      });
      renderer.setSize(W, H);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      // Particle system — 600 particles
      const particleCount = 600;
      const positions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);

      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 20;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 10;

        const isGreen = Math.random() > 0.7;
        colors[i * 3] = isGreen ? 0 : 0;
        colors[i * 3 + 1] = isGreen ? 1 : 0.96;
        colors[i * 3 + 2] = isGreen ? 0.53 : 1;
      }

      // Geometry
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      // Material
      const material = new THREE.PointsMaterial({
        size: 0.06,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });

      const particles = new THREE.Points(geometry, material);
      scene.add(particles);

      // Connection lines
      const lineThreshold = 2.5;
      const lineMaterial = new THREE.LineBasicMaterial({
        color: 0x00f5ff,
        transparent: true,
        opacity: 0.1,
        blending: THREE.AdditiveBlending,
      });

      function updateLines() {
        const pos = geometry.attributes.position.array;
        const linePositions = [];

        for (let i = 0; i < particleCount; i++) {
          for (let j = i + 1; j < particleCount; j++) {
            const dx = pos[i * 3] - pos[j * 3];
            const dy = pos[i * 3 + 1] - pos[j * 3 + 1];
            const dz = pos[i * 3 + 2] - pos[j * 3 + 2];
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

            if (dist < lineThreshold) {
              linePositions.push(
                pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2],
                pos[j * 3], pos[j * 3 + 1], pos[j * 3 + 2]
              );
            }
          }
        }

        const oldLines = scene.children.filter(c => c instanceof THREE.LineSegments);
        oldLines.forEach(l => scene.remove(l));

        if (linePositions.length > 0) {
          const lineGeo = new THREE.BufferGeometry();
          lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
          const lineSegments = new THREE.LineSegments(lineGeo, lineMaterial);
          scene.add(lineSegments);
        }
      }

      updateLines();
      camera.position.z = 5;

      // Mouse tracking
      let mouseX = 0;
      let mouseY = 0;

      document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / W - 0.5) * 2;
        mouseY = -(e.clientY / H - 0.5) * 2;
      });

      // Particle drift velocities
      const velocities = new Float32Array(particleCount * 3);
      for (let i = 0; i < particleCount * 3; i++) {
        velocities[i] = (Math.random() - 0.5) * 0.003;
      }

      let frameCount = 0;

      // Animation loop
      function animate() {
        if (!isPageVisible) {
          animationFrameId = requestAnimationFrame(animate);
          return;
        }

        animationFrameId = requestAnimationFrame(animate);
        frameCount++;

        const pos = geometry.attributes.position.array;

        for (let i = 0; i < particleCount; i++) {
          pos[i * 3] += velocities[i * 3];
          pos[i * 3 + 1] += velocities[i * 3 + 1];
          pos[i * 3 + 2] += velocities[i * 3 + 2];

          // Wrap around edges
          if (pos[i * 3] > 10) pos[i * 3] = -10;
          if (pos[i * 3] < -10) pos[i * 3] = 10;
          if (pos[i * 3 + 1] > 10) pos[i * 3 + 1] = -10;
          if (pos[i * 3 + 1] < -10) pos[i * 3 + 1] = 10;
        }

        geometry.attributes.position.needsUpdate = true;

        // Rotate toward mouse
        particles.rotation.y = mouseX * 0.3;
        particles.rotation.x = mouseY * 0.15;

        // Rebuild lines every 10 frames
        if (frameCount % 10 === 0 && Math.random() < 0.1) {
          updateLines();
        }

        renderer.render(scene, camera);
      }

      animate();

      // Resize handler
      window.addEventListener('resize', () => {
        W = window.innerWidth;
        H = window.innerHeight;
        camera.aspect = W / H;
        camera.updateProjectionMatrix();
        renderer.setSize(W, H);
      });

    } catch (e) {
      console.warn('Three.js initialization failed:', e);
      canvas.style.display = 'none';
    }
  }

  // ============================================================
  // PART 3: CUSTOM CURSOR
  // ============================================================

  function initCustomCursor() {
    const cursorDot = $('.cursor-dot');
    const cursorRing = $('.cursor-ring');

    if (!cursorDot || !cursorRing) return;

    let ringX = 0;
    let ringY = 0;
    let mouseX = 0;
    let mouseY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      cursorDot.style.left = mouseX + 'px';
      cursorDot.style.top = mouseY + 'px';
    });

    function animateRing() {
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;
      cursorRing.style.left = ringX + 'px';
      cursorRing.style.top = ringY + 'px';
      requestAnimationFrame(animateRing);
    }
    animateRing();

    // Hover effects
    const hoverElements = 'a, button, .card, .filter-tab, .tilt-card, .nav-links a';

    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(hoverElements)) {
        cursorRing.classList.add('hover');
        cursorDot.classList.add('hover');
      }
    });

    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(hoverElements)) {
        cursorRing.classList.remove('hover');
        cursorDot.classList.remove('hover');
      }
    });
  }

  // ============================================================
  // PART 4: TYPEWRITER EFFECT
  // ============================================================

  function initTypewriter() {
    const typewriterElements = $$('.typewriter');

    typewriterElements.forEach(element => {
      const phrases = [
        'SOC Analyst',
        'Blue Team Defender',
        'Threat Hunter',
        'Security Enthusiast'
      ];

      let phraseIndex = 0;
      let charIndex = 0;
      let isDeleting = false;
      let isPaused = false;

      function type() {
        const currentPhrase = phrases[phraseIndex];

        if (isPaused) {
          setTimeout(() => {
            isPaused = false;
            type();
          }, 2000);
          return;
        }

        if (isDeleting) {
          element.textContent = currentPhrase.substring(0, charIndex - 1);
          charIndex--;

          if (charIndex === 0) {
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
            setTimeout(type, 500);
          } else {
            setTimeout(type, 30);
          }
        } else {
          element.textContent = currentPhrase.substring(0, charIndex + 1);
          charIndex++;

          if (charIndex === currentPhrase.length) {
            isDeleting = true;
            isPaused = true;
          }
          setTimeout(type, 50);
        }
      }

      // Add blinking cursor
      element.style.borderRight = '2px solid var(--accent-cyan)';
      element.style.paddingRight = '5px';

      setTimeout(type, 3000);

      // Blinking cursor animation
      setInterval(() => {
        const cursorVisible = element.style.borderRightColor === 'var(--accent-cyan)';
        element.style.borderRightColor = cursorVisible ? 'transparent' : 'var(--accent-cyan)';
      }, 500);
    });
  }

  // ============================================================
  // PART 5: SCROLL REVEAL (Intersection Observer)
  // ============================================================

  function initScrollReveal() {
    const revealElements = $$('.reveal');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');

          // Trigger skill bar animations
          const skillFills = entry.target.querySelectorAll('.skill-fill');
          skillFills.forEach(fill => {
            const width = fill.getAttribute('data-width');
            if (width) {
              fill.style.width = width;
            }
          });
        }
      });
    }, {
      threshold: 0.15
    });

    revealElements.forEach(el => observer.observe(el));
  }

  // ============================================================
  // PART 6: 3D CARD TILT
  // ============================================================

  function initCardTilt() {
    const tiltCards = $$('.tilt-card');

    tiltCards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = (y - centerY) / centerY * 5;
        const rotateY = (centerX - x) / centerX * 5;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
      });
    });
  }

  // ============================================================
  // PART 7: SKILL BARS ANIMATION
  // ============================================================

  function initSkillBars() {
    const skillItems = $$('.skill-item');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const fill = entry.target.querySelector('.skill-fill');
          if (fill) {
            const width = fill.getAttribute('data-width');
            if (width) {
              setTimeout(() => {
                fill.style.width = width;
              }, 100);
            }
          }
        }
      });
    }, {
      threshold: 0.3
    });

    skillItems.forEach(item => observer.observe(item));
  }

  // ============================================================
  // PART 8: NAV — SCROLL COMPRESS
  // ============================================================

  function initNavScroll() {
    const nav = $('nav');

    if (!nav) return;

    function checkScroll() {
      if (window.scrollY > 50) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    }

    window.addEventListener('scroll', checkScroll);
    checkScroll();
  }

  // ============================================================
  // PART 9: MOBILE NAV TOGGLE
  // ============================================================

  function initMobileNav() {
    const hamburger = $('.hamburger');
    const nav = $('nav');

    if (!hamburger || !nav) return;

    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('nav-open');
      nav.classList.toggle('nav-open');

      if (nav.classList.contains('nav-open')) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    });

    // Close nav when clicking a link
    const navLinks = $$('.nav-links a');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('nav-open');
        nav.classList.remove('nav-open');
        document.body.style.overflow = '';
      });
    });
  }

  // ============================================================
  // PART 10: FILTER TABS (Blue Team)
  // ============================================================

  function initFilterTabs() {
    const filterTabs = $$('.filter-tab');
    const cards = $$('.card[data-category]');

    filterTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        // Update active tab
        filterTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const category = tab.getAttribute('data-filter');

        cards.forEach(card => {
          const cardCategory = card.getAttribute('data-category');

          if (category === 'all' || cardCategory === category) {
            card.style.display = '';
            setTimeout(() => {
              card.style.opacity = '1';
              card.style.transform = 'translateY(0)';
            }, 50);
          } else {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            setTimeout(() => {
              if (card.style.opacity === '0') {
                card.style.display = 'none';
              }
            }, 300);
          }
        });
      });
    });
  }

  // ============================================================
  // PART 11: KONAMI CODE EASTER EGG
  // ============================================================

  function initKonamiCode() {
    const konamiCode = [
      'ArrowUp', 'ArrowUp',
      'ArrowDown', 'ArrowDown',
      'ArrowLeft', 'ArrowRight',
      'ArrowLeft', 'ArrowRight',
      'b', 'a'
    ];

    let keyIndex = 0;

    document.addEventListener('keydown', (e) => {
      if (e.key === konamiCode[keyIndex]) {
        keyIndex++;

        if (keyIndex === konamiCode.length) {
          keyIndex = 0;
          triggerMatrixRain();
        }
      } else {
        keyIndex = 0;
      }
    });
  }

  function triggerMatrixRain() {
    const matrixCanvas = document.createElement('canvas');
    matrixCanvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:9997;pointer-events:none;';
    document.body.appendChild(matrixCanvas);

    const ctx = matrixCanvas.getContext('2d');
    matrixCanvas.width = window.innerWidth;
    matrixCanvas.height = window.innerHeight;

    const cols = Math.floor(matrixCanvas.width / 20);
    const drops = Array(cols).fill(1);
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*';

    function drawMatrix() {
      ctx.fillStyle = 'rgba(10, 14, 23, 0.05)';
      ctx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);

      ctx.fillStyle = '#00f5ff';
      ctx.font = '15px monospace';

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(char, i * 20, drops[i] * 20);

        if (drops[i] * 20 > matrixCanvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    }

    const interval = setInterval(drawMatrix, 50);

    setTimeout(() => {
      clearInterval(interval);
      matrixCanvas.remove();
    }, 5000);
  }

  // ============================================================
  // PART 12: FORM HANDLING (Contact)
  // ============================================================

  function initContactForm() {
    const form = $('#contact-form');

    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const submitBtn = form.querySelector('.submit-btn');
      const originalText = submitBtn.textContent;

      // Show loading state
      submitBtn.classList.add('btn-loading');
      submitBtn.textContent = 'Transmitting...';
      submitBtn.disabled = true;

      // Simulate sending
      setTimeout(() => {
        submitBtn.classList.remove('btn-loading');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;

        // Show success message
        const successMsg = document.createElement('div');
        successMsg.className = 'form-success';
        successMsg.textContent = 'Message transmitted successfully. Connection secured.';

        form.insertBefore(successMsg, form.lastElementChild);

        setTimeout(() => {
          successMsg.remove();
        }, 5000);

        form.reset();
      }, 2000);
    });
  }

  // ============================================================
  // PART 13: SMOOTH SCROLL
  // ============================================================

  function initSmoothScroll() {
    const links = $$('a[href^="#"]');

    links.forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href === '#') return;

        e.preventDefault();
        const target = $(href);

        if (target) {
          const navHeight = 80;
          const targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight;

          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      });
    });
  }

  // ============================================================
  // PART 14: SCROLL TRIGGERED SECTION ANIMATIONS (GSAP)
  // ============================================================

  function startHeroAnimations() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // Hero content fade in
    const heroContent = $('.hero-content');
    if (heroContent) {
      gsap.fromTo(heroContent,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1, ease: 'power2.out' }
      );
    }

    // Section titles slide in
    const sectionTitles = $$('.section-title');
    sectionTitles.forEach(title => {
      gsap.fromTo(title,
        { opacity: 0, x: -50 },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: title,
            start: 'top 80%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    });

    // Card grids stagger in
    const cardGrids = $$('.card-grid');
    cardGrids.forEach(grid => {
      const cards = grid.querySelectorAll('.card');
      gsap.fromTo(cards,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: grid,
            start: 'top 75%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    });

    // About section animations
    const aboutSection = $('.about');
    if (aboutSection) {
      const aboutLeft = aboutSection.querySelector('.about-left');
      const aboutRight = aboutSection.querySelector('.about-right');

      if (aboutLeft) {
        gsap.fromTo(aboutLeft,
          { opacity: 0, x: -80 },
          {
            opacity: 1,
            x: 0,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: aboutSection,
              start: 'top 70%',
              toggleActions: 'play none none reverse'
            }
          }
        );
      }

      if (aboutRight) {
        gsap.fromTo(aboutRight,
          { opacity: 0, x: 80 },
          {
            opacity: 1,
            x: 0,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: aboutSection,
              start: 'top 70%',
              toggleActions: 'play none none reverse'
            }
          }
        );
      }
    }

    // Stats counter animation
    const statNumbers = $$('.stat-number');
    statNumbers.forEach(stat => {
      const target = parseInt(stat.getAttribute('data-target'));
      let animated = false;

      ScrollTrigger.create({
        trigger: stat,
        start: 'top 85%',
        onEnter: () => {
          if (!animated) {
            animated = true;
            gsap.to({ val: 0 }, {
              val: target,
              duration: 2,
              ease: 'power1.out',
              onUpdate: function() {
                stat.textContent = Math.round(this.targets()[0].val);
              }
            });
          }
        },
        once: true
      });
    });
  }

  function initGSAPScrollTrigger() {
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
    }
  }

  // ============================================================
  // PART 15: GLITCH TEXT ON HOVER
  // ============================================================

  function initGlitchText() {
    const glitchElements = $$('.glitch-text');

    glitchElements.forEach(el => {
      el.addEventListener('mouseenter', () => {
        el.classList.add('glitching');
      });

      el.addEventListener('mouseleave', () => {
        el.classList.remove('glitching');
      });
    });
  }

  // ============================================================
  // PART 16: PARALLAX ON MOUSE MOVE (Hero floating shapes)
  // ============================================================

  function initParallax() {
    const floatingShapes = $$('.floating-shape');

    if (floatingShapes.length === 0) return;

    document.addEventListener('mousemove', (e) => {
      const centerX = W / 2;
      const centerY = H / 2;

      const moveX = (e.clientX - centerX) / centerX;
      const moveY = (e.clientY - centerY) / centerY;

      floatingShapes.forEach((shape, index) => {
        const multiplier = (index + 1) * 0.02;
        const x = moveX * 30 * multiplier;
        const y = moveY * 30 * multiplier;
        shape.style.transform = `translate(${x}px, ${y}px)`;
      });
    });
  }

  // ============================================================
  // PART 17: VISIBILITY-BASED ANIMATION PAUSE
  // ============================================================

  function initVisibilityHandler() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        isPageVisible = false;
      } else {
        isPageVisible = true;
      }
    });
  }

  // ============================================================
  // INITIALIZATION
  // ============================================================

  function init() {
    // Initialize all modules
    initGSAPScrollTrigger();
    initThreeJS();
    initCustomCursor();
    initTypewriter();
    initScrollReveal();
    initCardTilt();
    initSkillBars();
    initNavScroll();
    initMobileNav();
    initFilterTabs();
    initKonamiCode();
    initContactForm();
    initSmoothScroll();
    initGlitchText();
    initParallax();
    initVisibilityHandler();

    // Initialize loader last
    setTimeout(initLoader, 100);
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
