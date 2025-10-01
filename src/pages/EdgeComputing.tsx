import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Cpu, ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useCollectiveThink } from "@/hooks/useCollectiveThink";
import Navigation from "@/components/Navigation";

const EdgeComputing = () => {
  const [input, setInput] = useState("");
  const { think, isLoading, result } = useCollectiveThink();

  const handleOptimize = async () => {
    if (!input.trim()) return;
    await think(input, "edge-computing");
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="container mx-auto max-w-6xl px-4 py-20">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Zurück
        </Link>

        <div className="space-y-8">
          <div className="text-center space-y-4">
            <div className="inline-flex p-4 rounded-2xl bg-gradient-accent">
              <Cpu className="h-12 w-12 text-accent-foreground" />
            </div>
            <h1 className="text-5xl font-bold gradient-text">Edge Computing</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Autonomy Engine für dezentrale Datenverarbeitung
            </p>
          </div>

          <Card className="p-8 space-y-6 bg-card/50 backdrop-blur-sm border-primary/20">
            <div className="space-y-2">
              <label className="text-sm font-semibold">Datenverarbeitungs-Szenario</label>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="z.B. Optimiere Real-time Datenverarbeitung für IoT-Sensoren in Smart Cities..."
                className="min-h-[120px] bg-background/50"
              />
            </div>

            <Button
              onClick={handleOptimize}
              disabled={isLoading || !input.trim()}
              size="lg"
              className="w-full bg-gradient-accent hover:opacity-90 transition-all shadow-glow-accent"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Optimiere...
                </>
              ) : (
                <>
                  <Cpu className="mr-2 h-5 w-5" />
                  Edge-Architektur generieren
                </>
              )}
            </Button>

            {result && (
              <Card className="p-6 bg-muted/30 border-primary/10">
                <h3 className="text-lg font-semibold mb-4 gradient-text">Edge-Optimierung</h3>
                <div className="prose prose-invert max-w-none whitespace-pre-wrap">
                  {result}
                </div>
              </Card>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
};

export default EdgeComputing;
