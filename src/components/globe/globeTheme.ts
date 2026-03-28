export const GLOBE_THEME = {
  oceanBase: '#08111f',
  oceanHighlight: '#0c1b33',
  atmosphereColor: '#38bdf8',
  atmosphereAltitude: 0.14,
  countryLandMaskCap: 'rgb(100, 116, 139)',
  countryDefaultCap: 'rgba(100, 116, 139, 0.72)',
  countryDefaultStroke: 'rgba(148, 163, 184, 0.18)',
  countryFoundCap: 'rgba(52, 211, 153, 0.9)',
  countryFoundSide: 'rgba(16, 185, 129, 0.72)',
  countryFlyToCap: 'rgba(245, 158, 11, 0.92)',
  countryLabelFound: '#6ee7b7',
  transparent: 'rgba(0, 0, 0, 0)',
} as const;

const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

interface PolygonVisualState {
  isFlyTo: boolean;
  isFound: boolean;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (match) => HTML_ENTITIES[match] ?? match);
}

export function createOceanTextureDataUrl(): string {
  if (typeof document === 'undefined') {
    return '';
  }

  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return '';
  }

  const verticalGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  verticalGradient.addColorStop(0, GLOBE_THEME.oceanHighlight);
  verticalGradient.addColorStop(0.58, GLOBE_THEME.oceanBase);
  verticalGradient.addColorStop(1, '#050b15');
  ctx.fillStyle = verticalGradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const radialHighlight = ctx.createRadialGradient(24, 8, 2, 16, 16, 24);
  radialHighlight.addColorStop(0, 'rgba(56, 189, 248, 0.1)');
  radialHighlight.addColorStop(0.5, 'rgba(56, 189, 248, 0.04)');
  radialHighlight.addColorStop(1, GLOBE_THEME.transparent);
  ctx.fillStyle = radialHighlight;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  return canvas.toDataURL('image/png');
}

export function getPolygonCapColor({ isFlyTo, isFound }: PolygonVisualState): string {
  if (isFlyTo) {
    return GLOBE_THEME.countryFlyToCap;
  }

  if (isFound) {
    return GLOBE_THEME.countryFoundCap;
  }

  return GLOBE_THEME.countryDefaultCap;
}

export function getPolygonSideColor({ isFound }: Pick<PolygonVisualState, 'isFound'>): string {
  return isFound ? GLOBE_THEME.countryFoundSide : GLOBE_THEME.transparent;
}

export function getPolygonStrokeColor(): string {
  return GLOBE_THEME.countryDefaultStroke;
}

export function getFoundCountryLabelHtml(name: string, isFound: boolean): string {
  if (!isFound) {
    return '';
  }

  const safeName = escapeHtml(name);

  return `<span style="color: ${GLOBE_THEME.countryLabelFound}; font-size: 13px; font-weight: 600;">${safeName} ✓</span>`;
}
