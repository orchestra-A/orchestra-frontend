import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

/* ─────────────────────────────────────────────────────────────
   All CSS is scoped inside .orch-landing so it NEVER leaks
   into the existing app's styles. The landing page keeps its
   own cursor, fonts, and colour tokens inside this wrapper.
───────────────────────────────────────────────────────────── */
const LANDING_CSS = `
/* ── IMPORT FONTS ── */
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,600&family=Lato:wght@300;400;700&display=swap');

.orch-landing *,.orch-landing *::before,.orch-landing *::after{box-sizing:border-box;margin:0;padding:0;}

.orch-landing{
  --ol-bg-main:#f5f2ed;
  --ol-bg-card:#ffffff;
  --ol-bg-light:#eef5eb;
  --ol-bg-feat:#f9f7f3;
  --ol-green-primary:#5a7a4e;
  --ol-green-btn:#6b8f5e;
  --ol-green-icon:#7aaa6a;
  --ol-green-icon-bg:#dff0d8;
  --ol-green-link:#6b8f5e;
  --ol-text-dark:#1c1c1a;
  --ol-text-body:#4a4a45;
  --ol-text-muted:#8a8a82;
  --ol-border:#e2ddd6;
  --ol-border-light:#eae6df;
  --ol-border-card:#e8e4dc;
  --ol-shadow-soft:0 2px 12px rgba(0,0,0,0.07);
  --ol-shadow-card:0 1px 4px rgba(0,0,0,0.06),0 4px 16px rgba(0,0,0,0.04);
  --ol-radius:12px;
  --ol-radius-lg:18px;
  --ol-font-display:'Playfair Display',Georgia,serif;
  --ol-font-body:'Lato',sans-serif;
  font-size:16px;
  line-height:1.65;
  background:var(--ol-bg-main);
  color:var(--ol-text-dark);
  font-family:var(--ol-font-body);
  overflow-x:hidden;
}

/* ── CURSOR ── */
.orch-landing{cursor:none;}
.ol-cur{
  position:fixed;width:10px;height:10px;
  background:var(--ol-green-primary);border-radius:50%;
  pointer-events:none;z-index:9999;
  transform:translate(-50%,-50%);
  transition:width .15s,height .15s,background .2s;
  mix-blend-mode:multiply;
}
.ol-cur-ring{
  position:fixed;width:36px;height:36px;
  border:1.5px solid rgba(90,122,78,0.35);border-radius:50%;
  pointer-events:none;z-index:9998;
  transform:translate(-50%,-50%);
  transition:transform .12s ease;
}
.ol-cur-glow{
  position:fixed;width:400px;height:400px;
  background:radial-gradient(circle,rgba(122,170,106,0.13) 0%,transparent 68%);
  border-radius:50%;pointer-events:none;z-index:9990;
  transform:translate(-50%,-50%);
  transition:transform .2s ease;
}
.orch-landing:has(a:hover) .ol-cur,
.orch-landing:has(button:hover) .ol-cur{width:18px;height:18px;background:var(--ol-green-btn);}

/* ── NAV ── */
.ol-nav{
  position:sticky;top:0;z-index:200;
  display:flex;align-items:center;justify-content:space-between;
  padding:0 3rem;height:64px;
  background:rgba(245,242,237,0.92);
  backdrop-filter:blur(16px);
  border-bottom:1px solid var(--ol-border);
}
.ol-logo{display:flex;align-items:center;gap:10px;text-decoration:none;cursor:none;}
.ol-logo-mark{
  width:34px;height:34px;border-radius:9px;
  background:var(--ol-green-btn);
  display:flex;align-items:center;justify-content:center;
  font-family:var(--ol-font-display);font-weight:700;font-size:15px;color:#fff;
}
.ol-logo-name{
  font-family:var(--ol-font-display);font-weight:700;font-size:1.1rem;
  color:var(--ol-text-dark);letter-spacing:-0.01em;
}
.ol-nav-links{display:flex;gap:2rem;list-style:none;}
.ol-nav-links a{
  text-decoration:none;color:var(--ol-text-body);font-size:0.875rem;
  font-weight:400;transition:color .2s;cursor:none;
}
.ol-nav-links a:hover{color:var(--ol-text-dark);}
.ol-nav-cta{display:flex;gap:8px;align-items:center;}

.ol-btn-ghost{
  padding:.5rem 1.2rem;border:1px solid var(--ol-border-card);
  background:transparent;color:var(--ol-text-body);border-radius:9px;
  cursor:none;font-family:var(--ol-font-body);font-size:.875rem;font-weight:400;
  text-decoration:none;transition:all .2s;display:inline-flex;align-items:center;
}
.ol-btn-ghost:hover{background:var(--ol-bg-card);border-color:var(--ol-border);}

.ol-btn-primary{
  padding:.5rem 1.35rem;
  background:var(--ol-green-btn);color:#fff;
  border:none;border-radius:9px;cursor:none;
  font-family:var(--ol-font-body);font-size:.875rem;font-weight:700;
  text-decoration:none;transition:all .22s;
  display:inline-flex;align-items:center;gap:5px;
  box-shadow:0 1px 6px rgba(90,122,78,0.3);
}
.ol-btn-primary:hover{background:var(--ol-green-primary);transform:translateY(-1px);box-shadow:0 4px 14px rgba(90,122,78,0.35);}

/* ── HERO ── */
.ol-hero{
  min-height:88vh;display:flex;flex-direction:column;
  align-items:center;justify-content:center;
  text-align:center;padding:5rem 2rem 4rem;
  background:var(--ol-bg-main);
  position:relative;overflow:hidden;
}
.ol-hero::before{
  content:'';position:absolute;inset:0;
  background-image:radial-gradient(circle,rgba(90,122,78,0.08) 1px,transparent 1px);
  background-size:28px 28px;pointer-events:none;
}
.ol-hero-inner{position:relative;z-index:1;max-width:760px;}

.orch-landing h1{
  font-family:var(--ol-font-display);
  font-size:clamp(3rem,6.5vw,5.5rem);
  font-weight:800;line-height:1.05;
  letter-spacing:-0.025em;
  color:var(--ol-text-dark);
  margin-bottom:1.4rem;
}
.orch-landing h1 .ol-accent{color:var(--ol-green-btn);font-style:italic;}

.ol-hero-sub{
  font-size:1.1rem;color:var(--ol-text-body);
  font-weight:300;line-height:1.75;
  max-width:560px;margin:0 auto 2.5rem;
}
.ol-hero-actions{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-bottom:5rem;}
.ol-btn-lg{padding:.85rem 2rem;font-size:.975rem;border-radius:11px;}
.ol-btn-lg-ghost{padding:.85rem 2rem;font-size:.975rem;border-radius:11px;}

/* ── MOCKUP ── */
.ol-mockup-wrap{width:100%;max-width:860px;margin:0 auto;position:relative;}
.ol-mockup-shadow{
  background:var(--ol-bg-card);
  border:1px solid var(--ol-border-card);
  border-radius:18px;
  box-shadow:0 32px 80px rgba(0,0,0,0.1),0 4px 16px rgba(0,0,0,0.06);
  overflow:hidden;
}
.ol-mbar{
  background:var(--ol-bg-main);
  border-bottom:1px solid var(--ol-border);
  padding:.65rem 1.1rem;display:flex;align-items:center;gap:6px;
}
.ol-md{width:11px;height:11px;border-radius:50%;}
.ol-md.r{background:#ff5f57;} .ol-md.y{background:#ffbd2e;} .ol-md.g{background:#28c840;}
.ol-murl{
  margin-left:10px;flex:1;max-width:220px;
  background:var(--ol-bg-card);border:1px solid var(--ol-border);
  border-radius:6px;padding:2px 10px;
  font-size:.72rem;color:var(--ol-text-muted);text-align:center;
}
.ol-mbody{display:grid;grid-template-columns:180px 1fr;}
.ol-msb{background:#f9f7f2;border-right:1px solid var(--ol-border);padding:1.1rem 0;}
.ol-msb-title{
  padding:0 1rem .75rem;border-bottom:1px solid var(--ol-border);
  font-size:.68rem;font-weight:700;color:var(--ol-text-muted);
  letter-spacing:.09em;text-transform:uppercase;
}
.ol-msb-item{
  padding:.48rem 1rem;font-size:.77rem;color:var(--ol-text-muted);
  display:flex;align-items:center;gap:8px;
}
.ol-msb-item.on{
  background:#eef5eb;color:var(--ol-green-primary);
  font-weight:700;border-right:3px solid var(--ol-green-btn);
}
.ol-msb-item svg{width:13px;height:13px;flex-shrink:0;}
.ol-mmain{padding:1.4rem;}
.ol-mmtop{display:flex;align-items:center;justify-content:space-between;margin-bottom:1.1rem;}
.ol-mmtitle{font-family:var(--ol-font-display);font-size:.9rem;font-weight:700;letter-spacing:-.01em;}
.ol-pill{font-size:.67rem;padding:3px 9px;border-radius:100px;font-weight:700;}
.ol-pill-g{background:#dff0d8;color:#3d6b32;}
.ol-pill-b{background:#dbeafe;color:#1d4ed8;}
.ol-pill-y{background:#fef3c7;color:#b45309;}
.ol-pill-q{background:#f3f3f0;color:var(--ol-text-muted);}
.ol-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:1.1rem;}
.ol-sc{background:var(--ol-bg-main);border:1px solid var(--ol-border);border-radius:10px;padding:.75rem .9rem;}
.ol-sl{font-size:.65rem;color:var(--ol-text-muted);text-transform:uppercase;letter-spacing:.05em;margin-bottom:3px;}
.ol-sv{font-family:var(--ol-font-display);font-size:1.5rem;font-weight:800;letter-spacing:-.03em;}
.ol-sv.g{color:#3d6b32;} .ol-sv.b{color:#1d4ed8;} .ol-sv.y{color:#b45309;}
.ol-tl{display:flex;flex-direction:column;gap:6px;}
.ol-tr{
  display:flex;align-items:center;gap:9px;
  background:var(--ol-bg-card);border:1px solid var(--ol-border);
  border-radius:8px;padding:.52rem .8rem;font-size:.75rem;
}
.ol-tc{width:16px;height:16px;border-radius:5px;flex-shrink:0;display:flex;align-items:center;justify-content:center;}
.ol-tc.done{background:var(--ol-green-btn);}
.ol-tc.prog{background:#3b82f6;}
.ol-tc.todo{background:#f3f3f0;border:1.5px solid var(--ol-border);}
.ol-tn{flex:1;color:var(--ol-text-body);}
.ol-tn.done{text-decoration:line-through;color:var(--ol-text-muted);}
.ol-tav{width:20px;height:20px;border-radius:50%;font-size:.6rem;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;}

/* ── LOGOS BAR ── */
.ol-logos-section{
  padding:2rem 0;
  background:var(--ol-bg-light);
  border-top:1px solid var(--ol-border);
  border-bottom:1px solid var(--ol-border);
  display:flex;
  flex-direction:column;
  align-items:center;
}
.ol-logos-label{
  text-align:center;font-size:.7rem;font-weight:700;
  color:var(--ol-text-muted);letter-spacing:.12em;text-transform:uppercase;
  margin-bottom:1.25rem;
}
.ol-logos-track-wrap{
  width: 550px;
  overflow: hidden;
  position: relative;
  padding: .5rem 0;
}
.ol-logos-track-wrap::before,.ol-logos-track-wrap::after{
  content:'';position:absolute;top:0;bottom:0;width:40px;z-index:2;pointer-events:none;
}
.ol-logos-track-wrap::before{left:0;background:linear-gradient(to right,var(--ol-bg-light),transparent);}
.ol-logos-track-wrap::after{right:0;background:linear-gradient(to left,var(--ol-bg-light),transparent);}
.ol-logos-track{display:flex;width:max-content;animation:ol-scroll-logos 10s linear infinite;}
.ol-logos-track:hover{animation-play-state:paused;}
@keyframes ol-scroll-logos{from{transform:translateX(0);}to{transform:translateX(-50%);}}
.ol-logo-group{display:flex;align-items:center;gap:3rem;padding-right:3rem;}
.ol-plat{display:flex;align-items:center;gap:9px;color:var(--ol-text-muted);font-size:.875rem;font-weight:700;white-space:nowrap;}
.ol-plat-icon{width:30px;height:30px;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0;background:transparent;}

/* ── FEATURES ── */
.ol-features-section{padding:6rem 2rem;background:var(--ol-bg-feat);}
.ol-sec-head{text-align:center;margin-bottom:3.5rem;}
.ol-sec-tag{
  display:inline-block;font-size:.7rem;font-weight:700;
  color:var(--ol-green-btn);letter-spacing:.12em;text-transform:uppercase;
  margin-bottom:.75rem;
}
.orch-landing h2{
  font-family:var(--ol-font-display);
  font-size:clamp(2rem,3.8vw,2.8rem);font-weight:800;
  letter-spacing:-.03em;line-height:1.1;margin-bottom:.75rem;
  color:var(--ol-text-dark);
}
.ol-sec-desc{color:var(--ol-text-muted);font-size:.975rem;max-width:500px;margin:0 auto;font-weight:300;line-height:1.75;}
.ol-feat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1.25rem;max-width:1060px;margin:0 auto;}
.ol-feat-card{
  background:var(--ol-bg-card);border:1px solid var(--ol-border-card);border-radius:16px;
  padding:1.75rem;transition:all .25s;box-shadow:var(--ol-shadow-card);
}
.ol-feat-card:hover{transform:translateY(-3px);box-shadow:0 8px 28px rgba(0,0,0,0.09);border-color:var(--ol-border);}
.ol-feat-icon{
  width:44px;height:44px;border-radius:12px;background:var(--ol-green-icon-bg);
  display:flex;align-items:center;justify-content:center;color:var(--ol-green-primary);margin-bottom:1.1rem;
}
.ol-feat-icon svg{width:20px;height:20px;}
.ol-feat-title{font-family:var(--ol-font-display);font-size:.975rem;font-weight:700;margin-bottom:.5rem;color:var(--ol-text-dark);letter-spacing:-.01em;}
.ol-feat-desc{font-size:.86rem;color:var(--ol-text-body);line-height:1.72;font-weight:300;}

/* ── HOW IT WORKS ── */
.ol-how-section{padding:6rem 2rem;background:var(--ol-bg-light);}
.ol-container{max-width:1060px;margin:0 auto;}
.ol-how-grid{display:grid;grid-template-columns:1fr 1fr;gap:5rem;align-items:start;margin-top:3.5rem;}
.ol-steps-list{display:flex;flex-direction:column;gap:2rem;}
.ol-step-item{display:flex;gap:1.1rem;align-items:flex-start;}
.ol-step-num{
  width:34px;height:34px;border-radius:50%;flex-shrink:0;
  background:var(--ol-green-icon-bg);border:1px solid rgba(90,122,78,.25);
  display:flex;align-items:center;justify-content:center;
  font-family:var(--ol-font-display);font-size:.78rem;font-weight:800;color:var(--ol-green-primary);
}
.ol-step-text h3{font-family:var(--ol-font-display);font-size:.95rem;font-weight:700;margin-bottom:.3rem;color:var(--ol-text-dark);}
.ol-step-text p{font-size:.86rem;color:var(--ol-text-body);line-height:1.72;font-weight:300;}
.ol-blueprint-card{background:var(--ol-bg-card);border:1px solid var(--ol-border-card);border-radius:16px;overflow:hidden;box-shadow:var(--ol-shadow-card);}
.ol-bp-head{background:var(--ol-bg-feat);padding:.9rem 1.2rem;border-bottom:1px solid var(--ol-border);display:flex;justify-content:space-between;align-items:center;}
.ol-bp-title{font-family:var(--ol-font-display);font-size:.86rem;font-weight:700;}
.ol-bp-body{padding:1.1rem;}
.ol-bp-prompt{
  background:var(--ol-bg-light);border:1px solid var(--ol-border);border-radius:9px;
  padding:.75rem .9rem;font-size:.76rem;color:var(--ol-text-body);font-style:italic;margin-bottom:.9rem;line-height:1.6;
}
.ol-bp-tasks{display:flex;flex-direction:column;gap:6px;}
.ol-bp-task{display:flex;align-items:center;gap:8px;background:var(--ol-bg-main);border:1px solid var(--ol-border);border-radius:8px;padding:.48rem .75rem;font-size:.73rem;}
.ol-bp-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0;}
.ol-bp-text{flex:1;color:var(--ol-text-body);}
.ol-bp-dep{font-size:.63rem;color:var(--ol-text-muted);background:var(--ol-bg-card);padding:1px 6px;border-radius:4px;border:1px solid var(--ol-border);}

/* ── INTEGRATIONS ── */
.ol-int-section{padding:6rem 2rem;background:var(--ol-bg-feat);}
.ol-int-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1rem;max-width:1060px;margin:2.5rem auto 0;}
.ol-int-card{
  background:var(--ol-bg-card);border:1px solid var(--ol-border-card);border-radius:14px;
  padding:1.4rem;text-align:center;transition:all .22s;box-shadow:var(--ol-shadow-card);
}
.ol-int-card:hover{transform:translateY(-3px);box-shadow:0 8px 24px rgba(0,0,0,0.09);border-color:var(--ol-border);}
.ol-int-logo{width:48px;height:48px;border-radius:12px;margin:0 auto .7rem;display:flex;align-items:center;justify-content:center;font-size:20px;}
.ol-int-name{font-family:var(--ol-font-display);font-size:.875rem;font-weight:700;margin-bottom:2px;}
.ol-int-sub{font-size:.73rem;color:var(--ol-text-muted);}

/* ── CTA ── */
.ol-cta-section{padding:7rem 2rem;text-align:center;background:var(--ol-bg-main);position:relative;overflow:hidden;}
.ol-cta-section::before{
  content:'';position:absolute;bottom:-60px;left:50%;transform:translateX(-50%);
  width:500px;height:280px;background:radial-gradient(ellipse,rgba(122,170,106,0.15),transparent 70%);pointer-events:none;
}
.ol-cta-section h2{font-size:clamp(2.4rem,5vw,3.6rem);margin-bottom:.9rem;}
.ol-cta-section p{font-size:1rem;color:var(--ol-text-body);max-width:440px;margin:0 auto 2.5rem;font-weight:300;}
.ol-cta-btns{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;}

/* ── FOOTER ── */
.ol-footer{background:var(--ol-bg-feat);border-top:1px solid var(--ol-border);padding:3rem;}
.ol-foot-inner{max-width:1060px;margin:0 auto;display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:3rem;}
.ol-foot-brand p{font-size:.875rem;color:var(--ol-text-muted);font-weight:300;line-height:1.75;margin-top:.7rem;max-width:240px;}
.ol-foot-col h4{font-size:.7rem;font-weight:700;letter-spacing:.09em;text-transform:uppercase;color:var(--ol-text-muted);margin-bottom:.85rem;}
.ol-foot-col ul{list-style:none;display:flex;flex-direction:column;gap:.55rem;}
.ol-foot-col a{text-decoration:none;color:var(--ol-text-body);font-size:.875rem;font-weight:300;transition:color .2s;cursor:none;}
.ol-foot-col a:hover{color:var(--ol-text-dark);}
.ol-foot-bottom{max-width:1060px;margin:2rem auto 0;padding-top:1.5rem;border-top:1px solid var(--ol-border);display:flex;justify-content:space-between;font-size:.78rem;color:var(--ol-text-muted);flex-wrap:wrap;gap:1rem;}

/* ── SCROLL REVEAL ── */
.ol-reveal{opacity:0;transform:translateY(20px);transition:opacity .6s ease,transform .6s ease;}
.ol-reveal.in{opacity:1;transform:translateY(0);}

/* ── HERO ENTRY ANIMATIONS ── */
@keyframes ol-fadeUp{from{opacity:0;transform:translateY(18px);}to{opacity:1;transform:translateY(0);}}
.ol-hero h1{animation:ol-fadeUp .65s .05s ease both;}
.ol-hero-sub{animation:ol-fadeUp .65s .15s ease both;}
.ol-hero-actions{animation:ol-fadeUp .65s .25s ease both;}
.ol-mockup-wrap{animation:ol-fadeUp .8s .38s ease both;}

/* ── RESPONSIVE ── */
@media(max-width:900px){
  .ol-nav{padding:0 1.5rem;}
  .ol-nav-links{display:none;}
  .ol-feat-grid{grid-template-columns:1fr;}
  .ol-how-grid{grid-template-columns:1fr;gap:2.5rem;}
  .ol-int-grid{grid-template-columns:repeat(2,1fr);}
  .ol-foot-inner{grid-template-columns:1fr 1fr;gap:2rem;}
  .ol-mbody{grid-template-columns:1fr;}
  .ol-msb{display:none;}
}
`;

