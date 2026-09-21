/* =============================================================================
   DISEÑA LA CASA CON IA  (sólo administradores y asesores)
   -----------------------------------------------------------------------------
   El asesor escribe en palabras lo que quiere el cliente; la Edge Function
   laureles-ia (Supabase) se lo pasa a Claude con la ficha REAL del lote y
   devuelve bloques en metros. Aquí se validan contra la envolvente y el 30 %
   —las cuentas las hace este archivo, no la IA— y se dibujan en el relieve 3D
   con el mismo motor que la Casa 30JB.

   La propuesta se guarda en Supabase (laureles_ia_casas) y analisis.js la
   lleva a la planta, el isométrico, la sombra, la tabla de áreas y el PDF.
   La llave de Anthropic vive en Supabase como secreto; esta página sólo manda
   la sesión del administrador.
   ============================================================================= */
(function(){
"use strict";
const R3D = window.__R3D;
if(!R3D || typeof window.pintarFicha!=="function") return;

const REF_W = 22.4, REF_D = 28.4;                 /* marco de referencia de CASA30 */
const idioma = ()=>{ try{ return window.ANALISIS && ANALISIS.lang ? ANALISIS.lang() : "es"; }catch(e){ return "es"; } };
const tt = (es,en,fr)=>{ const l=idioma(); return l==="en"?(en||es):l==="fr"?(fr||en||es):es; };
const esc = s=>String(s==null?"":s).replace(/[<>&"]/g, c=>({"<":"&lt;",">":"&gt;","&":"&amp;",'"':"&quot;"}[c]));
const ent = n=>Math.round(n).toLocaleString("es-CO");
const dec1 = n=>(Math.round(n*10)/10).toLocaleString("es-CO",{minimumFractionDigits:1,maximumFractionDigits:1});

/* ------------------------------ estilos ------------------------------- */
const est = document.createElement("style");
est.textContent =
 ".ficha .ff .anlBtn.ia{background:#7A5A23;border-color:#7A5A23}"+
 ".ficha .ff .anlBtn.ia:hover{background:#94702E}"+
 ".iaPanel{position:absolute;left:16px;bottom:118px;z-index:6;width:360px;max-width:calc(100% - 32px);"+
 "max-height:min(70vh,640px);display:flex;flex-direction:column;background:var(--surface,#FFFDF6);"+
 "border:1px solid var(--line);border-radius:var(--r-sm,10px);box-shadow:var(--shadow-md,0 8px 28px rgba(0,0,0,.18));"+
 "font-size:12.5px;color:var(--ink-2)}"+
 ".iaPanel[hidden]{display:none}"+
 ".iaPanel .cab{display:flex;align-items:center;gap:8px;padding:9px 12px;border-bottom:1px solid var(--line)}"+
 ".iaPanel .cab b{font-size:12.5px;letter-spacing:.04em;text-transform:uppercase;color:var(--forest)}"+
 ".iaPanel .cab .lote{margin-left:auto;color:var(--muted);font-size:11.5px}"+
 ".iaPanel .cab button{border:0;background:transparent;font-size:18px;line-height:1;cursor:pointer;color:var(--muted);padding:0 2px}"+
 ".iaPanel .hilo{flex:1;overflow:auto;padding:10px 12px;display:flex;flex-direction:column;gap:8px}"+
 ".iaPanel .m{max-width:92%;padding:8px 10px;border-radius:10px;line-height:1.45;white-space:pre-wrap}"+
 ".iaPanel .m.yo{align-self:flex-end;background:var(--forest);color:#F4F2EA;border-bottom-right-radius:3px}"+
 ".iaPanel .m.ia{align-self:flex-start;background:var(--surface-2,#F1EFE6);border-bottom-left-radius:3px}"+
 ".iaPanel .m.err{align-self:stretch;background:#FBECE7;color:#7A2E1B;border:1px solid #E7BFB2}"+
 ".iaPanel .cifras{display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-top:8px}"+
 ".iaPanel .cifras div{background:rgba(0,0,0,.04);border-radius:6px;padding:6px 8px}"+
 ".iaPanel .cifras b{display:block;font-size:14px;font-variant-numeric:tabular-nums}"+
 ".iaPanel .cifras small{color:var(--muted);font-size:10.5px;text-transform:uppercase;letter-spacing:.04em}"+
 ".iaPanel .cifras .mal b{color:#A3341C}"+
 ".iaPanel .cifras .bien b{color:#2F6B3C}"+
 ".iaPanel .adv{margin:6px 0 0;padding-left:16px;color:#7A5A23}"+
 ".iaPanel .chips{display:flex;flex-wrap:wrap;gap:5px;padding:0 12px 8px}"+
 ".iaPanel .chips button{border:1px solid var(--line);background:transparent;border-radius:999px;padding:4px 9px;"+
 "font:inherit;font-size:11.5px;cursor:pointer;color:var(--ink-2)}"+
 ".iaPanel .chips button:hover{background:var(--surface-2,#F1EFE6)}"+
 ".iaPanel form{display:flex;gap:6px;padding:8px 12px;border-top:1px solid var(--line)}"+
 ".iaPanel textarea{flex:1;resize:none;height:54px;border:1px solid var(--line);border-radius:8px;padding:7px 9px;"+
 "font:inherit;font-size:12.5px;background:var(--surface,#fff);color:var(--ink)}"+
 ".iaPanel form button{border:0;background:#7A5A23;color:#F4F2EA;border-radius:8px;padding:0 14px;font:inherit;"+
 "font-weight:600;cursor:pointer}"+
 ".iaPanel form button:disabled{opacity:.55;cursor:wait}"+
 ".iaPanel .pie{padding:6px 12px 8px;color:var(--muted);font-size:10.5px;line-height:1.4}"+
 "@media (max-width:820px){.iaPanel{left:12px;right:12px;width:auto;max-width:none;bottom:120px;max-height:52vh}}";
document.head.appendChild(est);

/* ------------------------------ estado -------------------------------- */
let lote = null, historial = [], ocupado = false, conversacion = [];
const panel = document.createElement("div");
panel.className = "iaPanel"; panel.id = "iaPanel"; panel.hidden = true;
(document.querySelector(".stage")||document.querySelector("main")||document.body).appendChild(panel);

const CFGp = ()=>(typeof CFG!=="undefined" && CFG) || {};
const base = ()=>(CFGp().supabaseUrl||"").replace(/\/$/,"");

/* ------------------------- la ficha real del lote --------------------- */
function rumbo8(dx,dy){                     /* PX: x al oriente, y al sur */
  const b = (Math.atan2(dx,-dy)*180/Math.PI+360)%360;
  const d = ["norte","nororiente","oriente","suroriente","sur","suroccidente","occidente","noroccidente"];
  return d[Math.round(b/45)%8]+" ("+Math.round(b)+"°)";
}
function fichaReal(n){
  const F = ((typeof LAURELES!=="undefined" && LAURELES.lotes && LAURELES.lotes.features)||[]).find(f=>f.properties.lote===n);
  const p = F ? F.properties : null;
  const A = (window.__IMPL||{})[String(n)];
  if(!p || !A || !A.k || !A.k.o) return null;
  /* La IA trabaja con la envolvente MÁS GRANDE que cupo en el lote (la del
     tipo de 316 m², 22,4 × 28,4 m, donde cabe), no con la del tamaño que esté
     escogido en el selector: con la de 200 m² la IA se quedaba sin sitio para
     lo que pedía el cliente. Se deja puesta en A.k mientras haya casa de IA,
     para que el 3D, la planta y el PDF hablen de la misma envolvente. */
  if(A.ks){
    let mejor=null, area=0;
    for(const k in A.ks){ const v=A.ks[k]; if(!v||!v.o) continue; const a=v.L*(v.Dc||v.A||0); if(a>area){area=a; mejor=v;} }
    if(mejor && mejor!==A.k){ if(!A._kAntes) A._kAntes=A.k; A.k=mejor; A.env=+Object.keys(A.ks).find(k=>A.ks[k]===mejor)||A.env; }
  }
  const K = A.k;
  const ut = p.area_util_m2;
  return {
    lote: n,
    area_util_m2: ut,
    construible_30pct_m2: Math.round(0.30*ut),
    envolvente_m: { L: K.L, Dc: K.Dc||REF_D, nota:"rectángulo que cupo tras los aislamientos; v=0 hacia la vía" },
    rumbo_eje_u_ancho: rumbo8(K.ux[0],K.ux[1]),
    rumbo_eje_v_fondo: rumbo8(K.uv[0],K.uv[1]),
    vista_hacia: p.vista_hacia || "NO_DISPONIBLE",
    pendiente: A.pend || (p.pendiente_pct!=null ? p.pendiente_pct+" %" : "NO_DISPONIBLE"),
    desnivel_m: p.desnivel_m,
    cotas_msnm: A.cota || null,
    cota_acceso_msnm: K.z,
    frente_m: p.frente_m, fondo_m: p.fondo_m, esquina: !!p.esquina,
    implantacion: K.mod==="2p" ? "dos niveles escalonados ladera abajo" : "una plataforma",
    banqueo: { corte_m3: K.co, lleno_m3: K.ll }
  };
}

/* ------------------------- validar y convertir ------------------------ */
function validar(cfg, f){
  const L = f.envolvente_m.L, D = f.envolvente_m.Dc, cap = f.construible_30pct_m2;
  const adv = [];
  const bl = [];
  (cfg.bloques||[]).slice(0,14).forEach(b=>{
    let u0=+b.u0,u1=+b.u1,v0=+b.v0,v1=+b.v1;
    if(!isFinite(u0+u1+v0+v1)) return;
    if(u0>u1)[u0,u1]=[u1,u0]; if(v0>v1)[v0,v1]=[v1,v0];
    const c=[Math.max(0,Math.min(L,u0)),Math.max(0,Math.min(L,u1)),Math.max(0,Math.min(D,v0)),Math.max(0,Math.min(D,v1))];
    if(Math.abs(c[0]-u0)>0.05||Math.abs(c[1]-u1)>0.05||Math.abs(c[2]-v0)>0.05||Math.abs(c[3]-v1)>0.05)
      adv.push(tt("«"+b.nombre+"» se recortó a la envolvente de "+dec1(L)+" × "+dec1(D)+" m.",
                  "“"+b.nombre+"” was clipped to the "+dec1(L)+" × "+dec1(D)+" m envelope."));
    [u0,u1,v0,v1]=c;
    if(u1-u0<0.5||v1-v0<0.5) return;
    const cls = ["muro","porche","patio","deck","piscina"].indexOf(b.clase)>=0 ? b.clase : "muro";
    const nivel = b.nivel===2 ? 2 : 1;
    let alto = +b.alto; if(!isFinite(alto)||alto<=0) alto = cls==="muro"?(nivel===2?3.0:3.4):cls==="porche"?3.2:0;
    if(cls==="muro") alto=Math.min(5.0,Math.max(2.4,alto));
    bl.push({nombre:String(b.nombre||cls).slice(0,40),u0,v0,u1,v1,alto,clase:cls,nivel});
  });
  /* traslapes en planta baja (aviso, no veto: el volumen se dibuja igual) */
  const n1 = bl.filter(b=>b.nivel===1 && b.clase!=="patio" && b.clase!=="deck");
  for(let i=0;i<n1.length;i++) for(let j=i+1;j<n1.length;j++){
    const a=n1[i], b=n1[j];
    const w=Math.min(a.u1,b.u1)-Math.max(a.u0,b.u0), h=Math.min(a.v1,b.v1)-Math.max(a.v0,b.v0);
    if(w>0.3&&h>0.3) adv.push(tt("«"+a.nombre+"» y «"+b.nombre+"» se traslapan "+dec1(w*h)+" m².",
                                 "“"+a.nombre+"” and “"+b.nombre+"” overlap by "+dec1(w*h)+" m²."));
  }
  /* zonificación: piscina, deck y social al fondo; carport hacia la vía */
  bl.forEach(b=>{
    const vc=(b.v0+b.v1)/2;
    if((b.clase==="piscina"||b.clase==="deck") && vc < D/2)
      adv.push(tt("«"+b.nombre+"» quedó hacia la vía; pídele que la lleve al fondo del lote.",
                  "“"+b.nombre+"” sits towards the road; ask it to move it to the back."));
    if(b.clase==="porche" && /carport|parq|garaje|garage/i.test(b.nombre) && b.v0 > 8)
      adv.push(tt("«"+b.nombre+"» no está sobre la vía; el parqueadero va al frente.",
                  "“"+b.nombre+"” is not by the road; parking goes at the front."));
  });
  const area = b=>(b.u1-b.u0)*(b.v1-b.v0);
  const construida = bl.filter(b=>b.clase==="muro"||b.clase==="porche").reduce((s,b)=>s+area(b),0);
  const huella = bl.filter(b=>b.nivel===1&&(b.clase==="muro"||b.clase==="porche")).reduce((s,b)=>s+area(b),0);
  const piscina = bl.filter(b=>b.clase==="piscina").reduce((s,b)=>s+area(b),0);
  const pisos = bl.some(b=>b.nivel===2) ? 2 : 1;
  const escU = L/REF_W, escV = D/REF_D;
  const ref = bl.map(b=>Object.assign({},b,{u0:b.u0/escU,u1:b.u1/escU,v0:b.v0/escV,v1:b.v1/escV}));
  return {bloques:bl, ref, construida, huella, piscina, pisos, cap, excede:Math.max(0,construida-cap), adv};
}

function aplicar(n, val, conv){
  /* bloques: en el marco de referencia (para el 3D) · reales: en metros (para el informe) */
  window.__CASA_IA = { lote:n, bloques:val.ref, reales:val.bloques, construida:val.construida, huella:val.huella,
                       piscina:val.piscina, pisos:val.pisos, cap:val.cap, conversacion:(conv||[]).slice(-8) };
  if(!R3D.activo()){ const b=document.getElementById("b3d"); if(b) b.click(); }
  R3D.casa(n,null,null);
  /* si la ficha está abierta, que la tabla de áreas cuente la casa propuesta */
  try{ if(typeof pintarFicha==="function" && document.getElementById("ficha").classList.contains("on")) pintarFicha(n); }catch(e){}
}

/* ------------------------- guardar y recuperar ------------------------ */
async function cab(){
  const t = (typeof ROL!=="undefined") ? await ROL.token() : null;
  if(!t) return null;
  return { "apikey":CFGp().supabaseKey, "Authorization":"Bearer "+t, "Content-Type":"application/json", "Prefer":"return=minimal" };
}
async function guardar(n, val, cfg, conv){
  try{
    const h = await cab(); if(!h || !base()) return;
    const r = await fetch(base()+"/rest/v1/laureles_ia_casas", { method:"POST", headers:h, body: JSON.stringify([{
      lote:n, correo:(typeof ROL!=="undefined"&&ROL.correo&&ROL.correo())||null,
      conversacion:conv.slice(-8), config:cfg, bloques:val.bloques,
      construida:Math.round(val.construida*10)/10, huella:Math.round(val.huella*10)/10,
      piscina:Math.round(val.piscina*10)/10, pisos:val.pisos, cap:val.cap }]) });
    if(!r.ok){ const j=await r.json().catch(()=>({})); console.warn("ia.js: no se guardó:", j.message||r.status); }
  }catch(e){ console.warn("ia.js: no se guardó:", e.message); }
}
/* la última propuesta guardada de este lote; null si no hay */
async function cargar(n){
  try{
    const h = await cab(); if(!h || !base()) return null;
    const r = await fetch(base()+"/rest/v1/laureles_ia_casas?lote=eq."+n+"&order=creado.desc&limit=1&select=*",
      { headers:{ "apikey":h.apikey, "Authorization":h.Authorization } });
    if(!r.ok) return null;
    const j = await r.json(); return (j && j[0]) || null;
  }catch(e){ return null; }
}
/* pone en el 3D y en el informe una propuesta guardada */
function reponer(n, fila){
  const f = fichaReal(n); if(!f || !fila || !Array.isArray(fila.bloques)) return false;
  const val = validar({bloques:fila.bloques}, f);
  if(!val.bloques.length) return false;
  conversacion = Array.isArray(fila.conversacion) ? fila.conversacion.slice() : [];
  historial = []; (fila.config ? [ {rol:"usuario", texto:(conversacion.filter(m=>m.rol==="usuario").slice(-1)[0]||{}).texto||""}, {rol:"asistente", config:fila.config} ] : []).forEach(x=>historial.push(x));
  window.__CASA_IA = { lote:n, bloques:val.ref, reales:val.bloques, construida:val.construida, huella:val.huella,
                       piscina:val.piscina, pisos:val.pisos, cap:val.cap, conversacion:conversacion.slice(-8), guardada:fila.creado };
  if(R3D.activo()) R3D.casa(n,null,null);
  return true;
}
function quitar(){
  if(window.__CASA_IA){
    const n=window.__CASA_IA.lote, A=(window.__IMPL||{})[String(n)];
    delete window.__CASA_IA;
    if(A && A._kAntes){ A.k=A._kAntes; delete A._kAntes; }
    if(R3D.activo()&&lote!=null) R3D.casa(lote,null,null);
  }
}
/* escoger un tipo de la barra o "Sin casa" descarta la casa de IA */
["ponerTipo","quitarCasa"].forEach(k=>{ const prev=R3D[k];
  if(typeof prev==="function") R3D[k]=function(){ delete window.__CASA_IA; return prev.apply(R3D,arguments); }; });

/* ------------------------------ la llamada ---------------------------- */
async function pedir(mensaje){
  const f = fichaReal(lote);
  if(!f) throw new Error(tt("Este lote se implanta en bancales; el configurador v1 sólo cubre lotes de una plataforma.",
                            "This lot is terraced; configurator v1 only covers single-platform lots."));
  const cuerpo = { lote, ficha:f, mensaje, historial:historial.slice(-6) };
  if(typeof window.__IA_PRUEBA==="function") return window.__IA_PRUEBA(cuerpo);   /* pruebas sin red */
  if(!base()||!CFGp().supabaseKey) throw new Error("Falta configurar Supabase en Ajustes.");
  const t = (typeof ROL!=="undefined") ? await ROL.token() : null;
  if(!t) throw new Error(tt("Hace falta una sesión de administrador.","An administrator session is required."));
  const r = await fetch(base()+"/functions/v1/laureles-ia", {
    method:"POST",
    headers:{ "apikey":CFGp().supabaseKey, "Authorization":"Bearer "+t, "Content-Type":"application/json" },
    body: JSON.stringify(cuerpo) });
  const j = await r.json().catch(()=>({}));
  if(!r.ok) throw new Error(j.error || (r.status+" "+r.statusText));
  return j;
}

/* ------------------------------ el panel ------------------------------ */
function pintar(){
  panel.innerHTML =
    '<div class="cab"><b>'+tt("Diseña la casa con IA","Design the house with AI","Concevoir la maison avec l’IA")+'</b>'+
    '<span class="lote">'+tt("Lote","Lot","Lot")+' '+lote+'</span><button id="iaCerrar" aria-label="Cerrar">&times;</button></div>'+
    '<div class="hilo" id="iaHilo"></div>'+
    '<div class="chips" id="iaChips">'+
      ['Un piso, tres alcobas, sala con vista y piscina','Dos pisos, estudio arriba mirando a la cordillera','Casa pequeña de un piso, sin piscina, carport doble','Hazla más pequeña']
        .map(c=>'<button type="button">'+c+'</button>').join('')+'</div>'+
    '<form id="iaForm"><textarea id="iaTxt" placeholder="'+tt("Describe la casa que quiere el cliente…","Describe the house the client wants…")+'"></textarea>'+
    '<button type="submit" id="iaEnviar">'+tt("Proponer","Propose","Proposer")+'</button></form>'+
    '<div class="pie">'+tt("Sólo asesores. Las áreas y el 30 % los calcula el motor del sitio, no la IA. La propuesta se guarda y entra al Análisis del lote y al PDF.",
                            "Advisors only. Areas and the 30 % rule are computed by the site engine, not by the AI. The proposal is saved and goes into the lot analysis and the PDF.")+'</div>';
  panel.querySelector("#iaCerrar").onclick = cerrar;
  panel.querySelectorAll("#iaChips button").forEach(b=>b.onclick=()=>{ panel.querySelector("#iaTxt").value=b.textContent; enviar(); });
  panel.querySelector("#iaForm").onsubmit = e=>{ e.preventDefault(); enviar(); };
  panel.querySelector("#iaTxt").onkeydown = e=>{ if(e.key==="Enter"&&!e.shiftKey){ e.preventDefault(); enviar(); } };
  const f = fichaReal(lote);
  if(f) burbuja("ia", tt("Lote "+lote+": "+ent(f.area_util_m2)+" m² útiles, hasta "+ent(f.construible_30pct_m2)+
      " m² construibles (30 %). La casa cabe en una envolvente de "+dec1(f.envolvente_m.L)+" × "+dec1(f.envolvente_m.Dc)+
      " m; pendiente "+f.pendiente+", vista hacia el "+f.vista_hacia+". Dime qué quiere el cliente.",
      "Lot "+lote+": "+ent(f.area_util_m2)+" m² usable, up to "+ent(f.construible_30pct_m2)+" m² buildable (30%). Envelope "+
      dec1(f.envolvente_m.L)+" × "+dec1(f.envolvente_m.Dc)+" m; slope "+f.pendiente+", view to the "+f.vista_hacia+". Tell me what the client wants."));
  else burbuja("err", tt("Este lote se implanta en bancales (como el 48, 65, 83, 84 y 86): el configurador v1 sólo cubre los 81 lotes de una plataforma.",
                         "This lot is terraced: configurator v1 only covers single-platform lots."));
}
function burbuja(clase, html, esHtml){
  const h = panel.querySelector("#iaHilo"); if(!h) return null;
  const d = document.createElement("div"); d.className="m "+clase;
  if(esHtml) d.innerHTML=html; else d.textContent=html;
  h.appendChild(d); h.scrollTop=h.scrollHeight; return d;
}
function tarjeta(val, cfg){
  const mal = val.excede>0;
  let h = '<div>'+esc(cfg.resumen||"")+'</div>'+
    '<div class="cifras">'+
      '<div class="'+(mal?"mal":"bien")+'"><b>'+ent(val.construida)+' m²</b><small>'+tt("construidos","built")+'</small></div>'+
      '<div><b>'+ent(val.cap)+' m²</b><small>'+tt("tope 30 %","30 % cap")+'</small></div>'+
      '<div><b>'+(val.pisos)+(val.piscina?' · '+ent(val.piscina)+' m²':'')+'</b><small>'+(val.piscina?tt("pisos · piscina","floors · pool"):tt("pisos","floors"))+'</small></div>'+
    '</div>';
  const adv = (cfg.advertencias||[]).map(String).concat(val.adv);
  if(mal) adv.unshift(tt("Excede el 30 % en "+ent(val.excede)+" m². Pídele que la reduzca.",
                         "Exceeds the 30 % cap by "+ent(val.excede)+" m². Ask it to reduce."));
  if(adv.length) h += '<ul class="adv">'+adv.map(a=>'<li>'+esc(a)+'</li>').join('')+'</ul>';
  return h;
}
async function enviar(){
  if(ocupado) return;
  const ta = panel.querySelector("#iaTxt"), bt = panel.querySelector("#iaEnviar");
  const txt = (ta.value||"").trim(); if(!txt) return;
  ocupado = true; bt.disabled = true; ta.value = "";
  burbuja("yo", txt);
  const esp = burbuja("ia", tt("Implantando…","Placing…","Implantation…"));
  try{
    const j = await pedir(txt);
    const cfg = j.config || {};
    const f = fichaReal(lote);
    const val = validar(cfg, f);
    if(!val.bloques.length) throw new Error(tt("La respuesta no trajo bloques válidos.","The answer had no valid blocks."));
    historial.push({rol:"usuario", texto:txt}, {rol:"asistente", config:cfg});
    conversacion.push({rol:"usuario", texto:txt}, {rol:"asistente", texto:String(cfg.resumen||"")});
    aplicar(lote, val, conversacion);
    esp.innerHTML = tarjeta(val, cfg);
    guardar(lote, val, cfg, conversacion);
    if(j.uso && j.uso.cupo_dia) { const p=panel.querySelector(".pie"); if(p) p.textContent += " · "+tt("Consultas hoy","Today","Aujourd’hui")+": "+j.uso.hoy+"/"+j.uso.cupo_dia; }
  }catch(e){
    esp.className="m err"; esp.textContent = e.message || String(e);
  }finally{ ocupado=false; bt.disabled=false; ta.focus(); }
}
function abrir(n){
  if(lote!==n){ lote=n; historial=[]; conversacion=[]; }
  panel.hidden=false; pintar();
  /* si hay una propuesta guardada y todavía no está puesta, se recupera */
  if(!(window.__CASA_IA && String(window.__CASA_IA.lote)===String(n))){
    cargar(n).then(f=>{ if(f && lote===n && reponer(n,f)){
      const ult = (conversacion.filter(m=>m.rol==="asistente").slice(-1)[0]||{}).texto || "";
      burbuja("ia", tt("Propuesta guardada el "+new Date(f.creado).toLocaleString("es-CO")+(f.correo?" por "+f.correo:"")+". "+ult,
                       "Saved proposal from "+new Date(f.creado).toLocaleString("en")+". "+ult));
    } });
  } else if(window.__CASA_IA.guardada){
    burbuja("ia", tt("Propuesta guardada el "+new Date(window.__CASA_IA.guardada).toLocaleString("es-CO")+".",
                     "Saved proposal from "+new Date(window.__CASA_IA.guardada).toLocaleString("en")+"."));
  }
  if(!R3D.activo()){ const b=document.getElementById("b3d"); if(b) b.click(); }
  setTimeout(()=>{ const t=panel.querySelector("#iaTxt"); if(t) t.focus(); }, 50);
}
function cerrar(){ panel.hidden=true; }

/* ------------------------- el botón en la ficha ----------------------- */
const prevPintar = window.pintarFicha;
window.pintarFicha = function(n){
  const r = prevPintar.apply(this, arguments);
  try{
    if(typeof ROL!=="undefined" && ROL.esVentas()){
      const ff = document.querySelector(".ficha .ff");
      const ancla = ff && ff.querySelector("#bAnl");
      if(ancla && !ff.querySelector("#bIA")){
        const b = document.createElement("button");
        b.className="anlBtn ia"; b.id="bIA"; b.type="button";
        b.textContent = tt("Diseña la casa con IA","Design the house with AI","Concevoir la maison avec l’IA");
        ancla.insertAdjacentElement("afterend", b);
        b.onclick = ()=>abrir(n);
        /* la propuesta guardada entra al informe aunque no se abra el panel */
        if(!(window.__CASA_IA && String(window.__CASA_IA.lote)===String(n)) && fichaReal(n))
          cargar(n).then(f=>{ if(f && reponer(n,f)){ b.textContent += " · "+tt("hay propuesta guardada","saved proposal","proposition enregistrée");
            try{ pintarFicha(n); }catch(e){} } });
      }
    }
    if(lote!=null && n!==lote && !panel.hidden){ lote=n; historial=[]; pintar(); }
  }catch(e){ console.warn("ia.js:", e); }
  return r;
};
const prevCerrar = window.cerrarFicha;
if(typeof prevCerrar==="function") window.cerrarFicha = function(){ const r=prevCerrar.apply(this,arguments); cerrar(); return r; };

window.__IA = { abrir, cerrar, validar, fichaReal, quitar };
})();
