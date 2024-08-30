import { useEffect, useState } from 'react'
import {
    AppConfig,
    UserSession,
} from "@stacks/connect";
import { StacksTestnet } from "@stacks/network";
import {
    callReadOnlyFunction,
    ReadOnlyFunctionOptions,
} from "@stacks/transactions";
import { principal } from "@stacks/transactions/dist/cl";
import { EnsDetails } from '../EnsDetails/EnsDetails';
import TransactionStatus from '../TransactionStatus/TransactionStatus';

const StProfile = ({ txId }: { txId: string }) => {
    const [userData, setUserData] = useState<any>(null);
    const [profiel, setProfile] = useState<any>(null)
    const [responseData, setResponseData] = useState<string>("Pending");


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
    useEffect(() => {
        if (responseData === "Success") {

            retrieveProfile()
        }

    }, [responseData])
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
        const value = (data as any).value.data
        if (value) {

            setProfile(JSON.parse(value))

        }


    };
    return (
        <>
            <TransactionStatus tx_id={txId} responseData={responseData} setResponseData={setResponseData} />
            {responseData === 'Success' && <div className='d-flex align-items-center justify-content-between 
                 text-primary-color font-weight-500 my-2' style={{ fontSize: "1.25rem" }}>Stacks Profile</div>}
            {profiel?.name && <EnsDetails propertyKey='Stacks Name' propertyValue={profiel?.name} />}
            {profiel?.email && <EnsDetails propertyKey='Email' propertyValue={profiel?.email} />}
            {profiel?.phone && <EnsDetails propertyKey='Phone' propertyValue={profiel?.phone} />}
            {profiel?.X && <EnsDetails propertyKey='X' propertyValue={profiel?.X} />}
            {profiel?.LinkedIn && <EnsDetails propertyKey='LinkedIn' propertyValue={profiel?.LinkedIn} />}
            {profiel?.about && <EnsDetails propertyKey='About' propertyValue={profiel?.about} />}
        </>
    )
}

export default StProfile