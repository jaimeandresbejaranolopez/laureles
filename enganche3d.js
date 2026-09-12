/* Enganche del relieve 3D con el resto del mapa: el botón 3D, la barra del
   relieve, el modo mano y los reenvíos para que la casa siga al lote escogido.
   Vive aparte del motor a propósito: así se puede cambiar el motor por debajo
   —del WebGL escrito a mano al de Three.js— sin tocar una línea de esto. */
(function(){
"use strict";
const R3D = window.__R3D;
if(!R3D){ console.warn("enganche3d: no hay motor de relieve"); return; }
const EXT = window.__ANL_EXT || {};
const state = EXT.state || {sel:null};

/* ---- enganche del 3D con el resto del mapa ---- */
const b   = document.getElementById("b3d");
const ctl = document.getElementById("ve3d");
if(b && ctl){
  b.onclick = ()=>{
    const nuevo = !R3D.activo();
    if(!R3D.activar(nuevo)){
      try{ avisar("Este dispositivo no puede mostrar el relieve 3D."); }catch(e){}
      return; }
    b.classList.toggle("on3d", nuevo);
    ctl.hidden = !nuevo;
    b.title = nuevo ? "Volver al mapa" : "Ver el terreno en relieve";
    /* los mandos del mapa plano no sirven dentro del 3D */
    ["giro","pistaNav"].forEach(id=>{ const e=document.getElementById(id);
      if(e) e.style.display = nuevo ? "none" : ""; });
    if(nuevo) try{ avisar("Arrastre para girar, rueda para acercar, toque un lote para ver su ficha."); }catch(e){}
  };
  /* el interruptor de mano, en la misma barra del relieve */
  const bMano = document.getElementById("ve3dMano");
  if(bMano) bMano.onclick = ()=>{
    const on = R3D.mano(!R3D.haciaMano());
    bMano.classList.toggle("on", on);
    bMano.title = on ? "Arrastre: mover · Mayús+arrastre: girar"
                     : "Arrastre: girar · Mayús+arrastre: mover";
    try{ avisar(on ? "Arrastre para mover el modelo. Con Mayús, gira."
                   : "Arrastre para girar. Con Mayús, mueve."); }catch(e){}
  };

  const fit = document.getElementById("ve3dFit");
  if(fit) fit.onclick = ()=>R3D.encuadrar();
  const bSol = document.getElementById("ve3dSol");
  if(bSol) bSol.onclick = ()=>{
    if(state.sel==null){ try{ avisar("Escoja primero un lote."); }catch(e){} return; }
    const on = R3D.domoSolar(!R3D.haciaDomo());
    bSol.classList.toggle("on", on);
    ctl.querySelectorAll("[data-ve]").forEach(y=>
      y.classList.toggle("on", on ? y.dataset.ve==="1" : y.dataset.ve==="2"));
    if(on){ R3D.irA(state.sel,true);
      try{ avisar("Recorridos del sol en solsticios y equinoccio, a escala real."); }catch(e){} }
  };
  ctl.querySelectorAll("[data-ve]").forEach(x=>{
    x.onclick = ()=>{
      if(!R3D.exagerar(+x.dataset.ve)){
        try{ avisar("Con la bóveda solar la escala se mantiene real."); }catch(e){}
        return; }
      ctl.querySelectorAll("[data-ve]").forEach(y=>y.classList.toggle("on", y===x));
    };
  });
  /* Los rótulos de lote van en su propia capa, no dentro del lienzo: la rueda
     del ratón encima de un número se perdía y no acercaba. Se reenvía al
     lienzo para que la rueda funcione en toda la pantalla. */
  const capaRot = document.getElementById("capa3d");
  const lienzo  = document.getElementById("c3d");
  if(capaRot && lienzo) capaRot.addEventListener("wheel", e=>{
    e.preventDefault();
    lienzo.dispatchEvent(new WheelEvent("wheel", {deltaY:e.deltaY, deltaX:e.deltaX,
      clientX:e.clientX, clientY:e.clientY, cancelable:true}));
  }, {passive:false});

  /* El volumen de la casa sigue al lote escogido, igual que en el plano vivo.
     pintarFicha() se llama también en cada refrescar(), así que sólo se
     reconstruye cuando de verdad cambia el lote: rehacer la malla en cada
     repintado costaría un segundo por nada. */
  let loteEnPie = null;
  if(typeof window.pintarFicha==="function"){
    const prev = window.pintarFicha;
    window.pintarFicha = function(n){
      const r = prev.apply(this, arguments);
      if(n!==loteEnPie){ loteEnPie=n; if(R3D.activo()) R3D.casa(n,null,null); }
      else if(R3D.activo()) R3D.refrescar();
      return r;
    };
  }
  if(typeof window.cerrarFicha==="function"){
    const prev = window.cerrarFicha;
    window.cerrarFicha = function(){ const r = prev.apply(this, arguments);
      loteEnPie=null; if(R3D.activo()) R3D.quitarCasa(); return r; };
  }
  /* el 3D se redibuja cuando cambia el filtro */
  if(typeof window.refrescar==="function"){
    const prev = window.refrescar;
    window.refrescar = function(){ const r = prev.apply(this, arguments);
                                   if(R3D.activo()) R3D.refrescar(); return r; };
  }
  /* al encender el 3D con un lote ya escogido, la casa entra con él */
  const _act = b.onclick;
  b.onclick = function(ev){
    const r = _act.call(this, ev);
    if(R3D.activo() && state.sel!=null){ loteEnPie=state.sel; R3D.casa(state.sel,null,null); }
    return r;
  };
}
})();
