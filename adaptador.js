/* =============================================================================
   Puente entre el mapa de ventas y el módulo de análisis del lote.
   El análisis viene del plano vivo y habla en sus propios términos (DATA, IMPL,
   PX, estados en mayúsculas). Aquí se le entrega lo que pide, leyendo siempre
   el estado real del mapa, para que no haya dos verdades sobre lo mismo.
   ============================================================================= */
"use strict";
(function(){
  const PAY = window.__DATA_ANL;
  if(!PAY){ console.warn("Falta datos-analisis.js"); return; }

  /* estado de venta base, igual que en el plano vivo */
  PAY.lotes.forEach(L=>{ L.base = (L.est==="CON NEGOCIO") ? "RESERVADO" : "DISPONIBLE"; });

  /* proyección local equirectangular: metros del plano */
  const lats=PAY.lind.map(p=>p[1]), lons=PAY.lind.map(p=>p[0]);
  const lat0=(Math.min(...lats)+Math.max(...lats))/2;
  const lon0=(Math.min(...lons)+Math.max(...lons))/2;
  const KX=111320*Math.cos(lat0*Math.PI/180), KY=110540;
  const PX = p => [ (p[0]-lon0)*KX, -(p[1]-lat0)*KY ];

  /* precios privados: los mismos objetos del mapa, llenos sólo con sesión del equipo */
  const PR_A=(typeof PRECIO_PROT!=="undefined")?PRECIO_PROT:{};
  const PV_A=(typeof PRECIO_UTIL!=="undefined")?PRECIO_UTIL:{};
  /* precio único desde el 26/10/2026: sólo la lista E4 */
  const ETAPAS_A=[{n:4,l:"E4",d:"Precio de lista"}];
  const EST_A={DISPONIBLE:{c:"var(--disp)",k:"d",t:"Disponible"},
               RESERVADO:{c:"var(--resv)",k:"r",t:"Reservado"},
               SEPARADO:{c:"var(--sep)",k:"s",t:"Separado"},
               FIRMADO:{c:"var(--resv)",k:"f",t:"Firmado"},
               VENDIDO:{c:"var(--vend)",k:"v",t:"Vendido"}};
  const POIS_A=[["Autopista del Café","Conexión regional","1,4 km · 3 min"],
                ["Aeropuerto El Edén","Vuelos nacionales","6,2 km · 10 min"],
                ["La Tebaida","Zona Franca del Eje","8,5 km · 10 min"],
                ["Armenia","Centro y servicios","15,0 km · 18 min"],
                ["Parque del Café","Entorno turístico","22,7 km · 30 min"]];

  /* el mapa maneja los estados en minúscula; el análisis, en mayúscula */
  const AMAYUS={disponible:"DISPONIBLE", separado:"SEPARADO",
                vendido:"VENDIDO", reservado:"VENDIDO"};
  const estadoDe = L => {
    try{ const f=LOTES.features.find(x=>x.properties.lote===L.n);
         return (f && AMAYUS[f.properties.estado]) || L.base; }
    catch(e){ return L.base; }
  };

  /* la etapa y el lote seleccionado se leen del mapa, no se copian */
  const puente = {
    get etapa(){ return 4; },
    set etapa(v){ try{ S.etapa=v; }catch(e){} },
    get sel(){ try{ return S.sel; }catch(e){ return null; } },
    set sel(v){},
    over:{}
  };

  const LOC = () => (window.__ANL_LOC ? window.__ANL_LOC() : "es-CO");

  window.__ANL_EXT = {
    DATA: PAY, PX, lat0, lon0, KX, KY,
    EST: EST_A, ETAPAS: ETAPAS_A, PR: PR_A, PV: PV_A, POIS: POIS_A,
    RENDERS: window.__RENDERS || {},
    precio: (L,e)=> (PV_A[e]!=null) ? L.pr*PR_A[e] + L.ut*PV_A[e] : null,
    estadoDe, state: puente,
    toast: (t)=>{ try{ avisar(t); }catch(e){ console.log(t); } },
    fmtA:  v => Math.round(v).toLocaleString(LOC())+" m²",
    fmtCOP: v => "$"+Math.round(v).toLocaleString(LOC()),
    devolverIntro: ()=>{},
    /* El motor WebGL vive en r3d.js, que se carga después de analisis.js.
       Se llega a él por este reenvío para que el orden de carga no importe
       y para que, si el archivo no está, el análisis siga funcionando. */
    R3D: {
      activo:    ()      => !!(window.__R3D && window.__R3D.activo()),
      activar:   v       => window.__R3D ? window.__R3D.activar(v) : false,
      sol:       (f,h)   => { if(window.__R3D) window.__R3D.sol(f,h); },
      casa:      (n,f,h) => { if(window.__R3D) window.__R3D.casa(n,f,h); },
      quitarCasa:()      => { if(window.__R3D) window.__R3D.quitarCasa(); },
      irA:       (n,a)   => { if(window.__R3D) window.__R3D.irA(n,a); },
      encuadrar: ()      => { if(window.__R3D) window.__R3D.encuadrar(); },
      exagerar:  v       => window.__R3D ? window.__R3D.exagerar(v) : false,
      domoSolar: v       => window.__R3D ? window.__R3D.domoSolar(v) : false,
      haciaDomo: ()      => !!(window.__R3D && window.__R3D.haciaDomo()),
      refrescar: ()      => { if(window.__R3D) window.__R3D.refrescar(); },
      hay:       ()      => !!window.__R3D
    }
  };
})();
