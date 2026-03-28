import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  buildUsernameModerationKey,
  normalizeUsernameInput,
  sanitizeStoredUsername,
  validateUsername,
} from './usernameModeration';

describe('usernameModeration', () => {
  it('normalizes whitespace and removes invisible characters', () => {
    assert.equal(
      normalizeUsernameInput('  Mapp\u200Bil   User  '),
      'Mappil User',
    );
  });

  it('builds moderation keys that collapse separators and basic leetspeak', () => {
    assert.equal(buildUsernameModerationKey('F_u-c k'), 'fuck');
    assert.equal(buildUsernameModerationKey('sh1t'), 'shit');
  });

  it('rejects separator spam and blocked evasions', () => {
    assert.equal(validateUsername('Map__Player', { allowEmpty: true }).ok, false);
    assert.equal(
      validateUsername('Map__Player', { allowEmpty: true }).code,
      'separator_spam',
    );
    assert.equal(validateUsername('f_u-c_k').ok, false);
    assert.equal(validateUsername('f_u-c_k').code, 'blocked');
  });

  it('allows blank local usernames but rejects blank public usernames', () => {
    assert.equal(validateUsername('   ', { allowEmpty: true }).ok, true);
    assert.equal(validateUsername('   ').ok, false);
    assert.equal(validateUsername('   ').code, 'empty');
  });

  it('clears stored usernames that fail moderation', () => {
    assert.equal(sanitizeStoredUsername('f_u_c_k'), '');
    assert.equal(sanitizeStoredUsername('  Safe\u200B Name  '), 'Safe Name');
  });
});
