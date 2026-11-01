// The scope and cache prefix keep other apps on the same GitHub Pages origin intact.
const VERSION=4;
const PREFIX='daily-shell-';
const CACHE=PREFIX+VERSION;
const SHELL=new URL('index.html',self.registration.scope).href;
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(['./','index.html'])).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith(PREFIX)&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
  const request=event.request;
  const url=new URL(request.url);
  if(request.method!=='GET' || url.origin!==self.location.origin || request.mode!=='navigate' || !url.pathname.startsWith(new URL(self.registration.scope).pathname)) return;
  event.respondWith((async()=>{
    const cache=await caches.open(CACHE);
    const controller=new AbortController();
    const timeout=setTimeout(()=>controller.abort(),3500);
    try{
      const response=await fetch(request,{cache:'no-store',signal:controller.signal});
      if(response.ok){ await cache.put(SHELL,response.clone()); return response; }
      return (await cache.match(SHELL))||response;
    }catch(error){
      return (await cache.match(SHELL))||Response.error();
    }finally{clearTimeout(timeout);}
  })());
});
