import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Navbar, Nav, Container, Dropdown } from 'react-bootstrap';
import { FaCog, FaSignOutAlt, FaHome } from 'react-icons/fa';
import './Header2.css';

export default function Header2 ({ user, onLogout }) {
    // ✅ อ่าน path ปัจจุบันจาก React Router
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
    };

    // ✅ เช็คว่า path ปัจจุบันตรงกับลิงก์ไหน
    const isActive = (path) =>
        location.pathname === path || location.pathname.startsWith(path);

    return (
        <Navbar bg="light" expand="lg" sticky="top" className="navbar-custom">
            <Container>
                {/* Logo */}
                <Navbar.Brand href="/feed" className="brand-logo">
                    <span className="logo-icon">💼</span>
                    <span className="logo-text">Smart Persona</span>
                </Navbar.Brand>

                {/* Hamburger Menu - Hidden */}

                {/* Navigation Links */}
                <Navbar.Collapse id="basic-navbar-nav" in={isMenuOpen}>
                    <Nav className="ms-auto nav-main-sections">


                        {/* 📰 FEED SECTION */}
                        <Nav.Link
                            href="/feed"
                            className={`nav-link nav-section ${isActive('/feed') ? 'active' : ''}`}
                            onClick={closeMenu}
                        >
                            <span className="nav-label">Feed</span>
                        </Nav.Link>

                        {/* 👤 PROFILE SECTION */}
                        <Nav.Link
                            href="/profile"
                            className={`nav-link nav-section ${isActive('/profile') ? 'active' : ''}`}
                            onClick={closeMenu}
                        >
                            <span className="nav-label">Profile</span>
                        </Nav.Link>

                        {/* 💼 JOB SECTION */}
                        <Nav.Link
                            href="/jobs"
                            className={`nav-link nav-section ${isActive('/jobs') ? 'active' : ''}`}
                            onClick={closeMenu}
                        >
                            <span className="nav-label">Job</span>
                        </Nav.Link>

                        {/* 📄 RESUME SECTION */}
                        <Nav.Link
                            href="/resume"
                            className={`nav-link nav-section ${isActive('/resume') ? 'active' : ''}`}
                            onClick={closeMenu}
                        >
                            <span className="nav-label">Resume</span>
                        </Nav.Link>

                        {/* User Dropdown Menu */}
                        {user && (
                            <Dropdown className="user-dropdown">
                                <Dropdown.Toggle
                                    variant="none"
                                    id="user-dropdown"
                                    className="user-menu-trigger"
                                >
                                    <span className="user-avatar">
    <img 
        src={user.profileImage && (user.profileImage.startsWith('data:') || user.profileImage.startsWith('http'))
            ? user.profileImage
            : '/avatar.png'
        }
        alt="avatar"
        className="avatar-img"
    />
</span>
                                    <span className="user-name">{ user.name }</span>
                                </Dropdown.Toggle>

                                <Dropdown.Menu align="end">
                                    <Dropdown.Item href="/dashboard" onClick={closeMenu}>
                                        <FaHome /> Dashboard
                                    </Dropdown.Item>
                                    <Dropdown.Item href="/applications" onClick={closeMenu}>
                                        📋 Applications
                                    </Dropdown.Item>
                                    <Dropdown.Divider />
                                    <Dropdown.Item href="/settings" onClick={closeMenu}>
                                        <FaCog /> Settings
                                    </Dropdown.Item>
                                    <Dropdown.Item onClick={() => {
                                        closeMenu();
                                        onLogout();
                                    }}>
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



