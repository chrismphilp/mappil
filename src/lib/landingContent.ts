import { ContinentFilter, Difficulty, GameMode } from '../types/game.types';

export const SITE_URL = 'https://mappil.com';

export interface LandingLink {
  href: string;
  label: string;
}

export interface LandingCard {
  title: string;
  description: string;
}

export interface LandingTile {
  href: string;
  title: string;
  description: string;
}

export interface LandingFaq {
  q: string;
  a: string;
}

export interface LandingSection {
  title: string;
  text?: string;
  cards?: LandingCard[];
  tiles?: LandingTile[];
  faqs?: LandingFaq[];
}

export interface LandingGameProps {
  continent?: ContinentFilter;
  difficulty?: Difficulty;
  gameMode?: GameMode;
}

export interface LandingPageContent {
  path: string;
  priority: number;
  title: string;
  description: string;
  heading: string;
  intro: string;
  introEyebrow?: string;
  backLink?: LandingLink;
  primaryCta: LandingLink;
  secondaryCta?: LandingLink;
  gameProps?: LandingGameProps;
  sections: LandingSection[];
  footerText?: string;
  footerLink?: LandingLink;
}

export type QuizRouteId =
  | 'world-map-quiz'
  | 'africa-map-quiz'
  | 'asia-map-quiz'
  | 'europe-map-quiz'
  | 'north-america-map-quiz'
  | 'south-america-map-quiz'
  | 'oceania-map-quiz';

const REGION_TILES: LandingTile[] = [
  {
    href: '/world-map-quiz',
    title: 'World Map Quiz',
    description: 'Play the full world map and learn countries from every continent.',
  },
  {
    href: '/africa-map-quiz',
    title: 'Africa Map Game',
    description: 'Focus on African countries and build recognition faster.',
  },
  {
    href: '/asia-map-quiz',
    title: 'Asia Map Game',
    description: 'Practice Asia with the same 3D globe and difficulty controls.',
  },
  {
    href: '/europe-map-quiz',
    title: 'Europe Map Game',
    description: 'Use Europe runs for dense-country practice and faster repetitions.',
  },
  {
    href: '/north-america-map-quiz',
    title: 'North America Map Game',
    description: 'Cover North America, Central America, and the Caribbean.',
  },
  {
    href: '/south-america-map-quiz',
    title: 'South America Map Game',
    description: 'Rehearse South American countries on the rotating globe.',
  },
  {
    href: '/oceania-map-quiz',
    title: 'Oceania Map Game',
    description: 'Learn Australia, New Zealand, and Pacific island nations.',
  },
];

export const HOME_PAGE_CONTENT: LandingPageContent = {
  path: '/',
  priority: 1,
  title: 'Mappil: Free 3D World Map Game & Geography Quiz',
  description:
    'Play a free 3D world map game that helps you learn countries by continent, difficulty, and daily challenge mode.',
  heading: 'Free 3D World Map Game',
  introEyebrow: 'Interactive Geography Practice',
  intro:
    'Mappil keeps the game live on the landing page while still explaining what makes it useful: you can learn countries on a spinning globe, narrow the map by continent, and replay runs with score and streak goals.',
  primaryCta: {
    href: '/play?daily=true',
    label: 'Play Daily Challenge',
  },
  secondaryCta: {
    href: '/map-game',
    label: 'Explore The Map Game',
  },
  sections: [
    {
      title: 'Why Players Come Back',
      cards: [
        {
          title: 'Live 3D Globe',
          description:
            'Start the geography game immediately instead of clicking through to a separate static landing page.',
        },
        {
          title: 'Flexible Practice',
          description:
            'Move between world and continent runs, swap difficulty, and choose quick or full games.',
        },
        {
          title: 'Replayable Goals',
          description:
            'Daily challenges, streaks, and score feedback make repeat practice feel purposeful.',
        },
      ],
    },
    {
      title: 'Practice By Continent',
      text:
        'Mappil covers both broad world-map play and focused regional drills, so players can narrow the globe without leaving the same game loop.',
      tiles: REGION_TILES,
    },
    {
      title: 'Frequently Asked Questions',
      faqs: [
        {
          q: 'What is Mappil?',
          a: 'Mappil is a free 3D world map game and geography quiz. You learn by spinning the globe, finding countries, and replaying runs across different regions and difficulty settings.',
        },
        {
          q: 'Is it free?',
          a: 'Yes. The core world map game, continent practice modes, daily challenge, and friend challenges are all free to play.',
        },
        {
          q: 'Can I choose which continent to learn?',
          a: 'Yes. You can play the full world map or focus on regions like Africa, Asia, Europe, North America, South America, or Oceania.',
        },
      ],
    },
  ],
};

