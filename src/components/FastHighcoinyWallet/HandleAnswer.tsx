import React from 'react';

interface HandleAnswerProps {
    questionStage: number;
    setCongratulationsMessage: React.Dispatch<React.SetStateAction<string>>;
    setShowCongratulationsPopup: React.Dispatch<React.SetStateAction<boolean>>;
    setShowErrorPopup: React.Dispatch<React.SetStateAction<boolean>>;
    setQuestionStage: React.Dispatch<React.SetStateAction<number>>;
    setSeedPhrase: React.Dispatch<React.SetStateAction<string>>;
    getSeedPhrase: () => string;
    setShowSeedPopup: React.Dispatch<React.SetStateAction<boolean>>;
}

export const useHandleAnswer = ({
    questionStage,
    setCongratulationsMessage,
    setShowCongratulationsPopup,
    setShowErrorPopup,
    setQuestionStage,
    setSeedPhrase,
    getSeedPhrase,
    setShowSeedPopup,
}: HandleAnswerProps) => {

    const handleAnswer = (isCorrect: boolean) => {
        if (isCorrect) {
            if (questionStage === 1) {
                setCongratulationsMessage(
                    "Right! No one can help get your Secret Recovery Phrase back. " +
                    "Write it down, engrave it on metal, or keep it in multiple secret spots so you never lose it. " +
                    "If you lose it, it's gone forever."
                );
                setShowCongratulationsPopup(true);
            } else if (questionStage === 2) {
                setCongratulationsMessage(
                    "Correct! Sharing your Secret Recovery Phrase is never a good idea. " +
                    "Anyone claiming to need your Secret Recovery Phrase is lying to you. " +
                    "If you share it with them, they will steal your assets."
                );
                setShowCongratulationsPopup(true);
            }
        } else {
            setShowErrorPopup(true);
        }
    };

    const closeCongratulationsPopup = () => {
        setShowCongratulationsPopup(false);
        if (questionStage === 1) {
            setQuestionStage(2);
        } else if (questionStage === 2) {
            setSeedPhrase(getSeedPhrase() + '');
            setShowSeedPopup(true);
        }
    };

    return { handleAnswer, closeCongratulationsPopup };
};
