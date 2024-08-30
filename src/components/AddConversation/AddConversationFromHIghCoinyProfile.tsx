import { ethers } from 'ethers';
import { FormEvent, useContext, useEffect, useState } from 'react';
import closeIcon from '../../assets/images/cross.svg';
import { AuthContext } from '../../context/AuthContext';
import { ConversationContext } from '../../context/ConversationContext';
import { ModalContext } from '../../context/ModalContext';
import { TLDContext } from '../../context/TLDContext';
import { UiViewContext } from '../../context/UiViewContext';
import '../../styles/modal.css';
import {
    LeftViewSelected,
    RightViewSelected,
} from '../../utils/enum-type-utils';
import { closeLoader, startLoader } from '../Loader/Loader';
import './AddConversation.css';

// class for input field
export const INPUT_FIELD_CLASS =
    'conversation-name font-weight-400 border-radius-6 w-100 line-height-24';

export default function AddConversationFromHIghCoinyProfile() {
    const { addConversation, setSelectedContactName } =
        useContext(ConversationContext);
    const { ethAddress } = useContext(AuthContext);
    const { resolveTLDtoAlias } = useContext(TLDContext);
    const { setSelectedLeftView, setSelectedRightView } =
        useContext(UiViewContext);
    const {

        setLoaderContent,
        setAddConversation,
    } = useContext(ModalContext);

    const [name, setName] = useState<string>('');
    const [showError, setShowError] = useState<boolean>(false);
    const [errorMsg, setErrorMsg] = useState<string>('');
    const [inputClass, setInputClass] = useState<string>(INPUT_FIELD_CLASS);
    const [showAddConversationModalFromHIghCoinyProfile, setShowAddConversationModalFromHIghCoinyProfile] = useState(false);
    const dm3nameDirectConversation = new URLSearchParams(location.search).get("dm3name");

    const nameDirectConversation = new URLSearchParams(location.search).get("name");
    const {
        setShowAddConversationModal,

    } = useContext(ModalContext);
    // handles new contact submission
    const startConvrsation = async (name: string) => {

        // start loader
        setLoaderContent('Adding contact...');
        startLoader();

        const ensNameIsInvalid =
            ethAddress &&
            name.split('.')[0] &&
            ethAddress.toLowerCase() === name.split('.')[0].toLowerCase();

        if (ensNameIsInvalid) {
            setErrorMsg('Please enter valid ENS name');
            setShowError(true);
            return;
        }
        //Checks wether the name entered, is an tld name. If yes, the TLD is substituded with the alias name
        const aliasName = await resolveTLDtoAlias(name);

        const addConversationData = {
            active: true,
            ensName: aliasName,
            processed: false,
        };

        // set new contact data
        setAddConversation(addConversationData);

        // set left view to contacts
        setSelectedLeftView(LeftViewSelected.Contacts);

        // set right view to chat
        setSelectedRightView(RightViewSelected.Chat);

        const newContact = await addConversation(aliasName);
        if (!newContact) {
            //Maybe show a message that its not possible to add the users address as a contact
            setShowAddConversationModalFromHIghCoinyProfile(false);
            closeLoader();
            return;
        }
        setSelectedContactName(newContact.contactDetails.account.ensName);
        closeLoader();

        // close the modal
        setShowAddConversationModalFromHIghCoinyProfile(false);

    }



    useEffect(() => {

        if (dm3nameDirectConversation) {
            setShowAddConversationModalFromHIghCoinyProfile(true);
            startConvrsation(dm3nameDirectConversation + '');
        }

    }, []);
    return (
        <>
            {
                showAddConversationModalFromHIghCoinyProfile && <div  >
                    <div style={{ color: '#ec8129' }}
                        id="conversation-modal"
                        className="modal-container position-fixed w-100 h-100"
                    >
                        <div
                            className="conversation-modal-content border-radius-6 
                background-container text-primary-color"
                        >
                            <div className="d-flex align-items-start">
                                <div className="width-fill">
                                    <h4 className="font-weight-800 mb-1">
                                        opening chat  with HighCoiny user {nameDirectConversation + ''}
                                    </h4>
                                    {dm3nameDirectConversation + ''}
                                    <div className="font-weight-500 font-size-12">
                                        please wait ...
                                    </div>
                                </div>

                            </div>




                        </div>
                    </div>
                </div>
            }
        </>

    );
}
