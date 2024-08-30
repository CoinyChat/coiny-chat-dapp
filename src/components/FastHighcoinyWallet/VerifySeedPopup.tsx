import React, { useState, useEffect, useRef } from 'react';
import { useVerifySeedPhrase } from './CreateHighcoinyWallet';
import './styles.css';

interface VerifySeedPopupProps {
    seedPhrase: string;
    closePopup: () => void;
    showSeedPopup: () => void;
    closing: boolean;
}

const VerifySeedPopup: React.FC<VerifySeedPopupProps> = ({ seedPhrase, closePopup, showSeedPopup, closing }) => {
    const { inputPhrase, error, handleInputChange, handleVerify } = useVerifySeedPhrase(
        seedPhrase,
        closePopup,
        showSeedPopup
    );
    const spanRef = useRef<HTMLSpanElement | null>(null);

    const calculateWidth = (text: string) => {
        if (spanRef.current) {
            spanRef.current.textContent = text || ' ';
            return spanRef.current.offsetWidth + 30;
        }
        return 50;
    };

    useEffect(() => {
        inputPhrase.forEach((_, index) => {
            const inputElement = document.getElementById(`input-${index}`);
            if (inputElement) {
                inputElement.style.width = `${calculateWidth(inputPhrase[index])}px`;
            }
        });
    }, [inputPhrase]);

    return (
        <div className="overlayStyle">
            <div className={`popupStyle ${closing ? 'fadeOut slideOut' : 'fadeIn slideIn'}`}>
                <button className="closeIcon" onClick={closePopup}>X</button>
                <div className="seedText">
                    <p>Please enter your seed phrase in the correct order:</p>
                    <div className="seedWordsContainer">
                        {inputPhrase.map((word, index) => (
                            <input
                                key={index}
                                id={`input-${index}`}
                                type="text"
                                className="seedWordInput"
                                value={word}
                                onChange={(e) => handleInputChange(index, e.target.value)}
                            />
                        ))}
                    </div>
                    {error && <p className="errorText">Incorrect seed phrase, please try again.</p>}
                </div>
                <div className="buttonGrid">
                    <button className="actionButton" onClick={handleVerify}>
                        Verify
                    </button>
                    <button className="closeButton" onClick={showSeedPopup}>
                        Back
                    </button>
                </div>
                <span ref={spanRef} className="hiddenSpan"></span>
            </div>
        </div>
    );
};

export default VerifySeedPopup;
