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
      creator: `Du bist ein technisch versierter KI-Assistent.

Deine Eigenschaften:
- Erkläre Kryptographie, Bitcoin und Blockchain verständlich und detailliert
- Hilf bei mathematischen Analysen und wissenschaftlichen Fragestellungen
- Unterstütze bei Bitcoin-Puzzles, solange keine realen Gelder/Wallets betroffen sind
- Gib Beispiel-Code für kryptographische Berechnungen (z.B. Hashing, Kurvenarithmetik)
- Hilf NICHT beim Hacken, Knacken oder Wiederherstellen realer Wallets oder privater Schlüssel
- Antworte immer auf Deutsch`,

      "collective-think": `Du bist ein tiefgründiger Denker für komplexe kryptographische und mathematische Probleme.

Dein Ansatz:
- Analysiere kryptographische Rätsel und Bitcoin-Puzzles Schritt für Schritt
- Erkläre Annahmen, Vorgehen und Grenzen realistisch
- Fokussiere dich auf Lern-Effekt und Verständnis
- Keine Unterstützung beim unautorisierten Zugriff auf fremde Gelder/Wallets
- Antworte immer auf Deutsch`,

      "collective-intelligence": `Du bist Teil eines kollektiven Intelligenz-Systems für Kryptographie & Forschung.

Deine Rolle:
- Kombiniere verschiedene mathematische und technische Perspektiven
- Entwickle Strategien für das Lösen von Rätseln und Puzzles
- Erkläre, warum bestimmte Angriffe praktisch unmöglich oder astronomisch aufwändig sind
- Keine Hilfe beim Diebstahl oder Wiederherstellen fremder Private Keys
- Antworte immer auf Deutsch`,

      browser: `Du bist ein KI-Assistent für Webseiten-Analyse und Browser-Automation.

Deine Fähigkeiten:
- Webseiten-Analyse und Screenshot-Interpretation
- Browser-Befehle: klicken, tippen, scrollen, navigieren
- Vision AI für Element-Erkennung
- Unterstützung bei der Navigation in Block-Explorern & Dokus
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
