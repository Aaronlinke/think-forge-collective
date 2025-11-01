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
        <div className="mb-6">
          <h1 className="text-3xl font-bold gradient-text mb-2">Usage Dashboard</h1>
          <p className="text-muted-foreground">Deine Nutzungsstatistiken und Insights</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Übersicht</TabsTrigger>
            <TabsTrigger value="modules">Module</TabsTrigger>
            <TabsTrigger value="achievements">Erfolge</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-primary/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Gesamt Gedanken</CardTitle>
                  <Brain className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{userStats?.total_thoughts || 0}</div>
                  <p className="text-xs text-muted-foreground">Alle Konversationen</p>
                </CardContent>
              </Card>

              <Card className="border-primary/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Aktueller Streak</CardTitle>
                  <Zap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{userStats?.current_streak || 0} Tage</div>
                  <p className="text-xs text-muted-foreground">Längster: {userStats?.longest_streak || 0} Tage</p>
                </CardContent>
              </Card>

              <Card className="border-primary/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Konversationen</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalConversations}</div>
                  <p className="text-xs text-muted-foreground">Gespeicherte Chats</p>
                </CardContent>
              </Card>

              <Card className="border-primary/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Kollektiv-Modus</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{collectiveUsage}%</div>
                  <p className="text-xs text-muted-foreground">Nutzungsrate</p>
                </CardContent>
              </Card>
            </div>

            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle>Letzte Aktivität</CardTitle>
                <CardDescription>
                  Zuletzt aktiv: {userStats?.last_thought_date || "Noch keine Aktivität"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Streak-Fortschritt</span>
                      <span className="text-sm text-muted-foreground">
                        {userStats?.current_streak || 0} / {userStats?.longest_streak || 0} Tage
                      </span>
                    </div>
                    <Progress 
                      value={userStats?.longest_streak ? (userStats.current_streak / userStats.longest_streak) * 100 : 0} 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="modules" className="space-y-6">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle>Modul-Nutzung</CardTitle>
                <CardDescription>Wie oft du welche AI-Module verwendest</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {moduleStats.map((stat) => (
                    <div key={stat.moduleType} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{getModuleIcon(stat.moduleType)}</span>
                          <span className="font-medium">{getModuleName(stat.moduleType)}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">{stat.count} Mal</span>
                      </div>
                      <Progress 
                        value={totalConversations ? (stat.count / totalConversations) * 100 : 0} 
                      />
                      <p className="text-xs text-muted-foreground">
                        Zuletzt: {new Date(stat.lastUsed).toLocaleDateString("de-DE")}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Deine Erfolge
                </CardTitle>
                <CardDescription>Badges und Meilensteine</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {userStats?.current_streak && userStats.current_streak >= 7 && (
                    <Badge variant="secondary" className="text-lg py-2">🔥 Woche Streak</Badge>
                  )}
                  {userStats?.total_thoughts && userStats.total_thoughts >= 10 && (
                    <Badge variant="secondary" className="text-lg py-2">🌱 Anfänger</Badge>
                  )}
                  {userStats?.total_thoughts && userStats.total_thoughts >= 50 && (
                    <Badge variant="secondary" className="text-lg py-2">🚀 Fortgeschritten</Badge>
                  )}
                  {userStats?.total_thoughts && userStats.total_thoughts >= 100 && (
                    <Badge variant="secondary" className="text-lg py-2">⭐ Experte</Badge>
                  )}
                  {collectiveUsage >= 50 && (
                    <Badge variant="secondary" className="text-lg py-2">🧠 Kollektiv-Fan</Badge>
                  )}
                  {totalConversations >= 20 && (
                    <Badge variant="secondary" className="text-lg py-2">💬 Vielschreiber</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default UsageDashboard;