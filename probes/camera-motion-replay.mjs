import { createTracker, chooseCue } from '../src/utils/tracking.js';
const W=800,H=600,DT=160,FRAMES=40;
function run(name,objects,cam){ 
  const t=createTracker(); let warns=0,firstWarn=null; let lastTracks=[];
  for(let f=0;f<FRAMES;f++){
    const preds=objects.map(o=>{const b=cam(f,[o.x,o.y,o.w,o.h]);return {class:o.cls,score:.9,bbox:b};});
    const tracks=t.update(preds,f*DT,W,H); lastTracks=tracks;
    const cue=chooseCue(tracks);
    if(cue.kind==='warning'){warns++;if(firstWarn===null)firstWarn=f;}
  }
  const drift=lastTracks.map(tr=>{const cx=tr.bbox[0]+tr.bbox[2]/2;return `${tr.class}@cx=${cx.toFixed(0)}`;}).join(' ');
  console.log(`${name}: warns=${warns}/${FRAMES} firstAt=${firstWarn===null?'-':(firstWarn*DT/1000).toFixed(1)+'s'} | ${drift}`);
}
// camera forward motion: everything scales about the FRAME center (principal point)
const dolly=r=>(f,[x,y,w,h])=>{const s=Math.pow(1+r,f),cx=W/2,cy=H/2;
  return [cx+(x-cx)*s, cy+(y-cy)*s, w*s, h*s];};
// object approaches the user: grows about its OWN center, center stays fixed
const selfGrow=r=>(f,[x,y,w,h])=>{const s=Math.pow(1+r,f);return [x-(w*s-w)/2,y-(h*s-h)/2,w*s,h*s];};

run('H camera dolly, 1 off-center static obj',[{cls:'chair',x:120,y:150,w:100,h:100}],dolly(0.035));
run('I real approach, off-center obj',[{cls:'chair',x:120,y:150,w:100,h:100}],selfGrow(0.035));
run('J camera dolly, 2 off-center static obj',[{cls:'chair',x:80,y:150,w:90,h:90},{cls:'person',x:600,y:350,w:110,h:110}],dolly(0.035));
run('K camera dolly, 1 DEAD-CENTER static obj (worst case)',[{cls:'chair',x:350,y:250,w:100,h:100}],dolly(0.035));
run('L mixed: camera dolly + one obj really approaching',[{cls:'chair',x:80,y:150,w:90,h:90},{cls:'person',x:600,y:350,w:110,h:110}],(f,b)=>b[0]<400?dolly(0.035)(f,b):selfGrow(0.05)(f,b));
