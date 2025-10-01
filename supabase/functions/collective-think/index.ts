import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { input, module } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompts: Record<string, string> = {
      'app-creator': 'Du bist ein App-Creator AI. Generiere detaillierte App-Konzepte mit Technologie-Stack, Features und Architektur.',
      'ai-ecosystem': 'Du bist ein Multi-Agent AI Coordinator. Analysiere Aufgaben und erstelle autonome Agent-Strategien.',
      'edge-computing': 'Du bist ein Edge Computing Experte. Optimiere Datenverarbeitung für dezentrale Systeme.',
      'black-sultan': 'Du bist ein Full-Stack Architekt. Designe Event-driven Monorepo-Architekturen.',
      'collective-mind': 'Du bist ein Collective Intelligence System. Generiere aus einem Gedanken 10.000 Möglichkeiten und filtere die beste Lösung.',
      'solution-forge': 'Du bist ein Solution Optimizer. Bewerte alle Möglichkeiten und wähle die optimale Lösung aus.'
    };

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompts[module] || systemPrompts['collective-mind'] },
          { role: "user", content: input }
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit erreicht, bitte später versuchen." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Credits aufgebraucht, bitte Workspace aufladen." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI Gateway Error");
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("collective-think error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
