const API_BASE = '/api';

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function handleResponse<TResponse>(res: Response): Promise<TResponse> {
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const message =
      data && typeof data === 'object' && 'message' in data
        ? String((data as { message: unknown }).message)
        : 'Something went wrong. Please try again.';
    throw new ApiError(res.status, message);
  }

  return data as TResponse;
}

export async function apiGet<TResponse>(path: string): Promise<TResponse> {
  const res = await fetch(`${API_BASE}${path}`);
  return handleResponse<TResponse>(res);
}

export async function apiPost<TResponse, TBody>(path: string, body: TBody): Promise<TResponse> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return handleResponse<TResponse>(res);
}

export async function apiDelete<TResponse>(path: string): Promise<TResponse> {
  const res = await fetch(`${API_BASE}${path}`, { method: 'DELETE' });
  return handleResponse<TResponse>(res);
}
