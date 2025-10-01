import { ArrowRight, GitBranch, Target } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const CollectiveIntelligence = () => {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <Card className="relative overflow-hidden bg-gradient-to-br from-card via-card to-card/50 backdrop-blur-sm border-primary/30">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
          
          <div className="relative p-8 md:p-12 space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold">
                <span className="gradient-text">Kollektive Intelligenz</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Von unendlichen Möglichkeiten zur perfekten Lösung
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 items-center">
              <div className="text-center space-y-4 group">
                <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow-primary group-hover:scale-110 transition-transform duration-300">
                  <GitBranch className="h-10 w-10 text-primary-foreground" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">10.000+</div>
                  <h3 className="text-lg font-semibold mb-2">Möglichkeiten</h3>
                  <p className="text-sm text-muted-foreground">
                    Jeder Gedanke generiert tausende potenzielle Lösungswege
                  </p>
                </div>
              </div>

              <div className="flex justify-center">
                <ArrowRight className="h-12 w-12 text-accent animate-pulse hidden md:block" />
              </div>

              <div className="text-center space-y-4 group">
                <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-accent flex items-center justify-center shadow-glow-accent group-hover:scale-110 transition-transform duration-300">
                  <Target className="h-10 w-10 text-accent-foreground" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-accent mb-2">1</div>
                  <h3 className="text-lg font-semibold mb-2">Optimale Lösung</h3>
                  <p className="text-sm text-muted-foreground">
                    KI filtert, bewertet und findet die beste Antwort
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-muted/30 rounded-2xl p-6 md:p-8 space-y-6">
              <h3 className="text-2xl font-bold text-center">Wie es funktioniert</h3>
              
              <div className="grid md:grid-cols-4 gap-6">
                {[
                  { step: "01", title: "Input", desc: "Problem oder Anfrage" },
                  { step: "02", title: "Expansion", desc: "Generiere Varianten" },
                  { step: "03", title: "Evaluation", desc: "KI-Bewertung" },
                  { step: "04", title: "Selection", desc: "Beste Lösung" },
                ].map((item, idx) => (
                  <div key={idx} className="text-center space-y-2">
                    <div className="text-4xl font-black text-primary/30">{item.step}</div>
                    <h4 className="font-semibold">{item.title}</h4>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center">
              <Button 
                size="lg"
                className="bg-gradient-accent hover:opacity-90 transition-all duration-300 shadow-glow-accent text-lg px-12 py-6 rounded-xl font-semibold"
              >
                Jetzt ausprobieren
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default CollectiveIntelligence;
