import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Plus, Star, Trash2, Search, Menu } from "lucide-react";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false);

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

  const filteredConversations = conversations.filter((conv) =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sidebarContent = (
    <>
      <Button
        onClick={() => {
          onNewConversation();
          setOpen(false);
        }}
        className="w-full mb-4"
        size="lg"
      >
        <Plus className="mr-2 h-5 w-5" />
        Neue Konversation
      </Button>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Suchen..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-2">
          {filteredConversations.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              {searchQuery ? "Keine Konversationen gefunden" : "Keine Konversationen vorhanden"}
            </p>
          ) : (
            filteredConversations.map((conv) => (
              <div
                key={conv.id}
                className={`p-3 rounded-lg border cursor-pointer transition-all hover:bg-accent ${
                  currentConversationId === conv.id
                    ? "bg-accent border-primary"
                    : "bg-card border-border"
                }`}
                onClick={() => {
                  onSelectConversation(conv.id);
                  setOpen(false);
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate">{conv.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(conv.created_at).toLocaleDateString("de-DE")}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(conv.id, conv.is_favorite);
                      }}
                    >
                      <Star
                        className={`h-4 w-4 ${
                          conv.is_favorite ? "fill-yellow-400 text-yellow-400" : ""
                        }`}
                      />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
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
    </>
  );

  if (loading) {
    return (
      <>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="md:hidden mb-4">
              <Menu className="h-4 w-4 mr-2" />
              Konversationen
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 p-4 flex flex-col">
            <Skeleton className="h-10 w-full mb-4" />
            <Skeleton className="h-10 w-full mb-4" />
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          </SheetContent>
        </Sheet>
        <div className="hidden md:flex w-80 border-r border-border bg-card p-4 flex-col space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="md:hidden mb-4">
            <Menu className="h-4 w-4 mr-2" />
            Konversationen
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 p-4 flex flex-col">
          {sidebarContent}
        </SheetContent>
      </Sheet>

      <div className="hidden md:flex w-80 border-r border-border bg-card p-4 flex-col">
        {sidebarContent}
      </div>
    </>
  );
};

export default ConversationSidebar;