export const MAP_GAME_PAGE_CONTENT: LandingPageContent = {
  path: '/map-game',
  priority: 0.9,
  title: 'Free 3D World Map Game | Play Mappil Online',
  description:
    'Play a free 3D world map game with continent filters, difficulty levels, daily challenges, and replayable geography practice.',
  heading: 'Free 3D World Map Game',
  introEyebrow: 'Map Game Overview',
  intro:
    'Mappil is a map game for learning countries through repeat play, not a static worksheet. Spin the globe, switch regions and difficulty in real time, and replay runs with clear score targets.',
  backLink: {
    href: '/',
    label: 'Back To Home',
  },
  primaryCta: {
    href: '/play?daily=true',
    label: 'Play Daily Challenge',
  },
  secondaryCta: {
    href: '/world-map-quiz',
    label: 'Start World Practice',
  },
  sections: [
    {
      title: 'Ways To Play',
      cards: [
        {
          title: 'World Quick Play',
          description:
            'Jump into a shorter run to learn the map faster and keep retrying without waiting for the globe to reload.',
        },
        {
          title: 'Full Game',
          description:
            'Play a longer world map game when you want broader country coverage and bigger score swings.',
        },
        {
          title: 'Daily And Friend Challenges',
          description:
            'Use shared seeds, streaks, and leaderboard runs to turn geography practice into repeatable competition.',
        },
      ],
    },
    {
      title: 'Choose The Region You Want To Learn',
      text:
        'The same interactive game can be narrowed to a single continent when you want faster repetition. That makes Mappil useful both as a broad world map game and as focused geography practice for one region at a time.',
      tiles: REGION_TILES,
    },
    {
      title: 'Frequently Asked Questions',
      faqs: [
        {
          q: 'What kind of map game is Mappil?',
          a: 'Mappil is a free 3D world map game that also works as a geography quiz. You spin the globe, select countries, and replay runs with different regions, difficulties, and challenge modes.',
        },
        {
          q: 'Can I practice one region instead of the whole world?',
          a: 'Yes. You can filter to Africa, Asia, Europe, North America, South America, or Oceania and keep the same controls and scoring system.',
        },
        {
          q: 'Is this map game good for repeat practice?',
          a: 'Yes. Quick Play, Full Game, daily challenges, friend challenges, streaks, and score breakdowns all make it easier to replay with a clear improvement target.',
        },
      ],
    },
  ],
};

export const QUIZ_ROUTE_IDS: QuizRouteId[] = [
  'world-map-quiz',
  'africa-map-quiz',
  'asia-map-quiz',
  'europe-map-quiz',
  'north-america-map-quiz',
  'south-america-map-quiz',
  'oceania-map-quiz',
];

