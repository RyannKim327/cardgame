export function resizeCanvas(canvas, window) {
  canvas.height = window.innerHeight;
  canvas.width = window.innerWidth;
}

export function hpComputation(level, hp) {
  const lvl = Number(level) || 1;
  const baseHp = Number(hp) || 0;
  return Math.round((baseHp + (lvl * 5)) * 100) / 100;
}

