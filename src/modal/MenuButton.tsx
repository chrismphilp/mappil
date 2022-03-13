import {FC, useState} from "react";
import Modal from 'react-modal';
import MenuModal from "./MenuModal";
import {DifficultyEnum} from "../map/Difficulty.enum";

const MenuSVG: FC = () => (
    <svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 56" xmlSpace="preserve"
         fill="#e7e5d9">
        <path
            d="M28,0C12.561,0,0,12.561,0,28s12.561,28,28,28s28-12.561,28-28S43.439,0,28,0z M28,54C13.663,54,2,42.336,2,28 S13.663,2,28,2s26,11.664,26,26S42.337,54,28,54z"/>
        <path d="M40,16H16c-0.553,0-1,0.448-1,1s0.447,1,1,1h24c0.553,0,1-0.448,1-1S40.553,16,40,16z"/>
        <path d="M40,27H16c-0.553,0-1,0.448-1,1s0.447,1,1,1h24c0.553,0,1-0.448,1-1S40.553,27,40,27z"/>
        <path d="M40,38H16c-0.553,0-1,0.448-1,1s0.447,1,1,1h24c0.553,0,1-0.448,1-1S40.553,38,40,38z"/>
    </svg>
);

const customStyles = {
    content: {
        top: '15%',
        bottom: '15%',
        left: '25%',
        right: '25%',
    },
};

type MenuButtonProps = {
    resetGame: () => void;
    changeDifficulty: (difficulty: DifficultyEnum) => void;
    difficulty: DifficultyEnum;
};

const MenuButton: FC<MenuButtonProps> = ({resetGame, changeDifficulty, difficulty}) => {

    const [isOpen, setIsOpen] = useState(false);

    const openModal = () => {
        setIsOpen(true);
    };

    const closeModal = () => {
        setIsOpen(false);
    }

    return (
        <>
            <div className="fixed top-0 left-0 w-10 p-1 cursor-pointer" onClick={openModal}>
                <MenuSVG/>
            </div>
            <div id='modal'>
                <Modal isOpen={isOpen}
                       onRequestClose={closeModal}
                       shouldCloseOnEsc={true}
                       contentLabel="Example Modal"
                       style={customStyles}>
                    <MenuModal closeModal={closeModal}
                               resetGame={resetGame}
                               changeDifficulty={changeDifficulty}
                               difficulty={difficulty}/>
                </Modal>
            </div>
        </>
    );
}

export default MenuButton;
