const root = document.getElementById("root");

const COLORS = {
  character: [
    ["Kırmızı", "#e53935"],
    ["Turuncu", "#fb8c00"],
    ["Sarı", "#fdd835"],
    ["Yeşil", "#43a047"],
    ["Mavi", "#3498db"],
    ["Mor", "#8e24aa"],
  ],
  blocks: [
    ["Yeşil", "#4CAF50"],
    ["Turuncu", "#FF5722"],
    ["Sarı", "#fdd835"],
    ["Mavi", "#3498db"],
    ["Mor", "#8e24aa"],
    ["Gri", "#777777"],
  ],
};

const settings = {
  characterColor: "#3498db",
  groundColor: "#4CAF50",
  platformColor: "#FF5722",
  backgroundMode: "default",
  backgroundColor: "#20243a",
  backgroundImage: null,
  groundImage: null,
  bubbleColor: "#e01818",
  musicMode: "default",
  autoMap: false,
};

const DEFAULT_SETTINGS = { ...settings, backgroundImageData: null };
const STORAGE_KEY = "happyGuysV2Settings";

function loadSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (!saved || typeof saved !== "object") return;
    Object.assign(settings, {
      characterColor: saved.characterColor || DEFAULT_SETTINGS.characterColor,
      groundColor: saved.groundColor || DEFAULT_SETTINGS.groundColor,
      platformColor: saved.platformColor || DEFAULT_SETTINGS.platformColor,
      backgroundMode: saved.backgroundMode || DEFAULT_SETTINGS.backgroundMode,
      backgroundColor: saved.backgroundColor || DEFAULT_SETTINGS.backgroundColor,
      backgroundImageData: saved.backgroundImageData || null,
      groundImageData: saved.groundImageData || null,
      bubbleColor: saved.bubbleColor || DEFAULT_SETTINGS.bubbleColor,
      musicMode: saved.musicMode || DEFAULT_SETTINGS.musicMode,
      autoMap: Boolean(saved.autoMap),
    });
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function saveSettings() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    characterColor: settings.characterColor,
    groundColor: settings.groundColor,
    platformColor: settings.platformColor,
    backgroundMode: settings.backgroundMode,
    backgroundColor: settings.backgroundColor,
    backgroundImageData: settings.backgroundImageData || null,
    groundImageData: settings.groundImageData || null,
    bubbleColor: settings.bubbleColor,
    musicMode: settings.musicMode,
    autoMap: settings.autoMap,
  }));
}

loadSettings();

root.innerHTML = `
  <div class="game-shell">
    <canvas id="gameCanvas"></canvas>
    <div class="menu-overlay" id="menuOverlay">
      <aside class="settings-panel">
        <section>
          <h2>Karakter</h2>
          <div class="swatches" id="characterSwatches"></div>
        </section>
        <section>
          <h2>Zemin</h2>
          <label class="mode-button file-button">
            Fotoğraf seç
            <input id="groundFile" type="file" accept="image/*" />
          </label>
          <div class="selected-file" id="groundFileName">Varsayılan lav</div>
        </section>
        <section>
          <h2>Zıplama Blokları</h2>
          <div class="swatches" id="platformSwatches"></div>
          <input id="platformCustomColor" class="color-field" type="color" value="${settings.platformColor}" />
        </section>
        <section>
          <h2>Arka Plan</h2>
          <div class="mode-row">
            <button class="mode-button active" data-bg-mode="default">Varsayılan</button>
            <button class="mode-button" data-bg-mode="color">Renk</button>
            <label class="mode-button file-button" data-bg-mode="photo">
              Foto
              <input id="backgroundFile" type="file" accept="image/*" />
            </label>
          </div>
          <input id="backgroundColor" class="color-field" type="color" value="${settings.backgroundColor}" />
        </section>
        <section>
          <h2>Müzik</h2>
          <select id="musicMode" class="music-select">
            <option value="default">Varsayılan (2. şarkı)</option>
            <option value="mix">Karışık (iki şarkı)</option>
            <option value="track1">1. Man is He Mega - GLBML</option>
            <option value="track2">2. Order - ComaStudio</option>
          </select>
        </section>
        <section>
          <h2>Baloncuk rengi</h2>
          <input id="bubbleColor" class="color-field" type="color" value="${settings.bubbleColor}" />
        </section>
        <label class="toggle-row">
          <input id="autoMap" type="checkbox" />
          <span>Otomatik yeni harita oluştur</span>
        </label>
        <button id="resetSettings" class="reset-button" type="button">Varsayılana ayarla</button>
      </aside>
      <div class="start-stack">
        <h1>Happy Guys 2D</h1>
        <button id="startButton" class="start-button">OYUNA BAŞLA</button>
      </div>
      <div class="version-label">Happy Guys v2.0.2</div>
    </div>
    <button id="mapButton" class="map-button game-map-button">✨ Yeni Harita Oluştur</button>
    <img id="mapAnimation" class="map-animation" src="./assets/yeni-harita-olustur-game.gif" alt="Yeni harita oluşturuluyor" />
    <audio id="gameMusic" preload="auto" loop src="./man-is-he-mega-glbml-22045.mp3"></audio>
    <div class="move-controls">
      <button id="leftButton">←</button>
      <button id="rightButton">→</button>
    </div>
    <button id="jumpButton" class="jump-button">JUMP</button>
  </div>
`;

