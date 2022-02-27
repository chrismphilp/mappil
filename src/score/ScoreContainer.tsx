import {FC, useState} from "react";

const ScoreContainer: FC = () => {

    const [score, setScore] = useState<number>(0);

    return (
        <div className="fixed top-0 right-0 w-1/4 h-1/3 h-50 p-5">
            <div className="bg-white opacity-25 w-full h-full p-5">
                <div className="w-full bg-slate-100 opacity-100 p-1">
                    Score: {score}
                </div>
            </div>
        </div>
    );
}

export default ScoreContainer;
