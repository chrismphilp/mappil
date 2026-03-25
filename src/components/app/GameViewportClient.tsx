'use client';

import dynamic from 'next/dynamic';
import { ContinentFilter, Difficulty, GameMode } from '../../types/game.types';

const PlayPage = dynamic(() => import('../../views/app/PlayPage'), {
  ssr: false,
});

interface GameViewportClientProps {
  continent?: ContinentFilter;
  difficulty?: Difficulty;
  gameMode?: GameMode;
}

const GameViewportClient = ({
  continent,
  difficulty,
  gameMode,
}: GameViewportClientProps) => {
  return (
    <div className="fixed inset-0 z-10 bg-transparent">
      <PlayPage
        continent={continent}
        difficulty={difficulty}
        gameMode={gameMode}
        suppressSEO
      />
    </div>
  );
};

export default GameViewportClient;
