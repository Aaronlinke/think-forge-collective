import { Brain, Menu, LogOut, User, Settings, Sparkles, Moon, Sun, Crown, BarChart, Globe, MessageCircle, Clock, FlaskConical, Terminal, Shield, Network } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { useAdminCheck } from "@/hooks/useAdminCheck";

const navLinks = [
  { name: "Modules", href: "#modules" },
  { name: "Intelligence", href: "#intelligence" },
];

const Navigation = () => {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { isAdmin } = useAdminCheck();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Erfolgreich abgemeldet");
    navigate("/");
  };

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
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">{user.email?.split('@')[0]}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/chat")} className="cursor-pointer">
                    <MessageCircle className="mr-2 h-4 w-4 text-primary" />
                    Universal Chat
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/dashboard")} className="cursor-pointer">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/usage")} className="cursor-pointer">
                    <BarChart className="mr-2 h-4 w-4" />
                    Statistiken
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/guided-browser")} className="cursor-pointer">
                    <Globe className="mr-2 h-4 w-4" />
                    Guided Browser
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/time-machine")} className="cursor-pointer">
                    <Clock className="mr-2 h-4 w-4 text-cyan-500" />
                    Time Machine
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/consciousness-lab")} className="cursor-pointer">
                    <FlaskConical className="mr-2 h-4 w-4 text-purple-500" />
                    Consciousness Lab
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/svrc-terminal")} className="cursor-pointer">
                    <Terminal className="mr-2 h-4 w-4 text-green-500" />
                    SVRC Terminal
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/crypto-analyzer")} className="cursor-pointer">
                    <Shield className="mr-2 h-4 w-4 text-orange-500" />
                    Crypto Analyzer
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/collective-hub")} className="cursor-pointer">
                    <Network className="mr-2 h-4 w-4 text-yellow-500" />
                    Collective Hub
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem onClick={() => navigate("/creator-chat")} className="cursor-pointer">
                      <Crown className="mr-2 h-4 w-4 text-yellow-500" />
                      Creator Chat
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => navigate("/settings")} className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Einstellungen
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Abmelden
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                size="sm"
                onClick={() => navigate("/auth")}
                className="bg-gradient-primary hover:opacity-90 transition-all duration-300 shadow-glow-primary rounded-lg font-semibold"
              >
                Anmelden
              </Button>
            )}
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
                
                {user && (
                  <>
                    <div className="flex items-center gap-2 text-muted-foreground py-2 border-t border-border mt-2">
                      <User className="h-4 w-4" />
                      <span className="text-sm truncate">{user.email}</span>
                    </div>
                    
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-4 mb-2">
                      Apps
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        variant="outline"
                        onClick={() => navigate("/chat")}
                        className="flex flex-col items-center gap-1 h-auto py-3 text-xs"
                      >
                        <MessageCircle className="h-5 w-5 text-primary" />
                        Chat
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => navigate("/dashboard")}
                        className="flex flex-col items-center gap-1 h-auto py-3 text-xs"
                      >
                        <Sparkles className="h-5 w-5" />
                        Dashboard
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => navigate("/usage")}
                        className="flex flex-col items-center gap-1 h-auto py-3 text-xs"
                      >
                        <BarChart className="h-5 w-5" />
                        Statistiken
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => navigate("/guided-browser")}
                        className="flex flex-col items-center gap-1 h-auto py-3 text-xs"
                      >
                        <Globe className="h-5 w-5" />
                        Browser
                      </Button>
                    </div>
                    
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-4 mb-2">
                      Tools
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        variant="outline"
                        onClick={() => navigate("/time-machine")}
                        className="flex flex-col items-center gap-1 h-auto py-3 text-xs"
                      >
                        <Clock className="h-5 w-5 text-cyan-500" />
                        Time Machine
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => navigate("/consciousness-lab")}
                        className="flex flex-col items-center gap-1 h-auto py-3 text-xs"
                      >
                        <FlaskConical className="h-5 w-5 text-purple-500" />
                        Consciousness
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => navigate("/svrc-terminal")}
                        className="flex flex-col items-center gap-1 h-auto py-3 text-xs"
                      >
                        <Terminal className="h-5 w-5 text-green-500" />
                        SVRC
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => navigate("/crypto-analyzer")}
                        className="flex flex-col items-center gap-1 h-auto py-3 text-xs"
                      >
                        <Shield className="h-5 w-5 text-orange-500" />
                        Crypto
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => navigate("/collective-hub")}
                        className="flex flex-col items-center gap-1 h-auto py-3 text-xs col-span-2"
                      >
                        <Network className="h-5 w-5 text-yellow-500" />
                        Collective Hub
                      </Button>
                      {isAdmin && (
                        <Button 
                          variant="outline"
                          onClick={() => navigate("/creator-chat")}
                          className="flex flex-col items-center gap-1 h-auto py-3 text-xs col-span-2"
                        >
                          <Crown className="h-5 w-5 text-yellow-500" />
                          Creator Chat
                        </Button>
                      )}
                    </div>
                    
                    <div className="border-t border-border mt-4 pt-4">
                      <Button 
                        variant="ghost"
                        onClick={() => navigate("/settings")}
                        className="flex items-center gap-2 w-full justify-start"
                      >
                        <Settings className="h-4 w-4" />
                        Einstellungen
                      </Button>
                    </div>
                  </>
                )}
                
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
                  
                  {user ? (
                    <Button 
                      variant="ghost"
                      onClick={handleSignOut}
                      className="flex items-center gap-2 w-full justify-start text-destructive hover:text-destructive mt-2"
                    >
                      <LogOut className="h-4 w-4" />
                      Abmelden
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => navigate("/auth")}
                      className="bg-gradient-primary hover:opacity-90 transition-all duration-300 shadow-glow-primary rounded-lg font-semibold w-full mt-2"
                    >
                      Anmelden
                    </Button>
                  )}
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
