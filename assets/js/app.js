// FUJI JAPAN - Core Application Controller

function getStoredLang() {
  try {
    return localStorage.getItem('fuji_lang') || 'en';
  } catch (e) {
    return 'en';
  }
}

function setStoredLang(lang) {
  try {
    localStorage.setItem('fuji_lang', lang);
  } catch (e) {}
}

let currentLang = getStoredLang();

// Step descriptions for interactive mineral processing pipeline
const pipelineDetails = {
  feed: {
    title: { en: "Feed Preparation & Slurry Conditioning", ja: "給鉱準備・スラリー調整" },
    tech: { en: "High-density attrition scrubbers, trommel desliming, steady-head distribution boxes.", ja: "高濃度アトリッションスクラバー、トロンメル脱泥機、定圧分配槽。" },
    japanese_spec: { en: "Japanese high-durability wear-resistant polyurethane linings and precision flow meters.", ja: "日本製高耐久ウレタンライニング、精密電磁流量計、耐摩耗スラリーポンプ。" }
  },
  screening: {
    title: { en: "Screening & Particle-Size Classification", ja: "ふるい分け・粒度分級" },
    tech: { en: "Multi-deck high-frequency vibrating screens, hydraulic classifiers, hydrocyclone clusters.", ja: "多段高周波振動スクリーン、水力分級機、サイクロンクラスター。" },
    japanese_spec: { en: "Japanese ultra-precise mesh aperture fabrication and vibration exciter mechanisms.", ja: "日本の超精密メッシュ織込技術、高効率振動起振機ユニット。" }
  },
  gravity: {
    title: { en: "Gravity Separation & Concentration", ja: "比重選鉱・多段濃縮" },
    tech: { en: "Rougher, cleaner, and scavenger spiral concentrators, shaking tables for final dressing.", ja: "粗選・精選・掃流多条スパイラル選鉱機、仕上げ揺動テーブル。" },
    japanese_spec: { en: "Engineered trough pitch designs with exceptional metallurgical recovery of heavy minerals.", ja: "重鉱物回収率を極限まで高める精密トラフ勾配設計と水洗スプリッター制御。" }
  },
  magnetic: {
    title: { en: "Magnetic Separation (WHIMS & Induced Roll)", ja: "磁力選鉱（湿式・乾式高磁力分離）" },
    tech: { en: "Wet High-Intensity Magnetic Separators (WHIMS) up to 2.0 Tesla; dry induced roll separators (IRMS).", ja: "湿式高磁力選鉱機 (WHIMS / 最大2.0テスラ)、乾式誘導ロール磁選機 (IRMS)。" },
    japanese_spec: { en: "World-leading Japanese magnetic circuit engineering with permanent NdFeB and electromagnets.", ja: "ネオジム永久磁石と電磁石を最適ハイブリッド配置した世界水準の磁気回路技術。" }
  },
  product: {
    title: { en: "Final High-Purity Product Streams", ja: "高品位精鉱産出・製品化" },
    tech: { en: "Individual product dewatering, filtration, drying, and bulk bagging systems.", ja: "製品脱水、精密フィルタープレス、ロータリー乾燥機、自動充填システム。" },
    japanese_spec: { en: "Ilmenite (TiO2 feedstock), Rutile, Zircon (ceramic/nuclear grade), and high-purity Garnet.", ja: "イルメナイト (TiO2原料)、ルチル、ジルコン (セラミック・耐火物向け)、高比重ガーネット。" }
  }
};

function initApp() {
  // Initialize Lucide icons
  try {
    if (window.lucide) {
      window.lucide.createIcons();
    }
  } catch (e) {}

  // Set initial language
  try {
    setLanguage(currentLang);
  } catch (e) {
    console.error('Failed to set language:', e);
  }

  // Setup Language Switcher
  const langToggleBtn = document.getElementById('lang-toggle-btn');
  if (langToggleBtn) {
    langToggleBtn.addEventListener('click', () => {
      const newLang = currentLang === 'en' ? 'ja' : 'en';
      setLanguage(newLang);
    });
  }

  // Mobile menu setup
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });

    // Close mobile menu on link click
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
      });
    });
  }

  // Modal handlers
  try { setupModal(); } catch (e) {}

  // Mineral processing pipeline interactivity
  try { setupPipelineInspector(); } catch (e) {}

  // Form submission handler
  try { setupRFQForm(); } catch (e) {}

  // Initialize interactive green & white liquid background animation
  try { initBackgroundCanvas(); } catch (e) { console.error('Canvas error:', e); }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

