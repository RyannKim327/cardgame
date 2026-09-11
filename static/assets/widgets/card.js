import { hpComputation } from "../utils.js";

const rarityConfig = {
  abundant: { color: "#6a6a6a", secondary: "#3a3a3a", text: "#ffffff", effect: "none", radius: 6 },
  common: { color: "#4caf50", secondary: "#1b5e20", text: "#e8f5e9", effect: "none", radius: 6 },
  moderate: { color: "#2196f3", secondary: "#0d47a1", text: "#e3f2fd", effect: "none", radius: 6 },
  scarce: { color: "#e53935", secondary: "#7f0000", text: "#ffebee", effect: "none", radius: 8 },
  very_scarce: { color: "#9c27b0", secondary: "#4a148c", text: "#f3e5f5", effect: "none", radius: 8 },
  trace: { color: "#ffb300", secondary: "#ff6f00", text: "#fff8e1", effect: "royale", radius: 10 },
  synthetic: { color: "#1a1a2e", secondary: "#2d0a1a", text: "#fce4ec", effect: "gradientBorder", radius: 8 }
}

// --- Synthetic: animated gradient border ---
function drawSyntheticGradientBorder(ctx, x, y, w, h, radius, time) {
  ctx.save();
  const hue = (time * 55) % 360;
  const grad = ctx.createLinearGradient(x - 4, y - 4, x + w + 4, y + h + 4);
  grad.addColorStop(0, `hsl(${hue % 360}, 100%, 60%)`);
  grad.addColorStop(0.2, `hsl(${(hue + 45) % 360}, 100%, 62%)`);
  grad.addColorStop(0.5, `hsl(${(hue + 110) % 360}, 100%, 58%)`);
  grad.addColorStop(0.8, `hsl(${(hue + 180) % 360}, 100%, 60%)`);
  grad.addColorStop(1, `hsl(${(hue + 240) % 360}, 100%, 62%)`);

  ctx.strokeStyle = grad;
  ctx.lineWidth = 4.5 + Math.sin(time * 5) * 1.2;
  ctx.shadowBlur = 18 + Math.sin(time * 6) * 6;
  ctx.shadowColor = `hsl(${hue}, 100%, 60%)`;
  ctx.beginPath();
  ctx.roundRect(x - 3, y - 3, w + 6, h + 6, radius + 3);
  ctx.stroke();

  // inner animated dashed highlight
  ctx.shadowBlur = 0;
  ctx.strokeStyle = `hsla(${(hue + 20) % 360}, 100%, 75%, 0.9)`;
  ctx.lineWidth = 1.8;
  ctx.setLineDash([10, 8]);
  ctx.lineDashOffset = -time * 80;
  ctx.beginPath();
  ctx.roundRect(x - 1, y - 1, w + 2, h + 2, radius + 1);
  ctx.stroke();
  ctx.setLineDash([]);

  // moving sheen sweep across card
  ctx.globalCompositeOperation = "lighter";
  const sweep = ((time * 0.9) % 1);
  const sx = x - w + sweep * w * 2.5;
  const sheen = ctx.createLinearGradient(sx, y, sx + w * 0.5, y + h);
  sheen.addColorStop(0, "rgba(255,255,255,0)");
  sheen.addColorStop(0.5, "rgba(255,255,255,0.22)");
  sheen.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = sheen;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, radius);
  ctx.fill();
  ctx.globalCompositeOperation = "source-over";
  ctx.restore();
}

