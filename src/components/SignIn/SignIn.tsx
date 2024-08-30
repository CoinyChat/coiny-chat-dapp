/* eslint-disable max-len */
/* eslint-disable no-console */
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useContext } from 'react';
import { useAccount } from 'wagmi';
import { signInImage } from '../../assets/base64/home-image';
import { AuthContext } from '../../context/AuthContext';
import { DM3ConfigurationContext } from '../../context/DM3ConfigurationContext';
import { ButtonState } from '../../utils/enum-type-utils';
import DM3Logo from './DM3Logo';
import { LoginButton } from './LoginButton';
import './SignIn.css';
import { changeSignInButtonStyle } from './bl';

export function SignIn() {
    const { isConnected } = useAccount();

    const { cleanSignIn, isLoading } = useContext(AuthContext);

    const { dm3Configuration } = useContext(DM3ConfigurationContext);

    // open rainbow wallet modal function
    const { openConnectModal } = useConnectModal();

    const handleConnectWithWallet = () => {
        openConnectionModal();
    };

    const handleSignIn = async () => {
        cleanSignIn();
    };

    // method to open connection modal
    const openConnectionModal = () => {
        changeSignInButtonStyle(
            'sign-in-btn',
            'normal-btn',
            'normal-btn-hover',
        );
        openConnectModal && openConnectModal();
    };

    return (
        <div className="signin-container-type h-100">
            <div className="row m-0 p-0 h-100">
                <div
                    style={{
                        backgroundImage: `url(${dm3Configuration.signInImage ?? signInImage
                            })`,
                    }}
                    className="col-lg-7 col-md-7 col-sm-0 p-0 home-image-container background-container"
                ></div>
                <div
                    className="signin-data-container col-lg-5 col-md-5 col-sm-12 p-0 d-flex flex-column 
                justify-content-center background-container"
                >
                    <div className="d-flex justify-content-end rainbow-connect-btn">
                        {!isConnected && (
                            <div className="normal-btn wal-not-connected">
                                Wallet not connected
                            </div>
                        )}
                    </div>

                    <div className="d-flex flex-column height-fill content-data-container">
                        <div className="d-flex flex-column justify-content-center">
                            <DM3Logo />
                        </div>

                        <div className="mt-2 w-100">
                            <div className="encrypted-details font-weight-800 font-size-12 text-primary-color">
                                web3 messaging.
                                <p className="mb-4 encrypted-details font-weight-400 font-size-12 text-primary-color">
                                    encrypted. private. decentralized.
                                    interoperable.
                                </p>
                            </div>
                        </div>

                        {!isConnected ? (
                            <LoginButton
                                text="Connect with Wallet"
                                onClick={handleConnectWithWallet}
                                buttonState={ButtonState.Ideal}
                            />
                        ) : (
                            <LoginButton
                                disabled={isLoading}
                                text={isLoading ? 'Loading' : 'Sign In'}
                                onClick={handleSignIn}
                                buttonState={
                                    isLoading
                                        ? ButtonState.Loading
                                        : ButtonState.Ideal
                                }
                            />
                        )}

                        <div className="content-data text-start para-div mt-4">
                            <p className="text-primary-color details font-size-12">
                                An evolutionary messaging service ensuring secure and private
                                communication on the blockchain.
                            </p>
                            <p className="keys-content text-primary-color details font-size-12">
                                Join now as a beta tester and connect your Ethereum wallet to
                                easily sign in without the need for usernames or passwords. Our
                                innovative service utilizes your signature on the dm3 Protocol
                                to generate private keys, ensuring utmost privacy and
                                decentralization.
                                <br />
                                For Bitcoin and WBTC holders, our service will soon allow you to
                                prove your holdings across multiple networks.
                            </p>
                            <p className="tx-content text-primary-color details font-size-12">
                                No paid transaction will be executed.
                                <br></br>
                                Stay tuned for updates and be a part of the growing community.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
