import {FC} from "react";
import Modal from 'react-modal';
import {DifficultyEnum} from "../map/Difficulty.enum";

Modal.setAppElement('#root');

type MenuModalProps = {
    closeModal: () => void;
    resetGame: () => void;
    changeDifficulty: (difficulty: DifficultyEnum) => void;
    difficulty: DifficultyEnum;
};

const MenuModal: FC<MenuModalProps> = ({closeModal, resetGame, changeDifficulty, difficulty}) => {

    const reduceDifficulty = () => {
        switch (difficulty) {
            case DifficultyEnum.EASY:
                changeDifficulty(DifficultyEnum.HARD);
                break;
            case DifficultyEnum.MEDIUM:
                changeDifficulty(DifficultyEnum.EASY);
                break;
            case DifficultyEnum.HARD:
                changeDifficulty(DifficultyEnum.MEDIUM);
        }
    }

    const increaseDifficulty = () => {
        switch (difficulty) {
            case DifficultyEnum.EASY:
                changeDifficulty(DifficultyEnum.MEDIUM);
                break;
            case DifficultyEnum.MEDIUM:
                changeDifficulty(DifficultyEnum.HARD);
                break;
            case DifficultyEnum.HARD:
                changeDifficulty(DifficultyEnum.EASY);
        }
    }

    return (
        <div className="font-mono">
            <button className="float-right border-2 rounded-full cursor-pointer" onClick={closeModal}>x</button>
            <br/><br/>
            <div className="flex border-2 h-20">
                <button className="flex-1 hover:bg-sky-700 cursor-pointer" onClick={reduceDifficulty}>
                    &lt;
                </button>
                <button className="flex-auto w-64 h-full text-center align-middle"
                        onClick={resetGame}>
                    Difficulty: {difficulty}
                </button>
                <button className="flex-1 hover:bg-sky-700 cursor-pointer" onClick={increaseDifficulty}>
                    &gt;
                </button>
            </div>
            <br/>
            <div className="w-full border-2 h-20 text-center align-middle">
                <button className="w-full h-full hover:bg-sky-700 cursor-pointer" onClick={resetGame}>
                    Reset Game
                </button>
            </div>
        </div>
    );
}

export default MenuModal;
