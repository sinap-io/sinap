const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
// Clave interna — nunca se expone al browser (no tiene prefijo NEXT_PUBLIC_)
const API_KEY = process.env.SINAP_API_KEY ?? "";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const { headers: extraHeaders, ...restOptions } = options ?? {};
  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      "X-Sinap-Api-Key": API_KEY,
      ...(extraHeaders as Record<string, string> | undefined),
    },
    ...restOptions,
  });

  if (!res.ok) {
    throw new ApiError(res.status, `API error ${res.status}: ${path}`);
  }

  return res.json() as Promise<T>;
}
