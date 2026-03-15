import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

// ─── Design Tokens ────────────────────────────────────────────────────────────
const M = { fontFamily: "'Space Mono',monospace" };
const SY = { fontFamily: "'Syne',sans-serif" };
const AC = "#7c5cbf";
const TX = "#1a1530";
const MU = "#6b6080";
const BO = "rgba(124,92,191,0.13)";
const S1 = "#ede8ff";
const S2 = "#f4f0ff";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Space+Mono:wght@400;700&family=DM+Sans:wght@400;500;600&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'DM Sans',sans-serif;background:#f4f0ff;color:#1a1530;overflow-x:hidden}
::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:#f4f0ff}::-webkit-scrollbar-thumb{background:rgba(124,92,191,.25);border-radius:2px}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
@keyframes fadeUp{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}
@keyframes slideUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
@keyframes slideL{from{opacity:0;transform:translateX(-16px)}to{opacity:1;transform:translateX(0)}}
.hv:hover{border-color:rgba(124,92,191,.28)!important;background:#e4ddf6!important;transform:translateY(-3px)!important;box-shadow:0 8px 24px rgba(124,92,191,.12)!important}
.lft{transition:all .22s!important}.lft:hover{transform:translateY(-3px)!important;box-shadow:0 8px 24px rgba(124,92,191,.13)!important}
.dr:hover{background:rgba(124,92,191,.05)!important}
.nva{color:#6b6080;font-size:12px;font-family:'Space Mono',monospace;text-decoration:none;letter-spacing:.05em;transition:color .2s;padding-bottom:2px;border-bottom:1.5px solid transparent}
.nva:hover,.nva.on{color:#7c5cbf;border-bottom-color:#7c5cbf}
@media(max-width:700px){.dnav{display:none!important}.burg{display:flex!important}}
`;

// ─── Shared Atoms ─────────────────────────────────────────────────────────────
function Lbl({ t, center }) {
  return <div style={{ ...M, fontSize: 10, letterSpacing: ".22em", textTransform: "uppercase", color: AC, marginBottom: 10, textAlign: center ? "center" : "left" }}>{t}</div>;
}

function WordSpin({ words }) {
  const [i, setI] = useState(0); const [v, setV] = useState(true);
  useEffect(() => {
    const t = setInterval(() => { setV(false); setTimeout(() => { setI(x => (x + 1) % words.length); setV(true); }, 380); }, 2600);
    return () => clearInterval(t);
  }, []);
  return <span style={{ display: "inline-block", color: AC, opacity: v ? 1 : 0, transform: v ? "translateY(0)" : "translateY(-10px)", transition: "opacity .38s,transform .38s" }}>{words[i]}</span>;
}

function Particles() {
  const r = useRef(null);
  useEffect(() => {
    const c = r.current; if (!c) return; const x = c.getContext("2d"); let id;
    const sz = () => { c.width = c.offsetWidth; c.height = c.offsetHeight; };
    sz(); window.addEventListener("resize", sz);
    const pts = Array.from({ length: 42 }, () => ({ x: Math.random() * c.width, y: Math.random() * c.height, r: Math.random() * 1.4 + .3, vx: (Math.random() - .5) * .22, vy: (Math.random() - .5) * .22, o: Math.random() * .22 + .06 }));
    const draw = () => {
      x.clearRect(0, 0, c.width, c.height);
      pts.forEach(p => { p.x += p.vx; p.y += p.vy; if (p.x < 0) p.x = c.width; if (p.x > c.width) p.x = 0; if (p.y < 0) p.y = c.height; if (p.y > c.height) p.y = 0; x.beginPath(); x.arc(p.x, p.y, p.r, 0, Math.PI * 2); x.fillStyle = `rgba(124,92,191,${p.o})`; x.fill(); });
      pts.forEach((a, i) => pts.slice(i + 1).forEach(b => { const d = Math.hypot(a.x - b.x, a.y - b.y); if (d < 115) { x.beginPath(); x.moveTo(a.x, a.y); x.lineTo(b.x, b.y); x.strokeStyle = `rgba(124,92,191,${.07 * (1 - d / 115)})`; x.lineWidth = .5; x.stroke(); } }));
      id = requestAnimationFrame(draw);
    };
    draw(); return () => { cancelAnimationFrame(id); window.removeEventListener("resize", sz); };
  }, []);
  return <canvas ref={r} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} />;
}

function Globe({ size = 220 }) {
  const r = useRef(null);
  useEffect(() => {
    const c = r.current; if (!c) return; const ctx = c.getContext("2d"); let id, a = 0;
    const W = c.width = size, H = c.height = size, cx = W / 2, cy = H / 2, R = size * .42;
    const hs = [{ la: .5, lo: .3, i: .9 }, { la: -.3, lo: 1.8, i: .7 }, { la: .8, lo: 3.5, i: .5 }, { la: -.6, lo: 2.5, i: .8 }, { la: .2, lo: .9, i: .6 }];
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const gr = ctx.createRadialGradient(cx - R * .3, cy - R * .3, R * .08, cx, cy, R);
      gr.addColorStop(0, "rgba(225,215,248,.97)"); gr.addColorStop(1, "rgba(195,178,238,.99)");
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fillStyle = gr; ctx.fill();
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.strokeStyle = "rgba(124,92,191,.28)"; ctx.lineWidth = 1.2; ctx.stroke();
      for (let la = -80; la <= 80; la += 20) { const lr = (la * Math.PI) / 180, y0 = cy + R * Math.sin(lr), rx = R * Math.cos(lr); if (Math.abs(rx) < 2) continue; ctx.beginPath(); ctx.ellipse(cx, y0, rx, rx * .3, 0, 0, Math.PI * 2); ctx.strokeStyle = "rgba(124,92,191,.1)"; ctx.lineWidth = .5; ctx.stroke(); }
      for (let lo = 0; lo < 360; lo += 30) { const ang = ((lo + a) * Math.PI) / 180; ctx.beginPath(); ctx.ellipse(cx, cy, Math.abs(R * Math.cos(ang - Math.PI / 2)), R, ang, 0, Math.PI * 2); ctx.strokeStyle = "rgba(124,92,191,.1)"; ctx.lineWidth = .5; ctx.stroke(); }
      hs.forEach(h => { const lo = h.lo + a * (Math.PI / 180); if (Math.cos(lo) < 0) return; const x = cx + R * Math.cos(h.la) * Math.sin(lo), y = cy - R * Math.sin(h.la); const p = .7 + .3 * Math.sin(Date.now() / 500 + h.lo); const g = ctx.createRadialGradient(x, y, 0, x, y, R * .18 * h.i * p); g.addColorStop(0, `rgba(217,68,68,${.75 * h.i})`); g.addColorStop(1, "rgba(217,68,68,0)"); ctx.beginPath(); ctx.arc(x, y, R * .18 * h.i * p, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill(); ctx.beginPath(); ctx.arc(x, y, 3.5, 0, Math.PI * 2); ctx.fillStyle = `rgba(200,50,50,${.9 * p})`; ctx.fill(); });
      const sh = ctx.createRadialGradient(cx - R * .38, cy - R * .38, R * .04, cx - R * .15, cy - R * .15, R); sh.addColorStop(0, "rgba(255,255,255,.32)"); sh.addColorStop(.45, "rgba(255,255,255,0)"); ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fillStyle = sh; ctx.fill();
      a += .18; id = requestAnimationFrame(draw);
    };
    draw(); return () => cancelAnimationFrame(id);
  }, [size]);
  return <canvas ref={r} style={{ display: "block", width: size, height: size }} />;
}

// ─── NavBar ───────────────────────────────────────────────────────────────────
function Nav() {
  const [sc, setSc] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const path = location.pathname;

  useEffect(() => { const h = () => setSc(window.scrollY > 30); window.addEventListener("scroll", h); return () => window.removeEventListener("scroll", h); }, []);
  useEffect(() => { setOpen(false); window.scrollTo(0, 0); }, [path]);

  const links = [{ l: "Model", to: "/model" }, { l: "Data", to: "/data" }, { l: "Regions", to: "/regions" }, { l: "About", to: "/about" }];
  const bg = sc || open ? "rgba(244,240,255,.96)" : "transparent";
  const bd = sc || open ? `1px solid ${BO}` : "none";

  return (
    <>
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 200, padding: "0 clamp(14px,4vw,52px)", height: 54, display: "flex", alignItems: "center", justifyContent: "space-between", background: bg, borderBottom: bd, backdropFilter: sc || open ? "blur(18px)" : "none", transition: "all .3s" }}>
        {/* Logo + back pill */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Link to="/" style={{ textDecoration: "none" }}>
            <span style={{ ...M, fontWeight: 700, fontSize: 14, letterSpacing: ".06em", color: TX }}>EpiSense <span style={{ color: AC }}>AI</span></span>
          </Link>
          {path !== "/" && (
            <Link to="/" style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", background: "rgba(124,92,191,.08)", border: `1px solid rgba(124,92,191,.2)`, borderRadius: 20, textDecoration: "none", transition: "background .2s" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(124,92,191,.15)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(124,92,191,.08)"}>
              <span style={{ fontSize: 11, color: AC }}>←</span>
              <span style={{ fontSize: 10, ...M, color: AC, letterSpacing: ".05em" }}>Home</span>
            </Link>
          )}
        </div>

        {/* Desktop links */}
        <div className="dnav" style={{ display: "flex", gap: "clamp(14px,2.5vw,28px)", alignItems: "center" }}>
          {links.map(l => (
            <Link key={l.l} to={l.to} className={`nva${path === l.to ? " on" : ""}`} style={{ textDecoration: "none" }}>{l.l}</Link>
          ))}
          <Link to="/dashboard" style={{ padding: "7px 18px", background: AC, borderRadius: 5, color: "#fff", fontSize: 11, ...M, letterSpacing: ".07em", textDecoration: "none", boxShadow: "0 2px 10px rgba(124,92,191,.28)", transition: "background .2s" }}
            onMouseEnter={e => e.currentTarget.style.background = "#9b7dd4"}
            onMouseLeave={e => e.currentTarget.style.background = AC}>
            Dashboard
          </Link>
        </div>

        {/* Burger */}
        <button onClick={() => setOpen(o => !o)} className="burg" style={{ display: "none", background: "none", border: "none", cursor: "pointer", padding: 6, flexDirection: "column", gap: 4 }} aria-label="Menu">
          {[0, 1, 2].map(i => <span key={i} style={{ display: "block", width: 22, height: 2, background: AC, borderRadius: 2, transition: "all .25s", transform: open && i === 0 ? "translateY(6px) rotate(45deg)" : open && i === 2 ? "translateY(-6px) rotate(-45deg)" : open && i === 1 ? "scaleX(0)" : "none" }} />)}
        </button>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <div style={{ position: "fixed", top: 54, left: 0, right: 0, zIndex: 199, background: "rgba(244,240,255,.98)", backdropFilter: "blur(18px)", borderBottom: `1px solid ${BO}`, padding: "16px clamp(14px,4vw,32px) 20px", display: "flex", flexDirection: "column", gap: 2, animation: "fadeUp .2s ease both" }}>
          {path !== "/" && (
            <Link to="/" style={{ padding: "11px 0", fontSize: 14, ...M, color: AC, textDecoration: "none", borderBottom: `1px solid ${BO}`, display: "flex", alignItems: "center", gap: 6 }}>
              <span>←</span> Back to Home
            </Link>
          )}
          {links.map(l => (
            <Link key={l.l} to={l.to} style={{ padding: "11px 0", fontSize: 14, ...M, color: path === l.to ? AC : MU, textDecoration: "none", borderBottom: `1px solid ${BO}`, display: "block" }}>{l.l}</Link>
          ))}
          <Link to="/dashboard" style={{ marginTop: 12, padding: "12px 0", background: AC, borderRadius: 6, color: "#fff", textAlign: "center", fontSize: 13, ...M, letterSpacing: ".06em", textDecoration: "none", display: "block" }}>
            Open Dashboard
          </Link>
        </div>
      )}
    </>
  );
}

function Foot() {
  return (
    <footer style={{ borderTop: `1px solid ${BO}`, padding: "16px clamp(14px,4vw,56px)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, background: S2 }}>
      <span style={{ ...M, fontWeight: 700, fontSize: 12, letterSpacing: ".07em", color: TX }}>EpiSense <span style={{ color: AC }}>AI</span></span>
      <p style={{ fontSize: 11, color: MU, ...M }}>© 2025 EpiSense AI Research Project. All rights reserved.</p>
      <div style={{ display: "flex", gap: 16 }}>{["Privacy", "Terms", "Contact"].map(l => <a key={l} href="#" style={{ fontSize: 11, ...M, color: MU, textDecoration: "none" }} onMouseEnter={e => e.target.style.color = AC} onMouseLeave={e => e.target.style.color = MU}>{l}</a>)}</div>
    </footer>
  );
}

function Pg({ children }) {
  return (
    <div style={{ background: S2, minHeight: "100vh", color: TX, fontFamily: "'DM Sans',sans-serif", overflowX: "hidden" }}>
      <style>{CSS}</style>
      <Nav />
      {children}
      <Foot />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// HOME
// ══════════════════════════════════════════════════════════════════════════════
const SYMS = [{ n: "fever", v: 88, t: "+12%" }, { n: "cough", v: 72, t: "+8%" }, { n: "fatigue", v: 91, t: "+21%" }, { n: "headache", v: 55, t: "+4%" }, { n: "dyspnea", v: 66, t: "+9%" }, { n: "myalgia", v: 43, t: "+2%" }, { n: "nausea", v: 38, t: "-1%" }, { n: "chills", v: 77, t: "+14%" }];
const ROT = ["Disease Outbreaks", "Viral Spread", "Epidemic Risk", "Health Threats", "Contagion Waves"];
const PIPE = ["Pharmacy", "Web Searches", "Social Posts", "BERT NLP", "Feature Fusion", "LSTM Trends", "GNN Spread", "Outbreak Score"];
const ST6 = [{ v: "72h", l: "Early Warning Lead", s: "before clinical confirmation" }, { v: "94%", l: "Prediction Accuracy", s: "across all regions" }, { v: "147M+", l: "Data Points / Day", s: "pharmacy + web + social" }, { v: "3.2B", l: "Social Posts Parsed", s: "across 47 languages" }, { v: "38", l: "Regions Monitored", s: "on 6 continents" }, { v: "99.1%", l: "System Uptime", s: "always-on surveillance" }];

export default function App() {
  return (
    <Pg>
      {/* HERO */}
      <section style={{ position: "relative", display: "flex", alignItems: "flex-start", padding: "70px clamp(14px,4vw,56px) 0", overflow: "hidden" }}>
        <Particles />
        <div style={{ position: "absolute", top: "-10%", left: "50%", transform: "translateX(-50%)", width: "80%", height: "70%", background: "radial-gradient(ellipse,rgba(180,155,230,.16) 0%,transparent 70%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 1200, width: "100%", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 400px", gap: "clamp(20px,4vw,52px)", alignItems: "start", position: "relative", animation: "fadeUp .7s ease both", paddingBottom: 40 }}>

          {/* LEFT */}
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", padding: "5px 14px", border: `1px solid rgba(124,92,191,.22)`, borderRadius: 20, marginBottom: 16, background: "rgba(124,92,191,.07)", width: "fit-content" }}>
              <span style={{ fontSize: 11, ...M, color: AC, letterSpacing: ".12em", textTransform: "uppercase" }}>AI-Powered Surveillance</span>
            </div>
            <h1 style={{ fontSize: "clamp(2rem,3.5vw,3.7rem)", ...SY, fontWeight: 800, lineHeight: 1.13, letterSpacing: "-1.5px", marginBottom: 16, color: TX }}>
              Predict &amp; Stop<br /><WordSpin words={ROT} /><br />Before They Spread
            </h1>
            <p style={{ fontSize: "clamp(14px,1.4vw,15.5px)", lineHeight: 1.78, color: MU, maxWidth: 490, marginBottom: 22 }}>
              A multi-layer AI architecture fusing pharmacy data, web signals, and social intelligence to forecast disease outbreaks — days before they happen.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 22 }}>
              <Link to="/dashboard" style={{ padding: "13px 28px", background: AC, color: "#fff", fontSize: 13, ...M, fontWeight: 700, letterSpacing: ".06em", borderRadius: 6, textDecoration: "none", boxShadow: "0 4px 16px rgba(124,92,191,.35)", transition: "background .2s" }}
                onMouseEnter={e => e.currentTarget.style.background = "#9b7dd4"} onMouseLeave={e => e.currentTarget.style.background = AC}>
                Live Dashboard →
              </Link>
              <Link to="/model" style={{ padding: "13px 28px", background: "transparent", color: AC, fontSize: 13, ...M, border: `1.5px solid rgba(124,92,191,.32)`, borderRadius: 6, textDecoration: "none", transition: "background .2s" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(124,92,191,.07)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                How It Works ↗
              </Link>
            </div>
            <div style={{ background: S1, border: `1px solid ${BO}`, borderRadius: 10, padding: "11px 16px", display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap", marginBottom: 16 }}>
              <span style={{ fontSize: 10, ...M, color: MU, letterSpacing: ".1em", textTransform: "uppercase", marginRight: 4 }}>Pipeline</span>
              {PIPE.map((s, i, a) => (
                <span key={s} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ fontSize: 11, ...M, color: AC, background: "rgba(124,92,191,.09)", padding: "3px 8px", borderRadius: 4 }}>{s}</span>
                  {i < a.length - 1 && <span style={{ color: "rgba(124,92,191,.3)", fontSize: 11 }}>→</span>}
                </span>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
              {ST6.map((s, i) => (
                <div key={s.l} className="lft" style={{ background: S1, border: `1px solid ${BO}`, borderRadius: 10, padding: "16px 14px", animation: `slideUp .5s ${i * .07}s ease both` }}>
                  <div style={{ fontSize: "1.5rem", ...M, fontWeight: 700, color: AC, lineHeight: 1, marginBottom: 4 }}>{s.v}</div>
                  <div style={{ fontSize: 11, color: TX, fontWeight: 600, marginBottom: 3 }}>{s.l}</div>
                  <div style={{ fontSize: 10, color: MU, lineHeight: 1.4 }}>{s.s}</div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — sticky panels */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12, position: "sticky", top: 66, alignSelf: "start" }}>
            {/* Globe */}
            <div style={{ background: S1, border: `1px solid ${BO}`, borderRadius: 12, overflow: "hidden", boxShadow: "0 8px 32px rgba(124,92,191,.12)" }}>
              <div style={{ padding: "10px 14px", borderBottom: `1px solid ${BO}`, display: "flex", alignItems: "center", gap: 8, background: "rgba(244,240,255,.85)" }}>
                <div style={{ display: "flex", gap: 5 }}>{["#ff5f57", "#ffbd2e", "#28ca41"].map(c => <div key={c} style={{ width: 8, height: 8, borderRadius: "50%", background: c }} />)}</div>
                <span style={{ fontSize: 10, ...M, color: MU, letterSpacing: ".08em" }}>OUTBREAK RADAR</span>
                <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#d94444", animation: "pulse 1.5s infinite" }} />
                  <span style={{ fontSize: 9, ...M, color: "#d94444" }}>LIVE</span>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "16px 14px 12px", gap: 10 }}>
                <Globe size={220} />
                <div style={{ display: "flex", gap: 16, fontSize: 10, ...M, color: MU }}>
                  {[["#d94444", "HIGH"], ["#c87820", "MED"], [AC, "LOW"]].map(([c, l]) => (
                    <span key={l} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <span style={{ width: 7, height: 7, borderRadius: "50%", background: c, display: "inline-block" }} />{l}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Symptom Feed */}
            <div style={{ background: S1, border: `1px solid ${BO}`, borderRadius: 12, overflow: "hidden", boxShadow: "0 8px 32px rgba(124,92,191,.12)" }}>
              <div style={{ padding: "10px 14px", borderBottom: `1px solid ${BO}`, display: "flex", alignItems: "center", background: "rgba(244,240,255,.85)" }}>
                <span style={{ fontSize: 10, ...M, color: MU, letterSpacing: ".08em" }}>SYMPTOM SIGNAL FEED</span>
                <span style={{ marginLeft: "auto", fontSize: 9, ...M, color: "#d94444", animation: "pulse 1.8s infinite" }}>● LIVE</span>
              </div>
              {SYMS.map((s, i) => {
                const dc = s.v > 70 ? "#d94444" : s.v > 50 ? "#c87820" : AC;
                const up = s.t.startsWith("+");
                return (
                  <div key={s.n} className="dr" style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 14px", borderBottom: i < SYMS.length - 1 ? `1px solid rgba(124,92,191,.06)` : "none", transition: "background .2s" }}>
                    <div style={{ width: 5, height: 5, borderRadius: "50%", background: dc, flexShrink: 0 }} />
                    <span style={{ fontSize: 11, ...M, textTransform: "uppercase", letterSpacing: ".04em", color: "#3a3050", flex: 1 }}>{s.n}</span>
                    <div style={{ width: 52, height: 3, background: "rgba(124,92,191,.1)", borderRadius: 2, overflow: "hidden", flexShrink: 0 }}>
                      <div style={{ height: "100%", width: `${s.v}%`, background: dc, borderRadius: 2, opacity: .75 }} />
                    </div>
                    <span style={{ fontSize: 11, ...M, fontWeight: 700, color: dc, minWidth: 28, textAlign: "right" }}>{s.v}%</span>
                    <span style={{ fontSize: 10, ...M, color: up ? "#2a9e5a" : "#c87820", minWidth: 32, textAlign: "right" }}>{s.t}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ARCHITECTURE */}
      <section style={{ background: S1, padding: "64px clamp(14px,4vw,56px)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 30, flexWrap: "wrap" }}>
            <Lbl t="Model Architecture" />
            <h2 style={{ fontSize: "clamp(1.2rem,2vw,1.7rem)", ...SY, fontWeight: 800, letterSpacing: "-.4px", color: TX }}>Three Layers. <span style={{ color: AC }}>One Prediction.</span></h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 20 }}>
            {[
              { ic: "◈", tag: "NLP", col: AC, ti: "Language Intelligence", su: "BERT-Powered NLP", de: "Ingests millions of web queries and social posts daily across 47 languages. Extracts structured symptom signals from raw text using fine-tuned BERT models.", me: [{ l: "Languages", v: "47" }, { l: "Posts/day", v: "3.2B" }, { l: "Accuracy", v: "92%" }] },
              { ic: "◉", tag: "LSTM", col: "#3b82c4", ti: "Temporal Forecasting", su: "LSTM Networks", de: "Learns rolling 30-day time-series of symptom signals per region. Detects outbreak-indicative trends up to 72 hours ahead using bidirectional LSTMs.", me: [{ l: "Forecast", v: "72h" }, { l: "Seq length", v: "30d" }, { l: "RMSE", v: "0.041" }] },
              { ic: "◬", tag: "GNN", col: "#b05090", ti: "Spatial Propagation", su: "Graph Neural Networks", de: "Models inter-region disease spread using mobility graphs. Predicts contagion pathways before they appear in clinical data via message-passing GNNs.", me: [{ l: "Nodes", v: "38" }, { l: "Edges", v: "214" }, { l: "Lead time", v: "5 days" }] },
            ].map(c => (
              <div key={c.tag} className="hv" style={{ background: S2, border: `1px solid ${BO}`, borderRadius: 12, padding: "22px 20px", position: "relative", overflow: "hidden", transition: "all .25s" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,transparent,${c.col}66,transparent)` }} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                  <span style={{ fontSize: 26, color: c.col, opacity: .55 }}>{c.ic}</span>
                  <span style={{ fontSize: 9, ...M, color: c.col, letterSpacing: ".1em", textTransform: "uppercase", background: `${c.col}15`, padding: "2px 8px", borderRadius: 3 }}>{c.tag}</span>
                </div>
                <h3 style={{ ...SY, fontWeight: 700, fontSize: "1rem", marginBottom: 4, color: TX }}>{c.ti}</h3>
                <p style={{ fontSize: 10, color: MU, ...M, marginBottom: 10 }}>{c.su}</p>
                <p style={{ fontSize: 12, color: MU, lineHeight: 1.65, marginBottom: 16 }}>{c.de}</p>
                <div style={{ display: "flex", gap: 6 }}>
                  {c.me.map(mm => (
                    <div key={mm.l} style={{ flex: 1, background: `${c.col}10`, border: `1px solid ${c.col}25`, borderRadius: 6, padding: "8px", textAlign: "center" }}>
                      <div style={{ fontSize: 12, ...M, fontWeight: 700, color: c.col, lineHeight: 1, marginBottom: 3 }}>{mm.v}</div>
                      <div style={{ fontSize: 9, color: MU }}>{mm.l}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 10 }}>
            {[{ v: "147M+", l: "Data Points/Day" }, { v: "94%", l: "Accuracy" }, { v: "72h", l: "Lead Time" }, { v: "38", l: "Regions" }, { v: "3.2B", l: "Posts Parsed" }, { v: "99.1%", l: "Uptime" }].map(d => (
              <div key={d.l} className="hv" style={{ background: S2, border: `1px solid ${BO}`, borderRadius: 10, padding: "16px 12px", textAlign: "center", transition: "all .25s" }}>
                <div style={{ fontSize: "1.45rem", ...M, fontWeight: 700, color: AC, lineHeight: 1, marginBottom: 5 }}>{d.v}</div>
                <div style={{ fontSize: 10, color: MU }}>{d.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY */}
      <section style={{ background: S2, padding: "64px clamp(14px,4vw,56px)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 44 }}>
            <Lbl t="Why EpiSense AI" center />
            <h2 style={{ fontSize: "clamp(1.6rem,2.6vw,2.4rem)", ...SY, fontWeight: 800, color: TX, letterSpacing: "-.5px", lineHeight: 1.2, marginBottom: 14 }}>
              The Surveillance Gap <span style={{ color: AC }}>We're Closing</span>
            </h2>
            <p style={{ fontSize: 15, color: MU, maxWidth: 560, margin: "0 auto", lineHeight: 1.76 }}>
              Traditional surveillance relies on hospitals reporting confirmed cases — by then the outbreak has already begun. EpiSense AI detects the signal before the symptom becomes a statistic.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
            {[
              { ic: "⚡", ti: "72-Hour Head Start", de: "Our models detect outbreak patterns 3 full days before clinical reporting systems — giving agencies real time to act." },
              { ic: "🌐", ti: "Cross-Border Intelligence", de: "GNN models track how risk propagates between regions using real mobility and geographic proximity data." },
              { ic: "🔬", ti: "Multi-Source Fusion", de: "We fuse pharmacy signals, web queries, and social posts through a unified feature fusion layer for maximum accuracy." },
              { ic: "🗣️", ti: "47-Language Coverage", de: "BERT models process symptom language in 47 languages, capturing signals from regions where English data is sparse." },
              { ic: "📡", ti: "Continuous Learning", de: "Models retrain nightly on clinical ground-truth from 280+ partner hospitals, keeping accuracy above 94%." },
              { ic: "🏛️", ti: "WHO-Aligned Protocols", de: "All surveillance protocols and reporting thresholds aligned with WHO International Health Regulations IHR 2005." },
            ].map(f => (
              <div key={f.ti} className="lft" style={{ background: S1, border: `1px solid ${BO}`, borderRadius: 12, padding: "26px 22px" }}>
                <div style={{ fontSize: 28, marginBottom: 14 }}>{f.ic}</div>
                <h3 style={{ ...SY, fontWeight: 700, fontSize: "1rem", color: TX, marginBottom: 9 }}>{f.ti}</h3>
                <p style={{ fontSize: 13, color: MU, lineHeight: 1.68 }}>{f.de}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: S1, padding: "56px clamp(14px,4vw,56px)" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
          <Lbl t="Get Early Access" center />
          <h2 style={{ fontSize: "clamp(1.5rem,2.5vw,2.2rem)", ...SY, fontWeight: 800, color: TX, letterSpacing: "-.5px", marginBottom: 14 }}>
            Stop the Outbreak <span style={{ color: AC }}>Before It Starts</span>
          </h2>
          <p style={{ fontSize: 15, color: MU, maxWidth: 500, margin: "0 auto 28px", lineHeight: 1.75 }}>
            Join health agencies, WHO partners, and research institutions using EpiSense AI to stay ahead of emerging disease threats.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/dashboard" style={{ padding: "14px 32px", background: AC, color: "#fff", fontSize: 13, ...M, fontWeight: 700, borderRadius: 6, textDecoration: "none", boxShadow: "0 4px 18px rgba(124,92,191,.35)", transition: "background .2s" }}
              onMouseEnter={e => e.currentTarget.style.background = "#9b7dd4"} onMouseLeave={e => e.currentTarget.style.background = AC}>
              Open Live Dashboard
            </Link>
            <Link to="/about" style={{ padding: "14px 32px", background: "transparent", color: AC, fontSize: 13, ...M, border: `1.5px solid rgba(124,92,191,.32)`, borderRadius: 6, textDecoration: "none", transition: "background .2s" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(124,92,191,.07)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              About the Team ↗
            </Link>
          </div>
        </div>
      </section>
    </Pg>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MODEL PAGE
// ══════════════════════════════════════════════════════════════════════════════
export function ModelPage() {
  const [act, setAct] = useState(0);
  const LYR = [
    { ic: "◈", tag: "Layer 1 — NLP", col: AC, ti: "Language Intelligence", su: "BERT-Powered Text Analysis", de: "The first layer ingests millions of web search queries and social media posts daily across 47 languages. Fine-tuned BERT models extract structured symptom signals — turning phrases like 'body ache and fever' into actionable epidemiological data.", steps: ["Raw text ingestion from 200+ sources", "Multilingual BERT tokenisation", "Symptom entity extraction & ICD-10 mapping", "Confidence scoring + noise filtering", "Structured signal → Feature Fusion layer"], me: [{ l: "Languages", v: "47" }, { l: "Posts/day", v: "3.2B" }, { l: "Keywords", v: "8,400" }, { l: "NLP accuracy", v: "92%" }, { l: "Ingestion lag", v: "< 4 min" }, { l: "Sources", v: "200+" }] },
    { ic: "◉", tag: "Layer 2 — LSTM", col: "#3b82c4", ti: "Temporal Forecasting", su: "Bidirectional LSTM Networks", de: "The second layer learns rolling 30-day time-series of fused symptom signals per region. Stacked bidirectional LSTM with attention identifies outbreak-indicative trends and generates risk forecasts up to 72 hours ahead.", steps: ["30-day rolling symptom time-series", "Normalisation + anomaly clipping", "Bidirectional LSTM (3 layers, 256 units)", "Attention mechanism for peak detection", "Risk score → GNN Propagation layer"], me: [{ l: "Forecast", v: "72h" }, { l: "Seq length", v: "30d" }, { l: "LSTM layers", v: "3" }, { l: "Hidden units", v: "256" }, { l: "RMSE", v: "0.041" }, { l: "Retrain", v: "Nightly" }] },
    { ic: "◬", tag: "Layer 3 — GNN", col: "#b05090", ti: "Spatial Propagation", su: "Graph Attention Networks", de: "The third layer models disease propagation between regions via a daily-updated mobility graph. A 3-layer Graph Attention Network performs message-passing to predict outbreak spread — often 5 days before clinical confirmation.", steps: ["Daily region mobility graph construction", "Node features: LSTM risk scores + demographics", "Edge weights: flight + road + migration", "3-layer Graph Attention Network (GAT)", "Outbreak probability per region pair output"], me: [{ l: "Nodes", v: "38" }, { l: "Edges", v: "214" }, { l: "GAT layers", v: "3" }, { l: "Edge updates", v: "Daily" }, { l: "Spatial lead", v: "5 days" }, { l: "Cross-region acc.", v: "89%" }] },
  ];
  const L = LYR[act];
  return (
    <Pg>
      <section style={{ position: "relative", padding: "110px clamp(14px,4vw,56px) 70px", background: S2, overflow: "hidden" }}>
        <Particles />
        <div style={{ maxWidth: 860, margin: "0 auto", textAlign: "center", position: "relative", animation: "fadeUp .7s ease both" }}>
          <Lbl t="Model Architecture" center />
          <h1 style={{ fontSize: "clamp(1.9rem,3.5vw,3rem)", ...SY, fontWeight: 800, color: TX, lineHeight: 1.15, letterSpacing: "-1px", marginBottom: 18 }}>Three AI Layers.<br /><span style={{ color: AC }}>One Unified Outbreak Score.</span></h1>
          <p style={{ fontSize: "clamp(14px,1.4vw,16px)", color: MU, lineHeight: 1.8, maxWidth: 640, margin: "0 auto" }}>EpiSense AI combines NLP, temporal sequence modelling, and spatial graph networks into a single end-to-end pipeline that turns raw global noise into precise outbreak predictions.</p>
        </div>
      </section>
      <section style={{ background: S1, padding: "56px clamp(14px,4vw,56px)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Lbl t="End-to-End Pipeline" center />
          <div style={{ display: "flex", alignItems: "center", overflowX: "auto", padding: "8px 0 28px", justifyContent: "center", flexWrap: "wrap", rowGap: 8 }}>
            {["Pharmacy", "Web Searches", "Social Posts", "BERT NLP", "Feature Fusion", "LSTM Trends", "GNN Spread", "Outbreak Score"].map((s, i, a) => (
              <span key={s} style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
                <span style={{ fontSize: 12, ...M, color: AC, background: "rgba(124,92,191,.1)", border: `1px solid rgba(124,92,191,.18)`, padding: "8px 14px", borderRadius: 6, whiteSpace: "nowrap" }}>{s}</span>
                {i < a.length - 1 && <span style={{ color: "rgba(124,92,191,.4)", fontSize: 16, padding: "0 3px" }}>→</span>}
              </span>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
            {LYR.map((l, i) => <button key={i} onClick={() => setAct(i)} style={{ padding: "10px 20px", border: `1px solid ${act === i ? l.col : BO}`, borderRadius: 7, background: act === i ? `${l.col}12` : "transparent", color: act === i ? l.col : MU, fontSize: 11, ...M, cursor: "pointer", transition: "all .2s" }}><span style={{ marginRight: 6 }}>{l.ic}</span>{l.tag}</button>)}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, animation: "fadeUp .3s ease both" }} key={act}>
            <div style={{ background: S2, border: `1px solid ${L.col}30`, borderRadius: 12, padding: "28px 26px", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,transparent,${L.col},transparent)` }} />
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <span style={{ fontSize: 32, color: L.col, opacity: .6 }}>{L.ic}</span>
                <div><div style={{ fontSize: 9, ...M, color: L.col, letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 2 }}>{L.tag}</div><h3 style={{ ...SY, fontWeight: 700, fontSize: "1.15rem", color: TX }}>{L.ti}</h3><p style={{ fontSize: 10, color: MU, ...M }}>{L.su}</p></div>
              </div>
              <p style={{ fontSize: 13, color: MU, lineHeight: 1.72, marginBottom: 20 }}>{L.de}</p>
              <div style={{ borderTop: `1px solid ${BO}`, paddingTop: 16 }}>
                <div style={{ fontSize: 9, ...M, color: MU, letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 10 }}>Processing Steps</div>
                {L.steps.map((s, i) => <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 8 }}><div style={{ width: 18, height: 18, borderRadius: "50%", background: `${L.col}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, ...M, color: L.col, flexShrink: 0, fontWeight: 700, marginTop: 1 }}>{i + 1}</div><span style={{ fontSize: 12, color: MU, lineHeight: 1.5 }}>{s}</span></div>)}
              </div>
            </div>
            <div style={{ background: S2, border: `1px solid ${BO}`, borderRadius: 12, padding: "28px 26px" }}>
              <div style={{ fontSize: 9, ...M, color: MU, letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 16 }}>Layer Performance Metrics</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {L.me.map(mm => <div key={mm.l} style={{ background: S1, border: `1px solid ${BO}`, borderRadius: 8, padding: "14px 12px" }}><div style={{ fontSize: "1.15rem", ...M, fontWeight: 700, color: L.col, lineHeight: 1, marginBottom: 5 }}>{mm.v}</div><div style={{ fontSize: 10, color: MU }}>{mm.l}</div></div>)}
              </div>
            </div>
          </div>
        </div>
      </section>
      <section style={{ background: S2, padding: "56px clamp(14px,4vw,56px)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Lbl t="Model Confidence" center />
          <h2 style={{ fontSize: "clamp(1.3rem,2vw,1.8rem)", ...SY, fontWeight: 800, color: TX, textAlign: "center", marginBottom: 36 }}>Validated Against <span style={{ color: AC }}>Historical Outbreaks</span></h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
            {[{ l: "Outbreak Detection", v: 94, de: "Validated against WHO outbreak registry 2019–2024" }, { l: "Spread Pathway", v: 88, de: "Cross-validated with mobility + clinical ground truth" }, { l: "Region Accuracy", v: 91, de: "Precision of per-region risk score at 48h horizon" }, { l: "Data Coverage", v: 97, de: "Fraction of regions with active live data feeds" }].map(mm => (
              <div key={mm.l} className="lft" style={{ background: S1, border: `1px solid ${BO}`, borderRadius: 12, padding: "22px 18px" }}>
                <div style={{ fontSize: "2rem", ...M, fontWeight: 700, color: AC, lineHeight: 1, marginBottom: 8 }}>{mm.v}%</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: TX, marginBottom: 6 }}>{mm.l}</div>
                <div style={{ height: 4, background: "rgba(124,92,191,.1)", borderRadius: 2, marginBottom: 8 }}><div style={{ height: "100%", width: `${mm.v}%`, background: `linear-gradient(90deg,#9b7dd4,${AC})`, borderRadius: 2 }} /></div>
                <p style={{ fontSize: 11, color: MU, lineHeight: 1.5 }}>{mm.de}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Pg>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// DATA PAGE
// ══════════════════════════════════════════════════════════════════════════════
export function DataPage() {
  const SRC = [
    { ic: "💊", col: AC, ti: "Pharmacy Surveillance", vo: "42.3M signals/day", ch: "+8.2%", pct: 40, de: "Aggregated OTC medication purchase patterns from 14,200+ pharmacy networks. Spikes in fever reducers, antivirals, and rehydration products signal outbreak onset 4+ days before clinical reporting.", me: [{ l: "Pharmacies", v: "14,200+" }, { l: "Drug categories", v: "38" }, { l: "Lag vs clinical", v: "-4.2 days" }, { l: "Update cadence", v: "Every 6h" }] },
    { ic: "🔍", col: "#3b82c4", ti: "Web Search Intelligence", vo: "68.1M queries/day", ch: "+14.7%", pct: 65, de: "Real-time analysis of anonymised health-related search queries across 190 countries. Uses a proprietary keyword taxonomy of 8,400 symptom terms mapped to ICD-10 disease codes.", me: [{ l: "Countries", v: "190" }, { l: "Symptom terms", v: "8,400" }, { l: "ICD-10 codes", v: "312" }, { l: "Update cadence", v: "Hourly" }] },
    { ic: "📱", col: "#b05090", ti: "Social Media Signals", vo: "36.6M posts/day", ch: "+5.9%", pct: 35, de: "NLP-processed posts from 12 platforms across 47 languages. Detects symptom mentions, healthcare-seeking behaviour, and disease cluster discussions using BERT classification.", me: [{ l: "Platforms", v: "12" }, { l: "Languages", v: "47" }, { l: "Sentiment tags", v: "7" }, { l: "Update cadence", v: "Real-time" }] },
    { ic: "🏥", col: "#2a9e5a", ti: "Clinical Partnerships", vo: "1.8M records/week", ch: "+3.1%", pct: 18, de: "Anonymised syndromic surveillance records from 280 partner hospitals and 3 WHO regional offices — ground-truth labels for model training and real-time calibration.", me: [{ l: "Partner hospitals", v: "280" }, { l: "WHO offices", v: "3" }, { l: "Data latency", v: "< 6h" }, { l: "Records/week", v: "1.8M" }] },
  ];
  return (
    <Pg>
      <section style={{ position: "relative", padding: "110px clamp(14px,4vw,56px) 70px", background: S2, overflow: "hidden" }}>
        <Particles />
        <div style={{ maxWidth: 860, margin: "0 auto", textAlign: "center", position: "relative", animation: "fadeUp .7s ease both" }}>
          <Lbl t="Data Intelligence" center />
          <h1 style={{ fontSize: "clamp(1.9rem,3.5vw,3rem)", ...SY, fontWeight: 800, color: TX, lineHeight: 1.15, letterSpacing: "-1px", marginBottom: 18 }}>147M+ Data Points.<br /><span style={{ color: AC }}>Every Single Day.</span></h1>
          <p style={{ fontSize: "clamp(14px,1.4vw,16px)", color: MU, lineHeight: 1.8, maxWidth: 620, margin: "0 auto" }}>Four complementary data streams fused into a single outbreak risk score — faster, broader, and more accurate than any single source.</p>
        </div>
      </section>
      <section style={{ background: S1, padding: "56px clamp(14px,4vw,56px)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 44 }}>
            {SRC.map(s => (
              <div key={s.ti} className="lft" style={{ background: S2, border: `1px solid ${BO}`, borderRadius: 12, padding: "22px 18px", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: s.col }} />
                <div style={{ fontSize: 22, marginBottom: 10 }}>{s.ic}</div>
                <div style={{ fontSize: "1.35rem", ...M, fontWeight: 700, color: s.col, lineHeight: 1, marginBottom: 4 }}>{s.vo}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: TX, marginBottom: 4 }}>{s.ti}</div>
                <div style={{ fontSize: 11, ...M, color: "#2a9e5a", marginBottom: 8 }}>{s.ch} this week</div>
                <div style={{ height: 3, background: "rgba(124,92,191,.1)", borderRadius: 2 }}><div style={{ height: "100%", width: `${s.pct}%`, background: s.col, borderRadius: 2, opacity: .7 }} /></div>
              </div>
            ))}
          </div>
          {SRC.map((s, i) => (
            <div key={s.ti} style={{ background: S2, border: `1px solid ${BO}`, borderRadius: 12, padding: "28px 26px", display: "grid", gridTemplateColumns: "1fr 300px", gap: 24, marginBottom: 14, animation: `slideUp .4s ${i * .07}s ease both` }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: `${s.col}15`, border: `1px solid ${s.col}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{s.ic}</div>
                  <div><h3 style={{ ...SY, fontWeight: 700, fontSize: "1rem", color: TX, marginBottom: 2 }}>{s.ti}</h3><span style={{ fontSize: 12, ...M, fontWeight: 700, color: s.col }}>{s.vo}</span> <span style={{ fontSize: 11, ...M, color: "#2a9e5a" }}>{s.ch}</span></div>
                </div>
                <p style={{ fontSize: 13, color: MU, lineHeight: 1.72 }}>{s.de}</p>
              </div>
              <div>
                <div style={{ fontSize: 9, ...M, color: MU, letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 12 }}>Source Metrics</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {s.me.map(mm => <div key={mm.l} style={{ background: S1, border: `1px solid ${BO}`, borderRadius: 7, padding: "10px" }}><div style={{ fontSize: "1rem", ...M, fontWeight: 700, color: s.col, lineHeight: 1, marginBottom: 4 }}>{mm.v}</div><div style={{ fontSize: 10, color: MU }}>{mm.l}</div></div>)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section style={{ background: S2, padding: "56px clamp(14px,4vw,56px)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Lbl t="Privacy & Ethics" center />
          <h2 style={{ fontSize: "clamp(1.3rem,2vw,1.8rem)", ...SY, fontWeight: 800, color: TX, textAlign: "center", marginBottom: 36 }}>Powerful Surveillance. <span style={{ color: AC }}>Zero Individual Tracking.</span></h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
            {[{ ic: "🔒", ti: "Fully Anonymised", de: "No individual user is tracked. All data is processed in aggregate form only — no PII is ever stored." }, { ic: "🏛️", ti: "WHO IHR-Aligned", de: "All data collection and reporting protocols comply with WHO IHR 2005 and GDPR." }, { ic: "🧬", ti: "Clinical Validation", de: "Outputs validated against de-identified clinical records from 280 partner hospitals." }].map(f => (
              <div key={f.ti} className="lft" style={{ background: S1, border: `1px solid ${BO}`, borderRadius: 12, padding: "26px 22px" }}>
                <div style={{ fontSize: 26, marginBottom: 12 }}>{f.ic}</div>
                <h3 style={{ ...SY, fontWeight: 700, fontSize: "1rem", color: TX, marginBottom: 9 }}>{f.ti}</h3>
                <p style={{ fontSize: 13, color: MU, lineHeight: 1.68 }}>{f.de}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Pg>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// REGIONS PAGE
// ══════════════════════════════════════════════════════════════════════════════
export function RegionsPage() {
  const [sel, setSel] = useState(null);
  const RG = [
    { id: 1, n: "North India", ri: "HIGH", sc: 82, dl: "+6", di: "Dengue Fever", po: "420M", ho: 1840, al: "Active outbreak in 3 sub-zones; Aedes index 3.8× baseline" },
    { id: 2, n: "East India", ri: "HIGH", sc: 76, dl: "+11", di: "Malaria", po: "230M", ho: 980, al: "Post-monsoon Anopheles surge; P.falciparum strain detected" },
    { id: 3, n: "West India", ri: "HIGH", sc: 71, dl: "+4", di: "Leptospirosis", po: "180M", ho: 1120, al: "Monsoon floodwater contamination; urban slum clusters at risk" },
    { id: 4, n: "Central India", ri: "MED", sc: 54, dl: "+3", di: "Influenza", po: "150M", ho: 640, al: "Seasonal elevation — 18% above 5-year average; monitor closely" },
    { id: 5, n: "South India", ri: "MED", sc: 47, dl: "-2", di: "Typhoid", po: "260M", ho: 1560, al: "Declining trend — remains elevated; pipeline contamination reported" },
    { id: 6, n: "Northeast India", ri: "LOW", sc: 31, dl: "+1", di: "Japanese Encephalitis", po: "45M", ho: 180, al: "Within seasonal norm; vaccination drive ongoing" },
  ];
  const RC = r => r === "HIGH" ? "#e53e3e" : r === "MED" ? "#d97706" : AC;
  return (
    <Pg>
      <section style={{ position: "relative", padding: "110px clamp(14px,4vw,56px) 60px", background: S2, overflow: "hidden" }}>
        <Particles />
        <div style={{ maxWidth: 860, margin: "0 auto", textAlign: "center", position: "relative", animation: "fadeUp .7s ease both" }}>
          <Lbl t="Regional Surveillance" center />
          <h1 style={{ fontSize: "clamp(1.9rem,3.5vw,3rem)", ...SY, fontWeight: 800, color: TX, lineHeight: 1.15, letterSpacing: "-1px", marginBottom: 18 }}>38 Regions. <span style={{ color: AC }}>Real-Time Risk.</span></h1>
          <p style={{ fontSize: "clamp(14px,1.4vw,16px)", color: MU, lineHeight: 1.8, maxWidth: 620, margin: "0 auto" }}>Every monitored region gets a continuously updated outbreak risk score, 7-day forecast, and disease-specific intelligence every hour.</p>
        </div>
      </section>
      <section style={{ background: S1, padding: "56px clamp(14px,4vw,56px)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 38 }}>
            {[{ v: RG.filter(r => r.ri === "HIGH").length, l: "Critical Regions", c: "#e53e3e" }, { v: RG.filter(r => r.ri === "MED").length, l: "Elevated Regions", c: "#d97706" }, { v: RG.filter(r => r.ri === "LOW").length, l: "Low-Risk Regions", c: AC }].map(s => (
              <div key={s.l} className="lft" style={{ background: S2, border: `1px solid ${BO}`, borderRadius: 10, padding: "20px 18px", textAlign: "center" }}>
                <div style={{ fontSize: "2.2rem", ...M, fontWeight: 700, color: s.c, lineHeight: 1, marginBottom: 6 }}>{s.v}</div>
                <div style={{ fontSize: 12, color: MU }}>{s.l}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {RG.map((r, i) => {
              const op = sel === r.id; const co = RC(r.ri);
              return (
                <div key={r.id} style={{ background: S2, border: `1px solid ${op ? co + "44" : BO}`, borderRadius: 12, overflow: "hidden", transition: "border-color .22s", animation: `slideUp .4s ${i * .06}s ease both` }}>
                  <div onClick={() => setSel(op ? null : r.id)} style={{ padding: "18px 22px", cursor: "pointer", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: co, flexShrink: 0, boxShadow: r.ri === "HIGH" ? `0 0 8px ${co}80` : "none", animation: r.ri === "HIGH" ? "pulse 2s infinite" : "none" }} />
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 3 }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: TX }}>{r.n}</span>
                        <span style={{ fontSize: 9, ...M, color: co, background: `${co}14`, border: `1px solid ${co}30`, padding: "2px 7px", borderRadius: 3, letterSpacing: ".1em" }}>{r.ri}</span>
                        <span style={{ fontSize: 11, color: MU }}>{r.di}</span>
                      </div>
                      <p style={{ fontSize: 11, color: MU, lineHeight: 1.4 }}>{r.al}</p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 16, flexShrink: 0 }}>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: "1.5rem", ...M, fontWeight: 700, color: co, lineHeight: 1 }}>{r.sc}%</div>
                        <div style={{ fontSize: 10, ...M, color: r.dl.startsWith("+") ? "#e53e3e" : "#2a9e5a" }}>{r.dl} this week</div>
                      </div>
                      <span style={{ fontSize: 18, color: MU, transition: "transform .2s", transform: op ? "rotate(180deg)" : "rotate(0)", display: "inline-block" }}>↓</span>
                    </div>
                  </div>
                  <div style={{ height: 3, background: "rgba(124,92,191,.07)", margin: "0 22px" }}><div style={{ height: "100%", width: `${r.sc}%`, background: co, borderRadius: 2, opacity: .65 }} /></div>
                  {op && (
                    <div style={{ padding: "22px", borderTop: `1px solid ${BO}`, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, animation: "fadeUp .25s ease both" }}>
                      <div style={{ background: S1, border: `1px solid ${BO}`, borderRadius: 8, padding: "14px" }}>
                        <div style={{ fontSize: 9, ...M, color: MU, letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 10 }}>Region Details</div>
                        {[["Population", r.po], ["Hospitals", r.ho], ["Primary Disease", r.di], ["Risk Score", `${r.sc}%`]].map(([l, v]) => (
                          <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: `1px solid rgba(124,92,191,.06)` }}>
                            <span style={{ fontSize: 11, color: MU }}>{l}</span><span style={{ fontSize: 11, ...M, fontWeight: 700, color: TX }}>{v}</span>
                          </div>
                        ))}
                      </div>
                      <div style={{ background: S1, border: `1px solid ${BO}`, borderRadius: 8, padding: "14px" }}>
                        <div style={{ fontSize: 9, ...M, color: MU, letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 10 }}>7-Day Risk Forecast</div>
                        <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 72 }}>
                          {Array.from({ length: 7 }, (_, j) => Math.min(99, Math.max(10, r.sc + (Math.random() - .4) * 10 + j * (r.ri === "HIGH" ? 1.5 : r.ri === "MED" ? 0 : -1)))).map((v, j) => (
                            <div key={j} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                              <div style={{ width: "100%", height: `${(v / 100) * 64}px`, background: co, borderRadius: "2px 2px 0 0", opacity: .6 }} />
                              <span style={{ fontSize: 7, ...M, color: MU }}>D{j}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div style={{ background: S1, border: `1px solid ${BO}`, borderRadius: 8, padding: "14px" }}>
                        <div style={{ fontSize: 9, ...M, color: MU, letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 10 }}>Recommended Actions</div>
                        {(r.ri === "HIGH" ? ["Issue public health advisory", "Deploy mobile response teams", "Activate emergency supply chain", "Escalate to IDSP"] : r.ri === "MED" ? ["Increase surveillance frequency", "Prepare response teams on standby", "Notify district health officers"] : ["Maintain standard surveillance", "Continue routine vaccination", "Monthly reporting sufficient"]).map((a, ai) => (
                          <div key={ai} style={{ display: "flex", gap: 7, marginBottom: 7, alignItems: "flex-start" }}>
                            <div style={{ width: 5, height: 5, borderRadius: "50%", background: co, flexShrink: 0, marginTop: 5 }} />
                            <span style={{ fontSize: 11, color: MU, lineHeight: 1.5 }}>{a}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </Pg>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ABOUT PAGE
// ══════════════════════════════════════════════════════════════════════════════
export function AboutPage() {
  const TM = [{ n: "Dr. Arjun Mehta", r: "Chief Epidemiologist", b: "Former WHO consultant. 18 years tracking outbreak patterns across 40+ countries.", in: "AM", c: AC }, { n: "Priya Nair", r: "Lead ML Engineer", b: "Specialist in LSTM-GNN architectures for time-series biomedical forecasting.", in: "PN", c: "#3b82c4" }, { n: "Dr. Samuel Okonkwo", r: "Global Health Director", b: "Leads partnerships with health ministries across Sub-Saharan Africa and Southeast Asia.", in: "SO", c: "#b05090" }, { n: "Elena Vasquez", r: "NLP Research Scientist", b: "Built the BERT-based multilingual symptom extraction pipeline covering 47 languages.", in: "EV", c: "#2a9e5a" }];
  const ML = [{ y: "2021", e: "EpiSense AI founded by epidemiologists and ML researchers in the wake of COVID-19" }, { y: "2022", e: "First 72-hour dengue outbreak prediction in Mumbai validated at 94% accuracy" }, { y: "2023", e: "WHO partnership signed; expanded to 38 regions across 6 continents" }, { y: "2024", e: "GNN spatial model launched; predicted Mpox spread pathways 5 days before clinical confirmation" }, { y: "2025", e: "147M+ daily data points processed; named Top 10 Global Health AI by WHO" }];
  return (
    <Pg>
      <section style={{ position: "relative", padding: "110px clamp(14px,4vw,56px) 70px", background: S2, overflow: "hidden" }}>
        <Particles />
        <div style={{ maxWidth: 860, margin: "0 auto", textAlign: "center", position: "relative", animation: "fadeUp .7s ease both" }}>
          <Lbl t="Our Mission" center />
          <h1 style={{ fontSize: "clamp(1.9rem,3.8vw,3.2rem)", ...SY, fontWeight: 800, color: TX, lineHeight: 1.12, letterSpacing: "-1.5px", marginBottom: 20 }}>We Built EpiSense AI to<br /><span style={{ color: AC }}>End Reactive Epidemiology</span></h1>
          <p style={{ fontSize: "clamp(14px,1.5vw,16px)", color: MU, lineHeight: 1.82, maxWidth: 680, margin: "0 auto" }}>Born in the aftermath of COVID-19 — when the world watched a virus spread unchecked for weeks before any system responded — EpiSense AI exists to ensure that never happens again.</p>
        </div>
      </section>
      <section style={{ background: S1, padding: "56px clamp(14px,4vw,56px)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 50 }}>
            {[{ v: "2021", l: "Founded" }, { v: "38", l: "Regions Covered" }, { v: "280+", l: "Hospital Partners" }, { v: "94%", l: "Prediction Accuracy" }].map((s, i) => (
              <div key={s.l} className="lft" style={{ background: S2, border: `1px solid ${BO}`, borderRadius: 12, padding: "24px 20px", textAlign: "center", animation: `slideUp .4s ${i * .07}s ease both` }}>
                <div style={{ fontSize: "2.2rem", ...M, fontWeight: 700, color: AC, lineHeight: 1, marginBottom: 6 }}>{s.v}</div>
                <div style={{ fontSize: 12, color: MU }}>{s.l}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 50 }}>
            <div style={{ background: S2, border: `1px solid ${BO}`, borderRadius: 12, padding: "32px 28px" }}>
              <Lbl t="The Problem We Solve" />
              <h3 style={{ ...SY, fontWeight: 800, fontSize: "1.2rem", color: TX, marginBottom: 14, lineHeight: 1.3 }}>Traditional Surveillance is Too Slow</h3>
              <p style={{ fontSize: 13, color: MU, lineHeight: 1.75, marginBottom: 14 }}>The standard pipeline takes <strong style={{ color: TX }}>7–14 days</strong> — by which time an outbreak may already be community-wide.</p>
              <p style={{ fontSize: 13, color: MU, lineHeight: 1.75 }}>EpiSense AI cuts that lag to <strong style={{ color: AC }}>under 72 hours</strong> by reading the signals people emit before they ever see a doctor.</p>
            </div>
            <div style={{ background: S2, border: `1px solid ${BO}`, borderRadius: 12, padding: "32px 28px" }}>
              <Lbl t="Our Approach" />
              <h3 style={{ ...SY, fontWeight: 800, fontSize: "1.2rem", color: TX, marginBottom: 14, lineHeight: 1.3 }}>Signal Before Symptom. Forecast Before Crisis.</h3>
              <p style={{ fontSize: 13, color: MU, lineHeight: 1.75, marginBottom: 14 }}>No single data source is sufficient. Our three-layer AI fuses pharmacy, web, and social signals into a single calibrated outbreak score.</p>
              <p style={{ fontSize: 13, color: MU, lineHeight: 1.75 }}>BERT NLP → LSTM forecasting → GNN propagation — each layer weighted by historical reliability per region.</p>
            </div>
          </div>
          <Lbl t="The Team" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 50 }}>
            {TM.map((t, i) => (
              <div key={t.n} className="lft" style={{ background: S2, border: `1px solid ${BO}`, borderRadius: 12, padding: "24px 20px", animation: `slideUp .4s ${i * .07}s ease both` }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: `${t.c}18`, border: `1px solid ${t.c}30`, display: "flex", alignItems: "center", justifyContent: "center", ...M, fontWeight: 700, fontSize: 14, color: t.c, marginBottom: 14 }}>{t.in}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: TX, marginBottom: 3 }}>{t.n}</div>
                <div style={{ fontSize: 10, ...M, color: t.c, letterSpacing: ".04em", marginBottom: 10 }}>{t.r}</div>
                <p style={{ fontSize: 12, color: MU, lineHeight: 1.6 }}>{t.b}</p>
              </div>
            ))}
          </div>
          <Lbl t="Timeline" />
          <div style={{ position: "relative", paddingLeft: 24 }}>
            <div style={{ position: "absolute", left: 6, top: 4, bottom: 4, width: 2, background: `linear-gradient(180deg,${AC},transparent)`, borderRadius: 2 }} />
            {ML.map((m, i) => (
              <div key={m.y} style={{ position: "relative", marginBottom: 22, animation: `slideL .4s ${i * .08}s ease both` }}>
                <div style={{ position: "absolute", left: -21, top: 4, width: 10, height: 10, borderRadius: "50%", background: AC, border: "2px solid #f4f0ff" }} />
                <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 12, ...M, fontWeight: 700, color: AC, flexShrink: 0 }}>{m.y}</span>
                  <p style={{ fontSize: 13, color: MU, lineHeight: 1.6 }}>{m.e}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section style={{ background: S2, padding: "56px clamp(14px,4vw,56px)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", textAlign: "center" }}>
          <Lbl t="Partnerships & Recognition" center />
          <h2 style={{ fontSize: "clamp(1.3rem,2vw,1.8rem)", ...SY, fontWeight: 800, color: TX, marginBottom: 32 }}>Trusted by <span style={{ color: AC }}>Global Health Institutions</span></h2>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            {["WHO Partner", "ICMR Affiliated", "IDSP Integration", "280+ Hospital Network", "Top 10 Global Health AI 2025", "IHR-2005 Compliant"].map(b => (
              <span key={b} style={{ padding: "9px 18px", background: S1, border: `1px solid ${BO}`, borderRadius: 20, fontSize: 12, ...M, color: AC, letterSpacing: ".04em" }}>{b}</span>
            ))}
          </div>
        </div>
      </section>
    </Pg>
  );
}
