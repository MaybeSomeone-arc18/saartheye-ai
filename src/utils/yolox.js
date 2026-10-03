import * as ort from 'onnxruntime-web/wasm';
const classes=[
    "person",
    "bicycle",
    "car",
    "motorcycle",
    "airplane",
    "bus",
    "train",
    "truck",
    "boat",
    "traffic light",
    "fire hydrant",
    "stop sign",
    "parking meter",
    "bench",
    "bird",
    "cat",
    "dog",
    "horse",
    "sheep",
    "cow",
    "elephant",
    "bear",
    "zebra",
    "giraffe",
    "backpack",
    "umbrella",
    "handbag",
    "tie",
    "suitcase",
    "frisbee",
    "skis",
    "snowboard",
    "sports ball",
    "kite",
    "baseball bat",
    "baseball glove",
    "skateboard",
    "surfboard",
    "tennis racket",
    "bottle",
    "wine glass",
    "cup",
    "fork",
    "knife",
    "spoon",
    "bowl",
    "banana",
    "apple",
    "sandwich",
    "orange",
    "broccoli",
    "carrot",
    "hot dog",
    "pizza",
    "donut",
    "cake",
    "chair",
    "couch",
    "potted plant",
    "bed",
    "dining table",
    "toilet",
    "tv",
    "laptop",
    "mouse",
    "remote",
    "keyboard",
    "cell phone",
    "microwave",
    "oven",
    "toaster",
    "sink",
    "refrigerator",
    "book",
    "clock",
    "vase",
    "scissors",
    "teddy bear",
    "hair drier",
    "toothbrush",
];
export function decodeYolox(output,size,ratio,width,height,threshold=.35){
 const candidates=[];let anchor=0;
 for(const stride of [8,16,32])for(let y=0;y<size/stride;y++)for(let x=0;x<size/stride;x++,anchor++){
  const i=anchor*85;let score=0,cl=0;for(let c=0;c<80;c++){const v=output[i+4]*output[i+5+c];if(v>score){score=v;cl=c;}}
  if(score<threshold)continue;
  const cx=(output[i]+x)*stride/ratio,cy=(output[i+1]+y)*stride/ratio,w=Math.exp(output[i+2])*stride/ratio,h=Math.exp(output[i+3])*stride/ratio;
  const x1=Math.max(0,cx-w/2),y1=Math.max(0,cy-h/2),x2=Math.min(width,cx+w/2),y2=Math.min(height,cy+h/2);if(x2<=x1||y2<=y1)continue;
  candidates.push({class:classes[cl],score,bbox:[x1,y1,x2-x1,y2-y1]});
 }
 candidates.sort((a,b)=>b.score-a.score);const keep=[];
 for(const a of candidates){if(keep.some(b=>{const[x,y,w,h]=a.bbox,[u,v,p,q]=b.bbox;const inter=Math.max(0,Math.min(x+w,u+p)-Math.max(x,u))*Math.max(0,Math.min(y+h,v+q)-Math.max(y,v));return inter/(w*h+p*q-inter)>.45;}))continue;keep.push(a);if(keep.length>=20)break;}
 return keep;
}
export async function loadYolox(mode){
 ort.env.wasm.wasmPaths='/ort/';ort.env.wasm.numThreads=1;
 const size=mode==='accuracy'?640:416,name=mode==='accuracy'?'m':'tiny';
 const session=await ort.InferenceSession.create(`/models/yolox/yolox_${name}.onnx`,{executionProviders:['wasm']});
 const canvas=new OffscreenCanvas(size,size),ctx=canvas.getContext('2d',{willReadFrequently:true});
 return {async detect(frame){const ratio=Math.min(size/frame.width,size/frame.height);ctx.fillStyle='rgb(114,114,114)';ctx.fillRect(0,0,size,size);ctx.drawImage(frame,0,0,Math.floor(frame.width*ratio),Math.floor(frame.height*ratio));const pixels=ctx.getImageData(0,0,size,size).data,n=size*size,input=new Float32Array(n*3);for(let i=0;i<n;i++){input[i]=pixels[i*4+2];input[i+n]=pixels[i*4+1];input[i+2*n]=pixels[i*4];}const result=await session.run({[session.inputNames[0]]:new ort.Tensor('float32',input,[1,3,size,size])});return decodeYolox(result[session.outputNames[0]].data,size,ratio,frame.width,frame.height);}};
}
