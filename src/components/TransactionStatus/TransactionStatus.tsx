import React, { useState, useEffect } from "react";
import axios from "axios";
import './styles.css'
const TransactionStatus = ({ tx_id, responseData, setResponseData }: { tx_id: string, responseData: any, setResponseData: any }) => {
    const [show, setShow] = useState(false);
    const [isPolling, setIsPolling] = useState(false);

    const fetchData = async () => {
        try {

            if (tx_id) {
                setShow(true);
                const response = await checkStatus(tx_id); // Replace with your endpoint
                if (response.tx_status === "pending" && responseData == "Success") {
                    setResponseData("Pending");
                }


                // Check if the response matches the target value
                if (response.tx_status === "success") {
                    setIsPolling(false); // Stop polling if the target response is received
                    setResponseData("Success");
                }
                if (response.tx_status !== "success" && response.tx_status !== "pending") {
                    setIsPolling(false); // Stop polling if the target response is received
                    setResponseData("Rejected");
                    localStorage.setItem('profileRejected', 'true');
                }
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    useEffect(() => {

        let intervalId: NodeJS.Timeout;
        startPolling();
        if (isPolling) {
            intervalId = setInterval(fetchData, 1000); // Poll every 0.5 seconds
        }

        return () => {
            clearInterval(intervalId); // Cleanup on unmount or when polling stops
        };

    }, [isPolling, tx_id]);

    const startPolling = () => {
        setIsPolling(true);
        fetchData(); // Initial fetch before starting the interval
    };

    //   useEffect(() => {
    //     const txHash =
    //       "0x84f2b84241dc6978e92169e53b678fce080e4f98c63a5e3fab7d6a29780a3d67";
    //     if (txHash) {
    //     }
    //   }, []);

    const checkStatus = async (tx_id: string) => {
        const message = await axios.get(
            "https://api.testnet.hiro.so/extended/v1/tx/" + tx_id
        );
        console.log(message.data);
        return message.data;
    };

    return (
        <>
            {show && (
                <div>
                    {/* <div
                        className="position-fixed top-0 end-0 bg-indigo text-white p-2 rounded shadow scale-on-hover"
                    //   title={getStatusText(txStatus)}
                    >
                        {responseData}
                    </div> */}
                    {responseData !== 'Success' && <div className="configure-btn-container mb-2">

                        <div className="common-btn font-weight-400 border-radius-4 normal-btn text-primary-color normal-btn-border">
                            <strong>Status:</strong> <span id="transaction-status">{responseData}</span>
                        </div>
                    </div>}
                </div>
            )}
        </>
    );
};

export default TransactionStatus;