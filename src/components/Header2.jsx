<<<<<<< HEAD
import { useLocation, Link } from "react-router-dom"; // ✅ เพิ่ม Link
import { Navbar, Nav, Container, Dropdown } from "react-bootstrap";
=======
import { useContext } from "react";
import { useLocation } from "react-router-dom";
import { Navbar, Nav, Dropdown } from "react-bootstrap";
>>>>>>> a3d8571949635498a7b3840b5000229ab28935b0
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
<<<<<<< HEAD
=======
  const { profileData, isLoading } = useContext(ProfileContext);
>>>>>>> a3d8571949635498a7b3840b5000229ab28935b0
  const location = useLocation();

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path);

  const userRole = role || localStorage.getItem("role");
  const isAdmin = userRole === "admin";
  const isEmployer = userRole === "employer";

<<<<<<< HEAD
  const storedUser = JSON.parse(localStorage.getItem("user") || '{}');
  const profileImage = storedUser?.profileImage || null;
  const displayName = isAdmin
    ? "Admin"
    : storedUser?.name?.trim() || "User";

  return (
    <Navbar expand="lg" sticky="top" className="navbar-custom">
      <Container>
        {/* ✅ ใช้ Link แทน href */}
        <Navbar.Brand as={Link} to="/feed">
          <FaBolt style={{ color: "var(--color-accent)", fontSize: "1rem" }} />
=======
  // 🔥 ดึง user จาก localStorage (สำคัญมาก)
  const storedUser = JSON.parse(localStorage.getItem("user"));

  // 🔥 FIX ตรงนี้
  const displayName = isAdmin
    ? "Admin"
    : isLoading
      ? storedUser?.name || "..."
      : profileData?.name?.trim() || storedUser?.name || "User";

  return (
    <Navbar expand="lg" sticky="top" className="navbar-custom">
      <div className="navbar-inner">
        {/* LEFT */}
        <Navbar.Brand href="/feed">
          <FaBolt style={{ color: "var(--color-accent)" }} />
>>>>>>> a3d8571949635498a7b3840b5000229ab28935b0
          Smart Persona
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="main-nav" />

        <Navbar.Collapse id="main-nav">
<<<<<<< HEAD
          <Nav className="ms-auto align-items-lg-center">
            {isEmployer ? (
              <>
                <Nav.Link as={Link} to="/feed" className={isActive("/feed") ? "active" : ""}>
                  Feed
                </Nav.Link>
                <Nav.Link as={Link} to="/browse-jobs" className={isActive("/browse-jobs") ? "active" : ""}>
                  Browse Jobs
                </Nav.Link>
                <Nav.Link as={Link} to="/jobs/manage" className={isActive("/jobs/manage") ? "active" : ""}>
                  Manage Jobs
                </Nav.Link>
              </>
            ) : !isAdmin ? (
              <>
                <Nav.Link as={Link} to="/feed" className={isActive("/feed") ? "active" : ""}>
                  Feed
                </Nav.Link>
                <Nav.Link as={Link} to="/profile" className={isActive("/profile") ? "active" : ""}>
                  Profile
                </Nav.Link>
                <Nav.Link as={Link} to="/jobs" className={isActive("/jobs") ? "active" : ""}>
                  Jobs
                </Nav.Link>
                <Nav.Link as={Link} to="/resume" className={isActive("/resume") ? "active" : ""}>
                  Resume
                </Nav.Link>
              </>
            ) : null}
=======
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
>>>>>>> a3d8571949635498a7b3840b5000229ab28935b0

          {/* RIGHT USER */}
          <div className="ms-auto">
            <Dropdown align="end">
              <Dropdown.Toggle variant="light">
                <span className="user-avatar">
<<<<<<< HEAD
                  {profileImage && (profileImage.startsWith('data:') || profileImage.startsWith('http')) ? (
                    <img src={profileImage} alt={displayName} className="avatar-img" />
=======
                  {profileData?.profileImage ? (
                    <img
                      src={`http://localhost:3000${profileData.profileImage}`}
                      alt={displayName}
                      className="avatar-img"
                    />
>>>>>>> a3d8571949635498a7b3840b5000229ab28935b0
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
<<<<<<< HEAD
                    <Dropdown.Item as={Link} to="/admin">
                      <FaUserShield /> Admin Management
=======
                    <Dropdown.Item href="/admin">
                      <FaUserShield /> User Management
>>>>>>> a3d8571949635498a7b3840b5000229ab28935b0
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