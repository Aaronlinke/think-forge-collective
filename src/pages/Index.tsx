import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import ThinkingModules from "@/components/ThinkingModules";
import CollectiveIntelligence from "@/components/CollectiveIntelligence";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main>
        <HeroSection />
        <div id="modules">
          <ThinkingModules />
        </div>
        <div id="intelligence">
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
