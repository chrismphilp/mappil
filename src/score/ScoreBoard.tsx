import {FC} from "react";

type ScoreContainerProps = {
    regionToFind: string | undefined;
    score: number;
    errors: number;
    streak: number;
};

const ScoreBoard: FC<ScoreContainerProps> = (
    {
        regionToFind,
        score,
        errors,
        streak
    }) => (
    <div className="fixed top-0 right-0 w-1/2 sm:w-1/3 md:w-1/4 h-1/6 md:h-1/5 p-2 lg:p-3">
        <div className="bg-white opacity95 w-full h-full p-2 font-mono text-xs lg:text-sm overflow-y-auto">
            <div className="w-full p-2">
                <div className="text-center">Region to Find</div>
                <div className="text-center border-2">{regionToFind}</div>
            </div>
            <div className="w-full p-1">Score: {score}</div>
            <div className="w-full p-1">Errors: {errors}</div>
            <div className="w-full p-1">Streak: {streak}</div>
        </div>
    </div>
);

export default ScoreBoard;
