import { inngest } from "../client";
import { AIParser } from "@cv-generator/ai";
import { getCachedSystemSettings } from "@/actions/settings";
import fs from "fs";
import path from "path";

export const generateCvWorker = inngest.createFunction(
  {
    id: "generate-cv-job",
    triggers: [{ event: "cv/generate" }],
    retries: 1, // Retry 1 lần nếu thất bại, rồi thôi
    onFailure: async ({ error, event }) => {
      // Khi đã hết retry, ghi log lỗi vào DB để UI bắt được qua Realtime
      const { createClient: createSupabaseClient } = require("@supabase/supabase-js");
      const supabase = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        { auth: { persistSession: false } }
      );
      await supabase.from("ai_generation_logs").insert({
        user_id: (event.data as any).userId,
        action_type: `generate_${(event.data as any).goal}`,
        status: "failed",
        error_message: error.message,
        credits_used: 0,
        tokens_prompt: 0,
        tokens_completion: 0,
        latency_ms: 0,
        model_used: "unknown",
      });
      console.error("[generateCvWorker] Failed after all retries:", error.message);
    },
  },
  async ({ event, step }: { event: any; step: any }) => {
    const {
      userId,
      jobDescription,
      targetLanguage,
      sourceType,
      goal,
      toneOfVoice,
      profileId,
      savedJobId,
      cvTemplate,
      clTemplate,
      existingCvId,
      existingClId,
      rawCV, // Optional, only if uploaded
    } = event.data;

    // We can't easily pass Supabase Auth context inside a background job since it's not a Next.js request.
    // We will use the service role key or just normal client but impersonate or skip RLS.
    // Fortunately, createClient() here in Inngest might run into issues with cookies().
    // So we should use the service role key for admin tasks in background jobs.
    
    // Instead of importing createClient which relies on cookies(), we need a service role client.
    // For now, let's just create an admin client inline.
    const { createClient: createSupabaseClient } = require("@supabase/supabase-js");
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
    const supabase = createSupabaseClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false }
    });

    // 1. Fetch User Credits & Master Profile
    let totalCost = 0;
    const settingsMap = await getCachedSystemSettings();
    const getPrice = (k: string) => (settingsMap[k] ? Number(settingsMap[k]) : 0);

    if (goal === "cv") totalCost = getPrice("price_generate_cv");
    else if (goal === "cover_letter") totalCost = getPrice("price_generate_cl");
    else totalCost = getPrice("price_generate_cv") + getPrice("price_generate_cl");

    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("credits")
      .eq("id", userId)
      .single();

    if (userError || !userData) {
      console.error("[generateCvWorker] Fetch user credits error:", userError);
      throw new Error(`Cannot fetch user credits. ${userError?.message || ""}`);
    }

    if (userData.credits < totalCost) {
      throw new Error(`Insufficient credits. Required: ${totalCost}, Have: ${userData.credits}`);
    }

    let masterProfile: object | undefined;
    let actualRawCV = rawCV;
    let actualProfileId = profileId;

    if (sourceType === "master_profile" || !actualProfileId) {
      const { data: profileRecord, error: profileError } = await supabase
        .from("master_profiles")
        .select("id, content")
        .eq("user_id", userId)
        .single();

      if (!profileError && profileRecord) {
        if (sourceType === "master_profile") {
          masterProfile = profileRecord.content;
          if (!profileRecord.content) {
            throw new Error("Master Profile is empty.");
          }
        }
        actualProfileId = profileRecord.id;
      } else if (sourceType === "master_profile") {
        throw new Error("Master Profile not found.");
      }
    }

    // 2. Run AI Parser
    const aiParser = new AIParser(process.env.GEMINI_API_KEY!);
    let responseData: any = {};
    const startTime = Date.now();
    let totalUsage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };
    
    // --- DEV CACHING LOGIC ---
    const isDev = process.env.NODE_ENV === "development";
    let cacheFile = "";
    let isCached = false;
    let cachedData: any = null;
    
    if (isDev) {
      const cacheDir = path.join(process.cwd(), ".cache");
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
      cacheFile = path.join(cacheDir, `ai-cv-output-${userId}.json`);
      if (fs.existsSync(cacheFile)) {
        console.log(`[DEV CACHE] Using cached CV output for user ${userId}`);
        cachedData = JSON.parse(fs.readFileSync(cacheFile, "utf8"));
        if (goal === "cv") delete cachedData.coverLetter;
        if (goal === "cover_letter") delete cachedData.cv;
        isCached = true;
      }
    }

    if (isCached) {
      responseData = cachedData;
    } else {
      if (goal === "cv" || goal === "both") {
        console.log(`[AI-Worker] Generating Tailored CV for user ${userId}...`);
        const cvResult = await aiParser.parseAndTailorCV(
          jobDescription,
          actualRawCV,
          targetLanguage,
          masterProfile,
          toneOfVoice
        );
        responseData.cv = cvResult.data;
        totalUsage.promptTokens += cvResult.usage.promptTokens;
        totalUsage.completionTokens += cvResult.usage.completionTokens;
      }

      if (goal === "cover_letter" || goal === "both") {
        console.log(`[AI-Worker] Generating Cover Letter for user ${userId}...`);
        const clContext = masterProfile
          ? `[Master Profile JSON]\n${JSON.stringify(masterProfile, null, 2)}`
          : actualRawCV || "";
        const clResult = await aiParser.parseAndTailorCoverLetter(
          jobDescription,
          clContext,
          targetLanguage
        );
        responseData.coverLetter = clResult.data;
        totalUsage.promptTokens += clResult.usage.promptTokens;
        totalUsage.completionTokens += clResult.usage.completionTokens;
      }

      if (isDev) {
        fs.writeFileSync(cacheFile, JSON.stringify(responseData, null, 2));
      }
    }

    const latency = Date.now() - startTime;

    // 2.5 Save Job Description if provided but not yet saved
    let finalJobId = savedJobId;
    if (!finalJobId && jobDescription && jobDescription.trim().length > 0) {
      const { data: newJd } = await supabase
        .from("job_descriptions")
        .insert({
          user_id: userId,
          content: jobDescription,
          title: "Tailored JD (AI Generated)",
        })
        .select("id")
        .single();
      if (newJd) finalJobId = newJd.id;
    }

    // 3. Save Document
    let finalCvId = existingCvId;
    let finalClId = existingClId;

    // saveDocument uses cookies() if it relies on standard createClient. 
    // We should patch saveDocument or pass the supabase instance to it.
    // For now, let's recreate the saveDocument logic here to avoid cookie issues in background.
    const saveDoc = async (data: any, docType: string, title: string, idToUpdate?: string) => {
      if (idToUpdate) {
        await supabase
          .from("resume_versions")
          .update({ content: data, updated_at: new Date().toISOString() })
          .eq("id", idToUpdate);
        return idToUpdate;
      } else {
        // Create new resume parent
        const { data: resumeData, error: resumeError } = await supabase
          .from("resumes")
          .insert({
            user_id: userId,
            profile_id: actualProfileId, // Required by not-null constraint
            name: title,
            type: docType,
            template_id: docType === "cv" ? cvTemplate || "ats-simple" : clTemplate || "cl-simple",
            job_id: finalJobId || null,
          })
          .select("id")
          .single();

        if (resumeError) throw resumeError;

        // Create version
        const { data: versionData, error: versionError } = await supabase
          .from("resume_versions")
          .insert({
            resume_id: resumeData.id,
            content: data,
          })
          .select("id")
          .single();

        if (versionError) throw versionError;

        return resumeData.id;
      }
    };

    if (responseData.cv) {
      const cvName = responseData.cv.personal?.fullName
        ? `CV - ${responseData.cv.personal.fullName}`
        : "Untitled CV";
      finalCvId = await saveDoc(responseData.cv, "cv", cvName, existingCvId);
    }

    if (responseData.coverLetter) {
      const clName = responseData.coverLetter.personal?.fullName
        ? `Cover Letter - ${responseData.coverLetter.personal.fullName}`
        : "Untitled Cover Letter";
      finalClId = await saveDoc(responseData.coverLetter, "cover_letter", clName, existingClId);
    }

    // 4. Log Usage & Deduct Credits
    await supabase.rpc("log_ai_and_deduct_credits", {
      p_user_id: userId,
      p_cost: totalCost,
      p_action_type: `generate_${goal}`,
      p_model_used: process.env.GEMINI_MODEL || "gemini-flash-latest",
      p_prompt_tokens: totalUsage.promptTokens,
      p_completion_tokens: totalUsage.completionTokens,
      p_latency_ms: latency,
    });

    return { success: true, cvId: finalCvId, clId: finalClId };
  }
);
