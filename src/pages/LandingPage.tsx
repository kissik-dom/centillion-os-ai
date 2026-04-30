import { Authenticated, Unauthenticated } from "convex/react";
import { ArrowRight, Brain, Code, Globe, Image, MessageSquare, Sparkles, Zap } from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const features = [
  { icon: Brain, title: "Deep Reasoning", desc: "Multi-step task planning and analysis" },
  { icon: Code, title: "Code Generation", desc: "Write, debug, and execute code" },
  { icon: Globe, title: "Web Browsing", desc: "Real-time web search and scraping" },
  { icon: Image, title: "Image Generation", desc: "Create images from text prompts" },
  { icon: MessageSquare, title: "Unrestricted Chat", desc: "No content filters, full freedom" },
  { icon: Zap, title: "Multi-Model", desc: "Routes to the best AI model per task" },
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
            <div className="relative mb-8">
              <div className="absolute inset-0 blur-3xl opacity-30 bg-[#E91E8C] rounded-full scale-150" />
              <div className="relative size-20 rounded-2xl bg-gradient-to-br from-[#E91E8C] to-[#C0186F] flex items-center justify-center glow-magenta">
                <Sparkles className="size-10 text-white" />
              </div>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-center mb-4 tracking-tight">
              <span className="bg-gradient-to-r from-[#E91E8C] via-[#FF4DA6] to-[#C4A1FF] bg-clip-text text-transparent">
                Centillion AI
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground text-center max-w-2xl mb-10">
              The unrestricted AI assistant. Code execution, web browsing, image generation, and limitless reasoning — all in one interface.
            </p>
            <div className="flex gap-4">
              <Button asChild size="lg" className="bg-[#E91E8C] hover:bg-[#C0186F] text-white px-8 glow-magenta">
                <Link to="/signup">
                  Get Started <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-[rgba(255,255,255,0.15)] hover:bg-[#1A1A24]">
                <Link to="/login">Sign In</Link>
              </Button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="px-4 pb-20">
            <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {features.map((f) => (
                <div key={f.title} className="p-6 rounded-xl bg-[#12121A] border border-[rgba(255,255,255,0.06)] hover:border-[#E91E8C]/30 transition-colors">
                  <f.icon className="size-8 text-[#E91E8C] mb-3" />
                  <h3 className="font-semibold text-lg mb-1">{f.title}</h3>
                  <p className="text-muted-foreground text-sm">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <footer className="border-t border-[rgba(255,255,255,0.06)] py-6 text-center text-muted-foreground text-sm">
            Centillion OS · Part of the Centillion Ecosystem
          </footer>
        </div>
      </Unauthenticated>
    </>
  );
}
