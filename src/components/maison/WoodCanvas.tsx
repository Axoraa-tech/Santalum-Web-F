"use client";

import { useEffect, useRef } from "react";
import { useWood } from "@/lib/wood";

/**
 * A live, procedural cross-section of sandalwood (WebGL, no libraries).
 * - hero:   a whole log slice with bark, sapwood, heartwood and drying checks.
 *           The rings press away from the cursor; it grows from the pith on first view.
 * - studio: a polished pendant panel whose shape and grain come from the grain studio.
 * Colours ease between red (Pterocarpus santalinus) and white (Santalum album).
 */

export type Shape = 0 | 1 | 2 | 3; // circle, pebble, arch, drop
export type GrainParams = { rings: number; warp: number; age: number; knotX: number; knotY: number; shape: Shape };

export const HERO_GRAIN: GrainParams = { rings: 72, warp: 0.9, age: 0.25, knotX: 0.1, knotY: -0.15, shape: 0 };

const SHAPE_TOPS = [0.34, 0.307, 0.33, 0.29];

const VERT = `attribute vec2 a;void main(){gl_Position=vec4(a,0.0,1.0);}`;

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform float uPress;
uniform float uWood;
uniform float uGrow;
uniform float uRings;
uniform float uWarp;
uniform float uAge;
uniform vec2 uKnot;
uniform vec4 uShape;
uniform float uTop;
uniform float uMode;

float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float noise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);vec2 u=f*f*(3.0-2.0*f);
  return mix(mix(hash(i),hash(i+vec2(1.0,0.0)),u.x),mix(hash(i+vec2(0.0,1.0)),hash(i+vec2(1.0,1.0)),u.x),u.y);}
float fbm(vec2 p){float v=0.0;float a=0.5;for(int i=0;i<5;i++){v+=a*noise(p);p=p*2.03+vec2(1.7,9.2);a*=0.5;}return v;}
float sdBox(vec2 p,vec2 b){vec2 d=abs(p)-b;return length(max(d,0.0))+min(max(d.x,d.y),0.0);}
float smin(float a,float b,float k){float h=clamp(0.5+0.5*(b-a)/k,0.0,1.0);return mix(b,a,h)-k*h*(1.0-h);}

float shapeSDF(vec2 p){
  float a=atan(p.y,p.x);
  if(uMode<0.5){
    float r=0.43*uGrow*(1.0+0.012*sin(3.0*a+1.3)+0.008*sin(7.0*a));
    return length(p)-r;
  }
  float dC=length(p)-0.34;
  float rp=0.33*(1.0+0.07*sin(2.0*a+0.6)+0.045*sin(3.0*a+2.1)+0.02*sin(5.0*a));
  float dP=length(p*vec2(0.92,1.08))-rp;
  float dA=min(sdBox(p-vec2(0.0,-0.12),vec2(0.25,0.2)),length(p-vec2(0.0,0.08))-0.25);
  float dD=smin(length(p-vec2(0.0,-0.07))-0.27,length(p-vec2(0.0,0.27))-0.02,0.28);
  return dot(uShape,vec4(dC,dP,dA,dD));
}

