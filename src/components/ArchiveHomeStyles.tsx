export default function ArchiveHomeStyles() {
  return (
    <style>{`
      .quiet-archive-page { min-height:100vh; color:#d8d1c4; background:#0a0b0c; font-family:var(--font-im-fell),Georgia,serif; }
      .quiet-archive-page * { box-sizing:border-box; }
      .quiet-archive-backdrop { position:fixed; inset:0; pointer-events:none; opacity:.45; background:radial-gradient(circle at 12% 0%,rgba(184,151,84,.1),transparent 26%),radial-gradient(circle at 86% 32%,rgba(88,110,123,.08),transparent 30%),linear-gradient(115deg,transparent 0 49.8%,rgba(255,255,255,.022) 50%,transparent 50.2%); }
      .quiet-archive-header { position:relative; z-index:1; max-width:1240px; margin:0 auto; padding:26px 34px; display:flex; align-items:center; gap:28px; border-bottom:1px solid rgba(216,209,196,.12); }
      .quiet-archive-wordmark { color:#eee8dc; font-family:var(--font-playfair),Georgia,serif; font-size:.8rem; letter-spacing:.08em; white-space:nowrap; }
      .quiet-archive-wordmark span { margin-right:8px; color:#b89754; font-size:1.05rem; }
      .quiet-archive-nav { display:flex; align-items:center; gap:22px; margin-left:auto; }
      .quiet-archive-nav a { color:rgba(216,209,196,.42); font-family:ui-monospace,SFMono-Regular,Menlo,monospace; font-size:.62rem; letter-spacing:.15em; text-transform:uppercase; transition:color .2s ease; }
      .quiet-archive-nav a:hover, .quiet-archive-nav a[aria-current="page"] { color:#d7b46e; }
      .quiet-archive-account { display:inline-flex; align-items:center; gap:9px; color:rgba(216,209,196,.5); font-family:ui-monospace,SFMono-Regular,Menlo,monospace; font-size:.6rem; letter-spacing:.1em; text-transform:uppercase; }
      .quiet-archive-account:hover { color:#d7b46e; }
      .quiet-archive-account-dot { width:6px; height:6px; border-radius:999px; background:#9eb397; box-shadow:0 0 12px rgba(158,179,151,.65); }
      .quiet-archive-content { position:relative; z-index:1; max-width:1240px; margin:0 auto; padding:78px 34px 38px; }
      .quiet-archive-eyebrow { margin:0 0 13px; color:#b89754; font-family:ui-monospace,SFMono-Regular,Menlo,monospace; font-size:.61rem; letter-spacing:.23em; text-transform:uppercase; }
      .quiet-archive-intro { display:grid; grid-template-columns:minmax(0,1fr) 340px; align-items:end; gap:54px; padding-bottom:52px; }
      .quiet-archive-intro h1 { margin:0; color:#f1ebe1; font-family:var(--font-playfair),Georgia,serif; font-size:clamp(3.3rem,7vw,6.5rem); font-weight:400; letter-spacing:-.06em; line-height:.9; }
      .quiet-archive-intro h1 em { color:#c6a86b; font-style:italic; }
      .quiet-archive-lede { max-width:590px; margin:25px 0 0; color:rgba(216,209,196,.54); font-size:1rem; line-height:1.7; }
      .quiet-archive-intro-note { padding:20px 0 5px 24px; border-left:1px solid rgba(184,151,84,.38); color:rgba(216,209,196,.48); font-size:.87rem; line-height:1.65; }
      .quiet-archive-intro-note strong { display:block; margin-top:10px; color:#ead5a5; font-family:var(--font-playfair),Georgia,serif; font-size:1.25rem; font-weight:400; }
      .quiet-archive-metrics { display:grid; grid-template-columns:repeat(4,1fr); border-top:1px solid rgba(216,209,196,.13); border-bottom:1px solid rgba(216,209,196,.13); }
      .quiet-archive-metric { min-height:120px; padding:21px 24px; border-right:1px solid rgba(216,209,196,.1); }
      .quiet-archive-metric:last-child { border-right:0; }
      .quiet-archive-metric span, .quiet-archive-metric small { display:block; color:rgba(216,209,196,.4); font-family:ui-monospace,SFMono-Regular,Menlo,monospace; font-size:.6rem; letter-spacing:.1em; text-transform:uppercase; }
      .quiet-archive-metric strong { display:block; margin:12px 0 7px; color:#ead5a5; font-family:ui-monospace,SFMono-Regular,Menlo,monospace; font-size:1.8rem; font-weight:400; }
      .quiet-archive-continue { margin-top:70px; }
      .quiet-archive-section-heading { display:flex; align-items:start; gap:17px; margin-bottom:24px; }
      .quiet-archive-section-heading > span { color:rgba(184,151,84,.68); font-family:ui-monospace,SFMono-Regular,Menlo,monospace; font-size:.62rem; letter-spacing:.15em; }
      .quiet-archive-section-heading h2 { margin:0; color:#eee8dc; font-family:var(--font-playfair),Georgia,serif; font-size:1.55rem; font-weight:400; }
      .quiet-archive-section-heading p { margin:5px 0 0; color:rgba(216,209,196,.4); font-size:.78rem; }
      .quiet-archive-next { display:grid; grid-template-columns:90px minmax(0,1fr) auto; align-items:center; gap:26px; padding:27px 30px; border:1px solid rgba(184,151,84,.38); background:linear-gradient(110deg,rgba(184,151,84,.09),rgba(255,255,255,.018)); }
      .quiet-archive-next-symbol { color:#b89754; font-family:var(--font-playfair),Georgia,serif; font-size:4.6rem; line-height:1; text-align:center; }
      .quiet-archive-next-copy span { color:#b89754; font-family:ui-monospace,SFMono-Regular,Menlo,monospace; font-size:.6rem; letter-spacing:.13em; text-transform:uppercase; }
      .quiet-archive-next-copy h3 { margin:8px 0 5px; color:#f0eadf; font-family:var(--font-playfair),Georgia,serif; font-size:1.55rem; font-weight:400; }
      .quiet-archive-next-copy p { margin:0; color:rgba(216,209,196,.43); font-size:.77rem; }
      .quiet-archive-action { display:inline-flex; align-items:center; gap:9px; padding:13px 17px; color:#d7b46e; border:1px solid rgba(184,151,84,.5); background:rgba(184,151,84,.08); font-family:ui-monospace,SFMono-Regular,Menlo,monospace; font-size:.62rem; letter-spacing:.13em; text-transform:uppercase; transition:background .2s ease,transform .2s ease; white-space:nowrap; }
      .quiet-archive-action:hover { background:rgba(184,151,84,.16); transform:translateY(-2px); }
      .quiet-archive-shelves { margin-top:72px; }
      .quiet-archive-shelf-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:14px; }
      .quiet-archive-volume { position:relative; display:flex; min-height:290px; flex-direction:column; padding:26px; overflow:hidden; border:1px solid rgba(216,209,196,.13); background:rgba(255,255,255,.025); transition:border-color .25s ease,transform .25s ease,background .25s ease; }
      .quiet-archive-volume:hover { transform:translateY(-3px); border-color:rgba(184,151,84,.48); background:rgba(255,255,255,.04); }
      .quiet-archive-volume-mark { display:flex; align-items:center; justify-content:space-between; }
      .quiet-archive-volume-mark > span { font-family:var(--font-playfair),Georgia,serif; font-size:3.7rem; line-height:1; }
      .quiet-archive-volume-mark svg { color:rgba(216,209,196,.28); }
      .quiet-archive-volume-name { margin-top:26px; color:rgba(216,209,196,.48); font-family:ui-monospace,SFMono-Regular,Menlo,monospace; font-size:.6rem; letter-spacing:.16em; text-transform:uppercase; }
      .quiet-archive-volume h3 { margin:7px 0 0; color:#eee8dc; font-family:var(--font-playfair),Georgia,serif; font-size:1.72rem; font-weight:400; }
      .quiet-archive-volume-meta { display:flex; justify-content:space-between; margin-top:auto; padding-top:28px; color:rgba(216,209,196,.4); font-family:ui-monospace,SFMono-Regular,Menlo,monospace; font-size:.61rem; letter-spacing:.08em; text-transform:uppercase; }
      .quiet-archive-progress { height:2px; margin-top:15px; background:rgba(216,209,196,.12); }
      .quiet-archive-progress span { display:block; height:100%; transition:width .45s ease; }
      .quiet-archive-chapters { display:flex; flex-direction:column; margin-top:18px; border-top:1px solid rgba(216,209,196,.1); }
      .quiet-archive-chapter { display:flex; align-items:center; gap:12px; padding:11px 0; color:rgba(216,209,196,.58); border-bottom:1px solid rgba(216,209,196,.08); font-size:.78rem; transition:color .2s ease; }
      .quiet-archive-chapter:hover { color:#d7b46e; }
      .quiet-archive-chapter-number { width:22px; color:rgba(184,151,84,.62); font-family:ui-monospace,SFMono-Regular,Menlo,monospace; font-size:.6rem; }
      .quiet-archive-chapter strong { flex:1; font-weight:400; }
      .quiet-archive-chapter small { color:rgba(216,209,196,.3); font-size:.65rem; }
      .quiet-archive-chapter-locked { color:rgba(216,209,196,.28); }
      .quiet-archive-chapter-locked svg { color:rgba(184,151,84,.48); }
      .quiet-archive-utility-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin-top:72px; }
      .quiet-archive-utility { display:flex; min-height:110px; flex-direction:column; gap:9px; padding:20px; color:rgba(216,209,196,.62); border:1px solid rgba(216,209,196,.13); background:rgba(255,255,255,.02); transition:border-color .2s ease,background .2s ease,color .2s ease; }
      .quiet-archive-utility:hover { color:#d7b46e; border-color:rgba(184,151,84,.45); background:rgba(184,151,84,.06); }
      .quiet-archive-utility strong { color:#e8e1d5; font-family:var(--font-playfair),Georgia,serif; font-size:1rem; font-weight:400; }
      .quiet-archive-utility span { color:rgba(216,209,196,.35); font-size:.7rem; }
      .quiet-archive-footer { display:flex; justify-content:space-between; gap:20px; margin-top:78px; padding-top:20px; color:rgba(216,209,196,.38); border-top:1px solid rgba(216,209,196,.1); font-family:ui-monospace,SFMono-Regular,Menlo,monospace; font-size:.6rem; letter-spacing:.1em; text-transform:uppercase; }
      @media (max-width:760px) {
        .quiet-archive-header { flex-wrap:wrap; padding:20px; }
        .quiet-archive-nav { order:3; width:100%; justify-content:space-between; margin:0; padding-top:12px; border-top:1px solid rgba(216,209,196,.1); }
        .quiet-archive-content { padding:52px 20px 28px; }
        .quiet-archive-intro { display:block; }
        .quiet-archive-intro-note { margin-top:34px; }
        .quiet-archive-metrics { grid-template-columns:1fr 1fr; }
        .quiet-archive-metric:nth-child(2) { border-right:0; }
        .quiet-archive-metric:nth-child(-n+2) { border-bottom:1px solid rgba(216,209,196,.1); }
        .quiet-archive-next { grid-template-columns:60px minmax(0,1fr); gap:18px; padding:22px 18px; }
        .quiet-archive-next-symbol { font-size:3.3rem; }
        .quiet-archive-action { grid-column:1 / -1; justify-content:center; }
        .quiet-archive-shelf-grid, .quiet-archive-utility-grid { grid-template-columns:1fr; }
      }
      @media (max-width:440px) {
        .quiet-archive-wordmark { font-size:.68rem; }
        .quiet-archive-account span:last-child { display:none; }
        .quiet-archive-intro h1 { font-size:3.65rem; }
        .quiet-archive-metric { padding:18px 15px; }
        .quiet-archive-metric strong { font-size:1.45rem; }
      }
    `}</style>
  );
}
