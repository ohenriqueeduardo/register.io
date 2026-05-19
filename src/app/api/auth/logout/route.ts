import { SESSION_COOKIE } from "@/lib/auth";
import { handleApiError, success } from "@/lib/api-response";

export const runtime = "nodejs";

export async function POST() {
  try {
    const response = success({ ok: true });
    response.cookies.set({
      name: SESSION_COOKIE,
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
