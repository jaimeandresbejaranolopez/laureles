/* Service worker de Laureles Campestre.
   Guarda la aplicación y las teselas del relieve para que el asesor pueda usar
   el mapa parado en el lote, con mala señal o sin señal.
   Suba el número de VERSION cada vez que publique cambios. */
const VERSION = "laureles-20260910h-p039";
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
  e.waitUntil(caches.open(VERSION).then(c=>c.addAll(PROPIO)).then(()=>self.skipWaiting()));
});
self.addEventListener("activate", e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(
    ks.filter(k=>k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener("fetch", e=>{
  const u = new URL(e.request.url);
  if(e.request.method !== "GET") return;
  // nunca guardar las escrituras a Supabase
  if(/supabase\.co/.test(u.hostname)) return;

  const esTeselaPropia = u.pathname.includes("/terreno/");
  const esBase = /arcgisonline|cartocdn|tile\.openstreetmap\.org/.test(u.hostname);

  if(esTeselaPropia || esBase){
    // primero la caché: las teselas no cambian
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(resp=>{
      if(resp.ok){ const cp=resp.clone(); caches.open(VERSION).then(c=>c.put(e.request,cp)); }
      return resp;
    }).catch(()=>r)));
    return;
  }
  // el resto: red primero, caché de respaldo
  e.respondWith(fetch(e.request).then(resp=>{
    if(resp.ok && u.origin===location.origin){ const cp=resp.clone();
      caches.open(VERSION).then(c=>c.put(e.request,cp)); }
    return resp;
  }).catch(()=>caches.match(e.request)));
});
