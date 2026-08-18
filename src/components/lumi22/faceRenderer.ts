import * as THREE from 'three';
import { SoulEmotion } from './types';

// Helper to draw a procedural heart path
function drawHeart(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, color: string) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  const topCurveHeight = size * 0.3;
  ctx.moveTo(cx, cy + topCurveHeight);
  // top left curve
  ctx.bezierCurveTo(
    cx,
    cy,
    cx - size / 2,
    cy,
    cx - size / 2,
    cy + topCurveHeight
  );
  // bottom left curve
  ctx.bezierCurveTo(
    cx - size / 2,
    cy + (size + topCurveHeight) / 2,
    cx,
    cy + (size + topCurveHeight) / 1.5,
    cx,
    cy + size
  );
  // bottom right curve
  ctx.bezierCurveTo(
    cx,
    cy + (size + topCurveHeight) / 1.5,
    cx + size / 2,
    cy + (size + topCurveHeight) / 2,
    cx + size / 2,
    cy + topCurveHeight
  );
  // top right curve
  ctx.bezierCurveTo(
    cx + size / 2,
    cy,
    cx,
    cy,
    cx,
    cy + topCurveHeight
  );
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// Helper to draw a sparkle 4-point star
function drawSparkle(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, color: string) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const radius = i % 2 === 0 ? r : r * 0.3;
    const angle = (i * Math.PI) / 4;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// Draw realistic anime anime teardrop
