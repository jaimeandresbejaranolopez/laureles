/* =============================================================================
   PANEL DE PROSPECTOS — sólo para el equipo comercial
   -----------------------------------------------------------------------------
   Lista a cada persona que se registró en la página (laureles_visitantes) y
   cada solicitud de visita (laureles_visitas), con el seguimiento: estado,
   asesor a cargo y notas. Se abre desde "Administrador" o con /?panel=1 (el
   enlace que trae el correo de aviso).

   La base de datos es quien decide quién ve esto: las tablas sólo responden a
   una sesión que esté en laureles_equipo (RLS). Una cuenta cualquiera de Auth
   ve la lista vacía. El seguimiento se guarda con la función
   laureles_seguimiento, que firma cada cambio con el nombre de quien lo hizo.
   ============================================================================= */
const PANEL = (()=>{
  const ESTV = [["nuevo","Nuevo"],["contactado","Contactado"],["interesado","Interesado"],["visita","Visita agendada"],
                ["negociando","Negociando"],["cerrado","Cerrado"],["descartado","Descartado"]];
  const ESTS = [["solicitada","Solicitada"],["confirmada","Confirmada"],["realizada","Realizada"],["cancelada","Cancelada"]];
  const TONO = {nuevo:"n",solicitada:"n",contactado:"c",interesado:"c",confirmada:"c",visita:"v",negociando:"v",
                cerrado:"ok",realizada:"ok",descartado:"x",cancelada:"x"};
  const e = t=>String(t==null?"":t).replace(/[<>&"]/g,c=>({"<":"&lt;",">":"&gt;","&":"&amp;",'"':"&quot;"}[c]));
  const base = ()=>(CFG.supabaseUrl||"").replace(/\/$/,"");
  let V=[], VI=[], tab="reg", filtro="todos", busca="", raiz=null;

  function css(){
    if(document.getElementById("panelCss")) return;
    const s=document.createElement("style"); s.id="panelCss";
    s.textContent=`
#panelP{position:fixed;inset:0;z-index:70;background:var(--paper);display:flex;flex-direction:column;color:var(--ink)}
#panelP[hidden]{display:none}
.pnH{flex-shrink:0;background:var(--forest);color:var(--on-forest);padding:14px clamp(16px,3vw,32px) 0;
  padding-top:calc(14px + env(safe-area-inset-top,0px))}
.pnT{display:flex;align-items:center;gap:12px;flex-wrap:wrap}
.pnT h2{margin:0;font-family:var(--serif);font-weight:600;font-size:26px;letter-spacing:.005em}
.pnT .eb{font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:#EBD9AE;display:block;margin-bottom:2px}
.pnT .sp{flex:1}
.pnB{border:1px solid rgba(246,244,236,.35);background:transparent;color:inherit;border-radius:999px;padding:8px 14px;
  font-size:13px;font-weight:600;cursor:pointer;display:inline-flex;align-items:center;gap:6px;min-height:36px}
.pnB:hover{background:rgba(246,244,236,.1)}
.pnB.x{width:38px;padding:0;justify-content:center;font-size:20px}
.pnK{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin:14px 0 12px}
.pnK div{background:rgba(246,244,236,.08);border-radius:10px;padding:9px 12px}
.pnK b{display:block;font-family:var(--serif);font-size:24px;font-weight:600;font-variant-numeric:tabular-nums;line-height:1.1}
.pnK span{font-size:11.5px;opacity:.78}
.pnTabs{display:flex;gap:4px}
.pnTabs button{border:0;background:transparent;color:inherit;opacity:.72;padding:10px 14px 11px;font-weight:700;font-size:13.5px;
  border-bottom:3px solid transparent;cursor:pointer}
.pnTabs button.on{opacity:1;border-bottom-color:#C9A86B}
.pnF{flex-shrink:0;display:flex;gap:8px;align-items:center;flex-wrap:wrap;padding:12px clamp(16px,3vw,32px);
  border-bottom:1px solid var(--line);background:var(--surface-2)}
.pnF input{flex:1 1 220px;min-width:0;border:1px solid var(--line);border-radius:999px;padding:9px 14px;background:var(--surface)}
.pnChips{display:flex;gap:6px;flex-wrap:wrap}
.pnChips button{border:1px solid var(--line);background:var(--surface);border-radius:999px;padding:6px 11px;font-size:12.5px;cursor:pointer}
.pnChips button.on{background:var(--forest);border-color:var(--forest);color:var(--on-forest)}
.pnL{flex:1;overflow:auto;padding:14px clamp(16px,3vw,32px) 40px;display:flex;flex-direction:column;gap:10px}
.pnMsg{color:var(--muted);padding:30px 0;text-align:center;max-width:560px;margin:0 auto;line-height:1.5}
.pnR{background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:14px 16px;
  display:grid;grid-template-columns:minmax(0,1.25fr) minmax(0,1fr) minmax(0,1.35fr);gap:14px 18px;align-items:start}
.pnR.cambio{border-color:var(--gold);box-shadow:0 0 0 2px rgba(155,122,72,.14)}
.pnN{font-weight:700;font-size:15.5px;display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.pnS{display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:700;border-radius:999px;padding:3px 9px;letter-spacing:.02em}
.pnS i{width:7px;height:7px;border-radius:50%;background:currentColor}
.pnS.n{background:#F6E9CF;color:#8A5B12}.pnS.c{background:#E3ECF6;color:#2E5C93}.pnS.v{background:#EDE4F3;color:#6A3F8C}
.pnS.ok{background:#E1EFE5;color:#2F6B45}.pnS.x{background:#ECEBE6;color:#6B7367}
.pnM{font-size:12.5px;color:var(--muted);margin-top:4px;line-height:1.5}
.pnC{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}
.pnC a{font-size:12.5px;font-weight:600;text-decoration:none;border:1px solid var(--line);border-radius:999px;padding:5px 11px;color:var(--ink-2)}
.pnC a.wa{background:var(--forest);border-color:var(--forest);color:var(--on-forest)}
.pnC a:hover{border-color:var(--gold)}
.pnG label{display:block;font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);margin:0 0 4px}
.pnG select,.pnG input,.pnG textarea{width:100%;border:1px solid var(--line);border-radius:8px;padding:8px 10px;background:var(--surface);font-size:13.5px}
.pnG textarea{min-height:64px;resize:vertical;line-height:1.4;font-family:var(--sans)}
.pnG + .pnG{margin-top:8px}
.pnSv{display:flex;align-items:center;gap:10px;margin-top:8px;flex-wrap:wrap}
.pnSv button{border:1px solid var(--forest);background:var(--forest);color:var(--on-forest);border-radius:999px;padding:7px 16px;font-weight:700;font-size:13px;cursor:pointer}
.pnSv button:disabled{opacity:.45;cursor:default}
.pnSv small{font-size:11.5px;color:var(--muted)}
.pnVis{font-size:12.5px;margin-top:8px;background:var(--surface-2);border:1px solid var(--line-soft);border-radius:8px;padding:7px 10px;line-height:1.5}
.pnVis a{color:var(--gold);font-weight:700}
@media (max-width:860px){
  .pnR{grid-template-columns:1fr}
  .pnK{grid-template-columns:repeat(2,minmax(0,1fr))}
  .pnT h2{font-size:22px}
  .pnB .tx{display:none}
  .pnT .sp{display:none}
  .pnT{flex-wrap:nowrap}.pnT>div:first-child{flex:1;min-width:0}
  .pnChips{flex-wrap:nowrap;overflow-x:auto;width:100%;padding-bottom:2px}
  .pnChips button{flex-shrink:0}
}
@media print{#panelP{display:none!important}}`;
    document.head.appendChild(s);
  }

  async function traer(ruta){
    const t = await ROL.token(); if(!t) throw new Error("sin sesión");
    const r = await fetch(base()+"/rest/v1/"+ruta, {headers:{apikey:CFG.supabaseKey, Authorization:"Bearer "+t}});
    if(!r.ok) throw new Error(r.status+" "+r.statusText);
    return r.json();
  }
  async function rpc(fn,args){
    const t = await ROL.token(); if(!t) throw new Error("La sesión venció. Vuelve a entrar.");
    const r = await fetch(base()+"/rest/v1/rpc/"+fn, {method:"POST",
      headers:{apikey:CFG.supabaseKey, Authorization:"Bearer "+t, "Content-Type":"application/json"}, body:JSON.stringify(args||{})});
    const j = await r.json().catch(()=>null);
    if(!r.ok) throw new Error((j&&(j.message||j.msg))||(r.status+" "+r.statusText));
    return j;
  }

  const cuando = iso=>{ if(!iso) return ""; const d=new Date(iso), s=(Date.now()-d)/1000;
    const abs=d.toLocaleString("es-CO",{dateStyle:"medium",timeStyle:"short"});
    const rel = s<3600 ? "hace "+Math.max(1,Math.round(s/60))+" min" : s<86400 ? "hace "+Math.round(s/3600)+" h" :
                s<86400*30 ? "hace "+Math.round(s/86400)+" d" : "";
    return rel ? rel+" · "+abs : abs; };
  const diaVisita = f=>{ try{ return new Date(f+"T12:00:00").toLocaleDateString("es-CO",{weekday:"long",day:"numeric",month:"long"}); }catch(_){ return f; } };
  const hora12 = h=>{ const n=parseInt(h,10); return isNaN(n)?"":(n>12?n-12:n)+":00 "+(n<12?"a. m.":"p. m."); };
  const wa = tel=>{ const d=String(tel||"").replace(/\D/g,""); return d ? "https://wa.me/"+(d.length===10?"57"+d:d) : ""; };
  const etq = (lista,k)=>{ const x=lista.find(a=>a[0]===k); return x?x[1]:k; };
  const pill = (lista,k)=>'<span class="pnS '+(TONO[k]||"n")+'"><i></i>'+e(etq(lista,k))+'</span>';
  const contacto = x=>'<div class="pnC">'+
      (wa(x.telefono)?'<a class="wa" href="'+wa(x.telefono)+'" target="_blank" rel="noopener">WhatsApp</a>':'')+
      (x.telefono?'<a href="tel:'+e(x.telefono)+'">'+e(x.telefono)+'</a>':'')+
      (x.correo?'<a href="mailto:'+e(x.correo)+'">'+e(x.correo)+'</a>':'')+'</div>';

  function filtrados(){
    const q = busca.trim().toLowerCase();
    const lista = tab==="reg" ? V : VI;
    const campo = tab==="reg" ? "estado_seg" : "estado";
    return lista.filter(x=>(filtro==="todos"||x[campo]===filtro) &&
      (!q || [x.nombre,x.correo,x.telefono,x.asesor,x.notas_seg,x.lote].some(v=>String(v||"").toLowerCase().includes(q))));
  }

  function filaReg(x){
    const vs = VI.filter(v=>v.correo && x.correo && v.correo.toLowerCase()===x.correo.toLowerCase());
    return '<div class="pnR" data-id="'+x.id+'">'+
      '<div><div class="pnN">'+e(x.nombre)+' '+pill(ESTV,x.estado_seg||"nuevo")+'</div>'+
        '<div class="pnM">Se registró '+e(cuando(x.creado))+(x.origen?' · desde '+e(x.origen):'')+(x.idioma&&x.idioma!=="es"?' · idioma '+e(x.idioma.toUpperCase()):'')+'</div>'+
        contacto(x)+
        (vs.length?'<div class="pnVis">Pidió visita: '+vs.map(v=>e(diaVisita(v.fecha))+(v.hora?' · '+hora12(v.hora):'')+(v.lote?' · <a href="#" data-lote="'+v.lote+'">lote '+v.lote+'</a>':'')).join('<br>')+'</div>':'')+
      '</div>'+
      '<div><div class="pnG"><label for="ps'+x.id+'">Estado</label><select id="ps'+x.id+'" data-k="estado">'+
          ESTV.map(([k,t])=>'<option value="'+k+'"'+(k===(x.estado_seg||"nuevo")?' selected':'')+'>'+t+'</option>').join("")+'</select></div>'+
        '<div class="pnG"><label for="pa'+x.id+'">Asesor a cargo</label><input id="pa'+x.id+'" data-k="asesor" value="'+e(x.asesor||"")+'" placeholder="Nombre del asesor"></div></div>'+
      '<div><div class="pnG"><label for="pn'+x.id+'">Notas del seguimiento</label><textarea id="pn'+x.id+'" data-k="notas" placeholder="Qué habló, qué lote le interesa, cuándo volver a llamar…">'+e(x.notas_seg||"")+'</textarea></div>'+
        '<div class="pnSv"><button disabled>Guardar</button><small>'+(x.seg_actualizado?'Último cambio: '+e(x.seg_por||"")+' · '+e(cuando(x.seg_actualizado)):'Sin seguimiento todavía')+'</small></div></div>'+
    '</div>';
  }
  function filaVis(x){
    return '<div class="pnR" data-id="'+x.id+'">'+
      '<div><div class="pnN">'+e(x.nombre)+' '+pill(ESTS,x.estado||"solicitada")+'</div>'+
        '<div class="pnM"><b style="color:var(--ink)">'+e(diaVisita(x.fecha))+(x.hora?' · '+hora12(x.hora):x.franja?' · '+(x.franja==="manana"?"mañana":"tarde"):'')+'</b>'+
        (x.lote?' · <a href="#" data-lote="'+x.lote+'" style="color:var(--gold);font-weight:700">lote '+x.lote+'</a>':'')+
        '<br>Pedida '+e(cuando(x.creado))+'</div>'+contacto(x)+
        (x.notas?'<div class="pnVis">'+e(x.notas)+'</div>':'')+'</div>'+
      '<div><div class="pnG"><label for="vs'+x.id+'">Estado de la visita</label><select id="vs'+x.id+'" data-k="estado">'+
          ESTS.map(([k,t])=>'<option value="'+k+'"'+(k===(x.estado||"solicitada")?' selected':'')+'>'+t+'</option>').join("")+'</select></div></div>'+
      '<div><div class="pnG"><label for="vn'+x.id+'">Notas</label><textarea id="vn'+x.id+'" data-k="notas" placeholder="Quién la atiende, cómo llegó, qué pasó…">'+e(x.seguimiento||"")+'</textarea></div>'+
        '<div class="pnSv"><button disabled>Guardar</button></div></div>'+
    '</div>';
  }

  function pintar(){
    if(!raiz) return;
    const hoy = new Date().toISOString().slice(0,10);
    const k = raiz.querySelector(".pnK");
    k.innerHTML =
      '<div><b>'+V.length+'</b><span>Registrados</span></div>'+
      '<div><b>'+V.filter(x=>(x.estado_seg||"nuevo")==="nuevo").length+'</b><span>Sin contactar</span></div>'+
      '<div><b>'+V.filter(x=>(Date.now()-new Date(x.creado))<7*864e5).length+'</b><span>Últimos 7 días</span></div>'+
      '<div><b>'+VI.filter(x=>x.fecha>=hoy && x.estado!=="cancelada" && x.estado!=="realizada").length+'</b><span>Visitas por venir</span></div>';
    raiz.querySelectorAll(".pnTabs button").forEach(b=>b.classList.toggle("on",b.dataset.t===tab));
    raiz.querySelector("#pnReg").textContent="Registrados ("+V.length+")";
    raiz.querySelector("#pnVisT").textContent="Visitas ("+VI.length+")";
    const lista = tab==="reg" ? ESTV : ESTS;
    raiz.querySelector(".pnChips").innerHTML = [["todos","Todos"]].concat(lista).map(([k2,t])=>
      '<button data-f="'+k2+'"'+(k2===filtro?' class="on"':'')+'>'+t+'</button>').join("");
    const f = filtrados(), L = raiz.querySelector(".pnL");
    L.innerHTML = f.length ? f.map(tab==="reg"?filaReg:filaVis).join("")
      : '<div class="pnMsg">'+((tab==="reg"?V:VI).length ? "Nada coincide con la búsqueda o el filtro." :
          tab==="reg" ? "Todavía no hay personas registradas." : "Todavía no hay solicitudes de visita.")+'</div>';
    L.querySelectorAll(".pnR").forEach(enganchar);
    L.querySelectorAll("a[data-lote]").forEach(a=>a.onclick=ev=>{ ev.preventDefault(); cerrar();
      const w=document.getElementById("welcome"); if(w && !w.hidden) w.hidden=true;
      if(window.seleccionarLote) window.seleccionarLote(+a.dataset.lote); });
  }

  function enganchar(fila){
    const id=+fila.dataset.id, bt=fila.querySelector(".pnSv button"), nota=fila.querySelector(".pnSv small");
    const campos=fila.querySelectorAll("[data-k]");
    campos.forEach(c=>c.addEventListener("input",()=>{ bt.disabled=false; fila.classList.add("cambio"); }));
    fila.querySelector("select").addEventListener("change",()=>{ bt.disabled=false; fila.classList.add("cambio"); });
    bt.onclick = async ()=>{
      const val=k=>{ const c=fila.querySelector('[data-k="'+k+'"]'); return c?c.value:null; };
      bt.disabled=true; bt.textContent="Guardando…";
      try{
        const j = await rpc("laureles_seguimiento", {p_tipo: tab==="reg"?"visitante":"visita", p_id:id,
                    p_estado:val("estado"), p_asesor:val("asesor"), p_notas:val("notas")});
        const x = (tab==="reg"?V:VI).find(r=>r.id===id);
        if(x){ if(tab==="reg"){ x.estado_seg=val("estado"); x.asesor=val("asesor"); x.notas_seg=val("notas"); x.seg_por=j&&j.por; x.seg_actualizado=j&&j.cuando; }
               else { x.estado=val("estado"); x.seguimiento=val("notas"); } }
        fila.classList.remove("cambio"); bt.textContent="Guardado";
        if(nota && j) nota.textContent="Último cambio: "+(j.por||"")+" · ahora";
        const pl=fila.querySelector(".pnS"); if(pl){ const l=tab==="reg"?ESTV:ESTS, k=val("estado");
          pl.className="pnS "+(TONO[k]||"n"); pl.innerHTML="<i></i>"+e(etq(l,k)); }
        setTimeout(()=>{ bt.textContent="Guardar"; },1600);
        pintarKpi();
      }catch(ex){ bt.disabled=false; bt.textContent="Guardar"; avisar("No se guardó: "+ex.message, 5000); }
    };
  }
  function pintarKpi(){
    const hoy=new Date().toISOString().slice(0,10), k=raiz.querySelector(".pnK");
    k.children[1].querySelector("b").textContent=V.filter(x=>(x.estado_seg||"nuevo")==="nuevo").length;
    k.children[3].querySelector("b").textContent=VI.filter(x=>x.fecha>=hoy && x.estado!=="cancelada" && x.estado!=="realizada").length;
  }

  function csv(){
    const cols = tab==="reg"
      ? ["creado","nombre","telefono","correo","idioma","origen","estado_seg","asesor","notas_seg","seg_por","seg_actualizado"]
      : ["creado","nombre","telefono","correo","fecha","hora","franja","lote","estado","notas","seguimiento"];
    const q=v=>'"'+String(v==null?"":v).replace(/"/g,'""')+'"';
    const txt="﻿"+cols.join(";")+"\n"+filtrados().map(x=>cols.map(c=>q(x[c])).join(";")).join("\n");
    const a=document.createElement("a");
    a.href=URL.createObjectURL(new Blob([txt],{type:"text/csv;charset=utf-8"}));
    a.download="laureles_"+(tab==="reg"?"registrados":"visitas")+"_"+new Date().toISOString().slice(0,10)+".csv";
    document.body.appendChild(a); a.click(); setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); },500);
  }

  async function cargar(){
    const L=raiz.querySelector(".pnL"); L.innerHTML='<div class="pnMsg">Cargando…</div>';
    try{
      const eq = await rpc("laureles_es_equipo");
      if(eq!==true){ L.innerHTML='<div class="pnMsg"><b>Esta cuenta no es del equipo de Laureles.</b><br>Pide a gerencia que la active; mientras tanto la base de datos no deja ver a los prospectos.</div>'; return; }
      [V,VI] = await Promise.all([
        traer("laureles_visitantes?select=id,nombre,correo,telefono,idioma,origen,creado,estado_seg,asesor,notas_seg,seg_actualizado,seg_por&order=creado.desc&limit=2000"),
        traer("laureles_visitas?select=*&order=creado.desc&limit=2000")]);
      pintar();
    }catch(ex){ L.innerHTML='<div class="pnMsg">No se pudo cargar: '+e(ex.message)+'</div>'; }
  }

  function abrir(){
    if(!ROL.esVentas()){ ROL.hoja(); esperarSesion(); return; }
    css();
    if(!raiz){
      raiz=document.createElement("div"); raiz.id="panelP"; raiz.setAttribute("role","dialog"); raiz.setAttribute("aria-label","Panel de prospectos");
      raiz.innerHTML =
        '<div class="pnH"><div class="pnT"><div><span class="eb">Laureles Campestre · equipo comercial</span><h2>Prospectos</h2></div><div class="sp"></div>'+
          '<button class="pnB" id="pnAct" title="Volver a cargar">↻ <span class="tx">Actualizar</span></button>'+
          '<button class="pnB" id="pnCsv" title="Descargar lo que ves en una hoja de cálculo">⤓ <span class="tx">Exportar CSV</span></button>'+
          '<button class="pnB x" id="pnX" aria-label="Cerrar el panel">×</button></div>'+
          '<div class="pnK"></div>'+
          '<div class="pnTabs"><button data-t="reg" id="pnReg">Registrados</button><button data-t="vis" id="pnVisT">Visitas</button></div></div>'+
        '<div class="pnF"><input type="search" id="pnBusca" placeholder="Buscar por nombre, correo, teléfono, asesor o notas" aria-label="Buscar"><div class="pnChips"></div></div>'+
        '<div class="pnL"></div>';
      document.body.appendChild(raiz);
      raiz.querySelector("#pnX").onclick=cerrar;
      raiz.querySelector("#pnAct").onclick=cargar;
      raiz.querySelector("#pnCsv").onclick=csv;
      raiz.querySelector("#pnBusca").oninput=ev=>{ busca=ev.target.value; pintar(); };
      raiz.querySelectorAll(".pnTabs button").forEach(b=>b.onclick=()=>{ tab=b.dataset.t; filtro="todos"; pintar(); });
      raiz.querySelector(".pnChips").onclick=ev=>{ const b=ev.target.closest("button"); if(!b) return; filtro=b.dataset.f; pintar(); };
      addEventListener("keydown",ev=>{ if(ev.key==="Escape" && raiz && !raiz.hidden) cerrar(); });
    }
    raiz.hidden=false;
    cargar();
  }
  function cerrar(){ if(raiz) raiz.hidden=true; }
  let esperando=false;
  function esperarSesion(){
    if(esperando) return; esperando=true; let k=0;
    const t=setInterval(()=>{ if(ROL.esVentas()){ clearInterval(t); esperando=false; setTimeout(abrir,500); }
                              else if(++k>600){ clearInterval(t); esperando=false; } },1000);
  }
  return {abrir, cerrar};
})();
window.PANEL = PANEL;
