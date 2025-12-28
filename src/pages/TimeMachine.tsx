import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Clock, Play, RotateCcw, Zap, TrendingUp } from "lucide-react";
import { TickTackEngine } from "@/lib/math/TickTackEngine";

const TimeMachine = () => {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState<[number, number]>([-5, 5]);
  const [initialH, setInitialH] = useState(1);
  const [initialN, setInitialN] = useState(0.5);
  const [initialG, setInitialG] = useState(0.1);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate("/auth");
    });
  }, [navigate]);

  const engine = useMemo(() => new TickTackEngine(), []);

  const trajectoryData = useMemo(() => {
    const trajectory = engine.computeFullTrajectory(initialH, initialN, initialG, Math.abs(timeRange[0]), timeRange[1]);
    return trajectory.map(state => ({
      t: state.t,
      H: state.H,
      N: state.N,
      G: state.G,
      energy: engine.computeEnergy(state)
    }));
  }, [engine, initialH, initialN, initialG, timeRange]);

  const lyapunov = useMemo(() => engine.lyapunovExponent(initialH, initialN, initialG, 10), [engine, initialH, initialN, initialG]);
  const attractorResult = useMemo(() => engine.detectAttractor(trajectoryData), [engine, trajectoryData]);

  const resetState = () => {
    setInitialH(1);
    setInitialN(0.5);
    setInitialG(0.1);
    setTimeRange([-5, 5]);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Clock className="h-8 w-8 text-primary" />
            Tick-Tack Time Machine
          </h1>
          <p className="text-muted-foreground mt-2">
            Visualisiere dynamische Systeme: Vorwärts UND Rückwärts durch die Zeit
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Parameter
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-sm font-medium text-foreground">H₀ (Initial)</label>
                <Slider
                  value={[initialH]}
                  onValueChange={([v]) => setInitialH(v)}
                  min={-2}
                  max={2}
                  step={0.1}
                  className="mt-2"
                />
                <span className="text-xs text-muted-foreground">{initialH.toFixed(2)}</span>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">N₀ (Initial)</label>
                <Slider
                  value={[initialN]}
                  onValueChange={([v]) => setInitialN(v)}
                  min={-2}
                  max={2}
                  step={0.1}
                  className="mt-2"
                />
                <span className="text-xs text-muted-foreground">{initialN.toFixed(2)}</span>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">G₀ (Initial)</label>
                <Slider
                  value={[initialG]}
                  onValueChange={([v]) => setInitialG(v)}
                  min={-2}
                  max={2}
                  step={0.1}
                  className="mt-2"
                />
                <span className="text-xs text-muted-foreground">{initialG.toFixed(2)}</span>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Zeitbereich: T = {timeRange[0]} bis {timeRange[1]}</label>
                <div className="flex gap-2 mt-2">
                  <Slider
                    value={[timeRange[0]]}
                    onValueChange={([v]) => setTimeRange([v, timeRange[1]])}
                    min={-20}
                    max={0}
                    step={1}
                  />
                  <Slider
                    value={[timeRange[1]]}
                    onValueChange={([v]) => setTimeRange([timeRange[0], v])}
                    min={0}
                    max={20}
                    step={1}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={resetState} variant="outline" className="flex-1">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
                <Button 
                  onClick={() => setIsAnimating(!isAnimating)} 
                  className="flex-1"
                >
                  <Play className="h-4 w-4 mr-2" />
                  {isAnimating ? "Stop" : "Animate"}
                </Button>
              </div>

              {/* Metrics */}
              <div className="pt-4 border-t border-border space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Lyapunov λ:</span>
                  <span className={`font-mono ${lyapunov > 0 ? 'text-destructive' : 'text-primary'}`}>
                    {lyapunov.toFixed(4)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">System:</span>
                  <span className="font-mono text-foreground">
                    {lyapunov > 0 ? 'Chaotisch' : 'Stabil'}
                  </span>
                </div>
                {attractorResult.hasAttractor && attractorResult.attractorCenter && (
                  <div className="text-xs text-muted-foreground mt-2">
                    Attraktor: H≈{attractorResult.attractorCenter.H.toFixed(2)}, N≈{attractorResult.attractorCenter.N.toFixed(2)}, G≈{attractorResult.attractorCenter.G.toFixed(2)}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Main Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Trajektorie: H(t), N(t), G(t)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trajectoryData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="t" 
                      className="text-muted-foreground"
                      label={{ value: 'Zeit t', position: 'bottom' }}
                    />
                    <YAxis className="text-muted-foreground" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="H" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={false}
                      name="H(t) - Hash-State"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="N" 
                      stroke="hsl(var(--destructive))" 
                      strokeWidth={2}
                      dot={false}
                      name="N(t) - Nonce-State"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="G" 
                      stroke="hsl(142 76% 36%)" 
                      strokeWidth={2}
                      dot={false}
                      name="G(t) - Generator-State"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Energy Chart */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Energie des Systems über Zeit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trajectoryData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="t" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="energy" 
                      stroke="hsl(var(--accent-foreground))" 
                      strokeWidth={2}
                      fill="hsl(var(--accent))"
                      name="Energie E(t)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Formulas */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Die Mathematik dahinter</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-sm">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-primary font-bold mb-2">Vorwärts-Iteration:</div>
                  <div>H(t+1) = H(t) + α·N(t) - β·G(t)</div>
                  <div>N(t+1) = γ·N(t) + δ·|H(t)|</div>
                  <div>G(t+1) = G(t) + η·(H(t) + N(t))</div>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-destructive font-bold mb-2">Rückwärts (Approximation):</div>
                  <div>Iterative Rekonstruktion</div>
                  <div>durch Gradientenabstieg</div>
                  <div>⚠️ Nicht exakt invertierbar!</div>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-foreground font-bold mb-2">Koeffizienten:</div>
                  <div>α = 0.245, β = 0.152</div>
                  <div>γ = 0.985, δ = 0.112</div>
                  <div>η = 0.088</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TimeMachine;
