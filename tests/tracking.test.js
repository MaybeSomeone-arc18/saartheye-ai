import test from 'node:test';
import assert from 'node:assert/strict';
import { createTracker, chooseCue, iou, percentile } from '../src/utils/tracking.js';
const pred=(kind,x,w=100,score=.9)=>({class:kind,score,bbox:[x,100,w,w]});
test('IoU and percentiles',()=>{assert.equal(iou([0,0,10,10],[0,0,10,10]),1);assert.equal(iou([0,0,10,10],[30,0,10,10]),0);assert.equal(percentile([1,4,2,3],.5),2);});
test('ordering does not change track IDs',()=>{const t=createTracker();const a=t.update([pred('person',100),pred('chair',400)],0,800,600);const b=t.update([pred('chair',400),pred('person',100)],160,800,600);assert.equal(a[0].id,b[1].id);assert.equal(b[0].growth,0);});
test('two same-class detections keep separate IDs',()=>{const t=createTracker();const a=t.update([pred('person',100),pred('person',400)],0,800,600);const b=t.update([pred('person',400),pred('person',100)],160,800,600);assert.equal(a[0].id,b[1].id);});
test('stable person is quiet, shrinking is not a stationary shortcut',()=>{const t=createTracker();let r;for(let i=0;i<30;i++)r=t.update([pred('person',100)],i*160,800,600);assert.equal(r[0].stablePerson,true);assert.equal(chooseCue(r,'SOCIAL').kind,'ambient');for(let i=30;i<39;i++)r=t.update([pred('person',100,100-(i-29)*4)],i*160,800,600);assert.equal(r[0].stablePerson,false);assert.equal(r[0].approaching,false);});
test('growing second object triggers SOCIAL warning',()=>{const t=createTracker();let r;for(let i=0;i<15;i++)r=t.update([pred('person',50),pred('chair',400,60+i*6)],i*160,800,600);assert.equal(r[1].approaching,true);assert.equal(chooseCue(r,'SOCIAL').kind,'warning');assert.equal(chooseCue(r,'SOCIAL').target.class,'chair');});
test('dropout does not join stale area history',()=>{const t=createTracker();t.update([pred('person',100)],0,800,600);t.update([],160,800,600);const r=t.update([pred('person',100,145)],320,800,600);assert.equal(r[0].growth,0);assert.equal(r[0].approaching,false);});
test('class change and large box jump start a new track',()=>{const t=createTracker();const a=t.update([pred('chair',100)],0,800,600);const b=t.update([pred('person',100,190)],160,800,600);assert.notEqual(a[0].id,b[0].id);assert.equal(b[0].growth,0);});
test('large central stationary object is not labelled a collision',()=>{const t=createTracker();let r;for(let i=0;i<12;i++)r=t.update([pred('chair',250,300)],i*160,800,600);assert.equal(chooseCue(r).kind,'presence');});
test('empty scene and low confidence stay quiet',()=>{const t=createTracker();assert.equal(chooseCue(t.update([pred('person',10,100,.1)],0,800,600)).kind,'none');});
test('slow sequential inference retains a usable area history',()=>{const t=createTracker();let r;for(let i=0;i<10;i++)r=t.update([pred('person',100,100+i*25)],i*1100,800,600);assert.equal(r[0].id,1);assert.ok(r[0].samples>=4);assert.ok(r[0].growth>0);});
test('sustained central growth raises estimated path severity only after track age',()=>{
 const t=createTracker();let r;for(let i=0;i<14;i++){const w=70+i*10;r=t.update([{class:'chair',score:.9,bbox:[400-w/2,200-w/2,w,w]}],i*160,800,600);if(i<4)assert.equal(r[0].riskLevel,'none')}
 assert.equal(r[0].riskLevel,'path');assert.equal(chooseCue(r).kind,'warning');
});
test('static translation and alternating box jitter do not create approach warnings',()=>{
 const t=createTracker();let r;for(let i=0;i<30;i++)r=t.update([pred('person',100+(i%2)*10,100+(i%2)*2)],i*160,800,600);
 assert.equal(r[0].riskLevel,'none');assert.equal(chooseCue(r).kind,'presence');
});
test('similar multi-object expansion suppresses camera-motion-uncertain warnings',()=>{
 const t=createTracker();let r;for(let i=0;i<12;i++){const w=40+i*4;r=t.update([pred('chair',40,w),pred('person',300,w),pred('car',550,w)],i*160,800,600)}
 assert.ok(r.every(t=>t.motionUncertain));assert.ok(r.every(t=>t.riskLevel==='none'));assert.equal(chooseCue(r).kind,'presence');
});
test('multiple objects remain tracked and summary prioritizes path warning then central object',()=>{
 const tracks=[{id:1,class:'person',pan:-.7,growth:0,coverage:.3,riskLevel:'none',inCorridor:false},{id:2,class:'chair',pan:0,growth:1,riskLevel:'path',coverage:.1,inCorridor:true},{id:3,class:'bottle',pan:.8,growth:0,coverage:.01,riskLevel:'none',inCorridor:false}];
 const cue=chooseCue(tracks);assert.equal(cue.count,3);assert.equal(cue.summary.length,2);assert.equal(cue.summary[0].class,'chair');assert.equal(cue.target.id,2);assert.equal(tracks.length,3);
});
