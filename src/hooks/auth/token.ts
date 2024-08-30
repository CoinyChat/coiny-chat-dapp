import axios from 'axios';
import { Method } from 'axios';

const baseURL = process.env.REACT_APP_HI_COINY_BACKEND_BASE_URL;

export const getToken = async (ensName: string) => {
    const config = {
        method: 'get' as Method,
        maxBodyLength: Infinity,
        url: `${baseURL}api/auth/request-challenge/${ensName.toLowerCase()}`,
        headers: {},
    };
    const { data } = await axios.request(config);

    const body = JSON.stringify({
        signature: `${data.challenge}`,
    });

    const postConfig = {
        method: 'post' as Method,
        maxBodyLength: Infinity,
        url: `${baseURL}api/auth/get-token/${ensName.toLowerCase()}`,
        headers: {
            'Content-Type': 'application/json',
        },
        data: body,
    };
    const response = await axios.request(postConfig);
    console.log(response);

    return response.data.token;
};
