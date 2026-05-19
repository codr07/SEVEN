// @ts-nocheck — This file runs in Supabase Deno Edge.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { table, prompt } = await req.json()

    if (!table || !prompt) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: table or prompt' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Formulate a robust system instruction telling the model to return JSON
    const systemPrompt = `You are a premium AI assistant for "5EVEN" (a futuristic, premium technological college & services platform).
Generate realistic database content for the "${table}" table.
The administrator prompt is: "${prompt}".

Generate appropriate, highly detailed, futuristic, professional content.
Return ONLY a valid JSON object matching the exact schema requirements for the "${table}" table below. DO NOT include any markdown, backticks (\`\`\`), or commentary. Just raw JSON.

Schema requirements by table:
- For "courses": { "name": "...", "category": "...", "short_desc": "...", "duration": "...", "price": "...", "extra_details": { "details": ["syllabus line 1", "syllabus line 2"], "why_choose_this_course": "...", "public_review": "...", "certification_available": true, "certification_cost": "..." } }
- For "academics": { "title": "...", "description": "...", "price": "...", "extra_details": { "details": ["highlight 1", "highlight 2"], "detailed_description": "...", "public_review": "...", "certification_available": true, "certification_cost": "..." } }
- For "services": { "category": "...", "title": "...", "price": "...", "description": "...", "extra_details": { "details": ["highlight 1", "highlight 2"], "detailed_description": "...", "public_review": "..." } }
- For "faculty": { "name": "...", "topic": "...", "stars": "5.0", "price": "...", "description": "...", "extra_details": { "education": ["degree 1"], "expertise": ["expertise 1"], "research": ["paper 1"], "books": ["book 1"] } }
- For "notes": { "category": "...", "title": "...", "short_desc": "...", "extra_details": { "price": "...", "details": ["highlight 1", "highlight 2"], "detailed_description": "..." } }
- For "founders": { "name": "...", "role": "...", "bio": "...", "extra_details": { "education": ["..."], "expertise": ["..."] } }
- For "updates": { "title": "...", "slug": "...", "type": "patch", "category": "system", "excerpt": "...", "content": "markdown content..." }

Also, add a property "image_prompt" in the root of the JSON containing a specific, premium cinematic AI image prompt (e.g. "futuristic holographic computer lab, octane render, 8k, neon purple accents") to generate an illustration for this item. Make sure it describes a cool visual representation.`;

    const encodedPrompt = encodeURIComponent(systemPrompt);
    const textUrl = `https://text.pollinations.ai/${encodedPrompt}`;

    console.log(`Fetching from Pollinations AI: ${textUrl}`);
    const textRes = await fetch(textUrl);
    if (!textRes.ok) {
      throw new Error(`Failed to fetch text from Pollinations AI: ${textRes.statusText}`);
    }

    const rawText = await textRes.text();
    console.log(`Raw AI response: ${rawText}`);

    // Clean up potential markdown formatting if the model ignored instructions
    let jsonText = rawText.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.substring(7);
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.substring(3);
    }
    if (jsonText.endsWith('```')) {
      jsonText = jsonText.substring(0, jsonText.length - 3);
    }
    jsonText = jsonText.trim();

    let generatedData = {};
    try {
      generatedData = JSON.parse(jsonText);
    } catch (parseErr) {
      console.error("JSON parsing error, raw response was:", rawText);
      throw new Error(`AI generated invalid JSON: ${parseErr.message}`);
    }

    // Now append a pollination image URL if an image_prompt was returned
    const imgPrompt = generatedData.image_prompt || `${table} ${generatedData.title || generatedData.name || 'illustration'}`;
    const cleanImgPrompt = encodeURIComponent(imgPrompt.substring(0, 150));
    
    // Generate a unique seed to avoid caching
    const seed = Math.floor(Math.random() * 1000000);
    generatedData.cover_image = `https://image.pollinations.ai/p/${cleanImgPrompt}?width=800&height=600&nologo=true&seed=${seed}`;

    return new Response(
      JSON.stringify(generatedData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error("Edge function error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
