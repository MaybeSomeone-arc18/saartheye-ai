import { useState, useEffect, useRef } from 'react';
import { createTracker, chooseCue, percentile } from '../utils/tracking';
import { createSpeechController, testStereo, audioState, playSafePing, playAmbientPing, setHazardTone, vibrateHazard } from '../utils/spatialAudio';
import { offlineStatus } from '../utils/offline';

export default function VisionHUD({ audioEnabled, audioMessage, contextMode, setContextMode, onToggleAudio, onStopDemo }) {
  const videoRef=useRef(null), canvasRef=useRef(null), lastResult=useRef(0);
  const output=useRef({audioEnabled,contextMode,haptics:false});
  const [haptics,setHaptics]=useState(false), [phase,setPhase]=useState('loading');
  const [loadingMessage,setLoadingMessage]=useState('Requesting camera access...'),[error,setError]=useState(''),[attempt,setAttempt]=useState(0),[offline,setOffline]=useState('Checking offline setup...');
  const [scene,setScene]=useState([]);
  const [stats,setStats]=useState(null),[backend,setBackend]=useState(''),[cue,setCue]=useState('Waiting for camera and model');
  const speech=useRef(null);
  if(speech.current == null)speech.current=createSpeechController(window.speechSynthesis,window.SpeechSynthesisUtterance);
  const [speechEnabled,setSpeechEnabled]=useState(false),[speechMessage,setSpeechMessage]=useState('Checking browser voices. Bundled offline words are available after a tap.');
  const speechOn=useRef(false);
  useEffect(()=>{speechOn.current=speechEnabled;if(!speechEnabled)speech.current.cancel();},[speechEnabled]);
  useEffect(()=>{const unsubscribe=speech.current.subscribe(setSpeechMessage);return()=>{unsubscribe();speech.current.dispose();};},[]);
  const [pan,setPan]=useState(0),[testMessage,setTestMessage]=useState('');
  useEffect(()=>{output.current={audioEnabled,contextMode,haptics};if(!audioEnabled)setHazardTone(false);},[audioEnabled,contextMode,haptics]);
  useEffect(()=>{
    let active=true;
    const check=()=>offlineStatus().then(s=>{if(active)setOffline(s.ready?'Offline assets verified. Browser storage can still be evicted.':s.message);});
    check();navigator.serviceWorker?.addEventListener('controllerchange',check);
    return()=>{active=false;navigator.serviceWorker?.removeEventListener('controllerchange',check);};
  },[]);
  useEffect(()=>{
    let active=true,stream,timer,watchdog,renderFrame,videoFrame,worker,pendingRequest;
    const camera=videoRef.current;
    const tracker=createTracker();let objects=[],lastPing=0,lastVibration=0,staleMs=1500;
    const durations=[],completions=[];let started=performance.now(),lastUi=0,firstInference=null;
    const fail=(message)=>{if(active){setError(message);setPhase('error');}setHazardTone(false);};
    const clearOutput=()=>{speech.current.cancel();objects=[];tracker.reset();setHazardTone(false);if(active){setCue('No fresh detections');setScene([]);setPan(0);}};
    const draw=()=>{
      if(!active)return;
      const v=videoRef.current,c=canvasRef.current;
      if(v&&c&&v.videoWidth){
        const rect=c.getBoundingClientRect(),dpr=Math.min(window.devicePixelRatio||1,2);
        if(c.width!==Math.round(rect.width*dpr)||c.height!==Math.round(rect.height*dpr)){
          c.width=Math.round(rect.width*dpr);c.height=Math.round(rect.height*dpr);
        }
        const ctx=c.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,rect.width,rect.height);
        const scale=(getComputedStyle(v).objectFit==='cover'?Math.max:Math.min)(rect.width/v.videoWidth,rect.height/v.videoHeight);
        const ox=(rect.width-v.videoWidth*scale)/2,oy=(rect.height-v.videoHeight*scale)/2;
        ctx.lineWidth=2;ctx.font='12px monospace';
        for(const t of objects){
          const [x,y,w,h]=t.bbox;const color=t.approaching?'#D32F2F':'#2E4780';
          ctx.strokeStyle=color;
          const bx=x*scale+ox,by=y*scale+oy,bw=w*scale,bh=h*scale,l=Math.min(24,bw/3,bh/3);
          ctx.beginPath();for(const [cx,cy,sx,sy] of [[bx,by,1,1],[bx+bw,by,-1,1],[bx,by+bh,1,-1],[bx+bw,by+bh,-1,-1]]){ctx.moveTo(cx+sx*l,cy);ctx.lineTo(cx,cy);ctx.lineTo(cx,cy+sy*l);}ctx.stroke();
          const label=`${t.class} #${t.id} ${t.riskLevel==='path'?'path warning':t.riskLevel==='approach'?'possible approach':t.stablePerson?'stable':'detected'}`;
          const tx=Math.max(4,x*scale+ox),ty=Math.max(20,y*scale+oy);
          ctx.fillStyle='#F7F4EE';ctx.fillRect(tx-2,ty-17,ctx.measureText(label).width+8,22);
          ctx.fillStyle=color;ctx.fillText(label,tx+2,ty);
        }
      }
      renderFrame=requestAnimationFrame(draw);
    };
    const scheduleNext=()=>{
      if(!active)return;
      const v=videoRef.current;
      if(v?.requestVideoFrameCallback)videoFrame=v.requestVideoFrameCallback(()=>infer());
      else timer=setTimeout(infer,0);
    };
    const infer=async()=>{
      if(!active)return;
      if(document.hidden){clearOutput();timer=setTimeout(infer,300);return;}
      const v=videoRef.current;
      if(!v||v.readyState<2){timer=setTimeout(infer,100);return;}
      try{
        const frame=await createImageBitmap(v);
        const result=await new Promise((resolve,reject)=>{pendingRequest={resolve,reject};worker.postMessage({type:'detect',frame},[frame]);});
        const {predictions,duration}=result;
        if(!active)return;
        const now=performance.now();lastResult.current=now;
        if(firstInference===null)firstInference=now-started;
        durations.push(duration);completions.push(now);
        staleMs=Math.min(4000,Math.max(1500,(percentile(durations,.95)||0)*2.5+100));
        while(durations.length>120)durations.shift();while(completions.length>120)completions.shift();
        objects=tracker.update(predictions,now,v.videoWidth,v.videoHeight);
        const mode=output.current.contextMode;const selected=chooseCue(objects,mode);
        const target=selected.target;
        const spoken=speechOn.current && speech.current.cue(selected);
        if(speechOn.current && !spoken)setSpeechMessage('Speech not ready. Tap Test spoken directions. Sound on enables tones.');
        if(output.current.audioEnabled && !spoken){
          setHazardTone(selected.kind==='warning',target?.pan||0,selected.urgency);
          const interval=selected.kind==='ambient'?6000:2000;
          if(target&&selected.kind!=='warning'&&now-lastPing>interval){
            (selected.kind==='ambient'?playAmbientPing:playSafePing)(target.pan);lastPing=now;
          }
        }else setHazardTone(false);
        if(output.current.haptics&&selected.kind==='warning'&&now-lastVibration>1500){vibrateHazard();lastVibration=now;}
        if(now-lastUi>350){
          const span=completions.length>1?(now-completions[0])/1000:0;
          setStats({hz:span?(completions.length-1)/span:0,p50:percentile(durations,.5),p95:percentile(durations,.95),samples:durations.length,startup:firstInference});
          setPan(target?.pan||0);setScene(objects.map(t=>({id:t.id,name:t.class,direction:t.pan<-.2?'left':t.pan>.2?'right':'ahead',risk:t.riskLevel})));
          setCue(!target?'No supported objects detected':`${selected.kind==='warning'?(target.riskLevel==='path'?'Path warning (estimated)':'Possible approach (estimated)'):selected.kind==='ambient'?'Stable-person cue':'Presence cue'}: ${target.class}`);
          lastUi=now;
        }
      }catch(err){clearOutput();fail(`Detection stopped: ${err.message||'unexpected error'}. Retry to restart.`);return;}
      scheduleNext(); // Fresh camera frame, sequential inference, no fixed idle gap.
    };
    async function start(){
      try{
        if(!navigator.mediaDevices?.getUserMedia)throw new Error('Camera requires HTTPS and a supported browser.');
        if(!window.Worker || !window.createImageBitmap)throw new Error('This browser needs Worker and ImageBitmap support. Use current Chrome.');
        worker=new Worker(new URL('../utils/model.js',import.meta.url),{type:'module'});
        const modelPromise=new Promise((resolve,reject)=>{
          worker.onmessage=({data})=>{
            if(data.type==='status'){if(active)setLoadingMessage(data.message);}
            if(data.type==='ready'){if(active)setBackend(`${data.backend} · worker`);resolve();}
            if(data.type==='error'){reject(new Error(data.message));pendingRequest?.reject(new Error(data.message));}
            if(data.type==='result'){pendingRequest?.resolve(data);pendingRequest=null;}
          };
          worker.onerror=(event)=>{const error=new Error(event.message||'Model worker failed');reject(error);pendingRequest?.reject(error);};
        });
        modelPromise.catch(()=>{});worker.postMessage({type:'load'});
        stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'},width:{ideal:640},height:{ideal:480}},audio:false});
        if(!active){stream.getTracks().forEach(t=>t.stop());return;}
        videoRef.current.srcObject=stream;await videoRef.current.play();
        await modelPromise;if(!active)return;
        setPhase('ready');setError('');lastResult.current=performance.now();
        draw();infer();
        watchdog=setInterval(()=>{if(active&&performance.now()-lastResult.current>staleMs){clearOutput();}},300);
      }catch(err){worker?.terminate();stream?.getTracks().forEach(t=>t.stop());fail(err.name==='NotAllowedError'?'Camera access was denied. Allow the camera in browser settings, then retry.':err.name==='NotFoundError'?'No camera was found. Try Chrome on your phone.':`Could not start: ${err.message||'unknown error'}`);}
    }
    start();
    return()=>{active=false;worker?.terminate();clearTimeout(timer);clearInterval(watchdog);cancelAnimationFrame(renderFrame);camera?.cancelVideoFrameCallback?.(videoFrame);stream?.getTracks().forEach(t=>t.stop());setHazardTone(false);tracker.reset();};
  },[attempt]);
  const retry=()=>{setError('');setPhase('loading');setStats(null);setAttempt(a=>a+1);};
  const soundTest=async()=>{
    try {
      const mode=await testStereo();
      setTestMessage(`Test scheduled: left then right (${mode}). Audio ${audioState()}. If silent, check media volume, Bluetooth and headphones. Test works even with Sound off.`);
    } catch(err) { setTestMessage(`Audio test failed: ${err.message}`); }
  };
  const toggleSpeech=async()=>{
    if(speechEnabled){setSpeechEnabled(false);return;}
    setSpeechEnabled(true);setHazardTone(false);
    await speech.current.test();
  };
  const testSpeech=async()=>{setHazardTone(false);await speech.current.test();};
  return <section className="vision-shell" aria-label="Saartheye prototype camera demo">
    <header className="vision-header"><button onClick={onStopDemo}>STOP DEMO ✕</button><div><b>SAARTHEYE</b><p>COCO-SSD · local inference {backend&&`· ${backend}`}</p></div></header>
    <p className="vision-caution">Experimental prototype. Not a safety device or a replacement for a cane. Use only in a supervised, clear indoor space.</p>
      <div className="vision-modes" aria-label="Alert mode">{['OUTDOOR','SOCIAL','STRESS TEST'].map(m=><button key={m} aria-pressed={contextMode===m} onClick={()=>setContextMode(m)}>{m}</button>)}</div>
    <div className="vision-pan" aria-label={`Cue direction: ${pan<-.2?'left':pan>.2?'right':'center'}`}><span>L</span><div><i style={{left:`${((pan+1)/2)*92}%`}} /></div><span>R</span></div>
    <div className="vision-camera"><video ref={videoRef} autoPlay playsInline muted /><canvas ref={canvasRef} aria-hidden="true" />
      {phase!=='ready'&&<div className="vision-message"><h2>{phase==='error'?'Could not start':'Preparing camera and local model'}</h2><p role={error?'alert':'status'}>{error||loadingMessage}</p>{phase==='error'&&<button onClick={retry}>Retry camera and model</button>}</div>}
    </div>
    <div className="vision-dashboard"><p className="vision-cue" aria-live="polite">{cue}</p>
      <p className="vision-note" aria-live="off">{scene.length?`${scene.length} objects tracked: ${scene.slice(0,5).map(t=>`${t.name} ${t.direction}${t.risk==='path'?' (path warning)':t.risk==='approach'?' (possible approach)':''}`).join(' · ')}${scene.length>5?' · more boxes shown':''}. Speech summarizes up to two, warnings first.`:'No fresh supported objects. No detection does not mean clear.'}</p>
      <div className="vision-controls"><button aria-pressed={audioEnabled} onClick={onToggleAudio}>Sound {audioEnabled?'on':'off'}</button><button aria-pressed={haptics} disabled={!('vibrate' in navigator)} onClick={()=>setHaptics(v=>!v)}>Vibration {haptics?'on':'off'}</button><button onClick={soundTest}>Test left / right</button></div>
      <p className="vision-note audio-diagnostic" role="status">{testMessage || audioMessage}</p>
      <div className="vision-controls"><button aria-pressed={speechEnabled} onClick={toggleSpeech}>Speech {speechEnabled?'on':'off'}</button><button onClick={testSpeech}>Test spoken directions</button></div>
      <p className="vision-note speech-diagnostic" role="status">{speechMessage} Approach estimates use sustained box growth and frame position, not measured distance or guaranteed collision. Camera motion can mislead them.</p>

      {contextMode==='STRESS TEST'&&<p className="vision-caution">SIMULATION: every detected object triggers a warning. Not a real approach measurement.</p>}
      <div className="vision-metrics">{stats?<><span><b>{stats.hz.toFixed(1)}</b> completed detections/s</span><span><b>{Math.round(stats.p50)} / {Math.round(stats.p95)} ms</b> inference p50 / p95</span><span>{stats.hz>0&&stats.hz<3?'Slow device: cues may lag. ':''}{stats.samples} recent samples · first result {(stats.startup/1000).toFixed(1)} s · not end-to-end latency</span></>:<span>Real detection timings appear once the camera is running.</span>}</div>
      <details className="vision-details"><summary>Offline, support and limits</summary><p className="vision-note">{offline} · Vibration support: {'vibrate' in navigator?'API available, test on phone':'unavailable'}.</p>
      <p className="vision-note">80 trained classes only. No depth or physical speed measurement. Camera movement and similar objects can confuse tracking. No detection does not mean a clear path.</p></details>
    </div>
  </section>;
}
