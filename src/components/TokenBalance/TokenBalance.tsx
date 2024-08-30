import { useEffect, useState } from "react";
import { getBalance } from "./getBalance";
import loader from "../../assets/images/loader.svg";
import { ethers } from "ethers";

type Props = {
  address: string | undefined;
};
type Token = {
  name: string;
  logo: string;
  bitcoin: string;
  usdt: string;
};

const TokenBalance = ({ address }: Props) => {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchTokens = async () => {
      setIsLoading(true);
      const tokens = await getBalance(
        address as string,
        process.env.REACT_APP_ALCHEMY_API_KEY as string
      );
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(
          window.ethereum as ethers.providers.ExternalProvider
        );
        const balance = await provider.getBalance(address as string);
        const etherBalance = ethers.utils.formatEther(balance);
        if (etherBalance !== "0.0") {
          setTokens([
            {
              name: "ETH",
              logo: `https://github.com/trustwallet/assets/blob/master/blockchains/ethereum/info/logo.png?raw=true`,
              bitcoin: etherBalance,
              usdt: etherBalance,
            },
          ]);
        }
      }
      if (tokens.length === 0) {
        setIsLoading(false);
        return;
      }
      const updatedTokens = tokens.map((data) => {
        return {
          name: data.name,
          logo: data.logo,
          bitcoin: data.balance,
          usdt: data.balance,
        };
      });

      setIsLoading(false);
      setTokens((prev) => [...prev, ...updatedTokens]);
    };

    fetchTokens();
  }, [address]);

  const generateRows = () => {
    return tokens.map((token) => (
      <li
        key={token.name}
        className="list-group-item d-flex justify-content-between align-items-center"
        style={{ backgroundColor: "#28204A", borderColor: "#544393" }}
      >
        <img
          src={token.logo}
          alt={token.name}
          className="img-fluid rounded-circle"
          style={{ width: "30px", height: "30px" }}
        />
        <span className="badge bg-primary rounded-pill">
          Balance: {token.bitcoin}
        </span>
        {/* <span className="badge bg-secondary rounded-pill">
          USDT Balance: {token.usdt}
        </span> */}
      </li>
    ));
  };
  return (
    <div className="col-12 col-xl-6 mb-3">
      <div className="container">
        <div className="row">
          <div className="col">
            <div
              className="scrollable-div"
              style={{ maxHeight: "300px", overflowY: "auto" }}
            >
              {isLoading && (
                <img
                  className="rotating loader-img"
                  src={loader}
                  alt="loader"
                />
              )}

              {!isLoading && <ul className="list-group">{generateRows()}</ul>}
              {!isLoading && tokens.length === 0 && <h1>No Tokens</h1>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenBalance;
