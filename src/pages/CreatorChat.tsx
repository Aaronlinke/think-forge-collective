import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import Navigation from "@/components/Navigation";
import ChatInterface from "@/components/ChatInterface";
import { Loader2, Crown } from "lucide-react";

const CreatorChat = () => {
  const { isAdmin, isLoading } = useAdminCheck();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      navigate("/dashboard");
    }
  }, [isAdmin, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center gap-3">
          <Crown className="h-8 w-8 text-yellow-500" />
          <div>
            <h1 className="text-3xl font-bold gradient-text">Creator Chat</h1>
            <p className="text-muted-foreground mt-1">
              Exklusiver Zugang zum stärksten KI-Modell (Gemini 2.5 Pro)
            </p>
          </div>
        </div>
        <ChatInterface moduleType="creator" moduleTitle="Creator AI Assistant" />
      </main>
    </div>
  );
};

export default CreatorChat;
