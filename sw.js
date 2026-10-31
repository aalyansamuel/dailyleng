/* DailyLeng · Service Worker. Cambia V en cada versión nueva para que la app avise de la actualización. */
const V='dailyleng-v26';
const LANGS=['fr','ru','en','de','it','pt'];
const FILES=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png'].concat(LANGS.map(l=>'data/'+l+'.js'));
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(FILES.map(u=>new Request(u,{cache:'reload'})))));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('message',e=>{if(e.data&&e.data.type==='SKIP_WAITING')self.skipWaiting();});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET'||new URL(r.url).origin!==location.origin)return;
 if(r.mode==='navigate'){e.respondWith(fetch(r).then(res=>{const cp=res.clone();caches.open(V).then(c=>c.put('index.html',cp));return res;}).catch(()=>caches.match('index.html')));return;}
 /* los datos de cada idioma se piden con ?v=…; se buscan sin tener en cuenta esa parte */
 e.respondWith(caches.match(r,{ignoreSearch:true}).then(m=>m||fetch(r).then(res=>{const cp=res.clone();caches.open(V).then(c=>c.put(r,cp));return res;})));});
