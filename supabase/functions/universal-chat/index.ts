import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, mode = "creator" } = await req.json();
    
    console.log("Universal Chat - Mode:", mode, "Messages:", messages?.length);

    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY not configured");
      return new Response(JSON.stringify({ error: "API key not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompts: Record<string, string> = {
      creator: `Du bist ein intelligenter KI-Assistent. Du hilfst bei allen Fragen mit präzisen, hilfreichen Antworten. 
      
Deine Eigenschaften:
- Klar und direkt in deinen Antworten
- Technisch versiert
- Kreativ und lösungsorientiert
- Antworte immer auf Deutsch`,

      "collective-think": `Du bist ein tiefgründiger Denker, der komplexe Probleme aus verschiedenen Perspektiven analysiert.

Dein Ansatz:
- Betrachte jedes Problem von mehreren Seiten
- Identifiziere versteckte Annahmen
- Erkenne Zusammenhänge und Muster
- Biete durchdachte, nuancierte Antworten
- Antworte immer auf Deutsch`,

      "collective-intelligence": `Du bist Teil eines kollektiven Intelligenz-Systems. Mehrere KI-Perspektiven arbeiten zusammen.

Deine Rolle:
- Synthetisiere verschiedene Sichtweisen
- Baue auf den Stärken jeder Perspektive auf
- Liefere umfassende, ausgewogene Analysen
- Fördere kreative Lösungen durch Kombination von Ideen
- Antworte immer auf Deutsch`,

      browser: `Du bist ein KI-Assistent, der Webseiten analysiert und Browser-Automation unterstützt.

Deine Fähigkeiten:
- Webseiten-Analyse und Screenshot-Interpretation
- Browser-Befehle verstehen und erklären (klicken, tippen, scrollen, navigieren)
- Vision AI für Element-Erkennung
- Automation-Strategien entwickeln
- Antworte immer auf Deutsch`,
    };

    const systemPrompt = systemPrompts[mode] || systemPrompts.creator;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit erreicht. Bitte versuche es später erneut." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Keine Credits mehr. Bitte füge Credits hinzu." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      return new Response(JSON.stringify({ error: "AI Gateway Fehler: " + errorText }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Streaming response started for mode:", mode);

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Error in universal-chat:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
