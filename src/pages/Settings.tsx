import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { User, Mail, KeyRound, Sparkles } from "lucide-react";

const Settings = () => {
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("Kollektiv-Nutzer");
  const [forceFreeMode, setForceFreeMode] = useState(() => {
    return localStorage.getItem("forceFreeMode") === "true";
  });

  useEffect(() => {
    const savedName = localStorage.getItem("collectiveDisplayName");
    if (savedName) {
      setUsername(savedName);
    }
  };

  const handleSaveProfile = async () => {
    localStorage.setItem("collectiveDisplayName", username.trim() || "Kollektiv-Nutzer");
    toast.success("Lokales Profil gespeichert!");
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
              <CardDescription>Lokale Einstellungen für diese Session</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Benutzername</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Dein Anzeigename"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Modus
                </Label>
                <Input
                  id="email"
                  value="Lokaler Zugriff ohne Anmeldung"
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Es werden keine Login-Daten mehr benötigt
                </p>
              </div>
              <Button onClick={handleSaveProfile} className="w-full">
                Profil lokal speichern
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
                Zugriff
              </CardTitle>
              <CardDescription>Der Zugang läuft jetzt direkt ohne Anmeldebarriere</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
                Login, Passwort-Reset und Session-Zwang sind aus der Oberfläche entfernt.
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Settings;
