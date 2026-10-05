/* =============================================================================
   COMPARADOR DE PROPUESTAS DE PAGO — sólo administradores.
   El asesor escribe lo que ofrece el cliente (dinero, vehículo, CDT, cuotas…)
   y la hoja lo compara contra el plan estipulado de la etapa escogida:
   separación a la firma, cuota inicial completa a diciembre de 2026, 23 cuotas
   del 3 % del saldo (ene-2027 a nov-2028) y cuota final en dic-2028.
   Sale la misma tabla de una página que se hacía a mano, lista para imprimir o
   guardar en PDF. Nada se inventa: todo sale de precio() y planPago(), las
   mismas funciones de la ficha del lote.
   Usa del mapa (globales de index.html): LOTES, ETAPAS, S, precio, planPago,
   SEPARACION, cop, ROL, avisar.
   ============================================================================= */
const COMPARADOR = window.COMPARADOR = (()=>{
  const LIM_INI = "2026-12", CUO_INI = "2027-01", CUO_FIN = "2028-11", FINAL = "2028-12";
  const MESES = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
  const TIPOS = {dinero:"Dinero", vehiculo:"Vehículo", cdt:"CDT", inmueble:"Inmueble", otro:"Otro"};
  const ESPECIE = t => t==="vehiculo" || t==="inmueble" || t==="otro";
  const esc = s => String(s==null?"":s).replace(/[<>&"]/g, c=>({"<":"&lt;",">":"&gt;","&":"&amp;",'"':"&quot;"}[c]));
  const hoy = () => { const d=new Date(); return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0"); };
  const mesTxt = m => { if(!/^\d{4}-\d{2}$/.test(m||"")) return "—"; const [a,b]=m.split("-"); return MESES[+b-1]+"-"+a; };
  const sumaMes = (m,k) => { let [a,b]=m.split("-").map(Number); b+=k; a+=Math.floor((b-1)/12); b=((b-1)%12+12)%12+1; return a+"-"+String(b).padStart(2,"0"); };
  const num = s => { const n=Number(String(s||"").replace(/[^\d]/g,"")); return isFinite(n)?n:0; };
  const fmtN = n => n ? Math.round(n).toLocaleString("es-CO") : "";
  const dif = (a,b) => Math.round(b-a);
  const difTxt = d => d===0 ? "–" : (d>0?"+":"−")+cop(Math.abs(d));
  const pctTxt = x => (x*100).toFixed(1).replace(".",",")+" %";
  const guardar = (n,st)=>{ try{ localStorage.setItem("laureles.comparador."+n, JSON.stringify(st)); }catch(e){} };
  const leer = n => { try{ return JSON.parse(localStorage.getItem("laureles.comparador."+n)||"null"); }catch(e){ return null; } };

  let st = null;   /* {lote, etapa, firma, cliente, precioCliente, filas:[{c,t,v,m}], cuotas:[{n,v,desde,t}]} */

  /* ------------------------- el plan estipulado ------------------------- */
  function estipulado(L, e, firma){
    const v = precio(L, e), pp = planPago(v, e), pagos = [];
    const sep = Math.min(SEPARACION, pp.inicial);
    pagos.push({m:firma, v:sep});
    const mIni = firma > LIM_INI ? firma : LIM_INI;
    if(pp.inicial - sep > 0.5) pagos.push({m:mIni, v:pp.inicial - sep});
    if(!pp.contado){
      for(let i=0;i<pp.n;i++) pagos.push({m:sumaMes(CUO_INI,i), v:pp.cuota});
      pagos.push({m:FINAL, v:pp.ultima});
    }
    return {v, pp, pagos};
  }
  /* --------------------------- la propuesta ----------------------------- */
  function propuesta(){
    const pagos = [];
    st.filas.forEach(f=>{ const v=num(f.v); if(v>0) pagos.push({m:f.m||st.firma, v, t:f.t, c:f.c}); });
    st.cuotas.forEach(q=>{ const n=Math.max(0,Math.min(120,num(q.n))), v=num(q.v);
      if(n>0 && v>0) for(let i=0;i<n;i++) pagos.push({m:sumaMes(q.desde||CUO_INI,i), v, t:q.t||"dinero", c:"Cuota "+(i+1)+" de "+n}); });
    return pagos;
  }
  function cubetas(pagos, firma){
    const r={firma:0, dic26:0, especie26:0, cuotas:0, final:0, total:0, tarde:0, ultimo:null};
    pagos.forEach(p=>{
      r.total+=p.v;
      if(p.m===firma) r.firma+=p.v;
      if(p.m<=LIM_INI || p.m<=firma){ r.dic26+=p.v; if(ESPECIE(p.t)) r.especie26+=p.v; }
      else if(p.m>=CUO_INI && p.m<=CUO_FIN) r.cuotas+=p.v;
      else if(p.m>=FINAL) r.final+=p.v;
      else r.cuotas+=p.v;
      if(p.m>FINAL) r.tarde+=p.v;
      if(!r.ultimo || p.m>r.ultimo) r.ultimo=p.m;
    });
    return r;
  }
  function calcular(){
    const f=LOTES.features.find(x=>x.properties.lote===st.lote); if(!f) return null;
    const L=f.properties, E=estipulado(L, st.etapa, st.firma), P=propuesta();
    const a=cubetas(E.pagos, st.firma), b=cubetas(P, st.firma);
    const precioP = num(st.precioCliente) || E.v;
    const obs=[];
    if(Math.round(b.total)!==Math.round(E.v))
      obs.push((b.total<E.v?"La propuesta suma ":"La propuesta suma ")+cop(b.total)+": "+(b.total<E.v?cop(E.v-b.total)+" menos":cop(b.total-E.v)+" más")+" que el precio de la etapa ("+cop(E.v)+").");
    if(b.dic26 < a.dic26-0.5)
      obs.push("A diciembre de 2026 la etapa pide "+cop(a.dic26)+" ("+pctTxt(a.dic26/E.v)+"); la propuesta lleva "+cop(b.dic26)+": faltan "+cop(a.dic26-b.dic26)+".");
    else obs.push("Cumple lo que la etapa pide a diciembre de 2026 ("+cop(a.dic26)+").");
    if(b.especie26>0) obs.push("De lo pagado en 2026, "+cop(b.especie26)+" es en especie (vehículo, inmueble u otro): su valor hay que confirmarlo con un avalúo.");
    if(b.firma < Math.min(SEPARACION,E.v)-0.5) obs.push("A la firma entran "+cop(b.firma)+"; la separación es de "+cop(SEPARACION)+".");
    if(b.tarde>0) obs.push(cop(b.tarde)+" quedan después de diciembre de 2028, más allá del plan del proyecto.");
    if(P.some(p=>p.t==="cdt")) obs.push("Hay pagos con CDT: verificar entidad, titular, monto, vencimiento y cómo queda respaldado el pago.");
    const cumple = b.dic26>=a.dic26-0.5 && b.total>=E.v-0.5 && b.tarde===0;
    return {L, E, P, a, b, precioP, obs, cumple};
  }

  /* ------------------------------- la hoja ------------------------------ */
  function filaPagoHTML(f,i){
    return '<div class="cmpFila" data-i="'+i+'">'+
      '<input type="text" class="cmpC" placeholder="Concepto (ej. a la firma, carro…)" value="'+esc(f.c)+'">'+
      '<select class="cmpT">'+Object.entries(TIPOS).map(([k,t])=>'<option value="'+k+'"'+(k===f.t?' selected':'')+'>'+t+'</option>').join("")+'</select>'+
      '<input type="text" class="cmpV" inputmode="numeric" placeholder="Valor $" value="'+fmtN(num(f.v))+'">'+
      '<input type="month" class="cmpM" value="'+esc(f.m||st.firma)+'">'+
      '<button class="cmpX" title="Quitar">×</button></div>';
  }
  function cuotaHTML(q,i){
    return '<div class="cmpFila cmpCuota" data-q="'+i+'">'+
      '<input type="text" class="cmpQN" inputmode="numeric" placeholder="N.º" value="'+esc(q.n)+'" style="max-width:64px">'+
      '<span class="cmpPor">cuotas de</span>'+
      '<input type="text" class="cmpQV" inputmode="numeric" placeholder="Valor $" value="'+fmtN(num(q.v))+'">'+
      '<span class="cmpPor">desde</span>'+
      '<input type="month" class="cmpQD" value="'+esc(q.desde||CUO_INI)+'">'+
      '<button class="cmpX" title="Quitar">×</button></div>';
  }
  function tablaHTML(R){
    const et=ETAPAS[st.etapa-1];
    const fila=(t,s,a,b,extra)=>'<tr'+(extra||'')+'><td>'+t+(s?'<small>'+s+'</small>':'')+'</td><td>'+a+'</td><td>'+b+'</td>';
    const d=(a,b)=>{ const x=dif(a,b); return '<td class="'+(x<0?'neg':x>0?'pos':'')+'">'+difTxt(x)+'</td></tr>'; };
    return '<table class="cmpTab"><thead><tr><th>Concepto</th><th>'+et.l+' (estipulado)</th><th>Propuesta</th><th>Diferencia</th></tr></thead><tbody>'+
      fila("Precio total","Precio "+et.l+" del lote",cop(R.E.v),cop(R.b.total))+d(R.E.v,R.b.total)+
      fila("A la firma",mesTxt(st.firma),cop(R.a.firma),cop(R.b.firma))+d(R.a.firma,R.b.firma)+
      fila("Pagado a diciembre de 2026","Cuota inicial de la etapa",cop(R.a.dic26),cop(R.b.dic26),' class="fuerte"')+d(R.a.dic26,R.b.dic26)+
      (R.b.especie26>0 ? fila("· de eso, en especie","Vehículo, inmueble u otro","–",cop(R.b.especie26))+'<td></td></tr>' : '')+
      fila("Enero 2027 a noviembre 2028",R.E.pp.contado?"":(R.E.pp.n+" cuotas de "+cop(R.E.pp.cuota)),R.a.cuotas?cop(R.a.cuotas):"–",R.b.cuotas?cop(R.b.cuotas):"–")+d(R.a.cuotas,R.b.cuotas)+
      fila("Diciembre 2028 en adelante","Cuota final / saldo",R.a.final?cop(R.a.final):"–",R.b.final?cop(R.b.final):"–")+d(R.a.final,R.b.final)+
      fila("% del precio pagado a dic-2026","",pctTxt(R.a.dic26/R.E.v),pctTxt(R.b.dic26/R.E.v))+'<td></td></tr>'+
      '</tbody></table>';
  }
  function pintarResultado(){
    const R=calcular(), box=document.getElementById("cmpRes"); if(!R||!box) return;
    box.innerHTML = tablaHTML(R)+
      '<div class="cmpVer '+(R.cumple?'ok':'no')+'">'+(R.cumple?'Cumple las condiciones de la etapa.':'No cumple las condiciones de la etapa.')+'</div>'+
      '<ul class="cmpObs">'+R.obs.map(o=>'<li>'+esc(o)+'</li>').join("")+'</ul>';
    guardar(st.lote, st);
  }
  function leerForm(){
    const c=document.getElementById("hojaCuerpo");
    st.etapa = +c.querySelector("#cmpEt").value || 1;
    st.firma = c.querySelector("#cmpFirma").value || hoy();
    st.cliente = c.querySelector("#cmpCli").value;
    st.filas = [...c.querySelectorAll(".cmpFila:not(.cmpCuota)")].map(r=>({
      c:r.querySelector(".cmpC").value, t:r.querySelector(".cmpT").value,
      v:num(r.querySelector(".cmpV").value), m:r.querySelector(".cmpM").value }));
    st.cuotas = [...c.querySelectorAll(".cmpCuota")].map(r=>({
      n:num(r.querySelector(".cmpQN").value), v:num(r.querySelector(".cmpQV").value),
      desde:r.querySelector(".cmpQD").value, t:"dinero" }));
  }
  function pintarHoja(){
    const c=document.getElementById("hojaCuerpo");
    const f=LOTES.features.find(x=>x.properties.lote===st.lote);
    c.innerHTML =
      '<div class="cmpCab">'+
        '<div><label for="cmpEt">Etapa para comparar</label><select id="cmpEt">'+
          ETAPAS.map(E=>'<option value="'+E.n+'"'+(E.n===st.etapa?' selected':'')+'>'+E.l+' · '+cop(precio(f.properties,E.n))+'</option>').join("")+'</select></div>'+
        '<div><label for="cmpFirma">Mes de firma</label><input type="month" id="cmpFirma" value="'+esc(st.firma)+'"></div>'+
        '<div><label for="cmpCli">Cliente</label><input type="text" id="cmpCli" value="'+esc(st.cliente)+'" placeholder="Nombre del cliente"></div>'+
      '</div>'+
      '<label>Lo que ofrece el cliente</label>'+
      '<div id="cmpFilas">'+st.filas.map(filaPagoHTML).join("")+st.cuotas.map(cuotaHTML).join("")+'</div>'+
      '<div class="cmpAdd"><button class="sec" id="cmpMasPago">+ Pago</button><button class="sec" id="cmpMasCuotas">+ Cuotas mensuales</button></div>'+
      '<div class="pista">Valores en pesos. El vehículo, inmueble u otro bien entra por el valor que se pacte. Sin intereses, como el plan del proyecto.</div>'+
      '<div id="cmpRes"></div>';
    const re=()=>{ leerForm(); pintarResultado(); };
    c.querySelectorAll("input,select").forEach(el=>{ el.oninput=re; el.onchange=re; });
    c.querySelectorAll(".cmpV,.cmpQV").forEach(el=>el.addEventListener("blur",()=>{ el.value=fmtN(num(el.value)); }));
    c.querySelectorAll(".cmpX").forEach(b=>b.onclick=()=>{ b.parentElement.remove(); re(); });
    c.querySelector("#cmpMasPago").onclick=()=>{ leerForm(); st.filas.push({c:"",t:"dinero",v:0,m:st.firma}); pintarHoja(); };
    c.querySelector("#cmpMasCuotas").onclick=()=>{ leerForm(); st.cuotas.push({n:23,v:0,desde:CUO_INI,t:"dinero"}); pintarHoja(); };
    pintarResultado();
  }
  function abrir(n){
    if(!ROL.esVentas()){ avisar("El comparador es sólo para administradores."); return; }
    st = leer(n) || {lote:n, etapa:S.etapa||1, firma:hoy(), cliente:"", precioCliente:"",
                     filas:[{c:"A la firma",t:"dinero",v:SEPARACION,m:hoy()}], cuotas:[]};
    st.lote=n;
    document.getElementById("hojaTit").textContent = "Lote "+n+" · Comparar propuesta de pago";
    document.getElementById("hojaPie").innerHTML =
      '<button class="sec" id="cmpLimpiar">Empezar de cero</button>'+
      '<button class="sec" id="cmpCerrar">Cerrar</button>'+
      '<button class="pri" id="cmpPdf">Imprimir / PDF</button>';
    const velo=document.getElementById("velo");
    velo.querySelector(".hoja").classList.add("ancha");
    velo.classList.add("on");
    const cerrar=()=>{ velo.classList.remove("on"); velo.querySelector(".hoja").classList.remove("ancha"); };
    document.getElementById("cmpCerrar").onclick=cerrar;
    document.getElementById("cmpLimpiar").onclick=()=>{ try{ localStorage.removeItem("laureles.comparador."+n); }catch(e){} abrir(n); };
    document.getElementById("cmpPdf").onclick=imprimir;
    pintarHoja();
  }

  /* -------------------------- la hoja para imprimir ------------------------ */
  function imprimir(){
    leerForm(); const R=calcular(); if(!R) return;
    const et=ETAPAS[st.etapa-1];
    const logo = window.__LOGO_PDF_B64 ? '<img class="logo" src="data:image/jpeg;base64,'+window.__LOGO_PDF_B64+'" alt="Laureles Campestre">' : '<b style="color:#F4F2EA">LAURELES CAMPESTRE</b>';
    const detalle = R.P.slice().sort((x,y)=>x.m<y.m?-1:x.m>y.m?1:0);
    /* las cuotas iguales seguidas se agrupan en una sola línea */
    const grupos=[]; detalle.forEach(p=>{ const g=grupos[grupos.length-1];
      if(g && /^Cuota /.test(p.c) && /^Cuota /.test(g.c0) && g.v===p.v && sumaMes(g.hasta,1)===p.m){ g.n++; g.hasta=p.m; }
      else grupos.push({c0:p.c, c:p.c, v:p.v, t:p.t, m:p.m, hasta:p.m, n:1}); });
    const filasDet = grupos.map(g=>'<tr><td>'+(g.n>1?g.n+' cuotas de '+cop(g.v):esc(g.c||"Pago"))+'</td><td>'+(TIPOS[g.t]||"")+'</td><td>'+(g.n>1?mesTxt(g.m)+' a '+mesTxt(g.hasta):mesTxt(g.m))+'</td><td>'+cop(g.v*g.n)+'</td></tr>').join("");
    const html='<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Lote '+st.lote+' · Forma de pago</title><style>'+
      '@page{size:letter;margin:14mm}*{-webkit-print-color-adjust:exact;print-color-adjust:exact}body{font-family:Arial,Helvetica,sans-serif;color:#23291F;margin:0;font-size:12px}'+
      '.cab{background:#32402F;color:#F4F2EA;padding:14px 18px;display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #9B7A48}'+
      '.logo{height:46px}.cab .d{text-align:right;font-size:11px;color:#C9B48E}.cab .d b{color:#F4F2EA;font-size:12px}'+
      'h1{font-size:22px;margin:18px 0 2px;color:#32402F}.sub{color:#9B7A48;font-weight:bold;margin-bottom:14px}'+
      'table{width:100%;border-collapse:collapse;margin:8px 0}th{background:#32402F;color:#fff;padding:8px;font-size:11.5px;text-align:center}'+
      'td{padding:7px 8px;border-bottom:1px solid #D8D3C4;text-align:right;vertical-align:middle}td:first-child{text-align:left}'+
      'td small{display:block;color:#6B6F63;font-size:10px}td:nth-child(2){background:#EEF1EA}tr.fuerte td{font-weight:bold;border-top:1.5px solid #32402F}'+
      'td.neg{color:#A3432F}td.pos{color:#8A6A2E}.ver{margin:10px 0;padding:8px 12px;font-weight:bold;border-radius:4px}'+
      '.ver.ok{background:#E7F2EA;color:#2E7D4F}.ver.no{background:#F7E6E2;color:#A3432F}ul{padding-left:18px;margin:6px 0}li{margin:3px 0}'+
      'h2{font-size:13px;color:#32402F;margin:16px 0 4px}.det td:nth-child(2){background:none;text-align:left}.det td:nth-child(3){text-align:left}'+
      '.sal{font-size:9.5px;color:#6B6F63;font-style:italic;margin-top:14px}.firma{margin-top:10px;font-size:11px}'+
      '</style></head><body>'+
      '<div class="cab">'+logo+'<div class="d"><b>Century 21 DAB · Gerencia técnica</b><br>'+new Date().toLocaleDateString("es-CO")+'</div></div>'+
      '<h1>Lote '+st.lote+' · Forma de pago</h1>'+
      '<div class="sub">'+(st.cliente?'Cliente: '+esc(st.cliente)+' · ':'')+'Precio '+et.l+' ('+esc(et.d)+') frente a la propuesta</div>'+
      tablaHTML(R)+
      '<div class="ver '+(R.cumple?'ok':'no')+'">'+(R.cumple?'Cumple las condiciones de la etapa.':'No cumple las condiciones de la etapa.')+'</div>'+
      '<h2>Para tener en cuenta</h2><ul>'+R.obs.map(o=>'<li>'+esc(o)+'</li>').join("")+'</ul>'+
      '<h2>Detalle de la propuesta</h2><table class="det"><thead><tr><th>Pago</th><th>Tipo</th><th>Cuándo</th><th>Valor</th></tr></thead><tbody>'+filasDet+
      '<tr class="fuerte"><td>Total</td><td></td><td></td><td>'+cop(R.b.total)+'</td></tr></tbody></table>'+
      '<div class="firma">Firma del plan: '+mesTxt(st.firma)+'. Sin intereses, como el plan de pagos del proyecto.</div>'+
      '<div class="sal">Salvedad: valores técnicos y aproximados, calculados con las áreas del plano 039 y la lista de precios vigente. No vinculan ni comprometen a los desarrolladores; las condiciones definitivas son las que se pacten en la promesa de compraventa.</div>'+
      '<script>window.onload=()=>setTimeout(()=>window.print(),300)<\/script></body></html>';
    const w=window.open("","_blank");
    if(!w){ avisar("El navegador bloqueó la ventana: permite ventanas emergentes para este sitio.",6000); return; }
    w.document.open(); w.document.write(html); w.document.close();
  }

  return {abrir, _calcular:()=>calcular(), _estado:()=>st};
})();
