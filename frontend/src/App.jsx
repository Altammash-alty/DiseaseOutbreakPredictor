import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";


const SYMPTOMS = [
  { name: "fever",    val: 88, trend: "+12%" },
  { name: "cough",    val: 72, trend: "+8%"  },
  { name: "fatigue",  val: 91, trend: "+21%" },
  { name: "headache", val: 55, trend: "+4%"  },
  { name: "dyspnea",  val: 66, trend: "+9%"  },
  { name: "myalgia",  val: 43, trend: "+2%"  },
  { name: "nausea",   val: 38, trend: "-1%"  },
  { name: "chills",   val: 77, trend: "+14%" },
];

const DATA_STATS = [
  { val: "147M+", label: "Data Points / Day" },
  { val: "94%",   label: "Prediction Accuracy" },
  { val: "72h",   label: "Early Warning Lead" },
  { val: "38",    label: "Regions Monitored" },
  { val: "3.2B",  label: "Social Posts Parsed" },
  { val: "99.1%", label: "Uptime" },
];

const REGIONS = [
  { name: "North Zone",    risk: "HIGH", score: 82, delta: "+6"  },
  { name: "East Corridor", risk: "HIGH", score: 76, delta: "+11" },
  { name: "Central Hub",   risk: "MED",  score: 54, delta: "+3"  },
  { name: "West Basin",    risk: "MED",  score: 47, delta: "-2"  },
  { name: "South Delta",   risk: "LOW",  score: 31, delta: "+1"  },
  { name: "Coastal Arc",   risk: "LOW",  score: 28, delta: "-3"  },
];

const SOURCES = [
  { label: "Pharmacy Signals", points: "42.3M", change: "+8.2%",  color: "#7c5cbf" },
  { label: "Web Searches",     points: "68.1M", change: "+14.7%", color: "#3b82c4" },
  { label: "Social Posts",     points: "36.6M", change: "+5.9%",  color: "#b05090" },
];

const RC = { HIGH: "#d94444", MED: "#c87820", LOW: "#7c5cbf" };

