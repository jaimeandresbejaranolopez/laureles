/* =============================================================================
   Laureles Campestre — PORTADA COMERCIAL
   La bienvenida (#welcome) deja de ser una tarjeta sola sobre el mapa y pasa a
   ser una página que se recorre hacia abajo: la tarjeta de bienvenida queda
   arriba, sobre la foto, y debajo van el proyecto, el urbanismo, el estilo de
   vida, las etapas con sus precios, la ubicación y el contacto. El botón
   "Comenzar el recorrido" sigue siendo el mismo (con su puerta de registro).

   DE DÓNDE SALE CADA DATO (nada inventado):
     · lotes, áreas y precios ..... lotes.js (LAURELES) + PRECIO_UTIL/PRECIO_PROT
                                     e INICIAL/SEPARACION/PLAN_* de index.html
     · áreas comunes ............... plano 039 (mismas cifras de armazon.js)
     · protección y cuadro ......... plano 038 (08/09/2026)
     · perfil vial ................. croquis de Jaime Bejarano (24/09/2026):
                                     calzada 6 m, antejardín 0,5 m y andén 1,5 m
                                     a cada lado, ciclorruta 1,5 m a un costado,
                                     bolardos de máximo 1 m
     · tiempos ..................... window.POIS
     · escritura y entrega ......... indicación del proyecto (100 % de la
                                     tierra, no proindiviso; urbanismo dic 2028)
   Las imágenes de gimnasio, zona infantil, pádel y ciclorruta son REFERENCIAS
   DE ESTILO DE VIDA y así se rotulan: no son diseños aprobados del proyecto.
   ============================================================================= */
