/* Generado desde el plano vivo por gen_analisis.py — no editar a mano.
   Idioma + Casa 30JB + análisis del lote + fichas PDF (portada, técnica,
   isométrico solar, horas por fachada, comercial).
   Va encerrado en una función para no chocar con los nombres del mapa. */
(function(){
"use strict";
const EXT = window.__ANL_EXT;
const DATA=EXT.DATA, PX=EXT.PX, lat0=EXT.lat0, lon0=EXT.lon0,
      EST=EXT.EST, ETAPAS=EXT.ETAPAS, PR=EXT.PR, PV=EXT.PV, POIS=EXT.POIS,
      RENDERS=EXT.RENDERS, precio=EXT.precio, estadoDe=EXT.estadoDe,
      state=EXT.state, toast=EXT.toast, fmtA=EXT.fmtA, fmtCOP=EXT.fmtCOP,
      devolverIntro=EXT.devolverIntro, R3D=EXT.R3D;
if(!window.__TER){ console.warn("Falta datos-terreno.js: sin corte del terreno ni mapa de pendientes"); }
const modal=document.getElementById("anlModal"), mb=document.getElementById("anlBody");
const TER = window.__TER;                 /* malla de alturas: datos-terreno.js */

const IDIOMAS = ["es","en","fr"];
let LANG = (function(){ try{ const l=localStorage.getItem("laureles.lang")||"es";
  return IDIOMAS.indexOf(l)>=0 ? l : "es"; }catch(e){ return "es"; } })();
const LOC = () => LANG==="en" ? "en-US" : LANG==="fr" ? "fr-FR" : "es-CO";
const T = s => {
  if(LANG==="es") return s;
  if(LANG==="fr"){
    if(DIC_FR[s] !== undefined) return DIC_FR[s];
    if(DIC[s]    !== undefined) return DIC[s];
    return s;
  }
  return DIC[s] !== undefined ? DIC[s] : s;
};
const TT = (es,en,fr) => {
  if(LANG==="es") return es;
  if(LANG==="fr"){
    if(fr !== undefined) return fr;
    return DIC_FR[es] !== undefined ? DIC_FR[es] : en;
  }
  return en;
};
const dec = (v,n) => Number(v).toLocaleString(LOC(),{minimumFractionDigits:n,maximumFractionDigits:n});
const ent = v => Math.round(v).toLocaleString(LOC());
/* ÁREA CONSTRUIBLE.
   El tope del proyecto es el 30 % del área útil de cada lote. No sale de la
   geometría: es la norma con la que se vende la parcelación, y por eso se
   calcula aquí y no viene en los datos. No confundir con el suelo que queda
   tras los aislamientos —A.cm2—, que es dónde puede pararse la casa y es del
   orden del doble. */
const OCUP30 = L => Math.round(0.30 * (L && L.ut != null ? L.ut : 0));
const TP = s => LANG==="es" ? s : T("pend."+s);   /* clases de pendiente: "Plano" del menú es otra cosa */
let modalActual = null;

const DIC_FR = {
"Recorrido del sol sobre la casa":"Course du soleil au-dessus de la maison",
"El sol sobre la casa":"Le soleil au-dessus de la maison",
"un solo piso":"un seul niveau",
"dos niveles (uno semienterrado)":"deux niveaux (dont un semi-enterré)",
"Huella en el lote":"Emprise sur le lot",
"Área construida":"Surface construite",
"Patio interior":"Patio intérieur",
"Casa 30JB":"Casa 30JB",
"piscina":"piscine",
"Renderizar":"Rendre",
"Cómo se vería la casa":"À quoi ressemblerait la maison",
"Calculando…":"Calcul en cours…",
"Render terminado":"Rendu terminé",
"Casa 30JB sobre el lote":"Casa 30JB sur le lot",
"Render de la casa sobre el lote":"Rendu de la maison sur le lot",
"No se pudo cargar el render.":"Le rendu n'a pas pu être chargé.",
"QUÉ MÁS ENTRA EN EL PRECIO":"CE QUE LE PRIX COMPREND EN PLUS",
"Áreas comunes del conjunto":"Espaces communs du lotissement",
"Desde el predio":"Depuis le terrain",
"Zonas sociales":"Espaces communs",
"Andenes y vías":"Trottoirs et voies",
"Portería":"Loge de gardien",
"Descargar ficha técnica y comercial":"Télécharger la fiche technique et commerciale",
"Valor comercial":"Valeur commerciale",
"EL LOTE":"LE LOT",
"PRECIO SEGÚN LA ETAPA Y LA FORMA DE PAGO":"PRIX SELON LA PHASE ET LE MODE DE PAIEMENT",
"CÓMO SE MUEVE EL PRECIO":"COMMENT ÉVOLUE LE PRIX",
"Forma de pago":"Mode de paiement",
"$/m² bruto":"$/m² brut",
"$/m² útil":"$/m² utile",
"60% al cierre del año, −10%":"60 % à la clôture de l'année, −10 %",
"50% al cierre del año, −5%":"50 % à la clôture de l'année, −5 %",
"Lista VENTA 0":"Prix de liste VENTE 0",
"Ver la foto aérea del predio":"Voir la photo aérienne du terrain",
"Foto aérea":"Photo aérienne",
"Foto aérea del predio · Esri, 0,61 m por pixel":"Photo aérienne du terrain · Esri, 0,61 m par pixel",
"Volviendo al plano dibujado":"Retour au plan dessiné",
"nororiente":"nord-est",
"suroriente":"sud-est",
"suroccidente":"sud-ouest",
"noroccidente":"nord-ouest",
"oriente":"est",
"occidente":"ouest",
"El proyecto":"Le projet",
"Abriendo el lote en satélite, en otra pestaña.":"Ouverture du lot en vue satellite, dans un nouvel onglet.",
"Abriendo el predio en satélite, en otra pestaña.":"Ouverture du terrain en vue satellite, dans un nouvel onglet.",
"Abrir el predio en satélite (Google Maps)":"Ouvrir le terrain en vue satellite (Google Maps)",
"Satélite":"Satellite",
"Autopista del Café":"Autopista del Café",
"Conexión regional":"Liaison régionale",
"1,4 km · 3 min":"1,4 km · 3 min",
"6,2 km · 10 min":"6,2 km · 10 min",
"8,5 km · 10 min":"8,5 km · 10 min",
"15,0 km · 18 min":"15,0 km · 18 min",
"22,7 km · 30 min":"22,7 km · 30 min",
"Plano":"Plan",
"Ubicación":"Situation",
"Imágenes":"Images",
"Video":"Vidéo",
"Unidades":"Lots",
"Dónde estoy":"Où suis-je",
"Fondo claro":"Fond clair",
"Fondo oscuro":"Fond sombre",
"Consultar":"Nous contacter",
"Cambiar entre fondo claro y oscuro":"Basculer entre fond clair et fond sombre",
"Cambiar tema":"Changer de thème",
"Plano de loteo interactivo de Laureles Campestre":"Plan de lotissement interactif de Laureles Campestre",
"Vista en relieve del terreno":"Vue en relief du terrain",
"Buscar lote":"Rechercher un lot",
"Número de lote, p. ej. 42":"Numéro de lot, p. ex. 42",
"Etapa de venta":"Phase de vente",
"Etapa":"Phase",
"Colorear por":"Colorer par",
"Modo de color":"Mode de couleur",
"Mostrar":"Afficher",
"Afinar":"Affiner",
"Área útil mínima":"Surface utile minimale",
"Precio máximo":"Prix maximum",
"Capas":"Calques",
"Áreas de protección":"Zones protégées",
"Vías y andenes":"Voies et trottoirs",
"Áreas comunes":"Espaces communs",
"Números de lote":"Numéros de lot",
"Cotas al acercar":"Cotes au zoom",
"Párate en el predio y el plano te dice en qué lote estás.":"Placez-vous sur le terrain et le plan vous dit sur quel lot vous êtes.",
"Estado de unidades":"État des lots",
"Acercar":"Zoom avant",
"Alejar":"Zoom arrière",
"Ver todo":"Tout voir",
"Ver el terreno en relieve":"Voir le terrain en relief",
"Volver al plano":"Revenir au plan",
"Relieve 3D":"Relief 3D",
"Mostrar u ocultar el panel":"Afficher ou masquer le panneau",
"Panel":"Panneau",
"Relieve":"Relief",
"Encuadrar":"Recadrer",
"Volver al encuadre inicial":"Revenir au cadrage initial",
"Saltar intro":"Passer l'intro",
"Comenzar el recorrido":"Commencer la visite",
"Armenia · Quindío · Colombia":"Armenia · Quindío · Colombie",
"lotes":"lots",
"de predio":"de terrain",
"lote mínimo":"lot le plus petit",
"86 lotes campestres desde 3.100 m², sobre 37 hectáreas atravesadas por una cañada de bosque protegido, a minutos de Armenia y del aeropuerto El Edén.":"86 lots de campagne à partir de 3 100 m², sur 37 hectares traversés par un vallon de forêt protégée, à quelques minutes d'Armenia et de l'aéroport El Edén.",
"Demo · geometría real del plano 039 en coordenadas MAGNA-SIRGAS CTM12 e imágenes del vuelo de dron. Falta la ortofoto para dibujar los lotes sobre la foto aérea.":"Démo · géométrie réelle du plan 039 en coordonnées MAGNA-SIRGAS CTM12 et images du vol de drone. L'orthophoto manque encore pour poser les lots sur la vue aérienne.",
"Cerrar":"Fermer",
"Disponible":"Disponible",
"Reservado":"Réservé",
"Vendido":"Vendu",
"Estado":"État",
"Precio":"Prix",
"Protección":"Protection",
"Contado, −20% sobre lista":"Comptant, −20 % sur le prix de liste",
"Cuota inicial 30%, saldo a 12 meses":"Apport de 30 %, solde sur 12 mois",
"Cuota inicial 30%, saldo a 18 meses":"Apport de 30 %, solde sur 18 mois",
"Precio de lista":"Prix de liste",
"Lista +10%":"Liste +10 %",
"Lista +20%":"Liste +20 %",
"Lotes libres":"Lots libres",
"Inventario":"Stock",
"m² útiles libres":"m² utiles libres",
"Área del predio":"Surface du terrain",
"disponibles":"disponibles",
"reservados":"réservés",
"vendidos":"vendus",
"Centro y servicios":"Centre-ville et services",
"Vuelos nacionales":"Vols intérieurs",
"Zona Franca del Eje":"Zone franche du Eje",
"Entorno turístico":"Pôle touristique",
"Aeropuerto El Edén":"Aéroport El Edén",
"La Tebaida":"La Tebaida",
"Parque del Café":"Parque del Café",
"por medir":"à mesurer",
"Lote":"Lot",
"Área total":"Surface totale",
"Área útil":"Surface utile",
"Área de protección":"Surface protégée",
"Protección sobre el lote":"Part protégée du lot",
"Útil":"Utile",
"Cambiar estado":"Changer l'état",
"Consultar por WhatsApp":"Écrire sur WhatsApp",
"Análisis del lote y ficha PDF":"Analyse du lot et fiche PDF",
"por m² bruto · pesos colombianos":"par m² brut · pesos colombiens",
"El estado se comparte con todos los que abran este plano.":"L'état est partagé avec tous ceux qui ouvrent ce plan.",
"Modo local: el cambio solo se ve en este dispositivo.":"Mode local : la modification ne se voit que sur cet appareil.",
"Todo el lote es área útil: no lo toca ninguna faja de protección.":"Tout le lot est utile : aucune bande de protection ne le touche.",
"Este dispositivo no puede mostrar el relieve 3D.":"Cet appareil ne peut pas afficher le relief 3D.",
"Arrastre para girar, pellizque para acercar, toque un lote para ver su ficha.":"Faites glisser pour tourner, pincez pour zoomer, touchez un lot pour voir sa fiche.",
"Este lote todavía no tiene análisis topográfico.":"Ce lot n'a pas encore d'analyse topographique.",
"Preparando la ficha…":"Préparation de la fiche…",
"Descarga cancelada.":"Téléchargement annulé.",
"Espere un momento y vuelva a intentar.":"Patientez un instant et réessayez.",
"No se pudo descargar la ficha aquí.":"La fiche n'a pas pu être téléchargée ici.",
"No se pudo generar el PDF.":"Le PDF n'a pas pu être généré.",
"Estás fuera del predio":"Vous êtes hors du terrain",
"Dentro del predio, fuera de un lote":"Sur le terrain, hors d'un lot",
"Buscando tu posición…":"Recherche de votre position…",
"Tu navegador no permite ubicación":"Votre navigateur ne fournit pas la localisation",
"No se pudo obtener la ubicación":"La localisation n'a pas pu être obtenue",
"No tienes permisos para cambiar el estado":"Vous n'avez pas les droits pour changer l'état",
"No se pudo guardar el cambio":"La modification n'a pas pu être enregistrée",
"Análisis del lote":"Analyse du lot",
"Cómo es el terreno":"Comment est le terrain",
"Dónde cabe la casa":"Où la maison tient",
"El sol sobre el lote":"Le soleil sur le lot",
"Asoleación a lo largo del día":"Ensoleillement au fil de la journée",
"pend.Plano":"Plat",
"pend.Suave":"Doux",
"pend.Medio":"Moyen",
"pend.Fuerte":"Fort",
"pend.Muy pendiente":"Très pentu",
"menos de 5 %":"moins de 5 %",
"5 – 10 %":"5 – 10 %",
"10 – 15 %":"10 – 15 %",
"15 – 25 %":"15 – 25 %",
"más de 25 %":"plus de 25 %",
"Volumen de prueba":"Volume d'essai",
"Nivel de acceso":"Niveau d'accès",
"Nivel −1 (semienterrado)":"Niveau −1 (semi-enterré)",
"Altura sobre el acceso":"Hauteur au-dessus de l'accès",
"Desnivel bajo la casa":"Dénivelé sous la maison",
"Movimiento de tierra":"Terrassement",
"Excavación del nivel −1":"Excavation du niveau −1",
"Eje largo":"Axe long",
"Ver el volumen en 3D":"Voir le volume en 3D",
"Descargar ficha en PDF":"Télécharger la fiche PDF",
"Ver en satélite":"Voir en satellite",
"Sale":"Lever",
"Mediodía":"Midi",
"Se pone":"Coucher",
"Solsticio de junio":"Solstice de juin",
"Equinoccios":"Équinoxes",
"Solsticio de diciembre":"Solstice de décembre",
"Eje largo de la casa":"Axe long de la maison",
"óptima":"optimale",
"aceptable":"acceptable",
"exigente":"exigeante",
"norte":"nord",
"sur":"sud",
"equinoccio":"équinoxe",
"Un solo piso":"Un seul niveau",
"Dos niveles (uno semienterrado)":"Deux niveaux (dont un semi-enterré)",
"Modelo":"Modèle",
"Huella":"Emprise",
"Nivel −1":"Niveau −1",
"Excavación":"Excavation",
"Corte y lleno":"Déblai et remblai",
"Cota":"Altitude",
"Pendiente media":"Pente moyenne",
"Área construible (30 % del área útil)":"Surface constructible (30 % de la surface utile)",
"Suelo tras aislamientos":"Sol après retraits",
"Frente sobre vía":"Façade sur voie",
"Otro frente sobre vía":"Autre façade sur voie",
"Fondo":"Profondeur",
"ÁREAS Y MEDIDAS":"SURFACES ET MESURES",
"TERRENO":"TERRAIN",
"VOLUMEN DE PRUEBA":"VOLUME D'ESSAI",
"FICHA TÉCNICA Y ANÁLISIS DEL LOTE":"FICHE TECHNIQUE ET ANALYSE DU LOT",
"CÓMO SE REPARTE LA PENDIENTE":"COMMENT SE RÉPARTIT LA PENTE",
"EL SOL SOBRE EL LOTE":"LE SOLEIL SUR LE LOT",
"Orientación":"Orientation",
"Esquinero":"En angle",
"Faja de protección":"Bande de protection",
"Suelo donde puede ir la casa (aislamientos y antejardín)":"Sol où la maison peut se poser (retraits et marge avant)",
"Generado el":"Généré le",
"El Caimo · Armenia · Quindío · Parcelación campestre":"El Caimo · Armenia · Quindío · Lotissement de campagne",
"Latitud 4,47° norte — el sol pasa casi por el cenit":"Latitude 4,47° nord — le soleil passe presque au zénith",
"Bienvenidos a <em>Laureles Campestre</em>":"Bienvenue à <em>Laureles Campestre</em>",
"Incluye ":"Comprend ",
" de ronda de la cañada: bosque protegido que nadie puede construir ni talar.":" de bande riveraine du vallon : forêt protégée, ni construction ni coupe possibles.",
"Demo: aquí va el enlace de WhatsApp del asesor con el lote ":"Démo : ici s'ouvrira le WhatsApp du conseiller avec le lot ",
" precargado.":" déjà renseigné.",
" (solo en este dispositivo)":" (sur cet appareil seulement)",
"sin filtro":"sans filtre",
"Este navegador no entrega la ubicación.":"Ce navigateur ne fournit pas la localisation.",
"Buscando tu ubicación…":"Recherche de votre position…",
"Estás en el lote ":"Vous êtes sur le lot ",
"Estás dentro del predio, en vía o zona común":"Vous êtes sur le terrain, sur une voie ou un espace commun",
"Permiso de ubicación denegado. Actívalo y vuelve a intentar.":"Autorisation de localisation refusée. Activez-la et réessayez.",
"No se pudo obtener la ubicación. Inténtalo al aire libre.":"Localisation impossible. Réessayez en extérieur.",
"Escoja primero un lote.":"Choisissez d'abord un lot.",
"Recorridos del sol en solsticios y equinoccio, a escala real.":"Courses du soleil aux solstices et à l'équinoxe, à l'échelle réelle.",
"Con la bóveda solar la escala se mantiene real.":"Avec la voûte solaire, l'échelle reste réelle.",
" m s. n. m.":" m d'altitude",
"Orientación óptima":"Orientation optimale",
"El eje largo queda casi oriente–occidente, así que las fachadas largas miran al norte y al sur: reciben sol alto y poco sol rasante. Es la mejor orientación para este clima.":"L'axe long est presque est–ouest : les longues façades regardent le nord et le sud, elles reçoivent un soleil haut et peu de soleil rasant. C'est la meilleure orientation pour ce climat.",
"Orientación aceptable":"Orientation acceptable",
"El eje largo queda en diagonal. Las fachadas largas reciben algo de sol rasante de la mañana y de la tarde; con aleros de 1 m sobre esas caras queda resuelto.":"L'axe long est en diagonale. Les longues façades reçoivent un peu de soleil rasant le matin et l'après-midi ; des débords de toit de 1 m sur ces faces suffisent à le régler.",
"Orientación exigente":"Orientation exigeante",
"El eje largo queda casi norte–sur, así que las fachadas largas dan al oriente y al occidente y reciben el sol bajo de la mañana y de la tarde. Conviene girar la casa, o proteger esas caras con aleros profundos, celosías o vegetación.":"L'axe long est presque nord–sud : les longues façades donnent à l'est et à l'ouest et reçoivent le soleil bas du matin et de l'après-midi. Mieux vaut pivoter la maison, ou protéger ces faces par des débords profonds, des claustras ou de la végétation.",
"O":"O",
"hacia el ":"vers le ",
"De los ":"Sur les ",
"Pendientes medidas sobre el modelo digital del terreno construido con las curvas cada 1 m del levantamiento. Un 10 % son 10 cm de desnivel por cada metro recorrido.":"Pentes mesurées sur le modèle numérique de terrain construit à partir des courbes de niveau tous les 1 m du levé. 10 % correspond à 10 cm de dénivelé par mètre parcouru.",
"Descontando <b>3 m de aislamiento</b> a cada vecino, <b>10 m de antejardín</b> sobre la vía y las fajas de protección, quedan <b>":"En retirant <b>3 m de retrait</b> de chaque côté, <b>10 m de marge avant</b> sur la voie et les bandes de protection, il reste <b>",
"Con los aislamientos y la protección, este lote no deja un área construible continua.":"Avec les retraits et la protection, ce lot ne laisse pas de surface constructible d'un seul tenant.",
" m en dos niveles — ":" m sur deux niveaux — ",
" m² por nivel, ":" m² par niveau, ",
" m² en total":" m² au total",
" m en un solo piso — ":" m sur un seul niveau — ",
" m² de huella":" m² d'emprise",
" m (máximo permitido)":" m (maximum autorisé)",
" de corte · ":" de déblai · ",
" m³ de lleno":" m³ de remblai",
" de corte":" de déblai",
"fachadas largas al ":"longues façades au ",
" y al ":" et au ",
"<b>Este lote arranca en pendiente: no tiene plataforma natural.</b> Por eso el modelo lo resuelve en dos niveles y no en uno. El piso de acceso se apoya en la parte alta del terreno y por debajo va un nivel −1 enterrado contra la ladera, que baja ":"<b>Ce lot démarre en pente : il n'a pas de plateforme naturelle.</b> Le modèle le résout donc sur deux niveaux et non sur un. Le niveau d'accès s'appuie sur la partie haute du terrain et, en dessous, un niveau −1 s'enterre contre le coteau, en descendant de ",
"El terreno bajo la casa está lo bastante parejo para resolverla en <b>un solo piso de ":"Le terrain sous la maison est assez régulier pour la résoudre sur <b>un seul niveau de ",
"La fachada tuvo que recortarse a <b>":"La façade a dû être ramenée à <b>",
"El volumen va alineado con los linderos laterales —así los 3 m de aislamiento quedan parejos en todo el largo—, centrado entre ellos y lo más adelante que permite el antejardín. No es un diseño: es un volumen puesto ahí para entender la escala y cuánta tierra habría que mover.":"Le volume est aligné sur les limites latérales — ainsi les 3 m de retrait restent constants sur toute la longueur —, centré entre elles et aussi en avant que la marge avant le permet. Ce n'est pas un projet : c'est un volume posé là pour saisir l'échelle et la quantité de terre à déplacer.",
"Ni un volumen de 264 m² en un piso ni uno de 132 m² en dos niveles caben dentro del área construible de este lote. Habría que plantear una casa más compacta o repartida en varios cuerpos.":"Ni un volume de 264 m² sur un niveau, ni un volume de 132 m² sur deux niveaux ne tiennent dans la surface constructible de ce lot. Il faudrait une maison plus compacte ou répartie en plusieurs corps.",
"A esta latitud —4,5° al norte del ecuador— el sol pasa casi por encima. Entre marzo y septiembre el mediodía queda hacia el <b>norte</b>; el resto del año, hacia el <b>sur</b>. Por eso las cubiertas se calientan mucho y las fachadas al oriente y al occidente reciben el sol bajo, que es el que más molesta.":"À cette latitude — 4,5° au nord de l'équateur — le soleil passe presque à la verticale. De mars à septembre, le midi solaire se place au <b>nord</b> ; le reste de l'année, au <b>sud</b>. Les toitures chauffent donc beaucoup et les façades est et ouest reçoivent le soleil bas, celui qui gêne le plus.",
"El sol en cada fachada":"Le soleil sur chaque façade",
"Horas de sol directo que recibe cada cara del volumen, de salida a puesta y sin nada que le haga sombra. Es el número que decide dónde van las alcobas y qué caras piden alero.":"Heures de soleil direct reçues par chaque face du volume, du lever au coucher et sans aucun masque. C'est le chiffre qui décide où placer les chambres et quelles faces demandent un débord.",
"Se cuenta que una fachada tiene sol mientras el astro esté a más de 2° sobre el horizonte y dentro de 85° de la perpendicular a esa cara. No entra la sombra de los árboles, ni la de la propia ladera, ni la de las casas vecinas.":"Une façade est comptée ensoleillée tant que le soleil est à plus de 2° au-dessus de l'horizon et à moins de 85° de la perpendiculaire à cette face. L'ombre des arbres, du coteau lui-même et des maisons voisines n'est pas prise en compte.",
"Por dónde corre la sombra en el día":"Par où court l'ombre dans la journée",
"La misma casa a las 7, 9, 11, 1, 3 y 5. De un vistazo se ve qué parte del lote queda libre en la tarde y dónde tiene sentido poner la terraza o la piscina.":"La même maison à 7 h, 9 h, 11 h, 13 h, 15 h et 17 h. D'un coup d'œil on voit quelle partie du lot reste libre l'après-midi et où placer la terrasse ou la piscine.",
"21 jun":"21 juin",
"20 mar":"20 mars",
"21 dic":"21 déc.",
"La sombra se calcula con la posición real del sol y una casa de ":"L'ombre est calculée avec la position réelle du soleil et une maison de ",
"Fachada":"Façade",
"Cubierta":"Toiture",
"sol sobre el horizonte":"soleil au-dessus de l'horizon",
"Sol a ":"Soleil à ",
"° de altura, azimut ":"° de hauteur, azimut ",
"El sol ya se ocultó":"Le soleil est déjà couché",
"LOTE ":"LOT ",
" por m² bruto":" par m² brut",
"° al ":"° au ",
"Geometría del plano 039 (09-09-2026), MAGNA-SIRGAS / Origen Nacional CTM12. Pendientes y cotas del modelo digital del terreno hecho con las curvas cada 1 m del levantamiento. El volumen de prueba es un ejercicio de escala, no un diseño: respeta 3 m de aislamiento, 10 m de antejardín, las fajas de protección y 5 m de altura. En los lotes que arrancan en pendiente va en dos niveles, el de abajo enterrado contra la ladera, para que desde la vía se lea un solo piso. Precios de trabajo; no es oferta comercial.":"Géométrie du plan 039 (09-09-2026), MAGNA-SIRGAS / Origen Nacional CTM12. Pentes et altitudes issues du modèle numérique de terrain construit avec les courbes de niveau tous les 1 m du levé. Le volume d'essai est un exercice d'échelle, pas un projet : il respecte 3 m de retrait, 10 m de marge avant, les bandes de protection et 5 m de hauteur. Sur les lots qui démarrent en pente, il se développe sur deux niveaux, celui du bas enterré contre le coteau, pour qu'un seul niveau se lise depuis la voie. Prix de travail ; ceci n'est pas une offre commerciale.",
"Estudio de asoleación":"Étude d'ensoleillement",
"HORAS DE SOL DIRECTO EN CADA FACHADA":"HEURES DE SOLEIL DIRECT SUR CHAQUE FAÇADE",
"Medidas de salida a puesta y sin nada que le haga sombra al volumen. Es la cifra que decide dónde van las alcobas y qué caras piden alero.":"Mesurées du lever au coucher, sans aucun masque sur le volume. C'est le chiffre qui décide où placer les chambres et quelles faces demandent un débord.",
"POR DÓNDE CORRE LA SOMBRA EN EL DÍA":"PAR OÙ COURT L'OMBRE DANS LA JOURNÉE",
"El mismo volumen a las 7, 9 y 11 de la mañana y a la 1, 3 y 5 de la tarde, en el equinoccio. Muestra qué parte del lote queda libre en la tarde y dónde tienen sentido la terraza o la piscina. No incluye la sombra de los árboles, ni la de la propia ladera, ni la de las casas vecinas.":"Le même volume à 7 h, 9 h et 11 h le matin et à 13 h, 15 h et 17 h l'après-midi, à l'équinoxe. Il montre quelle partie du lot reste libre l'après-midi et où la terrasse ou la piscine ont du sens. L'ombre des arbres, du coteau et des maisons voisines n'est pas incluse.",
"Posiciones del sol calculadas para latitud 4,47° N, longitud 75,74° O, hora de Colombia (UTC−5), con una casa de 5 m.":"Positions du soleil calculées pour la latitude 4,47° N, la longitude 75,74° O, heure de Colombie (UTC−5), avec une maison de 5 m.",
" en dos niveles":" sur deux niveaux",
" en un piso":" sur un niveau",
"Volumen de prueba sobre el lote ":"Volume d'essai sur le lot ",
". Arrastre para girar alrededor.":". Faites glisser pour tourner autour.",
"Mapa":"Carte",
"Oscuro":"Sombre",
"Sin fondo":"Sans fond",
"Ajustes":"Réglages",
"Filtros":"Filtres",
"Zonas comunes":"Espaces communs",
"Sombreado del relieve":"Ombrage du relief",
"Curvas de nivel (cada 1 m)":"Courbes de niveau (tous les 1 m)",
"Separado":"En négociation",
"Colocado":"Placé",
"Inventario E1":"Inventaire E1",
"Dónde está el lote":"Où se trouve le lot",
"El corte del terreno":"La coupe du terrain",
"Terreno natural":"Terrain naturel",
"Plataforma de la casa (NPT)":"Plateforme de la maison",
"Corte":"Déblai",
"Lleno":"Remblai",
"Casa":"Maison",
"NPT":"Niveau fini"
};

const DIC = {
/* ---------- armazón ---------- */
"El proyecto":"The project",
"Recorrido del sol sobre la casa":"Path of the sun over the house",
"El sol sobre la casa":"The sun over the house",
"un solo piso":"a single storey",
"dos niveles (uno semienterrado)":"two levels (one half-buried)",
"Huella en el lote":"Footprint on the lot",
"Área construida":"Built area",
"Patio interior":"Inner courtyard",
"Casa 30JB":"Casa 30JB",
"piscina":"pool",
"Renderizar":"Render",
"Cómo se vería la casa":"What the house would look like",
"Calculando…":"Computing…",
"Render terminado":"Render finished",
"Casa 30JB sobre el lote":"Casa 30JB on lot",
"Render de la casa sobre el lote":"Render of the house on lot",
"No se pudo cargar el render.":"The render could not be loaded.",
"QUÉ MÁS ENTRA EN EL PRECIO":"WHAT ELSE THE PRICE BUYS",
"Áreas comunes del conjunto":"Communal areas of the development",
"Desde el predio":"From the property",
"Zonas sociales":"Communal areas",
"Andenes y vías":"Paths and roads",
"Portería":"Gatehouse",
"Valor comercial":"Commercial value",
"EL LOTE":"THE LOT",
"PRECIO SEGÚN LA ETAPA Y LA FORMA DE PAGO":"PRICE BY STAGE AND PAYMENT TERMS",
"CÓMO SE MUEVE EL PRECIO":"HOW THE PRICE MOVES",
"Forma de pago":"Payment terms",
"$/m² bruto":"$/gross m²",
"$/m² útil":"$/usable m²",
"Ver la foto aérea del predio":"See the aerial photo of the property",
"Foto aérea":"Aerial photo",
"Foto aérea del predio · Esri, 0,61 m por pixel":"Aerial photo of the property · Esri, 0.61 m per pixel",
"Volviendo al plano dibujado":"Back to the drawn plan",
"Abriendo el lote en satélite, en otra pestaña.":"Opening the lot on satellite, in a new tab.",
"Abriendo el predio en satélite, en otra pestaña.":"Opening the property on satellite, in a new tab.",
"Abrir el predio en satélite (Google Maps)":"Open the property on satellite (Google Maps)",
"Satélite":"Satellite",
"Autopista del Café":"Autopista del Café",
"Conexión regional":"Regional connection",
"1,4 km · 3 min":"1.4 km · 3 min",
"6,2 km · 10 min":"6.2 km · 10 min",
"8,5 km · 10 min":"8.5 km · 10 min",
"15,0 km · 18 min":"15.0 km · 18 min",
"22,7 km · 30 min":"22.7 km · 30 min",

"Plano":"Site plan",
"Ubicación":"Location",
"Imágenes":"Images",
"Video":"Video",
"Unidades":"Units",
"Dónde estoy":"Where am I",
"Fondo claro":"Light background",
"Fondo oscuro":"Dark background",
"Consultar":"Enquire",
"Cambiar entre fondo claro y oscuro":"Switch between light and dark background",
"Cambiar tema":"Switch theme",
"Plano de loteo interactivo de Laureles Campestre":"Interactive lot plan of Laureles Campestre",
"Vista en relieve del terreno":"Terrain relief view",
"Buscar lote":"Find a lot",
"Número de lote, p. ej. 42":"Lot number, e.g. 42",
"Etapa de venta":"Sales stage",
"Etapa":"Stage",
"Colorear por":"Colour by",
"Modo de color":"Colour mode",
"Mostrar":"Show",
"Afinar":"Refine",
"Área útil mínima":"Minimum usable area",
"Precio máximo":"Maximum price",
"Capas":"Layers",
"Áreas de protección":"Protected strips",
"Vías y andenes":"Roads and paths",
"Áreas comunes":"Common areas",
"Números de lote":"Lot numbers",
"Cotas al acercar":"Dimensions on zoom",
"Párate en el predio y el plano te dice en qué lote estás.":
  "Stand anywhere on the property and the plan tells you which lot you are on.",
"Estado de unidades":"Unit status",
"Acercar":"Zoom in",
"Alejar":"Zoom out",
"Ver todo":"Fit to screen",
"Ver el terreno en relieve":"See the terrain in relief",
"Volver al plano":"Back to the plan",
"Relieve 3D":"3D relief",
"Mostrar u ocultar el panel":"Show or hide the panel",
"Panel":"Panel",
"Relieve":"Relief",
"Encuadrar":"Reset view",
"Volver al encuadre inicial":"Back to the starting view",
"Saltar intro":"Skip intro",
"Comenzar el recorrido":"Start the tour",
"Armenia · Quindío · Colombia":"Armenia · Quindío · Colombia",
"lotes":"lots",
"de predio":"of land",
"lote mínimo":"smallest lot",
"86 lotes campestres desde 3.100 m², sobre 37 hectáreas atravesadas por una cañada de bosque protegido, a minutos de Armenia y del aeropuerto El Edén.":
  "88 country lots from 3,100 m², on 37 hectares crossed by a protected forest ravine, minutes from Armenia and El Edén airport.",
"Demo · geometría real del plano 039 en coordenadas MAGNA-SIRGAS CTM12 e imágenes del vuelo de dron. Falta la ortofoto para dibujar los lotes sobre la foto aérea.":
  "Demo · real geometry from drawing 039 in MAGNA-SIRGAS CTM12 coordinates and stills from the drone flight. The orthophoto is still pending to place the lots over the aerial image.",
"Cerrar":"Close",

/* ---------- estados y etapas ---------- */
"Disponible":"Available",
"Reservado":"Reserved",
"Vendido":"Sold",
"Estado":"Status",
"Precio":"Price",
"Protección":"Protection",
"Contado, −20% sobre lista":"Cash, −20% off list",
"Cuota inicial 30%, saldo a 12 meses":"30% down, balance over 12 months",
"Cuota inicial 30%, saldo a 18 meses":"30% down, balance over 18 months",
"Precio de lista":"List price",
"Lista +10%":"List +10%",
"Lista +20%":"List +20%",

/* ---------- indicadores ---------- */
"Lotes libres":"Lots available",
"Inventario":"Inventory",
"m² útiles libres":"usable m² available",
"Área del predio":"Property area",
"disponibles":"available",
"reservados":"reserved",
"vendidos":"sold",

/* ---------- puntos de interés ---------- */
"Centro y servicios":"City centre and services",
"Vuelos nacionales":"Domestic flights",
"Zona Franca del Eje":"Eje free-trade zone",
"Entorno turístico":"Tourism hub",
"Aeropuerto El Edén":"El Edén airport",
"La Tebaida":"La Tebaida",
"Parque del Café":"Parque del Café",
"por medir":"to be measured",

/* ---------- ficha del lote ---------- */
"Lote":"Lot",
"Área total":"Total area",
"Área útil":"Usable area",
"Área de protección":"Protected area",
"Protección sobre el lote":"Protection within the lot",
"Útil":"Usable",
"Cambiar estado":"Change status",
"Consultar por WhatsApp":"Ask on WhatsApp",
"Análisis del lote y ficha PDF":"Lot analysis and PDF sheet",
"por m² bruto · pesos colombianos":"per gross m² · Colombian pesos",
"El estado se comparte con todos los que abran este plano.":
  "The status is shared with everyone who opens this plan.",
"Modo local: el cambio solo se ve en este dispositivo.":
  "Local mode: the change is only visible on this device.",
"Todo el lote es área útil: no lo toca ninguna faja de protección.":
  "The whole lot is usable: no protection strip touches it.",

/* ---------- avisos ---------- */
"Este dispositivo no puede mostrar el relieve 3D.":"This device cannot show the 3D relief.",
"Arrastre para girar, pellizque para acercar, toque un lote para ver su ficha.":
  "Drag to rotate, pinch to zoom, tap a lot to open its sheet.",
"Este lote todavía no tiene análisis topográfico.":"This lot has no topographic analysis yet.",
"Preparando la ficha…":"Preparing the sheet…",
"Descarga cancelada.":"Download cancelled.",
"Espere un momento y vuelva a intentar.":"Wait a moment and try again.",
"No se pudo descargar la ficha aquí.":"The sheet could not be downloaded here.",
"No se pudo generar el PDF.":"The PDF could not be generated.",
"Estás fuera del predio":"You are outside the property",
"Dentro del predio, fuera de un lote":"Inside the property, outside any lot",
"Buscando tu posición…":"Finding your position…",
"Tu navegador no permite ubicación":"Your browser does not allow location",
"No se pudo obtener la ubicación":"Location could not be obtained",
"No tienes permisos para cambiar el estado":"You do not have permission to change the status",
"No se pudo guardar el cambio":"The change could not be saved",

/* ---------- análisis ---------- */
"Análisis del lote":"Lot analysis",
"Cómo es el terreno":"What the land is like",
"Dónde cabe la casa":"Where the house fits",
"El sol sobre el lote":"The sun over the lot",
"Asoleación a lo largo del día":"Sun and shade through the day",
"pend.Plano":"Flat",
"pend.Suave":"Gentle",
"pend.Medio":"Moderate",
"pend.Fuerte":"Steep",
"pend.Muy pendiente":"Very steep",
"menos de 5 %":"under 5%",
"5 – 10 %":"5 – 10%",
"10 – 15 %":"10 – 15%",
"15 – 25 %":"15 – 25%",
"más de 25 %":"over 25%",
"Volumen de prueba":"Test volume",
"Nivel de acceso":"Entry level",
"Nivel −1 (semienterrado)":"Level −1 (half-buried)",
"Altura sobre el acceso":"Height above the entry level",
"Desnivel bajo la casa":"Fall under the house",
"Movimiento de tierra":"Earthworks",
"Excavación del nivel −1":"Excavation for level −1",
"Eje largo":"Long axis",
"Ver el volumen en 3D":"See the volume in 3D",
"Descargar ficha en PDF":"Download the PDF sheet",
"Descargar ficha técnica y comercial":"Download the technical and commercial sheet",
"Ver en satélite":"View on satellite",
"Sale":"Rises",
"Mediodía":"Solar noon",
"Se pone":"Sets",
"Solsticio de junio":"June solstice",
"Equinoccios":"Equinoxes",
"Solsticio de diciembre":"December solstice",
"Eje largo de la casa":"Long axis of the house",
"óptima":"ideal",
"aceptable":"workable",
"exigente":"demanding",
"norte":"north","nororiente":"northeast","oriente":"east","suroriente":"southeast",
"sur":"south","suroccidente":"southwest","occidente":"west","noroccidente":"northwest",
"equinoccio":"equinox","junio":"June","diciembre":"December",
"Un solo piso":"Single storey",
"Dos niveles (uno semienterrado)":"Two levels (one half-buried)",
"Modelo":"Model",
"Huella":"Footprint",
"Nivel −1":"Level −1",
"Excavación":"Excavation",
"Corte y lleno":"Cut and fill",
"Cota":"Elevation",
"Pendiente media":"Average slope",
"Área construible (30 % del área útil)":"Buildable area (30% of the usable area)",
"Suelo tras aislamientos":"Ground after setbacks",
"Frente sobre vía":"Frontage on road",
"Otro frente sobre vía":"Other frontage on road",
"Fondo":"Depth",
"ÁREAS Y MEDIDAS":"AREAS AND DIMENSIONS",
"TERRENO":"LAND",
"VOLUMEN DE PRUEBA":"TEST VOLUME",
"FICHA TÉCNICA Y ANÁLISIS DEL LOTE":"TECHNICAL SHEET AND LOT ANALYSIS",
"CÓMO SE REPARTE LA PENDIENTE":"HOW THE SLOPE IS DISTRIBUTED",
"EL SOL SOBRE EL LOTE":"THE SUN OVER THE LOT",
"Orientación":"Orientation",
"Esquinero":"Corner lot",
"Faja de protección":"Protection strip",
"Suelo donde puede ir la casa (aislamientos y antejardín)":"Ground where the house can sit (setbacks and front yard)",
"Generado el":"Generated on",
"El Caimo · Armenia · Quindío · Parcelación campestre":"El Caimo · Armenia · Quindío · Country subdivision",
"Latitud 4,47° norte — el sol pasa casi por el cenit":"Latitude 4.47° north — the sun passes almost overhead",
"Mapa":"Map",
"Oscuro":"Dark",
"Sin fondo":"No basemap",
"Ajustes":"Settings",
"Filtros":"Filters",
"Zonas comunes":"Common areas",
"Sombreado del relieve":"Hillshade",
"Curvas de nivel (cada 1 m)":"Contour lines (every 1 m)",
"Separado":"Under negotiation",
"Colocado":"Placed",
"Inventario E1":"E1 inventory",
"Dónde está el lote":"Where the lot is",
"El corte del terreno":"The terrain section",
"Terreno natural":"Natural ground",
"Plataforma de la casa (NPT)":"House platform (finished level)",
"Corte":"Cut",
"Lleno":"Fill",
"Casa":"House",
"NPT":"FFL"
};

/* ---- textos del armazón: se capturan una vez y se vuelven a pintar al cambiar ---- */
/* =========================================================================
   CASA 30JB — la vivienda tipo del proyecto, reducida a volúmenes.
   Sale del programa de la lámina 19 de la presentación (302 m² construidos,
   patio interior de 86 m², carport de dos autos) y de la planta del DXF
   (22,35 × 28,36 m de muros). Las coordenadas son locales, en metros:
     u = a lo ancho del lote (0 = lindero izquierdo del volumen)
     v = hacia el fondo      (0 = donde termina el antejardín)
   La usan el relieve 3D, el diagrama isométrico del sol y la ficha PDF.
   ========================================================================= */
const CASA30 = (()=>{
  const hBaja=3.40, hArco=5.00, hCarport=3.20, parapeto=0.35;
  return {
    W:22.4, D:28.4, hBaja, hArco, hCarport, parapeto,
    /* nombre, u0, v0, u1, v1, alto, clase */
    bloques:[
      ["carport",    0.00,  0.00,  6.20,  5.40, hCarport, "porche"],
      ["acceso",     7.00,  0.00, 12.60,  5.00, hArco,    "muro"],
      ["servicios",  0.00,  5.40,  7.00,  9.50, hBaja,    "muro"],
      ["social",     0.00,  9.50,  7.00, 24.50, hBaja,    "muro"],
      ["alcobas",   15.40,  4.00, 22.40, 24.00, hBaja,    "muro"],
      ["patio",      7.60,  8.00, 14.80, 20.00, 0.0,      "patio"],
    ]
  };
})();

/* =========================================================================
   ANÁLISIS DEL LOTE — topografía, implantación y asoleación
   Los polígonos de implantación vienen en coordenadas PX (metros del plano),
   calculados con el MDT del levantamiento propio.
   ========================================================================= */
const IMPL = window.__IMPL || {};

/* =========================================================================
   TAMAÑO DE LA CASA — 200, 250 o 300 m²
   Cada tamaño viene implantado aparte desde el análisis: no es el mismo dibujo
   encogido, es la envolvente que de verdad cabe en ese lote y el banqueo que de
   verdad exige, que cambia bastante entre uno y otro. Al escoger se cambia el
   registro 'k' de todos los lotes, y con eso la planta, el corte, el bloque 3D,
   el relieve y la ficha PDF quedan hablando del mismo volumen sin tener que
   avisarles uno por uno.
   ========================================================================= */
const TAMANOS = ["300","250","200"];
/* LOS TRES TIPOS REALES DEL PROYECTO
   Hasta ahora el selector decía 200, 250 y 300 m², que eran los tamaños con los
   que se corrió la implantación: envolventes redondas, no casas. Los tipos que
   de verdad se están vendiendo son otros tres, con el área rotulada en su propio
   plano y todos con 35,5 m² de parqueadero aparte. Cada uno se enseña montado
   sobre la envolvente más cercana, y la diferencia entre las dos cifras va
   dicha al pie: no se disfraza un número con el otro.
     tipo 199,6 m²  ->  envolvente de 200 m²   (0,2 % de diferencia)
     tipo 228,7 m²  ->  envolvente de 250 m²   (8,5 %)
     tipo 316 m²    ->  envolvente de 300 m²   (5,3 %)
   El movimiento de tierra que sale en el informe es el de la ENVOLVENTE, que es
   lo que se calculó contra el terreno medido. */
const TIPOS_CASA = {
  "200":{et:"199,6 m²", area:199.6, env:200},
  "250":{et:"228,7 m²", area:228.7, env:250},
  "300":{et:"316 m²",   area:316.0, env:300}
};
const PARQ_TIPO = 35.5, ALTO_TIPO = 4.00;

/* =========================================================================
   LA VOLUMETRÍA REAL DE CADA TIPO
   Los muros de los tres tipos, leídos de los PDF de arquitectura y reducidos a
   rectángulos alineados a los ejes (46, 72 y 76 piezas). Con esto el volumen
   que se levanta deja de ser una caja: es la planta de la casa escogida,
   extruida 4,00 m. 'w' y 'd' son la envolvente propia del tipo, en metros; los
   rectángulos van en ese mismo marco, con el origen en la esquina.
   Calibración: la escala salió del rectángulo de 35,5 m² de parqueadero y se
   contrastó con los bloques CAD de carro del propio plano — ±5 %.
   ========================================================================= */
const MUROS_TIPO = {"200":{"w":16.05,"d":19.68,"area_tipo":199.6,"area_muros":14.54,"r":[[1.16,0.0,1.37,0.79],[1.38,0.0,1.64,0.79],[1.64,0.0,2.04,0.16],[2.04,0.0,5.99,0.16],[5.99,0.0,6.3,0.58],[7.89,0.0,8.21,0.79],[8.21,0.0,11.15,0.16],[11.15,0.0,11.31,4.18],[11.31,4.18,12.35,4.5],[10.52,4.34,11.31,4.5],[1.38,8.32,1.85,8.58],[0.0,11.55,0.21,12.03],[0.21,11.55,0.37,16.21],[2.04,11.55,2.28,11.87],[2.28,11.55,2.44,16.21],[7.89,11.55,12.45,11.87],[2.44,11.71,6.3,11.87],[5.72,12.82,6.14,12.98],[6.14,12.82,6.3,17.85],[6.3,13.14,7.68,13.3],[7.68,13.14,7.84,13.88],[7.84,13.14,9.9,13.3],[9.9,13.14,10.06,13.88],[12.13,13.14,12.29,13.88],[12.29,13.14,14.35,13.3],[14.35,13.14,14.51,13.88],[14.51,13.14,15.89,13.3],[15.89,13.14,16.05,18.12],[11.02,13.18,11.18,17.85],[6.3,14.62,6.94,14.78],[7.68,14.62,7.84,17.85],[14.35,14.62,14.51,17.85],[15.26,14.62,15.89,14.78],[0.37,16.05,1.0,16.21],[0.0,17.27,0.16,19.51],[0.16,17.27,0.97,17.66],[2.06,17.27,3.65,17.43],[3.65,17.27,3.81,19.51],[5.72,17.54,6.14,17.85],[7.84,17.69,8.47,17.85],[10.59,17.69,11.02,17.85],[11.18,17.69,11.6,17.85],[13.72,17.69,14.35,17.85],[0.0,19.52,1.37,19.67],[1.38,19.52,2.04,19.67],[2.04,19.52,3.81,19.67]]},"250":{"w":17.99,"d":18.57,"area_tipo":228.7,"area_muros":17.21,"r":[[1.1,0.0,1.29,0.55],[1.3,0.0,1.55,0.55],[1.55,0.0,5.64,0.15],[5.64,0.0,5.95,0.55],[7.45,0.0,7.74,0.75],[7.74,0.0,10.14,0.15],[10.14,0.0,10.28,4.25],[10.29,0.0,12.69,0.15],[12.69,0.0,12.84,0.5],[11.09,1.35,12.69,1.5],[12.69,1.35,12.84,2.35],[12.69,3.8,12.84,4.25],[11.19,4.1,12.69,4.25],[10.14,5.25,10.28,6.15],[10.29,5.25,11.17,5.4],[12.13,5.25,12.28,6.08],[7.45,6.0,7.59,8.1],[7.59,6.0,9.45,6.15],[9.45,6.0,9.6,8.1],[9.6,6.0,10.14,6.15],[12.13,7.28,12.28,8.1],[1.3,7.85,1.75,8.1],[9.6,7.95,10.28,8.1],[10.29,7.95,12.13,8.1],[0.0,10.9,0.2,11.35],[0.2,10.9,0.35,12.54],[1.93,10.9,2.15,11.2],[2.15,10.9,2.3,12.54],[7.45,10.9,10.28,11.2],[10.29,10.9,11.09,11.2],[14.34,10.9,16.09,11.2],[2.3,11.05,5.95,11.2],[5.39,12.1,5.79,12.25],[5.79,12.1,5.95,12.54],[7.45,12.4,9.79,12.54],[10.79,12.4,11.09,12.54],[14.34,12.4,14.64,12.54],[15.64,12.4,17.99,12.54],[0.2,12.55,0.35,15.3],[2.15,12.55,2.3,15.3],[5.79,12.55,5.95,16.45],[7.45,12.55,7.59,17.3],[7.59,12.55,7.74,12.9],[10.79,12.55,10.94,15.89],[10.94,12.55,11.09,13.0],[14.34,12.55,14.49,13.0],[14.49,12.55,14.64,15.89],[17.69,12.55,17.84,12.9],[17.84,12.55,17.99,17.3],[11.09,12.85,12.64,13.0],[12.64,12.85,12.79,18.09],[12.79,12.85,14.34,13.0],[10.94,14.75,11.14,14.9],[12.04,14.75,12.64,14.9],[12.79,14.75,13.39,14.9],[14.29,14.75,14.49,14.9],[0.35,15.15,0.95,15.3],[5.39,16.14,5.79,16.45],[0.0,16.3,0.15,18.41],[0.15,16.3,0.92,16.66],[1.95,16.3,3.45,16.45],[3.45,16.3,3.6,18.41],[7.59,16.79,7.74,17.3],[10.79,16.79,10.94,18.24],[10.94,16.79,11.14,17.09],[14.29,16.79,14.49,17.09],[14.49,16.79,14.64,18.24],[17.69,16.79,17.84,17.3],[10.94,17.95,11.14,18.24],[14.29,17.95,14.49,18.24],[0.0,18.42,1.29,18.56],[1.3,18.42,3.6,18.56]]},"300":{"w":24.76,"d":24.76,"area_tipo":316.0,"area_muros":24.51,"r":[[4.8,0.0,4.96,1.05],[4.96,0.0,6.29,0.17],[6.29,0.0,9.82,0.39],[9.82,0.0,11.47,0.17],[11.47,0.0,11.64,1.05],[11.64,0.0,13.13,0.17],[13.13,0.0,13.29,1.05],[13.13,2.15,13.46,3.2],[13.46,2.15,16.44,2.32],[16.44,2.15,16.6,2.98],[4.8,2.37,4.96,3.48],[11.47,2.37,11.97,2.54],[11.97,2.37,12.13,5.35],[4.47,3.14,4.8,3.48],[16.44,3.14,17.15,3.48],[20.85,3.14,23.11,3.48],[11.47,5.18,11.64,8.66],[11.64,5.18,11.97,5.35],[11.64,6.34,13.18,6.51],[13.95,6.34,14.12,8.16],[16.44,6.34,16.6,8.66],[11.64,8.0,11.8,8.66],[11.8,8.0,13.95,8.16],[14.12,8.0,16.44,8.16],[11.47,11.31,11.8,12.3],[16.44,11.31,16.6,12.3],[11.8,12.13,16.44,12.3],[16.44,14.51,16.82,14.67],[16.82,14.51,17.15,15.5],[13.13,14.53,13.29,15.33],[13.29,14.53,16.44,14.67],[4.47,16.33,4.96,16.93],[4.96,16.33,9.43,16.49],[9.43,16.33,9.82,16.93],[13.13,16.33,14.17,16.66],[16.82,16.33,17.15,16.66],[20.85,16.33,23.11,16.66],[14.17,16.49,16.82,16.66],[3.48,16.77,4.47,16.93],[13.13,18.32,13.29,23.72],[13.29,18.32,15.72,18.48],[16.82,18.32,16.99,22.17],[16.99,18.32,17.15,18.97],[20.74,18.32,20.9,18.97],[20.9,18.32,21.07,22.17],[22.17,18.32,24.6,18.48],[24.6,18.32,24.77,23.72],[9.65,18.48,9.82,19.73],[17.15,18.81,18.86,18.97],[18.86,18.81,19.03,21.07],[19.03,18.81,20.74,18.97],[9.65,20.05,9.82,24.76],[0.17,20.41,0.33,22.01],[1.99,20.41,3.81,20.57],[3.81,20.41,3.97,22.01],[4.96,20.79,9.65,20.96],[16.99,20.9,17.21,21.07],[18.2,20.9,18.86,21.07],[19.03,20.9,19.69,21.07],[20.68,20.9,20.9,21.07],[1.99,21.07,2.15,21.9],[18.86,21.16,19.03,24.6],[13.29,23.16,13.46,23.72],[16.82,23.16,16.99,24.76],[16.99,23.16,17.21,23.5],[20.68,23.16,20.9,23.5],[20.9,23.16,21.07,24.76],[24.43,23.16,24.6,23.72],[0.0,23.66,0.17,24.76],[0.17,23.66,0.33,23.83],[1.99,23.66,2.15,24.76],[4.96,23.66,5.29,24.76],[16.99,24.43,17.21,24.76],[20.68,24.43,20.9,24.76],[0.17,24.6,1.99,24.76],[5.29,24.6,9.65,24.76]]}};
let TAM_CASA = (function(){ try{ const v=localStorage.getItem("laureles.tamCasa");
  return TAMANOS.indexOf(v)>=0 ? v : "300"; }catch(e){ return "300"; } })();

/* Devuelve la envolvente implantada de este lote para el tamaño pedido, y deja
   dicho en A.env CUÁL quedó: el número si es una de las tres, o "min" si en
   este lote no cabe ninguna de las tres y lo que hay es la envolvente mínima
   que la implantación logró meter (lotes 21 y 49). Antes esto se callaba y el
   informe rotulaba "tipo de 316 m²" sobre un volumen de 108 m² construidos. */
function casaDelLote(A, t){
  if(!A) return null;
  if(!A.ks){ A.env=null; return A.k || null; }
  if(A.ks[t]){ A.env=+t; return A.ks[t]; }
  for(const q of TAMANOS) if(A.ks[q]){ A.env=+q; return A.ks[q]; }
  if(A.ks.min){ A.env="min"; return A.ks.min; }
  A.env=null; return A.k || null;
}
function ponerTamano(t){
  if(TAMANOS.indexOf(t) < 0) return;
  TAM_CASA = t;
  try{ localStorage.setItem("laureles.tamCasa", t); }catch(e){}
  for(const n in IMPL){
    const A = IMPL[n];
    if(!A) continue;
    /* también los lotes sin variantes por tamaño pasan por aquí: si no, se
       quedaban con A.env sin definir y el informe no sabía qué rotular */
    A.k = casaDelLote(A, t);
  }
}
ponerTamano(TAM_CASA);          /* deja 'k' en el tamaño guardado desde el arranque */

/* =========================================================================
   LA CASA PROPUESTA CON IA (ia.js)
   Cuando el asesor arma una casa con el configurador, ia.js deja en
   window.__CASA_IA los bloques validados: en metros reales dentro de la
   envolvente K (u a lo ancho, v hacia el fondo, v=0 hacia la vía). Todo lo
   que en el informe depende de la casa —planta, isométrico, sombra, tabla de
   áreas, portada— pasa por aquí y, si hay casa propuesta, la usa en vez del
   tipo. El movimiento de tierra NO cambia: es el de la envolvente medida
   contra el terreno, y así se dice en la hoja.
   ========================================================================= */
function casaIA(n){
  const C = window.__CASA_IA;
  if(!C || String(C.lote)!==String(n) || !Array.isArray(C.reales) || !C.reales.length) return null;
  return C;
}
function bloquesIA(n){
  const C=casaIA(n), A=IMPL[String(n)], K=A&&A.k; if(!C||!K||!K.o) return null;
  const XY=(u,v)=>[K.o[0]+K.ux[0]*u+K.uv[0]*v, K.o[1]+K.ux[1]*u+K.uv[1]*v];
  return C.reales.map(b=>({nombre:b.nombre, clase:b.clase, nivel:b.nivel||1, alto:b.alto||0,
    u0:b.u0,v0:b.v0,u1:b.u1,v1:b.v1, area:(b.u1-b.u0)*(b.v1-b.v0),
    g:[XY(b.u0,b.v0),XY(b.u1,b.v0),XY(b.u1,b.v1),XY(b.u0,b.v1),XY(b.u0,b.v0)]}));
}
/* alturas de cada clase en la propuesta; el piso alto arranca sobre el bloque de abajo */
function altoBloqueIA(b, todos){
  if(b.clase!=="muro" && b.clase!=="porche") return 0.1;
  if(b.nivel!==2) return b.alto||3.4;
  const cu=(b.u0+b.u1)/2, cv=(b.v0+b.v1)/2;
  const bajo=(todos||[]).find(x=>x.clase==="muro"&&x.nivel!==2&&cu>=x.u0&&cu<=x.u1&&cv>=x.v0&&cv<=x.v1);
  return (bajo?(bajo.alto||3.4):3.4)+(b.alto||3.0);
}
const COLOR_IA = {muro:[70,88,64], porche:[150,160,140], patio:[205,196,170], deck:[160,112,66], piscina:[92,164,205]};
const COLOR_IA_CSS = {muro:"#465840", porche:"#96A08C", patio:"#CDC4AA", deck:"#A07042", piscina:"#5CA4CD"};
const claseIAtxt = c => ({muro:TT("Construido","Built","Bâti"), porche:TT("Cubierto (carport / porche)","Covered (carport / porch)","Couvert"),
  patio:TT("Patio","Patio","Patio"), deck:TT("Deck","Deck","Deck"), piscina:TT("Piscina","Pool","Piscine")})[c]||c;

/* =========================================================================
   PLAN DE PAGOS
   La cuota inicial se paga dentro de 2026: para separar entran $50.000.000 y el
   resto de la inicial se completa hasta diciembre. El saldo se reparte de enero
   de 2027 a diciembre de 2028, que son 24 meses: 23 cuotas del 3 % del saldo y
   una última que absorbe lo que quede, y por eso es la más alta.
     E1  contado (no hay saldo)      E2  60 % inicial      E3  50 % inicial
     E4, E5 y E6  20 % inicial
   ========================================================================= */
const SEPARACION = 50000000;
const INICIAL = {1:1.00, 2:0.60, 3:0.50, 4:0.20, 5:0.20, 6:0.20};
const PLAN_N = 23, PLAN_PCT = 0.03;
const PLAN_DESDE = "enero de 2027", PLAN_HASTA = "diciembre de 2028";
function planPago(L, e){
  const v = precio(L, e);
  const frac = (INICIAL[e] != null) ? INICIAL[e] : 1;
  const inicial = v * frac;
  const saldo = v - inicial;
  if(saldo <= 1){
    return {v:v, contado:true, inicial:inicial, saldo:0,
            separacion:Math.min(SEPARACION, inicial)};
  }
  const cuota = saldo * PLAN_PCT;
  const ultima = saldo - cuota * PLAN_N;
  return {v:v, contado:false, inicial:inicial, saldo:saldo, frac:frac,
          cuota:cuota, ultima:ultima, n:PLAN_N,
          separacion:Math.min(SEPARACION, inicial)};
}


/* ------------------------------ el sol -------------------------------- */
const SOL = (()=>{
  const rad=Math.PI/180, deg=180/Math.PI, HUSO=-5;
  function jd(a,m,d,h){ if(m<=2){a-=1;m+=12;}
    const A=Math.floor(a/100), B=2-A+Math.floor(A/4);
    return Math.floor(365.25*(a+4716))+Math.floor(30.6001*(m+1))+d+B-1524.5+h/24; }
  function posicion(a,m,d,hl,lat,lon){
    const t=(jd(a,m,d,hl-HUSO)-2451545)/36525;
    const L0=(280.46646+t*(36000.76983+t*0.0003032))%360;
    const M=357.52911+t*(35999.05029-0.0001537*t);
    const e=0.016708634-t*(0.000042037+0.0000001267*t);
    const C=Math.sin(M*rad)*(1.914602-t*(0.004817+0.000014*t))
           +Math.sin(2*M*rad)*(0.019993-0.000101*t)+Math.sin(3*M*rad)*0.000289;
    const om=125.04-1934.136*t, lam=L0+C-0.00569-0.00478*Math.sin(om*rad);
    const e0=23+(26+((21.448-t*(46.815+t*(0.00059-t*0.001813))))/60)/60;
    const ec=e0+0.00256*Math.cos(om*rad);
    const dec=Math.asin(Math.sin(ec*rad)*Math.sin(lam*rad))*deg;
    const y=Math.pow(Math.tan(ec/2*rad),2);
    const et=4*deg*(y*Math.sin(2*L0*rad)-2*e*Math.sin(M*rad)
      +4*e*y*Math.sin(M*rad)*Math.cos(2*L0*rad)-0.5*y*y*Math.sin(4*L0*rad)
      -1.25*e*e*Math.sin(2*M*rad));
    const ts=((hl*60+et+4*lon-60*HUSO)%1440+1440)%1440;
    let H=ts/4-180; if(H<-180)H+=360;
    const la=lat*rad, de=dec*rad, ha=H*rad;
    const cz=Math.sin(la)*Math.sin(de)+Math.cos(la)*Math.cos(de)*Math.cos(ha);
    const z=Math.acos(Math.max(-1,Math.min(1,cz))), alt=90-z*deg;
    let az; const den=Math.sin(z)*Math.cos(la);
    if(Math.abs(den)<1e-9) az=H>0?180:0;
    else{ let ca=(Math.sin(la)*Math.cos(z)-Math.sin(de))/den;
      ca=Math.max(-1,Math.min(1,ca)); az=Math.acos(ca)*deg;
      if(H>0)az=360-az; az=(180+(360-az))%360; }
    return {alt, az:((az%360)+360)%360, dec};
  }
  function recorrido(a,m,d,lat,lon){ const r=[];
    for(let h=0;h<=24;h+=1/6){ const p=posicion(a,m,d,h,lat,lon); if(p.alt>-0.5)r.push({h,alt:p.alt,az:p.az}); }
    return r; }
  function hitos(a,m,d,lat,lon){ const r=recorrido(a,m,d,lat,lon); if(!r.length)return null;
    let mx=r[0]; r.forEach(p=>{if(p.alt>mx.alt)mx=p;});
    return {salida:r[0],puesta:r[r.length-1],mediodia:mx,
            horasLuz:+(r[r.length-1].h-r[0].h).toFixed(2),recorrido:r}; }
  const FECHAS=[{k:"jun",t:"Solsticio de junio",m:6,d:21,c:"#C48A2A"},
                {k:"eq", t:"Equinoccios",       m:3,d:20,c:"#9B7A48"},
                {k:"dic",t:"Solsticio de diciembre",m:12,d:21,c:"#4C7FB0"}];
  return {posicion,recorrido,hitos,FECHAS};
})();
const ANIO=new Date().getFullYear();
const HITOS=SOL.FECHAS.map(f=>Object.assign({},f,SOL.hitos(ANIO,f.m,f.d,lat0,lon0)));

/* ------------------------- utilidades de geometría --------------------- */
function ejeLargo(g){                    /* rumbo del eje largo, 0..180 desde el norte */
  let mej=0,b=0;
  for(let i=0;i<g.length-1;i++){
    const dx=g[i+1][0]-g[i][0], dy=g[i+1][1]-g[i][1];
    const L=Math.hypot(dx,dy);
    if(L>mej){ mej=L; b=(Math.atan2(dx,-dy)*180/Math.PI+360)%180; }
  }
  return {rumbo:b, largo:mej};
}
const rumboTxt=b=>{
  const d=["norte","nororiente","oriente","suroriente","sur","suroccidente","occidente","noroccidente"];
  return T(d[Math.round(((b%360)+360)%360/45)%8]);
};
/* La altura del volumen: 4,00 m, que es la de los tres tipos reales del
   proyecto. Estaba en 5,0 m —la de la casa de estudio 30JB— y con eso la
   sombra del informe salía un 25 % más larga que el volumen que se dibuja. */
const ALTURA_MAX=ALTO_TIPO, ENTRE_NIVELES=3.0;

/* ---------------------------------------------------------------------------
   CÓMO SE NOMBRA EL TERRENO EN LA FICHA, IGUAL EN LOS 86 LOTES.
   Antes el bloque TERRENO cambiaba de forma según el lote: unos mostraban
   "Cota" y otros "Área levantada", y donde no había topografía salía un guion
   que no le dice nada a nadie. Dos fichas no se podían comparar lado a lado.
   Ahora las cuatro filas van siempre, en el mismo orden, y donde no hay dato
   medido se dice con palabras qué hay en su lugar. En los seis lotes sin
   levantamiento completo —65 a 70— el dato es de campo: la gerencia técnica
   los conoce y los sitúa por encima del 25 % de pendiente.
   --------------------------------------------------------------------------- */

/* el render de la casa de referencia: el paquete web lo publica en MEDIOS y el
   plano vivo lo trae incrustado; si no está ninguno, se cae a la ruta suelta */
function VOLUMEN_CASA(){
  try{
    if(typeof MEDIOS!=="undefined" && MEDIOS.casa_volumen) return MEDIOS.casa_volumen;
  }catch(e){}
  return "medios/casa_volumen.jpg";
}
function RENDER_CASA(){
  try{
    if(typeof MEDIOS!=="undefined" && MEDIOS.casa_render) return MEDIOS.casa_render;
    if(typeof window.__REN_CASA==="string") return window.__REN_CASA;
  }catch(e){}
  return "medios/casa_render.jpg";
}
function pendTxt(A, corto){
  if(A && A.pend){
    const p = (LANG==="es") ? A.pend : String(A.pend).replace(/,/g,".");
    /* en las celdas estrechas sobra el ángulo entre paréntesis */
    return corto ? p.replace(/\s*\(.*\)\s*$/,"") : p;
  }
  /* la coletilla "dato de campo" no cabe en una celda de un cuarto de hoja:
     ahí va sólo el rango, y la explicación completa vive en el bloque TERRENO */
  if(corto) return TT("Más del 25 %","Over 25%","Plus de 25 %");
  return TT("Más del 25 % · dato de campo",
            "Over 25% · field data",
            "Plus de 25 % · donnée de terrain");
}
function cotaTxt(A){
  if(A && A.cota){
    const mc = String(A.cota).match(/(\d+)\D+(\d+)/);
    return mc ? ent(+mc[1])+"–"+ent(+mc[2])+SNM() : A.cota;
  }
  return TT("Sin levantamiento topográfico","Not surveyed","Sans levé topographique");
}
const CLASES=[["Plano","menos de 5 %","#4C8862"],["Suave","5 – 10 %","#7BA36B"],
              ["Medio","10 – 15 %","#C4B45A"],["Fuerte","15 – 25 %","#C48A2A"],
              ["Muy pendiente","más de 25 %","#A3543F"]];
/* La sexta "clase": el terreno que quedó fuera del levantamiento.
   No hay curvas de nivel ahí, así que no hay pendiente MEDIDA. Lo que hay es una
   pendiente DECLARADA: la gerencia técnica del proyecto conoce el predio en campo
   y la fija en el rango de MÁS del 25 %. No es lo mismo que un dato de topografía
   y en ninguna figura se mezcla con él: se pinta del color del de "muy pendiente" —para
   que nadie lea esa franja como terreno plano, que era el error— pero siempre
   rayada, y cada cifra que sale de ahí dice de dónde viene. */
const DECL_CLASE = 3;                              /* "Fuerte · 15 – 25 %" */
const DECL_TRAMA = "#8A5F14";                      /* la raya, sobre el color del rango */
const SIN_LEV=["Sin levantar","15 – 25 %, declarado en campo","#C48A2A"];
const SNM = () => TT(" m s. n. m."," m a.s.l.");

/* =========================================================================
   MDT AL ALCANCE DEL ANÁLISIS
   Hasta ahora las alturas sólo las usaba el relieve 3D. El corte del terreno
   y el mapa de pendientes las necesitan también, así que se decodifican una
   sola vez y quedan disponibles como cota y pendiente en cualquier punto.

   TER viene de earth/terreno_px.json: rejilla de 4 m en la proyección local
   del predio, alturas en centímetros sobre z0, y 65535 como "fuera del predio".
   El bit 15 marca los nodos de RELLENO: donde el plano no trae curvas se pone la
   cota del punto de curva más cercano, sólo para que el relieve no acabe en un
   tajo. Para todo lo que se mide —pendiente, cota, corte, curvas de nivel— esos
   nodos valen lo mismo que un hueco: NaN. El relieve 3D sí los dibuja, aparte.
   ========================================================================= */
const MDT = (()=>{
  let H=null, HR=null, HD=null;
  function cargar(){
    if(H) return H;
    const b=atob(TER.d), n=b.length, u=new Uint8Array(n);
    for(let i=0;i<n;i++) u[i]=b.charCodeAt(i);
    const q=new Uint16Array(u.buffer);
    H =new Float32Array(TER.nx*TER.ny);     /* sólo lo levantado */
    HR=new Float32Array(TER.nx*TER.ny);     /* levantado + relleno plano, heredado */
    for(let i=0;i<H.length;i++){
      const v=q[i];
      if(v===65535){ H[i]=NaN; HR[i]=NaN; continue; }
      const z = TER.z0 + (v & 0x7FFF)/100;
      HR[i]=z;
      H[i] = (v & 0x8000) ? NaN : z;
    }
    return H;
  }

  /* ---------------------------------------------------------------------
     SUPERFICIE DECLARADA
     El relleno del modelo copiaba la cota del punto de curva más cercano, así
     que la franja sin levantar salía a nivel: una meseta que no existe. La
     gerencia técnica del proyecto conoce el predio y declara esa franja en
     pendiente fuerte, así que aquí se construye una superficie que la baje de
     verdad, con una regla escrita y no a ojo:

       cota(P) = cota(B) − 0,20 · distancia(P,B)

     donde B es el nodo levantado MÁS CERCANO a P. La cota de arranque y la
     posición del borde son dato del levantamiento; lo único declarado es el
     20 % —el centro del clase "muy pendiente", más del 25 %— y el que la ladera siga cayendo
     al alejarse de lo medido, que es la forma del predio: lo levantado es la
     parte de arriba, contra la vía, y lo que falta es la de atrás.

     Esto NO entra en ninguna cifra medida: cota() y pendiente() siguen dando
     NaN ahí, las barras del informe no se mueven y cada dibujo que usa esta
     superficie sale rayado y rotulado como declarado.
     --------------------------------------------------------------------- */
  const PEND_DECLARADA = 0.28;
  function declarar(){
    if(HD) return HD;
    cargar();
    const nx=TER.nx, ny=TER.ny, n=nx*ny;
    const zB=new Float32Array(n), dB=new Float32Array(n);
    HD=new Float32Array(n);
    const cola=[];
    for(let k=0;k<n;k++){
      if(!isNaN(H[k])){ zB[k]=H[k]; dB[k]=0; cola.push(k); }
      else { zB[k]=NaN; dB[k]=Infinity; }
    }
    /* relajación por vecindad de 8: el frente avanza desde el borde levantado
       hacia adentro del relleno y cada nodo se queda con el camino más corto */
    for(let t=0; t<cola.length; t++){
      const k=cola[t], j=(k/nx)|0, i=k-j*nx;
      for(let dj=-1;dj<=1;dj++) for(let di=-1;di<=1;di++){
        if(!di && !dj) continue;
        const a=i+di, b=j+dj;
        if(a<0||b<0||a>=nx||b>=ny) continue;
        const m=b*nx+a;
        if(!isNaN(H[m]) || isNaN(HR[m])) continue;     /* sólo nodos de relleno */
        const d = dB[k] + TER.s*Math.hypot(di,dj);
        if(d < dB[m]-1e-6){ dB[m]=d; zB[m]=zB[k]; cola.push(m); }
      }
    }
    /* Un tope real, no un número puesto a dedo: la superficie declarada no baja
       de la cota más baja que el levantamiento midió en todo el predio. Al 20 %
       sostenido durante 120 m la ladera se hundiría por debajo de cualquier cosa
       medida, y eso ya no sería declarar una pendiente sino inventar un abismo. */
    let zSuelo=Infinity;
    for(let k=0;k<n;k++) if(!isNaN(H[k])) zSuelo=Math.min(zSuelo,H[k]);
    for(let k=0;k<n;k++){
      HD[k] = !isNaN(H[k]) ? H[k]
            : (isNaN(HR[k]) || isNaN(zB[k])) ? NaN
            : Math.max(zSuelo, zB[k] - PEND_DECLARADA*dB[k]);
    }
    return HD;
  }
  /* cota para DIBUJAR el volumen: medida donde la hay, declarada donde no */
  function cotaDibujo(x,y){
    const G=declarar();
    const fi=(x-TER.x)/TER.s, fj=(y-TER.y)/TER.s;
    const i=Math.floor(fi), j=Math.floor(fj);
    if(i<0||j<0||i>=TER.nx-1||j>=TER.ny-1) return NaN;
    const tx=fi-i, ty=fj-j, N=(a,b)=>G[b*TER.nx+a];
    const a=N(i,j), b=N(i+1,j), c=N(i,j+1), d=N(i+1,j+1);
    if(isNaN(a)||isNaN(b)||isNaN(c)||isNaN(d)) return NaN;
    return (a*(1-tx)+b*tx)*(1-ty)+(c*(1-tx)+d*tx)*ty;
  }
  /* ¿este punto es relleno? */
  function esRelleno(x,y){
    cargar();
    const i=Math.round((x-TER.x)/TER.s), j=Math.round((y-TER.y)/TER.s);
    if(i<0||j<0||i>=TER.nx||j>=TER.ny) return false;
    const k=j*TER.nx+i;
    return !isNaN(HR[k]) && isNaN(H[k]);
  }
  const nodo=(i,j)=>{
    if(i<0||j<0||i>=TER.nx||j>=TER.ny) return NaN;
    return cargar()[j*TER.nx+i];
  };
  /* cota interpolada bilinealmente en coordenadas locales (x este, y sur) */
  function cota(x,y){
    const fi=(x-TER.x)/TER.s, fj=(y-TER.y)/TER.s;
    const i=Math.floor(fi), j=Math.floor(fj);
    const a=nodo(i,j), b=nodo(i+1,j), c=nodo(i,j+1), d=nodo(i+1,j+1);
    if(isNaN(a)||isNaN(b)||isNaN(c)||isNaN(d)) return NaN;
    const tx=fi-i, ty=fj-j;
    return (a*(1-tx)+b*tx)*(1-ty)+(c*(1-tx)+d*tx)*ty;
  }
  /* pendiente en %, por diferencias centradas sobre un paso de media rejilla.
     Es el mismo criterio con el que se calculó el reparto por clases del lote:
     magnitud del gradiente, no la pendiente en una dirección concreta. */
  const P=TER.s/2;
  function pendiente(x,y){
    const zx1=cota(x+P,y), zx0=cota(x-P,y), zy1=cota(x,y+P), zy0=cota(x,y-P);
    if(isNaN(zx1)||isNaN(zx0)||isNaN(zy1)||isNaN(zy0)) return NaN;
    const dzdx=(zx1-zx0)/(2*P), dzdy=(zy1-zy0)/(2*P);
    return Math.hypot(dzdx,dzdy)*100;
  }
  /* dirección de máxima bajada, en el frame local (x este, y sur) */
  function bajada(x,y){
    const zx1=cota(x+P,y), zx0=cota(x-P,y), zy1=cota(x,y+P), zy0=cota(x,y-P);
    if(isNaN(zx1)||isNaN(zx0)||isNaN(zy1)||isNaN(zy0)) return null;
    const dx=-(zx1-zx0), dy=-(zy1-zy0), m=Math.hypot(dx,dy);
    return m<1e-9 ? null : [dx/m, dy/m];
  }
  const clase = p => { for(let i=0;i<CLASES_LIM.length;i++) if(p<CLASES_LIM[i]) return i; return CLASES.length-1; };
  return {cota, pendiente, bajada, clase, cotaDibujo, esRelleno, PEND_DECLARADA};
})();
/* los cortes de clase, en %, iguales a los del reparto: <5, 5–10, 10–15, 15–25, >25 */
/* =========================================================================
   CURVAS DE NIVEL SOBRE EL MDT — cuadros marchantes
   El plano trae las curvas del levantamiento, pero dibujarlas en la planta del
   informe exigiría recortarlas al lote y volver a proyectarlas. Sale más
   limpio calcularlas del mismo modelo de alturas con el que se hacen el mapa
   de pendientes y el corte: así las tres figuras dicen lo mismo, celda a celda.
   Se trabaja en el marco YA GIRADO del dibujo, para que caigan encima sin
   desfase. Devuelve metros de ese marco.
   ========================================================================= */
/* Cuánto del lote tiene de verdad altura levantada. El modelo del terreno se
   extiende más allá del área con curvas con un relleno suavizado —bueno para que
   el relieve no acabe en un tajo, pero no es dato—, así que antes de dar cifras
   de pendiente hay que saber sobre qué parte se están dando. Devuelve 0 a 1. */
/* Aviso para los lotes que quedaron fuera —del todo o en parte— del área
   levantada. Sin esto la hoja daba pendientes, corte e implantación de esos
   lotes con la misma cara que los demás, cuando por debajo hay relleno y no
   levantamiento. Se dice el porcentaje medido, no una vaguedad. */
function avisoLevantamiento(n){
  const L = DATA.lotes.find(x=>x.n===n);
  if(!L) return "";
  const A = IMPL[String(n)];
  /* la cobertura viene medida del propio modelo, guardada lote por lote */
  const cob = (A && A.cob!=null) ? A.cob : coberturaMDT(L.g.map(PX), 2.0);
  if(cob >= 0.98) return "";
  const pct = Math.round(cob*100);
  const falta = L.at - (A && A.am2!=null ? A.am2 : L.at*cob);
  return '<div class="avisoDato">'+
    '<b>'+TT("Parte de este lote no está levantada.",
             "Part of this lot is not surveyed.",
             "Une partie de ce lot n\u0027est pas levée.")+'</b> '+
    TT("Sólo el "+pct+" % de su superficie está dentro del área con curvas de nivel. Los "+
       fmtA(falta)+" restantes van <b>rayados</b> en los dibujos y se representan con "+
       "<b>pendiente de más del 25 %, declarada en campo por la gerencia técnica del "+
       "proyecto</b> —no medida con topografía—: es la parte de atrás del lote, la que cae. "+
       "Las cifras de pendiente, el corte del terreno y la implantación de la casa se calculan "+
       "sólo sobre lo levantado, y así se dicen. Antes de escriturar hay que levantar esa franja "+
       "y confirmar el dato.",
       "Only "+pct+"% of its surface lies inside the surveyed contour area. The remaining "+
       fmtA(falta)+" show <b>hatched</b> in the drawings and are represented as <b>steep ground "+
       "(15–25%), declared on site by the project\u0027s technical management</b> — not measured by "+
       "survey: it is the back of the lot, the part that falls. Slope figures, the terrain section "+
       "and the house siting are computed on the surveyed part only, and say so. That strip must be "+
       "surveyed and the figure confirmed before closing.",
       "Seulement "+pct+" % de sa surface se trouve dans la zone levée. Les "+fmtA(falta)+
       " restants sont <b>hachurés</b> sur les dessins et représentés comme un <b>terrain à forte "+
       "pente (15–25 %), déclarée sur le terrain par la direction technique du projet</b> — non "+
       "mesurée par levé : c\u0027est l\u0027arrière du lot, la partie qui descend. Les chiffres de pente, "+
       "la coupe et l\u0027implantation sont calculés sur la seule partie levée, et le disent. Il faut "+
       "lever cette bande et confirmer la donnée avant de conclure.")+
    '</div>';
}

function coberturaMDT(ring, paso){
  const P = paso || 2.0;
  let x0=1e9, y0=1e9, x1=-1e9, y1=-1e9;
  ring.forEach(q=>{ x0=Math.min(x0,q[0]); x1=Math.max(x1,q[0]);
                    y0=Math.min(y0,q[1]); y1=Math.max(y1,q[1]); });
  let total=0, conDato=0;
  for(let y=y0; y<y1; y+=P) for(let x=x0; x<x1; x+=P){
    if(!dentroAnillo(x,y,ring)) continue;
    total++;
    if(!isNaN(MDT.cota(x,y))) conDato++;
  }
  return total ? conDato/total : 0;
}

/* fz permite trazar las curvas sobre otra superficie que la medida: se usa con
   MDT.cotaDibujo para dibujar, aparte y de otro color, las curvas de la franja
   declarada. Por omisión, la cota medida y nada más. */
function curvasNivel(x0, y0, x1, y1, Rinv, paso, intervalo, fz){
  const cotaDe = fz || ((a,b)=>MDT.cota(a,b));
  const nx = Math.ceil((x1-x0)/paso)+1, ny = Math.ceil((y1-y0)/paso)+1;
  if(nx<2 || ny<2 || nx*ny > 250000) return [];
  const Z = new Float64Array(nx*ny);
  let zmin=Infinity, zmax=-Infinity;
  for(let j=0;j<ny;j++) for(let i=0;i<nx;i++){
    const p = Rinv([x0+i*paso, y0+j*paso]);
    const z = cotaDe(p[0], p[1]);
    Z[j*nx+i] = z;
    if(!isNaN(z)){ if(z<zmin) zmin=z; if(z>zmax) zmax=z; }
  }
  if(!isFinite(zmin) || zmax-zmin < intervalo*0.5) return [];
  /* En un lote de 22 m de desnivel, curvas cada metro se apelmazan en un borrón
     negro donde más inclina. Se abre el intervalo hasta que quepan de a doce,
     que es lo que se lee en una figura de este tamaño. La cota rotulada dice
     siempre cuál es el intervalo real, así que no se pierde precisión. */
  while((zmax-zmin)/intervalo > 12) intervalo = (intervalo===1) ? 2 : (intervalo===2 ? 5 : intervalo*2);
  const cruce=(za,zb,xa,ya,xb,yb,nv)=>{
    if((za<nv) === (zb<nv)) return null;
    const t=(nv-za)/(zb-za);
    return [xa+(xb-xa)*t, ya+(yb-ya)*t];
  };
  const salida=[];
  for(let nv=Math.ceil(zmin/intervalo)*intervalo; nv<=zmax; nv+=intervalo){
    const segs=[];
    for(let j=0;j<ny-1;j++) for(let i=0;i<nx-1;i++){
      const a=Z[j*nx+i], b=Z[j*nx+i+1], c=Z[(j+1)*nx+i+1], d=Z[(j+1)*nx+i];
      if(isNaN(a)||isNaN(b)||isNaN(c)||isNaN(d)) continue;
      const X=x0+i*paso, Y=y0+j*paso, P=paso;
      const pt=[];
      const s1=cruce(a,b,X,Y,X+P,Y,nv);           if(s1) pt.push(s1);
      const s2=cruce(b,c,X+P,Y,X+P,Y+P,nv);       if(s2) pt.push(s2);
      const s3=cruce(c,d,X+P,Y+P,X,Y+P,nv);       if(s3) pt.push(s3);
      const s4=cruce(d,a,X,Y+P,X,Y,nv);           if(s4) pt.push(s4);
      if(pt.length===2) segs.push([pt[0],pt[1]]);
      else if(pt.length===4){ segs.push([pt[0],pt[1]]); segs.push([pt[2],pt[3]]); }
    }
    if(segs.length){
      const paso5 = Math.max(5, intervalo*2);      /* la gruesa, cada 5 m o cada dos curvas */
      const r = nv/paso5;
      salida.push({cota:nv, maestra: Math.abs(r-Math.round(r)) < 1e-9, segs:segs});
    }
  }
  return salida;
}

const CLASES_LIM=[5,10,15,25];

/* muestreo de un lote: rejilla regular de paso `paso` metros dentro del anillo */
function muestrearLote(ring, paso){
  let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
  ring.forEach(p=>{x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);y0=Math.min(y0,p[1]);y1=Math.max(y1,p[1]);});
  const out=[];
  for(let y=y0+paso/2; y<y1; y+=paso)
    for(let x=x0+paso/2; x<x1; x+=paso){
      if(!dentroAnillo(x,y,ring)) continue;
      const p=MDT.pendiente(x,y);
      if(isNaN(p)) continue;
      out.push([x,y,p]);
    }
  return out;
}
/* Caja envolvente cacheada por anillo: dentroAnillo era el 38 % del tiempo de
   abrir un análisis, y la mayoría de las llamadas son puntos que ni siquiera
   caen en la caja del anillo (las fajas de protección, sobre todo). */
const CAJA_ANILLO = new WeakMap();
function cajaAnillo(ring){
  let c = CAJA_ANILLO.get(ring);
  if(c) return c;
  let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
  for(let i=0;i<ring.length;i++){ const p=ring[i];
    if(p[0]<x0)x0=p[0]; if(p[0]>x1)x1=p[0];
    if(p[1]<y0)y0=p[1]; if(p[1]>y1)y1=p[1]; }
  c=[x0,y0,x1,y1]; CAJA_ANILLO.set(ring,c); return c;
}
function dentroAnillo(x,y,ring){
  const c=cajaAnillo(ring);
  if(x<c[0]||x>c[2]||y<c[1]||y>c[3]) return false;
  let d=false;
  for(let i=0,j=ring.length-1;i<ring.length;j=i++){
    const xi=ring[i][0],yi=ring[i][1],xj=ring[j][0],yj=ring[j][1];
    if(((yi>y)!==(yj>y)) && (x<(xj-xi)*(y-yi)/(yj-yi)+xi)) d=!d;
  }
  return d;
}

/* =========================================================================
   MAPA DE PENDIENTES DEL LOTE
   El mismo lote, pintado celda a celda con los cinco colores del reparto:
   de un vistazo se ve DÓNDE está lo plano y dónde la ladera, que es lo que
   el porcentaje agregado no dice.
   Paso de 2 m: la rejilla del MDT es de 4 m, así que 2 m interpola sin
   inventar detalle que el levantamiento no tiene.
   ========================================================================= */
/* El lienzo de pendientes: un pixel, una muestra. Devuelve un data URI para
   colgarlo del SVG. Se dibuja al doble de resolución para que no se vea el
   escalón al ampliarlo o al imprimirlo. */
/* =========================================================================
   ACOTACIÓN DEL LOTE
   Las medidas de cada lado, rotuladas sobre el lado y giradas con él, como en
   cualquier plano. Sin esto la planta del informe se ve pero no se mide, y lo
   primero que hace un cliente frente a un lote es preguntar cuánto tiene de
   frente y cuánto de fondo.
   Recibe la proyección ya armada de la figura: devuelve SVG listo para pegar.
   ========================================================================= */
function acotarLote(g0, XY, minPx, fs){
  const F = fs || 9;
  let o = '<g class="acot" fill="var(--ink-2)" stroke="var(--ground-in)" '+
          'stroke-width="'+(F*0.32).toFixed(2)+'" paint-order="stroke" '+
          'font-size="'+F.toFixed(1)+'" font-weight="600" text-anchor="middle">';
  let hubo = false;
  const puestos = [];
  for(let i=0;i<g0.length-1;i++){
    const a=g0[i], b=g0[i+1];
    const largo = Math.hypot(b[0]-a[0], b[1]-a[1]);
    if(largo < 3) continue;
    const pa = XY(a), pb = XY(b);
    const px = Math.hypot(pb[0]-pa[0], pb[1]-pa[1]);
    if(px < (minPx||46)) continue;                  /* no cabe el número */
    const mx = (pa[0]+pb[0])/2, my = (pa[1]+pb[1])/2;
    if(puestos.some(q=>Math.abs(q[0]-mx)<F*3.4 && Math.abs(q[1]-my)<F*1.7)) continue;
    puestos.push([mx,my]);
    let ang = Math.atan2(pb[1]-pa[1], pb[0]-pa[0])*180/Math.PI;
    if(ang>90) ang-=180; if(ang<-90) ang+=180;      /* que nunca quede de cabeza */
    o += '<text x="'+mx.toFixed(1)+'" y="'+my.toFixed(1)+'" dy="'+(-F*0.42).toFixed(1)+
         '" transform="rotate('+ang.toFixed(1)+' '+mx.toFixed(1)+' '+my.toFixed(1)+')">'+
         dec(largo,1)+' m</text>';
    hubo = true;
  }
  return hubo ? o+'</g>' : '';
}

function lienzoPendientes(g0, x0, y0, x1, y1, s, Rinv, w, h){
  const ESC = 2;
  const W = Math.max(2, Math.round(w*ESC)), H = Math.max(2, Math.round(h*ESC));
  if(W*H > 4.2e6) return null;                 /* que no se dispare en un móvil */
  let cv;
  try{ cv = document.createElement("canvas"); }catch(e){ return null; }
  cv.width = W; cv.height = H;
  const cx = cv.getContext("2d");
  const img = cx.createImageData(W, H);
  const D = img.data;
  /* los colores de las clases, ya en RGB, para no parsear por pixel */
  const RGB = CLASES.map(c=>{
    const v = c[2].replace("#","");
    return [parseInt(v.slice(0,2),16), parseInt(v.slice(2,4),16), parseInt(v.slice(4,6),16)];
  });
  for(let py=0; py<H; py++){
    const ry = y0 + (py+0.5)/ESC/s;
    for(let px=0; px<W; px++){
      const rx = x0 + (px+0.5)/ESC/s;
      const p = Rinv([rx, ry]);
      const k = (py*W+px)*4;
      if(!dentroAnillo(p[0], p[1], g0)) continue;      /* transparente */
      const pe = MDT.pendiente(p[0], p[1]);
      if(isNaN(pe)) continue;
      const c = RGB[MDT.clase(pe)];
      D[k]=c[0]; D[k+1]=c[1]; D[k+2]=c[2]; D[k+3]=255;
    }
  }
  cx.putImageData(img, 0, 0);
  try{ return cv.toDataURL("image/png"); }catch(e){ return null; }
}

function mapaPendientes(n, W, H){
  const L=DATA.lotes.find(x=>x.n===n), A=IMPL[String(n)];
  if(!L) return "";
  const g0=L.g.map(PX);

  /* mismo giro que la planta: el lado más largo horizontal */
  let mej=0, th=0;
  for(let i=0;i<g0.length-1;i++){
    const dx=g0[i+1][0]-g0[i][0], dy=g0[i+1][1]-g0[i][1], Lg=Math.hypot(dx,dy);
    if(Lg>mej){ mej=Lg; th=-Math.atan2(dy,dx); }
  }
  const ct=Math.cos(th), stt=Math.sin(th);
  const R=p=>[p[0]*ct-p[1]*stt, p[0]*stt+p[1]*ct];
  let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
  g0.map(R).forEach(q=>{x0=Math.min(x0,q[0]);x1=Math.max(x1,q[0]);y0=Math.min(y0,q[1]);y1=Math.max(y1,q[1]);});
  const pad=4; x0-=pad;x1+=pad;y0-=pad;y1+=pad;
  const s=Math.min(W/(x1-x0), H/(y1-y0));
  const XY=p=>{const q=R(p);return [((q[0]-x0)*s), ((q[1]-y0)*s)];};
  const w=(x1-x0)*s, h=(y1-y0)*s;
  const d=(ring,c)=>ring.map((p,i)=>{const q=XY(p);return (i?"L":"M")+q[0].toFixed(1)+" "+q[1].toFixed(1);}).join("")+(c?"Z":"");

  /* La pendiente se pinta punto por punto sobre un lienzo, no en celdas de 2 m.
     Con celdas el mapa salía a cuadros —se veía la rejilla del modelo, no la
     ladera— y para mostrárselo a un cliente eso no sirve. Muestreando por pixel
     los bordes entre rangos salen continuos y limpios. El dato es el mismo: la
     misma pendiente del mismo MDT, sólo que interpolada más fino. */
  const Rinv=q=>[q[0]*ct+q[1]*stt, -q[0]*stt+q[1]*ct];   /* del marco girado al local */

  let o='<svg viewBox="0 0 '+w.toFixed(0)+' '+h.toFixed(0)+'" width="100%" height="'+Math.round(H)+
        '" preserveAspectRatio="xMidYMid meet" style="display:block;border-radius:9px;background:var(--surface-2)">';
  o+='<defs><clipPath id="clp'+n+'"><path d="'+d(g0,1)+'"/></clipPath>'+
      '<pattern id="tnp'+n+'" width="7" height="7" patternUnits="userSpaceOnUse" '+
        'patternTransform="rotate(45)">'+
        '<rect width="7" height="7" fill="'+SIN_LEV[2]+'"/>'+
        '<line x1="0" y1="0" x2="0" y2="7" stroke="'+DECL_TRAMA+'" stroke-width="2.2"/>'+
      '</pattern></defs>';
  o+='<path d="'+d(g0,1)+'" fill="var(--ground-in)"/>';
  /* Debajo del color va la trama: donde el lienzo no pinta —porque ahí no hay
     curvas— asoma el rayado. Antes asomaba el color liso del suelo y esa parte
     se leía como terreno plano; es lo contrario, es la que no se midió. */
  const A0=IMPL[String(n)];
  if(A0 && A0.cob!=null && A0.cob<0.98)
    o+='<path d="'+d(g0,1)+'" fill="url(#tnp'+n+')"/>';
  const lienzo = lienzoPendientes(g0, x0, y0, x1, y1, s, Rinv, w, h);
  if(lienzo) o+='<image href="'+lienzo+'" x="0" y="0" width="'+w.toFixed(1)+
                '" height="'+h.toFixed(1)+'" clip-path="url(#clp'+n+')" '+
                'preserveAspectRatio="none"/>';

  /* Las curvas de nivel encima del color: el color dice cuánto inclina y la
     curva por dónde va la ladera. Cada metro, y cada 5 m con más peso y su cota
     rotulada, que es como se leen en un plano topográfico. */
  const CN = curvasNivel(x0, y0, x1, y1, Rinv, 2.0, 1.0);
  if(CN.length){
    o+='<g clip-path="url(#clp'+n+')" fill="none" stroke="#2B2A22" stroke-linecap="round">';
    CN.forEach(c=>{
      let dd="";
      c.segs.forEach(([a,b])=>{
        dd += "M"+((a[0]-x0)*s).toFixed(1)+" "+((a[1]-y0)*s).toFixed(1)
            + "L"+((b[0]-x0)*s).toFixed(1)+" "+((b[1]-y0)*s).toFixed(1);
      });
      o+='<path d="'+dd+'" stroke-width="'+(c.maestra?1.15:0.5)+
         '" stroke-opacity="'+(c.maestra?.55:.28)+'"/>';
    });
    o+='</g>';
    /* la cota de las maestras, sobre el segmento del medio */
    const puestas=[];
    CN.filter(c=>c.maestra).forEach(c=>{
      const sg = c.segs[Math.floor(c.segs.length/2)];
      const px=((sg[0][0]+sg[1][0])/2 - x0)*s, py=((sg[0][1]+sg[1][1])/2 - y0)*s;
      if(puestas.some(q=>Math.abs(q[0]-px)<34 && Math.abs(q[1]-py)<13)) return;
      puestas.push([px,py]);
      o+='<text x="'+px.toFixed(1)+'" y="'+py.toFixed(1)+'" font-size="8.5" font-weight="600" '+
         'text-anchor="middle" dominant-baseline="middle" fill="#2B2A22" '+
         'stroke="var(--surface-2)" stroke-width="2.6" paint-order="stroke">'+
         ent(c.cota)+'</text>';
    });
  }

  /* Las curvas de la franja declarada: mismo intervalo de lectura, pero
     punteadas y en el tono del clase "muy pendiente", y sólo donde NO hay levantamiento.
     Es lo que le permite al cliente ver que la ladera sigue bajando después del
     borde del levantamiento, sin confundirlas con las medidas. */
  if(A0 && A0.cob!=null && A0.cob<0.98){
    const CD = curvasNivel(x0, y0, x1, y1, Rinv, 2.5, 1.0,
                           (a,b)=> isNaN(MDT.cota(a,b)) ? MDT.cotaDibujo(a,b) : NaN);
    if(CD.length){
      o+='<g clip-path="url(#clp'+n+')" fill="none" stroke="'+DECL_TRAMA+'" '+
         'stroke-linecap="round" stroke-dasharray="4 3">';
      CD.forEach(c=>{
        let dd="";
        c.segs.forEach(([a,b])=>{
          dd += "M"+((a[0]-x0)*s).toFixed(1)+" "+((a[1]-y0)*s).toFixed(1)
              + "L"+((b[0]-x0)*s).toFixed(1)+" "+((b[1]-y0)*s).toFixed(1);
        });
        o+='<path d="'+dd+'" stroke-width="'+(c.maestra?1.5:0.75)+
           '" stroke-opacity="'+(c.maestra?.95:.6)+'"/>';
      });
      o+='</g>';
      const puestasD=[];
      CD.filter(c=>c.maestra).forEach(c=>{
        const sg = c.segs[Math.floor(c.segs.length/2)];
        const px=((sg[0][0]+sg[1][0])/2 - x0)*s, py=((sg[0][1]+sg[1][1])/2 - y0)*s;
        if(puestasD.some(q=>Math.abs(q[0]-px)<40 && Math.abs(q[1]-py)<14)) return;
        puestasD.push([px,py]);
        o+='<text x="'+px.toFixed(1)+'" y="'+py.toFixed(1)+'" font-size="8.5" font-weight="600" '+
           'text-anchor="middle" dominant-baseline="middle" fill="#4A320A" '+
           'stroke="#F6E3BE" stroke-width="2.8" paint-order="stroke">'+
           ent(c.cota)+'</text>';
      });
    }
  }

  /* la faja de protección va encima: ahí no se construye, pinte lo que pinte la pendiente */
  DATA.prot.forEach(r=>{ const rr=r.map(PX);
    o+='<path d="'+d(rr,1)+'" fill="#1F3A22" fill-opacity=".42" stroke="#9CC79B" stroke-width=".8" '+
       'clip-path="url(#clp'+n+')"/>'; });
  /* el polígono construible y la casa, para leer la pendiente donde importa */
  if(A&&A.c) o+='<path d="'+d(A.c,1)+'" fill="none" stroke="var(--gold)" stroke-width="1.4" stroke-dasharray="5 4"/>';
  if(A&&A.k) o+='<path d="'+d(A.k.g,1)+'" fill="none" stroke="#FFFFFF" stroke-width="2.2" stroke-opacity=".9"/>'
             + '<path d="'+d(A.k.g,1)+'" fill="none" stroke="var(--forest-deep)" stroke-width="1"/>';
  o+='<path d="'+d(g0,1)+'" fill="none" stroke="var(--ink-2)" stroke-width="1.6"/>';
  o+=acotarLote(g0, XY, 46, 9);

  /* escala */
  const m=[10,20,25].find(v=>v*s<w*0.32)||10;
  o+='<g transform="translate('+(w-14-m*s).toFixed(1)+','+(h-14).toFixed(1)+')" '+
     'stroke="var(--ink-2)" stroke-width="1.1" fill="var(--ink-2)">'+
     '<line x1="0" y1="0" x2="'+(m*s).toFixed(1)+'" y2="0"/>'+
     '<line x1="0" y1="-3" x2="0" y2="3"/><line x1="'+(m*s).toFixed(1)+'" y1="-3" x2="'+(m*s).toFixed(1)+'" y2="3"/>'+
     '<text x="-5" y="3" font-size="9" text-anchor="end" stroke="none">'+m+' m</text></g>';
  return o+'</svg>';
}

/* Clave de color de las pendientes. Va debajo del mapa y del bloque 3D, que es
   donde el color aparece por primera vez. Las cifras de cada clase no se repiten
   aquí: van en las barras, unas líneas más abajo. */
function leyendaPendientes(n){
  const A=IMPL[String(n)];
  if(!A||!A.r) return "";
  const falta = (A.cob!=null && A.cob<0.98);
  return '<div class="leyP">'+CLASES.map((c,i)=>{
    const p=A.r[i]?A.r[i][0]:0;
    return '<div'+(p<0.05?' class="nula"':'')+'><i style="background:'+c[2]+'"></i>'+
           '<b>'+TP(c[0])+'</b><span>'+T(c[1])+'</span></div>';
  }).join("")+(falta
    ? '<div><i class="ndi"></i><b>'+T(SIN_LEV[0])+'</b><span>'+T(SIN_LEV[1])+'</span></div>'
    : '')+'</div>';
}

/* =========================================================================
   PLANO DE LOCALIZACIÓN
   Con qué empieza el informe: todo el proyecto en gris claro y el lote que se
   está analizando en color. Quien lo lea sabe primero DÓNDE está parado, y
   después mira las cifras.
   ========================================================================= */
function planoUbicacion(n, W, H){
  const L=DATA.lotes.find(x=>x.n===n); if(!L) return "";
  let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
  const met=p=>{x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);y0=Math.min(y0,p[1]);y1=Math.max(y1,p[1]);};
  DATA.lind.map(PX).forEach(met);
  DATA.lotes.forEach(o=>o.g.map(PX).forEach(met));
  const pad=14; x0-=pad;y0-=pad;x1+=pad;y1+=pad;
  const s=Math.min((W-8)/(x1-x0), (H-8)/(y1-y0));
  const ox=(W-(x1-x0)*s)/2, oy=(H-(y1-y0)*s)/2;
  const XY=p=>{const q=PX(p); return [ox+(q[0]-x0)*s, oy+(q[1]-y0)*s];};
  const d=(ring,c)=>ring.map((p,i)=>{const q=XY(p);return (i?"L":"M")+q[0].toFixed(1)+" "+q[1].toFixed(1);}).join("")+(c?"Z":"");

  let o='<svg viewBox="0 0 '+W+' '+H+'" width="100%" height="'+Math.round(H)+
        '" preserveAspectRatio="xMidYMid meet" style="display:block;border-radius:9px;background:var(--surface-2)">';
  /* el predio, en gris claro */
  o+='<path d="'+d(DATA.lind,1)+'" fill="#E8E7DE"/>';
  DATA.soc.concat(DATA.var).forEach(a=>{ o+='<path d="'+d(a.g,1)+'" fill="#DEDDD2"/>'; });
  DATA.prot.forEach(r=>{ o+='<path d="'+d(r,1)+'" fill="#D6DCD0"/>'; });
  DATA.via.forEach(v=>{ o+='<path d="'+d(v,0)+'" fill="none" stroke="#FFFFFF" stroke-width="'+
    Math.max(1.2,5.5*s).toFixed(1)+'" stroke-linejoin="round" stroke-linecap="round"/>'; });
  DATA.lotes.forEach(o2=>{ if(o2.n===n) return;
    o+='<path d="'+d(o2.g,1)+'" fill="#F3F2EA" stroke="#C6C5B8" stroke-width=".5"/>'; });
  o+='<path d="'+d(DATA.lind,1)+'" fill="none" stroke="#9A9A8B" stroke-width="1.1"/>';

  /* el lote analizado, en color */
  o+='<path d="'+d(L.g,1)+'" fill="var(--gold)" stroke="#5A441E" stroke-width="1.6"/>';

  /* círculo y guía, para encontrarlo sin buscarlo */
  const c=XY(L.c);
  let r=0; L.g.map(XY).forEach(q=>r=Math.max(r,Math.hypot(q[0]-c[0],q[1]-c[1])));
  r=Math.max(r+7,13);
  o+='<circle cx="'+c[0].toFixed(1)+'" cy="'+c[1].toFixed(1)+'" r="'+r.toFixed(1)+
     '" fill="none" stroke="var(--gold)" stroke-width="1.2" stroke-dasharray="3 3"/>';
  /* rótulo hacia afuera del centro del dibujo */
  let vx=c[0]-W/2, vy=c[1]-H/2, vm=Math.hypot(vx,vy)||1; vx/=vm; vy/=vm;
  const txt=TT("LOTE ","LOT ","LOT ")+n, tw=txt.length*7.2+16, tHh=20;
  let lx=Math.min(Math.max(c[0]+vx*(r+26), tw/2+4), W-tw/2-4);
  let ly=Math.min(Math.max(c[1]+vy*(r+26), tHh/2+4), H-tHh/2-4);
  const ddx=lx-c[0], ddy=ly-c[1], dm=Math.hypot(ddx,ddy)||1;
  o+='<line x1="'+(c[0]+ddx/dm*r).toFixed(1)+'" y1="'+(c[1]+ddy/dm*r).toFixed(1)+
     '" x2="'+(lx-ddx/dm*(tw/2)).toFixed(1)+'" y2="'+(ly-ddy/dm*(tHh/2)).toFixed(1)+
     '" stroke="#5A441E" stroke-width="1"/>';
  o+='<rect x="'+(lx-tw/2).toFixed(1)+'" y="'+(ly-tHh/2).toFixed(1)+'" width="'+tw.toFixed(1)+
     '" height="'+tHh+'" rx="4" fill="var(--forest)" stroke="var(--gold)" stroke-width=".8"/>';
  o+='<text x="'+lx.toFixed(1)+'" y="'+(ly+3.8).toFixed(1)+'" font-size="11" font-weight="700" '+
     'text-anchor="middle" fill="var(--on-forest)" letter-spacing=".04em">'+txt+'</text>';

  /* norte */
  o+='<g transform="translate('+(W-20)+',20)" fill="#6B7367">'+
     '<path d="M0 -9 L3 4 L0 1.6 L-3 4 Z"/>'+
     '<text x="0" y="15" font-size="8" text-anchor="middle" font-weight="600">N</text></g>';
  return o+'</svg>';
}

/* =========================================================================
   CORTE 3D DEL TERRENO
   Un bloque del lote en axonometría: la superficie pintada con los mismos
   colores de pendiente del mapa en planta, las caras laterales mostrando el
   corte de tierra, y encima la casa implantada sobre su plataforma.

   Es la pieza que le hace entender al cliente en un vistazo lo que las cifras
   dicen en frío: dónde está lo plano, cuánto baja, y cómo queda parada la casa.

   Proyección: la misma axonometría del diagrama solar (ISO), para que las dos
   figuras del informe se lean con la misma cámara.
   ========================================================================= */
function bloque3D(n, W, H){
  const L=DATA.lotes.find(x=>x.n===n), A=IMPL[String(n)];
  if(!L||!A) return "";
  const g0=L.g.map(PX), K=A.k;
  /* Exageración vertical. Con desniveles de lote normales (2–16 m) hace falta
     para que la ladera se lea; con la franja declarada cayendo 20 o 25 m el
     dibujo se convierte en un acantilado y deja de informar, así que se afloja.
     El factor sale rotulado al pie, siempre. */
  let VE=1.6;
  /* La celda era de 3 m y el bloque salía a cuadros: se veía la rejilla y no la
     ladera. Con 1,4 m el color pasa de un rango a otro sin escalones y el borde
     del lote deja de ser una escalera. Sube el número de caras, así que el paso
     se afloja en lotes grandes para no dejar la hoja pensando. */
  const areaLote = Math.abs(L.at || 3500);
  const PASO = areaLote > 5200 ? 1.8 : 1.4;

  /* centro y marco local del bloque */
  let cx=0, cy=0;
  g0.slice(0,-1).forEach(p=>{cx+=p[0]; cy+=p[1];});
  cx/=g0.length-1; cy/=g0.length-1;

  /* cota de referencia y base del bloque */
  const muestras=muestrearLote(g0, PASO);
  if(muestras.length<12) return "";
  let zmin=1e9, zmax=-1e9;
  muestras.forEach(([x,y])=>{ const z=MDT.cota(x,y); if(!isNaN(z)){zmin=Math.min(zmin,z);zmax=Math.max(zmax,z);} });
  if(!isFinite(zmin)) return "";
  /* La franja declarada baja de verdad, así que el bloque tiene que dar para
     ella: si la base se calcula sólo con lo levantado, la ladera declarada se
     sale por debajo y el bloque se da vuelta. muestrearLote() no sirve aquí
     porque descarta los puntos sin pendiente medida —que son justo esos—, así
     que se barre la caja del lote a mano. Los dos rangos se miden aparte para
     poder rotularlos por separado. */
  let zminD=zmin, zmaxD=zmax;
  {
    let bx0=1e9,by0=1e9,bx1=-1e9,by1=-1e9;
    g0.forEach(p=>{bx0=Math.min(bx0,p[0]);bx1=Math.max(bx1,p[0]);
                   by0=Math.min(by0,p[1]);by1=Math.max(by1,p[1]);});
    for(let y=by0; y<=by1; y+=3) for(let x=bx0; x<=bx1; x+=3){
      if(!dentroAnillo(x,y,g0)) continue;
      const z=MDT.cotaDibujo(x,y);
      if(!isNaN(z)){ zminD=Math.min(zminD,z); zmaxD=Math.max(zmaxD,z); }
    }
  }
  if(zmaxD-zminD > 22) VE=0.9; else if(zmaxD-zminD > 12) VE=1.15;
  const zbase = zminD - Math.max(2.5,(zmaxD-zminD)*0.10);

  /* mundo -> pantalla: E al este, N al norte (el frame local tiene y al sur) */
  const pr=(x,y,z)=>{ const p=ISO.proy(x-cx, -(y-cy), (z-zbase)*VE); return p; };
  const fondo=(x,y,z)=> ISO.fondo(x-cx, -(y-cy), (z-zbase)*VE);

  /* --- malla de celdas dentro del lote --- */
  const caras=[];
  let bx0=1e9,by0=1e9,bx1=-1e9,by1=-1e9;
  g0.forEach(p=>{bx0=Math.min(bx0,p[0]);bx1=Math.max(bx1,p[0]);by0=Math.min(by0,p[1]);by1=Math.max(by1,p[1]);});
  const nx=Math.ceil((bx1-bx0)/PASO), ny=Math.ceil((by1-by0)/PASO);
  /* Una celda entra si CUALQUIERA de sus esquinas cae en el lote, no sólo el
     centro: así la malla desborda un poco el lindero y el recorte se encarga del
     sobrante. Con el criterio del centro quedaba un dentado de media celda. */
  const dentro=(i,j)=>{
    const X=bx0+i*PASO, Y=by0+j*PASO;
    return dentroAnillo(X+PASO/2,Y+PASO/2,g0) || dentroAnillo(X,Y,g0) ||
           dentroAnillo(X+PASO,Y,g0) || dentroAnillo(X,Y+PASO,g0) ||
           dentroAnillo(X+PASO,Y+PASO,g0);
  };
  const cotaN=(i,j)=>{
    const X=bx0+i*PASO, Y=by0+j*PASO;
    const z=MDT.cota(X,Y);
    /* en el borde de lo levantado se usa el relleno: si no, la tapa se agujerea */
    return isNaN(z) && MDT.cotaDibujo ? MDT.cotaDibujo(X,Y) : z;
  };

  for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){
    if(!dentro(i,j)) continue;
    const z00=cotaN(i,j), z10=cotaN(i+1,j), z11=cotaN(i+1,j+1), z01=cotaN(i,j+1);
    if(isNaN(z00)||isNaN(z10)||isNaN(z11)||isNaN(z01)) continue;
    const X0=bx0+i*PASO, X1=X0+PASO, Y0=by0+j*PASO, Y1=Y0+PASO;
    const pe=MDT.pendiente(X0+PASO/2, Y0+PASO/2);
    /* Sin curvas de nivel no hay pendiente que pintar. Antes estas celdas caían
       en la clase 0 y salían verde oscuro —«plano»—, que es justo lo contrario
       de lo que hay: son las de atrás, las que caen. Van en gris rayado y el
       cliente ve de una que ahí no se midió. */
    const sinDato = isNaN(pe);
    const col = sinDato ? SIN_LEV[2] : CLASES[MDT.clase(pe)][2];
    caras.push({d:(fondo(X0,Y0,z00)+fondo(X1,Y0,z10)+fondo(X1,Y1,z11)+fondo(X0,Y1,z01))/4,
                p:[pr(X0,Y0,z00),pr(X1,Y0,z10),pr(X1,Y1,z11),pr(X0,Y1,z01)],
                c:col, o:1, tapa:1, nd:sinDato?1:0});
  }

  /* La falda del bloque se levanta del CONTORNO REAL del lote, no de las celdas.
     Antes cada celda del borde ponía su propia pared y el bloque terminaba en
     peineta; así el corte de tierra queda con el mismo perfil del lindero. */
  const anillo=[];
  for(let i=0;i<g0.length-1;i++){
    const a=g0[i], b=g0[i+1];
    const largo=Math.hypot(b[0]-a[0], b[1]-a[1]);
    const tramos=Math.max(1, Math.ceil(largo/PASO));
    for(let k=0;k<tramos;k++){
      const t=k/tramos;
      const X=a[0]+(b[0]-a[0])*t, Y=a[1]+(b[1]-a[1])*t;
      let Z=MDT.cota(X,Y);
      if(isNaN(Z) && MDT.cotaDibujo) Z=MDT.cotaDibujo(X,Y);
      if(isNaN(Z)) Z=zmin;
      anillo.push([X,Y,Z]);
    }
  }
  if(anillo.length) anillo.push(anillo[0]);
  for(let i=0;i<anillo.length-1;i++){
    const a=anillo[i], b=anillo[i+1];
    caras.push({d:(fondo(a[0],a[1],a[2])+fondo(b[0],b[1],b[2]))/2 - 0.01,
                p:[pr(a[0],a[1],a[2]),pr(b[0],b[1],b[2]),pr(b[0],b[1],zbase),pr(a[0],a[1],zbase)],
                c:"#8C7A5E", o:1, borde:"#8C7A5E"});
  }

  /* --- la casa, sobre su plataforma --- */
  if(K&&K.o){
    const o=K.o, ux=K.ux, uv=K.uv;
    const eu=K.L/22.4, ev=(K.Dc||28.4)/28.4;
    const XY=(u,v)=>[o[0]+ux[0]*u*eu+uv[0]*v*ev, o[1]+ux[1]*u*eu+uv[1]*v*ev];
    const z0=K.z, dosN=(K.mod==="2p"&&K.zm!=null);
    /* plataforma */
    const plat=[XY(-1,-1),XY(CASA30.W+1,-1),XY(CASA30.W+1,CASA30.D+1),XY(-1,CASA30.D+1)];
    caras.push({d:Math.max(...plat.map(p=>fondo(p[0],p[1],z0)))+0.02,
                p:plat.map(p=>pr(p[0],p[1],z0)), c:"#C9BFA6", o:1, borde:"#9C9179"});
    /* El muro del banqueo baja hasta EL TERRENO, no hasta la base del bloque:
       si baja hasta la base se ve un pedestal enorme que no existe. Se parte
       cada lado en tramos y cada tramo llega a la cota natural de ahí. */
    for(let k=0;k<4;k++){
      const a=plat[k], b=plat[(k+1)%4];
      const T=8;
      for(let t=0;t<T;t++){
        const p1=[a[0]+(b[0]-a[0])*t/T, a[1]+(b[1]-a[1])*t/T];
        const p2=[a[0]+(b[0]-a[0])*(t+1)/T, a[1]+(b[1]-a[1])*(t+1)/T];
        let z1=MDT.cota(p1[0],p1[1]), z2=MDT.cota(p2[0],p2[1]);
        if(isNaN(z1)) z1=zbase; if(isNaN(z2)) z2=zbase;
        z1=Math.min(z1,z0)-0.15; z2=Math.min(z2,z0)-0.15;
        if(z0-Math.max(z1,z2)<0.08) continue;           /* aquí no hay muro que ver */
        caras.push({d:(fondo(p1[0],p1[1],z0)+fondo(p2[0],p2[1],z0))/2+0.015,
                    p:[pr(p1[0],p1[1],z0),pr(p2[0],p2[1],z0),pr(p2[0],p2[1],z2),pr(p1[0],p1[1],z1)],
                    c:"#B3A88E", o:1, borde:"#8E856F"});
      }
    }
    if(dosN){
      /* el nivel -1, enterrado: se insinúa con su caja */
      caraCaja(caras, XY, pr, fondo, 0, 0, CASA30.W, CASA30.D, K.zm, z0, "#5E7358", "#43533F", .55);
    }
    const CIb = casaIA(n);
    if(CIb){
      /* la casa propuesta, en el marco de referencia (ya escalado por XY) */
      const R = CIb.bloques, orden={patio:0,deck:1,piscina:2,porche:3,muro:4};
      const baseDe = b=>{ const cu=(b.u0+b.u1)/2, cv=(b.v0+b.v1)/2;
        const bajo=R.find(x=>x.clase==="muro"&&x.nivel!==2&&cu>=x.u0&&cu<=x.u1&&cv>=x.v0&&cv<=x.v1);
        return bajo?(bajo.alto||3.4):3.4; };
      R.slice().sort((a,b)=>(orden[a.clase]-orden[b.clase])||(a.nivel-b.nivel)).forEach(b=>{
        if(b.clase==="muro"||b.clase==="porche"){
          const za = b.nivel===2 ? z0+baseDe(b) : z0;
          const c1 = b.clase==="porche" ? "#CFC7B2" : (b.nivel===2 ? "#EFE8D8" : "#E4DCCA");
          caraCaja(caras, XY, pr, fondo, b.u0, b.v0, b.u1, b.v1, za, za+(b.alto||(b.nivel===2?3.0:3.4)), c1, "#A79C86", 1);
        } else {
          caraCaja(caras, XY, pr, fondo, b.u0, b.v0, b.u1, b.v1, z0-0.05, z0+0.12, COLOR_IA_CSS[b.clase], "#7C7460", 1);
        }
      });
    } else
    CASA30.bloques.forEach(([nom,u0,v0,u1,v1,alt,cls])=>{
      if(cls==="patio") return;
      const c1 = cls==="porche" ? "#CFC7B2" : "#E4DCCA";
      caraCaja(caras, XY, pr, fondo, u0, v0, u1, v1, z0, z0+alt, c1, "#A79C86", 1);
    });
  }

  /* --- pintor: de atrás hacia adelante --- */
  caras.sort((a,b)=>b.d-a.d);
  let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
  caras.forEach(f=>f.p.forEach(q=>{x0=Math.min(x0,q[0]);x1=Math.max(x1,q[0]);y0=Math.min(y0,q[1]);y1=Math.max(y1,q[1]);}));
  const pad=10;
  const s=Math.min((W-2*pad)/(x1-x0), (H-2*pad)/(y1-y0));
  const ox=pad+((W-2*pad)-(x1-x0)*s)/2, oy=pad+((H-2*pad)-(y1-y0)*s)/2;
  const T=q=>[(ox+(q[0]-x0)*s).toFixed(1), (oy+((y1-q[1]))*s).toFixed(1)];

  let o='<svg viewBox="0 0 '+W+' '+H+'" width="100%" height="'+Math.round(H)+
        '" preserveAspectRatio="xMidYMid meet" style="display:block;border-radius:9px;background:var(--surface-2)">';
  /* la tapa se recorta al contorno real del lote: es lo que quita la sierra */
  const recorte = anillo.length
    ? anillo.map((q,i)=>{const t=T(pr(q[0],q[1],q[2])); return (i?"L":"M")+t[0]+" "+t[1];}).join("")+"Z"
    : null;
  o+='<defs>'+
      '<pattern id="tnd'+n+'" width="7" height="7" patternUnits="userSpaceOnUse" '+
        'patternTransform="rotate(45)">'+
        '<rect width="7" height="7" fill="'+SIN_LEV[2]+'"/>'+
        '<line x1="0" y1="0" x2="0" y2="7" stroke="'+DECL_TRAMA+'" stroke-width="2.2"/>'+
      '</pattern>'+
      (recorte?'<clipPath id="clb'+n+'"><path d="'+recorte+'"/></clipPath>':'')+
      '</defs>';
  let enTapa=false;
  caras.forEach(f=>{
    if(!!f.tapa !== enTapa){
      if(recorte) o += enTapa ? '</g>' : '<g clip-path="url(#clb'+n+')">';
      enTapa = !!f.tapa;
    }
    const d=f.p.map((q,i)=>{const t=T(q); return (i?"L":"M")+t[0]+" "+t[1];}).join("")+"Z";
    const relleno = f.nd ? 'url(#tnd'+n+')' : f.c;
    o+='<path d="'+d+'" fill="'+relleno+'"'+(f.o<1?' fill-opacity="'+f.o+'"':'')+
       (f.borde?' stroke="'+f.borde+'" stroke-width=".4"':' stroke="'+f.c+'" stroke-width=".35"')+
       ' stroke-linejoin="round"/>';
  });
  if(enTapa && recorte) o+='</g>';
  /* rosa de los vientos, con la misma cámara */
  const rn=ISO.proy(0,26,0), re=ISO.proy(26,0,0), rc=ISO.proy(0,0,0);
  const esc=Math.min(W,H)*0.055/Math.max(1,Math.hypot(rn[0]-rc[0],rn[1]-rc[1]));
  const gx=W-52, gy=H-30;
  const fl=(p,txt,col)=>{
    const X=gx+(p[0]-rc[0])*esc, Y=gy-(p[1]-rc[1])*esc;
    return '<line x1="'+gx+'" y1="'+gy+'" x2="'+X.toFixed(1)+'" y2="'+Y.toFixed(1)+
           '" stroke="'+col+'" stroke-width="1.3"/>'+
           '<text x="'+X.toFixed(1)+'" y="'+(Y-4).toFixed(1)+'" font-size="9" font-weight="700" '+
           'text-anchor="middle" fill="'+col+'">'+txt+'</text>';
  };
  o+=fl(rn,"N","var(--ink-2)")+fl(re,"E","var(--muted)");
  /* desnivel del bloque */
  /* El desnivel se mide SÓLO donde hay curvas. Decir «desnivel del lote 1,8 m»
     cuando el 59 % del lote no se levantó es dar por plano lo que no se midió. */
  const parcial = (A.cob!=null && A.cob<0.98);
  o+='<text x="12" y="'+(H-12)+'" font-size="9.5" fill="var(--muted)">'+
     (parcial
       ? TT("desnivel medido ("+fmtA(A.am2||0)+" levantados) ",
            "measured drop ("+fmtA(A.am2||0)+" surveyed) ",
            "dénivelé mesuré ("+fmtA(A.am2||0)+" levés) ")
       : TT("desnivel del lote ","lot drop ","dénivelé du lot "))+dec(zmax-zmin,1)+' m'+
     (parcial ? ' · '+TT("con la franja declarada, ","with the declared strip, ",
                         "avec la bande déclarée, ")+dec(zmaxD-zminD,1)+' m' : '')+
     ' · '+TT("relieve ×","relief ×","relief ×")+dec(VE,1)+'</text>';
  if(parcial)
    o+='<text x="12" y="'+(H-25)+'" font-size="9.5" font-weight="700" fill="#8A5F14">'+
       TT("la zona rayada baja al 20 % declarado, no está levantada",
          "the hatched zone falls at the declared 20%, it is not surveyed",
          "la zone hachurée descend à 20 % déclarés, elle n\u0027est pas levée")+'</text>';
  return o+'</svg>';
}

/* una caja recta entre dos cotas, con sus cuatro caras y la tapa */
function caraCaja(caras, XY, pr, fondo, u0, v0, u1, v1, za, zb, color, borde, op){
  const q=[XY(u0,v0),XY(u1,v0),XY(u1,v1),XY(u0,v1)];
  caras.push({d:Math.max(...q.map(p=>fondo(p[0],p[1],zb)))+0.03,
              p:q.map(p=>pr(p[0],p[1],zb)), c:color, o:op, borde:borde});
  for(let k=0;k<4;k++){
    const a=q[k], b=q[(k+1)%4];
    caras.push({d:(fondo(a[0],a[1],zb)+fondo(b[0],b[1],zb))/2+0.02,
                p:[pr(a[0],a[1],zb),pr(b[0],b[1],zb),pr(b[0],b[1],za),pr(a[0],a[1],za)],
                c:sombra(color), o:op, borde:borde});
  }
}
function sombra(hex){
  const c=hex.replace("#",""); const f=0.82;
  const r=Math.round(parseInt(c.slice(0,2),16)*f), g=Math.round(parseInt(c.slice(2,4),16)*f),
        b=Math.round(parseInt(c.slice(4,6),16)*f);
  return "#"+[r,g,b].map(v=>v.toString(16).padStart(2,"0")).join("");
}

/* =========================================================================
   CORTE DEL TERRENO
   El perfil por la línea de máxima pendiente que pasa por la casa: es el corte
   que de verdad explica el movimiento de tierra, porque cualquier otro lo
   suaviza. Se dibujan tres líneas y hay que distinguirlas:

     · TERRENO NATURAL     línea punteada  — lo que hay hoy
     · PLATAFORMA (NPT)    línea continua  — el nivel donde queda la casa
     · NIVEL -1            línea punteada  — sólo en los lotes de dos niveles

   Entre el terreno natural y la plataforma queda lo que se corta (por encima)
   y lo que se llena (por debajo), achurado en dos colores.
   ========================================================================= */
function corteTerreno(n, W, H){
  const L=DATA.lotes.find(x=>x.n===n), A=IMPL[String(n)];
  if(!L||!A) return "";
  const g0=L.g.map(PX);
  const K=A.k;

  /* --- 1. por dónde se corta --- */
  /* centro: la casa si la hay, si no el centroide del lote */
  let cx=0, cy=0;
  if(K){ K.g.slice(0,-1).forEach(p=>{cx+=p[0]/4; cy+=p[1]/4;}); }
  else { const c=PX(L.c); cx=c[0]; cy=c[1]; }
  /* dirección: la de máxima bajada promediada sobre el lote, que es la que
     manda en el movimiento de tierra */
  let dx=0, dy=0;
  muestrearLote(g0, 4).forEach(([x,y])=>{ const b=MDT.bajada(x,y); if(b){dx+=b[0]; dy+=b[1];} });
  let m=Math.hypot(dx,dy);
  if(m<1e-6){ dx=1; dy=0; m=1; }
  dx/=m; dy/=m;
  /* En los lotes a medio levantar la máxima bajada MEDIDA sale del pedazo de
     adelante, que es casi plano, y el corte terminaba atravesando los 30 m del
     frente sin tocar la ladera. Ahí lo que hay que enseñar es el perfil del lote
     entero, así que la recta se orienta del centro de lo levantado al centro de
     la franja declarada: sigue pasando por la casa y ahora sí baja por detrás. */
  const parcial = (A.cob!=null && A.cob<0.98);
  if(parcial){
    let mx=0,my=0,nm=0, ox=0,oy=0,no=0;
    let bx0=1e9,by0=1e9,bx1=-1e9,by1=-1e9;
    g0.forEach(q=>{bx0=Math.min(bx0,q[0]);bx1=Math.max(bx1,q[0]);
                   by0=Math.min(by0,q[1]);by1=Math.max(by1,q[1]);});
    for(let y=by0;y<=by1;y+=3) for(let x=bx0;x<=bx1;x+=3){
      if(!dentroAnillo(x,y,g0)) continue;
      if(!isNaN(MDT.cota(x,y))){ mx+=x; my+=y; nm++; }
      else if(!isNaN(MDT.cotaDibujo(x,y))){ ox+=x; oy+=y; no++; }
    }
    if(nm && no){
      const ex=ox/no-mx/nm, ey=oy/no-my/nm, em=Math.hypot(ex,ey);
      if(em>1){ dx=ex/em; dy=ey/em; }
    }
  }

  /* se extiende la recta hasta salir del lote por los dos lados */
  const alcance=(sg)=>{
    let t=0;
    for(let k=0.5;k<400;k+=0.5){
      if(!dentroAnillo(cx+dx*sg*k, cy+dy*sg*k, g0)) break;
      t=k;
    }
    return t;
  };
  const tA=-alcance(-1), tB=alcance(1);
  if(tB-tA < 8) return "";
  const P=t=>[cx+dx*t, cy+dy*t];

  /* --- 2. el perfil --- */
  const N=180, muestras=[];
  let sinDato=0;
  /* El perfil declarado se traza aparte: mismo recorrido, pero con la superficie
     declarada al 20 %. Se guarda entero (medido + declarado) para poder dibujar
     una sola línea continua y rayar sólo el tramo que no está levantado. */
  const perfD=[];
  for(let i=0;i<=N;i++){
    const t=tA+(tB-tA)*i/N, p=P(t), z=MDT.cota(p[0],p[1]), zd=MDT.cotaDibujo(p[0],p[1]);
    if(!isNaN(zd)) perfD.push([t, zd, isNaN(z)]);
    if(isNaN(z)){ sinDato++; continue; }      /* sin curvas no hay perfil medido */
    muestras.push([t,z,p]);
  }
  if(muestras.length<10) return "";
  /* Si parte de la recta cae fuera del levantamiento, el perfil se cierra solo
     y el corte parece completo. Hay que decir qué tramo NO está dibujado. */
  const mLev = (tB-tA)*muestras.length/(N+1);

  /* dónde entra y sale la casa sobre el corte */
  let hA=null, hB=null;
  if(K){
    for(const [t,,p] of muestras){
      if(dentroAnillo(p[0],p[1],K.g)){ if(hA===null) hA=t; hB=t; }
    }
  }

  const npt   = K ? K.z  : null;
  const nm1   = (K && K.mod==="2p") ? K.zm : null;
  const zs=muestras.map(v=>v[1]).concat(perfD.map(v=>v[1]));
  let zmin=Math.min(...zs), zmax=Math.max(...zs);
  if(npt!=null){ zmin=Math.min(zmin,npt); zmax=Math.max(zmax,npt+ALTURA_MAX); }
  if(nm1!=null) zmin=Math.min(zmin,nm1);
  const holg=Math.max(1.5,(zmax-zmin)*0.12);
  zmin-=holg; zmax+=holg;

  const M={i:52, d:16, s:14, b:34};            /* márgenes del dibujo */
  const gw=W-M.i-M.d, gh=H-M.s-M.b;
  const X = t => M.i + (t-tA)/(tB-tA)*gw;
  const Y = z => M.s + (zmax-z)/(zmax-zmin)*gh;

  const linea = f => muestras.map(([t,z],i)=>(i?"L":"M")+X(t).toFixed(1)+" "+Y(f(z)).toFixed(1)).join("");
  const perfil = linea(z=>z);

  /* --- 3. corte y lleno: el área entre el terreno y la plataforma --- */
  let areaCorte="", areaLleno="";
  if(npt!=null && hA!=null){
    const dentro=muestras.filter(([t])=>t>=hA&&t<=hB);
    const banda=(arriba)=>{
      const pts=dentro.filter(([,z])=> arriba ? z>npt : z<npt);
      if(!pts.length) return "";
      /* se recorre el tramo de la casa: terreno por arriba, plataforma por abajo */
      let dd="M"+X(dentro[0][0]).toFixed(1)+" "+Y(npt).toFixed(1);
      dentro.forEach(([t,z])=>{ dd+="L"+X(t).toFixed(1)+" "+Y(arriba?Math.max(z,npt):Math.min(z,npt)).toFixed(1); });
      dd+="L"+X(dentro[dentro.length-1][0]).toFixed(1)+" "+Y(npt).toFixed(1)+"Z";
      return dd;
    };
    areaCorte=banda(true); areaLleno=banda(false);
  }

  let o='<svg viewBox="0 0 '+W+' '+H+'" width="100%" height="'+Math.round(H)+
        '" preserveAspectRatio="xMidYMid meet" style="display:block;border-radius:9px;background:var(--surface-2)">';
  o+='<defs>'
   + '<pattern id="acu'+n+'" width="6" height="6" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">'
   + '<line x1="0" y1="0" x2="0" y2="6" stroke="#A3543F" stroke-width="1.6" stroke-opacity=".55"/></pattern>'
   + '<pattern id="all'+n+'" width="6" height="6" patternTransform="rotate(-45)" patternUnits="userSpaceOnUse">'
   + '<line x1="0" y1="0" x2="0" y2="6" stroke="#4C8862" stroke-width="1.6" stroke-opacity=".55"/></pattern>'
   + '<pattern id="adc'+n+'" width="7" height="7" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">'
   + '<rect width="7" height="7" fill="'+SIN_LEV[2]+'" fill-opacity=".30"/>'
   + '<line x1="0" y1="0" x2="0" y2="7" stroke="'+DECL_TRAMA+'" stroke-width="2" stroke-opacity=".5"/></pattern>'
   + '</defs>';

  /* rejilla de cotas cada metro (o cada 2 si el desnivel es grande) */
  const pasoZ=(zmax-zmin)>26?5:(zmax-zmin)>13?2:1;
  for(let z=Math.ceil(zmin/pasoZ)*pasoZ; z<=zmax; z+=pasoZ){
    o+='<line x1="'+M.i+'" y1="'+Y(z).toFixed(1)+'" x2="'+(W-M.d)+'" y2="'+Y(z).toFixed(1)+
       '" stroke="var(--line-soft)" stroke-width="1"/>'
     + '<text x="'+(M.i-7)+'" y="'+(Y(z)+3.2).toFixed(1)+'" font-size="9" text-anchor="end" '+
       'fill="var(--muted)" font-variant-numeric="tabular-nums">'+ent(z)+'</text>';
  }

  /* el terreno, relleno hasta abajo */
  o+='<path d="'+perfil+'L'+X(muestras[muestras.length-1][0]).toFixed(1)+' '+(H-M.b)+
     'L'+X(muestras[0][0]).toFixed(1)+' '+(H-M.b)+'Z" fill="var(--ground)" fill-opacity=".55"/>';

  /* LA FRANJA DECLARADA. Va debajo de lo medido, con su propio relleno y su
     propia línea: el cliente ve de un golpe hasta dónde llega el levantamiento
     y por dónde sigue cayendo el lote. Los tramos se cortan donde vuelve a
     haber dato, por si el hueco no es uno solo. */
  if(parcial && perfD.length>2){
    const tramos=[]; let cur=null;
    perfD.forEach(([t,z,decl])=>{
      if(decl){ if(!cur){cur=[];tramos.push(cur);} cur.push([t,z]); }
      else if(cur){ cur.push([t,z]); cur=null; }      /* cierra pegado al medido */
    });
    tramos.forEach(tr=>{
      if(tr.length<2) return;
      const d=tr.map(([t,z],i)=>(i?"L":"M")+X(t).toFixed(1)+" "+Y(z).toFixed(1)).join("");
      o+='<path d="'+d+'L'+X(tr[tr.length-1][0]).toFixed(1)+' '+(H-M.b)+
         'L'+X(tr[0][0]).toFixed(1)+' '+(H-M.b)+'Z" fill="url(#adc'+n+')"/>';
      o+='<path d="'+d+'" fill="none" stroke="#B07A1C" stroke-width="2" '+
         'stroke-dasharray="7 4" stroke-linejoin="round"/>';
    });
  }
  if(areaCorte) o+='<path d="'+areaCorte+'" fill="url(#acu'+n+')"/>';
  if(areaLleno) o+='<path d="'+areaLleno+'" fill="url(#all'+n+')"/>';

  /* TERRENO NATURAL: punteado, que es lo que hay que identificar */
  o+='<path d="'+perfil+'" fill="none" stroke="var(--ink-2)" stroke-width="1.9" '+
     'stroke-dasharray="6 4" stroke-linejoin="round"/>';

  if(npt!=null){
    /* la casa en corte, sobre su plataforma */
    const xa=X(hA), xb=X(hB);
    o+='<line x1="'+M.i+'" y1="'+Y(npt).toFixed(1)+'" x2="'+(W-M.d)+'" y2="'+Y(npt).toFixed(1)+
       '" stroke="var(--gold)" stroke-width="1" stroke-opacity=".45" stroke-dasharray="2 4"/>';
    if(nm1!=null){
      o+='<line x1="'+xa.toFixed(1)+'" y1="'+Y(nm1).toFixed(1)+'" x2="'+xb.toFixed(1)+'" y2="'+Y(nm1).toFixed(1)+
         '" stroke="var(--forest)" stroke-width="1.6" stroke-dasharray="7 4"/>';
      o+='<rect x="'+xa.toFixed(1)+'" y="'+Y(npt).toFixed(1)+'" width="'+(xb-xa).toFixed(1)+
         '" height="'+(Y(nm1)-Y(npt)).toFixed(1)+'" fill="var(--forest)" fill-opacity=".18" '+
         'stroke="var(--forest)" stroke-width="1"/>';
    }
    const alto=Y(npt)-Y(npt+ALTURA_MAX);
    o+='<rect x="'+xa.toFixed(1)+'" y="'+Y(npt+ALTURA_MAX).toFixed(1)+'" width="'+(xb-xa).toFixed(1)+
       '" height="'+alto.toFixed(1)+'" fill="var(--forest)" fill-opacity=".78" '+
       'stroke="var(--forest-deep)" stroke-width="1.2"/>';
    /* PLATAFORMA: continua y marcada */
    o+='<line x1="'+xa.toFixed(1)+'" y1="'+Y(npt).toFixed(1)+'" x2="'+xb.toFixed(1)+'" y2="'+Y(npt).toFixed(1)+
       '" stroke="var(--forest-deep)" stroke-width="2.6"/>';
    o+='<text x="'+((xa+xb)/2).toFixed(1)+'" y="'+(Y(npt+ALTURA_MAX)+alto/2+4).toFixed(1)+
       '" font-size="10.5" font-weight="700" text-anchor="middle" fill="var(--on-forest)">'+
       T("Casa")+'</text>';
    o+='<text x="'+(xb+6).toFixed(1)+'" y="'+(Y(npt)-4).toFixed(1)+'" font-size="9.5" font-weight="600" '+
       'fill="var(--forest-deep)">'+T("NPT")+' '+dec(npt,2)+'</text>';
    if(nm1!=null)
      o+='<text x="'+(xb+6).toFixed(1)+'" y="'+(Y(nm1)+11).toFixed(1)+'" font-size="9.5" font-weight="600" '+
         'fill="var(--forest)">'+T("Nivel −1")+' '+dec(nm1,2)+'</text>';
  }

  /* eje horizontal con la distancia recorrida */
  o+='<line x1="'+M.i+'" y1="'+(H-M.b)+'" x2="'+(W-M.d)+'" y2="'+(H-M.b)+
     '" stroke="var(--line)" stroke-width="1"/>';
  const largo=tB-tA;
  const pasoX=largo>140?40:largo>70?20:10;
  for(let t=Math.ceil(tA/pasoX)*pasoX; t<=tB; t+=pasoX)
    o+='<line x1="'+X(t).toFixed(1)+'" y1="'+(H-M.b)+'" x2="'+X(t).toFixed(1)+'" y2="'+(H-M.b+4)+
       '" stroke="var(--line)" stroke-width="1"/>'
     + '<text x="'+X(t).toFixed(1)+'" y="'+(H-M.b+15)+'" font-size="9" text-anchor="middle" '+
       'fill="var(--muted)" font-variant-numeric="tabular-nums">'+ent(t-tA)+'</text>';
  o+='<text x="'+((M.i+W-M.d)/2).toFixed(0)+'" y="'+(H-6)+'" font-size="9" text-anchor="middle" '+
     'fill="var(--muted)">'+TT("metros a lo largo del corte","metres along the section",
                               "mètres le long de la coupe")+'</text>';
  /* el rótulo del eje va abajo, no arriba: con la franja declarada la curva sube
     hasta el borde y se montaba encima de la primera cota */
  o+='<text x="14" y="'+(H-M.b+15)+'" font-size="9" fill="var(--muted)">'+
     TT("cota","elev.","cote")+'</text>';
  /* de dónde a dónde va el corte, en rumbo */
  const azArriba=(Math.atan2(-dx,dy)*180/Math.PI+360)%360;
  o+='<text x="'+M.i+'" y="'+(M.s+10)+'" font-size="9" fill="var(--muted)">'+
     rumboTxt((azArriba+180)%360)+'</text>';
  o+='<text x="'+(W-M.d)+'" y="'+(M.s+10)+'" font-size="9" text-anchor="end" fill="var(--muted)">'+
     rumboTxt(azArriba)+'</text>';
  if(parcial && sinDato>2)
    o+='<text x="'+M.i+'" y="'+(M.s+23)+'" font-size="9" font-weight="700" fill="#8A5F14">'+
       TT(dec(mLev,0)+" m levantados de los "+dec(tB-tA,0)+" m del corte; el resto, rayado, es la pendiente declarada",
          dec(mLev,0)+" m surveyed of the section\u0027s "+dec(tB-tA,0)+" m; the rest, hatched, is the declared slope",
          dec(mLev,0)+" m levés sur les "+dec(tB-tA,0)+" m de la coupe ; le reste, hachuré, est la pente déclarée")+
       '</text>';
  return o+'</svg>';
}


function veredicto(rumbo){
  /* a 4,5° de latitud el sol sale y se pone casi al oriente y al occidente:
     lo que castiga es tener fachada larga hacia el oriente o el occidente. */
  const d=Math.min(Math.abs(rumbo-90), 180-Math.abs(rumbo-90));  /* 0 = eje E-O */
  if(d<25) return {n: TT("Orientación óptima","Ideal orientation"), t: TT("El eje largo queda casi oriente–occidente, así que las fachadas largas miran al norte y al sur: "+
      "reciben sol alto y poco sol rasante. Es la mejor orientación para este clima.",
    "The long axis runs almost east–west, so the long facades face north and south: they get high sun and "+
      "very little low, raking sun. It is the best orientation for this climate.")};
  if(d<50) return {n: TT("Orientación aceptable","Workable orientation"), t: TT("El eje largo queda en diagonal. Las fachadas largas reciben algo de sol rasante de la mañana y de la "+
      "tarde; con aleros de 1 m sobre esas caras queda resuelto.",
    "The long axis runs diagonally. The long facades take some raking sun in the morning and afternoon; "+
      "a 1 m eave on those faces resolves it.")};
  return {n: TT("Orientación exigente","Demanding orientation"), t: TT("El eje largo queda casi norte–sur, así que las fachadas largas dan al oriente y al occidente y reciben el "+
      "sol bajo de la mañana y de la tarde. Conviene girar la casa, o proteger esas caras con aleros profundos, "+
      "celosías o vegetación.",
    "The long axis runs almost north–south, so the long facades face east and west and take the low morning "+
      "and afternoon sun. It is worth turning the house, or shading those faces with deep eaves, louvres or planting.")};
}

/* ---------------------------- diagrama solar --------------------------- */
/* =========================================================================
   DIAGRAMA ISOMÉTRICO DEL SOL
   La Casa 30JB en axonometría sobre el lote real, y encima los recorridos
   del sol calculados para la latitud del predio. Es el mismo dibujo que hace
   un arquitecto a mano para explicar la asoleación, pero con la geometría y
   las posiciones solares de verdad.

   Ejes del mundo: E (oriente), N (norte), U (arriba), en metros.
   Proyección paralela: cámara mirando hacia el azimut VAZ, elevada VEL.
   ========================================================================= */
const ISO = (()=>{
  const rad = Math.PI/180;
  const VAZ = 22*rad;     /* la cámara mira al nornoreste: deja el frente a la vista */
  const VEL = 26*rad;     /* elevación: suficiente para leer la cubierta sin aplastar */

  const rE =  Math.cos(VAZ), rN = -Math.sin(VAZ);
  const uE =  Math.sin(VAZ)*Math.sin(VEL), uN = Math.cos(VAZ)*Math.sin(VEL), uU = Math.cos(VEL);
  const dE =  Math.sin(VAZ)*Math.cos(VEL), dN = Math.cos(VAZ)*Math.cos(VEL), dU = -Math.sin(VEL);

  const proy  = (E,N,U)=>[ E*rE + N*rN, E*uE + N*uN + U*uU ];
  const fondo = (E,N,U)=>  E*dE + N*dN + U*dU;      /* mayor = más lejos */

  /* ---- la escena: todo en metros, con el origen en el centro de la casa ---- */
  function escena(n, L, A){
    /* En cinco lotes del predio —48, 65, 83, 84 y 86— no cabe ningún volumen
       tipo dentro del área construible. Antes esta función devolvía null y esos
       lotes se quedaban SIN el dibujo del sol: justo los más difíciles, que son
       los que más falta hace entender. Ahora la escena se arma igual con el
       terreno medido y el recorrido del sol; lo único que no se dibuja es la
       casa, porque no la hay. */
    const K = (A && A.k && A.k.o) ? A.k : null;
    /* Si no cabe una casa de una sola plataforma, no es que no se pueda
       construir: es que hay que hacerla en bancales. Ese volumen se implanta
       aquí y se levanta igual que el otro. */
    const KT = K ? null : implantarTerraza(n);
    const B  = K || KT;
    const o = B ? B.o : null, ux = B ? B.ux : null, uv = B ? B.uv : null;
    const LC = K ? (K.L || 18) : (KT ? KT.L : 0);
    const DC = K ? (K.A || K.Dc || 12) : (KT ? KT.A : 0);
    const XY = B ? ((u,v)=>[ o[0]+ux[0]*u+uv[0]*v, o[1]+ux[1]*u+uv[1]*v ]) : null;
    let c, z0;
    if(B){ c = XY(LC/2, DC/2); z0 = K ? K.z : KT.z; }
    else {
      c = PX(L.c);
      const zc = MDT.cotaDibujo(c[0], c[1]);
      if(isNaN(zc)){
        let sz=0, nz=0;
        L.g.map(PX).forEach(q=>{ const z=MDT.cotaDibujo(q[0],q[1]); if(!isNaN(z)){sz+=z;nz++;} });
        if(!nz) return null;
        z0 = sz/nz;
      } else z0 = zc;
    }
    const EN = p => [ p[0]-c[0], -(p[1]-c[1]) ];
    /* Dos alturas, a propósito: la estricta devuelve NaN donde no hay modelo de
       terreno —y esa celda no se dibuja—, y la tolerante cae al nivel de la
       plataforma para el lindero y los cuerpos, que sí tienen que cerrar.
       Antes había una sola con caída a 0 y el resultado era una meseta plana
       falsa: en el lote 3 eran el 30 % de las celdas, y en el 63 el 21 %. */
    const altN = p => { const z=MDT.cotaDibujo(p[0],p[1]); return isNaN(z) ? NaN : z-z0; };
    const alt  = p => { const z=altN(p); return isNaN(z) ? 0 : z; };
    const P3  = p => { const e=EN(p); return [e[0], e[1], alt(p)]; };
    const P3N = p => { const e=EN(p); return [e[0], e[1], altN(p)]; };

    const piezas=[], suelo=[];

    /* ------------------------------------------------------------------
       EL SUELO ES EL TERRENO DEL LOTE, NO UNA TARIMA.
       Antes el sol se dibujaba sobre un cuadrado plano puesto a nivel. En un
       lote con 28 % de pendiente eso cuenta otra cosa: la casa parecía posada
       en una mesa y el lote no se reconocía. Ahora el suelo es el lote de
       verdad —su forma del plano 039— mallado cada 3 m y colgado del mismo
       modelo de alturas que usan el corte y el mapa de pendientes del informe.
       Cada celda lleva su propio sombreado según cómo mire su cara al sol, que
       es lo que deja leer la ladera.
       ------------------------------------------------------------------ */
    const anillo = L.g.map(PX);
    let bx0=1e9,by0=1e9,bx1=-1e9,by1=-1e9;
    anillo.forEach(q=>{bx0=Math.min(bx0,q[0]);bx1=Math.max(bx1,q[0]);
                       by0=Math.min(by0,q[1]);by1=Math.max(by1,q[1]);});
    const PASO = Math.max(2.5, Math.min(5, Math.hypot(bx1-bx0,by1-by0)/44));
    const LUZ = [-0.45, -0.35, 0.82];                      /* luz de estudio, fija */
    for(let x=bx0; x<bx1; x+=PASO) for(let y=by0; y<by1; y+=PASO){
      const cxm=x+PASO/2, cym=y+PASO/2;
      if(!dentroAnillo(cxm,cym,anillo)) continue;
      const q=[[x,y],[x+PASO,y],[x+PASO,y+PASO],[x,y+PASO]].map(P3N);
      if(q.some(v=>isNaN(v[2]))) continue;
      /* normal aproximada de la celda, para el sombreado */
      const ax=PASO, dzx=(q[1][2]-q[0][2]), dzy=(q[3][2]-q[0][2]);
      const nx=-dzx/ax, ny=-dzy/ax, nz=1, m=Math.hypot(nx,ny,nz);
      const lam=Math.max(0,(nx*LUZ[0]+ny*LUZ[1]+nz*LUZ[2])/m);
      suelo.push({tipo:"terreno", pts:q, tono:0.55+0.45*lam,
                  z:(fondo(q[0][0],q[0][1],q[0][2])+fondo(q[2][0],q[2][1],q[2][2]))/2});
    }
    suelo.sort((a,b)=>b.z-a.z);                            /* del fondo hacia adelante */
    /* el lindero, colgado de su propia cota */
    suelo.push({tipo:"lindero", pts:anillo.map(P3)});
    /* la línea del antejardín, sobre el terreno (sólo si hay implantación) */
    if(B) suelo.push({tipo:"antejardin", pts:[XY(-9,0), XY(LC+9,0)].map(P3)});

    /* ------------------------------------------------------------------
       EL VOLUMEN ES EL DEL TIPO ESCOGIDO.
       Antes se dibujaban siempre los tres cuerpos de la Casa 30JB, dijera lo
       que dijera el selector. Ahora se levanta la envolvente del tipo que esté
       escogido —199,6, 228,7 o 316 m²—, con los 35,5 m² de parqueadero aparte
       y los 4,00 m de altura de la simulación. Es un volumen, no una planta, y
       así va dicho en el pie: cuando llegue el DXF de cada casa se reemplaza.
       ------------------------------------------------------------------ */
    const ALTO_T = 4.00, ALTO_P = 2.60, PARQ = 35.5;
    const cuerpo=(u0,v0,u1,v1,h,cls,b0,bb)=>{
      const base=[XY(u0,v0),XY(u1,v0),XY(u1,v1),XY(u0,v1)];
      const q=base.map(EN);
      const zs=base.map(alt);
      piezas.push({nom:cls, base:q, h:h, cls:cls, b:bb||0,
        base0: b0!=null ? b0 : Math.min.apply(null,zs),     /* apoya en lo más bajo, o en su plataforma */
        z: q.reduce((a,pp,i)=>a+fondo(pp[0],pp[1],h),0)/4});
    };
    const BI = K ? bloquesIA(n) : null;
    if(BI){
      /* la casa propuesta con la IA: cada bloque con su altura y su clase; el
         piso alto arranca sobre el bloque de abajo; patio, deck y piscina son
         losas de 10 cm para que se lean en el suelo */
      BI.forEach(b=>{
        const top=altoBloqueIA(b,BI);
        const bot=(b.nivel===2)?top-(b.alto||3.0):0;
        cuerpo(b.u0,b.v0,b.u1,b.v1, top, b.clase==="muro"?"casa":b.clase, null, bot);
      });
      piezas.sort((a,b)=>b.z-a.z);
    } else if(K){
      /* La envolvente del tipo escogido. Se probó levantar aquí los muros
         reales leídos de los PDF, pero en un isométrico de este tamaño 72
         tabiques de 20 cm se leen como ruido, y además el PDF sólo vectorizó
         parte de los muros: la silueta construida que sale de ellos da 108 m²
         donde el tipo tiene 199,6. Así que aquí va la envolvente —que es lo
         que se midió contra el terreno— y la planta real va en el simulador. */
      cuerpo(0,0,LC,DC,ALTO_T,"casa");
      const lp=Math.sqrt(PARQ*1.35), ap=PARQ/lp;
      cuerpo(LC+1.2, 0, LC+1.2+lp, ap, ALTO_P, "porche");
      piezas.sort((a,b)=>b.z-a.z);
    } else if(KT){
      /* un cuerpo por bancal, cada uno apoyado en el nivel de piso de su banda */
      KT.niveles.forEach(nv=>{
        cuerpo(nv.u0, 0, nv.u1, DC, KT.alto, "casa", nv.npt - z0);
      });
      piezas.sort((a,b)=>b.z-a.z);
    }

    /* medidas del entorno, para el tamaño de la bóveda */
    const anchoSuelo = Math.hypot(bx1-bx0, by1-by0)*0.72;
    const fondoSuelo = anchoSuelo;

    /* --- los recorridos del sol --- */
    const R = 0.62*Math.hypot(anchoSuelo, fondoSuelo)*0.92;
    const cielo=[];
    SOL.FECHAS.forEach(f=>{
      const pts=[], soles=[];
      for(let h=4; h<=20; h+=1/12){
        const p=SOL.posicion(ANIO,f.m,f.d,h,lat0,lon0);
        if(p.alt<=3) continue;
        const a=p.alt*rad, z=p.az*rad;
        pts.push([R*Math.cos(a)*Math.sin(z), R*Math.cos(a)*Math.cos(z), R*Math.sin(a), h]);
      }
      if(pts.length<4) return;
      [8,12,16].forEach(hh=>{
        const p=SOL.posicion(ANIO,f.m,f.d,hh,lat0,lon0);
        if(p.alt<=3) return;
        const a=p.alt*rad, z=p.az*rad;
        soles.push({p:[R*Math.cos(a)*Math.sin(z), R*Math.cos(a)*Math.cos(z), R*Math.sin(a)], h:hh});
      });
      cielo.push({k:f.k, t:f.t, c:f.c, pts, soles});
    });

    /* --- rosa de los vientos sobre el suelo --- */
    const Rn = 0.58*Math.hypot(anchoSuelo, fondoSuelo);
    const rosa = [["N",0],["E",90],["S",180],["O",270]].map(([t,az])=>({
      t, p:[Rn*Math.sin(az*rad), Rn*Math.cos(az*rad), 0] }));

    return {piezas, suelo, cielo, rosa, R, proy, fondo};
  }

  /* ---- encuadre: proyecta todo y devuelve la caja ---- */
  function encuadre(esc){
    let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
    const ver=(E,N,U)=>{ const q=proy(E,N,U);
      x0=Math.min(x0,q[0]); x1=Math.max(x1,q[0]);
      y0=Math.min(y0,q[1]); y1=Math.max(y1,q[1]); };
    esc.suelo.forEach(s=>s.pts.forEach(p=>ver(p[0],p[1],p[2]||0)));
    esc.piezas.forEach(b=>b.base.forEach(p=>{ver(p[0],p[1],0);ver(p[0],p[1],b.h);}));
    esc.cielo.forEach(a=>a.pts.forEach(p=>ver(p[0],p[1],p[2])));
    esc.rosa.forEach(r=>ver(r.p[0],r.p[1],0));
    return {x0,y0,x1,y1};
  }
  return {proy, fondo, escena, encuadre, VAZ, VEL};
})();

/* ---- el mismo diagrama, dibujado en SVG para la pantalla ---- */
function diagramaIso(n, W, H){
  const L=DATA.lotes.find(x=>x.n===n), A=IMPL[String(n)];
  const esc=ISO.escena(n,L,A);
  if(!esc) return '<div class="p pie">'+T("Este lote todavía no tiene análisis topográfico.")+'</div>';

  const b=ISO.encuadre(esc), M=26;
  const s=Math.min((W-2*M)/(b.x1-b.x0), (H-2*M-26)/(b.y1-b.y0));
  const cx=(W-(b.x1+b.x0)*s)/2, cy=(H-26+(b.y1+b.y0)*s)/2;
  const P=(E,N,U)=>{ const q=ISO.proy(E,N,U); return [cx+q[0]*s, cy-q[1]*s]; };
  const d=pts=>pts.map((p,i)=>(i?"L":"M")+p[0].toFixed(1)+" "+p[1].toFixed(1)).join("")+"Z";
  const dl=pts=>pts.map((p,i)=>(i?"L":"M")+p[0].toFixed(1)+" "+p[1].toFixed(1)).join("");

  let o='<svg viewBox="0 0 '+W+' '+H+'" width="100%" style="display:block" '+
        'xmlns="http://www.w3.org/2000/svg" role="img" aria-label="'+
        T("Recorrido del sol sobre la casa")+'">';

  /* --- el suelo --- */
  esc.suelo.forEach(g=>{
    const pts=g.pts.map(p=>P(p[0],p[1],p[2]||0));
    if(g.tipo==="terreno"){
      /* cada celda del terreno lleva su sombreado: es lo que deja leer la
         ladera en vez de un plano de color liso */
      const t=g.tono==null?1:g.tono;
      const c2=[Math.round(143*t+18), Math.round(163*t+14), Math.round(106*t+12)];
      o+='<path d="'+d(pts)+'" fill="rgb('+c2[0]+','+c2[1]+','+c2[2]+')" '+
         'stroke="rgb('+c2[0]+','+c2[1]+','+c2[2]+')" stroke-width=".4"/>';
    } else if(g.tipo==="lindero")
      o+='<path d="'+d(pts)+'" fill="none" stroke="#7D6B3E" stroke-width="1.7" stroke-linejoin="round"/>';
    else if(g.tipo==="antejardin")
      o+='<path d="'+dl(pts)+'" fill="none" stroke="#C9A45C" stroke-width="1.1" stroke-dasharray="6 5"/>';
    else if(g.tipo==="plataforma")
      o+='<path d="'+d(pts)+'" fill="#F4F3EB" stroke="#BFBDAE" stroke-width="1.2"/>';
    else
      o+='<path d="'+d(pts)+'" fill="#E4E0D2" stroke="#BFBDAE" stroke-width=".8"/>';
  });

  /* --- los arcos que quedan por detrás de la casa --- */
  const arco=(a,detras)=>{
    const seg=[]; let cur=[];
    a.pts.forEach(p=>{
      const atras = ISO.fondo(p[0],p[1],p[2]) > 0;
      if(atras===detras) cur.push(P(p[0],p[1],p[2]));
      else if(cur.length){ seg.push(cur); cur=[]; }
    });
    if(cur.length) seg.push(cur);
    return seg.filter(g=>g.length>1).map(g=>
      '<path d="'+dl(g)+'" fill="none" stroke="'+a.c+'" stroke-width="2.6" '+
      'stroke-linecap="round" stroke-dasharray="1 7" opacity="'+(detras?".55":"1")+'"/>').join("");
  };
  esc.cielo.forEach(a=>{ o+=arco(a,true); });

  /* --- los volúmenes, del fondo hacia adelante --- */
  esc.piezas.forEach(bl=>{
    const b0=bl.base.map(p=>P(p[0],p[1],bl.b||0));
    const bt=bl.base.map(p=>P(p[0],p[1],bl.h));
    const tapaIA=COLOR_IA_CSS[bl.cls]&&bl.cls!=="muro"&&bl.cls!=="porche" ? COLOR_IA_CSS[bl.cls] : null;
    const cara=bl.cls==="porche"?"#FFFFFF":"#FDFCF8";
    const linea="#3B453A";
    /* muros: sólo los que se ven, ordenados por profundidad */
    const lados=[];
    for(let i=0;i<4;i++){
      const j=(i+1)%4;
      const m=[(bl.base[i][0]+bl.base[j][0])/2,(bl.base[i][1]+bl.base[j][1])/2];
      lados.push({q:[b0[i],b0[j],bt[j],bt[i]], z:ISO.fondo(m[0],m[1],bl.h/2)});
    }
    lados.sort((a,b)=>b.z-a.z).forEach((l,i)=>{
      if(i<2) return;                                  /* las dos caras de atrás no se ven */
      o+='<path d="'+d(l.q)+'" fill="'+cara+'" stroke="'+linea+'" stroke-width="1.15" stroke-linejoin="round"/>';
    });
    o+='<path d="'+d(bt)+'" fill="'+(tapaIA||"#FFFFFF")+'" stroke="'+linea+'" stroke-width="1.15" stroke-linejoin="round"/>';
    if(bl.cls==="porche")
      o+='<path d="'+d(bt)+'" fill="'+linea+'" opacity=".07"/>';
  });

  /* --- los arcos que pasan por delante, con sus soles --- */
  const sol=(p,r,c)=>{
    let g='<g><circle cx="'+p[0].toFixed(1)+'" cy="'+p[1].toFixed(1)+'" r="'+r+'" fill="'+c+'"/>';
    for(let i=0;i<8;i++){
      const a=i*Math.PI/4, r1=r*1.5, r2=r*2.15;
      g+='<line x1="'+(p[0]+Math.cos(a)*r1).toFixed(1)+'" y1="'+(p[1]+Math.sin(a)*r1).toFixed(1)+
         '" x2="'+(p[0]+Math.cos(a)*r2).toFixed(1)+'" y2="'+(p[1]+Math.sin(a)*r2).toFixed(1)+
         '" stroke="'+c+'" stroke-width="2" stroke-linecap="round"/>';
    }
    return g+'</g>';
  };
  esc.cielo.forEach(a=>{
    o+=arco(a,false);
    /* la punta poniente, con flecha */
    const u=a.pts[a.pts.length-1], v=a.pts[a.pts.length-6]||a.pts[0];
    const pu=P(u[0],u[1],u[2]), pv=P(v[0],v[1],v[2]);
    const ang=Math.atan2(pu[1]-pv[1],pu[0]-pv[0]), F=9;
    o+='<path d="M'+pu[0].toFixed(1)+' '+pu[1].toFixed(1)+
        'L'+(pu[0]-Math.cos(ang-0.42)*F).toFixed(1)+' '+(pu[1]-Math.sin(ang-0.42)*F).toFixed(1)+
        'L'+(pu[0]-Math.cos(ang+0.42)*F).toFixed(1)+' '+(pu[1]-Math.sin(ang+0.42)*F).toFixed(1)+
        'Z" fill="'+a.c+'"/>';
    a.soles.forEach(x=>{ o+=sol(P(x.p[0],x.p[1],x.p[2]), 5.6, a.c); });
  });

  /* --- rosa de los vientos --- */
  esc.rosa.forEach(r=>{
    const p=P(r.p[0],r.p[1],0);
    o+='<text x="'+p[0].toFixed(1)+'" y="'+p[1].toFixed(1)+'" text-anchor="middle" dy="3.5" '+
       'font-family="var(--sans)" font-size="11" font-weight="700" fill="#8A9184">'+T(r.t)+'</text>';
  });

  /* --- leyenda --- */
  const ly=H-9, col=(W-2*M)/esc.cielo.length;
  esc.cielo.forEach((a,i)=>{
    const lx=M+i*col;
    o+='<rect x="'+lx+'" y="'+(ly-8)+'" width="10" height="10" rx="2" fill="'+a.c+'"/>'+
       '<text x="'+(lx+15)+'" y="'+ly+'" font-family="var(--sans)" font-size="10" '+
       'letter-spacing=".07em" fill="#6B7367">'+T(a.t).toUpperCase()+'</text>';
  });
  return o+'</svg>';
}

function diagramaSolar(R, rumboCasa){
  const cx=R, cy=R, r=R-16;
  const P=(alt,az)=>{ const rr=(90-alt)/90*r, a=(az-90)*Math.PI/180;
                      return [cx+rr*Math.cos(a), cy+rr*Math.sin(a)]; };
  let s='<svg viewBox="0 0 '+(R*2)+' '+(R*2)+'" width="100%" style="max-width:'+(R*2)+'px;display:block;margin:0 auto">';
  s+='<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="var(--surface-2)" stroke="var(--line)"/>';
  [30,60].forEach(a=>{ const rr=(90-a)/90*r;
    s+='<circle cx="'+cx+'" cy="'+cy+'" r="'+rr.toFixed(1)+'" fill="none" stroke="var(--line)" stroke-dasharray="2 3"/>';
    s+='<text x="'+(cx+3)+'" y="'+(cy-rr+11)+'" font-size="9" fill="var(--muted)">'+a+'°</text>'; });
  const OESTE = () => TT("O","W");
  [[0,"N"],[90,"E"],[180,"S"],[270,OESTE()]].forEach(([a,t])=>{
    const p1=P(0,a), p2=P(90,a);
    s+='<line x1="'+p1[0].toFixed(1)+'" y1="'+p1[1].toFixed(1)+'" x2="'+p2[0].toFixed(1)+'" y2="'+p2[1].toFixed(1)+
       '" stroke="var(--line)"/>';
    const pl=P(-7,a);
    s+='<text x="'+pl[0].toFixed(1)+'" y="'+(pl[1]+4).toFixed(1)+'" font-size="11" font-weight="700" '+
       'text-anchor="middle" fill="var(--ink-2)">'+t+'</text>'; });
  if(rumboCasa!=null){
    [rumboCasa, rumboCasa+180].forEach(a=>{ const p=P(0,a);
      s+='<line x1="'+cx+'" y1="'+cy+'" x2="'+p[0].toFixed(1)+'" y2="'+p[1].toFixed(1)+
         '" stroke="var(--gold)" stroke-width="2.2" stroke-opacity=".55"/>'; });
  }
  HITOS.forEach(h=>{
    const d=h.recorrido.map((p,i)=>{const q=P(p.alt,p.az);return (i?"L":"M")+q[0].toFixed(1)+" "+q[1].toFixed(1);}).join("");
    s+='<path d="'+d+'" fill="none" stroke="'+h.c+'" stroke-width="2.1" stroke-linecap="round"/>';
    const m=P(h.mediodia.alt,h.mediodia.az);
    s+='<circle cx="'+m[0].toFixed(1)+'" cy="'+m[1].toFixed(1)+'" r="3.1" fill="'+h.c+'"/>';
  });
  return s+'</svg>';
}

/* ------------------------------ la hoja -------------------------------- */
/* =========================================================================
   VIVIENDA EN TERRAZA — lotes 47 a 53
   Estos siete lotes son los de la ladera del occidente y son los más difíciles
   del proyecto. No es una opinión: rasterizando el levantamiento a 1 m, el 47
   tiene 167 m² por debajo del 5 % en 3.830, y el 48 tiene 131 m² en 3.119 con
   el 60 % del lote por encima del 25 %. Una casa de una sola plataforma ahí no
   se posa: se entierra. El propio modelo de implantación lo dice — 976 m³ de
   corte en el 47, 1.412 m³ en el 53, y en el 48 sencillamente no cabe.

   Así que para estos lotes se proponen dos maneras de construir que trabajan
   CON la pendiente en vez de pelearse con ella. Son modelos volumétricos de
   arquitectura, no levantamientos: lo medido es el terreno —la pendiente, el
   desnivel, la dirección de caída y por tanto el corte que resulta—; lo
   propuesto son las dimensiones de la casa, y van dichas como propuesta.

   T1 · BANCAL      Tres plataformas escalonadas siguiendo la ladera. La
                    profundidad de cada una sale de la pendiente MEDIDA del
                    lote, de modo que el escalón entre plataformas sea de
                    1,50 m. Eso tiene una consecuencia bonita y demostrable:
                    el corte máximo es s·p/2 = 0,75 m en cualquier lote, porque
                    p se eligió como 1,50/s. Un solo escalón de altura media
                    persona, no un muro de contención.

   T2 · MIRADOR     Dos pisos de verdad: el nivel inferior metido contra la
                    ladera por el lado alto y abierto al valle por el bajo.
                    El fondo sale de la pendiente medida, F = 3,00/s, que es
                    exactamente lo que hace falta para que la cara de abajo
                    salga a la luz. Estos siete son los únicos lotes del
                    proyecto donde ese nivel inferior es posible.
   ========================================================================= */
/* ¿QUÉ LOTE NECESITA TERRACEO? NO SE DECIDE POR NÚMERO.
   La lista fija 47–53 dejaba fuera lotes más difíciles que varios de los que
   incluía. Ahora lo decide la medida: el desnivel que queda BAJO LA HUELLA de
   la casa una vez implantada. Si el terreno baja 3,00 m o más a lo largo de la
   casa —un piso entero— una sola plataforma obliga a un corte que el terraceo
   resuelve en bancales; es exactamente el caso que la implantación ya marca
   como "dos niveles". Y entran también los lotes donde no cabe ningún volumen:
   son los más difíciles del predio y los que más falta hace saber explicar.
   Los 47 a 53 van siempre, porque así se pidieron. */
const LOTES_TERRAZA=[47,48,49,50,51,52,53];
const DESNIVEL_TERRAZA = 3.00;
const TZ={ escalon:1.50, areaPlat:70, piso:3.00, alto:3.00, areaNivel:150, volado:3.00 };
function esTerraza(n){
  if(LOTES_TERRAZA.indexOf(+n)>=0) return true;
  const A=IMPL[String(n)];
  if(!A) return false;
  if(!A.k) return true;                       /* no cabe ningún volumen: el caso extremo */
  return (A.k.d||0) >= DESNIVEL_TERRAZA || A.k.mod==="2p";
}

function datosTerraza(n){
  const L=DATA.lotes.find(x=>x.n===n); if(!L) return null;
  const g0=L.g.map(PX), PR=DATA.prot.map(r=>r.map(PX));
  const PASO=1.5;
  let sp=0, np=0, plano=0, esc=0, planoTot=0, nTot=0;
  muestrearLote(g0,PASO).forEach(([x,y,pe])=>{
    nTot++; if(pe<5) planoTot++;
    if(PR.some(r=>dentroAnillo(x,y,r))) return;     /* la faja de protección no se construye */
    sp+=pe; np++; if(pe<5) plano++; if(pe>25) esc++;
  });
  if(np<20) return null;
  const s=(sp/np)/100, A2=PASO*PASO;
  const cl=(v,a,b)=>Math.max(a,Math.min(b,v));
  /* T1: la profundidad del bancal la fija la pendiente, no el gusto */
  const p1=cl(TZ.escalon/s, 4.0, 8.0), a1=cl(TZ.areaPlat/p1, 9, 18);
  const esc1=s*p1;                          /* escalón real que resulta */
  /* T2: el fondo que hace falta para que el nivel inferior salga a la luz */
  const F=cl(TZ.piso/s, 9.0, 16.0), a2=cl(TZ.areaNivel/F, 9, 18);
  const A=IMPL[String(n)], K=A&&A.k;
  return {
    pend:s*100, util:np*A2, plano:plano*A2, escarp:esc*A2,
    planoTot:planoTot*A2, totalMed:nTot*A2,
    t1:{ p:p1, a:a1, esc:esc1, area:3*p1*a1, corte:s*p1/2,
         vol:3*a1*p1*(s*p1/4), largo:3*p1, caida:3*esc1 },
    t2:{ F:F, a:a2, area:2*F*a2, terraza:a2*TZ.volado, corte:TZ.piso/2,
         vol:F*a2*TZ.piso/2, aflora:s*F-TZ.piso, alto:2*TZ.alto },
    plana: K ? {area:K.ac||K.an, co:K.co, ll:K.ll||0} : null
  };
}

/* --------------------------------------------------------------------------
   El corte del modelo sobre el perfil REAL del lote. El terreno sale del MDT
   exactamente igual que en "El corte del terreno"; lo único que se añade es la
   casa propuesta, dibujada a la misma escala y en la misma línea de máxima
   pendiente, para que se vea cuánta tierra se mueve de verdad.
   -------------------------------------------------------------------------- */
/* La geometría del corte se calcula una sola vez y la usan los dos dibujos: el
   de pantalla, en SVG, y el de la ficha PDF. Si se calculara aparte en cada uno
   acabarían diciendo cosas distintas del mismo lote. */
function geomTerraza(n, modo){
  const L=DATA.lotes.find(x=>x.n===n), D=datosTerraza(n);
  if(!L||!D) return null;
  const g0=L.g.map(PX);
  const c=PX(L.c); let cx=c[0], cy=c[1];
  let dx=0, dy=0;
  muestrearLote(g0,4).forEach(([x,y])=>{ const b=MDT.bajada(x,y); if(b){dx+=b[0]; dy+=b[1];} });
  let m=Math.hypot(dx,dy); if(m<1e-6){dx=1;dy=0;m=1;} dx/=m; dy/=m;
  const alcance=sg=>{ let t=0; for(let k=0.5;k<400;k+=0.5){
      if(!dentroAnillo(cx+dx*sg*k, cy+dy*sg*k, g0)) break; t=k; } return t; };
  const tA=-alcance(-1), tB=alcance(1);
  if(tB-tA<12) return "";
  const N=200, muestras=[];
  for(let i=0;i<=N;i++){
    const t=tA+(tB-tA)*i/N, z=MDT.cota(cx+dx*t, cy+dy*t);
    if(!isNaN(z)) muestras.push([t,z]);
  }
  if(muestras.length<12) return "";
  const zEn = t => {                       /* cota del terreno en la abscisa t */
    let mejor=muestras[0];
    for(const v of muestras) if(Math.abs(v[0]-t)<Math.abs(mejor[0]-t)) mejor=v;
    return mejor[1];
  };
  /* dónde se posa la casa: arranca a un tercio del recorrido, ladera abajo */
  const largoCasa = modo==="t1" ? D.t1.largo : D.t2.F;
  let t0 = tA + (tB-tA-largoCasa)*0.38;
  t0 = Math.max(tA+1, Math.min(t0, tB-largoCasa-1));
  const t1f = t0+largoCasa;

  /* --- niveles de la casa --- */
  const cuerpos=[];                        /* {ta,tb,npt,alto,rot} */
  if(modo==="t1"){
    for(let k=0;k<3;k++){
      const a=t0+k*D.t1.p, b=a+D.t1.p;
      const npt=(zEn(a)+zEn(b))/2;         /* plataforma a media altura: corte = lleno */
      cuerpos.push({ta:a, tb:b, npt:npt, alto:TZ.alto, rot:["B1","B2","B3"][k]});
    }
  } else {
    const nptSup=zEn(t0);                                   /* entra a nivel por arriba */
    cuerpos.push({ta:t0, tb:t1f, npt:nptSup-TZ.piso, alto:TZ.piso, rot:"N−1"});
    cuerpos.push({ta:t0, tb:t1f, npt:nptSup, alto:TZ.alto, rot:"N0"});
  }
  const zs=muestras.map(v=>v[1]);
  let zmin=Math.min(...zs), zmax=Math.max(...zs);
  cuerpos.forEach(q=>{ zmin=Math.min(zmin,q.npt); zmax=Math.max(zmax,q.npt+q.alto); });
  const holg=Math.max(1.5,(zmax-zmin)*0.14); zmin-=holg; zmax+=holg;
  const azArriba=(Math.atan2(-dx,dy)*180/Math.PI+360)%360;
  return {D:D, tA:tA, tB:tB, muestras:muestras, cuerpos:cuerpos,
          zmin:zmin, zmax:zmax, az:azArriba};
}

function corteTerraza(n, modo, W, H){
  const G=geomTerraza(n, modo);
  if(!G) return "";
  const D=G.D, tA=G.tA, tB=G.tB, muestras=G.muestras, cuerpos=G.cuerpos;
  const zmin=G.zmin, zmax=G.zmax;
  const M={i:52,d:16,s:16,b:34}, gw=W-M.i-M.d, gh=H-M.s-M.b;
  const X=t=>M.i+(t-tA)/(tB-tA)*gw, Y=z=>M.s+(zmax-z)/(zmax-zmin)*gh;
  const perfil=muestras.map(([t,z],i)=>(i?"L":"M")+X(t).toFixed(1)+" "+Y(z).toFixed(1)).join("");

  let o='<svg viewBox="0 0 '+W+' '+H+'" width="100%" height="'+Math.round(H)+
        '" preserveAspectRatio="xMidYMid meet" style="display:block;border-radius:9px;background:var(--surface-2)">';
  o+='<defs>'
   + '<pattern id="tzc'+n+modo+'" width="6" height="6" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">'
   + '<line x1="0" y1="0" x2="0" y2="6" stroke="#A3543F" stroke-width="1.6" stroke-opacity=".55"/></pattern>'
   + '<pattern id="tzl'+n+modo+'" width="6" height="6" patternTransform="rotate(-45)" patternUnits="userSpaceOnUse">'
   + '<line x1="0" y1="0" x2="0" y2="6" stroke="#4C8862" stroke-width="1.6" stroke-opacity=".55"/></pattern>'
   + '</defs>';
  const pasoZ=(zmax-zmin)>26?5:(zmax-zmin)>13?2:1;
  for(let z=Math.ceil(zmin/pasoZ)*pasoZ; z<=zmax; z+=pasoZ)
    o+='<line x1="'+M.i+'" y1="'+Y(z).toFixed(1)+'" x2="'+(W-M.d)+'" y2="'+Y(z).toFixed(1)+
       '" stroke="var(--line-soft)" stroke-width="1"/>'
     + '<text x="'+(M.i-7)+'" y="'+(Y(z)+3.2).toFixed(1)+'" font-size="9" text-anchor="end" '+
       'fill="var(--muted)" font-variant-numeric="tabular-nums">'+ent(z)+'</text>';
  o+='<path d="'+perfil+'L'+X(muestras[muestras.length-1][0]).toFixed(1)+' '+(H-M.b)+
     'L'+X(muestras[0][0]).toFixed(1)+' '+(H-M.b)+'Z" fill="var(--ground)" fill-opacity=".55"/>';

  /* corte y lleno de cada plataforma, cuerpo a cuerpo */
  cuerpos.forEach(q=>{
    if(modo==="t2" && q.rot==="N0") return;             /* el piso alto no toca tierra */
    const dentro=muestras.filter(([t])=>t>=q.ta&&t<=q.tb);
    if(dentro.length<2) return;
    const banda=arriba=>{
      let d="M"+X(dentro[0][0]).toFixed(1)+" "+Y(q.npt).toFixed(1);
      dentro.forEach(([t,z])=>{ d+="L"+X(t).toFixed(1)+" "+Y(arriba?Math.max(z,q.npt):Math.min(z,q.npt)).toFixed(1); });
      return d+"L"+X(dentro[dentro.length-1][0]).toFixed(1)+" "+Y(q.npt).toFixed(1)+"Z";
    };
    o+='<path d="'+banda(true)+'" fill="url(#tzc'+n+modo+')"/>';
    o+='<path d="'+banda(false)+'" fill="url(#tzl'+n+modo+')"/>';
  });
  o+='<path d="'+perfil+'" fill="none" stroke="var(--ink-2)" stroke-width="1.9" '+
     'stroke-dasharray="6 4" stroke-linejoin="round"/>';

  /* los cuerpos de la casa */
  cuerpos.forEach(q=>{
    const xa=X(q.ta), xb=X(q.tb), yt=Y(q.npt+q.alto), yb=Y(q.npt);
    const bajo = (modo==="t2" && q.rot==="N−1");
    o+='<rect x="'+xa.toFixed(1)+'" y="'+yt.toFixed(1)+'" width="'+(xb-xa).toFixed(1)+
       '" height="'+(yb-yt).toFixed(1)+'" fill="var(--forest)" fill-opacity="'+(bajo?".40":".78")+
       '" stroke="var(--forest-deep)" stroke-width="1.2"/>';
    o+='<line x1="'+xa.toFixed(1)+'" y1="'+yb.toFixed(1)+'" x2="'+xb.toFixed(1)+'" y2="'+yb.toFixed(1)+
       '" stroke="var(--forest-deep)" stroke-width="2.6"/>';
    if(xb-xa>26)
      o+='<text x="'+((xa+xb)/2).toFixed(1)+'" y="'+((yt+yb)/2+4).toFixed(1)+
         '" font-size="10.5" font-weight="700" text-anchor="middle" fill="'+
         (bajo?"var(--forest-deep)":"var(--on-forest)")+'">'+q.rot+'</text>';
  });
  /* la terraza del modelo mirador: la losa que vuela sobre el nivel de abajo */
  if(modo==="t2"){
    const q=cuerpos[1], xb=X(q.tb), xv=X(q.tb+TZ.volado), y=Y(q.npt);
    o+='<line x1="'+xb.toFixed(1)+'" y1="'+y.toFixed(1)+'" x2="'+Math.min(xv,W-M.d).toFixed(1)+
       '" y2="'+y.toFixed(1)+'" stroke="var(--gold)" stroke-width="3.4" stroke-linecap="round"/>';
    o+='<text x="'+Math.min(xv,W-M.d).toFixed(1)+'" y="'+(y-7).toFixed(1)+
       '" font-size="9.5" font-weight="700" text-anchor="end" fill="#8A5F14">'+T("terraza")+'</text>';
  }
  /* eje horizontal */
  o+='<line x1="'+M.i+'" y1="'+(H-M.b)+'" x2="'+(W-M.d)+'" y2="'+(H-M.b)+
     '" stroke="var(--line)" stroke-width="1"/>';
  const largo=tB-tA, pasoX=largo>140?40:largo>70?20:10;
  for(let t=Math.ceil(tA/pasoX)*pasoX; t<=tB; t+=pasoX)
    o+='<line x1="'+X(t).toFixed(1)+'" y1="'+(H-M.b)+'" x2="'+X(t).toFixed(1)+'" y2="'+(H-M.b+4)+
       '" stroke="var(--line)" stroke-width="1"/>'
     + '<text x="'+X(t).toFixed(1)+'" y="'+(H-M.b+15)+'" font-size="9" text-anchor="middle" '+
       'fill="var(--muted)" font-variant-numeric="tabular-nums">'+ent(t-tA)+'</text>';
  o+='<text x="14" y="'+(H-M.b+15)+'" font-size="9" fill="var(--muted)">'+TT("cota","elev.","cote")+'</text>';
  o+='<text x="'+((M.i+W-M.d)/2).toFixed(0)+'" y="'+(H-6)+'" font-size="9" text-anchor="middle" '+
     'fill="var(--muted)">'+TT("metros a lo largo del corte","metres along the section",
                               "mètres le long de la coupe")+'</text>';
  const azArriba=G.az;
  o+='<text x="'+M.i+'" y="'+(M.s+10)+'" font-size="9" fill="var(--muted)">'+rumboTxt((azArriba+180)%360)+'</text>';
  o+='<text x="'+(W-M.d)+'" y="'+(M.s+10)+'" font-size="9" text-anchor="end" fill="var(--muted)">'+
     rumboTxt(azArriba)+'</text>';
  /* si el dibujo no sale a la misma escala en las dos direcciones hay que decirlo:
     una ladera exagerada vende miedo, y una aplanada vende humo */
  const VE=(gh/(zmax-zmin))/(gw/(tB-tA));
  if(VE>1.12||VE<0.89)
    o+='<text x="'+((M.i+W-M.d)/2).toFixed(0)+'" y="'+(M.s+10)+'" font-size="9" text-anchor="middle" '+
       'fill="var(--muted)">'+TT("escala vertical ×","vertical scale ×","échelle verticale ×")+dec(VE,1)+'</text>';
  return o+'</svg>';
}

/* --------------------------------------------------------------------------
   El bloque que se mete en el informe del lote. Sólo para los siete de ladera.
   -------------------------------------------------------------------------- */
function bloqueTerraza(n){
  const AW = anchoDib();
  if(!esTerraza(n)) return "";
  const D=datosTerraza(n); if(!D) return "";
  const L=DATA.lotes.find(x=>x.n===n);
  const pctPlano=D.plano/D.util*100, pctEsc=D.escarp/D.util*100;
  const fila=(a,b,c,d)=>'<tr><td>'+a+'</td><td>'+b+'</td><td>'+c+'</td><td>'+d+'</td></tr>';
  const tabla=
   '<table class="tbl" style="margin-top:12px"><thead><tr>'+
     '<th>'+T("Manera de construir")+'</th><th>'+T("Área construida")+'</th>'+
     '<th>'+T("Corte máximo")+'</th><th>'+T("Tierra movida")+'</th></tr></thead><tbody>'+
   (D.plana
     ? fila(T("Una sola plataforma")+' <span style="color:var(--muted)">('+T("casa tipo")+')</span>',
            ent(D.plana.area)+' m²',
            '<b style="color:#A3543F">'+dec(D.pend/100*Math.sqrt(D.plana.area)/2,2)+' m</b>',
            ent(D.plana.co)+' m³ '+T("de corte")+' + '+ent(D.plana.ll)+' m³ '+T("de lleno"))
     : fila(T("Una sola plataforma")+' <span style="color:var(--muted)">('+T("casa tipo")+')</span>',
            '<span style="color:#A3543F">'+T("no cabe")+'</span>','—','—'))+
   fila('<b>T1 · '+T("Bancal")+'</b>', ent(D.t1.area)+' m²',
        '<b style="color:var(--forest-deep)">'+dec(D.t1.corte,2)+' m</b>',
        ent(D.t1.vol)+' m³ '+T("de corte")+' + '+ent(D.t1.vol)+' m³ '+T("de lleno"))+
   fila('<b>T2 · '+T("Mirador")+'</b>', ent(D.t2.area)+' m²',
        '<b>'+dec(TZ.piso,2)+' m</b> <span style="color:var(--muted)">('+T("un piso")+')</span>',
        ent(D.t2.vol)+' m³ '+T("de corte"))+
   '</tbody></table>';

  return '<h3>'+TT("Vivienda en terraza","Terraced house","Maison en terrasses")+'</h3>'+
  '<div class="avisoDato" style="border-color:#8A5F14">'+TT(
    'Este es uno de los siete lotes de la ladera. En todo el lote hay '+ent(D.planoTot)+
    ' m² por debajo del 5 % de pendiente, pero fuera de la faja de protección —que es lo único '+
    'utilizable— quedan '+ent(D.plano)+' m² ('+dec(pctPlano,1)+' % del área útil). '+
    ent(D.escarp)+' m² ('+dec(pctEsc,1)+' %) pasan del 25 %, y la pendiente media medida del área '+
    'útil es del '+dec(D.pend,1)+' %. Aquí la casa no se posa: se escalona.',
    'This is one of the seven hillside lots. Over the measured usable area, only '+
    ent(D.plano)+' m² ('+dec(pctPlano,1)+'%) fall below 5% slope and '+ent(D.escarp)+' m² ('+
    dec(pctEsc,1)+'%) exceed 25%. The measured mean slope is '+dec(D.pend,1)+'%. Here a house '+
    'cannot simply sit on the ground: it has to step down.',
    'C\u2019est l\u2019un des sept lots en pente. Sur la surface utile mesurée, seuls '+
    ent(D.plano)+' m² ('+dec(pctPlano,1)+' %) sont sous 5 % de pente et '+ent(D.escarp)+' m² ('+
    dec(pctEsc,1)+' %) dépassent 25 %. La pente moyenne mesurée est de '+dec(D.pend,1)+' %.')+'</div>'+
  tabla+
  '<p class="p pie">'+TT(
    'El terreno de las tres filas es el mismo y está medido. Lo que cambia es la manera de posarse '+
    'encima. La casa tipo de una sola plataforma tiene que abrir un solo banco para toda el área: '+
    'por eso el corte se va a metros. Los dos modelos de abajo reparten ese desnivel.',
    'The ground in all three rows is the same and it is measured. What changes is how the house sits '+
    'on it. The single-platform house has to open one bench for the whole area, which is why the cut '+
    'runs into metres. The two models below spread that drop out.',
    'Le terrain des trois lignes est le même et il est mesuré. Ce qui change, c\u2019est la façon de s\u2019y '+
    'poser. La maison type à plateforme unique doit ouvrir un seul banc pour toute la surface.')+'</p>'+

  '<h4 style="margin:20px 0 6px">T1 · '+TT("Bancal","Bench","Banquette")+' — '+
    ent(D.t1.area)+' m² '+TT("en tres plataformas","on three platforms","sur trois plateformes")+'</h4>'+
  '<div class="ubiBox">'+corteTerraza(n,"t1",AW,altoDib(AW,300))+'</div>'+
  '<p class="p pie">'+TT(
    'Tres plataformas de '+dec(D.t1.a,1)+' × '+dec(D.t1.p,1)+' m, cada una '+dec(D.t1.esc,2)+
    ' m más abajo que la anterior. El fondo de la plataforma no se escogió: sale de la pendiente '+
    'medida del lote, de manera que el escalón quede en el metro y medio. Por eso el corte máximo '+
    'es de '+dec(D.t1.corte,2)+' m —media persona— y el lleno el mismo, así que la tierra que sale '+
    'de una plataforma es la que entra en la siguiente: '+ent(D.t1.vol)+' m³ que no salen del lote. '+
    'La cubierta de cada bancal es la terraza del de arriba. En total la casa recorre '+
    dec(D.t1.largo,1)+' m de ladera y baja '+dec(D.t1.caida,2)+' m.',
    'Three platforms of '+dec(D.t1.a,1)+' × '+dec(D.t1.p,1)+' m, each '+dec(D.t1.esc,2)+
    ' m below the previous one. The platform depth was not chosen: it comes from the lot\u2019s measured '+
    'slope so that the step stays around a metre and a half. The maximum cut is therefore '+
    dec(D.t1.corte,2)+' m and the fill the same, so the soil taken from one platform goes into the '+
    'next: '+ent(D.t1.vol)+' m³ that never leave the lot. Each bench\u2019s roof is the terrace above it.',
    'Trois plateformes de '+dec(D.t1.a,1)+' × '+dec(D.t1.p,1)+' m, chacune '+dec(D.t1.esc,2)+
    ' m sous la précédente. Le déblai maximal est de '+dec(D.t1.corte,2)+' m et le remblai identique.')+'</p>'+

  '<h4 style="margin:20px 0 6px">T2 · '+TT("Mirador","Overlook","Belvédère")+' — '+
    ent(D.t2.area)+' m² '+TT("en dos pisos","on two floors","sur deux niveaux")+'</h4>'+
  '<div class="ubiBox">'+corteTerraza(n,"t2",AW,altoDib(AW,300))+'</div>'+
  '<p class="p pie">'+TT(
    'Dos niveles de '+dec(D.t2.a,1)+' × '+dec(D.t2.F,1)+' m, uno sobre otro, con '+dec(TZ.piso,2)+
    ' m entre pisos. El de arriba entra a nivel desde la vía; el de abajo va contra la ladera por el '+
    'lado alto y sale a la luz por el bajo — el fondo de '+dec(D.t2.F,1)+' m es justamente el que hace '+
    'falta para que eso ocurra con la pendiente medida de este lote, del '+dec(D.pend,1)+' %. '+
    'La losa que vuela '+dec(TZ.volado,1)+' m sobre el nivel de abajo es la terraza, '+ent(D.t2.terraza)+
    ' m² mirando al valle. Corte: '+ent(D.t2.vol)+' m³, todo bajo el propio edificio. '+
    'Estos siete lotes son los únicos del proyecto donde ese nivel inferior tiene sentido, porque '+
    'son los únicos con desnivel suficiente para que no quede enterrado.',
    'Two levels of '+dec(D.t2.a,1)+' × '+dec(D.t2.F,1)+' m, one above the other, '+dec(TZ.piso,2)+
    ' m apart. The upper one is entered at grade from the road; the lower one is cut into the hill '+
    'on the uphill side and opens to daylight on the downhill side — the '+dec(D.t2.F,1)+' m depth is '+
    'exactly what that takes at this lot\u2019s measured '+dec(D.pend,1)+'% slope. Cut: '+ent(D.t2.vol)+' m³.',
    'Deux niveaux de '+dec(D.t2.a,1)+' × '+dec(D.t2.F,1)+' m, superposés, '+dec(TZ.piso,2)+
    ' m d\u2019écart. Déblai : '+ent(D.t2.vol)+' m³.')+'</p>'+
  '<p class="p pie" style="border-top:1px dashed var(--line);padding-top:9px">'+TT(
    'Qué está medido y qué está propuesto: el terreno de los dos cortes, la pendiente, el desnivel y '+
    'la dirección de caída salen del levantamiento del plano 039 y del modelo de alturas. Las '+
    'dimensiones de los dos modelos son una propuesta de arquitectura —no hay planos aprobados de '+
    'estas dos casas— y el movimiento de tierra que se anuncia es el que resulta de posarlas sobre '+
    'ese terreno medido. Cualquier proyecto definitivo debe pasar por estudio de suelos.',
    'What is measured and what is proposed: the ground in both sections, the slope, the drop and the '+
    'fall direction come from the survey of plan 039 and the elevation model. The dimensions of the '+
    'two models are an architectural proposal — there are no approved drawings for these two houses — '+
    'and the earthwork quoted is what results from setting them on that measured ground. Any final '+
    'project requires a soil study.',
    'Ce qui est mesuré et ce qui est proposé : le terrain des deux coupes vient du levé du plan 039. '+
    'Les dimensions des deux modèles sont une proposition architecturale.')+'</p>';
}

/* =========================================================================
   TOUR INTELIGENTE DE VIVIENDA
   La idea, dicha por la gerencia, es que el cliente entienda a fondo qué puede
   construir en SU lote: la casa, y además el deck, el kiosco, la piscina, el
   jacuzzi, la cancha, la huerta. Lo que se puede responder hoy, y se responde
   aquí, es la pregunta que de verdad decide una compra: QUÉ CABE.

   Se contesta con geometría, no con ganas. Se rasteriza el lote a 1 m y se deja
   sólo el suelo donde de verdad se puede construir —dentro del lindero, a 3 m
   de cada vecino, a 10 m de la vía y fuera de las fajas de protección—, se le
   descuenta la huella de la casa escogida, y sobre lo que queda se prueba si
   cabe cada cosa, girándola en ocho orientaciones. El método se validó contra
   el área construible que ya trae el informe: en seis lotes de prueba la
   diferencia va del 0,2 % al 10 %.

   Las medidas de las canchas son de reglamento y van citadas. Las del deck, el
   kiosco, la piscina, el jacuzzi y la huerta son medidas corrientes y van
   dichas como declaradas: no hay un reglamento que fije el tamaño de un kiosco.

   Lo que NO está y se dice que no está: los renders dinámicos de la casa
   escogida. Esos salen del estudio de arquitectura, no de aquí.
   ========================================================================= */
const COSAS = [
  {k:"deck",  n:["Deck / terraza","Deck / terrace","Terrasse"],          w:8.0,  d:4.0,  f:"decl"},
  {k:"kios",  n:["Kiosco","Gazebo","Kiosque"],                            w:5.0,  d:5.0,  f:"decl"},
  {k:"jacu",  n:["Jacuzzi","Hot tub","Jacuzzi"],                          w:2.5,  d:2.5,  f:"decl"},
  {k:"pisc",  n:["Piscina 8 × 4 m con andén","8 × 4 m pool with deck","Piscine 8 × 4 m"],
                                                                          w:11.0, d:7.0,  f:"decl"},
  {k:"huer",  n:["Huerta","Vegetable garden","Potager"],                  w:12.0, d:6.0,  f:"decl"},
  {k:"voli",  n:["Cancha de voleibol reglamentaria","Regulation volleyball court","Terrain de volley"],
                                                                          w:18.0, d:9.0,  f:"FIVB"},
  {k:"volz",  n:["Voleibol con zona libre de 3 m","Volleyball with 3 m free zone","Volley avec zone libre"],
                                                                          w:24.0, d:15.0, f:"FIVB"},
  {k:"fut5",  n:["Cancha de fútbol sala, medida mínima","Futsal court, minimum size","Terrain de futsal"],
                                                                          w:25.0, d:16.0, f:"FIFA"},
  {k:"balo",  n:["Cancha de baloncesto reglamentaria","Regulation basketball court","Terrain de basket"],
                                                                          w:28.0, d:15.0, f:"FIBA"}
];
const FUENTE_COSA = {
  decl:["medida corriente, declarada","common size, declared","taille courante, déclarée"],
  FIVB:["reglamento FIVB","FIVB rules","règlement FIVB"],
  FIFA:["reglamento FIFA de fútbol sala","FIFA futsal rules","règlement FIFA de futsal"],
  FIBA:["reglamento FIBA","FIBA rules","règlement FIBA"]
};
const RETIRO_LAT = 3.0, ANTEJARDIN = 10.0, PASO_TOUR = 1.0;
/* los tres idiomas ya vienen escritos en el propio dato */
const tri = a => a[LANG==="en"?1:LANG==="fr"?2:0] || a[0];

function distPoli(x,y,pts){
  let m=Infinity;
  for(let i=0;i<pts.length-1;i++){
    const ax=pts[i][0], ay=pts[i][1], bx=pts[i+1][0], by=pts[i+1][1];
    const dx=bx-ax, dy=by-ay, L=dx*dx+dy*dy;
    let t=L?((x-ax)*dx+(y-ay)*dy)/L:0; t=t<0?0:t>1?1:t;
    const d=Math.hypot(x-(ax+t*dx), y-(ay+t*dy));
    if(d<m) m=d;
  }
  return m;
}

/* El suelo donde de verdad se puede poner algo, celda a celda de 1 m */
function sueloLibre(n){
  const L=DATA.lotes.find(x=>x.n===n); if(!L) return null;
  const A=IMPL[String(n)], K=A&&A.k;
  const g=L.g.map(PX), anillo=g.concat([g[0]]);
  const PR=DATA.prot.map(r=>r.map(PX));
  let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
  g.forEach(p=>{x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);y0=Math.min(y0,p[1]);y1=Math.max(y1,p[1]);});
  const VIAS=DATA.via.map(v=>v.map(PX))
    .filter(v=>v.some(q=>q[0]>x0-70&&q[0]<x1+70&&q[1]>y0-70&&q[1]<y1+70));
  const cel=[];
  let casa=0;
  for(let x=x0;x<=x1;x+=PASO_TOUR) for(let y=y0;y<=y1;y+=PASO_TOUR){
    if(!dentroAnillo(x,y,g)) continue;
    if(PR.some(r=>dentroAnillo(x,y,r))) continue;
    if(distPoli(x,y,anillo) < RETIRO_LAT) continue;
    let dv=Infinity;
    for(const v of VIAS){ const d=distPoli(x,y,v); if(d<dv) dv=d; }
    if(dv < ANTEJARDIN) continue;
    if(K && K.g && dentroAnillo(x,y,K.g)){ casa++; continue; }   /* la casa ya ocupa */
    cel.push([x,y]);
  }
  /* La pendiente del suelo que queda libre: sin esto, "cabe una cancha" se lee
     como "hay dónde ponerla", y en la ladera del occidente eso sería mentir. */
  let sp=0, np=0, pmax=0;
  cel.forEach(([x,y])=>{ const pe=MDT.pendiente(x,y);
    if(!isNaN(pe)){ sp+=pe; np++; if(pe>pmax) pmax=pe; } });
  return {cel:cel, m2:cel.length*PASO_TOUR*PASO_TOUR, casa_m2:casa*PASO_TOUR*PASO_TOUR,
          pend:np?sp/np:NaN, pendMax:np?pmax:NaN, bbox:[x0,y0,x1,y1]};
}

/* ¿Cabe un rectángulo de w × d en ese suelo? Se prueba en ocho orientaciones,
   rasterizando y usando una tabla de sumas para que la respuesta sea inmediata
   aunque el lote tenga tres mil celdas. Devuelve el ángulo donde cabe, o null. */
function cabe(cel, w, d){
  if(!cel.length) return null;
  const W=Math.ceil(w/PASO_TOUR), D=Math.ceil(d/PASO_TOUR);
  for(let a=0;a<8;a++){
    const th=a*Math.PI/8, c=Math.cos(th), sn=Math.sin(th);
    let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
    const rot=cel.map(([x,y])=>{
      const u=x*c+y*sn, v=-x*sn+y*c;
      if(u<x0)x0=u; if(u>x1)x1=u; if(v<y0)y0=v; if(v>y1)y1=v;
      return [u,v];
    });
    const nx=Math.ceil((x1-x0)/PASO_TOUR)+2, ny=Math.ceil((y1-y0)/PASO_TOUR)+2;
    if(nx*ny>400000) continue;
    const m=new Uint8Array(nx*ny);
    rot.forEach(([u,v])=>{
      const i=Math.round((u-x0)/PASO_TOUR), j=Math.round((v-y0)/PASO_TOUR);
      if(i>=0&&j>=0&&i<nx&&j<ny) m[j*nx+i]=1;
    });
    /* tabla de sumas acumuladas */
    const S=new Int32Array((nx+1)*(ny+1));
    for(let j=0;j<ny;j++) for(let i=0;i<nx;i++)
      S[(j+1)*(nx+1)+i+1] = m[j*nx+i] + S[j*(nx+1)+i+1] + S[(j+1)*(nx+1)+i] - S[j*(nx+1)+i];
    const prueba=(ww,dd)=>{
      if(ww>nx||dd>ny) return false;
      for(let j=0;j+dd<=ny;j++) for(let i=0;i+ww<=nx;i++){
        const s=S[(j+dd)*(nx+1)+i+ww]-S[j*(nx+1)+i+ww]-S[(j+dd)*(nx+1)+i]+S[j*(nx+1)+i];
        if(s===ww*dd) return true;
      }
      return false;
    };
    if(prueba(W,D) || prueba(D,W)) return Math.round(th*180/Math.PI);
  }
  return null;
}

/* =========================================================================
   IMPLANTACIÓN EN BANCALES
   No hay lote donde no se pueda construir. Lo que hay son lotes donde no cabe
   una casa de UNA SOLA PLATAFORMA: en 48, 65, 83, 84 y 86 el rectángulo de
   22,4 × 28,4 m no entra en el área construible, y de ahí salía el «no cabe»
   del informe. Pero la casa en tres bancales ocupa 12 × 17,5 m —la profundidad
   de cada bancal la fija la pendiente, no el gusto— y eso sí entra, medido
   celda a celda sobre el mismo suelo libre que usa el tour.

   Aquí se implanta esa casa: se busca dónde cabe el rectángulo, con el eje
   largo puesto sobre la línea de máxima pendiente para que los bancales queden
   atravesados a la ladera, y se calcula el nivel de piso de cada bancal como el
   promedio del terreno bajo su banda —corte igual a lleno, que es lo que hace
   que el movimiento de tierra baje de más de mil metros cúbicos a menos de cien.
   ========================================================================= */
function ubicarRect(cel, w, d, thPref){
  if(!cel || !cel.length) return null;
  const P=PASO_TOUR;
  /* HOLGURA. La rejilla es de 1 m y lo que se comprueba son CENTROS de celda:
     el rectángulo de verdad puede sobresalir hasta medio metro por cada lado de
     la celda más externa. En el lote 48 eso bastaba para que una esquina de la
     casa cayera sobre la faja de protección. Se busca entonces un hueco un
     metro más grande por lado y el rectángulo se coloca centrado dentro. */
  const HOL=1;
  const W=Math.ceil(w/P)+2*HOL, D=Math.ceil(d/P)+2*HOL;
  const angs=[];
  if(thPref!=null) angs.push(thPref);
  for(let a=0;a<8;a++) angs.push(a*Math.PI/8);
  for(const th of angs){
    const c=Math.cos(th), sn=Math.sin(th);
    let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
    const rot=cel.map(([x,y])=>{ const u=x*c+y*sn, v=-x*sn+y*c;
      if(u<x0)x0=u; if(u>x1)x1=u; if(v<y0)y0=v; if(v>y1)y1=v; return [u,v]; });
    const nx=Math.ceil((x1-x0)/P)+2, ny=Math.ceil((y1-y0)/P)+2;
    if(nx*ny>400000) continue;
    const m=new Uint8Array(nx*ny);
    rot.forEach(([u,v])=>{ const i=Math.round((u-x0)/P), j=Math.round((v-y0)/P);
      if(i>=0&&j>=0&&i<nx&&j<ny) m[j*nx+i]=1; });
    const S=new Int32Array((nx+1)*(ny+1));
    for(let j=0;j<ny;j++) for(let i=0;i<nx;i++)
      S[(j+1)*(nx+1)+i+1]=m[j*nx+i]+S[j*(nx+1)+i+1]+S[(j+1)*(nx+1)+i]-S[j*(nx+1)+i];
    let cu=0, cv=0; rot.forEach(([u,v])=>{cu+=u;cv+=v;}); cu/=rot.length; cv/=rot.length;
    let mejor=null;
    for(let j=0;j+D<=ny;j++) for(let i=0;i+W<=nx;i++){
      const q=S[(j+D)*(nx+1)+i+W]-S[j*(nx+1)+i+W]-S[(j+D)*(nx+1)+i]+S[j*(nx+1)+i];
      if(q!==W*D) continue;
      const mu=x0+(i+W/2)*P, mv=y0+(j+D/2)*P;
      const e=(mu-cu)*(mu-cu)+(mv-cv)*(mv-cv);      /* la posición más centrada en el suelo libre */
      if(!mejor||e<mejor.e) mejor={e:e, u:x0+i*P, v:y0+j*P};
    }
    if(!mejor) continue;
    const u0=mejor.u+HOL*P, v0=mejor.v+HOL*P;         /* centrado dentro del hueco */
    return { o:[ u0*c - v0*sn, u0*sn + v0*c ],
             ux:[c, sn], uv:[-sn, c], ang:th, L:(W-2*HOL)*P, A:(D-2*HOL)*P };
  }
  return null;
}

const CACHE_TZ = {};
function implantarTerraza(n){
  if(CACHE_TZ[n]!==undefined) return CACHE_TZ[n];
  let R=null;
  try{
    const L=DATA.lotes.find(x=>x.n===n);
    const D=datosTerraza(n), S=L?sueloLibre(n):null;
    if(L && D && S && S.cel.length){
      const g0=L.g.map(PX);
      let dx=0, dy=0;
      muestrearLote(g0,4).forEach(([x,y])=>{ const b=MDT.bajada(x,y); if(b){dx+=b[0];dy+=b[1];} });
      const mm=Math.hypot(dx,dy);
      const thPref = mm>1e-6 ? Math.atan2(dy,dx) : null;
      let modo="t1";
      let U = ubicarRect(S.cel, 3*D.t1.p, D.t1.a, thPref);
      if(!U){ U = ubicarRect(S.cel, D.t2.F, D.t2.a, thPref); modo = U ? "t2" : modo; }
      /* Y aún así se comprueba el rectángulo de verdad, no la rejilla: se
         recorre su perímetro cada 50 cm y ni un punto puede quedar fuera del
         lote, dentro de una faja de protección ni a menos de 3 m del lindero.
         Sin número no está verificado, y esto es el número. */
      if(U){
        const XYv=(u,v)=>[U.o[0]+U.ux[0]*u+U.uv[0]*v, U.o[1]+U.ux[1]*u+U.uv[1]*v];
        const anillo=g0.concat([g0[0]]);
        const PRv=DATA.prot.map(r=>r.map(PX));
        let malo=false;
        for(let u=0;u<=U.L+1e-6 && !malo;u+=0.5)
          for(let v=0;v<=U.A+1e-6 && !malo;v+=0.5){
            if(u>0.25 && u<U.L-0.25 && v>0.25 && v<U.A-0.25) continue;   /* sólo el borde */
            const q=XYv(u,v);
            if(!dentroAnillo(q[0],q[1],g0)) malo=true;
            else if(PRv.some(r=>dentroAnillo(q[0],q[1],r))) malo=true;
            else if(distPoli(q[0],q[1],anillo) < RETIRO_LAT-0.05) malo=true;
          }
        if(malo) U=null;
      }
      if(U){
        const XY=(u,v)=>[U.o[0]+U.ux[0]*u+U.uv[0]*v, U.o[1]+U.ux[1]*u+U.uv[1]*v];
        const nb = modo==="t1" ? 3 : 1;
        const pb = U.L/nb;
        const niveles=[]; let zmin=1e9, zmax=-1e9, ok=true;
        for(let k=0;k<nb;k++){
          let sz=0, nz=0;
          for(let u=k*pb; u<=(k+1)*pb+1e-6; u+=1.0)
            for(let v=0; v<=U.A+1e-6; v+=1.0){
              const q=XY(u,v), z=MDT.cotaDibujo(q[0],q[1]);
              if(!isNaN(z)){ sz+=z; nz++; if(z<zmin)zmin=z; if(z>zmax)zmax=z; }
            }
          if(!nz){ ok=false; break; }
          niveles.push({u0:k*pb, u1:(k+1)*pb, npt:sz/nz});
        }
        if(ok){
          /* cada bancal se queda donde está: su nivel de piso sale del terreno
             que tiene debajo, no de reordenar la lista */
          const nAlto = niveles.reduce((a,b)=>b.npt>a.npt?b:a, niveles[0]);
          const nBajo = niveles.reduce((a,b)=>b.npt<a.npt?b:a, niveles[0]);
          const alturaN = modo==="t1" ? TZ.alto : 2*TZ.alto;
          R={ o:U.o, ux:U.ux, uv:U.uv, L:U.L, A:U.A, ang:U.ang, modo:modo,
              niveles:niveles, alto:alturaN, nb:nb,
              z:nAlto.npt, zBaja:nBajo.npt,
              escalonReal:+((nAlto.npt-nBajo.npt)/Math.max(1,nb-1)).toFixed(2),
              d:+(zmax-zmin).toFixed(2),
              area:+(U.L*U.A).toFixed(0),
              areaCubierta:+(nb*pb*U.A).toFixed(0),
              corte:Math.round(modo==="t1"?D.t1.vol:D.t2.vol),
              escalon:+(D.t1.esc.toFixed(2)),
              libre:Math.round(S.m2),
              g:[XY(0,0),XY(U.L,0),XY(U.L,U.A),XY(0,U.A),XY(0,0)] };
        }
      }
    }
  }catch(e){ R=null; }
  CACHE_TZ[n]=R; return R;
}
window.__IMPLANTAR_TERRAZA = implantarTerraza;

function contenidoTour(n){
  const L=DATA.lotes.find(x=>x.n===n), A=IMPL[String(n)];
  if(!L||!A) return "";
  const S=sueloLibre(n);
  if(!S) return "";
  const K=A.k, ti=TIPOS_CASA[TAM_CASA];
  /* si la casa de este lote es la de bancales, su huella también ocupa suelo:
     descontarla aquí y no dentro de sueloLibre, que es de donde sale */
  const KT2 = K ? null : implantarTerraza(n);
  if(KT2){
    const antes=S.cel.length;
    S.cel = S.cel.filter(([x,y])=>!dentroAnillo(x,y,KT2.g));
    S.casa_m2 = (antes-S.cel.length)*PASO_TOUR*PASO_TOUR;
    S.m2 = S.cel.length*PASO_TOUR*PASO_TOUR;
  }
  const filas = COSAS.map(c=>{
    const ang = cabe(S.cel, c.w, c.d);
    const ok = ang!==null;
    return '<tr><td>'+tri(c.n)+'</td>'+
      '<td>'+dec(c.w,1)+' × '+dec(c.d,1)+' m</td>'+
      '<td style="font-size:11px;color:var(--muted)">'+tri(FUENTE_COSA[c.f])+'</td>'+
      '<td style="color:'+(ok?"var(--forest-deep)":"#A3543F")+';font-weight:700">'+
        (ok ? TT("cabe","fits","tient") : TT("no cabe","does not fit","ne tient pas"))+'</td></tr>';
  }).join("");

  return '<div class="avisoDato" style="border-color:#8A5F14">'+TT(
      'Módulo en construcción. Lo que ya responde, y responde con geometría, es qué cabe en '+
      'este lote además de la casa. Los recorridos con renders de la casa escogida entran '+
      'cuando el estudio de arquitectura entregue las imágenes.',
      'Module under construction. What it already answers, and answers with geometry, is what '+
      'fits on this lot besides the house.',
      'Module en construction. Ce qu\u2019il répond déjà, et avec de la géométrie, c\u2019est ce qui tient '+
      'sur ce lot en plus de la maison.')+'</div>'+
    '<p class="p">'+(K||KT2
      ? TT('Con la casa '+(KT2? 'en '+KT2.nb+' bancales' : 'de '+ti.et)+' puesta —ocupa '+ent(S.casa_m2)+' m² con su patio— y descontando '+
           'los 3 m de aislamiento a cada vecino, los 10 m de antejardín sobre la vía y las fajas de '+
           'protección, quedan <b>'+ent(S.m2)+' m² libres</b> donde se puede construir algo más.',
           'With the '+ti.et+' house in place ('+ent(S.casa_m2)+' m² including its yard) and after the '+
           '3 m side setbacks, the 10 m front yard and the protection strips, <b>'+ent(S.m2)+' m² are '+
           'left free</b>.',
           'Avec la maison de '+ti.et+' posée, il reste <b>'+ent(S.m2)+' m² libres</b>.')
      : TT('En este lote la casa tipo no cabe, así que lo que sigue es sobre el lote entero: '+
           'descontando los 3 m de aislamiento a cada vecino, los 10 m de antejardín sobre la vía y '+
           'las fajas de protección, quedan <b>'+ent(S.m2)+' m² de suelo libre</b>. Para la vivienda, '+
           'mire los dos modelos en terraza de más arriba.',
           'The standard house does not fit on this lot, so what follows covers the whole lot: '+
           '<b>'+ent(S.m2)+' m² of free ground</b> remain after setbacks and protection strips.',
           'La maison type ne tient pas sur ce lot : il reste <b>'+ent(S.m2)+' m² de sol libre</b>.'))+'</p>'+
    (isNaN(S.pend) ? '' :
      '<p class="p">'+TT(
        'Ese suelo libre tiene una pendiente media del <b>'+dec(S.pend,1)+' %</b> y llega al '+
        dec(S.pendMax,0)+' % en su punto más parado.'+
        (S.pend>15 ? ' Es decir: cabe, pero no está plano. Cualquier cosa con piso horizontal '+
                     '—una cancha, una piscina, un deck— hay que bancarla.' : ''),
        'That free ground has a mean slope of <b>'+dec(S.pend,1)+'%</b> and reaches '+
        dec(S.pendMax,0)+'% at its steepest.'+
        (S.pend>15 ? ' It fits, but it is not level: anything with a horizontal floor needs a bench.' : ''),
        'Ce sol libre a une pente moyenne de <b>'+dec(S.pend,1)+' %</b> et atteint '+
        dec(S.pendMax,0)+' %.')+'</p>')+
    '<table class="tbl"><thead><tr><th>'+T("Qué")+'</th><th>'+T("Medida")+'</th>'+
      '<th>'+T("De dónde sale")+'</th><th>'+T("En este lote")+'</th></tr></thead>'+
      '<tbody>'+filas+'</tbody></table>'+
    '<p class="p pie">'+TT(
      'Cada cosa se probó girándola en ocho orientaciones sobre el suelo libre, rasterizado a 1 m. '+
      '"Cabe" quiere decir que el rectángulo entra entero dentro de ese suelo libre, no que el '+
      'terreno esté plano ahí: para eso están el mapa de pendientes y el corte de más arriba. '+
      'Las canchas llevan la medida de reglamento; el deck, el kiosco, la piscina, el jacuzzi y la '+
      'huerta llevan una medida corriente, que se puede cambiar.',
      'Each item was tested at eight orientations over the free ground, rasterised at 1 m. "Fits" '+
      'means the rectangle sits entirely inside the buildable ground, not that the ground is level '+
      'there — the slope map and the section above answer that.',
      'Chaque élément a été testé selon huit orientations sur le sol libre, tramé à 1 m.')+'</p>';
}

/* El relieve 3D necesita las cifras de los modelos en terraza para levantar
   los volúmenes sobre el lote. Se exponen aquí, donde ya están calculadas, en
   vez de repetir la cuenta en el motor. */
window.__DATOS_TERRAZA = datosTerraza;
window.__ES_TERRAZA    = esTerraza;

/* ---------------------------------------------------------------------------
   EL ANCHO CON EL QUE SE DIBUJAN LOS ESQUEMAS
   Todos los dibujos del informe se generaban con un viewBox de 760 unidades de
   ancho. En un celular la caja mide 272 px: el SVG se encoge a 0,36 y un rótulo
   de 9,5 unidades acaba midiendo 3,4 px en pantalla. Ilegible. MEDIDO en los
   seis esquemas del informe a 360 px.
   La solución no es agrandar el SVG sino DIBUJARLO al ancho que de verdad hay:
   si el viewBox mide lo mismo que la caja, una unidad es un píxel y el rótulo
   de 9,5 se ve a 9,5 px. En pantalla ancha nada cambia.
   --------------------------------------------------------------------------- */
function anchoDib(){
  let w = 0;
  try{ const c = document.querySelector(".anlB"); if(c) w = c.clientWidth - 42; }catch(e){}
  if(!w) w = Math.min(760, (window.innerWidth||760) - 88);
  return Math.max(300, Math.min(760, Math.round(w)));
}
/* alto proporcional: se conserva la proporción que tenía cada esquema a 760 */
const altoDib = (w, h0) => Math.round(h0 * Math.max(0.62, Math.min(1, w/760)));

function analisis(n){
  const L=DATA.lotes.find(x=>x.n===n); if(!L)return;
  const A=IMPL[String(n)]; if(!A)return;
  const casa=A.k, ej=casa?ejeLargo(casa.g):null;
  const AW = anchoDib();                       /* ancho real de los esquemas */
  /* Donde no cabe una casa de una sola plataforma, no es que no se pueda
     construir: la casa va en bancales. Se implanta y se informa igual. */
  const KT = casa ? null : implantarTerraza(n);
  /* Cómo hay que llamar al volumen que de verdad se dibuja en este lote: en 21
     y 49 no cabe ninguno de los tres tipos y lo que se levanta es la envolvente
     máxima posible; rotularlo "tipo de 316 m²" sería falso. */
  const VOLN = (A.env==="min")
    ? TT('volumen máximo que cabe en este lote',
         'largest volume that fits on this lot',
         'volume maximal qui tient sur ce lot')
    : TT('volumen del tipo de '+TIPOS_CASA[TAM_CASA].et,
         'volume of the '+TIPOS_CASA[TAM_CASA].et+' type',
         'volume du type de '+TIPOS_CASA[TAM_CASA].et);
  const ver=ej?veredicto(ej.rumbo):null;
  const fachadas=ej?[(ej.rumbo+90)%360,(ej.rumbo+270)%360].map(rumboTxt):null;

  const barras=CLASES.map((c,i)=>{
    const p=A.r[i]?A.r[i][0]:0, m=A.r[i]?A.r[i][1]:0;
    return '<div style="display:flex;align-items:center;gap:9px;margin-bottom:6px">'+
      '<span style="width:74px;font-size:12px;font-weight:600">'+TP(c[0])+'</span>'+
      '<span style="width:74px;font-size:11px;color:var(--muted)">'+T(c[1])+'</span>'+
      '<span style="flex:1;height:9px;background:var(--line-soft);border-radius:5px;overflow:hidden">'+
        '<i style="display:block;height:100%;width:'+p.toFixed(1)+'%;background:'+c[2]+'"></i></span>'+
      '<span style="width:112px;text-align:right;font-size:12px;white-space:nowrap;font-variant-numeric:tabular-nums">'+
        dec(p,1)+' % · '+ent(m)+' m²</span></div>';
  }).join("");
  /* La franja declarada va DEBAJO de las medidas y con otra pinta: barra rayada,
     sin porcentaje —su base es otra— y con la palabra "declarado" al lado. Meterla
     entre las barras de arriba sería dar por medido lo que no se midió. */
  const m2Decl = (A.cob!=null && A.cob<0.98) ? Math.max(0, L.at-(A.am2||0)) : 0;
  const barraDecl = m2Decl ? (
    '<div style="margin-top:9px;padding-top:9px;border-top:1px dashed var(--line)">'+
    '<div style="display:flex;align-items:center;gap:9px">'+
      '<span style="width:74px;font-size:12px;font-weight:600">'+T("Sin levantar")+'</span>'+
      '<span style="width:74px;font-size:11px;color:var(--muted)">'+
        TT("15 – 25 % decl.","15–25% decl.","15 – 25 % décl.")+'</span>'+
      '<span style="flex:1;height:9px;border-radius:5px;background:'+
        'repeating-linear-gradient(45deg,'+SIN_LEV[2]+' 0 3px,'+DECL_TRAMA+' 3px 6px)"></span>'+
      '<span style="width:112px;text-align:right;font-size:12px;white-space:nowrap;'+
        'font-variant-numeric:tabular-nums">'+ent(m2Decl)+' m²</span></div>'+
    '<p class="p pie" style="margin:6px 0 0">'+TT(
      'Declarada en campo por la gerencia técnica, sin levantamiento topográfico. '+
      'No entra en los porcentajes de arriba.',
      'Declared on site by technical management, with no topographic survey. '+
      'Not included in the percentages above.',
      'Déclarée sur le terrain par la direction technique, sans levé topographique. '+
      'Non incluse dans les pourcentages ci-dessus.')+'</p></div>') : "";
  const plano=(A.r[0]?A.r[0][0]:0)+(A.r[1]?A.r[1][0]:0);

  const solTabla=HITOS.map(h=>
    '<tr><td>'+T(h.t)+'</td><td>'+hhmm(h.salida.h)+' · '+h.salida.az.toFixed(0)+'°</td>'+
    '<td>'+h.mediodia.alt.toFixed(0)+'° '+TT("hacia el ","to the ")+rumboTxt(h.mediodia.az)+'</td>'+
    '<td>'+hhmm(h.puesta.h)+' · '+h.puesta.az.toFixed(0)+'°</td></tr>').join("");
  return '<div class="anl">'+
  '<div class="anlH"><img class="anlLogo" src="medios/logo_claro.png" alt="Laureles Campestre">'+
    '<div><div class="sub">'+T("Análisis del lote")+'</div><h2>'+n+'</h2></div>'+
    '<button class="close" aria-label="'+T("Cerrar")+'">×</button></div>'+
  '<div class="anlB">'+

  /* El aviso va antes que el primer dibujo. Puesto debajo se leía cuando el
     cliente ya había visto un plano y un 3D que parecen medidos de punta a punta. */
  avisoLevantamiento(n)+

  /* con qué empieza el informe: dónde está el lote dentro del proyecto */
  '<h3>'+T("Dónde está el lote")+'</h3>'+
  '<div class="ubiBox">'+planoUbicacion(n,AW,altoDib(AW,300))+'</div>'+
  '<p class="p pie">'+TT(
     'Todo el proyecto en gris; en dorado, el lote '+n+'. Área total '+fmtA(L.at)+
     (L.pr?', de los cuales '+fmtA(L.pr)+' son faja de protección':', sin faja de protección')+'.',
     'The whole subdivision in grey; in gold, lot '+n+'. Total area '+fmtA(L.at)+
     (L.pr?', of which '+fmtA(L.pr)+' is protection strip':', with no protection strip')+'.',
     'Tout le lotissement en gris ; en doré, le lot '+n+'. Surface totale '+fmtA(L.at)+
     (L.pr?', dont '+fmtA(L.pr)+' de bande de protection':', sans bande de protection')+'.')+'</p>'+

  /* ------------------------------------------------------------------
     SIMULADOR DE DISEÑO DE LA VIVIENDA.
     El cliente ve su lote de verdad con el volumen encima —el mismo esquema
     que sale en el 3D del mapa— y arrastrando la cortina lo cambia por el
     render de la casa terminada. No es un fotomontaje sobre este lote: es el
     render del tipo, y así va dicho debajo. Lo que sí es de este lote es el
     volumen: sale de la implantación medida sobre su terreno.
     ------------------------------------------------------------------ */
  '<h3>'+TT("La casa de referencia",
            "The reference house",
            "La maison de référence")+'</h3>'+
  /* AVISO: el modelo es ilustrativo; el diseño definitivo aún no se ha entregado */
  '<div class="avisoModelo" role="note"><b>'+TT("Aviso informativo","Notice","Avis")+'</b> · '+
    TT("Este modelo es solo informativo. El diseño definitivo se encuentra en proceso de entrega al proyecto.",
       "This model is for information only. The final design is in the process of being delivered to the project.",
       "Ce modèle est purement informatif. La conception définitive est en cours de livraison au projet.")+'</div>'+
  /* LA CASA DE REFERENCIA (septiembre de 2026): concreto a la vista, piedra,
     acero y vidrio, 316 m². Es una imagen ilustrativa de la casa tipo, no un
     fotomontaje sobre este lote. Antes aquí había una cortina contra la
     maqueta de la Casa 30JB con la misma cámara; esta imagen es una vista
     frontal y no calza con esa maqueta, así que va sola, completa. */
  '<figure class="casaRef">'+
    '<img src="'+RENDER_CASA()+'" alt="'+TT("Casa de referencia de Laureles Campestre","Laureles Campestre reference house","Maison de référence de Laureles Campestre")+'" loading="lazy">'+
    '<div class="etq etqRef">'+TT("Casa de referencia · 316 m²","Reference house · 316 m²","Maison de référence · 316 m²")+'</div>'+
    '<div class="etq etqInfo">'+TT("Imagen ilustrativa","Illustrative image","Image illustrative")+'</div>'+
  '</figure>'+
  '<p class="p pie">'+TT(
     'La casa de referencia del proyecto: <b>316 m²</b> en dos volúmenes, con concreto a la vista, muros de '+
     'piedra, perfilería negra, grandes ventanales hacia el jardín y parqueadero en gravilla. Es la imagen del '+
     'lenguaje arquitectónico de Laureles, no un fotomontaje sobre este lote. Dónde cabe una casa en ESTE lote '+
     '—cómo queda orientada y cuánta tierra se mueve— está más abajo, en «Cómo es el terreno» y «Dónde cabe la casa».',
     'The project\u2019s reference house: <b>316 m²</b> in two volumes, exposed concrete, stone walls, black steel, '+
     'large windows to the garden and gravel parking. It illustrates the architectural language of Laureles; it is '+
     'not a photomontage of this lot. Where a house fits on THIS lot is shown further down.',
     'La maison de référence du projet : <b>316 m²</b> en deux volumes, béton brut, murs en pierre, acier noir, '+
     'grandes baies sur le jardin et parking en gravier. Elle illustre le langage architectural de Laureles ; ce '+
     'n\u2019est pas un photomontage sur ce lot. L\u2019implantation sur CE lot est plus bas.')+'</p>'+

  '<h3>'+T("Cómo es el terreno")+'</h3>'+

  /* el mismo lote pintado por rango de pendiente: dónde está lo plano */
  '<div class="ubiBox">'+mapaPendientes(n,AW,altoDib(AW,330))+'</div>'+
  leyendaPendientes(n)+

  /* el mismo lote, en volumen: los colores de pendiente sobre el terreno real
     y la casa implantada encima. Es lo que le hace entender al cliente de un
     vistazo lo que las barras dicen en frío. */
  '<div class="ubiBox">'+bloque3D(n,AW,altoDib(AW,380))+'</div>'+
  '<p class="p pie">'+TT(
     'El mismo lote en volumen, con los colores de pendiente sobre el terreno y la casa parada '+
     'sobre su plataforma. El relieve va exagerado —el factor sale al pie del dibujo— para que la '+
     'ladera se lea; las caras laterales son el corte de tierra, no un muro.',
     'The same lot in volume, with the slope colours on the ground and the house standing on its '+
     'platform. Relief is exaggerated — the factor is printed under the drawing — so the slope '+
     'reads; the side faces are the earth cut, not a wall.',
     'Le même lot en volume, avec les couleurs de pente sur le terrain et la maison posée sur sa '+
     'plateforme. Le relief est exagéré — le facteur est indiqué sous le dessin — pour que la pente '+
     'se lise ; les faces latérales sont la coupe de terre, pas un mur.')+'</p>'+
  '<p class="p pie">'+TT(
     'Cada celda son 2 m del modelo del terreno, pintada con el color de su rango de pendiente. '+
     'La línea dorada punteada es el suelo tras aislamientos y el contorno blanco, la casa. '+
     'Lo que sale <b>rayado</b> —en la planta y en el volumen— es la franja sin curvas de nivel: '+
     'va del color del "muy pendiente" porque así la declara en campo la gerencia técnica, pero la '+
     'raya está para recordar que ahí no hay topografía. El volumen la dibuja a nivel por falta '+
     'de cotas, no porque sea plana: la pendiente que vale en esa franja es la declarada, no la '+
     'silueta del bloque.',
     'Each cell is 2 m of the terrain model, coloured by its slope range. The dashed gold line is '+
     'the buildable area and the white outline, the house. What shows <b>hatched grey</b> — in plan '+
     'and in volume — is the strip with no contours: it carries the steep-range colour because that '+
     'is how technical management declares it on site, while the hatch is there to remind you no '+
     'survey covers it. The volume draws it level for lack of elevations, not because it is level: '+
     'the slope that counts there is the declared one, not the silhouette of the block.',
     'Chaque cellule fait 2 m du modèle de terrain, coloriée selon sa tranche de pente. La ligne '+
     'dorée en pointillés est la surface constructible et le contour blanc, la maison. Ce qui '+
     'apparaît <b>hachuré</b> est la bande sans courbes de niveau : elle prend la couleur de la forte '+
     'pente, telle que la direction technique la déclare sur le terrain, et la hachure rappelle qu\u0027aucun '+
     'levé ne la couvre. Le volume la dessine à plat faute de cotes, non parce qu\u0027elle l\u0027est.')+'</p>'+
  /* Los porcentajes salen de la parte del lote que SÍ tiene curvas. Decir "de los
     4.867 m² del lote, el 65 % es plano" cuando sólo se midieron 1.840 m² es
     contar un pedazo como si fuera el todo, y justo en estos lotes la parte sin
     medir es la de atrás, que es la que cae. Se nombra el área medida. */
  '<p class="p">'+(A.cob!=null && A.cob<0.98
    ? TT('De los <b>'+fmtA(A.am2||0)+' levantados</b> de este lote (de '+fmtA(L.at)+' totales), <b>'+
         plano.toFixed(0)+' % es terreno plano o de pendiente suave</b>. Así se reparte esa parte:',
         'Of the <b>'+fmtA(A.am2||0)+' surveyed</b> in this lot (out of '+fmtA(L.at)+' in total), <b>'+
         plano.toFixed(0)+'% is flat or gently sloping ground</b>. This is how that part breaks down:',
         'Sur les <b>'+fmtA(A.am2||0)+' levés</b> de ce lot (sur '+fmtA(L.at)+' au total), <b>'+
         plano.toFixed(0)+' % sont plats ou en pente douce</b>. Voici la répartition de cette partie :')
    : TT('De los '+fmtA(L.at)+' del lote, <b>'+plano.toFixed(0)+' % es terreno plano o de pendiente suave</b>'+
      (plano<35?', que es poco: hay que contar con banqueo':'')+'. Así se reparte:',
    'Of the lot\'s '+fmtA(L.at)+', <b>'+plano.toFixed(0)+'% is flat or gently sloping ground</b>'+
      (plano<35?', which is not much: expect to cut a platform':'')+'. This is how it breaks down:',
    'Sur les '+fmtA(L.at)+' du lot, <b>'+plano.toFixed(0)+' % sont plats ou en pente douce</b>'+
      (plano<35?', ce qui est peu : il faudra prévoir une plateforme':'')+'. Voici la répartition :'))+'</p>'+
  '<div style="margin:12px 0 4px">'+barras+barraDecl+'</div>'+
  '<p class="p pie">'+(TT('Pendientes medidas sobre el modelo digital del terreno construido con las curvas cada 1 m '+
      'del levantamiento. Un 10 % son 10 cm de desnivel por cada metro recorrido.',
    'Slopes measured on the digital terrain model built from the 1 m contours of the survey. '+
      '10% means 10 cm of fall for every metre you walk.'))+
    (A.cob!=null && A.cob<0.98
      ? ' '+TT('Los '+fmtA(L.at-(A.am2||0))+' restantes no tienen curvas: van aparte, con la pendiente '+
               'fuerte declarada en campo.',
               'The remaining '+fmtA(L.at-(A.am2||0))+' have no contours: they are listed separately, with '+
               'the steep slope declared on site.',
               'Les '+fmtA(L.at-(A.am2||0))+' restants n\'ont pas de courbes : ils figurent à part, avec la '+
               'forte pente déclarée sur le terrain.')
      : '')+'</p>'+

  '<h3>'+T("Dónde cabe la casa")+'</h3>'+
  /* el cliente escoge el tamaño y ve cómo cambia el volumen sobre SU lote */
  ((A.ks && Object.keys(A.ks).length>1)
    ? '<div class="tamCasa"><span class="et">'+T("Tipo de casa")+'</span>'+
      '<div class="seg" id="segTam">'+
      TAMANOS.slice().reverse().map(t=>
        '<button data-t="'+t+'"'+(A.ks[t]?'':' disabled title="'+
          T("No cabe en este lote")+'"')+
        (t===TAM_CASA?' class="on"':'')+'>'+TIPOS_CASA[t].et+'</button>').join("")+
      '</div>'+
      (A.ks[TAM_CASA] ? '' : '<span class="ojo">'+
        T("El tipo escogido no cabe aquí; se muestra el mayor que sí.")+'</span>')+
      '</div>'+
      '<p class="p pie">'+TT(
        'Los tres tipos del proyecto, con el área construida rotulada en su plano y '+
        ent(PARQ_TIPO)+' m² de parqueadero aparte en todos. En 3D se simulan con '+
        dec(ALTO_TIPO,2)+' m de altura. Lo que se dibuja aquí es la ENVOLVENTE con la que se '+
        'corrió la implantación —'+TIPOS_CASA[TAM_CASA].env+' m²— que es la que da el corte y el '+
        'lleno contra el terreno medido; el tipo tiene '+dec(TIPOS_CASA[TAM_CASA].area,1)+' m². '+
        'Cuando llegue el DXF de cada casa, la huella se reemplaza por la planta exacta.',
        'The three house types of the project, with the built area labelled on their own drawing and '+
        ent(PARQ_TIPO)+' m² of parking on top in every one. In 3D they are simulated '+
        dec(ALTO_TIPO,2)+' m tall. What is drawn here is the ENVELOPE the siting was run with — '+
        TIPOS_CASA[TAM_CASA].env+' m² — which is what yields the cut and fill against the measured '+
        'ground; the type itself is '+dec(TIPOS_CASA[TAM_CASA].area,1)+' m².',
        'Les trois types du projet, avec la surface bâtie indiquée sur leur propre plan et '+
        ent(PARQ_TIPO)+' m² de stationnement en plus. Ce qui est dessiné ici est l\u2019ENVELOPPE '+
        'de '+TIPOS_CASA[TAM_CASA].env+' m² ; le type fait '+dec(TIPOS_CASA[TAM_CASA].area,1)+' m².')+'</p>'
    : '')+
  (A.cm2>0
    ? '<p class="p">'+(TT('Descontando <b>3 m de aislamiento</b> a cada vecino, <b>10 m de antejardín</b> sobre la vía y '+
          'las fajas de protección, queda un suelo de <b>'+ent(A.cm2)+' m²</b> donde puede pararse la casa. '+
          'Eso es dónde, no cuánto: lo que se puede construir son <b>'+ent(OCUP30(L))+' m²</b>, el 30 % del área útil.',
    'After taking out <b>3 m of setback</b> to each neighbour, <b>10 m of front yard</b> along the road and '+
          'the protection strips, <b>'+ent(A.cm2)+' m²</b> of ground remain where the house may sit. That is '+
          'where, not how much: the buildable area is <b>'+ent(OCUP30(L))+' m²</b>, 30% of the usable area.',
    'En retirant <b>3 m de retrait</b> de chaque côté, <b>10 m de marge avant</b> sur la voie et les bandes '+
          'de protection, il reste un sol de <b>'+ent(A.cm2)+' m²</b> où la maison peut se poser. La surface '+
          'constructible, elle, est de <b>'+ent(OCUP30(L))+' m²</b>, 30 % de la surface utile.'))+'</p>'+
      /* Ese metraje es geometría —retiros y fajas—, no topografía: vale igual
         sobre la zona sin levantar. Pero dónde se puede parar la casa dentro
         de él sí depende de la pendiente, y esa no está medida en todo el lote. */
      ((A.cob!=null && A.cob<0.98)
        ? '<p class="p pie">'+TT(
            'Ese metraje es geométrico —sale de descontar retiros y fajas— y vale igual sobre la '+
            'zona sin levantar. Dónde se puede parar de verdad la casa dentro de él depende de la '+
            'pendiente, y la pendiente sólo está medida en el '+Math.round(A.cob*100)+' % del lote.',
            'That figure is geometric — setbacks and strips discounted — and holds over the '+
            'unsurveyed zone too. Where the house can actually stand inside it depends on slope, '+
            'and slope is only measured over '+Math.round(A.cob*100)+'% of the lot.',
            'Ce métrage est géométrique — retraits et bandes déduits — et vaut aussi sur la zone '+
            'non levée. Où la maison peut réellement se poser dépend de la pente, mesurée '+
            'seulement sur '+Math.round(A.cob*100)+' % du lot.')+'</p>'
        : '')
    : '<p class="p">'+(KT
        ? TT('Descontando las fajas de protección, los 3 m de aislamiento a cada vecino y los 10 m de '+
             'antejardín sobre la vía, a este lote le quedan <b>'+ent(KT.libre)+' m² de suelo libre</b>. '+
             'No forman un rectángulo donde quepa una casa de una sola plataforma —por eso el informe decía '+
             'antes que no cabía—, pero sí donde cabe una casa en bancales, y ahí es donde va.',
             'After the protection strips, the 3 m side setbacks and the 10 m front yard, this lot has '+
             '<b>'+ent(KT.libre)+' m² of free ground</b>: not a rectangle for a single-platform house, but '+
             'enough for a terraced one.',
             'Ce lot dispose de <b>'+ent(KT.libre)+' m² de sol libre</b> : de quoi poser une maison en terrasses.')
        : TT('Con los aislamientos y la protección, este lote no deja un área construible continua.',
             'With the setbacks and the protection strips, this lot leaves no continuous buildable area.'))+'</p>')+
  (casa
    ? '<table class="t2">'+
      '<tr><td>'+T("Modelo")+'</td><td>'+
        (A.env==="min"
          ? '<b>'+(TT("ninguno de los tres tipos cabe","none of the three types fits","aucun des trois types ne tient"))+'</b> · '+
            (TT("volumen máximo posible","largest volume that fits","volume maximal possible"))
          : (TT("Tipo de ","Type ","Type de "))+TIPOS_CASA[TAM_CASA].et)+' · '+
        (casa.mod==="2p" ? T("dos niveles (uno semienterrado)") : T("un solo piso"))+'</td></tr>'+
      '<tr><td>'+(TT("Envolvente implantada","Implanted envelope","Enveloppe implantée"))+'</td><td>'+
        (A.env==="min"
          ? '<b>'+ent(casa.ac||casa.an)+' m²</b> · '+
            (TT("la de "+TIPOS_CASA[TAM_CASA].env+" m² no cabe entre linderos",
                "the "+TIPOS_CASA[TAM_CASA].env+" m² one does not fit between the boundaries"))
          : TIPOS_CASA[TAM_CASA].env+' m²'+
            (A.env && A.env!==TIPOS_CASA[TAM_CASA].env
              ? ' · <b>'+(TT("en este lote sólo cupo la de ","on this lot only the "))+A.env+' m²</b>'
              : ''))+'</td></tr>'+
      (casaIA(n)
        ? '<tr><td><b>'+TT("Casa propuesta con IA","AI-proposed house","Maison proposée")+'</b></td><td><b>'+ent(casaIA(n).construida)+' m²</b> '+
          TT("construidos","built","bâtis")+' · '+(casaIA(n).pisos===2?TT("dos pisos","two storeys","deux niveaux"):TT("un piso","one storey","un niveau"))+
          (casaIA(n).piscina?' · '+TT("piscina","pool","piscine")+' '+ent(casaIA(n).piscina)+' m²':'')+
          (casaIA(n).construida>OCUP30(L)?' · <b style="color:#A3341C">'+TT("excede el 30 %","exceeds the 30 %","dépasse les 30 %")+'</b>':'')+'</td></tr>'
        : '')+
      '<tr><td>'+T("Área construida")+'</td><td>'+ent(casa.ac||casa.an)+' m²</td></tr>'+
      (casa.pat?'<tr><td>'+T("Patio interior")+'</td><td>'+ent(casa.pat)+' m²</td></tr>':'')+
      '<tr><td>'+T("Huella en el lote")+'</td><td>'+dec(casa.L,1)+' × '+dec(casa.A,1)+' m</td></tr>'+
      '<tr><td>'+T("Nivel de acceso")+'</td><td>'+dec(casa.z,2)+SNM()+'</td></tr>'+
      (casa.mod==="2p"
        ? '<tr><td>'+T("Nivel −1 (semienterrado)")+'</td><td>'+dec(casa.zm,2)+SNM()+'</td></tr>'
        : '')+
      '<tr><td>'+T("Altura sobre el acceso")+'</td><td>'+dec(ALTURA_MAX,2)+
        (TT(' m — altura del tipo',' m — height of the type',' m — hauteur du type'))+'</td></tr>'+
      '<tr><td>'+T("Desnivel bajo la casa")+'</td><td>'+dec(casa.d,2)+' m</td></tr>'+
      '<tr><td>'+(casa.mod==="2p"?T("Excavación del nivel −1"):T("Movimiento de tierra"))+'</td><td>'+
        casa.co+' m³'+(casa.ll
          ? (TT(' de corte · ',' cut · ')+casa.ll+TT(' m³ de lleno',' m³ fill'))
          : (TT(' de corte',' of cut')))+'</td></tr>'+
      '<tr><td>'+T("Eje largo")+'</td><td>'+ej.rumbo.toFixed(0)+'° — '+
        (TT('fachadas largas al ','long facades to the '))+fachadas[0]+(TT(' y al ',' and '))+fachadas[1]+'</td></tr>'+
      '</table>'+
      (casaIA(n) && (casaIA(n).espacios||[]).length
        ? '<h4 style="margin:18px 0 6px">'+TT("Planta esquemática de la casa propuesta","Schematic plan of the proposed house","Plan schématique de la maison proposée")+
          ' · '+TT("planta baja","ground floor","rez-de-chaussée")+'</h4>'+plantaEsquematicaSVG(n,1,860,560)+
          ((casaIA(n).espacios||[]).some(e=>e.nivel===2)
            ? '<h4 style="margin:14px 0 6px">'+TT("Piso alto","Upper floor","Étage")+'</h4>'+plantaEsquematicaSVG(n,2,860,560) : '')+
          '<p class="p" style="margin-top:8px">'+TT("Muros, puertas y ventanas los pone el motor con reglas fijas (ventanales al fondo, que es la vista); la IA sólo repartió los espacios. Anteproyecto esquemático, no diseño ni licencia.",
             "Walls, doors and windows are placed by the engine with fixed rules (large windows to the back, the view); the AI only laid out the rooms. Schematic, not a design nor a permit.")+'</p>'
        : '')+
      (casaIA(n) && casaIA(n).render_url
        ? '<h4 style="margin:18px 0 6px">'+TT("Así se vería","How it would look","À quoi elle ressemblerait")+'</h4>'+
          '<img src="'+String(casaIA(n).render_url).replace(/"/g,"")+'" alt="" style="display:block;width:100%;border-radius:9px">'+
          '<p class="p" style="margin-top:6px;font-size:12px">'+TT("Imagen ilustrativa generada con IA a partir del volumen implantado; no es diseño aprobado.",
             "Illustrative AI image generated from the placed volume; not an approved design.")+'</p>'
        : '')+
      (casa.mod==="2p"
        ? '<p class="p" style="margin-top:12px">'+(TT('<b>Este lote arranca en pendiente: no tiene plataforma natural.</b> Por eso el modelo lo resuelve '+
              'en dos niveles y no en uno. El piso de acceso se apoya en la parte alta del terreno y por debajo va '+
              'un nivel −1 enterrado contra la ladera, que baja '+ENTRE_NIVELES.toFixed(0)+' m. Desde la vía se '+
              'sigue viendo <b>un solo piso de '+ALTURA_MAX.toFixed(0)+' m</b>, que es lo que permite la '+
              'parcelación; el segundo nivel sólo aparece en la fachada de abajo. Los '+casa.co+' m³ no son '+
              'botadero: son la excavación que se vuelve área habitable.',
    '<b>This lot starts on a slope: it has no natural platform.</b> That is why the model resolves it '+
              'on two levels instead of one. The entry floor sits on the high side of the ground and a level −1 '+
              'goes underneath, buried against the slope, '+ENTRE_NIVELES.toFixed(0)+' m lower. From the road you '+
              'still see <b>a single '+ALTURA_MAX.toFixed(0)+' m storey</b>, which is what the subdivision allows; '+
              'the second level only shows on the downhill facade. The '+casa.co+' m³ are not spoil: they are the '+
              'excavation that turns into habitable floor area.',
    '<b>Ce lot démarre en pente : il n\'a pas de plateforme naturelle.</b> Le modèle le résout donc sur deux '+
              'niveaux et non sur un. Le niveau d\'accès s\'appuie sur la partie haute du terrain et, en dessous, '+
              'un niveau −1 s\'enterre contre le coteau, '+ENTRE_NIVELES.toFixed(0)+' m plus bas. Depuis la voie '+
              'on continue de voir <b>un seul niveau de '+ALTURA_MAX.toFixed(0)+' m</b>, ce que le lotissement '+
              'autorise ; le second niveau n\'apparaît que sur la façade aval. Les '+casa.co+' m³ ne partent pas '+
              'en décharge : c\'est l\'excavation qui devient de la surface habitable.'))+'</p>'
        : '<p class="p" style="margin-top:12px">'+(TT('El terreno bajo la casa está lo bastante parejo para resolverla en <b>un solo piso de '+
              ALTURA_MAX.toFixed(0)+' m</b>, con un banqueo menor.',
    'The ground under the house is even enough to resolve it on <b>a single '+ALTURA_MAX.toFixed(0)+
              ' m storey</b>, with minor earthworks.',
    'Le terrain sous la maison est assez régulier pour la résoudre sur <b>un seul niveau de '+
              ALTURA_MAX.toFixed(0)+' m</b>, avec un terrassement léger.'))+'</p>')+
      (casa.L<22.3
        ? '<p class="p" style="margin-top:10px">'+(TT('La casa tuvo que bajar un escalón de tamaño: entre linderos quedan '+dec(casa.w,1)+
              ' m libres una vez descontados los 3 m de aislamiento, así que la versión completa de 22,4 m de '+
              'frente no cabe. El volumen conserva la proporción del tipo en <b>'+dec(casa.L,1)+' × '+dec(casa.A,1)+
              ' m</b>, con <b>'+ent(casa.ac||casa.an)+' m² construidos</b> en vez de 302.',
    'The house had to drop one size step: between the side boundaries there are only '+dec(casa.w,1)+
              ' m clear once the 3 m setbacks are taken out, so the full 22.4 m frontage does not fit. The model '+
              'keeps the type proportions at <b>'+dec(casa.L,1)+' × '+dec(casa.A,1)+' m</b>, with <b>'+
              ent(casa.ac||casa.an)+' m² built</b> instead of 302.',
    'La maison a dû descendre d\'un cran : entre les limites latérales il ne reste que '+dec(casa.w,1)+
              ' m libres une fois les 3 m de retrait déduits, la version complète de 22,4 m de façade ne tient '+
              'donc pas. Le volume garde les proportions du type en <b>'+dec(casa.L,1)+' × '+dec(casa.A,1)+
              ' m</b>, avec <b>'+ent(casa.ac||casa.an)+' m² construits</b> au lieu de 302.'))+'</p>'
        : '')+
      '<p class="p pie">'+(TT('El dibujo es el <b>'+VOLN+'</b> '+
          (A.env==="min" ? '—'+ent(casa.ac||casa.an)+' m² construidos, '+dec(ALTO_TIPO,2)+' m de altura— '
                         : '—'+ent(TIPOS_CASA[TAM_CASA].area)+' m² construidos más '+dec(PARQ_TIPO,1)+' m² de parqueadero, '+
                           dec(ALTO_TIPO,2)+' m de altura— ')+'puesto sobre el terreno medido de este lote. Va alineada con los '+
          'linderos laterales, así los 3 m de aislamiento quedan parejos en todo el largo, centrada entre ellos '+
          'y lo más adelante que permite el antejardín. El movimiento de tierra que sale arriba es el de la '+
          'envolvente de '+TIPOS_CASA[TAM_CASA].env+' m² con la que se corrió la implantación contra el terreno '+
          'medido. Es un volumen para entender escala y tierra movida, no el plano de la casa.',
    'The volume is the envelope of the <b>'+TIPOS_CASA[TAM_CASA].et+' type</b> —'+ent(TIPOS_CASA[TAM_CASA].area)+
          ' m² built plus '+dec(PARQ_TIPO,1)+' m² of parking, '+dec(ALTO_TIPO,2)+' m tall— placed on this lot\'s '+
          'measured ground, aligned with the side boundaries and centred between them. The earthworks quoted above '+
          'are those of the '+TIPOS_CASA[TAM_CASA].env+' m² envelope run against the measured ground.',
    'Le volume est l\'enveloppe du <b>type de '+TIPOS_CASA[TAM_CASA].et+'</b> posée sur le terrain mesuré de ce lot.'))+'</p>'
    : (KT
      ? '<table class="t2">'+
        '<tr><td>'+T("Modelo")+'</td><td><b>'+(TT("casa en "+KT.nb+" bancales","house on "+KT.nb+" terraces",
            "maison sur "+KT.nb+" terrasses"))+'</b></td></tr>'+
        '<tr><td>'+(TT("Área construida","Built area","Surface construite"))+'</td><td>'+ent(KT.areaCubierta)+' m²'+
            (KT.nb>1?' ('+KT.nb+' × '+ent(Math.round(KT.areaCubierta/KT.nb))+' m²)':'')+'</td></tr>'+
        '<tr><td>'+T("Huella en el lote")+'</td><td>'+dec(KT.L,1)+' × '+dec(KT.A,1)+' m</td></tr>'+
        '<tr><td>'+(TT("Nivel del bancal alto","Upper terrace level","Niveau du bancal haut"))+'</td><td>'+dec(KT.z,2)+SNM()+'</td></tr>'+
        '<tr><td>'+(TT("Nivel del bancal bajo","Lower terrace level","Niveau du bancal bas"))+'</td><td>'+dec(KT.zBaja,2)+SNM()+'</td></tr>'+
        '<tr><td>'+(TT("Escalón entre bancales","Step between terraces","Marche entre bancals"))+'</td><td>'+dec(KT.escalonReal,2)+' m</td></tr>'+
        '<tr><td>'+(TT("Altura de cada nivel","Height of each level","Hauteur de chaque niveau"))+'</td><td>'+dec(KT.alto,2)+' m</td></tr>'+
        '<tr><td>'+(TT("Movimiento de tierra","Earthworks","Terrassement"))+'</td><td>'+ent(KT.corte)+' m³'+
            (TT(' de corte',' of cut',' de déblai'))+'</td></tr>'+
        '<tr><td>'+(TT("Suelo libre del lote","Free ground on the lot","Sol libre du lot"))+'</td><td>'+ent(KT.libre)+' m²</td></tr>'+
        '</table>'+
        '<p class="p" style="margin-top:12px">'+(TT(
          '<b>Aquí no cabe una casa de una sola plataforma, pero sí se puede construir.</b> El rectángulo de '+
          'la casa tipo no entra en el suelo libre; el de la casa en bancales sí, y se implantó donde de '+
          'verdad cabe: '+dec(KT.L,1)+' × '+dec(KT.A,1)+' m, con el eje largo puesto sobre la línea de máxima '+
          'pendiente para que los '+KT.nb+' bancales queden atravesados a la ladera. Cada plataforma se pone al '+
          'promedio del terreno que tiene debajo —corte igual a lleno—, y por eso el movimiento de tierra queda '+
          'en <b>'+ent(KT.corte)+' m³</b> en vez de los más de mil que exigiría aplanar todo a un solo nivel.',
          '<b>No single-platform house fits here, but the lot can be built on.</b> The terraced volume was '+
          'implanted where it actually fits: '+dec(KT.L,1)+' × '+dec(KT.A,1)+' m, long axis on the fall line, '+
          KT.nb+' terraces across the slope, '+ent(KT.corte)+' m³ of earthworks.',
          '<b>Aucune maison sur une seule plateforme ne tient ici, mais le lot est constructible.</b>'))+'</p>'+
        '<p class="p pie">'+(TT(
          'El escalón de '+dec(KT.escalonReal,2)+' m es el que resulta del terreno medido bajo esta implantación, '+
          'no un número escogido: la profundidad del bancal la fija la pendiente. El volumen es una propuesta de '+
          'arquitectura para enseñar que el lote sí funciona; no es el plano de la casa.',
          'The '+dec(KT.escalonReal,2)+' m step is what the measured ground under this implantation yields. The '+
          'volume is an architectural proposal, not a construction drawing.',
          'La marche de '+dec(KT.escalonReal,2)+' m résulte du terrain mesuré sous cette implantation.'))+'</p>'
      : '<p class="p">'+(TT('No se pudo implantar ningún volumen en el suelo libre de este lote.',
          'No volume could be implanted on this lot\'s free ground.'))+'</p>'))+

  /* el corte del terreno: lo que explica el movimiento de tierra */
  '<h3>'+T("El corte del terreno")+'</h3>'+
  '<div class="ubiBox">'+corteTerreno(n,AW,altoDib(AW,330))+'</div>'+
  '<div class="leyC">'+
    '<div><i class="ln nat"></i>'+T("Terreno natural")+'</div>'+
    (casa?'<div><i class="ln npt"></i>'+T("Plataforma de la casa (NPT)")+'</div>':'')+
    (casa&&casa.mod==="2p"?'<div><i class="ln nm1"></i>'+T("Nivel −1")+'</div>':'')+
    (casa?'<div><i class="sw cor"></i>'+T("Corte")+'</div><div><i class="sw lle"></i>'+T("Lleno")+'</div>':'')+
    (A.cob!=null && A.cob<0.98
      ? '<div><i class="sw dec"></i>'+TT("Pendiente declarada (sin levantar)",
          "Declared slope (not surveyed)","Pente déclarée (non levée)")+'</div>' : '')+
  '</div>'+
  '<p class="p pie">'+(casa?TT(
     'Corte por la línea de máxima pendiente que pasa por la casa, que es la que manda en el '+
     'movimiento de tierra. El terreno natural va punteado y la plataforma continua: entre los dos '+
     'queda lo que hay que cortar y lo que hay que llenar, '+casa.co+' m³ y '+(casa.ll||0)+' m³.',
     'Section along the steepest line through the house, the one that governs earthworks. Natural '+
     'ground is dotted and the platform solid: between them lie the cut and the fill, '+casa.co+
     ' m³ and '+(casa.ll||0)+' m³.',
     'Coupe suivant la ligne de plus grande pente passant par la maison, celle qui commande les '+
     'terrassements. Le terrain naturel est en pointillés et la plateforme en trait plein : entre '+
     'les deux se trouvent le déblai et le remblai, '+casa.co+' m³ et '+(casa.ll||0)+' m³.')
   :TT('Corte por la línea de máxima pendiente del lote. En este lote no cabe la casa tipo, '+
       'así que no hay plataforma que dibujar.',
       'Section along the steepest line of the lot. The standard house does not fit here, so there '+
       'is no platform to draw.',
       'Coupe suivant la ligne de plus grande pente du lot. La maison type n\'entre pas ici, il n\'y '+
       'a donc pas de plateforme à dessiner.'))+
     ((A.cob!=null && A.cob<0.98) ? ' '+TT(
       'La parte rayada del corte no está levantada: es la ladera declarada al 20 %, que es el '+
       'centro del clase "muy pendiente". Arranca en la última cota medida y de ahí baja, sin pasar nunca '+
       'por debajo del punto más bajo que el levantamiento midió en el predio.',
       'The hatched part of the section is not surveyed: it is the slope declared at 20%, the middle '+
       'of the steep range. It starts at the last measured elevation and falls from there, never '+
       'going below the lowest point the survey measured on the property.',
       'La partie hachurée de la coupe n\'est pas levée : c\'est la pente déclarée à 20 %, le milieu '+
       'de la tranche forte. Elle part de la dernière cote mesurée et descend, sans jamais passer '+
       'sous le point le plus bas relevé sur la propriété.') : '')+'</p>'+

  bloqueTerraza(n)+

  '<h3>'+TT("Tour inteligente de vivienda","Smart home tour","Visite intelligente")+'</h3>'+
  '<p class="p">'+TT(
    'Un módulo aparte para entender a fondo qué se puede construir en este lote: la casa y, '+
    'alrededor de ella, el deck, el kiosco, la piscina, el jacuzzi, la cancha y la huerta. '+
    'Todavía le faltan los recorridos con renders de la casa escogida, que entran cuando el '+
    'estudio de arquitectura entregue las imágenes. Lo que ya contesta es lo que decide una '+
    'compra: qué cabe de verdad, medido sobre la geometría del lote.',
    'A separate module for understanding in depth what can be built on this lot: the house and, '+
    'around it, the deck, the gazebo, the pool, the hot tub, the court and the garden. '+
    'What it already answers is what decides a purchase: what actually fits.',
    'Un module à part pour comprendre en profondeur ce qui peut être construit sur ce lot.')+'</p>'+
  '<div style="margin:6px 0 4px"><button class="btn" id="btnTour" style="width:auto;padding:11px 22px">'+
    TT("Entrar al tour","Enter the tour","Entrer dans la visite")+'</button></div>'+
  '<div id="huecoTour"></div>'+

  '<h3>'+T("El sol sobre el lote")+'</h3>'+
  '<div class="isoBox" id="isoHueco"></div>'+
  (casa
    ? '<p class="p pie">'+(TT('El '+VOLN+' puesto sobre el terreno medido de '+
          'este lote —su forma real del plano 039 y su pendiente— con la orientación de la implantación, y encima '+
          'el recorrido del sol '+
          'en los tres momentos que mandan: el solsticio de junio, los equinoccios y el solsticio de diciembre. '+
          'Los soles marcan las 8 de la mañana, el mediodía y las 4 de la tarde. Las posiciones están calculadas '+
          'para 4,47° N y 75,74° O, hora de Colombia.',
        'The '+VOLN+' placed on this lot\'s measured ground —its real shape from '+
          'plan 039 and its slope— at the orientation of the implantation, with the path of the sun on the three '+
          'dates that matter: the June solstice, the equinoxes and the December solstice. The suns mark 8 in the '+
          'morning, noon and 4 in the afternoon. Positions are computed for 4.47° N, 75.74° W, Colombian time.',
        'Le '+VOLN+' posé sur le terrain mesuré de ce lot —sa forme réelle du '+
          'plan 039 et sa pente— à l\'orientation de l\'implantation, avec la course du soleil aux trois moments '+
          'qui comptent : le solstice de juin, les équinoxes et le solstice de décembre. Les soleils marquent 8 h, '+
          'midi et 16 h. Les positions sont calculées pour 4,47° N et 75,74° O, heure de Colombie.'))+'</p>'
    : '<p class="p pie">'+(KT
      ? TT('La casa en '+KT.nb+' bancales de este lote —'+dec(KT.L,1)+' × '+dec(KT.A,1)+' m, con un escalón de '+
           dec(KT.escalonReal,2)+' m entre plataformas— puesta sobre el terreno medido, con su forma real del '+
           'plano 039 y su pendiente, y encima el recorrido del sol en los tres momentos que mandan: el solsticio '+
           'de junio, los equinoccios y el solsticio de diciembre. Los soles marcan las 8 de la mañana, el '+
           'mediodía y las 4 de la tarde, para 4,47° N y 75,74° O, hora de Colombia.',
           'The '+KT.nb+'-terrace house of this lot placed on the measured ground, with the sun path over it.',
           'La maison en '+KT.nb+' bancals de ce lot posée sur le terrain mesuré, avec la course du soleil.')
      : TT('El terreno medido de este lote —su forma real del plano 039 y su pendiente— con el recorrido del sol '+
           'encima. Los soles marcan las 8 de la mañana, el mediodía y las 4 de la tarde.',
           'The measured ground of this lot with the sun path over it.',
           'Le terrain mesuré de ce lot avec la course du soleil.'))+'</p>')+
  '<div class="solGrid">'+
    '<div>'+diagramaSolar(150, ej?ej.rumbo:null)+
      '<div class="leyS">'+HITOS.map(h=>'<span><i style="background:'+h.c+'"></i>'+T(h.t)+'</span>').join("")+
      (ej?'<span><i style="background:var(--gold)"></i>'+T("Eje largo de la casa")+'</span>':'')+'</div></div>'+
    '<div><table class="t3"><thead><tr><th></th><th>'+T("Sale")+'</th><th>'+T("Mediodía")+'</th><th>'+
      T("Se pone")+'</th></tr></thead><tbody>'+solTabla+'</tbody></table>'+
      '<p class="p" style="margin-top:12px">'+(TT('A esta latitud —4,5° al norte del ecuador— el sol pasa casi por encima. Entre marzo y septiembre el '+
          'mediodía queda hacia el <b>norte</b>; el resto del año, hacia el <b>sur</b>. Por eso las cubiertas se '+
          'calientan mucho y las fachadas al oriente y al occidente reciben el sol bajo, que es el que más '+
          'molesta.',
    'At this latitude —4.5° north of the equator— the sun passes almost overhead. From March to September '+
          'solar noon sits to the <b>north</b>; the rest of the year, to the <b>south</b>. That is why roofs get '+
          'so hot and why the east and west facades take the low sun, which is the one that really bothers.'))+'</p>'+
      (ver?'<p class="p"><b>'+ver.n+'.</b> '+ver.t+'</p>':'')+
    '</div>'+
  '</div>'+

  '<h3>'+(TT("El sol en cada fachada","Sun on each facade"))+'</h3>'+
  '<p class="p">'+(TT('Horas de sol directo que recibe cada cara del volumen, de salida a puesta y sin nada que le haga sombra. '+
      'Es el número que decide dónde van las alcobas y qué caras piden alero.',
    'Hours of direct sun each face of the volume receives, from sunrise to sunset, with nothing shading it. '+
      'It is the number that decides where the bedrooms go and which faces need an eave.'))+'</p>'+
  tablaFachadas(casa)+
  '<p class="p pie">'+(TT('Se cuenta que una fachada tiene sol mientras el astro esté a más de 2° sobre el horizonte y dentro de 85° '+
      'de la perpendicular a esa cara. No entra la sombra de los árboles, ni la de la propia ladera, ni la de '+
      'las casas vecinas.',
    'A facade counts as sunlit while the sun is more than 2° above the horizon and within 85° of the facade\'s '+
      'normal. Shade from trees, from the slope itself or from neighbouring houses is not included.'))+'</p>'+

  '<h3>'+(TT("Por dónde corre la sombra en el día","Where the shadow falls through the day"))+'</h3>'+
  '<div id="abanico"></div>'+
  '<p class="p pie">'+(TT('La misma casa a las 7, 9, 11, 1, 3 y 5. De un vistazo se ve qué parte del lote queda libre en la tarde y '+
      'dónde tiene sentido poner la terraza o la piscina.',
    'The same house at 7, 9, 11, 1, 3 and 5 o\'clock. It shows at a glance which part of the lot stays usable '+
      'in the afternoon and where it makes sense to put the terrace or the pool.'))+'</p>'+


  ((typeof RENDERS!=="undefined" && RENDERS[String(n)])
    ?
 '<h3>'+T("Cómo se vería la casa")+'</h3>'+
      '<p class="p">'+(TT('Una imagen de la <b>Casa 30JB</b>, la casa de referencia del proyecto, puesta en este lote con '+
          'su pendiente y su orientación. <b>No es el tipo de '+TIPOS_CASA[TAM_CASA].et+'</b> que está escogido '+
          'arriba: es la única casa de la que hay render hasta hoy. Toque <b>Renderizar</b> abajo: la imagen entra '+
          'pixelada y va enfocando, como cuando un motor de render calcula por pasadas.',
        'An image of <b>Casa 30JB</b>, the project\'s reference house, placed on this lot with its slope and its '+
          'orientation. <b>It is not the '+TIPOS_CASA[TAM_CASA].et+' type</b> selected above: it is the only house '+
          'rendered so far. Tap <b>Render</b> below.',
        'Une image de la <b>Casa 30JB</b>, la maison de référence du projet, posée sur ce lot. '+
          '<b>Ce n\'est pas le type de '+TIPOS_CASA[TAM_CASA].et+'</b> choisi plus haut.'))+'</p>'+
      '<div id="renHueco"></div>'
    : '')+

  '<h3>'+T("Asoleación a lo largo del día")+'</h3>'+
  '<div class="asoCtl">'+
    '<div class="seg" id="asoFecha">'+SOL.FECHAS.map((f,i)=>
      '<button data-i="'+i+'"'+(i===1?' class="on"':'')+'>'+
      (f.k==="jun"?(TT("21 jun","21 Jun")):f.k==="eq"?(TT("20 mar","20 Mar")):(TT("21 dic","21 Dec")))+
      '</button>').join("")+'</div>'+
    '<div class="asoH"><input type="range" id="asoHora" min="6" max="18.5" step="0.25" value="9">'+
      '<b id="asoHoraV"></b></div>'+
  '</div>'+
  '<div id="asoLienzo"></div>'+
  '<p class="p pie">'+(TT('La sombra se calcula con la posición real del sol y una casa de '+ALTURA_MAX.toFixed(0)+
      ' m de altura sobre el nivel de acceso. No incluye la sombra de los árboles ni la de los lotes vecinos.',
    'The shadow is computed from the real position of the sun and a house '+ALTURA_MAX.toFixed(0)+
      ' m tall above the entry level. It does not include shade from trees or from neighbouring lots.',
    'L\'ombre est calculée avec la position réelle du soleil et une maison de '+ALTURA_MAX.toFixed(0)+
      ' m de haut au-dessus du niveau d\'accès. Elle n\'inclut ni l\'ombre des arbres ni celle des lots voisins.'))+'</p>'+

  '</div>'+
  '<div class="anlAcc">'+
    '<button class="btn" id="anl3d">'+T("Ver el volumen en 3D")+'</button>'+
    ((typeof RENDERS!=="undefined" && RENDERS[String(n)])
      ? '<button class="btn" id="anlRen">'+T("Renderizar")+'</button>' : '')+
    '<button class="btn" id="anlDxf" title="'+TT("Lote, curvas, envolvente y casa propuesta en coordenadas CTM12","Lot, contours, envelope and proposed house in CTM12")+'">'+TT("DXF para AutoCAD","DXF for AutoCAD","DXF pour AutoCAD")+'</button>'+
    '<button class="btn pri" id="anlPdf">'+T("Descargar ficha técnica y comercial")+'</button>'+
  '</div></div>';
}
function hhmm(h){ let H=Math.floor(h), M=Math.round((h-H)*60);
  if(M===60){M=0;H+=1;}
  if(LANG==="fr") return H+" h "+String(M).padStart(2,"0");   /* 18 h 05, como se escribe en Francia */
  const ap = LANG==="es" ? (H<12?"a. m.":"p. m.") : (H<12?"a.m.":"p.m.");
  let h12=H%12; if(h12===0)h12=12;
  return h12+":"+String(M).padStart(2,"0")+" "+ap; }


/* ------------------- fachadas: cuántas horas de sol recibe cada una ------------- */
function fachadasCasa(g){
  const r=g.slice(0,-1);
  const cx=r.reduce((a,p)=>a+p[0],0)/r.length, cy=r.reduce((a,p)=>a+p[1],0)/r.length;
  const out=[];
  for(let i=0;i<r.length;i++){
    const a=r[i], b=r[(i+1)%r.length];
    const dx=b[0]-a[0], dy=b[1]-a[1], L=Math.hypot(dx,dy);
    if(L<1) continue;
    let nx=dy, ny=-dx;                                  /* normal en coordenadas del plano */
    const mx=(a[0]+b[0])/2, my=(a[1]+b[1])/2;
    if((mx-cx)*nx+(my-cy)*ny < 0){ nx=-nx; ny=-ny; }    /* que apunte hacia afuera */
    const az=((Math.atan2(nx,-ny)*180/Math.PI)+360)%360; /* x=este, y=sur -> norte = -y */
    out.push({az:az, largo:L, nombre:rumboTxt(az)});
  }
  return out;
}
function horasSolFachada(az, f){
  /* barrido del día en pasos de 10 min: hay sol si el astro está arriba y da de frente */
  let h=0;
  for(let t=5;t<=19;t+=1/6){
    const p=SOL.posicion(ANIO,f.m,f.d,t,lat0,lon0);
    if(p.alt<=2) continue;
    let d=Math.abs(((p.az-az+540)%360)-180);
    if(d<85) h+=1/6;
  }
  return h;
}
function horasSolCubierta(f){
  let h=0;
  for(let t=5;t<=19;t+=1/6){ const p=SOL.posicion(ANIO,f.m,f.d,t,lat0,lon0); if(p.alt>2) h+=1/6; }
  return h;
}
const hDec = h => { let M=Math.round(h*60), H=Math.floor(M/60); M-=H*60;
  return H+" h "+String(M).padStart(2,"0"); };

function tablaFachadas(casa){
  if(!casa) return "";
  const fs=fachadasCasa(casa.g);
  /* se agrupan las cuatro caras por orientación, sumando largos iguales */
  const filas=fs.map(f=>({f:f, h:SOL.FECHAS.map(x=>horasSolFachada(f.az,x))}));
  const maxH=Math.max(6, ...filas.map(r=>Math.max(...r.h)));
  const cab='<tr><th>'+TT("Fachada","Facade")+'</th><th>'+
    SOL.FECHAS.map(f=>(f.k==="jun"?TT("21 jun","21 Jun"):f.k==="eq"?TT("20 mar","20 Mar"):TT("21 dic","21 Dec"))).join("</th><th>")+'</th></tr>';
  const cuerpo=filas.map(r=>{
    const barras=r.h.map((h,i)=>
      '<td><div style="display:flex;align-items:center;gap:6px">'+
      '<span style="flex:1;height:7px;border-radius:4px;background:var(--line-soft);overflow:hidden">'+
        '<i style="display:block;height:100%;width:'+(h/maxH*100).toFixed(0)+'%;background:'+SOL.FECHAS[i].c+'"></i></span>'+
      '<b style="font-size:11.5px;min-width:44px;text-align:right">'+hDec(h)+'</b></div></td>').join("");
    return '<tr><td style="white-space:nowrap"><b>'+r.f.nombre.charAt(0).toUpperCase()+r.f.nombre.slice(1)+
      '</b><div style="font-size:11px;color:var(--muted)">'+r.f.az.toFixed(0)+'° · '+dec(r.f.largo,1)+' m</div></td>'+
      barras+'</tr>';
  }).join("");
  const cub=SOL.FECHAS.map(f=>hDec(horasSolCubierta(f)));
  return '<table class="t3 fach"><thead>'+cab+'</thead><tbody>'+cuerpo+
    '<tr><td style="white-space:nowrap"><b>'+TT("Cubierta","Roof")+'</b>'+
    '<div style="font-size:11px;color:var(--muted)">'+TT("sol sobre el horizonte","sun above the horizon")+'</div></td>'+
    cub.map(h=>'<td><b style="font-size:11.5px">'+h+'</b></td>').join("")+'</tr></tbody></table>';
}

/* ---------------- abanico de sombras: varias horas en un mismo dibujo ---------- */
function abanicoSombras(n, iFecha, W, H){
  const L=DATA.lotes.find(x=>x.n===n), A=IMPL[String(n)];
  const HC = huellaCasa(n);
  if(!A || !HC) return '<p class="p pie">'+(TT(
      'No se pudo implantar un volumen en este lote con el suelo libre que queda.',
      'No volume could be implanted on this lot with the free ground left.',
      'Aucun volume n\'a pu être implanté sur ce lot.'))+'</p>';
  const g0=L.g.map(PX);
  let mej=0, th=0;
  for(let i=0;i<g0.length-1;i++){
    const dx=g0[i+1][0]-g0[i][0], dy=g0[i+1][1]-g0[i][1], Lg=Math.hypot(dx,dy);
    if(Lg>mej){ mej=Lg; th=-Math.atan2(dy,dx); }
  }
  const ct=Math.cos(th), stt=Math.sin(th);
  const R=p=>[p[0]*ct-p[1]*stt, p[0]*stt+p[1]*ct];
  const f=SOL.FECHAS[iFecha];
  const HORAS=[7,9,11,13,15,17];
  const sombras=HORAS.map(h=>{
    const p=SOL.posicion(ANIO,f.m,f.d,h,lat0,lon0);
    return {h:h, alt:p.alt, az:p.az, s:(p.alt>3? sombraCasa(HC.g,p.alt,p.az,HC.h) : null)};
  }).filter(x=>x.s);
  let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
  const met=q=>{x0=Math.min(x0,q[0]);x1=Math.max(x1,q[0]);y0=Math.min(y0,q[1]);y1=Math.max(y1,q[1]);};
  g0.map(R).forEach(met); HC.g.map(R).forEach(met);
  sombras.forEach(o=>o.s.map(R).forEach(met));
  const pad=6; x0-=pad;x1+=pad;y0-=pad;y1+=pad;
  const s=Math.min(W/(x1-x0), H/(y1-y0));
  const XY=p=>{const q=R(p);return [((q[0]-x0)*s).toFixed(1), ((q[1]-y0)*s).toFixed(1)];};
  const d=(ring,c)=>ring.map((p,i)=>{const q=XY(p);return (i?"L":"M")+q[0]+" "+q[1];}).join("")+(c?"Z":"");
  const w=(x1-x0)*s, h=(y1-y0)*s;
  let o='<svg viewBox="0 0 '+w.toFixed(0)+' '+h.toFixed(0)+'" width="100%" height="'+Math.round(H)+
        '" preserveAspectRatio="xMidYMid meet" style="display:block;border-radius:9px;background:var(--surface-2)">';
  o+='<path d="'+d(g0,1)+'" fill="var(--ground-in)" stroke="var(--ink-2)" stroke-width="1.4"/>';
  sombras.forEach((ob,i)=>{
    const t=i/Math.max(1,sombras.length-1);
    o+='<path d="'+d(ob.s,1)+'" fill="#2A2E22" fill-opacity="'+(0.10+0.10*(1-Math.abs(t-0.5)*2)).toFixed(3)+
       '" stroke="#2A2E22" stroke-opacity=".28" stroke-width=".7"/>';
    const c=ob.s.reduce((a,p)=>[a[0]+p[0]/ob.s.length,a[1]+p[1]/ob.s.length],[0,0]);
    const q=XY(c);
    o+='<text x="'+q[0]+'" y="'+q[1]+'" font-size="9.5" font-weight="700" text-anchor="middle" '+
       'fill="#4A4E42" opacity=".9">'+(ob.h>12?ob.h-12:ob.h)+(ob.h<12?"a":"p")+'</text>';
  });
  const BIs=bloquesIA(n);
  if(BIs){
    const orden={patio:0,deck:1,piscina:2,porche:3,muro:4};
    BIs.slice().sort((a,b)=>(orden[a.clase]-orden[b.clase])||(a.nivel-b.nivel)).forEach(b=>{
      if(b.nivel===2) return;
      o+='<path d="'+d(b.g,1)+'" fill="'+COLOR_IA_CSS[b.clase]+'" fill-opacity=".92" stroke="var(--forest-deep)" stroke-width=".7"/>';
    });
  } else
  o+='<path d="'+d(HC.g,1)+'" fill="var(--forest)" fill-opacity=".9" stroke="var(--forest-deep)" stroke-width="1"/>';
  o+='<g transform="translate('+(w-24).toFixed(0)+',22) rotate('+(th*180/Math.PI).toFixed(1)+')">'+
     '<path d="M0 -11 L3.8 5 L0 2 L-3.8 5 Z" fill="var(--ink-2)"/>'+
     '<text y="17" font-size="8.5" font-weight="700" text-anchor="middle" fill="var(--ink-2)">N</text></g>';
  return o+'</svg>';
}

/* ------------------- planta del lote con casa y sombra ----------------- */
function cascoConvexo(ps){
  const p=ps.slice().sort((a,b)=>a[0]-b[0]||a[1]-b[1]);
  const cruz=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]);
  const lo=[],hi=[];
  for(const q of p){ while(lo.length>=2&&cruz(lo[lo.length-2],lo[lo.length-1],q)<=0)lo.pop(); lo.push(q); }
  for(let i=p.length-1;i>=0;i--){ const q=p[i];
    while(hi.length>=2&&cruz(hi[hi.length-2],hi[hi.length-1],q)<=0)hi.pop(); hi.push(q); }
  lo.pop(); hi.pop(); return lo.concat(hi);
}
/* La huella de la casa de este lote y su altura, venga de la implantación de
   una sola plataforma o de la de bancales. Todo lo que proyecta sombra —la
   planta de asoleación y el abanico— pasa por aquí, así los dos dibujos hablan
   siempre del mismo volumen. */
function huellaCasa(n){
  const A=IMPL[String(n)]; if(!A) return null;
  /* con casa propuesta, la huella que da sombra es la de sus bloques cubiertos */
  const BI=bloquesIA(n);
  if(BI){
    const cub=BI.filter(b=>b.clase==="muro"||b.clase==="porche");
    if(cub.length){
      const pts=[]; cub.forEach(b=>b.g.slice(0,-1).forEach(q=>pts.push(q)));
      const h=Math.max(...cub.map(b=>altoBloqueIA(b,BI)));
      return {g:cascoConvexo(pts), h:h, tz:false, T:null, ia:true};
    }
  }
  if(A.k && A.k.g) return {g:A.k.g, h:ALTURA_MAX, tz:false, T:null};
  const T=implantarTerraza(n);
  return T ? {g:T.g, h:T.alto, tz:true, T:T} : null;
}
function sombraCasa(g, alt, az, alturaCasa){
  if(alt<=1) return null;
  const L=alturaCasa/Math.tan(alt*Math.PI/180);
  if(L>400) return null;
  const A=az*Math.PI/180, dx=-L*Math.sin(A), dy=L*Math.cos(A);   /* y hacia el sur */
  const base=g.slice(0,-1), alto=base.map(p=>[p[0]+dx,p[1]+dy]);
  return cascoConvexo(base.concat(alto));
}
function plantaLote(n, iFecha, hora, W, H){
  const L=DATA.lotes.find(x=>x.n===n), A=IMPL[String(n)];
  const g0=L.g.map(PX);
  /* se gira igual que en el PDF: el lado más largo horizontal */
  let mej=0, th=0;
  for(let i=0;i<g0.length-1;i++){
    const dx=g0[i+1][0]-g0[i][0], dy=g0[i+1][1]-g0[i][1], Lg=Math.hypot(dx,dy);
    if(Lg>mej){ mej=Lg; th=-Math.atan2(dy,dx); }
  }
  const ct=Math.cos(th), stt=Math.sin(th);
  const R=p=>[p[0]*ct-p[1]*stt, p[0]*stt+p[1]*ct];
  let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
  const met=q=>{x0=Math.min(x0,q[0]);x1=Math.max(x1,q[0]);y0=Math.min(y0,q[1]);y1=Math.max(y1,q[1]);};
  const HC=huellaCasa(n);
  g0.map(R).forEach(met); if(A.c)A.c.map(R).forEach(met); if(HC)HC.g.map(R).forEach(met);
  const f=SOL.FECHAS[iFecha], pos=SOL.posicion(ANIO,f.m,f.d,hora,lat0,lon0);
  const som=HC?sombraCasa(HC.g,pos.alt,pos.az,HC.h):null;
  if(som)som.map(R).forEach(met);
  const lim=[x0-16,y0-16,x1+16,y1+16];
  DATA.via.forEach(v=>v.map(PX).map(R).forEach(q=>{
    if(q[0]>lim[0]&&q[0]<lim[2]&&q[1]>lim[1]&&q[1]<lim[3]) met(q); }));
  x0=Math.max(x0,lim[0]); y0=Math.max(y0,lim[1]); x1=Math.min(x1,lim[2]); y1=Math.min(y1,lim[3]);
  const pad=7; x0-=pad;x1+=pad;y0-=pad;y1+=pad;
  const s=Math.min(W/(x1-x0), H/(y1-y0));
  const XY=p=>{const q=R(p);return [((q[0]-x0)*s).toFixed(1), ((q[1]-y0)*s).toFixed(1)];};
  const d=(ring,c)=>ring.map((p,i)=>{const q=XY(p);return (i?"L":"M")+q[0]+" "+q[1];}).join("")+(c?"Z":"");
  const w=((x1-x0)*s), h=((y1-y0)*s);
  let o='<svg viewBox="0 0 '+w.toFixed(0)+' '+h.toFixed(0)+'" width="100%" height="'+Math.round(H)+
        '" preserveAspectRatio="xMidYMid meet" style="display:block;border-radius:9px;background:var(--surface-2)">';
  o+='<path d="'+d(g0,1)+'" fill="var(--ground-in)"/>';
  /* las curvas de nivel debajo de todo lo demás, recortadas al lote */
  const RinvL = q=>[q[0]*ct+q[1]*stt, -q[0]*stt+q[1]*ct];
  const CNL = curvasNivel(x0, y0, x1, y1, RinvL, 2.0, 1.0);
  if(CNL.length){
    o+='<defs><clipPath id="clpl'+n+'"><path d="'+d(g0,1)+'"/></clipPath></defs>';
    o+='<g clip-path="url(#clpl'+n+')" fill="none" stroke="#2B2A22" stroke-linecap="round">';
    CNL.forEach(c=>{
      let dd="";
      c.segs.forEach(([a,b])=>{
        dd += "M"+((a[0]-x0)*s).toFixed(1)+" "+((a[1]-y0)*s).toFixed(1)
            + "L"+((b[0]-x0)*s).toFixed(1)+" "+((b[1]-y0)*s).toFixed(1);
      });
      o+='<path d="'+dd+'" stroke-width="'+(c.maestra?1.0:0.45)+
         '" stroke-opacity="'+(c.maestra?.42:.22)+'"/>';
    });
    o+='</g>';
  }
  DATA.prot.forEach(r=>{ const rr=r.map(PX);
    o+='<path d="'+d(rr,1)+'" fill="var(--prot)" fill-opacity=".30" stroke="var(--prot)" stroke-width=".8"/>'; });
  DATA.via.forEach(v=>{ const vv=v.map(PX);
    o+='<path d="'+d(vv,0)+'" fill="none" stroke="var(--road)" stroke-width="'+Math.max(2,5.5*s).toFixed(1)+
       '" stroke-linejoin="round" stroke-linecap="round"/>'; });
  o+='<path d="'+d(g0,1)+'" fill="none" stroke="var(--ink-2)" stroke-width="1.6"/>';
  if(A.c) o+='<path d="'+d(A.c,1)+'" fill="none" stroke="var(--gold)" stroke-width="1.3" stroke-dasharray="5 4"/>';
  if(som) o+='<path d="'+d(som,1)+'" fill="#2A2E22" fill-opacity=".26"/>';
  const BIp=bloquesIA(n);
  if(BIp){
    /* la casa propuesta: la envolvente queda de guía y encima cada bloque con
       su color y su nombre; el piso alto va punteado sobre el de abajo */
    if(A.k&&A.k.g) o+='<path d="'+d(A.k.g,1)+'" fill="none" stroke="var(--forest)" stroke-width=".8" stroke-dasharray="3 3" opacity=".7"/>';
    const orden={patio:0,deck:1,piscina:2,porche:3,muro:4};
    BIp.slice().sort((a,b)=>(orden[a.clase]-orden[b.clase])||(a.nivel-b.nivel)).forEach(b=>{
      if(b.nivel===2) o+='<path d="'+d(b.g,1)+'" fill="none" stroke="#F4F2EA" stroke-width="1.2" stroke-dasharray="3 2"/>';
      else o+='<path d="'+d(b.g,1)+'" fill="'+COLOR_IA_CSS[b.clase]+'" fill-opacity=".9" stroke="var(--forest-deep)" stroke-width=".7"/>';
      const c=b.g.slice(0,-1).reduce((a,p)=>[a[0]+p[0]/4,a[1]+p[1]/4],[0,0]), q=XY(c);
      const anchoPx=Math.hypot(+XY(b.g[0])[0]-+XY(b.g[1])[0], +XY(b.g[0])[1]-+XY(b.g[1])[1]);
      if(anchoPx>34 && (b.clase==="muro"||b.clase==="piscina"||b.clase==="porche"))
        o+='<text x="'+q[0]+'" y="'+q[1]+'" font-size="7.5" font-weight="700" text-anchor="middle" dy="2.6" '+
           'fill="'+(b.clase==="muro"?"#F4F2EA":"#1C221B")+'">'+String(b.nombre).replace(/[<>&]/g,"")+(b.nivel===2?" ↑":"")+'</text>';
    });
  }
  else if(HC){
    o+='<path d="'+d(HC.g,1)+'" fill="var(--forest)" fill-opacity=".82" stroke="var(--forest-deep)" stroke-width="1"/>';
    const c=HC.g.slice(0,-1).reduce((a,p)=>[a[0]+p[0]/4,a[1]+p[1]/4],[0,0]);
    const q=XY(c);
    const rot = HC.tz ? HC.T.areaCubierta+" m² × "+HC.T.nb
              : A.k.mod==="2p" ? Math.round(A.k.an)+" m² × 2" : Math.round(A.k.at)+" m²";
    o+='<text x="'+q[0]+'" y="'+q[1]+'" font-size="10" font-weight="700" text-anchor="middle" '+
       'dy="3.5" fill="var(--on-forest)">'+rot+'</text>';
    /* las juntas entre bancales, para que se lea que son tres plataformas */
    if(HC.tz && HC.T.nb>1){
      const T=HC.T, XYt=(u,v)=>[T.o[0]+T.ux[0]*u+T.uv[0]*v, T.o[1]+T.ux[1]*u+T.uv[1]*v];
      for(let k=1;k<T.nb;k++){
        const u=k*T.L/T.nb;
        o+='<path d="'+d([XYt(u,0),XYt(u,T.A)],0)+'" stroke="var(--on-forest)" stroke-opacity=".7" stroke-width="1" fill="none"/>';
      }
    }
  }
  /* las medidas de los lados, que es lo que se pregunta primero */
  o+=acotarLote(g0, p=>{const q=XY(p); return [+q[0], +q[1]];}, 48, 9.5);

  /* norte y rayo de sol */
  o+='<g transform="translate('+(w-26).toFixed(0)+',24) rotate('+(th*180/Math.PI).toFixed(1)+')">'+
     '<path d="M0 -13 L4.4 6 L0 2.4 L-4.4 6 Z" fill="var(--ink-2)"/>'+
     '<text y="19" font-size="9" font-weight="700" text-anchor="middle" fill="var(--ink-2)">N</text></g>';
  if(pos.alt>1){
    const A2=(pos.az)*Math.PI/180 + th, r=Math.min(w,h)*0.42;
    const cx=w/2, cy=h/2, sx=cx+r*Math.sin(A2), sy=cy-r*Math.cos(A2);
    o+='<line x1="'+sx.toFixed(1)+'" y1="'+sy.toFixed(1)+'" x2="'+cx.toFixed(1)+'" y2="'+cy.toFixed(1)+
       '" stroke="var(--resv)" stroke-width="1.4" stroke-dasharray="4 4" opacity=".65"/>'+
       '<circle cx="'+sx.toFixed(1)+'" cy="'+sy.toFixed(1)+'" r="6" fill="#E8B33C"/>';
  }
  o+='<text x="10" y="'+(h-10).toFixed(0)+'" font-size="10" fill="var(--muted)">'+
     (pos.alt>1
       ? (TT('Sol a ','Sun ')+pos.alt.toFixed(0)+TT('° de altura, azimut ','° high, azimuth ')+pos.az.toFixed(0)+'°')
       : TT('El sol ya se ocultó','The sun has already set'))+
     '</text>';
  return o+'</svg>';
}

/* =========================================================================
   PDF: se escribe a mano, sin librerías ni CDN.
   Una hoja A4 por lote, en vectores, con las fuentes base de PDF.
   ========================================================================= */
const PDFmin = (()=>{
  const WIN={"€":128,"‚":130,"ƒ":131,"„":132,"…":133,"†":134,"‡":135,"ˆ":136,"‰":137,"Š":138,
    "‹":139,"Œ":140,"Ž":142,"‘":145,"’":146,"“":147,"”":148,"•":149,"–":150,"—":151,"˜":152,
    "™":153,"š":154,"›":155,"œ":156,"ž":158,"Ÿ":159};
  function win(s){
    let o="";
    for(const ch of String(s)){
      const c=ch.codePointAt(0);
      if(WIN[ch]!==undefined) o+=String.fromCharCode(WIN[ch]);
      else if(c<256) o+=ch;
      else o+={"₂":"2","→":"-","−":"-","—":String.fromCharCode(151),"–":String.fromCharCode(150),
               "’":String.fromCharCode(146),"“":String.fromCharCode(147),"”":String.fromCharCode(148),
               "\u202f":" ","\u2009":" ","\u2007":" ","\u2060":"","\u200b":"",
               "·":String.fromCharCode(183),"…":"..."}[ch]||"-";
    }
    return o;
  }
  const esc=s=>win(s).replace(/[\\()]/g,m=>"\\"+m);

  function Hoja(w,h){
    const c=[]; let W=w,H=h;
    const Y=y=>(H-y).toFixed(2);
    const api={
      w:W,h:H,
      color(r,g,b){c.push([r,g,b].map(v=>(v/255).toFixed(3)).join(" ")+" rg");return api;},
      trazo(r,g,b){c.push([r,g,b].map(v=>(v/255).toFixed(3)).join(" ")+" RG");return api;},
      grosor(v){c.push(v.toFixed(2)+" w");return api;},
      raya(a,b){c.push(a?("["+a+" "+b+"] 0 d"):"[] 0 d");return api;},
      rect(x,y,an,al,m){c.push([x.toFixed(2),Y(y+al),an.toFixed(2),al.toFixed(2)].join(" ")+" re "+(m||"f"));return api;},
      linea(x1,y1,x2,y2){c.push(x1.toFixed(2)+" "+Y(y1)+" m "+x2.toFixed(2)+" "+Y(y2)+" l S");return api;},
      poli(ps,m,cerrar){
        if(!ps||!ps.length)return api;
        ps.forEach((p,i)=>c.push(p[0].toFixed(2)+" "+Y(p[1])+(i?" l":" m")));
        if(cerrar!==false)c.push("h");
        c.push(m||"f"); return api;},
      circulo(x,y,r,m){
        const k=0.5523*r, yy=+Y(y);
        c.push((x+r).toFixed(2)+" "+yy.toFixed(2)+" m");
        c.push((x+r).toFixed(2)+" "+(yy+k).toFixed(2)+" "+(x+k).toFixed(2)+" "+(yy+r).toFixed(2)+" "+x.toFixed(2)+" "+(yy+r).toFixed(2)+" c");
        c.push((x-k).toFixed(2)+" "+(yy+r).toFixed(2)+" "+(x-r).toFixed(2)+" "+(yy+k).toFixed(2)+" "+(x-r).toFixed(2)+" "+yy.toFixed(2)+" c");
        c.push((x-r).toFixed(2)+" "+(yy-k).toFixed(2)+" "+(x-k).toFixed(2)+" "+(yy-r).toFixed(2)+" "+x.toFixed(2)+" "+(yy-r).toFixed(2)+" c");
        c.push((x+k).toFixed(2)+" "+(yy-r).toFixed(2)+" "+(x+r).toFixed(2)+" "+(yy-k).toFixed(2)+" "+(x+r).toFixed(2)+" "+yy.toFixed(2)+" c");
        c.push(m||"f"); return api;},
      texto(x,y,s,t,f,esp){
        /* un solo bloque de texto: el superíndice usa Ts (text rise), así el
           avance lo calcula el propio PDF y nunca se desalinea */
        const fu=f||"F1";
        const marcado=String(s).replace(/²/g,"\u0002").replace(/³/g,"\u0003");
        const partes=marcado.split(/[\u0002\u0003]/);
        const supers=(marcado.match(/[\u0002\u0003]/g)||[]).map(ch=>ch==="\u0002"?"2":"3");
        let o="BT /"+fu+" "+t.toFixed(2)+" Tf"+(esp?" "+esp.toFixed(2)+" Tc":"")+
              " 1 0 0 1 "+x.toFixed(2)+" "+Y(y)+" Tm";
        partes.forEach((tr,i)=>{
          if(tr) o+=" ("+esc(tr)+") Tj";
          if(i<partes.length-1)
            o+=" /"+fu+" "+(t*0.64).toFixed(2)+" Tf "+(t*0.34).toFixed(2)+" Ts ("+supers[i]+") Tj"+
               " /"+fu+" "+t.toFixed(2)+" Tf 0 Ts";
        });
        c.push(o+" ET");
        if(esp)c.push("BT 0 Tc ET");
        return api;},
      textoD(x,y,s,t,f){ api.texto(x-anchoTexto(s,t,f),y,s,t,f); return api;},
      textoC(x,y,s,t,f){ api.texto(x-anchoTexto(s,t,f)/2,y,s,t,f); return api;},
      /* una imagen JPEG ya registrada en el archivo, colocada por su caja.
         El sistema de coordenadas del PDF tiene el origen abajo, así que la
         matriz lleva la altura y la y ya volteada. */
      imagen(nombre,x,y,an,al){
        c.push("q "+an.toFixed(2)+" 0 0 "+al.toFixed(2)+" "+x.toFixed(2)+" "+Y(y+al)+
               " cm /"+nombre+" Do Q");
        return api;},
      guarda(){c.push("q");return api;}, recupera(){c.push("Q");return api;},
      recorte(ps){ps.forEach((p,i)=>c.push(p[0].toFixed(2)+" "+Y(p[1])+(i?" l":" m")));c.push("h W n");return api;},
      flujo(){return c.join("\n");}
    };
    return api;
  }
  /* anchos aproximados de Helvetica: suficiente para centrar y alinear a la derecha */
  const AN={" ":278,"!":278,'"':355,"#":556,"$":556,"%":889,"&":667,"'":191,"(":333,")":333,"*":389,
    "+":584,",":278,"-":333,".":278,"/":278,":":278,";":278,"<":584,"=":584,">":584,"?":556,"@":1015,
    "[":278,"\\":278,"]":278,"^":469,"_":556,"`":333,"{":334,"|":260,"}":334,"~":584};
  function anchoTexto(s,t,f){
    let u=0; const neg=(f==="F2");
    for(const ch of win(String(s).replace(/[²³]/g,"\u0000"))){
      if(ch==="\u0000"){ u+=556*0.62; continue; }
      let a=AN[ch];
      if(a===undefined){
        if(ch>="0"&&ch<="9")a=556;
        else if(ch>="A"&&ch<="Z")a=("IJ".includes(ch)?278:"MW".includes(ch)?889:722);
        else a=("ijlt".includes(ch)?250:"mw".includes(ch)?833:"fr".includes(ch)?333:556);
      }
      u+=a*(neg?1.06:1);
    }
    return u/1000*t;
  }
  /* imágenes disponibles para todas las hojas: JPEG crudo, que el PDF sabe
     descomprimir solo con DCTDecode. Se registran una vez y se referencian. */
  const IMGS={};
  function registrarJPEG(nombre, b64, ancho, alto){
    const bin=atob(b64);
    IMGS[nombre]={bin, ancho, alto};
  }
  function archivo(hojas){
    const objs=[];
    const nH=hojas.length;
    const nombres=Object.keys(IMGS);
    const base=5+nH*2;                       /* los XObject van después de las hojas */
    const rec = nombres.length
      ? "/XObject<<"+nombres.map((n,k)=>"/"+n+" "+(base+k)+" 0 R").join("")+">>" : "";
    objs[1]="<</Type/Catalog/Pages 2 0 R>>";
    objs[2]="<</Type/Pages/Kids["+hojas.map((_,i)=>(5+i*2)+" 0 R").join(" ")+"]/Count "+nH+">>";
    objs[3]="<</Type/Font/Subtype/Type1/BaseFont/Helvetica/Encoding/WinAnsiEncoding>>";
    objs[4]="<</Type/Font/Subtype/Type1/BaseFont/Helvetica-Bold/Encoding/WinAnsiEncoding>>";
    hojas.forEach((h,i)=>{
      const f=h.flujo();
      objs[5+i*2]="<</Type/Page/Parent 2 0 R/MediaBox[0 0 "+h.w+" "+h.h+"]"+
        "/Resources<</Font<</F1 3 0 R/F2 4 0 R>>"+rec+">>/Contents "+(6+i*2)+" 0 R>>";
      objs[6+i*2]="<</Length "+f.length+">>\nstream\n"+f+"\nendstream";
    });
    nombres.forEach((n,k)=>{
      const im=IMGS[n];
      objs[base+k]="<</Type/XObject/Subtype/Image/Width "+im.ancho+"/Height "+im.alto+
        "/ColorSpace/DeviceRGB/BitsPerComponent 8/Filter/DCTDecode/Length "+im.bin.length+
        ">>\nstream\n"+im.bin+"\nendstream";
    });
    let s="%PDF-1.4\n"; const off=[];
    for(let i=1;i<objs.length;i++){ off[i]=s.length; s+=i+" 0 obj\n"+objs[i]+"\nendobj\n"; }
    const xr=s.length;
    s+="xref\n0 "+objs.length+"\n0000000000 65535 f \n";
    for(let i=1;i<objs.length;i++) s+=String(off[i]).padStart(10,"0")+" 00000 n \n";
    s+="trailer\n<</Size "+objs.length+"/Root 1 0 R>>\nstartxref\n"+xr+"\n%%EOF";
    const u=new Uint8Array(s.length);
    for(let i=0;i<s.length;i++)u[i]=s.charCodeAt(i)&255;
    return u;
  }
  return {Hoja, archivo, ancho:anchoTexto, registrarJPEG};
})();

/* ======================= PORTADA DEL PDF =======================
   El plano general de la parcelación con el lote resaltado. Quien
   reciba la ficha semanas después abre la primera página y vuelve a
   ubicar el lote dentro del proyecto sin tener que buscar el plano.
   ============================================================== */
function hojaPortadaPDF(n,L,A,casa,V){
  const P=PDFmin.Hoja(595.28,841.89), M=38, W=595.28;
  const col=(c,f)=>f?P.trazo(c[0],c[1],c[2]):P.color(c[0],c[1],c[2]);
  const est=estadoDe(L), ET=ETAPAS[state.etapa-1], val=precio(L,state.etapa);

  /* ---------------- cabecera ---------------- */
  col(V.forest).rect(0,0,W,124);
  const xt = logoEnBanda(P, M, 52, 40);
  col([200,214,192]).texto(xt,58,T("El Caimo · Armenia · Quindío · Parcelación campestre"),8.6,"F1");
  col([164,186,158]).texto(M,101,TT("86 lotes · 37 hectáreas · plano 039",
                                    "86 lots · 37 hectares · drawing 039",
                                    "86 lots · 37 hectares · plan 039"),8.2,"F1");
  col(V.blanco).textoD(W-M,62,TT("LOTE ","LOT ","LOT ")+n,34,"F2");
  col([200,214,192]).textoD(W-M,84,fmtA(L.at),9.6,"F1");
  col(V.gold).textoD(W-M,101,T(EST[est].t).toUpperCase(),8,"F2",1.1);
  col(V.gold).rect(0,124,W,3);

  /* ---------------- rótulo ---------------- */
  let y=154;
  col(V.gold).texto(M,y,TT("DÓNDE ESTÁ EL LOTE","WHERE THE LOT IS","OÙ SE TROUVE LE LOT"),8,"F2",1.3);
  col(V.muted).textoD(W-M,y,TT("Plano general · norte arriba",
                               "General plan · north up",
                               "Plan général · nord en haut"),7.6,"F1");
  y+=10;

  /* ---------------- el plano general ---------------- */
  const bx=M, by=y, bw=W-2*M, bh=450;
  col([250,249,243]).rect(bx,by,bw,bh);
  col(V.line,1).grosor(.6).rect(bx,by,bw,bh,"S");

  /* encuadre: todo el predio */
  let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
  const met=p=>{x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);y0=Math.min(y0,p[1]);y1=Math.max(y1,p[1]);};
  DATA.lind.map(PX).forEach(met);
  DATA.lotes.forEach(Lo=>Lo.g.map(PX).forEach(met));
  const pad=10; x0-=pad; y0-=pad; x1+=pad; y1+=pad;
  const s=Math.min((bw-44)/(x1-x0),(bh-44)/(y1-y0));
  const ox=bx+(bw-(x1-x0)*s)/2, oy=by+(bh-(y1-y0)*s)/2;
  const XY=p=>{const q=PX(p); return [ox+(q[0]-x0)*s, oy+(q[1]-y0)*s];};

  P.guarda();
  P.recorte([[bx,by],[bx+bw,by],[bx+bw,by+bh],[bx,by+bh]]);

  /* el predio */
  col([243,242,232]); P.poli(DATA.lind.map(XY),"f");
  /* zonas comunes y equipamientos */
  DATA.soc.concat(DATA.var).forEach(a=>{
    col([226,234,221]); P.poli(a.g.map(XY),"f");
    col([164,184,158],1).grosor(.35); P.poli(a.g.map(XY),"S"); });
  /* fajas de protección */
  DATA.prot.forEach(r=>{
    col([205,222,200]); P.poli(r.map(XY),"f");
    col(V.prot,1).grosor(.35); P.poli(r.map(XY),"S"); });
  /* vías: la calzada en blanco y el filo en gris */
  DATA.via.forEach(v=>{
    col([255,255,255],1).grosor(Math.max(1.6,6.5*s)); P.poli(v.map(XY),"S",false);
    col([176,180,162],1).grosor(.35); P.poli(v.map(XY),"S",false); });
  /* los 86 lotes */
  DATA.lotes.forEach(Lo=>{
    if(Lo.n===n) return;
    const e=estadoDe(Lo);
    col(e==="DISPONIBLE"?[253,252,248]:[236,234,226]); P.poli(Lo.g.map(XY),"f");
    col([166,172,154],1).grosor(.35); P.poli(Lo.g.map(XY),"S"); });
  /* lindero general */
  col([50,64,47],1).grosor(1.3); P.poli(DATA.lind.map(XY),"S");

  /* ---- el lote analizado ---- */
  const gL=L.g.map(XY);
  col([198,158,80]); P.poli(gL,"f");
  col([90,68,30],1).grosor(1.4); P.poli(gL,"S");

  /* círculo localizador */
  const c=XY(L.c);
  let R=0; gL.forEach(p=>R=Math.max(R,Math.hypot(p[0]-c[0],p[1]-c[1])));
  R=Math.max(R+11,22);
  col(V.gold,1).grosor(1).raya(3,2.5); P.circulo(c[0],c[1],R,"S"); P.raya(0);

  P.recupera();

  /* ---- el rótulo del lote, con guía ---- */
  const cx=bx+bw/2, cy=by+bh/2;
  let vx=c[0]-cx, vy=c[1]-cy, vm=Math.hypot(vx,vy)||1;
  vx/=vm; vy/=vm;
  const rot=TT("LOTE ","LOT ","LOT ")+n;
  const anR=PDFmin.ancho(rot,10,"F2"), rw=anR+18, rh=21;
  let lx=c[0]+vx*(R+30), ly=c[1]+vy*(R+30);
  lx=Math.min(Math.max(lx,bx+10+rw/2),bx+bw-10-rw/2);
  ly=Math.min(Math.max(ly,by+10+rh/2),by+bh-10-rh/2);
  /* la guía arranca en el borde del círculo y termina en el borde del rótulo */
  let dx=lx-c[0], dy=ly-c[1], dm=Math.hypot(dx,dy)||1;
  col([90,68,30],1).grosor(.9);
  P.linea(c[0]+dx/dm*R, c[1]+dy/dm*R, lx-dx/dm*(rw/2), ly-dy/dm*(rh/2));
  col(V.forest).rect(lx-rw/2,ly-rh/2,rw,rh);
  col(V.gold,1).grosor(.8).rect(lx-rw/2,ly-rh/2,rw,rh,"S");
  col(V.blanco).textoC(lx,ly+3.6,rot,10,"F2");

  /* ---- norte ---- */
  const nx=bx+bw-24, ny=by+24;
  col([60,70,56]); P.poli([[nx,ny-10],[nx+3.4,ny+4.2],[nx,ny+1.7],[nx-3.4,ny+4.2]],"f");
  P.textoC(nx,ny+16,"N",7.4,"F2");

  /* ---- escala ---- */
  const m=[50,100,200,500].filter(v=>v*s<bw*0.24).pop()||50;
  const sx0=bx+bw-18-m*s, sy0=by+bh-16;
  col([60,70,56],1).grosor(1); P.linea(sx0,sy0,sx0+m*s,sy0);
  P.linea(sx0,sy0-3,sx0,sy0+3); P.linea(sx0+m*s,sy0-3,sx0+m*s,sy0+3);
  col([60,70,56]).textoD(sx0-5,sy0+2.5,m+" m",7,"F1");

  /* ---- leyenda ---- */
  let ly2=by+bh-16, lx2=bx+14;
  const leyenda=[[[198,158,80],TT("El lote analizado","The lot analysed","Le lot analysé")],
                 [[253,252,248],TT("Lotes","Lots","Lots")],
                 [[205,222,200],TT("Protección","Protection","Protection")],
                 [[226,234,221],TT("Zonas comunes","Common areas","Espaces communs")]];
  leyenda.forEach(it=>{
    col(it[0]).rect(lx2,ly2-6.5,9,9);
    col([120,124,108],1).grosor(.4).rect(lx2,ly2-6.5,9,9,"S");
    col(V.muted).texto(lx2+13,ly2,it[1],7.2,"F1");
    lx2+=13+PDFmin.ancho(it[1],7.2,"F1")+22;
  });

  /* ---------------- cifras ---------------- */
  y=by+bh+22;
  const celdas=[
    [T("Área total"), fmtA(L.at)],
    [T("Área útil"),  fmtA(L.ut)],
    [T("Pendiente media"), pendTxt(A,1)],
    [T("Precio")+" "+ET.l, fmtCOP(val)]
  ];
  const cw=(W-2*M)/4;
  celdas.forEach((cd,i)=>{
    const x=M+i*cw;
    if(i) { col(V.line,1).grosor(.5); P.linea(x-8,y-4,x-8,y+26); }
    col(V.muted).texto(x,y,cd[0],7.4,"F1",.6);
    /* MEDIDO: "Más del 25 %" a 13 pt mide más que el cuarto de hoja y se montaba
       encima del precio. El cuerpo baja hasta que la cifra quepa en su celda. */
    let tam = i===3 ? 12 : 13;
    while(tam > 7.5 && PDFmin.ancho(cd[1], tam, "F2") > cw - 16) tam -= 0.5;
    col(V.ink).texto(x,y+20,cd[1],tam,"F2");
  });
  y+=40;
  col(V.muted).texto(M,y,T(ET.d),7.8,"F1");

  /* ---------------- qué trae adentro ---------------- */
  y+=22;
  col(V.line,1).grosor(.5); P.linea(M,y,W-M,y); y+=16;
  col(V.gold).texto(M,y,TT("EN LAS PÁGINAS SIGUIENTES","IN THE FOLLOWING PAGES","DANS LES PAGES SUIVANTES"),7.4,"F2",1.1);
  y+=14;
  const indice=[TT("Ficha técnica: áreas, terreno, pendientes y asoleamiento",
                   "Technical sheet: areas, terrain, slopes and sun",
                   "Fiche technique : surfaces, terrain, pentes et ensoleillement")];
  if(casa && casaIA(n)){
    indice.push(TT("La casa que pediste: bloque por bloque, con áreas y piscina",
                   "The house you asked for: block by block, with areas and pool",
                   "La maison demandée : bloc par bloc, surfaces et piscine"));
    if((casaIA(n).espacios||[]).length)
      indice.push(TT("Planta esquemática: espacios, muros, puertas y ventanas",
                     "Schematic floor plan: rooms, walls, doors and windows",
                     "Plan schématique : pièces, murs, portes et fenêtres"));
    if(RENDER_PDF[n])
      indice.push(TT("Así se vería: imagen ilustrativa generada con IA",
                     "How it would look: illustrative AI image",
                     "À quoi elle ressemblerait : image illustrative IA"));
  }
  if(casa){
    indice.push(TT("El sol sobre la casa: implantación en isométrico",
                   "The sun on the house: isometric siting",
                   "Le soleil sur la maison : implantation en isométrie"));
    indice.push(TT("Horas de sol por fachada y abanico de sombras",
                   "Sunlight hours per façade and shadow fan",
                   "Heures de soleil par façade et éventail d'ombres"));
  }
  indice.push(TT("Valor comercial por etapa y forma de pago",
                 "Commercial value by stage and payment terms",
                 "Valeur commerciale par étape et mode de paiement"));
  indice.push(TT("Plan de pagos: el calendario de cuotas mes a mes",
                 "Payment plan: the month-by-month schedule",
                 "Plan de paiement : le calendrier mensuel"));
  /* con casa propuesta el índice tiene hasta ocho renglones y llegaba al pie
     (MEDIDO: "Plan de pagos" sobre "Geometría del plano" en el lote 27); el
     paso se acorta para que el último renglón quede 10 pt sobre la raya */
  const pasoIdx = Math.min(12.5, Math.max(9.6, (794-10-y)/Math.max(1,indice.length)));
  indice.forEach((t,i)=>{
    col(V.gold).texto(M,y,String(i+2),8.6,"F2");
    col(V.ink).texto(M+16,y,t,8.6,"F1");
    y+=pasoIdx;
  });

  /* ---------------- pie ---------------- */
  const py=806;
  col(V.line,1).grosor(.5).linea(M,py-12,W-M,py-12);
  col(V.muted).texto(M,py,TT(
    "Geometría del plano 039 del 09-09-2026, MAGNA-SIRGAS / Origen Nacional CTM12. Precios de trabajo; no es oferta comercial.",
    "Geometry from drawing 039 dated 09-09-2026, MAGNA-SIRGAS / Origen Nacional CTM12. Working prices; not a commercial offer.",
    "Géométrie du plan 039 du 09-09-2026, MAGNA-SIRGAS / Origen Nacional CTM12. Prix de travail ; ce n'est pas une offre commerciale."),6.6,"F1");
  col(V.forest).textoD(W-M,py,T("Generado el")+" "+new Date().toLocaleDateString(LOC()),6.8,"F2");
  return P;
}

/* El logo de Laureles va en el encabezado de TODAS las hojas. Viaja como JPEG
   ya compuesto sobre el verde de la banda —el PDF no maneja transparencia sin
   complicarse—, así que sólo sirve sobre esa banda, que es donde va. */
const LOGO_PDF_B64 = window.__LOGO_PDF_B64 || "";
const LOGO_PDF = {an:420, al:262, alto:26};        /* alto en puntos dentro de la banda */
PDFmin.registrarJPEG("Lg", LOGO_PDF_B64, LOGO_PDF.an, LOGO_PDF.al);
/* dibuja el logo alineado a la izquierda de una banda y devuelve dónde sigue el texto */
function logoEnBanda(P, M, yCentro, alto){
  const h = alto || LOGO_PDF.alto;
  const w = h * LOGO_PDF.an / LOGO_PDF.al;
  P.imagen("Lg", M, yCentro - h/2, w, h);
  return M + w + 14;
}

/* ------------------------- la hoja PDF del lote ------------------------ */
function fichaPDF(n){
  const L=DATA.lotes.find(x=>x.n===n), A=IMPL[String(n)];
  const est=estadoDe(L), ET=ETAPAS[state.etapa-1], val=precio(L,state.etapa);
  const casa=A&&A.k, ej=casa?ejeLargo(casa.g):null, ver=ej?veredicto(ej.rumbo):null;
  const fach=ej?[(ej.rumbo+90)%360,(ej.rumbo+270)%360].map(rumboTxt):null;
  const V={forest:[50,64,47],gold:[155,122,72],ink:[28,34,27],muted:[107,115,103],
           line:[219,217,205],claro:[248,247,241],blanco:[255,255,255],prot:[124,152,120]};
  const P=PDFmin.Hoja(595.28,841.89), M=38;
  const col=(c,f)=>f?P.trazo(c[0],c[1],c[2]):P.color(c[0],c[1],c[2]);

  /* cabecera */
  col(V.forest).rect(0,0,595.28,76);
  const xt = logoEnBanda(P, M, 34, 30);
  col([200,214,192]).texto(xt,42,T("El Caimo · Armenia · Quindío · Parcelación campestre"),8.6,"F1");
  col(V.blanco).textoD(595.28-M,44,TT("LOTE ","LOT ")+n,26,"F2");
  col(V.gold).rect(0,76,595.28,3);

  let y=108;
  col(V.gold).texto(M,y,T("FICHA TÉCNICA Y ANÁLISIS DEL LOTE"),8,"F2",1.3);
  col(V.ink).texto(M,y+22,T("Lote")+" "+n+" · "+fmtA(L.at)+" · "+T(EST[est].t).toUpperCase(),15,"F2");
  col(V.muted).texto(M,y+38,T("Precio")+" "+ET.l+" ("+T(ET.d)+"): "+fmtCOP(val)+"   ·   "+
    fmtCOP(val/L.at)+TT(" por m² bruto"," per gross m²"),9.4,"F1");
  y+=56;

  /* ---------- planta ---------- */
  const px0=M, py0=y, pw=286, ph=232;
  col(V.claro).rect(px0,py0,pw,ph);
  col(V.line,1).grosor(.6).rect(px0,py0,pw,ph,"S");
  y=py0;
  /* la planta se dibuja en su propia función para no ensuciar */
  dibujarPlantaPDF(P,V,L,A,casa,px0,py0,pw,ph);

  /* ---------- datos ---------- */
  const dx=M+pw+18, dw=595.28-M-dx;
  let dy=py0+4;
  const fila=(k,v,neg)=>{
    col(V.muted).texto(dx,dy,k,8.6,"F1");
    col(V.ink).textoD(dx+dw,dy,v,9.4,neg?"F2":"F1");
    dy+=7; col(V.line,1).grosor(.4).linea(dx,dy,dx+dw,dy); dy+=10;
  };
  col(V.gold).texto(dx,dy,T("ÁREAS Y MEDIDAS"),7.6,"F2",1.1); dy+=14;
  fila(T("Área total"),fmtA(L.at),1);
  fila(T("Área útil"),fmtA(L.ut),1);
  fila(T("Área de protección"),fmtA(L.pr));
  fila(T("Frente sobre vía"),(A.fr!=null?dec(A.fr,1):"—")+" m");
  /* Un lote puede tener lindero sobre vía en más de un tramo —esquinero o
     pasante—. Publicar sólo el tramo mayor deja por fuera frente que existe,
     así que los demás van en su propio renglón, con el mismo criterio en los
     86 lotes. */
  if(A.frx && A.frx.length)
    fila(T("Otro frente sobre vía"), A.frx.map(v=>dec(v,1)).join(" + ")+" m");
  fila(T("Fondo"),(A.fo!=null?dec(A.fo,1):"—")+" m");
  dy+=6; col(V.gold).texto(dx,dy,T("TERRENO"),7.6,"F2",1.1); dy+=14;
  /* si el lote no está levantado entero hay que decirlo aquí, que es la hoja
     que se entrega, y no dejarlo sólo en la pantalla */
  /* las mismas cuatro filas en los 86 lotes y en el mismo orden, para que dos
     fichas se puedan poner una al lado de la otra y comparar renglón a renglón */
  fila(T("Cota"), cotaTxt(A));
  fila(T("Pendiente media"), pendTxt(A));
  fila(T("Área levantada"),
       ent(A.am2!=null?A.am2:L.at)+" m² "+TT("de","of")+" "+ent(L.at)+" m² ("+
       Math.round((A.cob!=null?A.cob:1)*100)+" %)", (A.cob!=null && A.cob<0.98)?1:0);
  /* DOS COSAS DISTINTAS, Y ANTES SE PUBLICABA UNA CON EL NOMBRE DE LA OTRA.
     · Área construible: el tope normativo del proyecto, 30 % del área útil.
       Es lo que el comprador puede construir.
     · Suelo tras aislamientos: el polígono que queda al descontar 3 m a cada
       vecino, 10 m de antejardín y las fajas. Es dónde puede pararse la casa,
       no cuánto puede construir, y es del orden del doble del anterior.
     Publicar el segundo con el nombre del primero prometía más de lo que la
     norma permite: en el lote 44 decía 2.025 m² cuando el tope son 948 m². */
  fila(T("Área construible (30 % del área útil)"), ent(OCUP30(L))+" m²", 1);
  fila(T("Suelo tras aislamientos"), A.cm2?ent(A.cm2)+" m²":"—");
  const CIf = casa ? casaIA(n) : null;
  if(CIf){
    dy+=6; col(V.gold).texto(dx,dy,TT("CASA PROPUESTA","PROPOSED HOUSE","MAISON PROPOSÉE"),7.6,"F2",1.1); dy+=14;
    fila(T("Modelo"), TT("Diseñada con el cliente","Designed with the client","Conçue avec le client")+" · "+
         (CIf.pisos===2 ? TT("dos pisos","two storeys","deux niveaux") : TT("un piso","one storey","un niveau")), 1);
    fila(TT("Área construida","Built area","Surface bâtie"), ent(CIf.construida)+" m²  ·  "+TT("tope","cap","plafond")+" "+ent(OCUP30(L))+" m²", 1);
    fila(TT("Huella en planta","Footprint","Emprise"), ent(CIf.huella)+" m²");
    if(CIf.piscina) fila(TT("Piscina","Pool","Piscine"), ent(CIf.piscina)+" m²");
    if(CIf.construida > OCUP30(L))
      fila(TT("Atención","Note","Attention"),
           TT("excede el 30 % en "+ent(CIf.construida-OCUP30(L))+" m²",
              "exceeds the 30% cap by "+ent(CIf.construida-OCUP30(L))+" m²",
              "dépasse les 30 % de "+ent(CIf.construida-OCUP30(L))+" m²"), 1);
    fila(T("Nivel de acceso"),dec(casa.z,2)+" m");
    fila(TT("Corte y lleno (envolvente)","Cut and fill (envelope)","Déblai / remblai (enveloppe)"),casa.co+" m³"+(casa.ll?" / "+casa.ll+" m³":""));
    fila(T("Eje largo"),ej.rumbo.toFixed(0)+"°");
  }
  else if(casa){
    dy+=6; col(V.gold).texto(dx,dy,T("VOLUMEN DE PRUEBA"),7.6,"F2",1.1); dy+=14;
    fila(T("Modelo"), T(casa.mod==="2p" ? "Dos niveles (uno semienterrado)" : "Un solo piso"), 1);
    fila(T("Huella"), dec(casa.L,1)+" × "+dec(casa.A,1)+" m"+
                   (casa.mod==="2p" ? "  ·  "+ent(casa.an)+" m² × 2" : "  ·  "+ent(casa.at)+" m²"));
    /* red de seguridad: si el volumen de prueba se pasara del tope del 30 %,
       la ficha lo tiene que decir y no dejarlo implícito. Hoy no se dispara en
       ninguno de los 86, y por eso mismo conviene que quede puesto. */
    if(casa.at > OCUP30(L))
      fila(TT("Atención","Note","Attention"),
           TT("la huella pasa del 30 % del área útil ("+ent(OCUP30(L))+" m²)",
              "footprint exceeds 30% of the usable area ("+ent(OCUP30(L))+" m²)",
              "l'emprise dépasse 30 % de la surface utile ("+ent(OCUP30(L))+" m²)"), 1);
    fila(T("Nivel de acceso"),dec(casa.z,2)+" m");
    if(casa.mod==="2p") fila(T("Nivel −1"),dec(casa.zm,2)+" m");
    fila(T("Altura sobre el acceso"),dec(5,1)+" m");
    fila(casa.mod==="2p"?T("Excavación"):T("Corte y lleno"),casa.co+" m³"+(casa.ll?" / "+casa.ll+" m³":""));
    fila(T("Eje largo"),ej.rumbo.toFixed(0)+"°");
  }

  /* ---------- pendientes ---------- */
  /* arranca debajo de lo que termine más abajo: el dibujo o la columna de datos */
  y=Math.max(py0+ph, dy+2)+20;
  const parcial = (A.cob!=null && A.cob<0.98);
  col(V.gold).texto(M,y,T("CÓMO SE REPARTE LA PENDIENTE")+
    (parcial ? TT("  ·  SÓLO SOBRE LOS "+ent(A.am2||0)+" M² LEVANTADOS",
                  "  ·  OVER THE "+ent(A.am2||0)+" M² SURVEYED ONLY",
                  "  ·  SUR LES "+ent(A.am2||0)+" M² LEVÉS SEULEMENT") : ""),7.6,"F2",1.1); y+=16;
  /* "Muy pendiente" es más ancha que "Escarpado": la columna del nombre pasa de
     58 a 78 pt y la barra arranca 22 pt más allá. Con los 58 de antes el nombre
     se montaba encima del rango y salía "Muy pendientemás de 25 %". */
  const bw=595.28-2*M-260;
  CLASES.forEach((c,i)=>{
    const p=A.r[i]?A.r[i][0]:0, m2v=A.r[i]?A.r[i][1]:0;
    col(V.ink).texto(M,y+7,TP(c[0]),8.6,"F2");
    col(V.muted).texto(M+78,y+7,T(c[1]),8,"F1");
    col([232,230,220]).rect(M+142,y+1,bw,8);
    const cc=c[2].replace("#",""), rr=parseInt(cc.slice(0,2),16),gg=parseInt(cc.slice(2,4),16),bb=parseInt(cc.slice(4,6),16);
    col([rr,gg,bb]).rect(M+142,y+1,Math.max(1,bw*p/100),8);
    col(V.ink).textoD(595.28-M,y+7.5,dec(p,1)+" %  ·  "+ent(m2v)+" m²",8.6,"F1");
    y+=14;
  });
  /* La franja declarada, aparte y con la barra rayada: no es una clase medida */
  if(parcial){
    const m2Decl = Math.max(0, L.at-(A.am2||0));
    y+=3; col(V.line,1).grosor(.5).raya(2,2).linea(M,y,595.28-M,y); P.raya(0); y+=6;
    col(V.ink).texto(M,y+7,T("Sin levantar"),8.6,"F2");
    col(V.muted).texto(M+78,y+7,TT("15 – 25 % decl.","15–25% decl.","15 – 25 % décl."),8,"F1");
    col([248,240,224]).rect(M+120,y+1,bw,8);
    col([196,138,42],1).grosor(1.1);
    for(let xr=M+120; xr<M+120+bw; xr+=3.4){
      const x2=Math.min(xr+3.4, M+120+bw), dy=(x2-xr)*8/3.4;
      P.linea(Math.max(xr,M+120), y+9, x2, y+9-dy);
    }
    col([138,95,20],1).grosor(.4).rect(M+120,y+1,bw,8,"S");
    col(V.ink).textoD(595.28-M,y+7.5,ent(m2Decl)+" m²",8.6,"F1");
    y+=15;
  }

  /* El aviso va pegado a las barras, no en el pie: quien lee la hoja impresa
     tiene que ver junto a las cifras de dónde sale cada una. */
  if(parcial){
    y+=7;
    col([140,96,34]);
    y = envolver(P, TT(
      "Los "+ent(L.at-(A.am2||0))+" m² restantes no tienen curvas de nivel: van rayados en la planta, con "+
      "pendiente de más del 25 % declarada en campo por la gerencia técnica, no medida con topografía. No "+
      "entran en los porcentajes de arriba; hay que levantar esa franja antes de escriturar.",
      "The remaining "+ent(L.at-(A.am2||0))+" m² have no contours: they show hatched on the plan, as steep "+
      "ground (15–25%) declared on site by technical management, not measured by survey. They are excluded "+
      "from the percentages above; that strip must be surveyed before closing.",
      "Les "+ent(L.at-(A.am2||0))+" m² restants n'ont pas de courbes : hachurés sur le plan, en forte pente "+
      "(15–25 %) déclarée sur le terrain par la direction technique, non mesurée par levé. Ils n'entrent pas "+
      "dans les pourcentages ci-dessus ; il faut lever cette bande avant de conclure."),
      M, y, 595.28-2*M, 6.6, 8);
    y+=3;
  }

  /* ---------- sol ---------- */
  /* EL PIE SE RESERVA ANTES DE PINTAR NADA ENCIMA.
     Antes el bloque del sol se dibujaba a tamaño fijo y el pie se pintaba
     después, en un y fijo: cuando el pie creció a cuatro líneas, la leyenda de
     la rosa y el pie se escribían uno encima del otro. Ahora se mide cuánto
     ocupa el pie, se sabe dónde empieza, y la rosa se dibuja del tamaño que
     quepa por encima. */
  const TXT_PIE = TT(
      "Geometría del plano 039 (09-09-2026), MAGNA-SIRGAS / Origen Nacional CTM12. Pendientes y cotas del modelo "+
      "digital del terreno hecho con las curvas cada 1 m del levantamiento. El volumen de prueba es un ejercicio de "+
      "escala, no un diseño: respeta 3 m de aislamiento, 10 m de antejardín, las fajas de protección y 5 m de altura. "+
      "En los lotes que arrancan en pendiente va en dos niveles, el de abajo enterrado contra la ladera, para que "+
      "desde la vía se lea un solo piso. Precios de trabajo; no es oferta comercial.",
      "Geometry from drawing 039 (09-09-2026), MAGNA-SIRGAS / Origen Nacional CTM12. Slopes and elevations come "+
      "from the digital terrain model built with the 1 m contours of the survey. The test volume is an exercise in "+
      "scale, not a design: it respects 3 m setbacks, a 10 m front yard, the protection strips and a 5 m height "+
      "limit. On lots that start on a slope it goes on two levels, the lower one buried against the hillside, so "+
      "that a single storey reads from the road. Working prices; this is not a commercial offer.");
  const W_PIE = 595.28-2*M-96;
  const ALTO_PIE = lineasEnvolver(TXT_PIE, W_PIE, 6.6) * 8.6;
  const PIE_Y = 841.89 - 26 - ALTO_PIE;      /* que el pie termine 26 pt sobre el borde */

  /* ¿Cabe el bloque del sol en lo que queda de esta hoja?
     La rosa mínima legible son 74 pt, más 37 de leyenda y 12 del título; la
     columna de la derecha necesita unos 110. En los seis lotes sin levantar la
     hoja lleva una fila y un aviso de más y ya no cabe: MEDIDO en el lote 66,
     el texto del veredicto caía sobre la raya del pie. Cuando no cabe, el sol
     se va a su propia hoja en vez de encimarse. */
  const TOPE_SOL = PIE_Y - 16;
  const NECESITA_SOL = 12 + 74 + 37 + 8 + 20;
  const solAparte = (TOPE_SOL - y) < NECESITA_SOL;
  if(!solAparte) bloqueSolPDF(P,V,M,y,PIE_Y,ej,ver,parcial);

  /* ---------- pie ---------- */
  const py=PIE_Y;
  col(V.line,1).grosor(.5).linea(M,py-12,595.28-M,py-12);
  col(V.muted);
  envolver(P, TXT_PIE, M, py, W_PIE, 6.6, 8.6);
  col(V.forest).textoD(595.28-M,py,T("Generado el")+" "+new Date().toLocaleDateString(LOC()),6.8,"F2");

  /* la hoja del sol, sólo cuando no cupo arriba */
  let HOJA_SOL=null;
  if(solAparte){
    HOJA_SOL=PDFmin.Hoja(595.28,841.89);
    const c2=(c,f)=>f?HOJA_SOL.trazo(c[0],c[1],c[2]):HOJA_SOL.color(c[0],c[1],c[2]);
    c2(V.forest).rect(0,0,595.28,56);
    const xt2=logoEnBanda(HOJA_SOL,M,28.0,24);
    c2([200,214,192]).texto(xt2,32,TT("El sol sobre el lote","The sun over the lot",
      "Le soleil sur le lot"),8.4,"F1");
    c2(V.blanco).textoD(595.28-M,34,(TT("LOTE ","LOT "))+n,20,"F2");
    c2(V.gold).rect(0,56,595.28,2.5);
    bloqueSolPDF(HOJA_SOL,V,M,74,800,ej,ver,false);
    c2(V.line,1).grosor(.5).linea(M,806,595.28-M,806);
    c2(V.muted).texto(M,818,TT(
      "El recorrido del sol sale de la latitud del predio, 4,47° norte. En esta hoja va aparte porque en la ficha no cabía.",
      "The sun path comes from the site latitude, 4.47° north. It sits on its own page because it did not fit on the data sheet.",
      "La course du soleil vient de la latitude du site, 4,47° nord."),6.6,"F1");
  }

  const hojas=[hojaPortadaPDF(n,L,A,casa,V), P];
  if(HOJA_SOL) hojas.push(HOJA_SOL);
  if(casa && casaIA(n)) hojas.push(hojaPropuestaPDF(n,L,A,V));
  if(casa && casaIA(n) && (casaIA(n).espacios||[]).length) hojas.push(hojaPlantaPDF(n,L,A,V));
  if(casa && casaIA(n) && RENDER_PDF[n]){ const hr=hojaRenderPDF(n,L,A,V); if(hr) hojas.push(hr); }
  if(casa){ hojas.push(hojaIsoPDF(n,L,A,casa,V)); hojas.push(hojaSolarPDF(n,L,A,casa,ej,V)); }
  if(esTerraza(n)) hojas.push(hojaTerrazaPDF(n,L,V));
  hojas.push(hojaComercialPDF(n,L,V));
  hojas.push(hojaCuotasPDF(n,L,V));
  hojas.push(hojaSalvedadPDF(n,L,V));   /* la salvedad cierra siempre */
  return PDFmin.archivo(hojas);
}

/* =========================================================================
   RENDERIZAR — la imagen entra pixelada y va enfocando, como un motor que
   calcula por pasadas. No es un render de verdad calculándose: es la imagen
   final revelándose por niveles de resolución, que es como se ve un render
   progresivo. Se dice así en el pie, sin vender humo.
   ========================================================================= */
function abrirRender(n){
  const R = (typeof RENDERS!=="undefined") ? RENDERS[String(n)] : null;
  if(!R) return;
  const cont=document.getElementById("renHueco");
  if(!cont) return;
  cont.innerHTML='<div class="renWrap">'+
      '<canvas></canvas><img alt="'+T("Render de la casa sobre el lote")+' '+n+'">'+
      '<div class="renPie">'+T("Calculando…")+'</div>'+
      '<div class="renBar"><i></i></div></div>';
  const wrap=cont.querySelector(".renWrap");
  const cv=wrap.querySelector("canvas"), img=wrap.querySelector("img");
  const pie=wrap.querySelector(".renPie"), bar=wrap.querySelector(".renBar i");
  const src=new Image();
  src.onload=()=>{
    const W=src.naturalWidth, H=src.naturalHeight;
    cv.width=Math.min(W,1280); cv.height=Math.round(cv.width*H/W);
    const x=cv.getContext("2d");
    /* pasadas: de 12 px de ancho hasta el tamaño del lienzo */
    const pasos=[8,13,20,32,50,80,128,206,330,528,cv.width];
    let i=0;
    const off=document.createElement("canvas");
    const oc=off.getContext("2d");
    x.imageSmoothingEnabled=false;
    (function pasada(){
      if(i>=pasos.length){
        img.src=src.src; img.classList.add("listo");
        bar.style.width="100%";
        pie.textContent=T("Render terminado"); pie.classList.add("fin");
        setTimeout(()=>{ pie.textContent=R.pie||T("Casa 30JB sobre el lote")+" "+n; },1600);
        return;
      }
      const w=pasos[i], h=Math.max(1,Math.round(w*H/W));
      off.width=w; off.height=h;
      oc.imageSmoothingEnabled=true;
      oc.drawImage(src,0,0,w,h);
      x.imageSmoothingEnabled=false;
      x.drawImage(off,0,0,w,h,0,0,cv.width,cv.height);
      bar.style.width=Math.round((i+1)/pasos.length*100)+"%";
      pie.textContent=T("Calculando…")+"  "+w+"×"+h;
      i++;
      setTimeout(pasada, i<3?420:(i<7?330:250));
    })();
  };
  src.onerror=()=>{ pie.textContent=T("No se pudo cargar el render."); };
  src.src=R.img;
  wrap.scrollIntoView({behavior:"smooth",block:"center"});
}

/* --------- tercera hoja: el valor comercial, etapa por etapa --------- */
/* =========================================================================
   HOJA DE CUOTAS
   La hoja comercial da el resumen —inicial, saldo, cuota— pero el cliente lo
   que pregunta es "¿cuánto pago en marzo?". Esto es el calendario: las 24
   fechas con su valor y el saldo que va quedando, para la etapa escogida.
   Nada se estima: sale de planPago(), la misma función del simulador, y al
   final se comprueba que inicial + cuotas dé exactamente el precio.
   ========================================================================= */
const MESES_ES=["enero","febrero","marzo","abril","mayo","junio","julio",
                "agosto","septiembre","octubre","noviembre","diciembre"];
const MESES_EN=["January","February","March","April","May","June","July",
                "August","September","October","November","December"];
const MESES_FR=["janvier","février","mars","avril","mai","juin","juillet",
                "août","septembre","octobre","novembre","décembre"];
function mesDe(i){                       /* i = 0 -> enero de 2027 */
  const m=i%12, a=2027+Math.floor(i/12);
  const nom=TT(MESES_ES[m],MESES_EN[m],MESES_FR[m]);
  return TT(nom+" "+a, nom+" "+a, nom+" "+a);
}

/* =========================================================================
   HOJA PDF · VIVIENDA EN TERRAZA  (sólo lotes 47 a 53)
   El cliente se lleva el PDF, no la pantalla. Si la explicación de por qué en
   estos lotes hay que escalonar sólo vive en el navegador, el que decide en la
   casa con la ficha impresa no la tiene. Esta hoja lleva lo mismo: las cifras
   medidas del lote, la comparación contra la plataforma única y los dos cortes.
   ========================================================================= */
function hojaTerrazaPDF(n,L,V){
  const P=PDFmin.Hoja(595.28,841.89), M=38, W=595.28;
  const col=(c,f)=>f?P.trazo(c[0],c[1],c[2]):P.color(c[0],c[1],c[2]);
  const D=datosTerraza(n);
  if(!D) return P;

  col(V.forest).rect(0,0,W,66);
  const xt = logoEnBanda(P, M, 33.0, 28);
  col([200,214,192]).texto(xt,37,TT("Vivienda en terraza","Terraced house","Maison en terrasses"),8.4,"F1");
  col(V.blanco).textoD(W-M,34,TT("LOTE ","LOT ")+n,20,"F2");
  col(V.gold).rect(0,66,W,2.5);

  let y=100;
  col(V.gold).texto(M,y,TT("POR QUÉ ESTE LOTE NO SE RESUELVE CON UNA SOLA PLATAFORMA",
                           "WHY THIS LOT CANNOT BE SOLVED WITH A SINGLE PLATFORM",
                           "POURQUOI CE LOT NE SE RÉSOUT PAS SUR UNE SEULE PLATEFORME"),7.6,"F2",1.1);
  y+=16;
  col(V.ink||[40,48,38]);
  y=envolver(P, TT(
    "Sobre el área útil medida de este lote quedan "+ent(D.plano)+" m² por debajo del 5 % de "+
    "pendiente y "+ent(D.escarp)+" m² por encima del 25 %. La pendiente media medida del área útil "+
    "es del "+dec(D.pend,1)+" %. Una casa de una sola plataforma tendría que abrir un solo banco "+
    "para toda el área, y ahí el corte se va a metros. Los dos modelos de abajo reparten ese "+
    "desnivel en vez de pelearse con él.",
    "On this lot\u2019s measured usable area, "+ent(D.plano)+" m² fall below 5% slope and "+
    ent(D.escarp)+" m² exceed 25%. The measured mean slope of the usable area is "+dec(D.pend,1)+
    "%. A single-platform house would have to open one bench for the whole area.",
    "Sur la surface utile mesurée, "+ent(D.plano)+" m² sont sous 5 % de pente et "+ent(D.escarp)+
    " m² dépassent 25 %. La pente moyenne mesurée est de "+dec(D.pend,1)+" %."),
    M, y, W-2*M, 8.2, 11); y+=12;

  /* ---- la comparación ---- */
  const cx=[M, M+232, M+330, M+430], anchoT=W-2*M;
  col(V.gold).texto(cx[0],y,TT("MANERA DE CONSTRUIR","HOW IT IS BUILT","MANIÈRE DE CONSTRUIRE"),6.8,"F2",1.0);
  col(V.gold).texto(cx[1],y,TT("ÁREA","AREA","SURFACE"),6.8,"F2",1.0);
  col(V.gold).texto(cx[2],y,TT("CORTE MÁX.","MAX. CUT","DÉBLAI MAX."),6.8,"F2",1.0);
  col(V.gold).texto(cx[3],y,TT("TIERRA MOVIDA","EARTH MOVED","TERRE DÉPLACÉE"),6.8,"F2",1.0);
  y+=6; col(V.line,1).grosor(.6).linea(M,y,W-M,y); y+=13;

  const fila=(a,b,c,d,fuerte,rojo)=>{
    col(rojo?[163,84,63]:(fuerte?V.forest:[60,70,58]));
    P.texto(cx[0],y,a,8.2,fuerte?"F2":"F1");
    P.texto(cx[1],y,b,8.2,"F1");
    P.texto(cx[2],y,c,8.2,fuerte?"F2":"F1");
    P.texto(cx[3],y,d,7.6,"F1");
    y+=7; col(V.line,1).grosor(.4).linea(M,y,W-M,y); y+=12;
  };
  if(D.plana)
    fila(TT("Una sola plataforma","Single platform","Plateforme unique"),
         ent(D.plana.area)+" m²",
         dec(D.pend/100*Math.sqrt(D.plana.area)/2,2)+" m",
         ent(D.plana.co)+" m³ "+T("de corte")+" + "+ent(D.plana.ll)+" m³ "+T("de lleno"),
         false, true);
  else
    fila(TT("Una sola plataforma","Single platform","Plateforme unique"),
         TT("no cabe","does not fit","ne tient pas"), "—", "—", false, true);
  fila("T1 · "+TT("Bancal","Bench","Banquette"), ent(D.t1.area)+" m²",
       dec(D.t1.corte,2)+" m",
       ent(D.t1.vol)+" m³ "+T("de corte")+" + "+ent(D.t1.vol)+" m³ "+T("de lleno"), true);
  fila("T2 · "+TT("Mirador","Overlook","Belvédère"), ent(D.t2.area)+" m²",
       dec(TZ.piso,2)+" m", ent(D.t2.vol)+" m³ "+T("de corte"), true);

  /* ---- los dos cortes ---- */
  const dibujo=(modo, yTop, titulo, alto, pie)=>{
    const G=geomTerraza(n, modo);
    col(V.gold).texto(M,yTop,titulo,7.4,"F2",1.0);
    const y0=yTop+8, gw=W-2*M, gh=alto;
    col([246,244,236]).rect(M,y0,gw,gh);
    if(!G){ col(V.muted).texto(M+8,y0+gh/2,T("No se pudo dibujar el corte."),7.4,"F1"); return yTop+8+gh+8; }
    const X=t=>M+(t-G.tA)/(G.tB-G.tA)*gw;
    const Y=z=>y0+(G.zmax-z)/(G.zmax-G.zmin)*gh;
    /* terreno natural, relleno y punteado */
    const pts=G.muestras.map(([t,z])=>[X(t),Y(z)]);
    col([225,229,213]).poli(pts.concat([[X(G.tB),y0+gh],[X(G.tA),y0+gh]]),"f",true);
    col([60,70,58],1).grosor(1.0);
    for(let i=0;i<pts.length-1;i+=2)
      P.linea(pts[i][0],pts[i][1],pts[i+1][0],pts[i+1][1]);
    /* Corte y lleno, cuerpo a cuerpo: sin esto la casa parece flotar sobre la
       ladera y no se entiende de dónde salen los metros cúbicos de la tabla. */
    G.cuerpos.forEach(q=>{
      if(modo==="t2" && q.rot==="N0") return;
      const dentro=G.muestras.filter(([t])=>t>=q.ta&&t<=q.tb);
      if(dentro.length<2) return;
      const banda=(arriba,c)=>{
        const ps=[[X(dentro[0][0]),Y(q.npt)]];
        dentro.forEach(([t,z])=> ps.push([X(t), Y(arriba?Math.max(z,q.npt):Math.min(z,q.npt))]));
        ps.push([X(dentro[dentro.length-1][0]),Y(q.npt)]);
        col(c).poli(ps,"f",true);
      };
      banda(true,[214,176,162]);       /* corte */
      banda(false,[186,210,192]);      /* lleno */
    });
    /* los cuerpos de la casa */
    G.cuerpos.forEach(q=>{
      const xa=X(q.ta), xb=X(q.tb), yt=Y(q.npt+q.alto), yb=Y(q.npt);
      const bajo=(modo==="t2" && q.rot==="N−1");
      col(bajo?[196,203,186]:V.forest).rect(xa,yt,xb-xa,yb-yt);
      col([36,48,32],1).grosor(.8).rect(xa,yt,xb-xa,yb-yt,"S");
      if(xb-xa>22){ col(bajo?[36,48,32]:V.blanco);
        P.texto((xa+xb)/2-6, (yt+yb)/2+3, q.rot, 6.8, "F2"); }
    });
    col(V.muted).texto(M+3,y0+gh-4,rumboTxt((G.az+180)%360),6.2,"F1");
    col(V.muted).textoD(W-M-3,y0+gh-4,rumboTxt(G.az),6.2,"F1");
    let yy=y0+gh+10;
    col(V.muted); yy=envolver(P, pie, M, yy, W-2*M, 7.0, 9.2);
    return yy+8;
  };

  y+=4;
  y=dibujo("t1", y,
    "T1 · "+TT("BANCAL","BENCH","BANQUETTE")+" — "+ent(D.t1.area)+" m² "+
      TT("en tres plataformas","on three platforms","sur trois plateformes"),
    150,
    TT("Tres plataformas de "+dec(D.t1.a,1)+" × "+dec(D.t1.p,1)+" m, cada una "+dec(D.t1.esc,2)+
       " m más abajo que la anterior. El fondo sale de la pendiente medida del lote, de manera que "+
       "el escalón quede en el metro y medio: por eso el corte máximo es de "+dec(D.t1.corte,2)+
       " m y el lleno el mismo, y la tierra que sale de un bancal entra en el siguiente sin salir "+
       "del lote. La cubierta de cada bancal es la terraza del de arriba.",
       "Three platforms of "+dec(D.t1.a,1)+" × "+dec(D.t1.p,1)+" m, each "+dec(D.t1.esc,2)+
       " m below the previous one. Maximum cut "+dec(D.t1.corte,2)+" m, fill the same.",
       "Trois plateformes de "+dec(D.t1.a,1)+" × "+dec(D.t1.p,1)+" m. Déblai max. "+
       dec(D.t1.corte,2)+" m."));
  y=dibujo("t2", y,
    "T2 · "+TT("MIRADOR","OVERLOOK","BELVÉDÈRE")+" — "+ent(D.t2.area)+" m² "+
      TT("en dos pisos","on two floors","sur deux niveaux"),
    150,
    TT("Dos niveles de "+dec(D.t2.a,1)+" × "+dec(D.t2.F,1)+" m, uno sobre otro, con "+dec(TZ.piso,2)+
       " m entre pisos. El de arriba entra a nivel desde la vía; el de abajo va contra la ladera por "+
       "el lado alto y sale a la luz por el bajo. El fondo de "+dec(D.t2.F,1)+" m es justamente el "+
       "que hace falta para que eso ocurra con la pendiente medida de este lote. La losa que vuela "+
       dec(TZ.volado,1)+" m es la terraza, "+ent(D.t2.terraza)+" m² mirando al valle. Estos siete "+
       "lotes son los únicos del proyecto con desnivel suficiente para ese nivel inferior.",
       "Two levels of "+dec(D.t2.a,1)+" × "+dec(D.t2.F,1)+" m, one above the other, "+dec(TZ.piso,2)+
       " m apart. The lower one is cut into the hill uphill and opens to daylight downhill.",
       "Deux niveaux de "+dec(D.t2.a,1)+" × "+dec(D.t2.F,1)+" m superposés."));

  const py=790;
  col(V.line,1).grosor(.5).linea(M,py-12,W-M,py-12);
  col(V.muted);
  envolver(P, TT(
    "Qué está medido y qué está propuesto: el terreno de los dos cortes, la pendiente, el desnivel "+
    "y la dirección de caída salen del levantamiento del plano 039 y del modelo de alturas. Las "+
    "dimensiones de los dos modelos son una propuesta de arquitectura —no hay planos aprobados de "+
    "estas dos casas— y el movimiento de tierra que se anuncia es el que resulta de posarlas sobre "+
    "ese terreno medido. Cualquier proyecto definitivo debe pasar por estudio de suelos.",
    "What is measured and what is proposed: the ground of both sections, the slope, the drop and "+
    "the fall direction come from the survey of drawing 039. The dimensions of the two models are "+
    "an architectural proposal. Any final project requires a soil study.",
    "Ce qui est mesuré et ce qui est proposé : le terrain des deux coupes vient du levé du plan 039. "+
    "Les dimensions des deux modèles sont une proposition architecturale."),
    M, py, W-2*M-96, 6.6, 8.6);
  col(V.forest).textoD(W-M,py,T("Generado el")+" "+new Date().toLocaleDateString(LOC()),6.8,"F2");
  return P;
}


/* -----------------------------------------------------------------------------
   LA SALVEDAD, EN SU PROPIA HOJA.
   Va al final de toda ficha que salga del proyecto. Se intentó primero como pie
   de la hoja de cuotas y se montaba encima de las cifras del plan de pagos: un
   texto legal pisado por un número es peor que no tenerlo. Aquí tiene su hoja,
   se lee entero y nadie puede decir que no estaba.
   --------------------------------------------------------------------------- */
function hojaSalvedadPDF(n,L,V){
  const P=PDFmin.Hoja(595.28,841.89), M=38;
  const col=(c,f)=>f?P.trazo(c[0],c[1],c[2]):P.color(c[0],c[1],c[2]);
  col(V.forest).rect(0,0,595.28,66);
  const xt = logoEnBanda(P, M, 33.0, 28);
  col([200,214,192]).texto(xt,37,T("Alcance de la información"),8.4,"F1");
  col(V.blanco).textoD(595.28-M,34,TT("LOTE ","LOT ")+n,20,"F2");
  col(V.gold).rect(0,66,595.28,2.5);

  let y=120;
  col(V.gold).texto(M,y,T("SALVEDAD Y ALCANCE DE LA INFORMACIÓN"),8,"F2",1.3); y+=26;
  col(V.ink).texto(M,y,T("Lote")+" "+n+" · "+fmtA(L.at),13,"F2"); y+=26;
  col([243,234,216]).rect(M,y-8,595.28-2*M,2);
  y+=16;
  col(V.muted);
  TT("Las \u00e1reas, cotas, pendientes, vol\u00famenes, movimientos de tierra y cualquier otra medida de esta ficha son VALORES T\u00c9CNICOS APROXIMADOS. Se obtienen de modelos digitales del terreno construidos con las curvas de nivel del levantamiento topogr\u00e1fico, que en algunos lotes cubre s\u00f3lo una parte de su superficie, y llevan las tolerancias propias de ese origen. Donde no hay levantamiento, la pendiente que se publica es un dato declarado en campo por la gerencia t\u00e9cnica del proyecto, no una medici\u00f3n de topograf\u00eda, y as\u00ed se indica en cada lote.\n\nEsta informaci\u00f3n se entrega con fines informativos y de estudio preliminar. NO constituye oferta comercial, NO reemplaza los estudios topogr\u00e1ficos, geot\u00e9cnicos, estructurales ni de dise\u00f1o que cada proyecto requiera, y NO VINCULA NI COMPROMETE a los desarrolladores de Laureles Campestre, ni a sus asesores comerciales, a ning\u00fan resultado, obligaci\u00f3n, garant\u00eda ni responsabilidad derivada de su uso o interpretaci\u00f3n.\n\nAntes de cualquier decisi\u00f3n de compra, de dise\u00f1o o de construcci\u00f3n, el interesado debe verificar en campo las condiciones reales del lote y contratar los estudios de detalle correspondientes. Toda negociaci\u00f3n se formaliza \u00fanicamente en la promesa de compraventa y en la escritura p\u00fablica, documentos que prevalecen sobre cualquier cifra contenida en esta ficha.", "The areas, elevations, slopes, volumes, earthworks and any other measurement in this sheet are APPROXIMATE TECHNICAL VALUES derived from digital terrain models built with the survey contour lines, which on some lots cover only part of the area, and they carry the tolerances inherent to that origin. Where there is no survey, the published slope is a value declared in the field by the project's technical management, not a topographic measurement, and each lot says so.\n\nThis information is provided for information and preliminary study. It is NOT a commercial offer, it does NOT replace the topographic, geotechnical, structural or design studies each project requires, and it does NOT BIND OR COMMIT the developers of Laureles Campestre, or their sales agents, to any result, obligation, warranty or liability arising from its use or interpretation.\n\nBefore any purchase, design or construction decision, the interested party must verify the actual lot conditions on site and commission the corresponding detailed studies. Any transaction is formalised solely in the promise of sale and the public deed, which prevail over any figure in this sheet.", "Les surfaces, altitudes, pentes, volumes et terrassements de cette fiche sont des VALEURS TECHNIQUES APPROXIMATIVES issues de mod\u00e8les num\u00e9riques de terrain, dont le lev\u00e9 ne couvre qu'une partie de certains lots.\n\nCes informations sont fournies \u00e0 titre informatif et d'\u00e9tude pr\u00e9liminaire. Elles ne constituent pas une offre commerciale, ne remplacent aucune \u00e9tude de d\u00e9tail et N'ENGAGENT NI NE LIENT les promoteurs de Laureles Campestre \u00e0 aucun r\u00e9sultat, obligation ou responsabilit\u00e9.\n\nAvant toute d\u00e9cision, l'int\u00e9ress\u00e9 doit v\u00e9rifier sur place les conditions r\u00e9elles du lot.").split("\n\n").forEach(p=>{
    y = envolver(P, p, M, y, 595.28-2*M, 8.4, 12.6) + 12;
  });

  y += 10;
  col(V.line,1).grosor(.5).linea(M,y,595.28-M,y); y+=16;
  col(V.muted).texto(M,y,
    T("Geometría del plano 039 (09-09-2026) · MAGNA-SIRGAS / Origen Nacional CTM12"),7.4,"F1");
  y+=12;
  col(V.muted).texto(M,y, T("Generado el")+" "+new Date().toLocaleDateString(LOC()),7.4,"F1");

  const py=806;
  col(V.forest).rect(0,py-26,595.28,841.89-(py-26));
  col(V.blanco).texto(M,py-4,T("LAURELES CAMPESTRE"),10,"F2",1.4);
  col([200,214,192]).texto(M,py+10,T("El Caimo · Armenia · Quindío · Parcelación campestre"),7,"F1");
  return P;
}

function hojaCuotasPDF(n,L,V){
  const P=PDFmin.Hoja(595.28,841.89), M=38;
  const col=(c,f)=>f?P.trazo(c[0],c[1],c[2]):P.color(c[0],c[1],c[2]);

  /* La etapa que manda es la escogida en el simulador. Si es de contado no hay
     calendario que dar, así que se enseña el de la etapa financiada más cercana
     —la 2— y se dice con todas las letras que es la alternativa, no lo escogido. */
  let E = ETAPAS.find(x=>x.n===state.etapa) || ETAPAS[0];
  let pp = planPago(L, E.n);
  const eraContado = pp.contado;
  if(eraContado){
    const E2 = ETAPAS.find(x=>x.n===2);
    if(E2){ const p2=planPago(L,E2.n); if(!p2.contado){ E=E2; pp=p2; } }
  }

  col(V.forest).rect(0,0,595.28,66);
  const xt = logoEnBanda(P, M, 33.0, 28);
  col([200,214,192]).texto(xt,37,T("Plan de pagos"),8.4,"F1");
  col(V.blanco).textoD(595.28-M,34,TT("LOTE ","LOT ")+n,20,"F2");
  col(V.gold).rect(0,66,595.28,2.5);

  let y=100;
  col(V.gold).texto(M,y,T("LA ETAPA ESCOGIDA")+"  ·  "+E.l+"  ·  "+T(E.d).toUpperCase(),7.6,"F2",1.1);
  y+=16;
  if(eraContado){
    col([140,96,34]);
    y=envolver(P, TT(
      "La etapa 1 es de contado: se paga el total y no hay cuotas. Abajo va el calendario de la "+
      "etapa 2, que es la alternativa financiada más cercana, para poder comparar.",
      "Stage 1 is a cash purchase: the full amount is paid and there are no instalments. Below is "+
      "the stage 2 schedule, the nearest financed alternative, so the two can be compared.",
      "L'étape 1 est un paiement comptant : il n'y a pas de mensualités. Ci-dessous le calendrier de "+
      "l'étape 2, l'alternative financée la plus proche, pour comparer."),
      M, y, 595.28-2*M, 7.4, 10); y+=4;
  }

  /* ---- la cabecera de cifras ---- */
  const anchoCol=(595.28-2*M)/4;
  const bloque=(i,k,v,fuerte)=>{
    const x=M+i*anchoCol;
    col(V.muted).texto(x,y,k,7.4,"F1");
    col(fuerte?V.forest:V.ink).texto(x,y+15,v,13,"F2");
  };
  bloque(0,T("Precio del lote"),fmtCOP(pp.v),1);
  bloque(1,TT("Separación","Reservation deposit","Acompte de réservation"),fmtCOP(pp.separacion));
  bloque(2,TT("Cuota inicial en 2026 · "+Math.round(pp.frac*100)+" %",
              "Down payment in 2026 · "+Math.round(pp.frac*100)+"%",
              "Apport en 2026 · "+Math.round(pp.frac*100)+" %"), fmtCOP(pp.inicial));
  bloque(3,TT("Saldo a financiar","Balance financed","Solde à financer"),fmtCOP(pp.saldo));
  y+=30; col(V.line,1).grosor(.5).linea(M,y,595.28-M,y); y+=20;

  /* ---- 2026: separación y resto de la inicial ---- */
  col(V.gold).texto(M,y,TT("ANTES DE ENERO DE 2027","BEFORE JANUARY 2027","AVANT JANVIER 2027"),
    7.6,"F2",1.1); y+=15;
  const resto = pp.inicial - pp.separacion;
  const dosFilas=[
    [TT("Al separar el lote","On reserving the lot","À la réservation"), fmtCOP(pp.separacion)],
    [TT("Resto de la cuota inicial, hasta diciembre de 2026",
        "Rest of the down payment, up to December 2026",
        "Reste de l'apport, jusqu'en décembre 2026"), fmtCOP(resto)]
  ];
  dosFilas.forEach(([k,v])=>{
    col(V.ink).texto(M,y,k,8.6,"F1");
    col(V.ink).textoD(595.28-M,y,v,9.4,"F2");
    y+=6; col(V.line,1).grosor(.35).linea(M,y,595.28-M,y); y+=13;
  });
  y+=8;

  /* ---- el calendario, en dos columnas de doce ---- */
  col(V.gold).texto(M,y,TT("LAS 24 CUOTAS, MES A MES","THE 24 INSTALMENTS, MONTH BY MONTH",
    "LES 24 MENSUALITÉS, MOIS PAR MOIS"),7.6,"F2",1.1); y+=15;

  const filas=[];
  let saldo=pp.saldo;
  for(let i=0;i<pp.n;i++){
    saldo-=pp.cuota;
    filas.push([i+1, mesDe(i), pp.cuota, Math.max(0,saldo), false]);
  }
  filas.push([pp.n+1, mesDe(pp.n), pp.ultima, 0, true]);

  const anchoT=(595.28-2*M-26)/2;
  const colX=[M, M+anchoT+26];
  const y0=y;
  [0,1].forEach(c=>{
    let yy=y0;
    const x=colX[c], rNum=x+16, xMes=x+22, rCuota=x+anchoT-92, rSaldo=x+anchoT;
    col(V.muted);
    P.texto(x,yy,"#",6.5,"F2",.7);
    P.texto(xMes,yy,TT("Mes","Month","Mois"),6.5,"F2",.7);
    P.textoD(rCuota,yy,TT("Cuota","Instalment","Mensualité"),6.5,"F2",.7);
    P.textoD(rSaldo,yy,TT("Saldo","Balance","Solde"),6.5,"F2",.7);
    yy+=6; col(V.line,1).grosor(.6).linea(x,yy,x+anchoT,yy); yy+=12;
    filas.slice(c*12,(c+1)*12).forEach(([i,mes,cuota,sal,ult])=>{
      if(ult){ col([241,234,217]).rect(x-4,yy-8.5,anchoT+8,17); }
      col(V.muted).textoD(rNum,yy,String(i),7.2,"F1");
      col(ult?V.forest:V.ink).texto(xMes,yy,mes,8,ult?"F2":"F1");
      col(ult?V.forest:V.ink).textoD(rCuota,yy,fmtCOP(cuota),8.4,ult?"F2":"F1");
      col(V.muted).textoD(rSaldo,yy,sal>0.5?fmtCOP(sal):"—",7.6,"F1");
      yy+=5.5; col(V.line,1).grosor(.3).linea(x,yy,x+anchoT,yy); yy+=11.5;
    });
    if(c===1) y=yy;
  });
  y+=6;

  /* ---- la comprobación: las cifras tienen que cerrar ---- */
  const sumaCuotas = pp.cuota*pp.n + pp.ultima;
  const total = pp.inicial + sumaCuotas;
  const dif = total - pp.v;
  col(V.line,1).grosor(.5).linea(M,y,595.28-M,y); y+=16;
  col(V.gold).texto(M,y,TT("LA CUENTA CIERRA","THE FIGURES ADD UP","LE COMPTE EST BON"),7.6,"F2",1.1);
  y+=15;
  const cierre=[
    [TT("Cuota inicial en 2026","Down payment in 2026","Apport en 2026"), fmtCOP(pp.inicial)],
    [TT("23 cuotas de "+fmtCOP(pp.cuota), "23 instalments of "+fmtCOP(pp.cuota),
        "23 mensualités de "+fmtCOP(pp.cuota)), fmtCOP(pp.cuota*pp.n)],
    [TT("Cuota final de "+mesDe(pp.n), "Final instalment, "+mesDe(pp.n),
        "Dernière mensualité, "+mesDe(pp.n)), fmtCOP(pp.ultima)]
  ];
  cierre.forEach(([k,v])=>{
    col(V.muted).texto(M,y,k,8,"F1");
    col(V.ink).textoD(595.28-M,y,v,8.6,"F1");
    y+=6; col(V.line,1).grosor(.35).linea(M,y,595.28-M,y); y+=12;
  });
  col(V.forest).texto(M,y,TT("Total pagado","Total paid","Total payé"),9,"F2");
  col(V.forest).textoD(595.28-M,y,fmtCOP(total),11,"F2");
  y+=6; col(V.gold,1).grosor(.8).linea(M,y,595.28-M,y); y+=13;
  col(V.muted).texto(M,y,TT("Precio del lote en la etapa "+E.l,
    "Lot price at stage "+E.l, "Prix du lot à l'étape "+E.l),8,"F1");
  col(V.ink).textoD(595.28-M,y,fmtCOP(pp.v),8.6,"F1");
  y+=16;
  col(Math.abs(dif)<1 ? V.muted : [163,84,63]);
  y=envolver(P, (Math.abs(dif)<1
    ? TT("Diferencia: $0. La última cuota es la más alta justamente porque absorbe lo que las 23 "+
         "del 3 % dejan sin cubrir. Sin intereses ni ajuste por inflación; los valores son de "+
         "trabajo y no constituyen oferta comercial.",
         "Difference: $0. The final instalment is the largest precisely because it absorbs what the "+
         "23 instalments of 3% leave uncovered. No interest, no inflation adjustment; these are "+
         "working figures and not a commercial offer.",
         "Différence : 0 $. La dernière mensualité est la plus élevée parce qu'elle absorbe ce que "+
         "les 23 mensualités de 3 % ne couvrent pas. Sans intérêts ni indexation ; chiffres de "+
         "travail, ce n'est pas une offre commerciale.")
    : TT("Diferencia de "+fmtCOP(dif)+" entre lo pagado y el precio: revisar antes de entregar.",
         "Difference of "+fmtCOP(dif)+" between payments and price: check before delivering.",
         "Écart de "+fmtCOP(dif)+" entre les paiements et le prix : à vérifier.")),
    M, y, 595.28-2*M, 7, 9.4);

  /* ---- cuánto sale cada año: la pregunta que sigue siempre ---- */
  y+=10;
  col(V.line,1).grosor(.5).linea(M,y,595.28-M,y); y+=18;
  col(V.gold).texto(M,y,TT("CUÁNTO SALE CADA AÑO","WHAT EACH YEAR COSTS",
    "CE QUE COÛTE CHAQUE ANNÉE"),7.6,"F2",1.1); y+=18;
  const porAno=[
    [2026, pp.inicial],
    [2027, pp.cuota*12],
    [2028, pp.cuota*11 + pp.ultima]
  ];
  const maxA=Math.max(...porAno.map(a=>a[1]));
  const bwA=(595.28-2*M-2*18)/3, baseA=y+62;
  porAno.forEach(([a,v],i)=>{
    const h=Math.max(5,(v/maxA)*50), x=M+i*(bwA+18);
    col(i===0?V.forest:[176,190,168]).rect(x,baseA-h,bwA,h);
    col(V.muted).texto(x,baseA+12,String(a),8,"F2");
    col(i===0?V.forest:V.ink).texto(x,baseA-h-6,fmtCOP(v),8.4,"F2");
  });
  y=baseA+24;
  col(V.muted);
  y=envolver(P, TT(
    "2026 es la cuota inicial completa —"+fmtCOP(pp.separacion)+" al separar y el resto antes de "+
      "diciembre—. 2027 son doce cuotas iguales. 2028 son once iguales más la final de "+
      fmtCOP(pp.ultima)+".",
    "2026 is the full down payment — "+fmtCOP(pp.separacion)+" on reserving and the rest before "+
      "December. 2027 is twelve equal instalments. 2028 is eleven equal ones plus the final "+
      fmtCOP(pp.ultima)+".",
    "2026, c'est l'apport complet — "+fmtCOP(pp.separacion)+" à la réservation et le reste avant "+
      "décembre. 2027, douze mensualités égales. 2028, onze égales plus la dernière de "+
      fmtCOP(pp.ultima)+"."),
    M, y, 595.28-2*M, 7, 9.4);

  /* ---------------- pie ---------------- */
  const py=806;
  col(V.forest).rect(0,py-26,595.28,841.89-(py-26));
  col(V.blanco).texto(M,py-4,T("LAURELES CAMPESTRE"),10,"F2",1.4);
  col([200,214,192]).texto(M,py+10,T("El Caimo · Armenia · Quindío · Parcelación campestre"),7,"F1");
  col([200,214,192]).textoD(595.28-M,py+10,
    T("Generado el")+" "+new Date().toLocaleDateString(LOC()),6.8,"F2");
  return P;
}

function hojaComercialPDF(n,L,V){
  const P=PDFmin.Hoja(595.28,841.89), M=38;
  const col=(c,f)=>f?P.trazo(c[0],c[1],c[2]):P.color(c[0],c[1],c[2]);
  const est=estadoDe(L);

  col(V.forest).rect(0,0,595.28,66);
  const xt = logoEnBanda(P, M, 33.0, 28);
  col([200,214,192]).texto(xt,37,T("Valor comercial"),8.4,"F1");
  col(V.blanco).textoD(595.28-M,34,TT("LOTE ","LOT ")+n,20,"F2");
  col(V.gold).rect(0,66,595.28,2.5);

  let y=100;
  col(V.gold).texto(M,y,T("EL LOTE"),7.6,"F2",1.1); y+=16;
  const anchoCol=(595.28-2*M)/4;
  const bloque=(i,k,v)=>{
    const x=M+i*anchoCol;
    col(V.muted).texto(x,y,k,7.4,"F1");
    col(V.ink).texto(x,y+15,v,13,"F2");
  };
  bloque(0,T("Área total"),fmtA(L.at));
  bloque(1,T("Área útil"),fmtA(L.ut));
  bloque(2,T("Área de protección"),fmtA(L.pr));
  bloque(3,T("Estado"),T(EST[est].t));
  y+=30; col(V.line,1).grosor(.5).linea(M,y,595.28-M,y); y+=22;

  /* ---- tabla de etapas ---- */
  col(V.gold).texto(M,y,T("PRECIO SEGÚN LA ETAPA Y LA FORMA DE PAGO"),7.6,"F2",1.1); y+=16;
  /* Las dos columnas del medio son la lista de precios de verdad: lo que vale el
     metro útil y el metro de protección en cada etapa. Antes sólo salía el total
     y un $/m² útil deducido de dividir, que no es la tarifa: incluye repartida
     la faja de protección y por eso nunca coincide con la lista. */
  const xEt=M, xFp=M+42;
  const rUt=M+286, rPr=M+372, rPre=M+458, rBr=595.28-M;
  const cab=[[T("Etapa"),xEt,0],[T("Forma de pago"),xFp,0],
             [T("$/m² útil"),rUt,1],[T("$/m² protección"),rPr,1],
             [T("Precio"),rPre,1],[T("$/m² bruto"),rBr,1]];
  col(V.muted);
  cab.forEach(([t,x,der])=>{ if(der) P.textoD(x,y,t,6.5,"F2",.7); else P.texto(x,y,t,6.5,"F2",.7); });
  y+=6; col(V.line,1).grosor(.6).linea(M,y,595.28-M,y); y+=13;

  ETAPAS.forEach(E=>{
    const v=precio(L,E.n), actual=(E.n===state.etapa);
    if(actual){ col([241,234,217]).rect(M-6,y-9,595.28-2*M+12,20); }
    col(actual?V.forest:V.ink).texto(xEt,y,E.l,9,"F2");
    col(V.muted).texto(xFp,y,T(E.d),7.2,"F1");
    col(actual?V.forest:V.ink).textoD(rUt,y,fmtCOP(PV[E.n]),8,actual?"F2":"F1");
    col(actual?V.forest:V.ink).textoD(rPr,y,fmtCOP(PR[E.n]),8,actual?"F2":"F1");
    col(actual?V.forest:V.ink).textoD(rPre,y,fmtCOP(v),9.4,actual?"F2":"F1");
    col(V.muted).textoD(rBr,y,fmtCOP(v/L.at),8,"F1");
    y+=9; col(V.line,1).grosor(.35).linea(M,y,595.28-M,y); y+=13;
  });
  col(V.muted); y-=4;
  y=envolver(P, TT(
    "Las dos primeras columnas son la lista: lo que vale cada metro en esa etapa. El precio del lote "+
      "es el área útil por el valor del metro útil, más el área de protección por el valor del metro "+
      "protegido. El $/m² bruto es sólo el resultado repartido sobre el área total, para comparar lotes.",
    "The first two columns are the price list: what each square metre is worth at that stage. The lot "+
      "price is the useful area times the useful rate, plus the protected area times the protected "+
      "rate. The $/m² gross column is just the result spread over the total area, for comparing lots.",
    "Les deux premières colonnes sont le barème : ce que vaut chaque mètre à cette étape. Le prix du "+
      "lot est la surface utile par le taux utile, plus la surface protégée par le taux protégé. Le "+
      "$/m² brut n'est que le résultat rapporté à la surface totale, pour comparer les lots."),
    M, y, 595.28-2*M, 6.8, 9.2); y+=4;

  /* ---- plan de pagos, etapa por etapa ---- */
  y+=6;
  col(V.gold).texto(M,y,T("PLAN DE PAGOS")+" · "+
    TT("23 cuotas desde "+PLAN_DESDE+" y una final en "+PLAN_HASTA,
       "23 instalments from January 2027 and a final one in December 2028"),7.6,"F2",1.1); y+=15;
  const pc=[M, M+150, M+268, M+392, 595.28-M];
  const cabP=[[T("Etapa"),pc[0],0],
              [TT("Inicial en 2026","Down payment in 2026"),pc[1],1],
              [TT("Saldo a financiar","Balance financed"),pc[2],1],
              [TT("Cuota mensual","Monthly instalment"),pc[3],1],
              [TT("Cuota final","Final instalment"),pc[4],1]];
  col(V.muted);
  cabP.forEach(([t,x,der])=>{ if(der) P.textoD(x,y,t,6.5,"F2",.7); else P.texto(x,y,t,6.5,"F2",.7); });
  y+=6; col(V.line,1).grosor(.6).linea(M,y,595.28-M,y); y+=13;
  ETAPAS.forEach(E=>{
    const pp=planPago(L,E.n), actual=(E.n===state.etapa);
    if(actual){ col([241,234,217]).rect(M-6,y-9,595.28-2*M+12,20); }
    col(actual?V.forest:V.ink).texto(pc[0],y,E.l,9,"F2");
    if(pp.contado){
      col(V.muted).texto(pc[0]+26,y,TT("contado","cash"),7.6,"F1");
      col(actual?V.forest:V.ink).textoD(pc[1],y,fmtCOP(pp.inicial),8,actual?"F2":"F1");
      col(V.muted).textoD(pc[2],y,"—",8,"F1");
      col(V.muted).textoD(pc[3],y,"—",8,"F1");
      col(V.muted).textoD(pc[4],y,"—",8,"F1");
    }else{
      col(V.muted).texto(pc[0]+26,y,Math.round(pp.frac*100)+" %",7.6,"F1");
      col(actual?V.forest:V.ink).textoD(pc[1],y,fmtCOP(pp.inicial),8,actual?"F2":"F1");
      col(V.ink).textoD(pc[2],y,fmtCOP(pp.saldo),8,"F1");
      col(actual?V.forest:V.ink).textoD(pc[3],y,fmtCOP(pp.cuota),8.6,actual?"F2":"F1");
      col(V.ink).textoD(pc[4],y,fmtCOP(pp.ultima),8,"F1");
    }
    y+=9; col(V.line,1).grosor(.35).linea(M,y,595.28-M,y); y+=13;
  });
  col(V.muted); y-=4;
  y=envolver(P, TT(
    "Para separar entran "+fmtCOP(SEPARACION)+" y el resto de la cuota inicial se completa hasta "+
      "diciembre de 2026. El saldo se reparte en 24 meses, de "+PLAN_DESDE+" a "+PLAN_HASTA+": "+
      "23 cuotas del 3 % del saldo y una última que absorbe lo que queda, que por eso es la más alta. "+
      "Sin intereses ni ajuste por inflación.",
    "A "+fmtCOP(SEPARACION)+" deposit reserves the lot and the rest of the down payment is completed by "+
      "December 2026. The balance is spread over 24 months, from January 2027 to December 2028: 23 "+
      "instalments of 3% of the balance and a final one absorbing the remainder, which is why it is the "+
      "largest. No interest, no inflation adjustment.",
    "Un acompte de "+fmtCOP(SEPARACION)+" réserve le lot et le reste de l'apport se complète avant "+
      "décembre 2026. Le solde s'étale sur 24 mois, de janvier 2027 à décembre 2028 : 23 mensualités de "+
      "3 % du solde et une dernière qui absorbe le reste, la plus élevée. Sans intérêts ni indexation.")+
    " "+TT("El calendario mes a mes de la etapa escogida va en la hoja siguiente.",
           "The month-by-month schedule for the chosen stage is on the next page.",
           "Le calendrier mois par mois de l'étape choisie figure à la page suivante."),
    M, y, 595.28-2*M, 6.8, 9.2); y+=6;

  /* ---- barras de comparación ---- */
  /* Esta hoja iba apretada de más: la nota de precios y la salvedad legal
     acababan DEBAJO del borde de la página —MEDIDO: la última línea caía en
     y=878 de una hoja de 841,9— y no se imprimían. Se recupera alto aquí, en
     las barras y en los interlineados, que es donde sobraba aire. */
  y+=4;
  col(V.gold).texto(M,y,T("CÓMO SE MUEVE EL PRECIO"),7.6,"F2",1.1); y+=16;
  const maxV=Math.max(...ETAPAS.map(E=>precio(L,E.n)));
  const bw=(595.28-2*M-5*10)/6, base=y+58;
  ETAPAS.forEach((E,i)=>{
    const v=precio(L,E.n), h=Math.max(4,(v/maxV)*52), x=M+i*(bw+10);
    const actual=(E.n===state.etapa);
    col(actual?V.forest:[176,190,168]).rect(x,base-h,bw,h);
    col(V.muted).texto(x,base+11,E.l,7.4,"F2");
    col(actual?V.forest:V.muted).texto(x,base-h-5,"$"+dec(v/1e6,0)+"M",7,"F2");
  });
  y=base+22;

  /* ---- qué más entra en el precio ---- */
  col(V.line,1).grosor(.5).linea(M,y,595.28-M,y); y+=14;
  col(V.gold).texto(M,y,T("QUÉ MÁS ENTRA EN EL PRECIO"),7.6,"F2",1.1); y+=13;
  const mitad=(595.28-2*M)/2-14;
  let ya=y;
  const filaC=(x,w,k,v)=>{
    col(V.muted).texto(x,ya,k,7.8,"F1");
    col(V.ink).textoD(x+w,ya,v,8.2,"F2");
    ya+=5; col(V.line,1).grosor(.35).linea(x,ya,x+w,ya); ya+=9;
  };
  col(V.ink).texto(M,ya,T("Áreas comunes del conjunto"),8.4,"F2"); ya+=12;
  filaC(M,mitad,T("Zonas sociales"),"10.057 m²");
  filaC(M,mitad,T("Áreas de protección"),"28.696 m²");
  filaC(M,mitad,T("Andenes y vías"),"30.775 m²");
  filaC(M,mitad,T("Portería"),"53 m²");
  const yfin=ya;
  ya=y;
  const x2=M+mitad+28;
  col(V.ink).texto(x2,ya,T("Desde el predio"),8.4,"F2"); ya+=12;
  POIS.slice(0,4).forEach(([nm,,md])=>filaC(x2,mitad,T(nm),T(md)));
  y=Math.max(yfin,ya)+6;

  col(V.line,1).grosor(.5).linea(M,y,595.28-M,y); y+=10;
  /* las dos notas se ajustan para terminar SOBRE la banda del pie, nunca
     debajo: la banda arranca en 841,89−46 y por debajo de ahí no se imprime. */
  const NOTA1 = TT(
      "Los precios salen de la lista de trabajo del proyecto: "+fmtCOP(PR[state.etapa])+" por m² de área "+
      "protegida y "+fmtCOP(PV[state.etapa])+" por m² de área útil en la etapa "+ETAPAS[state.etapa-1].l+", "+
      "aplicados sobre las áreas del cuadro del plano 039. El área protegida se paga distinto porque no se "+
      "puede construir ni talar allí, pero sí hace parte del lote y de su valor de paisaje.",
      "Prices come from the project's working list: "+fmtCOP(PR[state.etapa])+" per m² of protected area and "+
      fmtCOP(PV[state.etapa])+" per m² of usable area at stage "+ETAPAS[state.etapa-1].l+", applied to the areas "+
      "in the schedule of drawing 039. Protected area is priced differently because nothing can be built or "+
      "cleared there, but it is still part of the lot and of its landscape value.",
      "Les prix viennent de la liste de travail du projet : "+fmtCOP(PR[state.etapa])+" par m² de surface "+
      "protégée et "+fmtCOP(PV[state.etapa])+" par m² de surface utile à la phase "+ETAPAS[state.etapa-1].l+", "+
      "appliqués aux surfaces du tableau du plan 039. La surface protégée est valorisée différemment parce "+
      "qu'on ne peut ni y construire ni y couper, mais elle fait partie du lot et de sa valeur de paysage.");
  const NOTA2 = TT(
      "Este documento es informativo y no constituye oferta comercial. Los precios están sujetos a cambio sin "+
      "previo aviso y no incluyen gastos de escrituración, impuestos ni el valor de la construcción. El estado "+
      "del lote se confirma con el asesor antes de cualquier separación.",
      "This document is informative and does not constitute a commercial offer. Prices are subject to change "+
      "without notice and do not include conveyancing costs, taxes or the cost of construction. The status of "+
      "the lot is confirmed with the sales agent before any reservation.",
      "Ce document est informatif et ne constitue pas une offre commerciale. Les prix peuvent changer sans "+
      "préavis et n'incluent ni les frais d'acte, ni les taxes, ni le coût de la construction. L'état du lot "+
      "est confirmé avec le conseiller avant toute réservation.");
  const TOPE_NOTAS = 841.89 - 34 - 6;
  let t1=7.4, l1=10, t2=7.0, l2=9.6;
  /* alto real: envolver() deja el cursor una interlínea bajo la última línea,
     así que el borde de abajo del texto es una interlínea menos, más el rabo. */
  const alto = () => lineasEnvolver(NOTA1,595.28-2*M,t1)*l1 + 5 +
                     (lineasEnvolver(NOTA2,595.28-2*M,t2)-1)*l2 + 3;
  while(t1>5.8 && y + alto() > TOPE_NOTAS){ t1-=0.3; l1-=0.4; t2-=0.3; l2-=0.4; }
  y=envolver(P, NOTA1, M, y, 595.28-2*M, t1, l1);
  y+=5;
  y=envolver(P, NOTA2, M, y, 595.28-2*M, t2, l2);

  /* la banda baja de 46 a 34 pt: con 46 se comía la última línea de la nota
     legal, y con 34 sigue leyéndose igual de bien */
  col(V.forest).rect(0,841.89-34,595.28,34);
  col(V.blanco).texto(M,841.89-20,"LAURELES CAMPESTRE",9.4,"F2",1.3);
  col([200,214,192]).texto(M,841.89-9,T("El Caimo · Armenia · Quindío · Parcelación campestre"),6.6,"F1");
  col([200,214,192]).textoD(595.28-M,841.89-14,T("Generado el")+" "+new Date().toLocaleDateString(LOC()),6.8,"F1");
  return P;
}

/* ---- el mismo diagrama isométrico, dibujado dentro del PDF ---- */
function dibujarIsoPDF(P,V,n,L,A,x0,y0,w,h){
  const esc=ISO.escena(n,L,A); if(!esc) return;
  const b=ISO.encuadre(esc), M=16;
  const s=Math.min((w-2*M)/(b.x1-b.x0), (h-2*M-16)/(b.y1-b.y0));
  const cx=x0+(w-(b.x1+b.x0)*s)/2, cy=y0+(h-16+(b.y1+b.y0)*s)/2;
  const Q=(E,N,U)=>{ const q=ISO.proy(E,N,U); return [cx+q[0]*s, cy-q[1]*s]; };
  const hex=c=>{const t=String(c).replace("#","");
    return [parseInt(t.slice(0,2),16),parseInt(t.slice(2,4),16),parseInt(t.slice(4,6),16)];};
  const col=(c,f)=>f?P.trazo(c[0],c[1],c[2]):P.color(c[0],c[1],c[2]);

  P.guarda(); P.recorte([[x0,y0],[x0+w,y0],[x0+w,y0+h],[x0,y0+h]]);

  /* suelo */
  esc.suelo.forEach(g=>{
    const pts=g.pts.map(p=>Q(p[0],p[1],p[2]||0));
    if(g.tipo==="terreno"){
      const t=g.tono==null?1:g.tono;
      col([Math.round(143*t+18), Math.round(163*t+14), Math.round(106*t+12)]).poli(pts,"f",true);
    } else if(g.tipo==="lindero"){
      col([125,107,62],1).grosor(1.1).raya(null); P.poli(pts,"S",true);
    } else if(g.tipo==="plataforma"){
      col([244,243,235]).poli(pts,"f",true);
      col([191,189,174],1).grosor(.8).raya(null); P.poli(pts,"S",true);
    } else if(g.tipo==="antejardin"){
      col([201,164,92],1).grosor(.8).raya("4 3");
      P.linea(pts[0][0],pts[0][1],pts[1][0],pts[1][1]); P.raya(null);
    }
  });

  /* un arco, partido en lo que va detrás y lo que va delante */
  const arco=(a,detras)=>{
    const c=hex(a.c); col(c,1).grosor(1.7).raya("0.8 4.2");
    let cur=[];
    const suelta=()=>{ for(let i=1;i<cur.length;i++)
        P.linea(cur[i-1][0],cur[i-1][1],cur[i][0],cur[i][1]);
      cur=[]; };
    a.pts.forEach(p=>{
      const atras = ISO.fondo(p[0],p[1],p[2]) > 0;
      if(atras===detras) cur.push(Q(p[0],p[1],p[2])); else suelta();
    });
    suelta(); P.raya(null);
  };
  esc.cielo.forEach(a=>arco(a,true));

  /* volúmenes */
  esc.piezas.forEach(bl=>{
    const b0=bl.base.map(p=>Q(p[0],p[1],bl.b||0));
    const bt=bl.base.map(p=>Q(p[0],p[1],bl.h));
    const tapaIA=COLOR_IA[bl.cls]&&bl.cls!=="muro"&&bl.cls!=="porche" ? COLOR_IA[bl.cls] : null;
    const lados=[];
    for(let i=0;i<4;i++){
      const j=(i+1)%4;
      const m=[(bl.base[i][0]+bl.base[j][0])/2,(bl.base[i][1]+bl.base[j][1])/2];
      lados.push({q:[b0[i],b0[j],bt[j],bt[i]], z:ISO.fondo(m[0],m[1],bl.h/2)});
    }
    lados.sort((p,q)=>q.z-p.z).forEach((l,i)=>{
      if(i<2) return;
      col([253,252,248]).poli(l.q,"f",true);
      col([59,69,58],1).grosor(.85).poli(l.q,"S",true);
    });
    col(tapaIA||[255,255,255]).poli(bt,"f",true);
    col([59,69,58],1).grosor(.85).poli(bt,"S",true);
  });

  /* arcos de adelante, soles y flechas */
  const sol=(p,r,c)=>{
    col(c).circulo(p[0],p[1],r,"f");
    col(c,1).grosor(1.4);
    for(let i=0;i<8;i++){ const a=i*Math.PI/4;
      P.linea(p[0]+Math.cos(a)*r*1.5, p[1]+Math.sin(a)*r*1.5,
              p[0]+Math.cos(a)*r*2.1, p[1]+Math.sin(a)*r*2.1); }
  };
  esc.cielo.forEach(a=>{
    arco(a,false);
    const c=hex(a.c);
    const u=a.pts[a.pts.length-1], v=a.pts[a.pts.length-6]||a.pts[0];
    const pu=Q(u[0],u[1],u[2]), pv=Q(v[0],v[1],v[2]);
    const ang=Math.atan2(pu[1]-pv[1],pu[0]-pv[0]), F=6;
    col(c).poli([pu,
      [pu[0]-Math.cos(ang-0.42)*F, pu[1]-Math.sin(ang-0.42)*F],
      [pu[0]-Math.cos(ang+0.42)*F, pu[1]-Math.sin(ang+0.42)*F]],"f",true);
    a.soles.forEach(z=>sol(Q(z.p[0],z.p[1],z.p[2]), 3.6, c));
  });

  /* rosa de los vientos */
  col([138,145,132]);
  esc.rosa.forEach(r=>{ const p=Q(r.p[0],r.p[1],0);
    P.texto(p[0]-2.4, p[1]+2.4, T(r.t), 7.4, "F2"); });

  P.recupera();

  /* leyenda */
  const ly=y0+h-4, colw=(w-2*M)/esc.cielo.length;
  esc.cielo.forEach((a,i)=>{
    const lx=x0+M+i*colw, c=hex(a.c);
    col(c).rect(lx,ly-6,6,6);
    col([107,115,103]).texto(lx+10,ly,T(a.t).toUpperCase(),6.6,"F2",.7);
  });
}

/* --------- hoja del sol: la casa en isométrico bajo los recorridos --------- */
/* =========================================================================
   PLANTA ESQUEMÁTICA DE LA CASA PROPUESTA
   Los espacios que reparte la IA (rectángulos en metros dentro de cada bloque
   muro) se convierten aquí en un plano de arquitectura esquemático: muros a
   doble línea, puertas con su giro, ventanas en los bordes exteriores (las
   grandes hacia el fondo, que es la vista), rótulos con área, cotas, norte y
   escala. Las puertas y las ventanas NO las decide la IA: las decide este
   módulo con reglas fijas, para que dos plantas iguales den siempre el mismo
   dibujo. Se dibuja igual en pantalla (SVG) y en el PDF a través de un
   "pintor" con cinco órdenes, y la misma geometría sale al DXF.
   ========================================================================= */
const PLANTA_ESQ = (()=>{
  const EPS=0.06;
  const dec1=v=>dec(v,1);
  const HABIT  = {sala:1,comedor:1,cocina:1,alcoba_principal:1,alcoba:1,estudio:1,terraza_cubierta:1};
  const CIRC   = {circulacion:1,hall:1};
  const SOCIAL = {sala:1,comedor:1,cocina:1,hall:1,circulacion:1,terraza_cubierta:1};
  const RELLENO = {sala:[247,241,226], comedor:[247,241,226], cocina:[243,236,214], terraza_cubierta:[240,238,226],
                   alcoba_principal:[232,238,226], alcoba:[236,240,230], estudio:[236,240,230],
                   bano:[226,234,238], vestier:[232,236,238], ropas:[236,234,226], deposito:[236,234,226],
                   circulacion:[246,244,236], hall:[246,244,236]};
  const NOMBRE = t=>({sala:"Sala",comedor:"Comedor",cocina:"Cocina",alcoba_principal:"Alcoba principal",alcoba:"Alcoba",
                      bano:"Baño",vestier:"Vestier",estudio:"Estudio",ropas:"Ropas",circulacion:"Circulación",hall:"Hall",
                      deposito:"Depósito",terraza_cubierta:"Terraza cubierta"})[t]||t;
  const MURO_EXT=0.20, MURO_INT=0.12;

  /* borde compartido entre dos rectángulos: eje del borde, posición, tramo */
  function compartido(a,b){
    if(Math.abs(a.u1-b.u0)<EPS||Math.abs(a.u0-b.u1)<EPS){
      const f=Math.max(a.v0,b.v0), t=Math.min(a.v1,b.v1);
      if(t-f>0.3) return {axis:"v", pos:Math.abs(a.u1-b.u0)<EPS?a.u1:a.u0, from:f, to:t, lado:Math.abs(a.u1-b.u0)<EPS?"u1":"u0"};
    }
    if(Math.abs(a.v1-b.v0)<EPS||Math.abs(a.v0-b.v1)<EPS){
      const f=Math.max(a.u0,b.u0), t=Math.min(a.u1,b.u1);
      if(t-f>0.3) return {axis:"u", pos:Math.abs(a.v1-b.v0)<EPS?a.v1:a.v0, from:f, to:t, lado:Math.abs(a.v1-b.v0)<EPS?"v1":"v0"};
    }
    return null;
  }
  /* tramos de cada lado de x que no tocan a ningún otro espacio del nivel */
  function bordesExteriores(x,R){
    const out=[];
    const lados=[{axis:"v",pos:x.u0,lado:"u0",from:x.v0,to:x.v1,otro:y=>Math.abs(y.u1-x.u0)<EPS,rng:y=>[y.v0,y.v1]},
                 {axis:"v",pos:x.u1,lado:"u1",from:x.v0,to:x.v1,otro:y=>Math.abs(y.u0-x.u1)<EPS,rng:y=>[y.v0,y.v1]},
                 {axis:"u",pos:x.v0,lado:"v0",from:x.u0,to:x.u1,otro:y=>Math.abs(y.v1-x.v0)<EPS,rng:y=>[y.u0,y.u1]},
                 {axis:"u",pos:x.v1,lado:"v1",from:x.u0,to:x.u1,otro:y=>Math.abs(y.v0-x.v1)<EPS,rng:y=>[y.u0,y.u1]}];
    lados.forEach(L=>{
      let libres=[[L.from,L.to]];
      R.forEach(y=>{ if(y===x||!L.otro(y)) return; const [a,b]=L.rng(y);
        const nx=[]; libres.forEach(([f,t])=>{ const f2=Math.max(f,a), t2=Math.min(t,b);
          if(t2<=f2){ nx.push([f,t]); return; } if(f2-f>0.2) nx.push([f,f2]); if(t-t2>0.2) nx.push([t2,t]); });
        libres=nx; });
      libres.forEach(([f,t])=>{ if(t-f>0.3) out.push({axis:L.axis,pos:L.pos,lado:L.lado,from:f,to:t}); });
    });
    return out;
  }
  function tocaBloque(s,b){          /* ¿el tramo s corre por el borde del bloque b? */
    if(s.axis==="u") return (Math.abs(s.pos-b.v0)<EPS||Math.abs(s.pos-b.v1)<EPS) && s.to>b.u0 && s.from<b.u1;
    return (Math.abs(s.pos-b.u0)<EPS||Math.abs(s.pos-b.u1)<EPS) && s.to>b.v0 && s.from<b.v1;
  }

  /* --- la geometría de un nivel: espacios, puertas, aberturas y ventanas --- */
  function armar(C, nivel){
    const R=(C.espacios||[]).filter(e=>(e.nivel||1)===nivel);
    const B=(C.reales||[]).filter(b=>(b.nivel||1)===nivel);
    const puertas=[], aberturas=[], ventanas=[];
    R.forEach(x=>{
      if(CIRC[x.tipo]) return;
      const cands=R.filter(y=>y!==x).map(y=>({y,s:compartido(x,y)})).filter(c=>c.s&&(c.s.to-c.s.from)>=0.9);
      let p;
      if(x.tipo==="bano"||x.tipo==="vestier")
        p=cands.find(c=>c.y.tipo==="alcoba_principal")||cands.find(c=>c.y.tipo==="alcoba")||cands.find(c=>CIRC[c.y.tipo])||cands.find(c=>SOCIAL[c.y.tipo]);
      else if(x.tipo==="ropas"||x.tipo==="deposito")
        p=cands.find(c=>c.y.tipo==="cocina")||cands.find(c=>CIRC[c.y.tipo])||cands[0];
      else p=cands.find(c=>CIRC[c.y.tipo])||cands.find(c=>SOCIAL[c.y.tipo])||cands[0];
      if(!p) return;
      const abierta=SOCIAL[x.tipo]&&SOCIAL[p.y.tipo]&&!CIRC[x.tipo]&&!CIRC[p.y.tipo];
      const w=abierta?Math.min(2.4,(p.s.to-p.s.from)*0.7):((x.tipo==="bano"||x.tipo==="vestier")?0.8:0.9);
      (abierta?aberturas:puertas).push({axis:p.s.axis,pos:p.s.pos,c:(p.s.from+p.s.to)/2,w,hacia:x,desde:p.y});
    });
    /* la puerta de entrada: el hall, o la sala, por el borde hacia la vía o el carport */
    const acc=R.find(e=>e.tipo==="hall")||R.find(e=>e.tipo==="sala");
    if(acc){
      const ext=bordesExteriores(acc,R);
      const e=ext.find(s=>s.lado==="v0"&&s.to-s.from>=1.0)||ext.find(s=>B.some(b=>b.clase==="porche"&&tocaBloque(s,b))&&s.to-s.from>=1.0)||ext.find(s=>s.to-s.from>=1.0);
      if(e) puertas.push({axis:e.axis,pos:e.pos,c:(e.from+e.to)/2,w:1.0,hacia:acc,desde:null,exterior:true,lado:e.lado});
    }
    /* ventanas: bordes exteriores de los espacios habitables; hacia el fondo (v1) el ventanal */
    R.forEach(x=>{
      if(!(HABIT[x.tipo]||x.tipo==="bano")) return;
      bordesExteriores(x,R).forEach(s=>{
        const len=s.to-s.from; if(len<0.9) return;
        if(puertas.some(p=>p.exterior&&p.axis===s.axis&&Math.abs(p.pos-s.pos)<EPS&&p.c>s.from&&p.c<s.to)) return;
        let w = x.tipo==="bano" ? 0.6 : (s.lado==="v1" ? Math.min(4.8,Math.max(1.2,len*0.6)) : Math.min(2.4,Math.max(1.0,len*0.45)));
        if(w>len-0.4) w=Math.max(0.6,len-0.4);
        ventanas.push({axis:s.axis,pos:s.pos,c:(s.from+s.to)/2,w,de:x,lado:s.lado});
      });
    });
    return {R,B,puertas,aberturas,ventanas};
  }

  /* --- el dibujo, con un pintor abstracto ---
     pintor: rect(x,y,w,h,fill,stroke,sw) · line(x1,y1,x2,y2,stroke,sw,dash) ·
             poly(pts,fill,stroke,sw) · text(x,y,txt,size,anchor,fill,bold)
     x,y en unidades del pintor; aquí se le entregan ya proyectadas.
     Marco: u a la derecha, v hacia ARRIBA (el fondo del lote arriba, la vía abajo). */
  function dibujar(pt, C, K, nivel, X0, Y0, s, W, H, opciones){
    const o=opciones||{};
    const G=armar(C,nivel);
    const L=K.L, D=K.Dc||K.A||28.4;
    const X=u=>X0+u*s, Y=v=>Y0+(D-v)*s;
    const rectUV=(u0,v0,u1,v1,fill,stroke,sw)=>pt.rect(X(u0),Y(v1),(u1-u0)*s,(v1-v0)*s,fill,stroke,sw);
    /* la envolvente, de guía */
    rectUV(0,0,L,D,[250,249,243],[180,176,160],0.5);
    /* en el piso alto, la planta baja punteada debajo, para ubicarse */
    if(nivel===2) (C.reales||[]).filter(b=>(b.nivel||1)===1&&(b.clase==="muro"||b.clase==="porche")).forEach(b=>{
      pt.rect(X(b.u0),Y(b.v1),(b.u1-b.u0)*s,(b.v1-b.v0)*s,[244,243,236],[170,166,150],0.5);
      pt.line(X(b.u0),Y(b.v1),X(b.u1),Y(b.v0),[200,196,180],0.3,"2 2");
    });
    /* bloques que no son muro: patio, deck, piscina, porche */
    G.B.forEach(b=>{
      if(b.clase==="patio") rectUV(b.u0,b.v0,b.u1,b.v1,[235,232,220],[170,166,150],0.5);
      if(b.clase==="deck"){ rectUV(b.u0,b.v0,b.u1,b.v1,[224,204,176],[150,110,70],0.6);
        for(let k=b.u0+0.6;k<b.u1;k+=0.6) pt.line(X(k),Y(b.v0),X(k),Y(b.v1),[190,160,120],0.3); }
      if(b.clase==="piscina"){ rectUV(b.u0-0.3,b.v0-0.3,b.u1+0.3,b.v1+0.3,[236,236,230],[150,150,140],0.5);
        rectUV(b.u0,b.v0,b.u1,b.v1,[150,196,222],[70,120,160],0.6);
        pt.text(X((b.u0+b.u1)/2),Y((b.v0+b.v1)/2)+o.t*0.35,"Piscina "+dec1(b.u1-b.u0)+" × "+dec1(b.v1-b.v0),o.t,"middle",[40,70,100],true); }
      if(b.clase==="porche"){ rectUV(b.u0,b.v0,b.u1,b.v1,[244,243,236],[120,116,100],0.5);
        pt.line(X(b.u0),Y(b.v0),X(b.u1),Y(b.v1),[190,186,170],0.3,"2 2"); pt.line(X(b.u0),Y(b.v1),X(b.u1),Y(b.v0),[190,186,170],0.3,"2 2");
        const c=0.3; [[b.u0,b.v0],[b.u1-c,b.v0],[b.u0,b.v1-c],[b.u1-c,b.v1-c]].forEach(([a,bb])=>rectUV(a,bb,a+c,bb+c,[90,88,78],null,0));
        pt.text(X((b.u0+b.u1)/2),Y((b.v0+b.v1)/2)+o.t*0.35,String(b.nombre||"Carport"),o.t,"middle",[90,88,78],false); }
    });
    /* espacios: relleno */
    G.R.forEach(e=>rectUV(e.u0,e.v0,e.u1,e.v1,RELLENO[e.tipo]||[240,240,235],null,0));
    /* muros interiores y exteriores */
    G.R.forEach(e=>rectUV(e.u0,e.v0,e.u1,e.v1,null,[52,58,50],MURO_INT*s));
    G.B.filter(b=>b.clase==="muro").forEach(b=>rectUV(b.u0,b.v0,b.u1,b.v1,null,[40,46,38],MURO_EXT*s));
    /* huecos: el vano se "borra" con el relleno del espacio al que abre */
    const vano=(h,ancho,esp,relleno)=>{
      const g=Math.max(MURO_EXT,MURO_INT)*1.15;
      if(h.axis==="u") pt.rect(X(h.c-ancho/2),Y(h.pos+g/2),ancho*s,g*s,relleno||[255,255,255],null,0);
      else pt.rect(X(h.pos-g/2),Y(h.c+ancho/2),g*s,ancho*s,relleno||[255,255,255],null,0);
    };
    G.aberturas.forEach(a=>{ vano(a,a.w,a.hacia,RELLENO[a.hacia.tipo]);
      if(a.axis==="u") pt.line(X(a.c-a.w/2),Y(a.pos),X(a.c+a.w/2),Y(a.pos),[120,116,100],0.4,"1.5 1.5");
      else pt.line(X(a.pos),Y(a.c-a.w/2),X(a.pos),Y(a.c+a.w/2),[120,116,100],0.4,"1.5 1.5"); });
    G.puertas.forEach(p=>{
      vano(p,p.w,p.hacia,p.exterior?[255,255,255]:RELLENO[p.hacia.tipo]);
      /* la hoja y el arco, hacia el espacio al que abre */
      const h=p.hacia, hacia = p.axis==="u" ? (Math.abs(h.v0-p.pos)<EPS?1:-1) : (Math.abs(h.u0-p.pos)<EPS?1:-1);
      const bis=p.c-p.w/2, pts=[], N=8;
      for(let i=0;i<=N;i++){ const a=(Math.PI/2)*i/N;
        if(p.axis==="u") pts.push([X(bis+p.w*Math.cos(a)), Y(p.pos+hacia*p.w*Math.sin(a))]);
        else pts.push([X(p.pos+hacia*p.w*Math.sin(a)), Y(bis+p.w*Math.cos(a))]); }
      const hoja = p.axis==="u" ? [[X(bis),Y(p.pos)],[X(bis),Y(p.pos+hacia*p.w)]] : [[X(p.pos),Y(bis)],[X(p.pos+hacia*p.w),Y(bis)]];
      pt.line(hoja[0][0],hoja[0][1],hoja[1][0],hoja[1][1],[52,58,50],0.7);
      pt.poly(pts,null,[52,58,50],0.35,false);
    });
    G.ventanas.forEach(v=>{
      vano(v,v.w,v.de,[255,255,255]);
      const g=MURO_EXT*0.5;
      if(v.axis==="u"){ [-g,0,g].forEach(d=>pt.line(X(v.c-v.w/2),Y(v.pos+d),X(v.c+v.w/2),Y(v.pos+d),[52,58,50],d?0.35:0.6)); }
      else { [-g,0,g].forEach(d=>pt.line(X(v.pos+d),Y(v.c-v.w/2),X(v.pos+d),Y(v.c+v.w/2),[52,58,50],d?0.35:0.6)); }
    });
    /* rótulos con área */
    G.R.forEach(e=>{
      const w=(e.u1-e.u0)*s, h=(e.v1-e.v0)*s, cx=X((e.u0+e.u1)/2), cy=Y((e.v0+e.v1)/2);
      const nom=String(e.nombre||NOMBRE(e.tipo)); const ar=ent(e.area)+" m²";
      if(w<o.t*3.2||h<o.t*1.6) return;
      const dos = h>o.t*3.0 && w>o.t*4;
      if(dos){ pt.text(cx,cy-o.t*0.15,nom,o.t,"middle",[40,46,38],true); pt.text(cx,cy+o.t*1.05,ar,o.t*0.85,"middle",[110,106,92],false); }
      else pt.text(cx,cy+o.t*0.35,nom,Math.min(o.t,w/ (nom.length*0.62)),"middle",[40,46,38],true);
    });
    /* cotas generales, vía, norte y escala */
    const ct=[90,96,84];
    const yc=Y(0)+o.t*1.6;
    pt.line(X(0),yc,X(L),yc,ct,0.5); pt.line(X(0),yc-3,X(0),yc+3,ct,0.5); pt.line(X(L),yc-3,X(L),yc+3,ct,0.5);
    pt.text(X(L/2),yc+o.t*1.1,dec1(L)+" m",o.t*0.9,"middle",ct,false);
    const xc=X(0)-o.t*1.2;
    pt.line(xc,Y(0),xc,Y(D),ct,0.5); pt.line(xc-3,Y(0),xc+3,Y(0),ct,0.5); pt.line(xc-3,Y(D),xc+3,Y(D),ct,0.5);
    pt.text(xc-o.t*0.4,Y(D/2)+o.t*0.35,dec1(D),o.t*0.9,"end",ct,false);
    pt.text(X(L/2),yc+o.t*2.6,TT("VÍA · acceso","ROAD · access","VOIE · accès"),o.t*0.85,"middle",[150,120,60],true);
    pt.text(X(L/2),Y(D)-o.t*0.6,TT("FONDO · vista","BACK · view","FOND · vue"),o.t*0.85,"middle",[110,140,110],true);
    /* el norte: componente del norte geográfico en el marco (u,v) */
    if(K.ux&&K.uv){
      const nu=-K.ux[1], nv=-K.uv[1], r=o.t*1.6, cx=X(L)+o.t*2.2, cy=Y(D)+o.t*2.2;
      const ex=cx+nu*r, ey=cy-nv*r;
      pt.line(cx,cy,ex,ey,[40,46,38],0.9);
      pt.poly([[ex,ey],[ex-nv*r*0.28-nu*r*0.5,ey-nu*r*0.28+nv*r*0.5],[ex+nv*r*0.28-nu*r*0.5,ey+nu*r*0.28+nv*r*0.5]],[40,46,38],null,0,true);
      pt.text(ex+nu*o.t*1.1, ey-nv*o.t*1.1+o.t*0.35,"N",o.t,"middle",[40,46,38],true);
    }
    /* escala gráfica de 5 m */
    const bx=X(L)-5*s, by=Y(0)+o.t*4.2;
    pt.line(bx,by,bx+5*s,by,ct,0.9); pt.line(bx,by-2.5,bx,by+2.5,ct,0.6); pt.line(bx+5*s,by-2.5,bx+5*s,by+2.5,ct,0.6);
    pt.text(bx-o.t*0.4,by+o.t*0.35,"5 m",o.t*0.85,"end",ct,false);
    return G;
  }

  /* --- pintores --- */
  function pintorSVG(){
    const o=[]; const rgb=c=>c?"rgb("+c.join(",")+")":"none";
    return {
      rect(x,y,w,h,f,st,sw){ o.push('<rect x="'+x.toFixed(1)+'" y="'+y.toFixed(1)+'" width="'+w.toFixed(1)+'" height="'+h.toFixed(1)+'" fill="'+rgb(f)+'"'+(st?' stroke="'+rgb(st)+'" stroke-width="'+sw.toFixed(2)+'" stroke-linejoin="miter"':'')+'/>'); },
      line(x1,y1,x2,y2,st,sw,dash){ o.push('<line x1="'+x1.toFixed(1)+'" y1="'+y1.toFixed(1)+'" x2="'+x2.toFixed(1)+'" y2="'+y2.toFixed(1)+'" stroke="'+rgb(st)+'" stroke-width="'+sw.toFixed(2)+'"'+(dash?' stroke-dasharray="'+dash+'"':'')+'/>'); },
      poly(pts,f,st,sw,cerrar){ o.push('<path d="'+pts.map((p,i)=>(i?"L":"M")+p[0].toFixed(1)+" "+p[1].toFixed(1)).join("")+(cerrar?"Z":"")+'" fill="'+rgb(f)+'"'+(st?' stroke="'+rgb(st)+'" stroke-width="'+sw.toFixed(2)+'"':'')+'/>'); },
      text(x,y,t,sz,anc,f,b){ o.push('<text x="'+x.toFixed(1)+'" y="'+y.toFixed(1)+'" font-size="'+sz.toFixed(1)+'" text-anchor="'+(anc||"start")+'" fill="'+rgb(f)+'"'+(b?' font-weight="700"':'')+'>'+String(t).replace(/[<>&]/g,"")+'</text>'); },
      html(){ return o.join(""); }
    };
  }
  function pintorPDF(P){
    const col=(c,f)=>f?P.trazo(c[0],c[1],c[2]):P.color(c[0],c[1],c[2]);
    return {
      rect(x,y,w,h,f,st,sw){ if(f){ col(f); P.rect(x,y,w,h,"f"); } if(st&&sw>0){ col(st,1).grosor(sw); P.rect(x,y,w,h,"S"); } },
      line(x1,y1,x2,y2,st,sw,dash){ col(st,1).grosor(sw); if(dash){ const d=dash.split(" "); P.raya(+d[0],+d[1]); } P.linea(x1,y1,x2,y2); if(dash) P.raya(0); },
      poly(pts,f,st,sw,cerrar){ if(f){ col(f); P.poli(pts,"f",cerrar!==false); } if(st&&sw>0){ col(st,1).grosor(sw); P.poli(pts,"S",cerrar!==false); } },
      text(x,y,t,sz,anc,f,b){ col(f); const fn=b?"F2":"F1"; if(anc==="middle") P.textoC(x,y,t,sz,fn); else if(anc==="end") P.textoD(x,y,t,sz,fn); else P.texto(x,y,t,sz,fn); }
    };
  }

  /* encuadre: escala para que la envolvente quepa en W×H dejando sitio a cotas */
  function escala(K,W,H){ const L=K.L, D=K.Dc||K.A||28.4; return Math.min((W-46)/L,(H-40)/D); }

  return {armar, dibujar, pintorSVG, pintorPDF, escala, NOMBRE};
})();

/* la planta esquemática en SVG, para la pantalla */
function plantaEsquematicaSVG(n, nivel, W, H){
  const C=casaIA(n), A=IMPL[String(n)], K=A&&A.k; if(!C||!K||!(C.espacios||[]).length) return "";
  const pt=PLANTA_ESQ.pintorSVG();
  const s=PLANTA_ESQ.escala(K,W,H), L=K.L, D=K.Dc||K.A||28.4;
  const X0=(W-L*s)/2+8, Y0=14;
  PLANTA_ESQ.dibujar(pt,C,K,nivel,X0,Y0,s,W,H,{t:Math.max(7,Math.min(11,s*0.9))});
  return '<svg viewBox="0 0 '+W+' '+H+'" width="100%" height="'+Math.round(H)+'" preserveAspectRatio="xMidYMid meet" '+
         'style="display:block;border-radius:9px;background:#FFFFFF;font-family:inherit">'+pt.html()+'</svg>';
}

/* ---------- la hoja de la planta esquemática ---------- */
function hojaPlantaPDF(n,L,A,V){
  const CI=casaIA(n), K=A.k;
  const P=PDFmin.Hoja(595.28,841.89), M=38, W=595.28;
  const col=(c,f)=>f?P.trazo(c[0],c[1],c[2]):P.color(c[0],c[1],c[2]);
  col(V.forest).rect(0,0,W,56);
  const xt=logoEnBanda(P,M,28.0,24);
  col([200,214,192]).texto(xt,32,TT("Planta esquemática","Schematic floor plan","Plan schématique"),8.4,"F1");
  col(V.blanco).textoD(W-M,34,(TT("LOTE ","LOT "))+n,20,"F2");
  col(V.gold).rect(0,56,W,2.5);
  let y=86;
  col(V.gold).texto(M,y,TT("LA CASA PROPUESTA, EN PLANTA","THE PROPOSED HOUSE, IN PLAN","LA MAISON PROPOSÉE, EN PLAN"),7.6,"F2",1.1); y+=16;
  col(V.muted);
  y=envolver(P, TT("Anteproyecto esquemático: los espacios que se repartieron con el cliente, con muros, puertas y ventanas puestos por reglas fijas del motor del sitio (ventanales hacia el fondo, que es la vista; baños y ropas al interior). Las medidas son reales dentro de la envolvente de "+dec(K.L,1)+" × "+dec(K.Dc||K.A,1)+" m. No es un diseño arquitectónico ni sirve para licencia: es el punto de partida para el proyecto.",
    "Schematic preliminary plan: the rooms laid out with the client, with walls, doors and windows placed by fixed rules of the site engine (large windows to the back, which is the view; bathrooms and laundry inward). Dimensions are real within the "+dec(K.L,1)+" × "+dec(K.Dc||K.A,1)+" m envelope. It is not an architectural design nor valid for a permit: it is the starting point for the project.",
    "Avant-projet schématique : les pièces réparties avec le client, avec murs, portes et fenêtres placés par des règles fixes du moteur du site. Ce n'est ni un projet architectural ni un document de permis."), M, y, W-2*M, 8.4, 11);
  y+=6;
  const niveles=[1].concat((CI.espacios||[]).some(e=>e.nivel===2)?[2]:[]);
  const bw=W-2*M, bh=niveles.length===2?340:400;
  col([255,255,255]).rect(M,y,bw,bh); col(V.line,1).grosor(.6).rect(M,y,bw,bh,"S");
  const pt=PLANTA_ESQ.pintorPDF(P);
  const anchoCada=bw/niveles.length;
  niveles.forEach((nv,i)=>{
    const s=PLANTA_ESQ.escala(K,anchoCada-16,bh-30);
    const Lx=K.L, Dy=K.Dc||K.A||28.4;
    const X0=M+i*anchoCada+(anchoCada-Lx*s)/2+8, Y0=y+18;
    P.guarda(); P.recorte([[M+i*anchoCada,y],[M+(i+1)*anchoCada,y],[M+(i+1)*anchoCada,y+bh],[M+i*anchoCada,y+bh]]);
    col(V.gold).texto(M+i*anchoCada+10,y+12,(nv===2?TT("PISO ALTO","UPPER FLOOR","ÉTAGE"):TT("PLANTA BAJA","GROUND FLOOR","REZ-DE-CHAUSSÉE")),6.8,"F2",1.0);
    PLANTA_ESQ.dibujar(pt,CI,K,nv,X0,Y0,s,anchoCada,bh,{t:Math.max(5,Math.min(7.5,s*0.62))});
    P.recupera();
  });
  y+=bh+16;
  /* tabla de espacios en dos columnas */
  col(V.gold).texto(M,y,TT("ESPACIOS","ROOMS","PIÈCES"),7.6,"F2",1.1); y+=13;
  const esp=(CI.espacios||[]).slice().sort((a,b)=>(a.nivel-b.nivel)||(b.area-a.area));
  const colW=(W-2*M-16)/2, y0=y; let yA=y, yB=y;
  esp.forEach((e,i)=>{
    const izq=i<Math.ceil(esp.length/2); const x=izq?M:M+colW+16; let yy=izq?yA:yB;
    if(yy>760) return;
    col([52,58,50]); P.texto(x,yy,String(e.nombre)+(e.nivel===2?" (P2)":""),7.6,"F1");
    col(V.muted); P.texto(x+colW*0.48,yy,dec(e.u1-e.u0,1)+" × "+dec(e.v1-e.v0,1),7.2,"F1");
    col([52,58,50]); P.textoD(x+colW,yy,ent(e.area)+" m²",7.6,"F1");
    yy+=5; col(V.line,1).grosor(.3).linea(x,yy,x+colW,yy); yy+=8.5;
    if(izq) yA=yy; else yB=yy;
  });
  y=Math.max(yA,yB)+8;
  const sumE=esp.reduce((a,e)=>a+e.area,0);
  col([52,58,50]); P.texto(M,y,TT("Suma de espacios","Sum of rooms","Somme des pièces"),8,"F2"); P.textoD(W-M,y,ent(sumE)+" m²",8.4,"F2"); y+=12;
  col(V.muted); P.texto(M,y,TT("Área construida (bloques, con muros y cubiertos)","Built area (blocks, with walls and covered)","Surface bâtie"),7.6,"F1"); col([52,58,50]); P.textoD(W-M,y,ent(CI.construida)+" m²",8,"F1");
  const TXT=TT("Las puertas y ventanas las coloca el motor del sitio con reglas fijas, no la IA; la diferencia entre la suma de espacios y el área construida son los muros y los cubiertos. Anteproyecto esquemático: no constituye diseño arquitectónico, cálculo estructural ni licencia.",
    "Doors and windows are placed by the site engine with fixed rules, not by the AI; the difference between the room sum and the built area is walls and covered areas. Schematic preliminary plan: not an architectural design, structural calculation nor permit.",
    "Portes et fenêtres sont placées par le moteur du site selon des règles fixes ; avant-projet schématique, sans valeur de permis.");
  const WP=W-2*M, AL=lineasEnvolver(TXT,WP,6.6)*8.6, PY=841.89-26-AL;
  col(V.line,1).grosor(.5).linea(M,PY-12,W-M,PY-12);
  col(V.muted); envolver(P,TXT,M,PY,WP,6.6,8.6);
  return P;
}


/* =========================================================================
   EXPORTAR A DXF (AutoCAD R12, el formato que abre cualquier versión)
   Sale en MAGNA-SIRGAS / Origen Nacional CTM12, las mismas coordenadas del
   plano 039: las capas del lote, las vías, la protección, los aislamientos,
   la envolvente, las curvas de nivel del MDT y, si hay casa propuesta, sus
   bloques, espacios, puertas y ventanas, para terminar el proyecto en CAD.

   AMARRE: las coordenadas locales del sitio (PX) pasan a CTM12 con una
   transformación afín ajustada por mínimos cuadrados contra los 86 lotes del
   plano 039 (1.677 vértices). Error medido: medio 0,004 m · p95 0,007 m ·
   máximo 0,009 m. Es decir, dentro del milímetro de dibujo del plano.
   ========================================================================= */
const PX2CTM = (()=>{
  const a=1.0003517552383825, b=-0.0037353953330239165, tx=4696165.794949548,
        c=-0.0037344031144466807, d=-1.0007067952879363, ty=2052970.2633624796;
  return p=>[a*p[0]+b*p[1]+tx, c*p[0]+d*p[1]+ty];
})();
const DXF_ERR_M = "0,004 m medio · 0,009 m máximo";

function exportarDXF(n){
  const L=DATA.lotes.find(x=>x.n===n), A=IMPL[String(n)]; if(!L||!A) return null;
  const K=A.k, C=casaIA(n);
  const sinAcento = t=>String(t).normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^\x20-\x7E]/g,"");
  const f=v=>(+v).toFixed(3);
  const out=[];
  const w=(...a)=>a.forEach(x=>out.push(String(x)));
  const CAPAS=[["LOTE",3],["LOTEO",8],["VIA",7],["PROTECCION",92],["AISLAMIENTOS",40],["ENVOLVENTE",30],
               ["CURVAS-MAESTRAS",33],["CURVAS",253],["CASA-MUROS",1],["CASA-CUBIERTO",6],["CASA-PATIO",9],["CASA-DECK",34],
               ["CASA-PISCINA",4],["CASA-ESPACIOS",2],["CASA-PUERTAS",5],["CASA-VENTANAS",4],["CASA-P2-MUROS",1],["CASA-P2-ESPACIOS",2],
               ["CASA-P2-PUERTAS",5],["CASA-P2-VENTANAS",4],["TEXTO",7],["NOTAS",8]];
  let xmin=1e12,ymin=1e12,xmax=-1e12,ymax=-1e12;
  const T=p=>{ const q=PX2CTM(p); xmin=Math.min(xmin,q[0]); xmax=Math.max(xmax,q[0]); ymin=Math.min(ymin,q[1]); ymax=Math.max(ymax,q[1]); return q; };
  const ents=[];
  const poli=(capa,ptsPX,cerrada)=>{
    const P=ptsPX.map(T); if(P.length<2) return;
    ents.push("0","POLYLINE","8",capa,"66","1","70",cerrada?"1":"0","10","0","20","0","30","0");
    P.forEach(q=>ents.push("0","VERTEX","8",capa,"10",f(q[0]),"20",f(q[1]),"30","0"));
    ents.push("0","SEQEND","8",capa);
  };
  const linea=(capa,aPX,bPX)=>{ const p=T(aPX), q=T(bPX); ents.push("0","LINE","8",capa,"10",f(p[0]),"20",f(p[1]),"30","0","11",f(q[0]),"21",f(q[1]),"31","0"); };
  const texto=(capa,pPX,t,h,rot)=>{ const q=T(pPX);
    ents.push("0","TEXT","8",capa,"10",f(q[0]),"20",f(q[1]),"30","0","40",f(h||0.5),"1",sinAcento(t),"50",f(rot||0),"72","1","11",f(q[0]),"21",f(q[1]),"31","0"); };

  /* --- el predio --- */
  const g0=L.g.map(PX);
  poli("LOTE", g0, true);
  const cL=g0.slice(0,-1).reduce((s,p)=>[s[0]+p[0]/(g0.length-1),s[1]+p[1]/(g0.length-1)],[0,0]);
  texto("TEXTO", cL, "LOTE "+n+"  "+Math.round(L.at)+" m2", 2.0);
  DATA.lotes.forEach(o=>{ if(o.n!==n) poli("LOTEO", o.g.map(PX), true); });
  DATA.via.forEach(v=>poli("VIA", v.map(PX), false));
  DATA.prot.forEach(r=>poli("PROTECCION", r.map(PX), true));
  if(A.c) poli("AISLAMIENTOS", A.c, true);
  if(K&&K.g) poli("ENVOLVENTE", K.g, true);
  /* curvas de nivel del MDT, cada metro, recortadas al lote (+6 m) */
  try{
    let bx0=1e9,by0=1e9,bx1=-1e9,by1=-1e9; g0.forEach(q=>{bx0=Math.min(bx0,q[0]);bx1=Math.max(bx1,q[0]);by0=Math.min(by0,q[1]);by1=Math.max(by1,q[1]);});
    const CN=curvasNivel(bx0-6,by0-6,bx1+6,by1+6,q=>q,1.5,1.0);
    CN.forEach(c=>{
      const capa=c.maestra?"CURVAS-MAESTRAS":"CURVAS";
      c.segs.forEach(([a,b])=>{ const m=[(a[0]+b[0])/2,(a[1]+b[1])/2]; if(dentroAnillo(m[0],m[1],g0)) linea(capa,a,b); });
      if(c.maestra&&c.segs.length){ const sg=c.segs[Math.floor(c.segs.length/2)]; const m=[(sg[0][0]+sg[1][0])/2,(sg[0][1]+sg[1][1])/2];
        if(dentroAnillo(m[0],m[1],g0)) texto("CURVAS-MAESTRAS", m, String(Math.round(c.cota)), 0.6); }
    });
  }catch(e){}

  /* --- la casa propuesta --- */
  if(C&&K&&K.o){
    const XY=(u,v)=>[K.o[0]+K.ux[0]*u+K.uv[0]*v, K.o[1]+K.ux[1]*u+K.uv[1]*v];
    const rect=(capa,b)=>poli(capa,[XY(b.u0,b.v0),XY(b.u1,b.v0),XY(b.u1,b.v1),XY(b.u0,b.v1)],true);
    (C.reales||[]).forEach(b=>{
      const p2=(b.nivel||1)===2;
      const capa={muro:p2?"CASA-P2-MUROS":"CASA-MUROS",porche:"CASA-CUBIERTO",patio:"CASA-PATIO",deck:"CASA-DECK",piscina:"CASA-PISCINA"}[b.clase]||"CASA-MUROS";
      rect(capa,b);
      texto("TEXTO", XY((b.u0+b.u1)/2,(b.v0+b.v1)/2), String(b.nombre)+(p2?" (P2)":"")+"  "+Math.round((b.u1-b.u0)*(b.v1-b.v0))+" m2", 0.45);
    });
    [1,2].forEach(nv=>{
      const G=PLANTA_ESQ.armar(C,nv); if(!G.R.length) return;
      const pre=nv===2?"CASA-P2-":"CASA-";
      G.R.forEach(e=>{ rect(pre+"ESPACIOS",e); texto(pre+"ESPACIOS", XY((e.u0+e.u1)/2,(e.v0+e.v1)/2), String(e.nombre)+"  "+Math.round(e.area)+" m2", 0.35); });
      const seg=(capa,h,ancho,off)=>{ /* tramo del vano sobre el muro, desplazado off perpendicular */
        if(h.axis==="u") linea(capa, XY(h.c-ancho/2,h.pos+(off||0)), XY(h.c+ancho/2,h.pos+(off||0)));
        else linea(capa, XY(h.pos+(off||0),h.c-ancho/2), XY(h.pos+(off||0),h.c+ancho/2)); };
      G.puertas.forEach(p=>{
        const h=p.hacia, hacia = p.axis==="u" ? (Math.abs(h.v0-p.pos)<0.06?1:-1) : (Math.abs(h.u0-p.pos)<0.06?1:-1);
        const bis=p.c-p.w/2, pts=[];
        for(let i=0;i<=8;i++){ const a=(Math.PI/2)*i/8;
          pts.push(p.axis==="u" ? XY(bis+p.w*Math.cos(a), p.pos+hacia*p.w*Math.sin(a)) : XY(p.pos+hacia*p.w*Math.sin(a), bis+p.w*Math.cos(a))); }
        poli(pre+"PUERTAS", pts, false);
        linea(pre+"PUERTAS", p.axis==="u"?XY(bis,p.pos):XY(p.pos,bis), p.axis==="u"?XY(bis,p.pos+hacia*p.w):XY(p.pos+hacia*p.w,bis));
      });
      G.aberturas.forEach(a=>seg(pre+"PUERTAS",a,a.w,0));
      G.ventanas.forEach(v=>{ seg(pre+"VENTANAS",v,v.w,-0.05); seg(pre+"VENTANAS",v,v.w,0.05); });
    });
  }
  /* --- notas --- */
  const nota=[ "LAURELES CAMPESTRE - LOTE "+n+" - exportado el "+new Date().toISOString().slice(0,10),
    "Coordenadas MAGNA-SIRGAS / Origen Nacional CTM12, metros. Geometria del plano 039 (09-09-2026).",
    "Amarre local->CTM12 por afin sobre 1677 vertices: error "+DXF_ERR_M+".",
    "Curvas del MDT del levantamiento (1 m). La casa es un anteproyecto esquematico: no es diseno ni licencia." ];
  nota.forEach((t,i)=>texto("NOTAS",[g0[0][0], g0[0][1]+ (i+1)*1.2 + 8], t, 0.7));

  /* --- el archivo --- */
  w("0","SECTION","2","HEADER","9","$ACADVER","1","AC1009","9","$DWGCODEPAGE","3","ANSI_1252",
    "9","$EXTMIN","10",f(xmin),"20",f(ymin),"30","0","9","$EXTMAX","10",f(xmax),"20",f(ymax),"30","0","0","ENDSEC");
  w("0","SECTION","2","TABLES","0","TABLE","2","LTYPE","70","1","0","LTYPE","2","CONTINUOUS","70","0","3","Solid line","72","65","73","0","40","0","0","ENDTAB",
    "0","TABLE","2","LAYER","70",String(CAPAS.length));
  CAPAS.forEach(([nm,col])=>w("0","LAYER","2",nm,"70","0","62",String(col),"6","CONTINUOUS"));
  w("0","ENDTAB","0","ENDSEC","0","SECTION","2","ENTITIES");
  out.push(...ents);
  w("0","ENDSEC","0","EOF");
  return out.join("\n")+"\n";
}
function bajarDXF(n){
  const t=exportarDXF(n); if(!t){ toast(TT("No hay geometría para exportar.","Nothing to export.")); return; }
  const b=new Blob([t],{type:"application/dxf"});
  const a=document.createElement("a"); a.href=URL.createObjectURL(b); a.download="Laureles_lote_"+n+".dxf";
  document.body.appendChild(a); a.click(); setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},1500);
}


/* ---------- la hoja del render: "así se vería" ---------- */
const RENDER_PDF = {};
async function prepararRenderPDF(n){
  const C=casaIA(n); if(!C||!C.render_url) return;
  if(RENDER_PDF[n] && RENDER_PDF[n].url===C.render_url) return;
  try{
    const r=await fetch(C.render_url,{mode:"cors"}); if(!r.ok) throw new Error(r.status);
    const bmp=await createImageBitmap(await r.blob());
    const W=Math.min(1600,bmp.width), H=Math.round(bmp.height*W/bmp.width);
    const c=document.createElement("canvas"); c.width=W; c.height=H; c.getContext("2d").drawImage(bmp,0,0,W,H);
    const b64=c.toDataURL("image/jpeg",0.88).split(",")[1];
    const id="Rn"+n; PDFmin.registrarJPEG(id,b64,W,H); RENDER_PDF[n]={id,w:W,h:H,url:C.render_url};
  }catch(e){ console.warn("render PDF:",e); }
}
function hojaRenderPDF(n,L,A,V){
  const R=RENDER_PDF[n], CI=casaIA(n); if(!R) return null;
  const P=PDFmin.Hoja(595.28,841.89), M=38, W=595.28;
  const col=(c,f)=>f?P.trazo(c[0],c[1],c[2]):P.color(c[0],c[1],c[2]);
  col(V.forest).rect(0,0,W,56);
  const xt=logoEnBanda(P,M,28.0,24);
  col([200,214,192]).texto(xt,32,TT("Así se vería","How it would look","À quoi elle ressemblerait"),8.4,"F1");
  col(V.blanco).textoD(W-M,34,(TT("LOTE ","LOT "))+n,20,"F2");
  col(V.gold).rect(0,56,W,2.5);
  let y=86;
  col(V.gold).texto(M,y,TT("LA CASA PROPUESTA, COMO UNA FOTOGRAFÍA","THE PROPOSED HOUSE, AS A PHOTOGRAPH","LA MAISON PROPOSÉE, COMME UNE PHOTO"),7.6,"F2",1.1); y+=16;
  col(V.muted);
  y=envolver(P, TT("Imagen generada por inteligencia artificial a partir de la captura del volumen implantado en el terreno medido de este lote —la misma casa de "+ent(CI.construida)+" m² de las hojas anteriores, desde la misma cámara—. La IA puso materiales, vegetación y cielo; la forma, la posición y el número de pisos son los del volumen.",
    "Image generated by artificial intelligence from the capture of the volume placed on this lot's measured ground —the same "+ent(CI.construida)+" m² house of the previous pages, from the same camera—. The AI added materials, vegetation and sky; shape, position and number of storeys are those of the volume.",
    "Image générée par IA à partir de la capture du volume implanté sur le terrain mesuré de ce lot ; la forme, la position et le nombre de niveaux sont ceux du volume."), M, y, W-2*M, 8.4, 11);
  y+=6;
  const bw=W-2*M; let iw=bw, ih=iw*R.h/R.w; const maxH=560; if(ih>maxH){ ih=maxH; iw=ih*R.w/R.h; }
  const ix=M+(bw-iw)/2;
  col(V.line,1).grosor(.6).rect(ix-1,y-1,iw+2,ih+2,"S");
  P.imagen(R.id, ix, y, iw, ih);
  y+=ih+14;
  col(V.muted); P.texto(M,y,TT("Imagen ilustrativa · generada con IA · no es un diseño aprobado ni un compromiso de entrega.","Illustrative image · AI generated · not an approved design nor a delivery commitment."),7,"F1");
  const TXT=TT("Esta imagen es una ilustración para conversar sobre la casa que quiere el cliente. No representa un diseño arquitectónico aprobado, ni acabados, ni alcance de obra; las medidas válidas son las de las hojas de bloques y planta esquemática. Precios de trabajo; no es oferta comercial.",
    "This image is an illustration to discuss the house the client wants. It does not represent an approved architectural design, finishes or scope of works; the valid dimensions are those on the block and schematic plan pages. Working prices; not a commercial offer.",
    "Cette image est une illustration pour discuter de la maison souhaitée. Elle ne représente ni un projet approuvé, ni des finitions, ni une étendue de travaux.");
  const WP=W-2*M, AL=lineasEnvolver(TXT,WP,6.6)*8.6, PY=841.89-26-AL;
  col(V.line,1).grosor(.5).linea(M,PY-12,W-M,PY-12);
  col(V.muted); envolver(P,TXT,M,PY,WP,6.6,8.6);
  return P;
}

/* ---------- la hoja de la casa propuesta con la IA ---------- */
function hojaPropuestaPDF(n,L,A,V){
  const CI=casaIA(n), BI=bloquesIA(n)||[];
  const P=PDFmin.Hoja(595.28,841.89), M=38, W=595.28;
  const col=(c,f)=>f?P.trazo(c[0],c[1],c[2]):P.color(c[0],c[1],c[2]);
  col(V.forest).rect(0,0,W,56);
  const xt = logoEnBanda(P, M, 28.0, 24);
  col([200,214,192]).texto(xt,32,TT("La casa que pediste","The house you asked for","La maison demandée"),8.4,"F1");
  col(V.blanco).textoD(W-M,34,(TT("LOTE ","LOT "))+n,20,"F2");
  col(V.gold).rect(0,56,W,2.5);
  let y=86;
  col(V.gold).texto(M,y,TT("LO QUE PIDIÓ EL CLIENTE","WHAT THE CLIENT ASKED FOR","CE QUE LE CLIENT A DEMANDÉ"),7.6,"F2",1.1); y+=15;
  const conv=(CI.conversacion||[]).slice(-6);
  if(!conv.length){ col(V.muted); y=envolver(P, TT("Sin registro de la conversación.","No conversation record.","Pas d'historique."), M, y, W-2*M, 8.4, 11); }
  conv.forEach(m=>{
    if(y>560) return;
    if(m.rol==="usuario"){ col(V.ink); y=envolver(P, "› "+String(m.texto||""), M, y, W-2*M, 8.6, 11.2); y+=2; }
    else { col(V.muted); y=envolver(P, String(m.texto||""), M+12, y, W-2*M-12, 8.2, 10.8); y+=5; }
  });
  y+=8;
  col(V.gold).texto(M,y,TT("LA CASA, BLOQUE POR BLOQUE","THE HOUSE, BLOCK BY BLOCK","LA MAISON, BLOC PAR BLOC"),7.6,"F2",1.1); y+=14;
  /* tabla: nombre · uso · nivel · medidas · área */
  const cx=[M, M+150, M+280, M+340, M+430, W-M];
  const cab=[TT("Bloque","Block","Bloc"),TT("Uso","Use","Usage"),TT("Nivel","Level","Niveau"),TT("Medidas (m)","Size (m)","Dimensions (m)"),TT("Área","Area","Surface")];
  col(V.muted); cab.forEach((t,i)=>{ if(i<4) P.texto(cx[i],y,t,7,"F2"); else P.textoD(cx[5],y,t,7,"F2"); });
  y+=5; col(V.line,1).grosor(.5).linea(M,y,W-M,y); y+=10;
  BI.forEach(b=>{
    if(y>760) return;
    col(COLOR_IA[b.clase]||[70,88,64]); P.rect(cx[0],y-6,6,6);
    col(V.ink); P.texto(cx[0]+10,y,String(b.nombre).slice(0,28),8.2,"F1");
    P.texto(cx[1],y,claseIAtxt(b.clase),8.2,"F1");
    P.texto(cx[2],y,b.nivel===2?TT("Piso alto","Upper","Étage"):TT("Planta baja","Ground","RDC"),8.2,"F1");
    P.texto(cx[3],y,dec(b.u1-b.u0,1)+" × "+dec(b.v1-b.v0,1)+(b.clase==="muro"||b.clase==="porche"?"  h "+dec(b.alto||3.4,1):""),8.2,"F1");
    P.textoD(cx[5],y,ent(b.area)+" m²",8.2,"F1");
    y+=6; col(V.line,1).grosor(.3).linea(M,y,W-M,y); y+=10;
  });
  y+=6;
  const tot=[[TT("Área construida (muros + cubiertos, todos los niveles)","Built area (walls + covered, all levels)","Surface bâtie"), ent(CI.construida)+" m²"],
             [TT("Tope del 30 % del área útil","30 % cap of usable area","Plafond 30 %"), ent(OCUP30(L))+" m²"],
             [TT("Huella en planta baja","Ground-floor footprint","Emprise au sol"), ent(CI.huella)+" m²"]];
  if(CI.piscina) tot.push([TT("Piscina (no cuenta como construida)","Pool (not counted as built)","Piscine (non comptée)"), ent(CI.piscina)+" m²"]);
  tot.forEach(([k,v],i)=>{ col(i===0?V.ink:V.muted); P.texto(M,y,k,8.4,i===0?"F2":"F1"); col(V.ink); P.textoD(W-M,y,v,9,"F2"); y+=13; });
  if(CI.construida>OCUP30(L)){ col([163,52,28]); P.texto(M,y,TT("Atención: excede el 30 % en "+ent(CI.construida-OCUP30(L))+" m².","Note: exceeds the 30 % cap by "+ent(CI.construida-OCUP30(L))+" m².","Attention : dépasse les 30 % de "+ent(CI.construida-OCUP30(L))+" m²."),8.4,"F2"); y+=13; }
  /* pie */
  const TXT=TT("La casa de esta hoja es la que el asesor armó con el cliente en el configurador del sitio. La geometría, las áreas y la regla del 30 % las calcula el motor del sitio, no la inteligencia artificial, que sólo tradujo lo que pidió el cliente a bloques. Es un ejercicio de escala y ubicación sobre la envolvente que cabe tras aislamientos: no es un diseño arquitectónico ni una licencia. El movimiento de tierra del informe es el de la envolvente medida contra el terreno.",
    "The house on this page is the one the advisor built with the client in the site's configurator. Geometry, areas and the 30 % rule are computed by the site engine, not by the AI, which only translated the client's request into blocks. It is a scale and siting exercise on the envelope that fits after setbacks: it is not an architectural design nor a permit. Earthworks in this report are those of the envelope against the measured ground.",
    "La maison de cette page est celle que le conseiller a construite avec le client dans le configurateur du site. La géométrie, les surfaces et la règle des 30 % sont calculées par le moteur du site, pas par l'IA. Ce n'est ni un projet architectural ni un permis.");
  const WP=W-2*M, AL=lineasEnvolver(TXT,WP,6.6)*8.6, PY=841.89-26-AL;
  col(V.line,1).grosor(.5).linea(M,PY-12,W-M,PY-12);
  col(V.muted); envolver(P,TXT,M,PY,WP,6.6,8.6);
  return P;
}
function hojaIsoPDF(n,L,A,casa,V){
  const P=PDFmin.Hoja(595.28,841.89), M=38;
  const col=(c,f)=>f?P.trazo(c[0],c[1],c[2]):P.color(c[0],c[1],c[2]);
  col(V.forest).rect(0,0,595.28,56);
  const xt = logoEnBanda(P, M, 28.0, 24);
  col([200,214,192]).texto(xt,32,TT("El sol sobre la casa","The sun over the house",
    "Le soleil au-dessus de la maison"),8.4,"F1");
  col(V.blanco).textoD(595.28-M,34,(TT("LOTE ","LOT "))+n,20,"F2");
  col(V.gold).rect(0,56,595.28,2.5);

  let y=86;
  col(V.gold).texto(M,y,TT("RECORRIDO DEL SOL SOBRE LA CASA","PATH OF THE SUN OVER THE HOUSE",
    "COURSE DU SOLEIL AU-DESSUS DE LA MAISON"),7.6,"F2",1.1);
  y+=16;
  col(V.muted);
  const CIi=casaIA(n);
  y=envolver(P, CIi ? TT("La casa propuesta con el cliente —"+ent(CIi.construida)+" m² construidos"+(CIi.piscina?", con piscina":"")+"— puesta sobre el terreno medido de este lote "+
      "—su forma real y su pendiente, del plano 039— con la orientación de la implantación, y encima el recorrido del sol en los tres "+
      "momentos que mandan el año: el solsticio de junio, los equinoccios y el solsticio de diciembre. Los soles "+
      "marcan las 8 de la mañana, el mediodía y las 4 de la tarde.",
    "The house proposed with the client —"+ent(CIi.construida)+" m² built"+(CIi.piscina?", with pool":"")+"— placed on this lot's measured ground, "+
      "with the path of the sun on the three dates that rule the year: the June solstice, the equinoxes and the December solstice. "+
      "The suns mark 8 in the morning, noon and 4 in the afternoon.",
    "La maison proposée avec le client —"+ent(CIi.construida)+" m² bâtis— posée sur le terrain mesuré de ce lot, avec la course du soleil "+
      "aux trois moments qui rythment l'année. Les soleils marquent 8 h, midi et 16 h.")
    : TT("El volumen del tipo de "+TIPOS_CASA[TAM_CASA].et+" puesto sobre el terreno medido de este lote "+
      "—su forma real y su pendiente, del plano 039— con la orientación de la implantación, y encima el recorrido del sol en los tres "+
      "momentos que mandan el año: el solsticio de junio, los equinoccios y el solsticio de diciembre. Los soles "+
      "marcan las 8 de la mañana, el mediodía y las 4 de la tarde.",
    "The "+TIPOS_CASA[TAM_CASA].et+" type volume placed on this lot's measured ground —its real shape and slope "+
      "from plan 039— at the orientation of the implantation, with the path of the sun on the three dates that "+
      "rule the year: the June solstice, the equinoxes and the December solstice. The suns mark 8 in the morning, "+
      "noon and 4 in the afternoon.",
    "Le volume du type de "+TIPOS_CASA[TAM_CASA].et+" posé sur le terrain mesuré de ce lot —sa forme réelle et sa "+
      "pente, du plan 039— à l'orientation de l'implantation, avec la course du soleil aux trois moments qui "+
      "rythment l'année : le solstice de juin, les équinoxes et le solstice de décembre. Les soleils marquent "+
      "8 h, midi et 16 h."), M, y, 595.28-2*M, 8.4, 11);
  y+=8;

  const bw=595.28-2*M, bh=430;
  col([248,247,241]).rect(M,y,bw,bh);
  col(V.line,1).grosor(.6).rect(M,y,bw,bh,"S");
  dibujarIsoPDF(P,V,n,L,A,M,y,bw,bh);
  y+=bh+18;

  /* los tres hitos, en cifras */
  col(V.gold).texto(M,y,TT("LAS TRES FECHAS, EN CIFRAS","THE THREE DATES, IN FIGURES",
    "LES TROIS DATES, EN CHIFFRES"),7.6,"F2",1.1);
  y+=16;
  const cx=[M, M+150, M+250, M+380];
  col(V.muted);
  [T("Sale"),T("Mediodía"),T("Se pone")].forEach((t,i)=>P.texto(cx[i+1],y,t,6.8,"F2",.8));
  y+=6; col(V.line,1).grosor(.6).linea(M,y,595.28-M,y); y+=13;
  HITOS.forEach(h=>{
    const cc=String(h.c).replace("#",""),
      rr=parseInt(cc.slice(0,2),16),gg=parseInt(cc.slice(2,4),16),bb=parseInt(cc.slice(4,6),16);
    col([rr,gg,bb]).rect(M,y-6,6,6);
    col(V.ink).texto(M+11,y,LANG==="es"?h.t:T(h.t),8.4,"F2");
    col(V.muted).texto(cx[1],y,hhmm(h.salida.h)+"  ·  "+h.salida.az.toFixed(0)+"°",7.8,"F1");
    col(V.muted).texto(cx[2],y,h.mediodia.alt.toFixed(0)+TT("° al ","° to the ","° au ")+rumboTxt(h.mediodia.az),7.8,"F1");
    col(V.muted).texto(cx[3],y,hhmm(h.puesta.h)+"  ·  "+h.puesta.az.toFixed(0)+"°",7.8,"F1");
    y+=9; col(V.line,1).grosor(.35).linea(M,y,595.28-M,y); y+=13;
  });
  y+=6;
  col(V.muted);
  envolver(P, TT("Posiciones calculadas con el algoritmo de la NOAA para 4,47° N y 75,74° O, hora de Colombia "+
      "(UTC−5). La casa va a 5 m de altura en el volumen del acceso y 3,4 m en el resto.",
    "Positions computed with the NOAA algorithm for 4.47° N, 75.74° W, Colombian time (UTC−5). The house is "+
      "5 m tall at the entrance volume and 3.4 m elsewhere.",
    "Positions calculées avec l'algorithme de la NOAA pour 4,47° N et 75,74° O, heure de Colombie (UTC−5). "+
      "La maison fait 5 m de haut au volume d'entrée et 3,4 m ailleurs."),
    M, y, 595.28-2*M, 7, 9.6);
  return P;
}

/* --------- segunda hoja: el sol en cada fachada y el recorrido de la sombra -------- */
function hojaSolarPDF(n,L,A,casa,ej,V){
  const P=PDFmin.Hoja(595.28,841.89), M=38;
  const col=(c,f)=>f?P.trazo(c[0],c[1],c[2]):P.color(c[0],c[1],c[2]);
  col(V.forest).rect(0,0,595.28,56);
  const xt = logoEnBanda(P, M, 28.0, 24);
  col([200,214,192]).texto(xt,32,TT("Estudio de asoleación","Solar study"),8.4,"F1");
  col(V.blanco).textoD(595.28-M,34,(TT("LOTE ","LOT "))+n,20,"F2");
  col(V.gold).rect(0,56,595.28,2.5);

  let y=86;
  col(V.gold).texto(M,y,TT("HORAS DE SOL DIRECTO EN CADA FACHADA","HOURS OF DIRECT SUN ON EACH FACADE"),7.6,"F2",1.1);
  y+=16;
  col(V.muted);
  y=envolver(P, TT("Medidas de salida a puesta y sin nada que le haga sombra al volumen. Es la cifra que decide dónde van las "+
      "alcobas y qué caras piden alero.",
    "Measured from sunrise to sunset with nothing shading the volume. It is the figure that decides where the "+
      "bedrooms go and which faces need an eave."), M, y, 595.28-2*M, 8.4, 11);
  y+=6;

  const fs=fachadasCasa(casa.g);
  const filas=fs.map(f=>({f:f,h:SOL.FECHAS.map(x=>horasSolFachada(f.az,x))}));
  const maxH=Math.max(6,...filas.map(r=>Math.max(...r.h)));
  const cw=(595.28-2*M-118)/3;
  col(V.muted);
  SOL.FECHAS.forEach((f,i)=>{
    const t=(f.k==="jun"?TT("21 jun","21 Jun"):f.k==="eq"?TT("20 mar","20 Mar"):TT("21 dic","21 Dec"));
    P.texto(M+118+i*cw, y, t, 7.4,"F2");
  });
  y+=12;
  filas.forEach(r=>{
    col(V.ink).texto(M,y+7,r.f.nombre.charAt(0).toUpperCase()+r.f.nombre.slice(1),8.6,"F2");
    col(V.muted).texto(M,y+16,r.f.az.toFixed(0)+"°  ·  "+dec(r.f.largo,1)+" m",7,"F1");
    r.h.forEach((h,i)=>{
      const x=M+118+i*cw, an=cw-34;
      col([232,230,220]).rect(x,y+3,an,7);
      const cc=SOL.FECHAS[i].c.replace("#",""),
            rr=parseInt(cc.slice(0,2),16),gg=parseInt(cc.slice(2,4),16),bb=parseInt(cc.slice(4,6),16);
      col([rr,gg,bb]).rect(x,y+3,Math.max(1,an*h/maxH),7);
      col(V.ink).texto(x+an+5,y+9.5,hDec(h),7.6,"F2");
    });
    y+=24;
  });
  col(V.ink).texto(M,y+7,TT("Cubierta","Roof"),8.6,"F2");
  col(V.muted).texto(M,y+16,TT("sol sobre el horizonte","sun above the horizon"),7,"F1");
  SOL.FECHAS.forEach((f,i)=>{
    col(V.ink).texto(M+118+i*cw, y+9.5, hDec(horasSolCubierta(f)), 7.6,"F2");
  });
  y+=34;

  col(V.gold).texto(M,y,TT("POR DÓNDE CORRE LA SOMBRA EN EL DÍA","WHERE THE SHADOW FALLS THROUGH THE DAY"),7.6,"F2",1.1);
  y+=14;
  const bw=595.28-2*M, bh=300;
  col([248,247,241]).rect(M,y,bw,bh);
  col(V.line,1).grosor(.6).rect(M,y,bw,bh,"S");
  dibujarAbanicoPDF(P,V,L,A,casa,M,y,bw,bh,1);
  y+=bh+16;
  col(V.muted);
  envolver(P, TT("El mismo volumen a las 7, 9 y 11 de la mañana y a la 1, 3 y 5 de la tarde, en el equinoccio. Muestra qué "+
      "parte del lote queda libre en la tarde y dónde tienen sentido la terraza o la piscina. No incluye la sombra "+
      "de los árboles, ni la de la propia ladera, ni la de las casas vecinas.",
    "The same volume at 7, 9 and 11 in the morning and 1, 3 and 5 in the afternoon, on the equinox. It shows "+
      "which part of the lot stays free in the afternoon and where the terrace or the pool make sense. Shade from "+
      "trees, from the slope itself and from neighbouring houses is not included."), M, y, bw, 7, 9.4);

  const py=808;
  col(V.line,1).grosor(.5).linea(M,py-12,595.28-M,py-12);
  col(V.muted).texto(M,py, TT("Posiciones del sol calculadas para latitud 4,47° N, longitud 75,74° O, hora de Colombia (UTC−5), con una casa de 5 m.","Sun positions computed for latitude 4.47° N, longitude 75.74° W, Colombian time (UTC−5), with a house 5 m tall."),
    6.8,"F1");
  col(V.forest).textoD(595.28-M,py,T("Generado el")+" "+new Date().toLocaleDateString(LOC()),6.8,"F2");
  return P;
}
function dibujarAbanicoPDF(P,V,L,A,casa,px0,py0,pw,ph,iFecha){
  const col=(c,f)=>f?P.trazo(c[0],c[1],c[2]):P.color(c[0],c[1],c[2]);
  const g0=L.g.map(PX);
  let mej=0, th=0;
  for(let i=0;i<g0.length-1;i++){
    const dx=g0[i+1][0]-g0[i][0], dy=g0[i+1][1]-g0[i][1], Lg=Math.hypot(dx,dy);
    if(Lg>mej){ mej=Lg; th=-Math.atan2(dy,dx); }
  }
  const ct=Math.cos(th), stt=Math.sin(th);
  const R=p=>[p[0]*ct-p[1]*stt, p[0]*stt+p[1]*ct];
  const f=SOL.FECHAS[iFecha];
  const HORAS=[7,9,11,13,15,17];
  /* con casa propuesta la sombra sale de sus bloques cubiertos y su altura */
  const HCa=huellaCasa(L.n), BIa=bloquesIA(L.n);
  const gS=(HCa&&HCa.ia)?HCa.g:A.k.g, hS=(HCa&&HCa.ia)?HCa.h:ALTURA_MAX;
  const som=HORAS.map(h=>{ const p=SOL.posicion(ANIO,f.m,f.d,h,lat0,lon0);
    return {h:h, s:(p.alt>3? sombraCasa(gS,p.alt,p.az,hS):null)}; }).filter(x=>x.s);
  let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
  const met=q=>{x0=Math.min(x0,q[0]);x1=Math.max(x1,q[0]);y0=Math.min(y0,q[1]);y1=Math.max(y1,q[1]);};
  g0.map(R).forEach(met); casa.g.map(R).forEach(met);
  som.forEach(o=>o.s.map(R).forEach(met));
  const pad=6; x0-=pad;x1+=pad;y0-=pad;y1+=pad;
  const s=Math.min((pw-26)/(x1-x0),(ph-26)/(y1-y0));
  const ox=px0+(pw-(x1-x0)*s)/2, oy=py0+(ph-(y1-y0)*s)/2;
  const XY=p=>{const q=R(p);return [ox+(q[0]-x0)*s, oy+(q[1]-y0)*s];};
  P.guarda(); P.recorte([[px0,py0],[px0+pw,py0],[px0+pw,py0+ph],[px0,py0+ph]]);
  col([240,239,227]); P.poli(g0.map(XY),"f");
  som.forEach((ob,i)=>{
    const t=i/Math.max(1,som.length-1), g=Math.round(150-40*Math.abs(t-0.5)*2);
    col([g,g+4,g-6]); P.poli(ob.s.map(XY),"f");
  });
  col([64,78,58],1).grosor(1.3); P.poli(g0.map(XY),"S");
  if(BIa){
    const orden={patio:0,deck:1,piscina:2,porche:3,muro:4};
    BIa.slice().sort((a,b)=>(orden[a.clase]-orden[b.clase])||(a.nivel-b.nivel)).forEach(b=>{
      if(b.nivel===2) return;
      col(COLOR_IA[b.clase]); P.poli(b.g.map(XY),"f");
      col([28,38,25],1).grosor(.5); P.poli(b.g.map(XY),"S");
    });
  } else {
    col([70,88,64]); P.poli(casa.g.map(XY),"f");
    col([28,38,25],1).grosor(.8); P.poli(casa.g.map(XY),"S");
  }
  /* cerca del mediodía las sombras casi no salen de la casa y sus rótulos
     caían uno sobre otro (MEDIDO: 11a sobre 1p en el lote 27): el que no
     tenga 10 pt libres respecto al anterior no se escribe */
  const puestos=[];
  som.forEach(ob=>{
    const c=ob.s.reduce((a,p)=>[a[0]+p[0]/ob.s.length,a[1]+p[1]/ob.s.length],[0,0]);
    const q=XY(c);
    if(puestos.some(r=>Math.hypot(r[0]-q[0],r[1]-q[1])<10)) return;
    puestos.push(q); col([255,255,255]);
    P.textoC(q[0],q[1]+2.5,(ob.h>12?ob.h-12:ob.h)+(ob.h<12?"a":"p"),7,"F2");
  });
  P.recupera();
  const nx=px0+pw-20, ny=py0+21;
  const gn=a=>[nx+(a[0]*Math.cos(th)-a[1]*Math.sin(th)), ny+(a[0]*Math.sin(th)+a[1]*Math.cos(th))];
  col([60,70,56]); P.poli([[0,-9],[3.2,4],[0,1.6],[-3.2,4]].map(gn),"f");
  const e=gn([0,13]); P.textoC(e[0],e[1]+2.5,"N",7,"F2");
}
/* Cuántas líneas ocupa un texto al envolverlo, sin dibujarlo. Se necesita
   para saber dónde empieza el pie ANTES de pintar lo que va encima: el pie de
   la ficha creció a cuatro líneas y se le montaba encima la leyenda de la rosa
   solar —MEDIDO en el lote 44: la leyenda caía en y=792 y el pie ocupaba de
   784 a 817—. */
function lineasEnvolver(txt,w,t){
  const pal=String(txt).split(" "); let ln="", n=1;
  pal.forEach(p=>{
    const pr=ln?ln+" "+p:p;
    if(PDFmin.ancho(pr,t,"F1")>w){ n++; ln=p; } else ln=pr;
  });
  return n;
}
function envolver(P,txt,x,y,w,t,lh){
  const pal=String(txt).split(" "); let ln="";
  pal.forEach(p=>{
    const pr=ln?ln+" "+p:p;
    if(PDFmin.ancho(pr,t,"F1")>w){ P.texto(x,y,ln,t,"F1"); y+=lh; ln=p; } else ln=pr;
  });
  if(ln)P.texto(x,y,ln,t,"F1");
  return y+lh;
}

/* --------------- dibujos vectoriales dentro del PDF -------------------- */
function dibujarPlantaPDF(P,V,L,A,casa,px0,py0,pw,ph){
  const col=(c,f)=>f?P.trazo(c[0],c[1],c[2]):P.color(c[0],c[1],c[2]);
  const g0=L.g.map(PX);
  /* se gira el dibujo para que el lado más largo quede horizontal y el lote
     ocupe todo el recuadro; el norte se gira con él */
  let mej=0, th=0;
  for(let i=0;i<g0.length-1;i++){
    const dx=g0[i+1][0]-g0[i][0], dy=g0[i+1][1]-g0[i][1], Lg=Math.hypot(dx,dy);
    if(Lg>mej){ mej=Lg; th=-Math.atan2(dy,dx); }
  }
  const ct=Math.cos(th), stt=Math.sin(th);
  const R=p=>[p[0]*ct-p[1]*stt, p[0]*stt+p[1]*ct];
  const g=g0.map(R);
  let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
  const met=p=>{x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);y0=Math.min(y0,p[1]);y1=Math.max(y1,p[1]);};
  g.forEach(met); if(A.c)A.c.map(R).forEach(met); if(casa)casa.g.map(R).forEach(met);
  /* la vía tiene que salir en el dibujo —si no, el antejardín no se entiende—,
     pero sin dejar que el encuadre se abra de más */
  const lim=[x0-18,y0-18,x1+18,y1+18];
  DATA.via.forEach(v=>v.map(PX).map(R).forEach(q=>{
    if(q[0]>lim[0]&&q[0]<lim[2]&&q[1]>lim[1]&&q[1]<lim[3]) met(q); }));
  x0=Math.max(x0,lim[0]); y0=Math.max(y0,lim[1]);
  x1=Math.min(x1,lim[2]); y1=Math.min(y1,lim[3]);
  const pad=6; x0-=pad;x1+=pad;y0-=pad;y1+=pad;
  const s=Math.min((pw-26)/(x1-x0),(ph-34)/(y1-y0));
  const ox=px0+(pw-(x1-x0)*s)/2, oy=py0+(ph-(y1-y0)*s)/2;
  const XY=p=>{const q=R(p);return [ox+(q[0]-x0)*s, oy+(q[1]-y0)*s];};

  P.guarda();
  P.recorte([[px0,py0],[px0+pw,py0],[px0+pw,py0+ph],[px0,py0+ph]]);
  col([240,239,227]); P.poli(g0.map(XY),"f");

  /* Las curvas de nivel sobre la planta: es lo que pedía el cliente para leer el
     lote sin tener que abrir el plano topográfico. Se calculan del mismo modelo
     de alturas que las demás figuras, en este mismo marco girado, y se recortan
     al lote dibujándolas antes que todo lo demás. */
  const RinvP = q=>[q[0]*ct+q[1]*stt, -q[0]*stt+q[1]*ct];
  const CNP = curvasNivel(x0, y0, x1, y1, RinvP, 2.0, 1.0);
  const rotP = [];
  CNP.forEach(c=>{
    col(c.maestra?[150,146,128]:[186,183,166],1).grosor(c.maestra?0.55:0.28);
    c.segs.forEach(([a,b])=>{
      const pa=RinvP(a), pb=RinvP(b);
      if(!dentroAnillo((pa[0]+pb[0])/2,(pa[1]+pb[1])/2,g0)) return;
      P.linea(ox+(a[0]-x0)*s, oy+(a[1]-y0)*s, ox+(b[0]-x0)*s, oy+(b[1]-y0)*s);
    });
    if(c.maestra && c.segs.length){
      const sg=c.segs[Math.floor(c.segs.length/2)];
      const mx=(sg[0][0]+sg[1][0])/2, my=(sg[0][1]+sg[1][1])/2;
      const pm=RinvP([mx,my]);
      if(!dentroAnillo(pm[0],pm[1],g0)) return;
      const qx=ox+(mx-x0)*s, qy=oy+(my-y0)*s;
      if(rotP.some(r=>Math.abs(r[0]-qx)<26 && Math.abs(r[1]-qy)<9)) return;
      rotP.push([qx,qy]);
      col([120,116,100]); P.texto(qx-8, qy+2, ent(c.cota), 5.4, "F2");
    }
  });

  /* todo se dibuja y el recorte del recuadro se encarga de lo que sobra:
     filtrar por vértices dejaba fuera las vías que sólo cruzan el encuadre */
  const cortaCaja=ps=>{
    let dentro=false, prev=null;
    for(const p of ps){ const q=R(p);
      const d=q[0]>x0-40&&q[0]<x1+40&&q[1]>y0-40&&q[1]<y1+40;
      if(d||(prev&&prev.d)) dentro=true;
      prev={d};
    }
    return dentro;
  };
  DATA.prot.forEach(r=>{ const rr=r.map(PX);
    if(cortaCaja(rr)){ col([198,216,193]); P.poli(rr.map(XY),"f");
      col(V.prot,1).grosor(.5); P.poli(rr.map(XY),"S"); } });

  /* La parte del lote SIN curvas de nivel va rayada también en la hoja que se
     entrega. En pantalla se resuelve con un patrón; aquí el PDF no los maneja,
     así que se trazan las diagonales a mano: se recorre cada recta a 45° y se
     dibujan sólo los tramos que caen dentro del lote y fuera del levantamiento.
     Sin esto la hoja impresa deja esa franja igual que el resto y se lee como
     terreno medido, que es justo lo que no es. */
  if(A && A.cob!=null && A.cob<0.98){
    const RinvH = q=>[q[0]*ct+q[1]*stt, -q[0]*stt+q[1]*ct];
    const paso = 3.0/s;                 /* separación entre rayas, en metros */
    const dt   = 1.2/s;                 /* avance al recorrer la raya */
    const nd = (rx,ry)=>{ const q=RinvH([rx,ry]);
      return dentroAnillo(q[0],q[1],g0) && isNaN(MDT.cota(q[0],q[1])); };
    col([196,138,42],1).grosor(0.85);
    const c0 = x0-(y1-y0), c1 = x1;
    for(let c=c0; c<=c1; c+=paso*1.414){
      let ini=null, ult=null;
      for(let ry=y0; ry<=y1; ry+=dt){
        const rx=c+(ry-y0);
        const dentro = rx>=x0 && rx<=x1 && nd(rx,ry);
        if(dentro){ if(ini===null) ini=[rx,ry]; ult=[rx,ry]; }
        else if(ini){
          P.linea(ox+(ini[0]-x0)*s, oy+(ini[1]-y0)*s, ox+(ult[0]-x0)*s, oy+(ult[1]-y0)*s);
          ini=null;
        }
      }
      if(ini) P.linea(ox+(ini[0]-x0)*s, oy+(ini[1]-y0)*s, ox+(ult[0]-x0)*s, oy+(ult[1]-y0)*s);
    }
  }

  DATA.via.forEach(v=>{ const vv=v.map(PX);
    col([255,255,255],1).grosor(Math.max(2,5.5*s)); P.poli(vv.map(XY),"S",false);
    col([176,180,162],1).grosor(.5); P.poli(vv.map(XY),"S",false); });
  col([64,78,58],1).grosor(1.4); P.poli(g0.map(XY),"S");   /* el lindero del lote, encima de todo */
  if(A.c){ col(V.gold,1).grosor(1).raya(3,2.5); P.poli(A.c.map(XY),"S"); P.raya(0); }
  const BIpdf = casa ? bloquesIA(L.n) : null;
  if(BIpdf){
    col([70,88,64],1).grosor(.6).raya(2,2); P.poli(casa.g.map(XY),"S"); P.raya(0);
    const orden={patio:0,deck:1,piscina:2,porche:3,muro:4};
    BIpdf.slice().sort((a,b)=>(orden[a.clase]-orden[b.clase])||(a.nivel-b.nivel)).forEach(b=>{
      const pts=b.g.map(XY);
      if(b.nivel===2){ col([244,242,234],1).grosor(.9).raya(2,1.5); P.poli(pts,"S"); P.raya(0); }
      else { col(COLOR_IA[b.clase]); P.poli(pts,"f"); col([28,38,25],1).grosor(.5); P.poli(pts,"S"); }
      const c=b.g.slice(0,-1).reduce((a,p)=>[a[0]+p[0]/4,a[1]+p[1]/4],[0,0]), q=XY(c);
      const anchoDib=Math.hypot(pts[0][0]-pts[1][0],pts[0][1]-pts[1][1]);
      const rot=String(b.nombre)+(b.nivel===2?" ^":"");
      if((b.clase==="muro"||b.clase==="piscina"||b.clase==="porche") && PDFmin.ancho(rot,5.6,"F2") < anchoDib*0.9){
        col(b.clase==="muro"?[244,242,234]:[28,34,27]); P.textoC(q[0],q[1]+2,rot,5.6,"F2");
      }
    });
  }
  else if(casa){
    col([70,88,64]); P.poli(casa.g.map(XY),"f");
    col([28,38,25],1).grosor(.8); P.poli(casa.g.map(XY),"S");
    const c=casa.g.slice(0,-1).reduce((a,p)=>[a[0]+p[0]/4,a[1]+p[1]/4],[0,0]);
    const q=XY(c);
    const rot = casa.mod==="2p" ? ent(casa.an)+" m² × 2" : ent(casa.at)+" m²";
    /* ¿cabe el rótulo dentro de la huella tal como quedó dibujada? */
    const px=casa.g.map(p=>XY(p));
    const anchoDib=Math.max(...px.map(p=>p[0]))-Math.min(...px.map(p=>p[0]));
    const altoDib =Math.max(...px.map(p=>p[1]))-Math.min(...px.map(p=>p[1]));
    if(PDFmin.ancho(rot,7.5,"F2") < anchoDib*0.86){
      col([255,255,255]); P.textoC(q[0],q[1]+3,rot,7.5,"F2");
    } else {
      col([40,52,36]); P.textoC(q[0], q[1]+altoDib/2+10, rot, 7,"F2");
    }
  }
  P.recupera();
  /* norte */
  const nx=px0+pw-20, ny=py0+21;
  const gn=a=>{const c2=Math.cos(th),s2=Math.sin(th);
    return [[nx+ (a[0]*c2-a[1]*s2), ny+ (a[0]*s2+a[1]*c2)]][0];};
  col([60,70,56]); P.poli([[0,-9],[3.2,4],[0,1.6],[-3.2,4]].map(gn),"f");
  const et2=gn([0,13]); P.textoC(et2[0],et2[1]+2.5,"N",7,"F2");
  /* escala */
  const m=[10,20,25,50].find(v=>v*s<pw*0.30)||10, bx=px0+pw-16-m*s, by=py0+ph-13;
  col([60,70,56],1).grosor(1); P.linea(bx,by,bx+m*s,by);
  P.linea(bx,by-3,bx,by+3); P.linea(bx+m*s,by-3,bx+m*s,by+3);
  col([60,70,56]); P.textoD(bx-5,by+2.5,m+" m",7,"F1");
  /* leyenda */
  let ly=py0+ph-38;
  const CI=casaIA(L.n);
  const leg=[[[70,88,64], CI
      ? (TT("Casa propuesta","Proposed house","Maison proposée")+" · "+ent(CI.construida)+" m² "+TT("construidos","built","bâtis")+
         (CI.piscina?" · "+TT("piscina","pool","piscine")+" "+ent(CI.piscina)+" m²":""))
      : casa
      ? (T("Volumen de prueba")+" "+dec(casa.L,1)+" × "+dec(casa.A,1)+" m"+
         (casa.mod==="2p" ? (TT(" en dos niveles"," on two levels")) : (TT(" en un piso"," on one storey"))))
      : T("Volumen de prueba")],
             [[198,216,193],T("Faja de protección")]];
  if(CI && CI.piscina) leg.push([COLOR_IA.piscina, TT("Piscina y deck","Pool and deck","Piscine et deck")]);
  if(A.c)leg.push([[201,170,110],T("Suelo donde puede ir la casa (aislamientos y antejardín)")]);
  const rayado = (A.cob!=null && A.cob<0.98);
  if(rayado) leg.push([null,T("Sin levantar · pendiente de más del 25 % declarada en campo")]);
  if(rayado) ly-=10;
  if(CI && CI.piscina) ly-=10;
  leg.forEach(([c,t])=>{
    if(c){ col(c); P.rect(px0+14,ly-5,7,7); }
    else { /* la casilla del rayado se dibuja con tres diagonales */
      col([248,240,224]); P.rect(px0+14,ly-5,7,7);
      col([196,138,42],1).grosor(.8);
      for(let k=-1;k<=1;k++){ const d=k*2.6;
        P.linea(px0+14+Math.max(0,d), ly-5+Math.max(0,-d)+ (d<0?0:0),
                px0+14+Math.min(7,7+d), ly+2+Math.min(0,-d)); }
      col([138,95,20],1).grosor(.4); P.rect(px0+14,ly-5,7,7,"S");
    }
    col([90,96,84]); P.texto(px0+25,ly+1,t,6.6,"F1"); ly+=10; });
}
/* El bloque del sol de la ficha: rosa a la izquierda, tabla y veredicto a la
   derecha. Va en su propia función porque a veces se dibuja en la hoja 2 y a
   veces en una hoja aparte, cuando en la 2 ya no cabe. */
function bloqueSolPDF(P,V,M,y,PIE_Y,ej,ver,parcial){
  const col=(c,f)=>f?P.trazo(c[0],c[1],c[2]):P.color(c[0],c[1],c[2]);
  y += parcial ? 4 : 20;
  col(V.gold).texto(M,y,T("EL SOL SOBRE EL LOTE"),7.6,"F2",1.1); y+=12;
  const TOPE_SOL = PIE_Y - 16;
  /* la leyenda de la rosa son dos filas de 8,8 pt más el aire de 18 */
  const ALTO_LEY = 2*8.8 + 20;
  let RS = Math.min(parcial?108:132, TOPE_SOL - y - ALTO_LEY);
  RS = Math.max(74, RS);
  dibujarSolPDF(P,V,M,y,RS,ej?ej.rumbo:null);
  /* La columna de texto arranca donde termina la rosa, no en un sitio fijo:
     cuando la rosa se achica porque hay poco alto, el texto gana ancho y baja
     de tres líneas a dos, que es justo lo que hacía falta. */
  const sx=M+Math.max(RS,120)+26, sw=595.28-M-sx;
  let sy=y+10;
  col(V.ink).texto(sx,sy,T("Latitud 4,47° norte — el sol pasa casi por el cenit"),9,"F2"); sy+=14;
  const th=[["",T("Sale"),T("Mediodía"),T("Se pone")]];
  HITOS.forEach(h=>th.push([
    LANG==="es" ? h.t.replace("Solsticio de ","").replace("Equinoccios","equinoccio")
                : T(h.t).replace(" solstice","").replace("Equinoxes","equinox")
                        .replace("Solstice de ","").replace("Équinoxes","équinoxe"),
    h.salida.az.toFixed(0)+"°",
    h.mediodia.alt.toFixed(0)+TT("° al ","° to the ")+rumboTxt(h.mediodia.az),
    h.puesta.az.toFixed(0)+"°"]));
  const cw=[sw*0.30,sw*0.16,sw*0.36,sw*0.18];
  th.forEach((r,i)=>{
    let x=sx;
    r.forEach((t,j)=>{ col(i?V.ink:V.muted).texto(x,sy,t,i?8.4:7.6,i?"F1":"F2"); x+=cw[j]; });
    sy+=6; col(V.line,1).grosor(.4).linea(sx,sy,sx+sw,sy); sy+=8;
  });
  sy+=3;
  if(ver){
    col(V.ink).texto(sx,sy,ver.n,9,"F2"); sy+=13;
    /* y el texto se achica antes que cruzar la raya del pie */
    /* y el texto se achica hasta caber sobre la raya del pie, nunca encima.
       El alto real es (líneas-1)*interlínea más el descuelgue de la última. */
    const tope = PIE_Y - 14;
    let tt=8.2, lh=10.5;
    while(tt>6.5 && sy + (lineasEnvolver(ver.t,sw,tt)-1)*lh + 4 > tope){ tt-=0.4; lh-=0.5; }
    col(V.muted); envolver(P,ver.t,sx,sy,sw,tt,lh);
  }

}

function dibujarSolPDF(P,V,x,y,R,rumbo){
  const col=(c,f)=>f?P.trazo(c[0],c[1],c[2]):P.color(c[0],c[1],c[2]);
  const cx=x+R/2, cy=y+R/2+8, r=R/2-12;
  const Q=(alt,az)=>{const rr=(90-alt)/90*r, a=(az-90)*Math.PI/180;
                     return [cx+rr*Math.cos(a), cy+rr*Math.sin(a)];};
  col([248,247,241]); P.circulo(cx,cy,r,"f");
  col(V.line,1).grosor(.6); P.circulo(cx,cy,r,"S");
  col([225,223,210],1).grosor(.4).raya(1.5,2);
  [30,60].forEach(a=>P.circulo(cx,cy,(90-a)/90*r,"S"));
  P.raya(0);
  col([225,223,210],1).grosor(.4);
  [[0,180],[90,270]].forEach(([a,b])=>{const p=Q(0,a),q=Q(0,b);P.linea(p[0],p[1],q[0],q[1]);});
  col(V.ink);
  [[0,"N"],[90,"E"],[180,"S"],[270,TT("O","W")]].forEach(([a,t])=>{
    const p=Q(-9,a);P.textoC(p[0],p[1]+2.5,t,7.2,"F2");});
  if(rumbo!=null){
    col(V.gold,1).grosor(1.6);
    const p=Q(0,rumbo), q=Q(0,rumbo+180); P.linea(p[0],p[1],q[0],q[1]);
  }
  HITOS.forEach(h=>{
    const cc=h.c.replace("#",""),rr=parseInt(cc.slice(0,2),16),gg=parseInt(cc.slice(2,4),16),bb=parseInt(cc.slice(4,6),16);
    col([rr,gg,bb],1).grosor(1.4);
    P.poli(h.recorrido.map(p=>Q(p.alt,p.az)),"S",false);
    const m=Q(h.mediodia.alt,h.mediodia.az); col([rr,gg,bb]); P.circulo(m[0],m[1],2,"f");
  });
  /* leyenda en dos columnas para no invadir el pie de página */
  const ly0=cy+r+18;
  const items=HITOS.map(h=>[h.c, LANG==="es" ? h.t.replace("Solsticio de ","Solst. ") : T(h.t)]);
  if(rumbo!=null) items.push(["#9B7A48",T("Eje largo de la casa")]);
  items.forEach(([c,t],i)=>{
    const cc=String(c).replace("#",""),rr=parseInt(cc.slice(0,2),16),gg=parseInt(cc.slice(2,4),16),bb=parseInt(cc.slice(4,6),16);
    const cxl=x+(i%2)*74, cyl=ly0+Math.floor(i/2)*8.8;
    col([rr,gg,bb]); P.rect(cxl,cyl-4.2,5.2,5.2);
    col([90,96,84]); P.texto(cxl+8,cyl,t,6.1,"F1");
  });
}
/* En el visor de artifacts la descarga la media la capacidad `downloads`. */
let CAP_DESCARGA;
async function descargador(){
  if(CAP_DESCARGA!==undefined) return CAP_DESCARGA;
  try{ CAP_DESCARGA = (window.claude && claude.use) ? await claude.use("downloads") : null; }
  catch(e){ CAP_DESCARGA=null; }
  return CAP_DESCARGA;
}
async function bajarPDF(n){
  let u;
  try{ await prepararRenderPDF(n); }catch(e){}
  try{ u=fichaPDF(n); }catch(e){ console.error(e); return; }
  const nombre=(LANG==="es"?"Laureles_lote_":LANG==="fr"?"Laureles_lot_":"Laureles_lot_")+String(n).padStart(2,"0")+".pdf";
  const b=new Blob([u],{type:"application/pdf"});
  const d=await descargador();
  if(d){ try{ await d.save({filename:nombre, data:b}); }catch(e){} return; }
  const a=document.createElement("a");
  a.href=URL.createObjectURL(b); a.download=nombre;
  document.body.appendChild(a); a.click();
  setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},1500);
}

/* ---------------- la hoja de análisis, montada en el modal --------------- */
let asoEstado={n:null,f:1,h:9};
function abrirAnalisis(n){
  if(!IMPL[String(n)]){ toast(T("Este lote todavía no tiene análisis topográfico.")); return; }
  devolverIntro();
  asoEstado={n:n,f:1,h:9};
  mb.classList.add("ancha");
  mb.innerHTML=analisis(n);
  mb.querySelector(".close").onclick=cerrarAnalisis;
  const fe=mb.querySelector("#asoFecha"), ho=mb.querySelector("#asoHora"), hv=mb.querySelector("#asoHoraV");
  const redibujar=()=>{
    const AWa=anchoDib();
    mb.querySelector("#asoLienzo").innerHTML=plantaLote(asoEstado.n,asoEstado.f,asoEstado.h,AWa,altoDib(AWa,300));
    const ab=mb.querySelector("#abanico");
    if(ab) ab.innerHTML=abanicoSombras(asoEstado.n,asoEstado.f,AWa,altoDib(AWa,300));
    hv.textContent=hhmm(asoEstado.h);
    if(R3D.activo()) R3D.sol(asoEstado.f,asoEstado.h);
  };
  fe.querySelectorAll("button").forEach(b=>b.onclick=()=>{
    fe.querySelectorAll("button").forEach(x=>x.classList.toggle("on",x===b));
    asoEstado.f=+b.dataset.i; redibujar(); });
  ho.oninput=()=>{ asoEstado.h=+ho.value; redibujar(); };

  /* LA CORTINA DEL SIMULADOR DE DISEÑO.
     Se mueve con el puntero, sea mouse o dedo. Sólo cambia una variable CSS,
     así que no repinta el SVG ni recarga la imagen: el arrastre va suelto
     incluso en un teléfono. Con pointer capture no se pierde el arrastre
     aunque el dedo se salga de la caja. */
  const sc = mb.querySelector("#simCort");
  if(sc){
    let arrastrando = false;
    const poner = e=>{
      const r = sc.getBoundingClientRect();
      if(!r.width) return;
      const x = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
      sc.style.setProperty("--cx", (x*100).toFixed(1)+"%");
    };
    sc.addEventListener("pointerdown", e=>{
      arrastrando = true;
      try{ sc.setPointerCapture(e.pointerId); }catch(err){}
      poner(e); e.preventDefault();
    });
    sc.addEventListener("pointermove", e=>{ if(arrastrando){ poner(e); e.preventDefault(); } });
    ["pointerup","pointercancel"].forEach(ev=>
      sc.addEventListener(ev, e=>{ arrastrando=false;
        try{ sc.releasePointerCapture(e.pointerId); }catch(err){} }));
    sc.addEventListener("dragstart", e=>e.preventDefault());
  }
  redibujar();
  /* cambiar de tamaño rehace la hoja entera: la planta, el corte, el bloque 3D
     y las cifras salen todas del mismo registro, así que basta con volver a
     dibujarla. Y si el relieve está encendido, se le cambia la casa también. */
  const segTam = mb.querySelector("#segTam");
  if(segTam) segTam.querySelectorAll("button[data-t]").forEach(b=>{
    if(b.disabled) return;
    b.onclick = ()=>{
      ponerTamano(b.dataset.t);
      abrirAnalisis(n);
      try{ if(R3D.activo()){ R3D.casa(n,null,null); R3D.refrescar(); } }catch(e){}
      const A2 = IMPL[String(n)], k2 = A2 && A2.k;
      const ti2=TIPOS_CASA[b.dataset.t];
      if(k2) toast(TT("Casa de "+(ti2?ti2.et:ent(k2.ac||k2.an)+" m²")+": "+k2.co+" m³ de corte y "+
                      (k2.ll||0)+" m³ de lleno.",
                      "House of "+(ti2?ti2.et:ent(k2.ac||k2.an)+" m²")+": "+k2.co+" m³ cut and "+
                      (k2.ll||0)+" m³ fill."));
    };
  });

  mb.querySelector("#anl3d").onclick=()=>{
    cerrarAnalisis();
    if(!R3D.activo()) document.getElementById("b3d").click();
    R3D.casa(n, asoEstado.f, asoEstado.h);
    setTimeout(()=>R3D.irA(n), 80);
    /* Honestidad sobre qué se está viendo: en el 3D del plano el volumen sigue
       siendo la Casa 30JB —la única de la que hay geometría— escalada a la
       envolvente del tipo escogido. El isométrico del informe sí levanta la
       envolvente del tipo. Se dice, no se deja creer otra cosa. */
    toast(TT("Casa 30JB escalada a la envolvente del tipo de "+TIPOS_CASA[TAM_CASA].et+" en el lote "+n+
             ". Arrastre para girar alrededor.",
             "Casa 30JB scaled to the "+TIPOS_CASA[TAM_CASA].et+" envelope on lot "+n+". Drag to orbit.",
             "Casa 30JB à l'échelle de l'enveloppe du type de "+TIPOS_CASA[TAM_CASA].et+" sur le lot "+n+"."));
  };
  mb.querySelector("#anlPdf").onclick=()=>{ toast(T("Preparando la ficha…")); bajarPDF(n); };
  const bDxf=mb.querySelector("#anlDxf"); if(bDxf) bDxf.onclick=()=>{ toast(TT("Generando el DXF…","Building the DXF…")); try{ bajarDXF(n); }catch(e){ console.error(e); toast("DXF: "+e.message); } };
  const bRen=mb.querySelector("#anlRen");
  if(bRen) bRen.onclick=()=>abrirRender(n);
  /* El tour se calcula al entrar, no al abrir la hoja: rasterizar el lote y
     probar nueve cosas en ocho orientaciones cuesta bastante y no tiene sentido
     pagarlo en cada lote que alguien abra de paso. */
  const bTour=mb.querySelector("#btnTour");
  if(bTour) bTour.onclick=()=>{
    const h=mb.querySelector("#huecoTour");
    if(!h) return;
    bTour.disabled=true; bTour.textContent=T("Midiendo el lote…");
    setTimeout(()=>{
      try{ h.innerHTML=contenidoTour(n); }
      catch(e){ console.error(e); h.innerHTML='<p class="p pie">'+T("No se pudo medir este lote.")+'</p>'; }
      bTour.style.display="none";
    }, 30);
  };
  /* el isométrico se dibuja un tic después: así la hoja aparece de una vez
     y el dibujo entra ya con la ficha en pantalla */
  const hueco=mb.querySelector("#isoHueco");
  if(hueco) setTimeout(()=>{ try{ const AWi=anchoDib();
      hueco.innerHTML=diagramaIso(n, AWi, altoDib(AWi,470)); }catch(e){ console.error(e); } },30);
  modal.hidden=false;
}
function cerrarAnalisis(){ modal.hidden=true; mb.classList.remove("ancha"); }

/* ---- lo que el mapa necesita de aquí ---- */
window.__ANL_LOC = LOC;
window.ANALISIS = {
  abrir: abrirAnalisis, cerrar: cerrarAnalisis, pdf: bajarPDF, dxf: bajarDXF, dxfTexto: exportarDXF,
  idioma: l => { LANG = IDIOMAS.indexOf(l)>=0 ? l : "es";
                 try{ localStorage.setItem("laureles.lang",LANG); }catch(e){}
                 document.documentElement.lang = LANG==="en"?"en":LANG==="fr"?"fr":"es-CO";
                 if(!modal.hidden && asoEstado.n!=null) abrirAnalisis(asoEstado.n); },
  lang: () => LANG, T: T, TT: TT, hay: n => !!IMPL[String(n)]
};
/* el relieve 3D (r3d.js) se apoya en estos tres: no se duplican allá */
window.__CASA30 = CASA30;
window.__SOL    = SOL;
window.__ANIO   = ANIO;
})();
