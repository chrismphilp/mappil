import {FC} from "react";

type ScoreContainerProps = {
    countryToFind: string;
    score: number;
    errors: number;
    streak: number;
};

const ScoreContainer: FC<ScoreContainerProps> = ({countryToFind, score, errors, streak}) => {

    return (
        <div className="fixed top-0 right-0 w-1/4 h-1/3 h-50 p-5">
            <div className="bg-white opacity-25 w-full h-full p-5">
                <div className="w-full bg-slate-100 opacity-100 p-1">
                    Score: {score}
                </div>
                <div className="w-full bg-slate-100 opacity-100 p-1">
                    Errors: {errors}
                </div>
                <div className="w-full bg-slate-100 opacity-100 p-1">
                    Streak: {streak}
                </div>
                <div className="w-full text-center bg-red bg-opacity-100 pt-5">Country to Find</div>
                <div className="w-full text-center bg-white opacity-100 pt-5">{countryToFind}</div>
            </div>
        </div>
    );
}

export default ScoreContainer;
