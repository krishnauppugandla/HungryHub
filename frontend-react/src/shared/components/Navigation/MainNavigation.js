import React from "react";
import { Link } from "react-router-dom";
import NavLinks from "./NavLinks";
import "./MainNavigation.css";

const MainNavigation = () => {
  return (
    <nav className="main-nav">
      <Link to="/restaurants" className="main-nav__brand">
        🍔 HungryHub
      </Link>
      <NavLinks />
    </nav>
  );
};

export default MainNavigation;
