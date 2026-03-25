import { ContinentFilter, Difficulty, GameMode } from '../types/game.types';
import type { LandingPageContent, LandingTile } from './landingContent';
import { REGION_TILES } from './landingContent';

export type OrganicRouteId =
  | 'geography-games'
  | 'world-map-game'
  | 'country-quiz'
  | 'learn-countries'
  | 'geography-game-for-kids'
  | 'classroom-geography-game'
  | 'daily-geography-challenge'
  | 'for-teachers'
  | 'for-students'
  | 'for-trivia-fans'
  | 'all-map-game-modes'
  | 'continent-quiz-collection'
  | 'memorize-countries-by-region'
  | 'learn-african-countries'
  | 'classroom-geography-warmups'
  | 'daily-geography-habits';

const SEARCH_TILES: LandingTile[] = [
  {
    href: '/geography-games',
    title: 'Geography Games',
    description: 'Start with a broader overview of how Mappil turns map study into repeat play.',
  },
  {
    href: '/world-map-game',
    title: 'World Map Game',
    description: 'Jump straight into whole-globe practice with the 3D world map setup.',
  },
  {
    href: '/country-quiz',
    title: 'Country Quiz',
    description: 'Use Mappil as a replayable country quiz rather than a one-shot worksheet.',
  },
  {
    href: '/learn-countries',
    title: 'Learn Countries',
    description: 'Find the study-first entry point for memorizing countries by region and difficulty.',
  },
];

const AUDIENCE_TILES: LandingTile[] = [
  {
    href: '/for-teachers',
    title: 'For Teachers',
    description: 'Warm-ups, region drills, and daily-class formats that fit a lesson quickly.',
  },
  {
    href: '/for-students',
    title: 'For Students',
    description: 'Short, repeatable geography revision sessions with clearer improvement targets.',
  },
  {
    href: '/for-trivia-fans',
    title: 'For Trivia Fans',
    description: 'Use daily boards, streaks, and friend challenges like a recurring map contest.',
  },
];

const RESOURCE_TILES: LandingTile[] = [
  {
    href: '/all-map-game-modes',
    title: 'All Map Game Modes',
    description: 'See the full set of free play, daily, friend, and continent practice options.',
  },
  {
    href: '/continent-quiz-collection',
    title: 'Continent Quiz Collection',
    description: 'Browse world and region-specific quiz pages from one reference page.',
  },
  {
    href: '/classroom-geography-warmups',
    title: 'Classroom Geography Warmups',
    description: 'Use short, structured routines that fit the opening minutes of a class.',
  },
  {
    href: '/daily-geography-habits',
    title: 'Daily Geography Habits',
    description: 'Build a lightweight routine around the daily challenge and cleaner replays.',
  },
];

const GUIDE_TILES: LandingTile[] = [
  {
    href: '/memorize-countries-by-region',
    title: 'Memorize Countries By Region',
    description: 'Use narrower region loops before expanding to the full world board.',
  },
  {
    href: '/learn-african-countries',
    title: 'Learn African Countries',
    description: 'Start with Africa if you want a focused region that rewards repeat runs.',
  },
  {
    href: '/daily-geography-habits',
    title: 'Daily Geography Habits',
    description: 'Turn one seeded challenge a day into a consistent study rhythm.',
  },
];

