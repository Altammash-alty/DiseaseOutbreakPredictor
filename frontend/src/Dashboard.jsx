import { useState, useEffect, useRef } from "react";

const CITIES = [
  { id:1,  name:"Delhi",     country:"India", lat:28.61,  lng:77.21,  risk:84, disease:"Dengue Fever", healthIndex:24 },
  { id:2,  name:"Mumbai",    country:"India", lat:19.08,  lng:72.88,  risk:79, disease:"Leptospirosis", healthIndex:31 },
  { id:3,  name:"Kolkata",   country:"India", lat:22.57,  lng:88.36,  risk:71, disease:"Malaria",       healthIndex:37 },
  { id:4,  name:"Chennai",   country:"India", lat:13.08,  lng:80.27,  risk:58, disease:"Typhoid",       healthIndex:52 },
  { id:5,  name:"Bangalore", country:"India", lat:12.97,  lng:77.59,  risk:34, disease:"Influenza",     healthIndex:74 },
];

const DISEASE_INFO = {
  "Dengue Fever":   { medicines:["Paracetamol","IV Fluids","Electrolytes","Dengvaxia vaccine"],        prevention:["Use EPA-approved mosquito repellent","Wear long-sleeved clothing at dawn/dusk","Eliminate standing water around home","Sleep under insecticide-treated nets","Install window and door screens"],   vector:"Aedes aegypti mosquito", icon:"🦟" },
  "Leptospirosis":  { medicines:["Doxycycline","Penicillin G","Amoxicillin","IV Fluids"],              prevention:["Avoid wading in floodwater","Wear rubber boots and gloves in affected areas","Cover wounds before water exposure","Boil or treat drinking water","Vaccinate animals around you"],              vector:"Contaminated floodwater / soil", icon:"💧" },
  "Malaria":        { medicines:["Artemisinin-based therapy","Chloroquine","Primaquine","Atovaquone-proguanil"], prevention:["Sleep under insecticide-treated bed nets","Indoor residual spraying","Take antimalarial prophylaxis","Wear protective clothing at dusk and dawn"],                                    vector:"Anopheles mosquito", icon:"🦟" },
  "Typhoid":        { medicines:["Ciprofloxacin","Azithromycin","Ceftriaxone","Ampicillin"],           prevention:["Drink only bottled or boiled water","Eat thoroughly cooked food","Get Ty21a or Vi capsular vaccine","Wash hands frequently with soap"],                                                        vector:"Contaminated food/water", icon:"💧" },
  "Influenza":      { medicines:["Oseltamivir (Tamiflu)","Zanamivir (Relenza)","Paracetamol","Baloxavir marboxil"], prevention:["Get annual influenza vaccine","Wash hands regularly for 20+ seconds","Avoid close contact with sick individuals","Cover coughs and sneezes with elbow"],                       vector:"Airborne respiratory droplets", icon:"💨" },
};

const WEATHER = {
  "Delhi":     { temp:38, humidity:62, rainfall:18,  wind:14, uv:10 },
  "Mumbai":    { temp:34, humidity:89, rainfall:280, wind:18, uv:9  },
  "Kolkata":   { temp:35, humidity:83, rainfall:190, wind:16, uv:9  },
  "Chennai":   { temp:36, humidity:74, rainfall:60,  wind:22, uv:10 },
  "Bangalore": { temp:26, humidity:61, rainfall:42,  wind:12, uv:7  },
};

const HOSPITALS = {
  "Delhi":     ["All India Institute of Medical Sciences (AIIMS)","Safdarjung Hospital","Sir Ganga Ram Hospital"],
  "Mumbai":    ["Lilavati Hospital & Research Centre","Kokilaben Dhirubhai Ambani Hospital","Tata Memorial Centre"],
  "Kolkata":   ["SSKM Hospital (PG Hospital)","Apollo Gleneagles Hospital","Fortis Hospital Anandapur"],
  "Chennai":   ["Rajiv Gandhi Government General Hospital","Apollo Hospitals Greams Road","MIOT International"],
  "Bangalore": ["Manipal Hospital Old Airport Road","St. John's Medical College Hospital","Narayana Health City"],
};

const AI_TEXT = {
  "Delhi":     "Critical dengue risk coincides with post-monsoon waterlogging across low-lying colonies of East and North Delhi. Aedes aegypti larval density has surged 3.8× above seasonal average due to uncovered overhead tanks and construction site containers. Temperature at 38°C alongside 62% humidity sustains a mosquito lifecycle of under 8 days, dramatically accelerating transmission. Municipal Health Department has reported 1,240 confirmed cases in the past 21 days — 74% above the 5-year average for this period.",
  "Mumbai":    "Leptospirosis risk is at peak during active monsoon as floodwaters in dharavis and low-lying eastern suburbs create ideal bacterial breeding grounds. Vibrio leptospira detected in stormwater samples across 4 drainage zones. Workers commuting through knee-deep floodwater without protective footwear represent the highest-risk cohort. 89% humidity is sustaining bacterial viability in standing water well beyond historical seasonal norms.",
  "Kolkata":   "Malaria risk elevated due to persistent waterlogging in canal-adjacent wards of North and South Kolkata. Anopheles mosquito density is 2.6× the seasonal baseline, concentrated in wards 4, 11, and 28. Recent heavy rainfall (190mm) has overwhelmed drainage capacity in older municipal zones. Plasmodium vivax strain remains predominant; however, a 12% P. falciparum fraction has been detected — warranting heightened clinical vigilance.",
  "Chennai":   "Typhoid risk is moderate, linked to summer heat stressing the Chembarambakkam reservoir supply pipeline and reports of contamination in 2 distribution zones in Ambattur. Enteric fever incidence is 38% above the 5-year mean for June. Increased street food consumption in peak summer combined with delayed pipeline repair has compounded waterborne transmission risk across dense residential localities.",
  "Bangalore": "Low influenza risk consistent with Bangalore's altitude advantage (920m) and relatively dry climate suppressing respiratory virus transmission. Surveillance signals slightly elevated in IT corridor offices and schools post-winter. No unusual activity detected. Current conditions are within expected inter-seasonal baseline; standard hand hygiene and routine vaccination remain the only recommended precautions at this time.",
};

const RC = r => r>=70?"#e53e3e":r>=45?"#d97706":"#7c5cbf";
const RL = r => r>=70?"CRITICAL":r>=45?"ELEVATED":"LOW";
const HC = s => s>=70?"#7c5cbf":s>=40?"#d97706":"#e53e3e";
const seed7 = base => {
  const t = base>70?1:base>50?0:-1;
  return Array.from({length:7},(_,i)=>Math.min(100,Math.max(5,Math.round(base+(Math.random()-.5)*8+t*i*1.5))));
};

