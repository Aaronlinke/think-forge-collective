import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { User, Mail, KeyRound, Sparkles } from "lucide-react";

const Settings = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [saving, setSaving] = useState(false);
  const [forceFreeMode, setForceFreeMode] = useState(() => {
    return localStorage.getItem("forceFreeMode") === "true";
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setEmail(session.user.email || "");
        loadProfile(session.user.id);
      }
    });
  }, [navigate]);

  const loadProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", userId)
        .single();

      if (error) throw error;
      if (data) {
        setUsername(data.username || "");
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("profiles")
        .update({ username })
        .eq("id", user.id);

      if (error) throw error;
      toast.success("Profil gespeichert!");
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Fehler beim Speichern");
    } finally {
      setSaving(false);
    }
  };

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
        <div className="max-w-2xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold gradient-text mb-2">Einstellungen</h1>
            <p className="text-muted-foreground">Verwalte dein Profil und Einstellungen</p>
          </div>

          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profil
              </CardTitle>
              <CardDescription>Deine persönlichen Informationen</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Benutzername</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Dein Benutzername"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  E-Mail
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Die E-Mail-Adresse kann nicht geändert werden
                </p>
              </div>
              <Button onClick={handleSaveProfile} disabled={saving} className="w-full">
                {saving ? "Wird gespeichert..." : "Profil speichern"}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                KI-Einstellungen
              </CardTitle>
              <CardDescription>Steuere das Verhalten der KI-Module</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="free-mode" className="text-base">
                    Immer kostenloser Modus
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Nutze vereinfachte lokale Antworten ohne API-Credits
                  </p>
                </div>
                <Switch
                  id="free-mode"
                  checked={forceFreeMode}
                  onCheckedChange={(checked) => {
                    setForceFreeMode(checked);
                    localStorage.setItem("forceFreeMode", String(checked));
                    toast.success(checked ? "Kostenloser Modus aktiviert" : "Normaler Modus aktiviert");
                  }}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <KeyRound className="h-5 w-5" />
                Sicherheit
              </CardTitle>
              <CardDescription>Verwalte deine Sicherheitseinstellungen</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                onClick={async () => {
                  const { error } = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: `${window.location.origin}/`,
                  });
                  if (error) {
                    toast.error("Fehler beim Zurücksetzen des Passworts");
                  } else {
                    toast.success("Passwort-Reset-Link gesendet!");
                  }
                }}
              >
                Passwort zurücksetzen
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Settings;
