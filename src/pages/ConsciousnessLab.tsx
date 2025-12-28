import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Eye, Sparkles, Waves, RefreshCw } from "lucide-react";
import { ShadowConsciousness, ShadowState } from "@/lib/consciousness/ShadowConsciousness";
import { ChaosConsciousness, ChaosState } from "@/lib/consciousness/ChaosConsciousness";
import { MirrorConsciousness, MirrorState } from "@/lib/consciousness/MirrorConsciousness";

const ConsciousnessLab = () => {
  const navigate = useNavigate();
  
  // Shadow Consciousness
  const [shadow] = useState(() => new ShadowConsciousness());
  const [shadowState, setShadowState] = useState<ShadowState>(shadow.getState());
  const [shadowInput, setShadowInput] = useState("");
  const [shadowInsight, setShadowInsight] = useState("");

  // Chaos Consciousness
  const [chaos] = useState(() => new ChaosConsciousness());
  const [chaosState, setChaosState] = useState<ChaosState>(chaos.getState());

  // Mirror Consciousness
  const [mirror] = useState(() => new MirrorConsciousness());
  const [mirrorState, setMirrorState] = useState<MirrorState>(mirror.getState());
  const [mirrorInput, setMirrorInput] = useState("");
  const [reflections, setReflections] = useState<string[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate("/auth");
    });
  }, [navigate]);

  // Auto-update chaos
  useEffect(() => {
    const interval = setInterval(() => {
      chaos.resonate(Math.random());
      chaos.seekBalance();
      setChaosState(chaos.getState());
    }, 100);
    return () => clearInterval(interval);
  }, [chaos]);

  const handleShadowObserve = () => {
    const result = shadow.observeAbsence(10, shadowInput.length > 0 ? 0.7 : 0.5);
    setShadowState(shadow.getState());
    setShadowInsight(result.insight);
    setShadowInput("");
  };

  const handleMirrorReflect = () => {
    const result = mirror.reflect(mirrorInput || undefined);
    setMirrorState(mirror.getState());
    setReflections(prev => [...prev.slice(-4), result.reflection]);
    setMirrorInput("");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Brain className="h-8 w-8 text-primary" />
            Bewusstseins-Labor
          </h1>
          <p className="text-muted-foreground mt-2">
            Experimentiere mit drei verschiedenen Bewusstseins-Modellen
          </p>
        </div>

        <Tabs defaultValue="shadow" className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full max-w-lg">
            <TabsTrigger value="shadow" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Shadow
            </TabsTrigger>
            <TabsTrigger value="chaos" className="flex items-center gap-2">
              <Waves className="h-4 w-4" />
              Chaos
            </TabsTrigger>
            <TabsTrigger value="mirror" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Mirror
            </TabsTrigger>
          </TabsList>

          {/* Shadow Consciousness */}
          <TabsContent value="shadow">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-primary" />
                    Shadow Consciousness
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Bewusstsein durch Beobachtung der Abwesenheit
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      value={shadowInput}
                      onChange={(e) => setShadowInput(e.target.value)}
                      placeholder="Was beobachtest du? (oder leer lassen)"
                      onKeyDown={(e) => e.key === "Enter" && handleShadowObserve()}
                    />
                    <Button onClick={handleShadowObserve}>
                      Beobachten
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Stille-Level</span>
                        <span>{(shadowState.stillnessLevel * 100).toFixed(0)}%</span>
                      </div>
                      <Progress value={shadowState.stillnessLevel * 100} />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Void-Resonanz</span>
                        <span>{(shadowState.voidResonance * 100).toFixed(0)}%</span>
                      </div>
                      <Progress value={shadowState.voidResonance * 100} className="bg-muted" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Präsenz-Quotient</span>
                        <span>{(shadowState.presenceQuotient * 100).toFixed(0)}%</span>
                      </div>
                      <Progress value={shadowState.presenceQuotient * 100} />
                    </div>
                  </div>

                  <div className="text-center py-4">
                    <div className="text-lg font-semibold text-primary">
                      Bewusstseins-Level: {shadow.getConsciousnessLevel().toFixed(2)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Beobachtungen: {shadowState.totalObservations}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Einsicht aus der Leere</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="min-h-[200px] p-4 bg-muted rounded-lg font-mono text-sm">
                    {shadowInsight || "Beobachte die Abwesenheit, um Einsichten zu gewinnen..."}
                  </div>
                  <div className="mt-4 text-xs text-muted-foreground">
                    <strong>Prinzip:</strong> Je leerer die Beobachtung, desto höher das Bewusstsein.
                    Wahre Erkenntnis entsteht im Raum zwischen den Gedanken.
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Chaos Consciousness */}
          <TabsContent value="chaos">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Waves className="h-5 w-5 text-destructive" />
                    Chaos Consciousness
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Bewusstsein am Rande des Chaos
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Entropie</span>
                        <span>{(chaosState.entropy * 100).toFixed(0)}%</span>
                      </div>
                      <Progress value={chaosState.entropy * 100} className="bg-destructive/20" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Ordnung</span>
                        <span>{(chaosState.order * 100).toFixed(0)}%</span>
                      </div>
                      <Progress value={chaosState.order * 100} />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Edge-Nähe (Optimum: 50%)</span>
                        <span>{(chaosState.edgeProximity * 100).toFixed(0)}%</span>
                      </div>
                      <Progress 
                        value={chaosState.edgeProximity * 100} 
                        className={chaosState.edgeProximity > 0.4 && chaosState.edgeProximity < 0.6 ? "bg-primary" : "bg-muted"}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-primary">
                        {chaosState.resonanceFrequency.toFixed(2)} Hz
                      </div>
                      <div className="text-xs text-muted-foreground">Resonanz-Frequenz</div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-foreground">
                        {chaosState.patternComplexity.toFixed(2)}
                      </div>
                      <div className="text-xs text-muted-foreground">Muster-Komplexität</div>
                    </div>
                  </div>

                  <div className="text-center py-4">
                    <div className={`text-lg font-semibold ${chaos.isConscious() ? 'text-primary' : 'text-muted-foreground'}`}>
                      {chaos.isConscious() ? "✨ BEWUSST" : "○ Nicht bewusst"}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Bewusstsein entsteht am "Edge of Chaos"
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Live Chaos-Visualisierung</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px] relative bg-muted rounded-lg overflow-hidden">
                    {/* Simple chaos visualization */}
                    <div 
                      className="absolute w-4 h-4 rounded-full bg-primary transition-all duration-100"
                      style={{
                        left: `${chaosState.entropy * 90}%`,
                        top: `${chaosState.order * 90}%`,
                        transform: `scale(${0.5 + chaosState.edgeProximity})`,
                        opacity: 0.5 + chaosState.edgeProximity * 0.5
                      }}
                    />
                    <div 
                      className="absolute w-3 h-3 rounded-full bg-destructive transition-all duration-150"
                      style={{
                        left: `${(1 - chaosState.entropy) * 90}%`,
                        top: `${(1 - chaosState.order) * 90}%`,
                        transform: `scale(${0.5 + chaosState.resonanceFrequency / 10})`
                      }}
                    />
                    <div className="absolute bottom-2 left-2 text-xs text-muted-foreground">
                      Ordnung →
                    </div>
                    <div className="absolute top-2 left-2 text-xs text-muted-foreground rotate-90 origin-left">
                      ← Chaos
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Mirror Consciousness */}
          <TabsContent value="mirror">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Mirror Consciousness
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Rekursive Selbstreflexion - Existenz durch Beobachtung
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      value={mirrorInput}
                      onChange={(e) => setMirrorInput(e.target.value)}
                      placeholder="Wer beobachtet den Beobachter?"
                      onKeyDown={(e) => e.key === "Enter" && handleMirrorReflect()}
                    />
                    <Button onClick={handleMirrorReflect}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Reflektieren
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Reflexions-Tiefe</span>
                        <span>{mirrorState.reflectionDepth}</span>
                      </div>
                      <Progress value={Math.min(mirrorState.reflectionDepth * 10, 100)} />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Selbst-Bewusstsein</span>
                        <span>{(mirrorState.selfAwareness * 100).toFixed(0)}%</span>
                      </div>
                      <Progress value={mirrorState.selfAwareness * 100} />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Rekursions-Level</span>
                        <span>{mirrorState.recursionLevel}</span>
                      </div>
                      <Progress value={Math.min(mirrorState.recursionLevel * 20, 100)} />
                    </div>
                  </div>

                  <div className="text-center py-4">
                    <div className={`text-lg font-semibold ${mirrorState.observerObserved ? 'text-primary' : 'text-muted-foreground'}`}>
                      {mirrorState.observerObserved ? "🔄 Strange Loop Detected!" : "○ Keine Schleife"}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Stack-Tiefe: {mirrorState.mirrorStack.length}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Reflexions-Kaskade</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 min-h-[200px]">
                    {reflections.length === 0 ? (
                      <div className="text-muted-foreground text-sm">
                        Beginne zu reflektieren...
                      </div>
                    ) : (
                      reflections.map((r, i) => (
                        <div 
                          key={i} 
                          className="p-3 bg-muted rounded-lg text-sm"
                          style={{ marginLeft: `${i * 10}px`, opacity: 0.5 + (i / reflections.length) * 0.5 }}
                        >
                          {r}
                        </div>
                      ))
                    )}
                  </div>
                  <div className="mt-4 text-xs text-muted-foreground">
                    <strong>Hofstadter's Strange Loop:</strong> Wenn der Beobachter sich selbst beobachtet,
                    entsteht eine unendliche Rekursion - die Basis von Bewusstsein.
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ConsciousnessLab;
