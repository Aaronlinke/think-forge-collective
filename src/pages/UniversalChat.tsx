import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, Send, Save, Share2, Download, Brain, Globe, 
  Zap, Users, Sparkles, Camera, ChevronDown, History
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useUniversalChat } from "@/hooks/useUniversalChat";
import { useConversationBranching } from "@/hooks/useConversationBranching";
import { useWebSocket } from "@/hooks/useWebSocket";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import MessageBubble from "@/components/MessageBubble";
import TypingIndicator from "@/components/TypingIndicator";
import ConversationSidebar from "@/components/ConversationSidebar";
import { BranchSelector } from "@/components/BranchSelector";

type Message = {
  role: "user" | "assistant";
  content: string;
  id: string;
};

type ChatMode = "creator" | "collective-think" | "collective-intelligence" | "browser";

const modeConfig = {
  creator: {
    label: "Creator Chat",
    icon: Sparkles,
    description: "Direkter KI-Assistent",
    color: "from-primary to-accent",
  },
  "collective-think": {
    label: "Collective Think",
    icon: Brain,
    description: "Tiefes Denken mit mehreren Perspektiven",
    color: "from-secondary to-primary",
  },
  "collective-intelligence": {
    label: "Collective Intelligence",
    icon: Users,
    description: "Mehrere KI-Module arbeiten zusammen",
    color: "from-accent to-secondary",
  },
  browser: {
    label: "Browser Control",
    icon: Globe,
    description: "KI steuert Webseiten mit Vision AI",
    color: "from-success to-primary",
  },
};

