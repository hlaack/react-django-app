import React, { createContext, useContext, useState, useCallback } from 'react';
import { LoginModal } from '../components/LoginModal';

interface LoginModalContextValue {
  openLogin: () => void;
}

const LoginModalContext = createContext<LoginModalContextValue | undefined>(undefined);

/**
 * Holds the login-modal open state and renders the modal itself, so any part
 * of the app (navbar, notes panel, …) can trigger sign-in via `openLogin()`
 * without navigating away from the current page.
 */
export const LoginModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const openLogin = useCallback(() => setIsOpen(true), []);
  const closeLogin = useCallback(() => setIsOpen(false), []);

  return (
    <LoginModalContext.Provider value={{ openLogin }}>
      {children}
      {isOpen && <LoginModal onClose={closeLogin} />}
    </LoginModalContext.Provider>
  );
};

export const useLoginModal = (): LoginModalContextValue => {
  const context = useContext(LoginModalContext);
  if (!context) throw new Error('useLoginModal must be used within a LoginModalProvider');
  return context;
};
