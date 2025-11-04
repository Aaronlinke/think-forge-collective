import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Branch = {
  id: string;
  branch_name: string;
  parent_message_id: string;
  conversation_id: string;
};

export const useConversationBranching = (conversationId: string | null) => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [currentBranchId, setCurrentBranchId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (conversationId) {
      loadBranches();
    }
  }, [conversationId]);

  const loadBranches = async () => {
    if (!conversationId) return;

    try {
      const { data, error } = await supabase
        .from("conversation_branches")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setBranches(data || []);
    } catch (error) {
      console.error("Error loading branches:", error);
    }
  };

  const createBranch = async (parentMessageId: string, branchName?: string) => {
    if (!conversationId) {
      toast.error("Keine aktive Konversation");
      return null;
    }

    setIsLoading(true);
    try {
      const name = branchName || `Branch ${branches.length + 1}`;
      
      const { data, error } = await supabase
        .from("conversation_branches")
        .insert({
          conversation_id: conversationId,
          parent_message_id: parentMessageId,
          branch_name: name,
        })
        .select()
        .single();

      if (error) throw error;

      setBranches((prev) => [...prev, data]);
      setCurrentBranchId(data.id);
      toast.success(`Branch "${name}" erstellt`);
      
      return data.id;
    } catch (error) {
      console.error("Error creating branch:", error);
      toast.error("Fehler beim Erstellen des Branches");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const switchBranch = async (branchId: string | null) => {
    setCurrentBranchId(branchId);
    if (branchId) {
      const branch = branches.find((b) => b.id === branchId);
      if (branch) {
        toast.info(`Zu Branch "${branch.branch_name}" gewechselt`);
      }
    } else {
      toast.info("Zurück zum Haupt-Thread");
    }
  };

  const deleteBranch = async (branchId: string) => {
    setIsLoading(true);
    try {
      // First delete all messages in the branch
      await supabase
        .from("messages")
        .delete()
        .eq("branch_id", branchId);

      // Then delete the branch itself
      const { error } = await supabase
        .from("conversation_branches")
        .delete()
        .eq("id", branchId);

      if (error) throw error;

      setBranches((prev) => prev.filter((b) => b.id !== branchId));
      
      if (currentBranchId === branchId) {
        setCurrentBranchId(null);
      }
      
      toast.success("Branch gelöscht");
    } catch (error) {
      console.error("Error deleting branch:", error);
      toast.error("Fehler beim Löschen des Branches");
    } finally {
      setIsLoading(false);
    }
  };

  const renameBranch = async (branchId: string, newName: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("conversation_branches")
        .update({ branch_name: newName })
        .eq("id", branchId);

      if (error) throw error;

      setBranches((prev) =>
        prev.map((b) => (b.id === branchId ? { ...b, branch_name: newName } : b))
      );
      
      toast.success("Branch umbenannt");
    } catch (error) {
      console.error("Error renaming branch:", error);
      toast.error("Fehler beim Umbenennen");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    branches,
    currentBranchId,
    isLoading,
    createBranch,
    switchBranch,
    deleteBranch,
    renameBranch,
    loadBranches,
  };
};
