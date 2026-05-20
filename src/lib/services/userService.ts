import { apiRequest } from "@/lib/api-client";
import { User } from "@/types";

export const userService = {
  async list(): Promise<User[]> {
    return apiRequest<User[]>("/api/usuarios");
  },
};
