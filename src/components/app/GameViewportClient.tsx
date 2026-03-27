'use client';

import dynamic from 'next/dynamic';
import {
  ContinentFilter,
  Difficulty,
  ExperienceMode,
  GameMode,
} from '../../types/game.types';

const PlayPage = dynamic(() => import('../../views/app/PlayPage'), {
  ssr: false,
});

interface GameViewportClientProps {
  continent?: ContinentFilter;
  difficulty?: Difficulty;
  gameMode?: GameMode;
  dailyChallenge?: boolean;
  experience: ExperienceMode;
}

const GameViewportClient = ({
  continent,
  difficulty,
  gameMode,
  dailyChallenge,
  experience,
}: GameViewportClientProps) => {
  return (
    <div className="fixed inset-0 z-10 bg-transparent">
      <PlayPage
        continent={continent}
        difficulty={difficulty}
        gameMode={gameMode}
        dailyChallenge={dailyChallenge}
        suppressSEO
        experience={experience}
      />
    </div>
  );
};

export default GameViewportClient;
