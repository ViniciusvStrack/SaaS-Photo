import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { tasks } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { apiSuccess, handleApiError } from "@/lib/api";

const createTaskSchema = z.object({
  title: z.string().min(1, "Título obrigatório"),
  description: z.string().optional(),
  status: z.enum(["backlog", "today", "in_progress", "waiting_client", "done"]).optional().default("backlog"),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional().default("medium"),
  dueDate: z.string().optional(),
  clientId: z.string().optional(),
  shootId: z.string().optional(),
  galleryId: z.string().optional(),
});

export async function GET() {
  try {
    const session = await requireAuth();
    const results = await db.select().from(tasks)
      .where(eq(tasks.studioId, session.studioId || ""))
      .orderBy(desc(tasks.createdAt));
    return apiSuccess(results);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await req.json();
    const data = createTaskSchema.parse(body);

    const [task] = await db.insert(tasks).values({
      studioId: session.studioId || "",
      title: data.title,
      description: data.description || null,
      status: data.status,
      priority: data.priority,
      dueDate: data.dueDate || null,
      clientId: data.clientId || null,
      shootId: data.shootId || null,
      galleryId: data.galleryId || null,
    }).returning();

    return apiSuccess(task, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
