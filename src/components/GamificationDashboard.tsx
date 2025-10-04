import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, Trophy, Star, Zap } from "lucide-react";

type UserStats = {
  total_thoughts: number;
  current_streak: number;
  longest_streak: number;
  badges: string[];
};

const GamificationDashboard = () => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("user_stats")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      setStats({
        total_thoughts: data.total_thoughts || 0,
        current_streak: data.current_streak || 0,
        longest_streak: data.longest_streak || 0,
        badges: Array.isArray(data.badges) ? data.badges as string[] : []
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="border-primary/20">
        <CardHeader>
          <div className="h-6 bg-muted animate-pulse rounded w-1/2 mb-2" />
          <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  const badges = [
    { id: "first_thought", name: "Erster Gedanke", icon: Star, earned: stats.total_thoughts >= 1 },
    { id: "week_streak", name: "7-Tage Streak", icon: Flame, earned: stats.current_streak >= 7 },
    { id: "power_thinker", name: "Power Denker", icon: Zap, earned: stats.total_thoughts >= 50 },
    { id: "master", name: "Meister", icon: Trophy, earned: stats.total_thoughts >= 100 },
  ];

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          Deine Statistiken
        </CardTitle>
        <CardDescription>Verfolge deinen Fortschritt und sammle Badges</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold gradient-text">{stats.total_thoughts}</div>
            <div className="text-sm text-muted-foreground">Gedanken</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-500 flex items-center justify-center gap-1">
              {stats.current_streak}
              <Flame className="h-6 w-6" />
            </div>
            <div className="text-sm text-muted-foreground">Streak</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-500">{stats.longest_streak}</div>
            <div className="text-sm text-muted-foreground">Bester Streak</div>
          </div>
        </div>

        <div className="border-t border-border pt-4">
          <h4 className="text-sm font-semibold mb-3">Badges</h4>
          <div className="grid grid-cols-2 gap-2">
            {badges.map((badge) => {
              const Icon = badge.icon;
              return (
                <div
                  key={badge.id}
                  className={`flex items-center gap-2 p-2 rounded-lg border ${
                    badge.earned
                      ? "border-primary/50 bg-primary/5"
                      : "border-border bg-muted/50 opacity-50"
                  }`}
                >
                  <Icon className={`h-5 w-5 ${badge.earned ? "text-primary" : "text-muted-foreground"}`} />
                  <span className="text-sm">{badge.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GamificationDashboard;
