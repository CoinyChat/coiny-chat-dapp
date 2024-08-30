/* eslint-disable max-len */
/* eslint-disable no-console */
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useContext, useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { signInImage } from '../../assets/base64/home-image';
import { AuthContext } from '../../context/AuthContext';
import { DM3ConfigurationContext } from '../../context/DM3ConfigurationContext';
import { ButtonState } from '../../utils/enum-type-utils';
import DM3Logo from './DM3Logo';
import { LoginButton } from './LoginButton';
import './SignIn.css';
import { StacksWallet, connectStacksWallet } from '../StacksWallet/StacksWallet';
import { changeSignInButtonStyle } from './bl';
import { CreateHighcoinyWallet, isHighCoinyWalletCreated, requestSignByHighCoinyWallet, unRequestSignByHighCoinyWallet, unsetCreateHighcoinyWallet } from '../FastHighcoinyWallet/CreateHighcoinyWallet';


import { connectStacksWalletandsign, isHighcoinyStacksWalletCreated, requestSignByHighcoinyStacksWallet, unRequestSignByHighcoinyStacksWallet } from '../StacksWallet/StacksWalletWorkaround';

export function SignIn() {
    // if `?sign-in-directly=true`, or for short `?sid=1`, is present in the URL, 
    // the user will be redirected to the wallet connection modal to connect the wallet and sign in directly
    // especially useful when redirecting from the landing page
    const signInDirectly = new URLSearchParams(location.search).get("sign-in-directly")?.toLowerCase() === "true"
        || new URLSearchParams(location.search).get("sid") === "1";
    const highCoinyWalletsignInDirectly = new URLSearchParams(location.search).get("highcoiny-sign-in-directly")?.toLowerCase() === "true"
        || new URLSearchParams(location.search).get("hsid") === "1";
    const highCoinyXverseWalletsignInDirectly = new URLSearchParams(location.search).get("highcoiny-xverse-sign-in-directly")?.toLowerCase() === "true"
        || new URLSearchParams(location.search).get("hxsid") === "1";
    const [shouldSignInDirectly] =
        useState<boolean>(signInDirectly);
    const [highCoinyWalletShouldSignInDirectly] =
        useState<boolean>(highCoinyWalletsignInDirectly);
    const [highCoinyStacksWalletShouldSignInDirectly] =
        useState<boolean>(highCoinyXverseWalletsignInDirectly);
    const { isConnected } = useAccount();

    const { cleanSignIn, isLoading } = useContext(AuthContext);
    const [highcoinyStacksoading, setHhighcoinyStacksLoading] = useState(false);
    const { dm3Configuration } = useContext(DM3ConfigurationContext);
    const [highcoinyLoading, setHighcoinyLoading] = useState(false);


    // open rainbow wallet modal function
    const { openConnectModal } = useConnectModal();

    const handleConnectWithWallet = () => {
        openConnectionModal();
        handleSignIn();
    };

    const handleSignIn = async () => {
        window.localStorage.setItem(
            'walletname',
            'ethereum ',
        );
        unRequestSignByHighcoinyStacksWallet();
        unRequestSignByHighCoinyWallet();
        cleanSignIn();
    };

    const handleSignInByHighCoinyWallet = async () => {
        window.localStorage.setItem(
            'walletname',
            'inbrowser',
        );
        setHighcoinyLoading(true);

        unRequestSignByHighcoinyStacksWallet();
        requestSignByHighCoinyWallet();
        if (!isHighCoinyWalletCreated()) CreateHighcoinyWallet();

        cleanSignIn();


    };
    const handleSignInByStacksWallet = async () => {
        window.localStorage.setItem(
            'walletname',
            'stacks',
        );
        setHhighcoinyStacksLoading(true);
        requestSignByHighcoinyStacksWallet();

        unRequestSignByHighCoinyWallet();
        cleanSignIn();
        //connectStacksWalletandsign();
    }
    // method to open connection modal
    const openConnectionModal = () => {
        changeSignInButtonStyle(
            'sign-in-btn',
            'normal-btn',
            'normal-btn-hover',
        );
        openConnectModal && openConnectModal();
    };
    // useEffect is needed to give some time to the components to be fully rendered first to avoid exceptions inside `changeSignInButtonStyle` function.
    useEffect(() => {
        if (shouldSignInDirectly) {
            handleConnectWithWallet();
        }
    }, [shouldSignInDirectly]);
    useEffect(() => {
        if (highCoinyWalletShouldSignInDirectly) {
            handleSignInByHighCoinyWallet();
        }
    }, [highCoinyWalletShouldSignInDirectly]);
    useEffect(() => {
        if (highCoinyStacksWalletShouldSignInDirectly) {
            handleSignInByStacksWallet();
        }
    }, [highCoinyStacksWalletShouldSignInDirectly]);

    return (
        <div className="signin-container-type h-100">
            <div className="row m-0 p-0 h-100 justify-content-center">
                <div
                    className="Popup"
                >
                    <div className="wallet-notifier">
                        {!isConnected && (
                            <div>
                                <div className="wallet-notifier-icon" title="Wallet not connected!">⚠️</div>
                                <div className="wallet-tooltip">Wallet not connected!</div>
                            </div>
                        )}
                    </div>

                    <div className="d-flex flex-column justify-content-center">
                        <DM3Logo />
                    </div>

                    <div className="mt-2 w-100">
                        <div className="encrypted-details font-weight-800 font-size-12 text-primary-color text-center">
                            web3 messaging.
                            <p className="mb-4 encrypted-details font-weight-400 font-size-12 text-primary-color">
                                encrypted. private. decentralized.
                                interoperable.
                            </p>
                        </div>
                    </div>

                    <LoginButton

                        text="Connect Stacks  Wallet & Sign(experimental)"
                        onClick={handleSignInByStacksWallet}
                        buttonState={
                            highcoinyStacksoading
                                ? ButtonState.Loading
                                : ButtonState.Ideal
                        }
                    />


                    <br></br>

                    <LoginButton
                        disabled={isLoading}
                        text={highcoinyLoading ? 'Loading' : 'Create in-browser Wallet ' + '\n' + ' (experimental)'}
                        onClick={handleSignInByHighCoinyWallet}
                        buttonState={
                            highcoinyLoading
                                ? ButtonState.Loading
                                : ButtonState.Ideal
                        }
                    />
                    <div className="content-data text-start para-div mt-4">
                        <p className="keys-content">
                            An evolutionary messaging service ensuring secure and private
                            communication on the blockchain.
                        </p>
                        <p className="keys-content">
                            Join now as a beta tester and connect your Ethereum wallet to
                            easily sign in without the need for usernames or passwords. Our
                            innovative service utilizes your signature on the dm3 Protocol
                            to generate private keys, ensuring utmost privacy and
                            decentralization.

                            <br />
                            For Bitcoin and WBTC holders, our service will soon allow you to
                            prove your holdings across multiple networks.
                        </p>
                        <p className="keys-content fw-bold">
                            No paid transaction will be executed.
                            <br></br>
                            <a href='/?hsid=1'>  Stay tuned for updates and be a part of the growing community.</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
