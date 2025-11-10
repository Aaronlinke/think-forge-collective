import { ArrowRight, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden py-32 px-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse-ring" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[120px] animate-pulse-ring" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[150px] animate-rotate" />
      </div>
      
      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="text-center space-y-12">
          {/* Badge */}
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full glass-card border border-primary/30 animate-fade-in">
            <Sparkles className="h-5 w-5 text-primary animate-pulse" />
            <span className="text-sm font-medium bg-gradient-primary bg-clip-text text-transparent">
              Kollektive Intelligenz · Neue Generation
            </span>
          </div>

          {/* Main heading */}
          <div className="space-y-6 animate-scale-in">
            <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-none">
              <span className="gradient-text-animated block mb-4">Think Forge</span>
              <span className="text-foreground/90">Collective</span>
            </h1>
            
            <p className="text-xl md:text-3xl text-muted-foreground max-w-4xl mx-auto leading-relaxed font-light">
              Von <span className="text-primary font-bold">10.000 Möglichkeiten</span> zur{" "}
              <span className="text-accent font-bold">perfekten Lösung</span>
              <br />
              <span className="text-lg md:text-xl mt-4 block opacity-80">
                Wo kollektive Intelligenz auf Innovation trifft
              </span>
            </p>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-8 animate-fade-in-up">
            <Button 
              size="lg" 
              className="group relative bg-gradient-primary hover:opacity-90 transition-all duration-300 shadow-neon text-xl px-12 py-8 rounded-2xl font-bold overflow-hidden"
            >
              <span className="relative z-10 flex items-center">
                <Zap className="mr-3 h-6 w-6 group-hover:rotate-12 transition-transform" />
                Jetzt Starten
              </span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </Button>
            
            <Button 
              size="lg" 
              variant="outline"
              className="neon-border border-2 hover:bg-muted/30 transition-all duration-300 text-xl px-12 py-8 rounded-2xl font-bold"
            >
              <Sparkles className="mr-3 h-6 w-6" />
              Module Entdecken
              <ArrowRight className="ml-3 h-6 w-6" />
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto pt-20 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="stat-card group glass-card p-8 rounded-3xl hover:shadow-glow-primary transition-all duration-500 cursor-pointer">
              <div className="text-5xl md:text-6xl font-black bg-gradient-primary bg-clip-text text-transparent mb-3">
                10K+
              </div>
              <div className="text-lg font-semibold text-foreground/80">
                Möglichkeiten
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                pro Anfrage generiert
              </div>
            </div>
            
            <div className="stat-card group glass-card p-8 rounded-3xl hover:shadow-glow-accent transition-all duration-500 cursor-pointer">
              <div className="text-5xl md:text-6xl font-black bg-gradient-accent bg-clip-text text-transparent mb-3">
                ∞
              </div>
              <div className="text-lg font-semibold text-foreground/80">
                Perspektiven
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                unbegrenzte Denkansätze
              </div>
            </div>
            
            <div className="stat-card group glass-card p-8 rounded-3xl hover:shadow-glow-success transition-all duration-500 cursor-pointer">
              <div className="text-5xl md:text-6xl font-black text-success mb-3">
                1
              </div>
              <div className="text-lg font-semibold text-foreground/80">
                Optimale Lösung
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                präzise & KI-validiert
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
