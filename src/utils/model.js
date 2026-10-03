import { loadYolox } from './yolox';
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
let pending;
export async function loadVisionModel() {
  if (!pending) pending=(async()=>{
    try {
      const available=await tf.setBackend('webgl');
      if (!available) await tf.setBackend('cpu');
    } catch { await tf.setBackend('cpu'); }
    await tf.ready();
    return cocoSsd.load({base:'lite_mobilenet_v2',modelUrl:'/models/coco/model.json'});
  })().catch(error=>{pending=null;throw error;});
  return pending;
}
export const backendName=()=>tf.getBackend();

// This module is bundled as a dedicated worker. Camera frames never leave the device.
if (typeof document === 'undefined' && typeof self !== 'undefined') {
  let detector, backend;
  self.onmessage = async ({data}) => {
    try {
      if (data.type === 'load') {
        self.postMessage({type:'status',message:'Loading local model and warming up in a worker. Camera preview stays responsive.'});
        if(data.mode==='balanced'||data.mode==='accuracy'){detector=await loadYolox(data.mode);backend=`YOLOX-${data.mode==='accuracy'?'M':'Tiny'} · wasm`;}else{detector=await loadVisionModel();backend='COCO-SSD lite · '+backendName();}
        self.postMessage({type:'ready',backend});
      } else if (data.type === 'detect') {
        const begin=performance.now();
        try {
          const predictions=await detector.detect(data.frame,20,0.5);
          self.postMessage({type:'result',predictions,duration:performance.now()-begin});
        } finally { data.frame.close(); }
      }
    } catch(error) { self.postMessage({type:'error',message:error.message || 'Worker inference failed'}); }
  };
}
