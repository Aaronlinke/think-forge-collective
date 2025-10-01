import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Zap, ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useCollectiveThink } from "@/hooks/useCollectiveThink";
import Navigation from "@/components/Navigation";

const SolutionForge = () => {
  const [input, setInput] = useState("");
  const { think, isLoading, result } = useCollectiveThink();

  const handleForge = async () => {
    if (!input.trim()) return;
    await think(input, "solution-forge");
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
            <div className="inline-flex p-4 rounded-2xl bg-gradient-accent animate-glow-pulse">
              <Zap className="h-12 w-12 text-accent-foreground" />
            </div>
            <h1 className="text-5xl font-bold gradient-text">Solution Forge</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              10.000 Möglichkeiten → Bewertung → 1 optimale Lösung
            </p>
          </div>

          <Card className="p-8 space-y-6 bg-card/50 backdrop-blur-sm border-primary/20 shadow-glow-accent">
            <div className="space-y-2">
              <label className="text-sm font-semibold">Problem zur Optimierung</label>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="z.B. Finde die beste Marketingstrategie für mein Produkt aus allen möglichen Ansätzen..."
                className="min-h-[120px] bg-background/50"
              />
            </div>

            <Button
              onClick={handleForge}
              disabled={isLoading || !input.trim()}
              size="lg"
              className="w-full bg-gradient-accent hover:opacity-90 transition-all shadow-glow-accent text-lg py-6"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Bewerte alle Optionen...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-5 w-5" />
                  Optimale Lösung finden
                </>
              )}
            </Button>

            {result && (
              <Card className="p-6 bg-gradient-to-br from-accent/10 via-primary/10 to-success/10 border-accent/20">
                <h3 className="text-lg font-semibold mb-4 gradient-text">⚡ Optimale Lösung gefunden</h3>
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

export default SolutionForge;