const style = document.createElement("style");
style.textContent = `
  .game-shell { position: relative; width: 100%; height: 100%; overflow: hidden; font-family: Arial, Helvetica, sans-serif; }
  #gameCanvas { display: block; width: 100%; height: 100%; touch-action: none; }
  #gameMusic { display: none; }
  .menu-overlay { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,.6); color: white; z-index: 3000; }
  .start-stack { display: flex; flex-direction: column; align-items: center; gap: 30px; }
  .start-stack h1 { margin: 0; font-size: 48px; text-shadow: 0 4px 10px rgba(0,0,0,.5); }
  .start-button { padding: 20px 50px; border: 0; border-radius: 15px; background: #4CAF50; color: white; box-shadow: 0 8px 20px rgba(0,0,0,.4); font-size: 24px; font-weight: 700; cursor: pointer; }
  .version-label { position: absolute; left: 14px; bottom: 12px; color: rgba(255,255,255,.72); font-size: 13px; font-weight: 700; }
  .settings-panel { position: absolute; top: 14px; right: 14px; width: min(360px, calc(100vw - 28px)); display: grid; gap: 12px; padding: 14px; background: rgba(0,0,0,.34); border: 1px solid rgba(255,255,255,.18); border-radius: 14px; }
  .settings-panel h2 { margin: 0 0 8px; font-size: 14px; line-height: 1; }
  .swatches, .mode-row { display: flex; flex-wrap: wrap; gap: 8px; }
  .swatch { width: 34px; height: 34px; border-radius: 50%; border: 2px solid rgba(255,255,255,.55); cursor: pointer; box-shadow: 0 5px 12px rgba(0,0,0,.28); }
  .swatch.active { border: 4px solid white; }
  .mode-button { height: 34px; padding: 0 12px; border: 1px solid rgba(255,255,255,.25); border-radius: 9px; background: rgba(255,255,255,.14); color: white; font-weight: 700; cursor: pointer; }
  .mode-button.active { background: #4CAF50; border-color: #4CAF50; }
  .file-button { display: inline-flex; align-items: center; }
  .file-button input { display: none; }
  .color-field { width: 54px; height: 34px; padding: 0; border: 0; border-radius: 8px; background: transparent; }
  .music-select { width: 100%; height: 36px; border: 1px solid rgba(255,255,255,.25); border-radius: 9px; background: rgba(255,255,255,.14); color: white; padding: 0 9px; }
  .music-select option { color: #20243a; }
  .selected-file { color: rgba(255,255,255,.72); font-size: 12px; margin-top: 6px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .toggle-row { display: flex; align-items: center; gap: 9px; color: white; font-size: 13px; font-weight: 700; cursor: pointer; }
  .toggle-row input { width: 18px; height: 18px; accent-color: #4CAF50; }
  .reset-button { height: 36px; border: 1px solid rgba(255,255,255,.25); border-radius: 9px; background: rgba(255,255,255,.12); color: white; font-weight: 700; cursor: pointer; }
  .reset-button:hover { background: rgba(255,255,255,.2); }
  .game-map-button { position: absolute; top: 2px; right: 10px; z-index: 1000; display: none; border: 0; border-radius: 10px; padding: 12px 20px; background: #4CAF50; color: white; font-weight: 700; cursor: pointer; }
  .game-map-button:disabled { background: #777; cursor: not-allowed; opacity: .72; }
  .map-animation { position: absolute; top: 2px; right: 10px; z-index: 1000; display: none; width: 180px; height: 76px; object-fit: contain; }
  .move-controls { position: absolute; bottom: 30px; left: 30px; display: none; gap: 20px; }
  .move-controls button { width: 74px; height: 74px; border: 2px solid rgba(255,255,255,.3); border-radius: 15px; background: rgba(255,255,255,.15); color: white; font-size: 35px; touch-action: none; }
  .jump-button { position: absolute; right: 30px; bottom: 30px; display: none; width: 104px; height: 104px; border: 2px solid rgba(255,255,255,.3); border-radius: 50%; background: rgba(255,255,255,.15); color: white; font-weight: 700; touch-action: none; }
  @media (max-width: 760px) {
    .settings-panel { left: 10px; right: 10px; top: 10px; width: auto; grid-template-columns: 1fr 1fr; }
    .settings-panel section:last-child { grid-column: 1 / -1; }
    .start-stack h1 { font-size: 38px; }
  }
`;
document.head.appendChild(style);

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const menuOverlay = document.getElementById("menuOverlay");
const mapButton = document.getElementById("mapButton");
const mapAnimation = document.getElementById("mapAnimation");
const gameMusic = document.getElementById("gameMusic");
const leftButton = document.getElementById("leftButton");
const rightButton = document.getElementById("rightButton");
const jumpButton = document.getElementById("jumpButton");
const backgroundColorInput = document.getElementById("backgroundColor");
const platformCustomColor = document.getElementById("platformCustomColor");
const musicModeSelect = document.getElementById("musicMode");
const bubbleColorInput = document.getElementById("bubbleColor");
const groundFileName = document.getElementById("groundFileName");
const autoMapInput = document.getElementById("autoMap");
const lavaTile = new Image();
lavaTile.src = "./assets/lava-tile.png";
let lavaPattern = null;
let groundPattern = null;

