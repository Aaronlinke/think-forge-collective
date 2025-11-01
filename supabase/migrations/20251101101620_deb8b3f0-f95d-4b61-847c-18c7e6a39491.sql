-- Create conversation_branches table for alternative solution paths
CREATE TABLE IF NOT EXISTS public.conversation_branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  parent_message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  branch_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.conversation_branches ENABLE ROW LEVEL SECURITY;

-- RLS policies for conversation_branches
CREATE POLICY "Users can view branches from their conversations"
  ON public.conversation_branches FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE conversations.id = conversation_branches.conversation_id
      AND (conversations.user_id = auth.uid() OR conversations.is_shared = true)
    )
  );

CREATE POLICY "Users can create branches in their conversations"
  ON public.conversation_branches FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE conversations.id = conversation_branches.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update branches in their conversations"
  ON public.conversation_branches FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE conversations.id = conversation_branches.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete branches in their conversations"
  ON public.conversation_branches FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE conversations.id = conversation_branches.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

-- Add branch_id to messages table (nullable for backwards compatibility)
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES public.conversation_branches(id) ON DELETE CASCADE;

-- Add collective_mode column to conversations
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS collective_mode TEXT DEFAULT 'standard';

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_messages_branch_id ON public.messages(branch_id);
CREATE INDEX IF NOT EXISTS idx_branches_conversation_id ON public.conversation_branches(conversation_id);

-- Trigger for updated_at on conversation_branches
CREATE TRIGGER update_conversation_branches_updated_at
  BEFORE UPDATE ON public.conversation_branches
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();