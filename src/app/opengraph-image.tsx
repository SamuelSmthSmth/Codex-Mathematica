import { ImageResponse } from "next/og";

export const runtime = "edge";

export default function OpenGraphImage() {
  return new ImageResponse(<div style={{ width: "1200px", height: "630px", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "72px", background: "#0c0a08", color: "#f1e6cf", fontFamily: "serif" }}><div style={{ display: "flex", alignItems: "center", gap: "18px", color: "#c8922a", fontSize: "26px", letterSpacing: "4px" }}><span style={{ fontSize: "46px" }}>∑</span><span>CODEX MATHEMATICA</span></div><div style={{ display: "flex", flexDirection: "column", gap: "18px" }}><div style={{ color: "#c8922a", fontSize: "22px", letterSpacing: "5px" }}>THE MATHEMATICS ARCHIVE</div><div style={{ fontSize: "76px", lineHeight: 1.05 }}>Make difficult<br />things inevitable.</div></div><div style={{ display: "flex", justifyContent: "space-between", color: "#8d826e", fontSize: "20px" }}><span>Calculus · Practice · Mastery</span><span>codex.sous.systems</span></div></div>, { width: 1200, height: 630 });
}
