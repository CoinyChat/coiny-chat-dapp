import React from 'react';
import Button from './Button';
import './styles.css';

interface InfoPopupProps {
    closePopup: () => void;
    showSeedPrase: () => void;
    closing: boolean;
}

const InfoPopup: React.FC<InfoPopupProps> = ({ closePopup, showSeedPrase, closing }) => {
    return (
        <div className="overlayStyle">
            <div className={`popupStyle ${closing ? 'fadeOut slideOut' : 'fadeIn slideIn'}`}>
                <div className="infoText">
                    It's recommended to save HighCoiny Wallet private key in a safe place
                </div>
                <div className="buttonGrid">
                    <Button className="actionButton" onClick={showSeedPrase}>
                        Show Phrase
                    </Button>
                    <Button className="closeButton" onClick={closePopup}>
                        Close
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default InfoPopup;
