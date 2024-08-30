import { useEffect, useState } from "react";
import {
    AppConfig,
    UserSession,
    showConnect,
    openContractCall,
    ContractCallOptions,
} from "@stacks/connect";
import { StacksTestnet } from "@stacks/network";
import {
    callReadOnlyFunction,
    ReadOnlyFunctionOptions,
    stringUtf8CV,
} from "@stacks/transactions";
import { useForm, SubmitHandler } from "react-hook-form";
import { principal } from "@stacks/transactions/dist/cl";
import TransactionStatus from "../TransactionStatus/TransactionStatus";
import backLogo from '../../assets/images/back.svg';
import { useNavigate } from "react-router-dom";

function StacksProfile() {
    const navigate = useNavigate();
    interface UserProfile {
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
    } = useForm<UserProfile>();

    const [userData, setUserData] = useState<any>(null);


    const appConfig = new AppConfig(["store_write"]);
    const userSession = new UserSession({ appConfig });
    const appDetails = {
        name: "User Profile",
        icon: "https://freesvg.org/img/1541103084.png",
    };

    useEffect(() => {
        if (userSession.isSignInPending()) {
            userSession.handlePendingSignIn().then((userData) => {
                setUserData(userData);
            });
        } else if (userSession.isUserSignedIn()) {
            setUserData(userSession.loadUserData());
        }
    }, []);

    const connectWallet = () => {
        showConnect({
            appDetails,
            onFinish: () => window.location.reload(),
            userSession,
        });
    };
    const onSubmit: SubmitHandler<UserProfile> = async (data) => {
        const network = new StacksTestnet();
        const options: ContractCallOptions = {
            contractAddress: "ST3TXDRZED5SR4HAHFW04R225QTB3WSDD9SQFJ01E",
            contractName: "user-profiles",
            functionName: "store-profile",
            functionArgs: [stringUtf8CV(JSON.stringify(data))],
            network,
            appDetails,
            onFinish: ({ txId }) => {
                localStorage.setItem("txId", txId);
                localStorage.setItem('profileRejected', 'false');

            },
        };
        await openContractCall(options);
        navigate('..')
    };

    const retrieveProfile = async () => {
        const { profile } = userSession.loadUserData();

        const network = new StacksTestnet();

        const options: ReadOnlyFunctionOptions = {
            contractAddress: "ST3TXDRZED5SR4HAHFW04R225QTB3WSDD9SQFJ01E",
            contractName: "user-profiles",
            functionName: "get-profile",
            functionArgs: [principal(profile.stxAddress.testnet as string)],
            network,
            senderAddress: profile.stxAddress.testnet as string,
        };
        const data = await callReadOnlyFunction(options);


    };

    return (
        <>
            <button
                className="btn rounded-circle text-white"
                onClick={() => navigate('..')}
            >
                <img src={backLogo} alt="" />
            </button>
            {/* <TransactionStatus tx_id={localStorage.getItem("txId") as string} /> */}
            <div className="d-flex flex-column justify-content-center align-items-center min-vh-100 gap-4">
                {!userData && (
                    <button
                        className="form-control"
                        onClick={connectWallet}
                    >
                        Connect Wallet
                    </button>
                )}
                <h1 className="display-1 fw-bold">Hello Stacks</h1>
                {userData && (
                    <div className="d-flex gap-3">
                        <form
                            className="d-flex flex-column gap-3"
                            onSubmit={handleSubmit(onSubmit)}
                        >
                            <input
                                className="form-control"
                                type="text"
                                {...register("name", { required: true })}
                                placeholder="Name"
                            />
                            {errors.name && <span>This field is required</span>}
                            <input
                                type="email"
                                className="form-control"
                                {...register("email", { required: true })}
                                placeholder="Email"
                            />
                            {errors.email && <span>This field is required</span>}
                            <input
                                type="text"
                                className="form-control"
                                {...register("phone", { required: true })}
                                placeholder="Phone"
                            />
                            {errors.phone && <span>This field is required</span>}
                            <input
                                type="text"
                                className="form-control"
                                {...register("LinkedIn", { required: true })}
                                placeholder="LinkedIn"
                            />
                            {errors.LinkedIn && <span>This field is required</span>}
                            <input
                                type="text"
                                className="form-control"
                                {...register("X", { required: true })}
                                placeholder="X"
                            />
                            {errors.X && <span>This field is required</span>}
                            <textarea
                                className="form-control"
                                {...register("about", { required: true })}

                            />
                            {errors.about && <span>This field is required</span>}
                            <button
                                className=" btn btn-primary p-3  rounded text-white"
                                type="submit"
                            // onClick={retrieveMessage}
                            >
                                Save Profile
                            </button>
                        </form>
                    </div>
                )}

                {/* {userData && (
                    <div className="flex gap-4">
                        <button
                            className="btn btn-primary bg-primary rounded text-white"
                            onClick={retrieveProfile}
                        >
                            Retrieve Message
                        </button>
                    </div>
                )} */}

                {/* {currentMessage.length > 0 ? (
        <p className="text-2xl">{currentMessage}</p>
      ) : (
        ""
      )} */}
            </div>
        </>
    );
}

export default StacksProfile;