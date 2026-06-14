import { inngest } from "../client";
import { AIParser } from "@cv-generator/ai";
import { ErrorCodes } from "@/lib/constants/errors";
import { LedgerEvent } from "@/lib/constants/events";

export const rescoreCvWorker = inngest.createFunction(
  {
    id: "rescore-cv-job",
    triggers: [{ event: "cv/rescore" }],
    retries: 0,
    onFailure: async ({ error, event }) => {
      const { createClient: createSupabaseClient } = require("@supabase/supabase-js");
      const supabase = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        { auth: { persistSession: false } }
      );
      
      const originalEventData = event.data.event?.data || event.data;
      const logId = originalEventData.logId;
      if (logId) {
        let mappedErrorMessage = `${ErrorCodes.WORKER_FAILED}: ${error.message}`;
        if (error.name === 'AIProviderError' && (error as any).code) {
          mappedErrorMessage = `${(error as any).code}: ${error.message}`;
        }

        await supabase.rpc('finalize_ai_job', {
          p_log_id: logId,
          p_success: false,
          p_error_message: mappedErrorMessage,
          p_refund_message_code: LedgerEvent.RESCORE_CV_REFUND
        });
      }
      console.error("[rescoreCvWorker] Failed:", error.message);
    },
  },
  async ({ event }) => {
    const {
      userId,
      resumeId,
      jobDescription,
      cvContent,
      targetLanguage,
      logId,
    } = event.data;

    const { createClient: createSupabaseClient } = require("@supabase/supabase-js");
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
    const supabase = createSupabaseClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false }
    });

    console.log(`[AI-Worker] Rescoring CV for user ${userId}, resume ${resumeId}...`);

    const startTime = Date.now();
    const aiParser = new AIParser(process.env.GEMINI_API_KEY!);
    const result = await aiParser.scoreResume(jobDescription, cvContent, targetLanguage || 'Vietnamese');
    const latency = Date.now() - startTime;

    if (!result || !result.data) {
      throw new Error("Failed to rescore resume");
    }

    const matchAnalysis = result.data;
    const score = matchAnalysis.matchScore || null;

    // Add a flag to matchAnalysis to indicate it's a rescore
    const finalMatchAnalysis = {
      ...matchAnalysis,
      isRescore: true
    };

    // Update the existing version with the same content but updated score/analysis
    const { data: versionData, error: versionError } = await supabase
      .from("resume_versions")
      .update({
        content: cvContent,
        score: score,
        match_analysis: finalMatchAnalysis
      })
      .eq("resume_id", resumeId)
      .select("id, version_number, score, created_at, match_analysis")
      .single();

    if (versionError) throw versionError;

    // Also update the updated_at on the resume parent
    await supabase
      .from("resumes")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", resumeId);

    if (logId) {
      const { error: finalizeError } = await supabase.rpc('finalize_ai_job', {
        p_log_id: logId,
        p_success: true,
        p_model_used: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
        p_prompt_tokens: result.usage?.promptTokens || 0,
        p_completion_tokens: result.usage?.completionTokens || 0,
        p_latency_ms: latency,
        p_provider: 'google',
        p_success_message_code: LedgerEvent.RESCORE_CV_SUCCESS
      });

      if (finalizeError) {
        console.error("[rescoreCvWorker] finalize_ai_job error:", finalizeError);
        throw finalizeError;
      }
    }

    return { success: true, version: versionData };
  }
);
