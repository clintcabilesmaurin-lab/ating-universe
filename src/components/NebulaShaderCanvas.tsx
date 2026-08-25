import React, { useEffect, useRef } from 'react';

interface NebulaShaderCanvasProps {
  parallaxX?: number; // -1 to 1 or pixel offset
  parallaxY?: number;
  opacity?: number;
}

// Colors for 4 diurnal time stages (normalized RGB 0.0 - 1.0)
interface DiurnalPalette {
  primary: [number, number, number];
  secondary: [number, number, number];
  accent: [number, number, number];
  deep: [number, number, number];
}

const DAWN_PALETTE: DiurnalPalette = {
  primary: [0.95, 0.45, 0.55], // Soft coral rose
  secondary: [0.75, 0.40, 0.70], // Morning violet
  accent: [0.98, 0.75, 0.45], // Golden dawn amber
  deep: [0.10, 0.05, 0.15], // Deep dawn purple
};

const DAY_PALETTE: DiurnalPalette = {
  primary: [0.25, 0.55, 0.95], // Celestial azure
  secondary: [0.70, 0.35, 0.85], // Vibrant magenta gas
  accent: [0.35, 0.85, 0.90], // Shimmering cyan star trails
  deep: [0.03, 0.08, 0.18], // Deep cosmic blue
};

const DUSK_PALETTE: DiurnalPalette = {
  primary: [0.92, 0.35, 0.35], // Crimson twilight
  secondary: [0.85, 0.45, 0.15], // Amber glow
  accent: [0.65, 0.25, 0.75], // Twilight purple
  deep: [0.12, 0.04, 0.10], // Deep dusk violet
};

const NIGHT_PALETTE: DiurnalPalette = {
  primary: [0.85, 0.25, 0.45], // Romantic rose nebula
  secondary: [0.45, 0.20, 0.75], // Deep indigo gas
  accent: [0.20, 0.75, 0.65], // Emerald-cyan stellar dust
  deep: [0.02, 0.02, 0.08], // Midnight void
};

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpColor(
  c1: [number, number, number],
  c2: [number, number, number],
  t: number
): [number, number, number] {
  return [
    lerp(c1[0], c2[0], t),
    lerp(c1[1], c2[1], t),
    lerp(c1[2], c2[2], t),
  ];
}

function getDiurnalPalette(hourProgress: number): DiurnalPalette {
  // hourProgress: 0.0 to 24.0
  // 5 - 8: Dawn
  // 8 - 17: Day
  // 17 - 20: Dusk
  // 20 - 5: Night
  let p1: DiurnalPalette;
  let p2: DiurnalPalette;
  let t = 0;

  if (hourProgress >= 5 && hourProgress < 8) {
    p1 = DAWN_PALETTE;
    p2 = DAY_PALETTE;
    t = (hourProgress - 5) / 3;
  } else if (hourProgress >= 8 && hourProgress < 17) {
    p1 = DAY_PALETTE;
    p2 = DUSK_PALETTE;
    t = (hourProgress - 8) / 9;
  } else if (hourProgress >= 17 && hourProgress < 20) {
    p1 = DUSK_PALETTE;
    p2 = NIGHT_PALETTE;
    t = (hourProgress - 17) / 3;
  } else {
    // Night to Dawn (20 to 24, or 0 to 5)
    p1 = NIGHT_PALETTE;
    p2 = DAWN_PALETTE;
    if (hourProgress >= 20) {
      t = (hourProgress - 20) / 9;
    } else {
      t = (hourProgress + 4) / 9;
    }
  }

  // Smooth ease curve for transitioning palettes
  const smoothT = t * t * (3 - 2 * t);

  return {
    primary: lerpColor(p1.primary, p2.primary, smoothT),
    secondary: lerpColor(p1.secondary, p2.secondary, smoothT),
    accent: lerpColor(p1.accent, p2.accent, smoothT),
    deep: lerpColor(p1.deep, p2.deep, smoothT),
  };
}

