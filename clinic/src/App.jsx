import React, { useEffect } from 'react';
import { useApp } from './AppContext.jsx';
import Login from './components/Login.jsx';
import Register from './components/Register.jsx';
import AppShell from './components/AppShell.jsx';
import { Toast } from './components/Shared.jsx';

export default function App() {
  const { screen, restoreSession } = useApp();

  useEffect(() => {
    restoreSession(); // if a token is saved (e.g. after a page refresh), log back in automatically
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {screen === 'login' && <Login />}
      {screen === 'register' && <Register />}
      {screen === 'app' && <AppShell />}
      <Toast />
    </>
  );
}
