import React from 'react';
import Button from './Button';
import './styles.css';

interface QuestionPopupProps {
    question: string;
    answers: { text: string, isCorrect: boolean }[];
    handleAnswer: (isCorrect: boolean) => void;
    closing: boolean;
    closePopup: () => void;
}

const QuestionPopup: React.FC<QuestionPopupProps> = ({ question, answers, handleAnswer, closing, closePopup }) => {
    return (
        <div className="overlayStyle">
            <div className={`popupStyle ${closing ? 'fadeOut slideOut' : 'fadeIn slideIn'}`}>
                <div className="top">
                    <button className="closeIcon" onClick={closePopup}>X</button>
                </div>
                <p className="questionText">
                    {question}
                </p>
                <div className="buttonGrid">
                    {answers.map((answer, index) => (
                        <Button
                            key={index}
                            className="answerButton"
                            onClick={() => handleAnswer(answer.isCorrect)}
                        >
                            {answer.text}
                        </Button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default QuestionPopup;
