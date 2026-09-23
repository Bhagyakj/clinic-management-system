import React from 'react';
import { useApp } from './AppContext.jsx';
import Login from './components/Login.jsx';
import RoleSelect from './components/RoleSelect.jsx';
import AppShell from './components/AppShell.jsx';
import { Toast } from './components/Shared.jsx';

export default function App() {
  const { screen } = useApp();
  return (
    <>
      {screen === 'login' && <Login />}
      {screen === 'roleselect' && <RoleSelect />}
      {screen === 'app' && <AppShell />}
      <Toast />
    </>
  );
}
