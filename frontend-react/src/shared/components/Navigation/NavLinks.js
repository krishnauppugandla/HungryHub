import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./NavLinks.css";

const NavLinks = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <ul className="nav-links">
      {user ? (
        <>
          <li><span className="nav-greeting">Hi, {user.username}</span></li>
          <li><Link to="/restaurants">Restaurants</Link></li>
          <li><Link to="/cart">Cart</Link></li>
          <li><Link to="/orders">Orders</Link></li>
          <li>
            <button className="nav-logout" onClick={handleLogout}>
              Logout
            </button>
          </li>
        </>
      ) : (
        <>
          <li><Link to="/login">Login</Link></li>
          <li><Link to="/register">Register</Link></li>
        </>
      )}
    </ul>
  );
};

export default NavLinks;
