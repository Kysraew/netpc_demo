import React, { useEffect, useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";

const NavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(
    !!localStorage.getItem("authToken")
  );

  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem("authToken");
      setIsLoggedIn(!!token);
    };
    checkAuthStatus();
    window.addEventListener("storage", checkAuthStatus);
    return () => {
      window.removeEventListener("storage", checkAuthStatus);
    };
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    setIsLoggedIn(false);
    navigate("/auth");
  };

  return (
    <nav>
      <ul>
        {/* Link do kontaktów zawsze widoczny */}
        <li>
          <NavLink to="/contacts">Contacts</NavLink>
        </li>
        {isLoggedIn ? (
          <>
            {/* Możesz tu dodać link do "Add New Contact", jeśli chcesz go w NavBar */}
            {/* <li><NavLink to="/contact/create">Add Contact</NavLink></li> */}
            <li>
              <button
                onClick={handleLogout}
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  color: "blue",
                  textDecoration: "underline",
                  cursor: "pointer",
                }}
              >
                Logout
              </button>
            </li>
          </>
        ) : (
          <li>
            <NavLink to="/auth">Login</NavLink>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default NavBar;
