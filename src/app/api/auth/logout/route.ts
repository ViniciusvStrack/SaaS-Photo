import { clearSessionCookie } from "@/lib/auth";
import { apiSuccess, handleApiError } from "@/lib/api";

export async function POST() {
  try {
    await clearSessionCookie();
    return apiSuccess({ message: "Logout realizado" });
  } catch (error) {
    return handleApiError(error);
  }
}
