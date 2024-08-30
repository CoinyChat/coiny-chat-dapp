import React, { useEffect } from 'react';
import './styles.css';

interface SeedPopupProps {
    seedPhrase: string;
    closePopup: () => void;
    showVerifyPopup: () => void;
    closing: boolean;
}

const SeedPopup: React.FC<SeedPopupProps> = ({ seedPhrase, closePopup, showVerifyPopup, closing }) => {
    useEffect(() => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdn.jsdelivr.net/npm/bootstrap-icons/font/bootstrap-icons.css';
        document.head.appendChild(link);

        return () => {
            document.head.removeChild(link);
        };
    }, []);

    const handleNextButtonClick = () => {
        showVerifyPopup();
    };

    return (
        <div className="overlayStyle">
            <div className={`popupStyle ${closing ? 'fadeOut slideOut' : 'fadeIn slideIn'}`}>
                <button className="closeIcon" onClick={closePopup}>X</button>
                <div className="seedText">
                    <p>Your wallet phrase is:</p>
                    <p>Save This Phrase in Any Safe Way</p>
                    <div className="seedWordsContainer">
                        {seedPhrase.split(' ').map((word, index) => (
                            <span key={index} className="seedWord">
                                {word}
                            </span>
                        ))}
                    </div>
                </div>
                <button className="closeButton" onClick={handleNextButtonClick}>
                    Next
                </button>
            </div>
        </div>
    );
};

export default SeedPopup;