vec3 woodColor(vec2 p,float sd){
  vec2 q=p-uKnot;
  vec2 m=uMouse;
  float md=length(p-m);
  float push=uPress*0.035*exp(-md*md*22.0);
  float w=(fbm(q*2.4+vec2(0.0,uTime*0.012))-0.5)*uWarp;
  float r=length(q*vec2(1.0,1.06))+w*0.07-push;
  float g=max(uGrow,0.001);
  float rc=(r/g)*uRings+fbm(vec2(r*9.0,1.3))*2.2;
  float idx=floor(rc);
  float t=fract(rc);
  float late=smoothstep(0.58,0.96,t)*(1.0-smoothstep(0.96,1.0,t));
  late*=0.55+0.7*hash(vec2(idx,3.1));
  float ang=atan(q.y,q.x);
  float rays=smoothstep(0.82,1.0,noise(vec2(ang*110.0,r*5.0)))*0.10;
  float fib=(noise(vec2(ang*260.0,r*40.0))-0.5)*0.07;

  vec3 HL=mix(vec3(0.67,0.24,0.14),vec3(0.87,0.73,0.52),uWood);
  vec3 HD=mix(vec3(0.33,0.08,0.05),vec3(0.60,0.43,0.25),uWood);
  vec3 SL=mix(vec3(0.87,0.71,0.53),vec3(0.96,0.91,0.82),uWood);
  vec3 SD=mix(vec3(0.71,0.52,0.36),vec3(0.85,0.76,0.61),uWood);

  float dark=clamp(late*(0.7+uAge*0.3)+uAge*0.22,0.0,1.0);
  vec3 heart=mix(HL,HD,dark);
  vec3 sap=mix(SL,SD,dark*0.8);
  float hb=(uMode<0.5)?0.30*g:0.9;
  float heartMix=smoothstep(hb+0.015,hb-0.03,r+w*0.03);
  vec3 col=mix(sap,heart,heartMix);
  col+=rays*mix(vec3(1.0,0.9,0.8),vec3(1.0),uWood);
  col+=fib;
  col*=mix(0.8,1.0,smoothstep(0.0,0.025,r));

  if(uMode<0.5){
    float bark=smoothstep(-0.03,-0.012,sd+(noise(vec2(ang*30.0,1.0))-0.5)*0.01);
    vec3 barkCol=mix(vec3(0.24,0.15,0.10),vec3(0.42,0.32,0.22),uWood)*(0.8+0.4*noise(vec2(ang*60.0,r*80.0)));
    col=mix(col,barkCol,bark);
    float pa=atan(p.y,p.x);
    float pr=length(p);
    float da=abs(mod(pa-0.7+3.14159,6.28318)-3.14159);
    float db=abs(mod(pa-2.9+3.14159,6.28318)-3.14159);
    float wob=(noise(vec2(pr*40.0,2.0))-0.5)*0.03;
    float c1=smoothstep(0.012,0.0,abs(da+wob)*pr)*smoothstep(0.12*g,0.3*g,pr)*(1.0-bark);
    float c2=smoothstep(0.008,0.0,abs(db-wob)*pr)*smoothstep(0.22*g,0.36*g,pr)*(1.0-bark);
    col*=1.0-0.55*max(c1,c2);
  } else {
    float rim=smoothstep(-0.03,0.0,sd);
    col*=1.0-rim*0.22;
    col+=smoothstep(-0.012,-0.004,sd)*0.05;
  }
  vec2 lp=p-m*0.7-vec2(-0.08,0.1);
  col+=exp(-dot(lp,lp)*4.0)*0.07;
  col*=0.96+0.08*(1.0-length(p)*1.2);
  return col;
}

