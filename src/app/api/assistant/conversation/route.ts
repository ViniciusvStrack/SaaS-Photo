import { NextRequest } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { apiSuccess, handleApiError } from "@/lib/api-utils";
import { processMessage, getConversation, clearConversation } from "@/lib/ai/conversation-engine";

const messageSchema = z.object({
  text: z.string().min(1, "Texto obrigatório"),
});

const actionSchema = z.object({
  action: z.enum(["clear", "status"]),
});

// POST /api/assistant/conversation - Process a message in conversation
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    // Handle clear/status actions
    if (body.action) {
      const { action } = actionSchema.parse(body);
      if (action === "clear") {
        clearConversation(user.userId);
        return apiSuccess({ message: "Conversa limpa!", cleared: true });
      }
      if (action === "status") {
        const state = getConversation(user.userId);
        return apiSuccess({
          hasActiveConversation: !!state,
          step: state?.step || null,
          event: state?.event || null,
          historyLength: state?.history.length || 0,
        });
      }
    }

    // Process message
    const { text } = messageSchema.parse(body);
    const result = processMessage(user.userId, text);

    return apiSuccess({
      message: result.message,
      action: result.action,
      event: result.state.event,
      step: result.state.step,
      suggestedActions: result.suggestedActions || [],
      historyLength: result.state.history.length,
      confidence: result.state.event.confidence,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// GET /api/assistant/conversation - Get current conversation state
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const state = getConversation(user.userId);

    if (!state) {
      return apiSuccess({
        hasActiveConversation: false,
        step: null,
        event: null,
        history: [],
      });
    }

    return apiSuccess({
      hasActiveConversation: true,
      step: state.step,
      event: state.event,
      history: state.history,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
