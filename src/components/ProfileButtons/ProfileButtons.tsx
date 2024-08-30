import React, { useEffect } from 'react'
import { Button } from '../Button/Button';
import { useAccount } from 'wagmi'
import { isHighCoinyWalletCreated } from '../FastHighcoinyWallet/CreateHighcoinyWallet';
import StacksProfile from '../StacksProfile/StacksProfile';
import StProfile from '../StProfile/StProfile';


const ProfileButtons = ({ displayName, account, navigate }: { displayName: any, account: any, navigate: any }) => {
    const { isConnected } = useAccount();
    const [txId, setTxId] = React.useState<string>()
    const [walletName, setWalletName] = React.useState<string>()
    useEffect(() => {
        const tx_id = localStorage.getItem('txId')
        const wallet = localStorage.getItem('walletname')
        if (wallet)
            setWalletName(wallet)
        if (tx_id) {

            setTxId(tx_id)
        }
    }, [txId])
    return (
        <>
            {(walletName !== 'stacks') && <>
                <div className="ens-btn-container">
                    <Button
                        buttonText="View Coiny Chat profile"
                        actionMethod={() =>
                            window.open(`/profile/${displayName}`, '_blank', 'noopener noreferrer')
                        }
                    />
                </div>

                <div className="configure-btn-container">
                    <Button
                        buttonText="Update Coiny Chat profile"
                        actionMethod={() =>
                            navigate(`/update-profile/${account?.ensName}`)
                        }
                    />
                </div>
            </>}
            {walletName === 'stacks' && !(txId) &&
                <>
                    {/* <StacksProfile /> */}
                    <div className="configure-btn-container">
                        <Button
                            buttonText="Save Profile on Stacks"
                            actionMethod={() =>
                                navigate(`/stacks-profile/`)
                            }
                        />
                    </div>
                </>

            }
            {walletName === 'stacks' && txId && <StProfile txId={txId} />}
        </>
    )
}

export default ProfileButtons