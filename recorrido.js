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

/* ---------------- animación ---------------- */
let R=null, raf=0, t0=0, pausa=false, tPausa=0, fase="via", yawExtra=0, pitchExtra=0, piso2=false, ui=null, largo=0, dur=0, vistaT0=0;
function lineaCamara(){
  const via=R.via, alts=via.map(p=>altura(p[0],p[1]));
  let ult=null; for(let i=0;i<alts.length;i++){ if(alts[i]==null) alts[i]=ult; else ult=alts[i]; }
  for(let i=alts.length-1;i>=0;i--){ if(alts[i]==null) alts[i]=ult; else ult=alts[i]; }
  /* suavizado: el carro no salta con cada nodo de la malla */
  const s=alts.map((_,i)=>{ let a=0,n=0; for(let k=-4;k<=4;k++){ const v=alts[Math.max(0,Math.min(alts.length-1,i+k))]; if(v!=null){a+=v;n++;} } return n?a/n:D.ZMID; });
  R.alts=s; R.acum=[0]; for(let i=1;i<via.length;i++) R.acum.push(R.acum[i-1]+Math.hypot(via[i][0]-via[i-1][0],via[i][1]-via[i-1][1]));
  largo=R.acum[R.acum.length-1];
  dur=Math.max(10,Math.min(30,largo/16))*1000;      /* ~58 km/h, con tope para no aburrir */
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
function cuadro(ts){
  raf=0; if(!R) return;
  if(pausa){ tPausa=ts; X.camara(camaraActual(tPausa)); return; }
  X.camara(camaraActual(ts));
  raf=requestAnimationFrame(cuadro);
}
function camaraActual(ts){
  const ve=D.ve;
  const trans=ts-t0;
  if(fase==="via"){
    const f=Math.min(1,trans/dur), e=f<0.5?2*f*f:1-Math.pow(-2*f+2,2)/2;
    const s=e*largo, p=enVia(s), q=enVia(s+22);
    const ojo=aEscena(p[0],p[1],p[2]+OJO_CARRO), foco=aEscena(q[0],q[1],q[2]+OJO_CARRO-1.2);
    const yaw=Math.atan2(foco[0]-ojo[0], foco[1]-ojo[1])+yawExtra, pitch=Math.atan2(foco[2]-ojo[2], Math.hypot(foco[0]-ojo[0],foco[1]-ojo[1]))+pitchExtra;
    progreso(f*0.8);
    if(f>=1){ fase="camina"; t0=ts; R.yawFin=yaw; }
    return {ojo, foco:mirarDesde(ojo,yaw,pitch), cerca:0.5, fov:1.05};
  }
  if(fase==="camina"){
    const f=Math.min(1,trans/4200), e=f*f*(3-2*f);
    const a=R.frente, b=R.vista;
    const x=a[0]+(b[0]-a[0])*e, y=a[1]+(b[1]-a[1])*e;
    const h=altura(x,y) ?? R.alts[R.alts.length-1];
    const ojo=aEscena(x,y,h+OJO_CARRO+(OJO_PIE-OJO_CARRO)*e);
    const destino=aEscena(b[0],b[1],h+OJO_PIE);
    const yaw0=R.yawFin, yaw1=Math.atan2(destino[0]-aEscena(a[0],a[1],0)[0], destino[1]-aEscena(a[0],a[1],0)[1]);
    let dy=yaw1-yaw0; while(dy>Math.PI) dy-=2*Math.PI; while(dy<-Math.PI) dy+=2*Math.PI;
    const yaw=yaw0+dy*Math.min(1,f*1.6)+yawExtra;
    progreso(0.8+0.2*f);
    if(f>=1){ fase="vista"; t0=ts; R.yawVista=yaw-yawExtra; vistaT0=ts; mostrarFin(); }
    return {ojo, foco:mirarDesde(ojo,yaw,-0.03+pitchExtra), cerca:0.4, fov:1.05};
  }
  /* en el lote: gira despacio para mostrar la vista completa */
  const b=R.vista, h=altura(b[0],b[1]) ?? R.alts[R.alts.length-1];
  const ojo=aEscena(b[0],b[1],h+(piso2?OJO_PISO2:OJO_PIE));
  const yaw=R.yawVista + (ts-vistaT0)/1000*0.12 + yawExtra;
  return {ojo, foco:mirarDesde(ojo,yaw,0.02+pitchExtra), cerca:0.4, fov:1.1};
}

/* ---------------- interfaz ---------------- */
function css(){
  if(document.getElementById("recCss")) return;
  const s=document.createElement("style"); s.id="recCss";
  s.textContent=`
.recUI{position:absolute;left:50%;transform:translateX(-50%);top:14px;z-index:12;display:flex;flex-direction:column;align-items:center;gap:8px;
  width:min(560px,calc(100% - 32px));pointer-events:none}
.recUI .recBar{pointer-events:auto;display:flex;align-items:center;gap:6px;background:rgba(28,34,27,.78);color:#F6F4EC;border-radius:999px;
  padding:6px 6px 6px 16px;backdrop-filter:blur(8px);box-shadow:0 8px 24px rgba(0,0,0,.25);max-width:100%}
.recUI .recTt{font-size:13px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.recUI .recTt small{font-weight:500;opacity:.75;margin-left:6px}
.recUI button{border:0;height:auto;line-height:1.2;min-width:0;box-shadow:none;border-radius:999px;padding:8px 13px;font:600 12.5px var(--sans,sans-serif);cursor:pointer;background:rgba(246,244,236,.14);color:#F6F4EC;white-space:nowrap}
.recUI button:hover{background:rgba(246,244,236,.26)}
.recUI button.pri{background:#EBD9AE;color:#32402F}
.recUI .recProg{width:100%;height:3px;border-radius:3px;background:rgba(255,255,255,.35);overflow:hidden}
.recUI .recProg i{display:block;height:100%;width:0;background:#EBD9AE;transition:width .2s linear}
.recUI .recNota{pointer-events:auto;background:rgba(246,244,236,.94);color:#1C221B;border-radius:12px;padding:10px 14px;font-size:12.5px;line-height:1.45;
  box-shadow:0 8px 24px rgba(0,0,0,.18);max-width:100%}
.recUI .recNota b{color:#32402F}
@media (max-width:600px){ .recUI{top:10px} .recUI .recTt small{display:none} .recUI button{padding:8px 10px} }
body.enRecorrido #capa3d{visibility:hidden}
body.enRecorrido .ve3d, body.enRecorrido .fondos, body.enRecorrido .rail{visibility:hidden}`;
  document.head.appendChild(s);
}
function progreso(f){ const i=ui&&ui.querySelector(".recProg i"); if(i) i.style.width=(f*100).toFixed(1)+"%"; }
function montarUI(n){
  css();
  const main=document.querySelector("main")||document.body;
  ui=document.createElement("div"); ui.className="recUI";
  ui.innerHTML='<div class="recBar"><span class="recTt">Llegando al lote '+n+'<small>desde la portería</small></span>'+
    '<button id="recPausa">Pausa</button><button id="recSaltar">Saltar</button><button class="pri" id="recSalir">Salir</button></div>'+
    '<div class="recProg"><i></i></div>';
  main.appendChild(ui);
  ui.querySelector("#recPausa").onclick=()=>{ pausa=!pausa; ui.querySelector("#recPausa").textContent=pausa?"Seguir":"Pausa";
    if(!pausa){ const ahora=performance.now(); t0+=ahora-tPausa; if(fase==="vista") vistaT0+=ahora-tPausa; raf=requestAnimationFrame(cuadro); } else tPausa=performance.now(); };
  ui.querySelector("#recSaltar").onclick=()=>{ if(fase==="via"){ t0=performance.now()-dur; } else if(fase==="camina"){ t0=performance.now()-4200; } };
  ui.querySelector("#recSalir").onclick=()=>salir(true);
}
function mostrarFin(){
  if(!ui) return;
  const L=D.DATA.lotes.find(l=>l.n===R.lote);
  const f=window.__MAPA && __MAPA.LOTES.features.find(x=>x.properties.lote===R.lote);
  const vista=f && f.properties.topo_ok ? " La ladera mira al "+f.properties.vista_hacia+"." : "";
  ui.querySelector(".recTt").innerHTML='Lote '+R.lote+'<small>a 1,6 m del suelo</small>';
  ui.querySelector("#recSaltar").textContent="Segundo piso";
  ui.querySelector("#recSaltar").onclick=()=>{ piso2=!piso2; ui.querySelector("#recSaltar").textContent=piso2?"A nivel del suelo":"Segundo piso";
    ui.querySelector(".recTt small").textContent=piso2?"a 4,5 m (segundo piso)":"a 1,6 m del suelo"; if(pausa) X.camara(camaraActual(tPausa)); };
  const nota=document.createElement("div"); nota.className="recNota";
  nota.innerHTML='<b>Estás en el centro del lote '+R.lote+'.</b> Gira arrastrando.'+vista+
    ' El terreno es el levantamiento; la foto, la del dron; los árboles de la ronda son representativos.';
  ui.appendChild(nota);
  void L;
}
/* mirar alrededor arrastrando */
let arr=null;
function pDown(e){ if(!R) return; arr={x:e.clientX,y:e.clientY,yaw:yawExtra,pitch:pitchExtra}; }
function pMove(e){ if(!R||!arr) return; yawExtra=arr.yaw-(e.clientX-arr.x)*0.005; pitchExtra=Math.max(-0.9,Math.min(0.8,arr.pitch+(e.clientY-arr.y)*0.004)); if(pausa) X.camara(camaraActual(tPausa)); }
function pUp(){ arr=null; }

let antes=null;
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
  document.body.classList.add("enRecorrido");
  montarUI(n);
  fase="via"; pausa=false; yawExtra=0; pitchExtra=0; piso2=false;
  const cv=X.lienzo();
  cv.addEventListener("pointerdown",pDown); addEventListener("pointermove",pMove); addEventListener("pointerup",pUp);
  t0=performance.now(); raf=requestAnimationFrame(cuadro);
  RECORRIDO.info={lote:n, largo:Math.round(largo), puntos:R.via.length, seg:Math.round(dur/1000)};
}
function salir(abrir){
  const n=R&&R.lote;
  if(raf) cancelAnimationFrame(raf); raf=0; R=null;
  X.camara(null);
  if(antes) X.fijarOrbita(antes);
  if(ui){ ui.remove(); ui=null; }
  document.body.classList.remove("enRecorrido");
  const cv=X.lienzo(); cv.removeEventListener("pointerdown",pDown); removeEventListener("pointermove",pMove); removeEventListener("pointerup",pUp);
  if(abrir && n!=null && window.seleccionarLote) setTimeout(()=>window.seleccionarLote(n),50);
}
addEventListener("keydown",e=>{ if(e.key==="Escape" && R) salir(true); });

/* ---------------- tarjeta en la ficha ---------------- */
const ICONO='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20l5-16h6l5 16"/><path d="M12 6v2.5M12 11v2.5M12 16v2.5"/></svg>';
(window.FICHA_EXTRAS=window.FICHA_EXTRAS||[]).push((p,caja)=>{
  if(!caja) return;
  const b=document.createElement("button"); b.className="fxCard"; b.type="button";
  b.innerHTML='<span class="ic">'+ICONO+'</span><span><b>Llega a este lote en 3D</b><span>Recorrido desde la portería por la vía, y la vista desde el centro del lote</span></span>';
  b.onclick=()=>iniciar(p.lote);
  caja.appendChild(b);
});
const RECORRIDO = window.RECORRIDO = { diag:()=>DIAG, iniciar, salir, activo:()=>!!R, info:null, ruta:(n)=>{ D=X.datos(); return ruta(n); } };
})();
