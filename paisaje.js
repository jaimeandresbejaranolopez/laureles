/* =============================================================================
   PAISAJE — el 3D con el mundo real alrededor
   -----------------------------------------------------------------------------
   Sobre el relieve del levantamiento (r3d.js) pone:
     · la ortofoto del dron del proyecto como piel del predio (teselas /orto);
     · el relieve real del entorno hasta 45 km: NASA SRTM de 30 m (dominio
       público), guardado en Supabase (tabla laureles_horizonte). Se ve la
       cordillera Central en el horizonte, con la foto satelital encima;
     · cielo con el sol en su posición real (hora de Colombia) y bruma que
       crece con la distancia, como se ve el aire en el Quindío;
     · árboles en 3D SÓLO en la ronda de la cañada (bosque protegido), y sólo
       donde la ortofoto muestra copa. Son representativos: el sitio es real,
       la forma y la altura de cada árbol no.
   Nada de esto cambia datos: es cómo se ve. Se apaga con el botón Paisaje.
   ============================================================================= */
(function(){
"use strict";
const R3D = window.__R3D;
if(!R3D || !R3D.ext) return;
const X = R3D.ext;
const ORTO = { z:19, bounds:[-75.7437825,4.469276,-75.7340388,4.4772557], ruta:"orto/{z}/{x}/{y}.webp" };
const SAT_URL = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";

let on=false, preparado=false, preparando=null;
let gl=null, D=null;                    /* datos de r3d: ve, CX, CY, ZMID, KX, KY, lat0, lon0 */
let progH=null, progC=null, progA=null;
let anillos=[], cielo=null, arboles=[], delta=0;
let luzActual=null, horaModo="ahora";

/* ---------------- coordenadas ---------------- */
const aEscena=(lon,lat)=>{ const wx=(lon-D.lon0)*D.KX, wy=(D.lat0-lat)*D.KY; return [wx-D.CX, D.CY-wy, wx, wy]; };
const merc=(lon,lat)=>{ const s=Math.sin(lat*Math.PI/180); return [(lon+180)/360, 0.5-Math.log((1+s)/(1-s))/(4*Math.PI)]; };

/* ---------------- sombreadores ---------------- */
const VS_H=`attribute vec3 p;attribute vec2 uv;attribute vec2 sl;attribute vec3 col;
uniform mat4 M;uniform float VE;uniform vec3 OJO;uniform float DENS;
varying vec2 vUv;varying vec3 vN;varying vec3 vC;varying float vF;varying vec2 vXY;
void main(){vec3 q=vec3(p.x,p.y,p.z*VE);vUv=uv;vC=col;vXY=p.xy;
vN=normalize(vec3(-sl.x*VE,-sl.y*VE,1.0));
float d=length(q-OJO)*DENS; vF=1.0-exp(-d*d);
gl_Position=M*vec4(q,1.0);}`;
const FS_H=`#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
varying vec2 vUv;varying vec3 vN;varying vec3 vC;varying float vF;varying vec2 vXY;
uniform sampler2D T;uniform float UT;uniform vec3 L;uniform vec3 NIEB;uniform sampler2D MKT;uniform vec4 MK;
void main(){
vec2 m=vec2((vXY.x+MK.x)/MK.z,(MK.y-vXY.y)/MK.w);
if(m.x>0.0&&m.x<1.0&&m.y>0.0&&m.y<1.0&&texture2D(MKT,m).r>0.5) discard;   /* donde hay levantamiento, manda el predio */
vec3 b=UT>0.5?texture2D(T,vUv).rgb:vC;
float d=max(dot(normalize(vN),normalize(L)),0.0);
vec3 c=b*(0.50+0.55*d);
gl_FragColor=vec4(mix(c,NIEB,clamp(vF,0.0,1.0)),1.0);}`;
const VS_C=`attribute vec3 p;uniform mat4 M;uniform vec3 OJO;varying vec3 vD;
void main(){vD=p;gl_Position=M*vec4(p+OJO,1.0);gl_Position.z=gl_Position.w*0.99999;}`;
const FS_C=`precision mediump float;varying vec3 vD;uniform vec3 ZEN;uniform vec3 HOR;uniform vec3 SOLD;uniform vec3 SOLC;
void main(){vec3 d=normalize(vD);float e=d.z;
vec3 c=e>0.0?mix(HOR,ZEN,pow(e,0.55)):mix(HOR,HOR*0.82,min(-e*4.0,1.0));
float s=max(dot(d,normalize(SOLD)),0.0);
c+=SOLC*(pow(s,900.0)*1.4+pow(s,24.0)*0.22+pow(s,4.0)*0.06);
gl_FragColor=vec4(c,1.0);}`;
const VS_A=`attribute vec3 p;attribute vec3 n;attribute vec3 col;
uniform mat4 M;uniform vec3 OJO;uniform float DENS;uniform vec3 L;
varying vec3 vC;varying float vF;
void main(){float dd=max(dot(normalize(n),normalize(L)),0.0);
vC=col*(0.42+0.62*dd);float d=length(p-OJO)*DENS; vF=1.0-exp(-d*d);
gl_Position=M*vec4(p,1.0);}`;
const FS_A=`precision mediump float;varying vec3 vC;varying float vF;uniform vec3 NIEB;
void main(){gl_FragColor=vec4(mix(vC,NIEB,clamp(vF,0.0,1.0)),1.0);}`;
function programa(vs,fs){
  const c=(t,s)=>{ const o=gl.createShader(t); gl.shaderSource(o,s); gl.compileShader(o);
    if(!gl.getShaderParameter(o,gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o)); return o; };
  const p=gl.createProgram(); gl.attachShader(p,c(gl.VERTEX_SHADER,vs)); gl.attachShader(p,c(gl.FRAGMENT_SHADER,fs));
  gl.linkProgram(p); if(!gl.getProgramParameter(p,gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
  return p;
}
function buf(tipo,datos){ const b=gl.createBuffer(); gl.bindBuffer(tipo,b); gl.bufferData(tipo,datos,gl.STATIC_DRAW); return b; }

/* ---------------- el sol y los colores del cielo ---------------- */
function horaColombia(){ const d=new Date(); const u=d.getTime()+d.getTimezoneOffset()*60000; const c=new Date(u-5*3600000);
  return {a:c.getFullYear(), m:c.getMonth()+1, d:c.getDate(), h:c.getHours()+c.getMinutes()/60}; }
function solAhora(){
  const SOL=window.__SOL; const t=horaColombia();
  let h = horaModo==="ahora" ? t.h : +horaModo;
  let p = SOL ? SOL.posicion(t.a,t.m,t.d,h,D.lat0,D.lon0) : {alt:40,az:250};
  if(p.alt<6 && horaModo==="ahora"){ h=15; p=SOL?SOL.posicion(t.a,t.m,t.d,h,D.lat0,D.lon0):{alt:22,az:262}; }
  const A=p.alt*Math.PI/180, Z=p.az*Math.PI/180;
  return {alt:p.alt, az:p.az, h, v:[Math.cos(A)*Math.sin(Z), Math.cos(A)*Math.cos(Z), Math.sin(A)]};
}
function mezcla(a,b,t){ return a.map((v,i)=>v+(b[i]-v)*t); }
function coloresCielo(alt){
  const dorado=Math.max(0,Math.min(1,(18-alt)/14));          /* 1 al atardecer, 0 a pleno día */
  return {
    zen: mezcla([0.33,0.53,0.80],[0.40,0.50,0.70],dorado),
    hor: mezcla([0.80,0.87,0.93],[0.96,0.83,0.66],dorado),
    sol: mezcla([1.0,0.97,0.88],[1.0,0.78,0.48],dorado),
    niebla: mezcla([0.77,0.84,0.90],[0.90,0.82,0.72],dorado)
  };
}

/* ---------------- teselas a un lienzo ---------------- */
function cargarImg(url){ return new Promise(res=>{ const im=new Image(); im.crossOrigin="anonymous";
  im.onload=()=>res(im); im.onerror=()=>res(null); im.src=url; }); }
async function mosaico(url, z, oeste, sur, este, norte, maxLado){
  const n=2**z, a=merc(oeste,norte), b=merc(este,sur);
  const x0=Math.floor(a[0]*n), x1=Math.floor(b[0]*n), y0=Math.floor(a[1]*n), y1=Math.floor(b[1]*n);
  const tw=x1-x0+1, th=y1-y0+1; if(tw*th>240) return null;
  const cv=document.createElement("canvas"); cv.width=tw*256; cv.height=th*256;
  const cx=cv.getContext("2d"); let ok=0;
  const tareas=[];
  for(let y=y0;y<=y1;y++) for(let x=x0;x<=x1;x++)
    tareas.push(cargarImg(url.replace("{z}",z).replace("{x}",x).replace("{y}",y)).then(im=>{ if(im){ cx.drawImage(im,(x-x0)*256,(y-y0)*256); ok++; } }));
  await Promise.all(tareas);
  if(!ok) return null;
  /* límites del mosaico en coordenadas web mercator normalizadas (0..1) */
  let out=cv;
  if(maxLado && Math.max(cv.width,cv.height)>maxLado){
    const k=maxLado/Math.max(cv.width,cv.height); out=document.createElement("canvas");
    out.width=Math.round(cv.width*k); out.height=Math.round(cv.height*k);
    out.getContext("2d").drawImage(cv,0,0,out.width,out.height);
  }
  try{ out.getContext("2d").getImageData(0,0,1,1); }catch(e){ return null; }   /* sin CORS no sirve para WebGL */
  return {cv:out, mx0:x0/n, my0:y0/n, mx1:(x1+1)/n, my1:(y1+1)/n, ok, total:tw*th};
}
const lonDeMx=mx=>mx*360-180, latDeMy=my=>{ const t=Math.PI*(1-2*my); return 180/Math.PI*Math.atan(Math.sinh(t)); };

/* ---------------- relieve del entorno ---------------- */
async function traerHorizonte(){
  const cfg=(typeof CFG!=="undefined")?CFG:null;
  const base=(cfg&&cfg.supabaseUrl||"").replace(/\/$/,""), llave=cfg&&cfg.supabaseKey;
  if(!base||!llave) return null;
  const r=await fetch(base+"/rest/v1/laureles_horizonte?select=g,n,lat_s,lat_n,lon_o,lon_e,z_base,datos&order=g",
    {headers:{apikey:llave, Authorization:"Bearer "+llave}});
  if(!r.ok) return null;
  const filas=await r.json();
  return filas.map(f=>{
    const b=atob(String(f.datos).replace(/\s+/g,"")), u=new Uint8Array(b.length);
    for(let i=0;i<b.length;i++) u[i]=b.charCodeAt(i);
    const dv=new DataView(u.buffer), z=new Float32Array(f.n*f.n);
    for(let i=0;i<z.length;i++) z[i]=f.z_base+dv.getInt16(i*2,false)/4;
    return Object.assign(f,{z});
  });
}
function altRejilla(R,lon,lat){
  const fi=(lon-R.lon_o)/(R.lon_e-R.lon_o)*(R.n-1), fj=(lat-R.lat_s)/(R.lat_n-R.lat_s)*(R.n-1);
  const i=Math.floor(fi), j=Math.floor(fj); if(i<0||j<0||i>=R.n-1||j>=R.n-1) return NaN;
  const tx=fi-i, ty=fj-j, z=(a,b)=>R.z[b*R.n+a];
  return (z(i,j)*(1-tx)+z(i+1,j)*tx)*(1-ty)+(z(i,j+1)*(1-tx)+z(i+1,j+1)*tx)*ty;
}
/* color de respaldo si no llega la foto satelital: por cota y pendiente */
function colorTierra(h,pend,sem){
  const r=((Math.sin(sem*12.9898)*43758.5453)%1+1)%1;
  let c = h<1300 ? [0.42,0.55,0.30] : h<2200 ? [0.35,0.49,0.27] : h<3300 ? [0.25,0.38,0.22] : h<4200 ? [0.52,0.53,0.40] : [0.58,0.57,0.53];
  if(pend>0.45) c=mezcla(c,[0.30,0.36,0.24],0.35);
  return c.map(v=>v*(0.9+0.2*r));
}
function mallaAnillo(R, interior, tex){
  const n=R.n, pos=[], uv=[], sl=[], col=[];
  const dLon=(R.lon_e-R.lon_o)/(n-1), dLat=(R.lat_n-R.lat_s)/(n-1);
  const alto=[];
  for(let j=0;j<n;j++) for(let i=0;i<n;i++){
    const lon=R.lon_o+i*dLon, lat=R.lat_s+j*dLat;
    const e=aEscena(lon,lat);
    let h=R.z[j*n+i]+delta;
    /* debajo del predio, la malla del entorno se hunde: manda el levantamiento */
    const hp=X.alturaEn(e[2],e[3]);
    if(!isNaN(hp)) h=Math.min(h,hp-3);
    alto.push(h);
    pos.push(e[0],e[1],h-D.ZMID);
    if(tex){ const m=merc(lon,lat); uv.push((m[0]-tex.mx0)/(tex.mx1-tex.mx0),(m[1]-tex.my0)/(tex.my1-tex.my0)); } else uv.push(0,0);
  }
  const mx=dLon*D.KX, my=dLat*D.KY;
  for(let j=0;j<n;j++) for(let i=0;i<n;i++){
    const h=(a,b)=>alto[Math.max(0,Math.min(n-1,b))*n+Math.max(0,Math.min(n-1,a))];
    const sx=(h(i+1,j)-h(i-1,j))/(2*mx), sy=(h(i,j+1)-h(i,j-1))/(2*my);
    sl.push(sx,sy);
    col.push(...colorTierra(alto[j*n+i],Math.hypot(sx,sy),i*131+j*7));
  }
  const dentro=(lon,lat)=> interior && lon>interior.lon_o && lon<interior.lon_e && lat>interior.lat_s && lat<interior.lat_n;
  const idx=[];
  for(let j=0;j<n-1;j++) for(let i=0;i<n-1;i++){
    const lo0=R.lon_o+i*dLon, lo1=lo0+dLon, la0=R.lat_s+j*dLat, la1=la0+dLat;
    if(dentro(lo0,la0)&&dentro(lo1,la0)&&dentro(lo0,la1)&&dentro(lo1,la1)) continue;
    const a=j*n+i, b=a+1, c=a+n, d=c+1;
    idx.push(a,b,c, b,d,c);
  }
  const inter=new Float32Array(n*n*10);
  for(let k=0;k<n*n;k++){ inter.set([pos[k*3],pos[k*3+1],pos[k*3+2],uv[k*2],uv[k*2+1],sl[k*2],sl[k*2+1],col[k*3],col[k*3+1],col[k*3+2]],k*10); }
  const o={v:buf(gl.ARRAY_BUFFER,inter), i:buf(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(idx)), c:idx.length, tex:null};
  if(tex){ o.tex=gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D,o.tex);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,tex.cv); }
  return o;
}

/* ---------------- cielo ---------------- */
function mallaCielo(){
  const V=[], I=[], NA=24, NB=48, R=60000;
  for(let a=0;a<=NA;a++){ const el=-0.25+(Math.PI/2+0.25)*a/NA;
    for(let b=0;b<=NB;b++){ const az=2*Math.PI*b/NB; V.push(R*Math.cos(el)*Math.sin(az), R*Math.cos(el)*Math.cos(az), R*Math.sin(el)); } }
  for(let a=0;a<NA;a++) for(let b=0;b<NB;b++){ const k=a*(NB+1)+b; I.push(k,k+1,k+NB+1, k+1,k+NB+2,k+NB+1); }
  return {v:buf(gl.ARRAY_BUFFER,new Float32Array(V)), i:buf(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(I)), c:I.length};
}

/* ---------------- árboles de la ronda, donde la foto muestra copa ---------------- */
function copaEn(orto, lon, lat){
  const m=merc(lon,lat), px=Math.floor((m[0]-orto.mx0)/(orto.mx1-orto.mx0)*orto.cv.width), py=Math.floor((m[1]-orto.my0)/(orto.my1-orto.my0)*orto.cv.height);
  if(px<0||py<0||px>=orto.cv.width||py>=orto.cv.height) return -1;
  const d=orto.px, k=(py*orto.cv.width+px)*4;
  if(d[k+3]<200) return -1;
  const r=d[k],g=d[k+1],b=d[k+2], L=0.3*r+0.59*g+0.11*b;
  return (g>=r && g>=b-4 && L<105) ? 1 : 0;
}
function dentroAnillo(pt,ring){ let d=false;
  for(let i=0,j=ring.length-1;i<ring.length;j=i++){ const xi=ring[i][0],yi=ring[i][1],xj=ring[j][0],yj=ring[j][1];
    if(((yi>pt[1])!==(yj>pt[1]))&&(pt[0]<(xj-xi)*(pt[1]-yi)/(yj-yi)+xi)) d=!d; } return d; }
function mallaArboles(orto){
  const prot=(D.DATA&&D.DATA.prot)||[]; if(!prot.length) return [];
  let semilla=7; const az=()=>{ semilla=(semilla*1103515245+12345)&0x7fffffff; return semilla/0x7fffffff; };
  const paso=5.2;                                        /* metros entre candidatos */
  const kLon=paso/D.KX, kLat=paso/D.KY;
  const V=[],N=[],C=[],I=[], trozos=[];
  const cerrar=()=>{ if(!I.length) return;
    trozos.push({v:buf(gl.ARRAY_BUFFER,new Float32Array(V)), n:buf(gl.ARRAY_BUFFER,new Float32Array(N)),
                 c:buf(gl.ARRAY_BUFFER,new Float32Array(C)), i:buf(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(I)), k:I.length});
    V.length=N.length=C.length=I.length=0; };
  const SEG=7;
  let cuantos=0;
  prot.forEach(ring=>{
    let lo0=Infinity,lo1=-Infinity,la0=Infinity,la1=-Infinity;
    ring.forEach(p=>{ lo0=Math.min(lo0,p[0]); lo1=Math.max(lo1,p[0]); la0=Math.min(la0,p[1]); la1=Math.max(la1,p[1]); });
    for(let la=la0; la<=la1; la+=kLat) for(let lo=lo0; lo<=lo1; lo+=kLon){
      const lon=lo+(az()-0.5)*kLon*0.8, lat=la+(az()-0.5)*kLat*0.8;
      if(!dentroAnillo([lon,lat],ring)) continue;
      if(orto){ const c=copaEn(orto,lon,lat); if(c===0) continue; }   /* pasto: sin árbol */
      const e=aEscena(lon,lat), hz=X.alturaEn(e[2],e[3]); if(isNaN(hz)) continue;
      const z0=(hz-D.ZMID)*D.ve;
      const alto=8+az()*9, radio=2.4+az()*1.8, tronco=alto*0.38;
      const verde=[[0.20,0.33,0.16],[0.25,0.38,0.18],[0.17,0.29,0.15],[0.29,0.40,0.20]][Math.floor(az()*4)];
      if(V.length/3 + SEG*3+6 > 65000) cerrar();
      /* tronco: prisma de 4 caras */
      let b=V.length/3; const t=0.22;
      [[t,0],[0,t],[-t,0],[0,-t]].forEach(([dx,dy])=>{ V.push(e[0]+dx,e[1]+dy,z0, e[0]+dx,e[1]+dy,z0+tronco); N.push(dx,dy,0, dx,dy,0); C.push(0.30,0.24,0.18, 0.30,0.24,0.18); });
      for(let s=0;s<4;s++){ const a=b+s*2, c=b+((s+1)%4)*2; I.push(a,c,a+1, c,c+1,a+1); }
      /* copa: dos anillos y dos polos, un poco irregular */
      b=V.length/3; const zc=z0+tronco+(alto-tronco)*0.45, hz2=(alto-tronco)/2;
      V.push(e[0],e[1],zc-hz2); N.push(0,0,-1); C.push(...verde.map(v=>v*0.8));
      for(let r=0;r<2;r++){ const zz=zc+(r?0.5:-0.25)*hz2, rr=radio*(r?0.92:1);
        for(let s=0;s<SEG;s++){ const a=2*Math.PI*s/SEG+r*0.4, f=0.85+az()*0.3;
          const nx=Math.sin(a), ny=Math.cos(a);
          V.push(e[0]+nx*rr*f, e[1]+ny*rr*f, zz); N.push(nx, ny, r?0.6:-0.1); C.push(...verde.map(v=>v*(0.92+az()*0.16))); } }
      V.push(e[0],e[1],zc+hz2*0.8); N.push(0,0,1); C.push(...verde.map(v=>v*1.15));
      const pie=b, cima=b+1+SEG*2, r0=b+1, r1=b+1+SEG;
      for(let s=0;s<SEG;s++){ const s2=(s+1)%SEG;
        I.push(pie,r0+s2,r0+s); I.push(r0+s,r0+s2,r1+s); I.push(r0+s2,r1+s2,r1+s); I.push(r1+s,r1+s2,cima); }
      cuantos++;
    }
  });
  cerrar();
  arbolesCuantos=cuantos;
  return trozos;
}
let arbolesCuantos=0, arbolesVE=null, ortoMosaico=null, mascara=null;
/* Máscara del predio: 1 donde hay levantamiento. El relieve del entorno (SRTM,
   30 m, y con la copa de los árboles incluida) se descarta ahí: en la cañada
   quedaba por encima del terreno medido y tapaba el predio con manchas oscuras. */
function hacerMascara(){
  const paso=2, W=Math.ceil(D.ANCHO/paso), H=Math.ceil(D.ALTO/paso);
  const c=document.createElement("canvas"); c.width=W; c.height=H;
  const x=c.getContext("2d"), im=x.createImageData(W,H);
  const dentro=new Uint8Array(W*H);
  for(let j=0;j<H;j++) for(let i=0;i<W;i++){
    const h=X.alturaEn(D.TER.x+(i+0.5)*paso, D.TER.y+(j+0.5)*paso);
    dentro[j*W+i]=isNaN(h)?0:1; }
  /* se recorta 2 px (4 m) hacia adentro: en el borde el predio y el entorno se traslapan en vez de dejar hueco */
  for(let j=0;j<H;j++) for(let i=0;i<W;i++){
    let v=dentro[j*W+i];
    for(let dj=-2;dj<=2&&v;dj++) for(let di=-2;di<=2&&v;di++){ const a=i+di,b=j+dj; if(a<0||b<0||a>=W||b>=H||!dentro[b*W+a]) v=0; }
    const k=(j*W+i)*4; im.data[k]=im.data[k+1]=im.data[k+2]=v?255:0; im.data[k+3]=255; }
  x.putImageData(im,0,0);
  const t=gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D,t);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,c);
  return t;
}

