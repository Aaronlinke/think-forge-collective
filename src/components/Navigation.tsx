import { Brain, Menu, LogOut, User, Settings, Sparkles, Moon, Sun } from "lucide-react";
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

const navLinks = [
  { name: "Modules", href: "#modules" },
  { name: "Intelligence", href: "#intelligence" },
];

const Navigation = () => {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

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
                  <DropdownMenuItem onClick={() => navigate("/dashboard")} className="cursor-pointer">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Dashboard
                  </DropdownMenuItem>
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
            <SheetContent>
              <div className="flex flex-col gap-6 mt-8">
                {navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    className="text-lg font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </a>
                ))}
                {user && (
                  <>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span className="text-sm">{user.email}</span>
                    </div>
                    <Button 
                      variant="outline"
                      onClick={() => navigate("/dashboard")}
                      className="flex items-center gap-2 w-full"
                    >
                      <Sparkles className="h-4 w-4" />
                      Dashboard
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => navigate("/settings")}
                      className="flex items-center gap-2 w-full"
                    >
                      <Settings className="h-4 w-4" />
                      Einstellungen
                    </Button>
                  </>
                )}
                {user ? (
                  <Button 
                    variant="outline"
                    onClick={handleSignOut}
                    className="flex items-center gap-2 w-full"
                  >
                    <LogOut className="h-4 w-4" />
                    Abmelden
                  </Button>
                ) : (
                  <Button 
                    onClick={() => navigate("/auth")}
                    className="bg-gradient-primary hover:opacity-90 transition-all duration-300 shadow-glow-primary rounded-lg font-semibold w-full"
                  >
                    Anmelden
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
