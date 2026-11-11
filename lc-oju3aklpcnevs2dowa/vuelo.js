/* =============================================================================
   VUELA SOBRE LAURELES — fotos aéreas reales amarradas al plano, en el 3D
   -----------------------------------------------------------------------------
   Cada dron del 3D está donde estaba la cámara cuando se tomó la foto (posición
   y orientación calculadas contra la vía interna, la casa y la carretera; ver
   datos-vuelo.js). Al tocarlo, la cámara del 3D vuela hasta ese punto y se
   funde con la foto real, con los linderos de los lotes dibujados encima y
   pintados con el estado que tiene cada lote en este momento en la base.
   El error medido de cada foto se muestra con la foto. Las fotos que no se
   pudieron amarrar con un error medido no están aquí.
   ============================================================================= */
(function(){
"use strict";
const R3D=window.__R3D; if(!R3D||!R3D.ext) return;
const X=R3D.ext;
const V="20261111b";
let datos=null, cargando=null, on=false, ultimo=null, capa=null, svgL=null, marcas=[], vista=-1, anim=0, inicio=null;

/* ---------------- datos (se cargan la primera vez que se usan) ---------------- */
function cargar(){
  if(datos) return Promise.resolve(datos);
  if(cargando) return cargando;
  cargando=new Promise((ok,mal)=>{
    const s=document.createElement("script"); s.src="datos-vuelo.js?v="+V;
    s.onload=()=>{ datos=window.__VUELO||null; datos?ok(datos):mal(new Error("sin datos")); };
    s.onerror=()=>{ cargando=null; mal(new Error("no cargó datos-vuelo.js")); };
    document.head.appendChild(s);
  });
  return cargando;
}

/* ---------------- coordenadas: lon/lat/cota -> escena del 3D ---------------- */
function escena(lon,lat,z){
  const d=X.datos(); const wx=(lon-d.lon0)*d.KX, wy=(d.lat0-lat)*d.KY;
  return [wx-d.CX, -(wy-d.CY), (z-d.ZMID)*d.ve];
}
function sueloDe(f){
  const d=X.datos(); const wx=(f.lon-d.lon0)*d.KX, wy=(d.lat0-f.lat)*d.KY;
  let h=X.alturaEn(wx,wy); if(!isFinite(h)) h=f.z-f.hs;
  return escena(f.lon,f.lat,h);
}
function proyectar(M,p){
  const w=M[3]*p[0]+M[7]*p[1]+M[11]*p[2]+M[15]; if(w<=0.0001) return null;
  return [(M[0]*p[0]+M[4]*p[1]+M[8]*p[2]+M[12])/w, (M[1]*p[0]+M[5]*p[1]+M[9]*p[2]+M[13])/w];
}
/* ojo y foco de la foto. En las cenitales la cámara mira casi recto abajo y el
   3D (que siempre pone el norte del mundo "arriba") no sabría girarla: se
   inclina el foco una pizca hacia el "arriba" de la foto para que salga igual. */
function camaraDe(f){
  const ojo=escena(f.lon,f.lat,f.z), d=X.datos();
  let a=f.fw.slice(); a[2]*=d.ve;
  if(a[2]<-0.96 && f.up){ a=[a[0]+0.15*f.up[0], a[1]+0.15*f.up[1], a[2]]; }
  const n=Math.hypot(a[0],a[1],a[2]); a=a.map(v=>v/n);
  return {ojo, foco:[ojo[0]+a[0]*80, ojo[1]+a[1]*80, ojo[2]+a[2]*80], cerca:0.5, fov:1.15};
}

/* ---------------- estilos ---------------- */
function estilos(){
  if(document.getElementById("estVuelo")) return;
  const s=document.createElement("style"); s.id="estVuelo";
  s.textContent=`
.capaVuelo{position:absolute;inset:0;z-index:5;pointer-events:none;overflow:hidden}
.capaVuelo[hidden]{display:none}
.capaVuelo svg.astas{position:absolute;inset:0;width:100%;height:100%;overflow:visible}
.dron{position:absolute;left:0;top:0;transform:translate(-50%,-50%);pointer-events:auto;cursor:pointer;
  width:46px;height:46px;border:0;padding:0;background:none;display:flex;align-items:center;justify-content:center;
  filter:drop-shadow(0 2px 4px rgba(0,0,0,.45));transition:transform .15s}
.dron:hover,.dron:focus-visible{transform:translate(-50%,-50%) scale(1.18);outline:none}
.dron:focus-visible svg circle.anillo{stroke:#F2C14E;stroke-width:3}
.dron b{position:absolute;right:-4px;bottom:-2px;min-width:18px;height:18px;border-radius:9px;background:#23291F;color:#F4F2EA;
  font:700 11px/18px system-ui,sans-serif;text-align:center;padding:0 4px}
.vf{position:fixed;inset:0;z-index:9500;background:#0D110C;color:#ECEBE4;display:flex;flex-direction:column;
  opacity:0;transition:opacity .7s ease;font-family:inherit}
.vf.on{opacity:1}
.vf[hidden]{display:none}
.vfBar{display:flex;align-items:center;gap:8px;padding:10px 16px;padding-top:calc(10px + env(safe-area-inset-top,0px));flex-wrap:wrap}
.vfT{flex:1 1 220px;min-width:0}
.vfT small{display:block;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#C9A86A;font-weight:700}
.vfT span{display:block;font-size:16px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.vf button.vb{min-height:40px;min-width:40px;padding:0 14px;border-radius:10px;border:1px solid rgba(236,235,228,.25);
  background:rgba(236,235,228,.06);color:#ECEBE4;font:600 14px system-ui,sans-serif;cursor:pointer}
.vf button.vb:hover{background:rgba(236,235,228,.14)}
.vf button.vb:focus-visible{outline:2px solid #F2C14E;outline-offset:2px}
.vf button.vb[aria-pressed="false"]{opacity:.6}
.vfZona{flex:1;min-height:0;display:flex;align-items:center;justify-content:center;padding:0 8px}
.vfMarco{position:relative;width:min(100%, calc((100vh - 150px) * 16 / 9));aspect-ratio:16/9;max-width:100%}
.vfMarco img{position:absolute;inset:0;width:100%;height:100%;object-fit:fill;display:block;border-radius:6px;transition:opacity .4s}
.vfMarco svg{position:absolute;inset:0;width:100%;height:100%;overflow:hidden;border-radius:6px}
.vfMarco svg .lt{cursor:pointer}
.vfMarco svg .lt:hover polygon{fill-opacity:.55}
.vfPie{display:flex;gap:6px 18px;align-items:center;flex-wrap:wrap;padding:10px 16px;padding-bottom:calc(10px + env(safe-area-inset-bottom,0px));font-size:13px;color:#C8C9BE}
.vfPie i{display:inline-block;width:12px;height:12px;border-radius:3px;margin-right:6px;vertical-align:-1px;border:1px solid rgba(255,255,255,.7)}
.vfPie .err{flex:1 1 260px;text-align:right}
.vfPie .err b{color:#ECEBE4}
.vfPie .baja{color:#F2C14E}
@media (max-width:640px){.vfPie .err{text-align:left}.vfMarco{width:100%}}
.vfGiro{display:none;text-align:center;font-size:13px;color:#C9A86A;padding:10px 16px 0}
@media (orientation:portrait) and (max-width:700px){.vfGiro{display:block}}
@media (prefers-reduced-motion:reduce){.vf{transition:none}}
`;
  document.head.appendChild(s);
}

/* ---------------- drones sobre el 3D ---------------- */
const ICONO='<svg width="38" height="38" viewBox="0 0 38 38" aria-hidden="true">'+
  '<circle class="anillo" cx="19" cy="19" r="17" fill="rgba(35,41,31,.78)" stroke="#F4F2EA" stroke-width="2"/>'+
  '<g stroke="#F4F2EA" stroke-width="2.2" stroke-linecap="round"><line x1="12" y1="12" x2="26" y2="26"/><line x1="26" y1="12" x2="12" y2="26"/></g>'+
  '<g fill="none" stroke="#F2C14E" stroke-width="1.8"><circle cx="11" cy="11" r="4.2"/><circle cx="27" cy="11" r="4.2"/><circle cx="11" cy="27" r="4.2"/><circle cx="27" cy="27" r="4.2"/></g>'+
  '<rect x="15.5" y="15.5" width="7" height="7" rx="2" fill="#F4F2EA"/></svg>';
function montarCapa(){
  if(capa) return;
  const c3=document.getElementById("c3d"); if(!c3) return;
  capa=document.createElement("div"); capa.className="capaVuelo"; capa.hidden=true;
  svgL=document.createElementNS("http://www.w3.org/2000/svg","svg"); svgL.setAttribute("class","astas");
  capa.appendChild(svgL);
  c3.parentNode.insertBefore(capa, document.getElementById("capa3d") ? document.getElementById("capa3d").nextSibling : c3.nextSibling);
  datos.fotos.forEach((f,i)=>{
    const b=document.createElement("button"); b.type="button"; b.className="dron";
    b.innerHTML=ICONO+"<b>"+(i+1)+"</b>";
    b.title="Foto aérea "+(i+1)+" · "+Math.round(f.hs)+" m sobre el terreno — tocar para volar ahí";
    b.setAttribute("aria-label","Volar a la foto aérea "+(i+1));
    b.onclick=ev=>{ ev.stopPropagation(); volar(i); };
    capa.appendChild(b);
    const ln=document.createElementNS("http://www.w3.org/2000/svg","line");
    ln.setAttribute("stroke","rgba(244,242,234,.75)"); ln.setAttribute("stroke-width","1.5"); ln.setAttribute("stroke-dasharray","4 4");
    svgL.appendChild(ln);
    marcas.push({b,ln,f});
  });
}
function ubicar(CTX){
  ultimo=CTX;
  if(!capa) return;
  const ver = on && R3D.activo() && !document.body.classList.contains("enRecorrido") && vista<0 && !anim;
  capa.hidden=!ver; if(!ver) return;
  const r=X.lienzo().getBoundingClientRect(), d=X.datos();
  marcas.forEach(m=>{
    const p=proyectar(CTX.M, escena(m.f.lon,m.f.lat,m.f.z)), q=proyectar(CTX.M, sueloDe(m.f));
    if(!p){ m.b.style.display="none"; m.ln.setAttribute("visibility","hidden"); return; }
    const sx=(p[0]*0.5+0.5)*r.width, sy=(1-(p[1]*0.5+0.5))*r.height;
    const fuera = sx<-30||sy<-30||sx>r.width+30||sy>r.height+30;
    m.b.style.display=fuera?"none":"flex"; m.b.style.left=sx+"px"; m.b.style.top=sy+"px";
    if(q && !fuera){
      m.ln.setAttribute("x1",sx); m.ln.setAttribute("y1",sy);
      m.ln.setAttribute("x2",(q[0]*0.5+0.5)*r.width); m.ln.setAttribute("y2",(1-(q[1]*0.5+0.5))*r.height);
      m.ln.setAttribute("visibility","visible");
    } else m.ln.setAttribute("visibility","hidden");
  });
}

/* ---------------- vuelo de cámara ---------------- */
const suave=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
const lerp=(a,b,t)=>a+(b-a)*t, lerp3=(a,b,t)=>[lerp(a[0],b[0],t),lerp(a[1],b[1],t),lerp(a[2],b[2],t)];
function animar(de,a,ms,arco,listo){
  cancelAnimationFrame(anim); const t0=performance.now();
  const paso=ts=>{
    let t=Math.min(1,(ts-t0)/ms); const e=suave(t);
    const ojo=lerp3(de.ojo,a.ojo,e); ojo[2]+=arco*Math.sin(Math.PI*e);
    X.camara({ojo, foco:lerp3(de.foco,a.foco,e), cerca:0.5, fov:lerp(de.fov||0.85,a.fov||0.85,e)});
    if(t<1) anim=requestAnimationFrame(paso); else { anim=0; listo&&listo(); }
  };
  if(matchMedia("(prefers-reduced-motion: reduce)").matches) ms=1;
  anim=requestAnimationFrame(paso);
}
function camaraActual(){
  if(ultimo) return {ojo:ultimo.E.slice(), foco:ultimo.F.slice(), fov:ultimo.fov};
  return null;
}
function volar(i){
  if(anim) return;
  const de=camaraActual(); if(!de) return;
  if(!inicio) inicio=de;
  const a=camaraDe(datos.fotos[i]);
  const dist=Math.hypot(a.ojo[0]-de.ojo[0],a.ojo[1]-de.ojo[1]);
  capa.hidden=true;
  animar(de,a,Math.min(3600,1600+dist*1.6),Math.min(220,dist*0.18),()=>abrirFoto(i));
}

/* ---------------- la foto con los lotes ---------------- */
let vf=null;
function colorDe(n){
  const M=window.__MAPA; const f=M && M.LOTES.features.find(x=>x.properties.lote===n);
  if(!f) return {c:"#8A8F82",e:null};
  const c=(typeof window.colorLote==="function") ? window.colorLote(f.properties) : "#8A8F82";
  return {c, e:f.properties.estado};
}
const fmt=v=>(Math.round(v*10)/10).toFixed(1).replace(".",",");
function montarVisor(){
  if(vf) return;
  vf=document.createElement("div"); vf.className="vf"; vf.hidden=true;
  vf.setAttribute("role","dialog"); vf.setAttribute("aria-modal","true"); vf.setAttribute("aria-label","Foto aérea real con los lotes");
  vf.innerHTML=
   '<div class="vfBar"><div class="vfT"><small>Vuela sobre Laureles</small><span id="vfTit"></span></div>'+
   '<button type="button" class="vb" id="vfAnt" aria-label="Foto anterior">&#8249;</button>'+
   '<button type="button" class="vb" id="vfSig" aria-label="Foto siguiente">&#8250;</button>'+
   '<button type="button" class="vb" id="vfLot" aria-pressed="true">Lotes</button>'+
   '<button type="button" class="vb" id="vfCer">Volver al 3D</button></div>'+
   '<div class="vfGiro">Gira el teléfono para ver la foto más grande</div>'+
   '<div class="vfZona"><div class="vfMarco"><img id="vfImg" alt=""><svg id="vfSvg" viewBox="0 0 1280 720" preserveAspectRatio="none"></svg></div></div>'+
   '<div class="vfPie" id="vfPie"></div>';
  document.body.appendChild(vf);
  vf.querySelector("#vfCer").onclick=cerrarFoto;
  vf.querySelector("#vfAnt").onclick=()=>irA(vista-1);
  vf.querySelector("#vfSig").onclick=()=>irA(vista+1);
  const bl=vf.querySelector("#vfLot");
  bl.onclick=()=>{ const v=bl.getAttribute("aria-pressed")!=="true"; bl.setAttribute("aria-pressed",v); vf.querySelector("#vfSvg").style.display=v?"":"none"; };
  document.addEventListener("keydown",ev=>{
    if(!vf || vf.hidden) return;
    if(ev.key==="Escape") cerrarFoto();
    else if(ev.key==="ArrowRight") irA(vista+1);
    else if(ev.key==="ArrowLeft") irA(vista-1);
  });
}
function pintarFoto(i){
  const f=datos.fotos[i], N=datos.fotos.length;
  vf.querySelector("#vfTit").textContent="Foto "+(i+1)+" de "+N+" · "+Math.round(f.hs)+" m sobre el terreno";
  const img=vf.querySelector("#vfImg"); img.src=f.img+"?v="+V; img.alt="Foto aérea real "+(i+1)+" de Laureles Campestre, "+datos.fecha;
  const svg=vf.querySelector("#vfSvg"), NS="http://www.w3.org/2000/svg";
  svg.innerHTML="";
  const cuenta={};
  f.lotes.forEach(L=>{
    const {c,e}=colorDe(L.n); cuenta[e]=(cuenta[e]||0)+1;
    const g=document.createElementNS(NS,"g"); g.setAttribute("class","lt");
    const tt=document.createElementNS(NS,"title"); tt.textContent="Lote "+L.n+" — tocar para abrir su ficha"; g.appendChild(tt);
    L.p.forEach(pl=>{
      const pg=document.createElementNS(NS,"polygon");
      pg.setAttribute("points",pl.map(q=>q[0]+","+q[1]).join(" "));
      pg.setAttribute("fill",c); pg.setAttribute("fill-opacity",".30");
      pg.setAttribute("stroke","#FFFFFF"); pg.setAttribute("stroke-opacity",".9"); pg.setAttribute("stroke-width","1.6");
      pg.setAttribute("stroke-linejoin","round"); pg.setAttribute("vector-effect","non-scaling-stroke");
      g.appendChild(pg);
    });
    if(L.c){
      const ci=document.createElementNS(NS,"circle"); ci.setAttribute("cx",L.c[0]); ci.setAttribute("cy",L.c[1]); ci.setAttribute("r","11");
      ci.setAttribute("fill",c); ci.setAttribute("stroke","#FFFFFF"); ci.setAttribute("stroke-width","1.6"); g.appendChild(ci);
      const tx=document.createElementNS(NS,"text"); tx.setAttribute("x",L.c[0]); tx.setAttribute("y",L.c[1]+4);
      tx.setAttribute("text-anchor","middle"); tx.setAttribute("font-size","11.5"); tx.setAttribute("font-weight","700");
      tx.setAttribute("font-family","system-ui,sans-serif"); tx.setAttribute("fill","#FFFFFF"); tx.textContent=L.n; g.appendChild(tx);
    }
    g.addEventListener("click",ev=>{ ev.stopPropagation(); const n=L.n; cerrarFoto(true); setTimeout(()=>{ try{ window.abrirLote(n); }catch(e){} },80); });
    svg.appendChild(g);
  });
  const M=window.__MAPA, E=(M&&M.ESTADOS)||{};
  const ley=Object.keys(E).map(k=>'<span><i style="background:'+E[k].c+'"></i>'+E[k].t+'</span>').join("");
  const baja=f.err>5;
  vf.querySelector("#vfPie").innerHTML=ley+
    '<span class="err">Foto real, '+datos.fecha+'. Linderos amarrados a la foto: error medido <b>'+fmt(f.err)+' m</b> (mediana)'+
    (baja?' <span class="baja">· precisión baja</span>':'')+(f.radio?' · lotes dibujados hasta '+f.radio+' m de la cámara':'')+'</span>';
}
function abrirFoto(i){
  montarVisor(); vista=i; pintarFoto(i);
  vf.hidden=false; requestAnimationFrame(()=>vf.classList.add("on"));
  try{ vf.querySelector("#vfCer").focus(); }catch(e){}
}
function irA(i){
  const N=datos.fotos.length; i=(i+N)%N; vista=i;
  X.camara(camaraDe(datos.fotos[i])); pintarFoto(i);
}
function cerrarFoto(sinVuelta){
  if(!vf || vf.hidden) return;
  vf.classList.remove("on");
  setTimeout(()=>{ vf.hidden=true; }, 450);
  const de=camaraDe(datos.fotos[vista]); vista=-1;
  const fin=()=>{ X.camara(null); inicio=null; X.pedir(); };
  if(sinVuelta || !inicio){ fin(); return; }
  animar(de,inicio,1500,60,fin);
}

/* ---------------- botón en la barra del relieve ---------------- */
let bV=null;
function pintarBoton(t){ if(bV){ bV.classList.toggle("on",on); bV.textContent=t||"Vuelo"; } }
async function poner(v){
  on=!!v; pintarBoton(on&&!datos?"Vuelo…":null);
  if(on){
    try{ await cargar(); }catch(e){ on=false; pintarBoton(); try{ avisar("No se pudieron cargar las fotos del vuelo. Revisa la conexión.",5000); }catch(_){} return; }
    estilos(); montarCapa();
    if(R3D.ve()!==1 && R3D.exagerar(1)) document.querySelectorAll("#ve3d [data-ve]").forEach(y=>y.classList.toggle("on", y.dataset.ve==="1"));
    X.agregar(ubicar);
  } else {
    X.quitar(ubicar); if(capa) capa.hidden=true;
  }
  pintarBoton(); X.pedir();
}
function montar(){
  const ctl=document.getElementById("ve3d"); if(!ctl || document.getElementById("ve3dVuelo")) return;
  bV=document.createElement("button"); bV.id="ve3dVuelo"; bV.type="button";
  bV.title="Vuela sobre Laureles: fotos aéreas reales en el punto exacto donde se tomaron, con los lotes encima";
  bV.onclick=()=>poner(!on);
  const et=ctl.querySelector(".et"); ctl.insertBefore(bV, et);
  pintarBoton();
  /* al apagar el 3D se esconden los drones */
  const b3=document.getElementById("b3d");
  if(b3) b3.addEventListener("click",()=>setTimeout(()=>{ if(!R3D.activo() && capa) capa.hidden=true; },80));
}
window.VUELO={ poner, activo:()=>on, volar:i=>{ if(datos) volar(i); } };
if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",montar); else montar();
})();
