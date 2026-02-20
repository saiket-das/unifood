"use server";

import { cookies } from "next/headers";
import { apiClient } from "@/lib/api-client";

export async function loginUser(prevState: any, formData: FormData) {
  const email = formData.get("email");
  const password = formData.get("password");

  try {
    const res = await apiClient.post<any>("/auth/login", { email, password }, false);

    if (res.error) {
      return { error: res.error || "Invalid credentials", needsPasswordChange: false };
    }

    const tokens = res.data;

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set("auth_token", tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 15, // 15 minutes for access token
    });

    if (tokens.refresh_token) {
      cookieStore.set("refresh_token", tokens.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days for refresh token
      });
    }

    return { 
      error: null, 
      needsPasswordChange: !!tokens.needsPasswordChange, 
      success: true 
    };
  } catch (error) {
    console.error("Login error:", error);
    return { error: "Something went wrong. Please try again.", needsPasswordChange: false };
  }
}

export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete("auth_token");
  cookieStore.delete("refresh_token");
}

export async function getAuthToken() {
  const cookieStore = await cookies();
  return cookieStore.get("auth_token")?.value;
}

export async function changePassword(prevState: any, formData: FormData) {
  const newPassword = formData.get("password") as string;

  try {
    const res = await apiClient.post<any>("/auth/change-password", { newPassword });

    if (res.error) {
      return { error: res.error || "Failed to change password." };
    }

    // Return success so the client can redirect
    return { error: null, success: true };
  } catch (error) {
    console.error("Change password error:", error);
    return { error: "Something went wrong. Please try again." };
  }
}
