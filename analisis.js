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
"pend.Escarpado":"Escarpé",
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
"Área construible":"Surface constructible",
"Frente sobre vía":"Façade sur voie",
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
"Área construible (aislamientos y antejardín)":"Surface constructible (retraits et marge avant)",
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
"pend.Escarpado":"Very steep",
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
"Área construible":"Buildable area",
"Frente sobre vía":"Frontage on road",
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
"Área construible (aislamientos y antejardín)":"Buildable area (setbacks and front yard)",
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
let TAM_CASA = (function(){ try{ const v=localStorage.getItem("laureles.tamCasa");
  return TAMANOS.indexOf(v)>=0 ? v : "300"; }catch(e){ return "300"; } })();

function casaDelLote(A, t){
  if(!A || !A.ks) return A ? A.k : null;
  if(A.ks[t]) return A.ks[t];
  /* si el escogido no cabe en este lote, el mayor que sí */
  for(const q of TAMANOS) if(A.ks[q]) return A.ks[q];
  return A.k || null;
}
function ponerTamano(t){
  if(TAMANOS.indexOf(t) < 0) return;
  TAM_CASA = t;
  try{ localStorage.setItem("laureles.tamCasa", t); }catch(e){}
  for(const n in IMPL){
    const A = IMPL[n];
    if(A && A.ks) A.k = casaDelLote(A, t);
  }
}
ponerTamano(TAM_CASA);          /* deja 'k' en el tamaño guardado desde el arranque */

