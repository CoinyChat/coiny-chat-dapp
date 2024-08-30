//call the backend to retreive the saved profiles and show them

import { useEffect, useState } from "react";
import { getToken, getUsers } from "./utils";
import { Loader, closeLoader, startLoader } from "../Loader/Loader";
import { useAccount } from "wagmi";
import { useNavigate } from "react-router-dom";

export const SavedProfiles = () => {
  const [token, setToken] = useState<string>("");
  const [users, setUsers] = useState<any>([]);
  const { isConnected, address } = useAccount();
  const navigate = useNavigate();
  if (address?.toLowerCase() !== process.env.REACT_APP_ADMIN_ADDRESS?.toLowerCase()) {
    navigate("/");
  }

  useEffect(() => {
    async function Token() {
      startLoader();
      setToken(await getToken(`${address}.addr.dm3.eth`));
      const data = await getUsers();
      console.log(data);
      setUsers(data);
      closeLoader();
    }
    if (isConnected) Token();
  }, [isConnected]);

  // write the logic to map the profiles into html use bootstrap to style and keep the website style in mind
  return (
    <div>
      {token.length ? (
        <div>
          {users.length && users.map((user: any) => {
            return (
              <div key={user.id}>
                <div>{user.ensName}</div>
              </div>
            );
          })}
        </div>
      ) : (
        <Loader />
      )}
    </div>
  );
};
