import React from 'react';
import Button from './Button';
import './styles.css';

interface CongratulationsPopupProps {
    message: string;
    closePopup: () => void;
    closing: boolean;
}

const CongratulationsPopup: React.FC<CongratulationsPopupProps> = ({ message, closePopup, closing }) => {
    return (
        <div className="overlayStyle">
            <div className={`popupStyle ${closing ? 'fadeOut slideOut' : 'fadeIn slideIn'}`}>
                <button className="closeIcon" onClick={closePopup}>X</button>
                <p className="congratulationsText">
                    {message}
                </p>
                <Button className="closeButton" onClick={closePopup}>
                    Continue
                </Button>
            </div>
        </div>
    );
};

export default CongratulationsPopup;
