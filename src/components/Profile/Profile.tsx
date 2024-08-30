import { useContext, useEffect, useState } from 'react';
import closeIcon from '../../assets/images/cross.svg';
import profPic from '../../assets/images/human.svg';
import { AuthContext } from '../../context/AuthContext';
import { ConversationContext } from '../../context/ConversationContext';
import { useMainnetProvider } from '../../hooks/mainnetprovider/useMainnetProvider';
import { EnsProfileDetails } from '../../interfaces/utils';
import '../../styles/profile-contact.css';
import {
    getAvatarProfilePic,
    getEnsProfileDetails,
    onClose,
    openEnsProfile,
} from '../../utils/ens-utils';
import { Button } from '../Button/Button';
import { openConfigurationModal } from '../ConfigureProfile/bl';
import { EnsDetails } from '../EnsDetails/EnsDetails';
import { DM3ConfigurationContext } from '../../context/DM3ConfigurationContext';
import { UiViewContext } from '../../context/UiViewContext';
import { ModalContext } from '../../context/ModalContext';
import { useNavigate } from "react-router-dom";

export function Profile() {
    const { account, ethAddress, displayName } = useContext(AuthContext);

    const { setSelectedContactName } = useContext(ConversationContext);

    const { screenWidth, dm3Configuration } = useContext(
        DM3ConfigurationContext,
    );

    const { setSelectedRightView } = useContext(UiViewContext);

    const { setShowProfileConfigurationModal, setShowPreferencesModal } =
        useContext(ModalContext);

    const mainnetProvider = useMainnetProvider();

    const navigate = useNavigate();

    const [profilePic, setProfilePic] = useState<string>('');
    const [github, setGithub] = useState<string>('Not set');
    const [twitter, setTwitter] = useState<string>('Not set');
    const [linkedin, setLinkedin] = useState<string>("Not set");
    const [email, setEmail] = useState<string>("Not set");
    const [emailButton, setEmailButton] = useState<boolean>(false);
    const [emailNewValue, setEmailNewValue] = useState<string>("");

    const [phone, setPhone] = useState<string>("Not set");
    const [phoneButton, setPhoneButton] = useState<boolean>(false);
    const [phoneNewValue, setPhoneNewValue] = useState<string>("");

    // fetches and updates ENS profile details
    const fetchUserEnsProfileDetails = async () => {
        const ensDetails: EnsProfileDetails = await getEnsProfileDetails(
            mainnetProvider!,
            account?.ensName as string
        );
        ensDetails.github && setGithub(ensDetails.github);
        ensDetails.twitter && setTwitter(ensDetails.twitter);
        ensDetails.email && setEmail(ensDetails.email);
        ensDetails.linkedin && setLinkedin(ensDetails.linkedin);
    };

    // method to fetch profile pic
    const fetchAndSetProfilePic = async () => {
        setProfilePic(
            await getAvatarProfilePic(
                mainnetProvider,
                account?.ensName as string,
                dm3Configuration.addressEnsSubdomain,
            ),
        );
    };

    useEffect(() => {
        fetchAndSetProfilePic();
        fetchUserEnsProfileDetails();
    }, []);

    return (
        <div className="profile-container-type h-100">
            <div
                className="d-flex align-items-center justify-content-between 
                profile-heading text-primary-color font-weight-500"
            >
                Profile
                <img
                    className="pointer-cursor close-icon"
                    src={closeIcon}
                    alt="close"
                    onClick={() =>
                        onClose(
                            setSelectedRightView,
                            setSelectedContactName,
                            screenWidth,
                            dm3Configuration.showContacts
                        )
                    }
                />
            </div>

            <div className="profile-details-container text-primary-color">
                <img
                    src={profilePic ? profilePic : profPic}
                    alt="profile-pic"
                    className="border-radius-4 profile-image"
                />

                <div className="profile-detail-items mt-3">
                    <EnsDetails propertyKey={"Name"} propertyValue={displayName ?? ""} />
                    <EnsDetails
                        propertyKey={"Address"}
                        propertyValue={ethAddress as string}
                    />
                    <EnsDetails propertyKey={"E-Mail"} propertyValue={email} />
                    <EnsDetails propertyKey={"Github"} propertyValue={github} />
                    <EnsDetails propertyKey={"Twitter"} propertyValue={twitter} />
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <EnsDetails propertyKey={"Phone"} propertyValue={phone} />
                        <div style={{ marginLeft: "10px" }}>
                            <Button
                                actionMethod={() => {
                                    if (phoneButton) setPhone(phoneNewValue);
                                    setPhoneButton(!phoneButton);
                                }}
                                buttonText={!phoneButton ? "Edit" : "Save"}
                            />
                        </div>
                        {phoneButton && (
                            <div style={{ marginLeft: "10px" }}>
                                <input
                                    type="phone"
                                    value={phoneNewValue}
                                    onChange={(e) => setPhoneNewValue(e.target.value)}
                                />
                            </div>
                        )}
                    </div>

                    <div style={{ marginTop: 6, display: "flex", alignItems: "center" }}>
                        <EnsDetails propertyKey={"E-Mail"} propertyValue={email} />
                        <div style={{ marginLeft: "10px" }}>
                            <Button
                                actionMethod={() => {
                                    if (emailButton) setEmail(emailNewValue);
                                    setEmailButton(!emailButton);
                                }}
                                buttonText={!emailButton ? "Edit" : "Save"}
                            />
                        </div>
                        {emailButton && (
                            <div style={{ marginLeft: "10px" }}>
                                <input
                                    type="email"
                                    value={emailNewValue}
                                    onChange={(e) => setEmailNewValue(e.target.value)}
                                />
                            </div>
                        )}
                    </div>

                    <div style={{ marginTop: 6, display: "flex", alignItems: "center" }}>
                        <EnsDetails propertyKey={"Github"} propertyValue={github} />
                        {
                            <div style={{ marginLeft: "10px" }}>
                                <Button actionMethod={() => { }} buttonText="Authorize" />
                            </div>
                        }
                    </div>

                    <div style={{ marginTop: 6, display: "flex", alignItems: "center" }}>
                        <EnsDetails propertyKey={"Twitter"} propertyValue={twitter} />
                        {linkedin === "Not set" && (
                            <div style={{ marginLeft: "10px" }}>
                                <Button
                                    actionMethod={() =>
                                        window.open("http://localhost:8000/api/auth/twitter")
                                    }
                                    buttonText="Authorize"
                                />
                            </div>
                        )}
                    </div>

                    <div style={{ marginTop: 6, display: "flex", alignItems: "center" }}>
                        <EnsDetails propertyKey={"LinkedIn"} propertyValue={linkedin} />
                        <div style={{ marginLeft: "10px" }}>
                            <Button
                                actionMethod={() =>
                                    window.open("http://localhost:8000/api/auth/linkedin")
                                }
                                buttonText="Authorize"
                            />
                        </div>
                    </div>

                    <div className="ens-btn-container">
                        <Button
                            buttonText="Open Hi-Coiny profile"
                            actionMethod={() => navigate(`/profile/${account?.ensName}`)}
                        />
                    </div>

                    <div className="configure-btn-container">
                        <Button
                            buttonText="Open ENS profile"
                            actionMethod={() => openEnsProfile(account?.ensName as string)}
                        />
                    </div>

                    <div className="configure-btn-container">
                        <Button
                            buttonText="Configure dm3 profile"
                            actionMethod={() =>
                                openConfigurationModal(
                                    setShowProfileConfigurationModal,
                                    setShowPreferencesModal
                                )
                            }
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
