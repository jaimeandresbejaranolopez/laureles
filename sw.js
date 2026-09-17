/* =============================================================================
   Service worker de Laureles Campestre
   Guarda la aplicación y las teselas para que el asesor pueda usar el mapa
   parado en el lote, con mala señal o sin señal.

   DOS CACHÉS, a propósito:
     · APP      cambia con cada publicación. Suba VERSION al publicar.
     · TESELAS  NO cambia al publicar. Antes las teselas vivían en la misma
                caché que la aplicación, así que cada despliegue las borraba
                todas y el satélite había que bajarlo entero otra vez: en una
                conexión mala eso se ve exactamente igual que "el satélite no
                funciona". Las teselas no cambian nunca, así que se quedan.
   ============================================================================= */
const VERSION = "laureles-20260917c-sim-compacto";
const APP     = VERSION;
const TESELAS = "laureles-teselas-1";
const PROPIO = [
  "./", "./index.html", "./lotes.js", "./manifest.json",
  "./icono-192.png", "./icono-512.png",
  "./maplibre-gl.js", "./maplibre-gl.css",
  "./analisis.css", "./analisis.js", "./adaptador.js", "./datos-analisis.js",
  "./armazon.css", "./armazon.js", "./datos-terreno.js", "./datos-logo.js",
  "./r3d.js", "./datos-via.js",
  "./medios/logo.png", "./medios/logo_claro.png", "./medios/hero.jpg", "./medios/intro.mp4"
];

self.addEventListener("install", e=>{
  /* addAll falla entero si un solo archivo falla; se piden uno por uno para que
     una falta no deje la aplicación sin caché */
  e.waitUntil(caches.open(APP).then(c=>
    Promise.all(PROPIO.map(u=>c.add(u).catch(()=>null)))
  ).then(()=>self.skipWaiting()));
});

self.addEventListener("activate", e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(
    ks.filter(k=>k!==APP && k!==TESELAS).map(k=>caches.delete(k))
  )).then(()=>self.clients.claim()));
});

self.addEventListener("fetch", e=>{
  const req = e.request;
  if(req.method !== "GET") return;
  let u; try{ u = new URL(req.url); }catch(_){ return; }
  if(u.protocol !== "http:" && u.protocol !== "https:") return;
  if(/supabase\.co/.test(u.hostname)) return;          /* nunca tocar la base de datos */

  const esTesela = u.pathname.includes("/terreno/") ||
                   /arcgisonline|cartocdn|tile\.openstreetmap\.org/.test(u.hostname);

  if(esTesela){
    e.respondWith(
      caches.match(req).then(hit=>{
        if(hit) return hit;
        return fetch(req).then(resp=>{
          /* Sólo se guarda lo que llegó bien. Guardar un error convierte una
             falla de un momento en una falla permanente: era lo que dejaba el
             satélite en negro hasta borrar los datos del sitio. */
          if(resp && resp.ok && resp.status===200){
            const cp=resp.clone();
            caches.open(TESELAS).then(c=>c.put(req,cp)).catch(()=>{});
          }
          return resp;
        });
        /* si la red falla y no hay copia, se deja pasar el error tal cual:
           MapLibre reintenta solo, que es lo que debe pasar */
      })
    );
    return;
  }

  e.respondWith(
    fetch(req).then(resp=>{
      if(resp && resp.ok && u.origin===location.origin){
        const cp=resp.clone();
        caches.open(APP).then(c=>c.put(req,cp)).catch(()=>{});
      }
      return resp;
    }).catch(()=>caches.match(req).then(hit=>hit || Response.error()))
  );
});