// Update UI Language
function setLanguage(lang) {
  currentLang = lang;
  setStoredLang(lang);
  document.documentElement.lang = lang;

  const dict = translations[lang] || translations.en;

  // Update text content
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) {
      el.textContent = dict[key];
    }
  });

  // Update HTML content (for elements that might have formatting or tags)
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const key = el.getAttribute('data-i18n-html');
    if (dict[key]) {
      el.innerHTML = dict[key];
    }
  });

  // Update placeholder attributes
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (dict[key]) {
      el.setAttribute('placeholder', dict[key]);
    }
  });

  // Update language toggle button label
  const langLabel = document.getElementById('current-lang-label');
  if (langLabel) {
    langLabel.textContent = lang === 'en' ? '日本語' : 'English';
  }

  // Refresh pipeline active card text if open
  const activePipelineStep = document.querySelector('.pipeline-btn.active');
  if (activePipelineStep) {
    const stepKey = activePipelineStep.getAttribute('data-step');
    updatePipelineDetails(stepKey);
  }

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// Modal handling
function setupModal() {
  const modal = document.getElementById('rfq-modal');
  const openButtons = document.querySelectorAll('.open-rfq-modal');
  const closeButton = document.getElementById('close-modal-btn');

  if (!modal) return;

  openButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const defaultType = btn.getAttribute('data-inquiry-type') || 'graphite';
      const typeSelect = document.getElementById('form-inquiry-type');
      if (typeSelect) {
        typeSelect.value = defaultType;
        handleInquiryTypeChange(defaultType);
      }
      modal.classList.remove('hidden');
      modal.classList.add('flex');
      document.body.style.overflow = 'hidden';
    });
  });

  const closeModal = () => {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.style.overflow = 'auto';
  };

  if (closeButton) closeButton.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
      closeModal();
    }
  });

  const inquirySelect = document.getElementById('form-inquiry-type');
  if (inquirySelect) {
    inquirySelect.addEventListener('change', (e) => {
      handleInquiryTypeChange(e.target.value);
    });
  }
}

function handleInquiryTypeChange(type) {
  const graphiteFields = document.getElementById('graphite-extra-fields');
  if (graphiteFields) {
    if (type === 'graphite') {
      graphiteFields.classList.remove('hidden');
    } else {
      graphiteFields.classList.add('hidden');
    }
  }
}

// Pipeline Interactive Inspector
function setupPipelineInspector() {
  const buttons = document.querySelectorAll('.pipeline-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const stepKey = btn.getAttribute('data-step');
      updatePipelineDetails(stepKey);
    });
  });
}

