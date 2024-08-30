import { ethers } from "ethers";
import { useContext, useEffect, useState } from "react";
import { Account } from "./interfaces";
import "./styels.css";
import { useAccount } from "wagmi";
import { useNavigate, useParams } from "react-router-dom";
import { getAvatarProfilePic } from "../../utils/ens-utils";
import humanIcon from "../../assets/images/human.svg";
import { get, useForm } from "react-hook-form";
import { getToken, saveProfile, getUser } from "./utils";
import { Loader, closeLoader, startLoader } from "../Loader/Loader";
import { DM3ConfigurationContext } from "../../context/DM3ConfigurationContext";
import backLogo from '../../assets/images/back.svg'


const HiCoinyProfile = () => {

  const { dm3Configuration } = useContext(DM3ConfigurationContext);

  const { ensName } = useParams();
  const [profile, setProfile] = useState<any>({})
  const [loading, setLoading] = useState(false);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [token, setToken] = useState("");
  const [provider, setProvider] = useState<any>();
  const navigate = useNavigate()

  const { address, isConnected, connector } = useAccount();

  const [allAccounts, setAllAccounts] = useState<Account[]>([]);
  const [connected, setConnected] = useState(true);
  const [showModal, setShowModal] = useState({
    isShow: false,
    body: "",
    header: "",
  });

  const [profilePic, setProfilePic] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // fetched profile pic of signed in user
  const fetchAndSetProfilePic = async () => {
    setProfilePic(await getAvatarProfilePic(provider, ensName as string, dm3Configuration.addressEnsSubdomain));
  };


  const _reconnectWallet = async () => {
    try {
      // write the equvilant code for this line await window.ethereum?.enable() using the provider;
      _disconnectWallets();
      await provider.send("eth_requestAccounts", []);

      const signer = provider.getSigner();
      const userAddress = await signer.getAddress();
      if (userAddress) {
        setConnected(true);
        await getAllWalletAccounts();
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);

      console.error("Error fetching connect:", (error as Error).message);
    }
  };
  useEffect(() => {
    async function seeProfile() {
      startLoader()
      try {

        const user = await getUser(ensName as string)

        console.log(user);


        setProfile(user)


      } catch (error) {
        console.log(error);

      } finally {

        closeLoader()
      }
    }
    async function token() {
      setToken(await getToken(ensName as string));
    }
    async function getProvider() {
      const wagmiProvider = await connector?.getProvider();
      const etherProvider = new ethers.providers.Web3Provider(wagmiProvider);

      setProvider(etherProvider);
    }
    if (Object.keys(profile).length === 0) {

      seeProfile()
    } else {


      if (isConnected && !provider) {
        getProvider();
      }
      if (provider) {
        getAllWalletAccounts();
        fetchAndSetProfilePic();

        if (isConnected && ensName?.toLowerCase().slice(0, ensName.indexOf('.')) === address?.toLowerCase()) {
          try {

            token();
          } catch (error) {
            console.log(error);

          }
        }
      }
    }
  }, [provider, profile, loading]);

  const _disconnectWallets = async () => {
    setLoading(true);
    provider.send("wallet_revokePermissions", [
      {
        eth_accounts: {},
      },
    ]);
    setLoading(false);
    setConnected(false);
    setAllAccounts([]);
  };

  const submit = (data: any) => {
    data.verifiedWallets = allAccounts.filter(
      (account) => account.signatureVerified === true
    );
    data.unverifiedWalltets = allAccounts.filter(
      (account) => account.signatureVerified !== true
    );
    saveProfile(ensName as string, data, token as string);
  };

  const getAllWalletAccounts = async () => {
    try {
      if (!provider) {
        console.error("Ethereum provider not found.");
        return [];
      }

      const accounts = await provider.send("eth_accounts", []);

      const formattedAccounts = accounts.map((account: any, i: number) => ({
        address: account,
        balance: null,
        isSelected: i === 0,
        signature: "",
      }));
      setAllAccounts(formattedAccounts);
      return formattedAccounts;
    } catch (error) {
      setAllAccounts([]);
      console.error("Error fetching wallet accounts:", error);
      return [];
    }
  };



  const handleSignMessage = async (address: string) => {
    try {
      const existingAccount = allAccounts.find(
        (account) => account.address === address
      );
      if (existingAccount && existingAccount.signature !== "") {
        setShowModal({
          isShow: true,
          body: existingAccount.signature,
          header: "Signature",
        });
      } else {
        const signer = await provider.getSigner(address);
        const message = address;
        const signature = await signer.signMessage(message);
        const sign = ethers.utils.verifyMessage(message, signature);
        if (sign?.toLowerCase() === address?.toLowerCase()) {
          const updatedAccounts = allAccounts.map((account) =>
            account.address === address
              ? { ...account, signature, signatureVerified: true }
              : account
          );
          setAllAccounts(updatedAccounts);
        } else {
          throw "faild to virfy";
        }
      }
    } catch (error) {
      console.error("Error signing message:", error);
    }
  };







  const getWallets = () => {
    return allAccounts.map((acc, index) => {
      return (
        <div key={index} className="wallet">
          <div className="address">Wallet Address: {acc.address}</div>
          {!acc.signature ? (
            <button
              title={acc.signature || "Sign Message"}
              disabled={false}
              className={`shadow-lg px-2 truncate disabled:cursor-default disabled:opacity-90 opacity-100 py-1 rounded-md text-sm 
                ${acc.signature
                  ? "bg-green-400 !text-black/70 max-w-32"
                  : "bg-gray-200 !text-black/50"
                }
                `}
              onClick={() => handleSignMessage(acc.address)}
            >
              {acc.signature || "Sign Message"}
            </button>
          ) : (
            <div className="message">Signed Message: {acc.signature}</div>
          )}
          {typeof acc.signatureVerified === "undefined" ? (
            <></>
          ) : (
            <span
              className={
                acc.signatureVerified ? "verified-badge" : "unverified-badge"
              }
            >
              {acc.signatureVerified ? "Verified" : "Unverified"}
            </span>
          )}
        </div>
      );
    });
  };

  return (<>
    <button className="btn rounded-circle text-white" onClick={() => navigate('..')}>
      <img src={backLogo} alt="" />
    </button>
    {!loading ?
      profile.profile ? <div className="bdy">
        <div className="container justify-items-around">
          <div className="row">
            <div className="col-md-7 col-sm-12 profile-container">
              <div className="text-center">
                <img
                  src={profilePic ? profilePic : humanIcon}
                  alt="Profile Picture"
                  className="profile-picture"
                />
                <h1>{profile?.profile?.name}</h1>
                <p>@johndoe</p>
              </div>
              <div className="profile-info">
                <h2>About Me</h2>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                  eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </p>
                <h2>Contact Information</h2>
                <p>Email: johndoe@example.com</p>
                <p>Phone: +1234567890</p>
                <h2>Social Media</h2>
                <p>
                  <a href="#">Twitter</a>
                </p>
                <p>
                  <a href="#">LinkedIn</a>
                </p>
              </div>
            </div>

            <div className="col-md-4 col-sm-12 profile-section">
              {address?.toLowerCase() ===
                ensName?.substring(0, ensName.indexOf(".")) ? (
                <button
                  disabled={loading}
                  className={`px-6 py-2 rounded-[10px] bg-slate-200 disabled:cursor-not-allowed ${connected
                    ? "border-red-500 text-red-500"
                    : "border-blue-500 text-blue-500"
                    }`}
                  onClick={_reconnectWallet}
                >
                  {loading ? "Wait..." : connected ? "ReConnect" : "ReConnect"}
                </button>
              ) : (
                <></>
              )}
              <h2>Wallet Addresses</h2>
              <div>{getWallets()}</div>
            </div>
            {address?.toLowerCase() === ensName?.toLowerCase().slice(0, ensName.indexOf('.')) && <button
              type="button"
              className="btn btn-primary mb-3 create"
              data-bs-toggle="modal"
              data-bs-target="#createProfile"
              style={{
                backgroundColor: "rgb(40, 32, 74)",
                borderColor: "rgb(84, 67, 147)",
                color: "white",
              }}
              disabled={token ? false : true}
            >
              Update Proifle
            </button>}
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
                    backgroundColor: "rgb(33, 37, 41)",
                  }}
                >
                  <div
                    className="modal-header"
                    style={{ borderColor: "rgb(84, 67, 147)" }}
                  >
                    <h1 className="modal-title fs-5" id="staticBackdropLabel">
                      Create Profile
                    </h1>
                  </div>
                  <div className="modal-body">
                    <form
                      id="create-form"
                      onSubmit={handleSubmit((data) => submit(data))}
                    >
                      <div className="mb-3">
                        <label htmlFor="linkedIn" className="form-label">
                          LinkedIn Account URL
                        </label>
                        <input
                          className="form-control"
                          id="linkedIn"
                          aria-describedby="LinkedInHelp"
                          {...register("LinkedIn")}
                        />
                      </div>
                      <div className="mb-3">
                        <label htmlFor="x" className="form-label">
                          X Account Url
                        </label>
                        <input
                          className="form-control"
                          id="x"
                          aria-describedby="XHelp"
                          {...register("X")}
                        />
                      </div>
                    </form>
                  </div>
                  <div
                    className="modal-footer"
                    style={{ borderColor: "rgb(84, 67, 147)" }}
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
          </div>
        </div>
      </div> : <> <h1>the profile hasn't been created yet</h1> {address?.toLowerCase() === ensName?.toLowerCase().slice(0, ensName.indexOf('.')) && <button
        type="button"
        className="btn btn-primary mb-3 create"
        data-bs-toggle="modal"
        data-bs-target="#createProfile"
        style={{
          backgroundColor: "rgb(40, 32, 74)",
          borderColor: "rgb(84, 67, 147)",
          color: "white",
        }}
      >
        Create Proifle
      </button>}</> : <></>}<Loader /> <div
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
            backgroundColor: "rgb(33, 37, 41)",
          }}
        >
          <div
            className="modal-header"
            style={{ borderColor: "rgb(84, 67, 147)" }}
          >
            <h1 className="modal-title fs-5" id="staticBackdropLabel">
              Create Profile
            </h1>
          </div>
          <div className="modal-body">
            <form
              id="create-form"
              onSubmit={handleSubmit((data) => submit(data))}
            >
              <div className="mb-3">
                <label htmlFor="name" className="form-label">
                  Name
                </label>
                <input
                  className="form-control"
                  id="name"
                  aria-describedby="nameHelp"
                  {...register("name")}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="linkedIn" className="form-label">
                  LinkedIn Account URL
                </label>
                <input
                  className="form-control"
                  id="linkedIn"
                  aria-describedby="LinkedInHelp"
                  {...register("LinkedIn")}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="x" className="form-label">
                  X Account Url
                </label>
                <input
                  className="form-control"
                  id="x"
                  aria-describedby="XHelp"
                  {...register("X")}
                />
              </div>
            </form>
          </div>
          <div
            className="modal-footer"
            style={{ borderColor: "rgb(84, 67, 147)" }}
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
    </div> </>
  );
};

export default HiCoinyProfile;
