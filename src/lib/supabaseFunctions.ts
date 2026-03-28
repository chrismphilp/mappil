import {
  FunctionsFetchError,
  FunctionsHttpError,
  FunctionsRelayError,
} from '@supabase/supabase-js';
import { getSupabase } from './supabase';

interface FunctionErrorPayload {
  code?: string;
  error?: string;
  message?: string;
}

export class SupabaseFunctionError extends Error {
  code?: string;

  constructor(message: string, code?: string) {
    super(message);
    this.name = 'SupabaseFunctionError';
    this.code = code;
  }
}

async function parseFunctionError(
  error: unknown,
  fallbackMessage: string,
): Promise<{ code?: string; message: string }> {
  if (error instanceof FunctionsHttpError) {
    try {
      const payload = (await error.context.json()) as FunctionErrorPayload;
      return {
        code: payload.code,
        message: payload.error ?? payload.message ?? fallbackMessage,
      };
    } catch {
      return {
        message: fallbackMessage,
      };
    }
  }

  if (error instanceof FunctionsFetchError || error instanceof FunctionsRelayError) {
    return {
      message: fallbackMessage,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
    };
  }

  return {
    message: fallbackMessage,
  };
}

export async function invokeSupabaseFunction<
  TResponse,
  TBody extends object = Record<string, unknown>,
>(
  functionName: string,
  body: TBody,
  fallbackMessage: string,
): Promise<TResponse> {
  const supabase = getSupabase();
  const { data, error } = await supabase.functions.invoke(functionName, {
    body: body as Record<string, unknown>,
  });

  if (!error) {
    return data as TResponse;
  }

  const details = await parseFunctionError(error, fallbackMessage);
  throw new SupabaseFunctionError(details.message, details.code);
}
