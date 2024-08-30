import axios from 'axios';

export const getBalance = async (address: string, apiKey: string) => {
    try {
        const baseURL = `https://eth-mainnet.g.alchemy.com/v2/${apiKey}`;

        const data = JSON.stringify({
            jsonrpc: '2.0',
            method: 'alchemy_getTokenBalances',
            headers: {
                'Content-Type': 'application/json',
            },
            params: [`${address}`],
            id: 42,
        });

        const { data: response } = await axios.post(baseURL, data, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const balances = response.result;

        const nonZeroBalances = balances.tokenBalances.filter((token: any) => {
            return (
                token.tokenBalance !==
                '0x0000000000000000000000000000000000000000000000000000000000000000'
            );
        });

        const tokens = [];
        if (nonZeroBalances.length == 0) {
            return [];
        }
        for (const token of nonZeroBalances) {
            let balance = token.tokenBalance;

            // options for making a request to get the token metadata
            const options = {
                method: 'POST',
                url: baseURL,
                headers: {
                    accept: 'application/json',
                    'content-type': 'application/json',
                },
                data: {
                    id: 1,
                    jsonrpc: '2.0',
                    method: 'alchemy_getTokenMetadata',
                    params: [token.contractAddress],
                },
            };

            // getting the token metadata
            const { data: response } = await axios.post(baseURL, options.data, {
                headers: options.headers,
            });

            const metadata = response.result;

            // Compute token balance in human-readable format
            balance = balance / Math.pow(10, metadata.decimals);
            balance = balance.toFixed(2);
            tokens.push({
                name: metadata.name,
                symbol: metadata.symbol,
                logo: metadata.logo
                    ? metadata.logo
                    : `https://github.com/trustwallet/assets/blob/master/blockchains/${metadata.name?.toLowerCase()}/info/logo.png?raw=true`,
                balance: balance,
            });
        }
        return tokens;
    } catch (error) {
        return [];
    }
};
