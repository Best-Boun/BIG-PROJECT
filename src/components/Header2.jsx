// src/components/Header2.jsx
import React, { useState, useContext } from "react";
import { useLocation } from "react-router-dom";
import { Navbar, Nav, Container, Dropdown } from "react-bootstrap";
import { FaCog, FaSignOutAlt, FaHome } from "react-icons/fa";
import { ProfileContext } from "../ProfileContext";
import "./Header2.css";

export default function Header2({ user, onLogout }) {
  const { profileData } = useContext(ProfileContext);

  // 🔥 ถ้ามีโปรไฟล์ให้ใช้ profileData แทน user props
  const currentUser =
    profileData && profileData.name && profileData.name.trim() !== ""
      ? profileData
      : user;

  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path);

  return (
    <Navbar bg="light" expand="lg" sticky="top" className="navbar-custom">
      <Container>
        <Navbar.Brand href="/feed" className="brand-logo">
          <span className="logo-icon">💼</span>
          <span className="logo-text">Smart Persona</span>
        </Navbar.Brand>

        <Navbar.Collapse id="basic-navbar-nav" in={isMenuOpen}>
          <Nav className="ms-auto nav-main-sections">
            <Nav.Link
              href="/feed"
              className={`nav-link nav-section ${
                isActive("/feed") ? "active" : ""
              }`}
            >
              Feed
            </Nav.Link>

            <Nav.Link
              href="/profile"
              className={`nav-link nav-section ${
                isActive("/profile") ? "active" : ""
              }`}
            >
              Profile
            </Nav.Link>

            <Nav.Link
              href="/jobs"
              className={`nav-link nav-section ${
                isActive("/jobs") ? "active" : ""
              }`}
            >
              Job
            </Nav.Link>

            <Nav.Link
              href="/resume"
              className={`nav-link nav-section ${
                isActive("/resume") ? "active" : ""
              }`}
            >
              Resume
            </Nav.Link>

            {/* USER DROPDOWN */}
            {currentUser && (
              <Dropdown className="user-dropdown">
                <Dropdown.Toggle
                  variant="none"
                  id="user-dropdown"
                  className="user-menu-trigger"
                >
                  <span className="user-avatar">
                    <img
                      src={
                        currentUser.profileImage &&
                        (currentUser.profileImage.startsWith("data:") ||
                          currentUser.profileImage.startsWith("http"))
                          ? currentUser.profileImage
                          : "/default-avatar.png"
                      }
                      alt="avatar"
                      className="avatar-img"
                    />
                  </span>

                  <span className="user-name">{currentUser.name}</span>
                </Dropdown.Toggle>

                <Dropdown.Menu align="end">
                  <Dropdown.Item href="/dashboard">
                    <FaHome /> Dashboard
                  </Dropdown.Item>
                  <Dropdown.Item href="/applications">
                    📋 Applications
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item href="/settings">
                    <FaCog /> Settings
                  </Dropdown.Item>
                  <Dropdown.Item onClick={onLogout}>
                    <FaSignOutAlt /> Logout
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
