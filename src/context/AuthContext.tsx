import { createContext, useContext, useState, ReactNode } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  username: string | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem("trekking-auth") === "true";
  });
  const [username, setUsername] = useState<string | null>(() => {
    return sessionStorage.getItem("trekking-user");
  });

  const login = (user: string, pass: string) => {
    // MVP: single test account
    if (user === "user" && pass === "password") {
      setIsAuthenticated(true);
      setUsername(user);
      sessionStorage.setItem("trekking-auth", "true");
      sessionStorage.setItem("trekking-user", user);
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUsername(null);
    sessionStorage.removeItem("trekking-auth");
    sessionStorage.removeItem("trekking-user");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, username, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
