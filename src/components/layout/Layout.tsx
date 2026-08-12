import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout: React.FC = () => {
  return (
    <div className="app-container">
      <Sidebar />
      <main className="page-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
