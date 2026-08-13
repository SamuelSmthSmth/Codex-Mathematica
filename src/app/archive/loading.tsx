export default function ArchiveLoading() {
  return (
    <main
      aria-busy="true"
      aria-label="Loading the archive"
      style={{
        minHeight: "100vh",
        background: "#0a0b0c",
        color: "#d8d1c4",
        padding: "26px 34px 60px",
        fontFamily: "Georgia, serif",
      }}
    >
      <div style={{ maxWidth: 1240, margin: "0 auto" }}>
        <div
          style={{
            height: 34,
            width: "100%",
            borderBottom: "1px solid rgba(216,209,196,.12)",
            background: "linear-gradient(90deg, rgba(216,209,196,.1), rgba(216,209,196,.025), rgba(216,209,196,.1))",
          }}
        />
        <div style={{ paddingTop: 78, maxWidth: 680 }}>
          <p style={{ color: "#b89754", fontFamily: "monospace", fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase" }}>
            Archive / loading
          </p>
          <div style={{ height: 112, width: "min(78vw, 570px)", marginTop: 20, background: "rgba(216,209,196,.08)" }} />
          <div style={{ height: 18, width: "min(90vw, 590px)", marginTop: 28, background: "rgba(216,209,196,.06)" }} />
          <div style={{ height: 18, width: "min(70vw, 460px)", marginTop: 10, background: "rgba(216,209,196,.04)" }} />
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 1,
            marginTop: 60,
            background: "rgba(216,209,196,.12)",
          }}
        >
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} style={{ height: 118, background: "#0a0b0c" }} />
          ))}
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 14,
            marginTop: 70,
          }}
        >
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} style={{ height: 250, border: "1px solid rgba(216,209,196,.1)", background: "rgba(255,255,255,.025)" }} />
          ))}
        </div>
      </div>
    </main>
  );
}