function drawTeardrop(ctx: CanvasRenderingContext2D, cx: number, cy: number, width: number, height: number) {
  ctx.save();
  const grad = ctx.createLinearGradient(cx, cy, cx, cy + height);
  grad.addColorStop(0, 'rgba(186, 230, 253, 0.95)');
  grad.addColorStop(0.5, 'rgba(56, 189, 248, 0.85)');
  grad.addColorStop(1, 'rgba(14, 165, 233, 0.95)');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.bezierCurveTo(cx - width, cy + height * 0.6, cx - width * 0.8, cy + height, cx, cy + height);
  ctx.bezierCurveTo(cx + width * 0.8, cy + height, cx + width, cy + height * 0.6, cx, cy);
  ctx.closePath();
  ctx.fill();

  // White specular glint inside tear
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.beginPath();
  ctx.ellipse(cx - width * 0.25, cy + height * 0.65, width * 0.25, height * 0.18, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// Main 512x512 Face Render Function
export function renderFaceToCanvas(canvas: HTMLCanvasElement, emotion: SoulEmotion): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const w = 512;
  const h = 512;
  ctx.clearRect(0, 0, w, h);

  // Center coordinate benchmarks
  const eyeLeftX = 175;
  const eyeRightX = 337;
  const eyeY = 248;
  const eyeRadiusX = 42;
  const eyeRadiusY = 52;

  // 1. BLUSH (Glowing soft airbrushed cheeks)
  const drawBlush = (opacity = 0.65, color = 'rgba(251, 113, 133,', heartCheeks = false) => {
    ctx.save();
    // Left cheek
    const gLeft = ctx.createRadialGradient(130, 310, 5, 130, 310, 48);
    gLeft.addColorStop(0, `${color} ${opacity})`);
    gLeft.addColorStop(0.6, `${color} ${opacity * 0.4})`);
    gLeft.addColorStop(1, `${color} 0)`);
    ctx.fillStyle = gLeft;
    ctx.beginPath();
    ctx.ellipse(130, 310, 52, 28, 0, 0, Math.PI * 2);
    ctx.fill();

    // Right cheek
    const gRight = ctx.createRadialGradient(382, 310, 5, 382, 310, 48);
    gRight.addColorStop(0, `${color} ${opacity})`);
    gRight.addColorStop(0.6, `${color} ${opacity * 0.4})`);
    gRight.addColorStop(1, `${color} 0)`);
    ctx.fillStyle = gRight;
    ctx.beginPath();
    ctx.ellipse(382, 310, 52, 28, 0, 0, Math.PI * 2);
    ctx.fill();

    if (heartCheeks) {
      drawHeart(ctx, 130, 296, 18, '#fb7185');
      drawHeart(ctx, 382, 296, 18, '#fb7185');
    }
    ctx.restore();
  };

  // 2. EYEBROWS
  const drawEyebrows = (type: 'happy' | 'angry' | 'sad' | 'curious' | 'neutral' | 'sleepy') => {
    ctx.save();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';

    if (type === 'happy') {
      // Gentle soft arched brows
      ctx.beginPath();
      ctx.arc(eyeLeftX, 172, 42, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(eyeRightX, 172, 42, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();
    } else if (type === 'angry') {
      // Fierce furrowed brows
      ctx.beginPath();
      ctx.moveTo(eyeLeftX - 38, 162);
      ctx.lineTo(eyeLeftX + 32, 192);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(eyeRightX + 38, 162);
      ctx.lineTo(eyeRightX - 32, 192);
      ctx.stroke();
    } else if (type === 'sad') {
      // Drooping sad brows
      ctx.beginPath();
      ctx.moveTo(eyeLeftX - 34, 186);
      ctx.lineTo(eyeLeftX + 30, 164);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(eyeRightX + 34, 186);
      ctx.lineTo(eyeRightX - 30, 164);
      ctx.stroke();
    } else if (type === 'curious') {
      // One high brow, one low
      ctx.beginPath();
      ctx.arc(eyeLeftX, 155, 42, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(eyeRightX - 30, 176);
      ctx.lineTo(eyeRightX + 32, 176);
      ctx.stroke();
    } else {
      // Neutral
      ctx.beginPath();
      ctx.arc(eyeLeftX, 168, 42, Math.PI * 1.18, Math.PI * 1.82);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(eyeRightX, 168, 42, Math.PI * 1.18, Math.PI * 1.82);
      ctx.stroke();
    }
    ctx.restore();
  };

  // 3. ANIME DETAILED EYE
  const drawDetailedEye = (cx: number, cy: number, irisPalette: string[], isWink = false, isHeart = false, isStar = false) => {
    if (isWink) {
      // Winking closed eye arc with cute eyelashes
      ctx.save();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 7;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(cx, cy + 6, 36, Math.PI * 1.1, Math.PI * 1.9);
      ctx.stroke();

      // Cute double eyelashes
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(cx + 30, cy + 2);
      ctx.lineTo(cx + 42, cy - 6);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + 26, cy + 10);
      ctx.lineTo(cx + 36, cy + 6);
      ctx.stroke();
      ctx.restore();
      return;
    }

    ctx.save();
    // A. Outer Eye Socket Clip (Almond/Chibi Anime Curve)
    ctx.beginPath();
    ctx.ellipse(cx, cy, eyeRadiusX, eyeRadiusY, 0, 0, Math.PI * 2);
    ctx.clip();

    // B. Eye Sclera (Very faint soft luminous off-white)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(cx - eyeRadiusX - 5, cy - eyeRadiusY - 5, (eyeRadiusX + 5) * 2, (eyeRadiusY + 5) * 2);

    // C. Multi-stop Iris Gradient
    const irisGrad = ctx.createRadialGradient(cx, cy + 12, 4, cx, cy + 8, eyeRadiusY);
    irisPalette.forEach((stop, i) => {
      irisGrad.addColorStop(i / (irisPalette.length - 1), stop);
    });

    ctx.fillStyle = irisGrad;
    ctx.beginPath();
    ctx.ellipse(cx, cy + 4, eyeRadiusX * 0.88, eyeRadiusY * 0.94, 0, 0, Math.PI * 2);
    ctx.fill();

    // D. Pupil (Deep dark center or Heart / Star)
    if (isHeart) {
      drawHeart(ctx, cx, cy - 6, 32, '#e11d48');
      drawHeart(ctx, cx, cy - 2, 18, '#ffffff');
    } else if (isStar) {
      drawSparkle(ctx, cx, cy + 4, 28, '#ffffff');
      drawSparkle(ctx, cx, cy + 4, 16, '#38bdf8');
    } else {
      // Deep dark pupil
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.ellipse(cx, cy + 4, 16, 20, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // E. Primary Large Specular Glint (Top-Right glossy highlight)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.beginPath();
    ctx.ellipse(cx + 12, cy - 14, 12, 16, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // F. Secondary Small Specular Glint (Bottom-Left light bounce)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.beginPath();
    ctx.ellipse(cx - 14, cy + 18, 6, 8, 0.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // G. Thick Upper Eyelash Eyeliner
    ctx.save();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(cx, cy - 4, eyeRadiusX, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();

    // Small upper-outer flick
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(cx + eyeRadiusX * 0.85, cy - 16);
    ctx.lineTo(cx + eyeRadiusX * 1.15, cy - 24);
    ctx.stroke();
    ctx.restore();
  };

  // 4. HAPPY CRESCENT EYES (^ ^)
  const drawCrescentEyes = (cx: number, cy: number) => {
    ctx.save();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(cx, cy + 12, 34, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();

    // Eyelash flicks
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(cx + 28, cy - 2);
    ctx.lineTo(cx + 38, cy - 10);
    ctx.stroke();
    ctx.restore();
  };

  // 5. MOUTHS
  const drawMouth = (style: 'smile' | 'laugh' | 'love' | 'cat' | 'open' | 'gentle' | 'o' | 'cry' | 'angry' | 'sad') => {
    ctx.save();
    const mx = 256;
    const my = 352;

    if (style === 'laugh' || style === 'open') {
      // Big happy open mouth with cute tongue
      ctx.beginPath();
      ctx.arc(mx, my - 6, 26, 0.1, Math.PI - 0.1);
      ctx.closePath();
      ctx.fillStyle = '#dc2626';
      ctx.fill();
      ctx.lineWidth = 5;
      ctx.strokeStyle = '#0f172a';
      ctx.stroke();

      // Tongue
      ctx.save();
      ctx.clip();
      ctx.fillStyle = '#fb7185';
      ctx.beginPath();
      ctx.arc(mx, my + 14, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else if (style === 'cat' || style === 'love') {
      // Adorable Cat mouth :3
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(mx - 12, my, 12, 0.1, Math.PI - 0.1);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(mx + 12, my, 12, 0.1, Math.PI - 0.1);
      ctx.stroke();
    } else if (style === 'o') {
      // Surprised small 'o'
      ctx.fillStyle = '#e11d48';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.ellipse(mx, my + 4, 12, 16, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else if (style === 'cry') {
      // Quivering sad/crying mouth
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(mx - 22, my + 6);
      ctx.quadraticCurveTo(mx - 8, my - 8, mx, my + 2);
      ctx.quadraticCurveTo(mx + 8, my - 8, mx + 22, my + 6);
      ctx.stroke();
    } else if (style === 'angry') {
      // Angry downturned pout
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(mx, my + 18, 22, Math.PI * 1.25, Math.PI * 1.75);
      ctx.stroke();
    } else if (style === 'sad') {
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(mx, my + 14, 20, Math.PI * 1.2, Math.PI * 1.8);
      ctx.stroke();
    } else {
      // Standard sweet smile
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(mx, my - 8, 24, Math.PI * 0.15, Math.PI * 0.85);
      ctx.stroke();
    }
    ctx.restore();
  };

  // Color Palettes for Irises
  const PALETTE_CYAN = ['#ffffff', '#67e8f9', '#06b6d4', '#0284c7', '#0f172a'];
  const PALETTE_LOVE = ['#ffffff', '#fbcfe8', '#f43f5e', '#be123c', '#4c0519'];
  const PALETTE_SAD = ['#ffffff', '#bae6fd', '#38bdf8', '#2563eb', '#1e1b4b'];
  const PALETTE_ANGRY = ['#ffffff', '#fde047', '#f97316', '#dc2626', '#450a0a'];
  const PALETTE_STARRY = ['#ffffff', '#99f6e4', '#2dd4bf', '#0f766e', '#042f2e'];
  const PALETTE_GENTLE = ['#ffffff', '#e9d5ff', '#a855f7', '#7e22ce', '#3b0764'];

  // ==========================================
  // 16 EMOTIONAL RENDER STATES
  // ==========================================
  switch (emotion) {
    case 'blinking':
      drawBlush(0.5);
      drawEyebrows('neutral');
      drawDetailedEye(eyeLeftX, eyeY, PALETTE_CYAN, true);
      drawDetailedEye(eyeRightX, eyeY, PALETTE_CYAN, true);
      drawMouth('gentle');
      break;

    case 'inlove':
      drawBlush(0.85, 'rgba(244, 63, 94,', true);
      drawEyebrows('happy');
      drawDetailedEye(eyeLeftX, eyeY, PALETTE_LOVE, false, true);
      drawDetailedEye(eyeRightX, eyeY, PALETTE_LOVE, false, true);
      drawMouth('love');
      break;

    case 'heart-eyes':
      drawBlush(0.9, 'rgba(244, 63, 94,', true);
      drawEyebrows('happy');
      drawDetailedEye(eyeLeftX, eyeY, PALETTE_LOVE, false, true);
      drawDetailedEye(eyeRightX, eyeY, PALETTE_LOVE, false, true);
      drawMouth('laugh');
      break;

    case 'laugh':
      drawBlush(0.85);
      drawEyebrows('happy');
      drawCrescentEyes(eyeLeftX, eyeY);
      drawCrescentEyes(eyeRightX, eyeY);
      drawMouth('laugh');
      drawSparkle(ctx, eyeLeftX - 32, eyeY - 20, 14, '#fef08a');
      drawSparkle(ctx, eyeRightX + 32, eyeY - 20, 14, '#fef08a');
      break;

    case 'giggle':
      drawBlush(0.85, 'rgba(251, 113, 133,');
      drawEyebrows('happy');
      drawCrescentEyes(eyeLeftX, eyeY + 4);
      drawDetailedEye(eyeRightX, eyeY, PALETTE_LOVE, true);
      drawMouth('cat');
      drawSparkle(ctx, eyeRightX + 28, eyeY - 14, 12, '#fb7185');
      break;

    case 'winking':
      drawBlush(0.7);
      drawEyebrows('happy');
      drawDetailedEye(eyeLeftX, eyeY, PALETTE_CYAN, false);
      drawDetailedEye(eyeRightX, eyeY, PALETTE_CYAN, true);
      drawMouth('cat');
      break;

    case 'excited':
      drawBlush(0.75);
      drawEyebrows('happy');
      drawDetailedEye(eyeLeftX, eyeY, PALETTE_STARRY, false, false, true);
      drawDetailedEye(eyeRightX, eyeY, PALETTE_STARRY, false, false, true);
      drawMouth('open');
      break;

    case 'cry':
      drawBlush(0.65, 'rgba(147, 197, 253,');
      drawEyebrows('sad');
      drawDetailedEye(eyeLeftX, eyeY, PALETTE_SAD);
      drawDetailedEye(eyeRightX, eyeY, PALETTE_SAD);
      drawMouth('cry');
      // Anime teardrops rolling down
      drawTeardrop(ctx, eyeLeftX + 16, eyeY + 48, 14, 42);
      drawTeardrop(ctx, eyeRightX - 16, eyeY + 52, 14, 46);
      break;

    case 'emotional':
      drawBlush(0.75, 'rgba(244, 114, 182,');
      drawEyebrows('sad');
      drawDetailedEye(eyeLeftX, eyeY, PALETTE_SAD);
      drawDetailedEye(eyeRightX, eyeY, PALETTE_SAD);
      drawMouth('gentle');
      drawTeardrop(ctx, eyeRightX - 10, eyeY + 44, 10, 28);
      break;

    case 'angry':
      drawBlush(0.8, 'rgba(239, 68, 68,');
      drawEyebrows('angry');
      drawDetailedEye(eyeLeftX, eyeY, PALETTE_ANGRY);
      drawDetailedEye(eyeRightX, eyeY, PALETTE_ANGRY);
      drawMouth('angry');
      // Anger mark cross # on forehead
      ctx.save();
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(385, 140, 16, -0.4, 0.4);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(385, 140, 16, Math.PI - 0.4, Math.PI + 0.4);
      ctx.stroke();
      ctx.restore();
      break;

    case 'thinking':
      drawBlush(0.5);
      drawEyebrows('curious');
      drawDetailedEye(eyeLeftX, eyeY - 8, PALETTE_CYAN);
      drawDetailedEye(eyeRightX, eyeY - 8, PALETTE_CYAN);
      drawMouth('o');
      break;

    case 'serious':
      drawBlush(0.4);
      drawEyebrows('angry');
      drawDetailedEye(eyeLeftX, eyeY, PALETTE_CYAN);
      drawDetailedEye(eyeRightX, eyeY, PALETTE_CYAN);
      drawMouth('gentle');
      break;

    case 'sad':
      drawBlush(0.5, 'rgba(147, 197, 253,');
      drawEyebrows('sad');
      drawDetailedEye(eyeLeftX, eyeY + 6, PALETTE_SAD);
      drawDetailedEye(eyeRightX, eyeY + 6, PALETTE_SAD);
      drawMouth('sad');
      break;

    case 'surprised':
      drawBlush(0.65);
      drawEyebrows('curious');
      drawDetailedEye(eyeLeftX, eyeY, PALETTE_CYAN);
      drawDetailedEye(eyeRightX, eyeY, PALETTE_CYAN);
      drawMouth('o');
      break;

    case 'gentle':
      drawBlush(0.65, 'rgba(216, 180, 254,');
      drawEyebrows('neutral');
      drawDetailedEye(eyeLeftX, eyeY, PALETTE_GENTLE);
      drawDetailedEye(eyeRightX, eyeY, PALETTE_GENTLE);
      drawMouth('smile');
      break;

    case 'happy':
      drawBlush(0.7);
      drawEyebrows('happy');
      drawDetailedEye(eyeLeftX, eyeY, PALETTE_CYAN);
      drawDetailedEye(eyeRightX, eyeY, PALETTE_CYAN);
      drawMouth('smile');
      break;

    case 'idle':
    default:
      drawBlush(0.55);
      drawEyebrows('neutral');
      drawDetailedEye(eyeLeftX, eyeY, PALETTE_CYAN);
      drawDetailedEye(eyeRightX, eyeY, PALETTE_CYAN);
      drawMouth('smile');
      break;
  }
}

// Manager cache for CanvasTextures
export class ProceduralFaceTextureCache {
  private textures: Map<SoulEmotion, THREE.CanvasTexture> = new Map();

  public getTexture(emotion: SoulEmotion): THREE.CanvasTexture {
    if (this.textures.has(emotion)) {
      return this.textures.get(emotion)!;
    }

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    renderFaceToCanvas(canvas, emotion);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    texture.colorSpace = THREE.SRGBColorSpace;
    this.textures.set(emotion, texture);
    return texture;
  }

  public dispose(): void {
    this.textures.forEach((tex) => tex.dispose());
    this.textures.clear();
  }
}
