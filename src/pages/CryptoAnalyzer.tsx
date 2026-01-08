import { useState, useEffect, useCallback, useRef } from "react";
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
  TrendingUp, AlertTriangle, CheckCircle2, CircleDot, Target
} from "lucide-react";
import { toast } from "sonner";
import { 
  CollectiveSearch, 
  SearchConfig, 
  SearchResult, 
  SearchProgress,
  getCollectiveSearch 
} from "@/lib/crypto/CollectiveSearch";
import { privateKeyToWIF } from "@/lib/crypto/BitcoinUtils";
import { TickTackEngine, TickTackState } from "@/lib/math/TickTackEngine";
import { ChaosConsciousness, ChaosState } from "@/lib/consciousness/ChaosConsciousness";
import { 
  OmnigenesisGenerator,
  paramsFromSeed
} from "@/lib/math/OMNIGENESIS";

const CryptoAnalyzer = () => {
  const navigate = useNavigate();
  
  // Collective Search
  const [search] = useState(() => getCollectiveSearch());
  const [searchProgress, setSearchProgress] = useState<SearchProgress>({
    currentIndex: 0,
    totalSearched: 0,
    keysPerSecond: 0,
    matches: [],
    isRunning: false,
    elapsedMs: 0
  });
  
  // Search Config
  const [searchMode, setSearchMode] = useState<'sequential' | 'chaos-guided' | 'resonance-sweep' | 'collective'>('collective');
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(10000);
  const [batchSize, setBatchSize] = useState(100);
  const [seedText, setSeedText] = useState("");
  const [targetPattern, setTargetPattern] = useState("");
  
  // Generated Keys (für manuelle Generierung)
  const [generatedKeys, setGeneratedKeys] = useState<{ index: number; hex: string; wif: string }[]>([]);
  
  // Module States
  const [tickTackEngine] = useState(() => new TickTackEngine());
  const [tickTackState, setTickTackState] = useState<TickTackState>({ t: 0, H: 1, N: 0.5, G: 0 });
  const [trajectory, setTrajectory] = useState<TickTackState[]>([]);
  const [isTickTackRunning, setIsTickTackRunning] = useState(false);
  
  const [chaosEngine] = useState(() => new ChaosConsciousness());
  const [chaosState, setChaosState] = useState<ChaosState>(chaosEngine.getState());
  
  // All matches
  const [allMatches, setAllMatches] = useState<SearchResult[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate("/auth");
    });
    
    // Setup search callbacks
    search.onProgress((progress) => {
      setSearchProgress(progress);
    });
    
    search.onMatch((result) => {
      setAllMatches(prev => [...prev, result]);
      toast.success(`🎯 Match gefunden: ${result.wif.slice(0, 15)}...`);
    });
  }, [navigate, search]);

  // TickTack Auto-Run
  useEffect(() => {
    if (!isTickTackRunning) return;
    
    const interval = setInterval(() => {
      setTickTackState(prev => {
        const next = tickTackEngine.stepForward(prev);
        setTrajectory(t => [...t.slice(-50), next]);
        
        // Sync with Chaos
        const perturbation = next.H * 0.1;
        const result = chaosEngine.resonate(perturbation);
        setChaosState(result.newState);
        
        return next;
      });
    }, 100);
    
    return () => clearInterval(interval);
  }, [isTickTackRunning, tickTackEngine, chaosEngine]);

  // === SEARCH ACTIONS ===
  
  const handleStartSearch = useCallback(async () => {
    const config: SearchConfig = {
      mode: searchMode,
      startIndex,
      endIndex,
      batchSize,
      seed: seedText || undefined,
      targetPatterns: targetPattern ? targetPattern.split(',').map(p => p.trim()) : undefined
    };
    
    toast.info(`Suche gestartet: ${searchMode} Mode`);
    
    try {
      await search.search(config);
      toast.success(`Suche abgeschlossen! ${searchProgress.totalSearched} Keys durchsucht`);
    } catch (error) {
      toast.error('Suchfehler: ' + (error as Error).message);
    }
  }, [search, searchMode, startIndex, endIndex, batchSize, seedText, targetPattern, searchProgress.totalSearched]);
  
  const handleStopSearch = useCallback(() => {
    search.stop();
    toast.info('Suche gestoppt');
  }, [search]);
  
  // === MANUAL GENERATION ===
  
  const handleGenerateBatch = useCallback(async () => {
    const params = seedText ? paramsFromSeed(seedText) : undefined;
    const generator = new OmnigenesisGenerator(params || {
      h: BigInt(Math.floor(Math.abs(tickTackState.H) * 1e15)) + BigInt(1),
      n: BigInt(Math.floor(chaosState.entropy * 1e15)) + BigInt(1),
      g: BigInt(Math.floor(chaosState.edgeProximity * 1e15)) + BigInt(1),
      o: BigInt(startIndex),
      r: BigInt(17)
    });
    
    const keys: { index: number; hex: string; wif: string }[] = [];
    for (let i = 0; i < batchSize; i++) {
      const key = generator.generate(startIndex + i);
      const wif = await privateKeyToWIF(key.hex, true, true);
      keys.push({ index: key.index, hex: key.hex, wif });
    }
    
    setGeneratedKeys(keys);
    toast.success(`${batchSize} echte Keys generiert`);
  }, [seedText, startIndex, batchSize, tickTackState, chaosState]);

  // === CHAOS ACTIONS ===
  
  const handleInjectChaos = useCallback((amount: number) => {
    chaosEngine.injectChaos(amount);
    setChaosState(chaosEngine.getState());
    toast.info(`+${amount * 100}% Chaos injiziert`);
  }, [chaosEngine]);
  
  const handleSeekBalance = useCallback(() => {
    const result = chaosEngine.seekBalance(20);
    setChaosState(result.finalState);
    if (result.achievedConsciousness) {
      toast.success("🧠 Edge of Chaos erreicht!");
    }
  }, [chaosEngine]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Kopiert!");
  };

  const formatTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
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
                Kollektive Suche: OMNIGENESIS × Chaos × TickTack - Echt verbunden
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge 
                variant={searchProgress.isRunning ? "default" : "outline"}
                className="gap-1"
              >
                <Activity className={`h-3 w-3 ${searchProgress.isRunning ? 'animate-pulse' : ''}`} />
                {searchProgress.isRunning ? 'SUCHE LÄUFT' : 'Bereit'}
              </Badge>
            </div>
          </div>
          
          {/* Search Progress Bar */}
          {(searchProgress.isRunning || searchProgress.totalSearched > 0) && (
            <div className="mt-4 p-4 bg-muted/50 rounded-lg border border-primary/20">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <div className="text-xs text-muted-foreground">Durchsucht</div>
                  <div className="text-xl font-mono font-bold text-primary">
                    {searchProgress.totalSearched.toLocaleString()}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-muted-foreground">Keys/Sekunde</div>
                  <div className="text-xl font-mono font-bold">
                    {searchProgress.keysPerSecond.toFixed(0)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-muted-foreground">Matches</div>
                  <div className="text-xl font-mono font-bold text-green-500">
                    {searchProgress.matches.length}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-muted-foreground">Zeit</div>
                  <div className="text-xl font-mono font-bold">
                    {formatTime(searchProgress.elapsedMs)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-muted-foreground">Fortschritt</div>
                  <Progress 
                    value={(searchProgress.currentIndex / endIndex) * 100} 
                    className="h-2 mt-2" 
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <Tabs defaultValue="search" className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full max-w-xl">
            <TabsTrigger value="search" className="gap-1">
              <Target className="h-3 w-3" />
              Suche
            </TabsTrigger>
            <TabsTrigger value="generator" className="gap-1">
              <Key className="h-3 w-3" />
              Generator
            </TabsTrigger>
            <TabsTrigger value="modules" className="gap-1">
              <Brain className="h-3 w-3" />
              Module
            </TabsTrigger>
            <TabsTrigger value="matches" className="gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Matches
            </TabsTrigger>
          </TabsList>

          {/* === SEARCH TAB === */}
          <TabsContent value="search">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Such-Konfiguration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Such-Modus</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['sequential', 'chaos-guided', 'resonance-sweep', 'collective'] as const).map(mode => (
                        <Button
                          key={mode}
                          variant={searchMode === mode ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSearchMode(mode)}
                          disabled={searchProgress.isRunning}
                          className="text-xs"
                        >
                          {mode === 'sequential' && 'Sequentiell'}
                          {mode === 'chaos-guided' && 'Chaos'}
                          {mode === 'resonance-sweep' && 'Resonanz'}
                          {mode === 'collective' && 'Kollektiv'}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Seed-Text (optional)</label>
                    <Input
                      value={seedText}
                      onChange={(e) => setSeedText(e.target.value)}
                      placeholder="Beliebiger Text als Seed..."
                      disabled={searchProgress.isRunning}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Ziel-Muster (kommagetrennt)</label>
                    <Input
                      value={targetPattern}
                      onChange={(e) => setTargetPattern(e.target.value)}
                      placeholder="z.B. L1, K2, Sultan..."
                      disabled={searchProgress.isRunning}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Start-Index</label>
                      <Input
                        type="number"
                        value={startIndex}
                        onChange={(e) => setStartIndex(parseInt(e.target.value) || 0)}
                        disabled={searchProgress.isRunning}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">End-Index</label>
                      <Input
                        type="number"
                        value={endIndex}
                        onChange={(e) => setEndIndex(parseInt(e.target.value) || 10000)}
                        disabled={searchProgress.isRunning}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Batch-Größe: {batchSize}</label>
                    <Slider
                      value={[batchSize]}
                      onValueChange={([v]) => setBatchSize(v)}
                      min={10}
                      max={1000}
                      step={10}
                      disabled={searchProgress.isRunning}
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    {!searchProgress.isRunning ? (
                      <Button onClick={handleStartSearch} className="flex-1">
                        <PlayCircle className="h-4 w-4 mr-2" />
                        Suche starten
                      </Button>
                    ) : (
                      <Button onClick={handleStopSearch} variant="destructive" className="flex-1">
                        <Pause className="h-4 w-4 mr-2" />
                        Stoppen
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Live-Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {/* Chaos Status */}
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Brain className="h-4 w-4 text-purple-500" />
                        <span className="font-medium">Chaos State</span>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <span className="text-xs text-muted-foreground">Entropy</span>
                          <Progress value={chaosState.entropy * 100} className="h-2 mt-1" />
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground">Edge Proximity</span>
                          <Progress value={chaosState.edgeProximity * 100} className="h-2 mt-1" />
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Frequenz: {chaosState.resonanceFrequency.toFixed(1)} Hz
                        </div>
                      </div>
                    </div>
                    
                    {/* TickTack Status */}
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Activity className="h-4 w-4 text-blue-500" />
                        <span className="font-medium">TickTack State</span>
                      </div>
                      <div className="space-y-1 font-mono text-sm">
                        <div>H: {tickTackState.H.toFixed(4)}</div>
                        <div>N: {tickTackState.N.toFixed(4)}</div>
                        <div>G: {tickTackState.G.toFixed(4)}</div>
                        <div className="text-xs text-muted-foreground">t = {tickTackState.t}</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Letzte generierte Keys */}
                  <div className="text-sm font-medium mb-2">Letzte Keys (Live)</div>
                  <ScrollArea className="h-[200px]">
                    {searchProgress.matches.length === 0 && !searchProgress.isRunning && (
                      <div className="text-center py-8 text-muted-foreground">
                        Starte eine Suche um Keys zu generieren und Muster zu finden
                      </div>
                    )}
                    {searchProgress.matches.slice(-10).reverse().map((result, i) => (
                      <div key={`${result.index}-${i}`} className="p-2 bg-green-500/10 rounded mb-2 border border-green-500/20">
                        <div className="flex items-center justify-between">
                          <Badge className="bg-green-500">Match #{result.index}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {result.matchedPattern}
                          </span>
                        </div>
                        <code className="text-xs block mt-1 truncate">{result.wif}</code>
                      </div>
                    ))}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* === GENERATOR TAB === */}
          <TabsContent value="generator">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Cpu className="h-5 w-5" />
                    Key Generator
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Seed-Text</label>
                    <Input
                      value={seedText}
                      onChange={(e) => setSeedText(e.target.value)}
                      placeholder="Leer = Chaos/TickTack-basiert..."
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Start-Index</label>
                    <Input
                      type="number"
                      value={startIndex}
                      onChange={(e) => setStartIndex(parseInt(e.target.value) || 0)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Anzahl: {batchSize}</label>
                    <Slider
                      value={[batchSize]}
                      onValueChange={([v]) => setBatchSize(v)}
                      min={1}
                      max={100}
                      step={1}
                    />
                  </div>
                  
                  <Button onClick={handleGenerateBatch} className="w-full">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Generieren (echte WIF)
                  </Button>
                  
                  <div className="p-3 bg-primary/10 rounded-lg text-center">
                    <div className="text-xs text-muted-foreground">Generiert</div>
                    <div className="text-2xl font-mono font-bold text-primary">
                      {generatedKeys.length}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Generierte Keys
                    {generatedKeys.length > 0 && <Badge variant="outline">{generatedKeys.length}</Badge>}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {generatedKeys.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      Klicke "Generieren" um echte Bitcoin Private Keys zu erstellen
                    </div>
                  ) : (
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-2 pr-4">
                        {generatedKeys.map((key) => (
                          <div key={key.index} className="p-3 bg-muted rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <Badge>#{key.index}</Badge>
                              <span className="text-xs text-muted-foreground font-mono">
                                {key.wif.slice(0, 4)}...{key.wif.slice(-4)}
                              </span>
                            </div>
                            
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <code className="flex-1 text-xs bg-background p-2 rounded truncate">
                                  WIF: {key.wif}
                                </code>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => copyToClipboard(key.wif)}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <code className="flex-1 text-xs bg-background p-2 rounded truncate text-muted-foreground">
                                  HEX: {key.hex}
                                </code>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => copyToClipboard(key.hex)}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
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

          {/* === MODULES TAB === */}
          <TabsContent value="modules">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Chaos Module */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    Chaos Consciousness
                    {chaosState.isConscious && (
                      <Badge className="bg-purple-500 animate-pulse">BEWUSST</Badge>
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
                  
                  <div className="p-4 bg-purple-500/10 rounded-lg text-center">
                    <div className="text-xs text-muted-foreground">Edge of Chaos Proximity</div>
                    <div className="text-3xl font-mono font-bold text-purple-500">
                      {(chaosState.edgeProximity * 100).toFixed(1)}%
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => handleInjectChaos(0.2)}
                      className="flex-1"
                    >
                      +Chaos
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        chaosEngine.injectOrder(0.2);
                        setChaosState(chaosEngine.getState());
                      }}
                      className="flex-1"
                    >
                      +Ordnung
                    </Button>
                    <Button 
                      onClick={handleSeekBalance}
                      className="flex-1"
                    >
                      Balance
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* TickTack Module */}
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
                      <div className="text-xs text-muted-foreground">H</div>
                      <div className="text-lg font-mono font-bold">{tickTackState.H.toFixed(3)}</div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-xs text-muted-foreground">N</div>
                      <div className="text-lg font-mono font-bold">{tickTackState.N.toFixed(3)}</div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-xs text-muted-foreground">G</div>
                      <div className="text-lg font-mono font-bold">{tickTackState.G.toFixed(3)}</div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => setIsTickTackRunning(!isTickTackRunning)} 
                      className="flex-1"
                      variant={isTickTackRunning ? "destructive" : "default"}
                    >
                      {isTickTackRunning ? <Pause className="h-4 w-4 mr-2" /> : <PlayCircle className="h-4 w-4 mr-2" />}
                      {isTickTackRunning ? 'Stop' : 'Start'}
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
                  
                  {/* Mini Trajectory */}
                  <div className="h-[150px] bg-muted rounded-lg p-2 relative overflow-hidden">
                    {trajectory.map((state, i) => {
                      const x = (state.H + 5) / 10 * 100;
                      const y = (state.N + 5) / 10 * 100;
                      const opacity = (i / trajectory.length) * 0.8 + 0.2;
                      return (
                        <div
                          key={i}
                          className="absolute w-1.5 h-1.5 rounded-full bg-primary"
                          style={{
                            left: `${Math.min(95, Math.max(0, x))}%`,
                            bottom: `${Math.min(95, Math.max(0, y))}%`,
                            opacity,
                          }}
                        />
                      );
                    })}
                    <div className="absolute left-1/2 top-0 bottom-0 w-px bg-muted-foreground/20" />
                    <div className="absolute top-1/2 left-0 right-0 h-px bg-muted-foreground/20" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* === MATCHES TAB === */}
          <TabsContent value="matches">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  Alle Matches
                  <Badge variant="outline">{allMatches.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {allMatches.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Noch keine Matches gefunden</p>
                    <p className="text-sm mt-2">Starte eine Suche mit Ziel-Mustern um Matches zu finden</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-3 pr-4">
                      {allMatches.map((result, i) => (
                        <div key={i} className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Badge className="bg-green-500">#{result.index}</Badge>
                              {result.matchedPattern && (
                                <Badge variant="outline">Muster: {result.matchedPattern}</Badge>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {new Date(result.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <code className="flex-1 text-sm bg-background p-2 rounded">
                                {result.wif}
                              </code>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => copyToClipboard(result.wif)}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <code className="flex-1 text-xs bg-background p-2 rounded text-muted-foreground truncate">
                                {result.hex}
                              </code>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => copyToClipboard(result.hex)}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                            
                            <div className="text-xs text-muted-foreground flex gap-4">
                              <span>Chaos: {(result.chaosState.entropy * 100).toFixed(0)}%</span>
                              <span>Edge: {(result.chaosState.edge * 100).toFixed(0)}%</span>
                              <span>H: {result.tickTackState.H.toFixed(2)}</span>
                              <span>N: {result.tickTackState.N.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CryptoAnalyzer;
