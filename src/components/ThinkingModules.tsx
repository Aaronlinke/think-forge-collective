import { Bot, Cpu, Layers, Rocket, Sparkles, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const modules = [
  {
    icon: Rocket,
    title: "App Creator",
    description: "KI-gestützte App-Generierung mit intelligenten Templates",
    status: "Active",
    color: "primary",
    features: ["React", "Flask", "Vue.js", "Express"],
  },
  {
    icon: Bot,
    title: "AI Ecosystem Hub",
    description: "Zentrale Steuerung für autonome KI-Agenten und Bots",
    status: "Active",
    color: "secondary",
    features: ["Multi-Agent", "Task Queue", "Learning"],
  },
  {
    icon: Cpu,
    title: "Edge Computing",
    description: "Autonomy Engine für dezentrale Datenverarbeitung",
    status: "Active",
    color: "accent",
    features: ["MacaluLite", "Distributed", "Real-time"],
  },
  {
    icon: Layers,
    title: "Black Sultan OS",
    description: "Full-Stack Monorepo mit Event-driven Architecture",
    status: "Beta",
    color: "success",
    features: ["Docker", "Prisma", "EventBus"],
  },
  {
    icon: Sparkles,
    title: "Collective Mind",
    description: "Kollektive Intelligenz-Algorithmen für Problemlösung",
    status: "Coming Soon",
    color: "primary",
    features: ["Neural Nets", "Swarm Logic", "Consensus"],
  },
  {
    icon: Zap,
    title: "Solution Forge",
    description: "10.000 Möglichkeiten → 1 optimale Lösung",
    status: "Coming Soon",
    color: "accent",
    features: ["Optimization", "Scoring", "Selection"],
  },
];

const statusColors = {
  Active: "bg-success/20 text-success border-success/50",
  Beta: "bg-secondary/20 text-secondary border-secondary/50",
  "Coming Soon": "bg-muted text-muted-foreground border-muted",
};

const ThinkingModules = () => {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold">
            <span className="gradient-text">Thinking Modules</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Spezialisierte Systeme für kollektive Problemlösung
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module, index) => {
            const Icon = module.icon;
            return (
              <Card
                key={index}
                className="group relative overflow-hidden bg-card/50 backdrop-blur-sm border-primary/20 hover:border-primary/50 transition-all duration-500 hover:shadow-glow-primary cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="p-3 rounded-xl bg-gradient-primary">
                      <Icon className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <Badge 
                      variant="outline" 
                      className={statusColors[module.status as keyof typeof statusColors]}
                    >
                      {module.status}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-foreground group-hover:gradient-text transition-all duration-300">
                      {module.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {module.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {module.features.map((feature, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-3 py-1 rounded-full bg-muted/50 text-muted-foreground"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ThinkingModules;
