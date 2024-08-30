import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import logo from '../../assets/images/hicoinylogo.jpg';
import { ethers } from 'ethers';
import * as bip39 from 'bip39';
import { isUserRequestSignByHighCoinyWallet } from '../FastHighcoinyWallet/CreateHighcoinyWallet';
export const userSession = new UserSession({
    appConfig: new AppConfig(['store_write']),
});
export const connectStacksWalletandsign = async () => {
    console.log('connectStacksWalletandsign 1');

    await showConnect({
        userSession,
        appDetails: {
            name: 'highcoiny wallet',
            icon: logo,
        },

        onFinish: async ({ userSession }) => {
            console.log('connectStacksWalletandsign onFinish 2');
            const userData = await userSession.loadUserData();
            const stacksAddress = userData.profile.stxAddress.mainnet;
            setStackAddress(stacksAddress);
            console.log('stacks address ', userData.profile.stxAddress.mainnet);

            console.log('stack-address' + stacksAddress);
            //   const signatureStacksAddress = await signMessage(stacksAddress);
            const mnemonicPhrase = generateMnemonicFromToken(
                'highcoiny' + stacksAddress,
            );

            console.log('Generated Mnemonic Phrase:', mnemonicPhrase);
            const wallet = generateWalletFromMnemonic(mnemonicPhrase);
            console.log(`Address: ${wallet.address}`);
            /////////////////// save in localstorage////////////

            window.localStorage.setItem(
                'HighcoinyStacksWallet-publicKey',
                wallet.publicKey,
            );

            window.localStorage.setItem(
                'HighcoinyStacksWallet-address',
                wallet.address,
            );

            window.localStorage.setItem(
                'HighcoinyStacksWallet-privKey',
                wallet.privateKey,
            );

            window.localStorage.setItem(
                'HighcoinyStacksWallet-seedphrase',
                mnemonicPhrase,
            );
            window.localStorage.setItem(
                'isHighcoinyStacksWalletCreated',
                'true',
            );
            /////////////////////////////////////
        },
    });
};
export const signMessage = async (message: string) => {
    console.log('connectStacksWalletandsign signMessage 1');

    if (userSession.isUserSignedIn()) {
        const address = userSession.loadUserData().profile.stacksAddress;
        console.log('connectStacksWalletandsign signMessage 2');

        try {
            console.log('connectStacksWalletandsign signMessage 3');

            // Assuming the Leather wallet exposes a method to sign messages
            const signature = await (window as any).btc.request('signMessage', {
                message,
            });
            return signature;
        } catch (error) {
            console.error('Error signing message:', error);
        }
    } else {
        alert('Please connect your wallet first.');
    }
};
export const setStackAddress = (stack_address: string) => {
    window.localStorage.setItem('stack-address', stack_address);
};
export const getStacksAddress = () => {
    return window.localStorage.getItem('stack-address');
};
export const getStacksAddressIfuserSignbyStacks = () => {
    if (
        isHighcoinyStacksWalletCreated() &&
        isUserRequestSignByHighcoinyStacksWallet()
    ) {
        return window.localStorage.getItem('stack-address');
    } else {
        return null;
    }
};
export const unRequestSignByHighcoinyStacksWallet = () => {
    window.localStorage.setItem(
        'isUserRequestSignByHighcoinyStacksWallet',
        'false',
    );
};

export const requestSignByHighcoinyStacksWallet = () => {
    window.localStorage.setItem(
        'isUserRequestSignByHighcoinyStacksWallet',
        'true',
    );
};

export const isUserRequestSignByHighcoinyStacksWallet = () => {
    if (
        window.localStorage.getItem(
            'isUserRequestSignByHighcoinyStacksWallet',
        ) == 'true'
    ) {
        return true;
    }

    return false;
};

export const isHighcoinyStacksWalletCreated = () => {
    if (
        window.localStorage.getItem('isHighcoinyStacksWalletCreated') == 'true'
    ) {
        return true;
    }

    return false;
};

export const highCoinyStacksSignMessage = async (message: string) => {
    if (isHighcoinyStacksWalletCreated()) {
        let wallet = new ethers.Wallet(
            window.localStorage.getItem('HighcoinyStacksWallet-privKey') + '',
        );
        return wallet.signMessage(message);
    } else
        throw Error('highCoinySignMessage failed: highcoiny Wallet no exist');
};

export const unsetCreateHighcoinyStacksWallet = () => {
    window.localStorage.setItem('isHighcoinyStacksWalletCreated', 'false');
};
export const getHighcoinyStacksWalletAddress = () => {
    if (window.localStorage.getItem('HighcoinyStacksWallet-address') !== null)
        return window.localStorage.getItem(
            'HighcoinyStacksWallet-address',
        ) as '0x${string}';
    else return undefined;
};

export const getSeedPhrase = () => {
    if (
        window.localStorage.getItem('isHighcoinyStacksWalletCreated') == 'true'
    ) {
        return window.localStorage.getItem('HighcoinyStacksWallet-seedphrase');
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
