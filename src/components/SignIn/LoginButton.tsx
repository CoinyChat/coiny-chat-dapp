import { ButtonState } from '../../utils/enum-type-utils';
import { getIcon } from './bl';
import './SignIn.css';

export const LoginButton = ({
    text,
    disabled = false,
    buttonState,
    onClick,
}: {
    text: string;
    disabled?: boolean;
    buttonState: ButtonState;
    onClick: () => void;
}) => {
    return (
        <div className="content-data">
            <button
                id="sign-in-btn"
                disabled={disabled}
                className="signin-btn"
                onClick={onClick}
            >
                {text}
                <span
                    className={'loading-btn'.concat(
                        ' ',
                        getIcon(buttonState)
                            ? 'spinner-visible'
                            : 'spinner-invisible',
                    )}
                >
                    {getIcon(ButtonState.Loading)}
                </span>
            </button>
        </div>
    );
};