export default function LandingPage() {
  const navigate = useNavigate();
  const curRef = useRef(null);
  const ringRef = useRef(null);
  const glowRef = useRef(null);
  const wrapperRef = useRef(null);

  // Inject scoped CSS once on mount
  useEffect(() => {
    const styleId = 'orch-landing-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = LANDING_CSS;
      document.head.appendChild(style);
    }
    return () => {
      // Don't remove on unmount — font already loaded, harmless to keep
    };
  }, []);

  // Custom cursor
  useEffect(() => {
    let mx = 0, my = 0;
    let rx = 0, ry = 0, gx = 0, gy = 0;
    let rafRing, rafGlow;

    const onMove = (e) => {
      mx = e.clientX; my = e.clientY;
      if (curRef.current) { curRef.current.style.left = mx + 'px'; curRef.current.style.top = my + 'px'; }
    };

    const animRing = () => {
      rx += (mx - rx) * 0.16; ry += (my - ry) * 0.16;
      if (ringRef.current) { ringRef.current.style.left = rx + 'px'; ringRef.current.style.top = ry + 'px'; }
      rafRing = requestAnimationFrame(animRing);
    };
    const animGlow = () => {
      gx += (mx - gx) * 0.06; gy += (my - gy) * 0.06;
      if (glowRef.current) { glowRef.current.style.left = gx + 'px'; glowRef.current.style.top = gy + 'px'; }
      rafGlow = requestAnimationFrame(animGlow);
    };

    document.addEventListener('mousemove', onMove);
    rafRing = requestAnimationFrame(animRing);
    rafGlow = requestAnimationFrame(animGlow);

    return () => {
      document.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(rafRing);
      cancelAnimationFrame(rafGlow);
    };
  }, []);

  // Scroll reveal
  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.1 });
    const els = wrapperRef.current?.querySelectorAll('.ol-reveal') || [];
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <>
      {/* Custom cursor elements — rendered outside the wrapper so position:fixed works */}
      <div className="ol-cur" ref={curRef} />
      <div className="ol-cur-ring" ref={ringRef} />
      <div className="ol-cur-glow" ref={glowRef} />

      <div className="orch-landing" ref={wrapperRef}>

        {/* ── NAV ── */}
        <nav className="ol-nav">
          <a href="#" className="ol-logo" onClick={e => { e.preventDefault(); window.scrollTo(0, 0); }}>
            <div className="ol-logo-mark">O</div>
            <span className="ol-logo-name">Orchestra</span>
          </a>
          <ul className="ol-nav-links">
            <li><a href="#features">Features</a></li>
            <li><a href="#how">How it works</a></li>
            <li><a href="#integrations">Integrations</a></li>
          </ul>
          <div className="ol-nav-cta">
            <button className="ol-btn-ghost" onClick={() => navigate('/login')}>Sign in</button>
            <button className="ol-btn-primary" onClick={() => navigate('/signup')}>Get Started</button>
          </div>
        </nav>

        {/* ── HERO ── */}
        <section className="ol-hero">
          <div className="ol-hero-inner">
            <h1>Turn app ideas into<br /><span className="ol-accent">structured game plans</span></h1>
            <p className="ol-hero-sub">Orchestra uses AI to break down massive app ideas into step-by-step technical tasks, intelligently distributes work across your team, and tracks progress across GitHub, Figma, Discord, and more.</p>
            <div className="ol-hero-actions">
              <button className="ol-btn-primary ol-btn-lg" onClick={() => navigate('/signup')}>Start for free →</button>
              <a href="#how" className="ol-btn-ghost ol-btn-lg-ghost">See how it works</a>
            </div>

            {/* Dashboard mockup */}
            <div className="ol-mockup-wrap">
              <div className="ol-mockup-shadow">
                <div className="ol-mbar">
                  <div className="ol-md r" /><div className="ol-md y" /><div className="ol-md g" />
                  <div className="ol-murl">app.orchestra.ai / dashboard</div>
                </div>
                <div className="ol-mbody">
                  <div className="ol-msb">
                    <div className="ol-msb-title">Workspace</div>
                    <div className="ol-msb-item on">
                      <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>Overview
                    </div>
                    <div className="ol-msb-item">
                      <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>Blueprint
                    </div>
                    <div className="ol-msb-item">
                      <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>Progress
                    </div>
                    <div className="ol-msb-item">
                      <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>Team
                    </div>
                    <div className="ol-msb-item">
                      <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>Integrations
                    </div>
                  </div>
                  <div className="ol-mmain">
                    <div className="ol-mmtop">
                      <div className="ol-mmtitle">PayFlow App — Sprint 3</div>
                      <span className="ol-pill ol-pill-g">On track</span>
                    </div>
                    <div className="ol-stats">
                      <div className="ol-sc"><div className="ol-sl">Completed</div><div className="ol-sv g">14</div></div>
                      <div className="ol-sc"><div className="ol-sl">In progress</div><div className="ol-sv b">6</div></div>
                      <div className="ol-sc"><div className="ol-sl">Remaining</div><div className="ol-sv y">9</div></div>
                    </div>
                    <div className="ol-tl">
                      <div className="ol-tr">
                        <div className="ol-tc done"><svg width="9" height="9" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5"/></svg></div>
                        <span className="ol-tn done">Payment gateway API endpoint</span>
                        <span className="ol-pill ol-pill-g">Backend</span>
                        <div className="ol-tav" style={{background:'#dff0d8',color:'#3d6b32'}}>AL</div>
                      </div>
                      <div className="ol-tr">
                        <div className="ol-tc prog"><div style={{width:'5px',height:'5px',background:'#fff',borderRadius:'50%'}} /></div>
                        <span className="ol-tn">Checkout UI component</span>
                        <span className="ol-pill ol-pill-b">Frontend</span>
                        <div className="ol-tav" style={{background:'#dbeafe',color:'#1d4ed8'}}>NG</div>
                      </div>
                      <div className="ol-tr">
                        <div className="ol-tc prog"><div style={{width:'5px',height:'5px',background:'#fff',borderRadius:'50%'}} /></div>
                        <span className="ol-tn">User auth flow — Figma specs</span>
                        <span className="ol-pill ol-pill-y">Design</span>
                        <div className="ol-tav" style={{background:'#fef3c7',color:'#b45309'}}>MS</div>
                      </div>
                      <div className="ol-tr">
                        <div className="ol-tc todo" />
                        <span className="ol-tn" style={{color:'var(--ol-text-muted)'}}>Database schema migration</span>
                        <span className="ol-pill ol-pill-q">Queued</span>
                        <div className="ol-tav" style={{background:'#f3f3f0',color:'var(--ol-text-muted)'}}>—</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── SCROLLING LOGOS ── */}
        <div className="ol-logos-section">
          <p className="ol-logos-label">Integrates with your existing stack</p>
          <div className="ol-logos-track-wrap">
            <div className="ol-logos-track">
              {[1, 2].map(groupIndex => (
                <div className="ol-logo-group" key={groupIndex}>
                  {[
                    {c:'#5865F2', name:'Discord', svg: <svg width="22" height="17" viewBox="0 0 127.14 96.36" fill="currentColor"><path d="M107.7 8.07A105.15 105.15 0 0081.47 0a72.06 72.06 0 00-3.36 6.83 97.68 97.68 0 00-29.11 0A72.37 72.37 0 0045.64 0a105.89 105.89 0 00-26.25 8.09C2.79 32.65-1.71 56.6.54 80.21a105.73 105.73 0 0032.17 16.15 77.7 77.7 0 006.89-11.11 68.42 68.42 0 01-10.85-5.18c.91-.66 1.8-1.34 2.66-2a75.57 75.57 0 0064.32 0c.87.71 1.76 1.39 2.66 2a68.68 68.68 0 01-10.87 5.19 77 77 0 006.89 11.1 105.25 105.25 0 0032.19-16.14c2.64-27.38-4.51-51.11-18.9-72.15z"/></svg>},
                    {c:'#181717', name:'GitHub', svg: <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>},
                    {c:'#F1502F', name:'Git', svg: <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M23.546 10.93L13.067.452c-.604-.603-1.582-.603-2.188 0L8.708 2.627l2.76 2.76c.645-.215 1.379-.07 1.889.441.516.515.658 1.258.438 1.9l2.738 2.739c.64-.218 1.383-.076 1.898.44.78.78.78 2.05 0 2.83-.78.78-2.05.78-2.83 0-.518-.518-.66-1.264-.44-1.905l-2.73-2.73c-.341.13-.715.15-1.076.059L8.71 11.83v5.69c.216.216.36.5.421.808a2.007 2.007 0 01-1.396 2.27 2.016 2.016 0 01-2.484-1.39 2.006 2.006 0 011.026-2.31V11.2a1.996 1.996 0 01-1.03-2.316 2.007 2.007 0 012.483-1.386 2.014 2.014 0 011.398 2.264L11.89 7.01c.1-.365.08-.745-.06-1.09L9.068 3.16 10.88 1.35c.604-.604 1.582-.604 2.188 0l10.478 10.48c.604.604.604 1.583 0 2.187z"/></svg>},
                    {c:'none', name:'Figma', svg: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M5 5.5A3.5 3.5 0 018.5 2H12v7H8.5A3.5 3.5 0 015 5.5z" fill="#F24E1E"/><path d="M12 2h3.5a3.5 3.5 0 110 7H12V2z" fill="#FF7262"/><path d="M12 12.5H8.5a3.5 3.5 0 100 7H12v-7z" fill="#A259FF"/><path d="M12 12.5h3.5a3.5 3.5 0 110 7H12v-7z" fill="#1ABCFE"/><path d="M8.5 16A3.5 3.5 0 1012 19.5V16H8.5z" fill="#0ACF83"/></svg>},
                  ].map((p, i) => (
                    <div className="ol-plat" key={i}>
                      <div className="ol-plat-icon" style={{ color: p.c !== 'none' ? p.c : undefined }}>
                        {p.svg}
                      </div>
                      {p.name}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── FEATURES ── */}
        <section className="ol-features-section" id="features">
          <div className="ol-sec-head ol-reveal">
            <div className="ol-sec-tag">Core capabilities</div>
            <h2>Built for modern teams</h2>
            <p className="ol-sec-desc">From hackathon teams to remote startups — Orchestra adapts to how you work.</p>
          </div>
          <div className="ol-feat-grid">
            {[
              {
                icon: <svg fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>,
                title: 'Intelligent SDLC Orchestration',
                desc: 'The AI acts as a technical architect that maps out exact engineering dependencies, ensuring backend, frontend, and database tasks are sequenced correctly.'
              },
              {
                icon: <svg fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
                title: 'Smart Workload Distribution',
                desc: 'Analyzes individual team member strengths based on past activity to recommend optimal workload distribution and eliminate bottlenecks.'
              },
              {
                icon: <svg fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>,
                title: 'Cross-Platform Integration',
                desc: 'Quietly connects GitHub, Figma, Discord, and other workspaces to build a live, visual, interconnected brain of your team\'s knowledge.'
              },
              {
                icon: <svg fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
                title: 'Orchestra AI Assistant',
                desc: 'Ask complex questions like "Who changed this file last night and why?" and get contextual answers with direct links and summaries.'
              },
              {
                icon: <svg fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
                title: '100% Private & Secure',
                desc: 'All data stays within your workspace. No third-party training on your code, designs, or conversations.'
              },
              {
                icon: <svg fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>,
                title: 'Zero Alignment Meetings',
                desc: 'The development cycle flows seamlessly from architecture to deployment without constant status check-ins.'
              },
            ].map((f, i) => (
              <div className="ol-feat-card ol-reveal" key={i}>
                <div className="ol-feat-icon">{f.icon}</div>
                <div className="ol-feat-title">{f.title}</div>
                <div className="ol-feat-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="ol-how-section" id="how">
          <div className="ol-container">
            <div className="ol-sec-head ol-reveal" style={{textAlign:'left'}}>
              <div className="ol-sec-tag">How it works</div>
              <h2>From idea to roadmap<br />in under a minute</h2>
            </div>
            <div className="ol-how-grid">
              <div className="ol-steps-list">
                {[
                  {n:'01', h:'Describe your app idea', p:'Paste a description of what you want to build — no technical jargon required. Orchestra parses intent, not syntax.'},
                  {n:'02', h:'AI generates your blueprint', p:'Within seconds, Orchestra maps every engineering dependency — database schemas, API contracts, frontend components — in the right order.'},
                  {n:'03', h:'Tasks auto-assign to your team', p:'Orchestra analyzes each member\'s GitHub activity and skills to distribute work optimally. Connect your tools and let it run.'},
                  {n:'04', h:'Progress tracks itself', p:'As your team commits code and updates designs, Orchestra automatically moves tasks through the board — zero manual updates.'},
                ].map((s, i) => (
                  <div className="ol-step-item ol-reveal" key={i}>
                    <div className="ol-step-num">{s.n}</div>
                    <div className="ol-step-text"><h3>{s.h}</h3><p>{s.p}</p></div>
                  </div>
                ))}
              </div>
              <div className="ol-blueprint-card ol-reveal">
                <div className="ol-bp-head">
                  <div className="ol-bp-title">AI Blueprint — PayFlow</div>
                  <span className="ol-pill ol-pill-g">Generated in 0.8s</span>
                </div>
                <div className="ol-bp-body">
                  <div className="ol-bp-prompt">"Build a payments app with Stripe, user auth, transaction history, and an admin dashboard."</div>
                  <div className="ol-bp-tasks">
                    {[
                      {c:'#3d6b32', t:'PostgreSQL schema — users, transactions, plans', d:'Dep: none'},
                      {c:'#3d6b32', t:'FastAPI project + auth middleware', d:'Dep: #1'},
                      {c:'#1d4ed8', t:'Stripe webhook handler + payment intent API', d:'Dep: #2'},
                      {c:'#1d4ed8', t:'React checkout UI + Stripe Elements', d:'Dep: #3'},
                      {c:'#b45309', t:'Admin dashboard — filters, analytics', d:'Dep: #3,4'},
                      {c:'#b45309', t:'Docker + CI/CD for staging deployment', d:'Dep: #5'},
                    ].map((task, i) => (
                      <div className="ol-bp-task" key={i}>
                        <div className="ol-bp-dot" style={{background:task.c}} />
                        <span className="ol-bp-text">{task.t}</span>
                        <span className="ol-bp-dep">{task.d}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── INTEGRATIONS ── */}
        <section className="ol-int-section" id="integrations">
          <div className="ol-container">
            <div className="ol-sec-head ol-reveal">
              <div className="ol-sec-tag">Integrations</div>
              <h2>Works where your team already works</h2>
              <p className="ol-sec-desc">Orchestra sits quietly on top of your existing workflow. No migration, no new tools to learn.</p>
            </div>
            <div className="ol-int-grid">
              {[
                {bg:'#5865f2', name:'Discord', sub:'Capture chat context',
                  icon: <svg width="22" height="17" viewBox="0 0 127.14 96.36" fill="white"><path d="M107.7 8.07A105.15 105.15 0 0081.47 0a72.06 72.06 0 00-3.36 6.83 97.68 97.68 0 00-29.11 0A72.37 72.37 0 0045.64 0a105.89 105.89 0 00-26.25 8.09C2.79 32.65-1.71 56.6.54 80.21a105.73 105.73 0 0032.17 16.15 77.7 77.7 0 006.89-11.11 68.42 68.42 0 01-10.85-5.18c.91-.66 1.8-1.34 2.66-2a75.57 75.57 0 0064.32 0c.87.71 1.76 1.39 2.66 2a68.68 68.68 0 01-10.87 5.19 77 77 0 006.89 11.1 105.25 105.25 0 0032.19-16.14c2.64-27.38-4.51-51.11-18.9-72.15z"/></svg>},
                {bg:'#24292f', name:'GitHub', sub:'Track commits & PRs',
                  icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="white"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>},
                {bg:'#F1502F', name:'Git', sub:'Version control',
                  icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M23.546 10.93L13.067.452c-.604-.603-1.582-.603-2.188 0L8.708 2.627l2.76 2.76c.645-.215 1.379-.07 1.889.441.516.515.658 1.258.438 1.9l2.738 2.739c.64-.218 1.383-.076 1.898.44.78.78.78 2.05 0 2.83-.78.78-2.05.78-2.83 0-.518-.518-.66-1.264-.44-1.905l-2.73-2.73c-.341.13-.715.15-1.076.059L8.71 11.83v5.69c.216.216.36.5.421.808a2.007 2.007 0 01-1.396 2.27 2.016 2.016 0 01-2.484-1.39 2.006 2.006 0 011.026-2.31V11.2a1.996 1.996 0 01-1.03-2.316 2.007 2.007 0 012.483-1.386 2.014 2.014 0 011.398 2.264L11.89 7.01c.1-.365.08-.745-.06-1.09L9.068 3.16 10.88 1.35c.604-.604 1.582-.604 2.188 0l10.478 10.48c.604.604.604 1.583 0 2.187z"/></svg>},
                {bg:'#1e1e1e', name:'Figma', sub:'Sync design updates',
                  icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M5 5.5A3.5 3.5 0 018.5 2H12v7H8.5A3.5 3.5 0 015 5.5z" fill="#F24E1E"/><path d="M12 2h3.5a3.5 3.5 0 110 7H12V2z" fill="#FF7262"/><path d="M12 12.5H8.5a3.5 3.5 0 100 7H12v-7z" fill="#A259FF"/><path d="M12 12.5h3.5a3.5 3.5 0 110 7H12v-7z" fill="#1ABCFE"/><path d="M8.5 16A3.5 3.5 0 1012 19.5V16H8.5z" fill="#0ACF83"/></svg>},
              ].map((item, i) => (
                <div className="ol-int-card ol-reveal" key={i}>
                  <div className="ol-int-logo" style={{background:item.bg}}>{item.icon}</div>
                  <div className="ol-int-name">{item.name}</div>
                  <div className="ol-int-sub">{item.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="ol-cta-section">
          <span className="ol-sec-tag ol-reveal">Get started</span>
          <h2 className="ol-reveal">Ready to orchestrate<br />your next project?</h2>
          <p className="ol-reveal">Join teams who ship faster with AI-powered project management.</p>
          <div className="ol-cta-btns ol-reveal">
            <button className="ol-btn-primary ol-btn-lg" onClick={() => navigate('/signup')}>Get started for free →</button>
            <button className="ol-btn-ghost ol-btn-lg-ghost">Book a demo</button>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="ol-footer">
          <div className="ol-foot-inner">
            <div className="ol-foot-brand">
              <a href="#" className="ol-logo" onClick={e => { e.preventDefault(); window.scrollTo(0, 0); }}>
                <div className="ol-logo-mark">O</div>
                <span className="ol-logo-name">Orchestra</span>
              </a>
              <p>AI-powered project orchestration for teams that build fast and ship smart.</p>
            </div>
            <div className="ol-foot-col">
              <h4>Product</h4>
              <ul><li><a href="#">Features</a></li><li><a href="#">Integrations</a></li><li><a href="#">Pricing</a></li><li><a href="#">Changelog</a></li></ul>
            </div>
            <div className="ol-foot-col">
              <h4>Company</h4>
              <ul><li><a href="#">About</a></li><li><a href="#">Blog</a></li><li><a href="#">Careers</a></li><li><a href="#">Contact</a></li></ul>
            </div>
            <div className="ol-foot-col">
              <h4>Legal</h4>
              <ul><li><a href="#">Privacy</a></li><li><a href="#">Terms</a></li><li><a href="#">Security</a></li></ul>
            </div>
          </div>
          <div className="ol-foot-bottom">
            <span>© 2026 Orchestra. All rights reserved.</span>
            <span>Built with ♥ at VIT Bhopal</span>
          </div>
        </footer>

      </div>{/* /orch-landing */}
    </>
  );
}
