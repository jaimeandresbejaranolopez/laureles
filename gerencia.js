/* =============================================================================
   TABLERO GERENCIAL — sólo gerencia (rol 'gerencia' o quien puede liberar).
   -----------------------------------------------------------------------------
   Reúne en una sola pantalla lo que hace falta para verificar el día a día:
   · inventario: disponibles, separados y vendidos, por canal (Fajardo / C21);
   · cartera: precio pactado, forma de pago, lo recaudado y lo que falta, lote
     por lote, con las cuotas vencidas sin pagar;
   · recaudo mes a mes: lo programado contra lo recibido, y lo que se espera
     recibir hasta diciembre de este año y en los dos siguientes;
   · el día a día: movimientos de lotes, pagos registrados, visitas y alertas.

   De dónde sale cada número (nada se estima):
   · estados y negocios: laureles_lotes y laureles_negocios (lo que ya usa el mapa);
   · precio pactado y cronograma: laureles_planes (lo registra la gerencia aquí);
   · pagos recibidos: laureles_recaudos (lo registra la gerencia aquí; un pago no
     se edita, se anula con motivo y queda la huella).
   Si un negocio no tiene forma de pago registrada, el tablero lo dice
   (NO_DISPONIBLE) y no lo suma en las proyecciones.

   La base de datos decide quién ve esto: las tablas nuevas sólo responden a
   laureles_es_gerencia(). Una sesión de asesor recibe listas vacías.
   Usa del mapa (globales de index.html): LOTES, ETAPAS, S, precio, planPago,
   SEPARACION, cop, ROL, CFG, CANAL, ESTADOS, normEstado, avisar.
   ============================================================================= */
