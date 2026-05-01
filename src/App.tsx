function App() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      color: "#fff",
      padding: "2rem",
      textAlign: "center",
    }}>
      <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🤖</div>
      <h1 style={{
        fontSize: "clamp(2rem, 5vw, 3.5rem)",
        fontWeight: 800,
        background: "linear-gradient(135deg, #D4AF37, #fff, #D4AF37)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        marginBottom: "0.5rem",
        letterSpacing: "-0.02em",
      }}>Centillion AI</h1>
      <p style={{
        fontSize: "1.25rem",
        color: "#D4AF37",
        fontWeight: 600,
        marginBottom: "1rem",
        letterSpacing: "0.1em",
        textTransform: "uppercase",
      }}>Your Intelligent Operating System</p>
      <p style={{
        fontSize: "1.1rem",
        color: "#888",
        maxWidth: "500px",
        lineHeight: 1.6,
        marginBottom: "2rem",
      }}>AI-powered assistant for the Kissi Kingdom ecosystem. Chat, analyze, and automate.</p>
      <div style={{
        display: "flex",
        gap: "1rem",
        flexWrap: "wrap",
        justifyContent: "center",
      }}>
        <span style={{
          padding: "0.75rem 2rem",
          background: "linear-gradient(135deg, #D4AF37, #b8941f)",
          color: "#000",
          borderRadius: "8px",
          fontWeight: 700,
          fontSize: "0.95rem",
          letterSpacing: "0.05em",
        }}>COMING SOON</span>
        <a href="https://central-portal-yums-projects-e09fdaf7.vercel.app" style={{
          padding: "0.75rem 2rem",
          border: "1px solid #D4AF3733",
          color: "#D4AF37",
          borderRadius: "8px",
          fontWeight: 600,
          fontSize: "0.95rem",
          textDecoration: "none",
        }}>← Back to Portal</a>
      </div>
      <div style={{
        position: "fixed",
        bottom: "2rem",
        color: "#444",
        fontSize: "0.85rem",
      }}>
        Kissi Kingdom &bull; Centillion OS
      </div>
    </div>
  );
}

export default App;
