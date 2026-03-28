export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 20;
export const REDACTED_USERNAME_FALLBACK = 'Player';

export type UsernameBlockMatchType = 'exact' | 'substring';

export interface BlockedUsernameRule {
  term: string;
  matchType: UsernameBlockMatchType;
}

export type UsernameValidationCode =
  | 'empty'
  | 'too_short'
  | 'too_long'
  | 'invalid_chars'
  | 'separator_spam'
  | 'blocked';

export type UsernameValidationResult =
  | {
      ok: true;
      code: null;
      normalized: string;
      moderationKey: string;
      visibleLength: number;
      matchedRule?: undefined;
    }
  | {
      ok: false;
      code: UsernameValidationCode;
      normalized: string;
      moderationKey: string;
      visibleLength: number;
      matchedRule?: BlockedUsernameRule;
    };

const INVISIBLE_OR_CONTROL_REGEX =
  /[\u0000-\u001F\u007F-\u009F\u00AD\u034F\u061C\u115F\u1160\u17B4\u17B5\u180B-\u180F\u200B-\u200F\u202A-\u202E\u2060-\u206F\u3164\uFE00-\uFE0F\uFEFF\uFFA0]/gu;
const WHITESPACE_REGEX = /\s+/gu;
const INVALID_USERNAME_CHAR_REGEX = /[^\p{L}\p{M}\p{N} _-]/u;
const REPEATED_SEPARATOR_REGEX = /(?:_{2,}|-{2,})/u;

const MODERATION_CHAR_FOLDS: Record<string, string> = {
  '0': 'o',
  '1': 'i',
  '3': 'e',
  '4': 'a',
  '5': 's',
  '7': 't',
  '@': 'a',
  '$': 's',
  '!': 'i',
};

export const DEFAULT_BLOCKED_USERNAME_RULES = [
  { term: 'fuck', matchType: 'substring' },
  { term: 'shit', matchType: 'substring' },
  { term: 'bitch', matchType: 'substring' },
  { term: 'nigger', matchType: 'substring' },
  { term: 'nigga', matchType: 'substring' },
  { term: 'faggot', matchType: 'substring' },
  { term: 'whore', matchType: 'substring' },
  { term: 'slut', matchType: 'substring' },
  { term: 'retard', matchType: 'substring' },
] as const satisfies readonly BlockedUsernameRule[];

export function normalizeUsernameInput(input: string): string {
  return input
    .normalize('NFKC')
    .replace(INVISIBLE_OR_CONTROL_REGEX, '')
    .replace(WHITESPACE_REGEX, ' ')
    .trim();
}

export function buildUsernameModerationKey(input: string): string {
  return Array.from(normalizeUsernameInput(input).toLowerCase())
    .map((char) => MODERATION_CHAR_FOLDS[char] ?? char)
    .filter((char) => char !== ' ' && char !== '_' && char !== '-')
    .join('');
}

function countVisibleCharacters(input: string): number {
  return Array.from(input).length;
}

function matchesBlockedRule(
  normalized: string,
  moderationKey: string,
  rule: BlockedUsernameRule,
): boolean {
  const normalizedTerm = normalizeUsernameInput(rule.term);
  const normalizedTermKey = buildUsernameModerationKey(normalizedTerm);

  if (!normalizedTerm || !normalizedTermKey) {
    return false;
  }

  if (rule.matchType === 'exact') {
    return (
      normalized.toLowerCase() === normalizedTerm.toLowerCase() ||
      moderationKey === normalizedTermKey
    );
  }

  return moderationKey.includes(normalizedTermKey);
}

export function validateUsername(
  input: string,
  options: {
    allowEmpty?: boolean;
    blockedTerms?: readonly BlockedUsernameRule[];
  } = {},
): UsernameValidationResult {
  const normalized = normalizeUsernameInput(input);
  const visibleLength = countVisibleCharacters(normalized);
  const moderationKey = buildUsernameModerationKey(normalized);
  const blockedTerms = options.blockedTerms ?? DEFAULT_BLOCKED_USERNAME_RULES;

  if (normalized.length === 0) {
    return options.allowEmpty
      ? {
          ok: true,
          code: null,
          normalized,
          moderationKey,
          visibleLength,
        }
      : {
          ok: false,
          code: 'empty',
          normalized,
          moderationKey,
          visibleLength,
        };
  }

  if (visibleLength < USERNAME_MIN_LENGTH) {
    return {
      ok: false,
      code: 'too_short',
      normalized,
      moderationKey,
      visibleLength,
    };
  }

  if (visibleLength > USERNAME_MAX_LENGTH) {
    return {
      ok: false,
      code: 'too_long',
      normalized,
      moderationKey,
      visibleLength,
    };
  }

  if (REPEATED_SEPARATOR_REGEX.test(normalized)) {
    return {
      ok: false,
      code: 'separator_spam',
      normalized,
      moderationKey,
      visibleLength,
    };
  }

  if (INVALID_USERNAME_CHAR_REGEX.test(normalized) || moderationKey.length === 0) {
    return {
      ok: false,
      code: 'invalid_chars',
      normalized,
      moderationKey,
      visibleLength,
    };
  }

  const matchedRule = blockedTerms.find((rule) =>
    matchesBlockedRule(normalized, moderationKey, rule),
  );

  if (matchedRule) {
    return {
      ok: false,
      code: 'blocked',
      normalized,
      moderationKey,
      visibleLength,
      matchedRule,
    };
  }

  return {
    ok: true,
    code: null,
    normalized,
    moderationKey,
    visibleLength,
  };
}

export function sanitizeStoredUsername(
  input: string,
  options: {
    blockedTerms?: readonly BlockedUsernameRule[];
  } = {},
): string {
  const result = validateUsername(input, {
    allowEmpty: true,
    blockedTerms: options.blockedTerms,
  });

  if (result.ok) {
    return result.normalized;
  }

  return '';
}

export function getUsernameValidationMessage(code: UsernameValidationCode): string {
  switch (code) {
    case 'empty':
      return 'Set a username before posting to shared boards.';
    case 'too_short':
      return `Use at least ${USERNAME_MIN_LENGTH} characters.`;
    case 'too_long':
      return `Keep it to ${USERNAME_MAX_LENGTH} characters or fewer.`;
    case 'invalid_chars':
      return 'Use letters, numbers, spaces, _ or - only.';
    case 'separator_spam':
      return 'Avoid repeated _ or - characters.';
    case 'blocked':
      return 'Choose a different username.';
  }
}

export function getSafeDisplayUsername(args: {
  displayUsername?: string | null;
  rawUsername?: string | null;
  isRedacted?: boolean | null;
  fallback?: string;
}): string {
  const fallback = args.fallback ?? REDACTED_USERNAME_FALLBACK;
  const displayUsername =
    typeof args.displayUsername === 'string'
      ? normalizeUsernameInput(args.displayUsername)
      : '';

  if (displayUsername.length > 0) {
    return displayUsername;
  }

  if (args.isRedacted) {
    return fallback;
  }

  const safeRawUsername =
    typeof args.rawUsername === 'string' ? sanitizeStoredUsername(args.rawUsername) : '';

  return safeRawUsername.length > 0 ? safeRawUsername : fallback;
}
