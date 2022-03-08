import {FC} from "react";
import Modal from 'react-modal';

Modal.setAppElement('#root');

const MenuModal: FC = () => {
    return (
        <>
            <button>close</button>
            <div>I am a modal</div>
            <form>
                <input/>
                <button>tab navigation</button>
                <button>stays</button>
                <button>inside</button>
                <button>the modal</button>
            </form>
        </>
    );
}

export default MenuModal;
