import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { getUserInfo } from "../api/examApi";

type UserInfo = {
  plan: string;
  usedThisMonth: number;
};

type UserContextType = {
  info: UserInfo | null;
  isLoading: boolean;
  refresh: () => void;
};

const UserContext = createContext<UserContextType>({
  info: null,
  isLoading: true,
  refresh: () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const [info, setInfo] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchInfo = useCallback(() => {
    const token = session?.access_token;
    if (!token) { setIsLoading(false); return; }
    setIsLoading(true);
    getUserInfo(token)
      .then((data) => { setInfo(data); setIsLoading(false); })
      .catch(() => { setIsLoading(false); });
  }, [session?.access_token]);

  // Fetch once when session becomes available; re-fetch only when token changes (login/logout)
  useEffect(() => {
    setInfo(null);
    fetchInfo();
  }, [fetchInfo]);

  return (
    <UserContext.Provider value={{ info, isLoading, refresh: fetchInfo }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
