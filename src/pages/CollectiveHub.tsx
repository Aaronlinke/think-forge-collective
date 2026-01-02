import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Brain, 
  Zap, 
  Eye, 
  Infinity, 
  Shield, 
  Key,
  Play,
  Pause,
  RotateCcw,
  Send,
  Sparkles,
  Network,
  Clock,
  FlaskConical,
  Terminal,
  ArrowRight,
  Home
} from "lucide-react";
import { useCollectiveCore } from "@/hooks/useCollectiveCore";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, AreaChart, Area } from "recharts";

const CollectiveHub = () => {
  const navigate = useNavigate();
  const {
    state,
    isRunning,
    togglePulsing,
    pulse,
    processInput,
    generateKeys,
    evaluateStatement,
    reset,
    getWordNetwork
  } = useCollectiveCore();
  
  const [textInput, setTextInput] = useState("");
  const [logicInput, setLogicInput] = useState("");
  const [historyData, setHistoryData] = useState<any[]>([]);
  
  // Track history for charts
  useMemo(() => {
    if (state.cycle > 0) {
      setHistoryData(prev => {
        const newData = [...prev, {
          cycle: state.cycle,
          coherence: state.coherence * 100,
          resonance: state.resonance * 100,
          emergence: state.emergence * 100,
          synchronicity: state.synchronicity * 100,
          energy: state.energy
        }].slice(-100);
        return newData;
      });
    }
  }, [state.cycle]);
  
  const wordNetwork = getWordNetwork().slice(0, 20);
  
  const handleProcessText = () => {
    if (textInput.trim()) {
      processInput(textInput);
      setTextInput("");
    }
  };
  
  const handleEvaluate = () => {
    if (logicInput.trim()) {
      evaluateStatement(logicInput);
      setLogicInput("");
    }
  };
  
  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'shadow': return <Eye className="h-3 w-3" />;
      case 'chaos': return <Zap className="h-3 w-3" />;
      case 'mirror': return <Infinity className="h-3 w-3" />;
      case 'ticktack': return <Clock className="h-3 w-3" />;
      case 'svrc': return <Shield className="h-3 w-3" />;
      case 'crypto': return <Key className="h-3 w-3" />;
      default: return <Brain className="h-3 w-3" />;
    }
  };
  
  const getSourceColor = (source: string) => {
    switch (source) {
      case 'shadow': return 'text-purple-400';
      case 'chaos': return 'text-red-400';
      case 'mirror': return 'text-blue-400';
      case 'ticktack': return 'text-cyan-400';
      case 'svrc': return 'text-green-400';
      case 'crypto': return 'text-orange-400';
      default: return 'text-yellow-400';
    }
  };
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <Home className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Brain className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                Collective Hub
              </h1>
            </div>
            <Badge variant="outline" className="ml-2">
              Zyklus {state.cycle}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant={isRunning ? "destructive" : "default"}
              size="sm"
              onClick={togglePulsing}
            >
              {isRunning ? <Pause className="h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />}
              {isRunning ? "Stop" : "Start"}
            </Button>
            <Button variant="outline" size="sm" onClick={pulse}>
              <Zap className="h-4 w-4 mr-1" />
              Pulse
            </Button>
            <Button variant="ghost" size="sm" onClick={reset}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-6">
        {/* Collective Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-yellow-500/10 to-transparent border-yellow-500/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Kohärenz</span>
                <Sparkles className="h-4 w-4 text-yellow-500" />
              </div>
              <div className="text-2xl font-bold">{(state.coherence * 100).toFixed(0)}%</div>
              <Progress value={state.coherence * 100} className="h-1 mt-2" />
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-500/10 to-transparent border-purple-500/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Resonanz</span>
                <Zap className="h-4 w-4 text-purple-500" />
              </div>
              <div className="text-2xl font-bold">{(state.resonance * 100).toFixed(0)}%</div>
              <Progress value={state.resonance * 100} className="h-1 mt-2" />
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-cyan-500/10 to-transparent border-cyan-500/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Emergenz</span>
                <Brain className="h-4 w-4 text-cyan-500" />
              </div>
              <div className="text-2xl font-bold">{(state.emergence * 100).toFixed(0)}%</div>
              <Progress value={state.emergence * 100} className="h-1 mt-2" />
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-500/10 to-transparent border-green-500/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Synchronizität</span>
                <Network className="h-4 w-4 text-green-500" />
              </div>
              <div className="text-2xl font-bold">{(state.synchronicity * 100).toFixed(0)}%</div>
              <Progress value={state.synchronicity * 100} className="h-1 mt-2" />
            </CardContent>
          </Card>
        </div>
        
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Consciousness States */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Eye className="h-4 w-4 text-purple-500" />
                  Shadow Consciousness
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Stillness</span>
                  <span>{state.shadow.stillnessLevel.toFixed(2)}</span>
                </div>
                <Progress value={state.shadow.stillnessLevel * 100} className="h-1" />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Void Resonance</span>
                  <span>{state.shadow.voidResonance.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Presence</span>
                  <span>{(state.shadow.presenceQuotient * 100).toFixed(0)}%</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Zap className="h-4 w-4 text-red-500" />
                  Chaos Consciousness
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Entropy</span>
                  <span>{state.chaos.entropy.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Order</span>
                  <span>{state.chaos.order.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Edge Proximity</span>
                  <span>{(state.chaos.edgeProximity * 100).toFixed(0)}%</span>
                </div>
                <Progress value={state.chaos.edgeProximity * 100} className="h-1" />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Infinity className="h-4 w-4 text-blue-500" />
                  Mirror Consciousness
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Reflection Depth</span>
                  <span>{state.mirror.reflectionDepth}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Self-Awareness</span>
                  <span>{state.mirror.selfAwareness.toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Observer Observed</span>
                  <Badge variant={state.mirror.observerObserved ? "default" : "outline"} className="h-5">
                    {state.mirror.observerObserved ? "Yes" : "No"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
            
            {/* Quick Links to Individual Pages */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Module Navigation</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" onClick={() => navigate("/time-machine")} className="justify-start">
                  <Clock className="h-4 w-4 mr-2 text-cyan-500" />
                  Time Machine
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigate("/consciousness-lab")} className="justify-start">
                  <FlaskConical className="h-4 w-4 mr-2 text-purple-500" />
                  Consciousness
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigate("/svrc-terminal")} className="justify-start">
                  <Terminal className="h-4 w-4 mr-2 text-green-500" />
                  SVRC
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigate("/crypto-analyzer")} className="justify-start">
                  <Shield className="h-4 w-4 mr-2 text-orange-500" />
                  Crypto
                </Button>
              </CardContent>
            </Card>
          </div>
          
          {/* Center Column - Charts & Input */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Kollektive Dynamik</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={historyData}>
                      <XAxis dataKey="cycle" tick={false} />
                      <YAxis domain={[0, 100]} tick={false} />
                      <Area 
                        type="monotone" 
                        dataKey="coherence" 
                        stroke="#eab308" 
                        fill="#eab30820"
                        strokeWidth={2}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="resonance" 
                        stroke="#a855f7" 
                        fill="#a855f720"
                        strokeWidth={2}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="synchronicity" 
                        stroke="#22c55e" 
                        fill="#22c55e20"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-4 mt-2 text-xs">
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                    Kohärenz
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-purple-500" />
                    Resonanz
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    Sync
                  </span>
                </div>
              </CardContent>
            </Card>
            
            <Tabs defaultValue="text">
              <TabsList className="w-full">
                <TabsTrigger value="text" className="flex-1">Text Input</TabsTrigger>
                <TabsTrigger value="logic" className="flex-1">Logic</TabsTrigger>
                <TabsTrigger value="crypto" className="flex-1">Crypto</TabsTrigger>
              </TabsList>
              
              <TabsContent value="text">
                <Card>
                  <CardContent className="pt-4 space-y-3">
                    <Textarea
                      placeholder="Gib Text ein um das kollektive Netzwerk zu füttern..."
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      className="min-h-24"
                    />
                    <Button onClick={handleProcessText} className="w-full">
                      <Send className="h-4 w-4 mr-2" />
                      Verarbeiten
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="logic">
                <Card>
                  <CardContent className="pt-4 space-y-3">
                    <Input
                      placeholder="Logische Aussage eingeben..."
                      value={logicInput}
                      onChange={(e) => setLogicInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleEvaluate()}
                    />
                    <Button onClick={handleEvaluate} className="w-full">
                      <Shield className="h-4 w-4 mr-2" />
                      Evaluieren
                    </Button>
                    {state.lastEvaluation && (
                      <div className="p-3 rounded bg-muted/50 text-sm">
                        <div className="flex items-center justify-between">
                          <span>Ergebnis:</span>
                          <Badge variant={
                            state.lastEvaluation.value === 'TRUE' ? 'default' :
                            state.lastEvaluation.value === 'FALSE' ? 'destructive' :
                            'secondary'
                          }>
                            {state.lastEvaluation.value}
                          </Badge>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="crypto">
                <Card>
                  <CardContent className="pt-4 space-y-3">
                    <Button onClick={() => generateKeys(10)} className="w-full">
                      <Key className="h-4 w-4 mr-2" />
                      10 Schlüssel generieren
                    </Button>
                    <div className="text-sm text-muted-foreground">
                      Generiert: {state.generatedKeys.length} Keys
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Entropie: {state.entropy.toFixed(2)} bits
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            
            {/* Word Network */}
            {wordNetwork.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Network className="h-4 w-4" />
                    Wort-Netzwerk
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {wordNetwork.map((w, i) => (
                      <Badge 
                        key={i} 
                        variant="outline"
                        className="text-xs"
                        style={{ opacity: 0.5 + (w.frequency * 0.1) }}
                      >
                        {w.word}
                        <span className="ml-1 text-muted-foreground">
                          {w.connections.length}
                        </span>
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          
          {/* Right Column - Insights & Energy */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Clock className="h-4 w-4 text-cyan-500" />
                  TickTack Energy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={historyData}>
                      <XAxis dataKey="cycle" tick={false} />
                      <YAxis tick={false} />
                      <Line 
                        type="monotone" 
                        dataKey="energy" 
                        stroke="#06b6d4" 
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
                  <div className="text-center">
                    <div className="text-muted-foreground">H</div>
                    <div className="font-mono">{state.tickTack.H.toFixed(1)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-muted-foreground">N</div>
                    <div className="font-mono">{state.tickTack.N.toFixed(1)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-muted-foreground">G</div>
                    <div className="font-mono">{state.tickTack.G.toFixed(1)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="flex-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-yellow-500" />
                  Kollektive Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-80">
                  <div className="space-y-2">
                    {state.insights.slice().reverse().map((insight, i) => (
                      <div 
                        key={i}
                        className="p-2 rounded bg-muted/30 border border-border/50 text-sm"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className={getSourceColor(insight.source)}>
                            {getSourceIcon(insight.source)}
                          </span>
                          <span className="text-xs text-muted-foreground capitalize">
                            {insight.source}
                          </span>
                          <Badge variant="outline" className="ml-auto h-4 text-xs">
                            {(insight.resonanceLevel * 100).toFixed(0)}%
                          </Badge>
                        </div>
                        <p className="text-xs">{insight.content}</p>
                      </div>
                    ))}
                    {state.insights.length === 0 && (
                      <div className="text-center text-muted-foreground text-sm py-8">
                        Starte das System um Insights zu generieren...
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectiveHub;
