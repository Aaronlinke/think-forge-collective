import { Brain, Lightbulb, Network } from "lucide-react";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden py-20 px-4">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 opacity-50" />
      
      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card/50 backdrop-blur-sm border border-primary/20">
            <Brain className="h-4 w-4 text-primary animate-pulse" />
            <span className="text-sm text-muted-foreground">Collective Intelligence Platform</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tight">
            <span className="gradient-text">Think Forge</span>
            <br />
            <span className="text-foreground">Collective</span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Jeder Gedanke öffnet <span className="text-primary font-semibold">10.000 Möglichkeiten</span>.
            <br />
            Kollektive Intelligenz findet <span className="text-accent font-semibold">die eine Lösung</span>.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <Button 
              size="lg" 
              className="bg-gradient-primary hover:opacity-90 transition-all duration-300 shadow-glow-primary text-lg px-8 py-6 rounded-xl font-semibold"
            >
              <Lightbulb className="mr-2 h-5 w-5" />
              Start Thinking
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-primary/50 hover:bg-primary/10 transition-all duration-300 text-lg px-8 py-6 rounded-xl font-semibold"
            >
              <Network className="mr-2 h-5 w-5" />
              Explore Modules
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto pt-12">
            <div className="text-center space-y-2">
              <div className="text-4xl font-bold text-primary">10K+</div>
              <div className="text-sm text-muted-foreground">Möglichkeiten</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-4xl font-bold text-accent">∞</div>
              <div className="text-sm text-muted-foreground">Perspektiven</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-4xl font-bold text-success">1</div>
              <div className="text-sm text-muted-foreground">Optimale Lösung</div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute top-1/4 left-10 w-72 h-72 bg-primary/20 rounded-full blur-[120px] animate-float" />
      <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-accent/20 rounded-full blur-[120px] animate-float" style={{ animationDelay: '2s' }} />
    </section>
  );
};

export default HeroSection;
