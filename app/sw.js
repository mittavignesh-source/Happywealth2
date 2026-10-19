// HappyWealth demo service worker: app shell cached for instant, offline-capable opening
const CACHE='hw2-v6';
const SHELL=['./','./index.html','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png','./icons/apple-touch-icon.png','./icons/icon-maskable-512.png','./icons/icon-maskable-192.png'];
self.addEventListener('install',e=>{ e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting())); });
self.addEventListener('activate',e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener('fetch',e=>{ const r=e.request; if(r.method!=='GET') return;
  const url=new URL(r.url);
  if(url.origin===location.origin && (r.mode==='navigate'||url.pathname.endsWith('.html'))){ // the app page: network first so updates show right away
    e.respondWith(fetch(r).then(res=>{ caches.open(CACHE).then(c=>c.put(r,res.clone())); return res; }).catch(()=>caches.match(r).then(h=>h||caches.match('./index.html'))));
  } else if(url.origin===location.origin){ // other app files: cache first, refresh in background
    e.respondWith(caches.match(r).then(hit=>{ const net=fetch(r).then(res=>{ caches.open(CACHE).then(c=>c.put(r,res.clone())); return res; }).catch(()=>hit); return hit||net; }));
  } else if(/fonts\.(googleapis|gstatic)\.com/.test(url.host)){ // fonts: cache once
    e.respondWith(caches.open(CACHE).then(c=>c.match(r).then(hit=>hit||fetch(r).then(res=>{ c.put(r,res.clone()); return res; }))));
  } });
