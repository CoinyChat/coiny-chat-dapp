import { ethers } from 'ethers';
import Wallet, { RpcErrorCode } from 'sats-connect';
import logo from "../../assets/images/hicoinylogo.jpg";
import { verifyMessageSignatureRsv } from '@stacks/encryption';

import * as bip39 from 'bip39';

import React, { useState } from 'react';
import { AppConfig, UserSession, showConnect, openSignatureRequestPopup } from '@stacks/connect';
export const userSession = new UserSession({
    appConfig: new AppConfig(['store_write']),
});

export const connectStacksWallet = async () => {

    await showConnect({
        appDetails: {
            name: 'My Stacks App',
            icon: logo,
        },
        redirectTo: '/',
        onFinish: async ({ userSession }) => {
            const userData = await userSession.loadUserData();
            console.log('stacks address ', userData.profile.stxAddress.mainnet);
        },
        onCancel: () => {
            console.log('disconnected');
        },
    });
};
export const signMessage = async (message: string) => {
    if (userSession.isUserSignedIn()) {
        const address = userSession.loadUserData().profile.stacksAddress;
        try {
            // Assuming the Leather wallet exposes a method to sign messages
            const signature = await (window as any).btc.request(
                'signMessage',
                { message },
            );
            return (signature);
        } catch (error) {
            console.error('Error signing message:', error);
        }
    } else {
        alert('Please connect your wallet first.');
    }
};
export const StacksWallet = () => {
    const [message, setMessage] = useState<string>('');
    const [signature, setSignature] = useState<string>('');
    const userSession = new UserSession({
        appConfig: new AppConfig(['store_write']),
    });
    const [stacksAddress, setStacksAddress] = useState('');
    const [signedMessage, setSignedMessage] = useState('');

    const connectStacksWallet = async () => {
        await showConnect({
            appDetails: {
                name: 'My Stacks App',
                icon: logo,
            },
            redirectTo: '/',
            onFinish: async ({ userSession }) => {
                const userData = await userSession.loadUserData();
                console.log('stacks address ', userData.profile.stxAddress.mainnet);
                setStacksAddress(userData.profile.stxAddress.mainnet);


            },
            onCancel: () => {
                console.log('disconnected');
            },
        });

    };
    const handleSignMessage = async () => {
        if (!stacksAddress) {
            console.error('Please connect your wallet first.');
            return;
        }

        try {
            const result = await openSignatureRequestPopup({
                message: message,
                appDetails: {
                    name: 'My Stacks App',
                    icon: logo,
                },
                onFinish: ({ signature, publicKey }) => {
                    console.log('Signature of the message:', signature);
                    setSignedMessage(signature);

                    // // Verify the signature
                    // const verified = verifyMessageSignatureRsv({ message, publicKey, signature });
                    // if (verified) {
                    //     console.log('Signature verified successfully!');
                    // } else {
                    //     console.log('Signature verification failed.');
                    // }
                },
            });
        } catch (error) {
            console.error('Error signing message:', error);
        }
    };
    const signMessage = async () => {
        if (userSession.isUserSignedIn()) {

            try {
                // Assuming the Leather wallet exposes a method to sign messages
                const signature = await (window as any).btc.request(
                    'signMessage',
                    { message },
                );
                setSignature(signature);
            } catch (error) {
                console.error('Error signing message:', error);
            }
        } else {
            alert('Please connect your wallet first.');
        }
    };
    return (
        <div>
            <button onClick={connectStacksWallet}>Connect Leather Wallet</button>
            <input
                type="text"
                placeholder="Enter message to sign"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
            />
            <button onClick={handleSignMessage}>Sign Message</button>
            {signature && <div>Signature: {signature}</div>}
        </div>
    );
};