const ORGANIC_PAGE_CONTENT: Record<OrganicRouteId, LandingPageContent> = {
  'geography-games': {
    path: '/geography-games',
    priority: 0.82,
    title: 'Geography Games For Learning Countries | Mappil',
    description:
      'Discover geography games that help you learn countries with continent drills, daily challenges, and a live 3D globe.',
    heading: 'Geography Games That Keep The Map Live',
    introEyebrow: 'Search Intent',
    intro:
      'Mappil works as a geography game because the map stays playable while you study. You can jump from world practice into continent drills, repeat the same ruleset for cleaner runs, and use daily boards when you want a shared challenge.',
    backLink: {
      href: '/',
      label: 'Back To Home',
    },
    primaryCta: {
      href: '/map-game',
      label: 'Play The Map Game',
    },
    secondaryCta: {
      href: '/daily-geography-challenge',
      label: 'See The Daily Board',
    },
    gameProps: {
      continent: ContinentFilter.WORLD,
      difficulty: Difficulty.MEDIUM,
      gameMode: GameMode.QUICK,
    },
    sections: [
      {
        title: 'Why This Geography Game Works',
        cards: [
          {
            title: 'One Live Globe',
            description:
              'You are not bouncing between static quiz pages. The same 3D map powers world practice, continent drills, and challenge runs.',
          },
          {
            title: 'Useful Replay Goals',
            description:
              'Score breakdowns, streaks, and fewer-error targets make the next run feel purposeful instead of random.',
          },
          {
            title: 'Shared Boards',
            description:
              'Daily challenges and friend seeds give the game a reason to be revisited and compared, not just played once.',
          },
        ],
      },
      {
        title: 'Pick The Geography Entry Point That Fits',
        tiles: [...SEARCH_TILES, ...AUDIENCE_TILES],
      },
      {
        title: 'Reference And Guide Pages',
        tiles: [...RESOURCE_TILES, ...GUIDE_TILES],
      },
      {
        title: 'Frequently Asked Questions',
        faqs: [
          {
            q: 'Is Mappil a geography game or a quiz?',
            a: 'It works as both. The core product is a live 3D map game, but each run also behaves like a replayable geography quiz with scores, streaks, and cleaner-run targets.',
          },
          {
            q: 'Can I focus on one continent?',
            a: 'Yes. You can switch from the world board into region-focused practice for Africa, Asia, Europe, North America, South America, or Oceania.',
          },
        ],
      },
    ],
  },
  'world-map-game': {
    path: '/world-map-game',
    priority: 0.81,
    title: 'World Map Game Online | Mappil 3D Globe',
    description:
      'Play a world map game online with a rotating 3D globe, continent drills, score feedback, and daily challenge runs.',
    heading: 'World Map Game Online',
    introEyebrow: 'Whole-Globe Practice',
    intro:
      'This page is built for players searching specifically for a world map game. Mappil keeps the whole globe playable, lets you tighten the ruleset when you want shorter loops, and gives every run a clear replay reason.',
    backLink: {
      href: '/map-game',
      label: 'Back To Map Game',
    },
    primaryCta: {
      href: '/world-map-quiz',
      label: 'Play The World Board',
    },
    secondaryCta: {
      href: '/daily-geography-challenge',
      label: 'Try Today’s Challenge',
    },
    gameProps: {
      continent: ContinentFilter.WORLD,
      difficulty: Difficulty.MEDIUM,
      gameMode: GameMode.QUICK,
    },
    sections: [
      {
        title: 'What Makes The World Board Useful',
        cards: [
          {
            title: 'Broad Coverage',
            description:
              'Use one world map run to practice countries across every continent instead of memorizing flat screenshots.',
          },
          {
            title: 'Adjustable Pressure',
            description:
              'Switch between easier, denser, and longer runs without leaving the same globe or waiting for a new page load.',
          },
          {
            title: 'Better Return Visits',
            description:
              'The world board leads naturally into daily seeds, friend challenges, and continent follow-up practice.',
          },
        ],
      },
      {
        title: 'Where To Go After The World Board',
        tiles: [
          {
            href: '/continent-quiz-collection',
            title: 'Continent Quiz Collection',
            description: 'Drop from the whole world into narrower region practice when recall feels fuzzy.',
          },
          {
            href: '/all-map-game-modes',
            title: 'All Map Game Modes',
            description: 'Compare Quick Play, Full Game, daily boards, and friend challenge formats.',
          },
          {
            href: '/for-trivia-fans',
            title: 'For Trivia Fans',
            description: 'Use the same world knowledge in a more competitive challenge context.',
          },
        ],
      },
    ],
  },
  'country-quiz': {
    path: '/country-quiz',
    priority: 0.79,
    title: 'Country Quiz Online | Learn Countries With Mappil',
    description:
      'Take a country quiz online on a live 3D globe and replay the same ruleset to improve score, accuracy, and streak.',
    heading: 'Country Quiz With A Replay Loop',
    introEyebrow: 'Quiz Intent',
    intro:
      'If you want a country quiz rather than a one-time worksheet, Mappil gives you a stronger loop. You can run the same ruleset again, learn from misses, and move from world coverage into continent-specific drills.',
    backLink: {
      href: '/',
      label: 'Back To Home',
    },
    primaryCta: {
      href: '/world-map-quiz',
      label: 'Start The Country Quiz',
    },
    secondaryCta: {
      href: '/continent-quiz-collection',
      label: 'Browse Region Quizzes',
    },
    gameProps: {
      continent: ContinentFilter.WORLD,
      difficulty: Difficulty.EASY,
      gameMode: GameMode.FULL,
    },
    sections: [
      {
        title: 'Why Use This As A Country Quiz',
        cards: [
          {
            title: 'Interactive Recall',
            description:
              'You identify countries on the globe itself, which is closer to map recognition than a text-only answer sheet.',
          },
          {
            title: 'Error-Based Improvement',
            description:
              'The end-of-run feedback shows where the score came from and whether your next attempt should focus on accuracy or pace.',
          },
          {
            title: 'Region Follow-Ups',
            description:
              'When one part of the world is slowing you down, you can narrow the quiz without changing the product or control scheme.',
          },
        ],
      },
      {
        title: 'Country Quiz Paths',
        tiles: [
          {
            href: '/learn-countries',
            title: 'Learn Countries',
            description: 'Take the study-first route if your goal is memorization and revision rather than raw quiz score.',
          },
          {
            href: '/memorize-countries-by-region',
            title: 'Memorize By Region',
            description: 'Use smaller region drills first, then return to the full world board.',
          },
          ...REGION_TILES.slice(1, 4),
        ],
      },
    ],
  },
  'learn-countries': {
    path: '/learn-countries',
    priority: 0.78,
    title: 'How To Learn Countries On A Map | Mappil',
    description:
      'Use Mappil to learn countries on a map through short region drills, difficulty progression, and repeatable geography practice.',
    heading: 'Learn Countries With Shorter, Cleaner Runs',
    introEyebrow: 'Study Intent',
    intro:
      'Learning countries gets easier when the practice loop is narrow enough to repeat. Mappil lets you start with manageable region runs, raise the difficulty when names begin to stick, and return to the world board once recall is steadier.',
    backLink: {
      href: '/for-students',
      label: 'Back To Student Page',
    },
    primaryCta: {
      href: '/memorize-countries-by-region',
      label: 'Use The Region Method',
    },
    secondaryCta: {
      href: '/continent-quiz-collection',
      label: 'Open Region Collection',
    },
    gameProps: {
      continent: ContinentFilter.WORLD,
      difficulty: Difficulty.EASY,
      gameMode: GameMode.QUICK,
    },
    sections: [
      {
        title: 'A Better Country-Learning Loop',
        cards: [
          {
            title: 'Start Narrow',
            description:
              'Use one region first so you can build shape recognition before the whole globe becomes noisy.',
          },
          {
            title: 'Repeat Fast',
            description:
              'Quick Play and same-ruleset replays let you learn from mistakes while the previous run is still fresh.',
          },
          {
            title: 'Scale Up Deliberately',
            description:
              'Move from easier or regional practice into denser runs once you can clear the smaller board with fewer misses.',
          },
        ],
      },
      {
        title: 'Useful Study Guides',
        tiles: GUIDE_TILES,
      },
      {
        title: 'Where To Practice Next',
        tiles: REGION_TILES,
      },
    ],
  },
  'geography-game-for-kids': {
    path: '/geography-game-for-kids',
    priority: 0.72,
    title: 'Geography Game For Kids | Mappil',
    description:
      'Use Mappil as a kid-friendly geography game with easier starting modes, continent practice, and short replayable sessions.',
    heading: 'A Geography Game For Kids That Starts Gently',
    introEyebrow: 'Family And Classroom Use',
    intro:
      'Mappil can work well for younger players because the globe is visual, the early modes are lighter, and the sessions can stay short. Parents and teachers can start on easier region runs, then widen the board only when recognition improves.',
    backLink: {
      href: '/',
      label: 'Back To Home',
    },
    primaryCta: {
      href: '/classroom-geography-game',
      label: 'See The Classroom Setup',
    },
    secondaryCta: {
      href: '/for-teachers',
      label: 'Read Teacher Notes',
    },
    gameProps: {
      continent: ContinentFilter.WORLD,
      difficulty: Difficulty.EASY,
      gameMode: GameMode.QUICK,
    },
    sections: [
      {
        title: 'Why It Works For Younger Players',
        cards: [
          {
            title: 'Short Sessions',
            description:
              'Quick Play and continent runs make it easy to keep practice short enough for attention spans that do better with small wins.',
          },
          {
            title: 'Less Text, More Map',
            description:
              'The game is driven by globe interaction and visual recognition rather than long instructions or answer forms.',
          },
          {
            title: 'Progressive Difficulty',
            description:
              'Adults can start easy, stay on one region, and only widen the challenge when the basics are comfortable.',
          },
        ],
      },
      {
        title: 'Suggested Starting Pages',
        tiles: [
          {
            href: '/africa-map-quiz',
            title: 'Africa Map Quiz',
            description: 'A focused region is often easier to teach and repeat than the whole world at once.',
          },
          {
            href: '/europe-map-quiz',
            title: 'Europe Map Quiz',
            description: 'Use Europe for dense-country practice once the student is ready for tighter borders.',
          },
          {
            href: '/classroom-geography-warmups',
            title: 'Classroom Warmups',
            description: 'Use a simple, repeatable routine rather than one-off play sessions.',
          },
        ],
      },
    ],
  },
  'classroom-geography-game': {
    path: '/classroom-geography-game',
    priority: 0.76,
    title: 'Classroom Geography Game | Mappil',
    description:
      'Use Mappil as a classroom geography game for warm-ups, region drills, and daily map challenges with a live 3D globe.',
    heading: 'A Classroom Geography Game That Fits Real Lessons',
    introEyebrow: 'Teacher-Friendly',
    intro:
      'Mappil is most useful in class when it is treated as a fast teaching tool, not an open-ended distraction. Region filters, lighter starting modes, and daily boards make it easy to run a focused map warm-up or a short competitive recap.',
    backLink: {
      href: '/for-teachers',
      label: 'Back To Teachers',
    },
    primaryCta: {
      href: '/for-teachers',
      label: 'Open Teacher Guidance',
    },
    secondaryCta: {
      href: '/classroom-geography-warmups',
      label: 'Use A Warmup Routine',
    },
    gameProps: {
      continent: ContinentFilter.AFRICA,
      difficulty: Difficulty.EASY,
      gameMode: GameMode.QUICK,
    },
    sections: [
      {
        title: 'Three Simple Classroom Formats',
        cards: [
          {
            title: 'Warm-Up',
            description:
              'Start with an Easy Quick Play region run, ask the room to call countries out, then replay once for a cleaner finish.',
          },
          {
            title: 'Region Focus',
            description:
              'Use a continent page when a lesson is tied to one area, so the map practice matches the material immediately.',
          },
          {
            title: 'Daily Board',
            description:
              'Use the seeded daily challenge when you want the class working against one shared board and one shared set of rules.',
          },
        ],
      },
      {
        title: 'Recommended Teacher Pages',
        tiles: [
          {
            href: '/for-teachers',
            title: 'For Teachers',
            description: 'See suggested regions, difficulty levels, and classroom usage notes.',
          },
          {
            href: '/continent-quiz-collection',
            title: 'Continent Quiz Collection',
            description: 'Pick the region that matches the topic or age group.',
          },
          {
            href: '/daily-geography-challenge',
            title: 'Daily Geography Challenge',
            description: 'Turn the same seed into a recurring class ritual.',
          },
        ],
      },
    ],
  },
  'daily-geography-challenge': {
    path: '/daily-geography-challenge',
    priority: 0.77,
    title: 'Daily Geography Challenge | Mappil',
    description:
      'Play Mappil’s daily geography challenge and compare your best run on the same seeded world board each day.',
    heading: 'The Daily Geography Challenge',
    introEyebrow: 'Recurring Challenge',
    intro:
      'The daily challenge gives Mappil a repeatable reason to come back. Everyone gets the same seeded board for the day, retries still count against the same rules, and the daily leaderboard turns practice into a shared event.',
    backLink: {
      href: '/',
      label: 'Back To Home',
    },
    primaryCta: {
      href: '/play?daily=true',
      label: 'Play Today’s Challenge',
    },
    secondaryCta: {
      href: '/for-trivia-fans',
      label: 'See The Competitive Angle',
    },
    gameProps: {
      dailyChallenge: true,
    },
    sections: [
      {
        title: 'Why Daily Works',
        cards: [
          {
            title: 'Shared Seed',
            description:
              'Everyone is measured against the same setup, which makes the board more meaningful than isolated free-play scores.',
          },
          {
            title: 'Honest Replays',
            description:
              'Retries still happen on the same daily seed, so improvement is easier to compare and harder to hand-wave.',
          },
          {
            title: 'Return Habit',
            description:
              'A fresh challenge tomorrow gives the game a natural daily cadence instead of relying on one-off visits.',
          },
        ],
      },
      {
        title: 'Pages That Support The Daily Loop',
        tiles: [
          {
            href: '/daily-geography-habits',
            title: 'Daily Geography Habits',
            description: 'Use the daily board as part of a repeatable study or trivia routine.',
          },
          {
            href: '/for-trivia-fans',
            title: 'For Trivia Fans',
            description: 'Treat the daily board like a standing geography contest.',
          },
          {
            href: '/for-teachers',
            title: 'For Teachers',
            description: 'Use the daily board as a shared class warm-up or recap challenge.',
          },
        ],
      },
      {
        title: 'Frequently Asked Questions',
        faqs: [
          {
            q: 'Does everyone get the same daily challenge?',
            a: 'Yes. The daily board is seeded so the same challenge can be retried, compared, and discussed.',
          },
          {
            q: 'Can I replay it more than once?',
            a: 'Yes. You can retry the same daily seed and try to improve your score, error count, or pace before the next day rolls over.',
          },
        ],
      },
    ],
  },
  'for-teachers': {
    path: '/for-teachers',
    priority: 0.71,
    title: 'Mappil For Teachers | Geography Warm-Ups And Region Drills',
    description:
      'Use Mappil in class for geography warm-ups, region drills, daily challenges, and short replayable map practice.',
    heading: 'Mappil For Teachers',
    introEyebrow: 'Audience Page',
    intro:
      'Teachers are one of Mappil’s best-fit audiences because the game can be narrowed quickly, replayed in short bursts, and reused across lessons. The strongest setups are structured ones: a warm-up, a region drill, or a shared daily challenge.',
    backLink: {
      href: '/',
      label: 'Back To Home',
    },
    primaryCta: {
      href: '/classroom-geography-game',
      label: 'Use The Classroom Setup',
    },
    secondaryCta: {
      href: '/classroom-geography-warmups',
      label: 'Open Warmup Ideas',
    },
    gameProps: {
      continent: ContinentFilter.AFRICA,
      difficulty: Difficulty.EASY,
      gameMode: GameMode.QUICK,
    },
    sections: [
      {
        title: 'Ways Teachers Can Use Mappil',
        cards: [
          {
            title: 'Map Warm-Up',
            description:
              'Open one continent at an easier difficulty, run a short round, then replay once so students can immediately correct misses.',
          },
          {
            title: 'Region Quiz',
            description:
              'Pick the continent that matches the current topic and keep the whole class on the same map rather than splitting attention across materials.',
          },
          {
            title: 'Daily Class Challenge',
            description:
              'Use the seeded daily board when you want a recurring challenge format that is easy to compare week to week.',
          },
        ],
      },
      {
        title: 'How To Run It In Class',
        cards: [
          {
            title: '1. Set The Scope',
            description:
              'Choose a continent and difficulty before students begin so the task matches the lesson and time available.',
          },
          {
            title: '2. Keep It Short',
            description:
              'Use Quick Play or a single region for five-minute openings, recaps, or transition activities.',
          },
          {
            title: '3. Replay With A Goal',
            description:
              'Ask students to beat the first run through fewer errors, stronger streaks, or a higher class score.',
          },
        ],
      },
      {
        title: 'Ready-To-Share Teacher Blurbs',
        cards: [
          {
            title: 'Short Resource List Copy',
            description:
              'Mappil is a free 3D geography game for classroom warm-ups, region drills, and daily map challenges.',
          },
          {
            title: 'Newsletter Copy',
            description:
              'Use Mappil when you want a map activity that students can replay quickly, compare on a shared board, and narrow by continent without leaving the same game.',
          },
        ],
      },
      {
        title: 'Teacher Links',
        tiles: [
          {
            href: '/classroom-geography-game',
            title: 'Classroom Geography Game',
            description: 'See the lesson-friendly framing in a more search-oriented format.',
          },
          {
            href: '/daily-geography-challenge',
            title: 'Daily Geography Challenge',
            description: 'Use the same seeded board as a recurring class challenge.',
          },
          {
            href: '/continent-quiz-collection',
            title: 'Continent Quiz Collection',
            description: 'Choose a region that matches the topic or age group.',
          },
        ],
      },
    ],
  },
  'for-students': {
    path: '/for-students',
    priority: 0.7,
    title: 'Mappil For Students | Geography Revision And Country Practice',
    description:
      'Use Mappil for geography revision, country practice, and short repeatable study sessions on a 3D globe.',
    heading: 'Mappil For Students',
    introEyebrow: 'Audience Page',
    intro:
      'Students often arrive looking for a way to revise, not necessarily a game. Mappil helps because each run is short enough to repeat, the misses are visible, and continent pages make it easier to focus on one weak area before returning to the full world board.',
    backLink: {
      href: '/',
      label: 'Back To Home',
    },
    primaryCta: {
      href: '/learn-countries',
      label: 'Open The Study Path',
    },
    secondaryCta: {
      href: '/continent-quiz-collection',
      label: 'Browse Region Quizzes',
    },
    gameProps: {
      continent: ContinentFilter.WORLD,
      difficulty: Difficulty.MEDIUM,
      gameMode: GameMode.QUICK,
    },
    sections: [
      {
        title: 'Why Students Use It',
        cards: [
          {
            title: 'Short Revision Loops',
            description:
              'You can get one meaningful run in quickly, then replay the same ruleset while the mistakes still feel obvious.',
          },
          {
            title: 'Region-First Study',
            description:
              'If one area is weaker than the rest, switch to that continent instead of repeating the whole world too early.',
          },
          {
            title: 'Visible Improvement',
            description:
              'The score breakdown and streak feedback make it easier to tell whether the next run should focus on pace or accuracy.',
          },
        ],
      },
      {
        title: 'Student Study Routes',
        tiles: [
          {
            href: '/learn-countries',
            title: 'Learn Countries',
            description: 'Use the study-first overview for building a repeatable geography routine.',
          },
          {
            href: '/memorize-countries-by-region',
            title: 'Memorize Countries By Region',
            description: 'Start with smaller boards before you jump back to the full world map.',
          },
          {
            href: '/daily-geography-habits',
            title: 'Daily Geography Habits',
            description: 'Use the daily board to keep the revision streak alive between longer sessions.',
          },
        ],
      },
    ],
  },
  'for-trivia-fans': {
    path: '/for-trivia-fans',
    priority: 0.69,
    title: 'Mappil For Trivia Fans | Daily Geography Challenge And Friend Boards',
    description:
      'Use Mappil as a geography challenge game with daily boards, friend challenges, streaks, and leaderboard runs.',
    heading: 'Mappil For Trivia Fans',
    introEyebrow: 'Audience Page',
    intro:
      'Mappil is not only for classrooms. Trivia players can use it as a recurring geography challenge: one daily seed, one friend rematch link, and one leaderboard where a cleaner run matters more than lucky guessing.',
    backLink: {
      href: '/',
      label: 'Back To Home',
    },
    primaryCta: {
      href: '/daily-geography-challenge',
      label: 'Play Today’s Board',
    },
    secondaryCta: {
      href: '/all-map-game-modes',
      label: 'See The Competitive Modes',
    },
    gameProps: {
      dailyChallenge: true,
    },
    sections: [
      {
        title: 'Why Trivia Players Stick With It',
        cards: [
          {
            title: 'Same Board Competition',
            description:
              'The daily challenge gives everyone a common geography problem instead of forcing apples-to-oranges comparisons.',
          },
          {
            title: 'Friend Rematches',
            description:
              'Challenge links let one strong run turn into a same-seed, same-rules showdown.',
          },
          {
            title: 'Better Tie-Breaks',
            description:
              'Leaderboards reward score first, then fewer errors, faster time, and stronger streaks rather than pure speed alone.',
          },
        ],
      },
      {
        title: 'Competitive Surfaces',
        tiles: [
          {
            href: '/daily-geography-challenge',
            title: 'Daily Geography Challenge',
            description: 'Treat the daily board like a standing geography contest.',
          },
          {
            href: '/all-map-game-modes',
            title: 'All Map Game Modes',
            description: 'See which modes are best for daily competition versus free-play practice.',
          },
          {
            href: '/geography-games',
            title: 'Geography Games',
            description: 'Return to the broader product overview and related search surfaces.',
          },
        ],
      },
    ],
  },
  'all-map-game-modes': {
    path: '/all-map-game-modes',
    priority: 0.67,
    title: 'All Mappil Map Game Modes',
    description:
      'See every Mappil mode in one place, including Quick Play, Full Game, daily challenges, friend challenges, and continent practice.',
    heading: 'All Mappil Map Game Modes',
    introEyebrow: 'Reference Page',
    intro:
      'This is the durable reference page for people who want to know what Mappil actually includes. The same globe can be used for shorter free play, bigger full runs, seeded daily boards, friend rematches, and continent-specific practice.',
    backLink: {
      href: '/map-game',
      label: 'Back To Map Game',
    },
    primaryCta: {
      href: '/map-game',
      label: 'Play The Core Modes',
    },
    secondaryCta: {
      href: '/daily-geography-challenge',
      label: 'Open The Daily Mode',
    },
    gameProps: {
      continent: ContinentFilter.WORLD,
      difficulty: Difficulty.MEDIUM,
      gameMode: GameMode.QUICK,
    },
    sections: [
      {
        title: 'Core Modes',
        cards: [
          {
            title: 'Quick Play',
            description:
              'Shorter, faster loops for getting repetitions in without waiting through a long run.',
          },
          {
            title: 'Full Game',
            description:
              'Longer country coverage for players who want broader boards and higher scoring ceilings.',
          },
          {
            title: 'Daily Challenge',
            description:
              'A seeded board that everyone shares for the day, designed for repeat visits and fair comparisons.',
          },
          {
            title: 'Friend Challenge',
            description:
              'A shareable same-seed run you can send out after a strong performance or a clean clear.',
          },
          {
            title: 'Continent Practice',
            description:
              'Focused regional drills for Africa, Asia, Europe, North America, South America, and Oceania.',
          },
          {
            title: 'Difficulty Progression',
            description:
              'Easy, Medium, and Hard let you keep the same mode while scaling the map density up over time.',
          },
        ],
      },
      {
        title: 'Choose A Region',
        tiles: REGION_TILES,
      },
      {
        title: 'Choose An Audience Path',
        tiles: AUDIENCE_TILES,
      },
    ],
  },
  'continent-quiz-collection': {
    path: '/continent-quiz-collection',
    priority: 0.68,
    title: 'Continent Quiz Collection | Mappil',
    description:
      'Browse every Mappil continent quiz in one place, including Africa, Asia, Europe, North America, South America, Oceania, and the world board.',
    heading: 'Continent Quiz Collection',
    introEyebrow: 'Reference Page',
    intro:
      'This page groups the full world board with every continent quiz so players, teachers, and students can jump straight to the right region. Use it when you want to move from broad geography play into more targeted practice.',
    backLink: {
      href: '/',
      label: 'Back To Home',
    },
    primaryCta: {
      href: '/world-map-quiz',
      label: 'Start With The World Board',
    },
    secondaryCta: {
      href: '/memorize-countries-by-region',
      label: 'Use The Region Study Method',
    },
    gameProps: {
      continent: ContinentFilter.AFRICA,
      difficulty: Difficulty.MEDIUM,
      gameMode: GameMode.QUICK,
    },
    sections: [
      {
        title: 'All Region Pages',
        tiles: REGION_TILES,
      },
      {
        title: 'How To Choose A Region',
        cards: [
          {
            title: 'Start With Your Weakest Area',
            description:
              'If one continent consistently slows down the world board, isolate it first and repeat until the shapes feel more familiar.',
          },
          {
            title: 'Use Dense Regions Deliberately',
            description:
              'Europe is useful for tighter borders, while Africa and Asia are good for broader region-based memorization.',
          },
          {
            title: 'Return To The World Board',
            description:
              'Once the region clears feel more stable, move back to whole-world play and check whether the improvement carries over.',
          },
        ],
      },
      {
        title: 'Related Guides',
        tiles: GUIDE_TILES,
      },
    ],
  },
  'memorize-countries-by-region': {
    path: '/memorize-countries-by-region',
    priority: 0.66,
    title: 'How To Memorize Countries By Region | Mappil',
    description:
      'Memorize countries by region using focused continent drills, repeated replays, and gradual progression back to world map runs.',
    heading: 'Memorize Countries By Region',
    introEyebrow: 'Evergreen Guide',
    intro:
      'Trying to memorize every country at once usually creates noisy practice. A better route is to use one region at a time, repeat it until the misses narrow, then widen back out. Mappil is designed for exactly that loop.',
    backLink: {
      href: '/learn-countries',
      label: 'Back To Learn Countries',
    },
    primaryCta: {
      href: '/continent-quiz-collection',
      label: 'Open Region Practice',
    },
    secondaryCta: {
      href: '/world-map-quiz',
      label: 'Return To World Practice',
    },
    gameProps: {
      continent: ContinentFilter.AFRICA,
      difficulty: Difficulty.EASY,
      gameMode: GameMode.QUICK,
    },
    sections: [
      {
        title: 'A Simple Region Method',
        cards: [
          {
            title: 'Choose One Region',
            description:
              'Pick a continent that feels weak enough to justify dedicated practice rather than hoping it improves inside the whole-world board.',
          },
          {
            title: 'Replay While The Misses Are Fresh',
            description:
              'Run the same region again before moving on so the exact trouble spots are still easy to remember.',
          },
          {
            title: 'Widen Only After Cleaners Runs',
            description:
              'Move to Medium or Hard, or back to the world board, once the easier region run has stabilized.',
          },
        ],
      },
      {
        title: 'Recommended Region Starts',
        tiles: REGION_TILES.slice(1),
      },
    ],
  },
  'learn-african-countries': {
    path: '/learn-african-countries',
    priority: 0.65,
    title: 'Best Way To Learn African Countries On A Map | Mappil',
    description:
      'Learn African countries on a map with focused region practice, repeatable runs, and gradual difficulty increases in Mappil.',
    heading: 'Learn African Countries On A Map',
    introEyebrow: 'Evergreen Guide',
    intro:
      'Africa is one of the strongest starting regions for deliberate country study because it is large enough to matter but still focused enough to replay quickly. Mappil lets you keep Africa isolated while you build cleaner recognition.',
    backLink: {
      href: '/africa-map-quiz',
      label: 'Back To Africa Quiz',
    },
    primaryCta: {
      href: '/africa-map-quiz',
      label: 'Practice Africa',
    },
    secondaryCta: {
      href: '/continent-quiz-collection',
      label: 'See Other Regions',
    },
    gameProps: {
      continent: ContinentFilter.AFRICA,
      difficulty: Difficulty.EASY,
      gameMode: GameMode.QUICK,
    },
    sections: [
      {
        title: 'Why Africa Works Well For Practice',
        cards: [
          {
            title: 'Focused Board',
            description:
              'The region is specific enough that each replay teaches you something concrete instead of burying the mistake inside a full-world run.',
          },
          {
            title: 'Clear Improvement Targets',
            description:
              'After the first run, it becomes obvious which countries or subregions need another pass.',
          },
          {
            title: 'Natural Progression',
            description:
              'Once Africa starts to feel steadier, you can raise the difficulty or use the world board to see if the progress sticks.',
          },
        ],
      },
      {
        title: 'Where To Go Next',
        tiles: [
          {
            href: '/memorize-countries-by-region',
            title: 'Memorize Countries By Region',
            description: 'Use the broader method if you want to repeat the same approach on other continents.',
          },
          {
            href: '/world-map-quiz',
            title: 'World Map Quiz',
            description: 'Return to the whole globe once African recall feels more automatic.',
          },
          {
            href: '/for-teachers',
            title: 'For Teachers',
            description: 'Africa Easy Quick Play is also a good classroom starting setup.',
          },
        ],
      },
    ],
  },
  'classroom-geography-warmups': {
    path: '/classroom-geography-warmups',
    priority: 0.63,
    title: 'Fast Geography Warmups For Classrooms | Mappil',
    description:
      'Use Mappil for fast geography warmups in class with short region drills, replayable runs, and daily challenge ideas.',
    heading: 'Fast Geography Warmups For Classrooms',
    introEyebrow: 'Evergreen Guide',
    intro:
      'The best geography warmups are short, visible, and easy to repeat. Mappil fits that pattern when you choose a region, keep the session tight, and use a second run to reinforce the first.',
    backLink: {
      href: '/for-teachers',
      label: 'Back To Teachers',
    },
    primaryCta: {
      href: '/classroom-geography-game',
      label: 'Use Classroom Mode',
    },
    secondaryCta: {
      href: '/daily-geography-challenge',
      label: 'Try A Daily Warmup',
    },
    gameProps: {
      continent: ContinentFilter.EUROPE,
      difficulty: Difficulty.EASY,
      gameMode: GameMode.QUICK,
    },
    sections: [
      {
        title: 'A Five-Minute Warmup Pattern',
        cards: [
          {
            title: 'Minute 1: Set The Region',
            description:
              'Choose the continent or board that matches the lesson instead of defaulting to the whole world every time.',
          },
          {
            title: 'Minutes 2-4: Run Once',
            description:
              'Complete a short round and let the mistakes surface naturally in front of the class.',
          },
          {
            title: 'Minute 5: Replay Cleaner',
            description:
              'Run it again or focus on the misses so the warmup becomes a correction loop, not just a reveal.',
          },
        ],
      },
      {
        title: 'Teacher Reference Pages',
        tiles: [
          {
            href: '/for-teachers',
            title: 'For Teachers',
            description: 'Use the broader teacher page for practical classroom setups and shareable blurbs.',
          },
          {
            href: '/continent-quiz-collection',
            title: 'Continent Quiz Collection',
            description: 'Pick the best region for the class or topic.',
          },
          {
            href: '/daily-geography-challenge',
            title: 'Daily Geography Challenge',
            description: 'Use one seeded board when you want a recurring routine.',
          },
        ],
      },
    ],
  },
  'daily-geography-habits': {
    path: '/daily-geography-habits',
    priority: 0.64,
    title: 'Daily Geography Challenge Habits | Mappil',
    description:
      'Build a daily geography habit with Mappil’s seeded challenge, replay loops, and region follow-up practice.',
    heading: 'Daily Geography Habits That Actually Stick',
    introEyebrow: 'Evergreen Guide',
    intro:
      'A daily geography habit only compounds if the task is small enough to repeat. Mappil’s daily board works well because it gives you one shared seed, one honest replay reason, and one next step if today’s board exposes a weak region.',
    backLink: {
      href: '/daily-geography-challenge',
      label: 'Back To Daily Challenge',
    },
    primaryCta: {
      href: '/play?daily=true',
      label: 'Play Today’s Daily',
    },
    secondaryCta: {
      href: '/for-students',
      label: 'See The Student Angle',
    },
    gameProps: {
      dailyChallenge: true,
    },
    sections: [
      {
        title: 'A Better Daily Loop',
        cards: [
          {
            title: 'Do One Seeded Run',
            description:
              'Treat the daily board as the small non-negotiable part of the routine rather than trying to do everything every day.',
          },
          {
            title: 'Replay If The Misses Are Useful',
            description:
              'If today’s board exposed obvious points left on the table, run it back while the errors still feel clear.',
          },
          {
            title: 'Branch Into A Weak Region',
            description:
              'If the same continent keeps causing misses, spend the next session on that region instead of grinding the world board blindly.',
          },
        ],
      },
      {
        title: 'Habit Support Pages',
        tiles: [
          {
            href: '/for-students',
            title: 'For Students',
            description: 'Use the daily board as part of a consistent study rhythm.',
          },
          {
            href: '/for-trivia-fans',
            title: 'For Trivia Fans',
            description: 'Treat the daily board as a recurring competitive fixture.',
          },
          {
            href: '/continent-quiz-collection',
            title: 'Continent Quiz Collection',
            description: 'Follow a weak daily result with targeted region practice.',
          },
        ],
      },
    ],
  },
};

export const ORGANIC_ROUTE_IDS: OrganicRouteId[] = [
  'geography-games',
  'world-map-game',
  'country-quiz',
  'learn-countries',
  'geography-game-for-kids',
  'classroom-geography-game',
  'daily-geography-challenge',
  'for-teachers',
  'for-students',
  'for-trivia-fans',
  'all-map-game-modes',
  'continent-quiz-collection',
  'memorize-countries-by-region',
  'learn-african-countries',
  'classroom-geography-warmups',
  'daily-geography-habits',
];

export function isOrganicRoute(value: string): value is OrganicRouteId {
  return value in ORGANIC_PAGE_CONTENT;
}

export function getOrganicPageContent(routeId: OrganicRouteId): LandingPageContent {
  return ORGANIC_PAGE_CONTENT[routeId];
}

export const ORGANIC_SITEMAP_CONTENT: LandingPageContent[] = ORGANIC_ROUTE_IDS.map(
  (routeId) => ORGANIC_PAGE_CONTENT[routeId],
);
