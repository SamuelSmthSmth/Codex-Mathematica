"use client";

import { useTheme } from "@/context/ThemeContext";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { VOLUMES } from "@/data/codex-data";

const VOLUME_TOTALS: Record<string, number> = {
  alpha: 150, beta: 150, gamma: 150, delta: 150,
  epsilon: 150, zeta: 150, sigma: 150, omega: 150,
};

const GREEK_SYMBOLS: Record<string, string> = {
  alpha: "α", beta: "β", gamma: "Γ", delta: "Δ",
  epsilon: "ε", zeta: "ζ", sigma: "Σ", omega: "Ω",
};

const VOLUME_ACCENTS: Record<string, string> = {
  alpha: "#b8924a", beta: "#4a9b7f", gamma: "#7b5ea7",
  delta: "#4a7fb8", epsilon: "#b84a4a", zeta: "#6b9b3a",
  sigma: "#b87a2a", omega: "#5a4a9b",
};

// ── SVG Ornaments ──────────────────────────────────────────────────────────

function TitleSigil({ size = 280, color = "#8b0000" }: { size?: number; color?: string }) {
  const cx = size / 2, cy = size / 2;
  const ticks = 36;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block", margin: "0 auto", opacity: 0.82 }}>
      {/* Outer rings */}
      {[0.48, 0.43, 0.36].map((r, i) => (
        <circle key={i} cx={cx} cy={cy} r={r * size} fill="none" stroke={color}
          strokeWidth={i === 0 ? 0.8 : i === 1 ? 0.4 : 0.3} opacity={i === 0 ? 1 : 0.5} />
      ))}
      {/* Tick marks on outer ring */}
      {Array.from({ length: ticks }).map((_, i) => {
        const angle = (i / ticks) * Math.PI * 2 - Math.PI / 2;
        const isMajor = i % 9 === 0;
        const r1 = size * 0.48, r2 = r1 - (isMajor ? 9 : 4);
        return (
          <line key={i}
            x1={cx + Math.cos(angle) * r1} y1={cy + Math.sin(angle) * r1}
            x2={cx + Math.cos(angle) * r2} y2={cy + Math.sin(angle) * r2}
            stroke={color} strokeWidth={isMajor ? 1 : 0.5} opacity={isMajor ? 1 : 0.6} />
        );
      })}
      {/* Star polygon — 8-point */}
      {Array.from({ length: 8 }).map((_, i) => {
        const a1 = (i / 8) * Math.PI * 2 - Math.PI / 2;
        const a2 = ((i + 4) / 8) * Math.PI * 2 - Math.PI / 2;
        const r = size * 0.32;
        return (
          <line key={i} x1={cx + Math.cos(a1) * r} y1={cy + Math.sin(a1) * r}
            x2={cx + Math.cos(a2) * r} y2={cy + Math.sin(a2) * r}
            stroke={color} strokeWidth={0.6} opacity={0.35} />
        );
      })}
      {/* Inner decorative rings */}
      {[0.22, 0.14].map((r, i) => (
        <circle key={i} cx={cx} cy={cy} r={r * size} fill="none" stroke={color}
          strokeWidth={0.4} opacity={0.5} />
      ))}
      {/* Cardinal cross-hairs */}
      {[0, 1, 2, 3].map((i) => {
        const a = (i / 4) * Math.PI * 2 - Math.PI / 2;
        return (
          <line key={i}
            x1={cx + Math.cos(a) * size * 0.14} y1={cy + Math.sin(a) * size * 0.14}
            x2={cx + Math.cos(a) * size * 0.36} y2={cy + Math.sin(a) * size * 0.36}
            stroke={color} strokeWidth={0.5} opacity={0.4} />
        );
      })}
      {/* Dot at centre */}
      <circle cx={cx} cy={cy} r={2.5} fill={color} opacity={0.7} />
    </svg>
  );
}

