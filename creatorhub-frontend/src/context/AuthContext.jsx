import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [user, setUser] = useState(null);

  // BUG FIX: decode the JWT payload to populate `user` on mount and whenever
  // the token changes. Previously `user` was always null because nothing ever
  // called setUser with a value — the Sidebar showed "U" / blank email and
  // any component that read `user` got null.
  useEffect(() => {
    if (!token) {
      setUser(null);
      return;
    }
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUser({ id: payload.id, name: payload.name, email: payload.email });
    } catch {
      // malformed token — clear it
      setUser(null);
    }
  }, [token]);

  const login = (tokenValue) => {
    localStorage.setItem("token", tokenValue);
    setToken(tokenValue);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);