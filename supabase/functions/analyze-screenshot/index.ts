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
    const { screenshot, instruction } = await req.json();
    
    if (!screenshot) {
      return new Response(
        JSON.stringify({ error: "Screenshot is required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('Analyzing screenshot with Vision AI');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'Du bist ein Web-Automation-Assistent. Analysiere Screenshots von Webseiten und gebe präzise Anweisungen für Browser-Automation. Antworte immer auf Deutsch.'
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: instruction || 'Analysiere diese Webseite. Welche interaktiven Elemente (Buttons, Inputs, Links) sind sichtbar? Gib deren Position und Funktion an.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: screenshot.startsWith('data:') ? screenshot : `data:image/png;base64,${screenshot}`
                }
              }
            ]
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Vision AI error:', response.status, errorText);
      throw new Error(`Vision AI request failed: ${response.status}`);
    }

    const data = await response.json();
    const analysis = data.choices[0].message.content;

    console.log('Analysis complete');

    return new Response(
      JSON.stringify({ 
        success: true,
        analysis,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error in analyze-screenshot:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
