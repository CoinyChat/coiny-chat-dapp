import Wallet, { AddressPurpose, RpcErrorCode } from 'sats-connect';
import { Logger } from '@ethersproject/logger';
import {
    arrayify,
    BytesLike,
    concat,
    hexDataLength,
    hexDataSlice,
    isHexString,
    stripZeros,
} from '@ethersproject/bytes';
import { ethers } from 'ethers';
import { mnemonicToSeedSync, generateMnemonic } from 'bip39';
export const unRequestSignByXverseWallet = () => {
    window.localStorage.setItem('isUserRequestSignByXverseWallet', 'false');
};

export const requestSignByXverseWallet = () => {
    window.localStorage.setItem('isUserRequestSignByXverseWallet', 'true');
};

export const isUserRequestSignByXverseWallet = () => {
    if (
        window.localStorage.getItem('isUserRequestSignByXverseWallet') == 'true'
    ) {
        return true;
    }

    return false;
};

export const xverseConnect = async (purpose: AddressPurpose) => {
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

        return (data as any).result[0].address;
    } catch (error) {
        console.error('Error connecting to wallet:', error.message);
    }
};
export const xverseSignMessage = async (
    messageForSign: string,
    signAddress: string,
) => {
    try {
        const response = await Wallet.request('signMessage', {
            address: signAddress,
            message: messageForSign,
        });
        if (response.status === 'success') {
            console.log('success', response);
            return response.result.signature;
        } else {
            if (response.error.code === RpcErrorCode.USER_REJECTION) {
                console.log('USER_REJECTION', response);
            } else {
                // handle request error
                console.log('handle request error', response);
            }
        }
        return 'error';
    } catch (err) {
        console.log('    error', err);
        return 'error';
    }
};
export function getXverseStorageKeyCreationMessage(
    nonce: string,
    address: string,
) {
    // TODO: during linked profile implementation these values should be fetched from env
    const statement =
        `Connect the DM3 MESSENGER with your wallet. ` +
        `Keys for secure communication are derived from this signature.\n\n` +
        `(There is no paid transaction initiated. The signature is used off-chain only.)`;
    const domain = 'dm3.chat';
    const uri = 'https://dm3.chat';
    const version = '1';

    return (
        `${domain} wants you to sign in with your Ethereum account:\n` +
        `${address}\n\n` +
        `${statement}\n\n` +
        `URI: ${uri}\n` +
        `Version: ${version}\n` +
        `Nonce: ${nonce}`
    );
}
export function getXverseProfileCreationMessage(
    stringifiedProfile: string,
    address: string,
) {
    const domain = 'dm3.chat';
    const uri = 'https://dm3.chat';
    const version = '1';

    return (
        `${domain} wants you register your dm3 profile with your Ethereum account:\n` +
        `${address}\n\n` +
        `This is required only once!\n` +
        `(There is no paid transaction initiated. The signature is used off-chain only.)\n\n` +
        `URI: ${uri}\n` +
        `Version: ${version}\n` +
        `dm3 Profile: ${stringifiedProfile}`
    );
}

// Function to generate a deterministic mnemonic from a string
function generateMnemonicFromString(inputString: string): string {
    // Hash the input string to create a seed
    const seed = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(inputString));

    // Generate a mnemonic from the seed
    const mnemonic = generateMnemonic(parseInt(seed));
    return mnemonic;
}
