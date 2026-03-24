import { ChallengeType, ContinentFilter, Difficulty, GameMode } from '../types/game.types';

export type ChallengeSource = 'free_play' | 'daily' | 'friend';

export interface RulesetIdentity {
  difficulty: Difficulty;
  continent: ContinentFilter;
  gameMode: GameMode;
  challengeSource: ChallengeSource;
  challengeId?: string;
  modifier?: string;
}

interface BuildRulesetIdentityInput {
  difficulty: Difficulty;
  continent: ContinentFilter;
  gameMode: GameMode;
  challengeType?: ChallengeType;
  challengeId?: string;
  isDailyChallenge?: boolean;
  modifier?: string;
}

export function getChallengeSource(
  challengeType?: ChallengeType,
  isDailyChallenge?: boolean,
): ChallengeSource {
  if (isDailyChallenge || challengeType === ChallengeType.DAILY) {
    return 'daily';
  }

  if (challengeType === ChallengeType.FRIEND) {
    return 'friend';
  }

  return 'free_play';
}

export function buildRulesetIdentity(input: BuildRulesetIdentityInput): RulesetIdentity {
  return {
    difficulty: input.difficulty,
    continent: input.continent,
    gameMode: input.gameMode,
    challengeSource: getChallengeSource(input.challengeType, input.isDailyChallenge),
    challengeId: input.challengeId,
    modifier: input.modifier,
  };
}

export function buildRulesetKey(identity: RulesetIdentity): string {
  const parts = [
    `difficulty=${identity.difficulty}`,
    `continent=${identity.continent}`,
    `mode=${identity.gameMode}`,
    `source=${identity.challengeSource}`,
  ];

  if (identity.modifier) {
    parts.push(`modifier=${identity.modifier}`);
  }

  if (identity.challengeId) {
    parts.push(`challenge=${identity.challengeId}`);
  }

  return parts.join('|');
}

export function describeRuleset(identity: RulesetIdentity): string {
  const base = `${identity.continent} ${identity.gameMode} ${identity.difficulty}`;

  if (identity.challengeSource === 'daily') {
    return `${base} Daily`;
  }

  if (identity.challengeSource === 'friend') {
    return `${base} Friend Challenge`;
  }

  if (identity.modifier) {
    return `${base} ${identity.modifier}`;
  }

  return base;
}

export function buildFreePlayHref(
  difficulty: Difficulty,
  continent: ContinentFilter,
  gameMode: GameMode,
): string {
  const search = new URLSearchParams();

  if (continent !== ContinentFilter.WORLD) {
    search.set('continent', continent);
  }

  if (difficulty !== Difficulty.MEDIUM) {
    search.set('difficulty', difficulty);
  }

  if (gameMode !== GameMode.QUICK) {
    search.set('mode', gameMode);
  }

  const query = search.toString();
  return query ? `/play?${query}` : '/play';
}
