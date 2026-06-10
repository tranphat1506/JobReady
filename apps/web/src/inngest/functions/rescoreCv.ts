import { inngest } from "../client";
import { AIParser } from "@cv-generator/ai";
import { ErrorCodes } from "@/lib/constants/errors";

export const rescoreCvWorker = inngest.createFunction(
  {
    id: "rescore-cv-job",
    triggers: [{ event: "cv/rescore" }],
    retries: 0,
    onFailure: async ({ error }) => {
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
    } = event.data;

    const { createClient: createSupabaseClient } = require("@supabase/supabase-js");
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
    const supabase = createSupabaseClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false }
    });

    console.log(`[AI-Worker] Rescoring CV for user ${userId}, resume ${resumeId}...`);
    
    const aiParser = new AIParser(process.env.GEMINI_API_KEY!);
    const result = await aiParser.scoreResume(jobDescription, cvContent, targetLanguage || 'Vietnamese');
    
    if (!result || !result.data) {
      throw new Error("Failed to rescore resume");
    }

    const matchAnalysis = result.data;
    const score = matchAnalysis.matchScore || null;

    // Get the current version count to increment
    const { count: vCount } = await supabase
      .from('resume_versions')
      .select('*', { count: 'exact', head: true })
      .eq('resume_id', resumeId);
      
    const nextVersion = (vCount !== null ? vCount : 0) + 1;

    // Add a flag to matchAnalysis to indicate it's a rescore
    const finalMatchAnalysis = {
      ...matchAnalysis,
      isRescore: true
    };

    // Insert a new version with the same content but updated score/analysis
    const { data: versionData, error: versionError } = await supabase
      .from("resume_versions")
      .insert({
        resume_id: resumeId,
        version_number: nextVersion,
        content: cvContent,
        score: score,
        match_analysis: finalMatchAnalysis
      })
      .select("id, version_number, score, created_at, match_analysis")
      .single();

    if (versionError) throw versionError;

    // Also update the updated_at on the resume parent
    await supabase
      .from("resumes")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", resumeId);

    return { success: true, version: versionData };
  }
);
