// Relative image-area growth is an approach proxy, not physical speed or distance.
export const DEFAULTS = Object.freeze({ minScore: 0.5, maxGapMs: 2500, minSamples: 4,
  enterGrowth: 0.4, exitGrowth: 0.16, stableGrowth: 0.14, stableMs: 1800 });
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
export function iou(a, b) {
  const x = Math.max(a[0], b[0]), y = Math.max(a[1], b[1]);
  const area = Math.max(0, Math.min(a[0]+a[2], b[0]+b[2])-x)
    * Math.max(0, Math.min(a[1]+a[3], b[1]+b[3])-y);
  return area / Math.max(1, a[2]*a[3]+b[2]*b[3]-area);
}
export function createTracker(options = {}) {
  const cfg = { ...DEFAULTS, ...options }; let tracks = [], nextId = 1;
  return {
    reset() { tracks = []; },
    update(predictions, now, width, height) {
      tracks = tracks.filter(t => now-t.lastSeen <= cfg.maxGapMs);
      const unmatched = new Set(tracks);
      const valid = predictions.filter(p => p.score >= cfg.minScore && p.bbox.every(Number.isFinite)
        && p.bbox[2]>0 && p.bbox[3]>0).sort((a,b)=>b.score-a.score);
      const visible = valid.map(p => {
        // Never join different classes or implausibly different areas. IoU matching
        // can still swap nearby same-class objects; this is not a full MOT system.
        const area = p.bbox[2]*p.bbox[3];
        let match, best = 0.2;
        for (const t of unmatched) {
          if (t.class !== p.class || area/t.rawArea > 2.5 || area/t.rawArea < 0.4) continue;
          const overlap = iou(p.bbox, t.bbox);
          if (overlap > best) { match=t; best=overlap; }
        }
        if (!match) {
          match = { id:nextId++, class:p.class, bbox:[...p.bbox], rawArea:area, area,
            firstSeen:now, lastSeen:now, samples:0, growth:0, approaching:false, stableSince:null, history:[], hits:0, misses:0 };
          tracks.push(match);
        } else unmatched.delete(match);
        const dt = (now-match.lastSeen)/1000;
        const alpha = dt>0 ? 1-Math.exp(-dt/0.25) : 1;
        match.bbox = match.bbox.map((v,i)=>v+alpha*(p.bbox[i]-v));
        match.area = match.bbox[2]*match.bbox[3];
        match.history.push({time:now, area:match.area});
        const historyMs=Math.min(4000,Math.max(1100,dt*4000));
        match.history = match.history.filter(h=>now-h.time<=historyMs);
        const oldest = match.history[0], span = (now-oldest.time)/1000;
        const growth = span>=0.35 ? Math.log(match.area/oldest.area)/span : 0;
        match.growth = match.samples ? match.growth+alpha*(growth-match.growth) : 0;
        match.samples++; match.score=p.score; match.rawArea=area; match.lastSeen=now;
        const ready = match.samples>=cfg.minSamples && span>=0.35;
        if (ready && match.growth>cfg.enterGrowth) { match.hits++; match.misses=0; }
        else if (!ready || match.growth<cfg.exitGrowth) { match.misses++; match.hits=0; }
        if (match.hits>=2) match.approaching=true;
        if (match.misses>=2) match.approaching=false;
        if (ready && Math.abs(match.growth)<cfg.stableGrowth) {
          if (match.stableSince===null) match.stableSince=now;
        } else match.stableSince=null;
        match.stablePerson = match.class==='person' && match.stableSince!==null
          && now-match.stableSince>=cfg.stableMs;
        match.pan=clamp(((match.bbox[0]+match.bbox[2]/2)/width-.5)*2,-1,1);
        match.coverage=match.area/(width*height);
        match.ageMs=now-match.firstSeen;
        if(p.presenceOnly){match.approaching=false;match.growth=0;match.hits=0;}
        // Central 40% corridor is a frame-space heuristic, not the user's path.
        const overlap=Math.max(0,Math.min(match.bbox[0]+match.bbox[2],width*.7)-Math.max(match.bbox[0],width*.3));
        match.inCorridor=overlap/Math.max(1,Math.min(match.bbox[2],width*.4))>.5;
        match.riskLevel=match.approaching && match.ageMs>=700 ? (match.inCorridor && match.growth>.8 ? 'path' : 'approach') : 'none';
        return {...match, bbox:[...match.bbox]};
      });
      // Similar expansion of several tracked boxes may be camera zoom/motion.
      // Suppress the estimate, but this cannot detect all camera motion.
      const established=visible.filter(t=>t.samples>=cfg.minSamples && t.ageMs>=700);
      const expanding=established.filter(t=>t.growth>cfg.enterGrowth);
      const commonExpansion=expanding.length>=3 && expanding.length/established.length>=.8 && Math.max(...expanding.map(t=>t.growth))-Math.min(...expanding.map(t=>t.growth))<.2;
      if(commonExpansion)for(const t of visible){t.riskLevel='none';t.motionUncertain=true;}
      // A lost track must earn a fresh history before producing a warning again.
      for (const t of unmatched) { t.history=[]; t.samples=0; t.growth=0; t.hits=0;
        t.misses=0; t.approaching=false; t.stableSince=null; t.stablePerson=false; }
      return visible;
    },
  };
}
export function chooseCue(tracks, mode='OUTDOOR') {
  const warning=t=>mode==='STRESS TEST'||(t.riskLevel&&t.riskLevel!=='none');
  const ranked=[...tracks].sort((a,b)=>Number(warning(b))-Number(warning(a))||(b.riskLevel==='path')-(a.riskLevel==='path')||Number(b.inCorridor)-Number(a.inCorridor)||b.growth-a.growth||b.coverage-a.coverage);
  const target=ranked[0],alerts=ranked.filter(warning);
  // At most two spoken objects, stable order within priority. All boxes still draw.
  const summary=ranked.slice(0,2);
  if(alerts.length)return {kind:'warning',target,summary,count:tracks.length,urgency:mode==='STRESS TEST'?.6:clamp((target.growth-.4)/1.1,0,1)};
  return {kind:target?(mode==='SOCIAL'&&target.stablePerson?'ambient':'presence'):'none',target,summary,count:tracks.length,urgency:0};
}
export function percentile(values, percent) {
  if (!values.length) return null;
  const sorted=[...values].sort((a,b)=>a-b);
  return sorted[Math.max(0,Math.ceil(percent*sorted.length)-1)];
                                }
