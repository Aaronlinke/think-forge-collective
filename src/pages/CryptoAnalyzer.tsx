import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Key, Lock, Cpu, Copy, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { 
  OmnigenesisParams, 
  OmnigenesisGenerator,
  GeneratedKey
} from "@/lib/math/OMNIGENESIS";

const CryptoAnalyzer = () => {
  const navigate = useNavigate();
  
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

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate("/auth");
    });
  }, [navigate]);

  const handleGenerate = () => {
    const generator = new OmnigenesisGenerator(params);
    const results = generator.generateBatch(0, batchSize);
    setWallets(results);
    setEntropy(OmnigenesisGenerator.theoreticalEntropy());
    toast.success(`${batchSize} Wallets generiert`);
  };

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

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Key className="h-8 w-8 text-primary" />
            Crypto Analyzer
          </h1>
          <p className="text-muted-foreground mt-2">
            OMNIGENESIS Wallet-Generator & Kryptographie-Visualisierung
          </p>
        </div>

        <Tabs defaultValue="generator" className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full max-w-lg">
            <TabsTrigger value="generator">Generator</TabsTrigger>
            <TabsTrigger value="analysis">Analyse</TabsTrigger>
            <TabsTrigger value="theory">Theorie</TabsTrigger>
          </TabsList>

          {/* Generator Tab */}
          <TabsContent value="generator">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Parameters */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Cpu className="h-5 w-5" />
                    OMNIGENESIS Parameter
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">h (Base)</label>
                    <Input
                      value={params.h.toString()}
                      onChange={(e) => updateParam("h", e.target.value)}
                      className="font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">n (Multiplier)</label>
                    <Input
                      value={params.n.toString()}
                      onChange={(e) => updateParam("n", e.target.value)}
                      className="font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">g (Generator)</label>
                    <Input
                      value={params.g.toString()}
                      onChange={(e) => updateParam("g", e.target.value)}
                      className="font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">o (Offset)</label>
                    <Input
                      value={params.o.toString()}
                      onChange={(e) => updateParam("o", e.target.value)}
                      className="font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">r (Rotation)</label>
                    <Input
                      value={params.r.toString()}
                      onChange={(e) => updateParam("r", e.target.value)}
                      className="font-mono"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Batch Size: {batchSize}</label>
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
                    Generieren
                  </Button>

                  {entropy > 0 && (
                    <div className="p-3 bg-muted rounded-lg text-center">
                      <div className="text-sm text-muted-foreground">Theoretische Entropie</div>
                      <div className="text-xl font-mono font-bold text-primary">
                        {entropy.toFixed(2)} bits
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Results */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Generierte Wallets
                    {wallets.length > 0 && (
                      <Badge variant="outline">{wallets.length}</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {wallets.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      Klicke "Generieren" um Wallets zu erstellen
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[500px] overflow-y-auto">
                      {wallets.map((wallet, i) => (
                        <div key={i} className="p-4 bg-muted rounded-lg space-y-2">
                          <div className="flex items-center justify-between">
                            <Badge>#{wallet.index}</Badge>
                            <div className="text-xs text-muted-foreground font-mono">
                              k={wallet.k_i.toString().slice(0, 20)}...
                            </div>
                          </div>
                          
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Private Key (d)</div>
                            <div className="flex items-center gap-2">
                              <code className="flex-1 text-xs bg-background p-2 rounded overflow-x-auto">
                                {wallet.d_i.toString()}
                              </code>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => copyToClipboard(wallet.d_i.toString())}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">WIF Raw</div>
                            <div className="flex items-center gap-2">
                              <code className="flex-1 text-xs bg-background p-2 rounded overflow-x-auto">
                                {wallet.wifRaw}
                              </code>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => copyToClipboard(wallet.wifRaw)}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Hex (64 chars)</div>
                            <code className="block text-xs bg-background p-2 rounded overflow-x-auto">
                              {wallet.hex}
                            </code>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analysis Tab */}
          <TabsContent value="analysis">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Orbit-Analyse</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Die OMNIGENESIS-Transformation erzeugt deterministische Orbits im Schlüsselraum.
                    </p>
                    <div className="p-4 bg-muted rounded-lg font-mono text-sm">
                      <div>k_i = (h + n·g + o + i) mod N</div>
                      <div>d_i = k_i · r⁻¹ mod N</div>
                    </div>
                    <div className="text-sm">
                      <strong>Eigenschaften:</strong>
                      <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
                        <li>Affin-linear in i</li>
                        <li>Bijektiv durch r⁻¹</li>
                        <li>Periodisch mit Periode N</li>
                        <li>Deterministisch reproduzierbar</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Sicherheitsanalyse</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                      <div className="font-semibold text-destructive mb-2">⚠️ Warnung</div>
                      <p className="text-sm text-muted-foreground">
                        Deterministische Schlüsselgenerierung mit bekannten Parametern ist UNSICHER 
                        für echte Kryptowährungen. Dies ist nur für Bildungszwecke!
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Echte Bitcoin-Entropie:</span>
                        <span className="font-mono text-primary">256 bits</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>OMNIGENESIS (mit Params):</span>
                        <span className="font-mono text-destructive">~{entropy.toFixed(0)} bits</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Brute-Force Zeit (2^256):</span>
                        <span className="font-mono">10^77 Jahre</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Theory Tab */}
          <TabsContent value="theory">
            <Card>
              <CardHeader>
                <CardTitle>Die Mathematik hinter OMNIGENESIS</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold">I. OMNIGENESIS-Algebra</h3>
                    <div className="p-4 bg-muted rounded-lg font-mono text-sm space-y-2">
                      <div>F: ℕ → ℤ_N × WIF × E(𝔽_p)</div>
                      <div className="text-muted-foreground">N = Kurvenordnung secp256k1</div>
                    </div>
                    
                    <h4 className="font-medium">Satz 1.1 (Affine Linearität):</h4>
                    <div className="p-3 bg-muted rounded font-mono text-sm">
                      k_i = (h + n·g + o) + i (mod N)
                    </div>
                    
                    <h4 className="font-medium">Satz 1.2 (Bijektivität):</h4>
                    <div className="p-3 bg-muted rounded font-mono text-sm">
                      φ_r(k) = k · r⁻¹ mod N ist bijektiv
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold">II. Warum Bitcoin sicher bleibt</h3>
                    <div className="space-y-3 text-sm">
                      <div className="p-3 bg-green-500/10 border border-green-500/20 rounded">
                        <strong>1. SHA-256 Irreversibilität:</strong>
                        <p className="text-muted-foreground mt-1">
                          Keine effizienten Invarianten für Hashfunktionen existieren.
                          H(x) → x ist topologisch singulär (Typ 6).
                        </p>
                      </div>
                      <div className="p-3 bg-green-500/10 border border-green-500/20 rounded">
                        <strong>2. ECDLP Härte:</strong>
                        <p className="text-muted-foreground mt-1">
                          Q = d·G → d benötigt O(√N) ≈ 2^128 Operationen.
                          Kein bekannter polynomieller Algorithmus.
                        </p>
                      </div>
                      <div className="p-3 bg-green-500/10 border border-green-500/20 rounded">
                        <strong>3. Entropie:</strong>
                        <p className="text-muted-foreground mt-1">
                          256-bit Schlüsselraum = 10^77 Möglichkeiten.
                          Universum hat ~10^80 Atome.
                        </p>
                      </div>
                    </div>
                  </div>
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