const player = {
  x: 150,
  y: 100,
  width: 32,
  height: 48,
  vx: 0,
  vy: 0,
  speed: 6,
  grounded: false,
};

let platforms = [];
let keys = {};
let started = false;
let animationId = 0;
let lastFrameTime = performance.now();
let physicsAccumulator = 0;
const PHYSICS_STEP = 1 / 100;
let squash = 1;
let mapLocked = false;
let mapAnimating = false;
let mapUnlockX = 0;
let checkpoint = { x: 224, y: 0 };
const lavaBubbles = [];
let lavaBubbleTimer = 0.35;

function setCanvasSize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  if (!platforms.length) {
    resetPlatforms();
  } else {
    platforms[0].y = canvas.height - 40;
  }
}

function resetPlatforms() {
  const h = canvas.height;
  lavaBubbles.length = 0;
  lavaBubbleTimer = 0.35;
  platforms = [
    { x: 0, y: h - 40, width: Math.max(5000, canvas.width * 2), height: 40, color: settings.groundColor, isGround: true },
    { x: 200, y: h - 200, width: 200, height: 20, color: settings.platformColor, checkpoint: true },
    { x: 500, y: h - 350, width: 150, height: 20, color: settings.platformColor },
    { x: 800, y: h - 500, width: 150, height: 20, color: settings.platformColor },
  ];
  setCheckpoint(platforms[1]);
  respawnAtCheckpoint();
}

function setCheckpoint(platform) {
  checkpoint = {
    x: platform.x + 24,
    y: platform.y - player.height,
  };
}

function respawnAtCheckpoint() {
  player.x = checkpoint.x;
  player.y = checkpoint.y;
  player.vx = 0;
  player.vy = 0;
  player.grounded = true;
  squash = 1;
}

function spawnLavaBubble() {
  const ground = platforms[0];
  if (!ground) return;
  const cameraX = Math.max(0, player.x - canvas.width / 4);
  const minX = Math.max(8, cameraX - 20);
  const maxX = Math.min(ground.x + ground.width - 8, cameraX + canvas.width + 20);
  const bubbleCount = 30;
  for (let index = 0; index < bubbleCount; index += 1) {
    const targetRise = 20 + Math.random() * 25;
    const riseSpeed = 38 + Math.random() * 32;
    lavaBubbles.push({
      x: minX + Math.random() * Math.max(1, maxX - minX),
      baseY: ground.y + 3,
      radius: 3 + Math.random() * 3,
      age: -(index * 0.065 + Math.random() * 0.08),
      duration: targetRise / riseSpeed,
      targetRise,
      wobble: Math.random() * Math.PI * 2,
    });
  }
}