// ─── Realistic D3 Globe ───────────────────────────────────────────────────────
function RealisticGlobe({ cities, selected, onPick }) {
  const canvasRef = useRef(null);
  const stateRef = useRef({
    yaw: -78, pitch: -22,
    dragging: false, lastX: 0, lastY: 0,
    hovered: null, geo: null, d3: null
  });
  const animRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js";
    script.onload = () => {
      fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
        .then(r => r.json())
        .then(world => {
          fetch("https://cdn.jsdelivr.net/npm/topojson-client@3/dist/topojson-client.min.js")
            .then(r => r.text()).then(code => {
              // eslint-disable-next-line no-new-func
              const fn = new Function(code + "; return topojson;");
              const topojson = fn();
              const land = topojson.feature(world, world.objects.land);
              const borders = topojson.mesh(world, world.objects.countries, (a,b) => a !== b);
              stateRef.current.geo = { land, borders };
              stateRef.current.d3 = window.d3;
              setReady(true);
            });
        });
    };
    document.head.appendChild(script);
    return () => { try { document.head.removeChild(script); } catch(e){} };
  }, []);

  const drawFrame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { d3, geo, hovered, yaw, pitch } = stateRef.current;
    if (!d3 || !geo) {
      const ctx = canvas.getContext("2d");
      const W = canvas.width, H = canvas.height;
      const cx = W/2, cy = H/2, R = Math.min(W,H)*0.44;
      ctx.clearRect(0,0,W,H);
      const grd = ctx.createRadialGradient(cx-R*.3,cy-R*.3,R*.05,cx,cy,R);
      grd.addColorStop(0,"#d4e8f5"); grd.addColorStop(1,"#92b8d4");
      ctx.beginPath(); ctx.arc(cx,cy,R,0,Math.PI*2); ctx.fillStyle=grd; ctx.fill();
      ctx.fillStyle="rgba(255,255,255,0.5)"; ctx.font="12px 'Space Mono',monospace"; ctx.textAlign="center";
      ctx.fillText("Loading globe...", cx, cy);
      return;
    }

    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    const R = Math.min(W,H)*0.44;

    const projection = d3.geoOrthographic()
      .scale(R).translate([W/2, H/2])
      .rotate([yaw, pitch, 0]).clipAngle(90);

    const path = d3.geoPath(projection, ctx);
    ctx.clearRect(0,0,W,H);

    // Atmosphere
    const atmosphere = ctx.createRadialGradient(W/2, H/2, R*0.96, W/2, H/2, R*1.12);
    atmosphere.addColorStop(0, "rgba(160,200,255,0.25)");
    atmosphere.addColorStop(1, "rgba(160,200,255,0)");
    ctx.beginPath(); ctx.arc(W/2, H/2, R*1.12, 0, Math.PI*2);
    ctx.fillStyle = atmosphere; ctx.fill();

    // Ocean
    ctx.beginPath(); path({type:"Sphere"});
    const oceanGrad = ctx.createRadialGradient(W/2-R*.25, H/2-R*.25, R*.05, W/2, H/2, R);
    oceanGrad.addColorStop(0,"#4a9edd"); oceanGrad.addColorStop(0.5,"#2b7fc0"); oceanGrad.addColorStop(1,"#1a5fa0");
    ctx.fillStyle = oceanGrad; ctx.fill();

    // Land
    ctx.beginPath(); path(geo.land);
    const landGrad = ctx.createLinearGradient(W/2-R, H/2-R, W/2+R, H/2+R);
    landGrad.addColorStop(0,"#6ab04c"); landGrad.addColorStop(0.4,"#5a9e40"); landGrad.addColorStop(0.7,"#4a8832"); landGrad.addColorStop(1,"#3d7228");
    ctx.fillStyle = landGrad; ctx.fill();
    ctx.beginPath(); path(geo.land);
    ctx.strokeStyle = "rgba(80,140,50,0.5)"; ctx.lineWidth = 0.5; ctx.stroke();

    // Borders
    ctx.beginPath(); path(geo.borders);
    ctx.strokeStyle = "rgba(255,255,255,0.55)"; ctx.lineWidth = 0.65; ctx.stroke();

    // Graticule
    const graticule = d3.geoGraticule()();
    ctx.beginPath(); path(graticule);
    ctx.strokeStyle = "rgba(255,255,255,0.08)"; ctx.lineWidth = 0.4; ctx.stroke();

    // Sphere outline
    ctx.beginPath(); path({type:"Sphere"});
    ctx.strokeStyle = "rgba(30,80,150,0.5)"; ctx.lineWidth = 1.5; ctx.stroke();

    // City halos
    cities.forEach(city => {
      const proj = projection([city.lng, city.lat]);
      if (!proj) return;
      const [px, py] = proj;
      const rotate = projection.rotate();
      const λ = (city.lng + rotate[0]) * Math.PI/180;
      const φ = city.lat * Math.PI/180;
      const cosC = Math.cos(φ)*Math.cos(λ);
      if (cosC < 0) return;

      const r = city.risk>=70?28:city.risk>=45?20:13;
      const col = RC(city.risk);
      const gr = ctx.createRadialGradient(px,py,0,px,py,r);
      gr.addColorStop(0, col+"60"); gr.addColorStop(1, col+"00");
      ctx.beginPath(); ctx.arc(px,py,r,0,Math.PI*2); ctx.fillStyle=gr; ctx.fill();
    });

    // City dots + labels
    cities.forEach(city => {
      const proj = projection([city.lng, city.lat]);
      if (!proj) return;
      const [px, py] = proj;
      const rotate = projection.rotate();
      const λ = (city.lng + rotate[0]) * Math.PI/180;
      const φ = city.lat * Math.PI/180;
      const cosC = Math.cos(φ)*Math.cos(λ);
      if (cosC < 0.02) return;

      const isSel = selected?.id === city.id;
      const isHov = hovered?.id === city.id;
      const col = RC(city.risk);
      const dotR = isSel ? 8 : isHov ? 6.5 : 5;

      if (city.risk >= 70) {
        const pulse = 0.5 + 0.5*Math.sin(Date.now()/550+city.id);
        ctx.beginPath(); ctx.arc(px, py, 12+pulse*5, 0, Math.PI*2);
        ctx.strokeStyle = col+"80"; ctx.lineWidth = 1.2; ctx.stroke();
      }

      ctx.beginPath(); ctx.arc(px, py, dotR+1.5, 0, Math.PI*2);
      ctx.fillStyle = "rgba(255,255,255,0.7)"; ctx.fill();
      ctx.beginPath(); ctx.arc(px, py, dotR, 0, Math.PI*2);
      ctx.fillStyle = col; ctx.fill();

      if (isSel || isHov) {
        ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.8; ctx.stroke();
        ctx.font = "bold 10px 'Space Mono',monospace";
        ctx.fillStyle = "rgba(255,255,255,0.95)";
        ctx.strokeStyle = "rgba(0,0,0,0.3)"; ctx.lineWidth = 3;
        ctx.strokeText(city.name, px+dotR+3, py-2);
        ctx.fillText(city.name, px+dotR+3, py-2);
      }
    });

    // Shine
    const shine = ctx.createRadialGradient(W/2-R*.38, H/2-R*.38, R*.03, W/2-R*.12, H/2-R*.12, R*.6);
    shine.addColorStop(0,"rgba(255,255,255,0.22)"); shine.addColorStop(0.4,"rgba(255,255,255,0.05)"); shine.addColorStop(1,"rgba(255,255,255,0)");
    ctx.beginPath(); path({type:"Sphere"}); ctx.fillStyle=shine; ctx.fill();
  };

  useEffect(() => {
    let lastTime = 0;
    const loop = (ts) => {
      if (ts - lastTime > 16) {
        if (!stateRef.current.dragging) {
          stateRef.current.yaw += 0.18;
          stateRef.current.pitch += 0.006;
          if (stateRef.current.pitch > 25 || stateRef.current.pitch < -25) {
            stateRef.current.pitch = Math.max(-25, Math.min(25, stateRef.current.pitch));
          }
        }
        drawFrame();
        lastTime = ts;
      }
      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [cities, selected, ready]);

  const getHitCity = (e) => {
    const canvas = canvasRef.current;
    if (!stateRef.current.d3) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;
    const { d3, yaw, pitch } = stateRef.current;
    const R = Math.min(canvas.width, canvas.height) * 0.44;
    const proj = d3.geoOrthographic()
      .scale(R).translate([canvas.width/2, canvas.height/2])
      .rotate([yaw, pitch, 0]).clipAngle(90);
    let best = null, bd = 18;
    cities.forEach(c => {
      const p = proj([c.lng, c.lat]);
      if (!p) return;
      const d = Math.hypot(mx - p[0], my - p[1]);
      if (d < bd) { best = c; bd = d; }
    });
    return best;
  };

  return (
    <canvas
      ref={canvasRef}
      width={560} height={340}
      style={{ width:"100%", height:"100%", display:"block", cursor:"grab" }}
      onMouseDown={e => { stateRef.current.dragging = true; stateRef.current.lastX = e.clientX; stateRef.current.lastY = e.clientY; }}
      onMouseMove={e => {
        const s = stateRef.current;
        if (s.dragging) {
          s.yaw   += (e.clientX - s.lastX) * 0.4;
          s.pitch -= (e.clientY - s.lastY) * 0.3;
          s.pitch = Math.max(-85, Math.min(85, s.pitch));
          s.lastX = e.clientX; s.lastY = e.clientY;
        } else { s.hovered = getHitCity(e); }
      }}
      onMouseUp={e => {
        const s = stateRef.current;
        if (s.dragging) { s.dragging = false; return; }
        const c = getHitCity(e); if (c) onPick(c);
      }}
      onMouseLeave={() => { stateRef.current.dragging = false; stateRef.current.hovered = null; }}
    />
  );
}

// ─── Spark ───────────────────────────────────────────────────────────────────
function Spark({ data, color }) {
  const W=180, H=40;
  const max=Math.max(...data), min=Math.min(...data), range=max-min||1;
  const pts = data.map((v,i)=>{
    const x=(i/(data.length-1))*(W-4)+2;
    const y=H-4-((v-min)/range)*(H-10);
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={W} height={H} style={{display:"block"}}>
      <defs><linearGradient id={`sp${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.25"/><stop offset="100%" stopColor={color} stopOpacity="0"/></linearGradient></defs>
      <polygon points={`2,${H} ${pts} ${W-2},${H}`} fill={`url(#sp${color.replace("#","")})`}/>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  );
}

// ─── ForecastBars ─────────────────────────────────────────────────────────────
function ForecastBars({ data }) {
  const [heights, setHeights] = useState(data.map(()=>0));
  const days=["Today","D+1","D+2","D+3","D+4","D+5","D+6"];
  const max=Math.max(...data), min=Math.min(...data);
  useEffect(()=>{
    const timers = data.map((_,i)=>setTimeout(()=>{
      setHeights(prev=>{const n=[...prev];n[i]=Math.max(8,((data[i]-min)/(max-min||1))*62+8);return n;});
    }, i*80));
    return ()=>timers.forEach(clearTimeout);
  },[data.join()]);
  return (
    <div style={{display:"flex",alignItems:"flex-end",gap:5,height:88}}>
      {data.map((v,i)=>{
        const col=RC(v);
        return (
          <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
            <span style={{fontSize:9,color:col,fontFamily:"'Space Mono',monospace",fontWeight:700}}>{v}</span>
            <div style={{width:"100%",height:heights[i],background:col,borderRadius:"3px 3px 0 0",opacity:i===0?0.9:0.6+i*0.04,transition:"height 0.6s cubic-bezier(0.34,1.56,0.64,1)",boxShadow:`0 0 8px ${col}40`}}/>
            <span style={{fontSize:8,color:"#6b6080",textTransform:"uppercase",letterSpacing:"0.04em"}}>{days[i]}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── HealthMeter ──────────────────────────────────────────────────────────────
function HealthMeter({ score }) {
  const col=HC(score);
  const r=38,cx=48,cy=52;
  const arc=a=>{const rad=(a*Math.PI)/180;return{x:cx+r*Math.cos(rad),y:cy+r*Math.sin(rad)};};
  const s=arc(-135), e=arc(-135+(score/100)*270);
  const large=(score/100)*270>180?1:0;
  return (
    <svg width={96} height={68} style={{display:"block",margin:"0 auto"}}>
      <path d={`M${arc(-135).x},${arc(-135).y} A${r},${r} 0 1 1 ${arc(135).x},${arc(135).y}`} fill="none" stroke="rgba(124,92,191,0.15)" strokeWidth="5" strokeLinecap="round"/>
      <path d={`M${s.x},${s.y} A${r},${r} 0 ${large} 1 ${e.x},${e.y}`} fill="none" stroke={col} strokeWidth="5" strokeLinecap="round"/>
      <text x={cx} y={49} textAnchor="middle" fill={col} fontSize="13" fontWeight="700" fontFamily="'Space Mono',monospace">{score}</text>
      <text x={cx} y={62} textAnchor="middle" fill="#6b6080" fontSize="8">{score>=70?"SAFE":score>=40?"CAUTION":"DANGER"}</text>
    </svg>
  );
}

// ─── Live Ticker ──────────────────────────────────────────────────────────────
function LiveTicker() {
  const items = [
    "🔴 Delhi: Dengue ALERT · 1,240 cases in 21 days","🔴 Mumbai: Leptospirosis risk — floodwater exposure","🔴 Kolkata: Malaria 2.6x seasonal average",
    "🟡 Chennai: Typhoid risk · water pipeline contamination","🟢 Bangalore: Influenza stable · low risk","🔴 Delhi: Aedes density 3.8x baseline",
    "🟡 Mumbai: 89% humidity sustaining bacterial viability","🟢 Bangalore: No unusual surveillance activity detected",
  ];
  const text = items.join("   ·   ");
  return (
    <div style={{overflow:"hidden",whiteSpace:"nowrap",height:24,display:"flex",alignItems:"center",background:"rgba(124,92,191,0.06)",borderTop:"1px solid rgba(124,92,191,0.12)"}}>
      <div style={{display:"inline-block",animation:"ticker 38s linear infinite",fontSize:10,fontFamily:"'Space Mono',monospace",color:"#6b6080",paddingLeft:"100%"}}>
        {text + "   ·   " + text}
      </div>
    </div>
  );
}

// ─── AnimatedRiskBar ──────────────────────────────────────────────────────────
function AnimatedRiskBar({ risk, delay=0 }) {
  const [w, setW] = useState(0);
  useEffect(()=>{ const t=setTimeout(()=>setW(risk),300+delay); return()=>clearTimeout(t); },[risk]);
  const col = RC(risk);
  return (
    <div style={{marginTop:7,height:3,background:"rgba(124,92,191,0.1)",borderRadius:2,overflow:"hidden"}}>
      <div style={{height:"100%",width:`${w}%`,background:col,borderRadius:2,transition:"width 1.1s cubic-bezier(0.34,1.2,0.64,1)",boxShadow:`0 0 6px ${col}60`}}/>
    </div>
  );
}

// ─── CountUp ──────────────────────────────────────────────────────────────────
function CountUp({ target, suffix="", duration=1200, delay=0 }) {
  const [val, setVal] = useState(0);
  const [started, setStarted] = useState(false);
  useEffect(()=>{ const t = setTimeout(()=>setStarted(true), delay); return ()=>clearTimeout(t); },[delay]);
  useEffect(()=>{
    if(!started) return;
    const num = parseFloat(target.toString().replace(/[^0-9.]/g,''));
    let start=null;
    const step=ts=>{
      if(!start) start=ts;
      const p=Math.min((ts-start)/duration,1);
      const ease=1-Math.pow(1-p,3);
      setVal(Math.round(ease*num));
      if(p<1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  },[started, target]);
  return <span>{val + suffix}</span>;
}

// ─── PulseRing ────────────────────────────────────────────────────────────────
function PulseRing({ color, size=6 }) {
  return (
    <div style={{position:"relative",width:size,height:size,flexShrink:0}}>
      <div style={{position:"absolute",inset:0,borderRadius:"50%",background:color,animation:"pulse 2s infinite"}}/>
      <div style={{position:"absolute",inset:-3,borderRadius:"50%",border:`1px solid ${color}`,animation:"ripple 2s infinite",pointerEvents:"none"}}/>
    </div>
  );
}

// ─── ScanlineOverlay ──────────────────────────────────────────────────────────
function ScanlineOverlay() {
  return (
    <div style={{position:"absolute",inset:0,pointerEvents:"none",overflow:"hidden",borderRadius:"inherit"}}>
      <div style={{position:"absolute",left:0,right:0,height:2,background:"rgba(124,92,191,0.08)",animation:"scanline 4s linear infinite",top:0}}/>
    </div>
  );
}

// ─── Dashboard Background ─────────────────────────────────────────────────────
function DashboardBg() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animId, t = 0;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);
    const orbs = [
      { x:0.1,  y:0.1,  r:320, hue:268, spd:0.0007 },
      { x:0.82, y:0.2,  r:260, hue:258, spd:0.0011 },
      { x:0.5,  y:0.75, r:350, hue:275, spd:0.0005 },
      { x:0.9,  y:0.8,  r:200, hue:248, spd:0.0013 },
    ];
    const draw = () => {
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0,0,W,H);
      const bg = ctx.createLinearGradient(0,0,W,H);
      bg.addColorStop(0,"#eee8ff"); bg.addColorStop(0.5,"#f4f0ff"); bg.addColorStop(1,"#ebe4ff");
      ctx.fillStyle = bg; ctx.fillRect(0,0,W,H);
      orbs.forEach((o,i)=>{
        const ox=(o.x+Math.sin(t*o.spd+i*1.5)*0.15)*W;
        const oy=(o.y+Math.cos(t*o.spd*1.4+i)*0.12)*H;
        const gr=ctx.createRadialGradient(ox,oy,0,ox,oy,o.r);
        gr.addColorStop(0,`hsla(${o.hue},65%,75%,0.28)`); gr.addColorStop(0.4,`hsla(${o.hue},55%,72%,0.1)`); gr.addColorStop(1,`hsla(${o.hue},50%,70%,0)`);
        ctx.beginPath(); ctx.arc(ox,oy,o.r,0,Math.PI*2); ctx.fillStyle=gr; ctx.fill();
      });
      ctx.fillStyle="rgba(124,92,191,0.06)";
      const gs=28;
      for(let gx=gs/2;gx<W;gx+=gs) for(let gy=gs/2;gy<H;gy+=gs){ ctx.beginPath(); ctx.arc(gx,gy,0.8,0,Math.PI*2); ctx.fill(); }
      ctx.strokeStyle="rgba(124,92,191,0.04)"; ctx.lineWidth=0.5;
      const offset=(t*0.3)%(gs*2);
      for(let d=-H;d<W+H;d+=gs*2){ ctx.beginPath(); ctx.moveTo(d+offset,0); ctx.lineTo(d+offset+H,H); ctx.stroke(); }
      t++;
      animId=requestAnimationFrame(draw);
    };
    draw();
    return ()=>{ cancelAnimationFrame(animId); window.removeEventListener("resize",resize); };
  },[]);
  return <canvas ref={canvasRef} style={{position:"fixed",inset:0,width:"100%",height:"100%",pointerEvents:"none",zIndex:0}}/>;
}

// ─── App ─────────────────────────────────────────────────────────────────────
const CITIES_INIT = [
  { id:1,  name:"Mumbai",      country:"India",       lat:19.08,  lng:72.88,   risk:0, disease:"...",  healthIndex:100 },
  { id:2,  name:"Delhi",       country:"India",       lat:28.61,  lng:77.20,   risk:0, disease:"...",  healthIndex:100 },
  { id:3,  name:"Bangalore",   country:"India",       lat:12.97,  lng:77.59,   risk:0, disease:"...",  healthIndex:100 },
  { id:4,  name:"Chennai",     country:"India",       lat:13.08,  lng:80.27,   risk:0, disease:"...",  healthIndex:100 },
  { id:5,  name:"Kolkata",     country:"India",       lat:22.57,  lng:88.36,   risk:0, disease:"...",  healthIndex:100 },
];
export default function App() {
  const [cities, setCities] = useState(CITIES_INIT);
  const [sel, setSel] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const response = await fetch("http://localhost:8000/all_predictions");
        const data = await response.json();
        
        const updatedCities = CITIES_INIT.map(city => {
          if (data[city.name]) {
            return { 
              ...city, 
              ...data[city.name],
              id: city.id // Preserve original ID
            };
          }
          return city;
        });
        
        setCities(updatedCities);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load live data", err);
        setLoading(false);
      }
    };
    fetchAllData();
    const interval = setInterval(fetchAllData, 300000); // Refresh every 5 mins
    return () => clearInterval(interval);
  }, []);

  const [tab, setTab] = useState("overview");
  const [notifOpen, setNotifOpen] = useState(false);
  const mono = { fontFamily:"'Space Mono',monospace" };

  const BG="#f4f0ff", SURF="#ede8ff", SURF2="#f4f0ff", ACC="#7c5cbf", TXT="#1a1530", MUT="#6b6080", BOR="rgba(124,92,191,0.13)";
  const card = { background:SURF2, border:`1px solid ${BOR}`, borderRadius:10, padding:"13px 15px" };
  const lbl  = { fontSize:9, ...mono, color:ACC, letterSpacing:"0.18em", textTransform:"uppercase", marginBottom:8 };

  const notifs = cities.filter(c => c.risk > 70).map((c, i) => ({
    id: i,
    city: c.name,
    msg: `${c.disease} Alert - ${c.risk}% Risk`,
    time: "Live",
    col: "#e53e3e"
  }));

  const forecast=sel?seed7(sel.risk):null;
  const di=sel?DISEASE_INFO[sel.disease]:null;
  const wx=sel?WEATHER[sel.name]:null;
  const hosp=sel?HOSPITALS[sel.name]:null;
  const ai=sel?AI_TEXT[sel.name]:null;
  const critical=cities.filter(c=>c.risk>=70).sort((a,b)=>b.risk-a.risk);

  return (
    <div style={{background:"transparent",minHeight:"100vh",color:TXT,fontFamily:"'DM Sans',sans-serif",overflowX:"hidden",position:"relative"}}>
      <DashboardBg />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:wght@400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-track{background:#f4f0ff}::-webkit-scrollbar-thumb{background:rgba(124,92,191,0.25);border-radius:2px}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}
        @keyframes slideIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideRight{from{opacity:0;transform:translateX(-16px)}to{opacity:1;transform:translateX(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes ticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        @keyframes scanline{0%{top:-4px}100%{top:100%}}
        @keyframes ripple{0%{transform:scale(0.8);opacity:1}100%{transform:scale(2.4);opacity:0}}
        .tbtn{padding:5px 12px;border-radius:5px;border:none;cursor:pointer;font-size:10px;letter-spacing:0.04em;transition:all 0.2s;font-family:'Space Mono',monospace}
        .tbtn.on{background:rgba(124,92,191,0.13);color:#7c5cbf;box-shadow:inset 0 0 0 1px rgba(124,92,191,0.28)}
        .tbtn.off{background:transparent;color:#6b6080}
        .tbtn:hover{background:rgba(124,92,191,0.08);color:#7c5cbf;transform:translateY(-1px)}
        .crow{padding:8px 12px;border-bottom:1px solid rgba(124,92,191,0.07);display:flex;align-items:center;gap:8px;cursor:pointer;transition:all 0.18s;position:relative;overflow:hidden}
        .crow::before{content:'';position:absolute;left:0;top:0;bottom:0;width:2px;background:#7c5cbf;transform:scaleY(0);transition:transform 0.2s;transform-origin:bottom}
        .crow:hover{background:rgba(124,92,191,0.06);padding-left:16px}
        .crow:hover::before{transform:scaleY(1)}
        .crow.sel{background:rgba(124,92,191,0.1);padding-left:16px}
        .crow.sel::before{transform:scaleY(1)}
        .hrow:hover{background:rgba(124,92,191,0.04)!important}
        .card-hover{transition:all 0.22s}
        .card-hover:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(124,92,191,0.12)!important}
      `}</style>

      {/* NAV */}
      <div style={{height:50,padding:"0 18px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:`1px solid ${BOR}`,background:"rgba(244,240,255,0.88)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <button onClick={()=>window.history.back()} style={{display:"flex",alignItems:"center",gap:6,padding:"5px 11px",background:"rgba(124,92,191,0.07)",border:"1px solid rgba(124,92,191,0.2)",borderRadius:7,cursor:"pointer",transition:"all 0.18s",flexShrink:0}}
            onMouseEnter={e=>{e.currentTarget.style.background="rgba(124,92,191,0.14)";e.currentTarget.style.transform="translateX(-2px)";}}
            onMouseLeave={e=>{e.currentTarget.style.background="rgba(124,92,191,0.07)";e.currentTarget.style.transform="translateX(0)";}}>
            <span style={{fontSize:14,lineHeight:1,color:ACC}}>←</span>
            <span style={{fontSize:10,...mono,color:ACC,letterSpacing:"0.05em"}}>Back</span>
          </button>
          <div style={{width:1,height:20,background:"rgba(124,92,191,0.2)",flexShrink:0}}/>
          <span style={{...mono,fontWeight:700,fontSize:13,letterSpacing:"0.06em",color:TXT}}>EpiSense <span style={{color:ACC}}>AI</span></span>
          <div style={{background:"rgba(229,62,62,0.1)",border:"1px solid rgba(229,62,62,0.25)",borderRadius:4,padding:"2px 7px"}}>
            <span style={{fontSize:9,...mono,color:"#e53e3e",letterSpacing:"0.1em"}}>● LIVE</span>
          </div>
          <span style={{fontSize:10,...mono,color:MUT,background:SURF,border:`1px solid ${BOR}`,borderRadius:4,padding:"2px 8px"}}>🇮🇳 India Surveillance</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:14}}>
          <span style={{fontSize:10,color:MUT,...mono}}>{cities.length} cities · {critical.length} critical</span>
          <div style={{position:"relative"}}>
            <button onClick={()=>setNotifOpen(p=>!p)} style={{background:SURF,border:`1px solid ${BOR}`,borderRadius:6,padding:"5px 10px",color:TXT,cursor:"pointer",fontSize:12,display:"flex",alignItems:"center",gap:5}}>
              🔔
              <span style={{background:"#e53e3e",color:"#fff",fontSize:8,fontWeight:700,borderRadius:9,padding:"1px 5px",...mono,animation:"pulse 1.5s infinite"}}>{notifs.length}</span>
            </button>
            {notifOpen&&(
              <div style={{position:"absolute",right:0,top:36,width:286,background:SURF2,border:`1px solid ${BOR}`,borderRadius:10,boxShadow:"0 8px 28px rgba(124,92,191,0.14)",zIndex:200,animation:"slideIn 0.18s ease"}}>
                <div style={{padding:"9px 13px",borderBottom:`1px solid ${BOR}`,fontSize:9,...mono,color:ACC,letterSpacing:"0.14em",textTransform:"uppercase"}}>Alert Feed — India</div>
                {notifs.map(n=>(
                  <div key={n.id} style={{padding:"9px 13px",borderBottom:`1px solid rgba(124,92,191,0.07)`,display:"flex",gap:9,alignItems:"flex-start"}}>
                    <div style={{width:6,height:6,borderRadius:"50%",background:n.col,flexShrink:0,marginTop:3,animation:"pulse 1.5s infinite"}}/>
                    <div style={{flex:1}}>
                      <div style={{fontSize:11,fontWeight:600,color:TXT}}>{n.city}</div>
                      <div style={{fontSize:10,color:MUT,lineHeight:1.4}}>{n.msg}</div>
                    </div>
                    <span style={{fontSize:9,color:MUT,...mono,flexShrink:0}}>{n.time}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* LIVE TICKER */}
      <LiveTicker />

      {/* 3-COL LAYOUT */}
      <div style={{display:"grid",gridTemplateColumns:"205px 1fr 318px",height:"calc(100vh - 74px)",overflow:"hidden"}}>

        {/* LEFT — City List */}
        <div style={{background:"rgba(237,232,255,0.78)",backdropFilter:"blur(14px)",WebkitBackdropFilter:"blur(14px)",borderRight:`1px solid ${BOR}`,display:"flex",flexDirection:"column",overflow:"hidden",position:"relative",zIndex:1}}>
          <div style={{padding:"11px 13px",borderBottom:`1px solid ${BOR}`}}>
            <div style={{...lbl,marginBottom:2}}>India Disease Monitor</div>
            <div style={{fontSize:10,color:MUT}}>5 major cities tracked</div>
          </div>
          <div style={{flex:1,overflowY:"auto"}}>
            {[...cities].sort((a,b)=>b.risk-a.risk).map((c,i)=>(
              <div key={c.id} className={`crow${sel?.id===c.id?" sel":""}`} onClick={()=>{setSel(c);setTab("overview");}} style={{animation:`slideRight 0.35s ${i*0.07}s ease both`}}>
                {c.risk>=70
                  ? <PulseRing color={RC(c.risk)} size={7}/>
                  : <div style={{width:6,height:6,borderRadius:"50%",background:RC(c.risk),flexShrink:0}}/>
                }
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:11,fontWeight:600,color:TXT,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.name}</div>
                  <div style={{fontSize:9,color:MUT,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.disease}</div>
                </div>
                <div style={{textAlign:"right",flexShrink:0}}>
                  <div style={{fontSize:11,fontWeight:700,color:RC(c.risk),...mono}}>{c.risk}%</div>
                  <div style={{fontSize:8,color:RC(c.risk),...mono,letterSpacing:"0.05em"}}>{RL(c.risk)}</div>
                </div>
              </div>
            ))}
          </div>
          {/* India summary footer */}
          <div style={{padding:"10px 13px",borderTop:`1px solid ${BOR}`,background:"rgba(124,92,191,0.04)"}}>
            <div style={{fontSize:9,...mono,color:MUT,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:6}}>National Summary</div>
            <div style={{display:"flex",justifyContent:"space-between"}}>
              <div style={{textAlign:"center"}}>
                <div style={{fontSize:14,fontWeight:700,color:"#e53e3e",...mono}}>{cities.filter(c=>c.risk>=70).length}</div>
                <div style={{fontSize:8,color:MUT}}>Critical</div>
              </div>
              <div style={{textAlign:"center"}}>
                <div style={{fontSize:14,fontWeight:700,color:"#d97706",...mono}}>{cities.filter(c=>c.risk>=45&&c.risk<70).length}</div>
                <div style={{fontSize:8,color:MUT}}>Elevated</div>
              </div>
              <div style={{textAlign:"center"}}>
                <div style={{fontSize:14,fontWeight:700,color:"#7c5cbf",...mono}}>{cities.filter(c=>c.risk<45).length}</div>
                <div style={{fontSize:8,color:MUT}}>Low</div>
              </div>
            </div>
          </div>
        </div>

        {/* CENTER — Globe + Detail */}
        <div style={{display:"flex",flexDirection:"column",overflow:"hidden",position:"relative",zIndex:1}}>
          <div style={{padding:"12px 13px 0",flexShrink:0}}>
            <div style={{background:"rgba(20,38,58,0.92)",backdropFilter:"blur(10px)",border:`1px solid rgba(74,158,221,0.3)`,borderRadius:12,overflow:"hidden",position:"relative",boxShadow:"0 4px 24px rgba(74,158,221,0.15)"}}>
              <ScanlineOverlay />
              <div style={{position:"absolute",top:9,left:12,zIndex:10,display:"flex",alignItems:"center",gap:8}}>
                <div style={{display:"flex",alignItems:"center",gap:5}}>
                  <div style={{width:6,height:6,borderRadius:"50%",background:"#e53e3e",animation:"pulse 1.2s infinite",boxShadow:"0 0 6px #e53e3e"}}/>
                  <span style={{fontSize:9,...mono,color:"rgba(255,255,255,0.7)",letterSpacing:"0.1em"}}>INDIA DISEASE RISK RADAR</span>
                </div>
                <span style={{fontSize:8,...mono,color:"rgba(255,255,255,0.4)",background:"rgba(255,255,255,0.08)",padding:"2px 6px",borderRadius:3}}>DRAG TO ROTATE</span>
              </div>
              <div style={{position:"absolute",top:9,right:12,zIndex:10,display:"flex",gap:10}}>
                {[["#7c5cbf","LOW"],["#d97706","ELEVATED"],["#e53e3e","CRITICAL"]].map(([c,l])=>(
                  <span key={l} style={{display:"flex",alignItems:"center",gap:3,fontSize:9,...mono,color:"rgba(255,255,255,0.5)"}}>
                    <span style={{width:7,height:7,borderRadius:"50%",background:c,display:"inline-block"}}/>{l}
                  </span>
                ))}
              </div>
              <div style={{height:310,background:"radial-gradient(ellipse at 50% 50%, #1e3a52 0%, #0d1f2d 70%)"}}>
                <RealisticGlobe cities={cities} selected={sel} onPick={c=>{setSel(c);setTab("overview");}}/>
              </div>
              {!sel&&(
                <div style={{position:"absolute",bottom:12,left:"50%",transform:"translateX(-50%)",pointerEvents:"none"}}>
                  <div style={{background:"rgba(13,31,45,0.8)",borderRadius:6,padding:"5px 12px",border:"1px solid rgba(74,158,221,0.2)",backdropFilter:"blur(6px)"}}>
                    <span style={{fontSize:10,color:"rgba(255,255,255,0.5)",...mono}}>Click a city dot to open dashboard</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {sel ? (
            <div key={sel.id} style={{flex:1,overflowY:"auto",padding:"10px 13px 13px",animation:"slideUp 0.3s ease both"}}>
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:10,gap:10}}>
                <div>
                  <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                    <span style={{...mono,fontWeight:700,fontSize:"1.05rem",color:TXT}}>{sel.name}</span>
                    <span style={{fontSize:10,color:MUT}}>🇮🇳 {sel.country}</span>
                    <span style={{background:RC(sel.risk)+"18",border:`1px solid ${RC(sel.risk)}44`,borderRadius:4,padding:"2px 7px",fontSize:9,...mono,color:RC(sel.risk),letterSpacing:"0.09em"}}>{RL(sel.risk)}</span>
                  </div>
                  <div style={{fontSize:11,color:MUT,marginTop:2}}>{di?.icon} Primary: <span style={{color:ACC,fontWeight:600}}>{sel.disease}</span></div>
                </div>
                <button onClick={()=>setSel(null)} style={{background:SURF,border:`1px solid ${BOR}`,borderRadius:5,padding:"4px 9px",color:MUT,cursor:"pointer",fontSize:10,flexShrink:0}}>✕</button>
              </div>

              <div style={{display:"flex",gap:3,marginBottom:10,borderBottom:`1px solid ${BOR}`,paddingBottom:7}}>
                {[["overview","Overview"],["weather","Weather"],["hospitals","Healthcare"],["prevention","Prevention"]].map(([id,lb])=>(
                  <button key={id} className={`tbtn ${tab===id?"on":"off"}`} onClick={()=>setTab(id)}>{lb}</button>
                ))}
              </div>

              {tab==="overview"&&(
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
                    <div style={{...card,position:"relative",overflow:"hidden",animation:"slideUp 0.35s 0s ease both"}}>
                      <ScanlineOverlay/>
                      <div style={lbl}>Outbreak Risk</div>
                      <div style={{fontSize:"1.8rem",fontWeight:700,color:RC(sel.risk),...mono,lineHeight:1,textShadow:`0 0 20px ${RC(sel.risk)}50`}}>
                        <CountUp target={sel.risk} suffix="%" duration={900}/>
                      </div>
                      <AnimatedRiskBar risk={sel.risk} delay={200}/>
                      <div style={{fontSize:10,color:MUT,marginTop:5}}>{sel.disease}</div>
                    </div>
                    <div style={{...card,textAlign:"center",animation:"slideUp 0.35s 0.07s ease both"}}>
                      <div style={{...lbl,textAlign:"center"}}>City Health Index</div>
                      <HealthMeter score={sel.healthIndex}/>
                    </div>
                    <div style={{...card,animation:"slideUp 0.35s 0.14s ease both"}}>
                      <div style={lbl}>Recommended Medicines</div>
                      {di?.medicines.slice(0,4).map((m,mi)=>(
                        <div key={m} style={{display:"flex",alignItems:"center",gap:6,marginBottom:5,animation:`slideRight 0.3s ${0.2+mi*0.06}s ease both`}}>
                          <div style={{width:4,height:4,borderRadius:"50%",background:ACC,flexShrink:0}}/>
                          <span style={{fontSize:11,color:TXT}}>{m}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{...card,border:`1px solid rgba(124,92,191,0.22)`,background:"rgba(124,92,191,0.04)",animation:"slideUp 0.4s 0.2s ease both"}}>
                    <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:8}}>
                      <div style={{width:18,height:18,borderRadius:4,background:"rgba(124,92,191,0.12)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10}}>✦</div>
                      <span style={{...lbl,marginBottom:0}}>AI Risk Explanation</span>
                    </div>
                    <p style={{fontSize:12,lineHeight:1.65,color:"#3a3050"}}>{ai}</p>
                  </div>
                  <div style={{...card,animation:"slideUp 0.4s 0.28s ease both"}}>
                    <div style={lbl}>7-Day Outbreak Prediction</div>
                    <ForecastBars data={forecast}/>
                  </div>
                </div>
              )}

              {tab==="weather"&&wx&&(
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  <div style={{...card}}>
                    <div style={lbl}>Real-Time Weather Conditions</div>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8}}>
                      {[
                        {icon:"🌡",label:"Temp",val:`${wx.temp}°C`,risk:wx.temp>33?"HIGH":wx.temp>25?"MED":"LOW"},
                        {icon:"💧",label:"Humidity",val:`${wx.humidity}%`,risk:wx.humidity>75?"HIGH":wx.humidity>50?"MED":"LOW"},
                        {icon:"🌧",label:"Rainfall",val:`${wx.rainfall}mm`,risk:wx.rainfall>150?"HIGH":wx.rainfall>50?"MED":"LOW"},
                        {icon:"💨",label:"Wind",val:`${wx.wind}km/h`,risk:"LOW"},
                        {icon:"☀️",label:"UV Index",val:`${wx.uv}`,risk:wx.uv>7?"HIGH":wx.uv>4?"MED":"LOW"},
                      ].map(f=>{
                        const rc=f.risk==="HIGH"?"#e53e3e":f.risk==="MED"?"#d97706":ACC;
                        return (
                          <div key={f.label} style={{background:SURF,border:`1px solid ${rc}22`,borderRadius:8,padding:"10px 8px",textAlign:"center"}}>
                            <div style={{fontSize:15,marginBottom:3}}>{f.icon}</div>
                            <div style={{fontSize:12,fontWeight:700,color:rc,...mono}}>{f.val}</div>
                            <div style={{fontSize:9,color:MUT,marginTop:2,textTransform:"uppercase",letterSpacing:"0.05em"}}>{f.label}</div>
                            <div style={{fontSize:8,color:rc,...mono,marginTop:3}}>{f.risk}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div style={{...card}}>
                    <div style={lbl}>Weather–Disease Correlation</div>
                    {[
                      {label:"Temperature impact",desc:wx.temp>33?`High temps (${wx.temp}°C) accelerate vector lifecycle by ~35%.`:`Moderate temperature — limited effect on transmission.`,risk:wx.temp>33?"HIGH":"LOW"},
                      {label:"Humidity impact",desc:wx.humidity>75?`High humidity (${wx.humidity}%) extends mosquito and bacterial viability.`:`Moderate humidity — limited vector impact.`,risk:wx.humidity>75?"HIGH":"LOW"},
                      {label:"Rainfall impact",desc:wx.rainfall>150?`Heavy rainfall (${wx.rainfall}mm) creates widespread breeding sites and contamination risk.`:wx.rainfall>50?"Moderate rainfall — localized breeding possible.":"Low rainfall — reduced vector breeding risk.",risk:wx.rainfall>150?"HIGH":wx.rainfall>50?"MED":"LOW"},
                    ].map(it=>{
                      const rc=it.risk==="HIGH"?"#e53e3e":it.risk==="MED"?"#d97706":ACC;
                      return (
                        <div key={it.label} style={{padding:"9px 0",borderBottom:`1px solid ${BOR}`}}>
                          <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                            <span style={{fontSize:12,fontWeight:600,color:TXT}}>{it.label}</span>
                            <span style={{fontSize:9,...mono,color:rc,letterSpacing:"0.06em"}}>{it.risk}</span>
                          </div>
                          <p style={{fontSize:11,color:MUT,lineHeight:1.5}}>{it.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {tab==="hospitals"&&hosp&&(
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  <div style={{...card}}>
                    <div style={lbl}>Nearby Healthcare Facilities — {sel.name}</div>
                    {hosp.map((h,i)=>(
                      <div key={h} className="hrow" style={{display:"flex",alignItems:"center",gap:11,padding:"10px 0",borderBottom:`1px solid ${BOR}`,transition:"background 0.15s"}}>
                        <div style={{width:30,height:30,borderRadius:6,background:"rgba(124,92,191,0.1)",border:`1px solid rgba(124,92,191,0.18)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0}}>🏥</div>
                        <div style={{flex:1}}>
                          <div style={{fontSize:12,fontWeight:600,color:TXT}}>{h}</div>
                          <div style={{fontSize:10,color:MUT,marginTop:1}}>{["Government tertiary hospital","Multi-specialty private hospital","Specialized care centre"][i%3]} · {(1.2+i*1.4).toFixed(1)}km</div>
                        </div>
                        <div style={{fontSize:9,...mono,color:ACC,background:"rgba(124,92,191,0.08)",padding:"3px 7px",borderRadius:4,flexShrink:0}}>24h</div>
                      </div>
                    ))}
                  </div>
                  <div style={{...card,border:"1px solid rgba(229,62,62,0.2)"}}>
                    <div style={lbl}>Emergency Contacts</div>
                    {[["National Emergency","112"],["Disease Helpline (IDSP)","1075"],["WHO India Office","+91-11-23370804"]].map(([l,v])=>(
                      <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${BOR}`}}>
                        <span style={{fontSize:12,color:MUT}}>{l}</span>
                        <span style={{fontSize:12,fontWeight:700,color:"#e53e3e",...mono}}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {tab==="prevention"&&di&&(
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  <div style={{...card}}>
                    <div style={lbl}>Prevention Steps — {sel.disease}</div>
                    {di.prevention.map((tip,i)=>(
                      <div key={tip} style={{display:"flex",gap:9,alignItems:"flex-start",padding:"9px 11px",background:"rgba(124,92,191,0.05)",borderRadius:7,border:`1px solid rgba(124,92,191,0.1)`,marginBottom:7}}>
                        <div style={{width:18,height:18,borderRadius:"50%",background:"rgba(124,92,191,0.12)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,...mono,color:ACC,flexShrink:0,fontWeight:700}}>{i+1}</div>
                        <span style={{fontSize:12,color:"#3a3050",lineHeight:1.55}}>{tip}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{...card}}>
                    <div style={lbl}>Public Safety Guidelines</div>
                    {[
                      {icon:"🚨",title:"Travel advisory",desc:`Exercise caution when travelling to high-risk zones of ${sel.name}. Avoid unnecessary exposure to waterlogged areas.`},
                      {icon:"🏥",title:"Seek medical care",desc:`Report symptoms to the nearest healthcare facility. Early treatment is critical for ${sel.disease}.`},
                      {icon:"🧬",title:"Transmission route",desc:`Primary route: ${di.vector}. Take targeted precautions accordingly.`},
                      {icon:"📢",title:"Report clusters",desc:"Notify IDSP (Integrated Disease Surveillance Programme) or local BMC/MCD if you notice unusual symptom clusters."},
                    ].map(g=>(
                      <div key={g.title} style={{display:"flex",gap:9,padding:"9px 0",borderBottom:`1px solid ${BOR}`}}>
                        <span style={{fontSize:14,flexShrink:0}}>{g.icon}</span>
                        <div>
                          <div style={{fontSize:12,fontWeight:600,color:TXT,marginBottom:2}}>{g.title}</div>
                          <p style={{fontSize:11,color:MUT,lineHeight:1.5}}>{g.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:8}}>
              <div style={{fontSize:28}}>🇮🇳</div>
              <div style={{fontSize:12,...mono,color:MUT}}>Select a city on the globe</div>
              <div style={{fontSize:10,color:"rgba(124,92,191,0.4)"}}>Full analytics dashboard will open here</div>
            </div>
          )}
        </div>

        {/* RIGHT — Stats Panel */}
        <div style={{background:"rgba(237,232,255,0.78)",backdropFilter:"blur(14px)",WebkitBackdropFilter:"blur(14px)",borderLeft:`1px solid ${BOR}`,overflowY:"auto",padding:"13px",display:"flex",flexDirection:"column",gap:14,position:"relative",zIndex:1}}>
          <div>
            <div style={lbl}>System Overview</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
              {[
                {label:"Monitored",val:cities.length,col:ACC},
                {label:"Critical",val:cities.filter(c=>c.risk>=70).length,col:"#e53e3e"},
                {label:"Elevated",val:cities.filter(c=>c.risk>=45&&c.risk<70).length,col:"#d97706"},
                {label:"Low Risk",val:cities.filter(c=>c.risk<45).length,col:"#7c5cbf"},
              ].map((s,si)=>(
                <div key={s.label} style={{background:SURF2,borderRadius:8,padding:"9px 11px",border:`1px solid ${BOR}`,animation:`slideUp 0.4s ${si*0.07}s ease both`,transition:"all 0.2s",cursor:"default"}}
                  onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 4px 14px rgba(124,92,191,0.12)";}}
                  onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="none";}}>
                  <div style={{fontSize:"1.25rem",fontWeight:700,color:s.col,...mono,lineHeight:1}}>
                    <CountUp target={s.val} duration={800} delay={si*80}/>
                  </div>
                  <div style={{fontSize:9,color:MUT,marginTop:3}}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div style={lbl}>Critical Outbreak Zones</div>
            {critical.map((c,ci)=>(
              <div key={c.id} onClick={()=>{setSel(c);setTab("overview");}}
                style={{marginBottom:7,background:"rgba(229,62,62,0.05)",border:"1px solid rgba(229,62,62,0.15)",borderRadius:8,padding:"9px 11px",cursor:"pointer",transition:"all 0.2s",animation:`slideRight 0.4s ${ci*0.08}s ease both`}}
                onMouseEnter={e=>{e.currentTarget.style.background="rgba(229,62,62,0.09)";e.currentTarget.style.transform="translateX(3px)";}}
                onMouseLeave={e=>{e.currentTarget.style.background="rgba(229,62,62,0.05)";e.currentTarget.style.transform="translateX(0)";}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                  <div style={{display:"flex",alignItems:"center",gap:7}}>
                    <PulseRing color="#e53e3e" size={6}/>
                    <div>
                      <div style={{fontSize:11,fontWeight:600,color:TXT}}>{c.name}</div>
                      <div style={{fontSize:9,color:MUT,marginTop:1}}>{c.disease}</div>
                    </div>
                  </div>
                  <div style={{fontSize:13,fontWeight:700,color:"#e53e3e",...mono}}>{c.risk}%</div>
                </div>
                <AnimatedRiskBar risk={c.risk} delay={200+ci*100}/>
              </div>
            ))}
          </div>

          <div>
            <div style={lbl}>7-Day Trend — Top Alerts</div>
            {critical.slice(0,3).map(c=>{
              const data=seed7(c.risk);
              const col=RC(c.risk);
              const delta=Math.max(...data)-data[0];
              return (
                <div key={c.id} style={{marginBottom:9,padding:"8px 10px",background:SURF2,borderRadius:7,border:`1px solid ${BOR}`}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                    <span style={{fontSize:11,fontWeight:600,color:TXT}}>{c.name}</span>
                    <span style={{fontSize:10,...mono,color:col}}>{delta>0?"+":""}{delta}%</span>
                  </div>
                  <Spark data={data} color={col}/>
                </div>
              );
            })}
          </div>

          <div>
            <div style={lbl}>Disease Distribution</div>
            {Object.entries(cities.reduce((a,c)=>{a[c.disease]=(a[c.disease]||0)+1;return a;},{})).sort(([,a],[,b])=>b-a).map(([d,n],di)=>(
              <div key={d} style={{marginBottom:8,animation:`slideRight 0.4s ${0.1+di*0.08}s ease both`}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                  <span style={{fontSize:10,color:MUT}}>{d}</span>
                  <span style={{fontSize:10,...mono,color:MUT}}>{n} city</span>
                </div>
                <AnimatedRiskBar risk={(n/cities.length)*100} delay={300+di*60}/>
              </div>
            ))}
          </div>

          {/* India-specific info */}
          <div style={{background:SURF2,border:`1px solid ${BOR}`,borderRadius:8,padding:"10px 12px"}}>
            <div style={lbl}>Surveillance Network</div>
            {[["IDSP Integration","Active"],["NVBDCP Data","Synced"],["ICMR Feed","Live"],["WHO India","Connected"]].map(([l,v])=>(
              <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:`1px solid rgba(124,92,191,0.06)`}}>
                <span style={{fontSize:10,color:MUT}}>{l}</span>
                <span style={{fontSize:10,...mono,color:"#2a9e5a",fontWeight:700}}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}