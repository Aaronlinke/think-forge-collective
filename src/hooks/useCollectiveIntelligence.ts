import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export const useCollectiveIntelligence = (primaryModule: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentResponse, setCurrentResponse] = useState("");
  const [thinkingModules, setThinkingModules] = useState<string[]>([]);

  const streamCollectiveThinking = useCallback(
    async (messages: Message[], onDelta: (text: string) => void, onDone: () => void) => {
      setIsLoading(true);
      setCurrentResponse("");
      setThinkingModules(["strategic", "creative", "technical", "analytical", "business"]);

      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        const response = await fetch(
          `https://cyzgmlgbpbcyomlkvrrm.supabase.co/functions/v1/collective-intelligence`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session?.access_token || ''}`,
            },
            body: JSON.stringify({ messages, primaryModule }),
          }
        );

        if (!response.ok) {
          if (response.status === 429) {
            toast.error("Rate limit erreicht. Bitte warte kurz.");
            throw new Error("Rate limit exceeded");
          }
          if (response.status === 402) {
            toast.error("Keine Credits mehr. Bitte füge Credits hinzu.");
            throw new Error("Payment required");
          }
          throw new Error("Failed to stream response");
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let fullResponse = "";

        if (!reader) throw new Error("No reader available");

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          let newlineIndex: number;
          while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
            let line = buffer.slice(0, newlineIndex);
            buffer = buffer.slice(newlineIndex + 1);

            if (line.endsWith("\r")) line = line.slice(0, -1);
            if (line.startsWith(":") || line.trim() === "") continue;
            if (!line.startsWith("data: ")) continue;

            const jsonStr = line.slice(6).trim();
            if (jsonStr === "[DONE]") continue;

            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                fullResponse += content;
                setCurrentResponse(fullResponse);
                onDelta(content);
              }
            } catch (e) {
              buffer = line + "\n" + buffer;
              break;
            }
          }
        }

        setThinkingModules([]);
        onDone();
      } catch (error) {
        console.error("Error in collective intelligence:", error);
        toast.error("Fehler beim kollektiven Denken. Bitte versuche es erneut.");
        setThinkingModules([]);
      } finally {
        setIsLoading(false);
      }
    },
    [primaryModule]
  );

  return {
    isLoading,
    currentResponse,
    thinkingModules,
    streamCollectiveThinking,
  };
};
