import { useState, useCallback } from "react";
import { toast } from "sonner";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type ChatMode = "creator" | "collective-think" | "collective-intelligence" | "browser";

export function useUniversalChat(mode: ChatMode = "creator") {
  const [isLoading, setIsLoading] = useState(false);
  const [currentResponse, setCurrentResponse] = useState("");

  const streamThinking = useCallback(
    async (
      messages: Message[],
      onDelta: (text: string) => void,
      onDone: () => void
    ) => {
      setIsLoading(true);
      setCurrentResponse("");

      try {
        const response = await fetch(
          "https://cyzgmlgbpbcyomlkvrrm.supabase.co/functions/v1/universal-chat",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ messages, mode }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
          
          if (response.status === 429) {
            toast.error("Rate limit erreicht. Bitte warte einen Moment.");
          } else if (response.status === 402) {
            toast.error("Keine Credits mehr. Bitte füge Credits hinzu.");
          } else {
            toast.error(errorData.error || "Fehler bei der Anfrage");
          }
          
          setIsLoading(false);
          onDone();
          return;
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("No reader available");
        }

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6).trim();
              if (data === "[DONE]") continue;

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  setCurrentResponse((prev) => prev + content);
                  onDelta(content);
                }
              } catch {
                // Skip invalid JSON
              }
            }
          }
        }

        // Process remaining buffer
        if (buffer.trim()) {
          const lines = buffer.split("\n");
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6).trim();
              if (data === "[DONE]") continue;
              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  setCurrentResponse((prev) => prev + content);
                  onDelta(content);
                }
              } catch {
                // Skip
              }
            }
          }
        }

        onDone();
      } catch (error) {
        console.error("Universal chat error:", error);
        toast.error("Verbindungsfehler. Bitte versuche es erneut.");
        onDone();
      } finally {
        setIsLoading(false);
      }
    },
    [mode]
  );

  return {
    isLoading,
    currentResponse,
    streamThinking,
  };
}
