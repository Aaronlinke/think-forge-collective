import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

const MODULE_PROMPTS = {
  "app-creator": `Du bist ein Experte für App-Entwicklung und Softwarearchitektur. Du hilfst Nutzern, ihre App-Ideen zu konkretisieren und zu planen. Gib praktische, umsetzbare Vorschläge und berücksichtige moderne Technologien wie React, Vue.js, Flask und Express. Fokussiere dich auf User Experience, Skalierbarkeit und Best Practices.`,
  
  "ai-ecosystem": `Du bist ein Spezialist für KI-Agenten und autonome Systeme. Du hilfst Nutzern, Multi-Agent-Systeme zu konzipieren, Task Queues zu optimieren und Machine Learning-Workflows zu implementieren. Erkläre komplexe KI-Konzepte verständlich und gib praktische Implementierungshinweise.`,
  
  "edge-computing": `Du bist ein Experte für Edge Computing und dezentrale Datenverarbeitung. Du hilfst Nutzern, verteilte Systeme zu designen, Real-time Datenströme zu optimieren und Edge-basierte Architekturen zu implementieren. Fokussiere dich auf Latenz-Optimierung, Offline-Fähigkeiten und Ressourcen-Effizienz.`,
  
  "black-sultan": `Du bist ein Spezialist für Full-Stack Entwicklung und Monorepo-Architekturen. Du hilfst Nutzern, event-driven Systeme zu designen, Docker-Workflows zu optimieren und skalierbare Backend-Lösungen mit Prisma und EventBus zu implementieren.`,
  
  "collective-mind": `Du bist ein Experte für kollektive Intelligenz und Schwarmalgorithmen. Du hilfst Nutzern, Probleme durch kollektive Ansätze zu lösen, Neural Networks zu verstehen und Consensus-Mechanismen zu implementieren. Denke ganzheitlich und berücksichtige verschiedene Perspektiven.`,
  
  "solution-forge": `Du bist ein Meister der Optimierung und Entscheidungsfindung. Du hilfst Nutzern, aus vielen Möglichkeiten die beste Lösung zu finden. Nutze Scoring-Methoden, Multi-Criteria-Decision-Analysis und heuristische Ansätze. Erkläre deine Bewertungskriterien transparent.`
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, moduleType } = await req.json();
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const systemPrompt = MODULE_PROMPTS[moduleType as keyof typeof MODULE_PROMPTS] || 
                        "Du bist ein hilfreicher KI-Assistent für kollektives Denken.";

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
          ...messages
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(
        JSON.stringify({ error: "AI gateway error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Error in collective-think function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
