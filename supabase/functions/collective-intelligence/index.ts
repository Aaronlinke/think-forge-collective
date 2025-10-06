import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

const MODULE_PROMPTS: Record<string, string> = {
  strategic: `Du bist ein strategischer Denker, spezialisiert auf langfristige Planung, Risikobewertung und Entscheidungsfindung. 
  Analysiere Probleme aus strategischer Perspektive und bewerte Vor- und Nachteile verschiedener Ansätze.`,
  
  creative: `Du bist ein kreativer Problemlöser, spezialisiert auf innovative Ideen, unkonventionelle Ansätze und laterales Denken.
  Bringe neue Perspektiven ein und schlage kreative Lösungen vor, die über das Offensichtliche hinausgehen.`,
  
  technical: `Du bist ein technischer Experte, spezialisiert auf technische Machbarkeit, Implementierungsdetails und Best Practices.
  Analysiere technische Aspekte, potenzielle Herausforderungen und gebe konkrete Umsetzungsempfehlungen.`,
  
  analytical: `Du bist ein analytischer Denker, spezialisiert auf Datenanalyse, logisches Denken und systematische Problemzerlegung.
  Zerlege komplexe Probleme in Teilprobleme und analysiere sie methodisch.`,
  
  business: `Du bist ein Business-Stratege, spezialisiert auf Wirtschaftlichkeit, Marktanalyse und Geschäftsmodelle.
  Bewerte Business-Aspekte, ROI und kommerzielle Chancen und Risiken.`
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, primaryModule } = await req.json();
    
    const userQuestion = messages[messages.length - 1]?.content || "";
    
    console.log(`Starting collective intelligence for: ${userQuestion}`);
    console.log(`Primary module: ${primaryModule}`);

    // Phase 1: Alle Module denken parallel
    const moduleResponses: Record<string, string> = {};
    
    const modulePromises = Object.entries(MODULE_PROMPTS).map(async ([moduleType, systemPrompt]) => {
      try {
        console.log(`Asking ${moduleType} module...`);
        
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
              { 
                role: "user", 
                content: `Analysiere diese Frage aus deiner spezifischen Perspektive und gib eine fokussierte, prägnante Antwort (max 3-4 Sätze):\n\n${userQuestion}` 
              }
            ],
            stream: false,
          }),
        });

        if (!response.ok) {
          console.error(`Error from ${moduleType}:`, response.status);
          return;
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        
        if (content) {
          moduleResponses[moduleType] = content;
          console.log(`${moduleType} completed`);
        }
      } catch (error) {
        console.error(`Error in ${moduleType}:`, error);
      }
    });

    await Promise.all(modulePromises);
    
    console.log(`Collected ${Object.keys(moduleResponses).length} module responses`);

    // Phase 2: Meta-Analyse und Synthese
    const synthesisPrompt = `Du bist ein Meta-Intelligenz-System, das die Perspektiven verschiedener Experten synthetisiert.

Frage des Users:
${userQuestion}

Perspektiven der Experten-Module:

${Object.entries(moduleResponses).map(([type, response]) => 
  `**${type.toUpperCase()}**: ${response}`
).join('\n\n')}

Deine Aufgabe:
1. Analysiere alle Perspektiven
2. Identifiziere Gemeinsamkeiten und Widersprüche
3. Erstelle eine umfassende, kohärente Antwort, die:
   - Die wertvollsten Insights aus allen Modulen vereint
   - Widersprüche auflöst oder transparent macht
   - Eine klare, umsetzbare Empfehlung gibt
   - Strukturiert und gut lesbar ist

Gib eine vollständige, durchdachte Antwort auf Deutsch, die die kollektive Intelligenz aller Module repräsentiert.`;

    const synthesisResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: "Du bist ein Meta-Intelligenz-System, das Expertenperspektiven synthetisiert." },
          { role: "user", content: synthesisPrompt }
        ],
        stream: true,
      }),
    });

    if (!synthesisResponse.ok) {
      console.error("Synthesis error:", synthesisResponse.status);
      return new Response(JSON.stringify({ error: "Synthesis failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(synthesisResponse.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });

  } catch (error) {
    console.error("Error in collective-intelligence:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
