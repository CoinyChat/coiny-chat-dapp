import axios from 'axios';
import { Method } from 'axios';

const baseURL = process.env.REACT_APP_HI_COINY_BACKEND_BASE_URL;
console.log(baseURL);

export const getToken = async (ensName: string) => {
    try {
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
    } catch (error) {
        console.log(error);
    }
};

export const getUser = async (ensName: string) => {
    const config = {
        method: 'get' as Method,
        maxBodyLength: Infinity,
        url: `${baseURL}api/users/${ensName.toLowerCase()}`,
        headers: {},
    };
    try {
        const { data } = await axios.request(config);
        return data;
    } catch (error) {
        console.log(error);
        return { key: 'notfound' };
    }
};

export const saveProfile = async (
    ensName: string,
    displayName: string | undefined,
    data: any,
    token: string | undefined,
    hi?: boolean,
) => {
    try {
        if (!token) {
            token = await getToken(ensName);
        }
        const sentData: any = {
            profile: data,
        };
        if (displayName) {
            sentData.name = displayName;
        }
        sentData.hi = hi;
        const config = {
            method: 'patch' as Method,
            maxBodyLength: Infinity,
            url: `${baseURL}api/users/${ensName.toLowerCase()}`,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            data: JSON.stringify(sentData),
        };
        const response = await axios.request(config);
        console.log(response);
        return response.data;
    } catch (error) {
        console.log(error);
    }
};
