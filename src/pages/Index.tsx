import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import ThinkingModules from "@/components/ThinkingModules";
import CollectiveIntelligence from "@/components/CollectiveIntelligence";

const Index = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
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
    <div className="min-h-screen animate-fade-in">
      <Navigation />
      <main>
        <HeroSection />
        <div id="modules" className="animate-fade-in">
          <ThinkingModules />
        </div>
        <div id="intelligence" className="animate-fade-in">
          <CollectiveIntelligence />
        </div>
      </main>
      <footer className="border-t border-border/40 py-8 px-4 mt-20">
        <div className="container mx-auto max-w-7xl text-center text-sm text-muted-foreground">
          <p>© 2025 Think Forge Collective. Jeder Gedanke zählt.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
