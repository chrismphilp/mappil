export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export class HttpError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.code = code;
  }
}

export function handleOptions(request: Request): Response | null {
  if (request.method !== 'OPTIONS') {
    return null;
  }

  return new Response('ok', {
    headers: corsHeaders,
  });
}

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

export function jsonError(error: HttpError): Response {
  return jsonResponse(
    {
      code: error.code,
      error: error.message,
    },
    error.status,
  );
}
