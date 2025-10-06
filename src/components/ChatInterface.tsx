import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Send, Save, Share2, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useCollectiveThink } from "@/hooks/useCollectiveThink";
import { useCreatorChat } from "@/hooks/useCreatorChat";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import ConversationSidebar from "./ConversationSidebar";

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
  
  const isCreatorMode = moduleType === "creator";
  const collectiveThink = useCollectiveThink(moduleType);
  const creatorChat = useCreatorChat();
  const { isLoading, streamThinking } = isCreatorMode ? creatorChat : collectiveThink;
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);


  const loadConversation = async (convId: string) => {
    try {
      const { data: messagesData, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", convId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      setMessages(
        messagesData.map((msg) => ({
          id: msg.id,
          role: msg.role as "user" | "assistant",
          content: msg.content,
        }))
      );
      setCurrentConversationId(convId);
    } catch (error) {
      console.error("Error loading conversation:", error);
      toast.error("Fehler beim Laden der Konversation");
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

      toast.success("Unterhaltung gespeichert!");
    } catch (error) {
      console.error("Error saving conversation:", error);
      toast.error("Fehler beim Speichern");
    }
  };

  const exportConversation = () => {
    let text = `# Konversation Export\n`;
    text += `**Modul:** ${moduleTitle}\n`;
    text += `**Datum:** ${new Date().toLocaleString("de-DE")}\n\n`;
    text += `---\n\n`;
    
    messages.forEach((m) => {
      text += `### ${m.role === "user" ? "👤 Benutzer" : "🤖 Assistent"}\n\n`;
      text += `${m.content}\n\n`;
      text += `---\n\n`;
    });

    const blob = new Blob([text], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `conversation-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    toast.success("Konversation als Markdown exportiert!");
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
    <div className="flex gap-4 h-full">
      <ConversationSidebar
        moduleType={moduleType}
        currentConversationId={currentConversationId}
        onSelectConversation={loadConversation}
        onNewConversation={newConversation}
      />
      
      <div className="flex-1 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold gradient-text">{moduleTitle}</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={saveConversation} title="Speichern">
              <Save className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={exportConversation} title="Exportieren">
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={shareConversation} title="Teilen">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Card className="flex-1 flex flex-col border-primary/20">
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <MessageBubble key={message.id} role={message.role} content={message.content} />
              ))}
              {isLoading && <TypingIndicator />}
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
    </div>
  );
};

export default ChatInterface;
