import { Bot, Cpu, Layers, Rocket, Sparkles, Zap, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

const modules = [
  {
    icon: Rocket,
    title: "App Creator",
    description: "KI-gestützte App-Generierung mit intelligenten Templates und Echtzeit-Vorschau",
    status: "Active",
    color: "from-primary to-accent",
    features: ["React", "Flask", "Vue.js", "Express"],
    path: "/app-creator",
  },
  {
    icon: Bot,
    title: "AI Ecosystem Hub",
    description: "Zentrale Steuerung für autonome KI-Agenten mit Multi-Agent-Orchestrierung",
    status: "Active",
    color: "from-secondary to-accent",
    features: ["Multi-Agent", "Task Queue", "Learning"],
    path: "/ai-ecosystem",
  },
  {
    icon: Cpu,
    title: "Edge Computing",
    description: "Autonomy Engine für dezentrale Datenverarbeitung mit minimaler Latenz",
    status: "Active",
    color: "from-accent to-primary",
    features: ["MacaluLite", "Distributed", "Real-time"],
    path: "/edge-computing",
  },
  {
    icon: Layers,
    title: "Black Sultan OS",
    description: "Full-Stack Monorepo mit Event-driven Architecture und Docker-Integration",
    status: "Active",
    color: "from-success to-primary",
    features: ["Docker", "Prisma", "EventBus"],
    path: "/black-sultan",
  },
  {
    icon: Sparkles,
    title: "Collective Mind",
    description: "Kollektive Intelligenz-Algorithmen für komplexe Problemlösungsszenarien",
    status: "Active",
    color: "from-primary to-secondary",
    features: ["Neural Nets", "Swarm Logic", "Consensus"],
    path: "/collective-mind",
  },
  {
    icon: Zap,
    title: "Solution Forge",
    description: "Aus 10.000 Möglichkeiten die eine optimale Lösung durch KI-Bewertung finden",
    status: "Active",
    color: "from-accent to-success",
    features: ["Optimization", "Scoring", "Selection"],
    path: "/solution-forge",
  },
];

const ThinkingModules = () => {
  return (
    <section className="py-32 px-4 relative">
      <div className="container mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="text-center mb-20 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border border-accent/30 mb-4">
            <Sparkles className="h-4 w-4 text-accent animate-pulse" />
            <span className="text-sm text-muted-foreground">Spezialisierte Systeme</span>
          </div>
          
          <h2 className="text-5xl md:text-6xl font-black">
            <span className="gradient-text-animated">Thinking Modules</span>
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto font-light">
            Hochspezialisierte KI-Systeme für kollektive Problemlösung
          </p>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {modules.map((module, index) => {
            const Icon = module.icon;
            return (
              <Link key={index} to={module.path}>
                <Card
                  className="group relative overflow-hidden glass-card border-border/50 hover:border-primary/50 transition-all duration-500 hover:shadow-neon cursor-pointer h-full"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Background gradient on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${module.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                  
                  {/* Animated border effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className={`absolute inset-0 bg-gradient-to-r ${module.color} blur-xl`} />
                  </div>
                  
                  <div className="relative p-8 space-y-6 z-10">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className={`p-4 rounded-2xl bg-gradient-to-br ${module.color} shadow-glow-card group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="h-8 w-8 text-background" />
                      </div>
                      <Badge 
                        variant="outline" 
                        className="bg-success/10 text-success border-success/30 font-semibold"
                      >
                        {module.status}
                      </Badge>
                    </div>

                    {/* Content */}
                    <div className="space-y-3">
                      <h3 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                        {module.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed min-h-[60px]">
                        {module.description}
                      </p>
                    </div>

                    {/* Features */}
                    <div className="flex flex-wrap gap-2 pt-2">
                      {module.features.map((feature, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-4 py-2 rounded-full bg-muted/60 text-foreground/80 font-medium border border-border/50"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>

                    {/* Hover arrow */}
                    <div className="flex items-center gap-2 text-primary opacity-0 group-hover:opacity-100 transition-all duration-300 font-semibold">
                      <span className="text-sm">Erkunden</span>
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>

                  {/* Bottom accent line */}
                  <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${module.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500`} />
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ThinkingModules;
