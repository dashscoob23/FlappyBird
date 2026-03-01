import "./style.css";

type GameMode = "start" | "playing" | "gameover";

interface Bird {
  x: number;
  y: number;
  radius: number;
  vy: number;
  tilt: number;
}

interface Pipe {
  x: number;
  width: number;
  gapTop: number;
  gapBottom: number;
  scored: boolean;
}

interface GameState {
  mode: GameMode;
  bird: Bird;
  pipes: Pipe[];
  score: number;
  best: number;
  spawnTimer: number;
  groundOffset: number;
  now: number;
}

declare global {
  interface Window {
    advanceTime: (ms: number) => void;
    render_game_to_text: () => string;
  }
}

const canvas = document.getElementById("game") as HTMLCanvasElement;
const ctxOrNull = canvas.getContext("2d");

if (!ctxOrNull) {
  throw new Error("Canvas 2D context is unavailable.");
}
const ctx: CanvasRenderingContext2D = ctxOrNull;

const BASE_WIDTH = 432;
const BASE_HEIGHT = 768;
const GRAVITY = 1850;
const FLAP_VELOCITY = -560;
const PIPE_SPEED = 165;
const PIPE_SPAWN_SECONDS = 1.35;
const PIPE_GAP = 188;
const BIRD_X = 120;

const state: GameState = {
  mode: "start",
  bird: {
    x: BIRD_X,
    y: BASE_HEIGHT * 0.46,
    radius: 19,
    vy: 0,
    tilt: 0,
  },
  pipes: [],
  score: 0,
  best: Number(localStorage.getItem("flappy_best") || 0),
  spawnTimer: 0,
  groundOffset: 0,
  now: 0,
};

let rafId: number | null = null;
let lastTimestamp = 0;

function resetRound(): void {
  state.mode = "playing";
  state.bird.y = BASE_HEIGHT * 0.46;
  state.bird.vy = 0;
  state.bird.tilt = 0;
  state.pipes = [];
  state.score = 0;
  state.spawnTimer = 0;
  state.groundOffset = 0;
}

function flap(): void {
  if (state.mode === "start" || state.mode === "gameover") {
    resetRound();
  }

  if (state.mode === "playing") {
    state.bird.vy = FLAP_VELOCITY;
  }
}

function spawnPipe(): void {
  const topMargin = 90;
  const bottomMargin = 180;
  const gapStart = topMargin + Math.random() * (BASE_HEIGHT - bottomMargin - topMargin - PIPE_GAP);

  state.pipes.push({
    x: BASE_WIDTH + 60,
    width: 74,
    gapTop: gapStart,
    gapBottom: gapStart + PIPE_GAP,
    scored: false,
  });
}

function intersectsPipe(pipe: Pipe): boolean {
  const birdLeft = state.bird.x - state.bird.radius;
  const birdRight = state.bird.x + state.bird.radius;
  const birdTop = state.bird.y - state.bird.radius;
  const birdBottom = state.bird.y + state.bird.radius;

  const pipeLeft = pipe.x;
  const pipeRight = pipe.x + pipe.width;

  const overlapX = birdRight > pipeLeft && birdLeft < pipeRight;
  if (!overlapX) {
    return false;
  }

  return birdTop < pipe.gapTop || birdBottom > pipe.gapBottom;
}

function crash(): void {
  if (state.mode !== "playing") {
    return;
  }

  state.mode = "gameover";
  state.best = Math.max(state.best, state.score);
  localStorage.setItem("flappy_best", String(state.best));
}

function update(dt: number): void {
  const clampedDt = Math.min(dt, 1 / 30);
  state.now += clampedDt;

  if (state.mode !== "playing") {
    return;
  }

  state.bird.vy += GRAVITY * clampedDt;
  state.bird.y += state.bird.vy * clampedDt;
  state.bird.tilt = Math.max(-0.6, Math.min(1.2, state.bird.vy / 700));

  state.spawnTimer += clampedDt;
  if (state.spawnTimer >= PIPE_SPAWN_SECONDS) {
    state.spawnTimer = 0;
    spawnPipe();
  }

  for (const pipe of state.pipes) {
    pipe.x -= PIPE_SPEED * clampedDt;
    if (!pipe.scored && pipe.x + pipe.width < state.bird.x - state.bird.radius) {
      pipe.scored = true;
      state.score += 1;
    }

    if (intersectsPipe(pipe)) {
      crash();
    }
  }

  state.pipes = state.pipes.filter((pipe) => pipe.x + pipe.width > -40);

  const groundY = BASE_HEIGHT - 100;
  if (state.bird.y + state.bird.radius >= groundY) {
    state.bird.y = groundY - state.bird.radius;
    crash();
  }

  if (state.bird.y - state.bird.radius <= 0) {
    state.bird.y = state.bird.radius;
    state.bird.vy = 0;
  }

  state.groundOffset = (state.groundOffset + PIPE_SPEED * clampedDt * 0.5) % 40;
}

