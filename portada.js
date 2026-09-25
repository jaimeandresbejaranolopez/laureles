/* =============================================================================
   Laureles Campestre — PORTADA COMERCIAL (versión editorial)
   La bienvenida (#welcome) se vuelve una página completa que se recorre hacia
   abajo. La tarjeta original (.wel) se conserva oculta porque de ella cuelgan
   el botón "Comenzar el recorrido" (con la puerta de registro de acceso.js) y
   los botones de idioma del armazón: la portada los acciona por dentro.

   DE DÓNDE SALE CADA DATO (nada inventado):
     · lotes, áreas y precios .... lotes.js + PRECIO_UTIL/PRECIO_PROT, INICIAL,
                                    SEPARACION, PLAN_* de index.html
     · áreas comunes .............. plano 039 · cuadro de áreas: plano 038
     · perfil vial ................ croquis de Jaime Bejarano (24/09/2026)
     · tiempos y distancias ....... window.POIS
     · escritura y entrega ........ indicación del proyecto
     · mercado (sección "Un lugar privilegiado"), con su fuente en la página:
         15,7 % valorización vivienda nueva Armenia 2025, la mayor del país:
           Metrocuadrado, citado por La República (29/04/2026)
         10,66 % variación anual IPVN Armenia II trim. 2025 (nacional 10,02 %):
           Observatorio Inmobiliario de Armenia
         más de $312.000 millones para modernizar El Edén (terminal y pista),
           CONPES aprobado en julio de 2026: Ciudad Región (31/07/2026) y
           Cámara de Comercio de Armenia y del Quindío (04/08/2026)
         pista de 2.320 m, la más larga del Eje Cafetero: Wikipedia
   Fotos de los sitios de interés: Wikimedia Commons, CC BY-SA 4.0, con autor.
   Las imágenes de gimnasio, zona infantil, pádel, ciclorruta y vía son
   REFERENCIAS DE ESTILO DE VIDA y así se rotulan.
   ============================================================================= */
