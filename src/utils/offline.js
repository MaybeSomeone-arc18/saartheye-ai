export async function offlineStatus() {
  if (!('serviceWorker' in navigator)) return { ready:false, message:'Offline installation is unavailable in this browser.' };
  if (!navigator.serviceWorker.controller) return { ready:false, message:'Offline setup is still in progress. Keep this page open online.' };
  return new Promise(resolve=>{
    const channel=new MessageChannel();
    const timeout=setTimeout(()=>resolve({ready:false,message:'Offline status could not be checked.'}),5000);
    channel.port1.onmessage=e=>{clearTimeout(timeout);resolve(e.data);};
    navigator.serviceWorker.controller.postMessage({type:'CHECK_OFFLINE'},[channel.port2]);
  });
}
export async function registerOffline() {
  if (!('serviceWorker' in navigator) || !import.meta.env.PROD) return;
  await navigator.serviceWorker.register('/sw.js');
}
