import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type AdvancedMode = "debate" | "deep-research" | "rapid" | "standard";

export const useAdvancedModes = (primaryModule: string, mode: AdvancedMode = "standard") => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentResponse, setCurrentResponse] = useState("");
  const [thinkingModules, setThinkingModules] = useState<string[]>([]);

  const getModeConfig = (mode: AdvancedMode) => {
    const configs = {
      "debate": {
        modules: ["strategic", "creative", "technical", "analytical", "business"],
        systemPrompt: "Du bist ein Debattier-Moderator. Jedes Modul soll eine kontroverse Position einnehmen und Pro/Contra diskutieren. Präsentiere verschiedene Standpunkte.",
        temperature: 0.9,
      },
      "deep-research": {
        modules: ["strategic", "creative", "technical", "analytical", "business"],
        systemPrompt: "Du führst eine tiefgehende Multi-Iterationen-Analyse durch. Jedes Modul verfeinert seine Antwort basierend auf den Erkenntnissen der anderen Module.",
        temperature: 0.7,
        iterations: 2,
      },
      "rapid": {
        modules: ["technical", "business"],
        systemPrompt: "Schnelle, prägnante Analyse mit Fokus auf Kernpunkte. Keine ausschweifenden Erklärungen.",
        temperature: 0.5,
      },
      "standard": {
        modules: ["strategic", "creative", "technical", "analytical", "business"],
        systemPrompt: "Standard kollektive Intelligenz-Analyse mit allen Modulen.",
        temperature: 0.7,
      },
    };
    return configs[mode];
  };

  const streamAdvancedThinking = useCallback(
    async (messages: Message[], onDelta: (text: string) => void, onDone: () => void) => {
      setIsLoading(true);
      setCurrentResponse("");
      
      const config = getModeConfig(mode);
      setThinkingModules(config.modules);

      try {
        const forceFreeMode = localStorage.getItem("forceFreeMode") === "true";
        
        if (forceFreeMode) {
          toast.info(`${mode === "standard" ? "Kollektiv" : mode.charAt(0).toUpperCase() + mode.slice(1)}-Modus (kostenlos)`);
          const userText = messages.filter(m => m.role === "user").map(m => m.content).join("\n\n");
          const modeLabels = {
            "debate": "Debate Mode",
            "deep-research": "Deep Research",
            "rapid": "Rapid Mode",
            "standard": "Standard"
          };
          const header = `${modeLabels[mode]} – Kostenlose Version\n\n`;
          const body = config.modules.map(m => `【${m.charAt(0).toUpperCase() + m.slice(1)}】\n- Perspektive zum Thema\n- Kernempfehlung`).join("\n\n");
          const conclusion = `\n\nZusammenfassung:\n1) Hauptpunkt\n2) Alternative\n3) Nächster Schritt\n\nKontext: ` + (userText.slice(0, 120) || "Kein Kontext");
          const localResponse = header + body + conclusion;
          const chunks = localResponse.match(/.{1,80}(\s|$)/g) || [localResponse];
          let acc = "";
          for (const ch of chunks) {
            onDelta(ch);
            acc += ch;
            setCurrentResponse(acc);
            await new Promise(r => setTimeout(r, 12));
          }
          setThinkingModules([]);
          onDone();
          return;
        }

        const { data: { session } } = await supabase.auth.getSession();
        
        const response = await fetch(
          `https://cyzgmlgbpbcyomlkvrrm.supabase.co/functions/v1/collective-intelligence`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session?.access_token || ''}`,
            },
            body: JSON.stringify({ 
              messages, 
              primaryModule,
              mode: mode,
              customConfig: config,
            }),
          }
        );

        if (!response.ok) {
          if (response.status === 429 || response.status === 402) {
            toast.info("Kostenloser Offline-Modus aktiviert.");
            const userText = messages.filter(m => m.role === "user").map(m => m.content).join("\n\n");
            const localResponse = `Modus: ${mode}\nKostenfreie Antwort\n\n` + (userText.slice(0, 200) || "Kein Kontext");
            const chunks = localResponse.match(/.{1,80}(\s|$)/g) || [localResponse];
            for (const ch of chunks) {
              onDelta(ch);
              setCurrentResponse(prev => prev + ch);
              await new Promise(r => setTimeout(r, 12));
            }
            setThinkingModules([]);
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

        setThinkingModules([]);
        onDone();
      } catch (error) {
        console.error("Error in advanced mode:", error);
        toast.error("Fehler beim Denken. Bitte versuche es erneut.");
        setThinkingModules([]);
      } finally {
        setIsLoading(false);
      }
    },
    [primaryModule, mode]
  );

  return {
    isLoading,
    currentResponse,
    thinkingModules,
    streamAdvancedThinking,
  };
};