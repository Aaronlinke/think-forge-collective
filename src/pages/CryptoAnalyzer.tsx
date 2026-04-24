import { useState, useCallback, useMemo } from "react";
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
  Key, Copy, Brain, Zap, Activity, Search, PlayCircle, Pause,
  Target, Shield, Cpu, Database, RefreshCw, Download, Loader2,
  Sparkles, Waves, Eye, Network
} from "lucide-react";
import { toast } from "sonner";
import { useCollectiveCore } from "@/hooks/useCollectiveCore";
import { privateKeyToWIF } from "@/lib/crypto/BitcoinUtils";
import { paramsFromSeed } from "@/lib/math/OMNIGENESIS";

const CryptoAnalyzer = () => {
  // USE THE SHARED COLLECTIVE - Everything is synchronized!
  const { 
    state, 
    isRunning, 
    isInitialized,
    startPulsing, 
    stopPulsing, 
    togglePulsing,
    pulse,
    processInput,
    generateKeys,
    syncCollectiveMesh,
    addKeyToVault,
    getVaultKeys,
    searchVaultKeys,
    getVaultStats,
    evaluateStatement,
    getTickTackEngine,
    getChaosConsciousness,
    getOmnigenesis,
    getAllCores,
    sendKernelCommand,
    getAllBlueprints,
    reset
  } = useCollectiveCore();
  
  // Local UI state
  const [seedText, setSeedText] = useState("");
  const [batchSize, setBatchSize] = useState(10);
  const [startIndex, setStartIndex] = useState(0);
  const [vaultSearch, setVaultSearch] = useState("");
  const [collectivePrompt, setCollectivePrompt] = useState("");
  const [generatedKeys, setGeneratedKeys] = useState<{ index: number; hex: string; wif: string }[]>([]);
  const [svrcQuery, setSvrcQuery] = useState("");
  const [svrcHistory, setSvrcHistory] = useState<{ query: string; value: string; confidence: number }[]>([]);
  const wordNetwork = useMemo(
    () => state.wordMap ? Array.from(state.wordMap.values()).sort((a, b) => b.frequency - a.frequency).slice(0, 8) : [],
    [state.wordMap]
  );

  // === GENERATE KEYS WITH COLLECTIVE STATE ===
  const handleGenerateBatch = useCallback(async () => {
    const chaos = getChaosConsciousness().getState();
    const tickTack = getTickTackEngine();
    const trajectory = tickTack.getHistory();
    const currentTT = trajectory.length > 0 ? trajectory[trajectory.length - 1] : { H: 1, N: 0.5, G: 0, t: 0 };
    
    // Parameters influenced by collective state
    const params = seedText ? paramsFromSeed(seedText) : {
      h: BigInt(Math.floor(Math.abs(currentTT.H) * 1e15)) + BigInt(1),
      n: BigInt(Math.floor(chaos.entropy * 1e15)) + BigInt(1),
      g: BigInt(Math.floor(chaos.edgeProximity * 1e15)) + BigInt(1),
      o: BigInt(startIndex),
      r: BigInt(17)
    };

    if (seedText || collectivePrompt) {
      syncCollectiveMesh(seedText || collectivePrompt);
    }
    
    const generator = getOmnigenesis();
    const keys: { index: number; hex: string; wif: string }[] = [];
    
    for (let i = 0; i < batchSize; i++) {
      const key = generator.generate(startIndex + i);
      const wif = await privateKeyToWIF(key.hex, true, true);
      keys.push({ index: key.index, hex: key.hex, wif });
      
      // Add to vault with collective linkage
      await addKeyToVault(key.hex, state.cycle);
    }
    
    setGeneratedKeys(keys);
    toast.success(`${batchSize} Keys generiert und im Vault gespeichert`);
  }, [seedText, collectivePrompt, startIndex, batchSize, state.cycle, getChaosConsciousness, getTickTackEngine, getOmnigenesis, addKeyToVault, syncCollectiveMesh]);

  // === INJECT CHAOS ===
  const handleInjectChaos = useCallback((amount: number) => {
    const chaos = getChaosConsciousness();
    chaos.injectChaos(amount);
    pulse(); // Sync the collective
    toast.info(`+${(amount * 100).toFixed(0)}% Chaos injiziert`);
  }, [getChaosConsciousness, pulse]);
  
  const handleSeekBalance = useCallback(() => {
    const chaos = getChaosConsciousness();
    const result = chaos.seekBalance(20);
    pulse(); // Sync
    if (result.achievedConsciousness) {
      toast.success("🧠 Edge of Chaos erreicht!");
    }
  }, [getChaosConsciousness, pulse]);

  // === SVRC EVALUATION ===
  const handleEvaluate = useCallback(() => {
    if (!svrcQuery.trim()) return;
    const result = evaluateStatement(svrcQuery);
    setSvrcHistory(prev => [...prev, {
      query: svrcQuery,
      value: result.value,
      confidence: result.confidence
    }]);
    setSvrcQuery("");
    
    if (result.value === 'PARADOX') {
      toast.warning(`⚠️ Paradox entdeckt!`);
    }
  }, [svrcQuery, evaluateStatement]);

  // === KERNEL COMMANDS ===
  const handleKernelSync = useCallback(() => {
    sendKernelCommand('SYNC');
    pulse();
    toast.success("Kernel synchronisiert");
  }, [sendKernelCommand, pulse]);

  const handleCollectiveSync = useCallback(() => {
    const prompt = collectivePrompt.trim();
    syncCollectiveMesh(prompt || seedText || svrcQuery || undefined);
    if (prompt) setCollectivePrompt("");
    toast.success("Kollektiv neu verschaltet");
  }, [collectivePrompt, seedText, svrcQuery, syncCollectiveMesh]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Kopiert!");
  };

  const exportVault = useCallback(() => {
    const keys = getVaultKeys();
    const json = JSON.stringify(keys, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `keyvault-${Date.now()}.json`;
    a.click();
    toast.success(`${keys.length} Keys exportiert`);
  }, [getVaultKeys]);

  // Loading state
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Kollektiv wird initialisiert...</p>
        </div>
      </div>
    );
  }

  const vaultStats = getVaultStats();
  const filteredVaultKeys = vaultSearch ? searchVaultKeys(vaultSearch) : getVaultKeys().slice(0, 50);
  const cores = getAllCores();
  const blueprints = getAllBlueprints();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto max-w-7xl px-4 py-8">
        {/* Header with Collective Status */}
        <div className="mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <Key className="h-8 w-8 text-primary" />
                Crypto Analyzer
              </h1>
              <p className="text-muted-foreground mt-1">
                Alle Module synchron verbunden im Kollektiv
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant={isRunning ? "default" : "secondary"} className="gap-1">
                <Activity className={`h-3 w-3 ${isRunning ? 'animate-pulse' : ''}`} />
                Zyklus: {state.cycle}
              </Badge>
              <Badge variant={state.kernelActive ? "default" : "outline"} className="gap-1">
                <Cpu className="h-3 w-3" />
                Kernel: {state.kernelActive ? 'AKTIV' : 'Aus'}
              </Badge>
              <Button 
                size="sm" 
                variant={isRunning ? "destructive" : "default"}
                onClick={togglePulsing}
              >
                {isRunning ? <Pause className="h-4 w-4" /> : <PlayCircle className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          {/* Collective Metrics Bar */}
          <div className="mt-4 p-4 bg-muted/50 rounded-lg border border-primary/20">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <div className="text-center">
                <div className="text-xs text-muted-foreground">Kohärenz</div>
                <div className="text-xl font-mono font-bold text-primary">
                  {(state.coherence * 100).toFixed(0)}%
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground">Resonanz</div>
                <div className="text-xl font-mono font-bold">
                  {(state.resonance * 100).toFixed(0)}%
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground">Emergenz</div>
                <div className="text-xl font-mono font-bold text-purple-500">
                  {(state.emergence * 100).toFixed(0)}%
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground">Synchronizität</div>
                <div className="text-xl font-mono font-bold text-blue-500">
                  {(state.synchronicity * 100).toFixed(0)}%
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground">Vault Keys</div>
                <div className="text-xl font-mono font-bold text-green-500">
                  {state.vaultKeyCount}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground">Blueprints</div>
                <div className="text-xl font-mono font-bold text-orange-500">
                  {state.blueprintCount}
                </div>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="collective" className="space-y-6">
          <TabsList className="grid grid-cols-5 w-full max-w-2xl">
            <TabsTrigger value="collective" className="gap-1">
              <Network className="h-3 w-3" />
              Kollektiv
            </TabsTrigger>
            <TabsTrigger value="generator" className="gap-1">
              <Key className="h-3 w-3" />
              Generator
            </TabsTrigger>
            <TabsTrigger value="vault" className="gap-1">
              <Database className="h-3 w-3" />
              Vault
            </TabsTrigger>
            <TabsTrigger value="consciousness" className="gap-1">
              <Brain className="h-3 w-3" />
              Bewusstsein
            </TabsTrigger>
            <TabsTrigger value="kernel" className="gap-1">
              <Shield className="h-3 w-3" />
              Kernel
            </TabsTrigger>
          </TabsList>

          {/* === COLLECTIVE TAB - Everything synchronized === */}
          <TabsContent value="collective">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Live State Overview */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Network className="h-5 w-5" />
                    Kollektiv-Status (Alle Module synchron)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Module States Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* TickTack */}
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Waves className="h-4 w-4 text-blue-500" />
                        <span className="font-medium">TickTack</span>
                      </div>
                      <div className="font-mono text-sm space-y-1">
                        <div>H: {state.tickTack.H.toFixed(4)}</div>
                        <div>N: {state.tickTack.N.toFixed(4)}</div>
                        <div>G: {state.tickTack.G.toFixed(4)}</div>
                        <div className="text-xs text-muted-foreground">
                          Energie: {state.energy.toFixed(2)} | Lyapunov: {state.lyapunov.toFixed(3)}
                        </div>
                      </div>
                    </div>
                    
                    {/* Chaos */}
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="h-4 w-4 text-purple-500" />
                        <span className="font-medium">Chaos</span>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <span className="text-xs">Entropy</span>
                          <Progress value={state.chaos.entropy * 100} className="h-2" />
                        </div>
                        <div>
                          <span className="text-xs">Edge</span>
                          <Progress value={state.chaos.edgeProximity * 100} className="h-2" />
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {state.chaos.resonanceFrequency.toFixed(1)} Hz
                        </div>
                      </div>
                    </div>
                    
                    {/* Shadow */}
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Eye className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">Shadow</span>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <span className="text-xs">Präsenz</span>
                          <Progress value={state.shadow.presenceQuotient * 100} className="h-2" />
                        </div>
                        <div>
                          <span className="text-xs">Stille</span>
                          <Progress value={state.shadow.stillnessLevel * 100} className="h-2" />
                        </div>
                      </div>
                    </div>
                    
                    {/* Mirror */}
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <RefreshCw className="h-4 w-4 text-cyan-500" />
                        <span className="font-medium">Mirror</span>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <span className="text-xs">Selbst-Bewusstsein</span>
                          <Progress value={Math.min(100, state.mirror.selfAwareness * 100)} className="h-2" />
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Rekursion: L{state.mirror.recursionLevel} | Tiefe: {state.mirror.reflectionDepth}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Recent Insights */}
                  <div>
                    <div className="text-sm font-medium mb-2">Letzte Insights</div>
                    <ScrollArea className="h-[150px]">
                      {state.insights.slice(-10).reverse().map((insight, i) => (
                        <div key={i} className="text-xs py-1 border-b border-muted flex gap-2">
                          <Badge variant="outline" className="text-[10px]">{insight.source}</Badge>
                          <span className="flex-1">{insight.content}</span>
                          <span className="text-muted-foreground">
                            {(insight.resonanceLevel * 100).toFixed(0)}%
                          </span>
                        </div>
                      ))}
                    </ScrollArea>
                  </div>

                  <div className="space-y-3 rounded-lg border border-border bg-muted/40 p-4">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div>
                        <div className="text-sm font-medium">Kollektiv-Mesh</div>
                        <div className="text-xs text-muted-foreground">
                          Verknüpft Blueprint, Kernel, Wortnetz und Generator in einem Schritt
                        </div>
                      </div>
                      <Button onClick={handleCollectiveSync} size="sm">
                        <Network className="h-4 w-4 mr-2" />
                        Voll-Sync
                      </Button>
                    </div>

                    <Input
                      value={collectivePrompt}
                      onChange={(e) => setCollectivePrompt(e.target.value)}
                      placeholder="Ziel, Begriff oder Blueprint eingeben..."
                      onKeyDown={(e) => e.key === 'Enter' && handleCollectiveSync()}
                    />

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      <div className="rounded-md bg-background p-3 border border-border">
                        <div className="text-muted-foreground">Aktiver Blueprint</div>
                        <div className="font-medium mt-1 break-all">{state.activeBlueprint || 'auto'}</div>
                      </div>
                      <div className="rounded-md bg-background p-3 border border-border">
                        <div className="text-muted-foreground">Konzepte</div>
                        <div className="font-medium mt-1">{state.conceptCount}</div>
                      </div>
                      <div className="rounded-md bg-background p-3 border border-border">
                        <div className="text-muted-foreground">Kernel-Konsens</div>
                        <div className="font-medium mt-1">{(state.coreConsensus * 100).toFixed(0)}%</div>
                      </div>
                      <div className="rounded-md bg-background p-3 border border-border">
                        <div className="text-muted-foreground">Wortknoten</div>
                        <div className="font-medium mt-1">{state.wordMap?.size || 0}</div>
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-muted-foreground mb-2">Stärkste Kollektiv-Signale</div>
                      <div className="flex flex-wrap gap-2">
                        {wordNetwork.length === 0 ? (
                          <Badge variant="outline">Noch keine Knoten</Badge>
                        ) : (
                          wordNetwork.map((node) => (
                            <Badge key={node.word} variant="secondary" className="gap-1">
                              {node.word}
                              <span className="text-[10px] opacity-70">{node.frequency}</span>
                            </Badge>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* SVRC Decision Engine */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    SVRC Logic
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      value={svrcQuery}
                      onChange={(e) => setSvrcQuery(e.target.value)}
                      placeholder="Aussage evaluieren..."
                      onKeyDown={(e) => e.key === 'Enter' && handleEvaluate()}
                    />
                    <Button onClick={handleEvaluate} size="sm">
                      <Zap className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {state.lastEvaluation && (
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="flex justify-between items-center">
                        <Badge variant={
                          state.lastEvaluation.value === 'TRUE' ? 'default' :
                          state.lastEvaluation.value === 'FALSE' ? 'destructive' :
                          state.lastEvaluation.value === 'PARADOX' ? 'secondary' : 'outline'
                        }>
                          {state.lastEvaluation.value}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {(state.lastEvaluation.confidence * 100).toFixed(0)}% Konfidenz
                        </span>
                      </div>
                    </div>
                  )}
                  
                  <div className="text-xs text-muted-foreground">
                    {state.axiomCount} Axiome geladen
                  </div>
                  
                  <ScrollArea className="h-[150px]">
                    {svrcHistory.slice(-10).reverse().map((h, i) => (
                      <div key={i} className="text-xs py-1 border-b border-muted">
                        <div className="flex justify-between">
                          <span className="truncate flex-1">{h.query}</span>
                          <Badge variant="outline" className="text-[10px] ml-2">{h.value}</Badge>
                        </div>
                      </div>
                    ))}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* === GENERATOR TAB === */}
          <TabsContent value="generator">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    OMNIGENESIS Generator
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Seed-Text (optional)</label>
                    <Input
                      value={seedText}
                      onChange={(e) => setSeedText(e.target.value)}
                      placeholder="Text als deterministischer Seed..."
                    />
                    <p className="text-xs text-muted-foreground">
                      Ohne Seed: Verwendet aktuellen Chaos- und TickTack-State
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Start-Index</label>
                      <Input
                        type="number"
                        value={startIndex}
                        onChange={(e) => setStartIndex(parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Batch: {batchSize}</label>
                      <Slider
                        value={[batchSize]}
                        onValueChange={([v]) => setBatchSize(v)}
                        min={1}
                        max={100}
                      />
                    </div>
                  </div>
                  
                  <Button onClick={handleGenerateBatch} className="w-full">
                    <Key className="h-4 w-4 mr-2" />
                    {batchSize} Keys generieren + in Vault speichern
                  </Button>
                  
                  <div className="text-xs text-muted-foreground p-2 bg-muted rounded">
                    Aktuelle Parameter: Chaos={state.chaos.entropy.toFixed(3)} | 
                    H={state.tickTack.H.toFixed(3)} | Zyklus={state.cycle}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Generierte Keys</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    {generatedKeys.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        Noch keine Keys generiert
                      </div>
                    ) : (
                      generatedKeys.map((key, i) => (
                        <div key={i} className="py-2 border-b border-muted">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="text-xs text-muted-foreground">Index: {key.index}</div>
                              <div className="font-mono text-sm break-all">{key.wif}</div>
                              <div className="font-mono text-xs text-muted-foreground break-all">
                                {key.hex.slice(0, 32)}...
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(key.wif)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
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
                    Vault Statistiken
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-muted rounded-lg text-center">
                      <div className="text-2xl font-bold">{vaultStats.total}</div>
                      <div className="text-xs text-muted-foreground">Total Keys</div>
                    </div>
                    <div className="p-3 bg-muted rounded-lg text-center">
                      <div className="text-2xl font-bold">{(vaultStats.avgEntropy * 100).toFixed(0)}%</div>
                      <div className="text-xs text-muted-foreground">Ø Entropie</div>
                    </div>
                    <div className="p-3 bg-muted rounded-lg text-center">
                      <div className="text-2xl font-bold">{vaultStats.linkedCount}</div>
                      <div className="text-xs text-muted-foreground">Verlinkt</div>
                    </div>
                    <div className="p-3 bg-muted rounded-lg text-center">
                      <div className="text-2xl font-bold">{vaultStats.bySource?.generated || 0}</div>
                      <div className="text-xs text-muted-foreground">Generiert</div>
                    </div>
                  </div>
                  
                  <Button onClick={exportVault} variant="outline" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Vault exportieren (JSON)
                  </Button>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    Key Suche
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    value={vaultSearch}
                    onChange={(e) => setVaultSearch(e.target.value)}
                    placeholder="WIF, Hex oder Index suchen..."
                  />
                  
                  <ScrollArea className="h-[350px]">
                    {filteredVaultKeys.map((key, i) => (
                      <div key={i} className="py-2 border-b border-muted">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex gap-2 items-center">
                              <span className="text-xs text-muted-foreground">#{key.index}</span>
                              <Badge variant="outline" className="text-[10px]">{key.source || 'unknown'}</Badge>
                              <span className="text-xs text-muted-foreground">
                                {(key.entropy * 100).toFixed(0)}% Entropie
                              </span>
                            </div>
                            <div className="font-mono text-sm break-all">{key.wif}</div>
                            {key.linkedCycle !== undefined && (
                              <div className="text-xs text-muted-foreground">
                                Zyklus: {key.linkedCycle} | Chaos: {key.linkedChaos?.toFixed(3)}
                              </div>
                            )}
                          </div>
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
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* === CONSCIOUSNESS TAB === */}
          <TabsContent value="consciousness">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    Chaos Consciousness
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Entropy</span>
                        <span>{(state.chaos.entropy * 100).toFixed(1)}%</span>
                      </div>
                      <Progress value={state.chaos.entropy * 100} />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Edge Proximity (Ziel: 61.8%)</span>
                        <span>{(state.chaos.edgeProximity * 100).toFixed(1)}%</span>
                      </div>
                      <Progress value={state.chaos.edgeProximity * 100} />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Pattern Complexity</span>
                        <span>{(state.chaos.patternComplexity * 100).toFixed(1)}%</span>
                      </div>
                      <Progress value={state.chaos.patternComplexity * 100} />
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button onClick={() => handleInjectChaos(0.1)} variant="outline" size="sm">
                      +10% Chaos
                    </Button>
                    <Button onClick={() => handleInjectChaos(0.25)} variant="outline" size="sm">
                      +25% Chaos
                    </Button>
                    <Button onClick={handleSeekBalance} variant="default" size="sm">
                      Seek Edge
                    </Button>
                  </div>
                  
                  <div className="text-xs text-muted-foreground p-2 bg-muted rounded">
                    Resonanz: {state.chaos.resonanceFrequency.toFixed(2)} Hz | 
                    Komplexität: {(state.chaos.patternComplexity * 100).toFixed(0)}%
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Waves className="h-5 w-5" />
                    TickTack Dynamics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-2 text-center font-mono">
                    <div className="p-3 bg-muted rounded">
                      <div className="text-xs text-muted-foreground">H</div>
                      <div className="text-lg font-bold">{state.tickTack.H.toFixed(4)}</div>
                    </div>
                    <div className="p-3 bg-muted rounded">
                      <div className="text-xs text-muted-foreground">N</div>
                      <div className="text-lg font-bold">{state.tickTack.N.toFixed(4)}</div>
                    </div>
                    <div className="p-3 bg-muted rounded">
                      <div className="text-xs text-muted-foreground">G</div>
                      <div className="text-lg font-bold">{state.tickTack.G.toFixed(4)}</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Energie</span>
                      <span>{state.energy.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Lyapunov Exponent</span>
                      <span className={state.lyapunov > 0 ? 'text-red-500' : 'text-green-500'}>
                        {state.lyapunov.toFixed(4)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Zeit t</span>
                      <span>{state.tickTack.t}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={togglePulsing}
                      variant={isRunning ? "destructive" : "default"}
                      className="flex-1"
                    >
                      {isRunning ? <Pause className="h-4 w-4 mr-2" /> : <PlayCircle className="h-4 w-4 mr-2" />}
                      {isRunning ? 'Stoppen' : 'Auto-Pulse'}
                    </Button>
                    <Button onClick={pulse} variant="outline">
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* === KERNEL TAB === */}
          <TabsContent value="kernel">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Genesis Kernel
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Status</span>
                      <Badge variant={state.kernelActive ? "default" : "secondary"}>
                        {state.kernelActive ? 'AKTIV' : 'Inaktiv'}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Zyklen</span>
                      <span>{state.kernelCycles}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Consensus</span>
                      <span>{(state.coreConsensus * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Emergency Mode</span>
                      <Badge variant={state.kernelState?.emergencyMode ? "destructive" : "outline"}>
                        {state.kernelState?.emergencyMode ? 'AKTIV' : 'Normal'}
                      </Badge>
                    </div>
                  </div>
                  
                  <Button onClick={handleKernelSync} className="w-full">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Kernel Sync
                  </Button>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Reality Cores ({cores.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {cores.map(core => {
                      const coreState = state.kernelState?.coreStates[core.id];
                      return (
                        <div key={core.id} className="p-3 bg-muted rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm">{core.id}</span>
                            <Badge variant={coreState?.status === 'active' ? "default" : "secondary"} className="text-[10px]">
                              {coreState?.status || 'unknown'}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground mb-2">{core.domain}</div>
                          {coreState && (
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span>Load</span>
                                <span>{(coreState.load * 100).toFixed(0)}%</span>
                              </div>
                              <Progress value={coreState.load * 100} className="h-1" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Blueprints Overview */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Geladene Blueprints ({blueprints.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {blueprints.map(bp => (
                    <div 
                      key={bp.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        state.activeBlueprint === bp.id 
                          ? 'border-primary bg-primary/10' 
                          : 'border-muted hover:border-primary/50'
                      }`}
                    >
                      <div className="font-medium">{bp.shortName}</div>
                      <div className="text-xs text-muted-foreground">{bp.name}</div>
                      <Badge variant="outline" className="text-[10px] mt-1">{bp.category}</Badge>
                      <div className="text-xs text-muted-foreground mt-1">
                        {bp.concepts.length} Konzepte
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CryptoAnalyzer;
