# Laureles Campestre — mapa de ventas

Página autocontenida para los asesores: el loteo real sobre imagen satelital,
con el relieve del propio levantamiento, fichas por lote y estado compartido.

## Publicarla (GitHub Pages, gratis)

1. Cree un repositorio en GitHub (puede ser privado; Pages funciona igual en
   cuentas de pago, y público en las gratuitas).
2. Suba **todo el contenido de esta carpeta** a la raíz del repositorio.
3. En *Settings → Pages*, elija *Deploy from a branch*, rama `main`, carpeta `/ (root)`.
4. A los dos o tres minutos queda en `https://<usuario>.github.io/<repositorio>/`.

No hay que compilar nada. No hay `npm`, ni servidor, ni llaves de API.

## Qué hay en cada archivo

| Archivo | Qué es |
|---|---|
| `index.html` | La aplicación completa: interfaz, mapa y lógica. |
| `lotes.js` | **Los datos.** Los 86 lotes con geometría real, áreas, pendientes y precios, más vías, protección, zonas comunes y curvas de nivel. Aquí se cambian precios y estados sin tocar nada más. |
| `terreno/` | 79 teselas Terrain-RGB con la altura del terreno, generadas con las curvas cada 1 m del levantamiento. Es lo que levanta el mapa en 3D. |
| `manifest.json`, `sw.js`, `icono-*.png` | Lo que la vuelve instalable en el celular y la deja funcionar sin señal. |
| `armazon.js`, `armazon.css` | **El armazón del plano vivo**: intro de marca, pantalla de bienvenida, cabecera con logo y navegación, barra de sitios de interés y los modales de contenido. Se generan de `fable/plano_tpl.html` con `web_armazon.py`; **no se editan aquí**. |
| `medios/` | Video de intro, portada, logo y las fotos del recorrido, como archivos. En el plano vivo viajan incrustados; aquí van sueltos para que el navegador los cachee. |
| `analisis.js` | **El análisis del lote**, tomado tal cual del plano vivo: topografía, dónde cabe la Casa 30JB, asoleación, el isométrico del sol, el visor de render y las cinco páginas del PDF. |
| `datos-analisis.js` | La geometría del plano 039, la implantación de la casa lote por lote y las imágenes del render. |
| `datos-terreno.js` | La malla de alturas del levantamiento (244 × 236 puntos cada 4 m). La usan el corte del terreno, el mapa de pendientes y el relieve 3D. |
| `r3d.js` | **El relieve 3D en WebGL**, traído del plano vivo: el predio en volumen, los lotes coloreados por estado, el volumen de la casa sobre su plataforma y la bóveda solar. Se enciende con el botón **3D** de la cabecera. Se genera de `fable/plano_tpl.html` con `gen_r3d.py`; **no se edita aquí**. |
| `datos-via.js` | El corredor vial del proyecto en coordenadas geográficas. Sólo lo usa el relieve 3D. |
| `adaptador.js` | El puente entre el mapa y el análisis: le entrega estados, etapa y precios leyendo siempre lo que el mapa tiene en pantalla. |
| `analisis.css` | Los estilos del análisis, encerrados en `#anlModal` para que no toquen el resto de la página. |
| `supabase.sql` | El SQL que crea la tabla de estados compartidos. Opcional. |

## Publicarla en GitHub Pages (usuario JAIME1)

1. En GitHub, **New repository**: nombre `laureles`, **público**, sin README.
2. **Add file → Upload files** y suba **todo el contenido de esta carpeta**
   (los archivos sueltos y las carpetas `medios/` y `terreno/`), no la carpeta
   comprimida. Commit.
3. **Settings → Pages → Deploy from a branch**, rama `main`, carpeta `/ (root)`.
4. A los dos o tres minutos queda en
   `https://jaime1.github.io/laureles/`.

Ese link abre en cualquier celular o portátil, se puede instalar como app desde
el navegador y sigue funcionando sin señal después de la primera carga.

**El repositorio es público**, así que el código, los precios de lista y la
llave publicable de Supabase quedan a la vista de quien dé con la URL. Los
precios ya salen en la ficha de cada lote, así que no hay nada nuevo ahí. La
llave publicable está hecha para viajar en el navegador: lo que protege los
datos no es esconderla sino la RLS de la tabla (ver abajo).

## El estado compartido de los lotes

Ya está montado en Supabase y la página viene conectada: no hay que pegar
ninguna llave. La tabla es `laureles_lotes`, con los 86 lotes sembrados.

- **Leer**: cualquiera. El mapa muestra el estado real de cada lote.
- **Escribir**: sólo con sesión iniciada. La llave publicable del sitio **no
  puede** cambiar un estado, y está comprobado.

Mientras no haya asesores con usuario en Supabase, el botón de cambiar estado
sigue funcionando **sólo en ese dispositivo** (queda guardado en el navegador).
Para que un cambio lo vean todos hay que crear los usuarios en Supabase.

## Plano 039 · 86 lotes

