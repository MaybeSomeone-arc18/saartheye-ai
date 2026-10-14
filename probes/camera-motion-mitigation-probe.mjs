import { createTracker, chooseCue } from '../src/utils/tracking.js';
const W=800,H=600,DT=160,FRAMES=40;
// Mitigation probe: track per-id center history OUTSIDE the tracker.
// Camera-motion signature: area growth + center drifting radially outward
// from the frame center (projection of user walking forward).
function suppressCameraMotion(tracks, centers){
  for(const t of tracks){
    if(t.riskLevel==='none') continue;
    const h=centers.get(t.id)||[];
    const cx=t.bbox[0]+t.bbox[2]/2, cy=t.bbox[1]+t.bbox[3]/2;
    h.push({cx,cy}); if(h.length>8)h.shift(); centers.set(t.id,h);
    if(h.length<5) continue;
    const o=h[0], span=h.length-1;
    const rx=cx-W/2, ry=cy-H/2, rlen=Math.hypot(rx,ry);
    if(rlen<40) continue; // dead-center: no signal, cannot suppress
    const radial=((cx-o.cx)*rx+(cy-o.cy)*ry)/rlen/(span*DT/1000); // px/s outward
    if(radial>50 && t.growth>0.4){ t.riskLevel='none'; t.motionUncertain=true; }
  }
  return tracks;
}
function run(name,objects,cam,mitigate){ 
  const t=createTracker(); const centers=new Map(); let warns=0,firstWarn=null;
  for(let f=0;f<FRAMES;f++){
    const preds=objects.map(o=>{const b=cam(f,[o.x,o.y,o.w,o.h]);return {class:o.cls,score:.9,bbox:b};});
    let tracks=t.update(preds,f*DT,W,H);
    if(mitigate) tracks=suppressCameraMotion(tracks,centers);
    const cue=chooseCue(tracks);
    if(cue.kind==='warning'){warns++;if(firstWarn===null)firstWarn=f;}
  }
  console.log(`${mitigate?'MITIGATED':'current  '} ${name}: warns=${warns}/${FRAMES}`);
}
const dolly=r=>(f,[x,y,w,h])=>{const s=Math.pow(1+r,f),cx=W/2,cy=H/2;return [cx+(x-cx)*s,cy+(y-cy)*s,w*s,h*s];};
const selfGrow=r=>(f,[x,y,w,h])=>{const s=Math.pow(1+r,f);return [x-(w*s-w)/2,y-(h*s-h)/2,w*s,h*s];};
const scenes=[
 ['A real approach 1obj',[{cls:'person',x:350,y:200,w:100,h:100}],selfGrow(0.035)],
 ['B dolly 1 off-center',[{cls:'chair',x:120,y:150,w:100,h:100}],dolly(0.035)],
 ['J dolly 2 off-center',[{cls:'chair',x:80,y:150,w:90,h:90},{cls:'person',x:600,y:350,w:110,h:110}],dolly(0.035)],
 ['K dolly dead-center (irreducible)',[{cls:'chair',x:350,y:250,w:100,h:100}],dolly(0.035)],
 ['I real approach off-center',[{cls:'chair',x:120,y:150,w:100,h:100}],selfGrow(0.035)],
 ['L dolly + 1 real approacher',[{cls:'chair',x:80,y:150,w:90,h:90},{cls:'person',x:600,y:350,w:110,h:110}],(f,b)=>b[0]<400?dolly(0.035)(f,b):selfGrow(0.05)(f,b)],
];
for(const [n,o,c] of scenes){ run(n,o,c,false); run(n,o,c,true); }
