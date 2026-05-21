import { apiRequest } from "@/lib/api-client";
import { User } from "@/types";

export const authService = {
  async login(email: string, password: string): Promise<User> {
    return apiRequest<User>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  async register(nome: string, email: string, password: string): Promise<User> {
    return apiRequest<User>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ nome, email, password }),
    });
  },

  async logout(): Promise<void> {
    await apiRequest("/api/auth/logout", {
      method: "POST",
    });
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      return await apiRequest<User>("/api/auth/me");
    } catch {
      return null;
    }
  },

  async updateProfile(nome: string): Promise<User> {
    return apiRequest<User>("/api/auth/account", {
      method: "PATCH",
      body: JSON.stringify({ action: "profile", nome }),
    });
  },

  async updateEmail(email: string, currentPassword: string): Promise<User> {
    return apiRequest<User>("/api/auth/account", {
      method: "PATCH",
      body: JSON.stringify({ action: "email", email, currentPassword }),
    });
  },

  async updatePassword(
    currentPassword: string,
    newPassword: string,
  ): Promise<User> {
    return apiRequest<User>("/api/auth/account", {
      method: "PATCH",
      body: JSON.stringify({ action: "password", currentPassword, newPassword }),
    });
  },

  async deleteAccount(currentPassword: string): Promise<void> {
    await apiRequest("/api/auth/account", {
      method: "DELETE",
      body: JSON.stringify({ currentPassword }),
    });
  },
};
