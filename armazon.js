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

const CONT_ES=()=>({
 proyecto:`<h2 class="serif">El proyecto</h2>
   <p class="lead">88 lotes campestres sobre un predio de 369.937,53 m² —37 hectáreas— en el polígono de vivienda
   campestre Marmato, Armenia. Un anillo vial único recorre el filo del terreno y una cañada de bosque protegido
   lo atraviesa en diagonal.</p>
   <table class="tbl"><tr><th>Concepto</th><th>Cifra</th></tr>
   <tr><td>Área del predio</td><td>369.937,53 m²</td></tr>
   <tr><td>Área en lotes</td><td>300.357 m²</td></tr>
   <tr><td>Área útil en lotes (sin protección)</td><td>233.585 m²</td></tr>
   <tr><td>Protección dentro de lotes</td><td>66.772 m²</td></tr>
   <tr><td>Lote más pequeño / más grande</td><td>3.100 / 6.802 m²</td></tr>
   <tr><td>Densidad</td><td>2,4 lotes por hectárea</td></tr></table>
   <h3 class="serif" style="margin-top:22px">Cuadro de áreas generales</h3>
   <table class="tbl"><tr><th>Área</th><th>Total</th><th>Protegida</th><th>Útil</th></tr>
   <tr><td>Lotes</td><td>300.357</td><td>66.772</td><td>233.585</td></tr>
   <tr><td>Zonas sociales</td><td>10.057</td><td>1.180</td><td>8.877</td></tr>
   <tr><td>Áreas de protección</td><td>28.695,53</td><td>28.695,53</td><td>0</td></tr>
   <tr><td>Andenes y vías</td><td>30.775</td><td>0</td><td>30.775</td></tr>
   <tr><td>Portería</td><td>53</td><td>0</td><td>53</td></tr>
   <tr><td><b>Total</b></td><td><b>369.937,53</b></td><td><b>96.647,53</b></td><td><b>273.290</b></td></tr></table>
   <p class="hint">Cifras en m², tomadas del cuadro de áreas del plano <b>038</b> del 08/09/2026. La geometría del DXF
   se verificó lote por lote contra el cuadro: la diferencia mediana entre rótulo y polígono es de 0,1 %.</p>`,
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
 proyecto:`<h2 class="serif">The project</h2>
   <p class="lead">88 country lots on a 369,937.53 m² property —37 hectares— inside the Marmato country-housing
   zone of Armenia. A single ring road runs along the edge of the land and a protected forest ravine crosses it
   diagonally.</p>
   <table class="tbl"><tr><th>Item</th><th>Figure</th></tr>
   <tr><td>Property area</td><td>369,937.53 m²</td></tr>
   <tr><td>Area in lots</td><td>300,357 m²</td></tr>
   <tr><td>Usable area in lots (excluding protection)</td><td>233,585 m²</td></tr>
   <tr><td>Protection inside lots</td><td>66,772 m²</td></tr>
   <tr><td>Smallest / largest lot</td><td>3,100 / 6,802 m²</td></tr>
   <tr><td>Density</td><td>2.4 lots per hectare</td></tr></table>
   <h3 class="serif" style="margin-top:22px">General area schedule</h3>
   <table class="tbl"><tr><th>Area</th><th>Total</th><th>Protected</th><th>Usable</th></tr>
   <tr><td>Lots</td><td>300,357</td><td>66,772</td><td>233,585</td></tr>
   <tr><td>Communal areas</td><td>10,057</td><td>1,180</td><td>8,877</td></tr>
   <tr><td>Protection areas</td><td>28,695.53</td><td>28,695.53</td><td>0</td></tr>
   <tr><td>Paths and roads</td><td>30,775</td><td>0</td><td>30,775</td></tr>
   <tr><td>Gatehouse</td><td>53</td><td>0</td><td>53</td></tr>
   <tr><td><b>Total</b></td><td><b>369,937.53</b></td><td><b>96,647.53</b></td><td><b>273,290</b></td></tr></table>
   <p class="hint">Figures in m², from the area schedule of drawing <b>038</b> dated 08/09/2026. The DXF geometry was
   checked lot by lot against the schedule: the median difference between label and polygon is 0.1%.</p>`,
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
 proyecto:`<h2 class="serif">Le projet</h2>
   <p class="lead">88 lots de campagne sur un terrain de 369 937,53 m² —37 hectares— dans la zone d'habitat rural
   de Marmato, à Armenia. Une voie en anneau unique longe la crête du terrain et un vallon de forêt protégée le
   traverse en diagonale.</p>
   <table class="tbl"><tr><th>Poste</th><th>Chiffre</th></tr>
   <tr><td>Surface du terrain</td><td>369 937,53 m²</td></tr>
   <tr><td>Surface en lots</td><td>300 357 m²</td></tr>
   <tr><td>Surface utile en lots (hors protection)</td><td>233 585 m²</td></tr>
   <tr><td>Protection à l'intérieur des lots</td><td>66 772 m²</td></tr>
   <tr><td>Lot le plus petit / le plus grand</td><td>3 100 / 6 802 m²</td></tr>
   <tr><td>Densité</td><td>2,4 lots par hectare</td></tr></table>
   <h3 class="serif" style="margin-top:22px">Tableau général des surfaces</h3>
   <table class="tbl"><tr><th>Surface</th><th>Totale</th><th>Protégée</th><th>Utile</th></tr>
   <tr><td>Lots</td><td>300 357</td><td>66 772</td><td>233 585</td></tr>
   <tr><td>Espaces communs</td><td>10 057</td><td>1 180</td><td>8 877</td></tr>
   <tr><td>Zones de protection</td><td>28 695,53</td><td>28 695,53</td><td>0</td></tr>
   <tr><td>Trottoirs et voies</td><td>30 775</td><td>0</td><td>30 775</td></tr>
   <tr><td>Loge de gardien</td><td>53</td><td>0</td><td>53</td></tr>
   <tr><td><b>Total</b></td><td><b>369 937,53</b></td><td><b>96 647,53</b></td><td><b>273 290</b></td></tr></table>
   <p class="hint">Chiffres en m², repris du tableau des surfaces du plan <b>038</b> du 08/09/2026. La géométrie du
   DXF a été vérifiée lot par lot contre ce tableau : l'écart médian entre l'étiquette et le polygone est de 0,1 %.</p>`,
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
document.getElementById("ctaTop").onclick=()=>abrir("contacto");
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
