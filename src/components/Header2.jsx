import { useContext } from "react";
import NotificationBell from './NotificationBell';
import { useLocation, Link } from "react-router-dom";
import { Navbar, Nav, Dropdown } from "react-bootstrap";
import { SettingsContext } from "./SettingContext";
import { useQuery } from "@tanstack/react-query";
import { FaCheckCircle } from "react-icons/fa";

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

const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
const userId = currentUser?.id;

  // 🔥 ใช้ react-query ดึง profile จริง
  const { data: profileData } = useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      const res = await fetch(
        `http://localhost:3000/api/profiles?userId=${userId}`,
      );
      const data = await res.json();
      if (Array.isArray(data)) {
        return data[0] || null;
      }
      return data;
    },
    enabled: !!userId,
  });

  // console.log("HEADER profileData:", profileData);

  // fallback เผื่อไม่มีข้อมูล


 

const displayName =
  (profileData && profileData.name) || currentUser?.name || "User";

const profileImage =
  (profileData && profileData.profileImage) ||
  currentUser?.profileImage ||
  null;

   const getProfileImage = (image) => {
     if (!image) {
       return `https://ui-avatars.com/api/?name=${displayName}&background=6a11cb&color=fff`;
     }

     if (image.startsWith("http")) return image;

     if (image.startsWith("/upload")) {
       return `http://localhost:3000${image}`;
     }

     return `http://localhost:3000/upload/${image}`;
   };
   
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
                    href="/browse-jobs"
                    className={isActive("/browse-jobs") ? "active" : ""}
                  >
                    Browse Jobs
                  </Nav.Link>
                  <Nav.Link
                    href="/jobs/manage"
                    className={isActive("/jobs/manage") ? "active" : ""}
                  >
                    Manage Jobs
                  </Nav.Link>
                  <Nav.Link
                    href="/seekers"
                    className={isActive("/seekers") ? "active" : ""}
                  >
                    Find Seekers
                  </Nav.Link>
                  <Nav.Link
                    href="/chat"
                    className={isActive("/chat") ? "active" : ""}
                  >
                    Messages
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
                  <Nav.Link
                    href="/chat"
                    className={isActive("/chat") ? "active" : ""}
                  >
                    Messages
                  </Nav.Link>
                </>
              )}
            </Nav>
          </div>

          {/* RIGHT USER */}
          <div className="ms-auto d-flex align-items-center gap-2">
            <NotificationBell />
            <Dropdown align="end">
              <Dropdown.Toggle
                variant="light"
                className="d-flex align-items-center gap-2"
              >
                <img
                  key={profileImage} // 👈 เพิ่มอันนี้
                  src={getProfileImage(profileImage)}
                  onError={(e) => {
                    e.target.src =
                      "https://ui-avatars.com/api/?name=" +
                      displayName +
                      "&background=6a11cb&color=fff";
                  }}
                  alt={displayName}
                  className="avatar-img"
                  style={{ width: 32, height: 32, borderRadius: "50%" }}
                />
                <span style={{ display: "flex", alignItems: "center" }}>
                  {displayName}

                  {displayName === "Admin" && (
                    <FaCheckCircle
                      style={{
                        color: "#1DA1F2",
                        marginLeft: 6,
                        fontSize: 14,
                      }}
                      title="Verified Admin"
                    />
                  )}
                </span>
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
