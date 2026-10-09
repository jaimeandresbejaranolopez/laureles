/* =============================================================================
   RECORRIDO — "llega a tu lote" en el 3D
   -----------------------------------------------------------------------------
   Desde la portería, por el eje de la vía interna del plano 039, hasta el frente
   del lote; ahí se baja del carro y camina al centro del lote, a la altura de
   los ojos (1,6 m), y mira alrededor. Con el botón de segundo piso sube a 4,5 m.
   Todo sobre el relieve medido y a escala real (exageración 1×). La ruta es la
   más corta por la red vial del plano; no hay vías inventadas.
   ============================================================================= */
(function(){
"use strict";
const R3D=window.__R3D; if(!R3D||!R3D.ext) return;
const X=R3D.ext;
let D=null, grafo=null, DIAG=null;
const OJO_PIE=1.6, OJO_PISO2=4.5, OJO_CARRO=1.3;

/* ---------------- la red vial como grafo ---------------- */
function redVial(){
  /* El eje del corredor (datos-via.js) es una red continua: sus tramos empalman
     a menos de 7 m. El eje del plano 039 viene cortado en la plazoleta y en los
     cruces (huecos de 16 a 120 m), así que para buscar la ruta se usa el primero. */
  const E=window.__ENTRADA, V=window.__VIAP;
  const ejes=(V&&V.eje&&V.eje.length) ? V.eje : (E&&E.eje) || [];
  const nodos=[], ady=[], seg=[];
  const clave=new Map();
  const m=(lon,lat)=>{ const wx=(lon-D.lon0)*D.KX, wy=(D.lat0-lat)*D.KY; return [wx,wy]; };
  const nodo=(lon,lat,s)=>{ const k=lon.toFixed(7)+","+lat.toFixed(7);
    let i=clave.get(k);
    if(i==null){ i=nodos.length; nodos.push({lon,lat,xy:m(lon,lat)}); ady.push([]); seg.push(new Set()); clave.set(k,i); }
    seg[i].add(s); return i; };
  const unir=(a,b)=>{ if(a===b || ady[a].some(x=>x[0]===b)) return; const d=Math.hypot(nodos[a].xy[0]-nodos[b].xy[0],nodos[a].xy[1]-nodos[b].xy[1]);
    ady[a].push([b,d]); ady[b].push([a,d]); };
  const extremos=[];
  ejes.forEach((e,s)=>{ let prev=null;
    e.forEach(p=>{ const i=nodo(p[0],p[1],s); if(prev!=null) unir(prev,i); prev=i; });
    if(e.length){ extremos.push(nodo(e[0][0],e[0][1],s), nodo(e[e.length-1][0],e[e.length-1][1],s)); } });
  /* empalmes: cada extremo de un tramo se une al nodo más cercano de OTRO tramo (hasta 14 m) */
  extremos.forEach(a=>{
    let mejor=-1, dm=14;
    nodos.forEach((n,b)=>{ if(b===a) return;
      for(const x of seg[b]) if(seg[a].has(x)) return;
      const d=Math.hypot(n.xy[0]-nodos[a].xy[0], n.xy[1]-nodos[a].xy[1]);
      if(d<dm){ dm=d; mejor=b; } });
    if(mejor>=0) unir(a,mejor);
  });
  return {nodos, ady};
}
function dijkstra(G, s, t){
  const n=G.nodos.length, dist=new Float64Array(n).fill(Infinity), prev=new Int32Array(n).fill(-1), hecho=new Uint8Array(n);
  dist[s]=0;
  for(let it=0; it<n; it++){
    let u=-1, du=Infinity; for(let i=0;i<n;i++) if(!hecho[i] && dist[i]<du){ du=dist[i]; u=i; }
    if(u<0 || u===t) break; hecho[u]=1;
    for(const [v,w] of G.ady[u]) if(dist[u]+w<dist[v]){ dist[v]=dist[u]+w; prev[v]=u; }
  }
  if(!isFinite(dist[t])) return null;
  const r=[]; for(let v=t; v>=0; v=prev[v]) r.unshift(v); return r;
}
const cerca=(G,xy)=>{ let b=-1, d=Infinity; G.nodos.forEach((n,i)=>{ const q=Math.hypot(n.xy[0]-xy[0],n.xy[1]-xy[1]); if(q<d){d=q;b=i;} }); return [b,d]; };
function centroide(ring){ let a=0,cx=0,cy=0; for(let i=0,j=ring.length-1;i<ring.length;j=i++){ const f=ring[j][0]*ring[i][1]-ring[i][0]*ring[j][1]; a+=f; cx+=(ring[j][0]+ring[i][0])*f; cy+=(ring[j][1]+ring[i][1])*f; } a*=0.5; return [cx/(6*a), cy/(6*a)]; }

/* ---------------- la ruta ---------------- */
function ruta(n){
  D=X.datos(); if(!grafo) grafo=redVial();
  const L=D.DATA.lotes.find(l=>l.n===n); if(!L) return null;
  const E=window.__ENTRADA;
  /* salida: la portería del plano 039; si no está, el extremo sur de la red */
  let inicio;
  if(E && E.porteria && E.porteria[0]){ const c=centroide(E.porteria[0].length?E.porteria[0]:E.porteria); inicio=cerca(grafo,[(c[0]-D.lon0)*D.KX,(D.lat0-c[1])*D.KY])[0]; }
  else { let b=0; grafo.nodos.forEach((q,i)=>{ if(q.lat<grafo.nodos[b].lat) b=i; }); inicio=b; }
  /* destino en la vía: el nodo de la red más cercano al lindero del lote */
  const anillo=L.g.map(p=>[(p[0]-D.lon0)*D.KX,(D.lat0-p[1])*D.KY]);
  let fin=-1, dfin=Infinity;
  anillo.forEach(q=>{ const [b,d]=cerca(grafo,q); if(d<dfin){ dfin=d; fin=b; } });
  const camino=dijkstra(grafo,inicio,fin);
  const vis=new Set([inicio]), cola=[inicio]; while(cola.length){ const u=cola.pop(); for(const [v] of grafo.ady[u]) if(!vis.has(v)){ vis.add(v); cola.push(v); } }
  DIAG={nodos:grafo.nodos.length, inicio, fin, dfin, camino:camino&&camino.length, alcanzables:vis.size, aristas:grafo.ady.reduce((a,x)=>a+x.length,0)};
  if(!camino) return null;
  const pts=camino.map(i=>grafo.nodos[i].xy);
  /* el punto de vista: el centro del lote (en metros del plano) */
  const c=L.c ? [(L.c[0]-D.lon0)*D.KX,(D.lat0-L.c[1])*D.KY] : centroide(anillo);
  return {lote:n, via:remuestrear(pts,2.5), vista:c, frente:pts[pts.length-1]};
}
function remuestrear(pts,paso){
  const r=[pts[0]]; let resto=0;
  for(let i=1;i<pts.length;i++){ const a=pts[i-1], b=pts[i]; const L=Math.hypot(b[0]-a[0],b[1]-a[1]); let t=paso-resto;
    while(t<=L){ r.push([a[0]+(b[0]-a[0])*t/L, a[1]+(b[1]-a[1])*t/L]); t+=paso; }
    resto=L-(t-paso); }
  r.push(pts[pts.length-1]); return r;
}
const altura=(wx,wy)=>{ const h=X.alturaEn(wx,wy); return isNaN(h)?null:h; };
const aEscena=(wx,wy,h)=>[wx-D.CX, D.CY-wy, (h-D.ZMID)*D.ve];

/* ---------------- animación: la película de llegada ----------------
   Cinco tomas, todas sobre la geometría real (relieve, ortofoto y plano 039):
     1. aereo  — plano de dron: baja desde lo alto hasta la portería.
     2. via    — en carro por la vía interna, con la cámara suavizada.
     3. grua   — al llegar, la cámara sube y le da media vuelta al lote.
     4. baja   — desciende al centro del lote, a la altura de los ojos.
     5. vista  — gira despacio mostrando la vista; queda el cierre.
   La luz se pone a las 5 p. m. mientras dura y luego vuelve a la de antes. */
let R=null, raf=0, t0=0, pausa=false, tPausa=0, fase="aereo", yawExtra=0, pitchExtra=0, piso2=false, ui=null, largo=0, dur=0, vistaT0=0, luzAntes=null;
const T_AEREO=6000, T_GRUA=8000, T_BAJA=3800;
const suave=f=>f*f*(3-2*f), suave2=f=>f<0.5?4*f*f*f:1-Math.pow(-2*f+2,3)/2;
const lerp=(a,b,t)=>a+(b-a)*t, lerp3=(a,b,t)=>[lerp(a[0],b[0],t),lerp(a[1],b[1],t),lerp(a[2],b[2],t)];
function lineaCamara(){
  const via=R.via, alts=via.map(p=>altura(p[0],p[1]));
  let ult=null; for(let i=0;i<alts.length;i++){ if(alts[i]==null) alts[i]=ult; else ult=alts[i]; }
  for(let i=alts.length-1;i>=0;i--){ if(alts[i]==null) alts[i]=ult; else ult=alts[i]; }
  /* suavizado: el carro no salta con cada nodo de la malla */
  const s=alts.map((_,i)=>{ let a=0,n=0; for(let k=-6;k<=6;k++){ const v=alts[Math.max(0,Math.min(alts.length-1,i+k))]; if(v!=null){a+=v;n++;} } return n?a/n:D.ZMID; });
  R.alts=s; R.acum=[0]; for(let i=1;i<via.length;i++) R.acum.push(R.acum[i-1]+Math.hypot(via[i][0]-via[i-1][0],via[i][1]-via[i-1][1]));
  largo=R.acum[R.acum.length-1];
  dur=Math.max(12,Math.min(32,largo/14))*1000;      /* ~50 km/h, con tope para no aburrir */
  /* la toma de grúa: alrededor del centro del lote */
  const c=R.vista, hc=altura(c[0],c[1]) ?? s[s.length-1];
  R.hc=hc;
  const fr=R.frente, ang0=Math.atan2(fr[0]-c[0], -(fr[1]-c[1]));   /* desde el centro hacia la vía, en el plano de la escena */
  R.ang0=ang0;
}
function enVia(s){
  const A=R.acum; s=Math.max(0,Math.min(largo,s));
  let i=1; while(i<A.length-1 && A[i]<s) i++;
  const t=(s-A[i-1])/Math.max(1e-6,A[i]-A[i-1]);
  const a=R.via[i-1], b=R.via[i];
  return [a[0]+(b[0]-a[0])*t, a[1]+(b[1]-a[1])*t, R.alts[i-1]+(R.alts[i]-R.alts[i-1])*t];
}
function mirarDesde(ojo, yaw, pitch){
  return [ojo[0]+Math.sin(yaw)*Math.cos(pitch)*50, ojo[1]+Math.cos(yaw)*Math.cos(pitch)*50, ojo[2]+Math.sin(pitch)*50];
}
/* el foco del carro: promedio de varios puntos adelante, para que la cámara no "cabecee" en las curvas */
function focoCarro(s){
  let x=0,y=0,z=0; const ds=[14,24,34,46];
  ds.forEach(d=>{ const q=enVia(s+d); x+=q[0]; y+=q[1]; z+=q[2]; });
  return [x/ds.length, y/ds.length, z/ds.length];
}
function camCarro(s){
  const p=enVia(s), q=focoCarro(s);
  return {ojo:aEscena(p[0],p[1],p[2]+OJO_CARRO+0.4), foco:aEscena(q[0],q[1],q[2]+OJO_CARRO-0.6)};
}
/* posición de la grúa: radio y altura alrededor del centro del lote, ángulo en radianes */
function camGrua(ang, radio, alto){
  const c=R.vista, hc=R.hc;
  const x=c[0]+Math.sin(ang)*radio, y=c[1]-Math.cos(ang)*radio;
  const ojo=aEscena(x,y,hc+alto), foco=aEscena(c[0],c[1],hc+2);
  return {ojo, foco};
}
function cuadro(ts){
  raf=0; if(!R) return;
  if(pausa){ tPausa=ts; X.camara(camaraActual(tPausa)); return; }
  X.camara(camaraActual(ts));
  raf=requestAnimationFrame(cuadro);
}
function cambiarFase(f, ts){ fase=f; t0=ts; cine(f); }
function camaraActual(ts){
  const trans=ts-t0;
  if(fase==="aereo"){
    const f=Math.min(1,trans/T_AEREO), e=suave2(f);
    const fin=camCarro(0);
    /* arranca alto, detrás de la portería, mirando el predio entero */
    const p0=R.via[0], cen=[D.CX, D.CY];
    let vx=p0[0]-cen[0], vy=p0[1]-cen[1]; const n=Math.hypot(vx,vy)||1; vx/=n; vy/=n;
    const hp=R.alts[0];
    const ojo0=aEscena(p0[0]+vx*260, p0[1]+vy*260, hp+230);
    const foco0=aEscena(cen[0], cen[1], hp);
    const ojo=[lerp(ojo0[0],fin.ojo[0],e), lerp(ojo0[1],fin.ojo[1],e), lerp(ojo0[2],fin.ojo[2],Math.pow(e,1.6))];
    const foco=lerp3(foco0, fin.foco, suave(Math.min(1,f*1.15)));
    progreso(0.12*f);
    if(f>=1) cambiarFase("via", ts);
    return {ojo, foco, cerca:0.5, fov:lerp(1.0,1.08,e)};
  }
  if(fase==="via"){
    const f=Math.min(1,trans/dur), e=f<0.5?2*f*f:1-Math.pow(-2*f+2,2)/2;
    const c=camCarro(e*largo);
    const yaw=Math.atan2(c.foco[0]-c.ojo[0], c.foco[1]-c.ojo[1])+yawExtra;
    const pitch=Math.atan2(c.foco[2]-c.ojo[2], Math.hypot(c.foco[0]-c.ojo[0],c.foco[1]-c.ojo[1]))+pitchExtra;
    progreso(0.12+0.58*f);
    if(f>=1){ R.finVia=c; cambiarFase("grua", ts); }
    return {ojo:c.ojo, foco:mirarDesde(c.ojo,yaw,pitch), cerca:0.5, fov:1.08};
  }
  if(fase==="grua"){
    const f=Math.min(1,trans/T_GRUA);
    /* primer tercio: del carro a la grúa; luego media vuelta alrededor del lote */
    const a0=R.ang0, giro=Math.PI*0.75;
    const sube=suave(Math.min(1,f/0.35));
    const ang=a0 + giro*suave(Math.max(0,(f-0.15)/0.85));
    const g=camGrua(ang, 62, 38);
    const ini=R.finVia;
    const ojo=lerp3(ini.ojo, g.ojo, sube), foco=lerp3(ini.foco, g.foco, suave(Math.min(1,f/0.25)));
    progreso(0.70+0.18*f);
    if(f>=1){ R.angFin=ang; cambiarFase("baja", ts); }
    return {ojo, foco, cerca:0.5, fov:1.0};
  }
  if(fase==="baja"){
    const f=Math.min(1,trans/T_BAJA), e=suave2(f);
    const g=camGrua(R.angFin, 62, 38), c=R.vista;
    const suelo=aEscena(c[0],c[1],R.hc+OJO_PIE);
    /* al bajar mira hacia afuera del lote: la vista, no el suelo */
    const yawV=Math.atan2(suelo[0]-g.ojo[0], suelo[1]-g.ojo[1]);
    const lejos=mirarDesde(suelo, yawV, 0.02);
    const ojo=lerp3(g.ojo, suelo, e), foco=lerp3(g.foco, lejos, suave(Math.min(1,f*1.3)));
    progreso(0.88+0.12*f);
    if(f>=1){ R.yawVista=yawV; vistaT0=ts; cambiarFase("vista", ts); mostrarFin(); }
    return {ojo, foco, cerca:0.4, fov:lerp(1.0,1.1,e)};
  }
  /* en el lote: gira despacio para mostrar la vista completa */
  const b=R.vista;
  const ojo=aEscena(b[0],b[1],R.hc+(piso2?OJO_PISO2:OJO_PIE));
  const yaw=R.yawVista + (ts-vistaT0)/1000*0.10 + yawExtra;
  return {ojo, foco:mirarDesde(ojo,yaw,0.02+pitchExtra), cerca:0.4, fov:1.1};
}

/* ---------------- interfaz ---------------- */
function css(){
  if(document.getElementById("recCss")) return;
  const s=document.createElement("style"); s.id="recCss";
  s.textContent=`
.recUI{position:absolute;left:50%;transform:translateX(-50%);bottom:calc(14px + 11vh);z-index:14;display:flex;flex-direction:column;align-items:center;gap:8px;
  width:min(620px,calc(100% - 32px));pointer-events:none}
.recUI .recBar{pointer-events:auto;display:flex;align-items:center;gap:6px;background:rgba(10,12,10,.55);color:#F6F4EC;border-radius:999px;
  padding:5px 5px 5px 14px;backdrop-filter:blur(8px);max-width:100%;opacity:.85}
.recUI .recTt{font-size:12.5px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;letter-spacing:.02em}
.recUI button{border:0;height:auto;line-height:1.2;min-width:0;box-shadow:none;border-radius:999px;padding:7px 12px;font:600 12px var(--sans,sans-serif);cursor:pointer;background:rgba(246,244,236,.14);color:#F6F4EC;white-space:nowrap}
.recUI button:hover{background:rgba(246,244,236,.26)}
.recUI button.pri{background:#EBD9AE;color:#32402F}
.recUI .recProg{width:100%;height:2px;border-radius:2px;background:rgba(255,255,255,.25);overflow:hidden}
.recUI .recProg i{display:block;height:100%;width:0;background:#EBD9AE;transition:width .2s linear}
/* el lenguaje de cine: franjas, viñeta y títulos */
.recCine{position:fixed;inset:0;z-index:13;pointer-events:none}
.recCine:before,.recCine:after{content:"";position:absolute;left:0;right:0;height:0;background:#000;transition:height 1.2s ease}
.recCine:before{top:0}.recCine:after{bottom:0}
.recCine.on:before,.recCine.on:after{height:11vh}
.recCine .vin{position:absolute;inset:0;background:radial-gradient(ellipse at center,rgba(0,0,0,0) 55%,rgba(0,0,0,.42) 100%);opacity:0;transition:opacity 1.5s}
.recCine.on .vin{opacity:1}
.recCine .tit{position:absolute;left:0;right:0;top:50%;transform:translateY(-50%);text-align:center;color:#F6F4EC;opacity:0;transition:opacity 1.4s ease, transform 1.4s ease;text-shadow:0 2px 24px rgba(0,0,0,.55)}
.recCine .tit.on{opacity:1}
.recCine .tit small{display:block;font:600 12px var(--sans,sans-serif);letter-spacing:.42em;text-transform:uppercase;color:#EBD9AE;margin-bottom:10px}
.recCine .tit b{display:block;font:500 clamp(30px,6vw,64px)/1.05 var(--serif,Georgia,serif);letter-spacing:.01em}
.recCine .tit span{display:block;margin-top:12px;font:500 14px var(--sans,sans-serif);opacity:.85}
.recCine .lt{position:absolute;left:clamp(16px,5vw,64px);bottom:calc(11vh + 22px);color:#F6F4EC;opacity:0;transform:translateX(-14px);transition:opacity 1s, transform 1s;text-shadow:0 2px 16px rgba(0,0,0,.6)}
.recCine .lt.on{opacity:1;transform:none}
.recCine .lt small{display:block;font:600 11px var(--sans,sans-serif);letter-spacing:.32em;text-transform:uppercase;color:#EBD9AE}
.recCine .lt b{display:block;font:500 clamp(26px,4.2vw,44px)/1.1 var(--serif,Georgia,serif);margin:4px 0 2px;border-left:3px solid #EBD9AE;padding-left:12px}
.recCine .lt span{display:block;font:500 13.5px var(--sans,sans-serif);opacity:.9;padding-left:15px}
@media (max-width:640px){.recCine .lt{bottom:calc(11vh + 78px)}.recFin{max-height:calc(100% - 22vh - 90px);overflow:auto}}
.recFin{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(11vh + 72px);z-index:15;pointer-events:auto;width:min(560px,calc(100% - 32px));
  background:rgba(246,244,236,.96);color:#1C221B;border-radius:16px;padding:16px 18px;box-shadow:0 18px 50px rgba(0,0,0,.35);font:13px/1.5 var(--sans,sans-serif);
  opacity:0;transition:opacity .8s}
.recFin.on{opacity:1}
.recFin b{color:#32402F}.recFin .acc{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}
.recFin button{border:0;border-radius:999px;padding:9px 14px;font:600 12.5px var(--sans,sans-serif);cursor:pointer;background:#E6E2D3;color:#32402F}
.recFin button.pri{background:#32402F;color:#F6F4EC}
.recFin .nota{font-size:11px;color:#6B6F63;margin-top:10px}
@media (max-width:600px){ .recUI button{padding:7px 9px} .recFin{padding:14px} }
body.enRecorrido #capa3d{visibility:hidden}
body.enRecorrido .ve3d, body.enRecorrido .fondos, body.enRecorrido .rail{visibility:hidden}
/* la tarjeta de la ficha */
.recCard{position:relative;display:block;width:100%;border:0;padding:0;margin:0 0 10px;border-radius:14px;overflow:hidden;cursor:pointer;text-align:left;
  min-height:128px;background:#1C221B center/cover no-repeat;color:#F6F4EC;box-shadow:0 8px 22px rgba(28,34,27,.18)}
.recCard:before{content:"";position:absolute;inset:0;background:linear-gradient(100deg,rgba(14,18,13,.86) 0%,rgba(14,18,13,.55) 55%,rgba(14,18,13,.15) 100%)}
.recCard .in{position:relative;display:flex;align-items:center;gap:14px;padding:18px}
.recCard .play{flex:0 0 52px;height:52px;border-radius:50%;background:#EBD9AE;color:#32402F;display:grid;place-items:center;box-shadow:0 0 0 6px rgba(235,217,174,.22);transition:transform .25s}
.recCard:hover .play{transform:scale(1.08)}
.recCard small{display:block;font:600 10.5px var(--sans,sans-serif);letter-spacing:.28em;text-transform:uppercase;color:#EBD9AE}
.recCard b{display:block;font:500 21px/1.15 var(--serif,Georgia,serif);margin:3px 0 4px}
.recCard span.d{display:block;font-size:12px;opacity:.85;line-height:1.4}`;
  document.head.appendChild(s);
}
function progreso(f){ const i=ui&&ui.querySelector(".recProg i"); if(i) i.style.width=(f*100).toFixed(1)+"%"; }
let cineEl=null, finEl=null;
function datosLote(){
  const f=window.__MAPA && __MAPA.LOTES.features.find(x=>x.properties.lote===R.lote);
  return f ? f.properties : {};
}
const m2=v=>Math.round(v||0).toLocaleString("es-CO")+" m²";
function cine(f){
  if(!cineEl) return;
  const tit=cineEl.querySelector(".tit"), lt=cineEl.querySelector(".lt");
  if(f==="aereo"){ cineEl.classList.add("on"); tit.classList.add("on"); setTimeout(()=>tit.classList.remove("on"), 3600); }
  if(f==="grua"){
    const p=datosLote();
    lt.innerHTML='<small>Laureles Campestre</small><b>Lote '+R.lote+'</b><span>'+m2(p.area_m2)+' · '+m2(p.area_util_m2)+' útiles'+(p.topo_ok&&p.vista_hacia?' · mira al '+p.vista_hacia:'')+'</span>';
    lt.classList.add("on"); setTimeout(()=>lt.classList.remove("on"), 6500); }
}
function montarUI(n){
  css();
  const main=document.querySelector("main")||document.body;
  cineEl=document.createElement("div"); cineEl.className="recCine";
  cineEl.innerHTML='<div class="vin"></div><div class="tit"><small>Laureles Campestre</small><b>Llegando al lote '+n+'</b><span>Desde la portería, por la vía del proyecto</span></div><div class="lt"></div>';
  document.body.appendChild(cineEl);
  ui=document.createElement("div"); ui.className="recUI";
  ui.innerHTML='<div class="recBar"><span class="recTt">Lote '+n+'</span>'+
    '<button id="recPausa">Pausa</button><button id="recSaltar">Saltar toma</button><button class="pri" id="recSalir">Salir</button></div>'+
    '<div class="recProg"><i></i></div>';
  main.appendChild(ui);
  ui.querySelector("#recPausa").onclick=()=>{ pausa=!pausa; ui.querySelector("#recPausa").textContent=pausa?"Seguir":"Pausa";
    if(!pausa){ const ahora=performance.now(); t0+=ahora-tPausa; if(fase==="vista") vistaT0+=ahora-tPausa; raf=requestAnimationFrame(cuadro); } else tPausa=performance.now(); };
  ui.querySelector("#recSaltar").onclick=()=>{ const ahora=performance.now();
    const T={aereo:T_AEREO, via:dur, grua:T_GRUA, baja:T_BAJA}[fase]; if(T) t0=ahora-T; };
  ui.querySelector("#recSalir").onclick=()=>salir(true);
}
function mostrarFin(){
  if(!ui) return;
  const p=datosLote();
  ui.querySelector(".recTt").textContent='Lote '+R.lote+' · a 1,6 m del suelo';
  const sb=ui.querySelector("#recSaltar"); sb.textContent="Segundo piso";
  sb.onclick=()=>{ piso2=!piso2; sb.textContent=piso2?"A nivel del suelo":"Segundo piso";
    ui.querySelector(".recTt").textContent='Lote '+R.lote+(piso2?' · a 4,5 m (segundo piso)':' · a 1,6 m del suelo'); if(pausa) X.camara(camaraActual(tPausa)); };
  finEl=document.createElement("div"); finEl.className="recFin";
  const vista=p.topo_ok&&p.vista_hacia ? " La ladera mira al "+p.vista_hacia+"." : "";
  finEl.innerHTML='<b>Estás en el centro del lote '+R.lote+'.</b> Arrastra para mirar alrededor.'+vista+
    '<div class="acc"><button class="pri" id="recAgenda">Agendar visita</button><button id="recWa">Escribir por WhatsApp</button><button id="recOtra">Ver otra vez</button><button id="recCerrarFin">Seguir mirando</button></div>'+
    '<div class="nota">Terreno del levantamiento topográfico y ortofoto del dron. Los árboles grandes están ubicados sobre la ortofoto del dron (altura aproximada); los del bosque de la ronda son representativos.</div>';
  document.body.appendChild(finEl);
  requestAnimationFrame(()=>finEl.classList.add("on"));
  finEl.querySelector("#recAgenda").onclick=()=>{ const n=R.lote; salir(true); setTimeout(()=>{ try{ if(window.ACCESO&&ACCESO.agenda) ACCESO.agenda(); }catch(e){} }, 300); };
  finEl.querySelector("#recWa").onclick=()=>{ try{ window.abrirWhatsApp && abrirWhatsApp("Hola, vi el recorrido 3D del lote "+R.lote+" de Laureles Campestre y quiero más información."); }catch(e){} };
  finEl.querySelector("#recOtra").onclick=()=>{ const n=R.lote; salir(false); setTimeout(()=>iniciar(n), 80); };
  finEl.querySelector("#recCerrarFin").onclick=()=>{ finEl.classList.remove("on"); setTimeout(()=>{ if(finEl){ finEl.remove(); finEl=null; } }, 600); };
}
/* mirar alrededor arrastrando */
let arr=null;
function pDown(e){ if(!R) return; arr={x:e.clientX,y:e.clientY,yaw:yawExtra,pitch:pitchExtra}; }
function pMove(e){ if(!R||!arr) return; yawExtra=arr.yaw-(e.clientX-arr.x)*0.005; pitchExtra=Math.max(-0.9,Math.min(0.8,arr.pitch+(e.clientY-arr.y)*0.004)); if(pausa) X.camara(camaraActual(tPausa)); }
function pUp(){ arr=null; }

let antes=null, selAntes=null;
async function iniciar(n){
  /* el 3D, a escala real, con el paisaje */
  if(!R3D.activo()){ const b=document.getElementById("b3d"); if(b) b.click(); await new Promise(r=>setTimeout(r,120)); }
  if(!R3D.activo()){ try{ avisar("Este dispositivo no puede mostrar el recorrido 3D."); }catch(e){} return; }
  if(window.PAISAJE) await PAISAJE.poner(true);          /* espera a que el paisaje termine de cargar */
  if(R3D.ve()!==1){ R3D.exagerar(1); document.querySelectorAll("#ve3d [data-ve]").forEach(y=>y.classList.toggle("on", y.dataset.ve==="1")); }
  D=X.datos();
  R=ruta(n);
  if(!R){ try{ avisar("No encontré la ruta por la vía hasta ese lote."); }catch(e){} return; }
  lineaCamara();
  antes=X.orbita();
  try{ if(typeof cerrarFicha==="function") cerrarFicha(); }catch(e){}
  /* el lote queda resaltado en el 3D durante la película */
  try{ if(typeof S!=="undefined"){ S.sel=n; R3D.refrescar(); } }catch(e){}
  try{ if(window.PAISAJE && PAISAJE.luz) luzAntes=PAISAJE.luz("17"); }catch(e){}
  document.body.classList.add("enRecorrido");
  montarUI(n);
  pausa=false; yawExtra=0; pitchExtra=0; piso2=false;
  const cv=X.lienzo();
  cv.addEventListener("pointerdown",pDown); addEventListener("pointermove",pMove); addEventListener("pointerup",pUp);
  cambiarFase("aereo", performance.now()); raf=requestAnimationFrame(cuadro);
  RECORRIDO.info={lote:n, largo:Math.round(largo), puntos:R.via.length, seg:Math.round((T_AEREO+dur+T_GRUA+T_BAJA)/1000)};
}
function salir(abrir){
  const n=R&&R.lote;
  if(raf) cancelAnimationFrame(raf); raf=0; R=null;
  X.camara(null);
  if(antes) X.fijarOrbita(antes);
  if(ui){ ui.remove(); ui=null; }
  if(cineEl){ cineEl.remove(); cineEl=null; }
  if(finEl){ finEl.remove(); finEl=null; }
  try{ if(luzAntes && window.PAISAJE && PAISAJE.luz) PAISAJE.luz(luzAntes); }catch(e){} luzAntes=null;
  document.body.classList.remove("enRecorrido");
  const cv=X.lienzo(); cv.removeEventListener("pointerdown",pDown); removeEventListener("pointermove",pMove); removeEventListener("pointerup",pUp);
  if(abrir && n!=null && window.seleccionarLote) setTimeout(()=>window.seleccionarLote(n),50);
}
addEventListener("keydown",e=>{ if(e.key==="Escape" && R) salir(true); });

/* ---------------- tarjeta en la ficha ---------------- */
const PLAY='<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13l11-6.5z"/></svg>';
(window.FICHA_EXTRAS=window.FICHA_EXTRAS||[]).push((p,caja)=>{
  if(!caja) return;
  css();
  const b=document.createElement("button"); b.className="recCard"; b.type="button";
  const foto=(window.MEDIOS && (MEDIOS.casa_aerea||MEDIOS.praderas)) || "medios/casa_aerea.jpg";
  b.style.backgroundImage='url("'+foto+'")';
  b.setAttribute("aria-label","Ver la película de llegada al lote "+p.lote+" en 3D");
  b.innerHTML='<span class="in"><span class="play">'+PLAY+'</span><span><small>Película 3D · 1 min</small><b>Llega al lote '+p.lote+'</b>'+
    '<span class="d">Vuelo de dron, recorrido en carro desde la portería y la vista desde el centro del lote, sobre el terreno real.</span></span></span>';
  b.onclick=()=>iniciar(p.lote);
  caja.appendChild(b);
});
const RECORRIDO = window.RECORRIDO = { diag:()=>DIAG, iniciar, salir, activo:()=>!!R, fase:()=>fase, info:null, ruta:(n)=>{ D=X.datos(); return ruta(n); } };
})();
