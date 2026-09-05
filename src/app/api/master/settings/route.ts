import { handleApiError, success } from "@/lib/api-response";
import { requireMasterAdmin } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { withLogging } from "@/lib/api-middleware";

export const runtime = "nodejs";

const DEFAULT_SETTINGS = {
  allowPublicRegistration: true,
  maintenanceMode: false,
  sessionTimeoutMinutes: 60 * 24 * 7,
  passwordMinLength: 8,
  requireSpecialChars: false,
  maxLoginAttemptsPerHour: 20,
};

export const GET = withLogging(async function GET() {
  try {
    await requireMasterAdmin();
    const prisma = getPrisma();

    const setting = await prisma.systemSetting.findUnique({
      where: { key: "platform_settings" },
    });

    return success(setting?.value || DEFAULT_SETTINGS);
  } catch (error) {
    return handleApiError(error);
  }
});

export const PUT = withLogging(async function PUT(request: Request) {
  try {
    const master = await requireMasterAdmin();
    const body = await request.json();
    const prisma = getPrisma();

    const updated = await prisma.systemSetting.upsert({
      where: { key: "platform_settings" },
      update: {
        value: body,
        updatedById: master.id,
      },
      create: {
        key: "platform_settings",
        value: body,
        updatedById: master.id,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "SETTINGS_UPDATED",
        entity: "SystemSetting",
        entityId: updated.id,
        userId: master.id,
        status: "SUCCESS",
        metadata: { newSettings: body },
      },
    });

    return success(updated.value);
  } catch (error) {
    return handleApiError(error);
  }
});
