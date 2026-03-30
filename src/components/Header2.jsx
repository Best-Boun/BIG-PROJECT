import { useLocation, Link } from "react-router-dom"; // ✅ เพิ่ม Link
import { Navbar, Nav, Container, Dropdown } from "react-bootstrap";
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
  const location = useLocation();

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path);

  const userRole = role || localStorage.getItem("role");
  const isAdmin = userRole === "admin";
  const isEmployer = userRole === "employer";

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
          Smart Persona
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="main-nav" />

        <Navbar.Collapse id="main-nav">
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

            <Dropdown align="end" className="ms-lg-3">
              <Dropdown.Toggle variant="light">
                <span className="user-avatar">
                  {profileImage && (profileImage.startsWith('data:') || profileImage.startsWith('http')) ? (
                    <img src={profileImage} alt={displayName} className="avatar-img" />
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
                    <Dropdown.Item as={Link} to="/admin">
                      <FaUserShield /> Admin Management
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
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}