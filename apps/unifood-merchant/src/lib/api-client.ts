import { getAuthToken } from "@/app/actions/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

type ApiResponse<T = unknown> = {
  data: T | null;
  error: string | null;
  status: number;
};

async function buildHeaders(withAuth = true): Promise<HeadersInit> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (withAuth) {
    const token = await getAuthToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  return headers;
}

async function handleResponse<T>(res: Response): Promise<ApiResponse<T>> {
  let data: any = null;

  try {
    data = await res.json();
  } catch {
    // no-op: empty body
  }

  if (!res.ok) {
    const errorMessage =
      (Array.isArray(data?.message) ? data.message.join(", ") : data?.message) ||
      "An unexpected error occurred.";
    return { data: null, error: errorMessage, status: res.status };
  }

  return { data: data?.data ?? data, error: null, status: res.status };
}

async function get<T = unknown>(
  path: string,
  withAuth = true
): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      method: "GET",
      headers: await buildHeaders(withAuth),
    });
    return handleResponse<T>(res);
  } catch (err) {
    console.error(`[apiClient.get] ${path}:`, err);
    return { data: null, error: "Something went wrong. Please try again.", status: 0 };
  }
}

async function post<T = unknown>(
  path: string,
  body?: unknown,
  withAuth = true
): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: await buildHeaders(withAuth),
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    return handleResponse<T>(res);
  } catch (err) {
    console.error(`[apiClient.post] ${path}:`, err);
    return { data: null, error: "Something went wrong. Please try again.", status: 0 };
  }
}

async function patch<T = unknown>(
  path: string,
  body?: unknown,
  withAuth = true
): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      method: "PATCH",
      headers: await buildHeaders(withAuth),
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    return handleResponse<T>(res);
  } catch (err) {
    console.error(`[apiClient.patch] ${path}:`, err);
    return { data: null, error: "Something went wrong. Please try again.", status: 0 };
  }
}

async function put<T = unknown>(
  path: string,
  body?: unknown,
  withAuth = true
): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      method: "PUT",
      headers: await buildHeaders(withAuth),
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    return handleResponse<T>(res);
  } catch (err) {
    console.error(`[apiClient.put] ${path}:`, err);
    return { data: null, error: "Something went wrong. Please try again.", status: 0 };
  }
}

async function del<T = unknown>(
  path: string,
  withAuth = true
): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      method: "DELETE",
      headers: await buildHeaders(withAuth),
    });
    return handleResponse<T>(res);
  } catch (err) {
    console.error(`[apiClient.delete] ${path}:`, err);
    return { data: null, error: "Something went wrong. Please try again.", status: 0 };
  }
}

export const apiClient = { get, post, patch, put, delete: del };
