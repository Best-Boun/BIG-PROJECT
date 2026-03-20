import { useContext } from "react";
import { useLocation } from "react-router-dom";
import { Navbar, Nav, Container, Dropdown } from "react-bootstrap";
import {
  FaCog,
  FaSignOutAlt,
  FaHome,
  FaBullhorn,
  FaUserShield,
  FaBolt,
  FaClipboardList,
} from "react-icons/fa";
import { ProfileContext } from "../ProfileContext";
import "./Header2.css";

export default function Header2({ role, onLogout }) {
  const { profileData, isLoading } = useContext(ProfileContext);

  const location = useLocation();

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path);

  const userRole = role || localStorage.getItem("role");
  const isAdmin = userRole === "admin";
  const isEmployer = userRole === "employer";

  const displayName = isAdmin
    ? "Admin"
    : isLoading
    ? "..."
    : profileData?.name?.trim() || "User";

  return (
    <Navbar expand="lg" sticky="top" className="navbar-custom">
      <Container>
        <Navbar.Brand href="/feed">
          <FaBolt style={{ color: "var(--color-accent)", fontSize: "1rem" }} />
          Smart Persona
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="main-nav" />

        <Navbar.Collapse id="main-nav">
          <Nav className="ms-auto align-items-lg-center">
            {isEmployer ? (
              <>
                <Nav.Link href="/feed" className={isActive("/feed") ? "active" : ""}>
                  Feed
                </Nav.Link>
                <Nav.Link href="/jobs/manage" className={isActive("/jobs/manage") ? "active" : ""}>
                  Manage Jobs
                </Nav.Link>
              </>
            ) : !isAdmin ? (
              <>
                <Nav.Link href="/feed" className={isActive("/feed") ? "active" : ""}>
                  Feed
                </Nav.Link>
                <Nav.Link href="/profile" className={isActive("/profile") ? "active" : ""}>
                  Profile
                </Nav.Link>
                <Nav.Link href="/jobs" className={isActive("/jobs") ? "active" : ""}>
                  Jobs
                </Nav.Link>
                <Nav.Link href="/resume" className={isActive("/resume") ? "active" : ""}>
                  Resume
                </Nav.Link>
              </>
            ) : null}

            <Dropdown align="end" className="ms-lg-3">
              <Dropdown.Toggle variant="light">
                <span className="user-avatar">
                  {profileData?.profileImage ? (
                    <img
                      src={profileData.profileImage}
                      alt={displayName}
                      className="avatar-img"
                    />
                  ) : (
                    displayName.charAt(0).toUpperCase()
                  )}
                </span>
                {displayName}
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
                ) : isEmployer ? (
                  <>
                    <Dropdown.Item href="/settings">
                      <FaCog /> Settings
                    </Dropdown.Item>
                    <Dropdown.Item onClick={onLogout}>
                      <FaSignOutAlt /> Logout
                    </Dropdown.Item>
                  </>
                ) : (
                  <>
                    <Dropdown.Item href="/applications">
                      <FaClipboardList /> Applications
                    </Dropdown.Item>
                    <Dropdown.Divider />
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
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
