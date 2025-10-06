import { Brain, Lightbulb, Code, BarChart, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";

const MODULE_ICONS: Record<string, { icon: typeof Brain; label: string; color: string }> = {
  strategic: { icon: Brain, label: "Strategisch", color: "text-blue-500" },
  creative: { icon: Lightbulb, label: "Kreativ", color: "text-yellow-500" },
  technical: { icon: Code, label: "Technisch", color: "text-green-500" },
  analytical: { icon: BarChart, label: "Analytisch", color: "text-purple-500" },
  business: { icon: Briefcase, label: "Business", color: "text-orange-500" },
};

interface CollectiveThinkingIndicatorProps {
  activeModules: string[];
}

const CollectiveThinkingIndicator = ({ activeModules }: CollectiveThinkingIndicatorProps) => {
  if (activeModules.length === 0) return null;

  return (
    <div className="flex flex-col gap-3 p-4 rounded-lg border border-primary/20 bg-primary/5 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <div className="relative">
          <Brain className="h-5 w-5 text-primary animate-pulse" />
          <div className="absolute inset-0 animate-ping">
            <Brain className="h-5 w-5 text-primary opacity-75" />
          </div>
        </div>
        <span className="text-sm font-medium text-primary">
          Kollektive Intelligenz aktiviert
        </span>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {activeModules.map((moduleType) => {
          const module = MODULE_ICONS[moduleType];
          if (!module) return null;
          
          const Icon = module.icon;
          
          return (
            <div
              key={moduleType}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full",
                "bg-background/80 border border-border",
                "animate-pulse"
              )}
            >
              <Icon className={cn("h-3.5 w-3.5", module.color)} />
              <span className="text-xs font-medium text-muted-foreground">
                {module.label}
              </span>
            </div>
          );
        })}
      </div>
      
      <p className="text-xs text-muted-foreground">
        Alle Module denken parallel mit und bringen ihre Expertise ein...
      </p>
    </div>
  );
};

export default CollectiveThinkingIndicator;
