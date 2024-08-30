import { ethers } from 'ethers';
import { useContext, useEffect, useState } from 'react';
import { Account } from './interfaces';
import './styels.css';
import { useAccount } from 'wagmi';
import { useNavigate, useParams } from 'react-router-dom';
import { getAvatarProfilePic } from '../../utils/ens-utils';
import humanIcon from '../../assets/images/human.svg';
import { get, useForm } from 'react-hook-form';
import { getToken, saveProfile, getUser } from './utils';
import { Loader, closeLoader, startLoader } from '../Loader/Loader';
import { DM3ConfigurationContext } from '../../context/DM3ConfigurationContext';
import backLogo from '../../assets/images/back.svg';
import {
    getHighCoinyWalletAddress,
    highCoinySignMessage,
    isHighCoinyWalletCreated,
    isUserRequestSignByHighCoinyWallet,
} from '../FastHighcoinyWallet/CreateHighcoinyWallet';
import { AuthContext } from '../../context/AuthContext';
import { ConfigureCloudNameProfile } from '../ConfigureProfile/dm3Names/cloudName/ConfigureCloudNameProfile';
import { ConfigureProfileContextProvider } from '../ConfigureProfile/context/ConfigureProfileContext';
import { ConfigureDM3NameContextProvider } from '../ConfigureProfile/context/ConfigureDM3NameContext';
import { connectorsForWallets } from '@rainbow-me/rainbowkit';

