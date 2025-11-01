import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export const useCreatorChat = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentResponse, setCurrentResponse] = useState("");

  const streamThinking = useCallback(
    async (messages: Message[], onDelta: (text: string) => void, onDone: () => void) => {
      setIsLoading(true);
      setCurrentResponse("");

      try {
        const forceFreeMode = localStorage.getItem("forceFreeMode") === "true";
        
        if (forceFreeMode) {
          toast.info("Kostenloser Offline-Modus (dauerhaft aktiviert in Einstellungen)");
          const userText = messages.filter(m => m.role === "user").map(m => m.content).join("\n\n");
          const localResponse =
            "Kostenloser Modus – vereinfachte Antwort\n\n" +
            "Kurz-Zusammenfassung:\n- " + (userText.slice(0, 120) || "Kein Kontext") + "\n\n" +
            "Lösungsvorschlag:\n" +
            "1) Definiere Ziel und Constraints klar.\n" +
            "2) Skizziere 3 Schritte zur Umsetzung.\n" +
            "3) Prüfe Risiken und nächste Schritte.\n\n" +
            "Nächste Schritte:\n- Schritt 1: Sofort starten\n- Schritt 2: Validieren\n- Schritt 3: Iterieren";
          const chunks = localResponse.match(/.{1,80}(\s|$)/g) || [localResponse];
          for (const ch of chunks) {
            onDelta(ch);
            setCurrentResponse(prev => prev + ch);
            await new Promise(r => setTimeout(r, 12));
          }
          onDone();
          return;
        }

        const { data: { session } } = await supabase.auth.getSession();
        
        const response = await fetch(
          `https://cyzgmlgbpbcyomlkvrrm.supabase.co/functions/v1/creator-chat`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session?.access_token || ''}`,
            },
            body: JSON.stringify({ messages }),
          }
        );

        if (!response.ok) {
          if (response.status === 403) {
            toast.error("Nur für Admins zugänglich.");
            onDone();
            return;
          }
          if (response.status === 429 || response.status === 402) {
            toast.info("Kostenloser Offline-Modus aktiviert. Antwort wird vereinfacht generiert.");
            const userText = messages.filter(m => m.role === "user").map(m => m.content).join("\n\n");
            const localResponse =
              "Kostenloser Modus – vereinfachte Antwort\n\n" +
              "Kurz-Zusammenfassung:\n- " + (userText.slice(0, 120) || "Kein Kontext") + "\n\n" +
              "Lösungsvorschlag:\n" +
              "1) Definiere Ziel und Constraints klar.\n" +
              "2) Skizziere 3 Schritte zur Umsetzung.\n" +
              "3) Prüfe Risiken und nächste Schritte.\n\n" +
              "Nächste Schritte:\n- Schritt 1: Sofort starten\n- Schritt 2: Validieren\n- Schritt 3: Iterieren";
            const chunks = localResponse.match(/.{1,80}(\s|$)/g) || [localResponse];
            for (const ch of chunks) {
              onDelta(ch);
              setCurrentResponse(prev => prev + ch);
              await new Promise(r => setTimeout(r, 12));
            }
            onDone();
            return;
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

        onDone();
      } catch (error) {
        console.error("Error in streamThinking:", error);
        if (error instanceof Error && error.message !== "Forbidden") {
          toast.error("Fehler beim Denken. Bitte versuche es erneut.");
        }
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    isLoading,
    currentResponse,
    streamThinking,
  };
};
