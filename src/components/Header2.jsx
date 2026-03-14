import React, { useContext } from "react";
import { useLocation } from "react-router-dom";
import { Navbar, Nav, Container, Dropdown } from "react-bootstrap";
import {
  FaCog,
  FaSignOutAlt,
  FaHome,
  FaBullhorn,
  FaUserShield,
} from "react-icons/fa";
import { ProfileContext } from "../ProfileContext";
import "./Header2.css";

export default function Header2({ user, role, onLogout }) {
  const { profileData } = useContext(ProfileContext);

  // ดึง user จาก localStorage
  const storedUser = JSON.parse(localStorage.getItem("currentUser"));

  const currentUser =
    profileData && profileData.name?.trim() !== ""
      ? profileData
      : storedUser || user;

  const location = useLocation();

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path);

  const isAdmin = role === "admin";

  return (
    <Navbar bg="light" expand="lg" sticky="top" className="navbar-custom">
      <Container>
        <Navbar.Brand href="/feed">💼 Smart Persona</Navbar.Brand>

        <Nav className="ms-auto">
          <Nav.Link href="/feed" className={isActive("/feed") ? "active" : ""}>
            Feed
          </Nav.Link>

          <Nav.Link
            href="/profile"
            className={isActive("/profile") ? "active" : ""}
          >
            Profile
          </Nav.Link>

          <Nav.Link href="/jobs" className={isActive("/jobs") ? "active" : ""}>
            Job
          </Nav.Link>

          <Nav.Link
            href="/resume"
            className={isActive("/resume") ? "active" : ""}
          >
            Resume
          </Nav.Link>

          <Dropdown align="end">
            <Dropdown.Toggle variant="light">
              {isAdmin
                ? "Admin"
                : currentUser?.username || currentUser?.name || "User"}
            </Dropdown.Toggle>

            <Dropdown.Menu>
              {isAdmin ? (
                <>
                  <Dropdown.Item href="/chart">
                    <FaHome /> Dashboard
                  </Dropdown.Item>

                  <Dropdown.Item href="/ads">
                    <FaBullhorn /> Ads Management
                  </Dropdown.Item>

                  <Dropdown.Item href="/admin">
                    <FaUserShield /> Admin Management
                  </Dropdown.Item>

                  <Dropdown.Divider />

                  <Dropdown.Item onClick={onLogout}>
                    <FaSignOutAlt /> Logout
                  </Dropdown.Item>
                </>
              ) : (
                <>
                  <Dropdown.Item href="/settings">
                    <FaCog /> Settings
                  </Dropdown.Item>

                  <Dropdown.Item onClick={onLogout}>
                    <FaSignOutAlt /> Logout
                  </Dropdown.Item>
                </>
              )}
            </Dropdown.Menu>
          </Dropdown>
        </Nav>
      </Container>
    </Navbar>
  );
}
