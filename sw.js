/* Service worker de baja: borra solo las cachés públicas (no las de la app privada), se da de baja y recarga */
self.addEventListener("install", function(e){ self.skipWaiting(); });
self.addEventListener("activate", function(e){
  e.waitUntil(
    caches.keys().then(function(k){ return Promise.all(k.filter(function(n){ return n.indexOf("lcpriv-")!==0; }).map(function(n){ return caches.delete(n); })); })
    .then(function(){ return self.registration.unregister(); })
    .then(function(){ return self.clients.matchAll({type:"window"}); })
    .then(function(cs){ cs.forEach(function(c){ if(c.url.indexOf("/lc-oju3aklpcnevs2dowa/")<0) c.navigate(c.url); }); })
  );
});
