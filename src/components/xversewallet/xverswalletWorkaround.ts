import Wallet, { AddressPurpose } from 'sats-connect';

import { ethers } from 'ethers';

import * as bip39 from 'bip39';
import {
    getXverseStorageKeyCreationMessage,
    xverseSignMessage,
} from './xverswallet';

export const xverseConnectWorkround = async (purpose: AddressPurpose) => {
    try {
        let currentPurposes = [purpose];
        if (purpose == null)
            currentPurposes = [
                AddressPurpose.Payment,
                AddressPurpose.Ordinals,
                AddressPurpose.Stacks,
            ];
        const data = await Wallet.request('getAccounts', {
            purposes: currentPurposes,
            message: 'Please allow access to your wallet addresses.',
        });

        const stacksAddress = (data as any).result[0].address + '';
        window.localStorage.setItem('stack-address', stacksAddress);
        console.log('stack-address' + stacksAddress);
        const signatureStacksAddress = await xverseSignMessage(
            stacksAddress,
            stacksAddress,
        );
        const mnemonicPhrase = generateMnemonicFromToken(
            'highcoiny' + signatureStacksAddress,
        );

        console.log('Generated Mnemonic Phrase:', mnemonicPhrase);
        const wallet = generateWalletFromMnemonic(mnemonicPhrase);
        console.log(`Address: ${wallet.address}`);
        /////////////////// save in localstorage////////////

        window.localStorage.setItem(
            'HighcoinyXverseWallet-publicKey',
            wallet.publicKey,
        );

        window.localStorage.setItem(
            'HighcoinyXverseWallet-address',
            wallet.address,
        );

        window.localStorage.setItem(
            'HighcoinyXverseWallet-privKey',
            wallet.privateKey,
        );

        window.localStorage.setItem(
            'HighcoinyXverseWallet-seedphrase',
            mnemonicPhrase,
        );
        window.localStorage.setItem('isHighcoinyXverseWalletCreated', 'true');
        /////////////////////////////////////
        return wallet.address;
    } catch (error) {
        console.error(
            'Error highcoinyXverseWallet connecting to wallet:',
            error.message,
        );
    }
};
export const getStackxverseAddress = () => {
    return window.localStorage.getItem('stack-address');
};
export const unRequestSignByHighcoinyXverseWallet = () => {
    window.localStorage.setItem(
        'isUserRequestSignByHighcoinyXverseWallet',
        'false',
    );
};

export const requestSignByHighcoinyXverseWallet = () => {
    window.localStorage.setItem(
        'isUserRequestSignByHighcoinyXverseWallet',
        'true',
    );
};

export const isUserRequestSignByHighcoinyXverseWallet = () => {
    if (
        window.localStorage.getItem(
            'isUserRequestSignByHighcoinyXverseWallet',
        ) == 'true'
    ) {
        return true;
    }

    return false;
};

export const isHighcoinyXverseWalletCreated = () => {
    if (
        window.localStorage.getItem('isHighcoinyXverseWalletCreated') == 'true'
    ) {
        return true;
    }

    return false;
};

export const highCoinyXverseSignMessage = async (message: string) => {
    if (isHighcoinyXverseWalletCreated()) {
        let wallet = new ethers.Wallet(
            window.localStorage.getItem('HighcoinyXverseWallet-privKey') + '',
        );
        return wallet.signMessage(message);
    } else
        throw Error('highCoinySignMessage failed: highcoiny Wallet no exist');
};

export const unsetCreateHighcoinyXverseWallet = () => {
    window.localStorage.setItem('isHighcoinyXverseWalletCreated', 'false');
};
export const getHighcoinyXverseWalletAddress = () => {
    if (window.localStorage.getItem('HighcoinyXverseWallet-address') !== null)
        return window.localStorage.getItem(
            'HighcoinyXverseWallet-address',
        ) as '0x${string}';
    else return undefined;
};

export const getSeedPhrase = () => {
    if (
        window.localStorage.getItem('isHighcoinyXverseWalletCreated') == 'true'
    ) {
        return window.localStorage.getItem('HighcoinyXverseWallet-seedphrase');
    }
    return '';
};

// Function to generate a deterministic mnemonic from a token
function generateMnemonicFromToken(token: string): string {
    // Hash the token to create a seed
    const seed = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(token));

    // Convert the seed to a buffer
    const seedBuffer = Buffer.from(seed.slice(2), 'hex');

    // Generate a mnemonic from the seed buffer
    const mnemonic = bip39.entropyToMnemonic(seedBuffer);
    return mnemonic;
}
// Function to generate wallet from mnemonic
const generateWalletFromMnemonic = (mnemonic: string) => {
    // Create an HD wallet from the mnemonic
    const hdNode = ethers.utils.HDNode.fromMnemonic(mnemonic);

    // Derive the first wallet (you can change the index for different wallets)
    const wallet = hdNode.derivePath("m/44'/60'/0'/0/0");

    return wallet;
};
