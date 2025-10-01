import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Rocket, ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useCollectiveThink } from "@/hooks/useCollectiveThink";
import Navigation from "@/components/Navigation";

const AppCreator = () => {
  const [input, setInput] = useState("");
  const { think, isLoading, result } = useCollectiveThink();

  const handleGenerate = async () => {
    if (!input.trim()) return;
    await think(input, "app-creator");
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
            <div className="inline-flex p-4 rounded-2xl bg-gradient-primary">
              <Rocket className="h-12 w-12 text-primary-foreground" />
            </div>
            <h1 className="text-5xl font-bold gradient-text">App Creator</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              KI-gestützte App-Generierung mit intelligenten Templates
            </p>
          </div>

          <Card className="p-8 space-y-6 bg-card/50 backdrop-blur-sm border-primary/20">
            <div className="space-y-2">
              <label className="text-sm font-semibold">Beschreibe deine App-Idee</label>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="z.B. Eine Social-Media-App für Fotografen mit KI-Bildbearbeitung..."
                className="min-h-[120px] bg-background/50"
              />
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isLoading || !input.trim()}
              size="lg"
              className="w-full bg-gradient-primary hover:opacity-90 transition-all shadow-glow-primary"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Denke nach...
                </>
              ) : (
                <>
                  <Rocket className="mr-2 h-5 w-5" />
                  App-Konzept generieren
                </>
              )}
            </Button>

            {result && (
              <Card className="p-6 bg-muted/30 border-primary/10">
                <h3 className="text-lg font-semibold mb-4 gradient-text">Generiertes App-Konzept</h3>
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

export default AppCreator;
