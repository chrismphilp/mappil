import {FC} from "react";

type SwitchModeButtonProps = {
    leftClick: () => void;
    rightClick: () => void;
    buttonText: string;
};

const SwitchModeButton: FC<SwitchModeButtonProps> = ({leftClick, rightClick, buttonText}) => (
    <div className="flex border-2 h-20">
        <button className="flex-1 hover:bg-sky-700 cursor-pointer" onClick={leftClick}>&lt;</button>
        <div className="flex flex-auto w-64 h-full items-center justify-center">{buttonText}</div>
        <button className="flex-1 hover:bg-sky-700 cursor-pointer" onClick={rightClick}>&gt;</button>
    </div>
);

export default SwitchModeButton;
