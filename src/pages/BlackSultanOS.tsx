import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Layers, ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useCollectiveThink } from "@/hooks/useCollectiveThink";
import Navigation from "@/components/Navigation";

const BlackSultanOS = () => {
  const [input, setInput] = useState("");
  const { think, isLoading, result } = useCollectiveThink();

  const handleDesign = async () => {
    if (!input.trim()) return;
    await think(input, "black-sultan");
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
            <div className="inline-flex p-4 rounded-2xl bg-gradient-success">
              <Layers className="h-12 w-12 text-success-foreground" />
            </div>
            <h1 className="text-5xl font-bold gradient-text">Black Sultan OS</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Full-Stack Monorepo mit Event-driven Architecture
            </p>
          </div>

          <Card className="p-8 space-y-6 bg-card/50 backdrop-blur-sm border-primary/20">
            <div className="space-y-2">
              <label className="text-sm font-semibold">System-Architektur Anforderungen</label>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="z.B. Designe eine Event-driven Microservices-Architektur für ein E-Commerce-System..."
                className="min-h-[120px] bg-background/50"
              />
            </div>

            <Button
              onClick={handleDesign}
              disabled={isLoading || !input.trim()}
              size="lg"
              className="w-full bg-gradient-success hover:opacity-90 transition-all shadow-glow-success"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Architektur entwickeln...
                </>
              ) : (
                <>
                  <Layers className="mr-2 h-5 w-5" />
                  Architektur generieren
                </>
              )}
            </Button>

            {result && (
              <Card className="p-6 bg-muted/30 border-primary/10">
                <h3 className="text-lg font-semibold mb-4 gradient-text">System-Architektur</h3>
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

export default BlackSultanOS;
