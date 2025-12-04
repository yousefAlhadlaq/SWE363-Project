import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../Shared/Navbar';

const AppLayout = () => {
  return (
    <div className="min-h-screen bg-page">
      <Navbar />
      <Outlet />
    </div>
  );
};

export default AppLayout;