/* ---------------- pintar ---------------- */
function uni(p,n){ return gl.getUniformLocation(p,n); }
function pintarCielo(ctx){
  if(!cielo) return;
  const col=coloresCielo(luzActual?luzActual.alt:40);
  gl.useProgram(progC); gl.depthMask(false); gl.disable(gl.DEPTH_TEST);
  const ap=gl.getAttribLocation(progC,"p");
  gl.bindBuffer(gl.ARRAY_BUFFER,cielo.v); gl.enableVertexAttribArray(ap); gl.vertexAttribPointer(ap,3,gl.FLOAT,false,0,0);
  gl.uniformMatrix4fv(uni(progC,"M"),false,ctx.M);
  gl.uniform3fv(uni(progC,"OJO"),ctx.E);
  gl.uniform3fv(uni(progC,"ZEN"),col.zen); gl.uniform3fv(uni(progC,"HOR"),col.hor);
  gl.uniform3fv(uni(progC,"SOLC"),col.sol); gl.uniform3fv(uni(progC,"SOLD"),luzActual?luzActual.v:[0,0,1]);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,cielo.i); gl.drawElements(gl.TRIANGLES,cielo.c,gl.UNSIGNED_SHORT,0);
  gl.disableVertexAttribArray(ap);
  gl.depthMask(true); gl.enable(gl.DEPTH_TEST);
}
function pintarEntorno(ctx){
  const col=coloresCielo(luzActual?luzActual.alt:40), dens=densidad();
  if(anillos.length){
    gl.useProgram(progH);
    const L=["p","uv","sl","col"].map(n=>gl.getAttribLocation(progH,n));
    gl.uniformMatrix4fv(uni(progH,"M"),false,ctx.M); gl.uniform1f(uni(progH,"VE"),ctx.ve);
    gl.uniform3fv(uni(progH,"OJO"),ctx.E); gl.uniform1f(uni(progH,"DENS"),dens);
    gl.uniform3fv(uni(progH,"L"),luzActual?luzActual.v:[-0.42,0.46,0.78]); gl.uniform3fv(uni(progH,"NIEB"),col.niebla);
    gl.uniform1i(uni(progH,"T"),1);
    gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D,mascara);
    gl.uniform1i(uni(progH,"MKT"),2);
    gl.uniform4f(uni(progH,"MK"),D.CX-D.TER.x,D.CY-D.TER.y,D.ANCHO,D.ALTO);
    anillos.forEach(a=>{
      gl.bindBuffer(gl.ARRAY_BUFFER,a.v);
      const st=40; [[0,3,0],[1,2,12],[2,2,20],[3,3,28]].forEach(([k,n,o])=>{ gl.enableVertexAttribArray(L[k]); gl.vertexAttribPointer(L[k],n,gl.FLOAT,false,st,o); });
      gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D,a.tex||null);
      gl.uniform1f(uni(progH,"UT"),a.tex?1:0);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,a.i); gl.drawElements(gl.TRIANGLES,a.c,gl.UNSIGNED_SHORT,0);
    });
    L.forEach(l=>gl.disableVertexAttribArray(l));
    gl.activeTexture(gl.TEXTURE0);
  }
  if(arboles.length){
    if(arbolesVE!==ctx.ve){ reconstruirArboles(); }
    gl.useProgram(progA);
    const L=["p","n","col"].map(n=>gl.getAttribLocation(progA,n));
    gl.uniformMatrix4fv(uni(progA,"M"),false,ctx.M); gl.uniform3fv(uni(progA,"OJO"),ctx.E);
    gl.uniform1f(uni(progA,"DENS"),dens); gl.uniform3fv(uni(progA,"NIEB"),col.niebla);
    gl.uniform3fv(uni(progA,"L"),luzActual?luzActual.v:[-0.42,0.46,0.78]);
    arboles.forEach(t=>{
      gl.bindBuffer(gl.ARRAY_BUFFER,t.v); gl.enableVertexAttribArray(L[0]); gl.vertexAttribPointer(L[0],3,gl.FLOAT,false,0,0);
      gl.bindBuffer(gl.ARRAY_BUFFER,t.n); gl.enableVertexAttribArray(L[1]); gl.vertexAttribPointer(L[1],3,gl.FLOAT,false,0,0);
      gl.bindBuffer(gl.ARRAY_BUFFER,t.c); gl.enableVertexAttribArray(L[2]); gl.vertexAttribPointer(L[2],3,gl.FLOAT,false,0,0);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,t.i); gl.drawElements(gl.TRIANGLES,t.k,gl.UNSIGNED_SHORT,0);
    });
    L.forEach(l=>gl.disableVertexAttribArray(l));
  }
}
const densidad=()=>1/30000;
function reconstruirArboles(){ D=X.datos(); arboles=mallaArboles(ortoMosaico); arbolesVE=D.ve; }

