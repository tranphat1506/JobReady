import { inngest } from "../client";
import { AIParser } from "@cv-generator/ai";
import { getCachedSystemSettings } from "@/actions/settings";

export const parseProfileWorker = inngest.createFunction(
  { id: "parse-profile-job", triggers: [{ event: "profile/parse" }] },
  async ({ event, step }: { event: any; step: any }) => {
    const { userId, contentToParse } = event.data;

    const { createClient: createSupabaseClient } = require("@supabase/supabase-js");
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createSupabaseClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false }
    });

    const settingsMap = await getCachedSystemSettings();
    const totalCost = settingsMap.price_parse_profile ? Number(settingsMap.price_parse_profile) : 0;

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('credits')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      throw new Error("Cannot fetch user credits.");
    }

    if (userData.credits < totalCost) {
      throw new Error(`Insufficient credits. Required: ${totalCost}, Have: ${userData.credits}`);
    }

    const aiParser = new AIParser(process.env.GEMINI_API_KEY!);
    
    console.log(`[AI-Worker] Parsing Master Profile for user ${userId}...`);
    const startTime = Date.now();
    let result;
    
    try {
      result = await aiParser.parseMasterProfile(contentToParse);
    } catch (error: any) {
      console.error("[AI-Worker] AI Parsing error:", error);
      throw error;
    }
    
    const latency = Date.now() - startTime;

    // Save to DB
    const { error: upsertError } = await supabase
      .from('master_profiles')
      .upsert({ 
        user_id: userId, 
        content: result.data,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });

    if (upsertError) {
      console.error('[AI-Worker] Failed to save master profile:', upsertError);
      throw upsertError;
    }

    // Log & Deduct Credits
    await supabase.rpc('log_ai_and_deduct_credits', {
      p_user_id: userId,
      p_cost: totalCost,
      p_action_type: 'parse_master_profile',
      p_model_used: process.env.GEMINI_MODEL || 'gemini-flash-latest',
      p_prompt_tokens: result.usage.promptTokens,
      p_completion_tokens: result.usage.completionTokens,
      p_latency_ms: latency
    });

    return { success: true };
  }
);