/* =========================================================================
   PLAN DE PAGOS
   La cuota inicial se paga dentro de 2026: para separar entran $20.000.000 y el
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
const ALTURA_MAX=5.0, ENTRE_NIVELES=3.0;
const CLASES=[["Plano","menos de 5 %","#4C8862"],["Suave","5 – 10 %","#7BA36B"],
              ["Medio","10 – 15 %","#C4B45A"],["Fuerte","15 – 25 %","#C48A2A"],
              ["Escarpado","más de 25 %","#A3543F"]];
/* La sexta "clase": el terreno que quedó fuera del levantamiento.
   No hay curvas de nivel ahí, así que no hay pendiente MEDIDA. Lo que hay es una
   pendiente DECLARADA: la gerencia técnica del proyecto conoce el predio en campo
   y la fija en el rango fuerte (15–25 %). No es lo mismo que un dato de topografía
   y en ninguna figura se mezcla con él: se pinta del color del rango fuerte —para
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
     20 % —el centro del rango fuerte, 15–25 %— y el que la ladera siga cayendo
     al alejarse de lo medido, que es la forma del predio: lo levantado es la
     parte de arriba, contra la vía, y lo que falta es la de atrás.

     Esto NO entra en ninguna cifra medida: cota() y pendiente() siguen dando
     NaN ahí, las barras del informe no se mueven y cada dibujo que usa esta
     superficie sale rayado y rotulado como declarado.
     --------------------------------------------------------------------- */
  const PEND_DECLARADA = 0.20;
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
       "<b>pendiente fuerte (15 – 25 %), declarada en campo por la gerencia técnica del "+
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
function dentroAnillo(x,y,ring){
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
     punteadas y en el tono del rango fuerte, y sólo donde NO hay levantamiento.
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
    const K = A && A.k; if(!K || !K.o) return null;
    const casa = CASA30;
    const escU = K.L/casa.W, escV = (K.Dc||casa.D)/casa.D;

    /* PX del plano: x al oriente, y al sur. Aquí N = -y. */
    const o=K.o, ux=K.ux, uv=K.uv;
    const XY=(u,v)=>{ const uu=u*escU, vv=v*escV;
      return [o[0]+ux[0]*uu+uv[0]*vv, o[1]+ux[1]*uu+uv[1]*vv]; };
    /* centro de la casa, para dejar el origen ahí */
    const c = XY(casa.W/2, casa.D/2);
    const EN = p => [ p[0]-c[0], -(p[1]-c[1]) ];

    const piezas=[], suelo=[];

    /* --- el suelo: el entorno inmediato de la casa, no el lote entero.
           Un lote de 100 m de fondo dejaría la casa del tamaño de una uña. --- */
    const MU=9.0/escU, MV=8.0/escV;      /* márgenes en metros de referencia */
    const W0=casa.W, D0=casa.D;
    suelo.push({tipo:"plataforma", pts:[
      XY(-MU,-MV), XY(W0+MU,-MV), XY(W0+MU,D0+MV), XY(-MU,D0+MV)].map(EN)});
    /* la línea del antejardín, por donde se llega desde la vía */
    suelo.push({tipo:"antejardin", pts:[XY(-MU,0), XY(W0+MU,0)].map(EN)});

    /* --- los volúmenes --- */
    casa.bloques.forEach(([nom,u0,v0,u1,v1,h,cls])=>{
      const q=[XY(u0,v0),XY(u1,v0),XY(u1,v1),XY(u0,v1)].map(EN);
      if(cls==="patio"){ suelo.push({tipo:"patio", pts:q}); return; }
      piezas.push({nom, base:q, h, cls,
        z: q.reduce((a,p)=>a+fondo(p[0],p[1],h),0)/4});
    });
    piezas.sort((a,b)=>b.z-a.z);              /* del fondo hacia adelante */

    /* --- los recorridos del sol --- */
    const anchoSuelo=(casa.W*escU+18), fondoSuelo=(casa.D*escV+16);
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
    esc.suelo.forEach(s=>s.pts.forEach(p=>ver(p[0],p[1],0)));
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
    const pts=g.pts.map(p=>P(p[0],p[1],0));
    if(g.tipo==="plataforma")
      o+='<path d="'+d(pts)+'" fill="#F4F3EB" stroke="#BFBDAE" stroke-width="1.2"/>';
    else if(g.tipo==="antejardin")
      o+='<path d="'+dl(pts)+'" fill="none" stroke="#C9A45C" stroke-width="1.1" stroke-dasharray="6 5"/>';
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
    const b0=bl.base.map(p=>P(p[0],p[1],0));
    const bt=bl.base.map(p=>P(p[0],p[1],bl.h));
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
    o+='<path d="'+d(bt)+'" fill="#FFFFFF" stroke="'+linea+'" stroke-width="1.15" stroke-linejoin="round"/>';
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
function analisis(n){
  const L=DATA.lotes.find(x=>x.n===n); if(!L)return;
  const A=IMPL[String(n)]; if(!A)return;
  const casa=A.k, ej=casa?ejeLargo(casa.g):null;
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
  '<div class="ubiBox">'+planoUbicacion(n,760,300)+'</div>'+
  '<p class="p pie">'+TT(
     'Todo el proyecto en gris; en dorado, el lote '+n+'. Área total '+fmtA(L.at)+
     (L.pr?', de los cuales '+fmtA(L.pr)+' son faja de protección':', sin faja de protección')+'.',
     'The whole subdivision in grey; in gold, lot '+n+'. Total area '+fmtA(L.at)+
     (L.pr?', of which '+fmtA(L.pr)+' is protection strip':', with no protection strip')+'.',
     'Tout le lotissement en gris ; en doré, le lot '+n+'. Surface totale '+fmtA(L.at)+
     (L.pr?', dont '+fmtA(L.pr)+' de bande de protection':', sans bande de protection')+'.')+'</p>'+

  '<h3>'+T("Cómo es el terreno")+'</h3>'+

  /* el mismo lote pintado por rango de pendiente: dónde está lo plano */
  '<div class="ubiBox">'+mapaPendientes(n,760,330)+'</div>'+
  leyendaPendientes(n)+

  /* el mismo lote, en volumen: los colores de pendiente sobre el terreno real
     y la casa implantada encima. Es lo que le hace entender al cliente de un
     vistazo lo que las barras dicen en frío. */
  '<div class="ubiBox">'+bloque3D(n,760,380)+'</div>'+
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
     'La línea dorada punteada es el área construible y el contorno blanco, la casa. '+
     'Lo que sale <b>rayado</b> —en la planta y en el volumen— es la franja sin curvas de nivel: '+
     'va del color del rango fuerte porque así la declara en campo la gerencia técnica, pero la '+
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
    ? '<div class="tamCasa"><span class="et">'+T("Tamaño de la casa")+'</span>'+
      '<div class="seg" id="segTam">'+
      TAMANOS.slice().reverse().map(t=>
        '<button data-t="'+t+'"'+(A.ks[t]?'':' disabled title="'+
          T("No cabe en este lote")+'"')+
        (t===TAM_CASA?' class="on"':'')+'>'+t+' m²</button>').join("")+
      '</div>'+
      (A.ks[TAM_CASA] ? '' : '<span class="ojo">'+
        T("El tamaño escogido no cabe aquí; se muestra el mayor que sí.")+'</span>')+
      '</div>'
    : '')+
  (A.cm2>0
    ? '<p class="p">'+(TT('Descontando <b>3 m de aislamiento</b> a cada vecino, <b>10 m de antejardín</b> sobre la vía y '+
          'las fajas de protección, quedan <b>'+ent(A.cm2)+' m² construibles</b>.',
    'After taking out <b>3 m of setback</b> to each neighbour, <b>10 m of front yard</b> along the road and '+
          'the protection strips, <b>'+ent(A.cm2)+' m² are buildable</b>.',
    'En retirant <b>3 m de retrait</b> de chaque côté, <b>10 m de marge avant</b> sur la voie et les bandes '+
          'de protection, il reste <b>'+ent(A.cm2)+' m² constructibles</b>.'))+'</p>'+
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
    : '<p class="p">'+(TT('Con los aislamientos y la protección, este lote no deja un área construible continua.','With the setbacks and the protection strips, this lot leaves no continuous buildable area.'))+'</p>')+
  (casa
    ? '<table class="t2">'+
      '<tr><td>'+T("Modelo")+'</td><td>'+T("Casa 30JB")+' · '+
        (casa.mod==="2p" ? T("dos niveles (uno semienterrado)") : T("un solo piso"))+'</td></tr>'+
      '<tr><td>'+T("Área construida")+'</td><td>'+ent(casa.ac||casa.an)+' m²</td></tr>'+
      (casa.pat?'<tr><td>'+T("Patio interior")+'</td><td>'+ent(casa.pat)+' m²</td></tr>':'')+
      '<tr><td>'+T("Huella en el lote")+'</td><td>'+dec(casa.L,1)+' × '+dec(casa.A,1)+' m</td></tr>'+
      '<tr><td>'+T("Nivel de acceso")+'</td><td>'+dec(casa.z,2)+SNM()+'</td></tr>'+
      (casa.mod==="2p"
        ? '<tr><td>'+T("Nivel −1 (semienterrado)")+'</td><td>'+dec(casa.zm,2)+SNM()+'</td></tr>'
        : '')+
      '<tr><td>'+T("Altura sobre el acceso")+'</td><td>'+dec(ALTURA_MAX,1)+
        (TT(' m el acceso · 3,4 m el resto',' m at the entrance · 3.4 m elsewhere',
            ' m à l\'entrée · 3,4 m ailleurs'))+'</td></tr>'+
      '<tr><td>'+T("Desnivel bajo la casa")+'</td><td>'+dec(casa.d,2)+' m</td></tr>'+
      '<tr><td>'+(casa.mod==="2p"?T("Excavación del nivel −1"):T("Movimiento de tierra"))+'</td><td>'+
        casa.co+' m³'+(casa.ll
          ? (TT(' de corte · ',' cut · ')+casa.ll+TT(' m³ de lleno',' m³ fill'))
          : (TT(' de corte',' of cut')))+'</td></tr>'+
      '<tr><td>'+T("Eje largo")+'</td><td>'+ej.rumbo.toFixed(0)+'° — '+
        (TT('fachadas largas al ','long facades to the '))+fachadas[0]+(TT(' y al ',' and '))+fachadas[1]+'</td></tr>'+
      '</table>'+
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
              'frente no cabe. El modelo conserva la proporción de la 30JB en <b>'+dec(casa.L,1)+' × '+dec(casa.A,1)+
              ' m</b>, con <b>'+ent(casa.ac||casa.an)+' m² construidos</b> en vez de 302.',
    'The house had to drop one size step: between the side boundaries there are only '+dec(casa.w,1)+
              ' m clear once the 3 m setbacks are taken out, so the full 22.4 m frontage does not fit. The model '+
              'keeps the 30JB proportions at <b>'+dec(casa.L,1)+' × '+dec(casa.A,1)+' m</b>, with <b>'+
              ent(casa.ac||casa.an)+' m² built</b> instead of 302.',
    'La maison a dû descendre d\'un cran : entre les limites latérales il ne reste que '+dec(casa.w,1)+
              ' m libres une fois les 3 m de retrait déduits, la version complète de 22,4 m de façade ne tient '+
              'donc pas. Le modèle garde les proportions de la 30JB en <b>'+dec(casa.L,1)+' × '+dec(casa.A,1)+
              ' m</b>, avec <b>'+ent(casa.ac||casa.an)+' m² construits</b> au lieu de 302.'))+'</p>'
        : '')+
      '<p class="p pie">'+(TT('El volumen es la <b>Casa 30JB</b> del proyecto —arquitectura mediterránea y moderna, 300 m² '+
          'construidos en un piso, con su patio interior— reducida a volúmenes y puesta '+
          'sobre el terreno real. Va alineada con los linderos laterales, así los 3 m de aislamiento quedan '+
          'parejos en todo el largo, centrada entre ellos y lo más adelante que permite el antejardín. Sirve para '+
          'entender la escala y cuánta tierra habría que mover; la casa que se construya puede ser otra.',
    'The volume is aligned with the side boundaries —so the 3 m setbacks stay even along the whole '+
          'length— centred between them, and pushed as close to the front yard as it will go. It is not a '+
          'design: it is a volume placed there to grasp the scale and how much earth would have to move.'))+'</p>'
    : '<p class="p">'+(TT('Ni un volumen de 264 m² en un piso ni uno de 132 m² en dos niveles caben dentro del área construible '+
          'de este lote. Habría que plantear una casa más compacta o repartida en varios cuerpos.',
    'Neither a 264 m² volume on one storey nor 132 m² on two levels fits inside this lot\'s buildable '+
          'area. It would need a more compact house, or one split into several volumes.'))+'</p>')+

  /* el corte del terreno: lo que explica el movimiento de tierra */
  '<h3>'+T("El corte del terreno")+'</h3>'+
  '<div class="ubiBox">'+corteTerreno(n,760,330)+'</div>'+
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
       'centro del rango fuerte. Arranca en la última cota medida y de ahí baja, sin pasar nunca '+
       'por debajo del punto más bajo que el levantamiento midió en el predio.',
       'The hatched part of the section is not surveyed: it is the slope declared at 20%, the middle '+
       'of the steep range. It starts at the last measured elevation and falls from there, never '+
       'going below the lowest point the survey measured on the property.',
       'La partie hachurée de la coupe n\'est pas levée : c\'est la pente déclarée à 20 %, le milieu '+
       'de la tranche forte. Elle part de la dernière cote mesurée et descend, sans jamais passer '+
       'sous le point le plus bas relevé sur la propriété.') : '')+'</p>'+

  '<h3>'+T("El sol sobre el lote")+'</h3>'+
  (casa
    ? '<div class="isoBox" id="isoHueco"></div>'+
      '<p class="p pie">'+(TT('La Casa 30JB puesta en este lote, con su orientación real, y encima el recorrido del sol '+
          'en los tres momentos que mandan: el solsticio de junio, los equinoccios y el solsticio de diciembre. '+
          'Los soles marcan las 8 de la mañana, el mediodía y las 4 de la tarde. Las posiciones están calculadas '+
          'para 4,47° N y 75,74° O, hora de Colombia.',
        'Casa 30JB placed on this lot, at its real orientation, with the path of the sun on the three dates that '+
          'matter: the June solstice, the equinoxes and the December solstice. The suns mark 8 in the morning, '+
          'noon and 4 in the afternoon. Positions are computed for 4.47° N, 75.74° W, Colombian time.',
        'La Casa 30JB posée sur ce lot, à son orientation réelle, avec la course du soleil aux trois moments qui '+
          'comptent : le solstice de juin, les équinoxes et le solstice de décembre. Les soleils marquent 8 h, '+
          'midi et 16 h. Les positions sont calculées pour 4,47° N et 75,74° O, heure de Colombie.'))+'</p>'
    : '')+
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
      '<p class="p">'+(TT('Una imagen de la Casa 30JB puesta en este lote, con su pendiente y su orientación. '+
          'Toque <b>Renderizar</b> abajo: la imagen entra pixelada y va enfocando, como cuando un motor de '+
          'render calcula por pasadas.',
        'An image of Casa 30JB placed on this lot, with its slope and its orientation. Tap <b>Render</b> '+
          'below: the image comes in pixelated and sharpens, the way a render engine resolves it pass by pass.',
        'Une image de la Casa 30JB posée sur ce lot, avec sa pente et son orientation. Touchez '+
          '<b>Rendre</b> ci-dessous : l\'image arrive pixelisée et se précise, comme un moteur de rendu qui '+
          'calcule passe après passe.'))+'</p>'+
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
  if(!A||!A.k) return "";
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
    return {h:h, alt:p.alt, az:p.az, s:(p.alt>3? sombraCasa(A.k.g,p.alt,p.az,ALTURA_MAX) : null)};
  }).filter(x=>x.s);
  let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
  const met=q=>{x0=Math.min(x0,q[0]);x1=Math.max(x1,q[0]);y0=Math.min(y0,q[1]);y1=Math.max(y1,q[1]);};
  g0.map(R).forEach(met); A.k.g.map(R).forEach(met);
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
  o+='<path d="'+d(A.k.g,1)+'" fill="var(--forest)" fill-opacity=".9" stroke="var(--forest-deep)" stroke-width="1"/>';
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
  g0.map(R).forEach(met); if(A.c)A.c.map(R).forEach(met); if(A.k)A.k.g.map(R).forEach(met);
  const f=SOL.FECHAS[iFecha], pos=SOL.posicion(ANIO,f.m,f.d,hora,lat0,lon0);
  const som=A.k?sombraCasa(A.k.g,pos.alt,pos.az,ALTURA_MAX):null;
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
  if(A.k){
    o+='<path d="'+d(A.k.g,1)+'" fill="var(--forest)" fill-opacity=".82" stroke="var(--forest-deep)" stroke-width="1"/>';
    const c=A.k.g.slice(0,-1).reduce((a,p)=>[a[0]+p[0]/4,a[1]+p[1]/4],[0,0]);
    const q=XY(c);
    const rot=A.k.mod==="2p" ? Math.round(A.k.an)+" m² × 2" : Math.round(A.k.at)+" m²";
    o+='<text x="'+q[0]+'" y="'+q[1]+'" font-size="10" font-weight="700" text-anchor="middle" '+
       'dy="3.5" fill="var(--on-forest)">'+rot+'</text>';
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
    [T("Pendiente media"), A&&A.pend ? (LANG==="es"?A.pend:String(A.pend).replace(/,/g,".")) : "—"],
    [T("Precio")+" "+ET.l, fmtCOP(val)]
  ];
  const cw=(W-2*M)/4;
  celdas.forEach((cd,i)=>{
    const x=M+i*cw;
    if(i) { col(V.line,1).grosor(.5); P.linea(x-8,y-4,x-8,y+26); }
    col(V.muted).texto(x,y,cd[0],7.4,"F1",.6);
    col(V.ink).texto(x,y+20,cd[1],i===3?12:13,"F2");
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
  indice.forEach((t,i)=>{
    col(V.gold).texto(M,y,String(i+2),8.6,"F2");
    col(V.ink).texto(M+16,y,t,8.6,"F1");
    y+=12.5;
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
  fila(T("Fondo"),(A.fo!=null?dec(A.fo,1):"—")+" m");
  dy+=6; col(V.gold).texto(dx,dy,T("TERRENO"),7.6,"F2",1.1); dy+=14;
  /* si el lote no está levantado entero hay que decirlo aquí, que es la hoja
     que se entrega, y no dejarlo sólo en la pantalla */
  if(A.cob!=null && A.cob<0.98){
    fila(T("Área levantada"), ent(A.am2||0)+" m² "+TT("de","of")+" "+ent(L.at)+" m² ("+
         Math.round(A.cob*100)+" %)", 1);
  }
  if(A.cota){ const mc=String(A.cota).match(/(\d+)\D+(\d+)/);
    fila(T("Cota"), mc ? ent(+mc[1])+"–"+ent(+mc[2])+SNM() : A.cota); }
  fila(T("Pendiente media"), A.pend
    ? (LANG==="es" ? A.pend : String(A.pend).replace(/,/g,".")) : "—");
  fila(T("Área construible"),A.cm2?ent(A.cm2)+" m²":"—",1);
  if(casa){
    dy+=6; col(V.gold).texto(dx,dy,T("VOLUMEN DE PRUEBA"),7.6,"F2",1.1); dy+=14;
    fila(T("Modelo"), T(casa.mod==="2p" ? "Dos niveles (uno semienterrado)" : "Un solo piso"), 1);
    fila(T("Huella"), dec(casa.L,1)+" × "+dec(casa.A,1)+" m"+
                   (casa.mod==="2p" ? "  ·  "+ent(casa.an)+" m² × 2" : "  ·  "+ent(casa.at)+" m²"));
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
  const bw=595.28-2*M-238;
  CLASES.forEach((c,i)=>{
    const p=A.r[i]?A.r[i][0]:0, m2v=A.r[i]?A.r[i][1]:0;
    col(V.ink).texto(M,y+7,TP(c[0]),8.6,"F2");
    col(V.muted).texto(M+58,y+7,T(c[1]),8,"F1");
    col([232,230,220]).rect(M+120,y+1,bw,8);
    const cc=c[2].replace("#",""), rr=parseInt(cc.slice(0,2),16),gg=parseInt(cc.slice(2,4),16),bb=parseInt(cc.slice(4,6),16);
    col([rr,gg,bb]).rect(M+120,y+1,Math.max(1,bw*p/100),8);
    col(V.ink).textoD(595.28-M,y+7.5,dec(p,1)+" %  ·  "+ent(m2v)+" m²",8.6,"F1");
    y+=14;
  });
  /* La franja declarada, aparte y con la barra rayada: no es una clase medida */
  if(parcial){
    const m2Decl = Math.max(0, L.at-(A.am2||0));
    y+=3; col(V.line,1).grosor(.5).raya(2,2).linea(M,y,595.28-M,y); P.raya(0); y+=6;
    col(V.ink).texto(M,y+7,T("Sin levantar"),8.6,"F2");
    col(V.muted).texto(M+58,y+7,TT("15 – 25 % decl.","15–25% decl.","15 – 25 % décl."),8,"F1");
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
      "pendiente fuerte (15–25 %) declarada en campo por la gerencia técnica, no medida con topografía. No "+
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
  /* en los lotes con aviso la hoja va más apretada: el bloque del sol cede unos
     puntos para que la leyenda no se le monte al pie */
  y += parcial ? 4 : 20;
  col(V.gold).texto(M,y,T("EL SOL SOBRE EL LOTE"),7.6,"F2",1.1); y+=12;
  dibujarSolPDF(P,V,M,y,parcial?108:132,ej?ej.rumbo:null);
  const sx=M+158, sw=595.28-M-sx;
  let sy=y+16;
  col(V.ink).texto(sx,sy,T("Latitud 4,47° norte — el sol pasa casi por el cenit"),9,"F2"); sy+=16;
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
    sy+=6; col(V.line,1).grosor(.4).linea(sx,sy,sx+sw,sy); sy+=10;
  });
  sy+=4;
  if(ver){
    col(V.ink).texto(sx,sy,ver.n,9,"F2"); sy+=13;
    col(V.muted); envolver(P,ver.t,sx,sy,sw,8.2,10.5);
  }

  /* ---------- pie ---------- */
  const py=790;
  col(V.line,1).grosor(.5).linea(M,py-12,595.28-M,py-12);
  col(V.muted);
  let fy=envolver(P, TT(
      "Geometría del plano 039 (09-09-2026), MAGNA-SIRGAS / Origen Nacional CTM12. Pendientes y cotas del modelo "+
      "digital del terreno hecho con las curvas cada 1 m del levantamiento. El volumen de prueba es un ejercicio de "+
      "escala, no un diseño: respeta 3 m de aislamiento, 10 m de antejardín, las fajas de protección y 5 m de altura. "+
      "En los lotes que arrancan en pendiente va en dos niveles, el de abajo enterrado contra la ladera, para que "+
      "desde la vía se lea un solo piso. Precios de trabajo; no es oferta comercial.",
      "Geometry from drawing 039 (09-09-2026), MAGNA-SIRGAS / Origen Nacional CTM12. Slopes and elevations come "+
      "from the digital terrain model built with the 1 m contours of the survey. The test volume is an exercise in "+
      "scale, not a design: it respects 3 m setbacks, a 10 m front yard, the protection strips and a 5 m height "+
      "limit. On lots that start on a slope it goes on two levels, the lower one buried against the hillside, so "+
      "that a single storey reads from the road. Working prices; this is not a commercial offer."),
    M, py, 595.28-2*M-96, 6.6, 8.6);
  col(V.forest).textoD(595.28-M,py,T("Generado el")+" "+new Date().toLocaleDateString(LOC()),6.8,"F2");

  const hojas=[hojaPortadaPDF(n,L,A,casa,V), P];
  if(casa){ hojas.push(hojaIsoPDF(n,L,A,casa,V)); hojas.push(hojaSolarPDF(n,L,A,casa,ej,V)); }
  hojas.push(hojaComercialPDF(n,L,V));
  hojas.push(hojaCuotasPDF(n,L,V));
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
  y+=10;
  col(V.gold).texto(M,y,T("CÓMO SE MUEVE EL PRECIO"),7.6,"F2",1.1); y+=18;
  const maxV=Math.max(...ETAPAS.map(E=>precio(L,E.n)));
  const bw=(595.28-2*M-5*10)/6, base=y+70;
  ETAPAS.forEach((E,i)=>{
    const v=precio(L,E.n), h=Math.max(4,(v/maxV)*62), x=M+i*(bw+10);
    const actual=(E.n===state.etapa);
    col(actual?V.forest:[176,190,168]).rect(x,base-h,bw,h);
    col(V.muted).texto(x,base+11,E.l,7.4,"F2");
    col(actual?V.forest:V.muted).texto(x,base-h-5,"$"+dec(v/1e6,0)+"M",7,"F2");
  });
  y=base+30;

  /* ---- qué más entra en el precio ---- */
  col(V.line,1).grosor(.5).linea(M,y,595.28-M,y); y+=20;
  col(V.gold).texto(M,y,T("QUÉ MÁS ENTRA EN EL PRECIO"),7.6,"F2",1.1); y+=16;
  const mitad=(595.28-2*M)/2-14;
  let ya=y;
  const filaC=(x,w,k,v)=>{
    col(V.muted).texto(x,ya,k,7.8,"F1");
    col(V.ink).textoD(x+w,ya,v,8.2,"F2");
    ya+=6; col(V.line,1).grosor(.35).linea(x,ya,x+w,ya); ya+=11;
  };
  col(V.ink).texto(M,ya,T("Áreas comunes del conjunto"),8.4,"F2"); ya+=14;
  filaC(M,mitad,T("Zonas sociales"),"10.057 m²");
  filaC(M,mitad,T("Áreas de protección"),"28.696 m²");
  filaC(M,mitad,T("Andenes y vías"),"30.775 m²");
  filaC(M,mitad,T("Portería"),"53 m²");
  const yfin=ya;
  ya=y;
  const x2=M+mitad+28;
  col(V.ink).texto(x2,ya,T("Desde el predio"),8.4,"F2"); ya+=14;
  POIS.slice(0,4).forEach(([nm,,md])=>filaC(x2,mitad,T(nm),T(md)));
  y=Math.max(yfin,ya)+10;

  col(V.line,1).grosor(.5).linea(M,y,595.28-M,y); y+=18;
  y=envolver(P, TT(
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
      "qu'on ne peut ni y construire ni y couper, mais elle fait partie du lot et de sa valeur de paysage."),
    M, y, 595.28-2*M, 7.4, 10);

  y+=8;
  y=envolver(P, TT(
      "Este documento es informativo y no constituye oferta comercial. Los precios están sujetos a cambio sin "+
      "previo aviso y no incluyen gastos de escrituración, impuestos ni el valor de la construcción. El estado "+
      "del lote se confirma con el asesor antes de cualquier separación.",
      "This document is informative and does not constitute a commercial offer. Prices are subject to change "+
      "without notice and do not include conveyancing costs, taxes or the cost of construction. The status of "+
      "the lot is confirmed with the sales agent before any reservation.",
      "Ce document est informatif et ne constitue pas une offre commerciale. Les prix peuvent changer sans "+
      "préavis et n'incluent ni les frais d'acte, ni les taxes, ni le coût de la construction. L'état du lot "+
      "est confirmé avec le conseiller avant toute réservation."),
    M, y, 595.28-2*M, 7.0, 9.6);

  col(V.forest).rect(0,841.89-46,595.28,46);
  col(V.blanco).texto(M,841.89-26,"LAURELES CAMPESTRE",10,"F2",1.3);
  col([200,214,192]).texto(M,841.89-14,T("El Caimo · Armenia · Quindío · Parcelación campestre"),7,"F1");
  col([200,214,192]).textoD(595.28-M,841.89-20,T("Generado el")+" "+new Date().toLocaleDateString(LOC()),7,"F1");
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
    const pts=g.pts.map(p=>Q(p[0],p[1],0));
    if(g.tipo==="plataforma"){
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
    const b0=bl.base.map(p=>Q(p[0],p[1],0));
    const bt=bl.base.map(p=>Q(p[0],p[1],bl.h));
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
    col([255,255,255]).poli(bt,"f",true);
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
  y=envolver(P, TT("La Casa 30JB puesta en este lote, con su orientación real, y encima el recorrido del sol en los tres "+
      "momentos que mandan el año: el solsticio de junio, los equinoccios y el solsticio de diciembre. Los soles "+
      "marcan las 8 de la mañana, el mediodía y las 4 de la tarde.",
    "Casa 30JB placed on this lot at its real orientation, with the path of the sun on the three dates that rule "+
      "the year: the June solstice, the equinoxes and the December solstice. The suns mark 8 in the morning, noon "+
      "and 4 in the afternoon.",
    "La Casa 30JB posée sur ce lot à son orientation réelle, avec la course du soleil aux trois moments qui "+
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
  const som=HORAS.map(h=>{ const p=SOL.posicion(ANIO,f.m,f.d,h,lat0,lon0);
    return {h:h, s:(p.alt>3? sombraCasa(A.k.g,p.alt,p.az,ALTURA_MAX):null)}; }).filter(x=>x.s);
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
  col([70,88,64]); P.poli(casa.g.map(XY),"f");
  col([28,38,25],1).grosor(.8); P.poli(casa.g.map(XY),"S");
  som.forEach(ob=>{
    const c=ob.s.reduce((a,p)=>[a[0]+p[0]/ob.s.length,a[1]+p[1]/ob.s.length],[0,0]);
    const q=XY(c); col([255,255,255]);
    P.textoC(q[0],q[1]+2.5,(ob.h>12?ob.h-12:ob.h)+(ob.h<12?"a":"p"),7,"F2");
  });
  P.recupera();
  const nx=px0+pw-20, ny=py0+21;
  const gn=a=>[nx+(a[0]*Math.cos(th)-a[1]*Math.sin(th)), ny+(a[0]*Math.sin(th)+a[1]*Math.cos(th))];
  col([60,70,56]); P.poli([[0,-9],[3.2,4],[0,1.6],[-3.2,4]].map(gn),"f");
  const e=gn([0,13]); P.textoC(e[0],e[1]+2.5,"N",7,"F2");
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
  if(casa){
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
  const leg=[[[70,88,64], casa
      ? (T("Volumen de prueba")+" "+dec(casa.L,1)+" × "+dec(casa.A,1)+" m"+
         (casa.mod==="2p" ? (TT(" en dos niveles"," on two levels")) : (TT(" en un piso"," on one storey"))))
      : T("Volumen de prueba")],
             [[198,216,193],T("Faja de protección")]];
  if(A.c)leg.push([[201,170,110],T("Área construible (aislamientos y antejardín)")]);
  const rayado = (A.cob!=null && A.cob<0.98);
  if(rayado) leg.push([null,T("Sin levantar · pendiente fuerte declarada en campo")]);
  if(rayado) ly-=10;
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
    mb.querySelector("#asoLienzo").innerHTML=plantaLote(asoEstado.n,asoEstado.f,asoEstado.h,760,300);
    const ab=mb.querySelector("#abanico");
    if(ab) ab.innerHTML=abanicoSombras(asoEstado.n,asoEstado.f,760,300);
    hv.textContent=hhmm(asoEstado.h);
    if(R3D.activo()) R3D.sol(asoEstado.f,asoEstado.h);
  };
  fe.querySelectorAll("button").forEach(b=>b.onclick=()=>{
    fe.querySelectorAll("button").forEach(x=>x.classList.toggle("on",x===b));
    asoEstado.f=+b.dataset.i; redibujar(); });
  ho.oninput=()=>{ asoEstado.h=+ho.value; redibujar(); };
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
      if(k2) toast(TT("Casa de "+ent(k2.ac||k2.an)+" m²: "+k2.co+" m³ de corte y "+
                      (k2.ll||0)+" m³ de lleno.",
                      "House of "+ent(k2.ac||k2.an)+" m²: "+k2.co+" m³ cut and "+
                      (k2.ll||0)+" m³ fill."));
    };
  });

  mb.querySelector("#anl3d").onclick=()=>{
    cerrarAnalisis();
    if(!R3D.activo()) document.getElementById("b3d").click();
    R3D.casa(n, asoEstado.f, asoEstado.h);
    setTimeout(()=>R3D.irA(n), 80);
    toast(TT("Volumen de prueba sobre el lote ","Test volume on lot ")+n+
      TT(". Arrastre para girar alrededor.",". Drag to orbit around it."));
  };
  mb.querySelector("#anlPdf").onclick=()=>{ toast(T("Preparando la ficha…")); bajarPDF(n); };
  const bRen=mb.querySelector("#anlRen");
  if(bRen) bRen.onclick=()=>abrirRender(n);
  /* el isométrico se dibuja un tic después: así la hoja aparece de una vez
     y el dibujo entra ya con la ficha en pantalla */
  const hueco=mb.querySelector("#isoHueco");
  if(hueco) setTimeout(()=>{ try{ hueco.innerHTML=diagramaIso(n,860,470); }catch(e){ console.error(e); } },30);
  modal.hidden=false;
}
function cerrarAnalisis(){ modal.hidden=true; mb.classList.remove("ancha"); }

/* ---- lo que el mapa necesita de aquí ---- */
window.__ANL_LOC = LOC;
window.ANALISIS = {
  abrir: abrirAnalisis, cerrar: cerrarAnalisis, pdf: bajarPDF,
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