Todo el paquete corre sobre el **plano 039 del 09/09/2026**: 86 lotes numerados
1 a 86, 300.356 m² en lotes, 231.684 m² útiles y 68.672 m² de protección dentro
de lotes. El lindero sigue cerrando en 369.937,53 m².

**Los estados quedaron todos en DISPONIBLE.** La numeración cambió entre el 038 y
el 039, así que los 26 negocios registrados contra la numeración vieja no se
pueden trasladar solos sin arriesgar asignarle un negocio al lote equivocado.
Hay que volver a marcarlos contra el plano nuevo.

## Girar el mapa con la rueda

En muchos equipos el navegador o el sistema se quedan con **Ctrl + rueda** antes
de que la página la vea (en macOS es el zoom de accesibilidad), así que el atajo
no siempre llega. Por eso hay un interruptor: el botón **⟳** del grupo de flechas,
abajo a la derecha del mapa.

- Apagado (por defecto): la rueda acerca y aleja, como en cualquier mapa.
- Encendido: la **rueda sola gira el eje**, **Ctrl + rueda** acerca y
  **Mayús + rueda** inclina.

Arrastrar con el botón izquierdo mueve el mapa (paneo de mano) en los dos modos.
La elección se recuerda en el dispositivo.

El mapa no pasa de zoom 18,5: por encima Esri deja de entregar foto real y
devuelve un relleno, y con el relieve puesto la cámara se desestabiliza.

## Dos cosas del relieve que NO hay que "arreglar"

**1. Una sola fuente de altura.** El sombreado (`sombreado`) y el relieve
(`setTerrain`) usan la MISMA fuente `terreno`. Hubo una segunda fuente `sombra`
apuntando a las mismas teselas y, con el relieve encendido, eso rompía el
drapeado: el mapa se quedaba sin lotes, sin vías y sin lindero, y sólo flotaban
los números sobre la foto. Se veía exactamente como si la foto hubiera perdido el
amarre. Si alguien vuelve a separar las fuentes, vuelve el problema.

**2. Sin `bounds` en la fuente de altura.** Poner `bounds` quita los 404 de las
teselas que no existen, pero deja el relieve sin aplicar. Los 404 son inofensivos
—`mapa.on("error")` ya se los traga— y salen sólo en la consola. Es preferible el
ruido en la consola a un mapa sin dibujo.

Con el relieve puesto la inclinación se limita a **50°**; sin relieve llega a 78°.

## Cuando el mapa se traba

Con el relieve encendido, MapLibre a veces deja la cámara sin inversa y el mapa
queda muerto: ni gira, ni acerca, ni se mueve. La página guarda la última cámara
buena y la restituye sola; se ve medio segundo raro y sigue. Antes había que
recargar.

## Las cotas

Las curvas de nivel del levantamiento aparecen solas al acercarse (desde zoom 16)
y las maestras llevan su cota rotulada. Se pueden apagar en *Capas → Curvas de
nivel*. En el informe del lote las curvas van sobre la planta y sobre el mapa de
pendientes, calculadas del mismo modelo de alturas que el corte y el bloque 3D.

### Lo que el levantamiento no cubre

Las curvas de nivel del plano **039 son las mismas del 037**: misma huella, mismos
158 polígonos. Se quedan **86 m cortas por el norte y 21 m por el occidente**, así
que siguen faltando **2,16 ha en 14 lotes** (numeración del 039):

| Lote | Levantado | Sin curvas |
|---|---|---|
| 65 | 25 % | 2.495 m² |
| 68 | 38 % | 2.853 m² |
| 69 | 41 % | 2.887 m² |
| 70 | 44 % | 2.725 m² |
| 67 | 44 % | 1.907 m² |
| 66 | 46 % | 1.758 m² |
| 71 | 58 % | 1.703 m² |
| 72 | 75 % | 881 m² |
| 74 | 79 % | 815 m² |
| 85 | 80 % | 929 m² |
| 86 | 85 % | 1.501 m² |
| 84 | 88 % | 526 m² |
| 75 | 91 % | 340 m² |
| 73 | 91 % | 282 m² |

Ahí el relieve que se dibuja es **relleno**: la cota del punto de curva más
cercano, sólo para que el modelo no acabe en un tajo. En el 3D esa zona sale
rayada en gris, el rótulo del lote lleva borde punteado, y el informe y la ficha
PDF dicen cuántos m² se levantaron de cuántos.

El reparto de pendientes de esos lotes se calcula **sólo sobre la parte
levantada** y el informe lo dice con nombre y cifra. Varios son planos por el
frente —que es lo levantado— y caen por el fondo, que es justo lo que falta.


## El relieve 3D

El botón **3D** de la cabecera cambia el mapa por el modelo del terreno, el mismo
del plano vivo. Allí:

- se arrastra para girar alrededor del predio y la rueda del ratón acerca o aleja;
- **1× / 2× / 3×** exageran el relieve para que la ladera se lea (2× por defecto);
- al escoger un lote entra el volumen de la Casa 30JB parado sobre su plataforma,
  con el corte y el lleno que eso supone;