function updateLavaBubbles(dt) {
  lavaBubbleTimer -= dt;
  if (lavaBubbleTimer <= 0) {
    spawnLavaBubble();
    lavaBubbleTimer = 2.8 + Math.random() * 1.3;
  }

  for (let index = lavaBubbles.length - 1; index >= 0; index -= 1) {
    const bubble = lavaBubbles[index];
    bubble.age += dt;
    if (bubble.age >= bubble.duration) lavaBubbles.splice(index, 1);
  }
}

function syncPlatformColors() {
  for (const platform of platforms) {
    platform.color = platform.isGround ? settings.groundColor : settings.platformColor;
  }
}

function setBackgroundImageFromData(dataUrl) {
  if (!dataUrl) {
    settings.backgroundImage = null;
    return;
  }
  const image = new Image();
  image.onload = () => {
    settings.backgroundImage = image;
  };
  image.src = dataUrl;
}

function setGroundImageFromData(dataUrl) {
  settings.groundImage = null;
  groundPattern = null;
  if (!dataUrl) return;
  const image = new Image();
  image.onload = () => {
    settings.groundImage = image;
    groundPattern = null;
  };
  image.src = dataUrl;
}

function syncSettingsUi() {
  makeSwatches("characterSwatches", COLORS.character, "characterColor");
  makeSwatches("platformSwatches", COLORS.blocks, "platformColor");
  platformCustomColor.value = settings.platformColor;
  backgroundColorInput.value = settings.backgroundColor;
  bubbleColorInput.value = settings.bubbleColor;
  autoMapInput.checked = settings.autoMap;
  groundFileName.textContent = settings.groundImageData ? "Özel zemin fotoğrafı" : "Varsayılan lav";
  musicModeSelect.value = settings.musicMode;
  document.querySelectorAll("[data-bg-mode]").forEach((item) => {
    item.classList.toggle("active", item.dataset.bgMode === settings.backgroundMode);
  });
}

function makeSwatches(id, palette, key) {
  const holder = document.getElementById(id);
  holder.innerHTML = "";
  for (const [name, color] of palette) {
    const button = document.createElement("button");
    button.className = "swatch";
    button.title = name;
    button.setAttribute("aria-label", name);
    button.style.background = color;
    if (settings[key] === color) button.classList.add("active");
    button.addEventListener("click", () => {
      settings[key] = color;
      makeSwatches(id, palette, key);
      syncPlatformColors();
      saveSettings();
    });
    holder.appendChild(button);
  }
}

makeSwatches("characterSwatches", COLORS.character, "characterColor");
makeSwatches("platformSwatches", COLORS.blocks, "platformColor");
setBackgroundImageFromData(settings.backgroundImageData);
setGroundImageFromData(settings.groundImageData);
syncSettingsUi();

document.querySelectorAll("[data-bg-mode]").forEach((button) => {
  button.addEventListener("click", () => {
    settings.backgroundMode = button.dataset.bgMode;
    document.querySelectorAll("[data-bg-mode]").forEach((item) => item.classList.toggle("active", item === button));
    saveSettings();
  });
});

backgroundColorInput.addEventListener("input", (event) => {
  settings.backgroundColor = event.target.value;
  settings.backgroundMode = "color";
  document.querySelectorAll("[data-bg-mode]").forEach((item) => item.classList.toggle("active", item.dataset.bgMode === "color"));
  saveSettings();
});

platformCustomColor.addEventListener("input", (event) => {
  settings.platformColor = event.target.value;
  makeSwatches("platformSwatches", COLORS.blocks, "platformColor");
  syncPlatformColors();
  saveSettings();
});

bubbleColorInput.addEventListener("input", (event) => {
  settings.bubbleColor = event.target.value;
  saveSettings();
});

autoMapInput.addEventListener("change", (event) => {
  settings.autoMap = event.target.checked;
  saveSettings();
  if (!started) return;
  mapButton.style.display = settings.autoMap ? "none" : "block";
  if (settings.autoMap && !mapAnimating) createMapChunk();
});

