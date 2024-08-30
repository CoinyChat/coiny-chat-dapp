import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import './styels.css';
import { useNavigate, useParams } from 'react-router-dom';
import { getAvatarProfilePic } from '../../utils/ens-utils';
import humanIcon from '../../assets/images/human.svg';
import { Loader, closeLoader, startLoader } from '../Loader/Loader';
import { getUser } from './utils';
import { Account } from './interfaces';

const HiCoinyProfile = () => {
  const { ensName } = useParams();
  const [profile, setProfile] = useState<any>({});
  const [isProfilePublished, setIsProfilePublished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [allAccounts, setAllAccounts] = useState<Account[]>([]);


  const [profilePic, setProfilePic] = useState<string>('');

  //data type to pass to use Form

  const provider = new ethers.providers.StaticJsonRpcProvider(
    process.env.REACT_APP_MAINNET_PROVIDER_RPC,
  );

  // fetched profile pic of signed in user
  const fetchAndSetProfilePic = async () => {
    setProfilePic(
      await getAvatarProfilePic(
        provider,
        ensName as string,
        process.env.REACT_APP_ADDR_ENS_SUBDOMAIN as string,
      ),
    );
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
    if (profile.profile) {
      setIsProfilePublished(true);
    }
    if (Object.keys(profile).length === 0) {
      seeProfile();
    } else {
      if (provider && !loading && profile.profile) {
        getAllWalletAccounts();
        fetchAndSetProfilePic();
      }
    }
  }, [profile, loading]);

  const getAllWalletAccounts = async () => {
    try {
      const formattedAccounts = profile.profile?.verifiedWallets.map(
        (account: any, i: number) => {
          // Check if account is verified in the profile state variable

          return {
            address: account.address,
            isSelected: i === 0,
            signature: account?.signature,
            signatureVerified: account?.signatureVerified,
          };
        },
      );

      setAllAccounts(formattedAccounts);
    } catch (error) {
      setAllAccounts([]);
      console.error('Error fetching wallet accounts:', error);
      return [];
    }
  };

  const getWallets = () => {
    return allAccounts.map((acc, index) => {
      return (
        <div key={index} className="wallet">
          <div className="address">Wallet Address: {acc.address}</div>

          <div className="message">
            Signed Message: {acc.signature}
          </div>

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
      {!loading ? (
        isProfilePublished ? (
          <div className="bdy">
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
                    <p>@{profile?.name}</p>
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
                    {profile?.name && (
                      <p>
                        <a
                          href={`/?sid=1&name=${profile?.profile?.name}&dm3name=${profile?.name}`}
                        >
                          send message
                        </a>
                      </p>
                    )}
                    {profile?.name && (
                      <p>
                        <a
                          href={`/?hsid=1&name=${profile?.profile?.name}&dm3name=${profile?.name}`}
                        >
                          send message using HighCoiny
                          Wallet
                        </a>
                      </p>
                    )}
                  </div>
                </div>

                <div className="col-md-4 col-sm-12 profile-section">
                  <h2>Wallet Addresses</h2>
                  <div>{getWallets()}</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <h1>the profile hasn't been created yet</h1>
          </>
        )
      ) : (
        <></>
      )}
      <Loader />
    </>
  );
};

export default HiCoinyProfile;
