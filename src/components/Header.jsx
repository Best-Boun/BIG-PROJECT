import React from "react";
import "./Header.css";
import Apple from "../assets/appleex.png";

function Header() {
  return (
    <header className="header">
      <input type="text" placeholder="Search..." className="search-bar" />
      <div className="user">
        <span className="bell">🔔</span>
        <div className="user-info">
          <img
            src={Apple}
            alt="avatar"
            className="avatar"
          />
          <span>John</span>
        </div>
      </div>
    </header>
  );
}

export default Header;
