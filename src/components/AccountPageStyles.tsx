export default function AccountPageStyles() {
  return (
    <style>{`
      .quiet-profile-page-nav { display:flex; align-items:center; gap:18px; margin-left:auto; margin-right:28px; }
      .quiet-profile-page-nav a { color:rgba(216,209,196,.38); font-family:ui-monospace,SFMono-Regular,Menlo,monospace; font-size:.62rem; letter-spacing:.14em; text-transform:uppercase; transition:color .2s ease; }
      .quiet-profile-page-nav a:hover, .quiet-profile-page-nav a[aria-current="page"] { color:#d7b46e; }
      .quiet-profile-intro-actions { display:flex; flex-direction:column; align-items:flex-end; gap:18px; }
      .quiet-profile-preview-callout { display:flex; align-items:center; justify-content:space-between; gap:28px; margin-top:12px; padding:26px 28px; border:1px solid rgba(184,151,84,.3); background:linear-gradient(110deg,rgba(184,151,84,.09),rgba(255,255,255,.018)); }
      .quiet-profile-preview-callout h2 { margin:0; color:#eee8dc; font-family:var(--font-playfair),Georgia,serif; font-size:1.35rem; font-weight:400; }
      .quiet-profile-preview-callout p:not(.quiet-profile-eyebrow) { max-width:620px; margin:9px 0 0; color:rgba(216,209,196,.52); font-size:.82rem; line-height:1.6; }
      .quiet-profile-preview-callout .quiet-profile-primary-action { flex:0 0 auto; cursor:pointer; }
      .quiet-profile-account-links { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
      .quiet-profile-account-link { display:flex; align-items:flex-start; gap:14px; min-height:100px; padding:20px; color:rgba(216,209,196,.64); border:1px solid rgba(216,209,196,.14); background:rgba(255,255,255,.025); transition:border-color .2s ease,background .2s ease,color .2s ease; }
      .quiet-profile-account-link:hover { color:#d7b46e; border-color:rgba(184,151,84,.5); background:rgba(184,151,84,.06); }
      .quiet-profile-account-link > span { display:flex; flex:1; flex-direction:column; gap:7px; }
      .quiet-profile-account-link strong { color:#e8e1d5; font-size:.84rem; font-weight:400; }
      .quiet-profile-account-link small { color:rgba(216,209,196,.38); font-size:.7rem; line-height:1.45; }
      .quiet-profile-account-link > svg:last-child { color:rgba(216,209,196,.35); }
      .quiet-settings-columns { align-items:start; }
      .quiet-settings-identity { grid-template-columns:auto 1fr; padding:18px; }
      .quiet-settings-identity .quiet-profile-avatar { width:64px; height:64px; font-size:1.5rem; }
      .quiet-settings-field { margin-top:25px; }
      @media (max-width:760px) {
        .quiet-profile-header { flex-wrap:wrap; gap:14px; }
        .quiet-profile-page-nav { order:3; width:100%; margin:0; padding-top:8px; border-top:1px solid rgba(216,209,196,.1); }
        .quiet-profile-intro-actions { align-items:flex-start; margin-top:28px; }
        .quiet-profile-preview-callout { align-items:flex-start; flex-direction:column; }
        .quiet-profile-account-links { grid-template-columns:1fr; }
      }
    `}</style>
  );
}
