import { getAdminClient, loadBlockedUsernameRules } from '../_shared/adminClient.ts';
import { HttpError, handleOptions, jsonError, jsonResponse } from '../_shared/http.ts';
import { insertWithOptionalColumns } from '../_shared/schemaCompat.ts';
import {
  getUsernameValidationMessage,
  validateUsername,
} from '../_shared/usernameModeration.ts';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readRequiredString(body: Record<string, unknown>, key: string): string {
  const value = body[key];

  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new HttpError(400, 'invalid_request', `${key} is required.`);
  }

  return value;
}

function readOptionalString(body: Record<string, unknown>, key: string): string | undefined {
  const value = body[key];

  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (typeof value !== 'string') {
    throw new HttpError(400, 'invalid_request', `${key} must be a string.`);
  }

  return value;
}

function readRequiredInteger(body: Record<string, unknown>, key: string): number {
  const value = body[key];

  if (!Number.isInteger(value) || (value as number) < 0) {
    throw new HttpError(400, 'invalid_request', `${key} must be a non-negative integer.`);
  }

  return value as number;
}

function readOptionalBoolean(body: Record<string, unknown>, key: string): boolean | undefined {
  const value = body[key];

  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== 'boolean') {
    throw new HttpError(400, 'invalid_request', `${key} must be a boolean.`);
  }

  return value;
}

Deno.serve(async (request) => {
  const optionsResponse = handleOptions(request);
  if (optionsResponse) {
    return optionsResponse;
  }

  try {
    if (request.method !== 'POST') {
      throw new HttpError(405, 'method_not_allowed', 'POST only.');
    }

    const body = await request.json();
    if (!isRecord(body)) {
      throw new HttpError(400, 'invalid_request', 'Request body must be a JSON object.');
    }

    const supabase = getAdminClient();
    const blockedRules = await loadBlockedUsernameRules(supabase);
    const usernameValidation = validateUsername(readRequiredString(body, 'username'), {
      blockedTerms: blockedRules,
    });

    if (!usernameValidation.ok) {
      throw new HttpError(
        400,
        usernameValidation.code,
        getUsernameValidationMessage(usernameValidation.code),
      );
    }

    const basePayload = {
      player_id: readOptionalString(body, 'player_id'),
      username: usernameValidation.normalized,
      score: readRequiredInteger(body, 'score'),
      errors: readRequiredInteger(body, 'errors'),
      best_streak: readRequiredInteger(body, 'best_streak'),
      total_regions: readRequiredInteger(body, 'total_regions'),
      difficulty: readRequiredString(body, 'difficulty'),
      continent: readRequiredString(body, 'continent'),
      game_mode: readRequiredString(body, 'game_mode'),
      duration_secs: readRequiredInteger(body, 'duration_secs'),
      challenge_id: readOptionalString(body, 'challenge_id'),
      challenge_source: readRequiredString(body, 'challenge_source'),
      ruleset_key: readRequiredString(body, 'ruleset_key'),
      seed: readOptionalString(body, 'seed'),
      is_daily_challenge: readOptionalBoolean(body, 'is_daily_challenge') ?? false,
    };
    const { error } = await insertWithOptionalColumns(
      supabase,
      'scores',
      {
        ...basePayload,
        display_username: usernameValidation.normalized,
        username_redacted: false,
      },
      basePayload,
      ['display_username', 'username_redacted'],
    );

    if (error) {
      console.error(error);
      throw new HttpError(500, 'insert_failed', 'Failed to submit score.');
    }

    return jsonResponse({ ok: true }, 201);
  } catch (error) {
    if (error instanceof HttpError) {
      return jsonError(error);
    }

    console.error(error);
    return jsonResponse(
      {
        code: 'unexpected_error',
        error: 'Failed to submit score.',
      },
      500,
    );
  }
});