(function(){
"use strict";
const wel = document.getElementById("welcome");
if(!wel) return;
const M = window.MEDIOS || {};
const IMG = k => M[k] || ("medios/"+k+".jpg");
const lang = () => (window.ANALISIS && ANALISIS.lang) ? ANALISIS.lang() : "es";
const miles = n => Math.round(n).toLocaleString("es-CO");

/* ---------------------------------------------------------------- íconos */
const IC = {
  lotes:'<rect x="3.5" y="3.5" width="17" height="17" rx="1.5"/><path d="M3.5 12h17M12 3.5v17"/>',
  regla:'<path d="M4 16.5 16.5 4l3.5 3.5L7.5 20z"/><path d="m8 12.5 1.8 1.8M10.5 10l1.2 1.2M13 7.5l1.8 1.8"/>',
  expandir:'<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/><rect x="8.5" y="8.5" width="7" height="7" rx="1"/>',
  hectarea:'<path d="M3 18.5c3-4 6-6 9-6s6 2 9 6"/><path d="M3 20.5h18"/><circle cx="17" cy="6.5" r="2.2"/>',
  arbol:'<path d="M12 21v-6"/><path d="M12 15c-4 0-6.5-2.3-6.5-5.3C5.5 6.5 8.4 3.5 12 3.5s6.5 3 6.5 6.2c0 3-2.5 5.3-6.5 5.3z"/><path d="M12 11.5 9.5 9M12 13l3-3"/>',
  casa:'<path d="M3.5 11 12 4l8.5 7"/><path d="M6 9.5V20h12V9.5"/><path d="M10 20v-5h4v5"/>',
  escritura:'<path d="M6.5 3.5h8l4 4V20a.5.5 0 0 1-.5.5H7a.5.5 0 0 1-.5-.5z"/><path d="M14.5 3.5V8h4"/><path d="M9.5 12h6M9.5 15h4"/><circle cx="15.5" cy="18" r="1.6"/>',
  calendario:'<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/><path d="m9 15 2 2 4-4"/>',
  porteria:'<path d="M3 20.5h18M5 20.5V9.5L12 5l7 4.5v11"/><path d="M9.5 20.5v-6h5v6"/><path d="M12 5v-2"/>',
  via:'<path d="M8 3.5 5 20.5M16 3.5l3 17"/><path d="M12 4v3M12 10.5v3M12 17v3"/>',
  bici:'<circle cx="6" cy="16" r="3.5"/><circle cx="18" cy="16" r="3.5"/><path d="M6 16 9.5 9h6L18 16M12 16 9.5 9M14.5 6h2.5l-1.5 3"/>',
  bolardo:'<rect x="9" y="7" width="6" height="13.5" rx="1"/><path d="M9 10h6M7 20.5h10"/><path d="M12 3v1.5M8 4.5l1 1M16 4.5l-1 1"/>',
  social:'<path d="M3 10.5 12 5l9 5.5"/><path d="M5 10v9.5M19 10v9.5M3.5 19.5h17"/><circle cx="9.5" cy="14.5" r="1.3"/><circle cx="14.5" cy="14.5" r="1.3"/>',
  cancha:'<rect x="3.5" y="5.5" width="17" height="13" rx="1"/><path d="M12 5.5v13"/><circle cx="12" cy="12" r="2.5"/>',
  sendero:'<path d="M7 20.5c0-4 10-4 10-8.5S9 7.5 9 3.5"/><circle cx="6" cy="7" r="1"/><circle cx="18" cy="17" r="1"/>',
  parqueo:'<rect x="3.5" y="3.5" width="17" height="17" rx="3"/><path d="M9.5 17V7.5h3.2a2.7 2.7 0 0 1 0 5.4H9.5"/>',
  avion:'<path d="M10.5 13.5 3.5 11l1-1.5 7.5.5 4-4.5c.8-.9 2.6-1.3 3.2-.7s.2 2.4-.7 3.2l-4.5 4 .5 7.5-1.5 1-2.5-7z"/><path d="M4.5 20.5h6"/>',
  autopista:'<path d="M3 20.5 8.5 3.5M21 20.5 15.5 3.5"/><path d="M12 5v2.5M12 11v2.5M12 17v3"/><path d="M5 15h3M16 15h3"/>',
  ciudad:'<path d="M3 20.5h18"/><path d="M5 20.5V10h5v10.5M10 20.5V5.5h5v15M15 20.5v-8h4v8"/><path d="M7 13h1M7 16h1M12 8.5h1M12 11.5h1M12 14.5h1"/>',
  fabrica:'<path d="M3 20.5h18M4 20.5V11l5 3v-3l5 3v-3l5 3v6.5"/><path d="M17 11V4h2.5v8.5"/>',
  cafe:'<path d="M4.5 9.5h12v5.5a4.5 4.5 0 0 1-4.5 4.5H9a4.5 4.5 0 0 1-4.5-4.5z"/><path d="M16.5 11h1.7a2.3 2.3 0 0 1 0 4.6h-1.9"/><path d="M8 3.5c-.8 1.2.8 2 0 3.2M12 3.5c-.8 1.2.8 2 0 3.2"/>',
  alza:'<path d="M3.5 20.5h17"/><path d="m4.5 16 5-5 3.5 3.5 6.5-7"/><path d="M15 7.5h4.5V12"/>',
  pista:'<path d="M9 20.5 10.5 3.5h3l1.5 17z"/><path d="M12 6v2M12 11v2M12 16v2"/><path d="M4 20.5h16"/>',
  pin:'<path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.4"/>',
  montana:'<path d="M2.5 19.5 9 8.5l3.5 5.5 2.5-3.5 6.5 9z"/><path d="m7.5 11 1.5 1.5 1.5-1"/>',
  sol:'<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8"/>',
  cubo:'<path d="M12 3 20 7.5v9L12 21l-8-4.5v-9z"/><path d="M12 12 20 7.5M12 12v9M12 12 4 7.5"/>',
  chat:'<path d="M20.5 11.5a8.5 8.5 0 0 1-12.4 7.6L3.5 20.5l1.4-4.4A8.5 8.5 0 1 1 20.5 11.5z"/><path d="M8.5 10.5h7M8.5 13.5h4.5"/>',
  mano:'<path d="M3.5 13.5 7 12l4 3h3.5a1.5 1.5 0 0 1 0 3H10"/><path d="M14.5 18h3.8l2.7-3.3a1.4 1.4 0 0 0-2-1.9L17 14.5"/><path d="M3.5 20.5V11"/><path d="M13 4.5h4.5M15.25 2.5v4.5"/>',
  flecha:'<path d="M5 12h14M13 6l6 6-6 6"/>',
  wa:'<path d="M12 3.2a8.8 8.8 0 0 0-7.6 13.2L3.2 20.8l4.5-1.2A8.8 8.8 0 1 0 12 3.2z"/><path d="M9 8.6c.3-.6.9-.7 1.2-.1l.8 1.7c.1.3 0 .6-.2.8l-.5.5c.5 1.1 1.4 2 2.5 2.5l.5-.5c.2-.2.5-.3.8-.2l1.7.8c.6.3.5.9-.1 1.2-1.3.8-3 .5-4.8-1.1-1.8-1.7-2.5-3.9-1.9-5.6z"/>',
  abajo:'<path d="M12 5v14M6 13l6 6 6-6"/>'
};
const ic = (k, cls="") => `<svg class="ptIc ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[k]||""}</svg>`;

/* ------------------------------------------------ cifras desde los datos */
function datos(){
  let F = [];
  try{ F = LAURELES.lotes.features.map(f=>f.properties); }catch(e){}
  const pu = (typeof PRECIO_UTIL!=="undefined") ? PRECIO_UTIL : null;
  const pp = (typeof PRECIO_PROT!=="undefined") ? PRECIO_PROT : null;
  const ini = (typeof INICIAL!=="undefined") ? INICIAL : {};
  const et = [];
  if(F.length && pu && pp){
    for(let e=1;e<=6;e++){
      const v = F.map(p=>p.area_util_m2*pu[e] + p.area_proteccion_m2*pp[e]);
      et.push({n:e, min:Math.min(...v), max:Math.max(...v), mu:pu[e], mp:pp[e], ini:ini[e]!=null?ini[e]:1});
    }
  }
  const a = F.map(p=>p.area_m2).sort((x,y)=>x-y);
  return { n:F.length||86, amin:a[0]||3100, amax:a[a.length-1]||9907, et,
           sep:(typeof SEPARACION!=="undefined")?SEPARACION:null,
           planN:(typeof PLAN_N!=="undefined")?PLAN_N:null,
           planP:(typeof PLAN_PCT!=="undefined")?PLAN_PCT:null };
}

/* ------------------------------------------ fotos de los sitios de interés */
const WM = "https://upload.wikimedia.org/wikipedia/commons/thumb/";
const SITIO = {
  "Autopista del Café": {ic:"autopista", img:WM+"a/ab/Autopista_del_Caf%C3%A9_en_Armenia%2C_Quind%C3%ADo.jpg/960px-Autopista_del_Caf%C3%A9_en_Armenia%2C_Quind%C3%ADo.jpg", autor:"AreaMetro", pos:"center 60%"},
  "Aeropuerto El Edén": {ic:"avion", img:WM+"f/fb/Aeropuerto_El_Ed%C3%A9n_en_enero_de_2023.jpg/960px-Aeropuerto_El_Ed%C3%A9n_en_enero_de_2023.jpg", autor:"CamiloB4", pos:"center 45%"},
  "La Tebaida": {ic:"fabrica", img:WM+"c/cc/La_Tebaida_%281%29%2C_Quind%C3%ADo%2C_Colombia.JPG/960px-La_Tebaida_%281%29%2C_Quind%C3%ADo%2C_Colombia.JPG", autor:"Hoako", pos:"center 40%"},
  "Armenia": {ic:"ciudad", img:WM+"5/5d/Plaza_de_Bol%C3%ADvar_Armenia.jpg/960px-Plaza_de_Bol%C3%ADvar_Armenia.jpg", autor:"Juan Diego Quintero", pos:"center 35%"},
  "Parque del Café": {ic:"cafe", img:WM+"d/d2/Estaci%C3%B3n_Montenegro_Parque_del_Caf%C3%A9.jpg/960px-Estaci%C3%B3n_Montenegro_Parque_del_Caf%C3%A9.jpg", autor:"CamiloB4", pos:"center 40%"}
};

/* ------------------------------------------------------------------ textos */
const TX = {
 es:{
  nav:"Mapa dinámico", navWa:"WhatsApp",
  hEb:"Parcelación campestre · El Caimo · Armenia, Quindío",
  hT:"Tierra propia en el corredor que más crece del Quindío",
  hB1:"Explora nuestro mapa dinámico", hB2:"Conoce el proyecto", hW1:"Habla con un asesor", hW2:"Escríbenos por WhatsApp",
  hS:[["lotes campestres"],["lote mínimo"],["de predio"],["de la tierra en escritura"]],
  vEb:"Un lugar privilegiado", vT:"En la zona de mayor desarrollo y valorización del Quindío",
  vP:"Laureles está en El Caimo, el corredor campestre del sur de Armenia sobre la vía al aeropuerto El Edén y a La Tebaida. Ahí se concentra el desarrollo residencial campestre de la ciudad, entre el aeropuerto, la Autopista del Café y la Zona Franca del Eje Cafetero.",
  vP2:"Portales inmobiliarios como Fincaraíz lo señalan como el corredor residencial campestre más importante del Quindío.",
  vD:[["alza","15,7 %","valorización de la vivienda nueva en Armenia en 2025, la más alta de Colombia","Metrocuadrado, en La República (abr. 2026)"],
      ["alza","10,66 %","variación anual del precio de la vivienda nueva en Armenia (II trim. 2025), por encima del 10,02 % nacional","Observatorio Inmobiliario de Armenia"],
      ["avion","$312.000 M","aprobados en 2026 para modernizar el aeropuerto El Edén: terminal y ampliación de la pista","CONPES · Ciudad Región y Cámara de Comercio de Armenia"],
      ["pista","2.320 m","de pista en El Edén, la más larga del Eje Cafetero, a 10 minutos del proyecto","Wikipedia · tiempo: cálculo del proyecto"]],
  vNota:"Cifras de mercado publicadas por terceros, citadas con su fuente. No son una promesa de rentabilidad ni de valorización del proyecto.",
  mapT:"El corredor", mapN:"Esquema sin escala. Distancias y tiempos en carro desde el proyecto.",
  pEb:"El proyecto", pT:"Espacio de verdad, bosque que se queda y vista abierta a la cordillera",
  pP:"Laureles Campestre es una parcelación de lotes campestres sobre una ladera cafetera, atravesada por una cañada de bosque protegido. Baja densidad —poco más de dos lotes por hectárea— para que cada casa tenga aire, jardín y privacidad.",
  c:[["lotes","lotes campestres"],["regla","el más pequeño"],["expandir","el más grande"],["hectarea","de predio"],["arbol","de bosque protegido"],["casa","lotes por hectárea"]],
  escT:"Escritura individual", escF:"100 % de la tierra", escD:"Cada lote se escritura a nombre del comprador. No es proindiviso.",
  entT:"Entrega del urbanismo", entF:"Diciembre de 2028", entD:"Fecha de entrega final de las obras de urbanismo.",
  fEb:"Fotos reales del predio", fT:"Lo que ya está ahí",
  fP:"El terreno tal como es hoy: el bosque de la cañada, los guayacanes, las praderas y la cordillera al fondo.",
  fotos:[["canada","El corredor de bosque de la cañada"],["cordillera","La cordillera desde el remate alto"],["guayacan","Guayacán en el predio"],["praderas","Praderas con arbolado grande"],["bosque","Bosque y cafetal en el borde del predio"]],
  uEb:"Urbanismo", uT:"Una sola entrada, un anillo vial y la noche de campo",
  uP:"Portería con plazoleta de acceso y un anillo vial que llega a todos los lotes. La iluminación es baja, con bolardos de máximo 1 m, para que el cielo siga siendo de campo.",
  perfilT:"Perfil vial típico", perfilN:"Medidas en metros. Ciclorruta a un costado de la vía.",
  lab:{lote:"Lote",ciclo:"Ciclorruta",anden:"Andén",ante:"Antejardín",via:"Calzada",bol:"Bolardo ≤ 1 m"},
  u4:[["porteria","Portería","con plazoleta de acceso"],["via","Calzada de 6 m","anillo vial a todos los lotes"],["bici","Ciclorruta de 1,5 m","a un costado de la vía"],["bolardo","Bolardos ≤ 1 m","iluminación baja"]],
  com:[["social","3","áreas sociales","1.190, 718 y 2.254 m²"],["cancha","10 × 20 m","cancha",""],["sendero","2.510 m²","sendero de circulación",""],["parqueo","82","parqueaderos de visitantes",""]],
  refVia:"Así se imagina la vía", ref:"Imagen de referencia",
  eEb:"Estilo de vida", eT:"La vida que se imagina aquí",
  eP:"Deporte con vista a la cordillera, niños al aire libre y calles para caminar y montar en bicicleta.",
  refs:[["vida_ciclorruta","Ciclorruta","bici"],["vida_infantil","Juegos para niños","sol"],["vida_gimnasio","Gimnasio abierto al paisaje","montana"],["vida_padel","Pádel","cancha"]],
  refNota:"Imágenes de referencia de estilo de vida. No son diseños aprobados del proyecto ni forman parte de la oferta.",
  sEb:"Cerca de todo", sT:"A minutos de lo que importa",
  sP:"Desde Laureles se llega en minutos a la autopista, al aeropuerto, a la ciudad y a los grandes atractivos del Quindío.",
  sCred:"Foto",
  kEb:"Etapas y precios", kT:"Mientras antes, mejor precio",
  kP:"El precio de cada lote es su área útil por el valor del m² útil de la etapa, más su área de protección por el valor del m² de protección.",
  etD:{1:["De contado","20 % menos que la lista"],2:["60 % en 2026","10 % menos"],3:["50 % en 2026","5 % menos"],4:["20 % en 2026","Precio de lista"],5:["20 % en 2026","Lista + 10 %"],6:["20 % en 2026","Lista + 20 %"]},
  desde:"desde", hasta:"hasta", mu:"m² útil", mp:"m² protección",
  pagoT:"Así se paga", pago:(d)=>[
    ["mano","Separas con "+(d.sep?"$"+miles(d.sep):"—")+"."],
    ["calendario","La inicial de la etapa se completa en 2026."],
    ["alza","El saldo va en "+(d.planN||"—")+" cuotas del "+(d.planP?Math.round(d.planP*100):"—")+" % del saldo, de enero de 2027 a noviembre de 2028."],
    ["escritura","Una cuota final en diciembre de 2028. Sin intereses."]],
  precNota:"Precios en pesos colombianos, sujetos a disponibilidad y a cambio. El precio exacto de cada lote está en su ficha, en el plano.",
  hEb2:"Herramientas", hT2:"Todo el lote, antes de ir",
  her:[["pin","Plano en vivo","Cada lote con su estado, su precio y su forma de pago."],["cubo","Relieve en 3D","El terreno real, con curvas de nivel cada metro."],["sol","Recorrido del sol","Cómo se asolea cada lote a lo largo del día."],["escritura","Análisis en PDF","El terreno del lote y dónde cabe la casa."]],
  finT:"Escoge tu lote", finP:"Mira la disponibilidad en vivo y agenda tu visita al predio.",
  bLotes:"Explora nuestro mapa dinámico", bWa:"Escribir por WhatsApp", bVis:"Agendar visita",
  fuentes:"Fuentes", waTxt:"Hola, quiero información de Laureles Campestre (El Caimo, Armenia)."
 },
 en:{
  nav:"Interactive map", navWa:"WhatsApp",
  hEb:"Country lots · El Caimo · Armenia, Quindío",
  hT:"Your own land in Quindío's fastest-growing corridor",
  hB1:"Explore our interactive map", hB2:"Discover the project", hW1:"Talk to an advisor", hW2:"Message us on WhatsApp",
  hS:[["country lots"],["minimum lot"],["property"],["of the land on the deed"]],
  vEb:"A privileged location", vT:"In Quindío's area of greatest growth and appreciation",
  vP:"Laureles sits in El Caimo, the country-living corridor south of Armenia on the road to El Edén airport and La Tebaida. This is where the city's country-home development is concentrated, between the airport, the Autopista del Café and the Eje Cafetero Free Trade Zone.",
  vP2:"Real-estate portals such as Fincaraíz describe it as Quindío's leading country residential corridor.",
  vD:[["alza","15.7%","appreciation of new housing in Armenia in 2025, the highest in Colombia","Metrocuadrado, in La República (Apr. 2026)"],
      ["alza","10.66%","annual change in new-home prices in Armenia (Q2 2025), above the 10.02% national figure","Observatorio Inmobiliario de Armenia"],
      ["avion","COP 312 bn","approved in 2026 to modernise El Edén airport: terminal and runway extension","CONPES · Ciudad Región and Armenia Chamber of Commerce"],
      ["pista","2,320 m","runway at El Edén, the longest in the Coffee Region, 10 minutes from the project","Wikipedia · travel time: project estimate"]],
  vNota:"Third-party market figures, quoted with their source. They are not a promise of return or appreciation for the project.",
  mapT:"The corridor", mapN:"Diagram not to scale. Driving distances and times from the project.",
  pEb:"The project", pT:"Real space, woodland that stays and open views of the mountains",
  pP:"Laureles Campestre is a subdivision of country lots on a coffee-country hillside crossed by a protected wooded ravine. Low density —just over two lots per hectare— so every home has air, garden and privacy.",
  c:[["lotes","country lots"],["regla","smallest"],["expandir","largest"],["hectarea","property"],["arbol","protected woodland"],["casa","lots per hectare"]],
  escT:"Individual title deed", escF:"100% of the land", escD:"Each lot is deeded in the buyer's name. Not shared undivided ownership.",
  entT:"Site works handover", entF:"December 2028", entD:"Final handover date of the site works.",
  fEb:"Real photos of the property", fT:"What is already there",
  fP:"The land as it is today: the ravine woodland, the guayacán trees, the pastures and the mountains beyond.",
  fotos:[["canada","The wooded corridor of the ravine"],["cordillera","The mountains from the high end"],["guayacan","Guayacán tree on the property"],["praderas","Pasture with mature trees"],["bosque","Woodland and coffee at the edge"]],
  uEb:"Site plan", uT:"One gate, one road loop and country nights",
  uP:"A gatehouse with an entrance plaza and a road loop that reaches every lot. Lighting is low, with bollards no taller than 1 m, so the sky stays country.",
  perfilT:"Typical road section", perfilN:"Dimensions in metres. Bike lane on one side of the road.",
  lab:{lote:"Lot",ciclo:"Bike lane",anden:"Sidewalk",ante:"Planting strip",via:"Roadway",bol:"Bollard ≤ 1 m"},
  u4:[["porteria","Gatehouse","with entrance plaza"],["via","6 m roadway","loop to every lot"],["bici","1.5 m bike lane","on one side of the road"],["bolardo","Bollards ≤ 1 m","low lighting"]],
  com:[["social","3","social areas","1,190, 718 and 2,254 m²"],["cancha","10 × 20 m","sports court",""],["sendero","2,510 m²","walking path",""],["parqueo","82","visitor parking spaces",""]],
  refVia:"How the road is imagined", ref:"Reference image",
  eEb:"Lifestyle", eT:"The life you can picture here",
  eP:"Sport with mountain views, children outdoors and streets to walk and ride.",
  refs:[["vida_ciclorruta","Bike lane","bici"],["vida_infantil","Children's play","sol"],["vida_gimnasio","Gym open to the landscape","montana"],["vida_padel","Padel","cancha"]],
  refNota:"Lifestyle reference images. They are not approved project designs and are not part of the offer.",
  sEb:"Close to everything", sT:"Minutes from what matters",
  sP:"From Laureles you reach the highway, the airport, the city and Quindío's main attractions in minutes.",
  sCred:"Photo",
  kEb:"Stages and prices", kT:"The earlier, the better the price",
  kP:"Each lot's price is its usable area times the stage's usable m² value, plus its protected area times the protected m² value.",
  etD:{1:["Cash","20% below list"],2:["60% in 2026","10% off"],3:["50% in 2026","5% off"],4:["20% in 2026","List price"],5:["20% in 2026","List + 10%"],6:["20% in 2026","List + 20%"]},
  desde:"from", hasta:"to", mu:"usable m²", mp:"protected m²",
  pagoT:"How payment works", pago:(d)=>[
    ["mano","Reserve with COP "+(d.sep?Math.round(d.sep).toLocaleString("en-US"):"—")+"."],
    ["calendario","The stage's down payment is completed in 2026."],
    ["alza","The balance is paid in "+(d.planN||"—")+" instalments of "+(d.planP?Math.round(d.planP*100):"—")+"% of the balance, January 2027 to November 2028."],
    ["escritura","A final instalment in December 2028. No interest."]],
  precNota:"Prices in Colombian pesos, subject to availability and change. Each lot's exact price is on its card in the plan.",
  hEb2:"Tools", hT2:"The whole lot, before you go",
  her:[["pin","Live plan","Every lot with its status, price and payment plan."],["cubo","3D terrain","The real land, with 1 m contour lines."],["sol","Sun path","How each lot gets sun through the day."],["escritura","PDF analysis","The lot's terrain and where the house fits."]],
  finT:"Choose your lot", finP:"See live availability and book your visit to the property.",
  bLotes:"Explore our interactive map", bWa:"Message on WhatsApp", bVis:"Book a visit",
  fuentes:"Sources", waTxt:"Hi, I would like information about Laureles Campestre (El Caimo, Armenia)."
 },
 fr:{
  nav:"Carte interactive", navWa:"WhatsApp",
  hEb:"Terrains de campagne · El Caimo · Armenia, Quindío",
  hT:"Votre terre dans le corridor qui grandit le plus au Quindío",
  hB1:"Explorez notre carte interactive", hB2:"Découvrir le projet", hW1:"Parlez à un conseiller", hW2:"Écrivez-nous sur WhatsApp",
  hS:[["terrains"],["terrain minimum"],["de terrain"],["du terrain à l'acte"]],
  vEb:"Un lieu privilégié", vT:"Dans la zone de plus fort développement et de plus forte valorisation du Quindío",
  vP:"Laureles se trouve à El Caimo, le corridor résidentiel de campagne au sud d'Armenia, sur la route de l'aéroport El Edén et de La Tebaida. C'est là que se concentre le développement résidentiel de campagne de la ville, entre l'aéroport, l'Autopista del Café et la Zone franche de l'Eje Cafetero.",
  vP2:"Des portails immobiliers comme Fincaraíz le désignent comme le principal corridor résidentiel de campagne du Quindío.",
  vD:[["alza","15,7 %","de valorisation du logement neuf à Armenia en 2025, la plus forte de Colombie","Metrocuadrado, dans La República (avr. 2026)"],
      ["alza","10,66 %","de variation annuelle du prix du neuf à Armenia (T2 2025), au-dessus des 10,02 % nationaux","Observatorio Inmobiliario de Armenia"],
      ["avion","312 000 M COP","approuvés en 2026 pour moderniser l'aéroport El Edén : terminal et allongement de la piste","CONPES · Ciudad Región et Chambre de commerce d'Armenia"],
      ["pista","2 320 m","de piste à El Edén, la plus longue de l'Eje Cafetero, à 10 minutes du projet","Wikipédia · temps : estimation du projet"]],
  vNota:"Chiffres de marché publiés par des tiers, cités avec leur source. Ce n'est pas une promesse de rendement ni de valorisation du projet.",
  mapT:"Le corridor", mapN:"Schéma sans échelle. Distances et temps en voiture depuis le projet.",
  pEb:"Le projet", pT:"De l'espace, une forêt préservée et la vue sur la cordillère",
  pP:"Laureles Campestre est un lotissement de terrains de campagne sur un versant caféier traversé par un ravin boisé protégé. Faible densité —à peine plus de deux terrains par hectare— pour que chaque maison ait de l'air, un jardin et de l'intimité.",
  c:[["lotes","terrains de campagne"],["regla","le plus petit"],["expandir","le plus grand"],["hectarea","de terrain"],["arbol","de forêt protégée"],["casa","terrains par hectare"]],
  escT:"Acte individuel", escF:"100 % du terrain", escD:"Chaque terrain est inscrit au nom de l'acheteur. Pas d'indivision.",
  entT:"Livraison de l'aménagement", entF:"Décembre 2028", entD:"Date de livraison finale des travaux d'aménagement.",
  fEb:"Photos réelles du terrain", fT:"Ce qui est déjà là",
  fP:"Le terrain tel qu'il est aujourd'hui : la forêt du ravin, les guayacanes, les prairies et la cordillère au fond.",
  fotos:[["canada","Le corridor boisé du ravin"],["cordillera","La cordillère depuis le point haut"],["guayacan","Guayacán sur le terrain"],["praderas","Prairies avec de grands arbres"],["bosque","Bois et caféiers en bordure"]],
  uEb:"Aménagement", uT:"Une seule entrée, une boucle et des nuits de campagne",
  uP:"Une loge avec placette d'accès et une boucle qui dessert chaque terrain. Éclairage bas, par bornes de 1 m maximum, pour garder un ciel de campagne.",
  perfilT:"Profil type de la voie", perfilN:"Cotes en mètres. Piste cyclable d'un côté de la voie.",
  lab:{lote:"Terrain",ciclo:"Piste cyclable",anden:"Trottoir",ante:"Bande plantée",via:"Chaussée",bol:"Borne ≤ 1 m"},
  u4:[["porteria","Loge","avec placette d'accès"],["via","Chaussée de 6 m","boucle vers chaque terrain"],["bici","Piste cyclable de 1,5 m","d'un côté de la voie"],["bolardo","Bornes ≤ 1 m","éclairage bas"]],
  com:[["social","3","espaces communs","1 190, 718 et 2 254 m²"],["cancha","10 × 20 m","terrain de sport",""],["sendero","2 510 m²","sentier",""],["parqueo","82","places visiteurs",""]],
  refVia:"La voie telle qu'on l'imagine", ref:"Image de référence",
  eEb:"Art de vivre", eT:"La vie que l'on imagine ici",
  eP:"Du sport face à la cordillère, des enfants au grand air et des rues pour marcher et pédaler.",
  refs:[["vida_ciclorruta","Piste cyclable","bici"],["vida_infantil","Jeux d'enfants","sol"],["vida_gimnasio","Salle de sport ouverte","montana"],["vida_padel","Padel","cancha"]],
  refNota:"Images de référence d'art de vivre. Ce ne sont pas des conceptions approuvées du projet ni une partie de l'offre.",
  sEb:"Près de tout", sT:"À quelques minutes de l'essentiel",
  sP:"Depuis Laureles, l'autoroute, l'aéroport, la ville et les grands attraits du Quindío sont à quelques minutes.",
  sCred:"Photo",
  kEb:"Étapes et prix", kT:"Plus tôt, meilleur prix",
  kP:"Le prix de chaque terrain est sa surface utile fois la valeur du m² utile de l'étape, plus sa surface protégée fois la valeur du m² protégé.",
  etD:{1:["Comptant","−20 % sur la liste"],2:["60 % en 2026","−10 %"],3:["50 % en 2026","−5 %"],4:["20 % en 2026","Prix de liste"],5:["20 % en 2026","Liste + 10 %"],6:["20 % en 2026","Liste + 20 %"]},
  desde:"dès", hasta:"jusqu'à", mu:"m² utile", mp:"m² protégé",
  pagoT:"Modalités de paiement", pago:(d)=>[
    ["mano","Réservation avec "+(d.sep?miles(d.sep)+" COP":"—")+"."],
    ["calendario","L'apport de l'étape est complété en 2026."],
    ["alza","Le solde est réglé en "+(d.planN||"—")+" mensualités de "+(d.planP?Math.round(d.planP*100):"—")+" % du solde, de janvier 2027 à novembre 2028."],
    ["escritura","Une dernière échéance en décembre 2028. Sans intérêts."]],
  precNota:"Prix en pesos colombiens, sous réserve de disponibilité et de modification. Le prix exact de chaque terrain figure sur sa fiche, dans le plan.",
  hEb2:"Outils", hT2:"Tout le terrain, avant d'y aller",
  her:[["pin","Plan en direct","Chaque terrain avec son état, son prix et son plan de paiement."],["cubo","Relief en 3D","Le terrain réel, courbes de niveau tous les mètres."],["sol","Course du soleil","L'ensoleillement de chaque terrain au fil du jour."],["escritura","Analyse en PDF","Le terrain et l'emplacement de la maison."]],
  finT:"Choisissez votre terrain", finP:"Voyez la disponibilité en direct et planifiez votre visite.",
  bLotes:"Explorez notre carte interactive", bWa:"Écrire sur WhatsApp", bVis:"Planifier une visite",
  fuentes:"Sources", waTxt:"Bonjour, je souhaite des informations sur Laureles Campestre (El Caimo, Armenia)."
 }
};
const FUENTES = [
  ["Metrocuadrado en La República, 29/04/2026: Armenia, Cali y Pereira, las ciudades en las que más se valoriza la vivienda nueva","https://www.larepublica.co/empresas/armenia-cali-y-pereira-las-ciudades-en-las-que-mas-se-valoriza-la-vivienda-nueva-4380920"],
  ["Observatorio Inmobiliario de Armenia: IPVN, II trimestre de 2025","https://observatorioarmenia.org/site/observatorio-inmobiliario-indice-de-precios-de-la-vivienda-nueva-ipvn-segundo-trimestre-de-2025/"],
  ["Ciudad Región, 31/07/2026: CONPES para el aeropuerto El Edén por $312.363 millones","https://ciudadregion.com/regiones/quindio/conpes-aeropuerto-el-eden-armenia-inversion-pista-terminal"],
  ["Cámara de Comercio de Armenia y del Quindío: El Edén, lo que representa el Conpes","https://camaraarmenia.org.co/el-eden-lo-que-representa-el-conpes/"],
  ["Wikipedia: Aeropuerto Internacional El Edén","https://es.wikipedia.org/wiki/Aeropuerto_Internacional_El_Ed%C3%A9n"],
  ["Fincaraíz: El Caimo","https://www.fincaraiz.com.co/blog/el-caimo/"]
];

/* ------------------------------------- esquema del corredor (sin escala) */
function mapaSVG(t){
  const P = {}; (window.POIS||[]).forEach(([n,,m])=>P[n]=m);
  const T = s => (window.ANALISIS ? ANALISIS.T(s) : s);
  const nodo = (x,y,k,nom,sub,al="start") => {
    const e = al==="end", ix = e ? x-42 : x+16, tx = e ? x-48 : x+48;
    return `<g class="mN"><circle cx="${x}" cy="${y}" r="6.5"/>
      <svg x="${ix}" y="${y-13}" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" class="mI">${IC[k]}</svg>
      <text x="${tx}" y="${y-1}" text-anchor="${al}" class="mL">${T(nom)}</text>
      <text x="${tx}" y="${y+17}" text-anchor="${al}" class="mS">${sub?T(sub):""}</text></g>`;
  };
  return `<svg class="ptMapa" viewBox="0 0 520 470" role="img" aria-label="${t.mapT}">
    <path class="mR" d="M430 60 C 400 140, 330 170, 285 225 S 190 330, 150 350 S 90 400, 70 420"/>
    <path class="mA" d="M470 405 C 420 360, 340 270, 285 228 S 150 185, 40 190"/>
    <path class="mR2" d="M150 350 C 120 300, 110 200, 120 110"/>
    ${nodo(430,60,"ciudad","Armenia",P["Armenia"],"end")}
    ${nodo(120,110,"cafe","Parque del Café",P["Parque del Café"])}
    ${nodo(470,405,"autopista","Autopista del Café",P["Autopista del Café"],"end")}
    ${nodo(150,350,"avion","Aeropuerto El Edén",P["Aeropuerto El Edén"])}
    ${nodo(70,420,"fabrica","La Tebaida",P["La Tebaida"])}
    <g class="mStar" transform="translate(285,225)"><circle r="30" class="mHalo"/><circle r="17"/>
      <path d="M0 -9 2.6 -2.8 9 -2.8 3.9 1.2 5.8 7.6 0 3.8 -5.8 7.6 -3.9 1.2 -9 -2.8 -2.6 -2.8Z" class="mEst"/></g>
    <text x="325" y="232" class="mL mLL">Laureles</text><text x="325" y="252" class="mS">El Caimo</text>
  </svg>`;
}

/* ------------------------------------------ perfil vial dibujado a escala */
function perfilSVG(t){
  const L = t.lab;
  const tr = [["lote",1.6],["ciclo",1.5],["anden",1.5],["ante",0.5],["via",6],["ante",0.5],["anden",1.5],["lote",1.6]];
  const E = 58, x0 = 16, yA = 118, yV = 132;
  const W = x0*2 + tr.reduce((s,a)=>s+a[1],0)*E;
  const col = {lote:"#8FA27E", ciclo:"#B5653E", anden:"#CFC8B6", ante:"#6F8F5C", via:"#3A3F39"};
  let x = x0, g = "", cot = "", tx = "";
  tr.forEach(([k,m])=>{
    const w = m*E, y = k==="via" ? yV : yA, h = k==="lote" ? 14 : (k==="via" ? 18 : 30);
    g += `<rect x="${x.toFixed(1)}" y="${y}" width="${w.toFixed(1)}" height="${h}" fill="${col[k]}"/>`;
    if(k==="via") g+=`<rect x="${(x+w/2-1.5).toFixed(1)}" y="${yV}" width="3" height="3" fill="#F4F2EA" opacity=".9"/>`;
    if(k!=="lote"){
      cot += `<line x1="${x.toFixed(1)}" y1="186" x2="${(x+w).toFixed(1)}" y2="186" class="pc"/>`+
             `<line x1="${x.toFixed(1)}" y1="180" x2="${x.toFixed(1)}" y2="192" class="pc"/><line x1="${(x+w).toFixed(1)}" y1="180" x2="${(x+w).toFixed(1)}" y2="192" class="pc"/>`+
             `<text x="${(x+w/2).toFixed(1)}" y="212" class="pn">${String(m).replace(".",",")}</text>`;
      tx += `<text x="${(x+w/2).toFixed(1)}" y="${k==="ante"?56:96}" class="pl">${L[k]}</text>`;
    }else tx += `<text x="${(x+w/2).toFixed(1)}" y="${yA-10}" class="pl pm">${L.lote}</text>`;
    if(k==="ante") g += `<rect x="${(x+w/2-4).toFixed(1)}" y="${yA-40}" width="8" height="40" rx="2" fill="#2A241D"/><rect x="${(x+w/2-4).toFixed(1)}" y="${yA-40}" width="8" height="6" rx="2" fill="#E9C77B"/>`;
    x += w;
  });
  g += `<line x1="${x0}" y1="${yA+30}" x2="${W-x0}" y2="${yA+30}" stroke="#2A241D" stroke-width="1" opacity=".25"/>`;
  return `<svg class="ptPerfil" viewBox="0 0 ${W.toFixed(0)} 226" role="img" aria-label="${t.perfilT}">
    <style>.pc{stroke:#3B453A;stroke-width:1}.pn{font:600 17px Manrope,sans-serif;fill:#1C221B;text-anchor:middle}
    .pl{font:600 15px Manrope,sans-serif;fill:#3B453A;text-anchor:middle}.pm{fill:#67705F}</style>
    ${g}${cot}${tx}<text x="${(W-x0).toFixed(0)}" y="26" class="pl pm" style="text-anchor:end">${L.bol}</text></svg>`;
}

/* ------------------------------------------------------------------ armado */
function html(){
  const l = TX[lang()] ? lang() : "es", t = TX[l], d = datos();
  const en = l==="en";
  const nf = v => en ? Math.round(v).toLocaleString("en-US") : miles(v);
  const cif = [String(d.n), nf(d.amin)+" m²", nf(d.amax)+" m²", "37 ha", en?"28,695 m²":"28.695 m²", en?"2.3":"2,3"];
  const precio = v => en ? "COP "+Math.round(v/1e6).toLocaleString("en-US")+" M" : "$"+Math.round(v/1e6).toLocaleString("es-CO")+" M";
  const T = s => (window.ANALISIS ? ANALISIS.T(s) : s);
  const sitios = (window.POIS||[]).map(([n,dd,m])=>{
    const s = SITIO[n] || {ic:"pin"};
    return `<article class="ptSitio">
      <div class="ptSitioF">${s.img?`<img loading="lazy" referrerpolicy="no-referrer" src="${s.img}" alt="${T(n)}" style="object-position:${s.pos||"center"}" onerror="this.remove()">`:""}
        <span class="ptChip">${ic("pin")}${T(m)}</span></div>
      <div class="ptSitioT">${ic(s.ic,"ptIcG")}<div><h3>${T(n)}</h3><p>${T(dd)}</p></div></div>
      ${s.autor?`<small class="ptCred">${t.sCred}: ${s.autor} · Wikimedia Commons · CC BY-SA 4.0</small>`:""}
    </article>`;}).join("");
  /* en la portada solo van E1 a E4; E5 y E6 siguen en el mapa dinámico */
  const et = d.et.filter(e=>e.n<=4).map(e=>`
    <div class="ptEt${e.n===1?" ptEt1":""}">
      <div class="ptEtH"><b>E${e.n}</b><div><strong>${t.etD[e.n][1]}</strong><span>${t.etD[e.n][0]}</span></div></div>
      <div class="ptEtP"><small>${t.desde}</small><strong>${precio(e.min)}</strong><small class="h">${t.hasta} ${precio(e.max)}</small></div>
      <div class="ptEtM"><span>${t.mu} <b>${en?"COP "+e.mu.toLocaleString("en-US"):"$"+miles(e.mu)}</b></span><span>${t.mp} <b>${en?"COP "+e.mp.toLocaleString("en-US"):"$"+miles(e.mp)}</b></span></div>
    </div>`).join("");
  const langs = ["es","en","fr"].map(k=>`<button data-l="${k}" class="${k===l?"on":""}">${k.toUpperCase()}</button>`).join("");

  return `
  <div class="ptBar" id="ptBar" role="banner">
    <img class="ptBarLogo" src="${"medios/logo_oscuro.svg"}" alt="Laureles Campestre">
    <div class="ptBarB"><div class="ptLang">${langs}</div><button class="ptWa" data-pt="wa">${ic("chat")}<span>${t.navWa}</span></button><button class="ptPri" data-pt="lotes">${t.nav}</button></div>
  </div>

  <section class="ptHero" id="ptHero">
    <div class="ptHeroBg" style="background-image:url('${IMG("hero")}')"></div>
    <div class="ptHeroTop"><div class="ptLang ptLangC">${langs}</div></div>
    <div class="ptHeroIn">
      <img class="ptLogoHero" src="${"medios/logo_claro.svg"}" alt="Laureles Campestre">
      <div class="ptHeroEb">${t.hEb}</div>
      <h1>${t.hT}</h1>
      <div class="ptHeroB">
        <button class="ptPri ptPriL ptVivo" data-pt="lotes"><i class="ptLive" aria-hidden="true"></i>${t.hB1}${ic("flecha")}</button>
        <button class="ptAsesor" data-pt="waP"><span class="ptAsesorI">${ic("wa")}</span><span class="ptAsesorT"><b>${t.hW1}</b><small>${t.hW2}</small></span></button>
        <button class="ptGhost" data-pt="mas">${t.hB2}${ic("abajo")}</button>
      </div>
    </div>
    <div class="ptHeroStats">
      <div>${ic("lotes")}<b>${d.n}</b><span>${t.hS[0][0]}</span></div>
      <div>${ic("regla")}<b>${nf(d.amin)} m²</b><span>${t.hS[1][0]}</span></div>
      <div>${ic("hectarea")}<b>37 ha</b><span>${t.hS[2][0]}</span></div>
      <div>${ic("escritura")}<b>100 %</b><span>${t.hS[3][0]}</span></div>
    </div>
  </section>

  <section class="ptSec ptVal" id="ptValor">
    <div class="ptIn ptValG">
      <div class="ptValTx">
        <div class="ptEb">${ic("pin")}${t.vEb}</div>
        <h2>${t.vT}</h2>
        <p class="ptLead">${t.vP}</p>
        <p class="ptQuote">${t.vP2}</p>
      </div>
      <figure class="ptMapaBox"><figcaption>${t.mapT}</figcaption>${mapaSVG(t)}<p class="ptNota">${t.mapN}</p></figure>
    </div>
    <div class="ptIn ptDatos">${t.vD.map(([k,n,tx,f])=>`<div class="ptDato">${ic(k,"ptIcG")}<b>${n}</b><p>${tx}</p><small>${f}</small></div>`).join("")}</div>
    <div class="ptIn"><p class="ptNota ptNotaC">${t.vNota}</p></div>
  </section>

  <section class="ptSec" id="ptProyecto">
    <div class="ptIn ptDos">
      <div><div class="ptEb">${ic("hectarea")}${t.pEb}</div><h2>${t.pT}</h2><p class="ptLead">${t.pP}</p></div>
      <div class="ptCifras">${cif.map((v,i)=>`<div>${ic(t.c[i][0],"ptIcG")}<b>${v}</b><span>${t.c[i][1]}</span></div>`).join("")}</div>
    </div>
    <div class="ptIn ptHitos">
      <div class="ptHito">${ic("escritura","ptIcH")}<div><span>${t.escT}</span><b>${t.escF}</b><p>${t.escD}</p></div></div>
      <div class="ptHito">${ic("calendario","ptIcH")}<div><span>${t.entT}</span><b>${t.entF}</b><p>${t.entD}</p></div></div>
    </div>
  </section>

  <section class="ptSec ptOsc">
    <div class="ptIn ptCab"><div><div class="ptEb">${ic("montana")}${t.fEb}</div><h2>${t.fT}</h2></div><p class="ptLead">${t.fP}</p></div>
    <div class="ptIn ptFotos">${t.fotos.map(([k,cap],i)=>`<figure class="${i===0?"ptF1":""}"><img loading="lazy" src="${IMG(k)}" alt="${cap}"><figcaption>${cap}</figcaption></figure>`).join("")}</div>
  </section>

  <section class="ptSec">
    <div class="ptIn ptCab"><div><div class="ptEb">${ic("porteria")}${t.uEb}</div><h2>${t.uT}</h2></div><p class="ptLead">${t.uP}</p></div>
    <div class="ptIn ptU4">${t.u4.map(([k,a,b])=>`<div>${ic(k,"ptIcG")}<b>${a}</b><span>${b}</span></div>`).join("")}</div>
    <div class="ptIn ptVia">
      <div class="ptPerfilBox"><h3>${t.perfilT}</h3>${perfilSVG(t)}<p class="ptNota">${t.perfilN}</p></div>
      <figure class="ptRef"><img loading="lazy" src="${IMG("vida_perfil_vial")}" alt="${t.refVia}"><figcaption><b>${t.refVia}</b><i>${t.ref}</i></figcaption></figure>
    </div>
    <div class="ptIn ptCom">${t.com.map(([k,n,a,b])=>`<div>${ic(k,"ptIcG")}<b>${n}</b><span>${a}</span>${b?`<em>${b}</em>`:""}</div>`).join("")}</div>
  </section>

  <section class="ptSec ptCrema">
    <div class="ptIn ptCab"><div><div class="ptEb">${ic("sol")}${t.eEb}</div><h2>${t.eT}</h2></div><p class="ptLead">${t.eP}</p></div>
    <div class="ptIn ptVida">${t.refs.map(([k,cap,icn],i)=>`<figure class="ptV${i}"><img loading="lazy" src="${IMG(k)}" alt="${cap}"><figcaption>${ic(icn)}<div><b>${cap}</b><i>${t.ref}</i></div></figcaption></figure>`).join("")}</div>
    <div class="ptIn"><p class="ptNota ptNotaRef">${t.refNota}</p></div>
  </section>

  <section class="ptSec ptOsc ptSitios">
    <div class="ptIn ptCab"><div><div class="ptEb">${ic("pin")}${t.sEb}</div><h2>${t.sT}</h2></div><p class="ptLead">${t.sP}</p></div>
    <div class="ptIn ptSitiosG">${sitios}</div>
  </section>

  <section class="ptSec" id="ptPrecios">
    <div class="ptIn ptCab"><div><div class="ptEb">${ic("alza")}${t.kEb}</div><h2>${t.kT}</h2></div><p class="ptLead">${t.kP}</p></div>
    <div class="ptIn ptEtapas">${et}</div>
    <div class="ptIn ptPago"><h3>${t.pagoT}</h3><ol>${t.pago(d).map(([k,p])=>`<li>${ic(k,"ptIcP")}<span>${p}</span></li>`).join("")}</ol><p class="ptNota">${t.precNota}</p></div>
  </section>

  <section class="ptSec ptCrema">
    <div class="ptIn ptCab"><div><div class="ptEb">${ic("cubo")}${t.hEb2}</div><h2>${t.hT2}</h2></div></div>
    <div class="ptIn ptHer">${t.her.map(([k,a,b])=>`<div>${ic(k,"ptIcG")}<b>${a}</b><p>${b}</p></div>`).join("")}</div>
  </section>

  <section class="ptFin">
    <div class="ptFinBg" style="background-image:url('${IMG("cordillera")}')"></div>
    <div class="ptFinIn">
      <img class="ptLogoFin" src="${"medios/logo_claro.svg"}" alt="Laureles Campestre">
      <h2>${t.finT}</h2><p class="ptLead">${t.finP}</p>
      <div class="ptBotones">
        <button class="ptPri ptPriL ptVivo" data-pt="lotes"><i class="ptLive" aria-hidden="true"></i>${t.bLotes}${ic("flecha")}</button>
        <button class="ptGhost" data-pt="wa">${ic("chat")}${t.bWa}</button>
        <button class="ptGhost" data-pt="visita">${ic("calendario")}${t.bVis}</button>
      </div>
    </div>
    <details class="ptFuentes"><summary>${t.fuentes}</summary><ul>${FUENTES.map(([a,u])=>`<li><a href="${u}" target="_blank" rel="noopener">${a}</a></li>`).join("")}</ul></details>
  </section>`;
}

/* --------------------------------------------------------------- montaje */
let raiz = null;
function irA(id){ const s=document.getElementById(id); if(s) wel.scrollTo({top:s.offsetTop-64, behavior:"smooth"}); }
function pintar(){
  if(!raiz) return;
  const y = wel.scrollTop;
  raiz.innerHTML = html();
  wel.scrollTop = y;
  raiz.querySelectorAll("[data-pt]").forEach(b=>b.addEventListener("click", ev=>{
    const a = b.dataset.pt;
    if(a==="mas"){ ev.preventDefault(); irA("ptValor"); return; }
    if(a==="lotes"){ const sb=document.getElementById("startBtn"); if(sb) sb.click(); return; }
    if(a==="wa"){ const t=TX[lang()]||TX.es; if(typeof window.abrirWhatsApp==="function") window.abrirWhatsApp(t.waTxt); return; }
    if(a==="waP"){ const t=TX[lang()]||TX.es; if(typeof window.abrirWhatsApp==="function") window.abrirWhatsApp(t.waTxt, "portada"); return; }
    if(a==="visita"){ if(typeof ACCESO!=="undefined" && ACCESO.agenda) ACCESO.agenda();
                      else { const bv=document.getElementById("bVisita"); if(bv) bv.click(); } }
  }));
  /* el idioma lo cambian los botones originales de la tarjeta, que avisan al armazón */
  raiz.querySelectorAll(".ptLang button").forEach(b=>b.addEventListener("click", ()=>{
    const o = wel.querySelector('.wel .langs button[data-l="'+b.dataset.l+'"]');
    if(o) o.click(); else if(window.ANALISIS) ANALISIS.idioma(b.dataset.l);
    setTimeout(pintar, 30);
  }));
  barra();
}
function barra(){
  const b = document.getElementById("ptBar"), h = document.getElementById("ptHero");
  if(!b || !h) return;
  b.classList.toggle("on", h.offsetHeight > 0 && wel.scrollTop > h.offsetHeight - 90);
}
function montar(){
  if(wel.classList.contains("conPortada")) return;
  wel.classList.add("conPortada");
  /* la tarjeta original queda en el DOM, oculta, por sus botones */
  const card = wel.querySelector(".wel");
  if(card){ card.classList.add("ptOculta"); card.setAttribute("aria-hidden","true"); }
  raiz = document.createElement("div");
  raiz.className = "ptRaiz";
  wel.appendChild(raiz);
  pintar();
  wel.addEventListener("scroll", barra, {passive:true});
  document.addEventListener("click", ev=>{
    if(ev.target.closest(".wel .langs button, .idioma button")) setTimeout(pintar, 30);
  });
}
if(document.readyState==="loading") document.addEventListener("DOMContentLoaded", montar); else montar();
window.PORTADA = { pintar, datos };
})();
