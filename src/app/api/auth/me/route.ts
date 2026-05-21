import { failure, handleApiError, success } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return failure("Não autenticado.", 401);
    }

    return success(user);
  } catch (error) {
    return handleApiError(error);
  }
}
