import React from 'react';

interface ClosePopupsProps {
    setShowInfoPopup: React.Dispatch<React.SetStateAction<boolean>>;
    setShowSeedPopup: React.Dispatch<React.SetStateAction<boolean>>;
    setShowCongratulationsPopup: React.Dispatch<React.SetStateAction<boolean>>;
    setShowErrorPopup: React.Dispatch<React.SetStateAction<boolean>>;
    setShowVerifyPopup: React.Dispatch<React.SetStateAction<boolean>>;
    setQuestionStage: React.Dispatch<React.SetStateAction<number>>;
    setClosing: React.Dispatch<React.SetStateAction<boolean>>;
}

export const useClosePopups = ({
    setShowInfoPopup,
    setShowSeedPopup,
    setShowCongratulationsPopup,
    setShowErrorPopup,
    setShowVerifyPopup,
    setQuestionStage,
    setClosing,
}: ClosePopupsProps) => {

    const closeInfoPopup = () => {
        setClosing(true);
        setTimeout(() => {
            setShowInfoPopup(false);
            setShowSeedPopup(false);
            setShowCongratulationsPopup(false);
            setShowErrorPopup(false);
            setShowVerifyPopup(false);
            setQuestionStage(0);
            setClosing(false);
        }, 300);
    };

    return { closeInfoPopup };
};
