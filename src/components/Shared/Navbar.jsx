import React from "react";
import { Link } from "react-router-dom";
import LogoImage from "../../assets/images/logo.png";

function Navbar() {
  return (
    <nav className="border-b border-white/5 bg-gradient-to-r from-brand-midnight via-brand-deep to-brand-teal/80 text-white shadow-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-3">
          <img
            src={LogoImage}
            alt="Quroosh logo"
            className="h-10 w-auto rounded-2xl border border-white/10 bg-white/10 p-1 shadow-inner shadow-black/40"
          />
          <div>
            <p className="text-base font-semibold tracking-wide text-white">
              Quroosh
            </p>
            <p className="text-xs uppercase tracking-[0.3em] text-white/70">
              Financial Platform
            </p>
          </div>
        </Link>
        <span className="text-xs font-medium uppercase tracking-[0.4em] text-brand-aqua/70">
          Empower Advisors
        </span>
      </div>
    </nav>
  );
}

export default Navbar;
