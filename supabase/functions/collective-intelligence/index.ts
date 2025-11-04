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
    const { messages, primaryModule, mode = "standard", customConfig } = await req.json();
    
    const userQuestion = messages[messages.length - 1]?.content || "";
    
    console.log(`Starting collective intelligence for: ${userQuestion}`);
    console.log(`Primary module: ${primaryModule}, Mode: ${mode}`);

    // Get mode configuration
    const activeModules = customConfig?.modules || ["strategic", "creative", "technical", "analytical", "business"];
    const modeSystemPrompt = customConfig?.systemPrompt || "Standard kollektive Intelligenz-Analyse mit allen Modulen.";
    const temperature = customConfig?.temperature || 0.7;
    const iterations = customConfig?.iterations || 1;

    // Phase 1: Alle Module denken parallel (filtered by mode)
    const moduleResponses: Record<string, string> = {};
    
    const modulePromises = Object.entries(MODULE_PROMPTS)
      .filter(([moduleType]) => activeModules.includes(moduleType))
      .map(async ([moduleType, systemPrompt]) => {
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
              { role: "system", content: `${systemPrompt}\n\n${modeSystemPrompt}` },
              { 
                role: "user", 
                content: mode === "rapid" 
                  ? `Kurz und prägnant (max 2 Sätze):\n\n${userQuestion}`
                  : mode === "debate"
                  ? `Nimm eine klare Position ein (Pro ODER Contra) und argumentiere:\n\n${userQuestion}`
                  : `Analysiere diese Frage aus deiner spezifischen Perspektive und gib eine fokussierte, prägnante Antwort (max 3-4 Sätze):\n\n${userQuestion}`
              }
            ],
            temperature: temperature,
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

    // Deep Research: Optional 2nd iteration
    if (mode === "deep-research" && iterations > 1) {
      console.log("Starting deep research iteration 2...");
      const firstSynthesis = Object.entries(moduleResponses)
        .map(([type, resp]) => `${type}: ${resp}`)
        .join("\n");
      
      const refinementPromises = Object.entries(MODULE_PROMPTS)
        .filter(([moduleType]) => activeModules.includes(moduleType))
        .map(async ([moduleType, systemPrompt]) => {
          try {
            const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${LOVABLE_API_KEY}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                model: "google/gemini-2.5-flash",
                messages: [
                  { role: "system", content: `${systemPrompt}\n\nVerfeinere deine Antwort basierend auf den Erkenntnissen der anderen Module.` },
                  { 
                    role: "user", 
                    content: `Ursprüngliche Frage: ${userQuestion}\n\nErkenntnisse der anderen Module:\n${firstSynthesis}\n\nVerfeinere nun deine Perspektive (max 3-4 Sätze).`
                  }
                ],
                temperature: temperature,
                stream: false,
              }),
            });

            if (response.ok) {
              const data = await response.json();
              const content = data.choices?.[0]?.message?.content;
              if (content) {
                moduleResponses[moduleType] = content;
                console.log(`${moduleType} refined`);
              }
            }
          } catch (error) {
            console.error(`Error refining ${moduleType}:`, error);
          }
        });
      
      await Promise.all(refinementPromises);
      console.log("Deep research iteration 2 complete");
    }

    // Phase 2: Meta-Analyse und Synthese
    const modeName = mode === "debate" ? "Debatte" : mode === "deep-research" ? "Tiefenanalyse" : mode === "rapid" ? "Schnellanalyse" : "Standard";
    const synthesisPrompt = `Du bist ein Meta-Intelligenz-System für ${modeName}, das die Perspektiven verschiedener Experten synthetisiert.

Frage des Users:
${userQuestion}

Perspektiven der Experten-Module:

${Object.entries(moduleResponses).map(([type, response]) => 
  `**${type.toUpperCase()}**: ${response}`
).join('\n\n')}

Deine Aufgabe (${modeName}-Modus):
${mode === "debate" 
  ? `1. Stelle die verschiedenen Positionen (Pro/Contra) gegenüber
2. Bewerte die Stärke der Argumente
3. Gib eine ausgewogene Schlussfolgerung, die beide Seiten würdigt
4. Strukturiert und gut lesbar` 
  : mode === "deep-research"
  ? `1. Synthetisiere die verfeinerten Erkenntnisse aus allen Iterationen
2. Identifiziere die tiefsten Insights und Zusammenhänge
3. Erstelle eine umfassende, nuancierte Analyse
4. Gib konkrete, durchdachte Handlungsempfehlungen`
  : mode === "rapid"
  ? `1. Fasse die Kernpunkte kurz und prägnant zusammen (max 5-6 Sätze insgesamt)
2. Gib die wichtigste Handlungsempfehlung
3. Keine ausschweifenden Erklärungen`
  : `1. Analysiere alle Perspektiven
2. Identifiziere Gemeinsamkeiten und Widersprüche
3. Erstelle eine umfassende, kohärente Antwort
4. Gib eine klare, umsetzbare Empfehlung`}

Gib eine vollständige, durchdachte Antwort auf Deutsch, die die kollektive Intelligenz aller Module im ${modeName}-Modus repräsentiert.`;

    const synthesisResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: mode === "rapid" ? "google/gemini-2.5-flash" : "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: `Du bist ein Meta-Intelligenz-System für ${modeName}, das Expertenperspektiven synthetisiert.` },
          { role: "user", content: synthesisPrompt }
        ],
        temperature: temperature,
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