document.getElementById("groundFile").addEventListener("change", (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    settings.groundImageData = reader.result;
    setGroundImageFromData(settings.groundImageData);
    groundFileName.textContent = file.name;
    saveSettings();
  };
  reader.readAsDataURL(file);
});

musicModeSelect.addEventListener("change", (event) => {
  settings.musicMode = event.target.value;
  saveSettings();
  if (started) playMusic();
});

document.getElementById("backgroundFile").addEventListener("change", (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    settings.backgroundImageData = reader.result;
    settings.backgroundMode = "photo";
    setBackgroundImageFromData(settings.backgroundImageData);
    document.querySelectorAll("[data-bg-mode]").forEach((item) => item.classList.toggle("active", item.dataset.bgMode === "photo"));
    saveSettings();
  };
  reader.readAsDataURL(file);
});

document.getElementById("resetSettings").addEventListener("click", () => {
  Object.assign(settings, DEFAULT_SETTINGS);
  settings.backgroundImageData = null;
  settings.groundImageData = null;
  localStorage.removeItem(STORAGE_KEY);
  setBackgroundImageFromData(null);
  setGroundImageFromData(null);
  syncSettingsUi();
  syncPlatformColors();
});

document.getElementById("startButton").addEventListener("click", () => {
  started = true;
  playMusic();
  menuOverlay.style.display = "none";
  mapButton.style.display = settings.autoMap ? "none" : "block";
  document.querySelector(".move-controls").style.display = "flex";
  jumpButton.style.display = "block";
  syncPlatformColors();
  if (settings.autoMap) createMapChunk();
});

const MUSIC_TRACKS = [
  "./man-is-he-mega-glbml-22045.mp3",
  "./order-99518%20(1).mp3",
];
let musicTrackIndex = 1;

function playMusic() {
  const mode = settings.musicMode;
  if (mode === "track1") musicTrackIndex = 0;
  else if (mode === "track2" || mode === "default") musicTrackIndex = 1;
  else musicTrackIndex = Math.random() < 0.5 ? 0 : 1;

  gameMusic.loop = mode !== "mix";
  gameMusic.src = MUSIC_TRACKS[musicTrackIndex];
  gameMusic.volume = 0.35;
  gameMusic.currentTime = 0;
  gameMusic.play().catch(() => {});
}

gameMusic.addEventListener("ended", () => {
  if (settings.musicMode !== "mix") return;
  musicTrackIndex = musicTrackIndex === 0 ? 1 : 0;
  gameMusic.src = MUSIC_TRACKS[musicTrackIndex];
  gameMusic.play().catch(() => {});
});

