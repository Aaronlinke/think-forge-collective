import { ArrowRight, GitBranch, Target, Sparkles, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const CollectiveIntelligence = () => {
  return (
    <section className="py-32 px-4 relative">
      <div className="container mx-auto max-w-7xl">
        <Card className="relative overflow-hidden glass-card border-primary/30 shadow-neon">
          {/* Animated background */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
            <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[100px] animate-pulse-ring" />
          </div>
          
          <div className="relative p-10 md:p-16 space-y-16 z-10">
            {/* Header */}
            <div className="text-center space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border border-accent/30 mb-4">
                <Zap className="h-4 w-4 text-accent animate-pulse" />
                <span className="text-sm text-muted-foreground">Der Prozess</span>
              </div>
              
              <h2 className="text-5xl md:text-6xl font-black">
                <span className="gradient-text-animated">Kollektive Intelligenz</span>
              </h2>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto font-light">
                Von unendlichen Möglichkeiten zur perfekten Lösung
              </p>
            </div>

            {/* Process Flow */}
            <div className="grid md:grid-cols-3 gap-12 items-center">
              {/* Input Stage */}
              <div className="text-center space-y-6 group">
                <div className="relative mx-auto w-32 h-32 rounded-3xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow-primary group-hover:scale-110 transition-all duration-500">
                  <GitBranch className="h-16 w-16 text-background" />
                  <div className="absolute -inset-1 bg-gradient-to-br from-primary to-accent rounded-3xl opacity-0 group-hover:opacity-50 blur-xl transition-opacity duration-500" />
                </div>
                <div>
                  <div className="text-5xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
                    10.000+
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Möglichkeiten</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Jeder Gedanke verzweigt sich in tausende potenzielle Lösungswege durch KI-Expansion
                  </p>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex justify-center">
                <div className="relative">
                  <ArrowRight className="h-16 w-16 text-accent animate-pulse-ring hidden md:block" />
                  <Sparkles className="h-6 w-6 text-primary absolute -top-2 -right-2 animate-pulse" />
                </div>
              </div>

              {/* Output Stage */}
              <div className="text-center space-y-6 group">
                <div className="relative mx-auto w-32 h-32 rounded-3xl bg-gradient-to-br from-accent to-success flex items-center justify-center shadow-glow-accent group-hover:scale-110 transition-all duration-500">
                  <Target className="h-16 w-16 text-background" />
                  <div className="absolute -inset-1 bg-gradient-to-br from-accent to-success rounded-3xl opacity-0 group-hover:opacity-50 blur-xl transition-opacity duration-500" />
                </div>
                <div>
                  <div className="text-5xl font-black bg-gradient-to-r from-accent to-success bg-clip-text text-transparent mb-4">
                    1
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Optimale Lösung</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    KI filtert, bewertet und findet die perfekte Antwort durch intelligente Synthese
                  </p>
                </div>
              </div>
            </div>

            {/* Process Steps */}
            <div className="glass-card rounded-3xl p-10 md:p-12 space-y-10 border border-border/50">
              <h3 className="text-3xl md:text-4xl font-bold text-center mb-8">
                Wie es <span className="gradient-text-animated">funktioniert</span>
              </h3>
              
              <div className="grid md:grid-cols-4 gap-8">
                {[
                  { 
                    step: "01", 
                    title: "Input", 
                    desc: "Problem oder Anfrage wird analysiert",
                    icon: "📥"
                  },
                  { 
                    step: "02", 
                    title: "Expansion", 
                    desc: "Generiere tausende Varianten & Perspektiven",
                    icon: "🌟"
                  },
                  { 
                    step: "03", 
                    title: "Evaluation", 
                    desc: "KI-Bewertung aller Lösungsansätze",
                    icon: "⚡"
                  },
                  { 
                    step: "04", 
                    title: "Selection", 
                    desc: "Beste Lösung wird präsentiert",
                    icon: "🎯"
                  },
                ].map((item, idx) => (
                  <div key={idx} className="text-center space-y-4 group cursor-pointer">
                    <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
                      {item.icon}
                    </div>
                    <div className="text-5xl font-black bg-gradient-primary bg-clip-text text-transparent opacity-40 group-hover:opacity-100 transition-opacity duration-300">
                      {item.step}
                    </div>
                    <h4 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="text-center pt-8">
              <Button 
                size="lg"
                className="group relative bg-gradient-to-r from-accent via-primary to-accent hover:opacity-90 transition-all duration-300 shadow-neon text-xl px-16 py-8 rounded-2xl font-bold overflow-hidden"
              >
                <span className="relative z-10 flex items-center">
                  Jetzt ausprobieren
                  <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </Button>
              <p className="text-sm text-muted-foreground mt-6">
                Kostenlos starten · Keine Kreditkarte erforderlich
              </p>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default CollectiveIntelligence;
