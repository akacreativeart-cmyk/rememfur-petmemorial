import { useEffect, useRef, useState } from "react";
import { Flame } from "lucide-react";

type Props = {
  width?: number;
  height?: number;
  className?: string;
};

/**
 * WebGL shader flame — warm amber-to-white domain-warped noise with additive glow.
 * Falls back to a CSS-animated Flame icon when WebGL is unavailable or the user
 * prefers reduced motion.
 */
export function CandleFlame({ width = 40, height = 60, className = "" }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [useShader, setUseShader] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (reduced) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl =
      (canvas.getContext("webgl", { premultipliedAlpha: true, antialias: true }) as WebGLRenderingContext | null) ||
      (canvas.getContext("experimental-webgl") as WebGLRenderingContext | null);
    if (!gl) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);

    const vsrc = `
      attribute vec2 a;
      varying vec2 v;
      void main() { v = a * 0.5 + 0.5; gl_Position = vec4(a, 0.0, 1.0); }
    `;
    const fsrc = `
      precision mediump float;
      varying vec2 v;
      uniform float t;

      float hash(vec2 p){ return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5453); }
      float noise(vec2 p){
        vec2 i = floor(p); vec2 f = fract(p);
        vec2 u = f*f*(3.0-2.0*f);
        return mix(mix(hash(i), hash(i+vec2(1.0,0.0)), u.x),
                   mix(hash(i+vec2(0.0,1.0)), hash(i+vec2(1.0,1.0)), u.x), u.y);
      }
      float fbm(vec2 p){
        float s = 0.0, a = 0.5;
        for (int k = 0; k < 5; k++){ s += a * noise(p); p *= 2.02; a *= 0.5; }
        return s;
      }

      void main(){
        vec2 uv = v;
        vec2 c = vec2(0.5, 0.32);
        vec2 d = uv - c;
        // flame silhouette (teardrop, wider at base, tapering to a point above)
        float shape = 1.0 - smoothstep(0.0, 0.42, length(vec2(d.x * 1.9, d.y * 0.9 + 0.15)));
        // domain warp
        vec2 q = vec2(fbm(uv * 3.0 + vec2(0.0, -t * 1.4)),
                      fbm(uv * 3.0 + vec2(5.2, -t * 1.1 + 3.0)));
        float n = fbm(uv * 4.5 + q * 1.8 + vec2(0.0, -t * 1.9));
        float body = shape * (0.55 + 0.55 * n) * (1.0 - smoothstep(0.55, 1.0, uv.y * -1.0));
        body = clamp(body, 0.0, 1.0);

        // gradient: hot white at core → amber → deep amber → transparent
        vec3 core = vec3(1.0, 0.96, 0.82);
        vec3 mid  = vec3(1.0, 0.72, 0.32);
        vec3 deep = vec3(0.85, 0.28, 0.08);
        vec3 col = mix(deep, mid, smoothstep(0.15, 0.55, body));
        col = mix(col, core, smoothstep(0.6, 0.95, body));

        // additive outer glow
        float glow = smoothstep(0.0, 0.85, shape) * (0.35 + 0.25 * n);
        col += vec3(1.0, 0.55, 0.2) * glow * 0.25;

        float alpha = clamp(body * 1.1 + glow * 0.35, 0.0, 1.0);
        gl_FragColor = vec4(col * alpha, alpha);
      }
    `;

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const vs = compile(gl.VERTEX_SHADER, vsrc);
    const fs = compile(gl.FRAGMENT_SHADER, fsrc);
    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const aLoc = gl.getAttribLocation(prog, "a");
    gl.enableVertexAttribArray(aLoc);
    gl.vertexAttribPointer(aLoc, 2, gl.FLOAT, false, 0, 0);
    const tLoc = gl.getUniformLocation(prog, "t");

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    setUseShader(true);
    let raf = 0;
    const start = performance.now();
    const render = () => {
      const t = (performance.now() - start) / 1000;
      gl.uniform1f(tLoc, t);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(raf);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [width, height]);

  return (
    <span
      className={`relative inline-block ${className}`}
      style={{ width, height }}
      aria-hidden
    >
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{ width, height, display: useShader ? "block" : "none" }}
      />
      {!useShader && (
        <Flame
          className="absolute inset-0 m-auto text-amber-300 flame-fallback-pulse"
          style={{ width: width * 0.7, height: height * 0.7 }}
        />
      )}
    </span>
  );
}