function drawBackground(): void {
  const sky = ctx.createLinearGradient(0, 0, 0, BASE_HEIGHT);
  sky.addColorStop(0, "#8fd5ff");
  sky.addColorStop(1, "#d0f0ff");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, BASE_WIDTH, BASE_HEIGHT);

  ctx.fillStyle = "rgba(255,255,255,0.75)";
  ctx.beginPath();
  ctx.ellipse(90, 115, 50, 22, 0, 0, Math.PI * 2);
  ctx.ellipse(132, 123, 42, 18, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(305, 185, 62, 28, 0, 0, Math.PI * 2);
  ctx.ellipse(250, 197, 50, 22, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawPipes(): void {
  ctx.fillStyle = "#2f9d37";

  for (const pipe of state.pipes) {
    const lip = 12;
    const bottomHeight = BASE_HEIGHT - 100 - pipe.gapBottom;

    ctx.fillRect(pipe.x, 0, pipe.width, pipe.gapTop);
    ctx.fillRect(pipe.x - 5, pipe.gapTop - lip, pipe.width + 10, lip);

    ctx.fillRect(pipe.x, pipe.gapBottom, pipe.width, bottomHeight);
    ctx.fillRect(pipe.x - 5, pipe.gapBottom, pipe.width + 10, lip);
  }
}

function drawGround(): void {
  const y = BASE_HEIGHT - 100;
  ctx.fillStyle = "#d6b365";
  ctx.fillRect(0, y, BASE_WIDTH, 100);

  ctx.fillStyle = "#c49d4c";
  for (let i = -1; i < 13; i += 1) {
    const x = i * 40 - state.groundOffset;
    ctx.fillRect(x, y + 30, 22, 14);
  }
}

function drawBird(): void {
  ctx.save();
  ctx.translate(state.bird.x, state.bird.y);
  ctx.rotate(state.bird.tilt);

  ctx.fillStyle = "#ffd24a";
  ctx.beginPath();
  ctx.arc(0, 0, state.bird.radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ff9f1c";
  ctx.beginPath();
  ctx.moveTo(11, 2);
  ctx.lineTo(31, 9);
  ctx.lineTo(12, 15);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(6, -7, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#111111";
  ctx.beginPath();
  ctx.arc(8, -7, 2.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawHud(): void {
  ctx.fillStyle = "#0a314f";
  ctx.textAlign = "center";

  if (state.mode === "playing") {
    ctx.font = "bold 66px Trebuchet MS";
    ctx.fillText(String(state.score), BASE_WIDTH / 2, 90);
    return;
  }

  ctx.font = "bold 52px Trebuchet MS";
  if (state.mode === "start") {
    ctx.fillText("Flappy Bird", BASE_WIDTH / 2, 230);
    ctx.font = "bold 28px Trebuchet MS";
    ctx.fillText("Press Space or Click", BASE_WIDTH / 2, 285);
    ctx.font = "24px Trebuchet MS";
    ctx.fillText("Avoid pipes. Press F for fullscreen.", BASE_WIDTH / 2, 325);
  } else {
    ctx.fillText("Game Over", BASE_WIDTH / 2, 230);
    ctx.font = "bold 30px Trebuchet MS";
    ctx.fillText(`Score: ${state.score}`, BASE_WIDTH / 2, 288);
    ctx.fillText(`Best: ${state.best}`, BASE_WIDTH / 2, 327);
    ctx.font = "24px Trebuchet MS";
    ctx.fillText("Press Space or Click to retry", BASE_WIDTH / 2, 374);
  }
}

function render(): void {
  drawBackground();
  drawPipes();
  drawGround();
  drawBird();
  drawHud();
}

function loop(timestamp: number): void {
  if (!lastTimestamp) {
    lastTimestamp = timestamp;
  }

  const dt = (timestamp - lastTimestamp) / 1000;
  lastTimestamp = timestamp;

  update(dt);
  render();
  rafId = requestAnimationFrame(loop);
}

function toggleFullscreen(): void {
  if (!document.fullscreenElement) {
    void document.documentElement.requestFullscreen();
    return;
  }

  void document.exitFullscreen();
}

window.advanceTime = (ms: number): void => {
  const stepMs = 1000 / 60;
  const steps = Math.max(1, Math.round(ms / stepMs));
  for (let i = 0; i < steps; i += 1) {
    update(stepMs / 1000);
  }
  render();
};

window.render_game_to_text = (): string => {
  const payload = {
    coordinate_system: "origin=(0,0) top-left; +x right; +y down",
    mode: state.mode,
    bird: {
      x: Number(state.bird.x.toFixed(2)),
      y: Number(state.bird.y.toFixed(2)),
      radius: state.bird.radius,
      vy: Number(state.bird.vy.toFixed(2)),
    },
    pipes: state.pipes.map((pipe) => ({
      x: Number(pipe.x.toFixed(2)),
      width: pipe.width,
      gapTop: Number(pipe.gapTop.toFixed(2)),
      gapBottom: Number(pipe.gapBottom.toFixed(2)),
      passed: pipe.scored,
    })),
    score: state.score,
    best: state.best,
    groundY: BASE_HEIGHT - 100,
  };

  return JSON.stringify(payload);
};

function onPress(event: KeyboardEvent): void {
  if (event.code === "Space") {
    event.preventDefault();
    flap();
    return;
  }

  if (event.key.toLowerCase() === "f") {
    toggleFullscreen();
  }
}

document.addEventListener("keydown", onPress);
canvas.addEventListener("pointerdown", flap);

document.addEventListener("fullscreenchange", () => {
  canvas.style.maxHeight = document.fullscreenElement ? "100vh" : "92vh";
});

render();
rafId = requestAnimationFrame(loop);

window.addEventListener("beforeunload", () => {
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
  }
});