// --- Moderate: corner frames similar to synthetic but only corners ---
function drawModerateCornerFrame(ctx, x, y, w, h, radius, time) {
  ctx.save();
  const hue = (time * 42) % 360;
  const grad = ctx.createLinearGradient(x - 4, y - 4, x + w + 4, y + h + 4);
  grad.addColorStop(0, `hsl(${hue}, 100%, 60%)`);
  grad.addColorStop(0.35, `hsl(${(hue + 55) % 360}, 100%, 62%)`);
  grad.addColorStop(0.7, `hsl(${(hue + 115) % 360}, 100%, 58%)`);
  grad.addColorStop(1, `hsl(${(hue + 185) % 360}, 100%, 60%)`);
  ctx.strokeStyle = grad;
  ctx.lineWidth = 2.6 + Math.sin(time * 4) * 0.5;
  ctx.shadowBlur = 11 + Math.sin(time * 5) * 3;
  ctx.shadowColor = `hsl(${hue}, 100%, 60%)`;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  const cs = w * 0.16;
  const off = 3;
  const corners = [
    { sx: x - off, sy: y - off, dx: 1, dy: 1 },
    { sx: x + w + off, sy: y - off, dx: -1, dy: 1 },
    { sx: x - off, sy: y + h + off, dx: 1, dy: -1 },
    { sx: x + w + off, sy: y + h + off, dx: -1, dy: -1 }
  ];
  corners.forEach(c => {
    ctx.beginPath();
    ctx.moveTo(c.sx, c.sy + cs * c.dy);
    ctx.lineTo(c.sx, c.sy);
    ctx.lineTo(c.sx + cs * c.dx, c.sy);
    ctx.stroke();
    // small jewel dot at corner tip
    ctx.fillStyle = `hsl(${(hue + 22) % 360}, 100%, 74%)`;
    ctx.shadowBlur = 7;
    ctx.shadowColor = `hsl(${(hue + 22) % 360}, 100%, 74%)`;
    ctx.beginPath();
    ctx.arc(c.sx, c.sy, 2.0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = grad;
    ctx.shadowBlur = 11;
    ctx.shadowColor = `hsl(${hue}, 100%, 60%)`;
  });
  ctx.restore();
}

// --- Top Super Saiyan crown flames — all upwards ( \ \ \  /\  / / / ) ---
function drawFlameWings(ctx, x, y, w, h, time, isPurple) {
  const palette = isPurple
    ? { outer: "#3a0a5e", mid: "#7b1fa2", inner: "#d500f9", glow: "rgba(170,45,255,0.95)", core: "#ff80ff", ember: "#e8b0ff", spark: "#ffffff" }
    : { outer: "#5a0a00", mid: "#e53935", inner: "#ff6a00", glow: "rgba(255,70,0,0.95)", core: "#ffeb3b", ember: "#ffae42", spark: "#fffde7" };

  ctx.save();

  const isSmall = w < 72; // bench / lobby small cards — reduce cost
  const baseY = y; // top edge
  const spikeCount = isSmall ? 5 : 7;
  // how far flames stick up
  const baseH = h * (isSmall ? 0.14 : 0.20);

  // outer layer — large upward spikes, outer ones slanted 30-45° outward
  ctx.shadowBlur = 22;
  ctx.shadowColor = palette.glow;
  const outerGrad = ctx.createLinearGradient(x + w * 0.5, baseY, x + w * 0.5, baseY - baseH * 1.3);
  outerGrad.addColorStop(0, palette.inner);
  outerGrad.addColorStop(0.45, palette.mid);
  outerGrad.addColorStop(0.85, palette.outer);
  outerGrad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = outerGrad;

  // build single polygon for outer aura across top
  ctx.beginPath();
  ctx.moveTo(x - 2, baseY);
  for (let i = 0; i < spikeCount; i++) {
    const t = i / (spikeCount - 1); // 0 left .. 1 right
    const centerX = x + w * (0.06 + t * 0.88) + Math.sin(time * 7 + i * 1.3) * 2.2;
    // 30-45° slant: left outer slanted left, right outer slanted right, middle vertical
    const angleDeg = (t - 0.5) * 75; // -37.5° left .. +37.5° right (~30-45° at edges)
    const angle = angleDeg * Math.PI / 180;
    const jitterH = Math.sin(time * 12 + i * 1.6) * h * 0.03 + Math.cos(time * 10 + i) * h * 0.02;
    const spikeH = baseH + jitterH + (i % 2 ? h * 0.04 : 0) + (i === Math.floor(spikeCount / 2) ? h * 0.035 : 0);
    const halfW = w * (0.038 + Math.abs(Math.cos(time * 8 + i)) * 0.012);
    // tip position using angle: tip offset from center
    const tipX = centerX + Math.sin(angle) * spikeH;
    const tipY = baseY - Math.cos(angle) * spikeH;
    // valley width
    const valleyLeftX = centerX - halfW * 0.9;
    const valleyRightX = centerX + halfW * 0.9;
    // for continuous polygon: line to valley left, then tip, then valley right
    // but to avoid gaps we directly connect valleys
    if (i === 0) {
      ctx.lineTo(valleyLeftX, baseY);
      ctx.lineTo(tipX, tipY);
      ctx.lineTo(valleyRightX, baseY);
    } else {
      // small flat between previous spike and next
      ctx.lineTo(valleyLeftX, baseY);
      ctx.lineTo(tipX, tipY);
      ctx.lineTo(valleyRightX, baseY);
    }
  }
  ctx.lineTo(x + w + 2, baseY);
  ctx.closePath();
  ctx.fill();

  // middle layer — smaller, more saturated
  ctx.shadowBlur = 14;
  ctx.shadowColor = palette.inner;
  const midGrad = ctx.createLinearGradient(x + w * 0.5, baseY, x + w * 0.5, baseY - baseH * 0.9);
  midGrad.addColorStop(0, palette.core);
  midGrad.addColorStop(0.45, palette.inner);
  midGrad.addColorStop(1, palette.mid);
  ctx.fillStyle = midGrad;
  ctx.beginPath();
  ctx.moveTo(x + w * 0.08, baseY);
  for (let i = 0; i < spikeCount; i++) {
    const t = i / (spikeCount - 1);
    const centerX = x + w * (0.10 + t * 0.80) + Math.sin(time * 9 + i) * 1.6;
    const angleDeg = (t - 0.5) * 68;
    const angle = angleDeg * Math.PI / 180;
    const spikeH = baseH * 0.72 + Math.sin(time * 14 + i) * h * 0.02;
    const halfW = w * 0.028;
    const tipX = centerX + Math.sin(angle) * spikeH;
    const tipY = baseY - Math.cos(angle) * spikeH;
    ctx.lineTo(centerX - halfW, baseY + 1);
    ctx.lineTo(tipX, tipY);
    ctx.lineTo(centerX + halfW, baseY + 1);
  }
  ctx.lineTo(x + w * 0.92, baseY);
  ctx.closePath();
  ctx.fill();

  // inner hot white core — narrow sharp
  ctx.shadowBlur = 8;
  ctx.shadowColor = "#ffffff";
  ctx.fillStyle = "rgba(255,255,255,0.90)";
  ctx.globalAlpha = 0.92;
  ctx.beginPath();
  ctx.moveTo(x + w * 0.14, baseY + 1);
  for (let i = 0; i < spikeCount; i++) {
    const t = i / (spikeCount - 1);
    const centerX = x + w * (0.14 + t * 0.72) + Math.sin(time * 16 + i) * 1.0;
    const angleDeg = (t - 0.5) * 60;
    const angle = angleDeg * Math.PI / 180;
    const spikeH = baseH * 0.42 + Math.abs(Math.cos(time * 15 + i)) * h * 0.025;
    const halfW = w * 0.016;
    const tipX = centerX + Math.sin(angle) * spikeH;
    const tipY = baseY - Math.cos(angle) * spikeH;
    ctx.lineTo(centerX - halfW, baseY + 1.5);
    ctx.lineTo(tipX, tipY);
    ctx.lineTo(centerX + halfW, baseY + 1.5);
  }
  ctx.lineTo(x + w * 0.86, baseY + 1);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;

  // top edge burn strip
  ctx.shadowBlur = 14;
  ctx.shadowColor = palette.glow;
  ctx.fillStyle = palette.inner;
  ctx.globalAlpha = 0.38 + Math.sin(time * 7) * 0.12;
  ctx.fillRect(x + 2, baseY - 1, w - 4, 2);
  ctx.globalAlpha = 1;

  // crackling ki sparks on upward aura
  ctx.shadowBlur = 0;
  for (let i = 0; i < 5; i++) {
    const t = i / 4;
    const cx = x + w * (0.12 + t * 0.76) + Math.sin(time * 6 + i) * 2;
    const cy = baseY - baseH * (0.35 + t * 0.25) - Math.sin(time * 8 + i) * 4;
    const isBright = Math.sin(time * 18 + i * 2.2) > 0.3;
    if (!isBright && i % 2 !== 0) continue;
    ctx.strokeStyle = isBright ? palette.spark : palette.ember;
    ctx.lineWidth = isBright ? 1.2 : 0.8;
    ctx.globalAlpha = isBright ? 0.95 : 0.5;
    ctx.beginPath();
    const len = 5 + Math.random() * 3;
    const ang = (t - 0.5) * 0.9;
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.sin(ang) * len * 0.5, cy - Math.cos(ang) * 2);
    ctx.lineTo(cx + Math.sin(ang) * len, cy - Math.cos(ang) * 5);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // upward drifting embers
  for (let i = 0; i < 4; i++) {
    const p = (time * 1.5 + i * 0.6) % 1;
    const cx = x + w * (0.16 + (i * 0.18 + p * 0.05) % 0.68) + Math.sin(time * 5 + i) * 2;
    const cy = baseY - 2 - p * baseH * 0.85 - Math.abs(Math.sin(time * 7 + i)) * 2;
    const a = 1 - p;
    const sz = 1 + Math.sin(time * 12 + i) * 0.6;
    ctx.globalAlpha = a * 0.85;
    ctx.fillStyle = i % 2 === 0 ? palette.ember : palette.core;
    ctx.shadowBlur = 6;
    ctx.shadowColor = palette.glow;
    ctx.beginPath();
    ctx.arc(cx, cy, sz, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // card top edge highlight
  ctx.shadowBlur = 10;
  ctx.shadowColor = palette.glow;
  ctx.strokeStyle = palette.inner;
  ctx.lineWidth = 1.6 + Math.sin(time * 14) * 0.5;
  ctx.beginPath();
  ctx.moveTo(x + 2, baseY);
  ctx.lineTo(x + w - 2, baseY);
  ctx.stroke();

  // --- side flames: \ |  and  | /  (same count as top, all upwards 30-45°) ---
  const sideSpikeCount = spikeCount; // match top spikes (5 small, 7 large) as requested
  const sideOut = w * (isSmall ? 0.14 : 0.20);
  for (const side of [-1, 1]) {
    const edgeX = side === -1 ? x : x + w;
    // side outer gradient
    ctx.shadowBlur = 18;
    ctx.shadowColor = palette.glow;
    const sideGrad = ctx.createLinearGradient(edgeX, y + h * 0.5, edgeX + side * sideOut * 1.3, y + h * 0.5);
    sideGrad.addColorStop(0, palette.inner);
    sideGrad.addColorStop(0.5, palette.mid);
    sideGrad.addColorStop(1, palette.outer);
    ctx.fillStyle = sideGrad;

    for (let i = 0; i < sideSpikeCount; i++) {
      const t = i / (sideSpikeCount - 1);
      const centerY = y + h * (0.22 + t * 0.56) + Math.sin(time * 8 + i * 1.2) * 2;
      // side spikes all point outward and slightly upward (30-45° up) : \ on left, / on right — both upwards
      const baseAngle = 36 + Math.sin(time * 10 + i) * 5; // 31-41° variation
      const angleDeg = -baseAngle; // negative = upward (all spikes \ and / point up)
      const angle = angleDeg * Math.PI / 180;
      const flickOut = sideOut + Math.sin(time * 11 + i) * w * 0.04;
      const halfH = h * 0.038;
      const tipX = edgeX + Math.cos(angle) * flickOut * side;
      const tipY = centerY + Math.sin(angle) * flickOut;
      // outer triangle
      ctx.beginPath();
      ctx.moveTo(edgeX, centerY - halfH);
      ctx.lineTo(tipX, tipY);
      ctx.lineTo(edgeX, centerY + halfH);
      ctx.closePath();
      ctx.fill();

      // inner core
      ctx.shadowBlur = 10;
      ctx.shadowColor = palette.inner;
      const iOut = flickOut * 0.58;
      const iHalfH = halfH * 0.45;
      const iTipX = edgeX + Math.cos(angle) * iOut * side;
      const iTipY = centerY + Math.sin(angle) * iOut;
      const coreGrad = ctx.createLinearGradient(edgeX, centerY, iTipX, iTipY);
      coreGrad.addColorStop(0, "#ffffff");
      coreGrad.addColorStop(0.35, palette.core);
      coreGrad.addColorStop(1, palette.inner);
      ctx.fillStyle = coreGrad;
      ctx.globalAlpha = 0.88;
      ctx.beginPath();
      ctx.moveTo(edgeX, centerY - iHalfH);
      ctx.lineTo(iTipX, iTipY);
      ctx.lineTo(edgeX, centerY + iHalfH);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillStyle = sideGrad;
      ctx.shadowBlur = 18;
      ctx.shadowColor = palette.glow;
    }
    // side burn strip \ |  and | /
    ctx.shadowBlur = 12;
    ctx.shadowColor = palette.glow;
    ctx.fillStyle = palette.inner;
    ctx.globalAlpha = 0.32 + Math.sin(time * 7) * 0.1;
    ctx.fillRect(edgeX - (side === -1 ? 2 : 0), y + 2, 2, h - 4);
    ctx.globalAlpha = 1;
  }

  // --- lightning for very_scarce — horizontal bolts sweeping top→bottom (only on large active cards)
  if (isPurple && !isSmall) {
    ctx.save();
    // horizontal lightning that travels top→bottom
    for (let b = 0; b < 2; b++) {
      const sweepT = (time * 0.55 + b * 0.42) % 1; // 0 top, 1 bottom
      const boltY = y + h * (0.20 + sweepT * 0.58) + Math.sin(time * 9 + b) * 2;
      const flicker = Math.sin(time * 26 + b * 4) > 0.15;
      const alpha = flicker ? 0.92 : 0.22;
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = b === 0 ? "#ffffff" : "#c8a6ff";
      ctx.lineWidth = b === 0 ? 1.7 : 1.0;
      ctx.shadowBlur = b === 0 ? 14 : 8;
      ctx.shadowColor = b === 0 ? "rgba(255,255,255,0.95)" : "rgba(180,90,255,0.85)";
      ctx.beginPath();
      let cx = x + 4;
      let cy = boltY;
      ctx.moveTo(cx, cy);
      for (let s = 0; s < 6; s++) {
        const nx = cx + w * 0.16 + (Math.random() - 0.5) * 4;
        const ny = cy + (Math.random() - 0.5) * h * 0.07 + Math.sin(time * 14 + s + b) * 1.2;
        ctx.lineTo(nx, ny);
        cx = nx; cy = ny;
        if (cx > x + w - 4) break;
      }
      ctx.stroke();
      ctx.globalAlpha = alpha * 0.42;
      ctx.lineWidth += 2.8;
      ctx.stroke();
      ctx.globalAlpha = alpha;
    }
    // small branching sparks
    const sparkFlicker = Math.sin(time * 24) > 0.2;
    ctx.globalAlpha = sparkFlicker ? 0.85 : 0.25;
    for (let i = 0; i < 3; i++) {
      const px = x + w * (0.18 + Math.random() * 0.64);
      const py = y + h * (0.28 + Math.random() * 0.48);
      ctx.fillStyle = i % 2 === 0 ? "#ffffff" : "#e0b0ff";
      ctx.shadowBlur = 8;
      ctx.shadowColor = "#a020ff";
      ctx.beginPath();
      // star spark
      const sz = 1.2 + Math.random() * 1.4;
      ctx.moveTo(px, py - sz);
      ctx.lineTo(px + sz * 0.3, py - sz * 0.3);
      ctx.lineTo(px + sz, py);
      ctx.lineTo(px + sz * 0.3, py + sz * 0.3);
      ctx.lineTo(px, py + sz);
      ctx.lineTo(px - sz * 0.3, py + sz * 0.3);
      ctx.lineTo(px - sz, py);
      ctx.lineTo(px - sz * 0.3, py - sz * 0.3);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  ctx.restore();
}

function drawVeryScarceLightning(ctx, x, y, w, h, time) {
  const isSmall = w < 72;
  if (isSmall) return;
  ctx.save();
  for (let b = 0; b < 2; b++) {
    const sweepT = (time * 0.55 + b * 0.42) % 1;
    const boltY = y + h * (0.20 + sweepT * 0.58) + Math.sin(time * 9 + b) * 2;
    const flicker = Math.sin(time * 26 + b * 4) > 0.15;
    const alpha = flicker ? 0.92 : 0.22;
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = b === 0 ? "#ffffff" : "#c8a6ff";
    ctx.lineWidth = b === 0 ? 1.7 : 1.0;
    ctx.shadowBlur = b === 0 ? 14 : 8;
    ctx.shadowColor = b === 0 ? "rgba(255,255,255,0.95)" : "rgba(180,90,255,0.85)";
    ctx.beginPath();
    let cx = x + 4;
    let cy = boltY;
    ctx.moveTo(cx, cy);
    for (let s = 0; s < 6; s++) {
      const nx = cx + w * 0.16 + (Math.random() - 0.5) * 4;
      const ny = cy + (Math.random() - 0.5) * h * 0.07 + Math.sin(time * 14 + s + b) * 1.2;
      ctx.lineTo(nx, ny);
      cx = nx; cy = ny;
      if (cx > x + w - 4) break;
    }
    ctx.stroke();
    ctx.globalAlpha = alpha * 0.42;
    ctx.lineWidth += 2.8;
    ctx.stroke();
    ctx.globalAlpha = alpha;
  }
  const sparkFlicker = Math.sin(time * 24) > 0.2;
  ctx.globalAlpha = sparkFlicker ? 0.85 : 0.25;
  for (let i = 0; i < 3; i++) {
    const px = x + w * (0.18 + Math.random() * 0.64);
    const py = y + h * (0.28 + Math.random() * 0.48);
    ctx.fillStyle = i % 2 === 0 ? "#ffffff" : "#e0b0ff";
    ctx.shadowBlur = 8;
    ctx.shadowColor = "#a020ff";
    ctx.beginPath();
    const sz = 1.2 + Math.random() * 1.4;
    ctx.moveTo(px, py - sz);
    ctx.lineTo(px + sz * 0.3, py - sz * 0.3);
    ctx.lineTo(px + sz, py);
    ctx.lineTo(px + sz * 0.3, py + sz * 0.3);
    ctx.lineTo(px, py + sz);
    ctx.lineTo(px - sz * 0.3, py + sz * 0.3);
    ctx.lineTo(px - sz, py);
    ctx.lineTo(px - sz * 0.3, py - sz * 0.3);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function drawScarceRisingFlames(ctx, x, y, w, h, time) {
  const isSmall = w < 72;
  const count = isSmall ? 5 : 8; // heavier: more particles
  ctx.save();
  // heavy aura building around card — soft outer glow
  ctx.shadowBlur = isSmall ? 18 : 26;
  ctx.shadowColor = "rgba(255,110,0,0.55)";
  const auraGrad = ctx.createRadialGradient(x + w * 0.5, y + h * 0.55, Math.min(w, h) * 0.38, x + w * 0.5, y + h * 0.55, Math.max(w, h) * 0.85);
  auraGrad.addColorStop(0, "rgba(255,90,0,0.0)");
  auraGrad.addColorStop(0.35, "rgba(255,110,0,0.14)");
  auraGrad.addColorStop(0.65, "rgba(255,70,0,0.09)");
  auraGrad.addColorStop(1, "rgba(120,20,0,0)");
  ctx.fillStyle = auraGrad;
  ctx.globalAlpha = 0.9 + Math.sin(time * 2.5) * 0.08;
  ctx.fillRect(x - 10, y - 10, w + 20, h + 20);
  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;

  for (let i = 0; i < count; i++) {
    const speed = 0.82 + (i % 3) * 0.14;
    const offset = i * 0.16;
    const p = (time * speed + offset) % 1; // 0 bottom, 1 top
    const px = x + w * (0.14 + (i % 4) * 0.19 + Math.sin(time * 1.8 + i) * 0.03) + Math.sin(time * 3.5 + i * 1.7) * 2.5;
    const py = y + h * (0.92 - p * 0.82) + Math.sin(time * 5 + i) * 1.2;
    const life = 1 - p; // fade as it rises
    const alpha = life * (0.88 + Math.sin(time * 7 + i) * 0.12);
    const size = (isSmall ? 5.0 : 7.2) * (0.65 + life * 0.75) + Math.sin(time * 9 + i) * 0.7;
    // outer flame teardrop — heavier
    ctx.shadowBlur = isSmall ? 11 : 16;
    ctx.shadowColor = "rgba(255,90,0,0.90)";
    const grad = ctx.createRadialGradient(px - size * 0.2, py - size * 0.15, size * 0.15, px, py, size);
    grad.addColorStop(0, `rgba(255,255,220,${alpha})`);
    grad.addColorStop(0.28, `rgba(255,210,80,${alpha * 0.9})`);
    grad.addColorStop(0.55, `rgba(255,120,20,${alpha * 0.75})`);
    grad.addColorStop(0.85, `rgba(180,20,0,${alpha * 0.35})`);
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    // teardrop shape pointing up
    const tipY = py - size * 0.85;
    const baseY = py + size * 0.45;
    ctx.moveTo(px, tipY);
    ctx.bezierCurveTo(px + size * 0.55, py - size * 0.2, px + size * 0.5, baseY, px, baseY);
    ctx.bezierCurveTo(px - size * 0.5, baseY, px - size * 0.55, py - size * 0.2, px, tipY);
    ctx.closePath();
    ctx.fill();
    // inner bright core — heavier
    ctx.shadowBlur = 8;
    ctx.shadowColor = "rgba(255,220,120,0.95)";
    ctx.fillStyle = `rgba(255,255,255,${alpha * 0.85})`;
    ctx.beginPath();
    ctx.ellipse(px, py - size * 0.12, size * 0.22, size * 0.32, 0, 0, Math.PI * 2);
    ctx.fill();
    // tiny ember trail below
    if (p < 0.7) {
      ctx.fillStyle = `rgba(255,180,60,${alpha * 0.45})`;
      ctx.shadowBlur = 4;
      ctx.shadowColor = "rgba(255,120,0,0.7)";
      ctx.beginPath();
      ctx.arc(px + Math.sin(time * 5 + i) * 1.2, py + size * 0.35, size * 0.18, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  // heavier bottom aura base — dense fire bed
  ctx.shadowBlur = 18;
  ctx.shadowColor = "rgba(255,90,0,0.65)";
  ctx.fillStyle = `rgba(255,110,0,${0.32 + Math.sin(time * 4) * 0.06})`;
  ctx.fillRect(x + 1, y + h - 3, w - 2, 4);
  // second inner hot line
  ctx.shadowBlur = 10;
  ctx.shadowColor = "rgba(255,200,60,0.85)";
  ctx.fillStyle = "rgba(255,220,120,0.42)";
  ctx.fillRect(x + 4, y + h - 2, w - 8, 1.5);
  ctx.restore();
}

// --- Trace Royale: precious ornate gold ---
function drawTraceRoyale(ctx, x, y, w, h, radius, time) {
  ctx.save();

  // outer luxurious golden aura
  const pulse = Math.sin(time * 2.2) * 0.15 + 0.85;
  ctx.shadowBlur = 22 * pulse;
  ctx.shadowColor = "rgba(255, 215, 0, 0.95)";
  const goldGrad = ctx.createLinearGradient(x, y, x + w, y + h);
  goldGrad.addColorStop(0, "#fff8dc");
  goldGrad.addColorStop(0.25, "#ffd700");
  goldGrad.addColorStop(0.5, "#ffb300");
  goldGrad.addColorStop(0.75, "#ff8c00");
  goldGrad.addColorStop(1, "#fff2a8");
  ctx.strokeStyle = goldGrad;
  ctx.lineWidth = 5 + Math.sin(time * 3) * 0.8;
  ctx.beginPath();
  ctx.roundRect(x - 4, y - 4, w + 8, h + 8, radius + 4);
  ctx.stroke();

  // inner thin diamond white edge
  ctx.shadowBlur = 0;
  ctx.strokeStyle = "rgba(255,255,255,0.95)";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.roundRect(x - 1.5, y - 1.5, w + 3, h + 3, radius + 1);
  ctx.stroke();

  // ornate corner jewels + brackets (more elaborate than synthetic)
  const cornerSize = w * 0.18;
  const offset = 6;
  const corners = [
    { sx: x - offset, sy: y - offset, dx: 1, dy: 1 },
    { sx: x + w + offset, sy: y - offset, dx: -1, dy: 1 },
    { sx: x - offset, sy: y + h + offset, dx: 1, dy: -1 },
    { sx: x + w + offset, sy: y + h + offset, dx: -1, dy: -1 }
  ];

  corners.forEach((c, idx) => {
    // gold bracket
    ctx.strokeStyle = "#ffd700";
    ctx.lineWidth = 2.2;
    ctx.shadowBlur = 8;
    ctx.shadowColor = "rgba(255,215,0,0.7)";
    ctx.beginPath();
    ctx.moveTo(c.sx, c.sy + cornerSize * c.dy);
    ctx.lineTo(c.sx, c.sy);
    ctx.lineTo(c.sx + cornerSize * c.dx, c.sy);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // filigree small L
    ctx.strokeStyle = "rgba(255,255,255,0.7)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(c.sx + cornerSize * 0.55 * c.dx, c.sy);
    ctx.lineTo(c.sx + cornerSize * 0.55 * c.dx, c.sy + cornerSize * 0.18 * c.dy);
    ctx.moveTo(c.sx, c.sy + cornerSize * 0.55 * c.dy);
    ctx.lineTo(c.sx + cornerSize * 0.18 * c.dx, c.sy + cornerSize * 0.55 * c.dy);
    ctx.stroke();

    // diamond jewel
    const jx = c.sx;
    const jy = c.sy;
    const jewelGrad = ctx.createRadialGradient(jx, jy, 1, jx, jy, 7);
    jewelGrad.addColorStop(0, "#ffffff");
    jewelGrad.addColorStop(0.35, "#ffd700");
    jewelGrad.addColorStop(1, "#ff8c00");
    ctx.fillStyle = jewelGrad;
    ctx.beginPath();
    // diamond shape (rotated square)
    ctx.moveTo(jx, jy - 6);
    ctx.lineTo(jx + 6, jy);
    ctx.lineTo(jx, jy + 6);
    ctx.lineTo(jx - 6, jy);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.9)";
    ctx.lineWidth = 1;
    ctx.stroke();
  });

  // top crown (royale)
  const crownX = x + w / 2;
  const crownY = y - 10;
  const crownW = w * 0.38;
  const crownH = 14 + Math.sin(time * 2) * 1;
  ctx.shadowBlur = 10;
  ctx.shadowColor = "rgba(255,215,0,0.9)";
  ctx.fillStyle = "#ffd700";
  ctx.strokeStyle = "#fff8dc";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(crownX - crownW / 2, crownY + crownH * 0.5);
  ctx.lineTo(crownX - crownW * 0.28, crownY - crownH * 0.5);
  ctx.lineTo(crownX - crownW * 0.08, crownY + crownH * 0.15);
  ctx.lineTo(crownX, crownY - crownH * 0.65);
  ctx.lineTo(crownX + crownW * 0.08, crownY + crownH * 0.15);
  ctx.lineTo(crownX + crownW * 0.28, crownY - crownH * 0.5);
  ctx.lineTo(crownX + crownW / 2, crownY + crownH * 0.5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // crown jewels
  const jewelX = [crownX, crownX - crownW * 0.28, crownX + crownW * 0.28];
  jewelX.forEach((jx, i) => {
    const jy = i === 0 ? crownY - crownH * 0.45 : crownY - crownH * 0.32;
    const jGrad = ctx.createRadialGradient(jx, jy, 0, jx, jy, 4);
    jGrad.addColorStop(0, "#fff");
    jGrad.addColorStop(0.4, i === 0 ? "#ff0040" : "#00e5ff");
    jGrad.addColorStop(1, "#7a0000");
    ctx.fillStyle = jGrad;
    ctx.beginPath();
    ctx.arc(jx, jy, 3.2, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.shadowBlur = 0;

  // horizontal filigree divider lines (precious)
  ctx.strokeStyle = "rgba(255,215,0,0.45)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  // top filigree
  ctx.moveTo(x + w * 0.12, y + h * 0.18);
  ctx.bezierCurveTo(x + w * 0.30, y + h * 0.16, x + w * 0.70, y + h * 0.16, x + w * 0.88, y + h * 0.18);
  // bottom filigree
  ctx.moveTo(x + w * 0.12, y + h * 0.82);
  ctx.bezierCurveTo(x + w * 0.30, y + h * 0.84, x + w * 0.70, y + h * 0.84, x + w * 0.88, y + h * 0.82);
  ctx.stroke();

  // sparkles / diamond dust
  for (let i = 0; i < 6; i++) {
    const ang = time * 1.5 + i * 1.05;
    const r = (w * 0.45 + Math.sin(time * 3 + i) * 6);
    const sx = x + w / 2 + Math.cos(ang) * r * 0.18;
    const sy = y + h / 2 + Math.sin(ang * 1.7) * h * 0.42;
    const twinkle = Math.sin(time * 6 + i * 2) * 0.5 + 0.5;
    const sz = 1.2 + twinkle * 1.8;
    const alpha = 0.4 + twinkle * 0.6;
    // star shape (4 points)
    ctx.fillStyle = `rgba(255,255,255,${alpha})`;
    ctx.shadowBlur = 6;
    ctx.shadowColor = "#ffd700";
    ctx.beginPath();
    ctx.moveTo(sx, sy - sz);
    ctx.lineTo(sx + sz * 0.3, sy - sz * 0.3);
    ctx.lineTo(sx + sz, sy);
    ctx.lineTo(sx + sz * 0.3, sy + sz * 0.3);
    ctx.lineTo(sx, sy + sz);
    ctx.lineTo(sx - sz * 0.3, sy + sz * 0.3);
    ctx.lineTo(sx - sz, sy);
    ctx.lineTo(sx - sz * 0.3, sy - sz * 0.3);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // shimmer sweep stronger for royale
  ctx.globalCompositeOperation = "lighter";
  const sweep = ((time * 0.7) % 1);
  const sx = x - w + sweep * w * 2.8;
  const sheen = ctx.createLinearGradient(sx, y, sx + w * 0.45, y + h);
  sheen.addColorStop(0, "rgba(255,255,255,0)");
  sheen.addColorStop(0.5, "rgba(255,255,255,0.28)");
  sheen.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = sheen;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, radius);
  ctx.fill();
  ctx.globalCompositeOperation = "source-over";

  ctx.restore();
}

export default function card(ctx, info, bg = false) {
  const { x, y, w, h, element, time, dissolveProgress = 0, currentHp, maxHp } = info
  const rarity = rarityConfig[element.rarity] || rarityConfig.abundant

  ctx.save()

  // Dissolve Clipping
  if (dissolveProgress > 0) {
    const intactHeight = h * (1 - dissolveProgress)
    ctx.beginPath()
    ctx.rect(x - 20, y - 20, w + 40, intactHeight + 20)
    ctx.clip()
  }

  // FACEDOWN CARD BACK (For Opponent Hidden Cards)
  if (info.facedown) {
    const bgGrad = ctx.createLinearGradient(x, y, x + w, y + h)
    bgGrad.addColorStop(0, "#0c1829")
    bgGrad.addColorStop(1, "#182a45")
    ctx.fillStyle = bgGrad
    ctx.beginPath()
    ctx.roundRect(x, y, w, h, rarity.radius || 6)
    ctx.fill()

    ctx.strokeStyle = "#ffaa00"
    ctx.lineWidth = 1.5
    ctx.shadowBlur = 8
    ctx.shadowColor = "rgba(255, 170, 0, 0.6)"
    ctx.stroke()

    ctx.strokeStyle = "rgba(255, 170, 0, 0.25)"
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(x + w * 0.15, y + h * 0.15)
    ctx.lineTo(x + w * 0.85, y + h * 0.85)
    ctx.moveTo(x + w * 0.85, y + h * 0.15)
    ctx.lineTo(x + w * 0.15, y + h * 0.85)
    ctx.roundRect(x + w * 0.2, y + h * 0.2, w * 0.6, h * 0.6, 4)
    ctx.stroke()

    ctx.fillStyle = "#ffaa00"
    ctx.font = `bold ${w * 0.35}px sans-serif`
    ctx.textAlign = "center"
    ctx.shadowBlur = 10
    ctx.shadowColor = "#ffaa00"
    ctx.fillText("?", x + w / 2, y + h / 2 + w * 0.12)

    ctx.restore()
    return
  }

  // Card Background
  const gradient = ctx.createLinearGradient(x, y, x + w, y + h)
  gradient.addColorStop(0, rarity.color)
  gradient.addColorStop(1, rarity.secondary)

  // subtle glow for non-wing rarities
  if (rarity.effect === "none") {
    ctx.shadowBlur = 0
  } else if (rarity.effect === "gradientBorder") {
    ctx.shadowBlur = 10 + Math.sin(time * 4) * 4
    ctx.shadowColor = "rgba(240,0,80,0.6)"
  } else if (rarity.effect === "royale") {
    ctx.shadowBlur = 14 + Math.sin(time * 2.5) * 5
    ctx.shadowColor = "rgba(255,215,0,0.7)"
  }

  ctx.fillStyle = gradient
  ctx.globalAlpha = bg ? 0.22 : (1 - dissolveProgress * 0.5)
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, rarity.radius)
  ctx.fill()

  ctx.shadowBlur = 0
  ctx.globalAlpha = 1

  // POST-EFFECTS: borders & ornate overlays
  if (!bg) {
    if (rarity.effect === "gradientBorder") {
      drawSyntheticGradientBorder(ctx, x, y, w, h, rarity.radius, time)
    } else if (rarity.effect === "royale") {
      drawTraceRoyale(ctx, x, y, w, h, rarity.radius, time)
    } else if (rarity.effect === "none" && !bg) {
      // faint clean border for common cards (now also scarce/very_scarce plain)
      if (["abundant","common","moderate","scarce","very_scarce"].includes(element.rarity)) {
        ctx.strokeStyle = "rgba(255,255,255,0.18)"
        ctx.lineWidth = 1.2
        ctx.beginPath()
        ctx.roundRect(x, y, w, h, rarity.radius)
        ctx.stroke()
      }
    }
  }
  // very_scarce lightning (kept even though spikes removed)
  if (!bg && element.rarity === "very_scarce") {
    drawVeryScarceLightning(ctx, x, y, w, h, time);
  }
  // scarce — raising flame particles bottom→top
  if (!bg && element.rarity === "scarce") {
    drawScarceRisingFlames(ctx, x, y, w, h, time);
  }
  // moderate — corner frames similar to synthetic but only corners
  if (!bg && element.rarity === "moderate") {
    drawModerateCornerFrame(ctx, x, y, w, h, rarity.radius, time);
  }

  // subtle shimmer for moderate+ (but not synthetic/royale which already have sweep)
  if (!bg && ["moderate"].includes(element.rarity)) {
    ctx.globalCompositeOperation = "lighter"
    const sweep = ((time * 0.45) % 1)
    const sx = x - w + sweep * w * 2.2
    const sheen = ctx.createLinearGradient(sx, y, sx + w * 0.35, y)
    sheen.addColorStop(0, "rgba(255,255,255,0)")
    sheen.addColorStop(0.5, "rgba(255,255,255,0.10)")
    sheen.addColorStop(1, "rgba(255,255,255,0)")
    ctx.fillStyle = sheen
    ctx.beginPath()
    ctx.roundRect(x, y, w, h, rarity.radius)
    ctx.fill()
    ctx.globalCompositeOperation = "source-over"
  }

  // INFO: Symbol Square (Element ID box)
  const sqMargin = w * 0.1
  const sqW = w - (sqMargin * 2)
  const sqH = h * 0.3
  const sqX = x + sqMargin
  const sqY = y + Math.max(22, h * 0.25)

  ctx.fillStyle = "rgba(10, 10, 10, 0.5)"
  ctx.beginPath()
  ctx.roundRect(sqX, sqY, sqW, sqH, 5)
  ctx.fill()

  ctx.save()
  ctx.shadowBlur = 5
  ctx.shadowColor = "rgba(10, 10, 10, 0.6)"
  ctx.strokeStyle = rarity.text
  ctx.lineWidth = 2
  ctx.stroke()
  ctx.restore()

  ctx.save()
  ctx.shadowBlur = 4
  ctx.shadowColor = "rgba(0, 0, 0, 0.8)"
  ctx.shadowOffsetX = 1
  ctx.shadowOffsetY = 1

  ctx.fillStyle = rarity.text
  ctx.font = `bold ${Math.max(12, Math.round(w * 0.28))}px sans-serif`
  ctx.textAlign = "center"
  ctx.fillText(element.id, x + w / 2, sqY + sqH * 0.72)

  const nameFontSize = Math.max(9, Math.round(w * 0.10))
  ctx.font = `bold ${nameFontSize}px sans-serif`
  ctx.fillStyle = rarity.text
  const nameY = sqY + sqH + (y + h - (sqY + sqH)) * 0.55
  ctx.fillText(element.name, x + w / 2, nameY)

  if (!bg) {
    const level = element.level || 1;
    const calculatedMaxHp = maxHp !== undefined ? maxHp : hpComputation(level, element.hp);

    const headerFontSize = Math.max(10, Math.round(w * 0.095));
    const headerY = y + Math.max(13, h * 0.16);
    const headerPad = Math.max(5, Math.round(w * 0.06));

    ctx.font = `bold ${headerFontSize}px sans-serif`
    ctx.textAlign = "left"
    ctx.fillStyle = "#ffaa00"
    ctx.fillText(`Lv.${level}`, x + headerPad, headerY)

    ctx.font = `bold ${headerFontSize}px sans-serif`
    ctx.textAlign = "right"
    ctx.fillStyle = rarity.text
    const displayHp = currentHp !== undefined ? `${currentHp}/${calculatedMaxHp}` : `HP ${calculatedMaxHp}`
    ctx.fillText(displayHp, x + w - headerPad, headerY)
  }

  ctx.restore()
  ctx.restore() // dissolve clip

  // Render Dissolve Burning Seam & Ash Embers
  if (dissolveProgress > 0 && dissolveProgress < 1) {
    const lineY = y + h * (1 - dissolveProgress)

    ctx.save()
    ctx.beginPath()
    ctx.moveTo(x - 5, lineY)
    for (let px = x - 5; px <= x + w + 5; px += 8) {
      const ny = lineY + Math.sin(px * 0.2 + time * 15) * 3
      ctx.lineTo(px, ny)
    }
    ctx.lineWidth = 3
    ctx.strokeStyle = dissolveProgress > 0.5 ? "#ff3300" : "#00ffff"
    ctx.shadowColor = dissolveProgress > 0.5 ? "#ff8800" : "#00f2ff"
    ctx.shadowBlur = 12
    ctx.stroke()

    const pCount = 12
    for (let i = 0; i < pCount; i++) {
      const px = x + Math.random() * w
      const py = lineY + (Math.random() - 0.5) * 15
      const pSize = 1.5 + Math.random() * 3
      const alpha = (1 - dissolveProgress) * Math.random()
      ctx.fillStyle = i % 2 === 0 ? `rgba(0, 242, 255, ${alpha})` : `rgba(255, 120, 30, ${alpha})`
      ctx.beginPath()
      ctx.arc(px, py - Math.random() * 25 * dissolveProgress, pSize, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.restore()
  }
}
