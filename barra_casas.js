/* =============================================================================
   BARRA DE CASAS EN 3D
   Aparece sólo con el relieve encendido y se apila DEBAJO de la barra del
   relieve, nunca encima: cada una tiene su fila y su propio hueco.

   Deja escoger entre los tres tipos reales del proyecto —199,6 · 228,7 · 316 m²,
   todos con 35,5 m² de parqueadero y 4,00 m de altura— y, cuando el lote
   escogido es uno de los siete de ladera (47 a 53), añade los dos modelos en
   terraza, que son los únicos con nivel inferior.

   La barra se arma aquí, en JavaScript, y no en el HTML del mapa: así el mapa
   no cambia ni una línea y la barra sólo existe si el motor de relieve la
   soporta. Si el motor no expone tipos, no se dibuja nada.
   ============================================================================= */
(function(){
"use strict";
const R3D = window.__R3D;
if(!R3D || typeof R3D.tipos!=="function"){ return; }
const ve3d = document.getElementById("ve3d");
if(!ve3d || !ve3d.parentNode) return;

const est = document.createElement("style");
est.textContent =
 ".casa3d{position:absolute;left:16px;bottom:60px;z-index:4;display:flex;align-items:center;"+
 "gap:2px;flex-wrap:wrap;max-width:calc(100% - 32px);background:var(--glass);"+
 "backdrop-filter:blur(10px);border:1px solid var(--line);border-radius:var(--r-sm);"+
 "box-shadow:var(--shadow-sm);padding:4px;font-size:11.5px}"+
 ".casa3d[hidden]{display:none}"+
 ".casa3d .et{padding:0 8px 0 6px;color:var(--muted);letter-spacing:.04em;"+
 "text-transform:uppercase;font-size:10px;white-space:nowrap}"+
 ".casa3d button{border:0;background:transparent;color:var(--ink-2);cursor:pointer;"+
 "padding:5px 9px;border-radius:6px;font:inherit;font-weight:600;white-space:nowrap}"+
 ".casa3d button.on{background:var(--forest);color:var(--on-forest)}"+
 ".casa3d button:hover:not(.on){background:var(--surface-2)}"+
 ".casa3d .sep{width:1px;height:18px;background:var(--line);margin:0 4px}"+
 ".casa3d .pie{padding:0 8px;color:var(--muted);font-size:10px;white-space:nowrap}"+
 "@media (max-width:820px){.casa3d{left:12px;bottom:56px;font-size:11px}}";
document.head.appendChild(est);

const bar = document.createElement("div");
bar.className = "casa3d"; bar.id = "casa3d"; bar.hidden = true;
ve3d.parentNode.insertBefore(bar, ve3d.nextSibling);

function loteActual(){
  try{ const EXT=window.__ANL_EXT; return EXT && EXT.state ? EXT.state.sel : null; }catch(e){ return null; }
}
function pintar(){
  const n = loteActual();
  const terraza = n!=null && R3D.esTerraza && R3D.esTerraza(n);
  const act = R3D.tipo();
  let h = '<span class="et">Casa</span>';
  R3D.tipos().forEach(t=>{
    h += '<button data-t="'+t.k+'"'+(act===t.k?' class="on"':'')+
         ' title="'+t.area+' m² construidos + 35,5 m² de parqueadero, 4,00 m de altura">'+t.et+'</button>';
  });
  if(terraza){
    h += '<span class="sep"></span>';
    R3D.tiposTerraza().forEach(t=>{
      h += '<button data-t="'+t.k+'"'+(act===t.k?' class="on"':'')+
           ' title="Modelo en terraza, sólo para los lotes 47 a 53">'+t.et+'</button>';
    });
  }
  h += '<span class="sep"></span><button data-t="">Sin casa</button>';
  h += '<span class="pie">volumen de simulación</span>';
  bar.innerHTML = h;
  requestAnimationFrame(colocar);
  bar.querySelectorAll("button[data-t]").forEach(b=>{
    b.onclick = ()=>{
      const k = b.dataset.t;
      if(!k){ R3D.quitarCasa(); bar.querySelectorAll("button").forEach(x=>x.classList.remove("on")); return; }
      R3D.ponerTipo(k);
      const m = loteActual();
      if(m!=null) R3D.casa(m,null,null);
      pintar();
    };
  });
}
/* La barra del relieve no está en el mismo sitio en el plano vivo y en el mapa
   web. En vez de fijar una posición a mano —que en uno de los dos queda debajo
   del panel—, la barra de casas se cuelga de donde de verdad esté la del
   relieve y se pone justo encima, con su propio hueco. */
let fondoAntes = null;
function colocar(){
  const r = ve3d.getBoundingClientRect();
  const cont = bar.offsetParent || document.body;
  const rc = cont.getBoundingClientRect();
  if(!r.width) return;
  bar.style.left = (r.left - rc.left) + "px";
  bar.style.right = "auto";
  bar.style.bottom = (rc.bottom - r.top + 8) + "px";
  /* La barra de fondos del mapa —Plano · Mapa · Satélite · Oscuro— vive en el
     mismo rincón de abajo y quedaba justo debajo de la del relieve, medio
     tapada. Se sube por encima de las dos, con su propio hueco. */
  const f = document.querySelector(".fondos");
  if(!f) return;
  if(fondoAntes === null) fondoAntes = f.style.bottom || "";
  if(bar.hidden){ f.style.bottom = fondoAntes; return; }
  const rb = bar.getBoundingClientRect();
  if(rb.height) f.style.bottom = (rc.bottom - rb.top + 10) + "px";
}
function mostrar(){
  const on = R3D.activo();
  bar.hidden = !on;
  const st=document.querySelector(".stage")||document.querySelector("main");
  if(st) st.classList.toggle("concasa", on);
  if(on){ pintar(); requestAnimationFrame(colocar); }
  else requestAnimationFrame(colocar);
}
addEventListener("resize", ()=>{ if(!bar.hidden) colocar(); });
/* la barra sigue al botón 3D y al lote escogido, sin tocar su código */
const b3d = document.getElementById("b3d");
if(b3d){ const prev=b3d.onclick;
  b3d.onclick = function(e){ const r = prev ? prev.call(this,e) : undefined;
                             setTimeout(mostrar,0); return r; }; }
if(typeof window.pintarFicha==="function"){
  const prev=window.pintarFicha;
  window.pintarFicha=function(){ const r=prev.apply(this,arguments);
                                 if(R3D.activo()) pintar(); return r; };
}
if(typeof window.cerrarFicha==="function"){
  const prev=window.cerrarFicha;
  window.cerrarFicha=function(){ const r=prev.apply(this,arguments);
                                 if(R3D.activo()) pintar(); return r; };
}
window.__BARRA_CASAS = {pintar, mostrar, colocar};
})();
