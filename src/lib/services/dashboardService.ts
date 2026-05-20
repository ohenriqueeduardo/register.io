import { apiRequest } from "@/lib/api-client";
import { DashboardStats } from "@/types";

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    return apiRequest<DashboardStats>("/api/dashboard/stats");
  },
};
