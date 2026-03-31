import { useContext } from "react";
import { useLocation, Link } from "react-router-dom";
import { Navbar, Nav, Dropdown } from "react-bootstrap";
import { SettingsContext } from "./SettingContext";
import { useQuery } from "@tanstack/react-query";

import {
  FaCog,
  FaSignOutAlt,
  FaHome,
  FaBullhorn,
  FaUserShield,
  FaBolt,
  FaClipboardList,
  FaBuilding,
} from "react-icons/fa";

import "./Header2.css";

export default function Header2({ role, onLogout }) {
  useContext(SettingsContext);
  const location = useLocation();

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path);

  const userRole = role || localStorage.getItem("role");
  const isAdmin = userRole === "admin";
  const isEmployer = userRole === "employer";

  const userId = localStorage.getItem("userID");

  // 🔥 ใช้ react-query ดึง profile จริง
  const { data: profileData } = useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      const res = await fetch(
        `http://localhost:3000/api/profiles?userId=${userId}`,
      );
      const data = await res.json();
      return Array.isArray(data) ? data[0] : data;
    },
    enabled: !!userId,
  });

  // fallback เผื่อไม่มีข้อมูล
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

  const displayName = isAdmin
    ? "Admin"
    : profileData?.name || storedUser?.name || "User";

  const profileImage = profileData?.profileImage || storedUser?.profileImage;

  return (
    <Navbar expand="lg" sticky="top" className="navbar-custom">
      <div className="navbar-inner">
        {/* LEFT */}
        <Navbar.Brand href="/feed">
          <FaBolt style={{ color: "var(--color-accent)" }} />
          Smart Persona
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="main-nav" />

        <Navbar.Collapse id="main-nav">
          {/* CENTER */}
          <div className="nav-center">
            <Nav className="align-items-lg-center">
              {isEmployer ? (
                <>
                  <Nav.Link
                    href="/feed"
                    className={isActive("/feed") ? "active" : ""}
                  >
                    Feed
                  </Nav.Link>
                  <Nav.Link
                    href="/jobs/manage"
                    className={isActive("/jobs/manage") ? "active" : ""}
                  >
                    Manage Jobs
                  </Nav.Link>
                </>
              ) : (
                <>
                  <Nav.Link
                    href="/feed"
                    className={isActive("/feed") ? "active" : ""}
                  >
                    Feed
                  </Nav.Link>
                  <Nav.Link
                    href="/profile"
                    className={isActive("/profile") ? "active" : ""}
                  >
                    Profile
                  </Nav.Link>
                  <Nav.Link
                    href="/jobs"
                    className={isActive("/jobs") ? "active" : ""}
                  >
                    Jobs
                  </Nav.Link>
                  <Nav.Link
                    href="/resume"
                    className={isActive("/resume") ? "active" : ""}
                  >
                    Resume
                  </Nav.Link>
                </>
              )}
            </Nav>
          </div>

          {/* RIGHT USER */}
          <div className="ms-auto">
            <Dropdown align="end">
              <Dropdown.Toggle variant="light">
                <span className="user-avatar">
                  {profileImage ? (
                    <img
                      src={
                        profileImage?.startsWith("http")
                          ? profileImage
                          : `http://localhost:3000${profileImage}`
                      }
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
                    <Dropdown.Item as={Link} to="/chart">
                      <FaHome /> Dashboard
                    </Dropdown.Item>
                    <Dropdown.Item as={Link} to="/ads">
                      <FaBullhorn /> Ads Management
                    </Dropdown.Item>
                    <Dropdown.Item href="/admin">
                      <FaUserShield /> User Management
                    </Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={onLogout}>
                      <FaSignOutAlt /> Logout
                    </Dropdown.Item>
                  </>
                ) : isEmployer ? (
                  <>
                    <Dropdown.Item as={Link} to="/company-profile">
                      <FaBuilding /> Company Profile
                    </Dropdown.Item>
                    <Dropdown.Item as={Link} to="/settings">
                      <FaCog /> Settings
                    </Dropdown.Item>
                    <Dropdown.Item onClick={onLogout}>
                      <FaSignOutAlt /> Logout
                    </Dropdown.Item>
                  </>
                ) : (
                  <>
                    <Dropdown.Item as={Link} to="/applications">
                      <FaClipboardList /> Applications
                    </Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item as={Link} to="/settings">
                      <FaCog /> Settings
                    </Dropdown.Item>
                    <Dropdown.Item onClick={onLogout}>
                      <FaSignOutAlt /> Logout
                    </Dropdown.Item>
                  </>
                )}
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </Navbar.Collapse>
      </div>
    </Navbar>
  );
}
