import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import GamificationDashboard from "@/components/GamificationDashboard";
import ThinkingModules from "@/components/ThinkingModules";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setLoading(false);
      }
    });
  }, [navigate]);

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
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4 py-12">
            <h1 className="text-5xl font-bold gradient-text">
              Willkommen bei Think Forge
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Nutze die Kraft der kollektiven Intelligenz und spezialisierter AI-Module
              für brillante Lösungen
            </p>
            <Button size="lg" className="mt-4">
              Module entdecken <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>

          {/* Gamification Dashboard */}
          <div className="max-w-2xl mx-auto">
            <GamificationDashboard />
          </div>

          {/* Thinking Modules */}
          <div>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Denkmodule</h2>
              <p className="text-muted-foreground">
                Wähle das passende Modul für dein Problem
              </p>
            </div>
            <ThinkingModules />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