const UpdateHicoinyProifle = () => {
    const { dm3Configuration } = useContext(DM3ConfigurationContext);
    const { displayName } = useContext(AuthContext);
    const [skip, setSkip] = useState(false);

    const { ensName } = useParams();
    const [profile, setProfile] = useState<any>({});
    const [isProfilePublished, setIsProfilePublished] = useState(false);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState('');
    const [provider, setProvider] = useState<any>();
    const navigate = useNavigate();

    const { address, isConnected, connector } = useAccount();
    const [signedAddress, setSignedAddress] = useState<
        '0x${string}' | undefined
    >(undefined);

    const [allAccounts, setAllAccounts] = useState<Account[]>([]);
    const [connected, setConnected] = useState(true);
    const [walletSubmited, setWalletSubmited] = useState(false);

    const [profilePic, setProfilePic] = useState<string>('');
    const [tokenFethched, setTokenFetched] = useState(false)

    //data type to pass to use Form
    interface FormData {
        name: string;
        X: string;
        about: string;
        email: string;
        phone: string;
        LinkedIn: string;
    }
    interface createFormData {
        name: string;
        X: string;
        about: string;
        email: string;
        phone: string;
        LinkedIn: string;
    }

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>();
    const {
        register: register2,
        handleSubmit: handleSubmit2,
        formState: { errors: errors2 },
    } = useForm<createFormData>();

    // fetched profile pic of signed in user
    const fetchAndSetProfilePic = async () => {
        setProfilePic(
            await getAvatarProfilePic(
                provider || new ethers.providers.StaticJsonRpcProvider(
                    process.env.REACT_APP_MAINNET_PROVIDER_RPC,
                ),
                ensName as string,
                dm3Configuration.addressEnsSubdomain,
            ),
        );
    };

    useEffect(() => {
        if (localStorage.getItem('walletname') === 'stacks')
            navigate('..')
    }, [])
    const _reconnectWallet = async () => {
        try {
            // write the equvilant code for this line await window.ethereum?.enable() using the provider;
            _disconnectWallets();
            await provider.send('eth_requestAccounts', []);

            const signer = provider.getSigner();
            const userAddress = await signer.getAddress();
            if (userAddress) {
                setConnected(true);
                await getAllWalletAccounts();
                setLoading(false);
            }
        } catch (error) {
            setLoading(false);

            console.error('Error fetching connect:', (error as Error).message);
        }
    };
    const seeProfile = async () => {
        startLoader();
        try {
            const user = await getUser(ensName as string);

            setProfile(user);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
            closeLoader();
        }
    };
    useEffect(() => {
        if (signedAddress !== undefined) {
            if (
                (isConnected || isHighCoinyWalletCreated()) &&
                ensName?.toLowerCase().slice(0, ensName.indexOf('.')) !==
                signedAddress?.toLowerCase()
            ) {
                navigate('/');

            }
        }
    }, [signedAddress])
    useEffect(() => {
        const handleRefresh = () => {
            window.localStorage.setItem('isUserRequestSignByHighCoinyWallet', 'false')
        };

        window.addEventListener('beforeunload', handleRefresh);

        return () => {
            window.removeEventListener('beforeunload', handleRefresh);
        };
    }, [navigate]);
    useEffect(() => {
        async function token() {
            try {
                setToken(await getToken(ensName as string));
            } catch (error) {
                throw error;
            }
        }
        if (isConnected && address) {
            setSignedAddress(address as '0x${string}');

        }
        if (!isConnected && isHighCoinyWalletCreated()) {

            setSignedAddress(getHighCoinyWalletAddress());

        }
        if (!isConnected && !isUserRequestSignByHighCoinyWallet()) {
            navigate('/', { replace: true });
        }






        if (displayName?.endsWith('user.dm3.eth')) {
            setSkip(true)
        }
        async function getProvider() {
            const wagmiProvider = await connector?.getProvider();
            const etherProvider = new ethers.providers.Web3Provider(
                wagmiProvider,
            );

            setProvider(etherProvider);
        }
        if (profile?.profile) {
            setIsProfilePublished(true);
        }
        if (Object.keys(profile).length === 0) {
            seeProfile();

        } else {
            if (!loading && isConnected && !provider) {
                getProvider();
            }



            if (!loading && profile.profile) {
                console.log(1)
                getAllWalletAccounts();
                fetchAndSetProfilePic();

            }
            if (signedAddress && !loading && profile.profile && !tokenFethched) {

                try {
                    token();
                    setTokenFetched(true)
                } catch (error) {
                    console.log(error);
                }
            }

        }
    }, [provider, profile, loading, signedAddress]);

    const _disconnectWallets = async () => {
        setLoading(true);
        provider.send('wallet_revokePermissions', [
            {
                eth_accounts: {},
            },
        ]);
        setLoading(false);
        setConnected(false);
        setAllAccounts([]);
    };

    useEffect(() => {
        if (displayName?.endsWith('user.dm3.eth'))
            setSkip(true)
    }, [displayName]);

    const submit = async (data: any) => {
        startLoader()
        data.verifiedWallets = allAccounts.filter(
            (account) => account.signatureVerified === true,
        );
        data.unverifiedWalltets = allAccounts.filter(
            (account) => account.signatureVerified !== true,
        );
        let hi = false
        if (!isConnected && isHighCoinyWalletCreated()) {
            hi = true
        }
        console.log('data', data);
        await saveProfile(
            ensName as string,
            displayName,
            data,
            token as string,
            hi
        );
        seeProfile();
    };

    const getAllWalletAccounts = async () => {
        if (isUserRequestSignByHighCoinyWallet()) {
            const wallet = getHighCoinyWalletAddress()
            const index = allAccounts.findIndex((account) => account.address === wallet);
            if (index !== -1) {
                return;
            }
            const sign = await highCoinySignMessage(
                wallet as string,
            );
            // check if wallet is already added

            setAllAccounts(arr => [...arr, {
                address: wallet as string,
                balance: '0',
                isSelected: true,
                signature: sign,
                signatureVerified: true,
            }]);
            setWalletSubmited(w => !w);
            return;
        }
        try {
            let accounts;

            if (
                !provider ||
                signedAddress?.toLowerCase() !==
                ensName?.substring(0, ensName.indexOf('.'))
            ) {
                // Check if user viewing the page is connected to a wallet
                if (profile.profile && profile.profile.verifiedWallets) {
                    accounts = profile.profile.verifiedWallets.map(
                        (wallet: any) => wallet.address,
                    );
                } else {
                    console.error(
                        'Ethereum provider not found and no verified wallets in profile.',
                    );
                    return [];
                }
            } else {
                accounts = await provider.send('eth_accounts', []);
            }

            const formattedAccounts = accounts.map(
                (account: string, i: number) => {
                    // Check if account is verified in the profile state variable
                    const accountInProfile =
                        profile.profile?.verifiedWallets.find(
                            (address: any) =>
                                address.address === account.toLowerCase(),
                        );

                    if (accountInProfile) {
                        return {
                            address: account,
                            balance: accountInProfile.balance,
                            isSelected: i === 0,
                            signature: accountInProfile.signature,
                            signatureVerified: true,
                        };
                    }

                    return {
                        address: account,
                        balance: null,
                        isSelected: i === 0,
                        signature: '',
                    };
                },
            );

            setAllAccounts(formattedAccounts);
            return formattedAccounts;
        } catch (error) {
            setAllAccounts([]);
            return [];
        }
    };

    const submitWallet = async (data: any) => {
        data.verifiedWallets = allAccounts.filter(
            (account) => account.signatureVerified === true,
        );
        data.unverifiedWalltets = allAccounts.filter(
            (account) => account.signatureVerified !== true,
        );
        saveProfile(ensName as string, displayName, data, token as string);
    };
    useEffect(() => {
        if (profile.profile) {
            submitWallet(profile.profile);
        }
    }, [walletSubmited]);

    const handleSignMessage = async (address: string) => {
        try {
            const existingAccount = allAccounts.find(
                (account) => account.address === address,
            );
            if (existingAccount && existingAccount.signature !== '') {
            } else {
                const signer = await provider.getSigner(address);
                const message = address;
                const signature = await signer.signMessage(message);
                const sign = ethers.utils.verifyMessage(message, signature);
                if (sign?.toLowerCase() === address?.toLowerCase()) {
                    const updatedAccounts = allAccounts.map((account) =>
                        account.address === address
                            ? { ...account, signature, signatureVerified: true }
                            : account,
                    );
                    setAllAccounts(updatedAccounts);
                    setWalletSubmited(!walletSubmited);
                } else {
                    throw 'faild to virfy';
                }
            }
        } catch (error) {
            console.error('Error signing message:', error);
        }
    };

    const getWallets = () => {
        return allAccounts.map((acc, index) => {
            return (
                <div key={index} className="wallet">
                    <div className="address">Wallet Address: {acc.address}</div>
                    {!acc.signature ? (
                        <button
                            title={acc.signature || 'Sign Message'}
                            disabled={false}
                            className={`shadow-lg px-2 truncate disabled:cursor-default disabled:opacity-90 opacity-100 py-1 rounded-md text-sm 
                ${acc.signature
                                    ? 'bg-green-400 !text-black/70 max-w-32'
                                    : 'bg-gray-200 !text-black/50'
                                }
                `}
                            onClick={() => handleSignMessage(acc.address)}
                        >
                            {acc.signature || 'Sign Message'}
                        </button>
                    ) : (
                        <div className="message">
                            Signed Message: {acc.signature}
                        </div>
                    )}
                    {typeof acc.signatureVerified === 'undefined' ? (
                        <></>
                    ) : (
                        <span
                            className={
                                acc.signatureVerified
                                    ? 'verified-badge'
                                    : 'unverified-badge'
                            }
                        >
                            {acc.signatureVerified ? 'Verified' : 'Unverified'}
                        </span>
                    )}
                </div>
            );
        });
    };

    return (
        <>
            <button
                className="btn rounded-circle text-white"
                onClick={() => navigate('..')}
            >
                <img src={backLogo} alt="" />
            </button>
            {!loading ? (
                isProfilePublished ? (
                    <div className="bdy">
                        {signedAddress?.toLowerCase() ===
                            ensName
                                ?.toLowerCase()
                                .slice(0, ensName.indexOf('.')) && (
                                <>
                                    {!skip &&
                                        <>
                                            <ConfigureProfileContextProvider>
                                                <ConfigureDM3NameContextProvider>

                                                    <ConfigureCloudNameProfile />
                                                </ConfigureDM3NameContextProvider>
                                            </ConfigureProfileContextProvider>
                                            <button className='btn btn-danger' onClick={() => setSkip(true)} style={{
                                                //warning color
                                                backgroundColor: 'rgb(236, 129, 41)',
                                                border: 'none',
                                                color: 'white',

                                            }} type='button'>
                                                skip</button></>
                                    }
                                </>
                            )}
                        <div className="container justify-items-around">
                            <div className="row">
                                <div className="col-md-7 col-sm-12 profile-container">
                                    <div className="text-center">
                                        <img
                                            src={
                                                profilePic
                                                    ? profilePic
                                                    : humanIcon
                                            }
                                            alt="Profile Picture"
                                            className="profile-picture"
                                        />
                                        <h1>{profile?.profile?.name}</h1>
                                        <p>@{displayName}</p>
                                    </div>
                                    <div className="profile-info">
                                        <h2>About Me</h2>
                                        <p>{profile?.profile?.about}</p>
                                        <h2>Contact Information</h2>
                                        <p>Email: {profile?.profile?.email}</p>
                                        <p>Phone: {profile?.profile?.phone}</p>
                                        <h2>Social Media</h2>
                                        <p>
                                            <a href={profile?.profile?.X}>
                                                Twitter
                                            </a>
                                        </p>
                                        <p>
                                            <a
                                                href={
                                                    profile?.profile?.LinkedIn
                                                }
                                            >
                                                LinkedIn
                                            </a>
                                        </p>
                                    </div>
                                </div>

                                <div className="col-md-4 col-sm-12 profile-section">
                                    {signedAddress?.toLowerCase() ===
                                        ensName?.substring(
                                            0,
                                            ensName.indexOf('.'),
                                        ) && !isHighCoinyWalletCreated() ? (
                                        <button
                                            disabled={loading}
                                            className={`px-6 py-2 rounded-[10px] bg-slate-200 disabled:cursor-not-allowed ${connected
                                                ? 'border-red-500 text-red-500'
                                                : 'border-blue-500 text-blue-500'
                                                }`}
                                            onClick={_reconnectWallet}
                                        >
                                            {loading
                                                ? 'Wait...'
                                                : connected
                                                    ? 'ReConnect'
                                                    : 'ReConnect'}
                                        </button>
                                    ) : (
                                        <></>
                                    )}
                                    <h2>Wallet Addresses</h2>
                                    <div>{getWallets()}</div>

                                </div>
                                {signedAddress?.toLowerCase() ===
                                    ensName
                                        ?.toLowerCase()
                                        .slice(0, ensName.indexOf('.')) && (
                                        <><button
                                            type="button"
                                            className="btn btn-primary mb-3 create"
                                            data-bs-toggle="modal"
                                            data-bs-target="#createProfile"
                                            style={{
                                                backgroundColor: 'rgb(40, 32, 74)',
                                                borderColor: 'rgb(84, 67, 147)',
                                                color: 'white',
                                            }}
                                            disabled={token ? false : true}
                                        >
                                            Update Proifle
                                        </button>

                                        </>
                                    )}
                                <div
                                    className=" modal fade"
                                    id="createProfile"
                                    data-bs-backdrop="static"
                                    data-bs-keyboard="false"
                                    tabIndex={-1}
                                    aria-labelledby="staticBackdropLabel"
                                    aria-hidden="true"
                                >
                                    <div className="modal-dialog">
                                        <div
                                            className="modal-content"
                                            style={{
                                                backgroundColor:
                                                    'rgb(33, 37, 41)',
                                            }}
                                        >
                                            <div
                                                className="modal-header"
                                                style={{
                                                    borderColor:
                                                        'rgb(84, 67, 147)',
                                                }}
                                            >
                                                <h1
                                                    className="modal-title fs-5"
                                                    id="staticBackdropLabel"
                                                >
                                                    Update Profile
                                                </h1>
                                            </div>
                                            <div className="modal-body">
                                                <form
                                                    id="update-form"
                                                    onSubmit={handleSubmit(
                                                        (data) => submit(data),
                                                    )}
                                                >
                                                    <div className="mb-3">
                                                        <label
                                                            htmlFor="name"
                                                            className="form-label"
                                                        >
                                                            Name
                                                        </label>
                                                        <input
                                                            className="form-control"
                                                            id="name"
                                                            aria-describedby="nameHelp"
                                                            defaultValue={profile?.profile?.name}
                                                            {...register(
                                                                'name',
                                                            )}
                                                        />
                                                    </div>
                                                    <div className="mb-3">
                                                        <label
                                                            htmlFor="phone"
                                                            className="form-label"
                                                        >
                                                            Phone
                                                        </label>
                                                        <input
                                                            className="form-control"
                                                            id="phone"
                                                            aria-describedby="phoneHelp"
                                                            defaultValue={profile?.profile?.phone}
                                                            {...register(
                                                                'phone',
                                                            )}
                                                        />
                                                    </div>
                                                    <div className="mb-3">
                                                        <label
                                                            htmlFor="email"
                                                            className="form-label"
                                                        >
                                                            Email
                                                        </label>
                                                        <input
                                                            className="form-control"
                                                            id="email"
                                                            type='email'
                                                            aria-describedby="emailHelp"
                                                            defaultValue={profile?.profile?.email}
                                                            {...register(
                                                                'email',
                                                            )}
                                                        />
                                                    </div>
                                                    <div className="mb-3">
                                                        <label
                                                            htmlFor="linkedIn"
                                                            className="form-label"
                                                        >
                                                            LinkedIn Account URL
                                                        </label>
                                                        <input
                                                            className="form-control"
                                                            id="linkedIn"
                                                            aria-describedby="LinkedInHelp"
                                                            defaultValue={profile?.profile?.LinkedIn}
                                                            {...register(
                                                                'LinkedIn',
                                                            )}
                                                        />
                                                    </div>
                                                    <div className="mb-3">
                                                        <label
                                                            htmlFor="x"
                                                            className="form-label"
                                                        >
                                                            X Account Url
                                                        </label>
                                                        <input
                                                            className="form-control"
                                                            id="x"
                                                            aria-describedby="XHelp"
                                                            defaultValue={profile?.profile?.X}
                                                            {...register('X')}
                                                        />
                                                    </div>
                                                    <div className="mb-3">
                                                        <label
                                                            htmlFor="about"
                                                            className="form-label"
                                                        >
                                                            About me
                                                        </label>
                                                        <textarea
                                                            className="form-control"
                                                            id="about"
                                                            aria-describedby="aboutHelp"
                                                            defaultValue={profile?.profile?.about}
                                                            {...register(
                                                                'about',
                                                            )}
                                                        />
                                                    </div>
                                                    {displayName?.endsWith(
                                                        'user.dm3.eth',
                                                    ) && (
                                                            <div className="mb-3">
                                                                <label className="form-label">
                                                                    DM3 Name:{' '}
                                                                    {displayName}
                                                                </label>
                                                            </div>
                                                        )}
                                                    {displayName?.endsWith(
                                                        'addr.dm3.eth',
                                                    ) && (
                                                            <div className="mb-3">
                                                                <label className="form-label">
                                                                    Configure DM3
                                                                    Name
                                                                </label>
                                                            </div>
                                                        )}
                                                </form>
                                            </div>
                                            <div
                                                className="modal-footer"
                                                style={{
                                                    borderColor:
                                                        'rgb(84, 67, 147)',
                                                }}
                                            >
                                                <button
                                                    type="button"
                                                    className="btn btn-secondary"
                                                    data-bs-dismiss="modal"
                                                >
                                                    Close
                                                </button>
                                                <button
                                                    type="submit"
                                                    form="update-form"
                                                    className="btn btn-primary"
                                                    data-bs-dismiss="modal"
                                                >
                                                    Update
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className='container'>
                        <h1>the profile hasn't been created yet</h1>{' '}
                        {signedAddress?.toLowerCase() ===
                            ensName
                                ?.toLowerCase()
                                .slice(0, ensName.indexOf('.')) && (
                                <>
                                    {skip && <button
                                        type="button"
                                        className="btn btn-primary mb-3 create"
                                        data-bs-toggle="modal"
                                        data-bs-target="#createProfile"
                                        style={{
                                            backgroundColor: 'rgb(40, 32, 74)',
                                            borderColor: 'rgb(84, 67, 147)',
                                            color: 'white',
                                        }}
                                    >
                                        Create Proifle
                                    </button>}
                                    {skip && displayName?.endsWith('addr.dm3.eth') && <p>if you don't claim a DM3 Name we will use your wallet address instead
                                    </p>}
                                    {!skip &&
                                        <>
                                            <ConfigureProfileContextProvider>
                                                <ConfigureDM3NameContextProvider>

                                                    <ConfigureCloudNameProfile />
                                                </ConfigureDM3NameContextProvider>
                                            </ConfigureProfileContextProvider>
                                            <button className='btn btn-danger' onClick={() => setSkip(true)} style={{
                                                //warning color
                                                backgroundColor: 'rgb(236, 129, 41)',
                                                border: 'none',
                                                color: 'white',

                                            }} type='button'>
                                                skip</button></>
                                    }
                                    <div
                                        className=" modal fade"
                                        id="createProfile"
                                        data-bs-backdrop="static"
                                        data-bs-keyboard="false"
                                        tabIndex={-1}
                                        aria-labelledby="staticBackdropLabel"
                                        aria-hidden="true"
                                    >
                                        <div className="modal-dialog">
                                            <div
                                                className="modal-content"
                                                style={{
                                                    backgroundColor:
                                                        'rgb(33, 37, 41)',
                                                }}
                                            >
                                                <div
                                                    className="modal-header"
                                                    style={{
                                                        borderColor:
                                                            'rgb(84, 67, 147)',
                                                    }}
                                                >
                                                    <h1
                                                        className="modal-title fs-5"
                                                        id="staticBackdropLabel"
                                                    >
                                                        Create Profile
                                                    </h1>
                                                </div>
                                                <div className="modal-body">
                                                    <form
                                                        id="create-form"
                                                        onSubmit={handleSubmit2(
                                                            (data) => submit(data),
                                                        )}
                                                    >
                                                        <div className="mb-3">
                                                            <label
                                                                htmlFor="name"
                                                                className="form-label"
                                                            >
                                                                Name
                                                            </label>
                                                            <input
                                                                className="form-control"
                                                                id="name"
                                                                aria-describedby="nameHelp"
                                                                {...register2(
                                                                    'name',
                                                                )}

                                                            />
                                                        </div>
                                                        <div className="mb-3">
                                                            <label
                                                                htmlFor="phone"
                                                                className="form-label"
                                                            >
                                                                Phone
                                                            </label>
                                                            <input
                                                                className="form-control"
                                                                id="phone"
                                                                aria-describedby="phoneHelp"
                                                                {...register2(
                                                                    'phone',
                                                                )}

                                                            />
                                                        </div>
                                                        <div className="mb-3">
                                                            <label
                                                                htmlFor="email"
                                                                className="form-label"
                                                            >
                                                                Email
                                                            </label>
                                                            <input
                                                                className="form-control"
                                                                id="email"
                                                                type='email'
                                                                aria-describedby="emailHelp"
                                                                {...register2(
                                                                    'email',
                                                                )}

                                                            />
                                                        </div>
                                                        <div className="mb-3">
                                                            <label
                                                                htmlFor="linkedIn"
                                                                className="form-label"
                                                            >
                                                                LinkedIn Account URL
                                                            </label>
                                                            <input
                                                                className="form-control"
                                                                id="linkedIn"
                                                                aria-describedby="LinkedInHelp"
                                                                {...register2(
                                                                    'LinkedIn',
                                                                )}

                                                            />
                                                        </div>
                                                        <div className="mb-3">
                                                            <label
                                                                htmlFor="x"
                                                                className="form-label"
                                                            >
                                                                X Account Url
                                                            </label>
                                                            <input
                                                                className="form-control"
                                                                id="x"
                                                                aria-describedby="XHelp"
                                                                {...register2('X')}

                                                            />
                                                        </div>
                                                        <div className="mb-3">
                                                            <label
                                                                htmlFor="about"
                                                                className="form-label"
                                                            >
                                                                About me
                                                            </label>
                                                            <textarea
                                                                className="form-control"
                                                                id="about"
                                                                aria-describedby="aboutHelp"
                                                                {...register2(
                                                                    'about',
                                                                )}

                                                            />
                                                        </div>
                                                        {displayName?.endsWith(
                                                            'user.dm3.eth',
                                                        ) && (
                                                                <div className="mb-3">
                                                                    <label className="form-label">
                                                                        DM3 Name:{' '}
                                                                        {displayName}
                                                                    </label>
                                                                </div>
                                                            )}
                                                        {displayName?.endsWith(
                                                            'addr.dm3.eth',
                                                        ) && (
                                                                <div className="mb-3">
                                                                    <label className="form-label">
                                                                        Configure DM3
                                                                        Name
                                                                    </label>
                                                                </div>
                                                            )}
                                                    </form>
                                                </div>
                                                <div
                                                    className="modal-footer"
                                                    style={{
                                                        borderColor:
                                                            'rgb(84, 67, 147)',
                                                    }}
                                                >
                                                    <button
                                                        type="button"
                                                        className="btn btn-secondary"
                                                        data-bs-dismiss="modal"
                                                    >
                                                        Close
                                                    </button>
                                                    <button
                                                        type="submit"
                                                        form="create-form"
                                                        className="btn btn-primary"
                                                        data-bs-dismiss="modal"
                                                    >
                                                        Create
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                    </div>
                )
            ) : (
                <></>
            )}
            <Loader />





        </>
    );
};

export default UpdateHicoinyProifle;
