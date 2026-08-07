import { NextRequest } from "next/server";
import { z } from "zod";
import { parseCommand } from "@/lib/nlp-parser";
import { requireAuth } from "@/lib/auth";
import { apiSuccess, handleApiError } from "@/lib/api";

const parseSchema = z.object({
  text: z.string().min(1, "Texto obrigatório"),
});

export async function POST(req: NextRequest) {
  try {
    await requireAuth();
    const body = await req.json();
    const { text } = parseSchema.parse(body);

    // Use the NLP parser (rule-based, ready for AI replacement)
    const result = parseCommand(text);

    return apiSuccess(result);
  } catch (error) {
    return handleApiError(error);
  }
}
