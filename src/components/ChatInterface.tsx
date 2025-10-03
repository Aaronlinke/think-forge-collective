import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Send, Save, Share2, Download, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useCollectiveThink } from "@/hooks/useCollectiveThink";

type Message = {
  role: "user" | "assistant";
  content: string;
  id: string;
};

type Conversation = {
  id: string;
  title: string;
  is_favorite: boolean;
};

type ChatInterfaceProps = {
  moduleType: string;
  moduleTitle: string;
};

const ChatInterface = ({ moduleType, moduleTitle }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const { isLoading, streamThinking } = useCollectiveThink(moduleType);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversations();
  }, [moduleType]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const loadConversations = async () => {
    const { data, error } = await supabase
      .from("conversations")
      .select("id, title, is_favorite")
      .eq("module_type", moduleType)
      .order("updated_at", { ascending: false });

    if (!error && data) {
      setConversations(data);
    }
  };

  const saveConversation = async () => {
    if (messages.length === 0) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const title = messages[0]?.content.slice(0, 50) || "Neue Unterhaltung";

      let convId = currentConversationId;

      if (!convId) {
        const { data, error } = await supabase
          .from("conversations")
          .insert({
            user_id: user.id,
            module_type: moduleType,
            title,
          })
          .select()
          .single();

        if (error) throw error;
        convId = data.id;
        setCurrentConversationId(convId);
      }

      for (const msg of messages) {
        await supabase.from("messages").insert({
          conversation_id: convId,
          role: msg.role,
          content: msg.content,
        });
      }

      await loadConversations();
      toast.success("Unterhaltung gespeichert!");
    } catch (error) {
      console.error("Error saving conversation:", error);
      toast.error("Fehler beim Speichern");
    }
  };

  const exportConversation = () => {
    const text = messages.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join("\n\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${moduleTitle}_${Date.now()}.txt`;
    a.click();
    toast.success("Exportiert!");
  };

  const shareConversation = async () => {
    if (!currentConversationId) {
      toast.error("Bitte speichere die Unterhaltung zuerst");
      return;
    }

    const token = crypto.randomUUID();
    const { error } = await supabase
      .from("conversations")
      .update({ is_shared: true, share_token: token })
      .eq("id", currentConversationId);

    if (error) {
      toast.error("Fehler beim Teilen");
      return;
    }

    const shareUrl = `${window.location.origin}/shared/${token}`;
    await navigator.clipboard.writeText(shareUrl);
    toast.success("Link kopiert!");
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    const assistantMessage: Message = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "",
    };

    setMessages((prev) => [...prev, assistantMessage]);

    await streamThinking(
      [...messages, userMessage].map((m) => ({ role: m.role, content: m.content })),
      (delta) => {
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last.role === "assistant") {
            last.content += delta;
          }
          return updated;
        });
      },
      () => {
        // Update user stats
        updateUserStats();
      }
    );
  };

  const updateUserStats = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: stats } = await supabase
      .from("user_stats")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (stats) {
      const today = new Date().toISOString().split("T")[0];
      const lastDate = stats.last_thought_date;
      const isConsecutive = lastDate === new Date(Date.now() - 86400000).toISOString().split("T")[0];

      await supabase
        .from("user_stats")
        .update({
          total_thoughts: stats.total_thoughts + 1,
          current_streak: isConsecutive ? stats.current_streak + 1 : 1,
          longest_streak: Math.max(stats.longest_streak, isConsecutive ? stats.current_streak + 1 : 1),
          last_thought_date: today,
        })
        .eq("user_id", user.id);
    }
  };

  const newConversation = () => {
    setMessages([]);
    setCurrentConversationId(null);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold gradient-text">{moduleTitle}</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={newConversation}>
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={saveConversation}>
            <Save className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={exportConversation}>
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={shareConversation}>
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card className="flex-1 flex flex-col border-primary/20">
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-border">
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Deine Gedanken..."
              className="resize-none"
              rows={3}
              disabled={isLoading}
            />
            <Button onClick={sendMessage} disabled={isLoading || !input.trim()} size="icon">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ChatInterface;