export default function UniversalChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [chatMode, setChatMode] = useState<ChatMode>("creator");
  const [browserUrl, setBrowserUrl] = useState("https://example.com");
  const [showBrowserPanel, setShowBrowserPanel] = useState(false);
  
  const { isConnected: wsConnected, sendMessage: wsSendMessage } = useWebSocket();
  const branching = useConversationBranching(currentConversationId);
  const { isLoading, streamThinking } = useUniversalChat(chatMode);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const loadConversation = async (convId: string) => {
    try {
      let query = supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", convId);

      if (branching.currentBranchId) {
        query = query.eq("branch_id", branching.currentBranchId);
      } else {
        query = query.is("branch_id", null);
      }

      const { data: messagesData, error } = await query.order("created_at", { ascending: true });

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

  useEffect(() => {
    if (currentConversationId) {
      loadConversation(currentConversationId);
    }
  }, [branching.currentBranchId]);

  const autoSaveConversation = async () => {
    if (messages.length === 0) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const title = messages[0]?.content.slice(0, 50) || "Neue Unterhaltung";

      let convId = currentConversationId;

      if (!convId) {
        const { data, error } = await supabase
          .from("conversations")
          .insert({
            user_id: user.id,
            module_type: chatMode,
            title,
            collective_mode: chatMode,
          })
          .select()
          .single();

        if (error) throw error;
        convId = data.id;
        setCurrentConversationId(convId);
      }

      const existingCount = await supabase
        .from("messages")
        .select("id", { count: "exact" })
        .eq("conversation_id", convId);

      const newMessages = messages.slice(existingCount.count || 0);
      
      for (const msg of newMessages) {
        await supabase.from("messages").insert({
          conversation_id: convId,
          role: msg.role,
          content: msg.content,
          branch_id: branching.currentBranchId,
        });
      }
    } catch (error) {
      console.error("Error auto-saving conversation:", error);
    }
  };

  const saveConversation = async () => {
    await autoSaveConversation();
    toast.success("Unterhaltung gespeichert!");
  };

  const exportConversation = () => {
    let text = `# Universal Chat Export\n`;
    text += `**Modus:** ${modeConfig[chatMode].label}\n`;
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
    a.download = `chat-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    toast.success("Konversation exportiert!");
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

  const captureAndAnalyze = async () => {
    if (!browserUrl) return;
    
    toast.info("Screenshot wird erstellt und analysiert...");
    
    try {
      const response = await fetch(
        "https://cyzgmlgbpbcyomlkvrrm.supabase.co/functions/v1/analyze-screenshot",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: browserUrl,
            task: input || "Analysiere diese Webseite und beschreibe was du siehst",
          }),
        }
      );

      const data = await response.json();
      
      if (data.analysis) {
        const analysisMessage: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: `🔍 **Vision AI Analyse für ${browserUrl}:**\n\n${data.analysis}`,
        };
        setMessages(prev => [...prev, analysisMessage]);
      }
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error("Fehler bei der Analyse");
    }
  };

  const sendBrowserCommand = (command: string, params?: Record<string, unknown>) => {
    if (!wsConnected) {
      toast.error("Browser Extension nicht verbunden");
      return;
    }
    
    wsSendMessage({
      type: "command",
      action: command,
      ...params,
      timestamp: new Date().toISOString(),
    });
    
    toast.success(`Befehl "${command}" gesendet`);
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

    // Handle browser mode commands
    if (chatMode === "browser") {
      const lowerInput = input.toLowerCase();
      
      if (lowerInput.includes("analysiere") || lowerInput.includes("schau dir an")) {
        await captureAndAnalyze();
        return;
      }
      
      if (lowerInput.includes("klick") || lowerInput.includes("click")) {
        const match = input.match(/(?:klick|click)\s+(?:auf\s+)?["']?([^"']+)["']?/i);
        if (match) {
          sendBrowserCommand("click", { selector: match[1] });
        }
      }
      
      if (lowerInput.includes("scroll")) {
        const direction = lowerInput.includes("hoch") || lowerInput.includes("up") ? "up" : "down";
        sendBrowserCommand("scroll", { direction });
      }
      
      if (lowerInput.includes("navigiere") || lowerInput.includes("gehe zu") || lowerInput.includes("öffne")) {
        const urlMatch = input.match(/(?:https?:\/\/[^\s]+)/i);
        if (urlMatch) {
          setBrowserUrl(urlMatch[0]);
          sendBrowserCommand("navigate", { url: urlMatch[0] });
        }
      }
    }

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
      async () => {
        await autoSaveConversation();
      }
    );
  };

  const newConversation = () => {
    setMessages([]);
    setCurrentConversationId(null);
  };

  const handleCreateBranch = async (messageId: string) => {
    const branchId = await branching.createBranch(messageId);
    if (branchId && currentConversationId) {
      const messageIndex = messages.findIndex((m) => m.id === messageId);
      if (messageIndex !== -1) {
        setMessages(messages.slice(0, messageIndex + 1));
      }
    }
  };

  const ModeIcon = modeConfig[chatMode].icon;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div className="hidden md:block">
        <ConversationSidebar
          moduleType={chatMode}
          currentConversationId={currentConversationId}
          onSelectConversation={loadConversation}
          onNewConversation={newConversation}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen">
        {/* Header */}
        <header className="border-b border-border/50 bg-card/30 backdrop-blur-sm px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Mobile Sidebar */}
              <Sheet>
                <SheetTrigger asChild className="md:hidden">
                  <Button variant="ghost" size="icon">
                    <History className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-80">
                  <ConversationSidebar
                    moduleType={chatMode}
                    currentConversationId={currentConversationId}
                    onSelectConversation={loadConversation}
                    onNewConversation={newConversation}
                  />
                </SheetContent>
              </Sheet>

              {/* Mode Selector */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2">
                    <div className={`p-1.5 rounded-lg bg-gradient-to-br ${modeConfig[chatMode].color}`}>
                      <ModeIcon className="h-4 w-4 text-foreground" />
                    </div>
                    <span className="font-semibold">{modeConfig[chatMode].label}</span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-64">
                  <DropdownMenuLabel>Chat-Modus wählen</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {(Object.keys(modeConfig) as ChatMode[]).map((mode) => {
                    const Icon = modeConfig[mode].icon;
                    return (
                      <DropdownMenuItem
                        key={mode}
                        onClick={() => setChatMode(mode)}
                        className="gap-3 py-3"
                      >
                        <div className={`p-2 rounded-lg bg-gradient-to-br ${modeConfig[mode].color}`}>
                          <Icon className="h-4 w-4 text-foreground" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{modeConfig[mode].label}</div>
                          <div className="text-xs text-muted-foreground">
                            {modeConfig[mode].description}
                          </div>
                        </div>
                        {chatMode === mode && (
                          <Badge variant="secondary" className="text-xs">Aktiv</Badge>
                        )}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mode description */}
              <span className="text-xs text-muted-foreground hidden lg:block">
                {modeConfig[chatMode].description}
              </span>

              {/* Browser Mode Controls */}
              {chatMode === "browser" && (
                <div className="flex items-center gap-2">
                  <Badge variant={wsConnected ? "default" : "destructive"} className="gap-1">
                    <Zap className="h-3 w-3" />
                    {wsConnected ? "Verbunden" : "Getrennt"}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowBrowserPanel(!showBrowserPanel)}
                  >
                    <Globe className="h-4 w-4 mr-2" />
                    Browser Panel
                  </Button>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {currentConversationId && branching.branches.length > 0 && (
                <BranchSelector
                  branches={branching.branches}
                  currentBranchId={branching.currentBranchId}
                  onSwitchBranch={branching.switchBranch}
                  onDeleteBranch={branching.deleteBranch}
                  onRenameBranch={branching.renameBranch}
                />
              )}
              <Button variant="ghost" size="icon" onClick={saveConversation} title="Speichern">
                <Save className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={exportConversation} title="Exportieren">
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={shareConversation} title="Teilen">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Browser Panel (only in browser mode) */}
        {chatMode === "browser" && showBrowserPanel && (
          <div className="border-b border-border/50 bg-card/20 p-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label className="text-xs text-muted-foreground">URL</Label>
                <input
                  type="url"
                  value={browserUrl}
                  onChange={(e) => setBrowserUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border text-sm"
                  placeholder="https://example.com"
                />
              </div>
              <div className="flex gap-2 pt-5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => sendBrowserCommand("navigate", { url: browserUrl })}
                  disabled={!wsConnected}
                >
                  <Globe className="h-4 w-4 mr-2" />
                  Navigieren
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={captureAndAnalyze}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Analysieren
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => sendBrowserCommand("scroll", { direction: "down" })}
                  disabled={!wsConnected}
                >
                  Scroll ↓
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Chat Area */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="max-w-4xl mx-auto space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-16 space-y-6">
                <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${modeConfig[chatMode].color}`}>
                  <ModeIcon className="h-12 w-12 text-foreground" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold gradient-text mb-2">
                    {modeConfig[chatMode].label}
                  </h2>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    {modeConfig[chatMode].description}
                  </p>
                </div>
                {chatMode === "browser" && (
                  <div className="text-sm text-muted-foreground">
                    <p>Beispiele: "Analysiere die Seite", "Klick auf Login", "Scroll runter"</p>
                  </div>
                )}
              </div>
            )}

            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                role={message.role}
                content={message.content}
                messageId={message.id}
                onCreateBranch={currentConversationId ? handleCreateBranch : undefined}
              />
            ))}

            {isLoading && <TypingIndicator />}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t border-border/50 bg-card/30 backdrop-blur-sm p-4">
          <div className="max-w-4xl mx-auto flex gap-3">
            <div className="flex-1 relative">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder={
                  chatMode === "browser"
                    ? "Sage mir was ich tun soll... (z.B. 'Analysiere die Seite', 'Klick auf Button')"
                    : "Schreibe eine Nachricht..."
                }
                className="resize-none pr-12 min-h-[60px]"
                rows={2}
                disabled={isLoading}
              />
            </div>
            <Button
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              size="lg"
              className="px-6"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
