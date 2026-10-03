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
