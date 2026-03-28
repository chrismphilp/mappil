import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  GLOBE_THEME,
  getFoundCountryLabelHtml,
  getPolygonCapColor,
  getPolygonSideColor,
  getPolygonStrokeColor,
} from './globeTheme';

describe('globeTheme', () => {
  it('prioritizes fly-to highlighting over found styling', () => {
    assert.equal(
      getPolygonCapColor({ isFlyTo: true, isFound: true }),
      GLOBE_THEME.countryFlyToCap,
    );
  });

  it('uses neutral and found fills in the expected cases', () => {
    assert.equal(
      getPolygonCapColor({ isFlyTo: false, isFound: false }),
      GLOBE_THEME.countryDefaultCap,
    );
    assert.equal(
      getPolygonCapColor({ isFlyTo: false, isFound: true }),
      GLOBE_THEME.countryFoundCap,
    );
  });

  it('keeps polygon sides transparent until a region is found', () => {
    assert.equal(
      getPolygonSideColor({ isFound: false }),
      GLOBE_THEME.transparent,
    );
    assert.equal(
      getPolygonSideColor({ isFound: true }),
      GLOBE_THEME.countryFoundSide,
    );
  });

  it('keeps a single stroke color for neutral borders', () => {
    assert.equal(getPolygonStrokeColor(), GLOBE_THEME.countryDefaultStroke);
  });

  it('renders labels only for found countries and escapes HTML', () => {
    assert.equal(getFoundCountryLabelHtml('France', false), '');

    const label = getFoundCountryLabelHtml('<France & Co>', true);
    assert.match(label, /&lt;France &amp; Co&gt;/);
    assert.doesNotMatch(label, /<France & Co>/);
    assert.match(label, new RegExp(GLOBE_THEME.countryLabelFound.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  });
});
