import { getAdminClient, loadBlockedUsernameRules } from '../_shared/adminClient.ts';
import { HttpError, handleOptions, jsonError, jsonResponse } from '../_shared/http.ts';
import { insertWithOptionalColumns } from '../_shared/schemaCompat.ts';
import {
  getUsernameValidationMessage,
  validateUsername,
} from '../_shared/usernameModeration.ts';

const SHORT_ID_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

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

function generateShortId(length = 6): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);

  return Array.from(bytes, (byte) => SHORT_ID_CHARS[byte % SHORT_ID_CHARS.length]).join('');
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

    const challengeId = `friend:${generateShortId()}`;
    const seed = generateShortId();
    const basePayload = {
      id: challengeId,
      created_by_username: usernameValidation.normalized,
      seed,
      difficulty: readRequiredString(body, 'difficulty'),
      continent: readRequiredString(body, 'continent'),
      game_mode: readRequiredString(body, 'game_mode'),
    };
    const { error } = await insertWithOptionalColumns(
      supabase,
      'friend_challenges',
      {
        ...basePayload,
        created_by_display_username: usernameValidation.normalized,
        username_redacted: false,
      },
      basePayload,
      ['created_by_display_username', 'username_redacted'],
    );

    if (error) {
      console.error(error);
      throw new HttpError(500, 'insert_failed', 'Failed to create challenge link.');
    }

    return jsonResponse({ id: challengeId }, 201);
  } catch (error) {
    if (error instanceof HttpError) {
      return jsonError(error);
    }

    console.error(error);
    return jsonResponse(
      {
        code: 'unexpected_error',
        error: 'Failed to create challenge link.',
      },
      500,
    );
  }
});
