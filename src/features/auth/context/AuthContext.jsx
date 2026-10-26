import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { authService } from "../../../services/authService";
import { registerLogoutCallback } from "../../../services/core/apiClient";
import { sessionManager } from "../../../services/core/sessionManager";
import { connectSocket, disconnectSocket } from "@/lib/socket";
import { normalizeUser } from "@/lib/normalizers";

export const UserContext = createContext(null);
export const AuthContext = createContext(null);

const PUBLIC_MARKETING_PATHS = ["/", "/tutoriales", "/demo"];

const isMarketingPath = () =>
  typeof window !== "undefined" && PUBLIC_MARKETING_PATHS.includes(window.location.pathname);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(() => !isMarketingPath());
  const [sessionChecked, setSessionChecked] = useState(false);
  const sessionCheckRef = useRef(null);
  const [showWarning, setShowWarning] = useState(false);

  const handling401 = useRef(false);

  const isAuthenticated = !!user;

  const clearAll = useCallback(() => {
    try { authService.clearAllCache?.(); } catch {}
    try { sessionStorage.clear(); } catch {}
  }, []);

  const logout = useCallback(async (reason) => {
    sessionManager.stop();
    setShowWarning(false);

    try { await authService.logout(); } catch {}

    clearAll();
    setUser(null);

    const url = reason === 'expired'    ? '/login?expired=1'
              : reason === 'inactivity' ? '/login?inactivity=1'
              : '/login';

    window.location.replace(url);
  }, [clearAll]);

  // logout global por 401 real; el chequeo silencioso al arrancar no pasa por aquí
  useEffect(() => {
    handling401.current = false;

    registerLogoutCallback(() => {
      if (handling401.current) return;
      handling401.current = true;
      logout('expired');
    });
  }, [logout]);

  // padres y docentes no se desconectan por inactividad (su sesión dura un año y se
  // renueva sola en el backend); administradores sí, porque manejan datos de todos
  const sinCierrePorInactividad = ["padre", "padre/tutor", "docente"].includes(user?.rol);

  useEffect(() => {
    if (!isAuthenticated || sinCierrePorInactividad) {
      sessionManager.stop();
      setShowWarning(false);
      return;
    }

    sessionManager.start({
      onWarning: () => setShowWarning(true),
      onResume:  () => setShowWarning(false),
      onExpire:  () => logout('inactivity'),
    });

    return () => sessionManager.stop();
  }, [isAuthenticated, sinCierrePorInactividad, logout]);

  // un solo socket compartido para toda la app; cada pantalla se suscribe con getSocket()?.on(...)
  useEffect(() => {
    if (!isAuthenticated) {
      disconnectSocket();
      return;
    }

    connectSocket();

    return () => disconnectSocket();
  }, [isAuthenticated]);

  // pregunta silenciosa "¿quién soy?"; sin sesión válida, el catch deja user en null sin navegar
  const ensureSession = useCallback(() => {
    if (sessionCheckRef.current) return sessionCheckRef.current;
    setLoading(true);
    sessionCheckRef.current = (async () => {
      try {
        const profile = await authService.getProfile();
        setUser(normalizeUser(profile.user ?? profile));
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
        setSessionChecked(true);
      }
    })();
    return sessionCheckRef.current;
  }, []);

  useEffect(() => {
    if (!isMarketingPath()) ensureSession();
  }, [ensureSession]);

  const login = useCallback(async (credentials) => {
    const data = await authService.login(credentials);

    if (data?.user) {
      setUser(normalizeUser(data.user));
    }
    sessionCheckRef.current = Promise.resolve();
    setSessionChecked(true);

    return data;
  }, []);

  const updateUser = useCallback((partialUser) => {
    if (!partialUser) return;
    setUser(prev => {
      const merged = prev ? { ...prev, ...partialUser } : partialUser;
      return normalizeUser(merged);
    });
  }, []);

  const stayLoggedIn = useCallback(() => {
    setShowWarning(false);
    sessionManager.reset();
  }, []);

  // seleccionarPerfil() solo reemplaza la cookie; esto vuelve a preguntar
  // "¿quién soy?" para que `user` refleje el perfil recién activado
  const switchProfile = useCallback(async () => {
    try {
      const profile = await authService.getProfile();
      setUser(normalizeUser(profile.user ?? profile));
      return true;
    } catch {
      return false;
    }
  }, []);

  const userValue = useMemo(
    () => ({ user, isAuthenticated, login, logout, updateUser, switchProfile }),
    [user, isAuthenticated, login, logout, updateUser, switchProfile]
  );

  const fullValue = useMemo(
    () => ({ ...userValue, loading, sessionChecked, ensureSession, showWarning, stayLoggedIn }),
    [userValue, loading, sessionChecked, ensureSession, showWarning, stayLoggedIn]
  );

  return (
    <UserContext.Provider value={userValue}>
      <AuthContext.Provider value={fullValue}>
        {children}
      </AuthContext.Provider>
    </UserContext.Provider>
  );
};

export const useAuthContext = () => {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext debe usarse dentro de <AuthProvider>");
  return ctx;
};

export const useUserContext = () => {
  const ctx = React.useContext(UserContext);
  if (!ctx) throw new Error("useUserContext debe usarse dentro de <AuthProvider>");
  return ctx;
};