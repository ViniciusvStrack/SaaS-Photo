import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { AuthError, requireAuth } from "@/lib/auth";
import { processMessage, getConversation, clearConversation } from "@/lib/ai/conversation-engine";

const messageSchema = z.object({
  text: z.string().min(1, "Texto obrigatório"),
});

const actionSchema = z.object({
  action: z.enum(["clear", "status"]),
});

function success<T>(data: T) {
  return NextResponse.json({ success: true, data });
}

function routeError(error: unknown) {
  if (error instanceof AuthError) {
    return NextResponse.json({ success: false, error: error.message }, { status: error.status });
  }
  if (error instanceof z.ZodError) {
    return NextResponse.json({ success: false, error: error.issues[0]?.message || "Dados inválidos" }, { status: 400 });
  }
  console.error("Assistant conversation error:", error);
  return NextResponse.json({ success: false, error: "Não foi possível processar a conversa" }, { status: 500 });
}

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
        return success({ message: "Conversa limpa!", cleared: true });
      }
      if (action === "status") {
        const state = getConversation(user.userId);
        return success({
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

    return success({
      message: result.message,
      action: result.action,
      event: result.state.event,
      step: result.state.step,
      suggestedActions: result.suggestedActions || [],
      historyLength: result.state.history.length,
      confidence: result.state.event.confidence,
    });
  } catch (error) {
    return routeError(error);
  }
}

// GET /api/assistant/conversation - Get current conversation state
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const state = getConversation(user.userId);

    if (!state) {
      return success({
        hasActiveConversation: false,
        step: null,
        event: null,
        history: [],
      });
    }

    return success({
      hasActiveConversation: true,
      step: state.step,
      event: state.event,
      history: state.history,
    });
  } catch (error) {
    return routeError(error);
  }
}
