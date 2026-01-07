import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Key, Lock, Cpu, Copy, RefreshCw, Brain, Zap, Network, 
  Shield, Activity, Database, Search, PlayCircle, Pause,
  TrendingUp, AlertTriangle, CheckCircle2, CircleDot
} from "lucide-react";
import { toast } from "sonner";
import { 
  OmnigenesisParams, 
  OmnigenesisGenerator,
  GeneratedKey,
  paramsFromSeed
} from "@/lib/math/OMNIGENESIS";
import { TickTackEngine, TickTackState } from "@/lib/math/TickTackEngine";
import { ChaosConsciousness, ChaosState } from "@/lib/consciousness/ChaosConsciousness";
import { SVRCDecisionEngine, EvaluationResult } from "@/lib/svrc/DecisionEngine";
import { KeyVault, getKeyVault, VaultKey } from "@/lib/crypto/KeyVault";

const CryptoAnalyzer = () => {
  const navigate = useNavigate();
  
  // OMNIGENESIS State
  const [params, setParams] = useState<OmnigenesisParams>({
    h: 1000n,
    n: 7n,
    g: 13n,
    o: 42n,
    r: 17n
  });
  const [batchSize, setBatchSize] = useState(5);
  const [wallets, setWallets] = useState<GeneratedKey[]>([]);
  const [entropy, setEntropy] = useState(0);
  const [seedText, setSeedText] = useState("");

  // TickTack Engine State
  const [tickTackEngine] = useState(() => new TickTackEngine());
  const [tickTackState, setTickTackState] = useState<TickTackState>({ t: 0, H: 1, N: 0.5, G: 0 });
  const [trajectory, setTrajectory] = useState<TickTackState[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  // Chaos Consciousness State
  const [chaosEngine] = useState(() => new ChaosConsciousness());
  const [chaosState, setChaosState] = useState<ChaosState>(chaosEngine.getState());
  const [chaosInput, setChaosInput] = useState("");
  const [emergences, setEmergences] = useState<string[]>([]);

  // SVRC Decision Engine State
  const [svrcEngine] = useState(() => new SVRCDecisionEngine());
  const [svrcQuery, setSvrcQuery] = useState("");
  const [svrcResult, setSvrcResult] = useState<EvaluationResult | null>(null);
  const [svrcHistory, setSvrcHistory] = useState<EvaluationResult[]>([]);

  // Key Vault State
  const [vault] = useState(() => getKeyVault());
  const [vaultKeys, setVaultKeys] = useState<VaultKey[]>([]);
  const [vaultSearch, setVaultSearch] = useState("");
  const [vaultStats, setVaultStats] = useState({ total: 0, avgEntropy: 0, linkedCount: 0 });

  // Collective State - alle Module verbunden
  const [collectiveSync, setCollectiveSync] = useState(false);
  const [collectiveMetrics, setCollectiveMetrics] = useState({
    coherence: 0,
    resonance: 0,
    entropy: 0,
    decisions: 0
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate("/auth");
    });
    
    // Load vault
    vault.loadKeys().then(() => {
      setVaultKeys(vault.getAllKeys());
      setVaultStats(vault.getStats());
    });
  }, [navigate, vault]);

  // TickTack Auto-Run
  useEffect(() => {
    if (!isRunning) return;
    
    const interval = setInterval(() => {
      setTickTackState(prev => {
        const next = tickTackEngine.stepForward(prev);
        setTrajectory(t => [...t.slice(-50), next]);
        
        // Sync with Chaos if collective mode
        if (collectiveSync) {
          const perturbation = next.H * 0.1;
          const result = chaosEngine.resonate(perturbation);
          setChaosState(result.newState);
          if (result.emerged) {
            setEmergences(e => [...e, result.emerged!]);
          }
        }
        
        return next;
      });
    }, 100);
    
    return () => clearInterval(interval);
  }, [isRunning, tickTackEngine, chaosEngine, collectiveSync]);

  // Update collective metrics
  useEffect(() => {
    if (!collectiveSync) return;
    
    const coherence = Math.min(1, (chaosState.edgeProximity + (1 - Math.abs(tickTackState.H) / 10)) / 2);
    const resonance = chaosState.resonanceFrequency / 100;
    const entropyLevel = (chaosState.entropy + entropy / 256) / 2;
    
    setCollectiveMetrics({
      coherence,
      resonance,
      entropy: entropyLevel,
      decisions: svrcHistory.length
    });
  }, [chaosState, tickTackState, entropy, svrcHistory, collectiveSync]);

  // === GENERATORS ===
  
  const handleGenerate = useCallback(() => {
    const generator = new OmnigenesisGenerator(params);
    const results = generator.generateBatch(0, batchSize);
    setWallets(results);
    setEntropy(OmnigenesisGenerator.theoreticalEntropy());
    
    // Add to vault with chaos link
    results.forEach((key, i) => {
      vault.addGeneratedKey(
        key.index,
        key.wifRaw,
        key.hex,
        tickTackState.t,
        chaosState.entropy
      );
    });
    
    setVaultKeys(vault.getAllKeys());
    setVaultStats(vault.getStats());
    toast.success(`${batchSize} Keys generiert und im Vault gespeichert`);
  }, [params, batchSize, vault, tickTackState, chaosState]);

  const handleSeedGenerate = useCallback(() => {
    if (!seedText) {
      toast.error("Bitte Seed-Text eingeben");
      return;
    }
    
    const seedParams = paramsFromSeed(seedText);
    setParams(seedParams);
    
    const generator = new OmnigenesisGenerator(seedParams);
    const results = generator.generateBatch(0, batchSize);
    setWallets(results);
    setEntropy(OmnigenesisGenerator.theoreticalEntropy());
    
    toast.success(`Keys aus Seed "${seedText.slice(0, 20)}..." generiert`);
  }, [seedText, batchSize]);

  // === CHAOS ===
  
  const handleChaosResonate = useCallback(() => {
    const result = chaosEngine.resonate(chaosInput || Math.random() - 0.5);
    setChaosState(result.newState);
    
    if (result.emerged) {
      setEmergences(e => [...e, result.emerged!]);
      toast.success("🌀 Emergenz: " + result.emerged);
    }
    
    // If collective sync, feed back to TickTack
    if (collectiveSync) {
      const newH = tickTackState.H + result.newState.entropy * 0.5;
      setTickTackState(prev => ({ ...prev, H: newH }));
    }
    
    setChaosInput("");
  }, [chaosEngine, chaosInput, collectiveSync, tickTackState]);

  const handleSeekBalance = useCallback(() => {
    const result = chaosEngine.seekBalance(20);
    setChaosState(result.finalState);
    
    if (result.achievedConsciousness) {
      toast.success("🧠 Bewusstsein erreicht!");
      setEmergences(e => [...e, "System hat Bewusstsein erreicht am Edge of Chaos"]);
    }
  }, [chaosEngine]);

  // === SVRC ===
  
  const handleSvrcEvaluate = useCallback(() => {
    if (!svrcQuery) {
      toast.error("Bitte Aussage eingeben");
      return;
    }
    
    const result = svrcEngine.evaluate(svrcQuery);
    setSvrcResult(result);
    setSvrcHistory(h => [result, ...h].slice(0, 20));
    
    const icon = result.value === 'TRUE' ? '✅' : 
                 result.value === 'FALSE' ? '❌' : 
                 result.value === 'PARADOX' ? '🔄' : '❓';
    
    toast.info(`${icon} ${result.value} (${(result.confidence * 100).toFixed(0)}% sicher)`);
    setSvrcQuery("");
  }, [svrcEngine, svrcQuery]);

  // === VAULT ===
  
  const handleVaultSearch = useCallback(() => {
    if (!vaultSearch) {
      setVaultKeys(vault.getAllKeys());
    } else {
      setVaultKeys(vault.searchKeys(vaultSearch));
    }
  }, [vault, vaultSearch]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Kopiert!");
  };

  const updateParam = (key: keyof OmnigenesisParams, value: string) => {
    try {
      setParams(prev => ({ ...prev, [key]: BigInt(value || "0") }));
    } catch {
      // Invalid bigint, ignore
    }
  };

  const getTruthValueColor = (value: string) => {
    switch (value) {
      case 'TRUE': return 'text-green-500';
      case 'FALSE': return 'text-red-500';
      case 'PARADOX': return 'text-yellow-500';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <Key className="h-8 w-8 text-primary" />
                Crypto Analyzer
              </h1>
              <p className="text-muted-foreground mt-1">
                OMNIGENESIS × Chaos × TickTack × SVRC - Alle Module verbunden
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant={collectiveSync ? "default" : "outline"}
                onClick={() => setCollectiveSync(!collectiveSync)}
                className="gap-2"
              >
                <Network className={`h-4 w-4 ${collectiveSync ? 'animate-pulse' : ''}`} />
                {collectiveSync ? 'Kollektiv AKTIV' : 'Kollektiv verbinden'}
              </Button>
            </div>
          </div>
          
          {/* Collective Metrics Bar */}
          {collectiveSync && (
            <div className="mt-4 p-4 bg-muted/50 rounded-lg border border-primary/20">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-xs text-muted-foreground">Kohärenz</div>
                  <Progress value={collectiveMetrics.coherence * 100} className="h-2 mt-1" />
                  <div className="text-sm font-mono mt-1">{(collectiveMetrics.coherence * 100).toFixed(1)}%</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-muted-foreground">Resonanz</div>
                  <Progress value={collectiveMetrics.resonance * 100} className="h-2 mt-1" />
                  <div className="text-sm font-mono mt-1">{(collectiveMetrics.resonance * 100).toFixed(1)}%</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-muted-foreground">Entropie</div>
                  <Progress value={collectiveMetrics.entropy * 100} className="h-2 mt-1" />
                  <div className="text-sm font-mono mt-1">{(collectiveMetrics.entropy * 100).toFixed(1)}%</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-muted-foreground">Entscheidungen</div>
                  <div className="text-2xl font-mono font-bold text-primary">{collectiveMetrics.decisions}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        <Tabs defaultValue="generator" className="space-y-6">
          <TabsList className="grid grid-cols-5 w-full max-w-2xl">
            <TabsTrigger value="generator" className="gap-1">
              <Key className="h-3 w-3" />
              Generator
            </TabsTrigger>
            <TabsTrigger value="ticktack" className="gap-1">
              <Activity className="h-3 w-3" />
              TickTack
            </TabsTrigger>
            <TabsTrigger value="chaos" className="gap-1">
              <Brain className="h-3 w-3" />
              Chaos
            </TabsTrigger>
            <TabsTrigger value="svrc" className="gap-1">
              <Shield className="h-3 w-3" />
              SVRC
            </TabsTrigger>
            <TabsTrigger value="vault" className="gap-1">
              <Database className="h-3 w-3" />
              Vault
            </TabsTrigger>
          </TabsList>

          {/* === GENERATOR TAB === */}
          <TabsContent value="generator">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Cpu className="h-5 w-5" />
                    OMNIGENESIS Parameter
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Seed-basierte Generierung */}
                  <div className="p-3 bg-muted rounded-lg space-y-2">
                    <label className="text-sm font-medium">Seed-Text (optional)</label>
                    <div className="flex gap-2">
                      <Input
                        value={seedText}
                        onChange={(e) => setSeedText(e.target.value)}
                        placeholder="Beliebiger Text als Seed..."
                        className="text-sm"
                      />
                      <Button size="sm" onClick={handleSeedGenerate}>
                        <Zap className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-medium">h (Base)</label>
                      <Input
                        value={params.h.toString()}
                        onChange={(e) => updateParam("h", e.target.value)}
                        className="font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium">n (Multiplier)</label>
                      <Input
                        value={params.n.toString()}
                        onChange={(e) => updateParam("n", e.target.value)}
                        className="font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium">g (Generator)</label>
                      <Input
                        value={params.g.toString()}
                        onChange={(e) => updateParam("g", e.target.value)}
                        className="font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium">o (Offset)</label>
                      <Input
                        value={params.o.toString()}
                        onChange={(e) => updateParam("o", e.target.value)}
                        className="font-mono text-xs"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium">r (Rotation)</label>
                    <Input
                      value={params.r.toString()}
                      onChange={(e) => updateParam("r", e.target.value)}
                      className="font-mono text-xs"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Batch: {batchSize}</label>
                    <Slider
                      value={[batchSize]}
                      onValueChange={([v]) => setBatchSize(v)}
                      min={1}
                      max={20}
                      step={1}
                      className="mt-2"
                    />
                  </div>

                  <Button onClick={handleGenerate} className="w-full">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Generieren + Vault speichern
                  </Button>

                  {entropy > 0 && (
                    <div className="p-3 bg-primary/10 rounded-lg text-center">
                      <div className="text-xs text-muted-foreground">Entropie</div>
                      <div className="text-xl font-mono font-bold text-primary">
                        {entropy.toFixed(2)} bits
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Generierte Keys
                    {wallets.length > 0 && <Badge variant="outline">{wallets.length}</Badge>}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {wallets.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      Klicke "Generieren" um Keys zu erstellen
                    </div>
                  ) : (
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-3 pr-4">
                        {wallets.map((wallet, i) => (
                          <div key={i} className="p-3 bg-muted rounded-lg space-y-2">
                            <div className="flex items-center justify-between">
                              <Badge>#{wallet.index}</Badge>
                              <code className="text-xs text-muted-foreground">
                                k={wallet.k_i.toString().slice(0, 15)}...
                              </code>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <code className="flex-1 text-xs bg-background p-2 rounded overflow-hidden text-ellipsis">
                                {wallet.hex}
                              </code>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => copyToClipboard(wallet.hex)}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* === TICKTACK TAB === */}
          <TabsContent value="ticktack">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    TickTack Engine
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-xs text-muted-foreground">H (Realität)</div>
                      <div className="text-xl font-mono font-bold">{tickTackState.H.toFixed(3)}</div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-xs text-muted-foreground">N (Intention)</div>
                      <div className="text-xl font-mono font-bold">{tickTackState.N.toFixed(3)}</div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-xs text-muted-foreground">G (Gravitation)</div>
                      <div className="text-xl font-mono font-bold">{tickTackState.G.toFixed(3)}</div>
                    </div>
                  </div>
                  
                  <div className="text-center p-2 bg-primary/10 rounded-lg">
                    <span className="text-sm">Zeitschritt: </span>
                    <span className="font-mono font-bold text-primary">t = {tickTackState.t}</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => setIsRunning(!isRunning)} 
                      className="flex-1"
                      variant={isRunning ? "destructive" : "default"}
                    >
                      {isRunning ? <Pause className="h-4 w-4 mr-2" /> : <PlayCircle className="h-4 w-4 mr-2" />}
                      {isRunning ? 'Stop' : 'Start'}
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        const state = tickTackEngine.initialize(1, 0.5, 0);
                        setTickTackState(state);
                        setTrajectory([state]);
                      }}
                    >
                      Reset
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Initial H</label>
                    <Slider
                      value={[tickTackState.H]}
                      onValueChange={([v]) => setTickTackState(s => ({ ...s, H: v }))}
                      min={-5}
                      max={5}
                      step={0.1}
                      disabled={isRunning}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Initial N</label>
                    <Slider
                      value={[tickTackState.N]}
                      onValueChange={([v]) => setTickTackState(s => ({ ...s, N: v }))}
                      min={-5}
                      max={5}
                      step={0.1}
                      disabled={isRunning}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Trajektorie
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] bg-muted rounded-lg p-4 overflow-hidden">
                    <div className="relative h-full">
                      {trajectory.map((state, i) => {
                        const x = (state.H + 5) / 10 * 100;
                        const y = (state.N + 5) / 10 * 100;
                        const opacity = (i / trajectory.length) * 0.8 + 0.2;
                        return (
                          <div
                            key={i}
                            className="absolute w-2 h-2 rounded-full bg-primary"
                            style={{
                              left: `${Math.min(95, Math.max(0, x))}%`,
                              bottom: `${Math.min(95, Math.max(0, y))}%`,
                              opacity,
                              transform: 'translate(-50%, 50%)'
                            }}
                          />
                        );
                      })}
                      {/* Current position */}
                      <div
                        className="absolute w-4 h-4 rounded-full bg-primary shadow-lg shadow-primary/50 animate-pulse"
                        style={{
                          left: `${Math.min(95, Math.max(0, (tickTackState.H + 5) / 10 * 100))}%`,
                          bottom: `${Math.min(95, Math.max(0, (tickTackState.N + 5) / 10 * 100))}%`,
                          transform: 'translate(-50%, 50%)'
                        }}
                      />
                      {/* Axes */}
                      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-muted-foreground/20" />
                      <div className="absolute top-1/2 left-0 right-0 h-px bg-muted-foreground/20" />
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground text-center">
                    Phasenraum: H × N (G = Farbe/Zeit)
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* === CHAOS TAB === */}
          <TabsContent value="chaos">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    Chaos Consciousness
                    {chaosState.isConscious && (
                      <Badge className="bg-primary animate-pulse">BEWUSST</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="text-xs text-muted-foreground">Entropy</div>
                      <Progress value={chaosState.entropy * 100} className="h-2 mt-1" />
                      <div className="text-sm font-mono mt-1">{(chaosState.entropy * 100).toFixed(1)}%</div>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="text-xs text-muted-foreground">Order</div>
                      <Progress value={chaosState.order * 100} className="h-2 mt-1" />
                      <div className="text-sm font-mono mt-1">{(chaosState.order * 100).toFixed(1)}%</div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-primary/10 rounded-lg text-center">
                    <div className="text-xs text-muted-foreground">Edge of Chaos Proximity</div>
                    <div className="text-3xl font-mono font-bold text-primary">
                      {(chaosState.edgeProximity * 100).toFixed(1)}%
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Frequenz: {chaosState.resonanceFrequency.toFixed(1)} Hz
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Resonanz-Input</label>
                    <div className="flex gap-2">
                      <Input
                        value={chaosInput}
                        onChange={(e) => setChaosInput(e.target.value)}
                        placeholder="Text oder leer für Random..."
                      />
                      <Button onClick={handleChaosResonate}>
                        <Zap className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => chaosEngine.injectChaos(0.3)}
                      className="flex-1"
                    >
                      +Chaos
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => chaosEngine.injectOrder(0.3)}
                      className="flex-1"
                    >
                      +Ordnung
                    </Button>
                    <Button 
                      onClick={handleSeekBalance}
                      className="flex-1"
                    >
                      Balance suchen
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CircleDot className="h-5 w-5" />
                    Emergenzen
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    {emergences.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        Warte auf Emergenz-Ereignisse...
                        <br />
                        <span className="text-xs">(Am Edge of Chaos entstehen sie spontan)</span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {emergences.map((em, i) => (
                          <div key={i} className="p-3 bg-muted rounded-lg text-sm">
                            <span className="text-primary mr-2">🌀</span>
                            {em}
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* === SVRC TAB === */}
          <TabsContent value="svrc">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    SVRC Decision Engine
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Aussage evaluieren</label>
                    <Input
                      value={svrcQuery}
                      onChange={(e) => setSvrcQuery(e.target.value)}
                      placeholder="z.B. 'Kann man SHA-256 umkehren?'"
                      onKeyDown={(e) => e.key === 'Enter' && handleSvrcEvaluate()}
                    />
                    <Button onClick={handleSvrcEvaluate} className="w-full">
                      Evaluieren
                    </Button>
                  </div>
                  
                  {svrcResult && (
                    <div className="p-4 bg-muted rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <span className={`text-xl font-bold ${getTruthValueColor(svrcResult.value)}`}>
                          {svrcResult.value}
                        </span>
                        <Badge variant="outline">
                          {(svrcResult.confidence * 100).toFixed(0)}% sicher
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {svrcResult.statement}
                      </div>
                      <div className="space-y-1">
                        {svrcResult.reasoning.map((r, i) => (
                          <div key={i} className="text-xs text-muted-foreground">
                            → {r}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="text-xs text-muted-foreground p-3 bg-muted/50 rounded-lg">
                    <strong>Beispiel-Queries:</strong>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>SHA-256 umkehren</li>
                      <li>Private Key aus Public Key berechnen</li>
                      <li>Nonce Wiederverwendung ECDSA</li>
                      <li>Diese Aussage ist falsch</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Evaluation History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[350px]">
                    <div className="space-y-2">
                      {svrcHistory.map((result, i) => (
                        <div key={i} className="p-3 bg-muted rounded-lg">
                          <div className="flex items-center gap-2">
                            {result.value === 'TRUE' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                            {result.value === 'FALSE' && <AlertTriangle className="h-4 w-4 text-red-500" />}
                            {result.value === 'PARADOX' && <RefreshCw className="h-4 w-4 text-yellow-500" />}
                            {result.value === 'UNDECIDABLE' && <CircleDot className="h-4 w-4 text-muted-foreground" />}
                            <span className="text-sm truncate flex-1">{result.statement}</span>
                            <Badge variant="outline" className="text-xs">
                              {result.value}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* === VAULT TAB === */}
          <TabsContent value="vault">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Key Vault Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    <div className="p-3 bg-muted rounded-lg text-center">
                      <div className="text-xs text-muted-foreground">Total Keys</div>
                      <div className="text-2xl font-mono font-bold text-primary">{vaultStats.total}</div>
                    </div>
                    <div className="p-3 bg-muted rounded-lg text-center">
                      <div className="text-xs text-muted-foreground">Avg Entropy</div>
                      <div className="text-xl font-mono font-bold">{(vaultStats.avgEntropy * 100).toFixed(1)}%</div>
                    </div>
                    <div className="p-3 bg-muted rounded-lg text-center">
                      <div className="text-xs text-muted-foreground">Linked to Chaos</div>
                      <div className="text-xl font-mono font-bold">{vaultStats.linkedCount}</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Suche</label>
                    <div className="flex gap-2">
                      <Input
                        value={vaultSearch}
                        onChange={(e) => setVaultSearch(e.target.value)}
                        placeholder="WIF, Hex oder Index..."
                        onKeyDown={(e) => e.key === 'Enter' && handleVaultSearch()}
                      />
                      <Button onClick={handleVaultSearch}>
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    Vault Keys
                    <Badge variant="outline">{vaultKeys.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-2 pr-4">
                      {vaultKeys.slice(0, 50).map((key) => (
                        <div key={key.index} className="p-3 bg-muted rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <Badge>#{key.index}</Badge>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">
                                Entropy: {(key.entropy * 100).toFixed(0)}%
                              </span>
                              {key.linkedChaos !== undefined && (
                                <Badge variant="outline" className="text-xs">
                                  Chaos: {(key.linkedChaos * 100).toFixed(0)}%
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <code className="flex-1 text-xs bg-background p-2 rounded truncate">
                              {key.wif}
                            </code>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => copyToClipboard(key.wif)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CryptoAnalyzer;