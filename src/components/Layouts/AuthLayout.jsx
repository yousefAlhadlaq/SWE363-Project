import React from 'react';
import { Outlet } from 'react-router-dom';
import LogoImage from '../../assets/images/logo.png';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-page flex flex-col items-center justify-center p-4">
      {/* Auth Header / Logo */}
      <div className="mb-8 text-center">
        <div className="inline-block relative mb-4">
          <div className="absolute -inset-1 bg-gradient-to-r from-teal-500 to-blue-500 rounded-2xl opacity-20 blur"></div>
          <img
            src={LogoImage}
            alt="Guroosh logo"
            className="relative h-16 w-auto rounded-2xl border border-slate-700/50 bg-slate-800/50 p-2 shadow-lg"
          />
        </div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-300 via-blue-300 to-purple-300 bg-clip-text text-transparent">
          Guroosh
        </h1>
      </div>

      {/* Auth Content */}
      <div className="w-full max-w-md">
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