/* ---------------- luz ---------------- */
function aplicarLuz(){
  luzActual=solAhora();
  const col=coloresCielo(luzActual.alt);
  X.luz(luzActual.v);
  X.niebla(col.niebla[0],col.niebla[1],col.niebla[2],densidad());
}

/* ---------------- preparar (una vez) ---------------- */
async function preparar(){
  gl=X.gl(); D=X.datos();
  progH=programa(VS_H,FS_H); progC=programa(VS_C,FS_C); progA=programa(VS_A,FS_A);
  mascara=hacerMascara();
  cielo=mallaCielo();
  aplicarLuz();
  /* 1. la ortofoto del dron como piel del predio */
  const [o,s,e,n]=ORTO.bounds;
  const om=await mosaico(ORTO.ruta, ORTO.z, o, s, e, n, 4096);
  if(om){
    ortoMosaico=om;
    try{ om.px=om.cv.getContext("2d").getImageData(0,0,om.cv.width,om.cv.height).data; }catch(e){ om.px=null; }
    window.SAT={ predio:{ foto:om.cv, oeste:lonDeMx(om.mx0), este:lonDeMx(om.mx1), norte:latDeMy(om.my0), sur:latDeMy(om.my1) } };
  }
  /* 2. el relieve del entorno, con la foto satelital encima si el servidor la deja usar */
  let rej=null; try{ rej=await traerHorizonte(); }catch(e){ rej=null; }
  if(rej && rej.length){
    const g3=rej.find(r=>r.g===3);
    /* la cota del SRTM y la del levantamiento no tienen el mismo cero: se toma la
       mediana de la diferencia sobre el predio y se corre todo el entorno */
    if(g3){ const dif=[];
      for(let k=0;k<600;k++){ const wx=D.TER.x+Math.random()*D.ANCHO, wy=D.TER.y+Math.random()*D.ALTO;
        const lon=D.lon0+wx/D.KX, lat=D.lat0-wy/D.KY;
        const esc=aEscena(lon,lat), hp=X.alturaEn(esc[2],esc[3]), hs=altRejilla(g3,lon,lat);
        if(!isNaN(hp)&&!isNaN(hs)) dif.push(hp-hs); }
      dif.sort((a,b)=>a-b); delta = dif.length>20 ? dif[dif.length>>1] : 0;
      PAISAJE.delta=delta; PAISAJE.muestras=dif.length; }
    const zoomDe={1:11, 2:13, 3:15};
    for(const R of rej.sort((a,b)=>a.g-b.g)){
      const interior=rej.find(q=>q.g===R.g+1)||null;
      let tex=null;
      try{ tex=await mosaico(SAT_URL, zoomDe[R.g], R.lon_o, R.lat_s, R.lon_e, R.lat_n, 2048); }catch(e){ tex=null; }
      anillos.push(mallaAnillo(R, interior, tex));
      PAISAJE.fotos[R.g]= tex ? tex.ok+"/"+tex.total : "sin foto";
    }
  }
  /* 3. árboles */
  reconstruirArboles();
  PAISAJE.arboles=arbolesCuantos;
  preparado=true;
}

