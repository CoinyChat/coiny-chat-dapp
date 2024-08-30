import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import {
    getSeedPhrase as fetchSeedPhrase,
    isHighCoinyWalletCreated,
    isUserRequestSignByHighCoinyWallet,
} from './CreateHighcoinyWallet';
import InfoPopup from './InfoPopup';
import QuestionPopup from './QuestionPopup';
import CongratulationsPopup from './CongratulationsPopup';
import ErrorPopup from './ErrorPopup';
import SeedPopup from './SeedPopup';
import VerifySeedPopup from './VerifySeedPopup';
import { useHandleAnswer } from './HandleAnswer';
import { useClosePopups } from './ClosePopups';
import './styles.css';

export default function AlarmPrivateKey() {
    const [seedPhrase, setSeedPhrase] = useState<string>('');
    const [showInfoPopup, setShowInfoPopup] = useState<boolean>(false);
    const [showSeedPopup, setShowSeedPopup] = useState<boolean>(false);
    const [showVerifyPopup, setShowVerifyPopup] = useState<boolean>(false);
    const [closing, setClosing] = useState<boolean>(false);
    const [questionStage, setQuestionStage] = useState<number>(0);
    const [showCongratulationsPopup, setShowCongratulationsPopup] = useState<boolean>(false);
    const [showErrorPopup, setShowErrorPopup] = useState<boolean>(false);
    const [congratulationsMessage, setCongratulationsMessage] = useState<string>('');
    const [verified, setVerified] = useState<boolean>(false);

    useEffect(() => {
        const isVerified = Cookies.get('verifiedSeedPhrase') === 'true';
        setVerified(isVerified);
    }, []);

    const getSeedPhraseSafe = () => fetchSeedPhrase() ?? '';

    const { handleAnswer, closeCongratulationsPopup } = useHandleAnswer({
        questionStage,
        setCongratulationsMessage,
        setShowCongratulationsPopup,
        setShowErrorPopup,
        setQuestionStage,
        setSeedPhrase,
        getSeedPhrase: getSeedPhraseSafe,
        setShowSeedPopup,
    });

    const { closeInfoPopup } = useClosePopups({
        setShowInfoPopup,
        setShowSeedPopup,
        setShowCongratulationsPopup,
        setShowErrorPopup,
        setShowVerifyPopup,
        setQuestionStage,
        setClosing,
    });

    const showSeedPrase = () => {
        setQuestionStage(1);
        setShowInfoPopup(false);
    };

    const handleShowVerifyPopup = () => {
        setShowSeedPopup(false);
        setShowVerifyPopup(true);
    };

    const handleShowSeedPopup = () => {
        setShowVerifyPopup(false);
        setShowSeedPopup(true);
    };

    const handleVerificationComplete = () => {
        setVerified(true);
        setShowVerifyPopup(false);
        setQuestionStage(3);
    };

    return (
        <div>
            {isHighCoinyWalletCreated() && isUserRequestSignByHighCoinyWallet() && !verified && (
                <button className="warningButton" onClick={() => setShowInfoPopup(true)}>
                    Warning!!
                </button>
            )}

            {showInfoPopup && (
                <InfoPopup closePopup={closeInfoPopup} showSeedPrase={showSeedPrase} closing={closing} />
            )}

            {questionStage === 1 && (
                <QuestionPopup
                    question="If you lose your Secret Recovery Phrase, HighCoiny..."
                    answers={[
                        { text: 'They can retrieve it for you', isCorrect: false },
                        { text: 'No one can get it back', isCorrect: true },
                    ]}
                    handleAnswer={handleAnswer}
                    closing={closing}
                    closePopup={closeInfoPopup}
                />
            )}

            {questionStage === 2 && (
                <QuestionPopup
                    question="If anyone, even a support agent, asks for your Secret Recovery Phrase..."
                    answers={[
                        { text: 'You are being robbed', isCorrect: true },
                        { text: 'You give it to him', isCorrect: false },
                    ]}
                    handleAnswer={handleAnswer}
                    closing={closing}
                    closePopup={closeInfoPopup}
                />
            )}

            {showCongratulationsPopup && (
                <CongratulationsPopup
                    message={congratulationsMessage}
                    closePopup={closeCongratulationsPopup}
                    closing={closing}
                />
            )}

            {showErrorPopup && (
                <ErrorPopup
                    message="You have made a mistake and must contact support"
                    closePopup={closeInfoPopup}
                    closing={closing}
                />
            )}

            {showSeedPopup && (
                <SeedPopup
                    seedPhrase={seedPhrase}
                    closePopup={closeInfoPopup}
                    showVerifyPopup={handleShowVerifyPopup}
                    closing={closing}
                />
            )}

            {showVerifyPopup && (
                <VerifySeedPopup
                    seedPhrase={seedPhrase}
                    closePopup={handleVerificationComplete}
                    showSeedPopup={handleShowSeedPopup}
                    closing={closing}
                />
            )}
        </div>
    );
}
