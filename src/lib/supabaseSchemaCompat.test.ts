import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { isMissingSupabaseColumnError } from './supabaseSchemaCompat';

describe('supabaseSchemaCompat', () => {
  it('detects schema cache misses for specific columns', () => {
    assert.equal(
      isMissingSupabaseColumnError(
        {
          code: 'PGRST204',
          message:
            "Could not find the 'created_by_display_username' column of 'friend_challenges' in the schema cache",
        },
        ['created_by_display_username', 'username_redacted'],
      ),
      true,
    );
  });

  it('detects undefined-column database errors for specific columns', () => {
    assert.equal(
      isMissingSupabaseColumnError(
        {
          code: '42703',
          message: 'column "display_username" does not exist',
        },
        ['display_username', 'username_redacted'],
      ),
      true,
    );
  });

  it('ignores unrelated errors', () => {
    assert.equal(
      isMissingSupabaseColumnError(
        {
          code: '42501',
          message: 'new row violates row-level security policy for table "scores"',
        },
        ['display_username', 'username_redacted'],
      ),
      false,
    );
  });
});