/* ─── Word Rotator ─── */
function WordRotator({ words }) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const t = setInterval(() => {
      setVisible(false);
      setTimeout(() => { setIndex(i => (i + 1) % words.length); setVisible(true); }, 380);
    }, 2600);
    return () => clearInterval(t);
  }, [words]);
  return (
    <span style={{ display: "inline-block", color: "#7c5cbf", opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(-8px)", transition: "opacity 0.38s ease, transform 0.38s ease" }}>
      {words[index]}
    </span>
  );
}

/* ─── Particle Field ─── */
function ParticleField() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current, ctx = canvas.getContext("2d");
    let animId;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize(); window.addEventListener("resize", resize);
    const pts = Array.from({ length: 40 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      r: Math.random() * 1.4 + 0.3, vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25,
      o: Math.random() * 0.28 + 0.07,
    }));
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(124,92,191,${p.o})`; ctx.fill();
      });
      pts.forEach((a, i) => pts.slice(i + 1).forEach(b => {
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 110) { ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.strokeStyle = `rgba(124,92,191,${0.07 * (1 - d / 110)})`; ctx.lineWidth = 0.5; ctx.stroke(); }
      }));
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} />;
}

/* ─── Globe ─── */
function GlobeViz({ size = 190 }) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current, ctx = canvas.getContext("2d");
    let animId, angle = 0;
    const W = canvas.width = size, H = canvas.height = size, cx = W / 2, cy = H / 2, R = size * 0.42;
    const hotspots = [
      { lat: 0.5, lon: 0.3, intensity: 0.9 }, { lat: -0.3, lon: 1.8, intensity: 0.7 },
      { lat: 0.8, lon: 3.5, intensity: 0.5 }, { lat: -0.6, lon: 2.5, intensity: 0.8 }, { lat: 0.2, lon: 0.9, intensity: 0.6 },
    ];
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const gr = ctx.createRadialGradient(cx - R * .3, cy - R * .3, R * .08, cx, cy, R);
      gr.addColorStop(0, "rgba(225,215,248,.97)"); gr.addColorStop(1, "rgba(195,178,238,.99)");
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fillStyle = gr; ctx.fill();
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.strokeStyle = "rgba(124,92,191,.28)"; ctx.lineWidth = 1.2; ctx.stroke();
      for (let lat = -80; lat <= 80; lat += 20) {
        const lr = (lat * Math.PI) / 180, y0 = cy + R * Math.sin(lr), rx = R * Math.cos(lr);
        if (Math.abs(rx) < 2) continue;
        ctx.beginPath(); ctx.ellipse(cx, y0, rx, rx * .3, 0, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(124,92,191,.1)"; ctx.lineWidth = .5; ctx.stroke();
      }
      for (let lon = 0; lon < 360; lon += 30) {
        const a = ((lon + angle) * Math.PI) / 180;
        ctx.beginPath(); ctx.ellipse(cx, cy, Math.abs(R * Math.cos(a - Math.PI / 2)), R, a, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(124,92,191,.1)"; ctx.lineWidth = .5; ctx.stroke();
      }
      hotspots.forEach(h => {
        const lon = h.lon + angle * (Math.PI / 180);
        if (Math.cos(lon) < 0) return;
        const x = cx + R * Math.cos(h.lat) * Math.sin(lon), y = cy - R * Math.sin(h.lat);
        const pulse = .7 + .3 * Math.sin(Date.now() / 500 + h.lon);
        const g = ctx.createRadialGradient(x, y, 0, x, y, R * .18 * h.intensity * pulse);
        g.addColorStop(0, `rgba(217,68,68,${.75 * h.intensity})`); g.addColorStop(1, "rgba(217,68,68,0)");
        ctx.beginPath(); ctx.arc(x, y, R * .18 * h.intensity * pulse, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
        ctx.beginPath(); ctx.arc(x, y, 3.5, 0, Math.PI * 2); ctx.fillStyle = `rgba(200,50,50,${.9 * pulse})`; ctx.fill();
      });
      const sh = ctx.createRadialGradient(cx - R * .38, cy - R * .38, R * .04, cx - R * .15, cy - R * .15, R);
      sh.addColorStop(0, "rgba(255,255,255,.32)"); sh.addColorStop(.45, "rgba(255,255,255,0)");
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fillStyle = sh; ctx.fill();
      angle += .18; animId = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animId);
  }, [size]);
  return <canvas ref={ref} style={{ display: "block", width: size, height: size }} />;
}

/* ─── Navbar ─── */
function NavBar() {
  const [sc, setSc] = useState(false);
  useEffect(() => { const h = () => setSc(window.scrollY > 30); window.addEventListener("scroll", h); return () => window.removeEventListener("scroll", h); }, []);
  const mono = { fontFamily: "'Space Mono',monospace" };
  return (
    <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, padding: "0 clamp(14px,4vw,52px)", height: 54, display: "flex", alignItems: "center", justifyContent: "space-between", background: sc ? "rgba(244,240,255,.94)" : "transparent", borderBottom: sc ? "1px solid rgba(124,92,191,.1)" : "none", backdropFilter: sc ? "blur(16px)" : "none", transition: "all .3s" }}>
      <Link to="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", color: "inherit" }}>
        <div style={{ width: 26, height: 26, borderRadius: "50%", background: "radial-gradient(circle at 35% 35%,#c4aef0,#7c5cbf)", boxShadow: "0 0 10px rgba(124,92,191,.3)" }} />
        <span style={{ ...mono, fontWeight: 700, fontSize: 14, letterSpacing: ".06em", color: "#1a1530" }}>EpiSense <span style={{ color: "#7c5cbf" }}>AI</span></span>
      </Link>
      <div style={{ display: "flex", gap: "clamp(12px,2.5vw,28px)", alignItems: "center" }}>
        {["Model", "Data", "Regions", "About"].map(item => (
          <a key={item} href="#" style={{ color: "#6b6080", fontSize: 12, ...mono, textDecoration: "none", letterSpacing: ".05em", transition: "color .2s" }}
            onMouseEnter={e => e.target.style.color = "#7c5cbf"} onMouseLeave={e => e.target.style.color = "#6b6080"}>{item}</a>
        ))}
        <Link to="/dashboard" style={{ padding: "7px 16px", background: "#7c5cbf", border: "none", borderRadius: 5, color: "#fff", fontSize: 11, ...mono, cursor: "pointer", letterSpacing: ".07em", textDecoration: "none", transition: "all .2s", boxShadow: "0 2px 10px rgba(124,92,191,.28)" }}
          onMouseEnter={e => { e.target.style.background = "#9b7dd4"; }} onMouseLeave={e => { e.target.style.background = "#7c5cbf"; }}>Dashboard</Link>
      </div>
    </nav>
  );
}

/* ══════════════════════════════════════════ APP ══════════════════════════════════════════ */
export default function App() {
  const rotatorWords = ["Disease Outbreaks", "Viral Spread", "Epidemic Risk", "Health Threats", "Contagion Waves"];
  const mono = { fontFamily: "'Space Mono',monospace" };
  const card = { background: "#ede8ff", border: "1px solid rgba(124,92,191,.13)", borderRadius: 12, transition: "all .25s" };
  const label = { ...mono, fontSize: 10, letterSpacing: ".22em", textTransform: "uppercase", color: "#7c5cbf", marginBottom: 8 };

  return (
    <div style={{ background: "#f4f0ff", minHeight: "100vh", color: "#1a1530", fontFamily: "'DM Sans',sans-serif", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Space+Mono:wght@400;700&family=DM+Sans:wght@400;500;600&display=swap');
        @keyframes pulse{0%,100%{opacity:1;box-shadow:0 0 6px rgba(124,92,191,.7)}50%{opacity:.35;box-shadow:0 0 3px rgba(124,92,191,.3)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes floatY{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
        @keyframes ticker{0%,100%{opacity:.45}50%{opacity:1}}
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:#f4f0ff}::-webkit-scrollbar-thumb{background:rgba(124,92,191,.25);border-radius:2px}
        .ch:hover{border-color:rgba(124,92,191,.25)!important;background:#e8e2f8!important;transform:translateY(-2px);box-shadow:0 6px 20px rgba(124,92,191,.1)!important}
        .dr:hover{background:rgba(124,92,191,.05)!important}
      `}</style>
      <NavBar />

      {/* ══ SCREEN 1 — HERO ══════════════════════════════════════════════════════════════════ */}
      <section style={{ position: "relative", height: "100vh", display: "flex", alignItems: "stretch", padding: "54px clamp(14px,4vw,56px) 20px", overflow: "hidden" }}>
        <ParticleField />
        <div style={{ position: "absolute", top: "-5%", left: "50%", transform: "translateX(-50%)", width: "70%", height: "60%", background: "radial-gradient(ellipse,rgba(180,155,230,.18) 0%,transparent 70%)", pointerEvents: "none" }} />

        {/* 2-col: LEFT copy | RIGHT stacked panels */}
        <div style={{ maxWidth: 1200, width: "100%", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 420px", gap: "clamp(18px,3vw,44px)", alignItems: "stretch", position: "relative", animation: "fadeUp .7s ease both" }}>

          {/* ── LEFT ── */}
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
            {/* Badge */}
            <div style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "5px 13px", border: "1px solid rgba(124,92,191,.22)", borderRadius: 20, marginBottom: 16, background: "rgba(124,92,191,.06)", width: "fit-content" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#7c5cbf", animation: "pulse 2s ease-in-out infinite" }} />
              <span style={{ fontSize: 11, ...mono, color: "#7c5cbf", letterSpacing: ".12em", textTransform: "uppercase" }}>AI-Powered Surveillance</span>
            </div>

            {/* Headline */}
            <h1 style={{ fontSize: "clamp(1.9rem,3.2vw,3.4rem)", fontFamily: "'Syne',sans-serif", fontWeight: 800, lineHeight: 1.18, letterSpacing: "-1px", margin: "0 0 18px", color: "#1a1530" }}>
              Predict &amp; Stop<br />
              <WordRotator words={rotatorWords} /><br />
              Before They Spread
            </h1>

            {/* Sub */}
            <p style={{ fontSize: "clamp(13px,1.4vw,15.5px)", lineHeight: 1.72, color: "#6b6080", maxWidth: 480, marginBottom: 28 }}>
              A multi-layer AI architecture fusing pharmacy data, web signals, and social intelligence to forecast disease outbreaks — days before they happen.
            </p>

            {/* Buttons */}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 32 }}>
              <Link to="/dashboard" style={{ padding: "12px 28px", background: "#7c5cbf", color: "#fff", fontSize: 13, ...mono, fontWeight: 700, letterSpacing: ".06em", border: "none", borderRadius: 6, cursor: "pointer", transition: "all .2s", boxShadow: "0 4px 16px rgba(124,92,191,.35)", textDecoration: "none", display: "inline-block" }}
                onMouseEnter={e => { e.target.style.background = "#9b7dd4"; }} onMouseLeave={e => { e.target.style.background = "#7c5cbf"; }}>Explore the Model</Link>
              <button style={{ padding: "12px 28px", background: "transparent", color: "#7c5cbf", fontSize: 13, ...mono, border: "1.5px solid rgba(124,92,191,.32)", borderRadius: 6, cursor: "pointer", transition: "all .2s" }}
                onMouseEnter={e => e.target.style.background = "rgba(124,92,191,.07)"} onMouseLeave={e => e.target.style.background = "transparent"}>Read the Paper ↗</button>
            </div>

            {/* Pipeline strip */}
            <div style={{ background: "#ede8ff", border: "1px solid rgba(124,92,191,.1)", borderRadius: 10, padding: "11px 16px", display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              <span style={{ fontSize: 10, ...mono, color: "#6b6080", letterSpacing: ".1em", textTransform: "uppercase", marginRight: 4 }}>Pipeline</span>
              {["Pharmacy", "Web Searches", "Social Posts", "BERT NLP", "Feature Fusion", "LSTM Trends", "GNN Spread", "Outbreak Score"].map((step, i, arr) => (
                <span key={step} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ fontSize: 11, ...mono, color: "#7c5cbf", background: "rgba(124,92,191,.09)", padding: "3px 8px", borderRadius: 4 }}>{step}</span>
                  {i < arr.length - 1 && <span style={{ color: "rgba(124,92,191,.35)", fontSize: 12 }}>→</span>}
                </span>
              ))}
            </div>
          </div>

          {/* ── RIGHT: Globe on top, Symptom Feed below — fills full height ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12, animation: "floatY 6s .5s ease-in-out infinite" }}>

            {/* Globe panel — flex 1 so it grows */}
            <div style={{ ...card, overflow: "hidden", boxShadow: "0 8px 32px rgba(124,92,191,.13)", flex: 1, display: "flex", flexDirection: "column" }}>
              <div style={{ padding: "10px 14px", borderBottom: "1px solid rgba(124,92,191,.09)", display: "flex", alignItems: "center", gap: 8, background: "rgba(244,240,255,.75)", flexShrink: 0 }}>
                <div style={{ display: "flex", gap: 5 }}>{["#ff5f57","#ffbd2e","#28ca41"].map(c => <div key={c} style={{ width: 8, height: 8, borderRadius: "50%", background: c }} />)}</div>
                <span style={{ fontSize: 10, ...mono, color: "#6b6080", letterSpacing: ".08em" }}>OUTBREAK RADAR</span>
                <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#7c5cbf", animation: "pulse 1.5s infinite" }} />
                  <span style={{ fontSize: 9, ...mono, color: "#7c5cbf" }}>LIVE</span>
                </div>
              </div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "12px", gap: 10 }}>
                <GlobeViz size={260} />
                <div style={{ display: "flex", gap: 16, fontSize: 10, ...mono, color: "#6b6080" }}>
                  {[["#d94444","HIGH"],["#c87820","MED"],["#7c5cbf","LOW"]].map(([c,l]) => (
                    <span key={l} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <span style={{ width: 7, height: 7, borderRadius: "50%", background: c, display: "inline-block" }} />{l}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Symptom Signal Feed — flex 1 so it grows too */}
            <div style={{ ...card, overflow: "hidden", boxShadow: "0 8px 32px rgba(124,92,191,.13)", flex: 1, display: "flex", flexDirection: "column" }}>
              <div style={{ padding: "10px 14px", borderBottom: "1px solid rgba(124,92,191,.09)", display: "flex", alignItems: "center", background: "rgba(244,240,255,.75)", flexShrink: 0 }}>
                <span style={{ fontSize: 10, ...mono, color: "#6b6080", letterSpacing: ".08em" }}>SYMPTOM SIGNAL FEED</span>
                <span style={{ marginLeft: "auto", fontSize: 9, ...mono, color: "#d94444", animation: "ticker 1.8s infinite" }}>● LIVE</span>
              </div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-around", padding: "4px 0" }}>
                {SYMPTOMS.map((s, i) => {
                  const dc = s.val > 70 ? "#d94444" : s.val > 50 ? "#c87820" : "#7c5cbf";
                  const up = s.trend.startsWith("+");
                  return (
                    <div key={s.name} className="dr" style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 14px", flex: 1, borderBottom: i < SYMPTOMS.length - 1 ? "1px solid rgba(124,92,191,.06)" : "none", transition: "background .2s", minHeight: 0 }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: dc, flexShrink: 0 }} />
                      <span style={{ fontSize: 11, ...mono, textTransform: "uppercase", letterSpacing: ".04em", color: "#3a3050", flex: 1 }}>{s.name}</span>
                      <div style={{ width: 60, height: 4, background: "rgba(124,92,191,.1)", borderRadius: 2, overflow: "hidden", flexShrink: 0 }}>
                        <div style={{ height: "100%", width: `${s.val}%`, background: dc, borderRadius: 2, opacity: .75 }} />
                      </div>
                      <span style={{ fontSize: 11, ...mono, fontWeight: 700, color: dc, minWidth: 28, textAlign: "right" }}>{s.val}%</span>
                      <span style={{ fontSize: 10, ...mono, color: up ? "#2a9e5a" : "#c87820", minWidth: 32, textAlign: "right" }}>{s.trend}</span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ══ SCREEN 2 — DATA + ARCHITECTURE + CTA ═════════════════════════════════════════════ */}
      <section style={{ background: "#ede8ff", minHeight: "100vh", padding: "32px clamp(14px,4vw,56px) 32px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", width: "100%", display: "flex", flexDirection: "column", gap: 16 }}>

          {/* ROW 1: 6 stat cards */}
          <div>
            <div style={{ ...label, marginBottom: 8 }}>Live Intelligence Dashboard</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 10 }}>
              {DATA_STATS.map(d => (
                <div key={d.label} className="ch" style={{ ...card, background: "#f4f0ff", padding: "20px 16px", boxShadow: "0 1px 8px rgba(124,92,191,.07)" }}>
                  <div style={{ fontSize: "1.7rem", ...mono, fontWeight: 700, color: "#7c5cbf", lineHeight: 1 }}>{d.val}</div>
                  <div style={{ fontSize: 11, color: "#6b6080", marginTop: 7, lineHeight: 1.3 }}>{d.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ROW 2: Regional risk + Data sources */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 260px", gap: 14 }}>
            {/* Regional Risk */}
            <div style={{ ...card, padding: "18px 20px", background: "#f4f0ff", boxShadow: "0 2px 12px rgba(124,92,191,.08)" }}>
              <div style={{ ...label, marginBottom: 12 }}>Regional Risk Index — Live</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 10 }}>
                {REGIONS.map(r => {
                  const rc = RC[r.risk], up = r.delta.startsWith("+");
                  return (
                    <div key={r.name} className="ch" style={{ ...card, padding: "14px 10px", textAlign: "center", boxShadow: "none" }}>
                      <div style={{ fontSize: 9, ...mono, color: rc, letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 4 }}>{r.risk}</div>
                      <div style={{ fontSize: "1.45rem", ...mono, fontWeight: 700, color: rc, lineHeight: 1, marginBottom: 4 }}>{r.score}%</div>
                      <div style={{ fontSize: 10, color: "#6b6080", lineHeight: 1.3, marginBottom: 3 }}>{r.name}</div>
                      <div style={{ fontSize: 10, ...mono, color: up ? "#2a9e5a" : "#c87820", fontWeight: 700, marginBottom: 6 }}>{r.delta}</div>
                      <div style={{ height: 3, background: "rgba(124,92,191,.1)", borderRadius: 2 }}>
                        <div style={{ height: "100%", width: `${r.score}%`, background: rc, borderRadius: 2, opacity: .7 }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Data Sources */}
            <div style={{ ...card, padding: "18px 20px", background: "#f4f0ff", boxShadow: "0 2px 12px rgba(124,92,191,.08)" }}>
              <div style={{ ...label, marginBottom: 12 }}>Data Sources</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {SOURCES.map(s => (
                  <div key={s.label}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 12, color: "#3a3050", fontWeight: 600, flex: 1 }}>{s.label}</span>
                      <span style={{ fontSize: 12, ...mono, color: "#1a1530", fontWeight: 700 }}>{s.points}</span>
                      <span style={{ fontSize: 11, ...mono, color: "#2a9e5a", minWidth: 40 }}>{s.change}</span>
                    </div>
                    <div style={{ height: 4, background: "rgba(124,92,191,.1)", borderRadius: 2 }}>
                      <div style={{ height: "100%", width: s.label === "Web Searches" ? "65%" : s.label === "Pharmacy Signals" ? "40%" : "35%", background: s.color, borderRadius: 2, opacity: .7 }} />
                    </div>
                  </div>
                ))}
                <div style={{ borderTop: "1px solid rgba(124,92,191,.1)", paddingTop: 10, marginTop: 2 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontSize: 10, ...mono, color: "#6b6080", textTransform: "uppercase", letterSpacing: ".1em" }}>Total / Day</span>
                    <span style={{ fontSize: 13, ...mono, fontWeight: 700, color: "#7c5cbf" }}>147M+</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 10, ...mono, color: "#6b6080", textTransform: "uppercase", letterSpacing: ".1em" }}>Model Uptime</span>
                    <span style={{ fontSize: 13, ...mono, fontWeight: 700, color: "#2a9e5a" }}>99.1%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ROW 3: Architecture cards + CTA */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 260px", gap: 14 }}>
            <div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 12 }}>
                <div style={{ ...label, marginBottom: 0 }}>Model Architecture</div>
                <h2 style={{ fontSize: "clamp(1.1rem,1.8vw,1.5rem)", fontFamily: "'Syne',sans-serif", fontWeight: 800, letterSpacing: "-.3px", color: "#1a1530" }}>
                  Three Layers. <span style={{ color: "#7c5cbf" }}>One Prediction.</span>
                </h2>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
                {[
                  { icon: "◈", title: "Language Intelligence", sub: "BERT-Powered NLP",     desc: "Ingests millions of web queries and social posts daily. Extracts structured symptom signals from raw text across multiple languages and dialects.", tag: "NLP",      color: "#7c5cbf" },
                  { icon: "◉", title: "Temporal Forecasting",  sub: "LSTM Networks",         desc: "Learns rolling time-series of symptom signals per region. Detects outbreak-indicative trend patterns up to 72 hours in advance.", tag: "Temporal", color: "#3b82c4" },
                  { icon: "◬", title: "Spatial Propagation",   sub: "Graph Neural Networks", desc: "Models inter-region disease spread using geographic proximity and mobility graphs. Predicts contagion pathways before they appear in clinical data.", tag: "Spatial",  color: "#b05090" },
                ].map(c => (
                  <div key={c.tag} className="ch" style={{ background: "#f4f0ff", border: "1px solid rgba(124,92,191,.12)", borderRadius: 10, padding: "16px", position: "relative", overflow: "hidden", boxShadow: "0 1px 8px rgba(124,92,191,.06)" }}>
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,transparent,${c.color}55,transparent)` }} />
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                      <span style={{ fontSize: 24, color: c.color, opacity: .6 }}>{c.icon}</span>
                      <span style={{ fontSize: 9, ...mono, color: c.color, letterSpacing: ".1em", textTransform: "uppercase", background: `${c.color}15`, padding: "2px 7px", borderRadius: 3 }}>{c.tag}</span>
                    </div>
                    <h3 style={{ fontFamily: "'Syne',sans-serif", fontSize: "1rem", fontWeight: 700, marginBottom: 4, color: "#1a1530" }}>{c.title}</h3>
                    <p style={{ fontSize: 10, color: "#6b6080", ...mono, marginBottom: 8 }}>{c.sub}</p>
                    <p style={{ fontSize: 12, color: "#6b6080", lineHeight: 1.6 }}>{c.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div style={{ ...card, padding: "22px", boxShadow: "0 4px 20px rgba(124,92,191,.1)", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: -32, right: -32, width: 110, height: 110, borderRadius: "50%", background: "radial-gradient(circle,rgba(124,92,191,.13),transparent)" }} />
              <div style={{ ...label, marginBottom: 8 }}>Get Early Access</div>
              <h3 style={{ fontFamily: "'Syne',sans-serif", fontSize: "1rem", fontWeight: 800, color: "#1a1530", marginBottom: 8, lineHeight: 1.3 }}>Stop the Outbreak <span style={{ color: "#7c5cbf" }}>Before It Starts</span></h3>
              <p style={{ fontSize: 12, color: "#6b6080", lineHeight: 1.6, marginBottom: 14 }}>Join health agencies using EpiSense AI to stay ahead of emerging disease threats worldwide.</p>
              <button style={{ width: "100%", padding: "11px 0", background: "#7c5cbf", color: "#fff", fontSize: 11, ...mono, fontWeight: 700, letterSpacing: ".06em", border: "none", borderRadius: 5, cursor: "pointer", transition: "all .2s", boxShadow: "0 3px 12px rgba(124,92,191,.28)", marginBottom: 8 }}
                onMouseEnter={e => e.target.style.background = "#9b7dd4"} onMouseLeave={e => e.target.style.background = "#7c5cbf"}>Request Access</button>
              <button style={{ width: "100%", padding: "10px 0", background: "transparent", color: "#7c5cbf", fontSize: 11, ...mono, border: "1.5px solid rgba(124,92,191,.28)", borderRadius: 5, cursor: "pointer", marginBottom: 14 }}>View Docs ↗</button>
              <div style={{ padding: "12px", background: "#f4f0ff", borderRadius: 8, border: "1px solid rgba(124,92,191,.1)" }}>
                <div style={{ fontSize: 9, ...mono, color: "#6b6080", letterSpacing: ".1em", marginBottom: 10, textTransform: "uppercase" }}>Model Confidence</div>
                {[["Outbreak Detected",94],["Spread Predicted",88],["Region Accuracy",91],["Data Coverage",97]].map(([l,v]) => (
                  <div key={l} style={{ marginBottom: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, ...mono, color: "#6b6080", marginBottom: 3 }}>
                      <span>{l}</span><span style={{ color: "#7c5cbf", fontWeight: 700 }}>{v}%</span>
                    </div>
                    <div style={{ height: 4, background: "rgba(124,92,191,.1)", borderRadius: 2 }}>
                      <div style={{ height: "100%", width: `${v}%`, background: "linear-gradient(90deg,#9b7dd4,#7c5cbf)", borderRadius: 2 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid rgba(124,92,191,.1)", padding: "14px clamp(14px,4vw,56px)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, background: "#f4f0ff" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 18, height: 18, borderRadius: "50%", background: "radial-gradient(circle at 35% 35%,#c4aef0,#7c5cbf)" }} />
          <span style={{ ...mono, fontWeight: 700, fontSize: 12, letterSpacing: ".07em", color: "#1a1530" }}>EpiSense <span style={{ color: "#7c5cbf" }}>AI</span></span>
        </div>
        <p style={{ fontSize: 11, color: "#6b6080", ...mono }}>© 2025 EpiSense AI Research Project. All rights reserved.</p>
        <div style={{ display: "flex", gap: 16 }}>
          {["Privacy","Terms","Contact"].map(l => (
            <a key={l} href="#" style={{ fontSize: 11, ...mono, color: "#6b6080", textDecoration: "none" }}
              onMouseEnter={e => e.target.style.color = "#7c5cbf"} onMouseLeave={e => e.target.style.color = "#6b6080"}>{l}</a>
          ))}
        </div>
      </footer>
    </div>
  );
}