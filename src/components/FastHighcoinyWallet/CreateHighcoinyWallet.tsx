import { useState } from 'react';
import Cookies from 'js-cookie';
import { getStorageKeyCreationMessage } from '@dm3-org/dm3-lib-crypto';
import { DEFAULT_NONCE } from '@dm3-org/dm3-lib-profile';
import { ethers, Wallet } from 'ethers';

export const CreateHighcoinyWallet = async () => {
    if (
        window.localStorage.getItem('isHighCoinyWalletCreated') == undefined ||
        window.localStorage.getItem('isHighCoinyWalletCreated') != 'true' ||
        window.localStorage.getItem('isHighCoinyWalletCreated') == 'false'
    ) {
        const url = 'https://eth-mainnet.g.alchemy.com/v2/alcht_wqE2RJeF5uGJuF5piGfWjFC0i9MVQn';

        const provider = new ethers.providers.JsonRpcProvider(url);
        const wallet = Wallet.createRandom(provider);

        const privKey = wallet.privateKey;
        console.log(wallet);
        console.log(wallet.publicKey);
        window.localStorage.setItem('HighcoinyWallet-publicKey', wallet.publicKey);
        console.log('address', wallet.address);
        window.localStorage.setItem('HighcoinyWallet-address', wallet.address);

        console.log(privKey);
        window.localStorage.setItem('HighcoinyWallet-privKey', wallet.privateKey);

        const signature = await wallet.signMessage(getStorageKeyCreationMessage(DEFAULT_NONCE, wallet.address));
        const words = wallet.mnemonic?.phrase;

        window.localStorage.setItem('HighcoinyWallet-seedphrase', words);
        window.localStorage.setItem('isHighCoinyWalletCreated', 'true');
    }
};

export const unRequestSignByHighCoinyWallet = () => {
    window.localStorage.setItem('isUserRequestSignByHighCoinyWallet', 'false');
};

export const requestSignByHighCoinyWallet = () => {
    window.localStorage.setItem('isUserRequestSignByHighCoinyWallet', 'true');
};

export const isUserRequestSignByHighCoinyWallet = () => {
    if (window.localStorage.getItem('isUserRequestSignByHighCoinyWallet') == 'true') {
        return true;
    }

    return false;
};

export const isHighCoinyWalletCreated = () => {
    if (window.localStorage.getItem('isHighCoinyWalletCreated') == 'true') {
        return true;
    }

    return false;
};

export const highCoinySignMessage = async (message: string) => {
    if (isHighCoinyWalletCreated()) {
        let wallet = new ethers.Wallet(window.localStorage.getItem('HighcoinyWallet-privKey') + '');
        return wallet.signMessage(message);
    } else throw Error('highCoinySignMessage failed: highcoiny Wallet no exist');
};

export const unsetCreateHighcoinyWallet = () => {
    window.localStorage.setItem('isHighCoinyWalletCreated', 'false');
};

export const getHighCoinyWalletAddress = () => {
    if (window.localStorage.getItem('HighcoinyWallet-address') !== null)
        return window.localStorage.getItem('HighcoinyWallet-address') as '0x${string}';
    else return undefined;
};

export const getSeedPhrase = () => {
    if (window.localStorage.getItem('isHighCoinyWalletCreated') == 'true') {
        return window.localStorage.getItem('HighcoinyWallet-seedphrase');
    }
    return '';
};

export const useVerifySeedPhrase = (seedPhrase: string, closePopup: () => void, showSeedPopup: () => void) => {
    const [inputPhrase, setInputPhrase] = useState<string[]>(Array(seedPhrase.split(' ').length).fill(''));
    const [error, setError] = useState<boolean>(false);

    const handleInputChange = (index: number, value: string) => {
        const newInputPhrase = [...inputPhrase];
        newInputPhrase[index] = value;
        setInputPhrase(newInputPhrase);

        if (error) {
            setError(false);
        }
    };

    const handleVerify = () => {
        const enteredPhrase = inputPhrase.join(' ').trim();
        if (enteredPhrase === seedPhrase) {

            Cookies.set('verifiedSeedPhrase', 'true', { expires: 365 });


            //alert('Seed phrase verified successfully!');


            closePopup();
        } else {
            setError(true);
        }
    };

    return {
        inputPhrase,
        error,
        handleInputChange,
        handleVerify,
    };
};