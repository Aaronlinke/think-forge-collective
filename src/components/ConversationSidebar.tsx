import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageSquare, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";

type Conversation = {
  id: string;
  title: string;
  is_favorite: boolean;
  created_at: string;
};

type ConversationSidebarProps = {
  moduleType: string;
  currentConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
};

const ConversationSidebar = ({
  moduleType,
  currentConversationId,
  onSelectConversation,
  onNewConversation,
}: ConversationSidebarProps) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConversations();
  }, [moduleType]);

  const loadConversations = async () => {
    try {
      const { data, error } = await supabase
        .from("conversations")
        .select("id, title, is_favorite, created_at")
        .eq("module_type", moduleType)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      setConversations(data || []);
    } catch (error) {
      console.error("Error loading conversations:", error);
      toast.error("Fehler beim Laden der Konversationen");
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (id: string, isFavorite: boolean) => {
    try {
      const { error } = await supabase
        .from("conversations")
        .update({ is_favorite: !isFavorite })
        .eq("id", id);

      if (error) throw error;
      loadConversations();
      toast.success(isFavorite ? "Favorit entfernt" : "Als Favorit markiert");
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast.error("Fehler beim Aktualisieren");
    }
  };

  const deleteConversation = async (id: string) => {
    try {
      const { error } = await supabase
        .from("conversations")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      if (currentConversationId === id) {
        onNewConversation();
      }
      
      loadConversations();
      toast.success("Konversation gelöscht");
    } catch (error) {
      console.error("Error deleting conversation:", error);
      toast.error("Fehler beim Löschen");
    }
  };

  if (loading) {
    return (
      <Card className="w-80 p-4 border-primary/20">
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-80 flex flex-col border-primary/20">
      <div className="p-4 border-b border-border">
        <Button onClick={onNewConversation} className="w-full">
          <MessageSquare className="mr-2 h-4 w-4" />
          Neue Konversation
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          {conversations.length === 0 ? (
            <div className="text-center text-muted-foreground p-4">
              Keine Konversationen
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                className={`p-3 rounded-lg cursor-pointer hover:bg-accent transition-colors ${
                  currentConversationId === conv.id ? "bg-accent" : ""
                }`}
                onClick={() => onSelectConversation(conv.id)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{conv.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(conv.created_at).toLocaleDateString("de-DE")}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(conv.id, conv.is_favorite);
                      }}
                    >
                      <Star
                        className={`h-4 w-4 ${
                          conv.is_favorite ? "fill-yellow-500 text-yellow-500" : ""
                        }`}
                      />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteConversation(conv.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </Card>
  );
};

export default ConversationSidebar;
