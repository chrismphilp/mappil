interface SupabaseSchemaErrorLike {
  code?: string | null;
  message?: string | null;
  details?: string | null;
  hint?: string | null;
}

const MISSING_COLUMN_ERROR_CODES = new Set(['PGRST204', '42703']);

export function isMissingSupabaseColumnError(
  error: SupabaseSchemaErrorLike | null | undefined,
  columns: readonly string[],
): boolean {
  if (!error) {
    return false;
  }

  const haystack = [error.message, error.details, error.hint]
    .filter((value): value is string => typeof value === 'string' && value.length > 0)
    .join(' ')
    .toLowerCase();

  if (
    columns.length > 0 &&
    !columns.some((column) => haystack.includes(column.toLowerCase()))
  ) {
    return false;
  }

  if (error.code && MISSING_COLUMN_ERROR_CODES.has(error.code)) {
    return true;
  }

  return (
    haystack.includes('schema cache') ||
    haystack.includes('undefined column') ||
    haystack.includes('could not find')
  );
}