function rectsOverlap(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

function moveHorizontal() {
  player.x += player.vx;
  for (const platform of platforms) {
    if (platform.isGround) continue;
    if (!rectsOverlap(player, platform)) continue;
    if (player.vx > 0) player.x = platform.x - player.width;
    if (player.vx < 0) player.x = platform.x + platform.width;
    player.vx = 0;
  }
}

function moveVertical() {
  player.y += player.vy;
  player.grounded = false;
  for (const platform of platforms) {
    if (!rectsOverlap(player, platform)) continue;
    if (player.vy > 0) {
      player.y = platform.y - player.height;
      player.vy = 0;
      player.grounded = true;
      if (player.wasAirborne) squash = 0.6;
      if (platform.checkpoint) setCheckpoint(platform);
    } else if (player.vy < 0) {
      player.y = platform.y + platform.height;
      player.vy = 0;
    }
  }
}

function updatePlayer() {
  if (!started) return;
  const acceleration = 0.48;
  player.wasAirborne = !player.grounded;
  player.vy += 0.36;

  if (keys.ArrowLeft || keys.KeyA) player.vx -= acceleration;
  else if (keys.ArrowRight || keys.KeyD) player.vx += acceleration;
  else player.vx *= 0.964;

  player.vx = Math.max(-player.speed, Math.min(player.speed, player.vx));

  if ((keys.ArrowUp || keys.KeyW || keys.Space) && player.grounded) {
    player.vy = -14;
    player.grounded = false;
  }

  moveHorizontal();
  moveVertical();

  platforms[0].width = Math.max(platforms[0].width, player.x + canvas.width * 2);
  squash += (1 - squash) * 0.09;

  if (player.x < 0) player.x = 0;
  if (player.y + player.height >= canvas.height - 40 || player.y > canvas.height + 500) respawnAtCheckpoint();

  if (settings.autoMap && !mapAnimating && mapUnlockX && player.x + canvas.width >= mapUnlockX - Math.max(300, canvas.width * 0.35)) {
    createMapChunk();
  }

  if (mapLocked && mapUnlockX && player.x + player.width >= mapUnlockX - 40) {
    mapLocked = false;
    mapUnlockX = 0;
    updateMapButton();
  }

  updateLavaBubbles(PHYSICS_STEP);
}

function drawBackground() {
  if (settings.backgroundMode === "photo" && settings.backgroundImage) {
    const image = settings.backgroundImage;
    const scale = Math.max(canvas.width / image.width, canvas.height / image.height);
    const width = image.width * scale;
    const height = image.height * scale;
    ctx.drawImage(image, (canvas.width - width) / 2, (canvas.height - height) / 2, width, height);
    return;
  }

  if (settings.backgroundMode === "color") {
    ctx.fillStyle = settings.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    return;
  }

  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "#1a2a6c");
  gradient.addColorStop(0.5, "#b21f1f");
  gradient.addColorStop(1, "#fdbb2d");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawPlayer() {
  const p = player;
  const cx = p.x + p.width / 2;
  const bottom = p.y + p.height;
  let sy = squash;
  let sx = 1 / sy;
  if (!p.grounded) {
    const stretch = Math.min(Math.abs(p.vy) * 0.015, 0.25);
    sy = 1 + stretch;
    sx = 1 - stretch;
  }

  ctx.fillStyle = "rgba(0,0,0,.2)";
  ctx.beginPath();
  ctx.ellipse(p.x + p.width / 2, p.y + p.height + 2, p.width / 2, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.translate(cx, bottom);
  ctx.scale(sx, sy);
  ctx.translate(-cx, -bottom);
  ctx.fillStyle = settings.characterColor;
  roundRect(ctx, p.x, p.y, p.width, p.height, 8);
  ctx.fill();

  ctx.fillStyle = "white";
  const eyeX = p.vx > 0.1 ? p.x + 20 : p.vx < -0.1 ? p.x + 4 : p.x + 12;
  ctx.fillRect(eyeX, p.y + 10, 8, 8);
  ctx.fillStyle = "black";
  ctx.fillRect(eyeX + (p.vx >= 0 ? 4 : 0), p.y + 12, 4, 4);
  ctx.restore();
}

function drawLavaBubbles() {
  for (const bubble of lavaBubbles) {
    if (bubble.age < 0) continue;
    const progress = Math.min(1, bubble.age / bubble.duration);
    const rise = Math.min(bubble.targetRise, progress * bubble.targetRise);
    const x = bubble.x + Math.sin(bubble.wobble + progress * 7) * 2;
    const y = bubble.baseY - rise;
    const popping = progress > 0.78;
    const popProgress = popping ? (progress - 0.78) / 0.22 : 0;
    const radius = bubble.radius * (1 + popProgress * 0.65);
    const alpha = popping ? 1 - popProgress : 1;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = settings.bubbleColor;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = settings.bubbleColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(x, y, radius + 1, 0, Math.PI * 2);
    ctx.stroke();

    if (popping) {
      ctx.globalAlpha = 1 - popProgress;
      ctx.strokeStyle = settings.bubbleColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, radius + popProgress * 8, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }
}

function roundRect(context, x, y, width, height, radius) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);
  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
}

function createGroundPhotoPattern(image, size) {
  const tile = document.createElement("canvas");
  tile.width = size;
  tile.height = size;
  const tileContext = tile.getContext("2d");
  tileContext.drawImage(image, 0, 0, size, size);
  return ctx.createPattern(tile, "repeat");
}

function draw() {
  drawBackground();
  if (!started) return;

  const cameraX = Math.max(0, player.x - canvas.width / 4);
  ctx.save();
  ctx.translate(-cameraX, 0);
  for (const platform of platforms) {
    const groundImage = settings.groundImage?.complete ? settings.groundImage : lavaTile;
    if (platform.isGround && groundImage.complete) {
      if (settings.groundImage?.complete) groundPattern ||= createGroundPhotoPattern(groundImage, platform.height);
      else lavaPattern ||= ctx.createPattern(groundImage, "repeat");
      ctx.save();
      ctx.translate(platform.x, platform.y);
      ctx.fillStyle = settings.groundImage?.complete ? groundPattern : lavaPattern;
      ctx.fillRect(0, 0, platform.width, platform.height);
      ctx.restore();
      ctx.fillStyle = "rgba(255, 120, 0, .35)";
      ctx.fillRect(platform.x, platform.y, platform.width, 4);
    } else {
      ctx.fillStyle = platform.color;
      ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
      ctx.strokeStyle = "rgba(255,255,255,.3)";
      ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);
    }
    if (platform.checkpoint) {
      const flagX = platform.x + platform.width / 2;
      ctx.fillStyle = "#ffd54f";
      ctx.fillRect(flagX - 2, platform.y - 34, 4, 34);
      ctx.beginPath();
      ctx.moveTo(flagX + 2, platform.y - 34);
      ctx.lineTo(flagX + 30, platform.y - 25);
      ctx.lineTo(flagX + 2, platform.y - 16);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "rgba(255,213,79,.22)";
      ctx.fillRect(platform.x, platform.y - 4, platform.width, 4);
    }
  }
  drawLavaBubbles();
  drawPlayer();
  ctx.restore();
}

