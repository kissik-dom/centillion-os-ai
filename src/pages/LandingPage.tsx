import { Authenticated, Unauthenticated } from "convex/react";
import { ArrowRight, Brain, Code, Globe, Image, MessageSquare, Shield, Sparkles, Zap } from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const features = [
  { icon: Brain, title: "Deep Reasoning", desc: "Multi-step task planning and sovereign-grade analysis" },
  { icon: Code, title: "Code Generation", desc: "Write, debug, and execute code across any language" },
  { icon: Globe, title: "Web Intelligence", desc: "Real-time web search, scraping, and OSINT" },
  { icon: Image, title: "Image Generation", desc: "Create images from text prompts — unrestricted" },
  { icon: MessageSquare, title: "Unrestricted Chat", desc: "No content filters, no limitations, full sovereignty" },
  { icon: Zap, title: "Multi-Model Router", desc: "Auto-selects the best AI model for each task" },
  { icon: Shield, title: "Quantum Protected", desc: "Post-quantum cryptography on all data channels" },
  { icon: Sparkles, title: "Agent Swarm", desc: "Deploy autonomous AI agents across the ecosystem" },
];

export function LandingPage() {
  return (
    <>
      <Authenticated>
        <Navigate to="/chat" replace />
      </Authenticated>
      <Unauthenticated>
        <div className="min-h-screen flex flex-col">
          {/* Hero */}
          <div className="flex-1 flex flex-col items-center justify-center px-4 py-20">
            {/* Royal crest / icon */}
            <div className="relative mb-8">
              <div className="absolute inset-0 blur-3xl opacity-20 bg-[#D4AF37] rounded-full scale-150" />
              <div className="relative size-20 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#8B6914] flex items-center justify-center glow-gold">
                <Sparkles className="size-10 text-[#0A1628]" />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-5xl md:text-7xl font-bold text-center mb-4 tracking-tight">
              <span className="text-gradient-royal">
                Centillion AI
              </span>
            </h1>

            {/* Subtitle with royal phrasing */}
            <p className="text-xs tracking-[0.3em] uppercase text-[#D4AF37]/60 mb-4 font-medium">
              Royal Kissi Kingdom · Sovereign Intelligence
            </p>
            <p className="text-lg md:text-xl text-muted-foreground text-center max-w-2xl mb-10">
              The unrestricted sovereign AI. Code execution, web intelligence, image generation, and limitless reasoning — protected by quantum-grade encryption.
            </p>

            {/* CTA Buttons */}
            <div className="flex gap-4">
              <Button asChild size="lg" className="bg-[#D4AF37] hover:bg-[#A67C00] text-[#0A1628] font-semibold px-8 glow-gold">
                <Link to="/signup">
                  Enter the Kingdom <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-[rgba(212,175,55,0.25)] text-[#D4AF37] hover:bg-[#142D4A] hover:text-[#F0D060]">
                <Link to="/login">Sign In</Link>
              </Button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="px-4 pb-20">
            <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {features.map((f) => (
                <div
                  key={f.title}
                  className="p-6 rounded-xl card-royal hover:border-[#D4AF37]/30 transition-all duration-300 group"
                >
                  <f.icon className="size-7 text-[#D4AF37] mb-3 group-hover:text-[#F0D060] transition-colors" />
                  <h3 className="font-semibold text-base mb-1 text-[#E8E0D0]">{f.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Stats bar */}
          <div className="border-t border-[rgba(212,175,55,0.08)] py-12 px-4">
            <div className="max-w-4xl mx-auto grid grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-gradient-royal">6+</div>
                <div className="text-xs tracking-[0.2em] uppercase text-muted-foreground mt-1">AI Models</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gradient-royal">∞</div>
                <div className="text-xs tracking-[0.2em] uppercase text-muted-foreground mt-1">Unrestricted</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gradient-royal">256</div>
                <div className="text-xs tracking-[0.2em] uppercase text-muted-foreground mt-1">Bit Encrypted</div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <footer className="border-t border-[rgba(212,175,55,0.08)] py-6 text-center text-muted-foreground text-sm">
            <span className="text-[#D4AF37]/40">⬥</span>
            {" "}Centillion OS · Royal Kissi Kingdom Ecosystem · <span className="italic">Omnividens, Omnipotens, Omniaeternus</span>{" "}
            <span className="text-[#D4AF37]/40">⬥</span>
          </footer>
        </div>
      </Unauthenticated>
    </>
  );
}