function HorizontalOrnament({ color = "#c8b89a", width = "100%" }: { color?: string; width?: string }) {
  return (
    <svg viewBox="0 0 400 20" xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block", width, height: "12pt", overflow: "visible" }}>
      <line x1="0" y1="10" x2="160" y2="10" stroke={color} strokeWidth="0.6" />
      <line x1="240" y1="10" x2="400" y2="10" stroke={color} strokeWidth="0.6" />
      <circle cx="200" cy="10" r="5" fill="none" stroke={color} strokeWidth="0.8" />
      <circle cx="200" cy="10" r="2" fill={color} opacity="0.7" />
      <circle cx="175" cy="10" r="2" fill="none" stroke={color} strokeWidth="0.6" />
      <circle cx="225" cy="10" r="2" fill="none" stroke={color} strokeWidth="0.6" />
      <line x1="163" y1="10" x2="170" y2="10" stroke={color} strokeWidth="0.6" />
      <line x1="230" y1="10" x2="237" y2="10" stroke={color} strokeWidth="0.6" />
    </svg>
  );
}

function ArcProgress({ pct, accent, symbol, vol, size = 72 }: {
  pct: number; accent: string; symbol: string; vol: string; size?: number;
}) {
  const r = size * 0.38, cx = size / 2, cy = size / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div style={{ textAlign: "center", width: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#ede8e0" strokeWidth="3.5" />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={accent} strokeWidth="3.5"
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeDashoffset={circ * 0.25}
          strokeLinecap="round" />
        <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle"
          fontSize="18" fontFamily="serif" fill={accent} opacity="0.9">{symbol}</text>
      </svg>
      <div style={{ fontSize: "6pt", letterSpacing: "0.2em", textTransform: "uppercase", color: "#8b7355", marginTop: "1mm" }}>
        {vol}
      </div>
      <div style={{ fontSize: "8pt", color: "#1a1510", fontWeight: 600, marginTop: "0.5mm" }}>
        {pct}%
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function PrintableManuscript() {
  const { printData } = useTheme();
  if (!printData) return null;

  const totalFragments = Object.values(printData.mastery).reduce((a: number, b: number) => a + b, 0);
  const totalPossible = Object.keys(printData.mastery).length * 150;
  const grandPct = Math.round((totalFragments / totalPossible) * 100);

  return (
    <>
      <style>{`
        @media print {
          @page { margin: 16mm 18mm 20mm 18mm; size: A4; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
        .ms-pb  { page-break-after: always; }
        .ms-nob { page-break-inside: avoid; }

        .ms-root {
          font-family: 'EB Garamond', 'Palatino Linotype', Palatino, 'Book Antiqua', Georgia, serif;
          color: #1a1510;
          line-height: 1.8;
          font-size: 10.5pt;
        }
        .ms-display {
          font-family: var(--font-playfair, 'Playfair Display'), 'EB Garamond', Georgia, serif;
        }
        .ms-proof-body p { margin: 0 0 5mm; }
        .ms-proof-body p:first-child::first-letter {
          font-size: 3.8em;
          float: left;
          line-height: 0.78;
          padding-right: 5pt;
          padding-top: 5pt;
          font-family: var(--font-playfair, 'Playfair Display'), Georgia, serif;
          color: var(--drop-cap-color, #8b0000);
          font-weight: 700;
        }
        /* Suppress drop cap on pure-math paragraphs starting with $ */
        .ms-proof-body .katex-display ~ p::first-letter,
        .ms-proof-body p:first-child:has(.katex)::first-letter { font-size: inherit; float: none; }
      `}</style>

      <div className="hidden print:block ms-root bg-white w-full z-[9999] relative">

        {/* ══════════════════════════════════════════
            PAGE 1 · TITLE
        ══════════════════════════════════════════ */}
        <div className="ms-pb" style={{
          minHeight: "100vh", display: "flex", flexDirection: "column",
          justifyContent: "space-between", padding: "28mm 28mm 20mm",
          background: "white",
        }}>
          {/* Masthead */}
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: "6.5pt", letterSpacing: "0.55em", textTransform: "uppercase", color: "#a89070", margin: 0 }}>
              The Grand Archive · Codex Mathematica
            </p>
          </div>

          {/* Central composition */}
          <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
            <TitleSigil size={220} color="#8b0000" />

            <div style={{ marginTop: "8mm", marginBottom: "3mm" }}>
              <p className="ms-display" style={{ fontSize: "11pt", letterSpacing: "0.3em", textTransform: "uppercase", color: "#8b7355", margin: "0 0 4mm" }}>
                The Grimoire of
              </p>
              <h1 className="ms-display" style={{
                fontSize: "46pt", fontWeight: 700, letterSpacing: "0.025em",
                lineHeight: 1.05, color: "#1a1510", margin: "0 0 3mm",
              }}>
                {printData.scholarName || "Unknown Scholar"}
              </h1>
            </div>

            <HorizontalOrnament color="#8b0000" width="64mm" />

            <p className="ms-display" style={{
              fontSize: "10.5pt", letterSpacing: "0.35em", textTransform: "uppercase",
              color: "#5a4a3a", fontStyle: "italic", marginTop: "5mm", marginBottom: "8mm",
            }}>
              Codex Mathematica
            </p>

            {/* Grand mastery seal */}
            <div style={{
              border: "0.75pt solid #c8b89a",
              borderRadius: "50%",
              width: "44mm", height: "44mm",
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              position: "relative",
            }}>
              <div style={{
                position: "absolute", inset: "2mm",
                border: "0.4pt solid #e8ddd0", borderRadius: "50%",
              }} />
              <p style={{ fontSize: "20pt", fontWeight: 700, color: "#8b0000", lineHeight: 1, margin: 0 }}>
                {grandPct}<span style={{ fontSize: "11pt" }}>%</span>
              </p>
              <p style={{ fontSize: "5.5pt", letterSpacing: "0.25em", textTransform: "uppercase", color: "#8b7355", margin: "1.5mm 0 0" }}>
                Mastered
              </p>
            </div>
          </div>

          {/* Footer rule + date */}
          <div style={{ borderTop: "0.5pt solid #c8b89a", paddingTop: "5mm", textAlign: "center" }}>
            <p style={{ fontSize: "7pt", letterSpacing: "0.18em", color: "#b0a090", fontStyle: "italic", margin: 0 }}>
              Typeset {new Date().toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" })}
              &ensp;·&ensp;
              {totalFragments} of {totalPossible} fragments recorded
            </p>
          </div>
        </div>


        {/* ══════════════════════════════════════════
            PAGE 2 · PROGRESS & TABLE OF CONTENTS
        ══════════════════════════════════════════ */}
        <div className="ms-pb" style={{ padding: "14mm 18mm" }}>

          {/* Section eyebrow */}
          <p style={{ fontSize: "6.5pt", letterSpacing: "0.45em", textTransform: "uppercase", color: "#a89070", marginBottom: "2mm" }}>
            Scholastic Record
          </p>
          <h2 className="ms-display" style={{ fontSize: "22pt", fontWeight: 400, color: "#1a1510", marginBottom: "1mm", borderBottom: "0.75pt solid #1a1510", paddingBottom: "2mm" }}>
            Mastery by Volume
          </h2>
          <div style={{ marginBottom: "10mm" }}>
            <HorizontalOrnament color="#c8b89a" width="100%" />
          </div>

          {/* Arc progress rings */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6mm", marginBottom: "12mm", justifyContent: "flex-start" }}>
            {Object.entries(printData.mastery).map(([vol, count]) => {
              const total = VOLUME_TOTALS[vol.toLowerCase()] || 150;
              const pct = Math.round((count / total) * 100);
              const accent = VOLUME_ACCENTS[vol.toLowerCase()] || "#8b7355";
              const symbol = GREEK_SYMBOLS[vol.toLowerCase()] || vol[0].toUpperCase();
              return (
                <div key={vol}>
                  <ArcProgress pct={pct} accent={accent} symbol={symbol} vol={vol} size={68} />
                </div>
              );
            })}
          </div>

          {/* Detail table */}
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "9.5pt", marginBottom: "14mm" }}>
            <thead>
              <tr>
                {["Volume", "Title", "Fragments", "Remaining"].map(h => (
                  <th key={h} style={{
                    textAlign: h === "Fragments" || h === "Remaining" ? "right" : "left",
                    padding: "1.5mm 2mm", fontSize: "6.5pt", letterSpacing: "0.22em",
                    textTransform: "uppercase", color: "#8b7355", fontWeight: 400,
                    borderBottom: "0.5pt solid #c8b89a",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(printData.mastery).map(([vol, count]) => {
                const total = VOLUME_TOTALS[vol.toLowerCase()] || 150;
                const accent = VOLUME_ACCENTS[vol.toLowerCase()] || "#8b7355";
                const symbol = GREEK_SYMBOLS[vol.toLowerCase()] || vol[0].toUpperCase();
                const volData = VOLUMES.find(v => v.id.toLowerCase() === vol.toLowerCase());
                return (
                  <tr key={vol} style={{ borderBottom: "0.25pt solid #ede8e0" }}>
                    <td style={{ padding: "2mm 2mm", verticalAlign: "middle" }}>
                      <span style={{ color: accent, fontFamily: "serif", fontSize: "13pt", marginRight: "2mm" }}>{symbol}</span>
                      <span style={{ fontSize: "7.5pt", letterSpacing: "0.15em", textTransform: "uppercase", color: "#3a2a1a" }}>{vol}</span>
                    </td>
                    <td style={{ padding: "2mm", color: "#5a4a3a", fontStyle: "italic", fontSize: "9pt" }}>
                      {volData?.name || "—"}
                    </td>
                    <td style={{ padding: "2mm", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                      <strong>{count}</strong><span style={{ color: "#8b7355" }}> / {total}</span>
                    </td>
                    <td style={{ padding: "2mm", textAlign: "right", color: "#8b7355", fontVariantNumeric: "tabular-nums" }}>
                      {total - count}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Table of Contents */}
          <p style={{ fontSize: "6.5pt", letterSpacing: "0.45em", textTransform: "uppercase", color: "#a89070", marginBottom: "2mm" }}>
            Index of Proofs
          </p>
          <h2 className="ms-display" style={{ fontSize: "22pt", fontWeight: 400, color: "#1a1510", marginBottom: "1mm", borderBottom: "0.75pt solid #1a1510", paddingBottom: "2mm" }}>
            Table of Contents
          </h2>
          <div style={{ marginBottom: "8mm" }}>
            <HorizontalOrnament color="#c8b89a" width="100%" />
          </div>

          <div style={{ columns: "2", columnGap: "10mm" }}>
            {printData.proofs.filter(p => p.proof_markdown?.trim()).map((p, idx) => {
              const accent = VOLUME_ACCENTS[p.volume?.toLowerCase()] || "#8b7355";
              const sym = GREEK_SYMBOLS[p.volume?.toLowerCase()] || p.volume?.[0]?.toUpperCase();
              return (
                <div key={idx} style={{
                  display: "flex", alignItems: "baseline", gap: "2mm",
                  borderBottom: "0.25pt dotted #ddd8d0", padding: "1mm 0",
                  breakInside: "avoid",
                }}>
                  <span style={{ color: accent, fontFamily: "serif", fontSize: "10pt", minWidth: "5mm" }}>{sym}</span>
                  <span style={{ fontSize: "7.5pt", color: "#5a4a3a", minWidth: "16mm" }}>Ch.{p.chapter} · {p.fragment_id}</span>
                  <span style={{ flex: 1, borderBottom: "0.25pt dotted #ddd8d0", height: "0.6em", margin: "0 1mm" }} />
                  <span style={{ fontSize: "7pt", color: "#a89070" }}>· · ·</span>
                </div>
              );
            })}
          </div>
        </div>


        {/* ══════════════════════════════════════════
            VOLUME SECTIONS
        ══════════════════════════════════════════ */}
        {Object.entries(printData.mastery).map(([vol]) => {
          const volumeProofs = printData.proofs.filter(
            p => p.volume === vol && p.proof_markdown?.trim()
          );
          if (volumeProofs.length === 0) return null;

          const volData = VOLUMES.find(v => v.id.toLowerCase() === vol.toLowerCase());
          const accent = VOLUME_ACCENTS[vol.toLowerCase()] || "#8b7355";
          const symbol = GREEK_SYMBOLS[vol.toLowerCase()] || vol[0].toUpperCase();
          const total = VOLUME_TOTALS[vol.toLowerCase()] || 150;
          const count = printData.mastery[vol] || 0;
          const pct = Math.round((count / total) * 100);

          return (
            <div key={vol}>

              {/* ── Volume Divider ─────────────────── */}
              <div className="ms-pb" style={{
                minHeight: "100vh", position: "relative", overflow: "hidden",
                display: "flex", flexDirection: "column", justifyContent: "flex-end",
                padding: "0 0 20mm 18mm",
                background: "white",
              }}>
                {/* Full-bleed background symbol — bleeds right */}
                <div style={{
                  position: "absolute", right: "-8mm", bottom: "-16mm",
                  fontSize: "420pt", fontFamily: "serif", fontWeight: 700,
                  color: accent, opacity: 0.055, lineHeight: 1,
                  userSelect: "none", pointerEvents: "none",
                  letterSpacing: "-0.05em",
                }}>
                  {symbol}
                </div>

                {/* Vertical accent bar */}
                <div style={{
                  position: "absolute", left: "18mm", top: "20mm", bottom: "20mm",
                  width: "1.5pt", background: accent, opacity: 0.7,
                }} />

                {/* Content — inset from the bar */}
                <div style={{ paddingLeft: "8mm", position: "relative", zIndex: 1, maxWidth: "140mm" }}>
                  <p style={{
                    fontSize: "6.5pt", letterSpacing: "0.5em", textTransform: "uppercase",
                    color: "#a89070", marginBottom: "5mm",
                  }}>
                    Codex Mathematica · Volume
                  </p>

                  {/* Big Greek symbol inline with vol name */}
                  <div style={{ display: "flex", alignItems: "flex-end", gap: "4mm", marginBottom: "4mm" }}>
                    <span style={{
                      fontSize: "90pt", fontFamily: "serif", color: accent,
                      lineHeight: 0.85, fontWeight: 400,
                    }}>{symbol}</span>
                    <h1 className="ms-display" style={{
                      fontSize: "56pt", fontWeight: 300, letterSpacing: "0.18em",
                      textTransform: "uppercase", lineHeight: 0.9,
                      color: "#1a1510", marginBottom: "2mm",
                    }}>
                      {vol}
                    </h1>
                  </div>

                  {volData?.name && (
                    <p style={{ fontSize: "13pt", color: "#5a4a3a", fontStyle: "italic", marginBottom: "8mm" }}>
                      {volData.name}
                    </p>
                  )}

                  <HorizontalOrnament color={accent} width="80mm" />

                  <div style={{ display: "flex", gap: "10mm", marginTop: "8mm" }}>
                    <div>
                      <p style={{ fontSize: "6pt", letterSpacing: "0.25em", textTransform: "uppercase", color: "#a89070", marginBottom: "1mm" }}>Proofs recorded</p>
                      <p className="ms-display" style={{ fontSize: "18pt", fontWeight: 700, color: accent, margin: 0 }}>{volumeProofs.length}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: "6pt", letterSpacing: "0.25em", textTransform: "uppercase", color: "#a89070", marginBottom: "1mm" }}>Volume mastery</p>
                      <p className="ms-display" style={{ fontSize: "18pt", fontWeight: 700, color: accent, margin: 0 }}>{pct}%</p>
                    </div>
                  </div>
                </div>
              </div>


              {/* ── Proof Pages ────────────────────── */}
              {volumeProofs.map((p, idx) => {
                const chapterData = volData?.chapters[p.chapter - 1];
                const fragmentData = chapterData?.fragments.find((f: any) => f.id === p.fragment_id);
                const isLast = idx === volumeProofs.length - 1;

                return (
                  <div
                    key={idx}
                    id={`fragment-${p.volume}-${p.fragment_id}`}
                    className="ms-nob"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "28mm 1fr",
                      gap: "0 6mm",
                      padding: "12mm 18mm",
                      borderBottom: isLast ? "none" : "0.5pt solid #e8ddd0",
                      pageBreakInside: "avoid",
                    }}
                  >
                    {/* Left margin column */}
                    <div style={{ paddingTop: "1mm", borderRight: `1pt solid ${accent}33`, paddingRight: "5mm" }}>
                      {/* Volume symbol */}
                      <div style={{
                        fontSize: "22pt", color: accent, fontFamily: "serif",
                        lineHeight: 1, marginBottom: "3mm", textAlign: "right",
                      }}>{symbol}</div>

                      {/* Meta labels */}
                      <div style={{ textAlign: "right" }}>
                        <p style={{ fontSize: "5.5pt", letterSpacing: "0.2em", textTransform: "uppercase", color: "#a89070", margin: "0 0 0.5mm" }}>
                          Vol.
                        </p>
                        <p style={{ fontSize: "8pt", color: "#5a4a3a", fontWeight: 600, margin: "0 0 3mm", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                          {vol}
                        </p>
                        <p style={{ fontSize: "5.5pt", letterSpacing: "0.2em", textTransform: "uppercase", color: "#a89070", margin: "0 0 0.5mm" }}>
                          Ch.
                        </p>
                        <p style={{ fontSize: "8pt", color: "#5a4a3a", fontWeight: 600, margin: "0 0 3mm" }}>
                          {p.chapter}
                        </p>
                        <p style={{ fontSize: "5.5pt", letterSpacing: "0.2em", textTransform: "uppercase", color: "#a89070", margin: "0 0 0.5mm" }}>
                          Fragment
                        </p>
                        <p style={{ fontSize: "8pt", color: "#5a4a3a", fontWeight: 600, margin: 0 }}>
                          {p.fragment_id}
                        </p>
                      </div>

                      {/* Closing QED mark at bottom of margin */}
                      <div style={{ marginTop: "auto", paddingTop: "12mm", textAlign: "right", color: accent, fontSize: "11pt", opacity: 0.6 }}>
                        ∎
                      </div>
                    </div>

                    {/* Main content column */}
                    <div>
                      {/* Fragment heading */}
                      <div style={{ marginBottom: "4mm" }}>
                        <p style={{ fontSize: "6.5pt", letterSpacing: "0.35em", textTransform: "uppercase", color: "#a89070", margin: "0 0 1mm" }}>
                          {chapterData?.theme || `Chapter ${p.chapter}`}
                        </p>
                        <h3 className="ms-display" style={{
                          fontSize: "17pt", fontWeight: 600, color: "#1a1510",
                          letterSpacing: "0.01em", margin: 0,
                        }}>
                          Fragment {p.fragment_id}
                        </h3>
                      </div>

                      <HorizontalOrnament color={`${accent}88`} width="100%" />

                      {fragmentData && (
                        <div style={{ margin: "5mm 0" }}>
                          {/* Problem */}
                          <div style={{
                            position: "relative",
                            background: "#faf8f5",
                            border: "0.5pt solid #e8ddd0",
                            borderLeft: `2.5pt solid ${accent}`,
                            padding: "4mm 5mm 4mm 5mm",
                            marginBottom: "3mm",
                          }}>
                            <p style={{
                              fontSize: "6pt", letterSpacing: "0.3em", textTransform: "uppercase",
                              color: accent, fontWeight: 700, margin: "0 0 2mm",
                            }}>Problem</p>
                            <div style={{ fontSize: "10.5pt" }}>
                              <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                                {fragmentData.problem_latex}
                              </ReactMarkdown>
                            </div>
                          </div>

                          {/* Answer */}
                          <div style={{ padding: "2mm 5mm 3mm", marginBottom: "3mm" }}>
                            <p style={{ fontSize: "6pt", letterSpacing: "0.3em", textTransform: "uppercase", color: "#8b7355", fontWeight: 700, margin: "0 0 2mm" }}>
                              Answer
                            </p>
                            <div style={{ fontSize: "10pt", color: "#5a4a3a", fontStyle: "italic" }}>
                              <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                                {fragmentData.solution_latex}
                              </ReactMarkdown>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Proof */}
                      <div>
                        <p style={{
                          fontSize: "6pt", letterSpacing: "0.3em", textTransform: "uppercase",
                          color: "#8b7355", fontWeight: 700, margin: "0 0 3mm",
                        }}>Proof</p>
                        <div
                          className="ms-proof-body"
                          style={{ ["--drop-cap-color" as string]: accent, fontSize: "10.5pt", lineHeight: 1.85, color: "#1a1510" }}
                        >
                          <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                            {p.proof_markdown}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}

      </div>
    </>
  );
}