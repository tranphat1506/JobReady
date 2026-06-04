import { inngest } from "../client";
import { AIParser } from "@cv-generator/ai";
import { getCachedSystemSettings } from "@/actions/settings";
import fs from "fs";
import path from "path";

export const parseProfileWorker = inngest.createFunction(
  {
    id: "parse-profile-job",
    triggers: [{ event: "profile/parse" }],
    retries: 1,
    onFailure: async ({ error, event }) => {
      const { createClient: createSupabaseClient } = require("@supabase/supabase-js");
      const supabase = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        { auth: { persistSession: false } }
      );
      
      const logId = (event.data as any).logId;
      if (logId) {
        await supabase.rpc('finalize_ai_job', {
          p_log_id: logId,
          p_success: false,
          p_error_message: error.message
        });
      }
      await supabase.from("activity_events").insert({
        user_id: (event.data as any).userId,
        event_name: `API_ERROR_PARSE_PROFILE_JOB`,
        metadata: { error_message: error.message }
      });
      console.error("[parseProfileWorker] Failed after all retries:", error.message);
    },
  },
  async ({ event, step }: { event: any; step: any }) => {
    const { userId, contentToParse, logId } = event.data;

    const { createClient: createSupabaseClient } = require("@supabase/supabase-js");
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
    const supabase = createSupabaseClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false }
    });

    // Credits are already deducted at the API layer

    const aiParser = new AIParser(process.env.GEMINI_API_KEY!);
    
    console.log(`[AI-Worker] Parsing Master Profile for user ${userId}...`);
    const startTime = Date.now();
    let result: any = null;
    
    // --- DEV CACHING LOGIC ---
    const isDev = process.env.NODE_ENV === "development";
    let cacheFile = "";
    let isCached = false;
    
    if (isDev) {
      const cacheDir = path.join(process.cwd(), ".cache");
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
      cacheFile = path.join(cacheDir, `ai-profile-parse-${userId}.json`);
      if (fs.existsSync(cacheFile)) {
        console.log(`[DEV CACHE] Using cached Profile parse for user ${userId}`);
        result = JSON.parse(fs.readFileSync(cacheFile, "utf8"));
        isCached = true;
      }
    }

    if (!isCached) {
      try {
        result = await aiParser.parseMasterProfile(contentToParse);
        if (isDev) {
          fs.writeFileSync(cacheFile, JSON.stringify(result, null, 2));
        }
      } catch (error: any) {
        console.error("[AI-Worker] AI Parsing error:", error);
        throw error;
      }
    }
    
    const latency = Date.now() - startTime;

    // Save to DB (1-N relationship: find default or create new)
    let profileId;
    const { data: existingProfile } = await supabase
      .from('master_profiles')
      .select('id')
      .eq('user_id', userId)
      .eq('is_default', true)
      .single();

    if (existingProfile) {
      const { error: updateError } = await supabase
        .from('master_profiles')
        .update({ content: result.data, updated_at: new Date().toISOString() })
        .eq('id', existingProfile.id);
      if (updateError) throw updateError;
      profileId = existingProfile.id;
    } else {
      const { data: newProfile, error: insertError } = await supabase
        .from('master_profiles')
        .insert({ 
          user_id: userId, 
          name: 'Default Profile',
          is_default: true,
          content: result.data
        })
        .select('id')
        .single();
      if (insertError) throw insertError;
      profileId = newProfile.id;
    }

    // Finalize Job
    if (logId) {
      const { error: finalizeError } = await supabase.rpc('finalize_ai_job', {
        p_log_id: logId,
        p_success: true,
        p_model_used: process.env.GEMINI_MODEL || 'gemini-flash-latest',
        p_prompt_tokens: result.usage.promptTokens,
        p_completion_tokens: result.usage.completionTokens,
        p_latency_ms: latency
      });
      if (finalizeError) {
        console.error("[parseProfileWorker] finalize_ai_job error:", finalizeError);
        throw finalizeError;
      }
      
      // Log semantic activity
      await supabase.from('activity_events').insert({
        user_id: userId,
        event_name: `APP_AI_PARSE_PROFILE_SUCCESS`,
        metadata: { profile_id: profileId }
      });
    }

    return { success: true };
  }
);
