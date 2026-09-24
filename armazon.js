/* Armazón del plano vivo llevado al paquete web. Generado por web_armazon.py:
   no editar aquí, editar fable/plano_tpl.html y volver a correrlo.

   Depende de: ANALISIS (idioma), MEDIOS (rutas de los archivos), POIS, y de
   fit()/select() que aquí los da el adaptador del mapa. */
(function(){
"use strict";
const T  = s => (window.ANALISIS ? ANALISIS.T(s) : s);
const TT = (es,en,fr) => (window.ANALISIS ? ANALISIS.TT(es,en,fr) : es);
const LANGf = () => (window.ANALISIS ? ANALISIS.lang() : "es");
const MEDIA = window.MEDIOS || {};
let LANG = LANGf();
let modalActual = null;
function cambiarIdioma(l){ if(window.ANALISIS) ANALISIS.idioma(l); LANG=LANGf(); repintar(); }
function fit(){ if(window.encuadrar) encuadrar(); }
function select(n){ if(window.seleccionarLote) seleccionarLote(n); }

/* ---------------------------------------------------------------------------
   EL PROYECTO: texto comercial y descriptivo, con las cifras verificadas.
   Cifras de lotes: lotes.js (86 lotes). Zonas comunes, vía y portería: plano 039.
   Cuadro de áreas generales: plano 038 (08/09/2026). Tiempos: POIS del mapa.
   --------------------------------------------------------------------------- */
function PROY(l){
  const X = {
   es:{ eyebrow:"Parcelación campestre · El Caimo, Armenia", titulo:"Laureles Campestre",
     lead:"Ochenta y seis lotes campestres de más de 3.100 m² sobre 37 hectáreas de ladera cafetera, entre el bosque de una cañada protegida y la vista abierta al paisaje del Quindío. Un lugar para construir la casa de campo con espacio y silencio, a minutos de Armenia y del aeropuerto.",
     cifras:[["86","lotes campestres"],["3.100 m²","el más pequeño; hasta 9.907 m²"],["37 ha","de predio"],["2,3","lotes por hectárea"]],
     escT:"Escritura individual", escF:"100 % de la tierra", escD:"Cada lote se vende con escrituración del 100 % de su tierra a nombre del comprador. No es proindiviso.",
     hitoT:"Entrega final del urbanismo", hitoF:"Diciembre de 2028", hitoD:"Fecha de entrega final de las obras de urbanismo del proyecto.",
     bh:"Por qué Laureles",
     b:[["Espacio de verdad","La mitad de los lotes mide más de 3.208 m², con frentes típicos de 32 m. Es baja densidad: poco más de dos lotes por hectárea, para que cada casa tenga aire, jardín y privacidad."],
        ["La naturaleza se queda","Una cañada de bosque atraviesa el predio y se conserva como área de protección: 28.695 m² que nadie va a construir. A eso se suman las áreas verdes y los guayacanes que ya están."],
        ["Sol y ladera, medidos","Los lotes están entre 1.205 y 1.235 m s. n. m.; 52 abren su ladera al oriente, al suroriente o al sur. De cada lote se conoce su pendiente, su asoleamiento y dónde cabe la casa, antes de comprar."],
        ["Acceso con portería","Una sola entrada con portería y plazoleta de acceso, y un anillo vial que llega a todos los lotes: calzada de 6 m, antejardín de 0,5 m y andén de 1,5 m a cada lado, ciclorruta de 1,5 m a un costado e iluminación baja con bolardos de máximo 1 m."],
        ["Vida en común","Tres áreas sociales (1.190, 718 y 2.254 m²), una cancha de 10 × 20 m, un sendero de circulación lateral de 2.510 m² y 82 parqueaderos para visitantes."],
        ["Cerca de todo","A minutos de la Autopista del Café y del aeropuerto El Edén, y a menos de veinte minutos del centro de Armenia."]],
     herrT:"Todo el lote, antes de ir", herr:"En este mismo plano cada lote tiene su ficha con precio y forma de pago, el análisis del terreno en PDF, el relieve en 3D, el recorrido del sol y un diseñador de casa con inteligencia artificial. Y en campo, el botón Dónde estoy dice en qué lote está parado.",
     cerca:"Cerca", precio:"Lotes desde $297 millones de contado (Etapa E1, sujeto a disponibilidad).",
     verPlano:"Ver los lotes en el plano", wa:"Escribir por WhatsApp",
     tCifras:"Cifras del proyecto", tA:"Área", tT:"Total", tP:"Protegida", tU:"Útil",
     filas:[["Lotes","300.357","66.772","233.585"],["Zonas sociales","10.057","1.180","8.877"],["Áreas de protección","28.695,53","28.695,53","0"],["Andenes y vías","30.775","0","30.775"],["Portería","53","0","53"],["<b>Total</b>","<b>369.937,53</b>","<b>96.647,53</b>","<b>273.290</b>"]],
     nota:"Cifras en m². Cuadro de áreas del plano 038 (08/09/2026). Zonas comunes, vía y portería según el plano 039. Las imágenes de casas en esta página son ilustrativas; el diseño definitivo está en proceso de entrega al proyecto.",
     wat:"Hola, quiero información de Laureles Campestre (El Caimo, Armenia)." },
   en:{ eyebrow:"Country lots · El Caimo, Armenia", titulo:"Laureles Campestre",
     lead:"Eighty-six country lots of over 3,100 m² on 37 hectares of coffee-country hillside, between the woodland of a protected ravine and open views of the Quindío landscape. A place to build your country home with space and quiet, minutes from Armenia and the airport.",
     cifras:[["86","country lots"],["3,100 m²","smallest; up to 9,907 m²"],["37 ha","property"],["2.3","lots per hectare"]],
     escT:"Individual title deed", escF:"100% of the land", escD:"Each lot is sold with a deed for 100% of its land in the buyer\u2019s name. Not a shared undivided ownership (proindiviso).",
     hitoT:"Final handover of the site works", hitoF:"December 2028", hitoD:"Date of the final handover of the project\u2019s site works.",
     bh:"Why Laureles",
     b:[["Real space","Half of the lots are larger than 3,208 m², with typical frontages of 32 m. Low density — just over two lots per hectare — so every house has air, garden and privacy."],
        ["Nature stays","A wooded ravine crosses the property and is kept as a protection area: 28,695 m² that will never be built on, plus the green areas and the guayacán trees already there."],
        ["Sun and slope, measured","Lots sit between 1,205 and 1,235 m above sea level; 52 open their slope to the east, south-east or south. Each lot's slope, sun path and building area are known before you buy."],
        ["Gated access","A single entrance with a gatehouse and entrance plaza, and a ring road reaching every lot: 6 m carriageway, 0.5 m planting strip and 1.5 m sidewalk on each side, a 1.5 m bike lane on one side, and low lighting with bollards no taller than 1 m."],
        ["Shared life","Three social areas (1,190, 718 and 2,254 m²), a 10 × 20 m sports court, a 2,510 m² side path and 82 visitor parking spaces."],
        ["Close to everything","Minutes from the Autopista del Café and El Edén airport, and under twenty minutes from central Armenia."]],
     herrT:"The whole lot, before you visit", herr:"On this map every lot has its sheet with price and payment plan, the terrain analysis in PDF, the 3D relief, the sun path and an AI house designer. On site, the Where am I button tells you which lot you are standing on.",
     cerca:"Nearby", precio:"Lots from COP 297 million cash (Stage E1, subject to availability).",
     verPlano:"See the lots on the map", wa:"Message us on WhatsApp",
     tCifras:"Project figures", tA:"Area", tT:"Total", tP:"Protected", tU:"Usable",
     filas:[["Lots","300,357","66,772","233,585"],["Social areas","10,057","1,180","8,877"],["Protection areas","28,695.53","28,695.53","0"],["Sidewalks and roads","30,775","0","30,775"],["Gatehouse","53","0","53"],["<b>Total</b>","<b>369,937.53</b>","<b>96,647.53</b>","<b>273,290</b>"]],
     nota:"Figures in m². Area schedule from drawing 038 (08/09/2026); common areas, road and gatehouse from drawing 039. House images on this site are illustrative; the final design is being delivered to the project.",
     wat:"Hello, I would like information about Laureles Campestre (El Caimo, Armenia)." },
   fr:{ eyebrow:"Lotissement de campagne · El Caimo, Armenia", titulo:"Laureles Campestre",
     lead:"Quatre-vingt-six lots de campagne de plus de 3 100 m² sur 37 hectares de coteau caféier, entre le bois d'un ravin protégé et la vue ouverte sur le paysage du Quindío. Un lieu pour bâtir sa maison de campagne avec espace et calme, à quelques minutes d'Armenia et de l'aéroport.",
     cifras:[["86","lots de campagne"],["3 100 m²","le plus petit ; jusqu'à 9 907 m²"],["37 ha","de terrain"],["2,3","lots par hectare"]],
     escT:"Acte de propriété individuel", escF:"100 % du terrain", escD:"Chaque lot est vendu avec un acte pour 100 % de son terrain au nom de l\u2019acheteur. Pas d\u2019indivision (proindiviso).",
     hitoT:"Livraison finale de l'aménagement", hitoF:"Décembre 2028", hitoD:"Date de livraison finale des travaux d\u2019aménagement du projet.",
     bh:"Pourquoi Laureles",
     b:[["De l'espace, vraiment","La moitié des lots dépasse 3 208 m², avec des façades typiques de 32 m. Faible densité — un peu plus de deux lots par hectare — pour l'air, le jardin et l'intimité de chaque maison."],
        ["La nature reste","Un ravin boisé traverse le terrain et reste zone protégée : 28 695 m² jamais construits, plus les espaces verts et les guayacans déjà présents."],
        ["Soleil et pente, mesurés","Les lots sont entre 1 205 et 1 235 m d'altitude ; 52 ouvrent leur pente à l'est, au sud-est ou au sud. Pente, ensoleillement et zone constructible sont connus avant l'achat."],
        ["Accès gardé","Une seule entrée avec loge de gardien et placette d'accès, et une route en anneau jusqu'à chaque lot : chaussée de 6 m, bande plantée de 0,5 m et trottoir de 1,5 m de chaque côté, piste cyclable de 1,5 m d'un côté et éclairage bas par bornes de 1 m maximum."],
        ["Vie commune","Trois espaces sociaux (1 190, 718 et 2 254 m²), un terrain de sport de 10 × 20 m, un sentier latéral de 2 510 m² et 82 places pour les visiteurs."],
        ["Près de tout","À quelques minutes de l'Autopista del Café et de l'aéroport El Edén, et à moins de vingt minutes du centre d'Armenia."]],
     herrT:"Tout le lot, avant la visite", herr:"Sur ce plan, chaque lot a sa fiche avec prix et plan de paiement, l'analyse du terrain en PDF, le relief 3D, la course du soleil et un concepteur de maison par IA. Sur place, le bouton Où suis-je indique le lot où vous vous trouvez.",
     cerca:"À proximité", precio:"Lots à partir de 297 millions COP comptant (étape E1, sous réserve de disponibilité).",
     verPlano:"Voir les lots sur le plan", wa:"Écrire sur WhatsApp",
     tCifras:"Chiffres du projet", tA:"Surface", tT:"Total", tP:"Protégée", tU:"Utile",
     filas:[["Lots","300 357","66 772","233 585"],["Espaces sociaux","10 057","1 180","8 877"],["Zones de protection","28 695,53","28 695,53","0"],["Trottoirs et voirie","30 775","0","30 775"],["Loge","53","0","53"],["<b>Total</b>","<b>369 937,53</b>","<b>96 647,53</b>","<b>273 290</b>"]],
     nota:"Surfaces en m². Tableau du plan 038 (08/09/2026) ; espaces communs, voirie et loge selon le plan 039. Les images de maisons sont illustratives ; la conception définitive est en cours de livraison au projet.",
     wat:"Bonjour, je souhaite des informations sur Laureles Campestre (El Caimo, Armenia)." }
  }[l] || null;
  const x = X;
  const poi = (window.POIS||[]).slice(0,4).map(([n,d,m])=>`<li><b>${n}</b><span>${m}</span></li>`).join("");
  return `<div class="proy">
   <div class="proyHero" style="background-image:linear-gradient(180deg,rgba(20,26,18,.05) 30%,rgba(20,26,18,.78)),url('${MEDIA.hero}')">
     <div class="eb">${x.eyebrow}</div><h2 class="serif">${x.titulo}</h2></div>
   <p class="lead">${x.lead}</p>
   <div class="cifras">${x.cifras.map(([n,t])=>`<div><b>${n}</b><span>${t}</span></div>`).join("")}</div>
   <div class="hitos">
   <div class="hito"><div class="ic" aria-hidden="true"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M7 3.5h7l4 4V20a.5.5 0 0 1-.5.5h-10A.5.5 0 0 1 7 20z"/><path d="M14 3.5V8h4M9.5 12.5h6M9.5 16h6"/></svg></div>
     <div><span>${x.escT}</span><b>${x.escF}</b><i>${x.escD}</i></div></div>
   <div class="hito"><div class="ic" aria-hidden="true"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg></div>
     <div><span>${x.hitoT}</span><b>${x.hitoF}</b><i>${x.hitoD}</i></div></div>
   </div>
   <h3 class="serif">${x.bh}</h3>
   <div class="bondades">${x.b.map(([t,d],i)=>`<div class="bd"><div class="num">${String(i+1).padStart(2,"0")}</div><h4>${t}</h4><p>${d}</p></div>`).join("")}</div>
   <div class="proyDos">
     <div class="herr"><h4>${x.herrT}</h4><p>${x.herr}</p></div>
     <div class="cerca"><h4>${x.cerca}</h4><ul>${poi}</ul></div>
   </div>
   <div class="proyCta"><p>${x.precio}</p>
     <div class="bt"><button class="pri" data-accion="plano">${x.verPlano}</button>
     <button class="sec" data-accion="wa" data-t="${x.wat.replace(/"/g,"&quot;")}">${x.wa}</button></div></div>
   <h3 class="serif">${x.tCifras}</h3>
   <table class="tbl"><tr><th>${x.tA}</th><th>${x.tT}</th><th>${x.tP}</th><th>${x.tU}</th></tr>
   ${x.filas.map(f=>`<tr>${f.map(c=>`<td>${c}</td>`).join("")}</tr>`).join("")}</table>
   <p class="hint">${x.nota}</p></div>`;
}

const CONT_ES=()=>({
 proyecto: PROY("es"),
 ubicacion:`<h2 class="serif">Ubicación y entorno</h2>
   <p class="lead">El predio está georreferenciado en MAGNA-SIRGAS / Origen Nacional CTM12. Centro aproximado:
   4°28′27″ N, 75°44′20″ W.</p>
   <div class="llegar"><h3 class="serif">Cómo llegar</h3>
   <p class="hint">Portería del proyecto, por la vía de la vereda Marmato. El punto está tomado del plano 039 (portería, 53 m²), no de una dirección aproximada.</p>
   <p class="botones"><a class="pri" href="https://www.google.com/maps/dir/?api=1&destination=4.470819,-75.741392&travelmode=driving" target="_blank" rel="noopener">Abrir en Google Maps</a>
   <a class="sec" href="https://waze.com/ul?ll=4.470819,-75.741392&navigate=yes" target="_blank" rel="noopener">Abrir en Waze</a>
   <button class="sec" onclick="navigator.clipboard&&navigator.clipboard.writeText('4.470819, -75.741392').then(()=>this.textContent='✓')">Copiar coordenadas</button></p>
   <p class="hint">4.470819, -75.741392 · WGS84</p></div>
   <table class="tbl"><tr><th>Punto de interés</th><th>Tiempo</th></tr>
   ${POIS.map(([n,d,m])=>`<tr><td>${n}<div class="hint">${d}</div></td><td>${m}</td></tr>`).join("")}
   </table>
   <p class="hint">Distancias y tiempos calculados sobre la red vial real (OSRM / OpenStreetMap), saliendo por la
   vía de la vereda Marmato. Son tiempos de recorrido libre, sin trancón: en hora pico Armenia puede sumar
   cinco o diez minutos.</p>`,
 unidades:`<h2 class="serif">Estado de unidades</h2>
   <p class="lead">El estado de cada lote se guarda compartido: quien lo cambie aquí, lo cambia para todo el equipo.</p>
   <p>Los 26 lotes que aparecen como <b>reservados</b> vienen del registro de negocios del Excel. Falta confirmar
   cuáles ya son venta cerrada y cuáles siguen en negociación — se ajusta lote por lote desde la ficha.</p>
   <p class="hint">Los nombres de los clientes no se publican: viven en el Excel y en el CRM, no en este plano.</p>`,
 gps:`<h2 class="serif">Dónde estoy</h2>
   <p class="lead">Abre este plano desde el celular, párate en cualquier punto del predio y toca
   <b>Dónde estoy</b>: el plano dice en qué lote estás.</p>
   <p>Funciona porque el DXF ya viene georreferenciado en CTM12: cada lindero tiene coordenadas reales, no un
   dibujo flotando.</p>
   <p class="hint">El GPS de un celular tiene 5 a 10 m de error. Sirve para saber en qué lote estás —miden 30 × 100 m—
   pero no para replantear linderos.</p>`,
 imagenes:`<h2 class="serif">Imágenes</h2>
   <p class="lead">Tomas del predio extraídas del vuelo de dron.</p>
   <div class="galbig"><img id="galBig" src="${MEDIA.hero}" alt="Vista aérea del predio"></div>
   <div class="galcap" id="galCap">El predio completo: la explanada de la vía ya cortada, la casa principal y el guayacán en flor.</div>
   <div class="gal" id="galGrid"></div>
   <p class="hint" style="margin-top:12px">Sacadas del video, así que están a 1024 px. Para el sitio definitivo se
   toman en foto fija, en hora dorada y a resolución completa.</p>`,
 video:`<h2 class="serif">Video</h2>
   <p class="lead">Intro de marca y una pieza del vuelo de dron.</p>
   <div class="vidbox" id="introSlot"></div>
   <div class="galcap">Intro de marca · 10 s</div>
   <div class="vidbox" style="margin-top:12px"><video src="${MEDIA.clip}" controls playsinline preload="metadata"></video></div>
   <div class="galcap">Sobrevuelo del predio · 22 s, recortado del video que enviaste</div>
   <p style="margin-top:12px">Faltan las piezas definitivas: llegada por la vía, recorrido del anillo y sobrevuelo
   de la cañada, de 20 a 40 segundos cada una, en horizontal y vertical.</p>`,
 contacto:`<h2 class="serif">Consultar</h2>
   <p class="lead">En el sitio real este botón abre WhatsApp con el asesor y el lote precargado, y deja el lead
   registrado con la etapa y el precio que el prospecto estaba viendo.</p>
   <p class="hint">En este demo no está conectado: falta definir el número del asesor y el destino del lead
   (CRM de Century 21 DAB).</p>`});

const CONT_EN=()=>({
 proyecto: PROY("en"),
 ubicacion:`<h2 class="serif">Location and surroundings</h2>
   <p class="lead">The property is georeferenced in MAGNA-SIRGAS / Origen Nacional CTM12. Approximate centre:
   4°28′27″ N, 75°44′20″ W.</p>
   <div class="llegar"><h3 class="serif">How to get there</h3>
   <p class="hint">Project gatehouse, via the Vereda Marmato road. The point comes from drawing 039 (gatehouse, 53 m²), not from an approximate address.</p>
   <p class="botones"><a class="pri" href="https://www.google.com/maps/dir/?api=1&destination=4.470819,-75.741392&travelmode=driving" target="_blank" rel="noopener">Open in Google Maps</a>
   <a class="sec" href="https://waze.com/ul?ll=4.470819,-75.741392&navigate=yes" target="_blank" rel="noopener">Open in Waze</a>
   <button class="sec" onclick="navigator.clipboard&&navigator.clipboard.writeText('4.470819, -75.741392').then(()=>this.textContent='✓')">Copy coordinates</button></p>
   <p class="hint">4.470819, -75.741392 · WGS84</p></div>
   <table class="tbl"><tr><th>Point of interest</th><th>Time</th></tr>
   ${POIS.map(([n,d,m])=>`<tr><td>${T(n)}<div class="hint">${T(d)}</div></td><td>${T(m)}</td></tr>`).join("")}
   </table>
   <p class="hint">Distances and times computed on the real road network (OSRM / OpenStreetMap), leaving by the
   Vereda Marmato road. These are free-flow driving times: at rush hour Armenia can add five to ten minutes.</p>`,
 unidades:`<h2 class="serif">Unit status</h2>
   <p class="lead">Each lot's status is stored and shared: whoever changes it here changes it for the whole team.</p>
   <p>The 26 lots showing as <b>reserved</b> come from the deal register in the spreadsheet. It is still to be
   confirmed which are closed sales and which are under negotiation — that gets set lot by lot from the sheet.</p>
   <p class="hint">Client names are not published: they live in the spreadsheet and the CRM, not in this plan.</p>`,
 gps:`<h2 class="serif">Where am I</h2>
   <p class="lead">Open this plan on your phone, stand anywhere on the property and tap <b>Where am I</b>: the plan
   tells you which lot you are standing on.</p>
   <p>It works because the DXF is already georeferenced in CTM12: every boundary carries real coordinates, not a
   drawing floating over a picture.</p>
   <p class="hint">A phone's GPS is accurate to 5–10 m. That is enough to know which lot you are on —they are
   30 × 100 m— but not to set out boundaries.</p>`,
 imagenes:`<h2 class="serif">Images</h2>
   <p class="lead">Views of the property taken from the drone flight.</p>
   <div class="galbig"><img id="galBig" src="${MEDIA.hero}" alt="Aerial view of the property"></div>
   <div class="galcap" id="galCap">The whole property: the levelled road platform, the main house and the guayacán in bloom.</div>
   <div class="gal" id="galGrid"></div>
   <p class="hint" style="margin-top:12px">These are frames pulled from the video, so they are only 1024 px wide.
   For the final site they should be shot as stills, in golden hour and at full resolution.</p>`,
 video:`<h2 class="serif">Video</h2>
   <p class="lead">Brand intro and a clip from the drone flight.</p>
   <div class="vidbox" id="introSlot"></div>
   <div class="galcap">Brand intro · 10 s</div>
   <div class="vidbox" style="margin-top:12px"><video src="${MEDIA.clip}" controls playsinline preload="metadata"></video></div>
   <div class="galcap">Flyover of the property · 22 s, cut from the video you sent</div>
   <p style="margin-top:12px">The final pieces are still missing: the arrival along the road, the ring-road circuit
   and a flyover of the ravine, 20 to 40 seconds each, in landscape and vertical.</p>`,
 contacto:`<h2 class="serif">Enquire</h2>
   <p class="lead">On the live site this button opens WhatsApp with the sales agent and the lot already filled in,
   and logs the lead together with the stage and price the prospect was looking at.</p>
   <p class="hint">It is not wired up in this demo: the agent's number and the destination for the lead
   (Century 21 DAB's CRM) still have to be decided.</p>`});
const CONT_FR=()=>({
 proyecto: PROY("fr"),
 ubicacion:`<h2 class="serif">Situation et environs</h2>
   <p class="lead">Le terrain est géoréférencé en MAGNA-SIRGAS / Origen Nacional CTM12. Centre approximatif :
   4°28′27″ N, 75°44′20″ O.</p>
   <div class="llegar"><h3 class="serif">Comment s'y rendre</h3>
   <p class="hint">Loge d'entrée du projet, par la route de la vereda Marmato. Le point vient du plan 039 (loge, 53 m²), pas d'une adresse approximative.</p>
   <p class="botones"><a class="pri" href="https://www.google.com/maps/dir/?api=1&destination=4.470819,-75.741392&travelmode=driving" target="_blank" rel="noopener">Ouvrir dans Google Maps</a>
   <a class="sec" href="https://waze.com/ul?ll=4.470819,-75.741392&navigate=yes" target="_blank" rel="noopener">Ouvrir dans Waze</a>
   <button class="sec" onclick="navigator.clipboard&&navigator.clipboard.writeText('4.470819, -75.741392').then(()=>this.textContent='✓')">Copier les coordonnées</button></p>
   <p class="hint">4.470819, -75.741392 · WGS84</p></div>
   <table class="tbl"><tr><th>Point d'intérêt</th><th>Temps</th></tr>
   ${POIS.map(([n,d,m])=>`<tr><td>${T(n)}<div class="hint">${T(d)}</div></td><td>${T(m)}</td></tr>`).join("")}
   </table>
   <p class="hint">Distances et temps calculés sur le réseau routier réel (OSRM / OpenStreetMap), en sortant par la
   route de la vereda Marmato. Ce sont des temps de parcours libre : aux heures de pointe, Armenia peut ajouter
   cinq à dix minutes.</p>`,
 unidades:`<h2 class="serif">État des lots</h2>
   <p class="lead">L'état de chaque lot est enregistré et partagé : celui qui le change ici le change pour toute
   l'équipe.</p>
   <p>Les 26 lots affichés comme <b>réservés</b> viennent du registre d'affaires du tableur. Il reste à confirmer
   lesquels sont des ventes fermes et lesquels sont encore en négociation — cela se règle lot par lot depuis la fiche.</p>
   <p class="hint">Les noms des clients ne sont pas publiés : ils vivent dans le tableur et le CRM, pas dans ce plan.</p>`,
 gps:`<h2 class="serif">Où suis-je</h2>
   <p class="lead">Ouvrez ce plan sur votre téléphone, placez-vous n'importe où sur le terrain et touchez
   <b>Où suis-je</b> : le plan vous dit sur quel lot vous vous trouvez.</p>
   <p>Cela fonctionne parce que le DXF est déjà géoréférencé en CTM12 : chaque limite porte des coordonnées
   réelles, ce n'est pas un dessin posé sur une image.</p>
   <p class="hint">Le GPS d'un téléphone a 5 à 10 m d'erreur. C'est assez pour savoir sur quel lot on est —ils font
   30 × 100 m— mais pas pour implanter des limites.</p>`,
 imagenes:`<h2 class="serif">Images</h2>
   <p class="lead">Vues du terrain extraites du vol de drone.</p>
   <div class="galbig"><img id="galBig" src="${MEDIA.hero}" alt="Vue aérienne du terrain"></div>
   <div class="galcap" id="galCap">Le terrain complet : la plateforme de la voie déjà terrassée, la maison principale et le guayacán en fleur.</div>
   <div class="gal" id="galGrid"></div>
   <p class="hint" style="margin-top:12px">Ce sont des images tirées de la vidéo, donc à 1024 px seulement. Pour le
   site définitif, il faudra des photos fixes, à l'heure dorée et en pleine résolution.</p>`,
 video:`<h2 class="serif">Vidéo</h2>
   <p class="lead">Intro de marque et un extrait du vol de drone.</p>
   <div class="vidbox" id="introSlot"></div>
   <div class="galcap">Intro de marque · 10 s</div>
   <div class="vidbox" style="margin-top:12px"><video src="${MEDIA.clip}" controls playsinline preload="metadata"></video></div>
   <div class="galcap">Survol du terrain · 22 s, extrait de la vidéo envoyée</div>
   <p style="margin-top:12px">Il manque encore les séquences définitives : l'arrivée par la route, le parcours de
   l'anneau et le survol du vallon, de 20 à 40 secondes chacune, en horizontal et en vertical.</p>`,
 contacto:`<h2 class="serif">Nous contacter</h2>
   <p class="lead">Sur le site réel, ce bouton ouvre WhatsApp avec le conseiller et le lot déjà renseigné, et
   enregistre le contact avec la phase et le prix que le prospect était en train de regarder.</p>
   <p class="hint">Ce n'est pas branché dans cette démo : il reste à définir le numéro du conseiller et la
   destination du contact (le CRM de Century 21 DAB).</p>`});
const CONT = () => LANG==="en" ? CONT_EN() : LANG==="fr" ? CONT_FR() : CONT_ES();
const modal=document.getElementById("modal"),mb=document.getElementById("modalBody");
const FOTOS=[
  ["hero","El predio completo: la explanada de la vía, la casa principal y el guayacán",
          "The whole property: the levelled road platform, the main house and the guayacán"],
  ["guayacan","Guayacán en flor sobre la explanada del anillo vial",
              "Guayacán in bloom over the ring-road platform"],
  ["casa_galpones","La casa principal y los galpones existentes",
                   "The main house and the existing sheds"],
  ["casa_aerea","La casa principal desde arriba","The main house from above"],
  ["casa_cerca","Cubiertas de barro de la casa principal","Clay-tile roofs of the main house"],
  ["praderas","Praderas con arbolado grande, sector central",
              "Pasture with mature trees, central sector"],
  ["canada","El corredor de bosque de la cañada","The wooded corridor of the ravine"],
  ["cordillera","La cordillera al fondo desde el remate alto",
                "The mountain range beyond, from the high end"],
  ["bosque","Bosque y cafetal en el borde del predio","Woodland and coffee at the edge of the property"]];
const capFoto = f => LANG==="es" ? f[1] : (LANG==="fr" && f[3] ? f[3] : f[2]);
function devolverIntro(){
  const v=document.getElementById("introVid");
  if(v && v.parentElement && v.parentElement.id==="introSlot"){
    try{v.pause();}catch(_){}
    v.removeAttribute("controls"); v.muted=true; v.currentTime=0;
    document.getElementById("intro").insertBefore(v, document.getElementById("skipBtn"));
  }
}
function abrir(k){
  modalActual=k;
  if(k!=="video") devolverIntro();
  if(k==="gps"){ubicar();}
  if(!CONT()[k])return;
  mb.innerHTML=`<button class="close" aria-label="${T("Cerrar")}">×</button>`+CONT()[k];
  mb.querySelector(".close").onclick=()=>{devolverIntro();modal.hidden=true;modalActual=null;};
  mb.classList.toggle("ancha", k==="proyecto");
  mb.querySelectorAll("[data-accion]").forEach(b=>b.onclick=()=>{
    if(b.dataset.accion==="plano"){ modal.hidden=true; modalActual=null; fit(); }
    else if(b.dataset.accion==="wa" && typeof window.abrirWhatsApp==="function") window.abrirWhatsApp(b.dataset.t||"");
  });
  const grid=mb.querySelector("#galGrid");
  if(grid){
    grid.innerHTML=FOTOS.map((f,i)=>{ const cap=capFoto(f);
      return `<button data-i="${i}" aria-label="${cap}"><img src="${MEDIA[f[0]]}" alt="${cap}"></button>`;}).join("");
    grid.querySelectorAll("button").forEach(b=>b.onclick=()=>{
      const f=FOTOS[+b.dataset.i];
      mb.querySelector("#galBig").src=MEDIA[f[0]];
      mb.querySelector("#galCap").textContent=capFoto(f);});
  }
  const slot=mb.querySelector("#introSlot");
  if(slot){ const v=document.getElementById("introVid");
    if(v){ v.setAttribute("controls",""); v.muted=false; v.currentTime=0;
           v.style.width="100%"; v.style.height="auto"; v.style.objectFit="contain";
           slot.appendChild(v); } }
  modal.hidden=false;
}
document.querySelectorAll("#nav button").forEach(b=>b.onclick=()=>{
  document.querySelectorAll("#nav button").forEach(c=>c.classList.toggle("on",c===b));
  if(b.dataset.m==="plano"){modal.hidden=true;return;}
  abrir(b.dataset.m);});
/* CONSULTAR lleva directo al WhatsApp de ventas (el número no está en la
   página: lo pone la función del servidor). Si hay un lote abierto, va en el mensaje. */
document.getElementById("ctaTop").onclick=()=>{
  let lote=null; try{ lote = (typeof S!=="undefined" && S.sel!=null) ? S.sel : null; }catch(e){}
  const t = "Hola, quiero información de Laureles Campestre (El Caimo, Armenia)"+(lote!=null?", en especial del lote "+lote:"")+".";
  if(typeof window.abrirWhatsApp==="function") window.abrirWhatsApp(t); else abrir("contacto");
};
modal.addEventListener("click",e=>{if(e.target===modal){devolverIntro();modal.hidden=true;}});
addEventListener("keydown",e=>{if(e.key==="Escape"){if(!modal.hidden){devolverIntro();modal.hidden=true;}else select(null);}});

/* intro de marca -> bienvenida */
const wel=document.getElementById("welcome");
const intro=document.getElementById("intro"), iv=document.getElementById("introVid");
let introDone=false;
function cerrarIntro(){
  if(introDone) return; introDone=true;
  try{ iv.pause(); }catch(_){}
  intro.classList.add("out");
  setTimeout(()=>{intro.style.display="none";},650);
  wel.hidden=false;
}
const miniatura = innerHeight<320 || innerWidth<320;
const quieto = matchMedia("(prefers-reduced-motion: reduce)").matches;
if(miniatura || quieto){ intro.style.display="none"; introDone=true; wel.hidden=false; }
else{
  iv.addEventListener("ended",cerrarIntro);
  iv.addEventListener("error",cerrarIntro);
  /* se intenta con sonido; si el navegador lo bloquea, arranca mudo y aparece
     el botón para soltar el audio, que es el gesto que el navegador exige */
  const quitar=id=>{const b=document.getElementById(id); if(b)b.remove();};
  const play=(conSonido)=>{
    iv.muted = !conSonido;
    const p=iv.play();
    if(!p || !p.then){ if(!conSonido) mostrarSonido(); return; }
    p.then(()=>{ quitar("playBtn"); if(!conSonido) mostrarSonido(); })
     .catch(()=>{ if(conSonido) play(false); else mostrarPlay(); });
  };
  const mostrarSonido=()=>{
    if(introDone||document.getElementById("sonBtn")||document.getElementById("playBtn")) return;
    const b=document.createElement("button"); b.className="skip"; b.id="sonBtn";
    b.textContent="🔊  Activar sonido"; b.style.left="24px"; b.style.right="auto";
    b.onclick=ev=>{ev.stopPropagation(); iv.muted=false; b.remove();};
    intro.appendChild(b); };
  const mostrarPlay=()=>{ if(introDone||document.getElementById("playBtn")) return;
    quitar("sonBtn");
    intro.classList.add("nofilm");
    const b=document.createElement("button"); b.className="skip"; b.id="playBtn";
    b.textContent="▶  Ver intro"; b.style.left="24px"; b.style.right="auto";
    b.onclick=ev=>{ev.stopPropagation(); b.remove(); play(true);};
    intro.appendChild(b); };
  iv.volume = 1;
  play(true);
  /* EL SONIDO, SIN QUE HAYA QUE ACTIVARLO.
     El navegador no deja arrancar un video con audio si el usuario todavía no ha
     tocado nada: es política de Chrome, Safari y Firefox, y no hay manera de
     saltársela. Lo que sí se puede es no obligar a buscar un botón: el PRIMER
     toque, clic o tecla en cualquier parte de la página —aunque sea para saltar
     la intro— suelta el audio solo. El botón "Activar sonido" queda de reserva
     para quien no toque nada. */
  const soltarAudio = ()=>{
    ["pointerdown","touchstart","keydown","click"].forEach(ev=>
      removeEventListener(ev, soltarAudio, true));
    if(introDone) return;
    if(iv.muted){
      iv.muted = false; iv.volume = 1;
      const p = iv.play(); if(p && p.catch) p.catch(()=>{});
    }
    quitar("sonBtn");
  };
  ["pointerdown","touchstart","keydown","click"].forEach(ev=>
    addEventListener(ev, soltarAudio, {capture:true, passive:true}));
  setTimeout(()=>{ if(!introDone && iv.currentTime<0.1) mostrarPlay(); },1500);
  iv.addEventListener("playing",()=>{intro.classList.remove("nofilm");
    const b=document.getElementById("playBtn"); if(b)b.remove();});
}
document.getElementById("skipBtn").onclick=cerrarIntro;
document.getElementById("startBtn").onclick=()=>{wel.hidden=true;fit();};
function marcarIdioma(){
  document.querySelectorAll('.langs button,.idioma button').forEach(c=>c.classList.toggle("on",c.dataset.l===LANG));
}
document.querySelectorAll(".idioma button").forEach(b=>b.onclick=()=>{
  cambiarIdioma(b.dataset.l); marcarIdioma();
});
wel.querySelectorAll(".langs button").forEach(b=>b.onclick=()=>{
  cambiarIdioma(b.dataset.l); marcarIdioma();
});


function capturar(){
  document.querySelectorAll("header, .poi, .wel, .rail, .fondos, .ficha").forEach(raiz=>{
    raiz.querySelectorAll("*").forEach(e=>{
      if(e.closest(".idioma")||e.closest(".langs")) return;
      if(e.children.length===0){
        const t=e.textContent.replace(/\s+/g," ").trim();
        if(t && !e.dataset.es) e.dataset.es=t;
      }
      /* etiquetas con un <input> adentro: se traduce el nodo de texto suelto */
      if(e.tagName==="LABEL" && !e.dataset.esTxt){
        const n=[...e.childNodes].find(x=>x.nodeType===3 && x.nodeValue.trim());
        if(n) e.dataset.esTxt=n.nodeValue.trim();
      }
    });
  });
}
function repintar(){
  capturar();
  document.querySelectorAll("[data-es]").forEach(e=>{ e.textContent=T(e.dataset.es); });
  document.querySelectorAll("[data-es-txt]").forEach(e=>{
    const n=[...e.childNodes].find(x=>x.nodeType===3 && x.nodeValue.trim());
    if(n) n.nodeValue=" "+T(e.dataset.esTxt);
  });
  const h=document.querySelector(".wel h2");
  if(h) h.innerHTML=TT('Bienvenidos a <em>Laureles Campestre</em>',
                       'Welcome to <em>Laureles Campestre</em>',
                       'Bienvenue à <em>Laureles Campestre</em>');
  document.getElementById("poi").innerHTML=POIS.map(([n,d,m])=>
    `<div class="c"><div class="n">${T(n)}</div><div class="d">${T(d)}<br><em>${T(m)}</em></div></div>`).join("");
  if(!modal.hidden && modalActual) abrir(modalActual);
}
/* captura de los textos del armazón para poder traducirlos */
document.querySelectorAll("header, .poi, .wel, .rail, .fondos, .ficha").forEach(raiz=>{
  raiz.querySelectorAll("*").forEach(e=>{
    if(e.closest(".idioma")||e.closest(".langs")) return;
    if(e.children.length===0){
      const t=e.textContent.replace(/\s+/g," ").trim();
      if(t && !e.dataset.es) e.dataset.es=t;
    }
  });
});
/* la barra de sitios de interés se llena siempre, no sólo al cambiar de idioma */
document.getElementById("poi").innerHTML=POIS.map(([n,d,m])=>
  `<div class="c"><div class="n">${T(n)}</div><div class="d">${T(d)}<br><em>${T(m)}</em></div></div>`).join("");
window.ARMAZON={abrir, repintar, cerrarIntro};
if(LANG!=="es") repintar();
marcarIdioma();
})();