function updatePipelineDetails(stepKey) {
  const data = pipelineDetails[stepKey];
  if (!data) return;

  const detailBox = document.getElementById('pipeline-detail-content');
  if (!detailBox) return;

  const title = data.title[currentLang] || data.title.en;
  const tech = data.tech[currentLang] || data.tech.en;
  const jp = data.japanese_spec[currentLang] || data.japanese_spec.en;

  const techHeader = currentLang === 'ja' ? '主要技術・装置' : 'Key Technology & Units';
  const japanHeader = currentLang === 'ja' ? '日本側サプライヤー技術の強み' : 'Japanese Sourcing & Engineering Advantage';

  detailBox.innerHTML = `
    <div class="p-6 water-glass-card rounded-2xl border border-emerald-500/30 transition-all duration-300">
      <div class="flex items-center gap-3 mb-4">
        <span class="p-2.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-xl font-bold text-sm shadow-[0_0_15px_rgba(16,185,129,0.3)]">
          <i data-lucide="layers" class="w-5 h-5 text-emerald-400"></i>
        </span>
        <h4 class="text-xl font-bold text-white tracking-wide">${title}</h4>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mt-3">
        <div class="bg-black/40 p-4 rounded-xl border border-emerald-500/20 backdrop-blur-sm shadow-inner">
          <p class="font-semibold text-emerald-400 mb-1.5 flex items-center gap-2">
            <i data-lucide="settings" class="w-4 h-4 text-emerald-400"></i> ${techHeader}
          </p>
          <p class="text-slate-300 leading-relaxed text-xs sm:text-sm">${tech}</p>
        </div>
        <div class="bg-black/40 p-4 rounded-xl border border-teal-500/20 backdrop-blur-sm shadow-inner">
          <p class="font-semibold text-teal-300 mb-1.5 flex items-center gap-2">
            <i data-lucide="shield-check" class="w-4 h-4 text-teal-400"></i> ${japanHeader}
          </p>
          <p class="text-slate-300 leading-relaxed text-xs sm:text-sm">${jp}</p>
        </div>
      </div>
    </div>
  `;

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// RFQ Form Handler
function setupRFQForm() {
  const form = document.getElementById('rfq-contact-form');
  const successBox = document.getElementById('rfq-success-message');

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg> Processing...
    `;

    setTimeout(() => {
      form.reset();
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;

      if (successBox) {
        successBox.classList.remove('hidden');
        successBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        setTimeout(() => {
          successBox.classList.add('hidden');
        }, 8000);
      }
    }, 900);
  });
}

// Interactive Liquid Background Canvas Animation (Green & White)
function initBackgroundCanvas() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  let mouse = { x: -1000, y: -1000, radius: 150 };

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('mouseleave', () => {
    mouse.x = -1000;
    mouse.y = -1000;
  });

  // Touch device support for interactive liquid ripple
  window.addEventListener('touchmove', (e) => {
    if (e.touches && e.touches[0]) {
      mouse.x = e.touches[0].clientX;
      mouse.y = e.touches[0].clientY;
    }
  }, { passive: true });

  window.addEventListener('touchend', () => {
    mouse.x = -1000;
    mouse.y = -1000;
  });

  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      createParticles();
    }, 150);
  });

  let particles = [];

  class LiquidParticle {
    constructor(initial = true) {
      this.reset(initial);
    }

    reset(initial = false) {
      this.x = Math.random() * width;
      this.y = initial ? Math.random() * height : height + 15;
      this.baseRadius = Math.random() * 2.2 + 1.2; // 1.2px to 3.4px
      this.radius = this.baseRadius;
      this.vy = -(Math.random() * 0.45 + 0.18); // gentle upward buoyant drift
      this.vx = (Math.random() - 0.5) * 0.28;
      this.phase = Math.random() * Math.PI * 2;
      this.pulseSpeed = Math.random() * 0.02 + 0.01;

      // 45% ocean-tinted emerald, 20% vibrant cyan/blue, 35% crystalline white
      const r = Math.random();
      if (r < 0.45) {
        this.colorType = 'green';
        this.colorRgb = '14, 184, 146';
        this.glowColor = 'rgba(14, 184, 146, 0.85)';
      } else if (r < 0.65) {
        this.colorType = 'blue';
        this.colorRgb = '6, 182, 212';
        this.glowColor = 'rgba(6, 182, 212, 0.90)';
      } else {
        this.colorType = 'white';
        this.colorRgb = '255, 255, 255';
        this.glowColor = 'rgba(255, 255, 255, 0.75)';
      }
      this.baseAlpha = Math.random() * 0.45 + 0.25;
      this.alpha = this.baseAlpha;
    }

    update() {
      this.phase += this.pulseSpeed;
      this.y += this.vy;
      this.x += this.vx + Math.sin(this.phase) * 0.3; // subtle liquid harmonic wave
      this.alpha = this.baseAlpha + Math.sin(this.phase) * 0.18;

      // Fluid mouse displacement
      const dx = this.x - mouse.x;
      const dy = this.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < mouse.radius && dist > 0) {
        const force = (mouse.radius - dist) / mouse.radius;
        const angle = Math.atan2(dy, dx);
        this.x += Math.cos(angle) * force * 3.5;
        this.y += Math.sin(angle) * force * 3.5;
      }

      // Cycle particles smoothly
      if (this.y < -20 || this.x < -30 || this.x > width + 30) {
        this.reset(false);
      }
    }

    draw() {
      ctx.save();
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.colorRgb}, ${Math.max(0.08, this.alpha)})`;
      ctx.shadowBlur = this.colorType === 'white' ? 8 : 12;
      ctx.shadowColor = this.glowColor;
      ctx.fill();
      ctx.restore();
    }
  }

  function createParticles() {
    particles = [];
    const count = Math.min(Math.floor((width * height) / 16000), 80);
    for (let i = 0; i < count; i++) {
      particles.push(new LiquidParticle(true));
    }
  }

  createParticles();

  function animate() {
    ctx.clearRect(0, 0, width, height);

    // Draw delicate connecting water lines between adjacent green, blue & white nodes
    const maxDist = 115;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const p1 = particles[i];
        const p2 = particles[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < maxDist) {
          const lineAlpha = (1 - dist / maxDist) * 0.22;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);

          // Subtle green-to-blue-to-white harmonic gradient
          const grad = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
          const col1 = `rgba(${p1.colorRgb}, ${lineAlpha * (p1.colorType === 'white' ? 0.85 : 1.0)})`;
          const col2 = `rgba(${p2.colorRgb}, ${lineAlpha * (p2.colorType === 'white' ? 0.85 : 1.0)})`;
          grad.addColorStop(0, col1);
          grad.addColorStop(1, col2);

          ctx.strokeStyle = grad;
          ctx.lineWidth = 0.85;
          ctx.stroke();
        }
      }
    }

    // Update & draw particles
    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
    }

    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
}
