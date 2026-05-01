function App() {
  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%)",fontFamily:"'Inter',-apple-system,BlinkMacSystemFont,sans-serif",color:"#fff"}}>
      {/* Shared Nav Bar */}
      <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:100,background:"rgba(10,10,10,0.95)",backdropFilter:"blur(10px)",borderBottom:"1px solid #D4AF3722",padding:"0.5rem 1rem",display:"flex",alignItems:"center",gap:"0.5rem",overflowX:"auto"}}>
        <span style={{fontWeight:800,color:"#D4AF37",fontSize:"0.9rem",marginRight:"0.5rem",whiteSpace:"nowrap"}}>KISSI KINGDOM</span>
        <div style={{display:"flex",gap:"0.25rem",alignItems:"center"}}>
          <a href="https://central-portal-yums-projects-e09fdaf7.vercel.app" style={{padding:"0.4rem 0.75rem",borderRadius:"6px",textDecoration:"none",fontSize:"0.8rem",fontWeight:600,display:"flex",alignItems:"center",gap:"0.3rem",color:"#999"}}>🏠 Portal</a>
            <a href="https://centillion-os-ai-yums-projects-e09fdaf7.vercel.app" style={{padding:"0.4rem 0.75rem",borderRadius:"6px",textDecoration:"none",fontSize:"0.8rem",fontWeight:600,display:"flex",alignItems:"center",gap:"0.3rem",background:"#D4AF37",color:"#000"}}>🤖 AI</a>
            <a href="https://centillion-social-yums-projects-e09fdaf7.vercel.app" style={{padding:"0.4rem 0.75rem",borderRadius:"6px",textDecoration:"none",fontSize:"0.8rem",fontWeight:600,display:"flex",alignItems:"center",gap:"0.3rem",color:"#999"}}>👑 Social</a>
            <a href="https://ugc-marketplace-yums-projects-e09fdaf7.vercel.app" style={{padding:"0.4rem 0.75rem",borderRadius:"6px",textDecoration:"none",fontSize:"0.8rem",fontWeight:600,display:"flex",alignItems:"center",gap:"0.3rem",color:"#999"}}>🎬 UGC</a>
            <a href="https://centillion-music-yums-projects-e09fdaf7.vercel.app" style={{padding:"0.4rem 0.75rem",borderRadius:"6px",textDecoration:"none",fontSize:"0.8rem",fontWeight:600,display:"flex",alignItems:"center",gap:"0.3rem",color:"#999"}}>🎵 Music</a>
            <a href="https://centillion-stream-yums-projects-e09fdaf7.vercel.app" style={{padding:"0.4rem 0.75rem",borderRadius:"6px",textDecoration:"none",fontSize:"0.8rem",fontWeight:600,display:"flex",alignItems:"center",gap:"0.3rem",color:"#999"}}>📺 Stream</a>
            <a href="https://royal-bank-yums-projects-e09fdaf7.vercel.app" style={{padding:"0.4rem 0.75rem",borderRadius:"6px",textDecoration:"none",fontSize:"0.8rem",fontWeight:600,display:"flex",alignItems:"center",gap:"0.3rem",color:"#999"}}>🏦 Bank</a>
            <a href="https://centillion-shield-yums-projects-e09fdaf7.vercel.app" style={{padding:"0.4rem 0.75rem",borderRadius:"6px",textDecoration:"none",fontSize:"0.8rem",fontWeight:600,display:"flex",alignItems:"center",gap:"0.3rem",color:"#999"}}>🛡️ Shield</a>
        </div>
      </nav>

      {/* Main Content */}
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"100vh",padding:"5rem 2rem 2rem",textAlign:"center"}}>
        <div style={{fontSize:"4rem",marginBottom:"1rem"}}>🤖</div>
        <h1 style={{fontSize:"clamp(2rem,5vw,3.5rem)",fontWeight:800,background:"linear-gradient(135deg, #D4AF37, #fff, #D4AF37)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",marginBottom:"0.5rem",letterSpacing:"-0.02em"}}>Centillion AI</h1>
        <p style={{fontSize:"1.25rem",color:"#D4AF37",fontWeight:600,marginBottom:"1rem",letterSpacing:"0.1em",textTransform:"uppercase"}}>Your Intelligent Operating System</p>
        <p style={{fontSize:"1.1rem",color:"#888",maxWidth:"500px",lineHeight:1.6,marginBottom:"2rem"}}>AI-powered assistant for the Kissi Kingdom ecosystem. Chat, analyze, and automate.</p>
        <span style={{padding:"0.75rem 2rem",background:"linear-gradient(135deg, #D4AF37, #b8941f)",color:"#000",borderRadius:"8px",fontWeight:700,fontSize:"0.95rem",letterSpacing:"0.05em"}}>COMING SOON</span>
        <div style={{position:"fixed",bottom:"2rem",color:"#444",fontSize:"0.85rem"}}>
          Kissi Kingdom &bull; Centillion OS
        </div>
      </div>
    </div>
  );
}

export default App;