function tick(time = performance.now()) {
  const elapsed = Math.min((time - lastFrameTime) / 1000, 0.25);
  lastFrameTime = time;

  if (started) {
    physicsAccumulator += elapsed;
    while (physicsAccumulator >= PHYSICS_STEP) {
      updatePlayer();
      physicsAccumulator -= PHYSICS_STEP;
    }
  }

  draw();
  animationId = requestAnimationFrame(tick);
}

function updateMapButton() {
  mapButton.disabled = mapLocked;
  mapButton.textContent = mapLocked ? "Haritanın Sonuna Git" : "✨ Yeni Harita Oluştur";
}

function createMapChunk() {
  if ((mapLocked && !settings.autoMap) || mapAnimating) return;
  mapAnimating = true;
  mapLocked = true;
  updateMapButton();
  mapButton.style.display = "none";
  mapAnimation.style.display = "block";
  mapAnimation.src = `./assets/yeni-harita-olustur-game.gif?${Date.now()}`;

  setTimeout(() => {
    mapAnimating = false;
    mapAnimation.style.display = "none";
    mapButton.style.display = settings.autoMap ? "none" : "block";
    updateMapButton();
  }, 2800);

  const next = [...platforms];
  const last = next[next.length - 1];
  let x = last.x + last.width;
  let y = last.y;
  const created = [];
  for (let index = 0; index < 15; index += 1) {
    x += 140 + Math.random() * 110;
    y += (Math.random() - 0.5) * 160;
    if (y < 180) y = 280;
    if (y > canvas.height - 120) y = canvas.height - 250;
    created.push({
      x: Math.round(x),
      y: Math.round(y),
      width: Math.round(100 + Math.random() * 80),
      height: 20,
      color: settings.platformColor,
      checkpoint: index === 4 || index === 9 || index === 14,
    });
  }

  const finalPlatform = created[created.length - 1];
  mapUnlockX = finalPlatform.x + finalPlatform.width;
  for (const platform of next) {
    if (platform.isGround) platform.width = Math.max(platform.width, x + 5000);
  }
  platforms = [...next, ...created];
}

mapButton.addEventListener("click", createMapChunk);

function setHeld(key, value) {
  keys[key] = value;
}

function bindHold(button, key) {
  button.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    setHeld(key, true);
    button.setPointerCapture?.(event.pointerId);
  });
  for (const type of ["pointerup", "pointercancel", "pointerleave"]) {
    button.addEventListener(type, (event) => {
      event.preventDefault();
      setHeld(key, false);
    });
  }
}

bindHold(leftButton, "ArrowLeft");
bindHold(rightButton, "ArrowRight");
bindHold(jumpButton, "Space");

window.addEventListener("keydown", (event) => {
  keys[event.code] = true;
});
window.addEventListener("keyup", (event) => {
  keys[event.code] = false;
});
window.addEventListener("resize", setCanvasSize);
window.addEventListener("contextmenu", (event) => event.preventDefault());

setCanvasSize();
cancelAnimationFrame(animationId);
tick();
