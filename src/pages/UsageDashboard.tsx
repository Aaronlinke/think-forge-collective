import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, MessageSquare, Zap, TrendingUp, Award, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type ModuleStats = {
  moduleType: string;
  count: number;
  lastUsed: string;
};

type UserStats = {
  total_thoughts: number;
  current_streak: number;
  longest_streak: number;
  last_thought_date: string;
  badges: string[];
};

const UsageDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [moduleStats, setModuleStats] = useState<ModuleStats[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [totalConversations, setTotalConversations] = useState(0);
  const [collectiveUsage, setCollectiveUsage] = useState(0);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      // Load module statistics
      const { data: conversations } = await supabase
        .from("conversations")
        .select("module_type, collective_mode, created_at")
        .eq("user_id", user.id);

      if (conversations) {
        setTotalConversations(conversations.length);
        
        // Count collective mode usage
        const collectiveCount = conversations.filter(c => c.collective_mode === "collective").length;
        setCollectiveUsage(Math.round((collectiveCount / conversations.length) * 100));

        // Group by module type
        const moduleMap = new Map<string, { count: number; lastUsed: string }>();
        conversations.forEach(conv => {
          const existing = moduleMap.get(conv.module_type) || { count: 0, lastUsed: conv.created_at };
          moduleMap.set(conv.module_type, {
            count: existing.count + 1,
            lastUsed: conv.created_at > existing.lastUsed ? conv.created_at : existing.lastUsed,
          });
        });

        const stats: ModuleStats[] = Array.from(moduleMap.entries()).map(([type, data]) => ({
          moduleType: type,
          count: data.count,
          lastUsed: data.lastUsed,
        }));
        setModuleStats(stats.sort((a, b) => b.count - a.count));
      }

      // Load user stats
      const { data: stats } = await supabase
        .from("user_stats")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (stats) {
        setUserStats({
          ...stats,
          badges: Array.isArray(stats.badges) ? stats.badges as string[] : [],
        });
      }
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const getModuleIcon = (type: string) => {
    const icons: Record<string, any> = {
      strategic: "🎯",
      creative: "🎨",
      technical: "⚙️",
      analytical: "📊",
      business: "💼",
      creator: "👑",
    };
    return icons[type] || "🤖";
  };

  const getModuleName = (type: string) => {
    const names: Record<string, string> = {
      strategic: "Strategic",
      creative: "Creative",
      technical: "Technical",
      analytical: "Analytical",
      business: "Business",
      creator: "Creator Chat",
    };
    return names[type] || type;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-3">Usage Dashboard</h1>
          <p className="text-lg text-muted-foreground">Deine Nutzungsstatistiken und Insights im Überblick</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Übersicht</TabsTrigger>
            <TabsTrigger value="modules">Module</TabsTrigger>
            <TabsTrigger value="achievements">Erfolge</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <Card className="glass-card hover-lift stat-card border-primary/30 animate-scale-in">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Gesamt Gedanken</CardTitle>
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Brain className="h-5 w-5 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold gradient-text">{userStats?.total_thoughts || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">Alle Konversationen</p>
                </CardContent>
              </Card>

              <Card className="glass-card hover-lift stat-card border-accent/30 animate-scale-in" style={{ animationDelay: '0.1s' }}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Aktueller Streak</CardTitle>
                  <div className="p-2 rounded-lg bg-accent/10">
                    <Zap className="h-5 w-5 text-accent" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-accent">{userStats?.current_streak || 0} 🔥</div>
                  <p className="text-xs text-muted-foreground mt-1">Längster: {userStats?.longest_streak || 0} Tage</p>
                </CardContent>
              </Card>

              <Card className="glass-card hover-lift stat-card border-secondary/30 animate-scale-in" style={{ animationDelay: '0.2s' }}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Konversationen</CardTitle>
                  <div className="p-2 rounded-lg bg-secondary/10">
                    <MessageSquare className="h-5 w-5 text-secondary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-secondary">{totalConversations}</div>
                  <p className="text-xs text-muted-foreground mt-1">Gespeicherte Chats</p>
                </CardContent>
              </Card>

              <Card className="glass-card hover-lift stat-card border-success/30 animate-scale-in" style={{ animationDelay: '0.3s' }}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Kollektiv-Modus</CardTitle>
                  <div className="p-2 rounded-lg bg-success/10">
                    <TrendingUp className="h-5 w-5 text-success" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-success">{collectiveUsage}%</div>
                  <p className="text-xs text-muted-foreground mt-1">Nutzungsrate</p>
                </CardContent>
              </Card>
            </div>

            <Card className="glass-card border-primary/30 animate-fade-in-up shadow-elevation">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Letzte Aktivität
                </CardTitle>
                <CardDescription className="text-base">
                  Zuletzt aktiv: <span className="font-medium text-foreground">{userStats?.last_thought_date || "Noch keine Aktivität"}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium flex items-center gap-2">
                        <Zap className="h-4 w-4 text-accent" />
                        Streak-Fortschritt
                      </span>
                      <span className="text-sm font-bold text-accent">
                        {userStats?.current_streak || 0} / {userStats?.longest_streak || 0} Tage
                      </span>
                    </div>
                    <div className="relative">
                      <Progress 
                        value={userStats?.longest_streak ? (userStats.current_streak / userStats.longest_streak) * 100 : 0}
                        className="h-3"
                      />
                      {userStats?.current_streak === userStats?.longest_streak && userStats?.current_streak > 0 && (
                        <div className="absolute -top-1 -right-1">
                          <span className="text-2xl animate-pulse-glow">🏆</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="modules" className="space-y-6">
            <Card className="glass-card border-primary/30 animate-fade-in-up shadow-elevation">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  Modul-Nutzung
                </CardTitle>
                <CardDescription className="text-base">Wie oft du welche AI-Module verwendest</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {moduleStats.map((stat, index) => (
                    <div 
                      key={stat.moduleType} 
                      className="space-y-3 p-4 rounded-lg glass-card hover-lift animate-scale-in"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{getModuleIcon(stat.moduleType)}</span>
                          <div>
                            <span className="font-semibold text-lg">{getModuleName(stat.moduleType)}</span>
                            <p className="text-xs text-muted-foreground">
                              Zuletzt: {new Date(stat.lastUsed).toLocaleDateString("de-DE")}
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-sm px-3 py-1">
                          {stat.count} Mal
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Nutzung</span>
                          <span>{totalConversations ? Math.round((stat.count / totalConversations) * 100) : 0}%</span>
                        </div>
                        <Progress 
                          value={totalConversations ? (stat.count / totalConversations) * 100 : 0}
                          className="h-2"
                        />
                      </div>
                    </div>
                  ))}
                  {moduleStats.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Brain className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>Noch keine Module verwendet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <Card className="glass-card border-success/30 animate-fade-in-up shadow-elevation">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-6 w-6 text-success" />
                  Deine Erfolge
                </CardTitle>
                <CardDescription className="text-base">Badges und Meilensteine deiner Reise</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userStats?.current_streak && userStats.current_streak >= 7 && (
                    <div className="glass-card p-4 rounded-xl hover-lift animate-scale-in border border-accent/30">
                      <div className="text-4xl mb-2 text-center">🔥</div>
                      <div className="text-center">
                        <p className="font-bold text-accent">Woche Streak</p>
                        <p className="text-xs text-muted-foreground">7 Tage in Folge</p>
                      </div>
                    </div>
                  )}
                  {userStats?.total_thoughts && userStats.total_thoughts >= 10 && (
                    <div className="glass-card p-4 rounded-xl hover-lift animate-scale-in border border-success/30" style={{ animationDelay: '0.1s' }}>
                      <div className="text-4xl mb-2 text-center">🌱</div>
                      <div className="text-center">
                        <p className="font-bold text-success">Anfänger</p>
                        <p className="text-xs text-muted-foreground">10+ Gedanken</p>
                      </div>
                    </div>
                  )}
                  {userStats?.total_thoughts && userStats.total_thoughts >= 50 && (
                    <div className="glass-card p-4 rounded-xl hover-lift animate-scale-in border border-primary/30" style={{ animationDelay: '0.2s' }}>
                      <div className="text-4xl mb-2 text-center">🚀</div>
                      <div className="text-center">
                        <p className="font-bold text-primary">Fortgeschritten</p>
                        <p className="text-xs text-muted-foreground">50+ Gedanken</p>
                      </div>
                    </div>
                  )}
                  {userStats?.total_thoughts && userStats.total_thoughts >= 100 && (
                    <div className="glass-card p-4 rounded-xl hover-lift animate-scale-in border border-accent/30" style={{ animationDelay: '0.3s' }}>
                      <div className="text-4xl mb-2 text-center">⭐</div>
                      <div className="text-center">
                        <p className="font-bold text-accent">Experte</p>
                        <p className="text-xs text-muted-foreground">100+ Gedanken</p>
                      </div>
                    </div>
                  )}
                  {collectiveUsage >= 50 && (
                    <div className="glass-card p-4 rounded-xl hover-lift animate-scale-in border border-secondary/30" style={{ animationDelay: '0.4s' }}>
                      <div className="text-4xl mb-2 text-center">🧠</div>
                      <div className="text-center">
                        <p className="font-bold text-secondary">Kollektiv-Fan</p>
                        <p className="text-xs text-muted-foreground">50%+ Kollektiv</p>
                      </div>
                    </div>
                  )}
                  {totalConversations >= 20 && (
                    <div className="glass-card p-4 rounded-xl hover-lift animate-scale-in border border-primary/30" style={{ animationDelay: '0.5s' }}>
                      <div className="text-4xl mb-2 text-center">💬</div>
                      <div className="text-center">
                        <p className="font-bold text-primary">Vielschreiber</p>
                        <p className="text-xs text-muted-foreground">20+ Konversationen</p>
                      </div>
                    </div>
                  )}
                </div>
                {(!userStats?.current_streak || userStats.current_streak < 7) && 
                 (!userStats?.total_thoughts || userStats.total_thoughts < 10) && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Award className="h-16 w-16 mx-auto mb-4 opacity-50 animate-float" />
                    <p className="text-lg font-medium mb-2">Noch keine Badges</p>
                    <p className="text-sm">Starte deine Reise und sammle Erfolge!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default UsageDashboard;