(function(){
"use strict";
const wel = document.getElementById("welcome");
if(!wel) return;
const M = window.MEDIOS || {};
const IMG = k => M[k] || ("medios/"+k+".jpg");
const lang = () => (window.ANALISIS && ANALISIS.lang) ? ANALISIS.lang() : "es";

/* ---------- cifras calculadas de los datos, no escritas a mano ---------- */
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
  return { n:F.length, amin:a[0], amax:a[a.length-1], et,
           sep:(typeof SEPARACION!=="undefined")?SEPARACION:null,
           planN:(typeof PLAN_N!=="undefined")?PLAN_N:null,
           planP:(typeof PLAN_PCT!=="undefined")?PLAN_PCT:null };
}
const miles = n => Math.round(n).toLocaleString("es-CO");
const millones = (n,l) => {
  const v = n/1e6, s = (v>=1000 ? (v/1000).toFixed(2).replace(".",",")+" mil" : Math.round(v).toLocaleString("es-CO"));
  return l==="en" ? "COP "+(v>=1000?(v/1000).toFixed(2)+" bn":Math.round(v).toLocaleString("en-US")+" M")
                  : "$"+s+(v>=1000?" M":" M");
};

/* ---------- textos ---------- */
const TX = {
 es:{
  bar:"Ver disponibilidad", wa:"WhatsApp", mas:"Conoce el proyecto",
  s1e:"El proyecto", s1t:"Tierra propia en el paisaje cafetero",
  s1p:"Laureles Campestre es una parcelación de lotes campestres en El Caimo, Armenia, sobre una ladera cafetera atravesada por una cañada de bosque protegido. Lotes grandes, baja densidad y vista abierta a la cordillera, a minutos de la ciudad y del aeropuerto.",
  c:[["lotes campestres"],["el más pequeño"],["el más grande"],["de predio"],["de bosque protegido"],["lotes por hectárea"]],
  escT:"Escritura individual", escF:"100 % de la tierra", escD:"Cada lote se escritura a nombre del comprador. No es proindiviso.",
  entT:"Entrega del urbanismo", entF:"Diciembre de 2028", entD:"Fecha de entrega final de las obras de urbanismo.",
  s2e:"Fotos reales del predio", s2t:"Lo que ya está ahí",
  s2p:"Estas fotos son del terreno tal como es hoy: el bosque de la cañada, los guayacanes, las praderas y la cordillera al fondo.",
  fotos:[["canada","El corredor de bosque de la cañada"],["cordillera","La cordillera desde el remate alto"],["guayacan","Guayacán en el predio"],["praderas","Praderas con arbolado grande"],["bosque","Bosque y cafetal en el borde del predio"]],
  s3e:"Urbanismo", s3t:"Una sola entrada, un anillo vial y tiempo afuera",
  s3p:"Portería con plazoleta de acceso y un anillo vial que llega a todos los lotes. La iluminación es baja, con bolardos de máximo 1 m, para que la noche siga siendo de campo.",
  perfilT:"Perfil vial típico", perfilN:"Medidas en metros. Ciclorruta a un costado de la vía.",
  lab:{lote:"Lote",ciclo:"Ciclorruta",anden:"Andén",ante:"Antejardín",via:"Calzada",bol:"Bolardo ≤ 1 m"},
  com:[["3","áreas sociales","1.190, 718 y 2.254 m²"],["10 × 20 m","cancha",""],["2.510 m²","sendero de circulación",""],["82","parqueaderos de visitantes",""]],
  refVia:"Imagen de referencia del perfil vial",
  s4e:"Estilo de vida", s4t:"La vida que se imagina aquí",
  s4p:"Deporte con vista a la cordillera, niños al aire libre y calles para caminar y montar en bicicleta.",
  refs:[["vida_ciclorruta","Ciclorruta"],["vida_infantil","Juegos para niños"],["vida_gimnasio","Gimnasio abierto al paisaje"],["vida_padel","Pádel"]],
  refNota:"Imágenes de referencia de estilo de vida. No son diseños aprobados del proyecto ni forman parte de la oferta.",
  s5e:"Etapas y precios", s5t:"Mientras antes, mejor precio",
  s5p:"El precio de cada lote es su área útil por el valor del m² útil de la etapa, más su área de protección por el valor del m² de protección.",
  etD:{1:"De contado · 20 % menos que la lista",2:"60 % en 2026 · 10 % menos",3:"50 % en 2026 · 5 % menos",4:"Precio de lista · 20 % en 2026",5:"Lista + 10 % · 20 % en 2026",6:"Lista + 20 % · 20 % en 2026"},
  desde:"desde", hasta:"hasta", mu:"m² útil", mp:"m² protección",
  pagoT:"Así se paga", pago:(d)=>[
    "Separas con "+(d.sep?"$"+miles(d.sep):"—")+".",
    "La inicial de la etapa se completa en 2026.",
    "El saldo va en "+(d.planN||"—")+" cuotas del "+(d.planP?Math.round(d.planP*100):"—")+" % del saldo, de enero de 2027 a noviembre de 2028, y una cuota final en diciembre de 2028.",
    "Sin intereses."],
  precNota:"Precios en pesos colombianos, sujetos a disponibilidad y a cambio. El precio exacto de cada lote está en su ficha, en el plano.",
  s6e:"Ubicación", s6t:"El Caimo, Armenia",
  s6p:"Cerca de todo lo que importa, lejos del ruido.",
  finT:"Escoge tu lote", finP:"En el plano ves cada lote con su precio, su forma de pago, el relieve en 3D y el recorrido del sol.",
  bLotes:"Ver disponibilidad en vivo", bWa:"Escribir por WhatsApp", bVis:"Agendar visita",
  waTxt:"Hola, quiero información de Laureles Campestre (El Caimo, Armenia)."
 },
 en:{
  bar:"See availability", wa:"WhatsApp", mas:"Discover the project",
  s1e:"The project", s1t:"Your own land in coffee country",
  s1p:"Laureles Campestre is a subdivision of country lots in El Caimo, Armenia, on a coffee-country hillside crossed by a protected wooded ravine. Large lots, low density and open views of the mountains, minutes from the city and the airport.",
  c:[["country lots"],["smallest"],["largest"],["property"],["protected woodland"],["lots per hectare"]],
  escT:"Individual title deed", escF:"100% of the land", escD:"Each lot is deeded in the buyer's name. Not shared undivided ownership.",
  entT:"Site works handover", entF:"December 2028", entD:"Final handover date of the site works.",
  s2e:"Real photos of the property", s2t:"What is already there",
  s2p:"These photos show the land as it is today: the ravine woodland, the guayacán trees, the pastures and the mountains beyond.",
  fotos:[["canada","The wooded corridor of the ravine"],["cordillera","The mountains from the high end"],["guayacan","Guayacán tree on the property"],["praderas","Pasture with mature trees"],["bosque","Woodland and coffee at the edge of the property"]],
  s3e:"Site plan", s3t:"One gate, one road loop, and time outdoors",
  s3p:"A gatehouse with an entrance plaza and a road loop that reaches every lot. Lighting is low, with bollards no taller than 1 m, so the night stays country.",
  perfilT:"Typical road section", perfilN:"Dimensions in metres. Bike lane on one side of the road.",
  lab:{lote:"Lot",ciclo:"Bike lane",anden:"Sidewalk",ante:"Planting strip",via:"Roadway",bol:"Bollard ≤ 1 m"},
  com:[["3","social areas","1,190, 718 and 2,254 m²"],["10 × 20 m","sports court",""],["2,510 m²","walking path",""],["82","visitor parking spaces",""]],
  refVia:"Reference image of the road section",
  s4e:"Lifestyle", s4t:"The life you can picture here",
  s4p:"Sport with mountain views, children outdoors and streets to walk and ride.",
  refs:[["vida_ciclorruta","Bike lane"],["vida_infantil","Children's play"],["vida_gimnasio","Gym open to the landscape"],["vida_padel","Padel"]],
  refNota:"Lifestyle reference images. They are not approved project designs and are not part of the offer.",
  s5e:"Stages and prices", s5t:"The earlier, the better the price",
  s5p:"Each lot's price is its usable area times the stage's usable m² value, plus its protected area times the protected m² value.",
  etD:{1:"Cash · 20% below list",2:"60% in 2026 · 10% off",3:"50% in 2026 · 5% off",4:"List price · 20% in 2026",5:"List + 10% · 20% in 2026",6:"List + 20% · 20% in 2026"},
  desde:"from", hasta:"to", mu:"usable m²", mp:"protected m²",
  pagoT:"How payment works", pago:(d)=>[
    "Reserve with COP "+(d.sep?Math.round(d.sep).toLocaleString("en-US"):"—")+".",
    "The stage's down payment is completed in 2026.",
    "The balance is paid in "+(d.planN||"—")+" instalments of "+(d.planP?Math.round(d.planP*100):"—")+"% of the balance, January 2027 to November 2028, plus a final instalment in December 2028.",
    "No interest."],
  precNota:"Prices in Colombian pesos, subject to availability and change. Each lot's exact price is on its card in the plan.",
  s6e:"Location", s6t:"El Caimo, Armenia",
  s6p:"Close to what matters, away from the noise.",
  finT:"Choose your lot", finP:"In the plan you see every lot with its price, payment plan, 3D terrain and sun path.",
  bLotes:"See live availability", bWa:"Message on WhatsApp", bVis:"Book a visit",
  waTxt:"Hi, I would like information about Laureles Campestre (El Caimo, Armenia)."
 },
 fr:{
  bar:"Voir la disponibilité", wa:"WhatsApp", mas:"Découvrir le projet",
  s1e:"Le projet", s1t:"Votre terre dans le paysage du café",
  s1p:"Laureles Campestre est un lotissement de terrains de campagne à El Caimo, Armenia, sur un versant caféier traversé par un ravin boisé protégé. Grands terrains, faible densité et vue dégagée sur la cordillère, à quelques minutes de la ville et de l'aéroport.",
  c:[["terrains de campagne"],["le plus petit"],["le plus grand"],["de terrain"],["de forêt protégée"],["terrains par hectare"]],
  escT:"Acte individuel", escF:"100 % du terrain", escD:"Chaque terrain est inscrit au nom de l'acheteur. Pas d'indivision.",
  entT:"Livraison de l'aménagement", entF:"Décembre 2028", entD:"Date de livraison finale des travaux d'aménagement.",
  s2e:"Photos réelles du terrain", s2t:"Ce qui est déjà là",
  s2p:"Ces photos montrent le terrain tel qu'il est aujourd'hui : la forêt du ravin, les guayacanes, les prairies et la cordillère au fond.",
  fotos:[["canada","Le corridor boisé du ravin"],["cordillera","La cordillère depuis le point haut"],["guayacan","Guayacán sur le terrain"],["praderas","Prairies avec de grands arbres"],["bosque","Bois et caféiers en bordure du terrain"]],
  s3e:"Aménagement", s3t:"Une seule entrée, une boucle et du temps dehors",
  s3p:"Une loge avec placette d'accès et une boucle routière qui dessert chaque terrain. Éclairage bas, par bornes de 1 m maximum, pour que la nuit reste campagnarde.",
  perfilT:"Profil type de la voie", perfilN:"Cotes en mètres. Piste cyclable d'un côté de la voie.",
  lab:{lote:"Terrain",ciclo:"Piste cyclable",anden:"Trottoir",ante:"Bande plantée",via:"Chaussée",bol:"Borne ≤ 1 m"},
  com:[["3","espaces communs","1 190, 718 et 2 254 m²"],["10 × 20 m","terrain de sport",""],["2 510 m²","sentier",""],["82","places visiteurs",""]],
  refVia:"Image de référence du profil de la voie",
  s4e:"Art de vivre", s4t:"La vie que l'on imagine ici",
  s4p:"Du sport face à la cordillère, des enfants au grand air et des rues pour marcher et pédaler.",
  refs:[["vida_ciclorruta","Piste cyclable"],["vida_infantil","Jeux d'enfants"],["vida_gimnasio","Salle de sport ouverte sur le paysage"],["vida_padel","Padel"]],
  refNota:"Images de référence d'art de vivre. Ce ne sont pas des conceptions approuvées du projet ni une partie de l'offre.",
  s5e:"Étapes et prix", s5t:"Plus tôt, meilleur prix",
  s5p:"Le prix de chaque terrain est sa surface utile fois la valeur du m² utile de l'étape, plus sa surface protégée fois la valeur du m² protégé.",
  etD:{1:"Comptant · 20 % sous la liste",2:"60 % en 2026 · −10 %",3:"50 % en 2026 · −5 %",4:"Prix de liste · 20 % en 2026",5:"Liste + 10 % · 20 % en 2026",6:"Liste + 20 % · 20 % en 2026"},
  desde:"dès", hasta:"jusqu'à", mu:"m² utile", mp:"m² protégé",
  pagoT:"Modalités de paiement", pago:(d)=>[
    "Réservation avec "+(d.sep?miles(d.sep)+" COP":"—")+".",
    "L'apport de l'étape est complété en 2026.",
    "Le solde est réglé en "+(d.planN||"—")+" mensualités de "+(d.planP?Math.round(d.planP*100):"—")+" % du solde, de janvier 2027 à novembre 2028, plus une dernière échéance en décembre 2028.",
    "Sans intérêts."],
  precNota:"Prix en pesos colombiens, sous réserve de disponibilité et de modification. Le prix exact de chaque terrain figure sur sa fiche, dans le plan.",
  s6e:"Situation", s6t:"El Caimo, Armenia",
  s6p:"Près de l'essentiel, loin du bruit.",
  finT:"Choisissez votre terrain", finP:"Dans le plan, chaque terrain avec son prix, son plan de paiement, le relief en 3D et la course du soleil.",
  bLotes:"Voir la disponibilité en direct", bWa:"Écrire sur WhatsApp", bVis:"Planifier une visite",
  waTxt:"Bonjour, je souhaite des informations sur Laureles Campestre (El Caimo, Armenia)."
 }
};

/* ---------- perfil vial dibujado a escala (croquis del 24/09/2026) ---------- */
function perfilSVG(t){
  /* de izquierda a derecha: lote | ciclorruta 1,5 | andén 1,5 | antejardín 0,5 | calzada 6 | antejardín 0,5 | andén 1,5 | lote */
  const L = t.lab;
  const tr = [["lote",1.6],["ciclo",1.5],["anden",1.5],["ante",0.5],["via",6],["ante",0.5],["anden",1.5],["lote",1.6]];
  const E = 58, x0 = 16, yA = 118, yV = 132;               /* 58 px por metro; la calzada va 0,15 m abajo */
  const W = x0*2 + tr.reduce((s,a)=>s+a[1],0)*E;
  const col = {lote:"#8FA27E", ciclo:"#B5653E", anden:"#CFC8B6", ante:"#6F8F5C", via:"#3A3F39"};
  let x = x0, g = "", cot = "", tx = "";
  tr.forEach(([k,m],i)=>{
    const w = m*E, y = k==="via" ? yV : yA, h = k==="lote" ? 14 : (k==="via" ? 18 : 30);
    g += `<rect x="${x.toFixed(1)}" y="${y}" width="${w.toFixed(1)}" height="${h}" fill="${col[k]}"/>`;
    if(k==="via") g+=`<rect x="${(x+w/2-1.5).toFixed(1)}" y="${yV}" width="3" height="3" fill="#F4F2EA" opacity=".9"/>`;
    if(k!=="lote"){
      cot += `<line x1="${x.toFixed(1)}" y1="186" x2="${(x+w).toFixed(1)}" y2="186" class="pc"/>`+
             `<line x1="${x.toFixed(1)}" y1="180" x2="${x.toFixed(1)}" y2="192" class="pc"/><line x1="${(x+w).toFixed(1)}" y1="180" x2="${(x+w).toFixed(1)}" y2="192" class="pc"/>`+
             `<text x="${(x+w/2).toFixed(1)}" y="212" class="pn">${String(m).replace(".",",")}</text>`;
      const ly = (k==="ante") ? 56 : 96;
      tx += `<text x="${(x+w/2).toFixed(1)}" y="${ly}" class="pl">${L[k]}</text>`;
      
    }else{
      tx += `<text x="${(x+w/2).toFixed(1)}" y="${yA-10}" class="pl pm">${L.lote}</text>`;
    }
    if(k==="ante"){ /* bolardo */
      g += `<rect x="${(x+w/2-4).toFixed(1)}" y="${yA-40}" width="8" height="40" rx="2" fill="#2A241D"/>`+
           `<rect x="${(x+w/2-4).toFixed(1)}" y="${yA-40}" width="8" height="6" rx="2" fill="#E9C77B"/>`;
    }
    x += w;
  });
  /* línea de terreno */
  g += `<line x1="${x0}" y1="${yA+30}" x2="${W-x0}" y2="${yA+30}" stroke="#2A241D" stroke-width="1" opacity=".25"/>`;
  return `<svg class="ptPerfil" viewBox="0 0 ${W.toFixed(0)} 226" role="img" aria-label="${t.perfilT}">
    <style>.pc{stroke:var(--pt-ink-2);stroke-width:1}.pn{font:600 17px var(--sans);fill:var(--pt-ink);text-anchor:middle;font-variant-numeric:tabular-nums}
    .pl{font:600 15px var(--sans);fill:var(--pt-ink-2);text-anchor:middle;letter-spacing:.02em}.pm{fill:var(--pt-muted)}</style>
    ${g}${cot}${tx}
    <text x="${(W-x0).toFixed(0)}" y="26" class="pl pm" style="text-anchor:end">${L.bol}</text></svg>`;
}

/* ---------- armado ---------- */
function html(){
  const l = TX[lang()] ? lang() : "es", t = TX[l], d = datos();
  const c = [
    [String(d.n||86)], [miles(d.amin||3100)+" m²"], [miles(d.amax||9907)+" m²"], ["37 ha"], ["28.695 m²"], ["2,3"]
  ];
  if(l==="en"){ c[1]=[(d.amin||3100).toLocaleString("en-US")+" m²"]; c[2]=[(d.amax||9907).toLocaleString("en-US")+" m²"]; c[4]=["28,695 m²"]; c[5]=["2.3"]; }
  const poi = (window.POIS||[]).map(([n,dd,m])=>{
    const T = s => (window.ANALISIS ? ANALISIS.T(s) : s);
    return `<li><div><b>${T(n)}</b><span>${T(dd)}</span></div><em>${T(m)}</em></li>`; }).join("");
  const precio = (v)=> l==="en" ? "COP "+Math.round(v/1e6).toLocaleString("en-US")+" M" : "$"+Math.round(v/1e6).toLocaleString("es-CO")+" M";
  const et = d.et.map(e=>`
    <div class="ptEt${e.n===1?" ptEt1":""}">
      <div class="ptEtH"><b>E${e.n}</b><span>${t.etD[e.n]}</span></div>
      <div class="ptEtP"><small>${t.desde}</small><strong>${precio(e.min)}</strong><small>${t.hasta} ${precio(e.max)}</small></div>
      <div class="ptEtM"><span>${t.mu} <b>${l==="en"?"COP "+e.mu.toLocaleString("en-US"):"$"+miles(e.mu)}</b></span><span>${t.mp} <b>${l==="en"?"COP "+e.mp.toLocaleString("en-US"):"$"+miles(e.mp)}</b></span></div>
    </div>`).join("");
  return `
  <div class="ptBar" id="ptBar" aria-hidden="true">
    <img src="${IMG("logo")}" alt="Laureles Campestre">
    <div class="ptBarB"><button class="ptWa" data-pt="wa">${t.wa}</button><button class="ptPri" data-pt="lotes">${t.bar}</button></div>
  </div>
  <div class="ptCuerpo">
  <section class="ptSec" id="ptProyecto">
    <div class="ptIn ptDos">
      <div><div class="ptEb">${t.s1e}</div><h2>${t.s1t}</h2><p class="ptLead">${t.s1p}</p></div>
      <div class="ptCifras">${c.map((v,i)=>`<div><b>${v[0]}</b><span>${t.c[i][0]}</span></div>`).join("")}</div>
    </div>
    <div class="ptIn ptHitos">
      <div class="ptHito"><span>${t.escT}</span><b>${t.escF}</b><p>${t.escD}</p></div>
      <div class="ptHito"><span>${t.entT}</span><b>${t.entF}</b><p>${t.entD}</p></div>
    </div>
  </section>

  <section class="ptSec ptOsc">
    <div class="ptIn"><div class="ptEb">${t.s2e}</div><h2>${t.s2t}</h2><p class="ptLead">${t.s2p}</p></div>
    <div class="ptIn ptFotos">${t.fotos.map(([k,cap],i)=>`<figure class="${i===0?"ptF1":""}"><img loading="lazy" src="${IMG(k)}" alt="${cap}"><figcaption>${cap}</figcaption></figure>`).join("")}</div>
  </section>

  <section class="ptSec">
    <div class="ptIn"><div class="ptEb">${t.s3e}</div><h2>${t.s3t}</h2><p class="ptLead">${t.s3p}</p></div>
    <div class="ptIn ptVia">
      <div class="ptPerfilBox"><h3>${t.perfilT}</h3>${perfilSVG(t)}<p class="ptNota">${t.perfilN}</p></div>
      <figure class="ptRef"><img loading="lazy" src="${IMG("vida_perfil_vial")}" alt="${t.refVia}"><figcaption>${t.refVia}</figcaption></figure>
    </div>
    <div class="ptIn ptCom">${t.com.map(([n,a,b])=>`<div><b>${n}</b><span>${a}</span>${b?`<em>${b}</em>`:""}</div>`).join("")}</div>
  </section>

  <section class="ptSec ptCrema">
    <div class="ptIn"><div class="ptEb">${t.s4e}</div><h2>${t.s4t}</h2><p class="ptLead">${t.s4p}</p></div>
    <div class="ptIn ptVida">${t.refs.map(([k,cap],i)=>`<figure class="ptV${i}"><img loading="lazy" src="${IMG(k)}" alt="${cap}"><figcaption><b>${cap}</b><i>${l==="en"?"Reference image":(l==="fr"?"Image de référence":"Imagen de referencia")}</i></figcaption></figure>`).join("")}</div>
    <div class="ptIn"><p class="ptNota ptNotaRef">${t.refNota}</p></div>
  </section>

  <section class="ptSec" id="ptPrecios">
    <div class="ptIn"><div class="ptEb">${t.s5e}</div><h2>${t.s5t}</h2><p class="ptLead">${t.s5p}</p></div>
    <div class="ptIn ptEtapas">${et}</div>
    <div class="ptIn ptPago"><h3>${t.pagoT}</h3><ol>${t.pago(d).map(p=>`<li>${p}</li>`).join("")}</ol><p class="ptNota">${t.precNota}</p></div>
  </section>

  <section class="ptSec ptOsc ptUbic">
    <div class="ptIn ptDos">
      <div><div class="ptEb">${t.s6e}</div><h2>${t.s6t}</h2><p class="ptLead">${t.s6p}</p><ul class="ptPoi">${poi}</ul></div>
      <figure class="ptUbF"><img loading="lazy" src="${IMG("cordillera")}" alt=""></figure>
    </div>
  </section>

  <section class="ptSec ptFin">
    <div class="ptIn ptFinIn">
      <img src="${IMG("logo")}" alt="Laureles Campestre">
      <h2>${t.finT}</h2><p class="ptLead">${t.finP}</p>
      <div class="ptBotones">
        <button class="ptPri" data-pt="lotes">${t.bLotes}</button>
        <button class="ptSec2" data-pt="wa">${t.bWa}</button>
        <button class="ptSec2" data-pt="visita">${t.bVis}</button>
      </div>
    </div>
  </section>
  </div>`;
}

let raiz = null;
function pintar(){
  if(!raiz) return;
  const y = wel.scrollTop;
  raiz.innerHTML = html();
  wel.scrollTop = y;
  const mas=document.getElementById("ptMas");
  if(mas) mas.firstChild.nodeValue=(TX[lang()]||TX.es).mas+" ";
  raiz.querySelectorAll("[data-pt]").forEach(b=>b.addEventListener("click", ev=>{
    const a = b.dataset.pt;
    if(a==="mas"){ ev.preventDefault(); const s=document.getElementById("ptProyecto"); if(s) wel.scrollTo({top:s.offsetTop-8, behavior:"smooth"}); return; }
    if(a==="lotes"){ const sb=document.getElementById("startBtn"); if(sb) sb.click(); return; }
    if(a==="wa"){ const t=TX[lang()]||TX.es; if(typeof window.abrirWhatsApp==="function") window.abrirWhatsApp(t.waTxt); return; }
    if(a==="visita"){ if(typeof ACCESO!=="undefined" && ACCESO.agenda) ACCESO.agenda();
                      else { const bv=document.getElementById("bVisita"); if(bv) bv.click(); } }
  }));
}

function montar(){
  if(wel.classList.contains("conPortada")) return;
  wel.classList.add("conPortada");
  const card = wel.querySelector(".wel");
  const hero = document.createElement("section");
  hero.className = "ptHero";
  hero.style.backgroundImage = "linear-gradient(180deg,rgba(18,24,17,.10) 0%,rgba(18,24,17,.30) 55%,rgba(18,24,17,.72) 100%),url('"+IMG("hero")+"')";
  if(card) hero.appendChild(card);
  const mas=document.createElement("a");
  mas.className="ptMas"; mas.id="ptMas"; mas.href="#ptProyecto";
  mas.innerHTML='x <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 5v14M6 13l6 6 6-6"/></svg>';
  mas.addEventListener("click", ev=>{ ev.preventDefault(); const s=document.getElementById("ptProyecto"); if(s) wel.scrollTo({top:s.offsetTop-8, behavior:"smooth"}); });
  hero.appendChild(mas);
  wel.insertBefore(hero, wel.firstChild);
  raiz = document.createElement("div");
  raiz.className = "ptRaiz";
  wel.appendChild(raiz);
  pintar();
  /* la barra fija aparece cuando la tarjeta sale de la vista */
  wel.addEventListener("scroll", ()=>{
    const b = document.getElementById("ptBar"); if(!b) return;
    const on = wel.scrollTop > hero.offsetHeight*0.7;
    b.classList.toggle("on", on); b.setAttribute("aria-hidden", on?"false":"true");
  }, {passive:true});
  /* cambio de idioma: los botones del armazón ya cambian ANALISIS; aquí solo se repinta */
  document.addEventListener("click", ev=>{
    if(ev.target.closest(".langs button, .idioma button")) setTimeout(pintar, 30);
  });
}
if(document.readyState==="loading") document.addEventListener("DOMContentLoaded", montar); else montar();
window.PORTADA = { pintar, datos };
})();
