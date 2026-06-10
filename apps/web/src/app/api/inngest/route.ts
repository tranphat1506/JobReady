import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { generateCvWorker } from "@/inngest/functions/generateCv";
import { parseProfileWorker } from "@/inngest/functions/parseProfile";
import { rescoreCvWorker } from "@/inngest/functions/rescoreCv";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    generateCvWorker,
    parseProfileWorker,
    rescoreCvWorker,
  ],
});