void main(){
  vec2 p=(gl_FragCoord.xy-0.5*uRes)/uRes.y;
  float px=1.5/uRes.y;
  float sd=shapeSDF(p);
  float inside=smoothstep(px,-px,sd);
  float sd2=shapeSDF(p+vec2(0.0,0.035));
  float sh=(1.0-smoothstep(-0.01,0.09,sd2))*0.16*uGrow;
  vec3 shadowCol=vec3(0.24,0.17,0.12);
  vec3 col=woodColor(p,sd);
  vec3 rgb=col*inside+shadowCol*sh*(1.0-inside);
  float a=inside+sh*(1.0-inside);
  if(uMode>0.5){
    vec2 bc=vec2(0.0,uTop+0.032);
    float bail=abs(length(p-bc)-0.026)-0.0055;
    float cord=max(abs(p.x)-0.0022,-(p.y-(uTop+0.056)));
    float mA=smoothstep(px,-px,bail);
    float cA=smoothstep(px,-px,cord);
    vec3 metal=mix(vec3(0.62,0.60,0.58),vec3(0.80,0.67,0.42),uWood)*(0.85+0.3*smoothstep(-0.03,0.03,p.x-bc.x+p.y-bc.y));
    vec3 cordCol=vec3(0.16,0.12,0.09);
    rgb=cordCol*cA+rgb*(1.0-cA); a=cA+a*(1.0-cA);
    rgb=metal*mA+rgb*(1.0-mA); a=mA+a*(1.0-mA);
  }
  gl_FragColor=vec4(rgb,a);
}
`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(s));
    return null;
  }
  return s;
}

const easeOutExpo = (x: number) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x));

export function WoodCanvas({
  mode,
  params = HERO_GRAIN,
  className = "",
  label,
}: {
  mode: "hero" | "studio";
  params?: GrainParams;
  className?: string;
  label: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const wood = useWood();
  const target = useRef({ wood: 0, params });

  useEffect(() => {
    target.current.wood = wood === "white" ? 1 : 0;
  }, [wood]);

  useEffect(() => {
    target.current.params = params;
  }, [params]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: true, antialias: true });
    if (!gl) {
      canvas.dataset.fallback = "true";
      return;
    }
    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;
    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const aLoc = gl.getAttribLocation(prog, "a");
    gl.enableVertexAttribArray(aLoc);
    gl.vertexAttribPointer(aLoc, 2, gl.FLOAT, false, 0, 0);

    const u = (n: string) => gl.getUniformLocation(prog, n);
    const U = {
      res: u("uRes"), time: u("uTime"), mouse: u("uMouse"), press: u("uPress"), wood: u("uWood"),
      grow: u("uGrow"), rings: u("uRings"), warp: u("uWarp"), age: u("uAge"), knot: u("uKnot"),
      shape: u("uShape"), top: u("uTop"), mode: u("uMode"),
    };

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isHero = mode === "hero";
    const knotScale = isHero ? 0.05 : 0.55;
    const p0 = target.current.params;
    const cur = {
      wood: target.current.wood,
      rings: p0.rings,
      warp: p0.warp,
      age: p0.age,
      kx: p0.knotX,
      ky: p0.knotY,
      shape: [0, 0, 0, 0].map((_, i): number => (i === p0.shape ? 1 : 0)),
      mx: 0.12,
      my: 0.12,
      press: 0,
    };
    const pointer = { x: 0.12, y: 0.12, press: 0, down: false };
    let grow = reduce || !isHero ? 1 : 0;
    let growT = 0;
    let visible = false;
    let raf = 0;
    let last = performance.now();
    let time = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.6);
      canvas.width = Math.max(1, Math.round(canvas.clientWidth * dpr));
      canvas.height = Math.max(1, Math.round(canvas.clientHeight * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) / r.height;
      const y = -(e.clientY - r.top - r.height / 2) / r.height;
      const near = Math.abs(x) < 0.7 && Math.abs(y) < 0.6;
      pointer.x = x;
      pointer.y = y;
      pointer.press = near ? (pointer.down ? 2.2 : 1) : 0;
    };
    const onDown = () => {
      pointer.down = true;
      if (pointer.press > 0) pointer.press = 2.2;
    };
    const onUp = () => {
      pointer.down = false;
      if (pointer.press > 0) pointer.press = 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !raf) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    });
    io.observe(canvas);

    function frame(now: number) {
      raf = 0;
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (!reduce) time += dt;
      const t = target.current;
      const k = reduce ? 1 : 1 - Math.exp(-dt * 3.2);
      const kp = reduce ? 1 : 1 - Math.exp(-dt * 6);
      cur.wood += (t.wood - cur.wood) * k;
      cur.rings += (t.params.rings - cur.rings) * k;
      cur.warp += (t.params.warp - cur.warp) * k;
      cur.age += (t.params.age - cur.age) * k;
      cur.kx += (t.params.knotX - cur.kx) * k;
      cur.ky += (t.params.knotY - cur.ky) * k;
      cur.shape = cur.shape.map((v, i) => v + ((i === t.params.shape ? 1 : 0) - v) * kp);
      cur.mx += (pointer.x - cur.mx) * kp;
      cur.my += (pointer.y - cur.my) * kp;
      cur.press += (pointer.press - cur.press) * kp;
      if (grow < 1) {
        growT += dt / 2.6;
        grow = easeOutExpo(Math.min(growT, 1));
      }
      const top = cur.shape.reduce((s, w, i) => s + w * SHAPE_TOPS[i], 0);

      gl!.uniform2f(U.res, canvas!.width, canvas!.height);
      gl!.uniform1f(U.time, time);
      gl!.uniform2f(U.mouse, cur.mx, cur.my);
      gl!.uniform1f(U.press, reduce ? 0 : cur.press);
      gl!.uniform1f(U.wood, cur.wood);
      gl!.uniform1f(U.grow, grow);
      gl!.uniform1f(U.rings, cur.rings);
      gl!.uniform1f(U.warp, cur.warp);
      gl!.uniform1f(U.age, cur.age);
      gl!.uniform2f(U.knot, cur.kx * knotScale, cur.ky * knotScale);
      gl!.uniform4f(U.shape, cur.shape[0], cur.shape[1], cur.shape[2], cur.shape[3]);
      gl!.uniform1f(U.top, top);
      gl!.uniform1f(U.mode, isHero ? 0 : 1);
      gl!.clearColor(0, 0, 0, 0);
      gl!.clear(gl!.COLOR_BUFFER_BIT);
      gl!.drawArrays(gl!.TRIANGLES, 0, 3);

      if (visible && !document.hidden) raf = requestAnimationFrame(frame);
    }

    const onVis = () => {
      if (!document.hidden && visible && !raf) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.removeEventListener("visibilitychange", onVis);
      gl.deleteProgram(prog);
      gl.deleteBuffer(buf);
    };
  }, [mode]);

  return <canvas ref={ref} role="img" aria-label={label} className={`block touch-pan-y ${className}`} />;
}