export const QUIZ_PAGE_CONTENT: Record<QuizRouteId, LandingPageContent> = {
  'world-map-quiz': {
    path: '/world-map-quiz',
    priority: 0.8,
    title: 'World Map Quiz - Play Mappil 3D Geography Game',
    description: 'Test your knowledge on countries all over the globe.',
    heading: 'World Map Quiz',
    introEyebrow: 'World Geography Practice',
    intro:
      'Practice identifying countries from every continent on Mappil’s interactive 3D globe. The game loads on this page and lets you adjust difficulty without leaving the run.',
    backLink: {
      href: '/',
      label: 'Back To Home',
    },
    primaryCta: {
      href: '/map-game',
      label: 'Explore All Modes',
    },
    secondaryCta: {
      href: '/play?daily=true',
      label: 'Try The Daily Challenge',
    },
    sections: [
      {
        title: 'Why Use The World Map Quiz',
        cards: [
          {
            title: 'Whole-Globe Coverage',
            description: 'Learn countries across every continent in one replayable run.',
          },
          {
            title: 'Difficulty Controls',
            description: 'Adjust the included set of countries from easier runs to denser full-map sessions.',
          },
          {
            title: 'Score And Streak Feedback',
            description: 'Use the end-of-run summary to target higher scores or fewer mistakes on the same ruleset.',
          },
        ],
      },
      {
        title: 'Frequently Asked Questions',
        faqs: [
          {
            q: 'How many countries are in the world quiz?',
            a: 'The world quiz includes sovereign states across all continents.',
          },
          {
            q: 'Can I change the difficulty?',
            a: 'Yes. You can choose Easy, Medium, or Hard before or during the quiz.',
          },
        ],
      },
    ],
  },
  'africa-map-quiz': {
    path: '/africa-map-quiz',
    priority: 0.8,
    title: 'Africa Map Quiz - Play Mappil 3D Geography Game',
    description: 'Practice identifying the diverse countries of Africa.',
    heading: 'Africa Map Quiz',
    introEyebrow: 'Africa Practice',
    intro:
      'Use Mappil to practice African countries on a rotating globe, then replay the same region with higher difficulty or cleaner runs.',
    backLink: {
      href: '/',
      label: 'Back To Home',
    },
    primaryCta: {
      href: '/map-game',
      label: 'Explore All Regions',
    },
    secondaryCta: {
      href: '/world-map-quiz',
      label: 'Practice The World Map',
    },
    gameProps: {
      continent: ContinentFilter.AFRICA,
    },
    sections: [
      {
        title: 'What You Can Practice',
        cards: [
          {
            title: 'Country Recognition',
            description: 'Focus on the fully recognized sovereign nations across the African continent.',
          },
          {
            title: 'Replayable Drills',
            description: 'Run the same region repeatedly without changing apps or waiting on a new page load.',
          },
          {
            title: 'Difficulty Progression',
            description: 'Start easier, then raise the density once the broad shapes feel familiar.',
          },
        ],
      },
      {
        title: 'Frequently Asked Questions',
        faqs: [
          {
            q: 'What does the Africa map quiz cover?',
            a: 'It covers the fully recognized sovereign nations across the African continent.',
          },
          {
            q: 'Is there a time limit?',
            a: 'No. You can take your time to find each country on the 3D globe.',
          },
        ],
      },
    ],
  },
  'asia-map-quiz': {
    path: '/asia-map-quiz',
    priority: 0.8,
    title: 'Asia Map Quiz - Play Mappil 3D Geography Game',
    description: 'Find all the nations within the vast continent of Asia.',
    heading: 'Asia Map Quiz',
    introEyebrow: 'Asia Practice',
    intro:
      'Practice Asia on the same interactive globe, then increase the challenge as your recognition improves.',
    backLink: {
      href: '/',
      label: 'Back To Home',
    },
    primaryCta: {
      href: '/map-game',
      label: 'Explore All Regions',
    },
    secondaryCta: {
      href: '/world-map-quiz',
      label: 'Practice The World Map',
    },
    gameProps: {
      continent: ContinentFilter.ASIA,
    },
    sections: [
      {
        title: 'Why Play The Asia Map Quiz',
        cards: [
          {
            title: 'Large Regional Coverage',
            description: 'Work through one of the biggest and most varied continent maps in the game.',
          },
          {
            title: 'Same Core Controls',
            description: 'Keep the same globe, scoring, and replay loop while narrowing the geography scope.',
          },
          {
            title: 'Incremental Practice',
            description: 'Use repeated runs to separate broad recognition from harder border-dense areas.',
          },
        ],
      },
      {
        title: 'Frequently Asked Questions',
        faqs: [
          {
            q: 'Does this include the Middle East?',
            a: 'Yes. Countries in Western Asia are included in the Asia map quiz.',
          },
        ],
      },
    ],
  },
  'europe-map-quiz': {
    path: '/europe-map-quiz',
    priority: 0.8,
    title: 'Europe Map Quiz - Play Mappil 3D Geography Game',
    description: 'Master the geography of Europe, from Portugal to the Urals.',
    heading: 'Europe Map Quiz',
    introEyebrow: 'Europe Practice',
    intro:
      'Europe is well suited to dense-country drills. Use the 3D globe to repeat runs quickly and learn tighter borders with clearer feedback.',
    backLink: {
      href: '/',
      label: 'Back To Home',
    },
    primaryCta: {
      href: '/map-game',
      label: 'Explore All Regions',
    },
    secondaryCta: {
      href: '/world-map-quiz',
      label: 'Practice The World Map',
    },
    gameProps: {
      continent: ContinentFilter.EUROPE,
    },
    sections: [
      {
        title: 'Why Europe Works Well For Practice',
        cards: [
          {
            title: 'Dense Geography',
            description: 'Europe gives you tighter borders and faster recognition drills once the basics are familiar.',
          },
          {
            title: 'Fast Replays',
            description: 'Repeat a region quickly without leaving the same game shell.',
          },
          {
            title: 'Scalable Difficulty',
            description: 'Use easier runs to learn the outline, then turn up the challenge once names are sticking.',
          },
        ],
      },
      {
        title: 'Frequently Asked Questions',
        faqs: [
          {
            q: 'Are microstates included?',
            a: 'Depending on the difficulty setting, smaller nations like Monaco or Andorra may be included or excluded.',
          },
        ],
      },
    ],
  },
  'north-america-map-quiz': {
    path: '/north-america-map-quiz',
    priority: 0.8,
    title: 'North America Map Quiz - Play Mappil 3D Geography Game',
    description: 'Learn the countries of North America, including Central America and the Caribbean.',
    heading: 'North America Map Quiz',
    introEyebrow: 'North America Practice',
    intro:
      'Practice North America, Central America, and the Caribbean on the same rotating globe, then replay the region for faster recall.',
    backLink: {
      href: '/',
      label: 'Back To Home',
    },
    primaryCta: {
      href: '/map-game',
      label: 'Explore All Regions',
    },
    secondaryCta: {
      href: '/world-map-quiz',
      label: 'Practice The World Map',
    },
    gameProps: {
      continent: ContinentFilter.NORTH_AMERICA,
    },
    sections: [
      {
        title: 'What You Can Learn',
        cards: [
          {
            title: 'Continental And Island Nations',
            description: 'Cover mainland countries together with Caribbean sovereign states in one region-focused run.',
          },
          {
            title: 'Repeatable Sessions',
            description: 'Use the same rule set repeatedly instead of bouncing between static quizzes.',
          },
          {
            title: 'Difficulty Control',
            description: 'Keep the region fixed while changing how demanding the country set feels.',
          },
        ],
      },
      {
        title: 'Frequently Asked Questions',
        faqs: [
          {
            q: 'Does this quiz include the Caribbean islands?',
            a: 'Yes. The North America quiz includes sovereign island nations in the Caribbean.',
          },
        ],
      },
    ],
  },
  'south-america-map-quiz': {
    path: '/south-america-map-quiz',
    priority: 0.8,
    title: 'South America Map Quiz - Play Mappil 3D Geography Game',
    description: 'Identify the countries of South America on our interactive globe.',
    heading: 'South America Map Quiz',
    introEyebrow: 'South America Practice',
    intro:
      'Use Mappil’s globe to learn South American countries, repeat the same region, and work toward cleaner runs with fewer errors.',
    backLink: {
      href: '/',
      label: 'Back To Home',
    },
    primaryCta: {
      href: '/map-game',
      label: 'Explore All Regions',
    },
    secondaryCta: {
      href: '/world-map-quiz',
      label: 'Practice The World Map',
    },
    gameProps: {
      continent: ContinentFilter.SOUTH_AMERICA,
    },
    sections: [
      {
        title: 'Why Use The South America Quiz',
        cards: [
          {
            title: 'Focused Country Set',
            description: 'Work through the continent’s countries without the noise of a full-world run.',
          },
          {
            title: 'Interactive Rotation',
            description: 'Rotate the globe naturally instead of memorizing from a flat worksheet.',
          },
          {
            title: 'Useful Replay Loop',
            description: 'Track whether your next run is faster, cleaner, or higher scoring than the last.',
          },
        ],
      },
      {
        title: 'Frequently Asked Questions',
        faqs: [
          {
            q: 'How many countries are in South America?',
            a: 'There are generally 12 sovereign states forming South America which are featured in this quiz.',
          },
        ],
      },
    ],
  },
  'oceania-map-quiz': {
    path: '/oceania-map-quiz',
    priority: 0.8,
    title: 'Oceania Map Quiz - Play Mappil 3D Geography Game',
    description: 'Test your knowledge of Australia, New Zealand, and Pacific island nations.',
    heading: 'Oceania Map Quiz',
    introEyebrow: 'Oceania Practice',
    intro:
      'Practice Oceania on the 3D globe and use repeat runs to reinforce Australia, New Zealand, and Pacific island nations.',
    backLink: {
      href: '/',
      label: 'Back To Home',
    },
    primaryCta: {
      href: '/map-game',
      label: 'Explore All Regions',
    },
    secondaryCta: {
      href: '/world-map-quiz',
      label: 'Practice The World Map',
    },
    gameProps: {
      continent: ContinentFilter.OCEANIA,
    },
    sections: [
      {
        title: 'Why Practice Oceania Here',
        cards: [
          {
            title: 'Region-Specific Focus',
            description: 'Keep the practice set tight so smaller island nations are easier to revisit.',
          },
          {
            title: 'One Consistent Interface',
            description: 'Use the same controls and feedback as every other region in Mappil.',
          },
          {
            title: 'Replay With Better Targets',
            description: 'Repeat the region until you can identify countries more cleanly and with fewer misses.',
          },
        ],
      },
      {
        title: 'Frequently Asked Questions',
        faqs: [
          {
            q: 'What regions are in Oceania?',
            a: 'Oceania encompasses Australasia, Melanesia, Micronesia, and Polynesia.',
          },
        ],
      },
    ],
  },
};

export function isQuizRoute(value: string): value is QuizRouteId {
  return value in QUIZ_PAGE_CONTENT;
}

export function getQuizPageContent(quizId: QuizRouteId): LandingPageContent {
  return QUIZ_PAGE_CONTENT[quizId];
}

export const SITEMAP_CONTENT: LandingPageContent[] = [
  HOME_PAGE_CONTENT,
  MAP_GAME_PAGE_CONTENT,
  ...QUIZ_ROUTE_IDS.map((quizId) => QUIZ_PAGE_CONTENT[quizId]),
];
