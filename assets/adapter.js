// Small adapter for the archived engine's module exports. No Next server is required.
const registry=new Map(), cache=new Map([[43476,{}],[71645,{}]]);
window.TURBOPACK={push(chunk){let ids=[];for(const item of chunk.slice(1)){if(typeof item==='function'){const group={ids:[...ids],factory:item,loaded:false};ids.forEach(id=>registry.set(id,group));ids=[];}else ids.push(item);}}};
window.engineModule=function requireModule(id){if(cache.has(id))return cache.get(id);const g=registry.get(id);if(!g)throw new Error('Missing engine module '+id);g.ids.forEach(k=>cache.set(k,{}));g.loaded=true;g.factory({i:requireModule,s(entries,target){const obj=cache.get(target??id);for(let n=0;n<entries.length;n+=3)obj[entries[n]]=entries[n+2];}});return cache.get(id);};
