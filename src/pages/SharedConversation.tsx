import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import MessageBubble from "@/components/MessageBubble";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Share2 } from "lucide-react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type ConversationData = {
  title: string;
  module_type: string;
};

const SharedConversation = () => {
  const { token } = useParams<{ token: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<ConversationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSharedConversation();
  }, [token]);

  const loadSharedConversation = async () => {
    if (!token) {
      setError("Ungültiger Link");
      setLoading(false);
      return;
    }

    try {
      const { data: convData, error: convError } = await supabase
        .from("conversations")
        .select("id, title, module_type")
        .eq("share_token", token)
        .eq("is_shared", true)
        .single();

      if (convError) throw new Error("Konversation nicht gefunden");

      setConversation(convData);

      const { data: messagesData, error: messagesError } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", convData.id)
        .order("created_at", { ascending: true });

      if (messagesError) throw messagesError;

      setMessages(
        messagesData.map((msg) => ({
          id: msg.id,
          role: msg.role as "user" | "assistant",
          content: msg.content,
        }))
      );
    } catch (err: any) {
      setError(err.message || "Fehler beim Laden der Konversation");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Share2 className="h-5 w-5" />
            <span>Geteilte Konversation</span>
          </div>

          <Card className="border-primary/20 p-6">
            <div className="mb-4">
              <h1 className="text-2xl font-bold gradient-text">{conversation?.title}</h1>
              <p className="text-sm text-muted-foreground capitalize">
                {conversation?.module_type?.replace("-", " ")}
              </p>
            </div>

            <ScrollArea className="h-[600px]">
              <div className="space-y-4 pr-4">
                {messages.map((message) => (
                  <MessageBubble key={message.id} role={message.role} content={message.content} />
                ))}
              </div>
            </ScrollArea>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default SharedConversation;
