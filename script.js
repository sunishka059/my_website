/* =====================================================================
   BIRTHDAY SURPRISE — SCRIPT
   -----------------------------------------------------------------
   Sections:
   1. Utilities (screen switching, typewriter, photo fallback)
   2. Floating background hearts/stars
   3. Dodge / playful "No" buttons
   4. Stage flow (landing -> stage1 -> ... -> final reveal)
   5. Countdown + confetti for the big reveal
   6. Progress beads
   7. Music toggle
   8. Replay
   ===================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------------------------------------------------------------
     1. UTILITIES
  ------------------------------------------------------------------ */

  const screens = {
    loading:  document.getElementById('loading-screen'),
    landing:  document.getElementById('landing'),
    stage1:   document.getElementById('stage1'),
    trans1:   document.getElementById('stage1-transition'),
    stage2:   document.getElementById('stage2'),
    stage3:   document.getElementById('stage3'),
    stage4:   document.getElementById('stage4'),
    final:    document.getElementById('final-reveal'),
  };

  /** Show one screen, hide the rest. */
  function showScreen(key) {
    Object.values(screens).forEach(el => el.classList.remove('active'));
    screens[key].classList.add('active');
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  }

  /** Simple character-by-character typewriter for elements with .typewrite */
  function typewrite(el, speed = 38) {
    if (!el) return;
    const text = el.getAttribute('data-text') || el.textContent;
    el.textContent = '';
    el.classList.remove('done');
    let i = 0;
    const tick = () => {
      if (i <= text.length) {
        el.textContent = text.slice(0, i);
        i++;
        setTimeout(tick, speed);
      } else {
        el.classList.add('done');
      }
    };
    tick();
  }

  /** Run the typewriter effect on every .typewrite element inside a screen. */
  function typewriteScreen(screenEl) {
    screenEl.querySelectorAll('.typewrite').forEach(el => typewrite(el));
  }

  /** Swap any broken photo <img> for a friendly placeholder box. */
  function setupPhotoFallbacks() {
    document.querySelectorAll('.photo-frame img').forEach(img => {
      img.addEventListener('error', () => {
        const label = img.getAttribute('data-fallback-label') || 'PHOTO';
        const frame = img.closest('.photo-frame');
        frame.innerHTML = `
          <div class="photo-placeholder">
            <span class="ph-icon">🖼️</span>
            <span>${label}<br>put your image in <code>/images/</code></span>
          </div>`;
      }, { once: true });
    });
  }
  setupPhotoFallbacks();

  /* ---------------------------------------------------------------
     2. FLOATING BACKGROUND HEARTS / STARS
  ------------------------------------------------------------------ */

  const floatiesContainer = document.getElementById('floaties');
  const floatieEmojis = ['💗', '✨', '⭐', '💫', '💜'];

  function spawnFloatie() {
    const el = document.createElement('span');
    el.className = 'floatie';
    el.textContent = floatieEmojis[Math.floor(Math.random() * floatieEmojis.length)];
    const left = Math.random() * 100;
    const duration = 9 + Math.random() * 8;
    const drift = (Math.random() * 80 - 40) + 'px';
    const size = 14 + Math.random() * 16;
    el.style.left = left + 'vw';
    el.style.fontSize = size + 'px';
    el.style.setProperty('--drift', drift);
    el.style.animationDuration = duration + 's';
    floatiesContainer.appendChild(el);
    setTimeout(() => el.remove(), duration * 1000);
  }

  // Spawn a gentle steady stream of floaties for the whole session
  setInterval(spawnFloatie, 900);
  for (let i = 0; i < 6; i++) setTimeout(spawnFloatie, i * 300);

  /* ---------------------------------------------------------------
     3. DODGE / PLAYFUL "NO" BUTTONS
  ------------------------------------------------------------------ */

  const dodgePhrases = ["Nice try 😏", "Nope, try again 😌", "Still no 🙈", "C'mon... 👀", "Fine, YES it is 😌"];

  // Keep a reset() function per dodge button so Replay can restore them
  const dodgeControllers = new Map();

  function makeDodgy(btn) {
    let dodgeCount = 0;

    const escape = () => {
      const row = btn.closest('.btn-row');
      const rowRect = row.getBoundingClientRect();
      const btnRect = btn.getBoundingClientRect();
      const maxX = Math.max(rowRect.width - btnRect.width, 40);
      const maxY = Math.max(rowRect.height - btnRect.height, 10);
      const x = Math.random() * maxX - maxX / 2;
      const y = (Math.random() * maxY) - maxY / 2;
      btn.style.position = 'relative';
      btn.style.left = x + 'px';
      btn.style.top = y + 'px';

      dodgeCount++;
      const phrase = dodgePhrases[Math.min(dodgeCount - 1, dodgePhrases.length - 1)];
      btn.textContent = phrase;

      // After enough teasing, let it sit still so it's not frustrating
      if (dodgeCount >= dodgePhrases.length) {
        btn.removeEventListener('mouseenter', escape);
        btn.removeEventListener('touchstart', touchHandler);
      }
    };

    const touchHandler = (e) => {
      if (dodgeCount < dodgePhrases.length - 1) {
        e.preventDefault();
        escape();
      }
    };

    btn.addEventListener('mouseenter', escape);
    // Touch devices: first tap dodges instead of "clicking"
    btn.addEventListener('touchstart', touchHandler, { passive: false });

    dodgeControllers.set(btn.id, () => {
      dodgeCount = 0;
      btn.style.left = '';
      btn.style.top = '';
      btn.addEventListener('mouseenter', escape);
      btn.addEventListener('touchstart', touchHandler, { passive: false });
    });
  }

  document.querySelectorAll('.dodge').forEach(makeDodgy);

  /* ---------------------------------------------------------------
     4. STAGE FLOW
  ------------------------------------------------------------------ */

  // -- Loading screen -> landing --
  setTimeout(() => {
    showScreen('landing');
    typewriteScreen(screens.landing);
  }, 1600);

  // -- Landing -> Stage 1 --
  document.getElementById('start-btn').addEventListener('click', () => {
    showScreen('stage1');
    setActiveBead(1);
    typewriteScreen(screens.stage1);
  });

  // -- Stage 1 Yes -> transition -> Stage 2 --
  screens.stage1.querySelector('[data-choice="yes"]').addEventListener('click', () => {
    showScreen('trans1');
    typewriteScreen(screens.trans1);
    setTimeout(() => {
      showScreen('stage2');
      setActiveBead(2);
      typewriteScreen(screens.stage2);
    }, 1900);
  });

  // -- Stage 2 Yes -> reveal friendship card --
  screens.stage2.querySelector('[data-choice="yes"]').addEventListener('click', (e) => {
    document.getElementById('stage2-buttons').style.display = 'none';
    const reveal = document.getElementById('stage2-reveal');
    reveal.hidden = false;
  });

  document.getElementById('stage2-continue').addEventListener('click', () => {
    showScreen('stage3');
    setActiveBead(3);
    typewriteScreen(screens.stage3);
  });

  // -- Stage 3 Yes -> reveal memory 1 --
  screens.stage3.querySelector('[data-choice="yes"]').addEventListener('click', () => {
    document.getElementById('stage3-buttons').style.display = 'none';
    document.getElementById('memory-1').hidden = false;
  });

  document.getElementById('more-memory-btn').addEventListener('click', () => {
    document.getElementById('memory-1').hidden = true;
    document.getElementById('memory-2').hidden = false;
  });

  document.getElementById('stage3-continue').addEventListener('click', () => {
    showScreen('stage4');
    setActiveBead(4);
    typewriteScreen(screens.stage4);
  });

  // -- Stage 4 Yes -> countdown -> final reveal --
  screens.stage4.querySelector('[data-choice="yes"]').addEventListener('click', () => {
    runCountdown(() => {
      showScreen('final');
      setActiveBead(5);
      launchConfetti();
    });
  });

  /* ---------------------------------------------------------------
     5. COUNTDOWN + CONFETTI
  ------------------------------------------------------------------ */

  const overlay = document.getElementById('countdown-overlay');
  const numberEl = document.getElementById('countdown-number');

  function runCountdown(onDone) {
    overlay.classList.add('active');
    let n = 3;
    numberEl.textContent = n;
    numberEl.classList.remove('pop');
    void numberEl.offsetWidth; // restart animation
    numberEl.classList.add('pop');

    const step = () => {
      n--;
      if (n > 0) {
        numberEl.textContent = n;
        numberEl.classList.remove('pop');
        void numberEl.offsetWidth;
        numberEl.classList.add('pop');
        setTimeout(step, 800);
      } else {
        overlay.classList.remove('active');
        setTimeout(onDone, 250);
      }
    };
    setTimeout(step, 800);
  }

  // Lightweight canvas confetti — no external libraries
  const canvas = document.getElementById('confetti-canvas');
  const ctx = canvas.getContext('2d');
  let confettiPieces = [];
  let confettiRunning = false;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  const confettiColors = ['#a97bf0', '#f592c1', '#8bb6f7', '#f6c667', '#ffffff'];

  function launchConfetti(durationMs = 3400) {
    const count = 140;
    confettiPieces = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * canvas.height * 0.4,
      size: 6 + Math.random() * 6,
      color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
      speedY: 2 + Math.random() * 3,
      speedX: (Math.random() - 0.5) * 2,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 8,
      shape: Math.random() > 0.5 ? 'rect' : 'circle',
    }));

    if (!confettiRunning) {
      confettiRunning = true;
      animateConfetti();
    }
    setTimeout(() => { confettiRunning = false; }, durationMs);
  }

  function animateConfetti() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    confettiPieces.forEach(p => {
      p.y += p.speedY;
      p.x += p.speedX;
      p.rotation += p.rotationSpeed;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      if (p.shape === 'rect') {
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });

    // recycle pieces that fall off screen while confetti is "running"
    confettiPieces.forEach(p => {
      if (p.y > canvas.height + 20 && confettiRunning) {
        p.y = -20;
        p.x = Math.random() * canvas.width;
      }
    });

    if (confettiRunning || confettiPieces.some(p => p.y < canvas.height + 20)) {
      requestAnimationFrame(animateConfetti);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  /* ---------------------------------------------------------------
     6. PROGRESS BEADS
  ------------------------------------------------------------------ */

  const progressTrack = document.getElementById('progress-track');
  const beads = document.querySelectorAll('.bead');

  function setActiveBead(stageNumber) {
    progressTrack.classList.add('visible');
    beads.forEach(bead => {
      const n = Number(bead.getAttribute('data-bead'));
      bead.classList.toggle('done', n < stageNumber);
      bead.classList.toggle('current', n === stageNumber);
      if (n <= stageNumber) bead.classList.add('done');
    });
  }

  /* ---------------------------------------------------------------
     7. MUSIC TOGGLE
  ------------------------------------------------------------------ */

  const bgm = document.getElementById('bgm');
  const musicBtn = document.getElementById('music-toggle');
  const musicIcon = document.getElementById('music-icon');
  let musicPlaying = false;

  musicBtn.addEventListener('click', () => {
    if (!musicPlaying) {
      bgm.play().then(() => {
        musicPlaying = true;
        musicIcon.textContent = '🔊';
      }).catch(() => {
        // No audio file added yet, or browser blocked autoplay — fail quietly
        musicIcon.textContent = '🔇';
      });
    } else {
      bgm.pause();
      musicPlaying = false;
      musicIcon.textContent = '🔈';
    }
  });

  /* ---------------------------------------------------------------
     8. REPLAY
  ------------------------------------------------------------------ */

  document.getElementById('replay-btn').addEventListener('click', () => {
    // Reset all the per-stage reveal states
    document.getElementById('stage2-buttons').style.display = '';
    document.getElementById('stage2-reveal').hidden = true;
    document.getElementById('stage3-buttons').style.display = '';
    document.getElementById('memory-1').hidden = true;
    document.getElementById('memory-2').hidden = true;

    // Reset dodge buttons back to their original text/position
    resetDodgeButtons();

    progressTrack.classList.remove('visible');
    beads.forEach(b => b.classList.remove('done', 'current'));

    showScreen('landing');
    typewriteScreen(screens.landing);
  });

  function resetDodgeButtons() {
    const originalText = {
      'stage1-no': 'No 😐',
      'stage2-no': 'Absolutely not 🙄',
      'stage3-no': 'My memory has left the chat 💀',
      'stage4-no': "I'm scared 😭",
    };
    Object.entries(originalText).forEach(([id, text]) => {
      const btn = document.getElementById(id);
      if (btn) btn.textContent = text;
      const reset = dodgeControllers.get(id);
      if (reset) reset();
    });
  }

});