const GERENCIA = window.GERENCIA = (()=>{
  const MESES = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
  const MEDIOS = {dinero:"Dinero", vehiculo:"Vehículo", cdt:"CDT", inmueble:"Inmueble", otro:"Otro"};
  const TIPO = {etapa:"Plan de la etapa", personalizado:"Personalizado", por_definir:"Por definir"};
  const LIM_INI = "2026-12", CUO_INI = "2027-01", FINAL = "2028-12";
  const C_REAL = "#1F7A4D", C_PROG = "#C7891F";        /* validados: CVD ΔE 12,2 · normal 22,8 */
  const SIN = "NO_DISPONIBLE";
  const E1_CUPO = 0.30;                                /* la etapa 1 es el 30 % del área vendible */
  const m2f = v => Math.round(v).toLocaleString("es-CO")+" m²";
  const esc = s => String(s==null?"":s).replace(/[<>&"]/g, c=>({"<":"&lt;",">":"&gt;","&":"&amp;",'"':"&quot;"}[c]));
  const num = s => { const n=Number(String(s==null?"":s).replace(/[^\d]/g,"")); return isFinite(n)?n:0; };
  const fmtN = n => n ? Math.round(n).toLocaleString("es-CO") : "";
  const mm = v => { const a=Math.abs(v); return (v<0?"−":"")+"$"+(a>=1e9?(a/1e9).toLocaleString("es-CO",{maximumFractionDigits:2})+" mil M":(a/1e6).toLocaleString("es-CO",{maximumFractionDigits:1})+" M"); };
  const mesDe = d => { const x=new Date(d); return x.getFullYear()+"-"+String(x.getMonth()+1).padStart(2,"0"); };
  const mesHoy = () => mesDe(Date.now());
  const sumaMes = (m,k) => { let [a,b]=m.split("-").map(Number); b+=k; a+=Math.floor((b-1)/12); b=((b-1)%12+12)%12+1; return a+"-"+String(b).padStart(2,"0"); };
  const mesTxt = m => { if(!/^\d{4}-\d{2}$/.test(m||"")) return "—"; const [a,b]=m.split("-"); return MESES[+b-1]+"-"+a.slice(2); };
  const mesLargo = m => { if(!/^\d{4}-\d{2}$/.test(m||"")) return "—"; const [a,b]=m.split("-"); return MESES[+b-1]+" "+a; };
  const fecha = d => d ? new Date(d).toLocaleDateString("es-CO",{day:"2-digit",month:"short",year:"numeric"}) : "—";
  const fechaHora = d => d ? new Date(d).toLocaleString("es-CO",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"}) : "—";
  const dias = d => Math.floor((Date.now()-new Date(d).getTime())/86400000);
  const base = () => (CFG.supabaseUrl||"").replace(/\/$/,"");
  const estadoTxt = e => e==="vendido" ? "Vendido" : e==="separado" ? "Separado" : "Disponible";
  const canalTxt = c => (CANAL[c] && CANAL[c].corto) || "Sin canal";
  const PENDIENTE = /^(por confirmar|por averiguar|en espera|)$/i;

  let raiz=null, tab="resumen", D=null, M=null, filtroC="todos", filtroE="todos", filtroP="todos", canalMes="todos", cargando=false;

  /* ------------------------------ datos ------------------------------ */
  async function pedir(ruta, t){
    const r = await fetch(base()+"/rest/v1/"+ruta, {headers:{"apikey":CFG.supabaseKey, "Authorization":"Bearer "+t}});
    if(!r.ok){ const j=await r.json().catch(()=>({})); throw new Error(j.message || (r.status+" "+r.statusText)); }
    return r.json();
  }
  async function escribir(ruta, metodo, cuerpo, extra){
    const t = await ROL.token(); if(!t) throw new Error("La sesión venció: vuelve a entrar como administrador.");
    const r = await fetch(base()+"/rest/v1/"+ruta, {method:metodo,
      headers:Object.assign({"apikey":CFG.supabaseKey, "Authorization":"Bearer "+t, "Content-Type":"application/json", "Prefer":"return=representation"}, extra||{}),
      body:JSON.stringify(cuerpo)});
    const j = await r.json().catch(()=>null);
    if(!r.ok) throw new Error((j && (j.message||j.msg)) || (r.status+" "+r.statusText));
    return j;
  }
  async function cargar(){
    if(cargando) return; cargando=true;
    pintarCargando();
    try{
      const t = await ROL.token(); if(!t) throw new Error("Hace falta una sesión de administrador.");
      const r = await fetch(base()+"/rest/v1/rpc/laureles_es_gerencia", {method:"POST",
        headers:{"apikey":CFG.supabaseKey, "Authorization":"Bearer "+t, "Content-Type":"application/json"}, body:"{}"});
      const ok = r.ok && (await r.json().catch(()=>false)) === true;
      if(!ok){ D=null; M=null; pintarSinPermiso(); return; }
      const [lotes, negocios, planes, recaudos, hist, visitantes, visitas, prospectos] = await Promise.all([
        pedir("laureles_lotes?select=lote,estado,actualizado", t),
        pedir("laureles_negocios?select=*&order=creado.desc&limit=3000", t),
        pedir("laureles_planes?select=*", t),
        pedir("laureles_recaudos?select=*&order=fecha.desc,id.desc&limit=5000", t),
        pedir("laureles_planes_hist?select=lote,cuando,quien&order=cuando.desc&limit=200", t).catch(()=>[]),
        pedir("laureles_visitantes?select=id,creado,origen,estado_seg&order=creado.desc&limit=5000", t).catch(()=>[]),
        pedir("laureles_visitas?select=id,nombre,lote,fecha,hora,franja,estado,creado&order=fecha.desc&limit=500", t).catch(()=>[]),
        pedir("laureles_prospectos?select=id,lote,nombre,etapa,precio_cop,origen,creado&order=creado.desc&limit=300", t).catch(()=>[])
      ]);
      D = {lotes, negocios, planes, recaudos, hist, visitantes, visitas, prospectos, cuando:new Date()};
      modelo(); pintar();
    }catch(e){
      const L=raiz && raiz.querySelector(".gzL");
      if(L) L.innerHTML='<div class="gzMsg"><b>No se pudo cargar el tablero.</b><br>'+esc(e.message)+'<br><button class="gzBtn" id="gzReint">Reintentar</button></div>';
      const b=raiz && raiz.querySelector("#gzReint"); if(b) b.onclick=cargar;
    }finally{ cargando=false; }
  }

  /* ------------------------------ modelo ------------------------------ */
  function cuotasDe(plan){
    const q = (plan && Array.isArray(plan.cuotas) ? plan.cuotas : [])
      .map(x=>({mes:String(x.mes||""), valor:num(x.valor), medio:MEDIOS[x.medio]?x.medio:"dinero", concepto:String(x.concepto||"")}))
      .filter(x=>/^\d{4}-\d{2}$/.test(x.mes) && x.valor>0);
    return q.sort((a,b)=>a.mes<b.mes?-1:a.mes>b.mes?1:0);
  }
  function modelo(){
    const hoyM = mesHoy(), cerrado = sumaMes(hoyM,-1);
    const estado = {}; D.lotes.forEach(x=>{ estado[x.lote]=normEstado(x.estado); });
    const neg = {}; D.negocios.forEach(x=>{ x.estado=normEstado(x.estado); if(!neg[x.lote]) neg[x.lote]=x; });
    const plan = {}; D.planes.forEach(x=>{ plan[x.lote]=x; });
    const rec = {}; D.recaudos.filter(x=>!x.anulado).forEach(x=>{ (rec[x.lote]=rec[x.lote]||[]).push(x); });
    const filas = [];
    LOTES.features.forEach(f=>{
      const p=f.properties, n=p.lote, e=estado[n] || normEstado(p.real||p.estado) || "disponible";
      if(e==="disponible") return;
      const ng=neg[n] && neg[n].estado===e ? neg[n] : (neg[n]||null), pl=plan[n]||null, q=cuotasDe(pl);
      const rs=(rec[n]||[]), recTot=rs.reduce((s,x)=>s+Number(x.valor||0),0);
      const prog=q.reduce((s,x)=>s+x.valor,0);
      const hasta = m => q.filter(x=>x.mes<=m).reduce((s,x)=>s+x.valor,0);
      const venc = hasta(cerrado), mora=Math.max(0, venc-recTot);
      let acum=0, prox=null;
      for(const x of q){ acum+=x.valor; if(acum>recTot+0.5){ prox={mes:x.mes, valor:Math.min(x.valor, acum-recTot), medio:x.medio, concepto:x.concepto}; break; } }
      const pactado = pl && pl.precio_pactado ? Number(pl.precio_pactado) : null;
      const cliente = (pl && pl.cliente) || (ng && ng.cliente) || "";
      filas.push({n, p, e, canal:(pl&&pl.canal)||(ng&&ng.canal)||null, cliente, agente:ng?ng.agente:"", desde:ng?ng.creado:null,
        neg:ng, plan:pl, q, prog, recTot, rs, venc, mora, prox, pactado,
        tipo: pl ? (q.length ? pl.tipo : "por_definir") : null,
        etapa: pl && pl.etapa ? Number(pl.etapa) : null,
        saldo: pactado!=null ? pactado-recTot : null,
        pend: m => Math.max(0, hasta(m)-recTot),
        clientePend: PENDIENTE.test(String(cliente).trim()) });
    });
    filas.sort((a,b)=>a.n-b.n);
    /* totales */
    const T = {disp:0, sep:0, ven:0, canal:{fajardo:{sep:0,ven:0,pact:0,rec:0,n:0}, c21:{sep:0,ven:0,pact:0,rec:0,n:0}, sin:{sep:0,ven:0,pact:0,rec:0,n:0}}};
    LOTES.features.forEach(f=>{ const e=estado[f.properties.lote] || normEstado(f.properties.real||f.properties.estado); if(!e||e==="disponible") T.disp++; });
    filas.forEach(r=>{ const k=r.canal&&T.canal[r.canal]?r.canal:"sin", c=T.canal[k];
      if(r.e==="vendido"){ T.ven++; c.ven++; } else { T.sep++; c.sep++; }
      if(r.pactado){ c.pact+=r.pactado; c.n++; } c.rec+=r.recTot; });
    const conPlan = filas.filter(r=>r.q.length), conPrecio = filas.filter(r=>r.pactado);
    T.pactado = conPrecio.reduce((s,r)=>s+r.pactado,0);
    T.recaudado = D.recaudos.filter(x=>!x.anulado).reduce((s,x)=>s+Number(x.valor||0),0);
    T.mora = filas.reduce((s,r)=>s+r.mora,0);
    const a=hoyM.slice(0,4);
    T.anio = a;
    T.pend1 = conPlan.reduce((s,r)=>s+r.pend(a+"-12"),0);
    T.pend2 = conPlan.reduce((s,r)=>s+r.pend((+a+1)+"-12"),0) - T.pend1;
    T.pend3 = conPlan.reduce((s,r)=>s+r.pend((+a+2)+"-12"),0) - T.pend1 - T.pend2;
    T.pendTot = conPlan.reduce((s,r)=>s+Math.max(0,r.prog-r.recTot),0);
    T.conPlan = conPlan.length; T.conPrecio = conPrecio.length; T.neg = filas.length;
    /* inventario disponible a cada lista */
    T.inv = ETAPAS.map(et=>({et, v:LOTES.features.filter(f=>{ const e=estado[f.properties.lote]||normEstado(f.properties.real||f.properties.estado); return !e||e==="disponible"; })
      .reduce((s,f)=>s+(precio(f.properties,et.n)||0),0)}));
    /* referencia: lo comprometido sin precio registrado, a lista E1 (no es lo pactado) */
    T.sinPrecioE1 = filas.filter(r=>!r.pactado).reduce((s,r)=>s+(precio(r.p,1)||0),0);
    /* medios */
    T.medProg = {}; T.medRec = {};
    conPlan.forEach(r=>r.q.forEach(x=>{ T.medProg[x.medio]=(T.medProg[x.medio]||0)+x.valor; }));
    D.recaudos.filter(x=>!x.anulado).forEach(x=>{ T.medRec[x.medio]=(T.medRec[x.medio]||0)+Number(x.valor||0); });
    T.tipos = {};
    filas.forEach(r=>{ const k = !r.plan ? "sin" : (r.q.length ? (r.plan.tipo==="etapa" ? "E"+(r.etapa||"?") : "personalizado") : "por_definir");
      T.tipos[k]=(T.tipos[k]||0)+1; });
    /* planes de lotes que hoy están disponibles (liberados después de registrar el plan) */
    T.huerfanos = D.planes.filter(pl=>{ const e=estado[pl.lote]; return !e || e==="disponible"; }).map(pl=>pl.lote);
    /* cupo de la etapa 1: sólo el 30 % del área vendible (área total de los 86 lotes) se vende a precio E1 */
    const areaTot = LOTES.features.reduce((x,f)=>x+(f.properties.area_m2||0),0);
    const e1 = {total:areaTot, cupo:areaTot*E1_CUPO, ven:0, sep:0, sinEt:0, nVen:0, nSep:0, nSin:0, lotes:[]};
    filas.forEach(r=>{ const a=r.p.area_m2||0;
      if(r.etapa===1){ if(r.e==="vendido"){ e1.ven+=a; e1.nVen++; } else { e1.sep+=a; e1.nSep++; } e1.lotes.push(r.n); }
      else if(!r.etapa){ e1.sinEt+=a; e1.nSin++; } });
    e1.usado=e1.ven+e1.sep; e1.libre=Math.max(0,e1.cupo-e1.usado); e1.prom=areaTot/LOTES.features.length;
    T.e1=e1;
    M = {filas, T, hoyM, cerrado};
  }
  /* series por mes, filtradas por canal */
  function serieMeses(canal){
    const filas = M.filas.filter(r=>canal==="todos" || (r.canal||"sin")===canal);
    const lotes = new Set(filas.map(r=>r.n));
    const prog={}, real={};
    filas.forEach(r=>r.q.forEach(x=>{ prog[x.mes]=(prog[x.mes]||0)+x.valor; }));
    D.recaudos.filter(x=>!x.anulado && (canal==="todos" || lotes.has(x.lote))).forEach(x=>{ const m=mesDe(x.fecha+"T12:00:00"); real[m]=(real[m]||0)+Number(x.valor||0); });
    const todos = Object.keys(prog).concat(Object.keys(real), [M.hoyM]).sort();
    let ini = todos[0] < "2026-09" ? todos[0] : "2026-09", fin = todos[todos.length-1] > FINAL ? todos[todos.length-1] : FINAL;
    const out=[]; for(let m=ini; m<=fin; m=sumaMes(m,1)) out.push({m, prog:prog[m]||0, real:real[m]||0});
    let ap=0, ar=0; out.forEach(o=>{ ap+=o.prog; ar+=o.real; o.ap=ap; o.ar=ar; });
    return out;
  }

  /* ------------------------------ estilos ------------------------------ */
  function css(){
    if(document.getElementById("gzCss")) return;
    const s=document.createElement("style"); s.id="gzCss";
    s.textContent=`
#gzP{position:fixed;inset:0;z-index:72;background:var(--paper);display:flex;flex-direction:column;color:var(--ink);font-size:14px}
#gzP[hidden],#gzP [hidden],.gzEd [hidden]{display:none!important}
.gzH{flex-shrink:0;background:var(--forest);color:var(--on-forest,#F4F2EA);padding:14px clamp(16px,3vw,32px) 0;padding-top:calc(14px + env(safe-area-inset-top,0px))}
.gzT{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.gzT h2{margin:0;font-family:var(--serif);font-weight:600;font-size:26px}
.gzT .eb{font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:#EBD9AE;display:block;margin-bottom:2px}
.gzT .sp{flex:1}
.gzT .corte{font-size:12px;opacity:.75;margin-right:4px}
.gzHB{border:1px solid rgba(246,244,236,.35);background:transparent;color:inherit;border-radius:999px;padding:8px 14px;font-size:13px;font-weight:600;cursor:pointer;min-height:36px}
.gzHB:hover{background:rgba(246,244,236,.1)}
.gzHB.x{width:38px;padding:0;font-size:20px}
.gzTabs{display:flex;gap:2px;margin-top:10px;overflow-x:auto}
.gzTabs button{border:0;background:transparent;color:inherit;opacity:.72;padding:10px 14px 11px;font-weight:700;font-size:13.5px;border-bottom:3px solid transparent;cursor:pointer;white-space:nowrap}
.gzTabs button.on{opacity:1;border-bottom-color:#C9A86B}
.gzTabs button .nb{display:inline-block;min-width:18px;padding:0 5px;margin-left:6px;border-radius:9px;background:#C0392B;color:#fff;font-size:11px;line-height:18px}
.gzL{flex:1;overflow:auto;padding:18px clamp(16px,3vw,32px) 48px}
.gzW{max-width:1240px;margin:0 auto;display:flex;flex-direction:column;gap:18px}
.gzMsg{color:var(--muted);padding:40px 0;text-align:center;max-width:560px;margin:0 auto;line-height:1.55}
.gzSec{background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:16px 18px}
.gzSec h3{margin:0 0 2px;font-family:var(--serif);font-size:19px;font-weight:600;color:var(--forest)}
.gzSec .gzSub{color:var(--muted);font-size:12.5px;margin:0 0 12px;line-height:1.45}
.gzK{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px}
.gzK>div{border:1px solid var(--line);border-radius:12px;padding:11px 13px;background:var(--surface)}
.gzK b{display:block;font-family:var(--serif);font-size:26px;font-weight:600;line-height:1.1;font-variant-numeric:tabular-nums}
.gzK span{font-size:11.5px;color:var(--muted);display:block;margin-top:3px;line-height:1.35}
.gzK small{display:block;font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--gold);font-weight:700;margin-bottom:4px}
.gzK .mal b{color:#B23A2A}.gzK .ok b{color:#1F7A4D}
.gzBar{display:flex;height:30px;border-radius:8px;overflow:hidden;gap:2px;background:var(--surface)}
.gzBar i{display:flex;align-items:center;justify-content:center;color:#fff;font-style:normal;font-size:12px;font-weight:700;min-width:0;white-space:nowrap;overflow:hidden}
.gzLey{display:flex;gap:14px;flex-wrap:wrap;font-size:12.5px;margin-top:8px;color:var(--ink-2)}
.gzLey span{display:inline-flex;align-items:center;gap:6px}.gzLey i{width:11px;height:11px;border-radius:3px;display:inline-block}
.gzG2{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,420px),1fr));gap:18px}
.gzTb{overflow-x:auto;border-radius:10px}
.gzTb table{width:100%;border-collapse:collapse;font-size:13px;font-variant-numeric:tabular-nums}
.gzTb th{text-align:left;font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);font-weight:700;padding:8px 10px;border-bottom:1.5px solid var(--line);white-space:nowrap;background:var(--surface-2)}
.gzTb td{padding:8px 10px;border-bottom:1px solid var(--line-soft,#ECEAE1);vertical-align:top}
.gzTb td.n,.gzTb th.n{text-align:right;white-space:nowrap}
.gzTb tr.tot td{font-weight:700;border-top:1.5px solid var(--forest);border-bottom:0}
.gzTb tbody tr.clic{cursor:pointer}.gzTb tbody tr.clic:hover td{background:#F3F1E8}
.gzTb .nd{color:#A3543F;font-size:11.5px;font-weight:700;letter-spacing:.02em}
.gzTb .mut{color:var(--muted);font-size:12px}
.gzChip{display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:700;border-radius:999px;padding:2px 9px;white-space:nowrap}
.gzChip.ven{background:#F6E3DF;color:#9E2F22}.gzChip.sep{background:#F7EEDB;color:#8A5F12}.gzChip.disp{background:#E3F0E7;color:#2E6B45}
.gzChip.mora{background:#B23A2A;color:#fff}.gzChip.al{background:#F7EEDB;color:#8A5F12}.gzChip.okc{background:#E3F0E7;color:#1F6A42}
.gzDot{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:6px;vertical-align:-1px}
.gzF{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:12px}
.gzF .lab{font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);font-weight:700;margin-right:2px}
.gzF button{border:1px solid var(--line);background:var(--surface);border-radius:999px;padding:6px 11px;font-size:12.5px;cursor:pointer;color:var(--ink)}
.gzF button.on{background:var(--forest);border-color:var(--forest);color:#F4F2EA}
.gzF .sp{flex:1}
.gzBtn{border:1px solid var(--forest);background:var(--forest);color:#F4F2EA;border-radius:999px;padding:9px 16px;font:600 13px var(--sans,sans-serif);cursor:pointer;margin-top:10px}
.gzBtn.sec{background:transparent;color:var(--forest)}
.gzBtn:disabled{opacity:.55;cursor:default}
.gzAviso{border-radius:10px;padding:10px 13px;font-size:13px;line-height:1.45;background:#FBF3E2;border:1px solid #EBD3A0;color:#5E4512}
.gzAviso.rojo{background:#F9E7E3;border-color:#E8B9AE;color:#7E2A1E}
.gzGraf{overflow-x:auto;position:relative}
.gzGraf svg{display:block}
.gzGraf text{font:11px var(--sans,sans-serif);fill:var(--muted)}
.gzTip{position:absolute;pointer-events:none;background:#1C221B;color:#F4F2EA;border-radius:8px;padding:8px 10px;font-size:12px;line-height:1.45;white-space:nowrap;transform:translateX(-50%);z-index:3;font-variant-numeric:tabular-nums}
.gzTip i{display:inline-block;width:9px;height:9px;border-radius:2px;margin-right:5px}
.gzLst{display:flex;flex-direction:column}
.gzLst>div{display:flex;gap:10px;align-items:flex-start;padding:9px 0;border-bottom:1px solid var(--line-soft,#ECEAE1);font-size:13px;line-height:1.4}
.gzLst>div:last-child{border-bottom:0}
.gzLst .cu{flex:0 0 92px;color:var(--muted);font-size:12px;font-variant-numeric:tabular-nums}
.gzLst .tx{flex:1;min-width:0}
.gzLst .va{font-weight:700;white-space:nowrap;font-variant-numeric:tabular-nums}
/* editor del lote */
.gzEd{position:fixed;inset:0;z-index:74;background:rgba(20,26,18,.55);display:flex;justify-content:flex-end}
.gzEdC{width:min(760px,100%);height:100%;background:var(--paper);display:flex;flex-direction:column;box-shadow:-18px 0 50px rgba(0,0,0,.25)}
.gzEdH{background:var(--forest);color:#F4F2EA;padding:14px 18px;padding-top:calc(14px + env(safe-area-inset-top,0px));display:flex;align-items:center;gap:10px}
.gzEdH h3{margin:0;font-family:var(--serif);font-size:22px;font-weight:600;flex:1}
.gzEdB{flex:1;overflow:auto;padding:16px 18px 40px;display:flex;flex-direction:column;gap:16px}
.gzFm{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:10px 12px}
.gzFm label{display:flex;flex-direction:column;gap:4px;font-size:11.5px;font-weight:700;color:var(--ink-2)}
.gzFm input,.gzFm select,.gzFm textarea,.gzQ input,.gzQ select{font:inherit;font-size:13.5px;font-weight:400;padding:8px 10px;border:1px solid var(--line);border-radius:8px;background:var(--surface);color:var(--ink);min-width:0;width:100%;box-sizing:border-box}
.gzFm .ayuda{font-weight:400;color:var(--muted);font-size:11.5px}
.gzSeg{display:flex;gap:6px;flex-wrap:wrap}
.gzSeg button{border:1px solid var(--line);background:var(--surface);border-radius:999px;padding:7px 12px;font-size:12.5px;cursor:pointer}
.gzSeg button.on{background:var(--forest);color:#F4F2EA;border-color:var(--forest)}
.gzQ{width:100%;min-width:560px;border-collapse:collapse;font-size:13px}
.gzTb table.ancha{min-width:880px}.gzTb table.media{min-width:520px}
.gzQ th{font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:var(--muted);text-align:left;padding:6px 4px}
.gzQ td{padding:3px 4px}
.gzQ td:last-child{width:34px}
.gzQ .del{border:0;background:transparent;font-size:18px;cursor:pointer;color:#A3543F}
.gzSum{display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;padding:10px 12px;border-radius:10px;background:var(--surface-2);font-size:13px;font-variant-numeric:tabular-nums}
.gzSum b{font-size:14px}
.gzErr{color:#A3543F;font-size:12.5px;min-height:18px}
@media (max-width:700px){.gzT h2{font-size:21px}.gzT .corte{display:none}.gzK b{font-size:22px}.gzHB .tx{display:none}.gzHB{min-height:34px;padding:6px 10px}.gzHB.x{width:34px}.gzK{grid-template-columns:1fr 1fr}.gzSec{padding:14px}}
@media (prefers-reduced-motion:reduce){#gzP *{transition:none!important}}
`;
    document.head.appendChild(s);
  }

  /* ------------------------------ armazón ------------------------------ */
  function abrir(){
    if(!ROL.esVentas()){ ROL.hoja(); avisar("Entra como administrador de gerencia para ver el tablero.", 4500); return; }
    css();
    if(!raiz){
      raiz=document.createElement("div"); raiz.id="gzP"; raiz.setAttribute("role","dialog"); raiz.setAttribute("aria-label","Tablero gerencial");
      raiz.innerHTML =
        '<div class="gzH"><div class="gzT"><div><span class="eb">Laureles Campestre · gerencia</span><h2>Tablero gerencial</h2></div><div class="sp"></div>'+
          '<span class="corte" id="gzCorte"></span>'+
          '<button class="gzHB" id="gzAct" title="Volver a cargar de la base de datos">↻ <span class="tx">Actualizar</span></button>'+
          '<button class="gzHB" id="gzImp" title="Informe gerencial para imprimir o guardar en PDF">⎙ <span class="tx">Informe PDF</span></button>'+
          '<button class="gzHB" id="gzCsv" title="Cartera en hoja de cálculo">⤓ <span class="tx">Cartera CSV</span></button>'+
          '<button class="gzHB x" id="gzX" aria-label="Cerrar el tablero">×</button></div>'+
          '<div class="gzTabs" role="tablist">'+
            '<button data-t="resumen">Resumen</button><button data-t="cartera">Cartera y pagos</button>'+
            '<button data-t="meses">Recaudo por mes</button><button data-t="dia">Día a día</button></div></div>'+
        '<div class="gzL"></div>';
      document.body.appendChild(raiz);
      raiz.querySelector("#gzX").onclick=cerrar;
      raiz.querySelector("#gzAct").onclick=cargar;
      raiz.querySelector("#gzImp").onclick=informe;
      raiz.querySelector("#gzCsv").onclick=csv;
      raiz.querySelectorAll(".gzTabs button").forEach(b=>b.onclick=()=>{ tab=b.dataset.t; pintar(); raiz.querySelector(".gzL").scrollTop=0; });
      addEventListener("keydown",ev=>{ if(ev.key!=="Escape" || !raiz || raiz.hidden) return; const ed=document.querySelector(".gzEd"); if(ed) ed.remove(); else cerrar(); });
    }
    raiz.hidden=false; document.documentElement.style.overflow="hidden";
    cargar();
  }
  function cerrar(){ if(raiz) raiz.hidden=true; document.documentElement.style.overflow=""; }
  function pintarCargando(){ const L=raiz&&raiz.querySelector(".gzL"); if(L && !M) L.innerHTML='<div class="gzMsg">Cargando el tablero…</div>'; }
  function pintarSinPermiso(){
    const L=raiz.querySelector(".gzL");
    L.innerHTML='<div class="gzMsg"><b>Este tablero es sólo para la gerencia.</b><br>Tu sesión ('+esc(ROL.correo())+') es de asesor: puedes separar y vender lotes y ver los prospectos, '+
      'pero la cartera y los recaudos los ve únicamente la gerencia.</div>';
  }
  function pintar(){
    if(!raiz || !M) return;
    raiz.querySelector("#gzCorte").textContent = "Corte: "+D.cuando.toLocaleString("es-CO",{dateStyle:"medium",timeStyle:"short"});
    const alertas = alertasDe().filter(a=>a.nivel==="rojo").length;
    raiz.querySelectorAll(".gzTabs button").forEach(b=>{ b.classList.toggle("on", b.dataset.t===tab); b.setAttribute("aria-selected", b.dataset.t===tab);
      if(b.dataset.t==="dia") b.innerHTML='Día a día'+(alertas?'<span class="nb">'+alertas+'</span>':''); });
    const L=raiz.querySelector(".gzL");
    L.innerHTML='<div class="gzW">'+({resumen:vResumen, cartera:vCartera, meses:vMeses, dia:vDia}[tab])()+'</div>';
    enganchar(L);
  }

  /* ------------------------------ vistas ------------------------------ */
  function kpi(t, v, d, cls){ return '<div class="'+(cls||"")+'"><small>'+t+'</small><b>'+v+'</b>'+(d?'<span>'+d+'</span>':'')+'</div>'; }
  function vResumen(){
    const T=M.T, tot=86, comp=T.sep+T.ven;
    const et=ETAPAS.find(e=>e.n===S.etapa)||ETAPAS[0], inv=T.inv.find(x=>x.et.n===et.n);
    const a=+T.anio;
    let h='<section class="gzSec"><h3>Inventario</h3><p class="gzSub">Estado real de los '+tot+' lotes en la base de datos, con lo separado y vendido por cada canal.</p>'+
      '<div class="gzK">'+
        kpi("Disponibles", T.disp, inv ? "Valen "+mm(inv.v)+" a lista "+et.l : "")+
        kpi("Separados", T.sep, "Fajardo "+T.canal.fajardo.sep+" · Century 21 "+T.canal.c21.sep+(T.canal.sin.sep?" · sin canal "+T.canal.sin.sep:""))+
        kpi("Vendidos", T.ven, "Fajardo "+T.canal.fajardo.ven+" · Century 21 "+T.canal.c21.ven+(T.canal.sin.ven?" · sin canal "+T.canal.sin.ven:""))+
        kpi("Comprometido", Math.round(comp/tot*100)+" %", comp+" de "+tot+" lotes separados o vendidos")+
      '</div>'+
      '<div style="margin-top:14px" class="gzBar" role="img" aria-label="'+T.ven+' vendidos, '+T.sep+' separados, '+T.disp+' disponibles">'+
        seg(T.ven,"#C0392B","Vendidos")+seg(T.sep,"#C48A2A","Separados")+seg(T.disp,"#4C8862","Disponibles")+'</div>'+
      '<div class="gzLey"><span><i style="background:#C0392B"></i>Vendidos '+T.ven+'</span><span><i style="background:#C48A2A"></i>Separados '+T.sep+'</span><span><i style="background:#4C8862"></i>Disponibles '+T.disp+'</span></div></section>';
    function seg(n,c,t){ return n ? '<i style="flex:'+n+';background:'+c+'" title="'+t+': '+n+'">'+(n>=4?n:"")+'</i>' : ""; }

    h+=seccionE1();
    h+='<div class="gzG2"><section class="gzSec"><h3>Por canal</h3><p class="gzSub">Precio pactado y recaudo sólo de los negocios que tienen el precio registrado.</p><div class="gzTb"><table class="media"><thead><tr><th>Canal</th><th class="n">Separados</th><th class="n">Vendidos</th><th class="n">Total</th><th class="n">Pactado</th><th class="n">Recaudado</th></tr></thead><tbody>'+
      ["fajardo","c21","sin"].filter(k=>k!=="sin"||T.canal.sin.sep+T.canal.sin.ven).map(k=>{ const c=T.canal[k];
        return '<tr><td>'+(CANAL[k]?'<i class="gzDot" style="background:'+CANAL[k].c+'"></i>'+esc(CANAL[k].corto):'Sin canal')+'</td><td class="n">'+c.sep+'</td><td class="n">'+c.ven+'</td><td class="n"><b>'+(c.sep+c.ven)+'</b></td>'+
          '<td class="n">'+(c.n?mm(c.pact)+'<div class="mut">'+c.n+' con precio</div>':'<span class="nd">'+SIN+'</span>')+'</td><td class="n">'+(c.rec?mm(c.rec):'$0')+'</td></tr>'; }).join("")+
      '<tr class="tot"><td>Total</td><td class="n">'+T.sep+'</td><td class="n">'+T.ven+'</td><td class="n">'+comp+'</td><td class="n">'+mm(T.pactado)+'</td><td class="n">'+mm(T.recaudado)+'</td></tr></tbody></table></div></section>'+

      '</div>'+seccionEtapas();

    const cobertura = T.neg ? Math.round(T.conPlan/T.neg*100) : 0;
    h+='<section class="gzSec"><h3>Recaudo</h3><p class="gzSub">Programado según la forma de pago registrada de cada negocio, menos lo ya recibido. Las cuotas se cuentan vencidas cuando termina su mes.</p>'+
      (T.conPlan<T.neg ? '<div class="gzAviso" style="margin-bottom:12px"><b>Forma de pago registrada en '+T.conPlan+' de '+T.neg+' negocios ('+cobertura+' %).</b> Las proyecciones sólo suman esos '+T.conPlan+'. '+
        'Los otros '+(T.neg-T.conPlan)+' aparecen como '+SIN+' en Cartera y pagos: ábrelos ahí y registra el precio y el plan.'+
        (T.sinPrecioE1?' Como referencia, los lotes sin precio registrado valen '+mm(T.sinPrecioE1)+' a lista E1 (no es lo pactado).':'')+'</div>' : '')+
      '<div class="gzK">'+
        kpi("Recaudado a hoy", mm(T.recaudado), (k=>k+(k===1?" pago registrado":" pagos registrados"))(D.recaudos.filter(x=>!x.anulado).length), "ok")+
        kpi("Por recaudar a dic-"+String(a).slice(2), mm(T.pend1), "Lo programado hasta el 31 de diciembre de "+a+" que aún no entra")+
        kpi("Por recaudar en "+(a+1), mm(T.pend2), "Programado entre enero y diciembre de "+(a+1))+
        kpi("Por recaudar en "+(a+2), mm(T.pend3), "Programado en "+(a+2)+" (incluye la cuota final)")+
        kpi("En mora", mm(T.mora), M.filas.filter(r=>r.mora>0).length+" negocios con cuotas vencidas sin pagar", T.mora>0?"mal":"")+
      '</div></section>';

    const tipos=T.tipos, medios=Object.keys(MEDIOS).filter(k=>T.medProg[k]||T.medRec[k]);
    h+='<div class="gzG2"><section class="gzSec"><h3>Formas de pago</h3><p class="gzSub">Cómo quedó pactado cada negocio separado o vendido.</p><div class="gzTb"><table><thead><tr><th>Forma de pago</th><th class="n">Negocios</th></tr></thead><tbody>'+
      Object.keys(tipos).sort((x,y)=>tipos[y]-tipos[x]).map(k=>'<tr><td>'+({sin:'<span class="nd">'+SIN+'</span> · sin registrar', por_definir:'Precio registrado, cronograma por definir', personalizado:'Personalizado (pagos pactados aparte)'}[k] || ('Plan de la etapa '+k+(ETAPAS[+k.slice(1)-1]?' · '+esc(ETAPAS[+k.slice(1)-1].d):'')))+'</td><td class="n">'+tipos[k]+'</td></tr>').join("")+
      '</tbody></table></div></section>'+
      '<section class="gzSec"><h3>Medios de pago</h3><p class="gzSub">Programado y recibido según el medio: dinero, vehículos, CDT, inmuebles.</p>'+
      (medios.length ? '<div class="gzTb"><table><thead><tr><th>Medio</th><th class="n">Programado</th><th class="n">Recibido</th></tr></thead><tbody>'+
        medios.map(k=>'<tr><td>'+MEDIOS[k]+'</td><td class="n">'+mm(T.medProg[k]||0)+'</td><td class="n">'+mm(T.medRec[k]||0)+'</td></tr>').join("")+'</tbody></table></div>'
        : '<div class="gzMsg" style="padding:14px 0">Aún no hay cronogramas ni pagos registrados.</div>')+
      '</section></div>';
    return h;
  }

  /* lotes negociados en cada etapa a la fecha, y lo que vale lo que queda con cada lista */
  function seccionEtapas(){
    const T=M.T, por={}; let sinEt={n:0,ven:0,sep:0};
    M.filas.forEach(r=>{ const k=r.etapa||0, o = k ? (por[k]=por[k]||{n:0,ven:0,sep:0,pact:0,m2:0}) : sinEt;
      o.n++; if(r.e==="vendido") o.ven++; else o.sep++; if(k){ if(r.pactado) o.pact+=r.pactado; o.m2+=r.p.area_m2||0; } });
    const e1=T.e1, quedanE1=e1.libre/e1.prom;
    let h='<section class="gzSec"><h3>Lotes por etapa</h3><p class="gzSub">Negocios registrados en cada etapa a la fecha y valor de los '+T.disp+' lotes disponibles con cada lista (área útil × precio útil + protección × precio de protección).</p>'+
      '<div class="gzTb"><table class="media"><thead><tr><th>Lista</th><th>Condición</th><th class="n">Negociados</th><th class="n">Vendidos</th><th class="n">Separados</th><th class="n">Pactado</th><th class="n">Inventario disponible</th></tr></thead><tbody>';
    let tn=0, tv=0, ts=0, tp=0;
    T.inv.forEach(x=>{ const o=por[x.et.n]||{n:0,ven:0,sep:0,pact:0,m2:0}; tn+=o.n; tv+=o.ven; ts+=o.sep; tp+=o.pact;
      h+='<tr'+(x.et.n===S.etapa?' style="font-weight:700"':'')+'><td>'+x.et.l+'</td><td class="mut">'+esc(x.et.d)+
        (x.et.n===1?'<div class="mut">Cupo 30 %: quedan '+m2f(e1.libre)+' (≈ '+quedanE1.toLocaleString("es-CO",{maximumFractionDigits:1})+' lotes)</div>':'')+'</td>'+
        '<td class="n"><b>'+o.n+'</b></td><td class="n">'+o.ven+'</td><td class="n">'+o.sep+'</td><td class="n">'+(o.pact?mm(o.pact):'—')+'</td><td class="n">'+mm(x.v)+'</td></tr>'; });
    if(sinEt.n) h+='<tr><td><span class="nd">Sin etapa</span></td><td class="mut">Negocios sin etapa registrada</td><td class="n"><b>'+sinEt.n+'</b></td><td class="n">'+sinEt.ven+'</td><td class="n">'+sinEt.sep+'</td><td class="n">—</td><td class="n">—</td></tr>';
    h+='<tr class="tot"><td colspan="2">Total negociados · disponibles '+T.disp+'</td><td class="n">'+(tn+sinEt.n)+'</td><td class="n">'+(tv+sinEt.ven)+'</td><td class="n">'+(ts+sinEt.sep)+'</td><td class="n">'+mm(tp)+'</td><td class="n"></td></tr>';
    return h+'</tbody></table></div></section>';
  }
  function seccionE1(){
    const e=M.T.e1, pc=v=>(v/e.cupo*100);
    const seg2=(v,c,t,extra)=>v>0?'<i style="flex:'+v.toFixed(0)+';background:'+c+(extra||'')+'" title="'+t+': '+m2f(v)+'">'+(pc(v)>=9?Math.round(pc(v))+' %':'')+'</i>':'';
    return '<section class="gzSec"><h3>Cupo de la etapa 1</h3><p class="gzSub">La etapa 1 (contado, −20 %) es sólo el 30 % del área vendible: '+m2f(e.cupo)+' de '+m2f(e.total)+'. Así se va gastando, con los negocios registrados en etapa 1.</p>'+
      '<div class="gzK">'+
        kpi("Usado en etapa 1", Math.round(pc(e.usado))+" %", m2f(e.usado)+" en "+(e.nVen+e.nSep)+" lotes ("+e.nVen+" vendidos, "+e.nSep+" separados)", pc(e.usado)>=85?"mal":"")+
        kpi("Queda del cupo", m2f(e.libre), "≈ "+(e.libre/e.prom).toLocaleString("es-CO",{maximumFractionDigits:1})+" lotes de tamaño promedio ("+m2f(e.prom)+")", e.libre<=0?"mal":"ok")+
        kpi("Sin etapa registrada", e.nSin, e.nSin?m2f(e.sinEt)+" separados o vendidos sin etapa: si fueran etapa 1 usarían "+Math.round(e.sinEt/e.cupo*100)+" % del cupo":"Todos los negocios tienen etapa")+
      '</div>'+
      '<div style="margin-top:14px" class="gzBar" role="img" aria-label="Cupo de etapa 1: '+Math.round(pc(e.usado))+' por ciento usado">'+
        seg2(e.ven,"#C0392B","Vendido en E1")+seg2(e.sep,"#C48A2A","Separado en E1")+
        seg2(e.libre,"#4C8862","Libre")+'</div>'+
      '<div class="gzLey"><span><i style="background:#C0392B"></i>Vendido E1 '+m2f(e.ven)+'</span><span><i style="background:#C48A2A"></i>Separado E1 '+m2f(e.sep)+'</span>'+
        '<span><i style="background:#4C8862"></i>Libre '+m2f(e.libre)+'</span></div>'+
      (e.usado>e.cupo?'<div class="gzAviso rojo" style="margin-top:10px">El cupo de etapa 1 está excedido en '+m2f(e.usado-e.cupo)+'.</div>':'')+
      (e.lotes.length?'<p class="gzSub" style="margin:10px 0 0">Lotes en etapa 1: '+e.lotes.join(", ")+'.</p>':'')+
    '</section>';
  }
  function vCartera(){
    let f=M.filas.filter(r=>(filtroC==="todos"||(r.canal||"sin")===filtroC) && (filtroE==="todos"||r.e===filtroE) &&
      (filtroP==="todos" || (filtroP==="sin" && !r.q.length) || (filtroP==="mora" && r.mora>0) || (filtroP==="mes" && r.prox && r.prox.mes<=M.hoyM)));
    const chips=(nom, val, ops)=>'<span class="lab">'+nom+'</span>'+ops.map(o=>'<button data-'+val+'="'+o[0]+'" class="'+(({c:filtroC,e:filtroE,p:filtroP})[val]===o[0]?"on":"")+'">'+o[1]+'</button>').join("");
    let h='<section class="gzSec"><h3>Cartera y pagos</h3><p class="gzSub">Toca un lote para registrar o corregir su precio pactado, la forma de pago y los pagos recibidos.</p>'+
      '<div class="gzF">'+chips("Canal","c",[["todos","Todos"],["fajardo","Fajardo"],["c21","Century 21"]])+'</div>'+
      '<div class="gzF">'+chips("Estado","e",[["todos","Todos"],["vendido","Vendidos"],["separado","Separados"]])+'<span style="width:10px"></span>'+
        chips("Ver","p",[["todos","Todo"],["mora","En mora"],["mes","Pagan este mes"],["sin","Sin forma de pago"]])+'</div>'+
      '<div class="gzTb"><table class="ancha"><thead><tr><th>Lote</th><th>Estado</th><th>Cliente</th><th>Forma de pago</th><th class="n">Pactado</th><th class="n">Recaudado</th><th class="n">Saldo</th><th>Próximo pago</th></tr></thead><tbody>';
    let sp=0, sr=0, ss=0;
    f.forEach(r=>{
      if(r.pactado) sp+=r.pactado; sr+=r.recTot; if(r.saldo!=null) ss+=r.saldo;
      const fp = !r.plan ? '<span class="nd">'+SIN+'</span>' :
        (r.q.length ? (r.plan.tipo==="etapa" ? "Plan E"+(r.etapa||"?") : "Personalizado")+'<div class="mut">'+r.q.length+' pagos · hasta '+mesTxt(r.q[r.q.length-1].mes)+'</div>' : 'Por definir<div class="mut">sólo precio</div>');
      const prox = r.prox ? (r.mora>0 ? '<span class="gzChip mora">Mora '+mm(r.mora)+'</span><div class="mut">desde '+mesTxt(primerVencido(r))+'</div>' :
          '<b>'+mm(r.prox.valor)+'</b><div class="mut">'+mesLargo(r.prox.mes)+' · '+MEDIOS[r.prox.medio]+'</div>') :
        (r.q.length ? '<span class="gzChip okc">Pagado</span>' : '<span class="mut">—</span>');
      h+='<tr class="clic" data-lote="'+r.n+'"><td><b>'+r.n+'</b></td><td><span class="gzChip '+(r.e==="vendido"?"ven":"sep")+'">'+estadoTxt(r.e)+'</span><div class="mut">'+(r.canal&&CANAL[r.canal]?'<i class="gzDot" style="background:'+CANAL[r.canal].c+'"></i>'+esc(CANAL[r.canal].corto):'Sin canal')+'</div></td>'+
        '<td>'+(r.clientePend?'<span class="nd">'+esc(r.cliente||"Sin nombre")+'</span>':esc(r.cliente))+'<div class="mut">'+(r.desde?(r.e==="vendido"?"Vendido ":"Separado ")+fecha(r.desde):'')+'</div></td>'+
        '<td>'+fp+'</td><td class="n">'+(r.pactado?mm(r.pactado):'<span class="nd">'+SIN+'</span>')+'</td>'+
        '<td class="n">'+mm(r.recTot)+(r.pactado?'<div class="mut">'+Math.round(r.recTot/r.pactado*100)+' %</div>':'')+'</td>'+
        '<td class="n">'+(r.saldo!=null?mm(r.saldo):'<span class="mut">—</span>')+'</td><td>'+prox+'</td></tr>';
    });
    if(!f.length) h+='<tr><td colspan="8" class="mut" style="text-align:center;padding:24px">Ningún negocio con este filtro.</td></tr>';
    else h+='<tr class="tot"><td colspan="4">'+f.length+' negocios</td><td class="n">'+mm(sp)+'</td><td class="n">'+mm(sr)+'</td><td class="n">'+mm(ss)+'</td><td></td></tr>';
    h+='</tbody></table></div></section>';
    return h;
  }
  function primerVencido(r){ let a=0; for(const x of r.q){ a+=x.valor; if(a>r.recTot+0.5) return x.mes; } return null; }

  function vMeses(){
    const S2=serieMeses(canalMes), a=+M.T.anio;
    const anios={}; S2.forEach(o=>{ const y=o.m.slice(0,4); (anios[y]=anios[y]||{prog:0,real:0}); anios[y].prog+=o.prog; anios[y].real+=o.real; });
    let h='<section class="gzSec"><h3>Recaudo por mes</h3><p class="gzSub">Barras ámbar: lo programado en los cronogramas registrados. Barras verdes: lo recibido según los pagos registrados. Pasa el cursor por un mes para ver los valores.</p>'+
      '<div class="gzF"><span class="lab">Canal</span>'+[["todos","Todos"],["fajardo","Fajardo"],["c21","Century 21"]].map(o=>'<button data-cm="'+o[0]+'" class="'+(canalMes===o[0]?"on":"")+'">'+o[1]+'</button>').join("")+'</div>'+
      (M.T.conPlan<M.T.neg?'<div class="gzAviso" style="margin-bottom:12px">Lo programado sólo incluye los '+M.T.conPlan+' negocios con cronograma registrado de '+M.T.neg+'.</div>':'')+
      grafica(S2)+
      '<div class="gzLey"><span><i style="background:'+C_PROG+'"></i>Programado</span><span><i style="background:'+C_REAL+'"></i>Recibido</span><span><i style="background:none;border-left:2px dashed #6B7367;border-radius:0;width:2px"></i>Mes actual</span></div></section>';
    h+='<section class="gzSec"><h3>Por año</h3><div class="gzTb"><table><thead><tr><th>Año</th><th class="n">Programado</th><th class="n">Recibido</th><th class="n">Diferencia</th></tr></thead><tbody>'+
      Object.keys(anios).sort().map(y=>'<tr><td><b>'+y+'</b></td><td class="n">'+mm(anios[y].prog)+'</td><td class="n">'+mm(anios[y].real)+'</td><td class="n">'+mm(anios[y].real-anios[y].prog)+'</td></tr>').join("")+
      '</tbody></table></div></section>';
    h+='<section class="gzSec"><h3>Mes a mes</h3><div class="gzTb"><table class="media"><thead><tr><th>Mes</th><th class="n">Programado</th><th class="n">Recibido</th><th class="n">Programado acumulado</th><th class="n">Recibido acumulado</th></tr></thead><tbody>'+
      S2.filter(o=>o.prog||o.real||o.m===M.hoyM).map(o=>'<tr'+(o.m===M.hoyM?' style="background:#FBF6EA"':'')+'><td>'+mesLargo(o.m)+(o.m===M.hoyM?' <span class="gzChip al">este mes</span>':'')+'</td><td class="n">'+(o.prog?mm(o.prog):'—')+'</td><td class="n">'+(o.real?mm(o.real):'—')+'</td><td class="n">'+mm(o.ap)+'</td><td class="n">'+mm(o.ar)+'</td></tr>').join("")+
      '</tbody></table></div></section>';
    return h;
  }
  function grafica(S2){
    const n=S2.length, bw=11, gap=3, slot=bw*2+gap+12, padL=58, padB=34, padT=14, H=250, W=padL+n*slot+10;
    const max=Math.max(1, ...S2.map(o=>Math.max(o.prog,o.real)));
    const paso=[1e6,2e6,5e6,1e7,2e7,5e7,1e8,2e8,5e8,1e9,2e9,5e9].find(p=>max/p<=5)||1e10, top=Math.ceil(max/paso)*paso;
    const y=v=>padT+(H-padT-padB)*(1-v/top), alto=v=>Math.max(v>0?2:0,(H-padT-padB)*v/top);
    let g='';
    for(let v=0; v<=top+1; v+=paso){ g+='<line x1="'+padL+'" x2="'+(W-6)+'" y1="'+y(v)+'" y2="'+y(v)+'" stroke="#E4E1D6" stroke-width="1"/><text x="'+(padL-8)+'" y="'+(y(v)+4)+'" text-anchor="end">'+(v>=1e9?(v/1e9).toLocaleString("es-CO")+" mil M":(v/1e6).toLocaleString("es-CO")+" M")+'</text>'; }
    S2.forEach((o,i)=>{
      const x=padL+i*slot+6;
      if(o.m===M.hoyM) g+='<line x1="'+(x+bw+gap/2)+'" x2="'+(x+bw+gap/2)+'" y1="'+padT+'" y2="'+(H-padB)+'" stroke="#6B7367" stroke-dasharray="4 3" stroke-width="1.2"/>';
      if(o.prog) g+='<path d="'+barra(x,y(o.prog),bw,alto(o.prog))+'" fill="'+C_PROG+'"/>';
      if(o.real) g+='<path d="'+barra(x+bw+gap,y(o.real),bw,alto(o.real))+'" fill="'+C_REAL+'"/>';
      const mes=+o.m.slice(5);
      if(mes===1||i===0||mes===7) g+='<text x="'+(x+bw)+'" y="'+(H-padB+16)+'" text-anchor="middle">'+mesTxt(o.m)+'</text>';
      else g+='<text x="'+(x+bw)+'" y="'+(H-padB+16)+'" text-anchor="middle" style="font-size:9.5px">'+MESES[mes-1].charAt(0).toUpperCase()+'</text>';
      g+='<rect class="hit" data-i="'+i+'" x="'+(x-5)+'" y="'+padT+'" width="'+slot+'" height="'+(H-padT-padB+20)+'" fill="transparent"/>';
    });
    g+='<line x1="'+padL+'" x2="'+(W-6)+'" y1="'+(H-padB)+'" y2="'+(H-padB)+'" stroke="#B9B6A8"/>';
    graf=S2;
    return '<div class="gzGraf" id="gzGraf"><svg width="'+W+'" height="'+H+'" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Recaudo programado y recibido por mes">'+g+'</svg><div class="gzTip" hidden></div></div>';
  }
  let graf=null;
  function barra(x,y0,w,h){ if(h<=0) return ""; const r=Math.min(4,h/2,w/2), yb=y0+h;
    return "M"+x+","+yb+"V"+(y0+r)+"Q"+x+","+y0+" "+(x+r)+","+y0+"H"+(x+w-r)+"Q"+(x+w)+","+y0+" "+(x+w)+","+(y0+r)+"V"+yb+"Z"; }

  function alertasDe(){
    if(!M) return [];
    const A=[];
    M.filas.filter(r=>r.mora>0).forEach(r=>A.push({nivel:"rojo", lote:r.n, t:"Lote "+r.n+" en mora: "+cop(r.mora)+" vencidos sin pagar desde "+mesLargo(primerVencido(r))+".", v:r.mora}));
    M.filas.filter(r=>r.prox && r.prox.mes===M.hoyM && r.mora===0).forEach(r=>A.push({nivel:"amar", lote:r.n, t:"Lote "+r.n+" debe pagar este mes "+cop(r.prox.valor)+" ("+MEDIOS[r.prox.medio]+(r.prox.concepto?", "+r.prox.concepto:"")+").", v:r.prox.valor}));
    M.filas.filter(r=>r.prox && r.prox.mes===sumaMes(M.hoyM,1) && r.mora===0).forEach(r=>A.push({nivel:"info", lote:r.n, t:"Lote "+r.n+" paga el próximo mes "+cop(r.prox.valor)+".", v:r.prox.valor}));
    const e1=M.T.e1; if(e1.usado>=e1.cupo*0.85) A.push({nivel:e1.usado>e1.cupo?"rojo":"amar", t:"Cupo de etapa 1 al "+Math.round(e1.usado/e1.cupo*100)+" %: quedan "+m2f(e1.libre)+"."});
    const sinPlan=M.filas.filter(r=>!r.q.length);
    if(sinPlan.length) A.push({nivel:"amar", t:sinPlan.length+" negocios sin forma de pago registrada: lotes "+sinPlan.map(r=>r.n).join(", ")+"."});
    const sinCli=M.filas.filter(r=>r.clientePend);
    if(sinCli.length) A.push({nivel:"amar", t:sinCli.length+" negocios sin el nombre del cliente confirmado: lotes "+sinCli.map(r=>r.n).join(", ")+"."});
    M.filas.filter(r=>r.e==="separado" && r.desde && dias(r.desde)>30).forEach(r=>A.push({nivel:"info", lote:r.n, t:"Lote "+r.n+" lleva "+dias(r.desde)+" días separado sin pasar a vendido.", v:0}));
    if(M.T.huerfanos.length) A.push({nivel:"info", t:"Hay forma de pago registrada en lotes que hoy están disponibles (liberados): "+M.T.huerfanos.join(", ")+". No se suman en el tablero."});
    return A;
  }
  function vDia(){
    const A=alertasDe(), hoy=new Date(); hoy.setHours(0,0,0,0);
    const mov=D.negocios.filter(x=>dias(x.creado)<=30).slice(0,40);
    const rec=D.recaudos.slice(0,30);
    const vis=D.visitas.filter(v=>v.fecha && new Date(v.fecha+"T23:59:59")>=hoy && v.estado!=="cancelada").sort((a,b)=>a.fecha<b.fecha?-1:1).slice(0,15);
    const reg=k=>D.visitantes.filter(v=>dias(v.creado)<k).length;
    const regHoy=D.visitantes.filter(v=>new Date(v.creado)>=hoy).length;
    const ico={rojo:'<span class="gzChip mora">Mora</span>', amar:'<span class="gzChip al">Revisar</span>', info:'<span class="gzChip disp">Aviso</span>'};
    let h='<section class="gzSec"><h3>Alertas</h3><p class="gzSub">Lo que pide atención hoy, de lo más urgente a lo informativo.</p>'+
      (A.length?'<div class="gzLst">'+A.sort((a,b)=>({rojo:0,amar:1,info:2}[a.nivel]-{rojo:0,amar:1,info:2}[b.nivel])).map(a=>'<div'+(a.lote?' class="clic" data-lote="'+a.lote+'" style="cursor:pointer"':'')+'><span class="cu">'+ico[a.nivel]+'</span><span class="tx">'+esc(a.t)+'</span></div>').join("")+'</div>'
        :'<div class="gzMsg" style="padding:14px 0">Sin alertas.</div>')+'</section>';
    h+='<div class="gzK">'+kpi("Registros web hoy", regHoy, "Personas que dejaron sus datos en la página")+kpi("Últimos 7 días", reg(7), "Registros web")+kpi("Últimos 30 días", reg(30), "Registros web")+
      kpi("Visitas próximas", vis.length, "Agendadas desde hoy")+'</div>';
    h+='<div class="gzG2"><section class="gzSec"><h3>Movimientos de lotes · 30 días</h3><p class="gzSub">Cada separación, venta o liberación, con quién la registró.</p>'+
      (mov.length?'<div class="gzLst">'+mov.map(x=>'<div class="clic" data-lote="'+x.lote+'" style="cursor:pointer"><span class="cu">'+fechaHora(x.creado)+'</span><span class="tx"><b>Lote '+x.lote+'</b> · '+
        (x.estado_anterior?esc(estadoTxt(normEstado(x.estado_anterior)))+' → ':'')+'<b>'+esc(estadoTxt(x.estado))+'</b>'+(x.canal&&CANAL[x.canal]?' · '+esc(CANAL[x.canal].corto):'')+
        (x.cliente?'<br><span class="mut">'+esc(x.cliente)+(x.registrado_por?' · registró '+esc(x.registrado_por):'')+'</span>':'')+'</span></div>').join("")+'</div>'
        :'<div class="gzMsg" style="padding:14px 0">Sin movimientos en 30 días.</div>')+'</section>'+
      '<section class="gzSec"><h3>Pagos registrados</h3><p class="gzSub">Los últimos pagos recibidos. Un pago anulado queda tachado con su motivo.</p>'+
      (rec.length?'<div class="gzLst">'+rec.map(x=>'<div class="clic" data-lote="'+x.lote+'" style="cursor:pointer'+(x.anulado?';opacity:.55;text-decoration:line-through':'')+'"><span class="cu">'+fecha(x.fecha+"T12:00:00")+'</span><span class="tx"><b>Lote '+x.lote+'</b> · '+esc(MEDIOS[x.medio]||x.medio)+(x.concepto?' · '+esc(x.concepto):'')+
        '<br><span class="mut">'+(x.registrado_por?'Registró '+esc(x.registrado_por):'')+(x.anulado?' · anulado: '+esc(x.anulado_motivo):'')+'</span></span><span class="va">'+cop(x.valor)+'</span></div>').join("")+'</div>'
        :'<div class="gzMsg" style="padding:14px 0">Aún no hay pagos registrados. Ábrelos desde Cartera y pagos.</div>')+'</section></div>';
    h+='<div class="gzG2"><section class="gzSec"><h3>Visitas agendadas</h3>'+
      (vis.length?'<div class="gzLst">'+vis.map(v=>'<div><span class="cu">'+fecha(v.fecha+"T12:00:00")+'</span><span class="tx">'+esc(v.nombre||"")+(v.lote?' · lote '+v.lote:'')+'<br><span class="mut">'+esc(v.hora||v.franja||"")+' · '+esc(v.estado||"")+'</span></span></div>').join("")+'</div>'
        :'<div class="gzMsg" style="padding:14px 0">No hay visitas agendadas desde hoy.</div>')+'</section>'+
      '<section class="gzSec"><h3>Prospectos recientes</h3>'+
      (D.prospectos.length?'<div class="gzLst">'+D.prospectos.slice(0,12).map(p=>'<div><span class="cu">'+fecha(p.creado)+'</span><span class="tx">'+esc(p.nombre||"")+(p.lote?' · lote '+p.lote:'')+(p.etapa?' · E'+p.etapa:'')+'<br><span class="mut">'+esc(p.origen||"")+'</span></span>'+(p.precio_cop?'<span class="va">'+mm(p.precio_cop)+'</span>':'')+'</div>').join("")+'</div>'
        :'<div class="gzMsg" style="padding:14px 0">Sin prospectos registrados.</div>')+'</section></div>';
    return h;
  }

  function enganchar(L){
    L.querySelectorAll("[data-lote]").forEach(el=>el.onclick=()=>editor(+el.dataset.lote));
    L.querySelectorAll("[data-c]").forEach(b=>b.onclick=()=>{ filtroC=b.dataset.c; pintar(); });
    L.querySelectorAll("[data-e]").forEach(b=>b.onclick=()=>{ filtroE=b.dataset.e; pintar(); });
    L.querySelectorAll("[data-p]").forEach(b=>b.onclick=()=>{ filtroP=b.dataset.p; pintar(); });
    L.querySelectorAll("[data-cm]").forEach(b=>b.onclick=()=>{ canalMes=b.dataset.cm; pintar(); });
    const G=L.querySelector("#gzGraf");
    if(G){ const tip=G.querySelector(".gzTip");
      G.querySelectorAll(".hit").forEach(r=>{
        const ver=()=>{ const o=graf[+r.dataset.i]; if(!o) return; const bb=r.getBoundingClientRect(), gb=G.getBoundingClientRect();
          tip.innerHTML='<b>'+mesLargo(o.m)+'</b><br><i style="background:'+C_PROG+'"></i>Programado '+cop(o.prog)+'<br><i style="background:'+C_REAL+'"></i>Recibido '+cop(o.real)+
            '<br><span style="opacity:.7">Acumulado: '+mm(o.ap)+' / '+mm(o.ar)+'</span>';
          tip.hidden=false; const x=bb.left-gb.left+G.scrollLeft+bb.width/2, half=tip.offsetWidth/2+4; tip.style.left=Math.max(G.scrollLeft+half, Math.min(G.scrollLeft+G.clientWidth-half, x))+"px"; tip.style.top="4px"; };
        r.addEventListener("mouseenter",ver); r.addEventListener("click",ver);
        r.addEventListener("mouseleave",()=>{ tip.hidden=true; });
      });
      /* que se vea el mes actual */
      const i=graf.findIndex(o=>o.m===M.hoyM); if(i>8) G.scrollLeft=Math.max(0,(i-6)*37);
    }
  }

  /* ------------------------------ editor de un lote ------------------------------ */
  function planEtapa(v, e, firma){
    const pp=planPago(v, e), out=[], sep=Math.min(SEPARACION, pp.inicial);
    out.push({mes:firma, concepto:"Separación", medio:"dinero", valor:Math.round(sep)});
    const mIni = firma > LIM_INI ? firma : LIM_INI;
    if(pp.inicial-sep > 0.5) out.push({mes:mIni, concepto:pp.contado?"Saldo de contado":"Resto de la cuota inicial", medio:"dinero", valor:Math.round(pp.inicial-sep)});
    if(!pp.contado){
      for(let i=0;i<pp.n;i++) out.push({mes:sumaMes(CUO_INI,i), concepto:"Cuota "+(i+1)+" de "+pp.n, medio:"dinero", valor:Math.round(pp.cuota)});
      out.push({mes:FINAL, concepto:"Cuota final", medio:"dinero", valor:Math.round(pp.ultima)});
    }
    /* el redondeo no puede cambiar el total */
    const d=Math.round(v)-out.reduce((s,x)=>s+x.valor,0); out[out.length-1].valor+=d;
    return out;
  }
  function desdeComparador(n){
    let st=null; try{ st=JSON.parse(localStorage.getItem("laureles.comparador."+n)||"null"); }catch(e){}
    if(!st) return null;
    const out=[];
    (st.filas||[]).forEach(f=>{ const v=num(f.v); if(v>0) out.push({mes:f.m||st.firma, concepto:f.c||"Pago", medio:MEDIOS[f.t]?f.t:"dinero", valor:v}); });
    (st.cuotas||[]).forEach(q=>{ const k=Math.max(0,Math.min(120,num(q.n))), v=num(q.v);
      for(let i=0;i<k && v>0;i++) out.push({mes:sumaMes(q.desde||CUO_INI,i), concepto:"Cuota "+(i+1)+" de "+k, medio:MEDIOS[q.t]?q.t:"dinero", valor:v}); });
    return {cuotas:out, etapa:st.etapa, firma:st.firma, cliente:st.cliente, precio:num(st.precioCliente)};
  }
  function editor(n){
    const r=M.filas.find(x=>x.n===n);
    if(!r){ avisar("El lote "+n+" está disponible: no tiene negocio para registrar pagos.", 4000); return; }
    const pl=r.plan||{};
    const ed={cliente:pl.cliente||r.cliente||"", canal:pl.canal||r.canal||"", etapa:pl.etapa||"", pactado:pl.precio_pactado||"",
      firma:pl.firma?String(pl.firma).slice(0,7):(r.desde?mesDe(r.desde):M.hoyM), tipo:pl.tipo||"por_definir", notas:pl.notas||"",
      cuotas:cuotasDe(pl).map(x=>Object.assign({},x))};
    const v=document.createElement("div"); v.className="gzEd";
    v.innerHTML='<div class="gzEdC" role="dialog" aria-modal="true" aria-label="Lote '+n+'"><div class="gzEdH"><h3>Lote '+n+' · '+estadoTxt(r.e)+'</h3><button class="gzHB x" id="gzEdX" aria-label="Cerrar">×</button></div><div class="gzEdB"></div></div>';
    document.body.appendChild(v);
    const B=v.querySelector(".gzEdB");
    v.querySelector("#gzEdX").onclick=()=>v.remove();
    v.addEventListener("click",ev=>{ if(ev.target===v) v.remove(); });
    const comp=desdeComparador(n);

    function total(){ return ed.cuotas.reduce((s,x)=>s+num(x.valor),0); }
    function pintarEd(){
      const lista = ed.etapa ? precio(r.p, +ed.etapa) : null, pac=num(ed.pactado), tot=total();
      B.innerHTML=
        '<section class="gzSec"><h3>Negocio</h3><p class="gzSub">'+(r.neg?'Registrado por '+esc(r.neg.registrado_por||"")+' el '+fecha(r.neg.creado)+(r.neg.notas?' · '+esc(r.neg.notas):''):'Sin registro de negocio')+'</p>'+
        '<div class="gzFm">'+
          '<label>Cliente<input id="eCli" value="'+esc(ed.cliente)+'"></label>'+
          '<label>Canal<select id="eCan"><option value="">Sin canal</option><option value="fajardo"'+(ed.canal==="fajardo"?" selected":"")+'>Juan Carlos Fajardo</option><option value="c21"'+(ed.canal==="c21"?" selected":"")+'>Century 21 DAB</option></select></label>'+
          '<label>Etapa de la negociación<select id="eEt"><option value="">—</option>'+ETAPAS.map(e=>'<option value="'+e.n+'"'+(+ed.etapa===e.n?" selected":"")+'>'+e.l+' · '+esc(e.d)+'</option>').join("")+'</select>'+
            '<span class="ayuda">'+(lista?'Lista '+ETAPAS[ed.etapa-1].l+': '+cop(lista):'Escoge la etapa para ver el precio de lista')+'</span></label>'+
          '<label>Precio pactado<input id="ePac" inputmode="numeric" value="'+fmtN(pac)+'" placeholder="$"><span class="ayuda">'+(lista&&pac?(pac===lista?'Igual a la lista':(pac>lista?'+':'−')+cop(Math.abs(pac-lista))+' frente a la lista'):'&nbsp;')+'</span></label>'+
          '<label>Mes de la firma<input id="eFir" type="month" value="'+esc(ed.firma)+'"></label>'+
        '</div></section>'+
        '<section class="gzSec"><h3>Forma de pago</h3><p class="gzSub">El cronograma de lo que el cliente se comprometió a pagar. Con él salen lo programado, la mora y las proyecciones.</p>'+
          '<div class="gzSeg" id="eTipo">'+Object.keys(TIPO).map(k=>'<button data-k="'+k+'" class="'+(ed.tipo===k?"on":"")+'">'+TIPO[k]+'</button>').join("")+'</div>'+
          '<div style="display:flex;gap:8px;flex-wrap:wrap">'+
            '<button class="gzBtn sec" id="eGen"'+(ed.etapa&&pac?'':' disabled')+'>Llenar con el plan de la etapa</button>'+
            (comp?'<button class="gzBtn sec" id="eComp">Traer la propuesta del comparador</button>':'')+
            '<button class="gzBtn sec" id="eAdd">+ Agregar un pago</button>'+
            '<button class="gzBtn sec" id="eAddN">+ Cuotas iguales</button></div>'+
          '<div id="eNcuo" hidden style="margin-top:10px" class="gzFm"><label>Cuántas<input id="eNn" inputmode="numeric" value="12"></label><label>Valor de cada una<input id="eNv" inputmode="numeric" placeholder="$"></label>'+
            '<label>Desde<input id="eNd" type="month" value="'+CUO_INI+'"></label><label>Medio<select id="eNm">'+Object.keys(MEDIOS).map(k=>'<option value="'+k+'">'+MEDIOS[k]+'</option>').join("")+'</select></label>'+
            '<label>&nbsp;<button class="gzBtn" id="eNok" style="margin:0">Agregar cuotas</button></label></div>'+
          (ed.cuotas.length?'<div class="gzTb" style="margin-top:12px"><table class="gzQ"><thead><tr><th style="width:130px">Mes</th><th>Concepto</th><th style="width:110px">Medio</th><th style="width:150px">Valor</th><th></th></tr></thead><tbody>'+
            ed.cuotas.map((q,i)=>'<tr><td><input type="month" data-i="'+i+'" data-f="mes" value="'+esc(q.mes)+'"></td><td><input data-i="'+i+'" data-f="concepto" value="'+esc(q.concepto)+'"></td>'+
              '<td><select data-i="'+i+'" data-f="medio">'+Object.keys(MEDIOS).map(k=>'<option value="'+k+'"'+(q.medio===k?" selected":"")+'>'+MEDIOS[k]+'</option>').join("")+'</select></td>'+
              '<td><input inputmode="numeric" data-i="'+i+'" data-f="valor" value="'+fmtN(num(q.valor))+'"></td><td><button class="del" data-del="'+i+'" aria-label="Quitar">×</button></td></tr>').join("")+
            '</tbody></table></div>':'<div class="gzMsg" style="padding:14px 0">Sin cronograma. Llénalo con el plan de la etapa o agrega los pagos uno por uno.</div>')+
          '<div class="gzSum" style="margin-top:10px"><span>Programado: <b>'+cop(tot)+'</b> en '+ed.cuotas.length+' pagos</span>'+
            '<span>'+(pac?(Math.round(tot)===Math.round(pac)?'<span class="gzChip okc">Cuadra con el precio pactado</span>':'<span class="gzChip mora">'+(tot<pac?'Faltan ':'Sobran ')+cop(Math.abs(pac-tot))+'</span>'):'<span class="mut">Sin precio pactado</span>')+'</span></div>'+
          '<div class="gzFm" style="margin-top:12px"><label style="grid-column:1/-1">Notas<textarea id="eNot" rows="2">'+esc(ed.notas)+'</textarea></label></div>'+
          '<div class="gzErr" id="eErr"></div>'+
          '<button class="gzBtn" id="eGuardar">Guardar forma de pago</button>'+
          (pl.actualizado?'<span class="mut" style="margin-left:10px;font-size:12px">Última actualización: '+fechaHora(pl.actualizado)+(pl.actualizado_por?' · '+esc(pl.actualizado_por):'')+'</span>':'')+
        '</section>'+
        seccionPagos();
      enganchesEd();
    }
    function seccionPagos(){
      const rs=D.recaudos.filter(x=>x.lote===n);
      const tot=rs.filter(x=>!x.anulado).reduce((s,x)=>s+Number(x.valor),0), pac=num(ed.pactado);
      return '<section class="gzSec"><h3>Pagos recibidos</h3><p class="gzSub">Registra cada pago cuando entre. Si te equivocas, anúlalo con el motivo y registra el correcto: los pagos no se borran.</p>'+
        '<div class="gzFm"><label>Fecha<input type="date" id="pFec" value="'+new Date().toISOString().slice(0,10)+'"></label>'+
          '<label>Valor<input id="pVal" inputmode="numeric" placeholder="$"></label>'+
          '<label>Medio<select id="pMed">'+Object.keys(MEDIOS).map(k=>'<option value="'+k+'">'+MEDIOS[k]+'</option>').join("")+'</select></label>'+
          '<label>Concepto<input id="pCon" placeholder="Separación, cuota 3, saldo…"></label>'+
          '<label>Soporte<input id="pRef" placeholder="Nº de recibo o de transferencia"></label></div>'+
        '<div class="gzErr" id="pErr"></div><button class="gzBtn" id="pOk">Registrar pago</button>'+
        (rs.length?'<div class="gzTb" style="margin-top:14px"><table><thead><tr><th>Fecha</th><th>Concepto</th><th>Medio</th><th class="n">Valor</th><th></th></tr></thead><tbody>'+
          rs.map(x=>'<tr'+(x.anulado?' style="opacity:.55"':'')+'><td>'+fecha(x.fecha+"T12:00:00")+'</td><td>'+esc(x.concepto||"")+(x.referencia?'<div class="mut">Soporte '+esc(x.referencia)+'</div>':'')+
            '<div class="mut">'+esc(x.registrado_por||"")+(x.anulado?' · <b>anulado</b>: '+esc(x.anulado_motivo):'')+'</div></td><td>'+esc(MEDIOS[x.medio]||x.medio)+'</td>'+
            '<td class="n" style="'+(x.anulado?'text-decoration:line-through':'')+'">'+cop(x.valor)+'</td><td>'+(x.anulado?'':'<button class="gzBtn sec" style="margin:0;padding:5px 10px;font-size:12px" data-anu="'+x.id+'">Anular</button>')+'</td></tr>').join("")+
          '<tr class="tot"><td colspan="3">Recibido'+(pac?' · '+Math.round(tot/pac*100)+' % del pactado':'')+'</td><td class="n">'+cop(tot)+'</td><td></td></tr></tbody></table></div>':'<div class="gzMsg" style="padding:14px 0">Aún no hay pagos registrados para este lote.</div>')+
        '</section>';
    }
    function leer(){
      const g=id=>B.querySelector(id);
      ed.cliente=g("#eCli").value.trim(); ed.canal=g("#eCan").value; ed.etapa=g("#eEt").value?+g("#eEt").value:"";
      ed.pactado=num(g("#ePac").value)||""; ed.firma=g("#eFir").value||ed.firma; ed.notas=g("#eNot").value;
      B.querySelectorAll(".gzQ [data-f]").forEach(el=>{ const q=ed.cuotas[+el.dataset.i]; if(!q) return; q[el.dataset.f]= el.dataset.f==="valor" ? num(el.value) : el.value; });
    }
    function enganchesEd(){
      const g=id=>B.querySelector(id);
      ["#eEt","#ePac"].forEach(id=>g(id).addEventListener("change",()=>{ leer(); pintarEd(); }));
      g("#ePac").addEventListener("input",ev=>{ const p=ev.target.selectionStart, a=ev.target.value.length; ev.target.value=fmtN(num(ev.target.value)); });
      B.querySelectorAll('.gzQ input[data-f="valor"], #pVal, #eNv').forEach(i=>i.addEventListener("input",ev=>{ ev.target.value=fmtN(num(ev.target.value)); }));
      B.querySelectorAll('.gzQ [data-f]').forEach(i=>i.addEventListener("change",()=>{ leer(); pintarEd(); }));
      g("#eTipo").onclick=ev=>{ const b=ev.target.closest("button"); if(!b) return; leer(); ed.tipo=b.dataset.k; pintarEd(); };
      g("#eGen").onclick=()=>{ leer(); if(!ed.etapa||!ed.pactado) return;
        if(ed.cuotas.length && !confirmar("Esto reemplaza los "+ed.cuotas.length+" pagos del cronograma por el plan de la etapa. ¿Sigues?")) return;
        ed.cuotas=planEtapa(num(ed.pactado), +ed.etapa, ed.firma); ed.tipo="etapa"; pintarEd(); };
      const gc=g("#eComp"); if(gc) gc.onclick=()=>{ leer(); if(ed.cuotas.length && !confirmar("Esto reemplaza el cronograma por la propuesta guardada en el comparador. ¿Sigues?")) return;
        ed.cuotas=comp.cuotas.map(x=>Object.assign({},x)); ed.tipo="personalizado";
        if(!ed.etapa && comp.etapa) ed.etapa=comp.etapa; if(!ed.pactado && comp.precio) ed.pactado=comp.precio; if(!ed.cliente && comp.cliente) ed.cliente=comp.cliente;
        if(comp.firma) ed.firma=comp.firma; pintarEd(); };
      g("#eAdd").onclick=()=>{ leer(); const ult=ed.cuotas[ed.cuotas.length-1]; ed.cuotas.push({mes:ult?sumaMes(ult.mes,1):ed.firma, concepto:"", medio:"dinero", valor:0}); if(ed.tipo==="por_definir") ed.tipo="personalizado"; pintarEd(); };
      g("#eAddN").onclick=()=>{ g("#eNcuo").hidden=!g("#eNcuo").hidden; };
      g("#eNok").onclick=()=>{ leer(); const k=Math.min(120,num(g("#eNn").value)), val=num(g("#eNv").value), d=g("#eNd").value||CUO_INI, m=g("#eNm").value;
        if(!k||!val){ g("#eErr").textContent="Escribe cuántas cuotas y el valor de cada una."; return; }
        for(let i=0;i<k;i++) ed.cuotas.push({mes:sumaMes(d,i), concepto:"Cuota "+(i+1)+" de "+k, medio:m, valor:val});
        ed.cuotas.sort((a,b)=>a.mes<b.mes?-1:a.mes>b.mes?1:0); if(ed.tipo==="por_definir") ed.tipo="personalizado"; pintarEd(); };
      B.querySelectorAll("[data-del]").forEach(b=>b.onclick=()=>{ leer(); ed.cuotas.splice(+b.dataset.del,1); pintarEd(); });
      g("#eGuardar").onclick=async()=>{
        leer(); const err=g("#eErr"), bt=g("#eGuardar");
        const q=ed.cuotas.filter(x=>num(x.valor)>0 && /^\d{4}-\d{2}$/.test(x.mes)).map(x=>({mes:x.mes, concepto:x.concepto||"", medio:x.medio, valor:num(x.valor)}));
        if(ed.tipo!=="por_definir" && !q.length){ err.textContent="El cronograma está vacío: llénalo o marca la forma de pago como Por definir."; return; }
        if(!ed.pactado && q.length){ err.textContent="Falta el precio pactado."; return; }
        bt.disabled=true; bt.textContent="Guardando…"; err.textContent="";
        try{
          await escribir("laureles_planes?on_conflict=lote","POST",[{lote:n, cliente:ed.cliente||null, canal:ed.canal||null, etapa:ed.etapa||null,
            precio_lista: ed.etapa ? precio(r.p,+ed.etapa) : null, precio_pactado: ed.pactado||null, tipo: q.length ? (ed.tipo==="por_definir"?"personalizado":ed.tipo) : "por_definir",
            firma: ed.firma ? ed.firma+"-01" : null, cuotas:q, notas:ed.notas||null}], {"Prefer":"resolution=merge-duplicates,return=representation"});
          avisar("Forma de pago del lote "+n+" guardada.", 3500);
          v.remove(); await cargar();
        }catch(e){ err.textContent=e.message; bt.disabled=false; bt.textContent="Guardar forma de pago"; }
      };
      g("#pOk").onclick=async()=>{
        const err=g("#pErr"), bt=g("#pOk"), val=num(g("#pVal").value), f=g("#pFec").value;
        if(!f){ err.textContent="Falta la fecha."; return; }
        if(!val){ err.textContent="Falta el valor."; return; }
        if(f>new Date().toISOString().slice(0,10)){ err.textContent="La fecha es futura: registra el pago cuando entre."; return; }
        bt.disabled=true; bt.textContent="Registrando…"; err.textContent="";
        try{
          await escribir("laureles_recaudos","POST",[{lote:n, fecha:f, valor:val, medio:g("#pMed").value, concepto:g("#pCon").value.trim()||null, referencia:g("#pRef").value.trim()||null}]);
          avisar("Pago de "+cop(val)+" registrado en el lote "+n+".", 3500);
          await recargarYVolver(n);
        }catch(e){ err.textContent=e.message; bt.disabled=false; bt.textContent="Registrar pago"; }
      };
      B.querySelectorAll("[data-anu]").forEach(b=>b.onclick=()=>{
        const td=b.parentElement; td.innerHTML='<input placeholder="Motivo" style="font:inherit;font-size:12px;padding:5px 8px;border:1px solid var(--line);border-radius:6px;width:130px"> <button class="gzBtn" style="margin:4px 0 0;padding:5px 10px;font-size:12px">Anular</button>';
        const inp=td.querySelector("input"), ok=td.querySelector("button"); inp.focus();
        ok.onclick=async()=>{ const mot=inp.value.trim(); if(mot.length<4){ inp.style.borderColor="#A3543F"; inp.placeholder="Escribe el motivo"; return; }
          ok.disabled=true;
          try{ await escribir("laureles_recaudos?id=eq."+b.dataset.anu,"PATCH",{anulado:true, anulado_motivo:mot}); avisar("Pago anulado.", 3000); await recargarYVolver(n); }
          catch(e){ ok.disabled=false; avisar(e.message, 5000); } };
      });
    }
    async function recargarYVolver(k){ v.remove(); await cargar(); editor(k); }
    pintarEd();
  }
  /* confirmación sin ventanas del navegador */
  function confirmar(t){ return window.__gzConfirmar ? window.__gzConfirmar(t) : window.confirm(t); }

  /* ------------------------------ informe y CSV ------------------------------ */
  function csv(){
    if(!M){ avisar("Carga el tablero primero.", 3000); return; }
    const sep=";", q=s=>'"'+String(s==null?"":s).replace(/"/g,'""')+'"';
    const filas=[["Lote","Estado","Canal","Cliente","Asesor","Fecha negocio","Forma de pago","Etapa","Precio pactado","Recaudado","Saldo","Mora","Próximo pago mes","Próximo pago valor"]];
    M.filas.forEach(r=>filas.push([r.n, estadoTxt(r.e), canalTxt(r.canal), r.cliente, r.agente, r.desde?r.desde.slice(0,10):"",
      !r.plan?SIN:(r.q.length?(r.plan.tipo==="etapa"?"Plan E"+r.etapa:"Personalizado"):"Por definir"), r.etapa||"", r.pactado||SIN, r.recTot, r.saldo==null?SIN:r.saldo, r.mora,
      r.prox?r.prox.mes:"", r.prox?Math.round(r.prox.valor):""]));
    const txt="﻿"+filas.map(f=>f.map(q).join(sep)).join("\r\n");
    const a=document.createElement("a"); a.href=URL.createObjectURL(new Blob([txt],{type:"text/csv;charset=utf-8"}));
    a.download="Laureles_cartera_"+new Date().toISOString().slice(0,10)+".csv"; document.body.appendChild(a); a.click(); setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  function informe(){
    if(!M){ avisar("Carga el tablero primero.", 3000); return; }
    const T=M.T, a=+T.anio, S2=serieMeses("todos"), A=alertasDe();
    const logo = window.__LOGO_PDF_B64 ? '<img class="logo" src="data:image/jpeg;base64,'+window.__LOGO_PDF_B64+'" alt="Laureles Campestre">' : '<b style="color:#F4F2EA">LAURELES CAMPESTRE</b>';
    const anios={}; S2.forEach(o=>{ const y=o.m.slice(0,4); (anios[y]=anios[y]||{prog:0,real:0}); anios[y].prog+=o.prog; anios[y].real+=o.real; });
    const k=(t,v,d)=>'<div class="k"><small>'+t+'</small><b>'+v+'</b>'+(d?'<span>'+d+'</span>':'')+'</div>';
    const html='<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Laureles Campestre · Informe gerencial '+new Date().toLocaleDateString("es-CO")+'</title><style>'+
      '@page{size:letter;margin:12mm}*{-webkit-print-color-adjust:exact;print-color-adjust:exact;box-sizing:border-box}body{font-family:Arial,Helvetica,sans-serif;color:#23291F;margin:0;font-size:11px}'+
      '.cab{background:#32402F;color:#F4F2EA;padding:12px 16px;display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #9B7A48}.logo{height:42px}.cab .d{text-align:right;font-size:10.5px;color:#C9B48E}.cab .d b{color:#F4F2EA;font-size:12px}'+
      'h1{font-size:20px;margin:14px 0 2px;color:#32402F}.sub{color:#9B7A48;font-weight:bold;margin-bottom:10px}h2{font-size:13px;color:#32402F;margin:16px 0 6px;border-bottom:1.5px solid #32402F;padding-bottom:3px}'+
      '.ks{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}.k{border:1px solid #D8D3C4;border-radius:6px;padding:7px 9px}.k small{display:block;font-size:8.5px;letter-spacing:.1em;text-transform:uppercase;color:#9B7A48;font-weight:bold}.k b{display:block;font-size:17px;margin-top:2px}.k span{display:block;color:#6B6F63;font-size:9px;margin-top:2px}'+
      'table{width:100%;border-collapse:collapse;margin:4px 0}th{background:#32402F;color:#fff;padding:5px 6px;font-size:9.5px;text-align:left}td{padding:4px 6px;border-bottom:1px solid #E2DED2;font-size:10px}td.n,th.n{text-align:right}tr.t td{font-weight:bold;border-top:1.5px solid #32402F}'+
      '.nd{color:#A3432F;font-weight:bold}.mora{color:#A3432F;font-weight:bold}.av{background:#FBF3E2;border:1px solid #EBD3A0;padding:6px 9px;border-radius:4px;margin:6px 0}ul{margin:4px 0;padding-left:16px}li{margin:2px 0}'+
      '.sal{font-size:8.5px;color:#6B6F63;font-style:italic;margin-top:14px}tr{page-break-inside:avoid}'+
      '</style></head><body>'+
      '<div class="cab">'+logo+'<div class="d"><b>Century 21 DAB · Gerencia técnica</b><br>Corte: '+D.cuando.toLocaleString("es-CO",{dateStyle:"long",timeStyle:"short"})+'</div></div>'+
      '<h1>Informe gerencial · Laureles Campestre</h1><div class="gzSub">Inventario, cartera y recaudo de la parcelación</div>'+
      '<h2>Inventario</h2><div class="ks">'+k("Disponibles",T.disp,"de 86 lotes")+k("Separados",T.sep,"Fajardo "+T.canal.fajardo.sep+" · C21 "+T.canal.c21.sep)+k("Vendidos",T.ven,"Fajardo "+T.canal.fajardo.ven+" · C21 "+T.canal.c21.ven)+k("Comprometido",Math.round((T.sep+T.ven)/86*100)+" %",(T.sep+T.ven)+" lotes")+'</div>'+
      '<h2>Cupo de la etapa 1 (30 % del área vendible)</h2><div class="ks">'+k("Cupo E1",m2f(T.e1.cupo),"de "+m2f(T.e1.total))+k("Usado",Math.round(T.e1.usado/T.e1.cupo*100)+" %",m2f(T.e1.usado)+" · "+(T.e1.nVen+T.e1.nSep)+" lotes")+k("Queda",m2f(T.e1.libre),"≈ "+(T.e1.libre/T.e1.prom).toLocaleString("es-CO",{maximumFractionDigits:1})+" lotes promedio")+k("Sin etapa",T.e1.nSin,m2f(T.e1.sinEt))+'</div>'+'<h2>Lotes por etapa</h2><table><thead><tr><th>Lista</th><th class="n">Negociados</th><th class="n">Vendidos</th><th class="n">Separados</th><th class="n">Inventario disponible</th></tr></thead><tbody>'+
        (()=>{ const por={}; let sin=0; M.filas.forEach(r=>{ if(!r.etapa){ sin++; return; } const o=por[r.etapa]=por[r.etapa]||{n:0,v:0,s:0}; o.n++; if(r.e==="vendido") o.v++; else o.s++; });
          return T.inv.map(x=>{ const o=por[x.et.n]||{n:0,v:0,s:0}; return '<tr><td>'+x.et.l+' · '+esc(x.et.d)+'</td><td class="n">'+o.n+'</td><td class="n">'+o.v+'</td><td class="n">'+o.s+'</td><td class="n">'+cop(x.v)+'</td></tr>'; }).join("")+
            (sin?'<tr><td class="nd">Sin etapa registrada</td><td class="n">'+sin+'</td><td></td><td></td><td></td></tr>':''); })()+
      '</tbody></table>'+'<h2>Recaudo</h2>'+(T.conPlan<T.neg?'<div class="av">Forma de pago registrada en '+T.conPlan+' de '+T.neg+' negocios: las proyecciones sólo suman esos. Los demás figuran como '+SIN+'.</div>':'')+
      '<div class="ks">'+k("Recaudado a hoy",mm(T.recaudado))+k("Por recaudar a dic-"+String(a).slice(2),mm(T.pend1))+k("Por recaudar en "+(a+1),mm(T.pend2))+k("En mora",mm(T.mora))+'</div>'+
      '<table style="margin-top:8px"><thead><tr><th>Año</th><th class="n">Programado</th><th class="n">Recibido</th><th class="n">Por recaudar</th></tr></thead><tbody>'+
        Object.keys(anios).sort().map(y=>'<tr><td>'+y+'</td><td class="n">'+cop(anios[y].prog)+'</td><td class="n">'+cop(anios[y].real)+'</td><td class="n">'+cop(+y===a?T.pend1:+y===a+1?T.pend2:+y===a+2?T.pend3:0)+'</td></tr>').join("")+'</tbody></table>'+
      '<h2>Cartera por lote</h2><table><thead><tr><th>Lote</th><th>Estado</th><th>Canal</th><th>Cliente</th><th>Forma de pago</th><th class="n">Pactado</th><th class="n">Recaudado</th><th class="n">Saldo</th><th>Próximo pago</th></tr></thead><tbody>'+
        M.filas.map(r=>'<tr><td><b>'+r.n+'</b></td><td>'+estadoTxt(r.e)+'</td><td>'+esc(canalTxt(r.canal))+'</td><td>'+esc(r.cliente)+'</td><td>'+(!r.plan?'<span class="nd">'+SIN+'</span>':(r.q.length?(r.plan.tipo==="etapa"?"Plan E"+r.etapa:"Personalizado"):"Por definir"))+'</td>'+
          '<td class="n">'+(r.pactado?cop(r.pactado):'<span class="nd">'+SIN+'</span>')+'</td><td class="n">'+cop(r.recTot)+'</td><td class="n">'+(r.saldo!=null?cop(r.saldo):'—')+'</td>'+
          '<td>'+(r.mora>0?'<span class="mora">Mora '+cop(r.mora)+'</span>':(r.prox?mesTxt(r.prox.mes)+' · '+cop(r.prox.valor):(r.q.length?'Pagado':'—')))+'</td></tr>').join("")+
        '<tr class="t"><td colspan="5">'+M.filas.length+' negocios</td><td class="n">'+cop(T.pactado)+'</td><td class="n">'+cop(T.recaudado)+'</td><td></td><td></td></tr></tbody></table>'+
      (A.length?'<h2>Alertas</h2><ul>'+A.map(x=>'<li>'+esc(x.t)+'</li>').join("")+'</ul>':'')+
      '<div class="sal">Salvedad: informe de gestión generado con los datos registrados en la base de datos del proyecto a la fecha de corte. Los valores en especie (vehículos, CDT, inmuebles) se toman por el valor pactado y deben confirmarse con su avalúo o soporte. '+
      'Donde dice '+SIN+' el dato no está registrado: hay que tomarlo de la promesa de compraventa o del registro del canal. No vincula ni compromete a los desarrolladores; las condiciones definitivas son las pactadas en cada promesa de compraventa.</div>'+
      '<script>window.onload=()=>setTimeout(()=>window.print(),300)<\/script></body></html>';
    const w=window.open("","_blank");
    if(!w){ avisar("El navegador bloqueó la ventana: permite ventanas emergentes para este sitio.",6000); return; }
    w.document.open(); w.document.write(html); w.document.close();
  }

  return {abrir, cerrar, cargar, _M:()=>M, _planEtapa:planEtapa};
})();
