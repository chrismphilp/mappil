import {FC} from "react";

type ScoreContainerProps = {
    countryToFind: string;
    score: number;
    errors: number;
    streak: number;
};

const ScoreContainer: FC<ScoreContainerProps> = ({countryToFind, score, errors, streak}) => {

    return (
        <div className="fixed top-0 right-0 w-1/2 sm:w-1/3 md:w-1/4 h-1/6 md:h-1/5 p-2 lg:p-3">
            <div className="bg-white opacity95 w-full h-full p-5 font-mono text-xs lg:text-sm overflow-y-scroll">
                <div className="w-full p-2">
                    <div className="text-center">Country to Find</div>
                    <div className="text-center border-2">{countryToFind}</div>
                </div>
                <div className="w-full p-1">
                    Score: {score}
                </div>
                <div className="w-full p-1">
                    Errors: {errors}
                </div>
                <div className="w-full p-1">
                    Streak: {streak}
                </div>
            </div>
        </div>
    );
}

export default ScoreContainer;
