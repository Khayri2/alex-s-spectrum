import { useEffect, useRef } from "react";

/**
 * Interactive "liquid" background.
 * A single full-screen WebGL quad running a fragment shader with
 * flowing fbm noise + a cursor-reactive ripple. Dark + warm-orange
 * highlights so it sits behind the unseen.co-style content.
 */
export default function FluidBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { antialias: false, premultipliedAlpha: false });
    if (!gl) return;

    const vert = `
      attribute vec2 a_pos;
      void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
    `;

    const frag = `
      precision highp float;
      uniform vec2  u_res;
      uniform vec2  u_mouse;   // 0..1, smoothed
      uniform float u_time;
      uniform float u_ripple;  // 0..1, decays after click/move

      // hash + value noise + fbm
      float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float noise(vec2 p){
        vec2 i = floor(p), f = fract(p);
        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
      }
      float fbm(vec2 p){
        float v = 0.0; float a = 0.5;
        for (int i = 0; i < 5; i++){
          v += a * noise(p);
          p *= 2.02; a *= 0.5;
        }
        return v;
      }

      void main(){
        vec2 uv = gl_FragCoord.xy / u_res.xy;
        vec2 p  = uv;
        p.x *= u_res.x / u_res.y;

        vec2 m = u_mouse;
        m.x *= u_res.x / u_res.y;

        float t = u_time * 0.06;

        // flowing domain warp — the "liquid"
        vec2 q = vec2(
          fbm(p + vec2(0.0, t)),
          fbm(p + vec2(5.2, -t * 0.8))
        );
        vec2 r = vec2(
          fbm(p + 2.0 * q + vec2(1.7, 9.2) + t * 0.5),
          fbm(p + 2.0 * q + vec2(8.3, 2.8) - t * 0.4)
        );
        float n = fbm(p + 2.4 * r);

        // mouse pull — warp toward cursor
        float d = distance(p, m);
        float pull = exp(-d * 3.5) * 0.35;
        n += pull;

        // ripple ring expanding from cursor
        float ring = sin((d - u_time * 0.6) * 22.0) * exp(-d * 4.0) * u_ripple;
        n += ring * 0.18;

        // palette — deep ink → ember orange highlights
        vec3 ink    = vec3(0.043, 0.039, 0.031);
        vec3 deep   = vec3(0.075, 0.060, 0.050);
        vec3 warm   = vec3(0.180, 0.090, 0.055);
        vec3 ember  = vec3(1.000, 0.302, 0.094);

        vec3 col = mix(ink, deep, smoothstep(0.30, 0.55, n));
        col = mix(col, warm,  smoothstep(0.55, 0.72, n));
        col = mix(col, ember, smoothstep(0.78, 0.92, n) * 0.55);

        // soft vignette
        float vig = smoothstep(1.15, 0.35, length(uv - 0.5));
        col *= 0.6 + 0.4 * vig;

        // film grain
        float g = (hash(gl_FragCoord.xy + u_time) - 0.5) * 0.04;
        col += g;

        gl_FragColor = vec4(col, 1.0);
      }
    `;

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.warn("shader", gl.getShaderInfoLog(s));
      }
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, vert));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, frag));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    );
    const loc = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const u_res = gl.getUniformLocation(prog, "u_res");
    const u_mouse = gl.getUniformLocation(prog, "u_mouse");
    const u_time = gl.getUniformLocation(prog, "u_time");
    const u_ripple = gl.getUniformLocation(prog, "u_ripple");

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const resize = () => {
      const w = Math.floor(window.innerWidth * dpr);
      const h = Math.floor(window.innerHeight * dpr);
      canvas.width = w; canvas.height = h;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      gl.viewport(0, 0, w, h);
    };
    resize();
    window.addEventListener("resize", resize);

    // mouse + touch — smoothed
    let mx = 0.5, my = 0.5, tmx = 0.5, tmy = 0.5;
    let ripple = 0;
    const setTarget = (x: number, y: number) => {
      tmx = x / window.innerWidth;
      tmy = 1 - y / window.innerHeight;
    };
    const onMove = (e: MouseEvent) => {
      setTarget(e.clientX, e.clientY);
      ripple = Math.min(1, ripple + 0.06);
    };
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) { setTarget(t.clientX, t.clientY); ripple = 1; }
    };
    const onClick = (e: MouseEvent) => { setTarget(e.clientX, e.clientY); ripple = 1; };
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("touchmove", onTouch, { passive: true });
    window.addEventListener("click", onClick);

    const t0 = performance.now();
    let raf = 0;
    const tick = () => {
      mx += (tmx - mx) * 0.06;
      my += (tmy - my) * 0.06;
      ripple *= 0.965;
      gl.uniform2f(u_res, canvas.width, canvas.height);
      gl.uniform2f(u_mouse, mx, my);
      gl.uniform1f(u_time, (performance.now() - t0) / 1000);
      gl.uniform1f(u_ripple, ripple);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("click", onClick);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 h-screen w-screen pointer-events-none"
      aria-hidden
    />
  );
}