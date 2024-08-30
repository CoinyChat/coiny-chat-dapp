import React from 'react';
import Button from './Button';
import './styles.css';

interface ErrorPopupProps {
    message: string;
    closePopup: () => void;
    closing: boolean;
}

const ErrorPopup: React.FC<ErrorPopupProps> = ({ message, closePopup, closing }) => {
    return (
        <div className="overlayStyle">
            <div className={`popupStyle ${closing ? 'fadeOut slideOut' : 'fadeIn slideIn'}`}>
                <button className="closeIcon" onClick={closePopup}>X</button>
                <p className="errorText">
                    {message}
                </p>
                <Button className="closeButton" onClick={closePopup}>
                    Close
                </Button>
            </div>
        </div>
    );
};

export default ErrorPopup;
