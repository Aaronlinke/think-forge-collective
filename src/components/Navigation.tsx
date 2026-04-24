import { Brain, Menu, Settings, Sparkles, Moon, Sun, Crown, BarChart, Globe, MessageCircle, Clock, FlaskConical, Terminal, Shield, Network, Home, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";

const navLinks = [
  { name: "Modules", href: "#modules" },
  { name: "Intelligence", href: "#intelligence" },
];

const Navigation = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const quickLinks = useMemo(() => ([
    { label: "Start", path: "/", icon: Home },
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { label: "Chat", path: "/chat", icon: MessageCircle },
    { label: "Browser", path: "/guided-browser", icon: Globe },
    { label: "Time Machine", path: "/time-machine", icon: Clock },
    { label: "Consciousness", path: "/consciousness-lab", icon: FlaskConical },
    { label: "SVRC", path: "/svrc-terminal", icon: Terminal },
    { label: "Crypto", path: "/crypto-analyzer", icon: Shield },
    { label: "Collective Hub", path: "/collective-hub", icon: Network },
    { label: "Statistiken", path: "/usage", icon: BarChart },
    { label: "Einstellungen", path: "/settings", icon: Settings },
    { label: "Creator Chat", path: "/creator-chat", icon: Crown },
  ]), []);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-primary shadow-glow-primary">
              <Brain className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-black gradient-text">
              Think Forge
            </span>
          </a>

          <div className="hidden md:flex items-center gap-4">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.name}
              </a>
            ))}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
            <Button 
              size="sm"
              onClick={() => navigate("/collective-hub")}
              className="bg-gradient-primary hover:opacity-90 transition-all duration-300 shadow-glow-primary rounded-lg font-semibold"
            >
              Kollektiv öffnen
            </Button>
          </div>

          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent className="overflow-y-auto">
              <div className="flex flex-col gap-3 mt-6 pb-8">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Navigation
                </div>
                {navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
                  >
                    {link.name}
                  </a>
                ))}
                
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-4 mb-2">
                  Direktzugriff
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {quickLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <Button
                        key={link.path}
                        variant="outline"
                        onClick={() => navigate(link.path)}
                        className="flex flex-col items-center gap-1 h-auto py-3 text-xs"
                      >
                        <Icon className="h-5 w-5 text-primary" />
                        {link.label}
                      </Button>
                    );
                  })}
                </div>
                
                <div className="mt-auto pt-4 border-t border-border">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    className="w-full justify-start gap-2"
                  >
                    {theme === "dark" ? (
                      <>
                        <Sun className="h-4 w-4" />
                        Light Mode
                      </>
                    ) : (
                      <>
                        <Moon className="h-4 w-4" />
                        Dark Mode
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    onClick={() => navigate("/collective-hub")}
                    className="bg-gradient-primary hover:opacity-90 transition-all duration-300 shadow-glow-primary rounded-lg font-semibold w-full mt-2"
                  >
                    Kollektiv starten
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
