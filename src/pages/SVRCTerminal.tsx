import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Terminal, CheckCircle, XCircle, HelpCircle, AlertTriangle } from "lucide-react";
import { SVRCDecisionEngine, EvaluationResult, Axiom, TruthValue } from "@/lib/svrc/DecisionEngine";

interface HistoryEntry {
  statement: string;
  result: EvaluationResult;
  timestamp: Date;
}

const SVRCTerminal = () => {
  const navigate = useNavigate();
  const [engine] = useState(() => new SVRCDecisionEngine());
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [axioms, setAxioms] = useState<Axiom[]>([]);
  const [newAxiomName, setNewAxiomName] = useState("");
  const [newAxiomValue, setNewAxiomValue] = useState<boolean | null>(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate("/auth");
    });
  }, [navigate]);

  useEffect(() => {
    setAxioms(engine.getAxioms());
  }, [engine]);

  const handleEvaluate = () => {
    if (!input.trim()) return;
    
    const result = engine.evaluate(input);
    setHistory(prev => [{
      statement: input,
      result,
      timestamp: new Date()
    }, ...prev].slice(0, 20));
    setInput("");
  };

  const handleAddAxiom = () => {
    if (!newAxiomName.trim()) return;
    engine.addAxiom(
      `custom_${Date.now()}`,
      newAxiomName,
      newAxiomValue === true,
      []
    );
    setAxioms(engine.getAxioms());
    setNewAxiomName("");
  };

  const getResultIcon = (result: EvaluationResult) => {
    switch (result.value) {
      case "TRUE": return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "FALSE": return <XCircle className="h-5 w-5 text-destructive" />;
      case "UNDECIDABLE": return <HelpCircle className="h-5 w-5 text-yellow-500" />;
      case "PARADOX": return <AlertTriangle className="h-5 w-5 text-orange-500" />;
    }
  };

  const getResultColor = (value: TruthValue) => {
    switch (value) {
      case "TRUE": return "bg-green-500/20 text-green-500 border-green-500/30";
      case "FALSE": return "bg-destructive/20 text-destructive border-destructive/30";
      case "UNDECIDABLE": return "bg-yellow-500/20 text-yellow-500 border-yellow-500/30";
      case "PARADOX": return "bg-orange-500/20 text-orange-500 border-orange-500/30";
    }
  };

  const exampleStatements = [
    "WENN (nonce wiederverwendet) DANN (Schlüssel berechenbar)",
    "sha256 ist invertierbar",
    "ECDLP ist leicht",
    "2 + 2 = 4",
    "Dieser Satz ist falsch",
    "random > deterministic",
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Terminal className="h-8 w-8 text-primary" />
            SVRC Terminal
          </h1>
          <p className="text-muted-foreground mt-2">
            Smart Validator for Reasoning & Consistency - Logik-Prüfer mit Paradox-Erkennung
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Terminal */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Aussagen evaluieren</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Gib eine Aussage ein..."
                  onKeyDown={(e) => e.key === "Enter" && handleEvaluate()}
                  className="font-mono"
                />
                <Button onClick={handleEvaluate}>
                  Evaluieren
                </Button>
              </div>

              {/* Example buttons */}
              <div className="flex flex-wrap gap-2">
                {exampleStatements.map((stmt, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    size="sm"
                    onClick={() => setInput(stmt)}
                    className="text-xs"
                  >
                    {stmt.slice(0, 25)}...
                  </Button>
                ))}
              </div>

              {/* History */}
              <div className="space-y-2 mt-6">
                <h3 className="font-semibold text-sm text-muted-foreground">Historie</h3>
                {history.length === 0 ? (
                  <div className="text-muted-foreground text-sm p-4 bg-muted rounded-lg">
                    Noch keine Evaluierungen...
                  </div>
                ) : (
                  history.map((entry, i) => (
                    <div 
                      key={i} 
                      className="flex items-center justify-between p-3 bg-muted rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                      {getResultIcon(entry.result)}
                        <span className="font-mono text-sm">{entry.statement}</span>
                      </div>
                      <Badge className={getResultColor(entry.result.value)}>
                        {entry.result.value}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Axioms Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Axiome
                <Badge variant="outline">{axioms.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add new axiom */}
              <div className="space-y-2">
                <Input
                  value={newAxiomName}
                  onChange={(e) => setNewAxiomName(e.target.value)}
                  placeholder="Neues Axiom..."
                  className="text-sm"
                />
                <div className="flex gap-2">
                  <Button
                    variant={newAxiomValue === true ? "default" : "outline"}
                    size="sm"
                    onClick={() => setNewAxiomValue(true)}
                    className="flex-1"
                  >
                    TRUE
                  </Button>
                  <Button
                    variant={newAxiomValue === false ? "default" : "outline"}
                    size="sm"
                    onClick={() => setNewAxiomValue(false)}
                    className="flex-1"
                  >
                    FALSE
                  </Button>
                  <Button
                    variant={newAxiomValue === null ? "default" : "outline"}
                    size="sm"
                    onClick={() => setNewAxiomValue(null)}
                    className="flex-1"
                  >
                    ?
                  </Button>
                </div>
                <Button onClick={handleAddAxiom} className="w-full" size="sm">
                  Hinzufügen
                </Button>
              </div>

              {/* Axiom list */}
              <div className="space-y-1 max-h-[400px] overflow-y-auto">
                {axioms.map((axiom, i) => (
                  <div 
                    key={i} 
                    className="flex items-center justify-between p-2 text-sm bg-muted rounded"
                  >
                    <span className="truncate flex-1">{axiom.statement}</span>
                    <Badge
                      variant="outline" 
                      className={
                        axiom.value === true ? "text-green-500" :
                        axiom.value === false ? "text-destructive" :
                        "text-yellow-500"
                      }
                    >
                      {axiom.value === true ? "T" : axiom.value === false ? "F" : "?"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Wie funktioniert SVRC?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="font-semibold">TRUE</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Aussage ist wahr basierend auf Axiomen und logischen Regeln
                  </p>
                </div>
                <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle className="h-5 w-5 text-destructive" />
                    <span className="font-semibold">FALSE</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Aussage widerspricht bekannten Axiomen oder ist logisch falsch
                  </p>
                </div>
                <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <HelpCircle className="h-5 w-5 text-yellow-500" />
                    <span className="font-semibold">UNDECIDABLE</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Aussage kann mit verfügbaren Axiomen nicht entschieden werden
                  </p>
                </div>
                <div className="p-4 bg-orange-500/10 rounded-lg border border-orange-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    <span className="font-semibold">PARADOX</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Selbstreferenzieller Widerspruch erkannt (Tarjan SCC)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SVRCTerminal;