const VERTEX_SHADER_SRC = `
  attribute vec2 position;
  varying vec2 vUv;
  void main() {
    vUv = (position + 1.0) * 0.5;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER_SRC = `
  precision highp float;
  varying vec2 vUv;
  uniform float u_time;
  uniform vec2 u_resolution;
  uniform vec2 u_mouse;
  uniform vec3 u_col_primary;
  uniform vec3 u_col_secondary;
  uniform vec3 u_col_accent;
  uniform vec3 u_col_deep;
  uniform float u_opacity;

  // Simplex noise / fractional brownian motion functions
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                        0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                       -0.577350269189626,  // -1.0 + 2.0 * C.x
                        0.024390243902439); // 1.0 / 41.0
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
          + i.x + vec3(0.0, i1.x, 1.0 ));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m ;
    m = m*m ;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  // FBM (Fractal Brownian Motion) for volumetric gaseous clouds
  float fbm(vec2 st) {
    float v = 0.0;
    float a = 0.5;
    vec2 shift = vec2(100.0);
    mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
    for (int i = 0; i < 5; ++i) {
      v += a * snoise(st);
      st = rot * st * 2.0 + shift;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 st = (gl_FragCoord.xy * 2.0 - u_resolution) / min(u_resolution.x, u_resolution.y);
    
    // Parallax offset influence
    st += u_mouse * 0.15;

    // Slow organic time drift
    float t = u_time * 0.025;

    // Domain warping for fluid cosmic gas curls
    vec2 q = vec2(
      fbm(st + vec2(0.0, 0.0) + t * 0.3),
      fbm(st + vec2(5.2, 1.3) + t * 0.25)
    );

    vec2 r = vec2(
      fbm(st + 4.0 * q + vec2(1.7, 9.2) + 0.15 * t),
      fbm(st + 4.0 * q + vec2(8.3, 2.8) + 0.126 * t)
    );

    float f = fbm(st + 3.0 * r);

    // Multi-color nebula mixing based on gaseous density
    vec3 color = mix(u_col_deep, u_col_secondary, clamp((f*f)*4.0, 0.0, 1.0));
    color = mix(color, u_col_primary, clamp(length(q), 0.0, 1.0));
    color = mix(color, u_col_accent, clamp(length(r.x), 0.0, 1.0));

    // Radiant soft core highlight
    float core = smoothstep(0.7, 0.1, length(st * 0.6 + q * 0.4));
    color += u_col_accent * core * 0.25;

    // Vignette towards edges
    float dist = length(vUv - 0.5);
    float vignette = smoothstep(0.9, 0.2, dist);

    // Subtly blended transparency
    float alpha = clamp((f * 0.85 + core * 0.4) * vignette * u_opacity, 0.0, 1.0);

    gl_FragColor = vec4(color, alpha);
  }
`;

export const NebulaShaderCanvas: React.FC<NebulaShaderCanvasProps> = ({
  parallaxX = 0,
  parallaxY = 0,
  opacity = 0.55,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let gl: WebGLRenderingContext | null = null;
    let animFrameId: number;
    let isContextLost = false;

    try {
      gl = canvas.getContext('webgl', {
        alpha: true,
        depth: false,
        stencil: false,
        antialias: false,
        premultipliedAlpha: false,
      });
    } catch {
      gl = null;
    }

    // Fallback if WebGL is not supported
    if (!gl) {
      const ctx2d = canvas.getContext('2d');
      if (!ctx2d) return;

      const handleResize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      };
      handleResize();
      window.addEventListener('resize', handleResize);

      let t = 0;
      const render2DFallback = () => {
        t += 0.01;
        const now = new Date();
        const hour = now.getHours() + now.getMinutes() / 60;
        const palette = getDiurnalPalette(hour);

        ctx2d.clearRect(0, 0, canvas.width, canvas.height);

        const grad = ctx2d.createRadialGradient(
          canvas.width * 0.5 + Math.sin(t * 0.4) * 80 + parallaxX * 20,
          canvas.height * 0.5 + Math.cos(t * 0.3) * 60 + parallaxY * 20,
          20,
          canvas.width * 0.5,
          canvas.height * 0.5,
          canvas.width * 0.7
        );

        const p = palette.primary.map((v) => Math.round(v * 255));
        const s = palette.secondary.map((v) => Math.round(v * 255));
        const a = palette.accent.map((v) => Math.round(v * 255));

        grad.addColorStop(0, `rgba(${p[0]}, ${p[1]}, ${p[2]}, ${opacity * 0.6})`);
        grad.addColorStop(0.4, `rgba(${s[0]}, ${s[1]}, ${s[2]}, ${opacity * 0.4})`);
        grad.addColorStop(0.8, `rgba(${a[0]}, ${a[1]}, ${a[2]}, ${opacity * 0.15})`);
        grad.addColorStop(1, 'transparent');

        ctx2d.fillStyle = grad;
        ctx2d.fillRect(0, 0, canvas.width, canvas.height);

        animFrameId = requestAnimationFrame(render2DFallback);
      };

      render2DFallback();

      return () => {
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(animFrameId);
      };
    }

    // WEBGL SHADER INITIALIZATION
    const createShader = (glCtx: WebGLRenderingContext, type: number, src: string) => {
      const shader = glCtx.createShader(type);
      if (!shader) return null;
      glCtx.shaderSource(shader, src);
      glCtx.compileShader(shader);
      if (!glCtx.getShaderParameter(shader, glCtx.COMPILE_STATUS)) {
        glCtx.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertShader = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER_SRC);
    const fragShader = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SRC);

    if (!vertShader || !fragShader) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      return;
    }

    gl.useProgram(program);

    // Full screen quad geometry
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -1.0, -1.0,
         1.0, -1.0,
        -1.0,  1.0,
        -1.0,  1.0,
         1.0, -1.0,
         1.0,  1.0,
      ]),
      gl.STATIC_DRAW
    );

    const positionLocation = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // Uniform locations
    const timeLocation = gl.getUniformLocation(program, 'u_time');
    const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
    const mouseLocation = gl.getUniformLocation(program, 'u_mouse');
    const colPrimaryLocation = gl.getUniformLocation(program, 'u_col_primary');
    const colSecondaryLocation = gl.getUniformLocation(program, 'u_col_secondary');
    const colAccentLocation = gl.getUniformLocation(program, 'u_col_accent');
    const colDeepLocation = gl.getUniformLocation(program, 'u_col_deep');
    const opacityLocation = gl.getUniformLocation(program, 'u_opacity');

    // Handle Resize
    const resize = () => {
      if (!canvas || !gl) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5); // Cap for high performance
      canvas.width = Math.floor(window.innerWidth * dpr * 0.75); // Render at optimized resolution
      canvas.height = Math.floor(window.innerHeight * dpr * 0.75);
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    resize();
    window.addEventListener('resize', resize);

    const startTime = performance.now();

    const render = () => {
      if (isContextLost || !gl) return;

      const elapsed = (performance.now() - startTime) / 1000.0;
      const now = new Date();
      const hourDecimal = now.getHours() + now.getMinutes() / 60.0 + now.getSeconds() / 3600.0;
      const palette = getDiurnalPalette(hourDecimal);

      gl.useProgram(program);

      gl.uniform1f(timeLocation, elapsed);
      gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
      gl.uniform2f(mouseLocation, parallaxX, parallaxY);

      gl.uniform3f(colPrimaryLocation, ...palette.primary);
      gl.uniform3f(colSecondaryLocation, ...palette.secondary);
      gl.uniform3f(colAccentLocation, ...palette.accent);
      gl.uniform3f(colDeepLocation, ...palette.deep);
      gl.uniform1f(opacityLocation, opacity);

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      animFrameId = requestAnimationFrame(render);
    };

    render();

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      isContextLost = true;
    };
    canvas.addEventListener('webglcontextlost', handleContextLost, false);

    return () => {
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      cancelAnimationFrame(animFrameId);
      if (gl) {
        gl.deleteProgram(program);
        gl.deleteShader(vertShader);
        gl.deleteShader(fragShader);
      }
    };
  }, [opacity, parallaxX, parallaxY]);

  return (
    <canvas
      ref={canvasRef}
      id="nebula-shader-canvas"
      className="absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-1000"
      style={{
        filter: 'blur(12px)',
        transform: 'scale(1.08)',
      }}
    />
  );
};
