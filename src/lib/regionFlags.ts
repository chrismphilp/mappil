const REGION_CODE_ALIASES: Record<string, string> = {
  'ashmore and cartier islands': 'AU',
  'brunei darussalam': 'BN',
  'czech republic': 'CZ',
  'dem rep korea': 'KP',
  'democratic republic of the congo': 'CD',
  'faeroe islands': 'FO',
  'falkland islands malvinas': 'FK',
  'federated states of micronesia': 'FM',
  'french southern and antarctic lands': 'TF',
  'heard i and mcdonald islands': 'HM',
  'hong kong': 'HK',
  'indian ocean territories': 'IO',
  'kingdom of eswatini': 'SZ',
  'lao pdr': 'LA',
  'macao': 'MO',
  'myanmar': 'MM',
  'northern cyprus': 'CY',
  'palestine': 'PS',
  'republic of cabo verde': 'CV',
  'republic of korea': 'KR',
  'republic of the congo': 'CG',
  'russian federation': 'RU',
  'saint barthelemy': 'BL',
  'saint helena': 'SH',
  'saint kitts and nevis': 'KN',
  'saint lucia': 'LC',
  'saint martin': 'MF',
  'saint pierre and miquelon': 'PM',
  'saint vincent and the grenadines': 'VC',
  'siachen glacier': 'IN',
  'somaliland': 'SO',
  'south georgia and the islands': 'GS',
  'the gambia': 'GM',
  'turkey': 'TR',
  'united states virgin islands': 'VI',
  'vatican': 'VA',
  'wallis and futuna islands': 'WF',
};

// Intl.DisplayNames includes several obsolete or exceptional region codes whose
// display names collide with modern countries. Ignore them so country names map
// to the active code with the emoji flag users expect.
const EXCLUDED_REGION_CODES = new Set([
  'AN',
  'BU',
  'CS',
  'DD',
  'DY',
  'FX',
  'HV',
  'NH',
  'RH',
  'SU',
  'TP',
  'UK',
  'VD',
  'YD',
  'YU',
  'ZR',
]);

let browserRegionNameToCode: Map<string, string> | null = null;

function normalizeRegionName(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function getBrowserRegionNameToCode(): Map<string, string> {
  if (browserRegionNameToCode) {
    return browserRegionNameToCode;
  }

  browserRegionNameToCode = new Map();

  if (typeof Intl === 'undefined' || typeof Intl.DisplayNames !== 'function') {
    return browserRegionNameToCode;
  }

  const displayNames = new Intl.DisplayNames(['en'], { type: 'region' });

  for (let first = 65; first <= 90; first += 1) {
    for (let second = 65; second <= 90; second += 1) {
      const code = String.fromCharCode(first, second);

      if (EXCLUDED_REGION_CODES.has(code)) {
        continue;
      }

      const regionName = displayNames.of(code);

      if (!regionName || regionName === code) {
        continue;
      }

      const normalizedRegionName = normalizeRegionName(regionName);

      if (!browserRegionNameToCode.has(normalizedRegionName)) {
        browserRegionNameToCode.set(normalizedRegionName, code);
      }
    }
  }

  return browserRegionNameToCode;
}

function regionCodeToFlagEmoji(regionCode: string): string | null {
  const uppercaseCode = regionCode.toUpperCase();

  if (!/^[A-Z]{2}$/.test(uppercaseCode)) {
    return null;
  }

  return String.fromCodePoint(
    ...uppercaseCode.split('').map((char) => 0x1f1a5 + char.charCodeAt(0)),
  );
}

export function getRegionFlagEmoji(regionName?: string | null): string | null {
  if (!regionName) {
    return null;
  }

  const normalizedName = normalizeRegionName(regionName);
  const regionCode =
    REGION_CODE_ALIASES[normalizedName] ?? getBrowserRegionNameToCode().get(normalizedName);

  if (!regionCode) {
    return null;
  }

  return regionCodeToFlagEmoji(regionCode);
}
