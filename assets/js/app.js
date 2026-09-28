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

  // Initialize 3D graphene lattice & mineral separation stream background canvas
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

// ============================================================================
// FUJI JAPAN: ADVANCED MATERIALS & INDUSTRIAL MINERAL SEPARATION BACKGROUND
// - 3D Hexagonal Graphene (Carbon sp²) Lattice with Harmonic Wave Flex
// - Dynamic Procedural Industrial Mineral Separation Stream (Graphite & Gold)
// - Alluvial Mineral Dust Micro-particles
// - Minimalist Industrial Telemetry & CAD Blueprint Aesthetic
// ============================================================================
function initBackgroundCanvas() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let width = 0;
  let height = 0;
  let dpr = 1;

  // Mouse interaction state with smooth spring interpolation
  const mouse = {
    x: -1000,
    y: -1000,
    targetX: -1000,
    targetY: -1000,
    radius: 190,
    active: false
  };

  window.addEventListener('mousemove', (e) => {
    mouse.targetX = e.clientX;
    mouse.targetY = e.clientY;
    mouse.active = true;
  });

  window.addEventListener('mouseleave', () => {
    mouse.targetX = -1000;
    mouse.targetY = -1000;
    mouse.active = false;
  });

  // Touch device responsiveness
  window.addEventListener('touchmove', (e) => {
    if (e.touches && e.touches[0]) {
      mouse.targetX = e.touches[0].clientX;
      mouse.targetY = e.touches[0].clientY;
      mouse.active = true;
    }
  }, { passive: true });

  window.addEventListener('touchend', () => {
    mouse.targetX = -1000;
    mouse.targetY = -1000;
    mouse.active = false;
  });

  // ==========================================================================
  // 1. 3D HEXAGONAL GRAPHENE CARBON LATTICE
  // ==========================================================================
  let latticeVertices = [];
  let latticeEdges = [];

  function buildGrapheneLattice() {
    latticeVertices = [];
    latticeEdges = [];
    const vertexMap = new Map();
    const edgeSet = new Set();

    // Scale hexagon (shadasraya) radius smaller for high-density nanoscale mesh
    const R = Math.max(14, Math.min(width * 0.016, 20));
    const dx = Math.sqrt(3) * R;
    const dy = 1.5 * R;

    const cols = width < 768 ? 9 : 14;
    const rows = width < 768 ? 6 : 9;

    function getVertex(x, y) {
      const key = Math.round(x * 10) + '_' + Math.round(y * 10);
      if (vertexMap.has(key)) return vertexMap.get(key);
      const idx = latticeVertices.length;
      latticeVertices.push({
        baseX: x,
        baseY: y,
        baseZ: 0,
        x: x,
        y: y,
        z: 0,
        screenX: 0,
        screenY: 0,
        screenZ: 0,
        scale: 1,
        glow: 0,
        isFocal: Math.random() < 0.12
      });
      vertexMap.set(key, idx);
      return idx;
    }

    for (let r = -rows; r <= rows; r++) {
      const rowOffset = (r % 2 !== 0) ? dx / 2 : 0;
      for (let c = -cols; c <= cols; c++) {
        const cx = c * dx + rowOffset;
        const cy = r * dy;

        // Elegant organic elliptical boundary
        const normX = cx / (cols * dx * 0.94);
        const normY = cy / (rows * dy * 0.94);
        if (normX * normX + normY * normY > 0.88) continue;

        const ringIndices = [];
        for (let k = 0; k < 6; k++) {
          const angle = (Math.PI / 6) + k * (Math.PI / 3);
          const vx = cx + R * Math.cos(angle);
          const vy = cy + R * Math.sin(angle);
          ringIndices.push(getVertex(vx, vy));
        }

        for (let k = 0; k < 6; k++) {
          const i1 = ringIndices[k];
          const i2 = ringIndices[(k + 1) % 6];
          const edgeKey = i1 < i2 ? `${i1}_${i2}` : `${i2}_${i1}`;
          if (!edgeSet.has(edgeKey)) {
            edgeSet.add(edgeKey);
            latticeEdges.push([i1, i2]);
          }
        }
      }
    }
  }

  // ==========================================================================
  // 2. PROCEDURAL INDUSTRIAL MINERAL SEPARATION DYNAMIC STREAM
  // ==========================================================================
  const STREAM_PARTICLE_COUNT = Math.min(160, Math.floor((window.innerWidth * window.innerHeight) / 9000));
  let streamParticles = [];

  class StreamParticle {
    constructor(initial = false) {
      this.reset(initial);
    }

    reset(initial = false) {
      // Particles enter from the top raw feed inlet zone
      this.x = width * 0.5 + (Math.random() - 0.5) * (width * 0.16);
      this.y = initial ? Math.random() * height : -20 - Math.random() * 40;

      // Particle density classification (NO yellow):
      // - 48% High-Density Crystalline Graphite (Dark Slate & Titanium Silver) -> Left channel (0.20 * width)
      // - 32% Crystalline Diamond White / Titanium Silver -> Right channel (0.80 * width)
      // - 20% Intermediate High-Grade Carbon Fines (Electric Cyan #4da6ff) -> Center channel (0.50 * width)
      const roll = Math.random();
      if (roll < 0.48) {
        this.type = 'graphite';
        this.color = '#94a3b8'; // Brushed titanium slate
        this.glowColor = 'rgba(148, 163, 184, 0.75)';
        this.targetXRatio = 0.20 + (Math.random() - 0.5) * 0.14;
        this.density = 2.2;
        this.baseRadius = Math.random() * 1.4 + 1.0;
      } else if (roll < 0.80) {
        this.type = 'white';
        this.color = '#e2e8f0'; // Crystalline white / silver
        this.glowColor = 'rgba(255, 255, 255, 0.85)';
        this.targetXRatio = 0.80 + (Math.random() - 0.5) * 0.14;
        this.density = 1.8;
        this.baseRadius = Math.random() * 1.3 + 0.95;
      } else {
        this.type = 'cyan';
        this.color = '#4da6ff'; // Electric cyan
        this.glowColor = 'rgba(77, 166, 255, 0.90)';
        this.targetXRatio = 0.50 + (Math.random() - 0.5) * 0.12;
        this.density = 1.3;
        this.baseRadius = Math.random() * 1.3 + 0.9;
      }

      this.radius = this.baseRadius;
      this.vy = (Math.random() * 0.75 + 1.35) * (this.density * 0.72);
      this.vx = (Math.random() - 0.5) * 0.4;
      this.alpha = Math.random() * 0.45 + 0.45;
      this.history = [];
      this.maxHistory = 4;
      this.phase = Math.random() * Math.PI * 2;
    }

    update() {
      this.phase += 0.035;

      // Maintain trailing velocity path
      this.history.push({ x: this.x, y: this.y });
      if (this.history.length > this.maxHistory) {
        this.history.shift();
      }

      // Dynamic mineral classification force: kicks in past the raw feed nozzle (y > 10% height)
      const progress = Math.min(1, Math.max(0, (this.y - height * 0.10) / (height * 0.65)));
      const targetX = width * this.targetXRatio + Math.sin(this.phase + this.y * 0.005) * 14;

      // Steering towards target separation channel
      const steer = (targetX - this.x) * (0.013 * progress);
      this.vx += steer;
      this.vx *= 0.94; // fluid dampening
      this.x += this.vx;
      this.y += this.vy;

      // Interactive mouse gravity dispersion / wake deflection
      if (mouse.active) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius && dist > 0) {
          const force = (mouse.radius - dist) / mouse.radius;
          const angle = Math.atan2(dy, dx);
          this.x += Math.cos(angle) * force * 3.6;
          this.y += Math.sin(angle) * force * 2.2;
        }
      }

      // Recycle when falling past screen bottom
      if (this.y > height + 25) {
        this.reset(false);
      }
    }

    draw() {
      // Fluid streamline trail
      if (this.history.length > 1) {
        ctx.beginPath();
        ctx.moveTo(this.history[0].x, this.history[0].y);
        for (let i = 1; i < this.history.length; i++) {
          ctx.lineTo(this.history[i].x, this.history[i].y);
        }
        ctx.lineTo(this.x, this.y);
        ctx.strokeStyle = this.color;
        ctx.globalAlpha = this.alpha * 0.32;
        ctx.lineWidth = this.radius * 0.85;
        ctx.lineCap = 'round';
        ctx.stroke();
      }

      // Leading particle with subtle luminous glow (cyan, white, titanium)
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = this.alpha;
      ctx.shadowBlur = this.type === 'cyan' ? 8 : (this.type === 'white' ? 6 : 4);
      ctx.shadowColor = this.glowColor;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    }
  }

  // ==========================================================================
  // 3. ALLUVIAL MINERAL DUST MICRO-PARTICLES (NO YELLOW)
  // ==========================================================================
  const DUST_COUNT = 55;
  let dustParticles = [];

  class DustParticle {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = Math.random() * width;
      this.y = initial ? Math.random() * height : -10;
      this.radius = Math.random() * 1.0 + 0.45;
      const roll = Math.random();
      this.color = roll < 0.45 ? '#cbd5e1' : (roll < 0.75 ? '#94a3b8' : '#4da6ff');
      this.vy = Math.random() * 0.32 + 0.16;
      this.vx = (Math.random() - 0.5) * 0.22;
      this.alpha = Math.random() * 0.42 + 0.18;
      this.phase = Math.random() * Math.PI * 2;
    }

    update() {
      this.phase += 0.022;
      this.x += this.vx + Math.sin(this.phase) * 0.22;
      this.y += this.vy;

      // Mouse displacement
      if (mouse.active) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 130 && dist > 0) {
          const force = (130 - dist) / 130;
          this.x += (dx / dist) * force * 2.2;
          this.y += (dy / dist) * force * 2.2;
        }
      }

      if (this.y > height + 10 || this.x < -10 || this.x > width + 10) {
        this.reset(false);
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = this.alpha;
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  // ==========================================================================
  // 4. CAD BLUEPRINT STREAMLINES & TELEMETRY
  // ==========================================================================
  function drawCADTelemetry() {
    ctx.save();

    // Subtle CAD guide grid
    const gridSize = 140;
    ctx.strokeStyle = 'rgba(77, 166, 255, 0.03)';
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    for (let x = 0; x < width; x += gridSize) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    ctx.stroke();

    // Crosshairs at key intersections
    ctx.strokeStyle = 'rgba(77, 166, 255, 0.07)';
    ctx.lineWidth = 0.9;
    const tick = 3.5;
    for (let x = gridSize; x < width; x += gridSize * 2) {
      for (let y = gridSize; y < height; y += gridSize * 2) {
        ctx.beginPath();
        ctx.moveTo(x - tick, y);
        ctx.lineTo(x + tick, y);
        ctx.moveTo(x, y - tick);
        ctx.lineTo(x, y + tick);
        ctx.stroke();
      }
    }

    // Glowing mineral separation streamlines
    const topX = width * 0.5;
    const topY = height * 0.08;
    const splitY = height * 0.28;

    ctx.lineWidth = 0.8;
    ctx.setLineDash([4, 8]);

    // Left channel: Graphite & Slate
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.06)';
    ctx.beginPath();
    ctx.moveTo(topX, topY);
    ctx.bezierCurveTo(topX - width * 0.08, splitY, width * 0.20, height * 0.6, width * 0.20, height);
    ctx.stroke();

    // Right channel: Crystalline White / Titanium Silver Stream
    ctx.strokeStyle = 'rgba(203, 213, 225, 0.06)';
    ctx.beginPath();
    ctx.moveTo(topX, topY);
    ctx.bezierCurveTo(topX + width * 0.08, splitY, width * 0.80, height * 0.6, width * 0.80, height);
    ctx.stroke();

    // Center channel: Refined Cyan Fines
    ctx.strokeStyle = 'rgba(77, 166, 255, 0.05)';
    ctx.beginPath();
    ctx.moveTo(topX, topY);
    ctx.lineTo(topX, height);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.restore();
  }

  // ==========================================================================
  // RESIZE & REINITIALIZATION
  // ==========================================================================
  let resizeTimeout;
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.scale(dpr, dpr);

    buildGrapheneLattice();

    streamParticles = [];
    for (let i = 0; i < STREAM_PARTICLE_COUNT; i++) {
      streamParticles.push(new StreamParticle(true));
    }

    dustParticles = [];
    for (let i = 0; i < DUST_COUNT; i++) {
      dustParticles.push(new DustParticle());
    }
  }

  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(resize, 120);
  });
  resize();

  // ==========================================================================
  // 5. MAIN 60FPS ANIMATION LOOP
  // ==========================================================================
  let lastTime = performance.now();
  let simTime = 0;

  function animate(now) {
    const dt = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;
    simTime += dt;

    // Smooth mouse target interpolation
    if (mouse.active) {
      mouse.x += (mouse.targetX - mouse.x) * 0.12;
      mouse.y += (mouse.targetY - mouse.y) * 0.12;
    } else {
      mouse.x = -1000;
      mouse.y = -1000;
    }

    // 1. Semi-transparent canvas background fade for streamlined trails (#0d1117 base)
    ctx.fillStyle = 'rgba(13, 17, 23, 0.32)';
    ctx.fillRect(0, 0, width, height);

    // 2. CAD guide grid & separation vector streamlines
    drawCADTelemetry();

    // 3. Draw Mineral Dust Micro-particles
    for (let i = 0; i < dustParticles.length; i++) {
      dustParticles[i].update();
      dustParticles[i].draw();
    }

    // 4. Update and Render 3D Graphene Lattice
    const cx = width * 0.5;
    const cy = height * 0.52;
    const fov = 520;
    const camDist = 580;

    // 3D rotation angles (pitch, yaw, roll)
    const pitch = 0.42 + Math.sin(simTime * 0.35) * 0.06;
    const yaw = simTime * 0.075;
    const roll = Math.sin(simTime * 0.25) * 0.04;

    const cosX = Math.cos(pitch), sinX = Math.sin(pitch);
    const cosY = Math.cos(yaw),   sinY = Math.sin(yaw);
    const cosZ = Math.cos(roll),  sinZ = Math.sin(roll);

    // Transform 3D lattice vertices
    for (let i = 0; i < latticeVertices.length; i++) {
      const v = latticeVertices[i];

      // Dual harmonic undulation flex
      const w1 = Math.sin(v.baseX * 0.007 + simTime * 1.1) * Math.cos(v.baseY * 0.007 + simTime * 0.85) * 36;
      const w2 = Math.sin((v.baseX - v.baseY) * 0.005 + simTime * 0.6) * 18;
      let localZ = v.baseZ + w1 + w2;
      let localX = v.baseX;
      let localY = v.baseY;

      // Mouse gravity attraction / dispersion
      if (mouse.active && v.screenX > 0) {
        const dx = v.screenX - mouse.x;
        const dy = v.screenY - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius && dist > 0) {
          const force = (mouse.radius - dist) / mouse.radius;
          localZ += force * 45;
          localX += (dx / dist) * force * 24;
          localY += (dy / dist) * force * 24;
          v.glow = Math.max(v.glow, force);
        }
      }
      v.glow *= 0.94; // decay glow

      // 3D Matrix Rotation (Yaw -> Pitch -> Roll)
      const x1 = localX * cosY + localZ * sinY;
      const z1 = -localX * sinY + localZ * cosY;

      const y2 = localY * cosX - z1 * sinX;
      const z2 = localY * sinX + z1 * cosX;

      const x3 = x1 * cosZ - y2 * sinZ;
      const y3 = x1 * sinZ + y2 * cosZ;

      // Perspective projection
      const effZ = z2 + camDist;
      if (effZ > 20) {
        v.scale = fov / effZ;
        v.screenX = cx + x3 * v.scale;
        v.screenY = cy + y3 * v.scale;
        v.screenZ = effZ;
      }
    }

    // Draw graphene covalent bonds (Brushed titanium silver / Electric cyan tension)
    ctx.save();
    for (let i = 0; i < latticeEdges.length; i++) {
      const e = latticeEdges[i];
      const v1 = latticeVertices[e[0]];
      const v2 = latticeVertices[e[1]];

      if (!v1.scale || !v2.scale) continue;

      const avgZ = (v1.screenZ + v2.screenZ) * 0.5;
      const depthNorm = Math.max(0, Math.min(1, (avgZ - 350) / 450));
      const baseAlpha = (1 - depthNorm * 0.65) * 0.42;

      const edgeGlow = Math.max(v1.glow, v2.glow);
      const alpha = Math.min(1, baseAlpha + edgeGlow * 0.55);

      ctx.beginPath();
      ctx.moveTo(v1.screenX, v1.screenY);
      ctx.lineTo(v2.screenX, v2.screenY);

      if (edgeGlow > 0.15) {
        // Electric cyan highlight when flexed/hovered
        ctx.strokeStyle = `rgba(77, 166, 255, ${alpha})`;
        ctx.lineWidth = 0.95 * ((v1.scale + v2.scale) * 0.5);
      } else {
        // Brushed titanium silver
        ctx.strokeStyle = `rgba(180, 195, 210, ${alpha * 0.72})`;
        ctx.lineWidth = 0.58 * ((v1.scale + v2.scale) * 0.5);
      }
      ctx.stroke();
    }
    ctx.restore();

    // Draw graphene carbon nodes
    ctx.save();
    for (let i = 0; i < latticeVertices.length; i++) {
      const v = latticeVertices[i];
      if (!v.scale) continue;

      const nodeAlpha = Math.max(0.18, Math.min(1, (1.2 - v.screenZ / 800) + v.glow * 0.6));
      const nodeRadius = (v.isFocal ? 1.8 : 1.15) * v.scale;

      ctx.beginPath();
      ctx.arc(v.screenX, v.screenY, Math.max(0.8, nodeRadius), 0, Math.PI * 2);

      if (v.glow > 0.2 || v.isFocal) {
        ctx.fillStyle = '#4da6ff'; // Electric cyan
        ctx.shadowBlur = 8;
        ctx.shadowColor = 'rgba(77, 166, 255, 0.9)';
      } else {
        ctx.fillStyle = `rgba(180, 215, 245, ${nodeAlpha})`;
        ctx.shadowBlur = 3;
        ctx.shadowColor = 'rgba(77, 166, 255, 0.4)';
      }
      ctx.fill();

      // Subtle pulse ring around focal nodes
      if (v.isFocal && nodeAlpha > 0.3) {
        const pulse = (Math.sin(simTime * 3 + i) + 1) * 0.5;
        ctx.beginPath();
        ctx.arc(v.screenX, v.screenY, nodeRadius + 2 + pulse * 2.5, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(77, 166, 255, ${0.25 * pulse})`;
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }
    }
    ctx.restore();

    // 5. Update and Draw Industrial Mineral Separation Streams
    for (let i = 0; i < streamParticles.length; i++) {
      streamParticles[i].update();
      streamParticles[i].draw();
    }

    // 6. Subtle Vignette Overlay with Soft Radial Glow
    ctx.save();
    const vigGrad = ctx.createRadialGradient(
      cx, cy, Math.min(width, height) * 0.25,
      cx, cy, Math.max(width, height) * 0.85
    );
    vigGrad.addColorStop(0, 'rgba(13, 17, 23, 0)');
    vigGrad.addColorStop(0.65, 'rgba(13, 17, 23, 0.45)');
    vigGrad.addColorStop(1, 'rgba(13, 17, 23, 0.88)');
    ctx.fillStyle = vigGrad;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();

    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
}
