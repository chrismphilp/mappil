import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { getRegionFlagEmoji } from './regionFlags';

describe('getRegionFlagEmoji', () => {
  it('uses modern country codes when Intl.DisplayNames exposes obsolete duplicates', () => {
    assert.equal(getRegionFlagEmoji('France'), '🇫🇷');
    assert.equal(getRegionFlagEmoji('Serbia'), '🇷🇸');
    assert.equal(getRegionFlagEmoji('United Kingdom'), '🇬🇧');
    assert.equal(getRegionFlagEmoji('Russia'), '🇷🇺');
  });

  it('still resolves names that need normalization or manual aliases', () => {
    assert.equal(getRegionFlagEmoji('Curaçao'), '🇨🇼');
    assert.equal(getRegionFlagEmoji('Turkey'), '🇹🇷');
    assert.equal(getRegionFlagEmoji('Saint Barthélemy'), '🇧🇱');
  });
});
