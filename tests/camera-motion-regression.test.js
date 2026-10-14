import test from 'node:test';
import assert from 'node:assert/strict';
import { createTracker, chooseCue } from '../src/utils/tracking.js';

// Regression cases for CORRECT current behavior under replayed motion.
// Known false-warning gaps (1-2 static objects under forward camera motion,
// dead-center ambiguity) are documented in docs/CAMERA-MOTION-INVESTIGATION.md
// and are intentionally NOT asserted here as expected behavior.
const W=800,H=600,DT=160,FRAMES=40;
function warnings(objects,cam){
  const t=createTracker(); let warns=0;
  for(let f=0;f<FRAMES;f++){
    const preds=objects.map(o=>{const b=cam(f,[o.x,o.y,o.w,o.h]);return {class:o.cls,score:.9,bbox:b};});
    if(chooseCue(t.update(preds,f*DT,W,H)).kind==='warning')warns++;
  }
  return warns;
}
const dolly=r=>(f,[x,y,w,h])=>{const s=Math.pow(1+r,f),cx=W/2,cy=H/2;return [cx+(x-cx)*s,cy+(y-cy)*s,w*s,h*s];};
const selfGrow=r=>(f,[x,y,w,h])=>{const s=Math.pow(1+r,f);return [x-(w*s-w)/2,y-(h*s-h)/2,w*s,h*s];};
const pan=(px,r=0)=>(f,[x,y,w,h])=>{const s=Math.pow(1+r,f);return [x+px*f-(w*s-w)/2,y-(h*s-h)/2,w*s,h*s];};

test('a real approaching object still warns (detection must not regress)',()=>{
  assert.ok(warnings([{cls:'person',x:350,y:200,w:100,h:100}],selfGrow(0.035))>20);
});
test('common expansion of 4 tracks is suppressed as camera motion',()=>{
  const objs=[{cls:'chair',x:80,y:200,w:90,h:90},{cls:'person',x:300,y:180,w:100,h:100},{cls:'bottle',x:520,y:220,w:70,h:70},{cls:'chair',x:680,y:200,w:95,h:95}];
  assert.equal(warnings(objs,dolly(0.035)),0);
});
test('pure camera pan stays quiet',()=>{
  assert.equal(warnings([{cls:'chair',x:150,y:200,w:100,h:100},{cls:'person',x:550,y:180,w:110,h:110}],pan(12)),0);
});
test('pan with slight growth below the approach threshold stays quiet',()=>{
  assert.equal(warnings([{cls:'chair',x:150,y:200,w:100,h:100},{cls:'person',x:550,y:180,w:110,h:110}],pan(10,0.02)),0);
});
