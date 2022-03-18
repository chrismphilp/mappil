import {FC} from "react";
import Modal from 'react-modal';
import {DifficultyEnum} from "../map/Difficulty.enum";
import {MapType} from "../map/MapType.enum";
import SwitchModeButton from "./SwitchModeButton";

Modal.setAppElement('#root');

type MenuModalProps = {
    closeModal: () => void;
    resetGame: () => void;
    changeMap: (mapType: MapType) => void;
    map: MapType;
    changeDifficulty: (difficulty: DifficultyEnum) => void;
    difficulty: DifficultyEnum;
};

const MenuModal: FC<MenuModalProps> = (
    {
        closeModal,
        resetGame,
        changeMap,
        map,
        changeDifficulty,
        difficulty
    }) => {

    const reduceMap = () => {
        switch (map) {
            case MapType.MODERN_WORLD_COUNTRIES:
                changeMap(MapType.UK_ADMINISTRATIVE_REGIONS);
                break;
            case MapType.US_STATES:
                changeMap(MapType.MODERN_WORLD_COUNTRIES);
                break;
            case MapType.UK_ADMINISTRATIVE_REGIONS:
                changeMap(MapType.US_STATES);
        }
    }

    const increaseMap = () => {
        switch (map) {
            case MapType.MODERN_WORLD_COUNTRIES:
                changeMap(MapType.US_STATES);
                break;
            case MapType.US_STATES:
                changeMap(MapType.UK_ADMINISTRATIVE_REGIONS);
                break;
            case MapType.UK_ADMINISTRATIVE_REGIONS:
                changeMap(MapType.MODERN_WORLD_COUNTRIES);
        }
    }

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
            <div className="pt-10">
                <SwitchModeButton leftClick={reduceMap}
                                  rightClick={increaseMap}
                                  buttonText={`Map: ${map}`}/>
            </div>
            <div className="pt-5">
                <SwitchModeButton leftClick={reduceDifficulty}
                                  rightClick={increaseDifficulty}
                                  buttonText={`Difficulty: ${difficulty}`}/>
            </div>
            <div className="pt-5">
                <div className="w-full border-2 h-20 text-center align-middle">
                    <button className="w-full h-full hover:bg-sky-700 cursor-pointer" onClick={resetGame}>
                        Reset Game
                    </button>
                </div>
            </div>
        </div>
    );
}

export default MenuModal;
