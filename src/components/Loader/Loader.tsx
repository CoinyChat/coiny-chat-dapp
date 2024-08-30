import './Loader.css';
import { useContext } from 'react';
import { ModalContext } from '../../context/ModalContext';

export const closeLoader = () => {
    const loader = document.getElementsByClassName('loading')[0] as HTMLElement;
    loader.setAttribute('style', 'display:none !important');
};

export const startLoader = () => {
    const loader = document.getElementsByClassName('loading')[0] as HTMLElement;
    loader.setAttribute('style', 'display:flex !important');
};

export function Loader() {
    const { loaderContent } = useContext(ModalContext);

    return (
        <div className="loading d-flex justify-content-center align-items-center">
            <div className="loader-animation">
                <div className="block"></div>
                <div className="block"></div>
                <div className="block"></div>
                <div className="block"></div>
            </div>
            <div className="loader-content">{loaderContent}</div>
        </div>
    );
}
