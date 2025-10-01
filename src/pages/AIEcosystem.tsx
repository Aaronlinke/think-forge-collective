import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Bot, ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useCollectiveThink } from "@/hooks/useCollectiveThink";
import Navigation from "@/components/Navigation";

const AIEcosystem = () => {
  const [input, setInput] = useState("");
  const { think, isLoading, result } = useCollectiveThink();

  const handleAnalyze = async () => {
    if (!input.trim()) return;
    await think(input, "ai-ecosystem");
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
            <div className="inline-flex p-4 rounded-2xl bg-gradient-secondary">
              <Bot className="h-12 w-12 text-secondary-foreground" />
            </div>
            <h1 className="text-5xl font-bold gradient-text">AI Ecosystem Hub</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Zentrale Steuerung für autonome KI-Agenten und Bots
            </p>
          </div>

          <Card className="p-8 space-y-6 bg-card/50 backdrop-blur-sm border-primary/20">
            <div className="space-y-2">
              <label className="text-sm font-semibold">Aufgabe für Multi-Agent System</label>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="z.B. Erstelle einen automatisierten Workflow für Kundensupport mit mehreren spezialisierten Agenten..."
                className="min-h-[120px] bg-background/50"
              />
            </div>

            <Button
              onClick={handleAnalyze}
              disabled={isLoading || !input.trim()}
              size="lg"
              className="w-full bg-gradient-secondary hover:opacity-90 transition-all shadow-glow-secondary"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Agenten koordinieren...
                </>
              ) : (
                <>
                  <Bot className="mr-2 h-5 w-5" />
                  Agent-Strategie erstellen
                </>
              )}
            </Button>

            {result && (
              <Card className="p-6 bg-muted/30 border-primary/10">
                <h3 className="text-lg font-semibold mb-4 gradient-text">Agent-Koordination</h3>
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

export default AIEcosystem;
