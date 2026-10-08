/* =============================================================================
   AYUDA — "Cómo usar el mapa dinámico"
   -----------------------------------------------------------------------------
   Un botón redondo con un signo, en la columna de mandos de la derecha, abre una
   guía paso a paso: moverse por el mapa (dedos o mouse), tocar un lote, el
   análisis con su PDF, la película de llegada, el 3D con la casa a escala, el
   sol y el relieve. Cada paso resalta el botón real del que habla y trae un
   "Pruébalo" que lo hace por la persona. Español, inglés y francés, según el
   idioma que tenga la página. Nada de esto toca el mapa: sólo lo usa.
   ============================================================================= */
(function(){
"use strict";
const main = document.querySelector("main"); if(!main) return;
const lang = () => { try{ return window.ANALISIS ? ANALISIS.lang() : "es"; }catch(e){ return "es"; } };
const tx = o => (o && (o[lang()] || o.es)) || "";
const tactil = () => matchMedia("(pointer:coarse)").matches || innerWidth <= 820;
const R3D = () => window.__R3D;
const es3d = () => { try{ return !!(R3D() && R3D().activo()); }catch(e){ return false; } };
const sel = () => { try{ return (typeof S!=="undefined" && S.sel!=null) ? S.sel : null; }catch(e){ return null; } };
const leer = k => { try{ return localStorage.getItem(k); }catch(e){ return null; } };
const anotar = (k,v) => { try{ localStorage.setItem(k,v); }catch(e){} };

/* un lote disponible para los ejemplos: el primero libre, si no el 20 */
function loteEjemplo(){
  const s = sel(); if(s!=null) return s;
  try{ const f = __MAPA.LOTES.features.find(x=>x.properties.estado==="disponible"); if(f) return f.properties.lote; }catch(e){}
  return 20;
}
/* abrirLote() del mapa deja el lote escogido de verdad (S.sel), que es lo que
   leen el 3D y el botón del sol; seleccionarLote() sólo pinta la ficha */
function irLote(n){ try{ if(typeof window.abrirLote==="function") window.abrirLote(n,true); else if(window.seleccionarLote) seleccionarLote(n); }catch(e){} }
function clic(id){ const b=document.getElementById(id); if(b && !b.disabled) b.click(); return !!b; }
const esperar = ms => new Promise(r=>setTimeout(r,ms));

/* ------------------------------ iconos ------------------------------ */
const I = {
  dedo:'<path d="M9 11V5.5a1.5 1.5 0 0 1 3 0V10m0-1.5a1.5 1.5 0 0 1 3 0V11m0-1a1.5 1.5 0 0 1 3 0v4.5c0 3.6-2.4 6.5-6 6.5-2.4 0-3.9-1.1-5-3l-2.3-4a1.5 1.5 0 0 1 2.5-1.6L9 14"/>',
  pinza:'<circle cx="7" cy="7" r="2.2"/><circle cx="17" cy="17" r="2.2"/><path d="M10 10l1.6 1.6M14 14l-1.6-1.6M3 3l2 2M21 21l-2-2"/>',
  giro:'<path d="M20 12a8 8 0 1 1-2.4-5.7"/><path d="M20 4v4h-4"/>',
  incl:'<path d="M4 18h16M7 18l4-12h2l4 12"/><path d="M12 3v-1"/>',
  mouse:'<rect x="7" y="3" width="10" height="18" rx="5"/><path d="M12 3v6"/><path d="M12 6.5v1" stroke-width="2.6"/>',
  der:'<rect x="7" y="3" width="10" height="18" rx="5"/><path d="M12 3v6"/><path d="M12.6 3.6c2 .2 3.6 1.9 3.9 4.4h-3.9z" fill="currentColor" stroke="none"/>',
  teclado:'<rect x="3" y="7" width="18" height="11" rx="2"/><path d="M7 11h.01M11 11h.01M15 11h.01M8 14.5h8"/>',
  lote:'<path d="M4 19l3-13 11 2-2 12z"/><path d="M9 11h5"/>',
  pdf:'<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5"/><path d="M10 14h6M10 17h4"/>',
  pelicula:'<rect x="3" y="6" width="13" height="12" rx="2"/><path d="M16 10l5-3v10l-5-3z"/>',
  cubo:'<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M12 12l8-4.5M12 12v9M12 12L4 7.5"/>',
  casa:'<path d="M4 11l8-6 8 6v9H4z"/><path d="M10 20v-5h4v5"/>',
  sol:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  monte:'<path d="M3 19l6-9 4 5 3-4 5 8z"/>',
  capas:'<path d="M12 4l9 5-9 5-9-5z"/><path d="M3 14l9 5 9-5"/>',
  mano:'<path d="M8 13V6.5a1.5 1.5 0 0 1 3 0V12m0-6.5V5a1.5 1.5 0 0 1 3 0v7m0-5a1.5 1.5 0 0 1 3 0v6c0 4-2.5 7-6.5 7-2.5 0-4-1.2-5.2-3.2L3.5 13a1.5 1.5 0 0 1 2.6-1.5L8 14"/>',
  wa:'<path d="M20.5 11.5a8.5 8.5 0 0 1-12.6 7.4L3.5 20l1.2-4.2A8.5 8.5 0 1 1 20.5 11.5z"/>'
};
const ico = k => '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(I[k]||"")+'</svg>';

/* ------------------------------ los pasos ------------------------------
   Cada paso: título, una línea de entrada, lo que se hace (para celular y
   para computador cuando cambia) y, si aplica, el botón real que se resalta y
   la acción de "Pruébalo". */
const PASOS = [
 { k:"mover", i:"dedo",
   t:{es:"Muévete por el mapa", en:"Move around the map", fr:"Déplacez-vous sur la carte"},
   d:{es:"El mapa es tuyo: acércate, gíralo e inclínalo para ver el terreno desde donde quieras.",
      en:"The map is yours: zoom in, rotate it and tilt it to see the land from any angle.",
      fr:"La carte est à vous : zoomez, tournez-la et inclinez-la pour voir le terrain sous tous les angles."},
   cel:[
     ["dedo",  {es:"<b>Un dedo</b>: arrastra para recorrer el mapa.", en:"<b>One finger</b>: drag to pan the map.", fr:"<b>Un doigt</b> : glissez pour parcourir la carte."}],
     ["pinza", {es:"<b>Pellizca con dos dedos</b> para acercar o alejar.", en:"<b>Pinch with two fingers</b> to zoom in or out.", fr:"<b>Pincez à deux doigts</b> pour zoomer ou dézoomer."}],
     ["giro",  {es:"<b>Gira dos dedos</b> sobre la pantalla para rotar el mapa.", en:"<b>Twist two fingers</b> to rotate the map.", fr:"<b>Tournez deux doigts</b> pour faire pivoter la carte."}],
     ["incl",  {es:"<b>Desliza dos dedos hacia arriba o abajo</b> para inclinar la vista.", en:"<b>Slide two fingers up or down</b> to tilt the view.", fr:"<b>Glissez deux doigts vers le haut ou le bas</b> pour incliner la vue."}]
   ],
   pc:[
     ["mouse", {es:"<b>Arrastra</b> con el clic izquierdo para moverte. <b>La rueda</b> acerca y aleja.", en:"<b>Drag</b> with the left button to pan. <b>The wheel</b> zooms in and out.", fr:"<b>Glissez</b> avec le bouton gauche pour vous déplacer. <b>La molette</b> zoome."}],
     ["der",   {es:"<b>Clic derecho sostenido y arrastra</b>: el mapa gira e inclina en órbita.", en:"<b>Hold the right button and drag</b>: the map orbits, rotating and tilting.", fr:"<b>Clic droit maintenu et glissez</b> : la carte tourne et s'incline en orbite."}],
     ["teclado",{es:"<b>Ctrl + rueda</b> gira · <b>Mayús + rueda</b> inclina.", en:"<b>Ctrl + wheel</b> rotates · <b>Shift + wheel</b> tilts.", fr:"<b>Ctrl + molette</b> fait tourner · <b>Maj + molette</b> incline."}],
     ["giro",  {es:"A la derecha tienes botones para girar ⟲ ⟳, inclinar ▲ ▼ y volver al norte <b>N</b>.", en:"On the right, buttons to rotate ⟲ ⟳, tilt ▲ ▼ and return north <b>N</b>.", fr:"À droite, des boutons pour tourner ⟲ ⟳, incliner ▲ ▼ et revenir au nord <b>N</b>."}]
   ],
   foco:()=> tactil() ? [".maplibregl-ctrl-top-right .maplibregl-ctrl-group"] : ["#giro"]
 },
 { k:"lote", i:"lote",
   t:{es:"Toca un lote", en:"Tap a lot", fr:"Touchez un lot"},
   d:{es:"Cada lote abre su ficha con el área, el precio de la etapa y la forma de pago.",
      en:"Each lot opens its card with the area, the stage price and the payment plan.",
      fr:"Chaque lot ouvre sa fiche avec la surface, le prix de l'étape et le plan de paiement."},
   todo:[
     ["lote",  {es:"<b>Verde</b> está disponible; <b>rojo</b>, vendido.", en:"<b>Green</b> is available; <b>red</b>, sold.", fr:"<b>Vert</b> : disponible ; <b>rouge</b> : vendu."}],
     ["wa",    {es:"Desde la ficha escribes por <b>WhatsApp</b>, compartes el lote o pides <b>Volar al lote</b>.", en:"From the card you can message on <b>WhatsApp</b>, share the lot or <b>Fly to the lot</b>.", fr:"Depuis la fiche : <b>WhatsApp</b>, partager le lot ou <b>Voler jusqu'au lot</b>."}],
     ["capas", {es:"En <b>Filtros</b> buscas por número, etapa (E1 a E6), área y precio.", en:"In <b>Filters</b> search by number, stage (E1 to E6), area and price.", fr:"Dans <b>Filtres</b>, cherchez par numéro, étape (E1 à E6), surface et prix."}]
   ],
   foco:()=> tactil() ? ["#bRail"] : ["#rail"],
   accion:{es:"Abrir un lote", en:"Open a lot", fr:"Ouvrir un lot"},
   hacer: async ()=>{ cerrar(); irLote(loteEjemplo()); }
 },
 { k:"analisis", i:"pdf",
   t:{es:"Análisis del lote y ficha PDF", en:"Lot analysis and PDF sheet", fr:"Analyse du lot et fiche PDF"},
   d:{es:"Todo el estudio técnico del lote en una sola pantalla, listo para descargar.",
      en:"The full technical study of the lot on one screen, ready to download.",
      fr:"Toute l'étude technique du lot sur un seul écran, prête à télécharger."},
   todo:[
     ["lote",  {es:"En la ficha toca <b>Análisis del lote y ficha PDF</b>.", en:"In the card tap <b>Lot analysis and PDF sheet</b>.", fr:"Dans la fiche, touchez <b>Analyse du lot et fiche PDF</b>."}],
     ["monte", {es:"Ves dónde está, cómo es el terreno, dónde cabe la casa, el corte y el sol en cada fachada.", en:"See where it is, the terrain, where the house fits, the section and the sun on each façade.", fr:"Emplacement, terrain, où tient la maison, la coupe et le soleil sur chaque façade."}],
     ["pdf",   {es:"Abajo: <b>Descargar ficha técnica y comercial</b> (PDF), el volumen en 3D y el DXF para AutoCAD.", en:"At the bottom: <b>download the technical and sales sheet</b> (PDF), the 3D volume and the AutoCAD DXF.", fr:"En bas : <b>télécharger la fiche technique et commerciale</b> (PDF), le volume 3D et le DXF AutoCAD."}]
   ],
   foco:()=> ["#bAnl"],
   accion:{es:"Abrir el análisis", en:"Open the analysis", fr:"Ouvrir l'analyse"},
   hacer: async ()=>{ cerrar(); if(sel()==null){ irLote(loteEjemplo()); await esperar(900); } clic("bAnl"); }
 },
 { k:"pelicula", i:"pelicula",
   t:{es:"Llega a tu lote en 3D", en:"Arrive at your lot in 3D", fr:"Arrivez à votre lot en 3D"},
   d:{es:"Una película de un minuto sobre el terreno real: dron, carro por la vía y la vista desde el lote.",
      en:"A one-minute film over the real terrain: drone, a drive along the road and the view from the lot.",
      fr:"Un film d'une minute sur le vrai terrain : drone, trajet en voiture et vue depuis le lot."},
   todo:[
     ["pelicula",{es:"En la ficha toca la tarjeta <b>Llega al lote</b>.", en:"In the card tap <b>Arrive at the lot</b>.", fr:"Dans la fiche, touchez <b>Arriver au lot</b>."}],
     ["incl",  {es:"Terminas parado en el centro del lote, a 1,6 m del suelo. Con <b>Segundo piso</b> subes a 4,5 m.", en:"You end standing at the centre of the lot, 1.6 m above ground. <b>Second floor</b> lifts you to 4.5 m.", fr:"Vous finissez au centre du lot, à 1,6 m du sol. <b>Deuxième étage</b> vous monte à 4,5 m."}],
     ["dedo",  {es:"Arrastra para mirar alrededor.", en:"Drag to look around.", fr:"Glissez pour regarder autour."}]
   ],
   foco:()=> [".recCard"],
   accion:{es:"Ver la película", en:"Play the film", fr:"Voir le film"},
   hacer: async ()=>{ cerrar(); const n=loteEjemplo(); try{ if(window.RECORRIDO) RECORRIDO.iniciar(n); }catch(e){} }
 },
 { k:"3d", i:"cubo",
   t:{es:"El terreno en 3D", en:"The land in 3D", fr:"Le terrain en 3D"},
   d:{es:"El botón 3D levanta el relieve medido del predio para recorrerlo como una maqueta.",
      en:"The 3D button raises the surveyed terrain so you can explore it like a scale model.",
      fr:"Le bouton 3D relève le terrain mesuré pour l'explorer comme une maquette."},
   cel:[
     ["dedo",  {es:"<b>Un dedo</b>: gira alrededor del proyecto (órbita).", en:"<b>One finger</b>: orbit around the project.", fr:"<b>Un doigt</b> : tournez autour du projet (orbite)."}],
     ["pinza", {es:"<b>Pellizca con dos dedos</b> para acercar o alejar.", en:"<b>Pinch with two fingers</b> to zoom.", fr:"<b>Pincez à deux doigts</b> pour zoomer."}],
     ["mano",  {es:"Con el botón <b>Mano</b> el dedo mueve el modelo en vez de girarlo.", en:"With the <b>Hand</b> button your finger moves the model instead of rotating it.", fr:"Avec le bouton <b>Main</b>, le doigt déplace le modèle au lieu de le tourner."}],
     ["monte", {es:"<b>Real · 2× · 3×</b> exageran la altura para leer la pendiente. <b>Encuadrar</b> vuelve al inicio.", en:"<b>Real · 2× · 3×</b> exaggerate height to read the slope. <b>Fit</b> resets the view.", fr:"<b>Réel · 2× · 3×</b> exagèrent la hauteur. <b>Cadrer</b> revient au début."}]
   ],
   pc:[
     ["mouse", {es:"<b>Arrastra</b> para girar en órbita. <b>La rueda</b> acerca y aleja.", en:"<b>Drag</b> to orbit. <b>The wheel</b> zooms.", fr:"<b>Glissez</b> pour tourner en orbite. <b>La molette</b> zoome."}],
     ["der",   {es:"<b>Clic derecho</b> o <b>Mayús + arrastre</b> mueve el modelo.", en:"<b>Right button</b> or <b>Shift + drag</b> moves the model.", fr:"<b>Clic droit</b> ou <b>Maj + glisser</b> déplace le modèle."}],
     ["monte", {es:"<b>Real · 2× · 3×</b> exageran la altura para leer la pendiente. <b>Encuadrar</b> vuelve al inicio.", en:"<b>Real · 2× · 3×</b> exaggerate height to read the slope. <b>Fit</b> resets the view.", fr:"<b>Réel · 2× · 3×</b> exagèrent la hauteur. <b>Cadrer</b> revient au début."}]
   ],
   foco:()=> es3d() ? ["#ve3d"] : ["#b3d"],
   accion:{es:"Encender el 3D", en:"Turn on 3D", fr:"Activer la 3D"},
   hacer: async ()=>{ if(!es3d()) clic("b3d"); await esperar(400); pintar(); }
 },
 { k:"casa", i:"casa",
   t:{es:"La casa a escala sobre el terreno", en:"The house to scale on the land", fr:"La maison à l'échelle sur le terrain"},
   d:{es:"En 3D, toca un lote y aparece la casa del proyecto a escala real, asentada en la topografía.",
      en:"In 3D, tap a lot and the project's house appears to real scale, sitting on the topography.",
      fr:"En 3D, touchez un lot : la maison du projet apparaît à l'échelle réelle, posée sur la topographie."},
   todo:[
     ["casa",  {es:"Así compruebas cómo cae la casa en la pendiente de ese lote.", en:"See how the house sits on that lot's slope.", fr:"Vérifiez comment la maison se pose sur la pente du lot."}],
     ["capas", {es:"En la barra <b>Casa</b> escoges entre los tres tamaños del proyecto; en los lotes 47 a 53 también los modelos en terraza.", en:"In the <b>House</b> bar choose among the project's three sizes; lots 47 to 53 also offer terraced models.", fr:"Dans la barre <b>Maison</b>, choisissez parmi les trois tailles ; les lots 47 à 53 ont aussi des modèles en terrasse."}]
   ],
   foco:()=> ["#casa3d"],
   accion:{es:"Ponerle la casa a un lote", en:"Place the house on a lot", fr:"Poser la maison sur un lot"},
   hacer: async ()=>{ cerrar(); if(!es3d()){ clic("b3d"); await esperar(500); } irLote(loteEjemplo()); }
 },
 { k:"sol", i:"sol",
   t:{es:"El sol de tu lote", en:"Your lot's sun", fr:"Le soleil de votre lot"},
   d:{es:"Mira por dónde sale y se pone el sol sobre el lote durante todo el año.",
      en:"See where the sun rises and sets over the lot all year round.",
      fr:"Voyez où le soleil se lève et se couche sur le lot toute l'année."},
   todo:[
     ["sol",   {es:"En 3D, con un lote escogido, toca <b>Sol</b>: la bóveda solar dibuja el recorrido del sol en los solsticios y el equinoccio, a escala real.", en:"In 3D, with a lot selected, tap <b>Sun</b>: the solar dome draws the sun's path at the solstices and equinox, to real scale.", fr:"En 3D, lot choisi, touchez <b>Soleil</b> : la voûte solaire trace la course du soleil aux solstices et à l'équinoxe, à l'échelle réelle."}],
     ["pdf",   {es:"En el análisis del lote ves además el sol en cada fachada y por dónde corre la sombra durante el día.", en:"The lot analysis also shows the sun on each façade and how the shade moves through the day.", fr:"L'analyse du lot montre aussi le soleil sur chaque façade et la course de l'ombre."}]
   ],
   foco:()=> ["#ve3dSol"],
   accion:{es:"Ver el sol", en:"Show the sun", fr:"Voir le soleil"},
   hacer: async ()=>{ cerrar(); if(!es3d()){ clic("b3d"); await esperar(500); }
     if(sel()==null){ irLote(loteEjemplo()); await esperar(900); }
     try{ if(!R3D().haciaDomo()) clic("ve3dSol"); }catch(e){ clic("ve3dSol"); } }
 },
 { k:"relieve", i:"monte",
   t:{es:"Relieve y fondos del mapa", en:"Relief and map backgrounds", fr:"Relief et fonds de carte"},
   d:{es:"Sin salir del mapa también puedes ver el terreno en relieve y cambiar el fondo.",
      en:"Without leaving the map you can also see the terrain in relief and change the background.",
      fr:"Sans quitter la carte, voyez le terrain en relief et changez le fond."},
   todo:[
     ["monte", {es:"<b>Relieve</b> levanta las montañas y la pendiente sobre el mapa.", en:"<b>Relief</b> raises the hills and slopes on the map.", fr:"<b>Relief</b> soulève les reliefs et la pente sur la carte."}],
     ["capas", {es:"Abajo cambias el fondo: <b>Plano, Mapa, Satélite u Oscuro</b>.", en:"At the bottom switch the background: <b>Plan, Map, Satellite or Dark</b>.", fr:"En bas, changez le fond : <b>Plan, Carte, Satellite ou Sombre</b>."}],
     ["giro",  {es:"<b>Ver todo</b> vuelve a encuadrar el proyecto completo.", en:"<b>See all</b> frames the whole project again.", fr:"<b>Tout voir</b> recadre tout le projet."}]
   ],
   foco:()=> es3d() ? ["#b3d"] : ["#bRelieve","#fondos"],
   accion:{es:"Encender el relieve", en:"Turn on relief", fr:"Activer le relief"},
   hacer: async ()=>{ if(es3d()){ clic("b3d"); await esperar(300); } try{ if(!S.relieve) clic("bRelieve"); }catch(e){ clic("bRelieve"); } pintar(); }
 }
];

/* ------------------------------ estilos ------------------------------ */
const css = document.createElement("style");
css.textContent = `
.ayBtn{position:absolute;right:10px;top:10px;z-index:7;width:32px;height:32px;border-radius:50%;border:0;cursor:pointer;padding:0;
  background:var(--forest,#32402F);color:#F6F4EC;font:700 17px/1 Georgia,"Times New Roman",serif;display:grid;place-items:center;
  box-shadow:0 0 0 2px rgba(255,255,255,.9),0 4px 12px rgba(28,34,27,.26);transition:transform .2s}
@media (pointer:coarse){.ayBtn{width:36px;height:36px;font-size:19px}}
.ayBtn:hover{transform:scale(1.07)}
.ayBtn:focus-visible{outline:3px solid #EBD9AE;outline-offset:3px}
.ayBtn.nuevo:after{content:"";position:absolute;inset:-5px;border-radius:50%;border:2px solid #B8955C;animation:ayLatir 1.8s ease-out infinite}
@keyframes ayLatir{0%{transform:scale(.85);opacity:.9}100%{transform:scale(1.35);opacity:0}}
body.enRecorrido .ayBtn, body.enRecorrido .ayBur{display:none}
.ayBur{position:absolute;z-index:7;right:64px;max-width:230px;background:#32402F;color:#F6F4EC;border-radius:12px;padding:9px 12px;
  font:500 12.5px/1.35 var(--sans,system-ui,sans-serif);box-shadow:0 8px 24px rgba(28,34,27,.3);opacity:0;transform:translateX(8px);
  transition:opacity .5s,transform .5s;pointer-events:auto;cursor:pointer}
.ayBur.on{opacity:1;transform:none}
.ayBur:after{content:"";position:absolute;right:-6px;top:16px;border:6px solid transparent;border-right:0;border-left-color:#32402F}
.ayBur b{color:#EBD9AE}
.ayCard{position:fixed;z-index:60;left:50%;bottom:24px;transform:translate(-50%,16px);width:min(460px,calc(100% - 32px));
  max-height:calc(100% - 120px);display:flex;flex-direction:column;background:#FFFDF8;color:#1C221B;border-radius:18px;
  box-shadow:0 24px 60px rgba(20,26,19,.38),0 0 0 1px rgba(28,34,27,.06);font:14px/1.5 var(--sans,system-ui,sans-serif);
  opacity:0;transition:opacity .3s,transform .3s}
.ayCard.on{opacity:1;transform:translate(-50%,0)}
.ayHead{display:flex;align-items:center;gap:10px;padding:14px 14px 0 18px}
.ayHead small{flex:1;font:600 10.5px var(--sans,system-ui,sans-serif);letter-spacing:.22em;text-transform:uppercase;color:#9B7A48}
.ayX{border:0;background:#F1EEE4;color:#32402F;width:32px;height:32px;border-radius:50%;cursor:pointer;font-size:18px;line-height:1}
.ayCuerpo{padding:6px 18px 4px;overflow:auto}
.ayTit{display:flex;align-items:center;gap:12px;margin:4px 0 6px}
.ayTit .ic{flex:0 0 42px;height:42px;border-radius:12px;background:#32402F;color:#EBD9AE;display:grid;place-items:center}
.ayTit h3{margin:0;font:500 21px/1.15 var(--serif,Georgia,serif);color:#32402F;text-wrap:balance}
.ayD{margin:0 0 10px;color:#3B453A}
.ayDisp{display:inline-flex;background:#F1EEE4;border-radius:999px;padding:3px;margin:0 0 8px}
.ayDisp button{border:0;background:transparent;border-radius:999px;padding:5px 12px;font:600 12px var(--sans,system-ui,sans-serif);color:#67705F;cursor:pointer}
.ayDisp button.on{background:#32402F;color:#F6F4EC}
.ayLista{list-style:none;margin:0;padding:0;display:grid;gap:8px}
.ayLista li{display:flex;gap:10px;align-items:flex-start;background:#F8F6EF;border:1px solid #E9E5D8;border-radius:12px;padding:9px 11px;color:#1C221B}
.ayLista li .ic{flex:0 0 30px;height:30px;border-radius:9px;background:#FFFDF8;border:1px solid #DED9CB;color:#32402F;display:grid;place-items:center}
.ayLista li .ic svg{width:18px;height:18px}
.ayLista b{color:#32402F}
.ayPie{display:flex;align-items:center;gap:8px;padding:12px 14px 14px 18px;border-top:1px solid #E9E5D8;margin-top:10px}
.ayPuntos{display:flex;gap:5px;flex:1}
.ayPuntos button{width:8px;height:8px;border-radius:50%;border:0;padding:0;background:#DED9CB;cursor:pointer}
.ayPuntos button.on{background:#9B7A48;width:20px;border-radius:5px}
.ayPie .b{border:0;border-radius:999px;padding:9px 14px;font:600 12.5px var(--sans,system-ui,sans-serif);cursor:pointer;white-space:nowrap}
.ayPie .sec{background:#F1EEE4;color:#32402F}
.ayPie .pri{background:#32402F;color:#F6F4EC}
.ayPrueba{margin-top:10px;border:1.5px solid #B8955C;background:#F1EAD9;color:#5E4A2A;border-radius:999px;padding:8px 14px;
  font:600 12.5px var(--sans,system-ui,sans-serif);cursor:pointer;display:inline-flex;align-items:center;gap:6px}
.ayPrueba:hover{background:#EBD9AE}
.ayFoco{outline:3px solid #B8955C!important;outline-offset:3px;
  animation:ayFoco 1.4s ease-in-out infinite}
@keyframes ayFoco{0%,100%{box-shadow:0 0 0 0 rgba(184,149,92,.55)}50%{box-shadow:0 0 0 10px rgba(184,149,92,0)}}
@media (max-width:640px){
  .ayCard{bottom:0;left:0;right:0;width:100%;transform:translateY(24px);border-radius:20px 20px 0 0;max-height:72vh;
    padding-bottom:env(safe-area-inset-bottom,0px)}
  .ayCard.on{transform:none}
  .ayTit h3{font-size:19px}
  .ayPie .b{padding:9px 12px}
}
@media (prefers-reduced-motion:reduce){.ayBtn.nuevo:after,.ayFoco{animation:none}.ayCard,.ayBur{transition:none}}`;
document.head.appendChild(css);

/* ------------------------------ el botón ------------------------------ */
const ROT = {
  btn:{es:"Cómo usar el mapa", en:"How to use the map", fr:"Comment utiliser la carte"},
  bur:{es:"<b>¿Primera vez?</b> Aquí aprendes a mover el mapa, ver el 3D y descargar el PDF.", en:"<b>First time?</b> Learn here how to move the map, use 3D and download the PDF.", fr:"<b>Première fois ?</b> Apprenez ici à bouger la carte, voir la 3D et télécharger le PDF."},
  eyebrow:{es:"Cómo usar el mapa", en:"How to use the map", fr:"Utiliser la carte"},
  de:{es:"de", en:"of", fr:"sur"},
  ant:{es:"Anterior", en:"Back", fr:"Précédent"},
  sig:{es:"Siguiente", en:"Next", fr:"Suivant"},
  fin:{es:"Listo", en:"Done", fr:"Terminé"},
  cel:{es:"Celular", en:"Phone", fr:"Mobile"},
  pc:{es:"Computador", en:"Computer", fr:"Ordinateur"},
  cerrar:{es:"Cerrar", en:"Close", fr:"Fermer"},
  wa:{es:"¿Dudas? Escríbenos por WhatsApp", en:"Questions? Message us on WhatsApp", fr:"Des questions ? Écrivez-nous sur WhatsApp"}
};
const btn = document.createElement("button");
btn.className = "ayBtn"; btn.type = "button"; btn.textContent = "?";
main.appendChild(btn);
const visto = leer("laureles.ayuda") === "1";
if(!visto) btn.classList.add("nuevo");
function rotularBtn(){ btn.title = tx(ROT.btn); btn.setAttribute("aria-label", tx(ROT.btn)); }
rotularBtn();

/* va debajo de los mandos de MapLibre (+, −, brújula, ubicación); si no se
   ven —en el 3D el lienzo los tapa— queda arriba a la derecha */
function colocar(){
  const rm = main.getBoundingClientRect();
  const col = document.querySelector(".maplibregl-ctrl-top-right");
  let top = 10, der = 10;
  const tam = btn.offsetWidth || 32;
  /* centrado con la columna de MapLibre y con aire debajo de la ubicación */
  if(col && !es3d()){ const r = col.getBoundingClientRect();
    if(r.height){ top = Math.round(r.bottom - rm.top + 10);
      const g = col.querySelectorAll(".maplibregl-ctrl"), u = g.length ? g[g.length-1].getBoundingClientRect() : r;
      if(u.width) der = Math.max(4, Math.round(rm.right - (u.left + u.width/2) - tam/2)); } }
  /* con la ficha del lote abierta a la derecha (computador), el botón se corre
     a su lado izquierdo para no tapar el precio ni el botón de cerrar */
  const fi = document.getElementById("ficha");
  if(fi && fi.classList.contains("on")){
    const rf = fi.getBoundingClientRect();
    if(rf.width && rf.height && rf.left > rm.left + rm.width*0.4 && rf.top < rm.top + top + 50){
      der = Math.round(rm.right - rf.left + 10); top = 10; }
  }
  btn.style.top = top + "px"; btn.style.right = der + "px";
  if(bur){ bur.style.top = (top - 6) + "px"; bur.style.right = (der + tam + 12) + "px"; }
}
let bur = null;
function burbuja(){
  if(visto || bur) return;
  bur = document.createElement("div"); bur.className = "ayBur"; bur.innerHTML = tx(ROT.bur);
  bur.onclick = ()=>abrir(0);
  main.appendChild(bur); colocar();
  requestAnimationFrame(()=>bur && bur.classList.add("on"));
  setTimeout(quitarBur, 9000);
}
function quitarBur(){ if(!bur) return; const b=bur; bur=null; b.classList.remove("on"); setTimeout(()=>b.remove(), 600); }
addEventListener("resize", colocar);
/* el 3D se prende y se apaga con su botón: hay que recolocar */
const b3d = document.getElementById("b3d");
if(b3d) b3d.addEventListener("click", ()=>setTimeout(colocar, 60));
setTimeout(colocar, 300); setTimeout(colocar, 1500);
const fichaEl = document.getElementById("ficha");
if(fichaEl && window.MutationObserver) new MutationObserver(()=>{ colocar(); setTimeout(colocar, 450); })
  .observe(fichaEl, {attributes:true, attributeFilter:["class"]});
/* la burbuja sale cuando el mapa ya está a la vista (después de la portada) */
(function vigilar(){
  let n=0; const t=setInterval(()=>{
    n++; const r = main.getBoundingClientRect();
    const tapado = document.elementFromPoint(r.right-30, r.top+Math.min(200, r.height/2));
    const libre = tapado && main.contains(tapado);
    if(libre){ clearInterval(t); colocar(); setTimeout(burbuja, 1800); }
    if(n>240) clearInterval(t);
  }, 500);
})();

/* ------------------------------ la tarjeta ------------------------------ */
let card = null, paso = 0, disp = null, focos = [];
function limpiarFocos(){ focos.forEach(e=>e.classList.remove("ayFoco")); focos=[]; }
function enfocar(){
  limpiarFocos();
  const p = PASOS[paso]; if(!p.foco) return;
  p.foco().forEach(q=>{ const e=document.querySelector(q);
    if(e && e.offsetParent!==null && e.getBoundingClientRect().width){ e.classList.add("ayFoco"); focos.push(e); } });
}
function pintar(){
  if(!card) return;
  const p = PASOS[paso], N = PASOS.length;
  const usa = disp || (tactil() ? "cel" : "pc");
  const lista = p.todo || (usa==="cel" ? p.cel : p.pc);
  card.querySelector(".ayHead small").textContent = tx(ROT.eyebrow)+" · "+(paso+1)+" "+tx(ROT.de)+" "+N;
  card.querySelector(".ayX").setAttribute("aria-label", tx(ROT.cerrar));
  card.querySelector(".ayCuerpo").innerHTML =
    '<div class="ayTit"><span class="ic">'+ico(p.i)+'</span><h3 id="ayTitulo">'+tx(p.t)+'</h3></div>'+
    '<p class="ayD">'+tx(p.d)+'</p>'+
    (p.cel ? '<div class="ayDisp" role="tablist"><button data-d="cel" role="tab" aria-selected="'+(usa==="cel")+'"'+(usa==="cel"?' class="on"':'')+'>'+tx(ROT.cel)+'</button>'+
             '<button data-d="pc" role="tab" aria-selected="'+(usa==="pc")+'"'+(usa==="pc"?' class="on"':'')+'>'+tx(ROT.pc)+'</button></div>' : '')+
    '<ul class="ayLista">'+lista.map(([k,o])=>'<li><span class="ic">'+ico(k)+'</span><span>'+tx(o)+'</span></li>').join("")+'</ul>'+
    (p.hacer ? '<button class="ayPrueba" type="button">'+ico("dedo").replace('width="20" height="20"','width="16" height="16"')+tx(p.accion)+'</button>' : '')+
    (paso===N-1 && window.abrirWhatsApp ? '<div><button class="ayPrueba ayWa" type="button" style="background:#E7F2EA;border-color:#2E7D4F;color:#245F3C">'+ico("wa").replace('width="20" height="20"','width="16" height="16"')+tx(ROT.wa)+'</button></div>' : '');
  card.querySelector(".ayPuntos").innerHTML = PASOS.map((q,i)=>'<button aria-label="'+(i+1)+'. '+tx(q.t)+'"'+(i===paso?' class="on" aria-current="step"':'')+' data-i="'+i+'"></button>').join("");
  const ant = card.querySelector(".ayAnt"), sig = card.querySelector(".aySig");
  ant.textContent = tx(ROT.ant); ant.style.visibility = paso ? "visible" : "hidden";
  sig.textContent = paso===N-1 ? tx(ROT.fin) : tx(ROT.sig);
  card.querySelectorAll(".ayDisp button").forEach(b=>b.onclick=()=>{ disp=b.dataset.d; pintar(); });
  card.querySelectorAll(".ayPuntos button").forEach(b=>b.onclick=()=>{ paso=+b.dataset.i; pintar(); });
  const pr = card.querySelector(".ayPrueba:not(.ayWa)"); if(pr) pr.onclick = ()=>{ try{ p.hacer(); }catch(e){} };
  const wa = card.querySelector(".ayWa"); if(wa) wa.onclick = ()=>{ try{ abrirWhatsApp("Hola, estoy viendo el mapa de Laureles Campestre y tengo una pregunta."); }catch(e){} };
  enfocar();
}
function abrir(i){
  quitarBur(); btn.classList.remove("nuevo"); anotar("laureles.ayuda","1");
  paso = Math.max(0, Math.min(PASOS.length-1, i||0));
  if(!card){
    card = document.createElement("div"); card.className = "ayCard";
    card.setAttribute("role","dialog"); card.setAttribute("aria-labelledby","ayTitulo");
    card.innerHTML = '<div class="ayHead"><small></small><button class="ayX" type="button">×</button></div>'+
      '<div class="ayCuerpo"></div>'+
      '<div class="ayPie"><div class="ayPuntos"></div><button class="b sec ayAnt" type="button"></button><button class="b pri aySig" type="button"></button></div>';
    document.body.appendChild(card);
    card.querySelector(".ayX").onclick = cerrar;
    card.querySelector(".ayAnt").onclick = ()=>{ if(paso>0){ paso--; pintar(); } };
    card.querySelector(".aySig").onclick = ()=>{ if(paso<PASOS.length-1){ paso++; pintar(); } else cerrar(); };
  }
  pintar();
  requestAnimationFrame(()=>card && card.classList.add("on"));
  setTimeout(()=>{ const s=card&&card.querySelector(".aySig"); if(s) s.focus({preventScroll:true}); }, 50);
}
function cerrar(){
  limpiarFocos();
  if(!card) return; const c=card; card=null;
  c.classList.remove("on"); setTimeout(()=>c.remove(), 300);
  btn.focus({preventScroll:true});
}
btn.onclick = ()=> card ? cerrar() : abrir(0);
addEventListener("keydown", e=>{
  if(!card) return;
  if(e.key==="Escape"){ e.stopPropagation(); cerrar(); }
  else if(e.key==="ArrowRight" && paso<PASOS.length-1){ paso++; pintar(); }
  else if(e.key==="ArrowLeft" && paso>0){ paso--; pintar(); }
}, true);

/* si cambian el idioma con la tarjeta abierta, se repinta en el nuevo */
document.querySelectorAll(".idioma button,.langs button").forEach(b=>b.addEventListener("click", ()=>setTimeout(()=>{ rotularBtn(); if(card) pintar(); if(bur) bur.innerHTML=tx(ROT.bur); }, 50)));

window.AYUDA = { abrir, cerrar, pasos:()=>PASOS.length, paso:()=>paso, colocar };
})();
