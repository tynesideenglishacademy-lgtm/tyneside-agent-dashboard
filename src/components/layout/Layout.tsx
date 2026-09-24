import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout: React.FC<{ onSignOut: () => void }> = ({ onSignOut }) => {
  return (
    <div className="app-container">
      <Sidebar />
      <main className="page-content">
        <button
          type="button"
          onClick={onSignOut}
          style={{
            position: 'fixed',
            top: 16,
            right: 18,
            zIndex: 1000,
            border: '1px solid rgba(255,255,255,.14)',
            borderRadius: 9,
            padding: '.55rem .8rem',
            background: 'rgba(7,17,31,.88)',
            color: '#fff',
            cursor: 'pointer'
          }}
        >
          Sign out
        </button>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
