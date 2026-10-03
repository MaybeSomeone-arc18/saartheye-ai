import { readdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
async function walk(root) {
  const list=[];for(const entry of await readdir(root,{withFileTypes:true})){
    const path=`${root}/${entry.name}`;
    if(entry.isDirectory())list.push(...await walk(path));else if(entry.name!=='sw.js')list.push(path);
  }return list;
}
const files=await walk('dist'),hash=createHash('sha256');
for(const file of files)hash.update(await readFile(file));
const version=hash.digest('hex').slice(0,12);
const assets=files.map(f=>`/${f.slice(5)}`);
await writeFile('dist/sw.js',`/* Built from all production files. Cache contains no camera frames. */
const CACHE='saartheye-${version}';
const ASSETS=${JSON.stringify(assets)};
self.addEventListener('install',event=>event.waitUntil((async()=>{
  const cache=await caches.open(CACHE);
  await cache.addAll(ASSETS);
  await self.skipWaiting();
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
  for(const key of await caches.keys())if(key.startsWith('saartheye-')&&key!==CACHE)await caches.delete(key);
  await self.clients.claim();
})()));
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;
  event.respondWith((async()=>{
    const cached=await caches.match(event.request);if(cached)return cached;
    try{return await fetch(event.request);}catch(error){
      if(event.request.mode==='navigate')return (await caches.match('/index.html'))||Response.error();
      throw error;
    }
  })());
});
self.addEventListener('message',event=>{
  if(event.data?.type!=='CHECK_OFFLINE')return;
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE);
    const entries=await Promise.all(ASSETS.map(a=>cache.match(a)));
    const ready=entries.every(Boolean);
    event.ports[0]?.postMessage({ready,version:'${version}',message:ready?'Offline assets verified.':'Offline cache is incomplete. Reconnect to install all assets.'});
  })());
});
`);
console.log('Offline worker generated:',version,assets.length,'assets');