- **Sol** levanta la bóveda solar sobre la casa: los recorridos del sol en los dos
  solsticios y el equinoccio, con las horas marcadas. La bóveda obliga a escala
  real (1×), porque con el relieve exagerado los ángulos mentirían;
- **Encuadrar** vuelve a la vista de todo el predio.

Necesita WebGL. Si el dispositivo no lo tiene, el botón lo avisa y el mapa sigue
funcionando normal.

## Las cuatro bases del mapa

| Botón | Qué es | Atribución |
|---|---|---|
| **Plano** | sin teselas, fondo liso. Para trabajar el dibujo en sí | — |
| **Mapa** | OpenStreetMap | `© OpenStreetMap contributors` |
| **Satélite** | Esri World Imagery | `Imagen © Esri, Maxar, Earthstar Geographics` |
| **Oscuro** | CARTO dark sobre datos de OpenStreetMap | `© OpenStreetMap © CARTO` |

Dos cosas medidas, no supuestas:

- **Esri se acaba en zoom 18 sobre este predio.** A z19 y z20 el servidor devuelve
  un relleno de **2.521 bytes con HTTP 200** —no un error—, así que la foto se ve
  borrosa y nadie entiende por qué. La capa va con `maxzoom: 18` para que MapLibre
  reescale la buena en vez de pedir la vacía.
- **OpenStreetMap casi no dibuja nada en zona rural.** La tesela z18 sobre el
  predio tiene brillo 238 y desviación 0: está en blanco. En el campo la base útil
  es Satélite; OSM sirve para ubicarse respecto a Armenia y La Tebaida.

El amarre está verificado: el lindero del plano cae a **0,42 m** del borde del
carreteable existente, medido sobre 243 transectos de la imagen de Esri.

## Análisis del lote y ficha PDF

En la ficha de cada lote hay un botón **Análisis del lote y ficha PDF**. Abre la
misma hoja del plano vivo: cómo se reparte la pendiente, dónde cabe la Casa 30JB
(un piso o dos niveles según el desnivel bajo la casa), el recorrido del sol en
isométrico, el abanico de sombras hora por hora y el visor de render.

El botón **Descargar ficha técnica y comercial** arma un PDF de cinco páginas
dentro del navegador —no hay servidor de por medio—:

1. **Portada:** el plano general del proyecto con el lote resaltado, para que
   quien la reciba semanas después vuelva a ubicarlo sin buscar el plano.
2. **Ficha técnica:** áreas, medidas, terreno, reparto de pendientes y sol.
3. **El sol sobre la casa:** la implantación en isométrico con los tres
   recorridos solares del año.
4. **Horas de sol por fachada** y el abanico de sombras.
5. **Valor comercial:** las seis etapas, la forma de pago y qué entra en el precio.

Arriba a la derecha hay un selector **ES · EN · FR**: cambia el análisis y el PDF
completo de idioma. El resto del mapa sigue en español por ahora.

## Estado compartido entre asesores (opcional)

Sin configurar nada, cuando un asesor marca un lote como separado el cambio
queda **sólo en su dispositivo**. Para que lo vean todos:

1. Cree un proyecto gratuito en supabase.com.
2. Pegue `supabase.sql` en el editor SQL y ejecútelo.
3. En la página, botón **Ajustes**, pegue la URL del proyecto y la llave
   pública (`anon`). Esas dos cosas no son secretas: la seguridad la da el RLS
   del SQL, que deja leer a todo el mundo y escribir sólo a usuarios autenticados.

## De dónde salen los datos

- **Geometría:** DXF del plano 039 del 9 de septiembre de 2026, georreferenciado
  en MAGNA-SIRGAS / Origen Nacional CTM12 (EPSG:9377), transformado a WGS84.
  No está dibujado a mano sobre la imagen.
- **Relieve:** las 158 curvas de nivel cada 1 m del mismo levantamiento
  (58.278 vértices, cota 1.197 a 1.237 m s. n. m.). El modelo reproduce esas
  curvas con un error cuadrático medio de 0,12 m.
  **Fuera del predio el relieve es un relleno suavizado, no un levantamiento.**
- **Seis lotes** del extremo norte y del vértice occidental quedan fuera del
  área con curvas; su ficha lo advierte y no muestra cota ni pendiente.
- **Imagen de fondo:** Esri World Imagery (satelital) y CARTO sobre datos de
  OpenStreetMap (claro y oscuro). Ninguna necesita llave.
  Cuando esté la ortofoto del dron, reemplaza al satelital.

## Lo que falta

- Poner el número de WhatsApp de ventas en **Ajustes** (viene con un número de relleno).
- La ortofoto del dron, para cambiar el fondo satelital por una imagen de verdad
  del predio.
- Los tiempos de recorrido a Armenia, al aeropuerto, a La Tebaida y al Parque del
  Café: hay que medirlos, no inventarlos.