function aplicar(){
  if(on){
    X.lejos(130000);
    X.fondo(pintarCielo);
    X.agregar(pintarEntorno);
    X.faldaColor([0.30,0.36,0.24,1], 60);
    window.satOn=!!window.SAT;
    aplicarLuz();
    const o=X.orbita(); if(o.elv>0.34) X.fijarOrbita({elv:0.26});
  } else {
    X.lejos(6000); X.fondo(null); X.quitar(pintarEntorno); X.faldaColor(null);
    X.niebla(0.8,0.85,0.9,0); window.satOn=false;
    X.luz([-0.42,0.46,0.78]);
  }
  R3D.refrescar();
  pintarBoton();
}
async function poner(v){
  on=!!v;
  try{ localStorage.setItem("laureles.paisaje", on?"1":"0"); }catch(e){}
  if(on && !preparado){
    pintarBoton(true);
    if(!preparando) preparando=preparar().catch(e=>{ console.warn("paisaje:",e); });
    await preparando;
  }
  if(on && R3D.activo() && R3D.ve()!==1){ R3D.exagerar(1);
    document.querySelectorAll("#ve3d [data-ve]").forEach(y=>y.classList.toggle("on", y.dataset.ve==="1")); }
  aplicar();
}

/* ---------------- botones en la barra del relieve ---------------- */
let bP=null, bH=null;
function pintarBoton(cargando){
  if(bP){ bP.classList.toggle("on",on); bP.textContent = cargando ? "Paisaje…" : "Paisaje"; }
  if(bH){ bH.hidden=!on; bH.textContent = horaModo==="ahora" ? "Luz: ahora" : ("Luz: "+({"7":"7 a. m.","12":"12 m.","17":"5 p. m."})[horaModo]); }
}
function montar(){
  const ctl=document.getElementById("ve3d"); if(!ctl || document.getElementById("ve3dPaisaje")) return;
  bP=document.createElement("button"); bP.id="ve3dPaisaje"; bP.title="Ortofoto del dron, relieve real del entorno, cielo y bosque";
  bP.onclick=()=>poner(!on);
  bH=document.createElement("button"); bH.id="ve3dLuz"; bH.hidden=true; bH.title="Hora de la luz: la de ahora en Colombia, o mañana, mediodía y tarde";
  bH.onclick=()=>{ const ciclo=["ahora","7","12","17"]; horaModo=ciclo[(ciclo.indexOf(horaModo)+1)%ciclo.length]; aplicarLuz(); pintarBoton(); X.pedir(); };
  const et=ctl.querySelector(".et"); ctl.insertBefore(bP, et); ctl.insertBefore(bH, et);
  pintarBoton();
  /* al encender el 3D, el paisaje entra solo (salvo que la persona lo haya apagado) */
  const b3=document.getElementById("b3d");
  if(b3) b3.addEventListener("click",()=>{ setTimeout(()=>{
    let pref="1"; try{ pref=localStorage.getItem("laureles.paisaje")||"1"; }catch(e){}
    if(R3D.activo() && pref==="1" && !on) poner(true);
  },60); });
}
const PAISAJE = window.PAISAJE = { poner, activo:()=>on, delta:0, muestras:0, fotos:{}, arboles:0 };
if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",montar); else montar();
})();
