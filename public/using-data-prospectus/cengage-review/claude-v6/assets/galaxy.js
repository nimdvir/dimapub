/*
 * Galaxy background — adapted from React Bits "Galaxy" (https://www.reactbits.dev/backgrounds/galaxy)
 * Copyright (c) 2026 David Haz. MIT + Commons Clause License Condition v1.0.
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
 * documentation files (the "Software"), to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, and distribute the Software as part of an application, website,
 * or product, subject to the following conditions: The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software. Commons Clause Restriction: you may use this
 * Software, including for any commercial purpose, so long as you do not sell, sublicense, or redistribute the
 * components themselves, whether alone, in a bundle, or as a ported version.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 *
 * Dima Publishing changes: plain TypeScript instead of React, a warm `uTint` so stars read as champagne gold,
 * a transparent light mode for the paper pages, window-level pointer tracking, and rendering that pauses
 * off-screen, in background tabs and for visitors who prefer reduced motion.
 */

// v4: native WebGL adapter, lazy contexts and reduced-motion support.
(function(){
const vertex=`
attribute vec2 uv;
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0, 1);
}
`;
const fragment=`
precision highp float;

uniform float uTime;
uniform vec3 uResolution;
uniform vec2 uFocal;
uniform vec2 uRotation;
uniform float uStarSpeed;
uniform float uDensity;
uniform float uHueShift;
uniform float uSpeed;
uniform vec2 uMouse;
uniform float uGlowIntensity;
uniform float uSaturation;
uniform bool uMouseRepulsion;
uniform float uTwinkleIntensity;
uniform float uRotationSpeed;
uniform float uRepulsionStrength;
uniform float uMouseActiveFactor;
uniform float uAutoCenterRepulsion;
uniform float uLightMode;
uniform vec3 uTint;

varying vec2 vUv;

#define NUM_LAYER 4.0
#define STAR_COLOR_CUTOFF 0.2
#define MAT45 mat2(0.7071, -0.7071, 0.7071, 0.7071)
#define PERIOD 3.0

float Hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float tri(float x) { return abs(fract(x) * 2.0 - 1.0); }
float tris(float x) {
  float t = fract(x);
  return 1.0 - smoothstep(0.0, 1.0, abs(2.0 * t - 1.0));
}
float trisn(float x) {
  float t = fract(x);
  return 2.0 * (1.0 - smoothstep(0.0, 1.0, abs(2.0 * t - 1.0))) - 1.0;
}
vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}
float Star(vec2 uv, float flare) {
  float d = length(uv);
  float m = (0.05 * uGlowIntensity) / d;
  float rays = smoothstep(0.0, 1.0, 1.0 - abs(uv.x * uv.y * 1000.0));
  m += rays * flare * uGlowIntensity;
  uv *= MAT45;
  rays = smoothstep(0.0, 1.0, 1.0 - abs(uv.x * uv.y * 1000.0));
  m += rays * 0.3 * flare * uGlowIntensity;
  m *= smoothstep(1.0, 0.2, d);
  return m;
}
vec3 StarLayer(vec2 uv) {
  vec3 col = vec3(0.0);
  vec2 gv = fract(uv) - 0.5;
  vec2 id = floor(uv);
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 offset = vec2(float(x), float(y));
      vec2 si = id + vec2(float(x), float(y));
      float seed = Hash21(si);
      float size = fract(seed * 345.32);
      float glossLocal = tri(uStarSpeed / (PERIOD * seed + 1.0));
      float flareSize = smoothstep(0.9, 1.0, size) * glossLocal;
      float red = smoothstep(STAR_COLOR_CUTOFF, 1.0, Hash21(si + 1.0)) + STAR_COLOR_CUTOFF;
      float blu = smoothstep(STAR_COLOR_CUTOFF, 1.0, Hash21(si + 3.0)) + STAR_COLOR_CUTOFF;
      float grn = min(red, blu) * seed;
      vec3 base = vec3(red, grn, blu);
      float hue = atan(base.g - base.r, base.b - base.r) / (2.0 * 3.14159) + 0.5;
      hue = fract(hue + uHueShift / 360.0);
      float sat = length(base - vec3(dot(base, vec3(0.299, 0.587, 0.114)))) * uSaturation;
      float val = max(max(base.r, base.g), base.b);
      base = hsv2rgb(vec3(hue, sat, val));
      vec2 pad = vec2(tris(seed * 34.0 + uTime * uSpeed / 10.0), tris(seed * 38.0 + uTime * uSpeed / 30.0)) - 0.5;
      float star = Star(gv - offset - pad, flareSize);
      float twinkle = trisn(uTime * uSpeed + seed * 6.2831) * 0.5 + 1.0;
      twinkle = mix(1.0, twinkle, uTwinkleIntensity);
      star *= twinkle;
      col += star * size * base;
    }
  }
  return col;
}

void main() {
  vec2 focalPx = uFocal * uResolution.xy;
  vec2 uv = (vUv * uResolution.xy - focalPx) / uResolution.y;
  vec2 mouseNorm = uMouse - vec2(0.5);

  if (uAutoCenterRepulsion > 0.0) {
    float centerDist = length(uv);
    vec2 repulsion = normalize(uv) * (uAutoCenterRepulsion / (centerDist + 0.1));
    uv += repulsion * 0.05;
  } else if (uMouseRepulsion) {
    vec2 mousePosUV = (uMouse * uResolution.xy - focalPx) / uResolution.y;
    float mouseDist = length(uv - mousePosUV);
    vec2 repulsion = normalize(uv - mousePosUV) * (uRepulsionStrength / (mouseDist + 0.1));
    uv += repulsion * 0.05 * uMouseActiveFactor;
  } else {
    uv += mouseNorm * 0.1 * uMouseActiveFactor;
  }

  float a = uTime * uRotationSpeed;
  uv = mat2(cos(a), -sin(a), sin(a), cos(a)) * uv;
  uv = mat2(uRotation.x, -uRotation.y, uRotation.y, uRotation.x) * uv;

  vec3 col = vec3(0.0);
  for (float i = 0.0; i < 1.0; i += 1.0 / NUM_LAYER) {
    float depth = fract(i + uStarSpeed * uSpeed);
    float scale = mix(20.0 * uDensity, 0.5 * uDensity, depth);
    float fade = depth * smoothstep(1.0, 0.9, depth);
    col += StarLayer(uv * scale + i * 453.32) * fade;
  }
  col *= uTint;

  if (uLightMode > 0.5) {
    // Ink-on-paper: dark gold specks with alpha, so the page color shows through.
    float energy = max(max(col.r, col.g), col.b);
    float coverage = clamp(smoothstep(0.0, 0.42, energy) * 0.92, 0.0, 0.92);
    gl_FragColor = vec4(clamp(col * 0.48, 0.0, 0.82), coverage);
  } else {
    float alpha = smoothstep(0.0, 0.3, length(col));
    gl_FragColor = vec4(col, min(alpha, 1.0));
  }
}
`;

 const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
 let pointer={x:0,y:0};addEventListener('pointermove',e=>{pointer={x:e.clientX,y:e.clientY}},{passive:true});
 const states=new Map();
 function mount(el){
  if(states.has(el))return;
  const canvas=document.createElement('canvas');canvas.setAttribute('aria-hidden','true');el.append(canvas);
  const gl=canvas.getContext('webgl',{alpha:true,premultipliedAlpha:false,antialias:false});if(!gl){canvas.remove();fallback(el);return}
  function compile(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s}
  let program;try{program=gl.createProgram();gl.attachShader(program,compile(gl.VERTEX_SHADER,vertex));gl.attachShader(program,compile(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('Galaxy link');}catch(e){canvas.remove();fallback(el);return}
  gl.useProgram(program);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.clearColor(0,0,0,0);
  function attr(name,values){const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(values),gl.STATIC_DRAW);const a=gl.getAttribLocation(program,name);gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0)}
  attr('position',[-1,-1,3,-1,-1,3]);attr('uv',[0,0,2,0,0,2]);
  const locations={};function loc(n){return locations[n]??(locations[n]=gl.getUniformLocation(program,n))}
  function f(n,v){gl.uniform1f(loc(n),v)}function v2(n,a,b){gl.uniform2f(loc(n),a,b)}
  f('uDensity',1.1);f('uHueShift',210);f('uSpeed',.6);f('uGlowIntensity',.32);f('uSaturation',.25);f('uTwinkleIntensity',.45);f('uRotationSpeed',.03);f('uRepulsionStrength',1.6);f('uAutoCenterRepulsion',0);f('uLightMode',0);gl.uniform1i(loc('uMouseRepulsion'),1);gl.uniform3f(loc('uTint'),1,.86,.62);v2('uFocal',.5,.5);v2('uRotation',1,0);
  let raf=0,last=0;const seed=performance.now()-12000;const smooth={x:.5,y:.5,a:0};
  function draw(now){
   const r=el.getBoundingClientRect();const scale=Math.min(devicePixelRatio,1.3);const width=Math.round(r.width*scale),height=Math.round(r.height*scale);
   if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;gl.viewport(0,0,width,height)}
   gl.uniform3f(loc('uResolution'),width,height,width/height);
   const inside=pointer.x>=r.left&&pointer.x<=r.right&&pointer.y>=r.top&&pointer.y<=r.bottom;
   smooth.x+=((pointer.x-r.left)/r.width-smooth.x)*.05;smooth.y+=(1-(pointer.y-r.top)/r.height-smooth.y)*.05;smooth.a+=((inside&&!reduce?1:0)-smooth.a)*.05;
   const t=(now-seed)*.001;f('uTime',t);f('uStarSpeed',t*.025);f('uMouseActiveFactor',smooth.a);v2('uMouse',smooth.x,smooth.y);gl.clear(gl.COLOR_BUFFER_BIT);gl.drawArrays(gl.TRIANGLES,0,3);
  }
  function loop(now){raf=requestAnimationFrame(loop);if(document.hidden||now-last<40)return;last=now;draw(now)}
  states.set(el,{stop(){cancelAnimationFrame(raf);gl.getExtension('WEBGL_lose_context')?.loseContext();canvas.remove();states.delete(el)}});
  draw(performance.now());if(!reduce)raf=requestAnimationFrame(loop);
 }
 function fallback(el){
  const c=document.createElement('canvas');c.setAttribute('aria-hidden','true');el.append(c);const ctx=c.getContext('2d');if(!ctx){c.remove();return}
  let raf=0,last=0;const stars=Array.from({length:Math.max(80,Math.round(el.clientWidth*el.clientHeight/2400))},(_,i)=>({x:((Math.sin(i*153.3)*43758.5)%1+1)%1,y:((Math.sin(i*71.9)*61803.7)%1+1)%1,r:i%17===0?1.55:i%5===0?.9:.5,p:i*1.47}));
  function draw(now){const w=el.clientWidth,h=el.clientHeight,d=Math.min(devicePixelRatio,1.5);if(c.width!==Math.round(w*d)||c.height!==Math.round(h*d)){c.width=Math.round(w*d);c.height=Math.round(h*d);ctx.setTransform(d,0,0,d,0,0)}ctx.clearRect(0,0,w,h);const t=now*.00012;for(const s of stars){const x=(s.x*w+t*3*(1+s.r))%w,y=(s.y*h+Math.sin(t+s.p)*3)%h;ctx.globalAlpha=.35+.42*(.5+.5*Math.sin(t*3+s.p));ctx.fillStyle=s.r>1?'#ffe2a2':'#e4d6b3';ctx.beginPath();ctx.arc(x,y,s.r,0,Math.PI*2);ctx.fill();if(s.r>1){ctx.strokeStyle='#f6d18b';ctx.lineWidth=.5;ctx.beginPath();ctx.moveTo(x-4,y);ctx.lineTo(x+4,y);ctx.moveTo(x,y-4);ctx.lineTo(x,y+4);ctx.stroke()}}}
  function loop(now){raf=requestAnimationFrame(loop);if(document.hidden||now-last<40)return;last=now;draw(now)}
  states.set(el,{stop(){cancelAnimationFrame(raf);c.remove();states.delete(el)}});el.dataset.starfield='canvas';draw(performance.now());if(!reduce)raf=requestAnimationFrame(loop);
 }
 const obs=new IntersectionObserver(entries=>entries.forEach(e=>e.isIntersecting?mount(e.target):states.get(e.target)?.stop()),{rootMargin:'100px'});
 document.querySelectorAll('.galaxy').forEach(el=>obs.observe(el));
})();
