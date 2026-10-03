import test from 'node:test';
import assert from 'node:assert/strict';
import { unlockAudio, testStereo, audioState } from '../src/utils/spatialAudio.js';
let ctx;
class Audio {
  constructor(){ctx=this;this.state='suspended';this.currentTime=0;this.destination={};this.starts=[];this.pans=[];}
  async resume(){await new Promise(r=>setTimeout(r,20));this.state='running';}
  createOscillator(){const c=this;return {frequency:{setValueAtTime(){}},connect(){},start(at){assert.equal(c.state,'running');c.starts.push(at);},stop(){}};}
  createGain(){return {gain:{setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){},disconnect(){}};}
  createStereoPanner(){const c=this;return {pan:{setValueAtTime(v){c.pans.push(v)}},connect(){},disconnect(){}};}
}
globalThis.window={AudioContext:Audio};
test('stereo test awaits suspended context and schedules both channels',async()=>{assert.equal(await testStereo(),'stereo');assert.equal(audioState(),'running');assert.deepEqual(ctx.pans,[-1,1]);assert.deepEqual(ctx.starts,[.05,1.45]);});
test('resume failure is reported rather than pretending audio runs',async()=>{ctx.state='suspended';ctx.resume=async()=>{throw new Error('blocked')};await assert.rejects(unlockAudio(),/blocked/);});
test('unsupported stereo panner keeps an audible mono fallback',async()=>{ctx.state='closed';Audio.prototype.createStereoPanner=undefined;assert.equal(await testStereo(),'mono fallback');assert.equal(ctx.starts.length,2);});

const {createSpeechController,speechPhrase}=await import('../src/utils/spatialAudio.js');
test('speech directions and honest growth phrase',()=>{
  assert.equal(speechPhrase({kind:'warning',target:{class:'person',pan:-.5}}),'person, left, possible approach');
  assert.equal(speechPhrase({kind:'presence',target:{class:'chair',pan:0}}),'chair, ahead');
});
test('speech is local-only, rate limited and cancels before new hazard',()=>{
  let now=0,cancels=0;const said=[];const synth={getVoices:()=>[{lang:'en-US',localService:true}],cancel(){cancels++},speak(u){said.push(u)}};
  class U{constructor(text){this.text=text}}
  const c=createSpeechController(synth,U,()=>now);const cue={kind:'presence',target:{id:1,class:'chair',pan:0}};
  c.cue(cue);c.cue(cue);assert.equal(said.length,1);
  now=2000;c.cue({kind:'warning',target:{id:2,class:'person',pan:.8}});assert.equal(said.length,2);assert.equal(cancels,2);assert.equal(said[1].text,'person, right, possible approach');
  c.cue({kind:'none'});assert.equal(cancels,3);
  assert.equal(createSpeechController({getVoices:()=>[{localService:false}]},U).available(),false);
});
test('no local English voice plays bundled words and protects the test from empty detections',async()=>{
  let now=0;const played=[];let cancelled=0,prepared=0;const messages=[];
  const c=createSpeechController({getVoices:()=>[{lang:'en-US',localService:false}],cancel(){}},class{},()=>now,{prepare:async()=>{prepared++},play:(text,done)=>{played.push({text,done});return()=>{cancelled++}}});
  c.subscribe(m=>messages.push(m));assert.equal(await c.test(),true);assert.equal(prepared,1);assert.equal(played[0].text,'Left. Right. Ahead. Speech test.');
  c.cue({kind:'none'});assert.equal(cancelled,0);now=7000;played[0].done();
  c.cue({kind:'warning',target:{id:2,class:'person',pan:.8}});assert.equal(played[1].text,'person, right, possible approach');assert.match(messages.at(-1),/bundled offline words/);
  c.cancel();assert.equal(cancelled,2);
});
test('bundled speech is preferred even when a browser claims a local voice',async()=>{
  const messages=[],clips=[];const synth={getVoices:()=>[{lang:'en-GB',name:'Local',localService:true}],cancel(){},speak(u){queueMicrotask(()=>u.onerror({error:'synthesis-failed'}))}};
  const c=createSpeechController(synth,class{},()=>0,{prepare:async()=>{},play:(text)=>{clips.push(text);return()=>{}}});
  c.subscribe(m=>messages.push(m));await c.test();await new Promise(r=>setTimeout(r,1));assert.equal(clips.length,1);assert.match(messages.at(-1),/bundled offline words/);c.dispose();
});
test('speech summary is short and includes two objects with warning priority',()=>{
 const chair={id:2,class:'chair',pan:0,riskLevel:'path'},person={id:1,class:'person',pan:-.8};assert.equal(speechPhrase({kind:'warning',target:chair,summary:[chair,person,{class:'bottle',pan:.8}]}),'chair, ahead, path warning, person, left');
});
